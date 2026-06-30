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

      return Response.json({ 
        summary: match.summary, 
        steps, 
        time_estimate: match.time_estimate, 
        type: match.type || 'autonome',
        profile_type: techLevel,
        from_cache: true 
      });
    }

    // ── 3. Générer via LLM (uniquement si aucun cache) ──
    // Crawl data passed from the scan result (anchors fix steps to real page structure)
    const crawlData = body.crawl_data || {};
    const crawlContext = Object.keys(crawlData).length > 0
      ? `\nDONNÉES RÉELLES DU CRAWL (à utiliser pour nommer les pages et éléments exacts) :\n${JSON.stringify(crawlData, null, 2)}`
      : '';

    const brandContext = `Site web: ${siteUrl}, Entreprise: ${businessName}, Secteur: ${industry}`;

    const techContextMap = {
      no_code: `PROFIL NO-CODE: ${businessName} est ${businessSize === 'solo' ? 'solo' : businessSize === 'small' ? 'petite équipe' : 'PME'}. Donne UNIQUEMENT les clics interface (Wix/WordPress/Squarespace). Zéro code. 2-3 étapes MAX. Utilise les vrais noms des pages du site.`,
      ai_nocode: `PROFIL AI-HELPER: ${businessName} utilise l'IA pour l'aider. Donne UN SEUL PROMPT prêt à copier-coller pour ChatGPT/Claude. Format: "Copie EXACTEMENT ceci:" [PROMPT]. Puis "Copie la réponse dans [endroit exact]". Rien d'autre.`,
      developer: `PROFIL DEVELOPER: ${businessName} a un dev ou peut coder. Explique la solution EN CONTEXTE du site. Nomme les fichiers réels. Pourquoi c'est bloquant pour les IA? JSON-LD? Données structurées? Crawlabilité?`,
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

    const profileTypeLabel = techLevel === 'no_code' ? 'no_code' : techLevel === 'ai_nocode' ? 'ai_nocode' : 'developer';
    
    const prompt = `Tu aides ${businessName} (${industry}) à corriger: "${issueProblem}"

PROFIL: ${profileTypeLabel === 'no_code' ? '🖱️ NO-CODE (pas de dev, juste des clics)' : profileTypeLabel === 'ai_nocode' ? '🤖 IA HELPER (utilise ChatGPT/Claude)' : '💻 DEVELOPER (code + terminal)'}

${profileTypeLabel === 'no_code' ? `RÉPONDS AVEC:
- summary: "Pourquoi ça bloque? (1 phrase simple + 1 chiffre clé)"
- steps: ["Clique sur Paramètres > Pages > [nom] > ...", "Cherche [champ] et remplis avec: [texte]", ...] (2-3 étapes MAX, zéro jargon)
- time_estimate: "10 min" ou "30 min" ou "1h"
- profile_type: "no_code"

SI C'EST IMPOSSIBLE SANS DEV: steps: ["Contactez un développeur pour [raison précise, ex: 'cela demande du JSON-LD custom']"]
` : profileTypeLabel === 'ai_nocode' ? `RÉPONDS AVEC:
- summary: "Pourquoi ça bloque en 1 phrase simple"
- prompt: "Copie EXACTEMENT ceci dans ChatGPT ou Claude:\n[PROMPT SUR 2-3 LIGNES PRÊT À COPIER]" (avec placeholders [EN CROCHETS])
- time_estimate: "5 min" ou "15 min"
- profile_type: "ai_nocode"

Le prompt doit générer un résultat que l'utilisateur copiera DIRECTEMENT dans son site.
` : `RÉPONDS AVEC:
- summary: "Pourquoi ça bloque? (1 phrase + contexte du site)"
- explanation: "2-3 phrases: fichiers concernés, pourquoi c'est important pour les IA (JSON-LD? Données structurées? Trust?)"
- time_estimate: "30 min" ou "1-2h"
- profile_type: "developer"
`}

JSON:
{
  "summary": "...",
  ${profileTypeLabel === 'ai_nocode' ? `"prompt": "Copie EXACTEMENT..."` : `"steps": [...] ou "explanation": "..."`},
  "time_estimate": "...",
  "profile_type": "${profileTypeLabel}",
  "type": "seul" ou "avec aide"
}

Simple. Clair. Actionnable.`;

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

    return Response.json({ ...result, profile_type: techLevel });
  } catch (error) {
    console.error('[generateFixInstruction]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});