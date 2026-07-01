/**
 * brevoSequenceRunner — Séquence déterministe 3 emails
 *
 * J+0 → welcome
 * J+3 → no_scan_j3 ("pourquoi les IA t'ignorent")
 * J+7 → final_offer ("tes concurrents captent ces clients")
 *
 * Déduplication via EmailLog : un emailType donné n'est envoyé qu'UNE SEULE fois
 * par utilisateur, peu importe combien de fois le cron ou une automation déclenche
 * cette fonction.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const BREVO_FN = 'brevoEmailSystem';

function daysSince(dateStr) {
  if (!dateStr) return 9999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    console.log(`[brevoSequenceRunner] Starting. userId=${userId || 'all'}`);

    let users = [];
    if (userId) {
      users = await base44.asServiceRole.entities.User.filter({ id: userId }).catch(() => []);
    } else {
      users = await base44.asServiceRole.entities.User.list('-created_date', 500).catch(() => []);
    }

    const profiles = await base44.asServiceRole.entities.BusinessProfile.list('-created_date', 500).catch(() => []);
    const profileMap = {};
    for (const p of profiles) {
      if (!profileMap[p.created_by_id]) profileMap[p.created_by_id] = p;
    }

    // ── Build a set of already-sent (user_id, emailType) pairs from EmailLog ──
    const allLogs = await base44.asServiceRole.entities.EmailLog.list('-created_date', 1000).catch(() => []);
    const sentSet = new Set();
    for (const log of allLogs) {
      if (log.user_id && log.email_type) sentSet.add(`${log.user_id}:${log.email_type}`);
    }

    const results = [];

    for (const user of users) {
      if (!user.email) continue;
      if (user.email_unsubscribed) {
        results.push({ email: user.email, skipped: 'unsubscribed' });
        continue;
      }

      const jours = daysSince(user.created_date);
      const profile = profileMap[user.id];
      const firstName = (user.full_name || '').split(' ')[0] || '';
      const siteUrl = profile?.site_url || '';
      const score = profile?.score_overall || 0;
      const criticalErrors = Math.max(0, Math.round((100 - score) / 10));
      const issues = profile?.issues || [];

      let emailType = null;
      if (jours === 0) emailType = 'welcome';
      else if (jours === 3) emailType = 'no_scan_j3';
      else if (jours === 7) emailType = 'final_offer';

      if (!emailType) {
        results.push({ email: user.email, skipped: `day_${jours}_no_email` });
        continue;
      }

      // ── Déduplication : skip si déjà envoyé ──
      const dedupKey = `${user.id}:${emailType}`;
      if (sentSet.has(dedupKey)) {
        results.push({ email: user.email, skipped: `already_sent_${emailType}` });
        continue;
      }

      try {
        await base44.asServiceRole.functions.invoke(BREVO_FN, {
          action: 'sendEmail',
          email: user.email,
          firstName,
          siteUrl,
          data: {
            emailType,
            score,
            criticalErrors,
            issues,
            scanDate: profile?.last_scan || '',
          },
        });

        // ── Log to EmailLog for deduplication ──
        await base44.asServiceRole.entities.EmailLog.create({
          user_id: user.id,
          user_email: user.email,
          email_type: emailType,
          segment: user.subscription_plan ? 'paid' : 'free_active',
          site_url: siteUrl,
          score_at_send: score,
        }).catch(() => {});

        sentSet.add(dedupKey); // prevent duplicate within same run
        results.push({ email: user.email, sent: emailType, day: jours });
        console.log(`[brevoSequenceRunner] Sent ${emailType} to ${user.email} (day ${jours})`);
      } catch (e) {
        results.push({ email: user.email, error: e.message, emailType });
        console.error(`[brevoSequenceRunner] Failed ${emailType} to ${user.email}:`, e.message);
      }
    }

    const sent = results.filter(r => r.sent).length;
    const skipped = results.filter(r => r.skipped).length;
    const errors = results.filter(r => r.error).length;
    return Response.json({ success: true, processed: users.length, sent, skipped, errors, results });

  } catch (error) {
    console.error('[brevoSequenceRunner] Fatal:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});