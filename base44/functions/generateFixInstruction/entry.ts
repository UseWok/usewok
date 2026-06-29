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

    const prompt = `Tu es un expert en visibilité IA (LLM Search Optimization) qui aide des entrepreneurs à être recommandés par ChatGPT, Gemini, Claude et les autres IA. Tu parles comme un ami expert, sans jargon, avec des actions concrètes qui créent des résultats rapides.

Contexte de l'entreprise :
${brandContext}

Problème détecté :
"${issueProblem}"

Génère un guide pratique, percutant et sans jargon. Pense "comment cette entreprise perd des clients à cause de ce problème" et "comment régler ça simplement".

Retourne un JSON avec :
- summary: une phrase d'impact qui explique POURQUOI ce problème fait perdre des clients ou de la visibilité (ex: "Quand quelqu'un demande à ChatGPT de recommander un X dans votre ville, vous n'apparaissez pas car..."). Max 2 phrases, ton direct, pas de jargon.
- steps: 3 à 5 étapes très concrètes, rédigées à l'impératif, que le propriétaire peut faire aujourd'hui. Chaque étape = 1 action précise avec un résultat attendu. Format: "[Action] → [Résultat attendu]"
- time_estimate: durée réaliste (ex: "20 minutes ce soir", "1h avec votre webmaster")
- type: "seul" si faisable sans développeur, "avec aide" si besoin d'un pro

RÈGLES : Zéro jargon technique (pas de: balise, meta, schema, JSON-LD, SSL, DNS, robots, crawl, indexation). Utilise : "votre page", "votre fiche Google", "votre site", "les IA". Toujours en français. Ton direct et encourageant.`;

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

    // ── 4. Sauvegarder dans cache user ET bibliothèque globale ──
    const stepsJson = JSON.stringify(result.steps || []);

    base44.entities.UserFixCache.create({
      user_id: user.id,
      issue_key: issueKey,
      site_url: siteUrl,
      summary: result.summary || '',
      steps: stepsJson,
      time_estimate: result.time_estimate || '',
      fix_type: result.type || 'seul',
    }).catch((e) => console.error('[cache_save_user]', e));

    base44.asServiceRole.entities.FixLibrary.create({
      issue_key: issueKey,
      issue_text: issueProblem,
      industry,
      summary: result.summary || '',
      steps: stepsJson,
      time_estimate: result.time_estimate || '',
      type: result.type || 'seul',
      use_count: 1,
    }).catch(() => {});

    return Response.json(result);
  } catch (error) {
    console.error('[generateFixInstruction]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});