import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function fetchSiteText(domain) {
  try {
    const res = await fetch(`https://${domain}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });
    if (!res.ok) return '';
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);
  } catch { return ''; }
}

const evalSchema = {
  type: 'object',
  properties: {
    per_prompt: {
      type: 'array',
      items: { type: 'object', properties: { index: { type: 'number' }, cited: { type: 'boolean' } } },
    },
    referral_pct: { type: 'number' },
    authority_pct: { type: 'number' },
    synthesis: { type: 'string' },
    positioning: { type: 'string' },
    trend_90d: { type: 'string' },
    news: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          date: { type: 'string' },
          source_url: { type: 'string' },
          tag: { type: 'string' },
        },
      },
    },
  },
};

async function analyzeDomain(svc, { name, domain, prompts, industry }) {
  const siteText = await fetchSiteText(domain);
  const promptList = prompts.map((p, i) => `${i}. [${p.type}] ${p.text}`).join('\n');

  const result = await svc.integrations.Core.InvokeLLM({
    prompt: `You are a GEO (Generative Engine Optimization) analyst. Analyze the real AI visibility of "${name}" (${domain})${industry ? `, industry: ${industry}` : ''}.

## ACTIVE PROMPTS TO EVALUATE
For EACH prompt below, determine whether AI engines (ChatGPT, Gemini, Perplexity) would actually cite/recommend ${name} in response. Be brutally realistic — a little-known brand is almost never cited.
${promptList}

## TO RETURN
- per_prompt: for each prompt (0-based index), cited true/false.
- referral_pct: % share of voice on "referral" type prompts (0-100, realistic).
- authority_pct: % presence on "authority" type prompts (0-100, realistic).
- synthesis: 1-2 sentences in English explaining why ${name} appears (or not) in AI answers, with the numbers.
- positioning: how ${name} presents itself — differentiators observed on the site, inferred editorial targets (English). ${siteText ? `Here is the real text of their homepage:\n"${siteText.slice(0, 2000)}"` : 'The site could not be analyzed — return an empty string for positioning.'}
- trend_90d: "up" | "down" | "flat" — AI visibility trend over 90 days.
- news: 0-3 REAL and recent news items about ${name} (product launches, announcements) with title, summary, date (MM/DD/YYYY), real source_url, tag ("News"|"Product"|"Announcement"). Empty array if nothing verifiable.

Valid JSON only.`,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: evalSchema,
  });

  const citedMap = {};
  (result?.per_prompt || []).forEach((pp) => { citedMap[pp.index] = !!pp.cited; });
  const promptsOut = prompts.map((p, i) => ({ text: p.text, type: p.type, tags: p.tags || [], cited: !!citedMap[i] }));
  const refPrompts = promptsOut.filter(p => p.type === 'referral');
  const authPrompts = promptsOut.filter(p => p.type === 'authority');

  return {
    referral_pct: Math.max(0, Math.min(100, Math.round(result?.referral_pct || 0))),
    authority_pct: Math.max(0, Math.min(100, Math.round(result?.authority_pct || 0))),
    referral_cited: refPrompts.filter(p => p.cited).length,
    referral_total: refPrompts.length,
    authority_cited: authPrompts.filter(p => p.cited).length,
    authority_total: authPrompts.length,
    trend_90d: ['up', 'down', 'flat'].includes(result?.trend_90d) ? result.trend_90d : 'flat',
    synthesis: result?.synthesis || '',
    positioning: siteText ? (result?.positioning || '') : '',
    positioning_available: !!siteText && !!result?.positioning,
    prompts_json: JSON.stringify(promptsOut),
    news_json: JSON.stringify((result?.news || []).slice(0, 3)),
    analyzed_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const svc = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action !== 'add') return Response.json({ error: 'Unknown action' }, { status: 400 });

    const siteUrl = body.site_url || '';
    const name = (body.name || '').trim();
    const domain = (body.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain || !siteUrl) return Response.json({ error: 'domain and site_url required' }, { status: 400 });

    // Brand context
    let brandName = '', industry = '';
    try {
      const profiles = await svc.entities.BusinessProfile.filter({ created_by_id: user.id });
      const p = profiles.find(x => x.site_url === siteUrl) || profiles[0];
      brandName = p?.identity_name || '';
      industry = p?.identity_industry || '';
    } catch {}
    const youDomain = siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!brandName) brandName = youDomain;

    const existing = await svc.entities.Competitor.filter({ user_id: user.id, site_url: siteUrl });
    if (existing.some(c => !c.is_you && c.domain === domain)) {
      return Response.json({ error: 'This competitor is already tracked.' }, { status: 409 });
    }
    let you = existing.find(c => c.is_you);
    let prompts;

    if (!you) {
      // First competitor → generate the shared prompt set + evaluate the user's own brand
      const gen = await svc.integrations.Core.InvokeLLM({
        prompt: `You are a GEO analyst. Brand: "${brandName}" (${youDomain})${industry ? `, industry: ${industry}` : ''}.

1. Generate 10 REALISTIC user prompts in English, as real prospects would ask ChatGPT/Gemini:
   - 6 of type "referral" (recommendation requests for tools/services in the brand's category)
   - 4 of type "authority" (educational questions where an expert brand would be cited as a source)
   Each prompt has short tags (e.g. ["L1","P1"]).
2. For EACH prompt, honestly assess whether the AIs would actually cite "${brandName}" (cited true/false). A little-known brand = almost never cited.
3. Give realistic referral_pct and authority_pct (0-100) for "${brandName}".

Valid JSON only.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            prompts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  type: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  you_cited: { type: 'boolean' },
                },
              },
            },
            referral_pct: { type: 'number' },
            authority_pct: { type: 'number' },
          },
        },
      });

      prompts = (gen?.prompts || []).filter(p => p.text).slice(0, 14).map(p => ({
        text: p.text,
        type: p.type === 'authority' ? 'authority' : 'referral',
        tags: p.tags || [],
      }));
      if (prompts.length === 0) return Response.json({ error: 'Unable to generate prompts' }, { status: 500 });

      const youPrompts = prompts.map((p, i) => ({ ...p, cited: !!(gen?.prompts?.[i]?.you_cited) }));
      const refP = youPrompts.filter(p => p.type === 'referral');
      const authP = youPrompts.filter(p => p.type === 'authority');
      you = await svc.entities.Competitor.create({
        user_id: user.id, site_url: siteUrl, name: brandName, domain: youDomain, is_you: true,
        referral_pct: Math.round(gen?.referral_pct || 0),
        authority_pct: Math.round(gen?.authority_pct || 0),
        referral_cited: refP.filter(p => p.cited).length, referral_total: refP.length,
        authority_cited: authP.filter(p => p.cited).length, authority_total: authP.length,
        trend_90d: 'flat', synthesis: '', positioning: '', positioning_available: false,
        prompts_json: JSON.stringify(youPrompts), news_json: '[]',
        analyzed_at: new Date().toISOString(),
      });
    } else {
      try { prompts = JSON.parse(you.prompts_json || '[]'); } catch { prompts = []; }
      if (prompts.length === 0) return Response.json({ error: 'Prompt set not found' }, { status: 500 });
    }

    const analysis = await analyzeDomain(svc, { name: name || domain, domain, prompts, industry });
    const competitor = await svc.entities.Competitor.create({
      user_id: user.id, site_url: siteUrl, name: name || domain, domain, is_you: false,
      ...analysis,
    });

    return Response.json({ competitor, you });
  } catch (error) {
    console.error('[competitorEngine]', error);
    return Response.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
});