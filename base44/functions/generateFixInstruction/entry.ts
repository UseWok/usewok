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
    const userProfile = body.user_profile || {};
    const techLevel = userProfile.tech_level || 'no_code'; // no_code | ai_nocode | claude_code | developer
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
      no_code: `L'utilisateur gère son site seul (Wix, Squarespace, WordPress sans code). Donne des chemins d'interface cliquables précis. Zéro code, zéro jargon.`,
      ai_nocode: `L'utilisateur utilise ChatGPT ou Claude pour l'aider. Pour chaque étape technique, inclure un prompt prêt à copier-coller entre guillemets, ex: "Demande à ChatGPT : Écris-moi un texte de description pour mon site qui présente [X]..."`,
      claude_code: `L'utilisateur code avec Claude Code ou Cursor. Donne des prompts Claude Code directs et précis entre backticks pour les étapes techniques.`,
      developer: `L'utilisateur est développeur. Sois précis : nomme les fichiers, balises, attributs JSON-LD, configs serveur. Donne le code exact quand pertinent.`,
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

    const prompt = `Tu es un expert senior en AEO (Answer Engine Optimization) et visibilité IA. Ta mission : donner des instructions ULTRA-CONCRÈTES basées sur les données réelles du site.

RÈGLE ABSOLUE DE RÉALISME :
- Ne jamais inventer des données que tu n'as pas. Si le crawl dit que la meta description est absente, dis-le. Si elle est présente, dis-le.
- Nomme TOUJOURS les pages exactes (ex: "/", "/a-propos", "/contact") quand disponibles dans les données du crawl.
- Pour tout élément technique (JSON-LD, balise canonical, meta, etc.) : fournis le CODE EXACT prêt à copier-coller, adapté aux données réelles du site.
- Si tu génères un JSON-LD Organization, pré-remplis les champs avec les vraies données du site (name="${businessName}", url="${siteUrl}", etc.).

Entreprise : ${brandContext}
Niveau technique : ${techLevel} — ${techInstruction}
${goalInstruction}
${citationInstruction}
${architectureInstruction}

Problème : "${issueProblem}"
${crawlContext}

RÈGLES DE GÉNÉRATION :

1. SNIPPET "PRÊT À L'EMPLOI" OBLIGATOIRE :
   - Pour tout problème de schéma/JSON-LD → génère le bloc complet dans une étape, prêt à copier dans le <head>
   - Pour tout problème canonical → génère la balise exacte : <link rel="canonical" href="[URL_RÉELLE]" />
   - Pour tout problème de FAQ → génère les 5-8 questions/réponses en JSON-LD FAQPage complet
   - Pour tout problème de meta description → génère la balise exacte avec un texte de 155 caractères adapté au secteur
   - Pour les citations → génère 3 phrases prêtes à insérer avec [SOURCE] et le type de lien recommandé

2. RE-SCAN POST-CORRECTION :
   Dans la dernière étape, TOUJOURS ajouter : "→ Une fois la modification en ligne, relancez un scan UseWok pour valider que le changement est détecté et mesurer le gain de score."

3. HONNÊTETÉ SUR LES LIMITES STRUCTURELLES :
   Si le problème est d'architecture (profondeur de navigation, restructuration de menus, maillage interne global) :
   - Dis clairement en summary : "⚠️ Cette correction ne peut pas être automatisée — c'est une décision d'architecture de site."
   - Explique POURQUOI c'est critique avec un chiffre (ex: "une page à 4 clics perd ~85% de sa capacité à être indexée par les IA")
   - Donne le PLAN DE RESTRUCTURATION concret (quelles pages remonter, quels liens internes créer) mais précise que la mise en œuvre se fait dans le CMS

4. ADAPTATION PAR NIVEAU TECHNIQUE :
   - no_code → interface cliquable : "Dans WordPress : Apparence > Menus > ..."
   - ai_nocode → prompt prêt à copier dans ChatGPT/Claude pour générer le contenu
   - developer → fichier exact, attribut exact, commande exacte

JSON requis :
- summary: pourquoi ce problème fait CONCRÈTEMENT perdre des clients (chiffre ou exemple réel si possible). 2 phrases max, ton direct. Inclure l'avertissement structurel si applicable.
- steps: 3 à 5 étapes. Chaque étape avec le snippet/code/texte prêt à l'emploi quand applicable. Dernière étape = invitation au re-scan.
- time_estimate: durée réaliste et honnête pour ce profil et ce niveau de complexité
- type: "seul" (modifications simples dans CMS) ou "avec aide" (modifications d'architecture, code serveur, restructuration)

Toujours en français. Sois direct, précis, et donne du concret — pas des généralités.`;

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