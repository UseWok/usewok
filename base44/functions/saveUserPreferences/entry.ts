import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { site_url, tech_level, main_goal, trade, maturity } = body;

    if (!site_url) return Response.json({ error: 'site_url required' }, { status: 400 });

    // Find or create BusinessProfile for this user
    const existing = await base44.entities.BusinessProfile.filter({ site_url }).catch(() => []);
    
    const preferences = {
      tech_level: tech_level || 'no_code',
      main_goal: main_goal || 'more_clients',
      trade: trade || '',
      maturity: maturity || '',
    };

    if (existing && existing.length > 0) {
      // Update existing
      await base44.entities.BusinessProfile.update(existing[0].id, {
        user_preferences: JSON.stringify(preferences),
      });
      return Response.json({ success: true, id: existing[0].id });
    } else {
      // Create new
      const created = await base44.entities.BusinessProfile.create({
        site_url,
        user_preferences: JSON.stringify(preferences),
      });
      return Response.json({ success: true, id: created.id });
    }
  } catch (error) {
    console.error('[saveUserPreferences]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});