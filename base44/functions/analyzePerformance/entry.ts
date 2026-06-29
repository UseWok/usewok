import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { url, business_name } = body;

    if (!url) return Response.json({ error: 'URL required' }, { status: 400 });

    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
    const brandName = business_name || domain;

    // Run 3 parallel AI analyses
    const [shareOfVoice, growthFactors, strategicRecs] = await Promise.all([

      // 1. Share of Voice + perception bubble chart
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an AI market intelligence analyst. Analyze the brand "${brandName}" (${cleanUrl}) and its main competitors in their industry.

Return JSON with:
- your_brand: { name: string, voice_share_pct: number, voice_share_delta: number, favorable_pct: number, favorable_delta: number, color: string (hex) }
- competitors: array of up to 5 { name: string, voice_share_pct: number, voice_share_delta: number, favorable_pct: number, favorable_delta: number, color: string (hex) }
- other_pct: number (remaining share not attributed to main brands)
- insight_type: "ahead" | "behind" | "tied"
- insight_title: string (short, punchy, English, like "Falling behind AC Lens")
- insight_text: string (1-2 sentences, English, specific numbers, what to do)
- top_competitor: string (name of biggest competitor by share)
- donut_data: array of { label: string, pct: number, color: string, delta: number }

Use realistic industry estimates. Colors: use purple #7C3AED for their brand, and distinct colors for competitors.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            your_brand: { type: 'object', properties: { name: { type: 'string' }, voice_share_pct: { type: 'number' }, voice_share_delta: { type: 'number' }, favorable_pct: { type: 'number' }, favorable_delta: { type: 'number' }, color: { type: 'string' } } },
            competitors: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, voice_share_pct: { type: 'number' }, voice_share_delta: { type: 'number' }, favorable_pct: { type: 'number' }, favorable_delta: { type: 'number' }, color: { type: 'string' } } } },
            other_pct: { type: 'number' },
            insight_type: { type: 'string' },
            insight_title: { type: 'string' },
            insight_text: { type: 'string' },
            top_competitor: { type: 'string' },
            donut_data: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, pct: { type: 'number' }, color: { type: 'string' }, delta: { type: 'number' } } } },
          }
        }
      }),

      // 2. Growth Factors matrix
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an AI search analyst. For brand "${brandName}" (${cleanUrl}), generate a growth factors frequency matrix showing how often each growth factor is mentioned by AI engines for each brand.

Return JSON with:
- top_insight: { factor: string, count: number, insight: string (2 sentences English, specific, actionable) }
- factors: array of 8-13 objects:
  { 
    name: string (growth factor, English, 3-6 words),
    your_brand_count: number (0-30, realistic),
    competitors: array of { name: string, count: number, is_leader: boolean }
    total_mentions: number,
    branded_mentions: number
  }
- brands_in_matrix: array of { name: string, color: string } (your brand first, then top 4 competitors)

Use real industry data. Make counts realistic (smaller brands 0-10, leaders 10-35).`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            top_insight: { type: 'object', properties: { factor: { type: 'string' }, count: { type: 'number' }, insight: { type: 'string' } } },
            factors: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, your_brand_count: { type: 'number' }, competitors: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, count: { type: 'number' }, is_leader: { type: 'boolean' } } } }, total_mentions: { type: 'number' }, branded_mentions: { type: 'number' } } } },
            brands_in_matrix: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, color: { type: 'string' } } } },
          }
        }
      }),

      // 3. Strategic recommendations + competitor comparisons
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an AI brand strategist. For brand "${brandName}" (${cleanUrl}), generate:

1. Per-competitor comparisons (your brand VS each top competitor)
2. Strategic AI levers (recommendations)

Return JSON:
- competitor_comparisons: array of up to 4 {
    competitor_name: string,
    competitor_color: string (hex),
    insight_type: "ahead" | "behind" | "tied",
    insight_title: string,
    insight_text: string (1-2 sentences, specific numbers, English),
    your_voice_share: number,
    competitor_voice_share: number,
    your_favorable: number,
    competitor_favorable: number,
    your_voice_delta: number,
    competitor_voice_delta: number,
    your_favorable_delta: number,
    competitor_favorable_delta: number,
    growth_factors: array of { name: string, your_count: number, competitor_count: number, competitor_is_leader: boolean } (8-13 items)
  }
- strategic_levers: array of 3-5 {
    priority: "urgent" | "short_term" | "medium_term",
    title: string (bold key insight, English, 1 sentence),
    body: string (2-3 sentences, English, specific analysis),
    recommendations: array of 3 strings (specific, actionable English bullet points)
  }`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            competitor_comparisons: { type: 'array', items: { type: 'object', properties: { competitor_name: { type: 'string' }, competitor_color: { type: 'string' }, insight_type: { type: 'string' }, insight_title: { type: 'string' }, insight_text: { type: 'string' }, your_voice_share: { type: 'number' }, competitor_voice_share: { type: 'number' }, your_favorable: { type: 'number' }, competitor_favorable: { type: 'number' }, your_voice_delta: { type: 'number' }, competitor_voice_delta: { type: 'number' }, your_favorable_delta: { type: 'number' }, competitor_favorable_delta: { type: 'number' }, growth_factors: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, your_count: { type: 'number' }, competitor_count: { type: 'number' }, competitor_is_leader: { type: 'boolean' } } } } } } },
            strategic_levers: { type: 'array', items: { type: 'object', properties: { priority: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' }, recommendations: { type: 'array', items: { type: 'string' } } } } },
          }
        }
      }),
    ]);

    const result = {
      brand_name: brandName,
      url: cleanUrl,
      analyzed_at: new Date().toISOString(),
      share_of_voice: shareOfVoice,
      growth_factors: growthFactors,
      strategy: strategicRecs,
    };

    // ── Persist performance data to BusinessProfile ──
    try {
      const profiles = await base44.asServiceRole.entities.BusinessProfile.filter({ created_by_id: user.id });
      const existing = profiles.find(p => p.site_url === cleanUrl);
      if (existing) {
        let cached = {};
        try {
          if (existing.brand_keywords?.startsWith('http')) {
            const fileRes = await fetch(existing.brand_keywords);
            cached = await fileRes.json();
          } else {
            cached = JSON.parse(existing.brand_keywords || '{}');
          }
        } catch {}
        const merged = { ...cached, perf_data: result, perf_analyzed_at: result.analyzed_at };
        let brand_keywords = JSON.stringify(merged);
        try {
          const fileObj = new File([brand_keywords], 'data.json', { type: 'application/json' });
          const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: fileObj });
          if (uploadRes?.file_url) brand_keywords = uploadRes.file_url;
        } catch {}
        await base44.asServiceRole.entities.BusinessProfile.update(existing.id, { brand_keywords });
      }
    } catch (e) {
      console.error('[analyzePerformance] persist error:', e);
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});