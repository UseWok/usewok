import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Static authority task definitions (NO AI — pre-written instructions) ──
const AUTHORITY_TASKS = [
  {
    platform_key: 'trustpilot',
    platform_label: 'Trustpilot',
    platform_url: 'trustpilot.com',
    signup_url: 'https://business.trustpilot.com/signup',
    action_title: 'Créer votre profil Trustpilot',
    points_base: 15,
    description: "Trustpilot est la plateforme d'avis la plus citée par les moteurs IA. Un profil actif avec des avis clients renforce massivement votre autorité et vos chances d'être recommandé par ChatGPT et Gemini.",
    steps: [
      "Rendez-vous sur business.trustpilot.com et créez un compte professionnel avec votre adresse email d'entreprise.",
      'Recherchez le nom de votre entreprise pour réclamer une page existante, ou créez une nouvelle fiche.',
      'Renseignez votre nom commercial, votre site web et votre catégorie d\'activité principale.',
      "Ajoutez votre logo et une description claire intégrant les mots-clés de votre secteur.",
      'Invitez vos premiers clients à laisser un avis — chaque avis renforce la confiance que les IA vous accordent.',
    ],
  },
  {
    platform_key: 'f6s',
    platform_label: 'F6S',
    platform_url: 'f6s.com',
    signup_url: 'https://www.f6s.com/',
    action_title: 'Inscrire votre entreprise sur F6S',
    points_base: 10,
    description: "F6S est l'annuaire mondial de référence des entreprises et startups. Être listé renforce votre empreinte numérique et aide les IA à vous identifier comme une entité légitime.",
    steps: [
      'Rendez-vous sur f6s.com et créez un compte gratuit.',
      'Cliquez sur "Add your company" pour créer la fiche de votre entreprise.',
      'Renseignez le nom, le site web, une description courte et votre catégorie d\'activité.',
      'Ajoutez votre logo, vos cofondateurs et vos produits ou services.',
      'Publiez la fiche — F6S est indexé par les moteurs IA comme annuaire de référence.',
    ],
  },
  {
    platform_key: 'g2',
    platform_label: 'G2',
    platform_url: 'g2.com',
    signup_url: 'https://www.g2.com/claim_your_listing',
    action_title: 'Réclamer votre profil G2',
    points_base: 14,
    description: "G2 est la plateforme d'avis de référence pour les logiciels et services B2B. Un profil actif augmente massivement votre visibilité dans les recommandations IA de votre catégorie.",
    steps: [
      'Rendez-vous sur g2.com/claim_your_listing pour réclamer votre profil entreprise.',
      'Recherchez votre entreprise par nom ou par site web.',
      "Vérifiez votre affiliation avec l'entreprise (email professionnel requis).",
      'Complétez le profil : logo, description, catégorie et liste de vos produits.',
      'Encouragez vos clients à publier des avis — G2 est une source premium pour les recommandations IA.',
    ],
  },
];

// ── Diminishing returns: gain = base * (1 - current/100), capped at 99 ──
// At score 20 → gain is high; at score 70 → gain is low; never reaches 100.
function computeGain(base, currentScore) {
  const gain = base * (1 - currentScore / 100);
  return Math.min(gain, 99 - currentScore);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const siteUrl = body.site_url || '';

    // Resolve user: from body.user_id (called from analyzeWebsite) or auth.me() (frontend)
    let userId = body.user_id;
    if (!userId) {
      const u = await base44.auth.me().catch(() => null);
      userId = u?.id;
    }
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ─────────────────────────────────────────────
    // SEED — create 3 authority tasks if they don't exist yet (idempotent, NO AI)
    // ─────────────────────────────────────────────
    if (action === 'seed') {
      if (!siteUrl) return Response.json({ error: 'site_url required' }, { status: 400 });
      const existing = await svc.entities.ActionTask.filter({ user_id: userId, site_url: siteUrl }).catch(() => []);
      const existingKeys = new Set(existing.map((t) => t.platform_key).filter(Boolean));
      const toCreate = AUTHORITY_TASKS.filter((t) => !existingKeys.has(t.platform_key));
      let created = 0;
      for (const t of toCreate) {
        await svc.entities.ActionTask.create({
          user_id: userId,
          site_url: siteUrl,
          platform_key: t.platform_key,
          platform: t.platform_label,
          action_title: t.action_title,
          action_index: AUTHORITY_TASKS.indexOf(t),
          engine: 'all',
          status: 'todo',
          points_base: t.points_base,
          points_granted: 0,
          instructions_json: JSON.stringify({
            steps: t.steps,
            description: t.description,
            signup_url: t.signup_url,
            platform_url: t.platform_url,
            platform_label: t.platform_label,
            favicon: `https://www.google.com/s2/favicons?domain=${t.platform_url}&sz=64`,
          }),
          verify_result_json: '',
          note: '{}',
        });
        created++;
      }
      return Response.json({ seeded: created, total: AUTHORITY_TASKS.length });
    }

    // ─────────────────────────────────────────────
    // VERIFY — Gemini 3 Flash checks if the brand is actually on the platform
    // ─────────────────────────────────────────────
    if (action === 'verify') {
      const taskId = body.task_id;
      if (!taskId) return Response.json({ error: 'task_id required' }, { status: 400 });

      const task = await svc.entities.ActionTask.get(taskId).catch(() => null);
      if (!task || task.user_id !== userId) return Response.json({ error: 'Task not found' }, { status: 404 });
      if (task.status === 'done') return Response.json({ error: 'Task already completed' }, { status: 409 });

      const taskSiteUrl = task.site_url || siteUrl;
      const taskDef = AUTHORITY_TASKS.find((t) => t.platform_key === task.platform_key);
      if (!taskDef) return Response.json({ error: 'Unknown platform' }, { status: 400 });

      // Get brand context
      let brandName = '', industry = '';
      let profile = null;
      try {
        const profiles = await svc.entities.BusinessProfile.filter({ created_by_id: userId });
        profile = profiles.find((p) => p.site_url === taskSiteUrl) || profiles[0];
        brandName = profile?.identity_name || '';
        industry = profile?.identity_industry || '';
      } catch {}

      const domain = (taskSiteUrl || '').replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      const brandLabel = brandName || domain;

      // Gemini 3 Flash with web context — real check if the brand has an active profile
      const result = await svc.integrations.Core.InvokeLLM({
        prompt: `Tu vérifies si l'entreprise "${brandLabel}" (${domain})${industry ? `, secteur : ${industry}` : ''} possède un profil actif sur ${taskDef.platform_label} (${taskDef.platform_url}).

Via le contexte internet, recherche si CETTE entreprise précise a une page/profil réel sur ${taskDef.platform_label}.

Critères de validation RIGOUREUX :
- Il doit s'agir de CETTE entreprise précise (pas d'une homonyme)
- Le profil doit exister et être actif (pas juste une page vide auto-générée)
- Le site web mentionné sur le profil doit correspondre à ${domain}

JSON strict :
{
  "verified": true/false,
  "confidence": 0-100,
  "profile_url": "URL du profil trouvé sur ${taskDef.platform_url}, ou chaîne vide",
  "what_was_found": "Ce que tu as réellement trouvé (sois précis : nom de l'entreprise sur le profil, nombre d'avis si visible, etc.)",
  "feedback": "Message direct et amical à l'utilisateur. Si validé : félicitations + impact business concret sur sa visibilité IA. Si non validé : encouragement précis sur ce qu'il reste à faire."
}`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            verified: { type: 'boolean' },
            confidence: { type: 'number' },
            profile_url: { type: 'string' },
            what_was_found: { type: 'string' },
            feedback: { type: 'string' },
          },
          required: ['verified', 'confidence', 'feedback'],
        },
      });

      // If verified → apply diminishing-returns score boost to score_ai_visibility
      if (result?.verified) {
        const currentScore = profile?.score_ai_visibility || 0;
        const gain = computeGain(task.points_base || taskDef.points_base, currentScore);
        const newScore = Math.min(99, Math.round((currentScore + gain) * 10) / 10);
        const granted = Math.round(gain * 10) / 10;

        if (profile) {
          await svc.entities.BusinessProfile.update(profile.id, { score_ai_visibility: newScore });
        }
        await svc.entities.ActionTask.update(taskId, {
          status: 'done',
          points_granted: granted,
          verify_result_json: JSON.stringify(result),
          note: JSON.stringify({ verified: true, profile_url: result.profile_url || '', new_score: newScore, granted }),
        });

        return Response.json({
          ...result,
          points_granted: granted,
          new_score: newScore,
        });
      }

      // Not verified → keep task open, store result
      await svc.entities.ActionTask.update(taskId, {
        verify_result_json: JSON.stringify(result),
        note: JSON.stringify({ verified: false }),
      });
      return Response.json(result);
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[authorityTasks]', error);
    return Response.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
});