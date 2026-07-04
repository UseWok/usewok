import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * citationGaps — Cross-competitor citation gap analysis.
 * For the brand's niche keywords/questions, asks a live-web model:
 * which sites do AI engines cite? For each cited competitor, estimate their
 * SEO authority vs the user's. A "gap" = a competitor cited by AI on a query
 * where the user is NOT cited, especially when that competitor's authority is
 * LOWER than the user's (= a winnable opportunity).
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
    const city = body.city || '';
    const userAuthority = typeof body.authority_score === 'number' ? body.authority_score : null;
    if (!rawUrl) return Response.json({ error: 'URL required' }, { status: 400 });

    const cleanUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    const domain = (() => { try { return new URL(cleanUrl).hostname.replace(/^www\./, ''); } catch { return cleanUrl; } })();
    const brandLabel = businessName || domain;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an elite AEO (AI Engine Optimization) competitive analyst. Perform a LIVE web analysis for the brand "${brandLabel}" (website: ${cleanUrl}${industry ? `, industry: ${industry}` : ''}${city ? `, location: ${city}` : ''}).

## GOAL — FIND "CITATION GAPS"
A citation gap = a niche query where AI engines (ChatGPT, Gemini, Perplexity) would cite a COMPETITOR but NOT "${brandLabel}". The most valuable gaps are competitors with LOWER SEO authority than ${brandLabel} — because those are WINNABLE.

## STEPS (do this using real web knowledge + search)
1. Identify 4-6 high-intent NICHE QUERIES a real customer would ask an AI assistant in this industry${city ? ` around ${city}` : ''} (e.g. "best [service] for [use case]", "who offers [specific thing]"). Make them concrete and specific, not generic.
2. For each query, determine which real competitor domains an AI engine would most likely cite/recommend today.
3. Determine whether "${brandLabel}" would be cited for that query (usually NO if it's an unknown brand).
4. For each competitor found, estimate their SEO authority_score (0-100) based on their real online footprint.
${userAuthority != null ? `5. The user's own estimated authority_score is ${userAuthority}. Flag a gap as "winnable" (is_winnable=true) when the competitor's authority is <= ${userAuthority} + 10 (i.e. not dramatically stronger).` : `5. Flag a gap as "winnable" (is_winnable=true) when the cited competitor is a small/mid player rather than a dominant national brand.`}

## RULES — NO INVENTION
- Only real competitor domains. If unsure, use well-known real players in the space. Never invent fake domains.
- Each gap must have: the query, the competitor cited, that competitor's estimated authority, whether it's winnable, and a 1-sentence "why_they_win" (what content/signal makes AI cite them — e.g. "detailed comparison page + FAQ schema").
- Also give a concrete "your_move": the single most impactful action ${brandLabel} should take to steal that citation.

## OUTPUT
- your_authority_estimate (0-100): your best estimate of ${brandLabel}'s current SEO/AI authority.
- summary: 1 punchy English sentence on the biggest missed opportunity.
- gaps: array (4-6). Sort winnable gaps first.

Return ONLY valid JSON.`,
      add_context_from_internet: true,
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          your_authority_estimate: { type: 'number' },
          summary: { type: 'string' },
          gaps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                query: { type: 'string' },
                competitor_name: { type: 'string' },
                competitor_domain: { type: 'string' },
                competitor_authority: { type: 'number' },
                is_winnable: { type: 'boolean' },
                why_they_win: { type: 'string' },
                your_move: { type: 'string' },
              }
            }
          },
        }
      }
    });

    const gaps = (result?.gaps || [])
      .filter(g => g && g.query && g.competitor_name)
      .sort((a, b) => (b.is_winnable ? 1 : 0) - (a.is_winnable ? 1 : 0))
      .slice(0, 6);

    return Response.json({
      your_authority_estimate: Math.max(0, Math.min(100, Math.round(result?.your_authority_estimate || userAuthority || 0))),
      summary: result?.summary || '',
      winnable_count: gaps.filter(g => g.is_winnable).length,
      gaps,
      analyzed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[citationGaps]', error);
    return Response.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
});