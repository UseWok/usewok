import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are analyzing the website "${brandLabel}" (${cleanUrl}) using internet context, for someone who knows NOTHING about marketing.

Generate a simple, concrete "Brand Knowledge". STRICT rules:
- Use SIMPLE, everyday language. FORBIDDEN: marketing jargon (persona, value proposition, sales play, GEO, authority, brand awareness…). Write as if explaining to a friend.
- Each array contains EXACTLY 3 to 5 items (never more than 5), specific to this brand, not generic.
- Each array item = 2 to 5 words MAX, short and clear.
- If info is uncertain, leave EMPTY ("").
- Respond in friendly English.

Return a JSON with exactly these fields:
{
  "business_name": "Company name",
  "industry": "What they do, in simple words (e.g. marketing software, clothing store)",
  "headquarters": "City, Country",
  "audience": "Their typical customers, in 1 simple sentence",
  "business_model": "B2B | B2C | B2B2C | Marketplace",
  "target_segment": "Type of customers in simple words (e.g. small businesses, individuals)",
  "value_description": "In 1-2 simple sentences, what they do better than others",
  "value_keywords": ["short strength 1", "strength 2", "... 5 max"],
  "use_cases": ["short use case 1", "... 5 max"],
  "authority_topics": ["short expertise topic 1", "... 5 max"],
  "pre_purchase_questions": ["simple customer question 1", "... 5 max"],
  "objections": ["common hesitation 1", "... 5 max"],
  "avoid_topics": ["topic to avoid 1", "... 5 max"],
  "scope": "Local | Regional | National | Continental | Worldwide"
}`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          business_name: { type: 'string' },
          industry: { type: 'string' },
          headquarters: { type: 'string' },
          audience: { type: 'string' },
          business_model: { type: 'string' },
          target_segment: { type: 'string' },
          value_description: { type: 'string' },
          value_keywords: { type: 'array', items: { type: 'string' } },
          use_cases: { type: 'array', items: { type: 'string' } },
          authority_topics: { type: 'array', items: { type: 'string' } },
          pre_purchase_questions: { type: 'array', items: { type: 'string' } },
          objections: { type: 'array', items: { type: 'string' } },
          avoid_topics: { type: 'array', items: { type: 'string' } },
          scope: { type: 'string' },
        },
      },
    });

    // Cap every pastille array to 5 items max
    const capped = { ...result };
    for (const key of ['value_keywords', 'use_cases', 'authority_topics', 'pre_purchase_questions', 'objections', 'avoid_topics']) {
      if (Array.isArray(capped[key])) capped[key] = capped[key].slice(0, 5);
    }

    return Response.json({ knowledge: capped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});