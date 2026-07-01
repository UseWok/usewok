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

PHILOSOPHIE: ZERO CHARGE MENTALE, RÉSULTAT IMMÉDIAT.
L'utilisateur copie le prompt, le colle dans ChatGPT/Claude, copie la réponse, la colle dans son site. POINT FINAL.
L'IA qui reçoit le prompt doit produire un RÉSULTAT PARFAIT du premier coup. Pas d'itération, pas d'ajustement.

LE PROMPT QUE TU GÉNÈRES DOIT ÊTRE STRUCTURÉ COMME UN BRIEF PROFESSIONNEL:

═══════════════════════════════════════════════════
STRUCTURE OBLIGATOIRE DU PROMPT GÉNÉRÉ (CHAQUE SECTION EST CRITIQUE)
═══════════════════════════════════════════════════

Le prompt que tu génères DOIT contenir ces blocs DANS CET ORDRE:

1. ROLE (1 ligne)
   Tu es un expert en [domaine précis lié au problème], spécialiste [sous-spécialité] pour [plateformes: Wix, WordPress, Squarespace si no_code].
   → Assigne un rôle HYPER-spécifique, pas générique.

2. CONTEXTE (2-3 lignes)
   Mon entreprise s'appelle "${businessName}" et l'URL est ${siteUrl}.
   CONTEXTE: [problème précis: "${issueProblem}"]
   → Pré-rempli avec "${businessName}", "${siteUrl}", "${industry}".

3. TÂCHE (3-5 lignes)
   Génère en sortie [NOMBRE] sections strictes et directement copiable-collable:
   1) [section 1 avec description exacte]
   2) [section 2 avec description exacte]
   3) [section 3 avec description exacte] (si applicable)
   → Décompose la tâche en sections NUMÉROTÉES avec des livrables clairs.

4. EXEMPLE DU FORMAT ET DU TON (2-4 lignes)
   - Exemple [format]: [montre un mini-exemple du format attendu]
   - Ton: professionnel mais chaleureux, expert mais accessible, direct, sans jargon.
   → Donne un exemple CONCRET du format, pas une description vague.

5. CONTRAINTES PRÉCISES (5-8 lignes avec puces)
   - ZÉRO commentaire hors des sections demandées.
   - [Contrainte de quantité exacte: "exactly 3 points", "exactly 4 étapes", "5-8 lignes"]
   - [Contrainte de format: "texte pur", "HTML avec balises <h2>, <p>, <ul>"]
   - [Contrainte de contenu: "inclure au moins un bénéfice chiffré"]
   - ZÉRO placeholders. Inclure "${businessName}" et "${siteUrl}" textuellement.
   → Chaque contrainte est une puce avec un exigence MESURABLE et VÉRIFIABLE.

6. FORMAT DE SORTIE FINAL (2-3 lignes)
   - D'abord [section 1] puis [section 2] puis [section 3]. Tout doit être copiable-collable tel quel.
   Puis colle la réponse dans [endroit EXACT sur le site: "la section Services de ${siteUrl}"]
   → Spécifie l'ORDRE exact des sections et où coller le résultat.

═══════════════════════════════════════════════════

RÈGLES ABSOLUES POUR CHAQUE PROMPT GÉNÉRÉ:

A. QUANTITÉS EXACTES — JAMAIS VAGUE:
   - JAMAIS "plusieurs", "quelques", "plusieurs paragraphes" → TOUJOURS "3 paragraphes", "5 bénéfices", "4 étapes"
   - JAMAIS "inclus vos avantages" → TOUJOURS "inclus 4 avantages concurrentiels pour le secteur ${industry}"
   - Chaque contrainte doit être chiffrée et vérifiable.

B. SECTIONS NUMÉROTÉES — STRUCTURE PRO:
   - Si la tâche produit plusieurs livrables (ex: texte + guide + explication), divise en sections 1), 2), 3)
   - Chaque section a un but clair et un format de sortie précis.
   - L'IA sait EXACTEMENT quoi produire dans chaque section.

C. CONTRAINTES PRÉCISES — SECTION DÉDIÉE:
   - Le prompt DOIT contenir une section "CONTRAINTES PRÉCISES" avec des puces
   - Chaque puce est une règle mesurable: nombre exact, format exact, contenu obligatoire
   - Pas de "sois créatif" — des instructions concrètes et vérifiables.

D. FORMAT DE SORTIE EXPLICITE:
   - Spécifie EXACTEMENT: HTML? Texte brut? JSON? Combien de lignes? Combien de mots?
   - "HTML prêt à coller (balises <h2>, <p>, <ul>, <li>)"
   - "Texte brut, 5-8 lignes, pas de balises"
   - L'IA ne doit JAMAIS deviner le format.

E. ZÉRO COMMENTAIRE HORS LIVRABLES:
   - Le prompt doit exiger: "ZÉRO commentaire hors des sections demandées"
   - Pas de "Voici le contenu demandé:", pas d'explication, pas d'introduction
   - Juste le livrable, propre, nickel.

F. EFFET WOW — CONTENU PREMIUM:
   - Demande un CTA à la fin: "Contactez-nous", "Découvrir", "Réserver"
   - Demande des bénéfices CHIFFRÉS: "+30% d'indexation", "économisez 2h/semaine"
   - Demande un vocabulaire adapté au secteur ${industry}
   - Demande une structure visuelle: titres, sous-titres, listes à puces
   - Le résultat doit impressionner l'utilisateur.

G. INFOS PRÉ-REMPLIES — JAMAIS DE PLACEHOLDER À TROUS:
   - "${businessName}" → toujours pré-rempli textuellement
   - "${siteUrl}" → toujours pré-rempli textuellement
   - "${industry}" → toujours pré-rempli comme contexte
   - "${issueProblem}" → toujours pré-rempli comme contexte
   - Seuls [NUMÉRO_TÉLÉPHONE], [ADRESSE_POSTALE], [HORAIRES] sont acceptés (infos privées)

H. STRUCTURE DU CHAMP "prompt":
   - Commence TOUJOURS par: "Copie ceci dans ChatGPT ou Claude:\\n\\n"
   - Puis le prompt complet structuré (15-40 lignes selon la complexité)
   - Termine TOUJOURS par: "\\n\\nPuis colle la réponse dans [endroit EXACT] de ${siteUrl}"

═══════════════════════════════════════════════════
EXEMPLE DE BON PROMPT GÉNÉRÉ (adapte au problème, ne copie pas):
═══════════════════════════════════════════════════

Copie ceci dans ChatGPT ou Claude:

Tu es un expert en Optimisation de visibilité IA (AEO), spécialiste robots.txt et workflows no-code pour Wix, WordPress et Squarespace. Mon site s'appelle "${businessName}" et l'URL est ${siteUrl}.

CONTEXTE: ${issueProblem}

TÂCHE: Génère en sortie 3 sections strictes et directement copiable-collable:
1) Un bloc "robots.txt" en texte brut prêt à remplacer l'actuel. Doit autoriser toutes les IA, pointer vers le sitemap, protéger uniquement /wp-admin/ et /private/. Inclure Sitemap: ${siteUrl}/sitemap.xml. Pas de commentaires.
2) Une section HTML (balises <h2>, <p>, <ul>) expliquant en 3 points clairs ce qui change et pourquoi ça améliore l'indexation IA (bénéfices chiffrés).
3) Trois mini-guides pas-à-pas (HTML) — un pour Wix, un pour WordPress, un pour Squarespace — chacun avec 4 étapes: cliquer, coller, sauvegarder, vérifier.

EXEMPLE du format et du ton:
- Exemple robots.txt (texte brut): User-agent: * / Allow: / / Disallow: /private/ / Sitemap: ${siteUrl}/sitemap.xml
- Ton: professionnel mais chaleureux, expert mais accessible, direct, sans jargon.

CONTRAINTES PRÉCISES:
- ZÉRO commentaire hors des 3 sections demandées.
- robots.txt: texte pur, 5-8 lignes exactement.
- Explication: exactement 3 points (<li>), au moins un bénéfice chiffré (+30% d'indexation en 4 semaines).
- Chaque guide: exactement 4 étapes en <ol> avec menus en gras (Tableau de bord > Paramètres > SEO).
- Terminer par un CTA HTML avec lien vers ${siteUrl}/contact.
- ZÉRO placeholders. Inclure "${businessName}" et "${siteUrl}" textuellement.

FORMAT DE SORTIE FINAL:
- D'abord robots.txt en texte brut, puis HTML "Explications", puis HTML "Guides". Tout copiable-collable tel quel.

Puis colle la réponse dans la zone 'Fichier robots.txt personnalisé' (Paramètres > SEO > Robots.txt) de ${siteUrl}

═══════════════════════════════════════════════════
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