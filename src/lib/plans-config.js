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
    name: 'Découverte',
    price_monthly: 0,
    price_yearly: 0,
    credits_limit: PLAN_CREDIT_LIMITS.free,
    checkout_url_monthly: null,
    checkout_url_yearly: null,
    description: 'Pour découvrir votre visibilité IA et faire un premier diagnostic.',
    features_header: 'Inclus :',
    features: [
      { text: '1 site analysé' },
      { text: '1 moteur IA (Gemini)' },
      { text: '1 scan par mois' },
      { text: 'Score de visibilité IA' },
      { text: '3 questions surveillées' },
      { text: 'Historique 30 jours' },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price_monthly: 45,
    price_yearly: 432,
    credits_limit: PLAN_CREDIT_LIMITS.starter,
    checkout_url_monthly: null,
    checkout_url_yearly: null,
    description: "Pour les équipes qui démarrent sur la visibilité IA avec un plan d'action.",
    features_header: 'Tout Découverte, plus :',
    features: [
      { text: '5 sites analysés' },
      { text: '5 moteurs IA (ChatGPT, Claude, Gemini…)' },
      { text: '12 scans par mois' },
      { text: 'Scan automatique quotidien' },
      { text: "Plan d'action détaillé" },
      { text: 'Analyse concurrents' },
      { text: 'Audit technique SEO' },
      { text: '50 messages chatbot/mois' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Recommandé',
    price_monthly: 85,
    price_yearly: 816,
    credits_limit: PLAN_CREDIT_LIMITS.pro,
    checkout_url_monthly: null,
    checkout_url_yearly: null,
    description: "Pour les équipes qui optimisent activement leur visibilité IA au quotidien.",
    features_header: 'Tout Starter, plus :',
    features: [
      { text: '10 sites analysés' },
      { text: '8 moteurs IA en continu' },
      { text: 'Scan quotidien automatique' },
      { text: '200 messages chatbot/mois' },
      { text: 'Export PDF & white-label' },
      { text: 'Intégrations Search Console' },
      { text: 'Historique 12 mois' },
    ],
  },
];

export const COMPARISON_FEATURES = [
  {
    category: 'Moteurs IA',
    items: [
      { name: 'Moteurs actifs', free: '1 (Gemini)', starter: '5 moteurs', pro: '8 moteurs' },
      { name: 'ChatGPT', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Claude', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Gemini', free: 'Yes', starter: 'Yes', pro: 'Yes' },
      { name: 'Perplexity', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Copilot', free: '-', starter: '-', pro: 'Yes' },
      { name: 'Grok', free: '-', starter: '-', pro: 'Yes' },
    ],
  },
  {
    category: 'Analyse',
    items: [
      { name: 'Sites surveillés', free: '1', starter: '5', pro: '10' },
      { name: 'Scans par mois', free: '1', starter: '12', pro: '30 (quotidien)' },
      { name: 'Scan automatique', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: "Plan d'action", free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Analyse concurrents', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'Audit technique SEO', free: '-', starter: 'Yes', pro: 'Yes' },
    ],
  },
  {
    category: 'Chatbot & Export',
    items: [
      { name: 'Messages chatbot/mois', free: '5', starter: '50', pro: '200' },
      { name: 'Export PDF', free: '-', starter: 'Yes', pro: 'Yes' },
      { name: 'White-label', free: '-', starter: '-', pro: 'Yes' },
      { name: 'Intégrations', free: '-', starter: 'Yes', pro: 'Yes' },
    ],
  },
  {
    category: 'Historique & Support',
    items: [
      { name: 'Historique', free: '30 jours', starter: '6 mois', pro: '12 mois' },
      { name: 'Support', free: 'Communauté', starter: 'Email', pro: 'Prioritaire' },
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

/** Normalise un subscription_plan id vers free/starter/pro */
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