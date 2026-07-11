import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const now = new Date().toISOString();

    // Find users with deletion_scheduled_at set and in the past.
    // $gte filter excludes empty strings (they sort before any date).
    const users = await svc.entities.User.filter({
      deletion_scheduled_at: { $gte: '2024-01-01T00:00:00.000Z', $lte: now }
    }).catch(() => []);

    if (users.length === 0) {
      return Response.json({ processed: 0, message: 'No accounts pending deletion.' });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    let processed = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Cancel Stripe subscription if the user has one
        if (stripeKey && user.email) {
          const authHeader = 'Basic ' + btoa(stripeKey + ':');

          // Find customer by email
          const custRes = await fetch(
            `https://api.stripe.com/v1/customers?email=${encodeURIComponent(user.email)}&limit=1`,
            { headers: { 'Authorization': authHeader } }
          );
          const custData = await custRes.json();

          if (custData.data && custData.data.length > 0) {
            const customerId = custData.data[0].id;

            // Find active subscriptions
            const subsRes = await fetch(
              `https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active`,
              { headers: { 'Authorization': authHeader } }
            );
            const subsData = await subsRes.json();

            // Cancel each subscription
            for (const sub of (subsData.data || [])) {
              await fetch(`https://api.stripe.com/v1/subscriptions/${sub.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': authHeader },
              });
            }
          }
        }

        // Delete the user account
        await svc.entities.User.delete(user.id);
        processed++;
      } catch (err) {
        console.error(`[processAccountDeletion] Failed for user ${user.id}:`, err);
        errors++;
      }
    }

    return Response.json({ processed, errors, total: users.length });
  } catch (error) {
    console.error('[processAccountDeletion]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});