import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: '2024-06-20' });

    // Auth check
    let user = null;
    try { user = await base44.auth.me(); } catch {}

    const { email } = await req.json();
    const customerEmail = email || user?.email;

    if (!customerEmail) {
      return Response.json({ error: 'Email requis' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://usewok.com';

    // Chercher le customer Stripe par email
    const customers = await stripe.customers.list({ email: customerEmail, limit: 5 });

    if (customers.data.length === 0) {
      console.error(`[stripePortal] No Stripe customer found for email: ${customerEmail}`);
      return Response.json({ error: 'Aucun abonnement Stripe trouvé pour cet email.' }, { status: 404 });
    }

    // Prendre le customer le plus récent avec un abonnement actif si possible
    let customerId = customers.data[0].id;
    for (const c of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: c.id, status: 'active', limit: 1 });
      if (subs.data.length > 0) { customerId = c.id; break; }
    }

    // Créer la session du portail client Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings?section=plan`,
    });

    console.log(`[stripePortal] Portal created for ${customerEmail}: ${session.url}`);
    return Response.json({ url: session.url });

  } catch (error) {
    console.error('[stripePortal] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});