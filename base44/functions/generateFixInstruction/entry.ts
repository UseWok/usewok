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

    const issueKey = normalizeKey(issueProblem);

    // ── Profil utilisateur (niveau technique, objectif, taille) ──
    // Peut venir de body.user_profile OU de BusinessProfile.user_preferences (JSON)
    let userProfile = body.user_profile || {};
    
    // Si pas passé en body, essayer de charger depuis BusinessProfile
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

    // ── 1. Cache cloud par user+issue_key (ne jamais régénérer si déjà fait) ──
    const userCache = await base44.entities.UserFixCache.filter({
      user_id: user.id,
      issue_key: issueKey,
    }).catch(() => []);

    if (userCache && userCache.length > 0) {
      const cached = userCache[0];
      let steps = [];
      try { steps = JSON.parse(cached.steps || '[]'); } catch {}
      console.log(`[cache_hit] user=${user.id} key=${issueKey}`);
      return Response.json({
        summary: cached.summary,
        steps,
        time_estimate: cached.time_estimate,
        type: cached.fix_type || 'autonome',
        from_cache: true,
      });
    }

    // ── 2. Cache global (FixLibrary) — même clé, n'importe quel utilisateur ──
    const globalCache = await base44.asServiceRole.entities.FixLibrary.filter({ issue_key: issueKey }).catch(() => []);
    if (globalCache && globalCache.length > 0) {
      const match = globalCache[0];
      let steps = [];
      try { steps = JSON.parse(match.steps || '[]'); } catch {}

      // Sauvegarder dans le cache user pour la prochaine fois
      base44.entities.UserFixCache.create({
        user_id: user.id,
        issue_key: issueKey,
        site_url: siteUrl,
        summary: match.summary,
        steps: match.steps,
        time_estimate: match.time_estimate,
        fix_type: match.type || 'autonome',
      }).catch(() => {});

      base44.asServiceRole.entities.FixLibrary.update(match.id, { use_count: (match.use_count || 1) + 1 }).catch(() => {});

      return Response.json({ summary: match.summary, steps, time_estimate: match.time_estimate, type: match.type || 'autonome', from_cache: true });
    }

    // ── 3. Générer via LLM (uniquement si aucun cache) ──
    // Crawl data passed from the scan result (anchors fix steps to real page structure)
    const crawlData = body.crawl_data || {};
    const crawlContext = Object.keys(crawlData).length > 0
      ? `\nDONNÉES RÉELLES DU CRAWL (à utiliser pour nommer les pages et éléments exacts) :\n${JSON.stringify(crawlData, null, 2)}`
      : '';

    const brandContext = `Site web: ${siteUrl}, Entreprise: ${businessName}, Secteur: ${industry}`;

    const techContextMap = {
      no_code: `PROFIL NO-CODE: L'utilisateur NE CODE PAS (Wix, Squarespace, WordPress standard). 
🎯 RÈGLES STRICTES:
- ZÉRO code, zéro HTML, zéro JSON, zéro terminal
- UNIQUEMENT: "Allez dans Paramètres > [section] > [bouton]"
- Chaque étape = 1 chemin interface clair + 1 screenshot/tutoriel officiel URL si dispo
- Parle comme un ami : "clique ici, puis cherche... appuie sur"
- Si c'est impossible sans code → "Contactez un développeur pour [raison précise]"
- 3-5 étapes MAXIMUM, 2 phrases par étape`,

      ai_nocode: `PROFIL AI-HELPER: L'utilisateur utilise ChatGPT/Claude/Make.com pour l'aider.
🎯 RÈGLES STRICTES:
- CHAQUE étape technique = 1 PROMPT PRÊT À COPIER entre guillemets
- Format: "Copie ceci dans ChatGPT:\n[PROMPT EXACT ENTRE GUILLEMETS]"
- Placeholders en [CROCHETS]: [SECTEUR], [NOM_SERVICE], [URL], [EMAIL]
- Le prompt doit générer un résultat à copier-coller DIRECT dans le site/email/etc
- Pas de "sois créatif" — demande output exact (texte 160 chars, JSON, HTML, etc)
- 4-6 étapes: d'abord extraire/générer content, puis l'insérer dans le site
- Dernière étape = re-scan UseWok pour valider`,

      developer: `PROFIL DEVELOPER: Code, terminal, architecture, performances.
🎯 RÈGLES STRICTES:
- DIRECT ET PRÉCIS: nomme les fichiers exactes, chemins, attributs, endpoints
- Code prêt à copier-coller: JS, JSON-LD, CLI commands, config serveur
- Explique POURQUOI c'est critique pour les IA (e-e-a-t, depth, structure)
- Si JSON-LD: pré-remplis avec les vraies données du site (baseURL, name, etc)
- Si architecture: montre la structure avant/après et l'impact sur le crawl
- 3-5 étapes techniques: dépannage → correction → validation
- Dernière étape = re-scan UseWok pour mesurer le gain LRS`,
    };

    const goalContextMap = {
      more_clients: 'Priorité : maximiser les recommandations IA pour attirer plus de clients.',
      local_visibility: 'Priorité : apparaître dans les recherches locales et géographiques IA.',
      brand_authority: 'Priorité : être perçu comme expert référent du secteur par les IA.',
      competitor_beat: 'Priorité : dépasser les concurrents dans les recommandations IA.',
    };

    const techInstruction = techContextMap[techLevel] || techContextMap.no_code;
    const goalInstruction = goalContextMap[mainGoal] || goalContextMap.more_clients;

    // Detect issue type to adapt the response strategy
    const issueText = issueProblem.toLowerCase();
    const isCitationIssue = /citation|source|fiable|référence|lien externe|autorité|e-e-a-t/i.test(issueProblem);
    const isArchitectureIssue = /profondeur|clic|navigation|menu|architecture|lien interne|maillage|arborescence/i.test(issueProblem);

    const citationInstruction = isCitationIssue ? `
CONTEXTE SPÉCIAL — Citations de sources :
UseWok peut faire de la recherche IA pour trouver les meilleures sources dans le secteur "${industry}".
Dans tes étapes, inclure :
1. Une liste de 3-5 types de sources fiables spécifiques au secteur (ex: études INSEE, rapports ADEME, publications INPI...) avec le format exact pour les citer
2. Un exemple de phrase d'insertion prête à copier avec placeholder : "Selon [Source], [fait clé]..."
3. L'instruction pour trouver ces sources (requête Google Scholar, PubMed, etc. selon le secteur)
Précise que UseWok génère les suggestions de sources mais que l'utilisateur doit insérer le lien manuellement dans son CMS.
` : '';

    const architectureInstruction = isArchitectureIssue ? `
CONTEXTE SPÉCIAL — Architecture / profondeur de clic :
UseWok peut DIAGNOSTIQUER mais pas restructurer le site automatiquement. C'est une décision d'architecture.
Dans tes étapes :
1. Explique le diagnostic concret trouvé (ex: "votre page [X] est à N clics de la page d'accueil")
2. Donne le plan de restructuration STRATÉGIQUE : quelles pages remonter dans la navigation, quels liens internes ajouter
3. Fournis un exemple de structure de menu ou de liens internes suggérés
4. Précise clairement : "UseWok identifie le problème — la mise en œuvre se fait dans votre CMS (WordPress/Wix) par vous ou votre développeur"
Type = "avec aide" si profondeur > 2 pages concernées, sinon "seul".
` : '';

    const prompt = `Tu es un expert AEO ultra-pragmatique. ZÉRO blablabla. Mission: donner la solution EXACTE et DIRECTE.

CONTEXTE RÉEL:
- Entreprise: ${businessName} (${industry})
- Site: ${siteUrl}
- Problème: "${issueProblem}"
- Profil: ${techLevel} (${techInstruction})
${crawlContext}

RÈGLES DE GÉNÉRATION (NON-NÉGOCIABLE):

1. **NO-CODE** → Interface cliquable UNIQUEMENT
   "Allez dans Settings > Pages > [nom_page_exacte] > Edit > Add > SEO > [champ] > Entrez: [texte]"
   Si c'est impossible sans code: "Contactez un dev car ça demande [raison technique]"
   MAX 4 étapes, 1 screenshot URL par étape

2. **AI-NOCODE** → Prompts PRÊTS À COPIER-COLLER
   Chaque step: Copie CECI dans ChatGPT:
   """
   [PROMPT EXACT, 100% prêt à copier]
   Placeholders: [SECTEUR], [NOM_ENTREPRISE], [SERVICE]
   Output attendu: [format exact: 160 chars, JSON, etc]
   """
   Puis: "Copie la réponse ChatGPT dans [endroit exact du site]"

3. **DEVELOPER** → Code + Architecture
   Fichier exact, code exact, commande exacte
   Pré-remplit JSON-LD avec vraies données du site
   Explique l'impact sur les crawlers IA
   MAX 5 étapes, dernière = validation

STRUCTURE JSON:
{
  "summary": "Pourquoi ça bloque les clients? (1 chiffre clé + ton direct). 2 phrases max.",
  "steps": ["Étape 1 CONCRÈTE", "Étape 2 CODE/PROMPT/CLIC", ...],
  "time_estimate": "15 min" | "1 heure" | "1 jour",
  "type": "seul" | "avec aide"
}

IMPÉRATIFS:
- ZÉRO généralités
- Nomme TOUJOURS les pages réelles du site quand dispo
- Donne le TEXTE EXACT à copier (pas "écris un truc...")
- Si archive/structure: "Contactez un dev" + raison précise
- DERNIÈRE ÉTAPE = "Relancez scan UseWok pour mesurer le gain LRS"

Français, direct, concis. Go!`;

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

    // ── 4. Sauvegarder dans cache user ET bibliothèque globale (await pour garantir la persistance) ──
    const stepsJson = JSON.stringify(result.steps || []);

    await Promise.all([
      base44.entities.UserFixCache.create({
        user_id: user.id,
        issue_key: issueKey,
        site_url: siteUrl,
        summary: result.summary || '',
        steps: stepsJson,
        time_estimate: result.time_estimate || '',
        fix_type: result.type || 'seul',
      }).catch((e) => console.error('[cache_save_user]', e)),

      base44.asServiceRole.entities.FixLibrary.create({
        issue_key: issueKey,
        issue_text: issueProblem,
        industry,
        summary: result.summary || '',
        steps: stepsJson,
        time_estimate: result.time_estimate || '',
        type: result.type || 'seul',
        use_count: 1,
      }).catch((e) => console.error('[cache_save_library]', e)),
    ]);

    return Response.json(result);
  } catch (error) {
    console.error('[generateFixInstruction]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});