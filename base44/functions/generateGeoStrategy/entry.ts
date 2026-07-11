import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Génère un plan de visibilité IA à partir du Brand Knowledge + audit du site.
// L'utilisateur n'a plus une page blanche à remplir : l'IA propose, il ajuste.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url || '';
    const businessName = body.business_name || '';
    const brandKnowledge = body.brand_knowledge || {};
    if (!rawUrl) return Response.json({ error: 'URL required' }, { status: 400 });

    const cleanUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    const domain = (() => { try { return new URL(cleanUrl).hostname.replace(/^www\./, ''); } catch { return cleanUrl; } })();
    const brandLabel = businessName || domain;

    const bkSummary = JSON.stringify({
      industry: brandKnowledge.industry || '',
      value_description: brandKnowledge.value_description || '',
      value_keywords: brandKnowledge.value_keywords || [],
      target_segment: brandKnowledge.target_segment || '',
      use_cases: brandKnowledge.use_cases || [],
      authority_topics: brandKnowledge.authority_topics || [],
      pre_purchase_questions: brandKnowledge.pre_purchase_questions || [],
    });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Tu es un stratège en visibilité IA (GEO/AEO). Tu construis un plan de visibilité IA pour la marque "${brandLabel}" (${cleanUrl}).

Voici ce qu'on sait déjà de la marque (Brand Knowledge) :
${bkSummary}

Utilise ce contexte + le web pour proposer un plan CONCRET et spécifique à cette marque (jamais générique). Règles STRICTES :
- Langage SIMPLE, en français, comme si tu expliquais à un ami non-marketeur. INTERDIT : jargon (persona, GEO, AEO, funnel, SERP…).
- Chaque tableau contient 3 à 5 éléments MAX, courts (2 à 8 mots).
- Les questions cibles = de vraies questions qu'un client taperait à ChatGPT, spécifiques au secteur.
- Les sources d'autorité = de vrais sites/médias crédibles et pertinents pour CE secteur (pas juste "Wikipedia" par défaut).
- Les concurrents = de vrais concurrents connus de cette marque.
- OBLIGATION : remplis TOUS les champs, sans exception. Si tu n'es pas sûr, fais ta meilleure estimation — ne JAMAIS laisser un champ vide ("") ou un tableau vide ([]).

Renvoie un JSON avec exactement ces champs :
{
  "positioning_note": "En 1 phrase simple : comment la marque aimerait que les IA la décrivent",
  "target_queries": ["question client 1", "... 5 max"],
  "query_philosophy": "En 1-2 phrases simples : le ton et l'angle à donner quand les IA parlent de la marque",
  "authority_sources": ["site/média crédible 1", "... 5 max"],
  "content_pillars": ["type de contenu à créer 1", "... 5 max"],
  "priority_competitors": ["concurrent 1", "... 5 max"]
}`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          positioning_note: { type: 'string' },
          target_queries: { type: 'array', items: { type: 'string' } },
          query_philosophy: { type: 'string' },
          authority_sources: { type: 'array', items: { type: 'string' } },
          content_pillars: { type: 'array', items: { type: 'string' } },
          priority_competitors: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    const capped = { ...result };
    for (const key of ['target_queries', 'authority_sources', 'content_pillars', 'priority_competitors']) {
      if (Array.isArray(capped[key])) capped[key] = capped[key].slice(0, 5);
    }

    return Response.json({ strategy: capped });
  } catch (error) {
    console.error('generateGeoStrategy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});