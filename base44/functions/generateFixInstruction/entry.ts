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

    const prompt = `Tu es un expert en visibilité IA. Adapte tes conseils EXACTEMENT au niveau technique indiqué.

Entreprise : ${brandContext}
Niveau technique : ${techLevel} — ${techInstruction}
${goalInstruction}

Problème : "${issueProblem}"

JSON requis :
- summary: pourquoi ce problème fait perdre des clients. 2 phrases max, ton direct.
- steps: 3 à 5 étapes adaptées au niveau ${techLevel}. Format: "[Action] → [Résultat]". Si ai_nocode/claude_code : prompt IA prêt-à-l'emploi dans les étapes techniques.
- time_estimate: durée réaliste pour ce profil
- type: "seul" ou "avec aide"

Toujours en français.`;

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