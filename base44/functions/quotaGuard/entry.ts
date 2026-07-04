import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Server-side authoritative quota enforcement — cannot be bypassed from the frontend.
// Fallback defaults, only used if a plan has no explicit value set in plans_config.
const FALLBACK_DEFAULTS = { scans_per_period: 1, scan_period: 'month', max_sites: 1, chatbot_messages: 5, history_days: 30 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ allowed: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const siteUrl = body.site_url || null;

    const isAdmin = user.role === 'admin';
    const rawPlan = user.subscription_plan || 'free';
    const planId = isAdmin ? 'pro' : rawPlan;

    // ── Real-time source of truth: the actual plans list managed in Admin > Plans ──
    // This supports ANY plan id (including newly created ones), read fresh on every call.
    let planEntry = null;
    try {
      const settings = await base44.asServiceRole.entities.AppSettings.filter({ key: 'plans_config' });
      if (settings.length > 0) {
        const plans = JSON.parse(settings[0].value || '[]');
        planEntry = (plans || []).find(p => p.id === planId) || (isAdmin ? (plans || []).find(p => p.id === 'pro') : null);
      }
    } catch (e) {
      console.log('quotaGuard: plans_config load failed:', e.message);
    }

    let features = { ...FALLBACK_DEFAULTS, ...(planEntry || {}) };

    // Legacy admin overrides (AppSettings key: plan_limits) still supported for free/starter/pro
    try {
      const settings = await base44.asServiceRole.entities.AppSettings.filter({ key: 'plan_limits' });
      if (settings.length > 0) {
        const overrides = JSON.parse(settings[0].value || '{}');
        if (overrides[planId]) features = { ...features, ...overrides[planId] };
      }
    } catch (e) {
      console.log('quotaGuard: plan_limits load failed:', e.message);
    }

    // Unknown plan id with no config anywhere → treat as free-tier limits (fail-safe, not fail-open)
    if (!planEntry && !isAdmin && !['free', 'starter', 'pro'].includes(planId)) {
      features = { ...FALLBACK_DEFAULTS };
    }

    if (action === 'history') {
      return Response.json({ allowed: true, history_days: features.history_days ?? 30, plan: planId });
    }

    if (isAdmin) {
      return Response.json({ allowed: true, used: 0, limit: 999999, plan: planId });
    }

    if (action === 'scan') {
      const limit = features.scans_per_period ?? 1;
      const period = features.scan_period || 'month';
      if (limit <= 0) {
        return Response.json({ allowed: false, reason: 'scan_limit', used: 0, limit, period, plan: planId });
      }
      const now = new Date();
      const periodStart = period === 'day'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        : new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      const ledger = await base44.asServiceRole.entities.CreditLedger.filter({ user_id: user.id, action: 'SCAN' });
      const used = (ledger || []).filter(l => {
        const ts = new Date(l.timestamp || l.created_date).getTime();
        return ts >= periodStart;
      }).length;
      if (used >= limit) {
        return Response.json({ allowed: false, reason: 'scan_limit', used, limit, period, plan: planId });
      }

      // If scanning a NEW site, also enforce the concurrent-site limit
      if (siteUrl) {
        const profiles = await base44.asServiceRole.entities.BusinessProfile.filter({ created_by_id: user.id });
        const isNew = !(profiles || []).find(p => p.site_url === siteUrl);
        const maxSites = features.max_sites ?? 1;
        if (isNew && (profiles || []).length >= maxSites) {
          return Response.json({ allowed: false, reason: 'site_limit', used: profiles.length, limit: maxSites, plan: planId });
        }
      }
      return Response.json({ allowed: true, used, limit, period, plan: planId });
    }

    if (action === 'chat') {
      const limit = features.chatbot_messages ?? 5;
      if (limit <= 0) return Response.json({ allowed: false, reason: 'chat_limit', used: 0, limit, plan: planId });
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const convs = await base44.asServiceRole.entities.Conversation.filter({ created_by_id: user.id }, '-updated_at', 200);
      const used = (convs || []).reduce((acc, conv) => {
        let msgs = [];
        try { msgs = JSON.parse(conv.messages_json || '[]'); } catch { msgs = []; }
        return acc + msgs.filter(m => m.role === 'user' && (m.ts || 0) >= monthStart).length;
      }, 0);
      const allowed = used < limit;
      return Response.json({ allowed, reason: allowed ? null : 'chat_limit', used, limit, plan: planId });
    }

    if (action === 'site') {
      const limit = features.max_sites ?? 1;
      const profiles = await base44.asServiceRole.entities.BusinessProfile.filter({ created_by_id: user.id });
      const used = (profiles || []).length;
      const allowed = limit > 0 && used < limit;
      return Response.json({ allowed, reason: allowed ? null : 'site_limit', used, limit, plan: planId });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('quotaGuard error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});