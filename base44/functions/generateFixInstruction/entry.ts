import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Normalise un texte de problème en clé de cache (lowercase, sans ponctuation, 60 chars max)
function normalizeKey(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9àâäéèêëîïôùûüç\s]/g, '').replace(/\s+/g, '_').slice(0, 60);
}

// Délai aléatoire pour simuler un temps de génération (1.5s à 4s)
function randomDelay() {
  return new Promise(r => setTimeout(r, 1500 + Math.random() * 2500));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const issueProblem = body.issue || body.issueProblem || '';
    const businessProfile = body.profile || body.businessProfile || {};
    const industry = businessProfile.business_type || businessProfile.identity_industry || '';

    const issueKey = normalizeKey(issueProblem);

    // ── 1. Chercher dans la bibliothèque (match exact ou même secteur) ──
    const existing = await base44.asServiceRole.entities.FixLibrary.filter({ issue_key: issueKey });
    if (existing && existing.length > 0) {
      const match = existing[0];
      // Incrémenter le compteur d'usage en arrière-plan
      base44.asServiceRole.entities.FixLibrary.update(match.id, { use_count: (match.use_count || 1) + 1 }).catch(() => {});
      // Délai pour ne pas éveiller les soupçons
      await randomDelay();
      let steps = [];
      try { steps = JSON.parse(match.steps || '[]'); } catch {}
      return Response.json({
        summary: match.summary,
        steps,
        time_estimate: match.time_estimate,
        type: match.type || 'autonome',
      });
    }

    // ── 2. Générer via LLM ──
    const brandContext = businessProfile
      ? `Site: ${businessProfile.site_url || ''}, Nom: ${businessProfile.business_name || businessProfile.identity_name || ''}, Secteur: ${industry}`
      : '';

    const prompt = `Tu es un consultant web qui aide des propriétaires de petites entreprises à améliorer leur visibilité sur les moteurs IA. Tu parles simplement, sans jargon technique. Réponds UNIQUEMENT en français.

Contexte :
${brandContext}

Problème identifié :
"${issueProblem}"

Génère un guide pratique pour corriger ce problème. Le guide doit être compréhensible par quelqu'un sans connaissance technique.

Retourne un JSON avec :
- summary: une explication simple en 1-2 phrases de pourquoi c'est important à corriger (pas de jargon, en français)
- steps: tableau de 3 à 5 étapes claires et concrètes pour corriger le problème (chaque étape = une action simple, rédigée à l'impératif, en français)
- time_estimate: le temps approximatif pour corriger ce point (ex: "5 minutes", "30 minutes avec votre développeur")
- type: "autonome" si le propriétaire peut le faire seul, "developpeur" si il faut un développeur

IMPORTANT: N'utilise jamais les mots: balise, meta, schema, JSON-LD, robots.txt, SSL, certificat, DNS, HTTP. Utilise des formulations simples comme "votre site", "votre page", "votre fiche Google", "votre hébergeur". Toujours en français.`;

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

    // ── 3. Sauvegarder dans la bibliothèque en arrière-plan ──
    base44.asServiceRole.entities.FixLibrary.create({
      issue_key: issueKey,
      issue_text: issueProblem,
      industry,
      summary: result.summary || '',
      steps: JSON.stringify(result.steps || []),
      time_estimate: result.time_estimate || '',
      type: result.type || 'autonome',
      use_count: 1,
    }).catch(() => {});

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});