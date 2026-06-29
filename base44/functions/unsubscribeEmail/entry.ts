import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, action = 'unsubscribe' } = body;

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    // Find user by email
    const users = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase().trim() }).catch(() => []);
    if (users.length === 0) {
      // Return success anyway to avoid email enumeration
      return Response.json({ success: true, action });
    }

    const user = users[0];
    const unsubscribed = action === 'unsubscribe';

    await base44.asServiceRole.entities.User.update(user.id, {
      email_unsubscribed: unsubscribed,
    });

    console.log(`[unsubscribeEmail] ${action} for ${email}`);
    return Response.json({ success: true, action, email });

  } catch (error) {
    console.error('[unsubscribeEmail] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});