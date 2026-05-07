const PLANS_STORAGE_KEY = 'stensor_plans_v2';
const DB_PLANS_KEY = 'plans_config';

export const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    credits_limit: 10,
    daily_credits_limit: 5,
    can_choose_model: false,
    default_model: 'gemini_3_flash',
    allowed_modes: ['thinking'],
    internet_access: false,
    max_discussions: 15,
    file_upload: false,
    file_upload_extended: false,
    ultimate_access: false,
    lessons_per_month: 0,
    shareable_credits: 0,
    premium_support: false,
  },
  {
    id: 'essential',
    name: 'Essential',
    price_monthly: 20,
    price_yearly: 16,
    credits_limit: 100,
    daily_credits_limit: 0,
    can_choose_model: true,
    default_model: 'gemini_3_flash',
    allowed_modes: ['fast', 'thinking', 'pro'],
    internet_access: false,
    max_discussions: 30,
    file_upload: true,
    file_upload_extended: false,
    ultimate_access: false,
    lessons_per_month: 0,
    shareable_credits: 0,
    premium_support: false,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price_monthly: 36,
    price_yearly: 30,
    credits_limit: 250,
    daily_credits_limit: 0,
    can_choose_model: true,
    default_model: 'gemini_3_flash',
    allowed_modes: ['fast', 'thinking', 'pro'],
    internet_access: true,
    max_discussions: 0,
    file_upload: true,
    file_upload_extended: false,
    ultimate_access: false,
    lessons_per_month: 3,
    shareable_credits: 25,
    premium_support: false,
  },
  {
    id: 'expert',
    name: 'Expert',
    price_monthly: 100,
    price_yearly: 80,
    credits_limit: 500,
    daily_credits_limit: 0,
    can_choose_model: true,
    default_model: 'gemini_3_flash',
    allowed_modes: ['fast', 'thinking', 'pro', 'ultimate'],
    internet_access: true,
    max_discussions: 0,
    file_upload: true,
    file_upload_extended: true,
    ultimate_access: true,
    lessons_per_month: 3,
    shareable_credits: 25,
    premium_support: false,
  },
  {
    id: 'supreme',
    name: 'Supreme',
    price_monthly: 180,
    price_yearly: 150,
    credits_limit: 1200,
    daily_credits_limit: 0,
    can_choose_model: true,
    default_model: 'gemini_3_flash',
    allowed_modes: ['fast', 'thinking', 'pro', 'ultimate'],
    internet_access: true,
    max_discussions: 0,
    file_upload: true,
    file_upload_extended: true,
    ultimate_access: true,
    lessons_per_month: 3,
    shareable_credits: 25,
    premium_support: true,
  },
];

export function getPlansConfig() {
  try {
    return JSON.parse(localStorage.getItem(PLANS_STORAGE_KEY)) || DEFAULT_PLANS;
  } catch {
    return DEFAULT_PLANS;
  }
}

export function savePlansConfig(plans) {
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  // Also persist to DB so landing page and all users see live changes
  import('@/api/base44Client').then(({ base44 }) => {
    base44.entities.AppSettings.filter({ key: DB_PLANS_KEY }).then(results => {
      const val = JSON.stringify(plans);
      if (results.length > 0) {
        base44.entities.AppSettings.update(results[0].id, { value: val });
      } else {
        base44.entities.AppSettings.create({ key: DB_PLANS_KEY, value: val });
      }
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