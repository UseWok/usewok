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

    const issueKey = normalizeKey(issueProblem);
    const cacheKey = `${issueKey}__${techLevel}`;

    // ── 1. Cache user ──
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

    // ── 2. Cache global (FixLibrary) ──
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
INSTRUCTIONS - GÉNÉRATION DU "prompt" (CHAMP CRITIQUE - 10X)
=============================================================
Tu génères le champ "prompt": un prompt EXPERT prêt à copier-coller dans ChatGPT ou Claude.

${platformHint}

PHILOSOPHIE: ZERO CHARGE MENTALE.
L'utilisateur copie le prompt, le colle dans ChatGPT/Claude, copie la réponse, la colle dans son site. POINT FINAL.
Il ne doit JAMAIS avoir à reflechir, choisir, remplir, deviner, ou adapter quoi que ce soit.

Le prompt DOIT suivre le pattern RTCEF (Role, Task, Context, Examples, Format):

1. ROLE - Assigne un rôle expert hyper-spécifique à l'IA (ex: "Tu es un expert en SEO local, AEO et rédaction web pour ${industry}...")
2. TASK - Une instruction claire, unique, avec un VERBE d'action fort (Génère, Écris, Crée, Produis...)
3. CONTEXT - Injecte TOUTES les infos: "${businessName}", "${siteUrl}", "${industry}", problème: "${issueProblem}"
4. EXAMPLES - Donne 1 exemple concret du format et du ton attendus
5. FORMAT - Spécifie EXACTEMENT le format de sortie: HTML, texte, JSON-LD? Nombre de mots exact?

RÈGLES ABSOLUES (ZÉRO ERREUR, QUALITÉ LUXE, EFFET WOW):

A. INTERDICTION ABSOLUE DE PLACEHOLDERS À TROUS:
   - JAMAIS de [LISTE_FEATURES], [VOS_AVANTAGES], [NOMBRE], [TYPE], [LONGUEUR]...
   - L'IA qui recevra le prompt DOIT tout inventer elle-même: le nombre, les features, les avantages, le contenu...
   - Le seul moment ou un [CROCHET] est acceptable: une info strictement personnelle que l'IA ne peut pas deviner (numéro de téléphone, adresse physique précise, horaires réels)
   - Pour TOUT le reste: laisse l'IA être créative et autonome. Elle a carte blanche.

B. AUTONOMIE TOTALE DE L'IA:
   - Ne dis pas "Génère [NOMBRE] paragraphes" → dis "Génère 3 paragraphes"
   - Ne dis pas "Inclus [VOS_AVANTAGES]" → dis "Inclus 4 avantages concurrentiels pertinents pour ce secteur"
   - Ne dis pas "Ajoute [LISTE_FEATURES]" → dis "Ajoute une liste de 5 fonctionnalités clés que toute entreprise de ${industry} devrait mettre en avant"
   - L'IA doit pouvoir produire un résultat COMPLET sans aucune intervention humaine.

C. FORMAT DE SORTIE IMPLACABLE:
   - Le résultat généré par l'IA doit être 100% COPABLE-COLLABLE dans le site
   - HTML prêt à coller (balises <p>, <h2>, <h3>, <ul>, <li>) OU texte formaté selon le besoin
   - ZÉRO commentaire, zéro "Voici le contenu demandé:", zéro explication
   - Juste le contenu final, propre, nickel.

D. EFFET WOW:
   - Le prompt doit demander un contenu de niveau premium — pas du remplissage générique
   - Inclus des consignes de ton: "professionnel mais chaleureux", "expert mais accessible", etc.
   - Demande des chiffres, des bénéfices concrets, des mots déclencheurs d'action
   - Le résultat doit impressionner l'utilisateur quand il le lit

E. STRUCTURE OBLIGATOIRE DU "prompt":
   - Commence par "Copie ceci dans ChatGPT ou Claude:\\n\\n"
   - Puis le prompt complet (8-25 lignes selon la complexité)
   - Termine par "\\n\\nPuis colle la réponse dans [endroit EXACT, ex: la section Services de ${siteUrl}]"

F. INFOS PRÉ-REMPLIES (JAMAIS de placeholder):
   - "${businessName}" → toujours pré-rempli dans le prompt
   - "${siteUrl}" → toujours pré-rempli dans le prompt
   - "${industry}" → toujours pré-rempli dans le prompt
   - "${issueProblem}" → toujours pré-rempli comme contexte
   - Seuls [NUMÉRO_TÉLÉPHONE], [ADRESSE_POSTALE], [HORAIRES] sont acceptés comme placeholders (infos strictement privées)

G. QUALITÉ MAXIMALE DU CONTENU GÉNÉRÉ:
   - Le prompt doit demander des quantités PRÉCISES: "5 paragraphes", "3 bénéfices", "4 services" — jamais "plusieurs" ou "quelques"
   - Le prompt doit demander un CTA (Call-to-Action) à la fin: "Contactez-nous", "Découvrir", "Réserver"
   - Le prompt doit demander un vocabulaire adapté au secteur ${industry}: mots-clés métier, termes techniques pertinents
   - Le prompt doit demander des bénéfices CHIFFRÉS quand possible: "économisez 2h par semaine", "30% de clients en plus"
   - Le prompt doit demander une structure visuelle claire: titres, sous-titres, listes à puces

EXEMPLE CONCRET DE BON "prompt" (adapte au problème, ne copie pas):

Copie ceci dans ChatGPT ou Claude:

Tu es un expert en SEO local, AEO et rédaction web pour les entreprises de ${industry}.
Mon entreprise s'appelle "${businessName}" et mon site est ${siteUrl}.

CONTEXTE: ${issueProblem}

TÂCHE:
Génère 3 paragraphes de présentation de mon entreprise (50-70 mots chacun) optimisés pour que les IA comme ChatGPT et Gemini comprennent et recommandent "${businessName}".

Chaque paragraphe doit:
- Commencer par un angle différent (qui nous sommes / ce qu'on fait / pourquoi nous choisir)
- Inclure naturellement "${businessName}" et "${siteUrl}"
- Contenir 2-3 mots-clés du secteur ${industry}
- Se terminer par un bénéfice client concret (chiffré si possible)

TON: Professionnel, chaleureux, confiant. Pas de jargon. Pas de superlatifs creux.

FORMAT DE SORTIE:
- HTML prêt à coller (balises <p>)
- Un paragraphe par balise <p>
- Zéro commentaire, zéro explication — juste les 3 paragraphes

Puis colle la réponse dans la section "À propos" de ${siteUrl}

FIN DE L'EXEMPLE.
=============================================================
`;
      requiredFields = ['summary', 'prompt', 'time_estimate'];
    } else {
      profileInstructions = `
INSTRUCTIONS - GÉNÉRATION DU "explanation" (CHAMP CRITIQUE - 10X)
==================================================================
Tu génères le champ "explanation": une réponse technique experte pour un développeur.

PHILOSOPHIE: ZERO CHARGE MENTALE, EFFET WOW.
Le développeur lit l'explication, copie le code, le colle, et ça marche. POINT FINAL.
Il ne doit JAMAIS chercher sur Google, ouvrir une doc, ou deviner quoi que ce soit.

L'explication DOIT contenir ces 6 sections OBLIGATOIRES:

1. CAUSE RACINE (2-3 phrases)
   - Pourquoi ce problème existe techniquement
   - Référence précise à la spec/RFC/doc (ex: "schema.org/LocalBusiness requiert...", "Google AEO guidelines stipulent...")
   - Sois hyper-spécifique, pas générique

2. IMPACT IA DÉTAILLÉ (2-3 phrases)
   - Comment ça affecte CHAQUE LLM:
     * ChatGPT: entity recognition, knowledge graph parsing
     * Gemini: real-time web crawling, structured data extraction
     * Claude: context window parsing, trust signal evaluation
     * Perplexity: citation sourcing, fact verification
   - Dis exactement ce que l'IA ne peut pas faire à cause de ce problème

3. SOLUTION ÉTAPE PAR ÉTAPE
   - Les fichiers EXACTS à modifier (ex: "Dans le <head> de index.html...", "Dans le fichier robots.txt à la racine...")
   - Les lignes/balises concernées
   - L'ordre des opérations
   - Si backend: les endpoints/APIs concernés

4. CODE COMPLET PRÊT À COLLER
   - Le code EXACT avec "${businessName}" et "${siteUrl}" pré-remplis
   - Pas de "adaptez ce template" — le code final, validé, prêt à coller
   - Si JSON-LD: le bloc <script type="application/ld+json"> COMPLET avec toutes les propriétés requises
   - Si meta tag: la balise complète avec content pré-rempli
   - Si robots.txt/sitemap.xml: le contenu complet du fichier
   - Indente proprement, commente les sections clés

5. VÉRIFICATION (1-2 phrases)
   - Comment vérifier que ça marche:
     * URL de test (ex: "search.google.com/test/rich-results")
     * Commande curl ou DevTools (ex: "curl -s ${siteUrl} | grep 'application/ld+json'")
     * Ce que tu dois voir si c'est valide

6. PIÈGES COURANTS (1-2 phrases)
   - Les erreurs fréquentes avec cette correction
   - Comment les éviter
   - Cas particuliers (ex: "Si votre site est en SPA, le JSON-LD doit être dans le HTML initial, pas injecté en JS")

RÈGLES ABSOLUES:
- FRANÇAIS, ton expert mais accessible — pas condescendant
- 300-600 mots — DENSE en information, zéro blabla, zéro remplissage
- Inclure "${businessName}" et "${siteUrl}" dans l'explication ET le code
- Si JSON-LD: donner le code COMPLET et VALIDÉ — pas une référence, pas un squelette
- Citer les spec standards (schema.org, W3C, Google Search Central) avec liens si pertinent
- ZÉRO placeholder à trous — tout est concret et pré-rempli
- Le code doit être copiable-collable directement (pas de "voici le template", juste le code)
- EFFET WOW: le développeur doit se dire "wow, c'est exactement ce qu'il me fallait"
==================================================================
`;
      requiredFields = ['summary', 'explanation', 'time_estimate'];
    }

    const devOrPromptLine = (isNoCode || isAiNoCode)
      ? '4. "prompt" - Le prompt expert RTCEF généré selon les instructions ci-dessus.'
      : "4. \"explanation\" - L'explication technique experte générée selon les instructions ci-dessus.";

    const prompt = `Tu es un Consultant AEO (AI Engine Optimization) de classe mondiale — service premium, zéro erreur, qualité luxe, effet wow.

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
=====================================
- Le prompt/explication inclut "${businessName}" et "${siteUrl}" pré-remplis
- ZÉRO placeholder à trous du type [LISTE_FEATURES], [NOMBRE], [TYPE], [VOS_AVANTAGES]
- Les seuls [CROCHETS] acceptés: infos strictement privées (téléphone, adresse, horaires)
- L'IA a une AUTONOMIE TOTALE pour inventer le contenu, le nombre, les angles
- Le résultat est COPIABLE-COLLABLE immédiatement — zéro préparation, zéro charge mentale
- Le ton est professionnel, direct, confiant — pas de "peut-être", "il faudrait peut-être"
- Français impeccable — zéro faute
- EFFET WOW: le résultat doit impressionner l'utilisateur par sa qualité et sa pertinence

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