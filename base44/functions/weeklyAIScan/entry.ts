/**
 * weeklyAIScan — Scan automatique planifié
 * Déclenché par une automation cron chaque jour à 5h UTC (= 6h Paris).
 *
 * Logique par plan :
 * - FREE : pas de scan automatique (auto_scan = false)
 * - STARTER : 3 scans/semaine — déclenche lundi (1), mercredi (3), vendredi (5)
 * - PRO : 1 scan/jour — déclenche tous les jours
 *
 * Les valeurs par défaut peuvent être écrasées par Admin via AppSettings { key: 'plan_limits' }.
 * Cette fonction lit les overrides Admin au démarrage.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const DEFAULT_PLAN_FEATURES = {
  free:    { auto_scan: false, scan_type: 'lite',  engines: ['gemini'] },
  starter: { auto_scan: true,  scan_type: 'full',  engines: ['gemini', 'chatgpt', 'claude', 'llama', 'perplexity'] },
  pro:     { auto_scan: true,  scan_type: 'full',  engines: ['gemini', 'chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'copilot', 'grok'] },
};

// Jours de scan Starter : lundi(1), mercredi(3), vendredi(5) — UTC
const STARTER_DAYS = [1, 3, 5];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Vérification admin (appelé par cron — mais on vérifie quand même)
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Charger les overrides Admin depuis AppSettings
    let planLimits = { free: {}, starter: {}, pro: {} };
    try {
      const settings = await base44.asServiceRole.entities.AppSettings.filter({ key: 'plan_limits' });
      if (settings.length > 0) planLimits = JSON.parse(settings[0].value);
    } catch {}

    // Fonction helper pour lire une valeur de plan (override Admin > défaut)
    const getPlanVal = (planId, key) => {
      if (planLimits[planId]?.[key] !== undefined) return planLimits[planId][key];
      return DEFAULT_PLAN_FEATURES[planId]?.[key];
    };

    // Jour de la semaine actuel UTC (0=dim, 1=lun, ..., 6=sam)
    const now = new Date();
    const dayOfWeek = now.getUTCDay();

    // Récupérer tous les profils actifs avec leur propriétaire
    const profiles = await base44.asServiceRole.entities.BusinessProfile.filter({ active: true });
    if (!profiles || profiles.length === 0) {
      return Response.json({ message: 'No active profiles', processed: 0 });
    }

    const results = [];

    for (const profile of profiles) {
      if (!profile.site_url) continue;

      // Identifier le plan de l'utilisateur propriétaire
      let ownerPlanId = 'free';
      let ownerEmail = null;
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: profile.created_by_id });
        const owner = users[0];
        if (owner) {
          ownerPlanId = owner.role === 'admin' ? 'pro' : (owner.subscription_plan || 'free');
          ownerEmail = owner.email;
        }
      } catch {}

      // Vérifier si ce plan a le scan auto activé
      const autoScan = getPlanVal(ownerPlanId, 'auto_scan');
      if (!autoScan) {
        results.push({ profileId: profile.id, plan: ownerPlanId, skipped: true, reason: 'auto_scan_disabled' });
        continue;
      }

      // Vérifier la fréquence selon le plan
      // PRO = tous les jours, STARTER = lun/mer/ven seulement
      if (ownerPlanId === 'starter') {
        const starterDays = planLimits.starter?.auto_scan_days || STARTER_DAYS;
        if (!starterDays.includes(dayOfWeek)) {
          results.push({ profileId: profile.id, plan: 'starter', skipped: true, reason: `not_starter_day (day=${dayOfWeek})` });
          continue;
        }
      }

      // Choisir la fonction d'analyse selon le plan
      const scanFn = getPlanVal(ownerPlanId, 'scan_type') === 'full' ? 'analyzeWebsite' : 'analyzeWebsiteLite';

      console.log(`[weeklyAIScan] Scanning ${profile.site_url} — plan=${ownerPlanId} fn=${scanFn}`);

      let newScore = profile.score_overall || 0;
      let scanSuccess = false;
      try {
        const scanRes = await base44.asServiceRole.functions.invoke(scanFn, { url: profile.site_url });
        const data = scanRes?.data || scanRes;
        if (data?.overall_score !== undefined) {
          newScore = data.overall_score;
          scanSuccess = true;
        }
      } catch (e) {
        console.error(`[weeklyAIScan] Scan failed for ${profile.site_url}:`, e.message);
        results.push({ profileId: profile.id, plan: ownerPlanId, status: 'scan_failed', error: e.message });
        continue;
      }

      const previousScore = profile.score_overall || 0;
      const delta = Math.round(Math.abs(newScore - previousScore));

      // Mettre à jour le profil
      await base44.asServiceRole.entities.BusinessProfile.update(profile.id, {
        score_previous: previousScore,
        score_overall: newScore,
        last_scan: new Date().toISOString(),
      });

      // Envoyer email si delta > 3 points
      if (delta > 3 && ownerEmail) {
        const direction = newScore > previousScore ? 'amélioré' : 'baissé';
        const emoji = newScore > previousScore ? '📈' : '📉';
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: ownerEmail,
            from_name: 'UseWok',
            subject: `${emoji} Votre score IA a ${direction} de ${delta} points`,
            body: `Bonjour,

Votre rapport de visibilité IA a été mis à jour automatiquement ce matin.

Site : ${profile.site_url}
Score précédent : ${previousScore}/100
Nouveau score    : ${newScore}/100
Variation        : ${newScore > previousScore ? '+' : '-'}${delta} points

${newScore > previousScore
  ? 'Bonne nouvelle ! Votre visibilité IA progresse. Continuez sur cette lancée.'
  : 'Votre visibilité IA a légèrement baissé. Consultez votre rapport pour voir les actions recommandées.'}

Voir mon rapport → https://app.usewok.com/ai-report

L'équipe UseWok`.trim(),
          });
          results.push({ profileId: profile.id, plan: ownerPlanId, previousScore, newScore, delta, emailSent: true, to: ownerEmail });
        } catch (e) {
          results.push({ profileId: profile.id, plan: ownerPlanId, previousScore, newScore, delta, emailSent: false, reason: 'email_failed', error: e.message });
        }
      } else {
        results.push({ profileId: profile.id, plan: ownerPlanId, previousScore, newScore, delta, emailSent: false, reason: delta <= 3 ? 'delta_too_small' : 'no_email' });
      }
    }

    return Response.json({ success: true, processed: profiles.length, results });

  } catch (error) {
    console.error('[weeklyAIScan] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});