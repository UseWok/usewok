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
  free:    { web_search: false, max_model: false, file_upload: false, concurrent_builds: 1,  daily_burn_cap: 150_000,   white_label: false, private_builds: false, version_history_days: 0,  max_builds: 15, code_editor: false, zip_export: false },
  starter: { web_search: true,  max_model: false, file_upload: true,  concurrent_builds: 2,  daily_burn_cap: 500_000,   white_label: false, private_builds: false, version_history_days: 7,  code_editor: true,  zip_export: true  },
  creator: { web_search: true,  max_model: true,  file_upload: true,  concurrent_builds: 5,  daily_burn_cap: 1_000_000, white_label: false, private_builds: true,  version_history_days: 30, code_editor: true,  zip_export: true  },
  pro:     { web_search: true,  max_model: true,  file_upload: true,  concurrent_builds: 10, daily_burn_cap: 5_000_000, white_label: true,  private_builds: true,  version_history_days: 90, code_editor: true,  zip_export: true  },
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
    description: 'Discover your AI visibility and get an initial diagnosis.',
    features_header: 'Included:',
    features: [
      { text: '1 site analyzed' },
      { text: '1 AI engine (Gemini)' },
      { text: '1 scan per month' },
      { text: 'AI visibility score' },
      { text: '3 monitored questions' },
      { text: '30-day history' },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price_monthly: 49,
    price_yearly: 468,
    credits_limit: PLAN_CREDIT_LIMITS.starter,
    checkout_url_monthly: null,
    checkout_url_yearly: null,
    description: 'For teams starting out with AI visibility and an action plan.',
    features_header: 'Everything in Free, plus:',
    features: [
      { text: '5 sites analyzed' },
      { text: '5 AI engines (ChatGPT, Claude, Gemini…)' },
      { text: '12 scans per month' },
      { text: 'Daily automatic scan' },
      { text: 'Detailed action plan' },
      { text: 'Competitor analysis' },
      { text: 'Technical SEO audit' },
      { text: '50 chatbot messages/month' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Recommended',
    price_monthly: 99,
    price_yearly: 960,
    credits_limit: PLAN_CREDIT_LIMITS.pro,
    checkout_url_monthly: null,
    checkout_url_yearly: null,
    description: 'For teams actively optimizing their AI visibility every day.',
    features_header: 'Everything in Starter, plus:',
    features: [
      { text: '10 sites analyzed' },
      { text: '8 AI engines continuously' },
      { text: 'Automatic daily scan' },
      { text: '200 chatbot messages/month' },
      { text: 'PDF export & white-label' },
      { text: 'Search Console integrations' },
      { text: '12-month history' },
    ],
  },
];

export const COMPARISON_FEATURES = [
  {
    category: 'AI Engines',
    items: [
      { name: 'Active engines', free: '1 (Gemini)', starter: '5 engines', pro: '8 engines' },
      { name: 'ChatGPT', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Claude', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Gemini', free: 'Yes', starter: 'Yes', pro: 'Yes' },
      { name: 'Perplexity', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Copilot', free: '-', starter: '-', pro: 'Yes' },
      { name: 'Grok', free: '-', starter: '-', pro: 'Yes' },
    ],
  },
  {
    category: 'Analysis',
    items: [
      { name: 'Monitored sites', free: '1', starter: '5', pro: '10' },
      { name: 'Scans per month', free: '1', starter: '12', pro: '30 (daily)' },
      { name: 'Automatic scan', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Action plan', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Competitor analysis', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Technical SEO audit', free: '-', starter: 'Yes', pro: 'Yes' },
    ],
  },
  {
    category: 'Chatbot & Export',
    items: [
      { name: 'Chatbot messages/month', free: '5', starter: '50', pro: '200' },
      { name: 'PDF export', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'White-label', free: '-', starter: '-', pro: 'Yes' },
      { name: 'Integrations', free: '-', starter: 'Yes', pro: 'Yes' },
    ],
  },
  {
    category: 'History & Support',
    items: [
      { name: 'History', free: '30 days', starter: '6 months', pro: '12 months' },
      { name: 'Support', free: 'Community', starter: 'Email', pro: 'Priority' },
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
      // Sync local cache with DB truth
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
      return plans;
    }
  } catch {}
  // Fallback: local cache
  try { return JSON.parse(localStorage.getItem(PLANS_STORAGE_KEY)) || null; } catch { return null; }
}

export function getPlanById(planId) {
  const plans = getPlansConfig();
  return plans.find(p => p.id === planId) || plans[0];
}

export function getUserPlan(user) {
  const planId = user?.subscription_plan || 'free';
  const plans = getPlansConfig();
  // Try exact match first
  const exact = plans.find(p => p.id === planId);
  if (exact) return exact;
  // If not found by id — always fall back to the free plan
  return plans.find(p => p.id === 'free') || DEFAULT_PLANS.find(p => p.id === 'free') || plans[0];
}

/** Normalizes a subscription_plan id to free/starter/pro */
export function getNormalizedPlanId(user) {
  const raw = user?.subscription_plan || 'free';
  if (raw === 'free' || raw === 'starter' || raw === 'pro') return raw;
  // No subscription set → always free
  if (!raw || raw === '') return 'free';
  // Legacy ids: check price of matched plan
  const plans = getPlansConfig();
  const matched = plans.find(p => p.id === raw);
  if (!matched) return 'free';
  if (!matched.price_monthly || matched.price_monthly === 0) return 'free';
  if (matched.price_monthly <= 55) return 'starter';
  return 'pro';
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