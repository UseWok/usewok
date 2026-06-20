import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'URL required' }, { status: 400 });
    }

    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

    // Fire all queries IN PARALLEL
    const [seoResult, chatgptResult, technicalResult] = await Promise.all([
      // 1. Full SEO + AI visibility analysis with real data
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a senior SEO and AI visibility expert. Deeply analyze this website: ${cleanUrl}

        Use web search to find REAL data about this website. Look for:
        - The actual business/website content
        - Its real organic traffic estimates (Similarweb, Ahrefs, SEMrush-style estimates)
        - Its real keyword rankings
        - Its backlink profile
        - Its domain authority

        Return a JSON with ALL of these fields (use real estimates where possible, otherwise realistic estimates based on site type):
        - ai_visibility_score: number 0-100
        - message_clarity_score: number 0-100
        - commercial_presence_score: number 0-100
        - overall_score: number 0-100
        - business_name: string
        - business_type: string
        - city: string
        - country: string
        - language: string (e.g. "fr", "en")
        - organic_traffic: number (estimated monthly visits, e.g. 12400)
        - organic_traffic_delta_pct: number (% change last 30d, e.g. +50.17 or -10.5)
        - organic_keywords: number (estimated number of ranking keywords, e.g. 57400)
        - organic_keywords_delta_pct: number (% change)
        - paid_traffic: number (estimated paid monthly visits, 0 if none)
        - paid_keywords: number
        - backlinks: number (estimated total backlinks, e.g. 5200000)
        - backlinks_delta_pct: number (% change)
        - referring_domains: number (estimated referring domains)
        - referring_domains_delta_pct: number
        - authority_score: number 0-100 (domain authority)
        - site_health: number 0-100 (technical SEO health %)
        - site_health_issues: number (count of technical issues)
        - visibility_pct: number 0-100 (search visibility %)
        - visibility_delta: number (change in pts, e.g. -10)
        - issues: array of 4 objects { problem: string, category: string, severity: "error"|"warning" }
        - strengths: array of 3 strings
        - shock_insight: string (one powerful sentence about what they're losing)
        - top_keywords: array of 5 objects { keyword: string, position: number, volume: number }
        - competitors: array of 3 objects { domain: string, authority_score: number, organic_traffic: number }

        Be realistic. Large well-known sites have millions of backlinks and high traffic.
        Small local businesses may have very low traffic. Base numbers on what you actually know about this domain.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            ai_visibility_score: { type: 'number' },
            message_clarity_score: { type: 'number' },
            commercial_presence_score: { type: 'number' },
            overall_score: { type: 'number' },
            business_name: { type: 'string' },
            business_type: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            language: { type: 'string' },
            organic_traffic: { type: 'number' },
            organic_traffic_delta_pct: { type: 'number' },
            organic_keywords: { type: 'number' },
            organic_keywords_delta_pct: { type: 'number' },
            paid_traffic: { type: 'number' },
            paid_keywords: { type: 'number' },
            backlinks: { type: 'number' },
            backlinks_delta_pct: { type: 'number' },
            referring_domains: { type: 'number' },
            referring_domains_delta_pct: { type: 'number' },
            authority_score: { type: 'number' },
            site_health: { type: 'number' },
            site_health_issues: { type: 'number' },
            visibility_pct: { type: 'number' },
            visibility_delta: { type: 'number' },
            issues: { type: 'array', items: { type: 'object', properties: { problem: { type: 'string' }, category: { type: 'string' }, severity: { type: 'string' } } } },
            strengths: { type: 'array', items: { type: 'string' } },
            shock_insight: { type: 'string' },
            top_keywords: { type: 'array', items: { type: 'object', properties: { keyword: { type: 'string' }, position: { type: 'number' }, volume: { type: 'number' } } } },
            competitors: { type: 'array', items: { type: 'object', properties: { domain: { type: 'string' }, authority_score: { type: 'number' }, organic_traffic: { type: 'number' } } } },
          }
        }
      }),

      // 2. AI engine visibility
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Check AI search engine visibility for: ${cleanUrl}
        Search the web to understand this business, then estimate:
        - chatgpt_mentions: boolean
        - chatgpt_score: number 0-100
        - chatgpt_reason: string
        - perplexity_score: number 0-100
        - google_ai_score: number 0-100
        - ai_mentions_count: number (estimated total AI mentions per month)
        - perplexity_reason: string`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            chatgpt_mentions: { type: 'boolean' },
            chatgpt_score: { type: 'number' },
            chatgpt_reason: { type: 'string' },
            perplexity_score: { type: 'number' },
            google_ai_score: { type: 'number' },
            ai_mentions_count: { type: 'number' },
            perplexity_reason: { type: 'string' },
          }
        }
      }),

      // 3. Technical signals
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Check technical signals for: ${cleanUrl}
        - has_schema_markup: boolean
        - has_google_business: boolean
        - has_ssl: boolean
        - has_mobile_friendly: boolean
        - has_sitemap: boolean
        - has_robots_txt: boolean
        - page_speed_score: number 0-100`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            has_schema_markup: { type: 'boolean' },
            has_google_business: { type: 'boolean' },
            has_ssl: { type: 'boolean' },
            has_mobile_friendly: { type: 'boolean' },
            has_sitemap: { type: 'boolean' },
            has_robots_txt: { type: 'boolean' },
            page_speed_score: { type: 'number' },
          }
        }
      }),
    ]);

    const result = {
      ...seoResult,
      ...chatgptResult,
      ...technicalResult,
      url: cleanUrl,
      analyzed_at: new Date().toISOString(),
    };

    // Save lead in background
    base44.asServiceRole.entities.ContactLead.create({
      website: cleanUrl,
      first_name: result.business_name || '',
      role: result.business_type || '',
      message: `AI scan: score ${result.overall_score}/100 | traffic: ${result.organic_traffic}`,
      status: 'new',
    }).catch(() => {});

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});