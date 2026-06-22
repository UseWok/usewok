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

    const [seoResult, aiEnginesResult, technicalResult, lrsResult] = await Promise.all([

      // 1. SEO + geo traffic
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a senior SEO and AI visibility expert. Deeply analyze this website using real web data: ${cleanUrl}

        Return a JSON with ALL these fields (use real estimates based on what you know or can find):
        - ai_visibility_score: number 0-100
        - message_clarity_score: number 0-100
        - commercial_presence_score: number 0-100
        - overall_score: number 0-100
        - business_name: string
        - business_type: string
        - city: string
        - country: string (ISO 2-letter code, e.g. "FR")
        - language: string (e.g. "fr", "en")
        - organic_traffic: number (estimated monthly visits)
        - organic_traffic_delta_pct: number (% change last 30d)
        - organic_keywords: number
        - organic_keywords_delta_pct: number
        - backlinks: number
        - backlinks_delta_pct: number
        - referring_domains: number
        - authority_score: number 0-100
        - site_health: number 0-100
        - site_health_issues: number
        - visibility_pct: number 0-100
        - visibility_delta: number
        - issues: array of 4 objects { problem: string (in simple non-technical French, explain what it means for the business owner — no jargon), category: string, severity: "error"|"warning" }
        - strengths: array of 3 strings (in French)
        - shock_insight: string (one powerful simple sentence in French about what they're losing)
        - top_keywords: array of 5 objects { keyword: string, position: number, volume: number }
        - competitors: array of 3 objects { domain: string, authority_score: number, organic_traffic: number }
        - geo_traffic: array of max 4 objects sorted by traffic desc: first 3 top countries each { country: string (ISO 2-letter), country_name: string, pct: number (% of total traffic, integer) }, then one entry { country: "OTHER", country_name: "Autres pays", pct: number } if there are more. All pct must sum to 100.
        
        IMPORTANT for issues: Write in simple French a business owner can understand. Never use words like "Schema Markup", "balise meta", "JSON-LD", "robots.txt", "SSL certificate". Instead say things like "Votre site n'est pas bien compris par les IA", "Votre fiche Google n'existe pas", "Votre site n'est pas sécurisé (pas de cadenas)".`,
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
            backlinks: { type: 'number' },
            backlinks_delta_pct: { type: 'number' },
            referring_domains: { type: 'number' },
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
            geo_traffic: { type: 'array', items: { type: 'object', properties: { country: { type: 'string' }, country_name: { type: 'string' }, pct: { type: 'number' } } } },
          }
        }
      }),

      // 2. Extended AI engines scores (8 engines)
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Analyze AI search engine visibility for this website: ${cleanUrl}
        Search the web to understand this business, then estimate realistic scores for each AI engine based on the site's content quality, authority, and online presence.
        
        Return scores 0-100 for each engine. A well-known brand scores 60-90. A small local business with no online presence scores 5-20.
        
        For each engine, also estimate:
        - citation_frequency: how often this brand is cited per 1000 relevant queries (0-100 scale)
        - sentiment: "positive" | "neutral" | "negative" (how the AI tends to present this brand)
        - accuracy: number 0-100 (how accurately the AI describes this brand's offer)
        
        Return:
        - chatgpt_score: number 0-100
        - chatgpt_citation_freq: number 0-100
        - chatgpt_sentiment: string
        - chatgpt_accuracy: number 0-100
        - gemini_score: number 0-100
        - gemini_citation_freq: number 0-100
        - gemini_sentiment: string
        - gemini_accuracy: number 0-100
        - claude_score: number 0-100
        - claude_citation_freq: number 0-100
        - claude_sentiment: string
        - claude_accuracy: number 0-100
        - mistral_score: number 0-100
        - mistral_citation_freq: number 0-100
        - mistral_sentiment: string
        - mistral_accuracy: number 0-100
        - llama_score: number 0-100
        - llama_citation_freq: number 0-100
        - llama_sentiment: string
        - llama_accuracy: number 0-100
        - perplexity_score: number 0-100
        - perplexity_citation_freq: number 0-100
        - perplexity_sentiment: string
        - perplexity_accuracy: number 0-100
        - grok_score: number 0-100
        - grok_citation_freq: number 0-100
        - grok_sentiment: string
        - grok_accuracy: number 0-100
        - copilot_score: number 0-100
        - copilot_citation_freq: number 0-100
        - copilot_sentiment: string
        - copilot_accuracy: number 0-100
        - ai_mentions_count: number (estimated total AI mentions/month)
        - chatgpt_reason: string (one sentence why in French)
        - perplexity_reason: string (one sentence why in French)`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            chatgpt_score: { type: 'number' }, chatgpt_citation_freq: { type: 'number' }, chatgpt_sentiment: { type: 'string' }, chatgpt_accuracy: { type: 'number' },
            gemini_score: { type: 'number' }, gemini_citation_freq: { type: 'number' }, gemini_sentiment: { type: 'string' }, gemini_accuracy: { type: 'number' },
            claude_score: { type: 'number' }, claude_citation_freq: { type: 'number' }, claude_sentiment: { type: 'string' }, claude_accuracy: { type: 'number' },
            mistral_score: { type: 'number' }, mistral_citation_freq: { type: 'number' }, mistral_sentiment: { type: 'string' }, mistral_accuracy: { type: 'number' },
            llama_score: { type: 'number' }, llama_citation_freq: { type: 'number' }, llama_sentiment: { type: 'string' }, llama_accuracy: { type: 'number' },
            perplexity_score: { type: 'number' }, perplexity_citation_freq: { type: 'number' }, perplexity_sentiment: { type: 'string' }, perplexity_accuracy: { type: 'number' },
            grok_score: { type: 'number' }, grok_citation_freq: { type: 'number' }, grok_sentiment: { type: 'string' }, grok_accuracy: { type: 'number' },
            copilot_score: { type: 'number' }, copilot_citation_freq: { type: 'number' }, copilot_sentiment: { type: 'string' }, copilot_accuracy: { type: 'number' },
            ai_mentions_count: { type: 'number' },
            chatgpt_reason: { type: 'string' },
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

      // 4. LLM Resonance Score + Entity Injection Plan
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an expert in AI search engine optimization (AEO — Answer Engine Optimization). Analyze this website: ${cleanUrl}

        Your mission: compute the LLM Resonance Score (LRS) and generate a concrete entity injection action plan.

        THE LLM RESONANCE SCORE (LRS):
        This is the new standard metric for the AI era — like Domain Authority for SEO, but for LLM visibility.
        It aggregates 3 signals across 8 AI engines (ChatGPT, Gemini, Claude, Mistral, Llama, Perplexity, Grok, Copilot):
        - Citation frequency (40% weight): how often the brand appears in AI answers on relevant queries
        - Sentiment quality (30% weight): % of positive/neutral citations vs negative ones
        - Information accuracy (30% weight): how accurately AI engines describe this brand's offer, pricing, USP

        Compute lrs_score (0-100) based on these signals.
        Also provide:
        - lrs_citation_score: number 0-100 (citation frequency component)
        - lrs_sentiment_score: number 0-100 (sentiment quality component)
        - lrs_accuracy_score: number 0-100 (information accuracy component)
        - lrs_trend: "rising" | "stable" | "declining" (estimated trend)
        - lrs_vs_industry: number (how many points above/below industry average, e.g. +12 or -8)

        ENTITY INJECTION ACTION PLAN:
        Generate 3 specific, highly actionable injection recommendations. Each must be a concrete "ordonnance" — not generic advice.
        
        For each action:
        - engine: which AI engine is missing this brand (e.g. "Perplexity")
        - gap: what specific query or topic where competitors appear but this brand doesn't (be specific, name the exact query)
        - competitor_advantage: why competitors are cited there (e.g. "ils sont cités car présents dans le rapport Gartner 2024 sur les CRM")
        - action_title: short action title in French (e.g. "Publier une page de données primaires")
        - action_detail: specific step-by-step instruction in French (2-3 sentences, name specific platforms, formats, or sources)
        - platform: specific platform or channel to target (e.g. "Reddit", "Wikipedia", "LinkedIn Pulse", "HubSpot Blog guest post")
        - impact: "high" | "medium"
        - effort: "low" | "medium" | "high"

        Return:
        - lrs_score: number 0-100
        - lrs_citation_score: number 0-100
        - lrs_sentiment_score: number 0-100
        - lrs_accuracy_score: number 0-100
        - lrs_trend: string
        - lrs_vs_industry: number
        - injection_plan: array of 3 objects with fields: engine, gap, competitor_advantage, action_title, action_detail, platform, impact, effort`,
        add_context_from_internet: true,
        model: 'gemini_3_1_pro',
        response_json_schema: {
          type: 'object',
          properties: {
            lrs_score: { type: 'number' },
            lrs_citation_score: { type: 'number' },
            lrs_sentiment_score: { type: 'number' },
            lrs_accuracy_score: { type: 'number' },
            lrs_trend: { type: 'string' },
            lrs_vs_industry: { type: 'number' },
            injection_plan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  engine: { type: 'string' },
                  gap: { type: 'string' },
                  competitor_advantage: { type: 'string' },
                  action_title: { type: 'string' },
                  action_detail: { type: 'string' },
                  platform: { type: 'string' },
                  impact: { type: 'string' },
                  effort: { type: 'string' },
                }
              }
            }
          }
        }
      }),
    ]);

    const result = {
      ...seoResult,
      ...aiEnginesResult,
      ...technicalResult,
      ...lrsResult,
      google_ai_score: aiEnginesResult.gemini_score || 0,
      url: cleanUrl,
      analyzed_at: new Date().toISOString(),
    };

    base44.asServiceRole.entities.ContactLead.create({
      website: cleanUrl,
      first_name: result.business_name || '',
      role: result.business_type || '',
      message: `AI scan: LRS ${result.lrs_score}/100 | score ${result.overall_score}/100 | traffic: ${result.organic_traffic}`,
      status: 'new',
    }).catch(() => {});

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});