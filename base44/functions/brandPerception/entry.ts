import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * brandPerception — powers the "Image de marque" (kind=brand) and "Recommandations" (kind=reco) pages.
 * Runs a LIVE web analysis (Gemini 3 Flash) of how AI engines perceive the brand across
 * narrative + authority prompts, computes sentiment, cited/not-cited per prompt, and a
 * grid of concrete recommendations. Stored on the BrandPerception entity.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const svc = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url || '';
    const kind = body.kind === 'reco' ? 'reco' : 'brand';
    if (!rawUrl) return Response.json({ error: 'URL required' }, { status: 400 });
    const cleanUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    const domain = (() => { try { return new URL(cleanUrl).hostname.replace(/^www\./, ''); } catch { return cleanUrl; } })();

    // Brand context
    let brandName = domain, industry = '', city = '';
    try {
      const profiles = await svc.entities.BusinessProfile.filter({ created_by_id: user.id });
      const p = profiles.find((x) => x.site_url === cleanUrl) || profiles[0];
      brandName = p?.identity_name || domain;
      industry = p?.identity_industry || '';
      city = p?.identity_city || '';
    } catch {}

    const result = await svc.integrations.Core.InvokeLLM({
      prompt: `You are a GEO (Generative Engine Optimization) analyst. Analyze LIVE how AI engines (ChatGPT, Gemini, Perplexity) perceive the brand "${brandName}" (${cleanUrl})${industry ? `, industry: ${industry}` : ''}${city ? `, area: ${city}` : ''}.

## PROMPTS TO EVALUATE
Generate 10 REALISTIC user prompts in English:
- 5 "narrative": recommendation requests for tools/services where the brand should appear.
- 5 "authority": educational questions where an expert source would be cited.
For EACH prompt, honestly determine whether the AI engines would actually cite "${brandName}" (cited true/false). A little-known brand = almost never cited. Give a short answer (answer, 1 sentence) summarizing what the AI would respond.

## SCORES
- score_narrative (0-100): share of voice on narrative prompts (realistic).
- score_authority (0-100): presence on authority prompts (realistic).
- sentiment_positive, sentiment_neutral, sentiment_negative (integers, sum = 100): the AI sentiment when it mentions the brand. Unknown brand = mostly neutral.

## RECOMMENDATIONS
Generate 4-6 concrete recommendations to improve AI visibility. Each reco: title, description (2 sentences), impact ("High"|"Medium"|"Low"), effort ("Low"|"Medium"|"High"), type ("Technical"|"Content"|"Off-site").

Respond in English. Valid JSON only.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          score_narrative: { type: 'number' },
          score_authority: { type: 'number' },
          sentiment_positive: { type: 'number' },
          sentiment_neutral: { type: 'number' },
          sentiment_negative: { type: 'number' },
          prompts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                type: { type: 'string' },
                cited: { type: 'boolean' },
                answer: { type: 'string' },
                lang: { type: 'string' },
              },
            },
          },
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                impact: { type: 'string' },
                effort: { type: 'string' },
                type: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const prompts = (result?.prompts || []).filter((p) => p.text).map((p) => ({
      text: p.text,
      type: p.type === 'authority' ? 'authority' : 'narrative',
      cited: !!p.cited,
      answer: p.answer || '',
      lang: p.lang || 'EN',
    }));

    let sp = Math.max(0, Math.round(result?.sentiment_positive || 0));
    let sn = Math.max(0, Math.round(result?.sentiment_neutral || 0));
    let sng = Math.max(0, Math.round(result?.sentiment_negative || 0));
    const total = sp + sn + sng || 1;
    sp = Math.round((sp / total) * 100); sn = Math.round((sn / total) * 100); sng = 100 - sp - sn;

    const payload = {
      user_id: user.id,
      site_url: cleanUrl,
      kind,
      score_narrative: Math.max(0, Math.min(100, Math.round(result?.score_narrative || 0))),
      score_authority: Math.max(0, Math.min(100, Math.round(result?.score_authority || 0))),
      sentiment_positive: sp,
      sentiment_neutral: sn,
      sentiment_negative: sng,
      prompts_json: JSON.stringify(prompts),
      recommendations_json: JSON.stringify((result?.recommendations || []).slice(0, 6)),
      analyzed_at: new Date().toISOString(),
    };

    // Upsert (one record per url+kind)
    const existing = await svc.entities.BrandPerception.filter({ user_id: user.id, site_url: cleanUrl, kind });
    let record;
    if (existing[0]) record = await svc.entities.BrandPerception.update(existing[0].id, payload);
    else record = await svc.entities.BrandPerception.create(payload);

    return Response.json(record);
  } catch (error) {
    console.error('[brandPerception]', error);
    return Response.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
});