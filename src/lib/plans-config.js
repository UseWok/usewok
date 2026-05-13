const PLANS_STORAGE_KEY = 'stensor_plans_v8';
const DB_PLANS_KEY = 'plans_config_v8';

export const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    checkout_url: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price_monthly: 11.50,
    price_yearly: 9.50,
    checkout_url: 'https://buy.stripe.com/test_pro',
  },
  {
    id: 'max',
    name: 'Max',
    badge: 'Popular',
    price_monthly: 23.50,
    price_yearly: 19.50,
    checkout_url: 'https://buy.stripe.com/test_max',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    badge: 'Limited',
    price_monthly: 31.50,
    price_yearly: 25.50,
    checkout_url: 'mailto:contact@stensor.com',
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