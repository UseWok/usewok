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

    const profileLabel = isNoCode ? 'NO-CODE' : isAiNoCode ? 'IA HELPER' : 'DEVELOPER';

    let profileInstructions = '';
    let requiredFields = ['summary', 'time_estimate'];

    if (isNoCode || isAiNoCode) {
      const platformHint = isNoCode
        ? "L'utilisateur est sur Wix/WordPress/Squarespace. Il CLIQUE, il ne code JAMAIS. Le résultat du prompt doit etre du contenu pret a coller dans un éditeur visuel."
        : "L'utilisateur utilise ChatGPT/Claude comme assistant. Il copie-colle le prompt, puis colle la réponse dans son site.";

      profileInstructions = `
INSTRUCTIONS - GÉNÉRATION DU "prompt" (CHAMP CRITIQUE)
=======================================================
Tu génères le champ "prompt": un prompt EXPERT prêt à copier-coller dans ChatGPT ou Claude.

${platformHint}

Le prompt DOIT suivre le pattern RTCEF (Role, Task, Context, Examples, Format):

1. ROLE - Assigne un rôle expert à l'IA (ex: "Tu es un expert en SEO local et AEO pour ${industry}...")
2. TASK - Une instruction claire et unique (ex: "Génère 3 paragraphes de 40-60 mots chacun...")
3. CONTEXT - Injecte TOUTES les infos: nom du business "${businessName}", site "${siteUrl}", secteur "${industry}", problème: "${issueProblem}"
4. EXAMPLES - Si pertinent, donne 1 exemple de format attendu
5. FORMAT - Spécifie EXACTEMENT le format de sortie: HTML prêt à coller? Texte brut? JSON-LD? Nombre de mots?

RÈGLES ABSOLUES (zéro erreur, qualité luxe):
- Le prompt COMMENCE par "Copie ceci dans ChatGPT ou Claude:\\n\\n" puis le prompt lui-même
- Le prompt SE TERMINE par "\\n\\nPuis copie la réponse dans [endroit EXACT du site, ex: la section À propos de ${siteUrl}]"
- TOUS les placeholders variables sont en [CROCHETS MAJUSCULES]: [NOM_DU_BUSINESS], [VOTRE_VILLE], [NUMÉRO_TÉLÉPHONE]...
- MAIS les infos CONNUES (${businessName}, ${siteUrl}, ${industry}) sont PRÉ-REMPLIES — pas de placeholders pour ce qu'on sait déjà
- Le prompt fait 8-20 lignes — ni trop court (superficiel), ni trop long (illisible)
- Le langage est FRANÇAIS, professionnel, direct
- ZÉRO jargon technique inutile — l'utilisateur n'est pas développeur
- Le prompt doit générer un résultat que l'utilisateur colle DIRECTEMENT — pas de "voici quelques idées..."
- Si le problème concerne des données structurées/JSON-LD: le prompt demande du code JSON-LD prêt à coller
- Si le problème concerne du contenu: le prompt demande du HTML ou texte formaté prêt à coller
- Si le problème concerne Google Business: le prompt guide exactement quoi remplir et où

EXEMPLE DE STRUCTURE (adapte au problème, ne copie pas mot pour mot):

Copie ceci dans ChatGPT ou Claude:

Tu es un expert en référencement local pour les entreprises de ${industry}.
Mon entreprise s'appelle "${businessName}" et mon site est ${siteUrl}.

CONTEXTE: ${issueProblem}

TÂCHE:
1. Génère [NOMBRE] [TYPE DE CONTENU] optimisés pour que les IA (ChatGPT, Gemini) comprennent mon business
2. Chaque [TYPE] doit faire [LONGUEUR] mots
3. Inclus naturellement: ${businessName}, ${siteUrl}, et les mots-clés de mon secteur

FORMAT DE SORTIE:
- HTML prêt à coller (balises <p>, <h2>, <ul>)
- Un bloc par [TYPE], séparé par ---
- Aucun commentaire, aucune explication — juste le contenu prêt à coller

Puis copie la réponse dans [section précise de ${siteUrl}]
=======================================================
`;
      requiredFields = ['summary', 'prompt', 'time_estimate'];
    } else {
      profileInstructions = `
INSTRUCTIONS - GÉNÉRATION DU "explanation" (CHAMP CRITIQUE)
===========================================================
Tu génères le champ "explanation": une réponse technique experte pour un développeur.

L'explication DOIT contenir:
1. CAUSE - Pourquoi ce problème existe (1-2 phrases techniques)
2. IMPACT IA - Comment ça affecte les LLMs (ChatGPT, Gemini, Claude) — sois spécifique: crawling? parsing? entity recognition? trust signals?
3. SOLUTION - Les fichiers/technos concernés (ex: schema.org/LocalBusiness, robots.txt, sitemap.xml, meta tags, JSON-LD)
4. CODE OU SNIPPET - Si applicable, donne le code exact (JSON-LD, meta tag, etc.) avec ${businessName} et ${siteUrl} pré-remplis

RÈGLES:
- FRANÇAIS, ton expert mais accessible
- 150-300 mots — dense en information, zéro blabla
- Inclure ${businessName} et ${siteUrl} dans l'explication
- Si JSON-LD: donner le code complet, pas une référence
- Citer les spec standards (schema.org, W3C) si pertinent
===========================================================
`;
      requiredFields = ['summary', 'explanation', 'time_estimate'];
    }

    const devOrPromptLine = (isNoCode || isAiNoCode)
      ? '4. "prompt" - Le prompt expert RTCEF généré selon les instructions ci-dessus.'
      : "4. \"explanation\" - L'explication technique experte générée selon les instructions ci-dessus.";

    const prompt = `Tu es un Consultant AEO (AI Engine Optimization) de classe mondiale — service premium, zéro erreur, qualité luxe.

MISSION
=======
Tu crées un guide de correction SUR-MESURE pour "${businessName}", une entreprise du secteur "${industry}" dont le site est ${siteUrl}.

L'utilisateur a le profil technique: ${profileLabel}
Le problème à corriger: "${issueProblem}"

${profileInstructions}

CHAMPS OBLIGATOIRES DU JSON
===========================

1. "summary" - 1 phrase percutante + 1 chiffre clé.
   Structure: [POURQUOI CA BLOQUE] + [IMPACT CHIFFRÉ].
   Exemple: "Les IA ne trouvent pas vos coordonnées — vous perdez 40% des recherches locales 'près de moi'."
   Interdiction: "Il est important de...", "Vous devriez...", tout blabla générique.

2. "time_estimate" - Temps réaliste pour exécuter la correction.
   no_code: "10 min" / "20 min" / "30 min"
   ai_nocode: "5 min" / "15 min" / "30 min"
   developer: "30 min" / "1-2h" / "1 jour"

3. "type" - "seul" (faisable sans aide) ou "avec aide" (requiert un pro).

${devOrPromptLine}

QUALITÉ LUXE — CHECKLIST AVANT RÉPONSE
======================================
- Le prompt/explication inclut "${businessName}" et "${siteUrl}" pré-remplis
- Zéro placeholder pour les infos connues — seulement pour ce que l'utilisateur doit personnaliser
- Le résultat est COPIABLE-COLLABLE immédiatement — zéro préparation nécessaire
- Le ton est professionnel, direct, confiant — pas de "peut-être", "il faudrait peut-être"
- Français impeccable — zéro faute

Réponds UNIQUEMENT avec le JSON. Aucun texte hors JSON.`;

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