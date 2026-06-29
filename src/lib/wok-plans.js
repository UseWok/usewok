/**
 * WOK Plans — source de vérité des features par abonnement.
 * planId stocké dans user.subscription_plan (free | starter | pro)
 * Admins ont accès à tout.
 */

export const PLAN_RANK = { free: 0, starter: 1, pro: 2 };

export const WOK_PLAN_FEATURES = {
  free: {
    // Scans
    scan_type: 'lite',           // scan lite seulement
    scans_per_period: 1,
    scan_period: 'month',
    // Moteurs IA
    engines: ['gemini'],
    engines_count: 1,
    // Sites
    max_sites: 1,
    // Historique
    history_days: 30,
    // Chatbot
    chatbot_messages: 5,
    // Features
    auto_fix: false,
    fix_instructions: false,
    see_competitors: false,
    pdf_export: false,
    white_label: false,
    audit_access: false,
    integrations: false,
    auto_scan: false,
    // Questions
    monitored_questions: 3,
  },
  starter: {
    scan_type: 'full',
    scans_per_period: 3,
    scan_period: 'week',
    engines: ['gemini', 'chatgpt', 'claude', 'mistral', 'llama'],
    engines_count: 5,
    max_sites: 5,
    history_days: 180,
    chatbot_messages: 50,
    auto_fix: true,
    fix_instructions: true,
    see_competitors: true,
    pdf_export: true,
    white_label: false,
    audit_access: true,
    integrations: true,
    auto_scan: true,
    monitored_questions: null, // unlimited
  },
  pro: {
    scan_type: 'full',
    scans_per_period: 1,
    scan_period: 'day',
    engines: ['gemini', 'chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'copilot', 'grok'],
    engines_count: 8,
    max_sites: 10,
    history_days: 365,
    chatbot_messages: 200,
    auto_fix: true,
    fix_instructions: true,
    see_competitors: true,
    pdf_export: true,
    white_label: true,
    audit_access: true,
    integrations: true,
    auto_scan: true,
    monitored_questions: null,
  },
};

export const PLAN_LABELS = {
  free: 'Gratuit',
  starter: 'Starter',
  pro: 'Pro',
};

export const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  starter: { monthly: 49, yearly: 432 },
  pro: { monthly: 99, yearly: 816 },
};

export function getWokFeatures(user) {
  if (user?.role === 'admin') return WOK_PLAN_FEATURES.pro;
  const planId = user?.subscription_plan || 'free';
  return WOK_PLAN_FEATURES[planId] || WOK_PLAN_FEATURES.free;
}

export function getWokPlanId(user) {
  if (user?.role === 'admin') return 'pro';
  return user?.subscription_plan || 'free';
}

/**
 * Vérifie si une feature est disponible selon le plan.
 * featureKey: clé dans WOK_PLAN_FEATURES
 */
export function canUseFeature(user, featureKey) {
  const features = getWokFeatures(user);
  const val = features[featureKey];
  if (val === undefined) return true;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val > 0;
  return true;
}

/**
 * Retourne le plan minimum requis pour une feature.
 * Ex: canUseFeature(user, 'audit_access') → 'starter'
 */
export function requiredPlanFor(featureKey) {
  for (const planId of ['free', 'starter', 'pro']) {
    const val = WOK_PLAN_FEATURES[planId][featureKey];
    if (val === true || (typeof val === 'number' && val > 0) || (typeof val === 'string' && val !== '')) {
      return planId;
    }
  }
  return 'free';
}