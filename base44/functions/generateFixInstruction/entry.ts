import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { issueId, issueProblem, businessProfile } = await req.json();

    const brandContext = businessProfile
      ? `Nom: ${businessProfile.identity_name || ''}, Secteur: ${businessProfile.identity_industry || ''}, Ville: ${businessProfile.identity_city || ''}, URL: ${businessProfile.site_url || ''}, Cible: ${businessProfile.identity_target || ''}`
      : '';

    const prompt = `Tu es un expert en optimisation SEO et visibilité IA pour les entreprises.

Contexte du site :
${brandContext}

Problème détecté :
"${issueProblem}"

ÉTAPE 1 — CLASSIFICATION :
Classe ce problème dans UNE seule catégorie :
- TEXTE : correction possible dans une zone de texte visible du site (titre, paragraphe, description, FAQ, mots-clés dans le texte) — le propriétaire peut le faire lui-même
- TECHNIQUE : nécessite d'aller dans le code source, l'en-tête HTML, les paramètres serveur, la configuration DNS/hébergement

Règle : si la correction peut être collée dans une zone de texte visible → TEXTE. Si elle nécessite du code ou des paramètres serveur → TECHNIQUE. En cas de doute → TECHNIQUE.

ÉTAPE 2 — GÉNÉRATION :

Si TEXTE, génère exactement :
{
  "type": "TEXTE",
  "content": "[texte final prêt à coller, adapté au ton de la marque, sans jargon technique]",
  "instruction": "[une seule phrase simple à l'impératif indiquant où coller ce texte sur le site, jamais les mots: balise, meta, schema, code]"
}

Si TECHNIQUE, génère exactement :
{
  "type": "TECHNIQUE",
  "content": "[message complet rédigé à la 3ème personne pour un webmaster/développeur, commence par 'Bonjour,' et inclut le code exact si nécessaire et se termine par une estimation du temps ex: 'Cela prend environ X minutes.']",
  "instruction": "Copiez ce message et envoyez-le à la personne qui gère votre site."
}

Réponds UNIQUEMENT avec le JSON valide, rien d'autre.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_mini',
      response_json_schema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['TEXTE', 'TECHNIQUE'] },
          content: { type: 'string' },
          instruction: { type: 'string' },
        },
        required: ['type', 'content', 'instruction'],
      },
    });

    // Save result to BusinessProfile issues cache
    const profiles = await base44.asServiceRole.entities.BusinessProfile.filter({ created_by_id: user.id });
    if (profiles.length > 0) {
      const p = profiles[0];
      let extra = {};
      try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
      const fixCache = extra.fix_cache || {};
      fixCache[issueId] = result;
      extra.fix_cache = fixCache;
      await base44.asServiceRole.entities.BusinessProfile.update(p.id, {
        brand_keywords: JSON.stringify(extra),
      });
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});