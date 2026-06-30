import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { issue, taskTitle, fixData, businessProfile } = body;

    const siteUrl = businessProfile?.site_url || '';
    const businessName = businessProfile?.identity_name || '';
    const industry = businessProfile?.identity_industry || '';
    const city = businessProfile?.identity_city || '';
    const target = businessProfile?.identity_target || '';
    const brandKeywords = businessProfile?.brand_keywords || '';
    const products = businessProfile?.products || '';

    const fixSummary = fixData?.summary || '';
    const fixSteps = fixData?.steps || [];
    const fixPrompt = fixData?.prompt || '';
    const fixExplanation = fixData?.explanation || '';

    const taskLabel = taskTitle || issue || '';

    const prompt = `Tu es un expert AEO (AI Engine Optimization) qui vérifie si une correction a été appliquée avec succès sur un site web en direct.

IDENTITÉ COMPLÈTE DU BUSINESS:
- Nom: "${businessName}"
- Site web: ${siteUrl}
- Secteur: ${industry}
- Ville: ${city}
- Audience cible: ${target}
- Mots-clés de marque: ${brandKeywords}
- Produits/services: ${products}

TÂCHE À VÉRIFIER:
${taskLabel}

${issue && issue !== taskLabel ? `Problème initial identifié: ${issue}` : ''}

CE QUI DEVRAIT ÊTRE FAIT:
${fixSummary}

${fixSteps && fixSteps.length > 0 ? `Étapes attendues:\n${fixSteps.map((s, i) => `${i+1}. ${typeof s === 'string' ? s : s.description || s.text || ''}`).join('\n')}` : ''}

${fixPrompt ? `Prompt utilisé pour générer le contenu:\n${fixPrompt}` : ''}

${fixExplanation ? `Explication technique:\n${fixExplanation}` : ''}

MISSION:
1. Va sur le site ${siteUrl} et analyse son contenu actuel (pages, texte, structure HTML, données structurées)
2. Vérifie si la correction décrite ci-dessus a été appliquée sur le site
3. Cherche spécifiquement les éléments que la correction devrait avoir produit:
   - Texte généré (paragraphes, descriptions, titres)
   - Structure HTML (balises sémantiques, sections)
   - Données structurées (JSON-LD, schema.org)
   - Meta tags
   - Contenu de la page correspondant au business "${businessName}"
4. Sois RIGOUREUX: ne valide QUE si tu trouves réellement la correction sur le site live

RÉPONSE JSON OBLIGATOIRE:
{
  "verified": true/false,
  "confidence": 0-100,
  "what_was_found": "Ce que tu as réellement trouvé sur le site (sois précis: quelle page, quel contenu, quelle balise)",
  "what_is_missing": "Ce qui manque encore (laisse vide si tout est validé)",
  "feedback": "Message direct et chaleureux à l'utilisateur. Si validé: félicitations + impact business. Si non validé: encouragement précis sur ce qu'il reste à faire."
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          verified: { type: 'boolean' },
          confidence: { type: 'number' },
          what_was_found: { type: 'string' },
          what_is_missing: { type: 'string' },
          feedback: { type: 'string' },
        },
        required: ['verified', 'confidence', 'what_was_found', 'feedback'],
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('[verifyFix]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});