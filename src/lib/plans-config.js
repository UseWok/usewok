const PLANS_STORAGE_KEY = 'stensor_plans_v3';
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
    internet_access: false,
    file_upload: false,
    features: ['10 Flash requests per month', 'Basic financial agents', 'Standard response speed']
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'A place for small teams to plan and execute.',
    price_monthly: 15,
    price_yearly: 12,
    credits_limit: 100,
    deep_credits_limit: 10,
    internet_access: true,
    file_upload: true,
    checkout_url_monthly: 'https://buy.stripe.com/test_pro_monthly', // A REMPLACER PAR TES VRAIS LIENS STRIPE
    checkout_url_yearly: 'https://buy.stripe.com/test_pro_yearly',
    features: ['100 Flash requests per month', '10 Deep Synthesis per month', 'Web Search included', 'File Uploads', 'Priority support']
  },
  {
    id: 'max',
    name: 'Max',
    description: 'For companies using Stensor to connect several tools.',
    price_monthly: 50,
    price_yearly: 40,
    credits_limit: 500,
    deep_credits_limit: 50,
    internet_access: true,
    file_upload: true,
    checkout_url_monthly: 'https://buy.stripe.com/test_max_monthly',
    checkout_url_yearly: 'https://buy.stripe.com/test_max_yearly',
    features: ['500 Flash requests per month', '50 Deep Synthesis per month', 'Unlimited Web Search', 'Extended File Uploads', 'Custom AI parameters']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Advanced controls and support to run your entire org.',
    price_monthly: 'Custom',
    price_yearly: 'Custom',
    credits_limit: 'Unlimited',
    deep_credits_limit: 'Unlimited',
    internet_access: true,
    file_upload: true,
    checkout_url_monthly: 'mailto:contact@ton-domaine.com', // Lien contact
    checkout_url_yearly: 'mailto:contact@ton-domaine.com',
    features: ['Unlimited everything', 'Dedicated success manager', 'Custom AI agent training', 'SSO & advanced security', 'SLA 99.9%']
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