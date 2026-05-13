const PLANS_STORAGE_KEY = 'stensor_plans_v7';
const DB_PLANS_KEY = 'plans_config_v7';

export const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    checkout_url: null,
    features_header: 'Includes:',
    features: ['Basic forms', 'Basic sites', 'Basic automations', 'Custom databases', 'Stensor Calendar', 'Stensor Mail']
  },
  {
    id: 'pro',
    name: 'Pro',
    price_monthly: 11.50,
    price_yearly: 9.50,
    checkout_url: 'https://buy.stripe.com/test_pro',
    features_header: 'All Free features, plus:',
    features: ['Unlimited blocks', 'Unlimited graphs', 'Custom forms', 'Custom sites', 'Basic integrations']
  },
  {
    id: 'max',
    name: 'Max',
    badge: 'Popular',
    price_monthly: 23.50,
    price_yearly: 19.50,
    checkout_url: 'https://buy.stripe.com/test_max',
    features_header: 'All Pro features, plus:',
    features: ['Stensor Agent', 'Custom Agents', 'AI Notes (Beta)', 'Database permissions', 'SAML SSO', 'Enterprise search', 'Premium integrations [+4]', 'Verify any page [+5]']
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    badge: 'Limited',
    price_monthly: 31.50,
    price_yearly: 25.50,
    checkout_url: 'mailto:contact@stensor.com',
    features_header: 'All Max features, plus:',
    features: ['AI analytics & controls', 'No data retention with LLM providers', 'User provisioning via SCIM', 'Advanced security & controls', 'Audit logs', 'Security & compliance integrations', 'Domain management', 'Advanced integrations']
  },
];

export const COMPARISON_FEATURES = [
  {
    category: "Creation and customization",
    items: [
      { name: "Blocks", free: "Unlimited", pro: "Unlimited", max: "Unlimited", unlimited: "Unlimited" },
      { name: "Graphs", free: "Basic", pro: "Unlimited", max: "Unlimited", unlimited: "Unlimited" },
      { name: "Forms", free: "Basic", pro: "Custom", max: "Custom", unlimited: "Custom" },
      { name: "Sites", free: "Basic", pro: "Custom", max: "Custom", unlimited: "Custom" },
    ]
  },
  {
    category: "Stensor AI",
    items: [
      { name: "Stensor Agent", free: "-", pro: "-", max: "Included", unlimited: "Included" },
      { name: "Custom Agents", free: "-", pro: "-", max: "Included", unlimited: "Included" },
      { name: "AI Notes (Beta)", free: "-", pro: "-", max: "Included", unlimited: "Included" },
      { name: "AI Controls", free: "-", pro: "-", max: "-", unlimited: "Included" },
    ]
  },
  {
    category: "Security and management",
    items: [
      { name: "SAML SSO", free: "-", pro: "-", max: "Included", unlimited: "Included" },
      { name: "Enterprise Search", free: "-", pro: "-", max: "Included", unlimited: "Included" },
      { name: "Audit Log", free: "-", pro: "-", max: "-", unlimited: "Included" },
      { name: "Domain Management", free: "-", pro: "-", max: "-", unlimited: "Included" },
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