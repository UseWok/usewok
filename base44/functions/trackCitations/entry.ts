import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * trackCitations — LRS+ live citation tracking + contextual sentiment.
 * Uses gemini_3_1_pro WITH internet search to find REAL mentions of the brand
 * across AI-readable web (forums, newsletters, specialized blogs, media),
 * then classifies the CONTEXTUAL sentiment of each mention
 * (reference / expensive / complex / trusted / criticized / neutral).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url || '';
    const businessName = body.business_name || '';
    const industry = body.industry || '';
    if (!rawUrl) return Response.json({ error: 'URL required' }, { status: 400 });

    const cleanUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    const domain = (() => { try { return new URL(cleanUrl).hostname.replace(/^www\./, ''); } catch { return cleanUrl; } })();
    const brandLabel = businessName || domain;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an elite AI-visibility analyst. Your job: perform a LIVE web sweep to find REAL, VERIFIABLE mentions of the brand "${brandLabel}" (website: ${cleanUrl}${industry ? `, industry: ${industry}` : ''}) across the "AI-readable" web that Large Language Models actually ingest.

## WHERE TO LOOK (search the internet NOW)
- Specialized / industry blogs and editorial media
- Technical forums (Reddit, Stack Exchange, niche communities), Q&A threads
- Newsletters, roundups, "best of" / comparison articles
- Review platforms, directories, aggregators
- Social / news mentions that LLMs commonly cite

## RULES — ZERO INVENTION
1. Only report mentions you can ACTUALLY find via web search. If you find nothing, return an empty citations array and set found_any=false. NEVER fabricate a URL or a quote.
2. Every citation MUST have a real, working source_url. No placeholders.
3. Quote the exact sentence/snippet where the brand appears (max 220 chars).
4. Classify the CONTEXTUAL SENTIMENT of each mention into exactly one:
   - "reference"  = cited as an authority / go-to / the reference in its field
   - "trusted"    = spoken of positively / recommended
   - "neutral"    = merely listed / factual mention, no judgment
   - "expensive"  = framed as costly / pricey / not worth the price
   - "complex"    = framed as complicated / hard to use / steep learning curve
   - "criticized" = negative / disappointed / warned against
5. Give each mention an authority_weight 1-5 (5 = high-authority source LLMs trust heavily, 1 = low).

## ALSO COMPUTE
- contextual_sentiment_score (0-100): overall how LLMs likely "perceive" this brand from these mentions. Few/negative mentions = low. Many "reference"/"trusted" = high.
- dominant_perception: the single most common framing among mentions (one of the sentiment labels above), or "unknown" if no mentions.
- perception_summary: 1 punchy sentence in English on how the AI-readable web frames this brand (e.g. "The web frames ${brandLabel} as a trusted reference, but a few threads flag it as pricey.").
- sentiment_breakdown: count of mentions per label.

Return ONLY valid JSON.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          found_any: { type: 'boolean' },
          contextual_sentiment_score: { type: 'number' },
          dominant_perception: { type: 'string' },
          perception_summary: { type: 'string' },
          sentiment_breakdown: {
            type: 'object',
            properties: {
              reference: { type: 'number' },
              trusted: { type: 'number' },
              neutral: { type: 'number' },
              expensive: { type: 'number' },
              complex: { type: 'number' },
              criticized: { type: 'number' },
            }
          },
          citations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source_name: { type: 'string' },
                source_url: { type: 'string' },
                source_type: { type: 'string' },
                snippet: { type: 'string' },
                sentiment: { type: 'string' },
                authority_weight: { type: 'number' },
              }
            }
          },
        }
      }
    });

    // Keep only citations with a plausible real URL (anti-hallucination filter)
    const citations = (result?.citations || []).filter(c => c && typeof c.source_url === 'string' && c.source_url.startsWith('http')).slice(0, 12);

    const payload = {
      found_any: !!result?.found_any && citations.length > 0,
      contextual_sentiment_score: Math.max(0, Math.min(100, Math.round(result?.contextual_sentiment_score || 0))),
      dominant_perception: result?.dominant_perception || 'unknown',
      perception_summary: result?.perception_summary || '',
      sentiment_breakdown: result?.sentiment_breakdown || {},
      citations,
      tracked_at: new Date().toISOString(),
    };

    return Response.json(payload);
  } catch (error) {
    console.error('[trackCitations]', error);
    return Response.json({ error: error?.message || 'Tracking failed' }, { status: 500 });
  }
});