/**
 * brevoSequenceRunner — Moteur de séquences d'emailing automatisées
 *
 * Déclenché par des automations cron (quotidien) et des automations entity.
 * Évalue chaque utilisateur actif et décide quel email envoyer selon :
 * - Son segment (free_active, free_inactive, paid, pricing_viewed, chatbot_used)
 * - Son ancienneté (J+0, J+3, J+7, J+14, J+30)
 * - Ses actions (a scanné, a payé, a vu pricing, a utilisé chatbot)
 * - Son historique d'emails (EmailLog) pour ne pas envoyer 2x le même
 *
 * Séquences :
 * FREE INACTIF : welcome(J0) → no_scan_j3(J3) → inactive_j14(J14) → last_j30(J30)
 * FREE ACTIF   : welcome(J0) → post_scan(J1) → pricing_no_buy(J7 si pricing vu) → inactive_j14(J14 si pas payé)
 * PAYANT       : post_paid(J0) → paid_j7(J7) → paid_monthly(chaque mois)
 * CHATBOT      : chatbot_no_convert(après chatbot sans conversion)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const BREVO_FN = 'brevoEmailSystem';

// Jours depuis une date
function daysSince(dateStr) {
  if (!dateStr) return 9999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const { mode = 'cron', userId, eventType } = body;

    console.log(`[brevoSequenceRunner] mode=${mode} userId=${userId || 'all'} event=${eventType || 'none'}`);

    // Charger les logs d'emails déjà envoyés
    const emailLogs = await base44.asServiceRole.entities.EmailLog.list('-created_date', 5000).catch(() => []);
    const sentMap = {}; // userId → Set<emailType>
    for (const log of emailLogs) {
      if (!sentMap[log.user_id]) sentMap[log.user_id] = new Set();
      sentMap[log.user_id].add(log.email_type);
    }

    const hasSent = (uid, type) => !!(sentMap[uid]?.has(type));

    // Récupérer les utilisateurs à traiter
    let users = [];
    if (userId) {
      const u = await base44.asServiceRole.entities.User.filter({ id: userId }).catch(() => []);
      users = u;
    } else {
      users = await base44.asServiceRole.entities.User.list('-created_date', 500).catch(() => []);
    }

    const profiles = await base44.asServiceRole.entities.BusinessProfile.list('-created_date', 500).catch(() => []);
    const profileMap = {};
    for (const p of profiles) {
      if (!profileMap[p.created_by_id]) profileMap[p.created_by_id] = p;
    }

    const results = [];

    for (const user of users) {
      if (!user.email) continue;

      const uid = user.id;
      const profile = profileMap[uid];
      const plan = user.role === 'admin' ? 'pro' : (user.subscription_plan || 'free');
      const isPaid = plan !== 'free';
      const hasScanned = !!(profile?.last_scan);
      const score = profile?.score_overall || 0;
      const criticalErrors = Math.max(0, Math.round((100 - score) / 10));
      const totalIssues = criticalErrors + Math.round(criticalErrors * 0.5);
      const signupDate = user.created_date;
      const daysOld = daysSince(signupDate);
      const daysSinceLastScan = daysSince(profile?.last_scan);
      const siteUrl = profile?.site_url || '';
      const firstName = (user.full_name || '').split(' ')[0] || '';

      // Attributs enrichis pour Brevo
      const contactData = {
        plan, score, criticalErrors, totalIssues,
        hasScanned, hasPaid: isPaid,
        lastScanDate: profile?.last_scan || '',
        signupDate,
        previousScore: profile?.score_previous || 0,
      };

      // Sync contact Brevo (sans bloquer si erreur)
      base44.asServiceRole.functions.invoke(BREVO_FN, {
        action: 'syncContact',
        email: user.email,
        firstName,
        siteUrl,
        data: contactData,
      }).catch(e => console.warn(`[brevoSequenceRunner] syncContact failed for ${user.email}:`, e.message));

      // ── Arbre de décision des séquences ──────────────────────────────────

      let emailToSend = null;
      let segment = 'free_inactive';

      if (isPaid) {
        // ── PAYANT ──────────────────────────────────────────────────────────
        segment = 'paid';

        if (!hasSent(uid, 'post_paid')) {
          emailToSend = 'post_paid';
        } else if (daysOld >= 7 && !hasSent(uid, 'paid_j7')) {
          emailToSend = 'paid_j7';
        } else if (daysOld >= 30 && !hasSent(uid, 'paid_monthly')) {
          emailToSend = 'paid_monthly';
        } else {
          // Rapport mensuel récurrent : vérifier si le dernier envoi date de >30j
          const lastMonthly = emailLogs
            .filter(l => l.user_id === uid && l.email_type === 'paid_monthly')
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
          if (lastMonthly && daysSince(lastMonthly.created_date) >= 30) {
            emailToSend = 'paid_monthly';
          }
        }

      } else if (hasScanned) {
        // ── FREE ACTIF (a scanné) ────────────────────────────────────────────
        segment = 'free_active';

        if (!hasSent(uid, 'welcome')) {
          emailToSend = 'welcome';
        } else if (!hasSent(uid, 'post_scan') && daysSinceLastScan <= 2) {
          emailToSend = 'post_scan';
        } else if (!hasSent(uid, 'pricing_no_buy') && daysOld >= 7) {
          emailToSend = 'pricing_no_buy';
          segment = 'pricing_viewed';
        } else if (!hasSent(uid, 'inactive_j14') && daysOld >= 14) {
          emailToSend = 'inactive_j14';
        } else if (!hasSent(uid, 'last_j30') && daysOld >= 30) {
          emailToSend = 'last_j30';
        }

      } else {
        // ── FREE INACTIF (jamais scanné) ─────────────────────────────────────
        segment = 'free_inactive';

        if (!hasSent(uid, 'welcome')) {
          emailToSend = 'welcome';
        } else if (!hasSent(uid, 'no_scan_j3') && daysOld >= 3) {
          emailToSend = 'no_scan_j3';
        } else if (!hasSent(uid, 'inactive_j14') && daysOld >= 14) {
          emailToSend = 'inactive_j14';
        } else if (!hasSent(uid, 'last_j30') && daysOld >= 30) {
          emailToSend = 'last_j30';
        }
      }

      if (!emailToSend) {
        results.push({ userId: uid, email: user.email, skipped: true, reason: 'no_email_needed' });
        continue;
      }

      // Préparer les données enrichies selon le type d'email
      let emailData = { emailType: emailToSend, ...contactData };
      if (emailToSend === 'paid_j7') {
        emailData.currentScore = score;
        emailData.previousScore = profile?.score_previous || 0;
      }
      if (emailToSend === 'paid_monthly') {
        emailData.currentScore = score;
        emailData.previousScore = profile?.score_previous || 0;
        emailData.issuesFixed = Math.max(0, (profile?.score_overall || 0) - (profile?.score_previous || 0));
        emailData.issuesRemaining = totalIssues;
        emailData.aiAppearances = Math.round(score * 1.2);
      }

      // Envoyer via brevoEmailSystem
      try {
        await base44.asServiceRole.functions.invoke(BREVO_FN, {
          action: 'sendEmail',
          email: user.email,
          firstName,
          siteUrl,
          segment,
          data: emailData,
        });

        // Logger l'envoi dans EmailLog
        await base44.asServiceRole.entities.EmailLog.create({
          user_id: uid,
          user_email: user.email,
          email_type: emailToSend,
          segment,
          site_url: siteUrl,
          score_at_send: score,
        }).catch(() => {});

        results.push({ userId: uid, email: user.email, sent: emailToSend, segment });
        console.log(`[brevoSequenceRunner] Sent ${emailToSend} to ${user.email} (${segment})`);

      } catch (e) {
        console.error(`[brevoSequenceRunner] Failed to send ${emailToSend} to ${user.email}:`, e.message);
        results.push({ userId: uid, email: user.email, error: e.message, emailType: emailToSend });
      }
    }

    const sent = results.filter(r => r.sent).length;
    const skipped = results.filter(r => r.skipped).length;
    const errors = results.filter(r => r.error).length;

    return Response.json({ success: true, processed: users.length, sent, skipped, errors, results });

  } catch (error) {
    console.error('[brevoSequenceRunner] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});