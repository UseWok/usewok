import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * dashboardOverview — real AI-powered "Vue d'ensemble" data for the dedicated dashboard.
 * Produces every block shown in the overview:
 *  - GEO score + narrative/authority/referral breakdown + evolution timeline
 *  - competitors (share of voice)
 *  - LLMs that cite the brand (only the engines enabled for the user's plan)
 *  - most / least cited pages
 *  - ranking by zone (continent) and by language
 *  - tasks to do
 *
 * Only the AI engines enabled for the user's plan are analyzed (plan-gated).
 */

const ALL_ENGINES = ['chatgpt', 'gemini', 'claude', 'perplexity', 'mistral', 'llama', 'copilot', 'grok'];
const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT', gemini: 'Gemini', claude: 'Claude', perplexity: 'Perplexity',
  mistral: 'Mistral', llama: 'Llama', copilot: 'Copilot', grok: 'Grok',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url || '';
    const businessName = body.business_name || '';
    if (!rawUrl) return Response.json({ error: 'URL required' }, { status: 400 });

    const cleanUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    const domain = (() => { try { return new URL(cleanUrl).hostname.replace(/^www\./, ''); } catch { return cleanUrl; } })();
    const brandLabel = businessName || domain;

    // ── Resolve which engines this user's plan is allowed to use ──
    const isAdmin = user.role === 'admin';
    const planId = isAdmin ? 'pro' : (user.subscription_plan || 'free');
    let enabledEngines = ['gemini'];
    try {
      const settings = await base44.asServiceRole.entities.AppSettings.filter({ key: 'plans_config' });
      if (settings.length > 0) {
        const plans = JSON.parse(settings[0].value || '[]');
        const p = (plans || []).find((x: any) => x.id === planId);
        if (p && Array.isArray(p.engines) && p.engines.length > 0) enabledEngines = p.engines;
        else if (isAdmin) enabledEngines = ALL_ENGINES;
      } else if (isAdmin) {
        enabledEngines = ALL_ENGINES;
      }
    } catch {
      if (isAdmin) enabledEngines = ALL_ENGINES;
    }
    enabledEngines = enabledEngines.filter((e) => ALL_ENGINES.includes(e));
    if (enabledEngines.length === 0) enabledEngines = ['gemini'];

    const enginesList = enabledEngines.map((e) => ENGINE_LABELS[e] || e).join(', ');

    // ── Load user-curated Brand Knowledge to enrich the analysis ──
    let brandContext = '';
    try {
      const profiles = await base44.asServiceRole.entities.BusinessProfile.filter({ created_by_id: user.id });
      const p = profiles.find((x: any) => x.site_url === cleanUrl) || profiles[0];
      if (p?.brand_keywords) {
        let extra: any = {};
        if (String(p.brand_keywords).startsWith('http')) {
          extra = await fetch(p.brand_keywords).then((r) => r.json()).catch(() => ({}));
        } else {
          try { extra = JSON.parse(p.brand_keywords); } catch { extra = {}; }
        }
        const bk = extra?.brand_knowledge;
        if (bk && typeof bk === 'object') {
          const parts: string[] = [];
          if (bk.industry) parts.push(`Industry: ${bk.industry}`);
          if (bk.audience) parts.push(`Target audience: ${bk.audience}`);
          if (bk.business_model) parts.push(`Business model: ${bk.business_model}`);
          if (bk.value_description) parts.push(`Value proposition: ${bk.value_description}`);
          if (Array.isArray(bk.value_keywords) && bk.value_keywords.length) parts.push(`Differentiators: ${bk.value_keywords.join(', ')}`);
          if (Array.isArray(bk.use_cases) && bk.use_cases.length) parts.push(`Use cases: ${bk.use_cases.join(' | ')}`);
          if (Array.isArray(bk.authority_topics) && bk.authority_topics.length) parts.push(`Authority topics: ${bk.authority_topics.join(', ')}`);
          if (Array.isArray(bk.pre_purchase_questions) && bk.pre_purchase_questions.length) parts.push(`Pre-purchase questions: ${bk.pre_purchase_questions.join(' | ')}`);
          if (bk.scope) parts.push(`Brand scope: ${bk.scope}`);
          if (Array.isArray(bk.priority_countries) && bk.priority_countries.length) parts.push(`Priority countries: ${bk.priority_countries.join(', ')}`);
          if (Array.isArray(bk.languages) && bk.languages.length) parts.push(`Answer languages: ${bk.languages.join(', ')}`);
          if (parts.length) brandContext = `\n## BRAND KNOWLEDGE (user-provided, authoritative — use this to focus zones, languages, competitors, tasks and cited topics)\n${parts.join('\n')}\n`;
        }
      }
    } catch (e) {
      console.log('[dashboardOverview] brand knowledge load skipped:', e?.message);
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an elite GEO (Generative Engine Optimization) analyst. Perform a LIVE web analysis of the brand "${brandLabel}" (website: ${cleanUrl}) to build a full AI-visibility overview dashboard.

## SCOPE — ONLY THESE AI ENGINES
Analyze citations ONLY for these AI engines (the ones enabled on the user's plan): ${enginesList}.
Do NOT include any other engine in "llms_citing".
${brandContext}

## RULES — REALISM, ZERO INVENTION
- Base scores on the brand's REAL online authority. An unknown local brand scores low (10-35). A recognized brand scores higher.
- geo_score is 0-100 (overall GEO/AI-visibility score).
- narrative/authority/referral are raw counts (integers) representing how often the brand is cited in each context type across the enabled engines. Unknown brand → mostly 0.
- For each enabled engine, estimate the number of AI answers where the brand is cited (integer, realistic — often 0-6 for smaller brands).
- competitors: the 3-4 real leading competitors in this brand's industry, with a "visibility %" (how often AI recommends them vs the brand). The user's own brand is included with its own (usually low) %.
- cited_pages: real page paths of ${domain} most likely cited by AI (e.g. "${domain}", "${domain}/pricing"), with an estimated citation count each. If none, return an empty array.
- zones: ranking by continent (North America, Europe, Asia…) with a 0-100 score and rank position. Mark the best zone.
- languages: ranking by language (with ISO country flag hints) with a 0-100 score, number of prompts analyzed, and a strength label.
- tasks: 0-4 concrete, specific actionable tasks to improve AI visibility (empty array if the brand has no data yet / first audit).
- evolution: 6-8 points {date_label, value} showing the GEO score trend over the last 30 days (realistic, can be flat/slightly declining for a new brand).

Return ONLY valid JSON.`,
      add_context_from_internet: true,
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          geo_score: { type: 'number' },
          score_breakdown: {
            type: 'object',
            properties: {
              narrative: { type: 'number' },
              authority: { type: 'number' },
              referral: { type: 'number' },
              brand_pct: { type: 'number' },
              website_pct: { type: 'number' },
              earned_pct: { type: 'number' },
            },
          },
          evolution: {
            type: 'array',
            items: { type: 'object', properties: { date_label: { type: 'string' }, value: { type: 'number' } } },
          },
          competitors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                domain: { type: 'string' },
                visibility_pct: { type: 'number' },
                is_you: { type: 'boolean' },
              },
            },
          },
          llms_citing: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                engine: { type: 'string' },
                citations: { type: 'number' },
              },
            },
          },
          cited_pages: {
            type: 'array',
            items: {
              type: 'object',
              properties: { url: { type: 'string' }, citations: { type: 'number' } },
            },
          },
          zones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                zone: { type: 'string' },
                score: { type: 'number' },
                rank: { type: 'number' },
                is_best: { type: 'boolean' },
              },
            },
          },
          languages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                language: { type: 'string' },
                flag: { type: 'string' },
                score: { type: 'number' },
                prompts: { type: 'number' },
                strength_label: { type: 'string' },
              },
            },
          },
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                priority: { type: 'string' },
                impact: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Normalize: keep only enabled engines in llms_citing, map to known ids
    const llms = (result?.llms_citing || [])
      .map((l: any) => {
        const raw = String(l.engine || '').toLowerCase();
        const id = ALL_ENGINES.find((e) => raw.includes(e)) || null;
        return id ? { engine: id, label: ENGINE_LABELS[id], citations: Math.max(0, Math.round(l.citations || 0)) } : null;
      })
      .filter((l: any) => l && enabledEngines.includes(l.engine));

    const payload = {
      brand_name: brandLabel,
      domain,
      url: cleanUrl,
      plan_id: planId,
      enabled_engines: enabledEngines,
      geo_score: Math.max(0, Math.min(100, Math.round(result?.geo_score || 0))),
      score_breakdown: result?.score_breakdown || {},
      evolution: result?.evolution || [],
      competitors: (result?.competitors || []).slice(0, 5),
      llms_citing: llms,
      cited_pages: (result?.cited_pages || []).slice(0, 8),
      zones: (result?.zones || []).slice(0, 6),
      languages: (result?.languages || []).slice(0, 6),
      tasks: (result?.tasks || []).slice(0, 4),
      analyzed_at: new Date().toISOString(),
    };

    return Response.json(payload);
  } catch (error) {
    console.error('[dashboardOverview]', error);
    return Response.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
});