import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { price_id, email } = await req.json();

    if (!price_id) {
      return Response.json({ error: 'price_id is required' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });

    const origin = req.headers.get('origin') || 'https://usewok.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: price_id, quantity: 1 }],
      payment_method_types: ['card', 'paypal'],
      customer_email: email || undefined,
      success_url: `${origin}/settings?checkout=success`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID') || '',
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});