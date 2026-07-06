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
      prompt: `Tu analyses le site web "${brandLabel}" (${cleanUrl}) via le contexte internet, pour une personne qui n'y connaît RIEN en marketing.

Génère un "Brand Knowledge" simple et concret. Règles STRICTES :
- Langage SIMPLE et grand public. INTERDIT : jargon marketing (persona, proposition de valeur, sales play, GEO, autorité, notoriété…). Écris comme si tu expliquais à un ami.
- Chaque tableau contient EXACTEMENT 3 à 5 éléments (jamais plus de 5), spécifiques à cette marque, pas de générique.
- Chaque pastille de tableau = 2 à 5 mots MAX, court et clair.
- Si une info est incertaine, laisse VIDE ("").
- Réponds en français.

Retourne un JSON avec exactement ces champs :
{
  "business_name": "Nom de l'entreprise",
  "industry": "Ce qu'elle fait, en mots simples (ex: logiciel marketing, boutique de vêtements)",
  "headquarters": "Ville, Pays",
  "audience": "Ses clients types, en 1 phrase simple",
  "business_model": "B2B | B2C | B2B2C | Marketplace",
  "target_segment": "Type de clients en mots simples (ex: petites entreprises, particuliers)",
  "value_description": "En 1-2 phrases simples, ce qu'elle fait de mieux que les autres",
  "value_keywords": ["point fort court 1", "point fort 2", "... 5 max"],
  "use_cases": ["situation d'usage courte 1", "... 5 max"],
  "authority_topics": ["sujet d'expertise court 1", "... 5 max"],
  "pre_purchase_questions": ["question simple d'un client 1", "... 5 max"],
  "objections": ["hésitation courante 1", "... 5 max"],
  "avoid_topics": ["sujet à éviter 1", "... 5 max"],
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