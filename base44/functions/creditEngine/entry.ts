/**
 * CREDIT ENGINE — Backend serveur autoritaire
 * Toutes les déductions de crédits passent ICI, jamais côté client.
 * Calcul: coût_action × 1000 = crédits d'intégration facturés
 * Le solde est stocké dans credits_used (consommé depuis renouvellement)
 * et credits_limit (plafond du plan, cloud).
 *
 * POST /api/functions/creditEngine
 * Body: { action: "deduct" | "get" | "renew", cost?: number, idempotency_key?: string }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PLAN_LIMITS = {
  free:     150_000,
  starter:  1_000_000,
  creator:  2_500_000,
  pro:      5_000_000,
};

const RESET_DAYS = 30;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Admins are exempt from all credit checks
    if (user.role === 'admin') {
      return Response.json({ success: true, exempt: true, credits_used: 0, credits_limit: 999_999_999 });
    }

    const body = await req.json().catch(() => ({}));
    const { action = 'get', cost = 0, idempotency_key = null } = body;

    // ── Get plan limit ──
    const planId = user.subscription_plan || 'free';
    const planLimit = PLAN_LIMITS[planId] ?? PLAN_LIMITS.free;

    // ── Check renewal ──
    const resetAt = user.credits_reset_at ? new Date(user.credits_reset_at) : null;
    let creditsUsed = typeof user.credits_used === 'number' ? user.credits_used : 0;
    let creditsLimit = typeof user.credits_limit === 'number' ? user.credits_limit : planLimit;

    const renewalDue = !resetAt || Date.now() >= resetAt.getTime();

    if (action === 'renew' || renewalDue) {
      // Reset cycle — credits_used back to 0, new reset date
      const nextReset = new Date(Date.now() + RESET_DAYS * 86_400_000).toISOString();
      await base44.auth.updateMe({
        credits_used: 0,
        credits_limit: planLimit,
        credits_reset_at: nextReset,
        subscription_plan: planId,
      });

      // Audit
      await base44.asServiceRole.entities.AuditLog.create({
        created_by_id: user.id,
        action: 'save',
        resource_type: 'CreditRenewal',
        resource_id: user.id,
        status: 'success',
        metadata: JSON.stringify({ plan: planId, limit: planLimit, reset_at: nextReset, ts: new Date().toISOString() }),
      }).catch(() => {});

      return Response.json({
        success: true, action: 'renewed',
        credits_used: 0, credits_limit: planLimit,
        credits_reset_at: nextReset, plan: planId,
      });
    }

    if (action === 'get') {
      return Response.json({
        success: true,
        credits_used: creditsUsed,
        credits_limit: creditsLimit,
        credits_reset_at: user.credits_reset_at,
        plan: planId,
        locked: creditsUsed >= creditsLimit,
      });
    }

    if (action === 'deduct') {
      if (!cost || cost <= 0) return Response.json({ error: 'Invalid cost' }, { status: 400 });

      // Idempotency: check if already processed (stored in user metadata)
      if (idempotency_key) {
        const idemStore = (() => { try { return JSON.parse(user.idempotency_keys || '{}'); } catch { return {}; } })();
        if (idemStore[idempotency_key]) {
          return Response.json({ success: true, duplicate: true, credits_used: creditsUsed, credits_limit: creditsLimit });
        }
      }

      // Locked check
      if (creditsUsed >= creditsLimit) {
        return Response.json({ error: 'LOCKED', message: 'Credits exhausted for this period.', credits_used: creditsUsed, credits_limit: creditsLimit }, { status: 402 });
      }

      // Deduct — credits_used goes UP (0 → limit direction)
      const newUsed = creditsUsed + cost;

      // Build idempotency store update
      const idemStore = (() => { try { return JSON.parse(user.idempotency_keys || '{}'); } catch { return {}; } })();
      if (idempotency_key) {
        idemStore[idempotency_key] = Date.now();
        // Prune keys older than 48h
        const now = Date.now();
        Object.keys(idemStore).forEach(k => { if (now - idemStore[k] > 172_800_000) delete idemStore[k]; });
      }

      const updates = { credits_used: newUsed };
      if (idempotency_key) updates.idempotency_keys = JSON.stringify(idemStore);

      await base44.auth.updateMe(updates);

      // Audit log (non-blocking)
      base44.asServiceRole.entities.AuditLog.create({
        created_by_id: user.id,
        action: 'generate',
        resource_type: 'CreditDeduction',
        resource_id: user.id,
        status: 'success',
        metadata: JSON.stringify({
          cost,
          credits_used_before: creditsUsed,
          credits_used_after: newUsed,
          credits_limit: creditsLimit,
          plan: planId,
          idempotency_key,
          ts: new Date().toISOString(),
        }),
      }).catch(() => {});

      return Response.json({
        success: true,
        credits_used: newUsed,
        credits_limit: creditsLimit,
        remaining: creditsLimit - newUsed,
        locked: newUsed >= creditsLimit,
        plan: planId,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});