const PLANS_STORAGE_KEY = 'stensor_plans_v2';

export const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    credits_limit: 10,
    daily_credits_limit: 3,
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
    price_monthly: 50,
    price_yearly: 40,
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
    price_monthly: 90,
    price_yearly: 70,
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
    price_monthly: 200,
    price_yearly: 160,
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
}

export function getPlanById(planId) {
  const plans = getPlansConfig();
  return plans.find(p => p.id === planId) || plans[0];
}

export function getUserPlan(user) {
  const planId = user?.subscription_plan || 'free';
  return getPlanById(planId);
}