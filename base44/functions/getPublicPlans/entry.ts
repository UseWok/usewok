import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public endpoint: returns the admin-configured plans (AppSettings is
// admin-only via RLS, so visitors need this to see real plan features).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const results = await base44.asServiceRole.entities.AppSettings.filter({ key: 'plans_config' });
    if (results.length > 0) {
      let plans = null;
      try { plans = JSON.parse(results[0].value); } catch {}
      return Response.json({ plans });
    }
    return Response.json({ plans: null });
  } catch (error) {
    console.error('getPublicPlans error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});