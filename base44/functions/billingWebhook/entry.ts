/**
 * ZERO-AI BILLING WEBHOOK
 * ─────────────────────────────────────────────────────────────────
 * Handles Stripe webhooks for autonomous subscription management.
 * NO AI/LLM calls — pure backend logic only. Zero AI tokens consumed.
 *
 * Supported events:
 *   invoice.paid                  → reset user credits to plan limit
 *   customer.subscription.updated → update user's subscription_plan
 *   customer.subscription.deleted → downgrade user to free plan
 *
 * Setup: Set STRIPE_WEBHOOK_SECRET in environment variables.
 * Admin: set 'stripe_price_map' in AppSettings as JSON: { "price_xxx": "starter", ... }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Plan credit limits — mirrors lib/plans-config.js, Zero-AI hardcoded
const PLAN_CREDIT_LIMITS = {
  free:     150_000,
  starter:  1_000_000,
  creator:  2_500_000,
  pro:      5_000_000,
};

async function loadPriceMap(base44) {
  try {
    const results = await base44.asServiceRole.entities.AppSettings.filter({ key: 'stripe_price_map' });
    if (results.length > 0) return JSON.parse(results[0].value);
  } catch {}
  return {};
}

async function findUserByStripeCustomer(base44, customerId) {
  try {
    const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
    return users.length > 0 ? users[0] : null;
  } catch { return null; }
}

// Atomic credit reset — Zero-AI, pure DB mutation
async function resetUserCredits(base44, user, planId) {
  const limit = PLAN_CREDIT_LIMITS[planId] ?? PLAN_CREDIT_LIMITS.free;
  const nextReset = new Date(Date.now() + 30 * 86_400_000).toISOString();

  await base44.asServiceRole.entities.User.update(user.id, {
    credits_balance: limit,
    credits_reset_at: nextReset,
    subscription_plan: planId,
    subscription_date: new Date().toISOString(),
  });

  await base44.asServiceRole.entities.AuditLog.create({
    created_by_id: user.id,
    action: 'save',
    resource_type: 'BillingReset',
    resource_id: user.id,
    status: 'success',
    metadata: JSON.stringify({
      event: 'credit_reset',
      plan: planId,
      credits_reset_to: limit,
      next_reset: nextReset,
      ts: new Date().toISOString(),
    }),
  });

  return { user_id: user.id, plan: planId, credits_reset_to: limit };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();

    // Stripe signature verification
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const signature = req.headers.get('stripe-signature');

    if (webhookSecret && signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      const parts = Object.fromEntries(signature.split(',').map(p => p.split('=')));
      const timestamp = parts['t'];
      const sigHex = parts['v1'];

      if (!timestamp || !sigHex) {
        return Response.json({ error: 'Invalid signature header' }, { status: 400 });
      }

      const signed = encoder.encode(`${timestamp}.${body}`);
      const expected = await crypto.subtle.sign('HMAC', key, signed);
      const expectedHex = Array.from(new Uint8Array(expected)).map(b => b.toString(16).padStart(2, '0')).join('');

      if (expectedHex !== sigHex) {
        return Response.json({ error: 'Signature verification failed' }, { status: 401 });
      }
    }

    let event;
    try { event = JSON.parse(body); }
    catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const priceMap = await loadPriceMap(base44);

    // invoice.paid → reset credits to plan limit (Zero-AI monthly renewal)
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const priceId = invoice.lines?.data?.[0]?.price?.id;
      const planId = priceMap[priceId] || 'free';

      const user = await findUserByStripeCustomer(base44, customerId);
      if (!user) return Response.json({ warning: `No user found for customer ${customerId}` }, { status: 200 });

      const result = await resetUserCredits(base44, user, planId);
      return Response.json({ success: true, event: 'invoice.paid', ...result });
    }

    // customer.subscription.updated → update plan tier
    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const customerId = sub.customer;
      const priceId = sub.items?.data?.[0]?.price?.id;
      const planId = priceMap[priceId] || 'free';

      const user = await findUserByStripeCustomer(base44, customerId);
      if (!user) return Response.json({ warning: `No user found for customer ${customerId}` }, { status: 200 });

      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_plan: planId,
        subscription_status: sub.status,
      });

      return Response.json({ success: true, event: 'customer.subscription.updated', plan: planId, status: sub.status });
    }

    // customer.subscription.deleted → downgrade to free
    if (event.type === 'customer.subscription.deleted') {
      const customerId = event.data.object.customer;
      const user = await findUserByStripeCustomer(base44, customerId);
      if (!user) return Response.json({ warning: `No user found for customer ${customerId}` }, { status: 200 });

      await resetUserCredits(base44, user, 'free');
      await base44.asServiceRole.entities.User.update(user.id, { subscription_status: 'cancelled' });

      return Response.json({ success: true, event: 'customer.subscription.deleted', downgraded_to: 'free' });
    }

    // Acknowledge all other events without error
    return Response.json({ received: true, event_type: event.type });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});