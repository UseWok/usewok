import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // Support both old format (issueId, issueProblem, businessProfile) and new (issue, profile)
    const issueProblem = body.issue || body.issueProblem || '';
    const businessProfile = body.profile || body.businessProfile || {};

    const brandContext = businessProfile
      ? `Site: ${businessProfile.site_url || ''}, Nom: ${businessProfile.business_name || businessProfile.identity_name || ''}, Secteur: ${businessProfile.business_type || businessProfile.identity_industry || ''}`
      : '';

    const prompt = `Tu es un consultant web qui aide des propriétaires de petites entreprises à améliorer leur site. Tu parles simplement, sans jargon technique.

Contexte :
${brandContext}

Problème identifié :
"${issueProblem}"

Génère un guide pratique pour corriger ce problème. Le guide doit être compréhensible par quelqu'un qui n'a aucune connaissance technique.

Retourne un JSON avec :
- summary: une explication simple en 1-2 phrases de pourquoi c'est important à corriger (pas de jargon)
- steps: tableau de 3 à 5 étapes claires et concrètes pour corriger le problème (chaque étape = une action simple, rédigée à l'impératif, en français)
- time_estimate: le temps approximatif pour corriger ce point (ex: "5 minutes", "30 minutes avec votre développeur")
- type: "autonome" si le propriétaire peut le faire seul, "developpeur" si il faut un développeur

IMPORTANT: N'utilise jamais les mots: balise, meta, schema, JSON-LD, robots.txt, SSL, certificat, DNS, HTTP. Utilise des formulations simples comme "votre site", "votre page", "votre fiche Google", "votre hébergeur".`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_mini',
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          steps: { type: 'array', items: { type: 'string' } },
          time_estimate: { type: 'string' },
          type: { type: 'string' },
        },
        required: ['summary', 'steps', 'time_estimate'],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});