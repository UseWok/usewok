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
      prompt: `Tu es un expert en GEO (Generative Engine Optimization) et en stratégie de marque.
Analyse le site web "${brandLabel}" (${cleanUrl}) en utilisant le contexte internet.

Génère un "Brand Knowledge" structuré. Règles :
- Sois PRÉCIS et CONCRET. Ne génère que des informations réellement pertinentes pour cette marque.
- Si tu ne peux pas déterminer une valeur avec certitude, laisse-la VIDE ("").
- Les tableaux doivent contenir 3 à 8 éléments spécifiques à cette marque (pas de générique).
- Réponds en français.

Retourne un JSON avec exactement ces champs :
{
  "business_name": "Nom officiel de la marque",
  "industry": "Secteur d'activité précis (ex: SaaS / SEO, E-commerce mode, etc.)",
  "headquarters": "Ville, Pays du siège",
  "audience": "Description des personas/clients cibles en 1-2 phrases",
  "business_model": "B2B | B2C | B2B2C | Marketplace",
  "target_segment": "Taille de marché ou segment (ex: PME, ETI, Grand public, etc.)",
  "value_description": "Proposition de valeur en 2-3 phrases — ce qui rend cette marque unique",
  "value_keywords": ["différenciateur clé 1", "différenciateur 2", ...],
  "use_cases": ["cas d'usage concret 1", "cas d'usage 2", ...],
  "authority_topics": ["sujet d'autorité 1", "sujet 2", ...],
  "pre_purchase_questions": ["question que se posent les prospects avant achat 1", ...],
  "objections": ["objection courante 1", ...],
  "avoid_topics": ["sujet/association à éviter 1", ...],
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

    return Response.json({ knowledge: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});