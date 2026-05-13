const PLANS_STORAGE_KEY = 'stensor_plans_v4';
const DB_PLANS_KEY = 'plans_config';

export const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'For organizing every corner of your financial life.',
    price_monthly: 0,
    price_yearly: 0,
    credits_limit: 10,
    deep_credits_limit: 0,
    checkout_url_monthly: null,
    checkout_url_yearly: null,
    features_header: 'Includes:',
    features: ['Basic financial models', '10 Flash requests/mo', 'Standard response speed', 'Web access']
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'A place for professionals to plan and execute.',
    price_monthly: 15,
    price_yearly: 12,
    credits_limit: 100,
    deep_credits_limit: 10,
    checkout_url_monthly: 'https://buy.stripe.com/test_pro_monthly',
    checkout_url_yearly: 'https://buy.stripe.com/test_pro_yearly',
    features_header: 'Everything in Free, plus:',
    features: ['100 Flash requests/mo', '10 Deep Synthesis/mo', 'File Uploads', 'Priority support']
  },
  {
    id: 'max',
    name: 'Max',
    badge: 'Popular',
    description: 'For companies using Stensor to connect several tools.',
    price_monthly: 50,
    price_yearly: 40,
    credits_limit: 500,
    deep_credits_limit: 50,
    checkout_url_monthly: 'https://buy.stripe.com/test_max_monthly',
    checkout_url_yearly: 'https://buy.stripe.com/test_max_yearly',
    features_header: 'Everything in Pro, plus:',
    features: ['500 Flash requests/mo', '50 Deep Synthesis/mo', 'Unlimited Web Search', 'Advanced Custom AI agents']
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    description: 'Advanced controls and support to run your entire org.',
    price_monthly: 'Custom',
    price_yearly: 'Custom',
    credits_limit: 'Unlimited',
    deep_credits_limit: 'Unlimited',
    checkout_url_monthly: 'mailto:contact@stensor.com',
    checkout_url_yearly: 'mailto:contact@stensor.com',
    features_header: 'Everything in Max, plus:',
    features: ['Unlimited everything', 'Dedicated success manager', 'SSO & advanced security', 'SLA 99.9%']
  },
];

// Données du grand tableau comparatif (Notion style)
export const COMPARISON_FEATURES = [
  {
    category: "AI capabilities & Limits",
    items: [
      { name: "Flash requests", free: "10 / mo", pro: "100 / mo", max: "500 / mo", unlimited: "Unlimited" },
      { name: "Deep Synthesis", free: "-", pro: "10 / mo", max: "50 / mo", unlimited: "Unlimited" },
      { name: "Web Search", free: "Basic", pro: "Advanced", max: "Unlimited", unlimited: "Unlimited" },
      { name: "File Uploads", free: "-", pro: "Up to 10MB", max: "Up to 100MB", unlimited: "Unlimited" },
    ]
  },
  {
    category: "Advanced Features",
    items: [
      { name: "Custom AI Agents", free: "-", pro: "1 custom agent", max: "Unlimited", unlimited: "Unlimited" },
      { name: "API Access", free: "-", pro: "-", max: "Yes", unlimited: "Advanced rate limits" },
      { name: "Export capabilities", free: "PDF only", pro: "PDF, CSV", max: "PDF, CSV, Excel", unlimited: "All formats + API sync" },
    ]
  },
  {
    category: "Security & Support",
    items: [
      { name: "Support level", free: "Community", pro: "Standard", max: "Priority (24h)", unlimited: "Dedicated manager (1h)" },
      { name: "SSO SAML", free: "-", pro: "-", max: "-", unlimited: "Yes" },
      { name: "Data retention", free: "30 days", pro: "1 year", max: "Unlimited", unlimited: "Custom policies" },
    ]
  }
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