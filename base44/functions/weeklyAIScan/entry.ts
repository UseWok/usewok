import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all active BusinessProfiles
    const profiles = await base44.asServiceRole.entities.BusinessProfile.filter({ active: true });

    if (!profiles || profiles.length === 0) {
      return Response.json({ message: 'No active profiles to scan', processed: 0 });
    }

    const results = [];

    for (const profile of profiles) {
      if (!profile.site_url) continue;

      // Re-scan the site
      let newScore = profile.score_overall || 0;
      try {
        const scanRes = await base44.asServiceRole.functions.invoke('analyzeWebsite', { url: profile.site_url });
        if (scanRes?.overall_score !== undefined) {
          newScore = scanRes.overall_score;
        }
      } catch {
        // If scan fails, skip email but continue
        results.push({ profileId: profile.id, status: 'scan_failed' });
        continue;
      }

      const previousScore = profile.score_overall || 0;
      const delta = Math.abs(newScore - previousScore);

      // Update profile with new score
      await base44.asServiceRole.entities.BusinessProfile.update(profile.id, {
        score_previous: previousScore,
        score_overall: newScore,
        last_scan: new Date().toISOString(),
      });

      // Send email if score changed by more than 3 points
      if (delta > 3) {
        // Get the owner's email
        let ownerEmail = null;
        try {
          const users = await base44.asServiceRole.entities.User.filter({ id: profile.created_by_id });
          ownerEmail = users[0]?.email;
        } catch {}

        if (ownerEmail) {
          const direction = newScore > previousScore ? 'amélioré' : 'baissé';
          const emoji = newScore > previousScore ? '📈' : '📉';

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: ownerEmail,
            subject: `${emoji} Votre score IA a ${direction} de ${delta} points`,
            body: `
Bonjour,

Votre rapport hebdomadaire AI Visibility est prêt.

Site : ${profile.site_url}
Score précédent : ${previousScore}/100
Nouveau score : ${newScore}/100
Variation : ${newScore > previousScore ? '+' : '-'}${delta} points

${newScore > previousScore
  ? `Bonne nouvelle ! Votre visibilité IA s'améliore. Continuez sur cette lancée.`
  : `Votre visibilité IA a légèrement baissé. Connectez-vous à votre tableau de bord pour voir les actions recommandées.`
}

Voir mon rapport → https://app.wok.fr/ai-report

L'équipe WOK
            `.trim(),
          });

          results.push({ profileId: profile.id, previousScore, newScore, delta, emailSent: true, to: ownerEmail });
        } else {
          results.push({ profileId: profile.id, previousScore, newScore, delta, emailSent: false, reason: 'no_email' });
        }
      } else {
        results.push({ profileId: profile.id, previousScore, newScore, delta, emailSent: false, reason: 'delta_too_small' });
      }
    }

    return Response.json({ success: true, processed: profiles.length, results });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});