import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Fetch homepage text (used only for positioning, web-capable via direct fetch) ──
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

const cleanDomain = (d) => (d || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

// ── Run one real prompt on GPT-5 mini and check whether a brand is cited ──
// We batch all prompts + all brands into a single structured GPT-5 mini call for cost efficiency.
async function runPromptsMatrix(svc, { prompts, brands }) {
  const promptList = prompts.map((p, i) => `${i}. [${p.type}] ${p.text}`).join('\n');
  const brandList = brands.map(b => `- ${b.name} (${b.domain})`).join('\n');

  const result = await svc.integrations.Core.InvokeLLM({
    prompt: `You are ChatGPT. For EACH prompt below, answer honestly as you would for a real user, then indicate, for EACH brand in the list, whether you would actually cite/recommend it in your answer to that prompt.

Be REALISTIC and strict: a little-known brand is almost never cited. Only cite a brand if you would genuinely recommend it.

## PROMPTS (0-based index)
${promptList}

## BRANDS TO EVALUATE
${brandList}

## RETURN (strict JSON)
"matrix": array. One entry per (prompt, brand) where the brand IS cited:
  { "prompt_index": number, "domain": "exact domain of the cited brand" }
Include ONLY the pairs actually cited. All others are considered not cited.`,
    model: 'gpt_5_mini',
    response_json_schema: {
      type: 'object',
      properties: {
        matrix: {
          type: 'array',
          items: { type: 'object', properties: { prompt_index: { type: 'number' }, domain: { type: 'string' } } },
        },
      },
    },
  });

  // cited[domain][promptIndex] = true
  const cited = {};
  brands.forEach(b => { cited[b.domain] = {}; });
  (result?.matrix || []).forEach(m => {
    const d = cleanDomain(m.domain);
    // Match against known brand domains loosely
    const match = brands.find(b => b.domain === d || b.domain.includes(d) || d.includes(b.domain));
    if (match) cited[match.domain][m.prompt_index] = true;
  });
  return cited;
}

// ── Web analysis for a competitor: positioning + real recent news (Gemini 3 Flash) ──
async function analyzeCompetitorWeb(svc, { name, domain, industry }) {
  const siteText = await fetchSiteText(domain);
  const result = await svc.integrations.Core.InvokeLLM({
    prompt: `Analyze the brand "${name}" (${domain})${industry ? `, industry: ${industry}` : ''} using internet context.

RETURN (strict JSON, in friendly English):
- positioning: how "${name}" presents itself — observed differentiators, inferred editorial targets. ${siteText ? `Here is the real text of their homepage:\n"${siteText.slice(0, 2000)}"` : 'The site could not be analyzed — return an empty string for positioning.'}
- news: 0 to 3 REAL and recent news items about "${name}" (product launches, announcements) with title, summary, date (MM/DD/YYYY), real source_url, tag ("News"|"Product"|"Announcement"). Empty array if nothing verifiable.`,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        positioning: { type: 'string' },
        news: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' }, summary: { type: 'string' }, date: { type: 'string' },
              source_url: { type: 'string' }, tag: { type: 'string' },
            },
          },
        },
      },
    },
  });
  return {
    positioning: siteText ? (result?.positioning || '') : '',
    positioning_available: !!siteText && !!result?.positioning,
    news: (result?.news || []).slice(0, 3),
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const svc = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const siteUrl = body.site_url || '';
    if (!siteUrl) return Response.json({ error: 'site_url required' }, { status: 400 });

    // Brand context
    let brandName = '', industry = '', profileRec = null;
    try {
      const profiles = await svc.entities.BusinessProfile.filter({ created_by_id: user.id });
      profileRec = profiles.find(x => x.site_url === siteUrl) || profiles[0];
      brandName = profileRec?.identity_name || '';
      industry = profileRec?.identity_industry || '';
    } catch {}
    const youDomain = cleanDomain(siteUrl);
    if (!brandName) brandName = youDomain;

    // ─────────────────────────────────────────────
    // ADD — instant, NO AI, NO loading
    // ─────────────────────────────────────────────
    if (action === 'add') {
      const name = (body.name || '').trim();
      const domain = cleanDomain(body.domain);
      if (!domain) return Response.json({ error: 'domain required' }, { status: 400 });

      const existing = await svc.entities.Competitor.filter({ user_id: user.id, site_url: siteUrl });
      if (existing.some(c => !c.is_you && c.domain === domain)) {
        return Response.json({ error: 'This competitor is already tracked.' }, { status: 409 });
      }
      if (existing.filter(c => !c.is_you).length >= 3) {
        return Response.json({ error: 'Maximum 3 competitors tracked. Remove one to add another.' }, { status: 409 });
      }

      const competitor = await svc.entities.Competitor.create({
        user_id: user.id, site_url: siteUrl, name: name || domain, domain, is_you: false,
        referral_pct: 0, authority_pct: 0, referral_cited: 0, referral_total: 0,
        authority_cited: 0, authority_total: 0, trend_90d: 'flat',
        synthesis: '', positioning: '', positioning_available: false,
        prompts_json: '[]', news_json: '[]', analyzed_at: '',
      });
      return Response.json({ competitor });
    }

    // ─────────────────────────────────────────────
    // SCAN — full real analysis for YOU + all tracked competitors
    // ─────────────────────────────────────────────
    if (action === 'scan') {
      const existing = await svc.entities.Competitor.filter({ user_id: user.id, site_url: siteUrl });
      const competitors = existing.filter(c => !c.is_you);
      let you = existing.find(c => c.is_you);

      // 1. Generate 6 referral + 6 authority prompts (text-only writing → gpt_5_mini)
      const gen = await svc.integrations.Core.InvokeLLM({
        prompt: `You are a GEO analyst. Brand: "${brandName}" (${youDomain})${industry ? `, industry: ${industry}` : ''}.

Generate 12 REALISTIC prompts in friendly English, as real prospects would ask them to ChatGPT/Gemini:
- 6 of type "referral": requests for tool/service recommendations in the brand's category (without naming the brand).
- 6 of type "authority": educational questions where an expert brand would be cited as a source.

Each prompt has short tags, e.g.: ["L5","EN"] (L = level/length, EN = language).

Strict JSON only.`,
        model: 'gpt_5_mini',
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
                },
              },
            },
          },
        },
      });

      let refP = (gen?.prompts || []).filter(p => p.text && p.type === 'referral').slice(0, 6);
      let authP = (gen?.prompts || []).filter(p => p.text && p.type === 'authority').slice(0, 6);
      const prompts = [
        ...refP.map(p => ({ text: p.text, type: 'referral', tags: p.tags || [] })),
        ...authP.map(p => ({ text: p.text, type: 'authority', tags: p.tags || [] })),
      ];
      if (prompts.length === 0) return Response.json({ error: 'Failed to generate prompts' }, { status: 500 });

      // 2. Real per-prompt evaluation on GPT-5 mini for YOU + all competitors at once
      const brands = [
        { name: brandName, domain: youDomain },
        ...competitors.map(c => ({ name: c.name, domain: c.domain })),
      ];
      const citedMap = await runPromptsMatrix(svc, { prompts, brands });

      const buildStats = (domain) => {
        const map = citedMap[domain] || {};
        const promptsOut = prompts.map((p, i) => ({ text: p.text, type: p.type, tags: p.tags, cited: !!map[i] }));
        const ref = promptsOut.filter(p => p.type === 'referral');
        const auth = promptsOut.filter(p => p.type === 'authority');
        const refCited = ref.filter(p => p.cited).length;
        const authCited = auth.filter(p => p.cited).length;
        return {
          referral_cited: refCited, referral_total: ref.length,
          authority_cited: authCited, authority_total: auth.length,
          referral_pct: ref.length ? Math.round((refCited / ref.length) * 100) : 0,
          authority_pct: authCited, // authority displayed as raw count in the header table
          prompts_json: JSON.stringify(promptsOut),
        };
      };

      // 3. Persist YOU
      const youStats = buildStats(youDomain);
      const youData = {
        user_id: user.id, site_url: siteUrl, name: brandName, domain: youDomain, is_you: true,
        ...youStats, trend_90d: 'flat', synthesis: '', positioning: '', positioning_available: false,
        news_json: '[]', analyzed_at: new Date().toISOString(),
      };
      if (you) await svc.entities.Competitor.update(you.id, youData);
      else you = await svc.entities.Competitor.create(youData);

      // 4. Persist each competitor (+ web positioning & news via Gemini)
      for (const c of competitors) {
        const stats = buildStats(c.domain);
        const web = await analyzeCompetitorWeb(svc, { name: c.name, domain: c.domain, industry });
        await svc.entities.Competitor.update(c.id, {
          ...stats,
          synthesis: `${c.name} is recommended on ${stats.referral_cited}/${stats.referral_total} referral prompts and present on ${stats.authority_cited}/${stats.authority_total} authority queries.`,
          positioning: web.positioning,
          positioning_available: web.positioning_available,
          news_json: JSON.stringify(web.news),
          analyzed_at: new Date().toISOString(),
        });
      }

      // 5. Detect 1–2 suggested competitors seen in AI recommendations but not yet tracked (Gemini web)
      let suggestions = [];
      try {
        const trackedDomains = competitors.map(c => c.domain).concat(youDomain);
        const sugg = await svc.integrations.Core.InvokeLLM({
          prompt: `Brand: "${brandName}" (${youDomain})${industry ? `, industry: ${industry}` : ''}.

Using internet context, identify 1 to 2 REAL competitors of this brand that are frequently cited/recommended by AI (ChatGPT, Gemini) in this category, BUT are NOT part of this already-tracked list: ${trackedDomains.join(', ')}.

Strict JSON: { "suggestions": [ { "name": "...", "domain": "domain.com", "reason": "cited in X prompts" } ] }. Max 2. Empty array if nothing reliable.`,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                items: { type: 'object', properties: { name: { type: 'string' }, domain: { type: 'string' }, reason: { type: 'string' } } },
              },
            },
          },
        });
        suggestions = (sugg?.suggestions || [])
          .map(s => ({ name: s.name, domain: cleanDomain(s.domain), reason: s.reason || '' }))
          .filter(s => s.domain && !trackedDomains.includes(s.domain))
          .slice(0, 2);
      } catch {}

      // Persist suggestions on the profile JSON blob
      if (profileRec) {
        try {
          let extra = {};
          if (profileRec.brand_keywords) {
            if (profileRec.brand_keywords.startsWith('http')) {
              extra = await fetch(profileRec.brand_keywords).then(r => r.json()).catch(() => ({}));
            } else { try { extra = JSON.parse(profileRec.brand_keywords); } catch {} }
          }
          extra.competitor_suggestions = suggestions;
          await svc.entities.BusinessProfile.update(profileRec.id, { brand_keywords: JSON.stringify(extra) });
        } catch {}
      }

      return Response.json({ success: true, scanned: competitors.length + 1, suggestions });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[competitorEngine]', error);
    return Response.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
});