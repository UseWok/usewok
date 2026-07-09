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
  elite:    15_000_000,
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
  elite:   { web_search: true,  max_model: true,  file_upload: true,  concurrent_builds: 20, daily_burn_cap: 15_000_000, white_label: true,  private_builds: true,  version_history_days: 365, code_editor: true,  zip_export: true  },
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
    chatbot_messages: 5,
    scans_per_period: 1,
    scan_period: 'month',
    max_sites: 1,
    history_days: 30,
    engines: ['gemini'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price_monthly: 49.85,
    price_yearly: 468.85,
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
    chatbot_messages: 50,
    scans_per_period: 12,
    scan_period: 'month',
    max_sites: 5,
    history_days: 180,
    engines: ['gemini', 'chatgpt', 'claude', 'llama', 'perplexity'],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Recommended',
    price_monthly: 99.85,
    price_yearly: 960.85,
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
    chatbot_messages: 200,
    scans_per_period: 1,
    scan_period: 'day',
    max_sites: 10,
    history_days: 365,
    engines: ['gemini', 'chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'copilot', 'grok'],
  },
  {
    id: 'elite',
    name: 'Elite',
    price_monthly: 299.85,
    price_yearly: 2870.85,
    credits_limit: PLAN_CREDIT_LIMITS.elite,
    checkout_url_monthly: null,
    checkout_url_yearly: null,
    description: 'For agencies and teams managing AI visibility at scale across multiple clients.',
    features_header: 'Everything in Pro, plus:',
    features: [
      { text: 'Unlimited sites analyzed' },
      { text: '8 AI engines continuously' },
      { text: 'Unlimited scans (daily + on-demand)' },
      { text: 'Unlimited chatbot messages' },
      { text: 'White-label & PDF export' },
      { text: 'Priority support & onboarding' },
      { text: 'API access' },
      { text: 'Dedicated account manager' },
    ],
    chatbot_messages: -1,
    scans_per_period: -1,
    scan_period: 'day',
    max_sites: -1,
    history_days: 730,
    engines: ['gemini', 'chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'copilot', 'grok'],
  },
];

/** The full catalog of AI engines that can be enabled per plan (id + label). */
export const ALL_ENGINES = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'claude', label: 'Claude' },
  { id: 'perplexity', label: 'Perplexity' },
  { id: 'mistral', label: 'Mistral' },
  { id: 'llama', label: 'Llama' },
  { id: 'copilot', label: 'Copilot' },
  { id: 'grok', label: 'Grok' },
];

export const COMPARISON_FEATURES = [
  {
    category: 'AI Engines',
    items: [
      { name: 'Active engines', free: '1 (Gemini)', starter: '5 engines', pro: '8 engines', elite: '8 engines' },
      { name: 'ChatGPT', free: '-', starter: 'Yes', pro: 'Yes', elite: 'Yes' },
      { name: 'Claude', free: '-', starter: 'Yes', pro: 'Yes', elite: 'Yes' },
      { name: 'Gemini', free: 'Yes', starter: 'Yes', pro: 'Yes', elite: 'Yes' },
      { name: 'Perplexity', free: '-', starter: 'Yes', pro: 'Yes', elite: 'Yes' },
      { name: 'Copilot', free: '-', starter: '-', pro: 'Yes', elite: 'Yes' },
      { name: 'Grok', free: '-', starter: '-', pro: 'Yes', elite: 'Yes' },
    ],
  },
  {
    category: 'Analysis',
    items: [
      { name: 'Monitored sites', free: '1', starter: '5', pro: '10', elite: 'Unlimited' },
      { name: 'Scans per month', free: '1', starter: '12', pro: '30 (daily)', elite: 'Unlimited' },
      { name: 'Automatic scan', free: '-', starter: 'Yes', pro: 'Yes', elite: 'Yes' },
      { name: 'Action plan', free: '-', starter: 'Yes', pro: 'Yes', elite: 'Yes' },
      { name: 'Competitor analysis', free: '-', starter: 'Yes', pro: 'Yes', elite: 'Yes' },
      { name: 'Technical SEO audit', free: '-', starter: 'Yes', pro: 'Yes', elite: 'Yes' },
    ],
  },
  {
    category: 'Chatbot & Export',
    items: [
      { name: 'Chatbot messages/month', free: '5', starter: '50', pro: '200', elite: 'Unlimited' },
      { name: 'PDF export', free: '-', starter: 'Yes', pro: 'Yes', elite: 'Yes' },
      { name: 'White-label', free: '-', starter: '-', pro: 'Yes', elite: 'Yes' },
      { name: 'Integrations', free: '-', starter: 'Yes', pro: 'Yes', elite: 'Yes' },
      { name: 'API access', free: '-', starter: '-', pro: '-', elite: 'Yes' },
    ],
  },
  {
    category: 'History & Support',
    items: [
      { name: 'History', free: '30 days', starter: '6 months', pro: '12 months', elite: '24 months' },
      { name: 'Support', free: 'Community', starter: 'Email', pro: 'Priority', elite: 'Dedicated manager' },
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
    // Public backend function — AppSettings is admin-only via RLS, so visitors
    // would otherwise silently fall back to default plans on the pricing page.
    const res = await base44.functions.invoke('getPublicPlans', {});
    if (res?.data?.plans) {
      // Sync local cache with DB truth
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(res.data.plans));
      return res.data.plans;
    }
  } catch {}
  // Fallback: local cache
  try { return JSON.parse(localStorage.getItem(PLANS_STORAGE_KEY)) || null; } catch { return null; }
}

/** Resolve the list of enabled AI engine ids for a user's plan (admins get all). */
export function getEnabledEngines(user) {
  const allIds = ALL_ENGINES.map(e => e.id);
  if (user?.role === 'admin') return allIds;
  const plan = getUserPlan(user);
  const engines = Array.isArray(plan?.engines) && plan.engines.length > 0 ? plan.engines : ['gemini'];
  return engines.filter(e => allIds.includes(e));
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
  if (raw === 'free' || raw === 'starter' || raw === 'pro' || raw === 'elite') return raw;
  // No subscription set → always free
  if (!raw || raw === '') return 'free';
  // Legacy ids: check price of matched plan
  const plans = getPlansConfig();
  const matched = plans.find(p => p.id === raw);
  if (!matched) return 'free';
  if (!matched.price_monthly || matched.price_monthly === 0) return 'free';
  if (matched.price_monthly <= 55) return 'starter';
  if (matched.price_monthly <= 150) return 'pro';
  return 'elite';
}

/**
 * Compute which plan should be shown as "Recommended" for a given user.
 * Logic:
 *   - User on Free or Starter → Pro is recommended (default)
 *   - User on Pro → Elite is recommended (next tier up)
 *   - User on Elite → no recommendation (already on the max plan)
 *
 * This is derived from `user.subscription_plan` (cloud-persisted, set by Stripe webhook),
 * so the recommendation is automatically consistent across sessions, devices, and accounts.
 */
export function getRecommendedPlanId(user) {
  const currentId = getNormalizedPlanId(user);
  if (currentId === 'elite') return null;
  if (currentId === 'pro') return 'elite';
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