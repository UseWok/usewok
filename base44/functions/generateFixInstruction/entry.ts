import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function normalizeKey(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9àâäéèêëîïôùûüç\s]/g, '').replace(/\s+/g, '_').slice(0, 80);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const issueProblem = body.issue || body.issueProblem || '';
    const businessProfile = body.profile || body.businessProfile || {};
    const siteUrl = businessProfile.site_url || '';
    const industry = businessProfile.business_type || businessProfile.identity_industry || '';
    const businessName = businessProfile.business_name || businessProfile.identity_name || '';

    // ── Profil utilisateur ──
    // 1. body.user_profile (direct)
    // 2. businessProfile.user_preferences (JSON string passed from frontend)
    // 3. DB lookup by site_url
    let userProfile = body.user_profile || {};
    if (!userProfile.tech_level && businessProfile.user_preferences) {
      try {
        const prefs = typeof businessProfile.user_preferences === 'string'
          ? JSON.parse(businessProfile.user_preferences)
          : businessProfile.user_preferences;
        userProfile = { ...userProfile, ...prefs };
      } catch {}
    }
    if (!userProfile.tech_level && siteUrl) {
      const profile = await base44.entities.BusinessProfile.filter({ site_url: siteUrl }).catch(() => []);
      if (profile && profile.length > 0 && profile[0].user_preferences) {
        try {
          const prefs = JSON.parse(profile[0].user_preferences);
          userProfile = { ...userProfile, ...prefs };
        } catch {}
      }
    }

    const techLevel = userProfile.tech_level || 'no_code';
    const mainGoal = userProfile.main_goal || 'more_clients';
    const businessSize = userProfile.business_size || 'solo';

    // Cache key INCLUDES tech level so switching profile regenerates fresh
    const issueKey = normalizeKey(issueProblem);
    const cacheKey = `${issueKey}__${techLevel}`;

    // ── 1. Cache user (clé = issue + tech_level) ──
    const userCache = await base44.entities.UserFixCache.filter({
      user_id: user.id,
      issue_key: cacheKey,
    }).catch(() => []);

    if (userCache && userCache.length > 0) {
      const cached = userCache[0];
      let steps = [];
      try { steps = JSON.parse(cached.steps || '[]'); } catch {}
      return Response.json({
        summary: cached.summary,
        steps,
        prompt: cached.prompt || null,
        explanation: cached.explanation || null,
        time_estimate: cached.time_estimate,
        type: cached.fix_type || 'seul',
        profile_type: cached.profile_type || techLevel,
        from_cache: true,
      });
    }

    // ── 2. Cache global (FixLibrary) — clé incluant tech_level ──
    const globalCache = await base44.asServiceRole.entities.FixLibrary.filter({ issue_key: cacheKey }).catch(() => []);
    if (globalCache && globalCache.length > 0) {
      const match = globalCache[0];
      let steps = [];
      try { steps = JSON.parse(match.steps || '[]'); } catch {}

      base44.entities.UserFixCache.create({
        user_id: user.id,
        issue_key: cacheKey,
        site_url: siteUrl,
        summary: match.summary,
        steps: match.steps,
        prompt: match.prompt || null,
        explanation: match.explanation || null,
        time_estimate: match.time_estimate,
        fix_type: match.type || 'seul',
        profile_type: techLevel,
      }).catch(() => {});

      base44.asServiceRole.entities.FixLibrary.update(match.id, { use_count: (match.use_count || 1) + 1 }).catch(() => {});

      return Response.json({
        summary: match.summary,
        steps,
        prompt: match.prompt || null,
        explanation: match.explanation || null,
        time_estimate: match.time_estimate,
        type: match.type || 'seul',
        profile_type: techLevel,
        from_cache: true,
      });
    }

    // ── 3. Générer via LLM ──
    const isNoCode = techLevel === 'no_code';
    const isAiNoCode = techLevel === 'ai_nocode';
    const isDeveloper = techLevel === 'developer';

    const profileLabel = isNoCode ? '🖱️ NO-CODE' : isAiNoCode ? '🤖 IA HELPER' : '💻 DEVELOPER';

    let promptSection = '';
    let jsonFieldSpec = '';
    let requiredFields = ['summary', 'time_estimate'];

    if (isNoCode) {
      promptSection = `RÉPONDS POUR UN NO-CODE (Wix/WordPress/Squarespace — zéro code):
- summary: 1 phrase simple + 1 chiffre clé. Pourquoi ça bloque.
- steps: 2 à 3 étapes MAX. Chaque étape = un chemin de clics concret.
  Ex: "1. Dans WordPress, va dans Pages > [nom de ta page] > Modifier"
      "2. Clique sur l'onglet 'SEO' puis remplis le champ 'Meta description' avec: [texte suggéré]"
      "3. Clique sur 'Mettre à jour' en haut à droite"
  Si impossible sans dev: steps = ["⚠️ Cette correction nécessite un développeur car [raison simple, ex: il faut modifier le JSON-LD]"]
- time_estimate: "10 min" / "30 min" / "1h"
- type: "seul" ou "avec aide"`;
      jsonFieldSpec = `"steps" (array de strings)`;
      requiredFields = ['summary', 'steps', 'time_estimate'];
    } else if (isAiNoCode) {
      promptSection = `RÉPONDS POUR UN UTILISATEUR QUI UTILISE CHATGPT/CLAUDE:
- summary: 1 phrase simple. Pourquoi ça bloque.
- prompt: LE PROMPT EXACT à copier-coller dans ChatGPT ou Claude.
  Format: "Copie ceci dans ChatGPT ou Claude:\n\n[prompt sur 2-4 lignes, 100% prêt, avec placeholders en [CROCHETS]]\n\nPuis copie la réponse dans [endroit exact du site]"
  Le prompt doit générer un résultat que l'utilisateur colle DIRECTEMENT dans son site.
- time_estimate: "5 min" / "15 min" / "30 min"
- type: "seul"`;
      jsonFieldSpec = `"prompt" (string)`;
      requiredFields = ['summary', 'prompt', 'time_estimate'];
    } else {
      promptSection = `RÉPONDS POUR UN DÉVELOPPEUR:
- summary: 1 phrase + contexte du site.
- explanation: 2-3 phrases sur la solution (fichiers concernés, pourquoi c'est important pour les IA — JSON-LD? Données structurées? Trust?).
- time_estimate: "30 min" / "1-2h" / "1 jour"
- type: "seul" ou "avec aide"`;
      jsonFieldSpec = `"explanation" (string)`;
      requiredFields = ['summary', 'explanation', 'time_estimate'];
    }

    const prompt = `Tu es un expert AEO. Tu aides ${businessName} (${industry}) à corriger ce problème:

PROBLÈME: "${issueProblem}"
PROFIL: ${profileLabel}
SITE: ${siteUrl}

${promptSection}

Réponds UNIQUEMENT avec ce JSON:
{
  ${jsonFieldSpec},
  "summary": "...",
  "time_estimate": "...",
  "type": "seul" ou "avec aide"
}

Français. Simple. Clair. Actionnable. Pas de blabla.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_mini',
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          steps: { type: 'array', items: { type: 'string' } },
          prompt: { type: 'string' },
          explanation: { type: 'string' },
          time_estimate: { type: 'string' },
          type: { type: 'string' },
        },
        required: requiredFields,
      },
    });

    // ── 4. Sauvegarder ──
    const stepsJson = JSON.stringify(result.steps || []);

    await Promise.all([
      base44.entities.UserFixCache.create({
        user_id: user.id,
        issue_key: cacheKey,
        site_url: siteUrl,
        summary: result.summary || '',
        steps: stepsJson,
        prompt: result.prompt || null,
        explanation: result.explanation || null,
        time_estimate: result.time_estimate || '',
        fix_type: result.type || 'seul',
        profile_type: techLevel,
      }).catch((e) => console.error('[cache_save_user]', e)),

      base44.asServiceRole.entities.FixLibrary.create({
        issue_key: cacheKey,
        issue_text: issueProblem,
        industry,
        summary: result.summary || '',
        steps: stepsJson,
        prompt: result.prompt || null,
        explanation: result.explanation || null,
        time_estimate: result.time_estimate || '',
        type: result.type || 'seul',
        use_count: 1,
      }).catch((e) => console.error('[cache_save_library]', e)),
    ]);

    return Response.json({ ...result, profile_type: techLevel });
  } catch (error) {
    console.error('[generateFixInstruction]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});