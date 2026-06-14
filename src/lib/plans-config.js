const PLANS_STORAGE_KEY = 'stensor_plans_v6';
const DB_PLANS_KEY = 'plans_config';

/**
 * Plan credit limits — Zero-AI, pure backend values.
 * Monthly resets triggered by Stripe webhook invoice.paid (no AI tokens used).
 */
export const PLAN_CREDIT_LIMITS = {
  free:     150_000,
  starter:  1_000_000,
  creator:  2_500_000,
  pro:      5_000_000,
};

/**
 * Feature flags per plan — enforced at runtime by getPlanFeatures().
 * Admin can override these per-plan via the admin panel (stored in AppSettings).
 */
export const PLAN_FEATURE_FLAGS = {
  free:    { web_search: false, max_model: false, file_upload: false, concurrent_builds: 1,  daily_burn_cap: 150_000,   white_label: false, private_builds: false, version_history_days: 0  },
  starter: { web_search: true,  max_model: false, file_upload: true,  concurrent_builds: 2,  daily_burn_cap: 500_000,   white_label: false, private_builds: false, version_history_days: 7  },
  creator: { web_search: true,  max_model: true,  file_upload: true,  concurrent_builds: 5,  daily_burn_cap: 1_000_000, white_label: false, private_builds: true,  version_history_days: 30 },
  pro:     { web_search: true,  max_model: true,  file_upload: true,  concurrent_builds: 10, daily_burn_cap: 5_000_000, white_label: true,  private_builds: true,  version_history_days: 90 },
};

export const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    credits_limit: PLAN_CREDIT_LIMITS.free,
    checkout_url_monthly: null,
    checkout_url_yearly: null,
    features_header: 'Included:',
    features: [
      { text: '150,000 credits / month' },
      { text: '1 concurrent build' },
      { text: 'Standard AI model only' },
      { text: 'Public builds only' },
      { text: 'WOK badge on public links' },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price_monthly: 11.50,
    price_yearly: 9.50,
    credits_limit: PLAN_CREDIT_LIMITS.starter,
    checkout_url_monthly: 'https://buy.stripe.com/test_starter_monthly',
    checkout_url_yearly: 'https://buy.stripe.com/test_starter_yearly',
    features_header: 'Everything in Free, plus:',
    features: [
      { text: '1,000,000 credits / month' },
      { text: '2 concurrent builds' },
      { text: 'Web search enabled' },
      { text: 'File uploads (up to 10MB)' },
      { text: '7-day version history' },
    ],
  },
  {
    id: 'creator',
    name: 'Creator',
    badge: 'Popular',
    price_monthly: 23.50,
    price_yearly: 19.50,
    credits_limit: PLAN_CREDIT_LIMITS.creator,
    checkout_url_monthly: 'https://buy.stripe.com/test_creator_monthly',
    checkout_url_yearly: 'https://buy.stripe.com/test_creator_yearly',
    features_header: 'Everything in Starter, plus:',
    features: [
      { text: '2,500,000 credits / month' },
      { text: '5 concurrent builds' },
      { text: 'Max AI model unlocked' },
      { text: 'File uploads (up to 100MB)' },
      { text: 'Private builds' },
      { text: '30-day version history' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Best value',
    price_monthly: 31.50,
    price_yearly: 25.50,
    credits_limit: PLAN_CREDIT_LIMITS.pro,
    checkout_url_monthly: 'https://buy.stripe.com/test_pro_monthly',
    checkout_url_yearly: 'https://buy.stripe.com/test_pro_yearly',
    features_header: 'Everything in Creator, plus:',
    features: [
      { text: '5,000,000 credits / month' },
      { text: '10 concurrent builds' },
      { text: 'White-label (remove WOK badge)' },
      { text: 'Unlimited file uploads' },
      { text: '90-day version history' },
      { text: 'Dedicated support' },
    ],
  },
];

export const COMPARISON_FEATURES = [
  {
    category: 'AI Capabilities',
    items: [
      { name: 'Monthly credits',       free: '150K',     starter: '1M',       creator: '2.5M',    pro: '5M' },
      { name: 'AI model',              free: 'Standard', starter: 'Standard', creator: 'Max',     pro: 'Max' },
      { name: 'Web search',            free: '-',        starter: 'Yes',      creator: 'Yes',     pro: 'Yes' },
      { name: 'File upload',           free: '-',        starter: '10MB',     creator: '100MB',   pro: 'Unlimited' },
    ],
  },
  {
    category: 'Build Limits',
    items: [
      { name: 'Concurrent builds',     free: '1',        starter: '2',        creator: '5',        pro: '10' },
      { name: 'Daily burn cap',        free: '150K',     starter: '500K',     creator: '1M',       pro: '5M' },
      { name: 'Private builds',        free: '-',        starter: '-',        creator: 'Yes',      pro: 'Yes' },
      { name: 'Version history',       free: '-',        starter: '7 days',   creator: '30 days',  pro: '90 days' },
      { name: 'White-label badge',     free: '-',        starter: '-',        creator: '-',        pro: 'Yes' },
    ],
  },
  {
    category: 'Support',
    items: [
      { name: 'Support',   free: 'Community', starter: 'Standard', creator: 'Priority (24h)', pro: 'Dedicated (1h)' },
      { name: 'Audit log', free: '-',         starter: '-',        creator: '-',              pro: 'Yes' },
    ],
  },
];

export function getPlansConfig() {
  try { return JSON.parse(localStorage.getItem(PLANS_STORAGE_KEY)) || DEFAULT_PLANS; } catch { return DEFAULT_PLANS; }
}

export function savePlansConfig(plans) {
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  import('@/api/base44Client').then(({ base44 }) => {
    base44.entities.AppSettings.filter({ key: DB_PLANS_KEY }).then(results => {
      const val = JSON.stringify(plans);
      if (results.length > 0) { base44.entities.AppSettings.update(results[0].id, { value: val }); }
      else { base44.entities.AppSettings.create({ key: DB_PLANS_KEY, value: val }); }
    });
  });
}

export async function loadPlansFromDB() {
  try {
    const { base44 } = await import('@/api/base44Client');
    const results = await base44.entities.AppSettings.filter({ key: DB_PLANS_KEY });
    if (results.length > 0) {
      const plans = JSON.parse(results[0].value);
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
      return plans;
    }
  } catch {}
  return null;
}

export function getPlanById(planId) {
  const plans = getPlansConfig();
  return plans.find(p => p.id === planId) || plans[0];
}

export function getUserPlan(user) {
  const planId = user?.subscription_plan || 'free';
  return getPlanById(planId);
}

/**
 * Get feature flags for a user's plan.
 * Admin overrides are loaded from AppSettings ('plan_feature_flags').
 */
export function getPlanFeatures(user) {
  const planId = user?.subscription_plan || 'free';
  return PLAN_FEATURE_FLAGS[planId] || PLAN_FEATURE_FLAGS.free;
}

/**
 * Check if user can use private builds.
 */
export function canUsePrivateBuilds(user) {
  if (user?.role === 'admin') return true;
  const features = getPlanFeatures(user);
  return !!features.private_builds;
}

/**
 * Get the version history retention days for a user's plan.
 * Returns 0 if the plan has no version history access.
 */
export function getVersionHistoryDays(user) {
  if (user?.role === 'admin') return 9999;
  const features = getPlanFeatures(user);
  return features.version_history_days ?? 0;
}