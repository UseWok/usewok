import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const LANG_KEY = 'stensor_lang';

export const TRANSLATIONS = {
  en: {
    home: 'Home', parcours: 'Learning Path', community: 'Community', administration: 'Administration',
    pricing_badge: 'STENSOR — AI FINANCE', back_to_plans: 'Back to plans',
    subscription: 'Subscription', included_features: 'Included features',
    annual_only: 'Annual only', annual_savings_feature: 'Save {saved}$/year vs monthly',
    continue_checkout: 'Continue to checkout', cancel_cart: 'Cancel',
    payment_not_configured: 'Payment not configured', payment_not_configured_sub: 'Add a Stripe redirect URL in the admin panel to enable real payments.',
    demo_activate: 'Activate (demo)', cancel: 'Cancel',
    internet_included: 'Internet included', internet_not_included: 'No Internet',
    file_upload_feature: 'File uploads', model_choice_feature: 'Model choice',
    unlimited_discussions: 'Unlimited discussions', premium_support_feature: 'Premium support',
    shareable_credits_feature: '{n} shareable credits/year',
    annual_discount_feature: 'Annual discount', exclusive_promo_feature: 'Exclusive promotions',
    resume_cart: '🛒 Resume your cart',
    rename: 'Rename', delete: 'Delete',
    upgrade: 'Upgrade', tensors: 'Flash', notifications: 'Notifications',
    hero_title: 'Your AI Financial Coach', hero_subtitle: 'Available 24/7 · Confidential · Faster than a human advisor',
    hero_badge: 'STENSOR — FINANCE AI', hero_placeholder: 'Ask your financial question… (@ for agents)',
    hero_start: 'Get Started →', hero_topics: 'Popular topics',
    topics: ['Budget & Expenses', 'Investment', 'Savings', 'Retirement', 'Tax Planning'],
    mode_fast: 'Fast', mode_thinking: 'Standard', mode_pro: 'Advanced', mode_ultimate: 'Expert',
    mode_fast_desc: 'Quick & efficient', mode_thinking_desc: 'Deep reasoning', mode_pro_desc: 'Advanced analysis', mode_ultimate_desc: 'Most powerful',
    global_agent: "Knowing exactly where I'm going", emotions_agent: 'Spend without guilt', wealth_agent: 'Becoming financially free',
    send_message: 'Message… (@ for agents & modes)',
    tensors_used: '{used}/{total} flash used', attach_file: 'Attach a file', agent: 'Agent', mode: 'Mode',
    internet: 'Internet', thinking: 'Processing…',
    tensors_exhausted: 'Flash exhausted this month', tensors_low: 'Running low on flash',
    upgrade_to_continue: 'Upgrade to continue',
    free_delay_msg: '⏳ Free plan — Paid plans respond instantly',
    upgrade_banner_title: 'Switch to Advanced', upgrade_banner_sub: 'Unlock all modes and AI agents',
    velvet_wall: 'You\'ve used all {limit} flash this month. Switch to {plan} for {credits} flash and Internet search →',
    truncated_msg: 'Full response available with the Advanced plan.',
    see_more: 'See full response →',
    pro_comparison: '✨ With Advanced mode, this response would be 3× more detailed.',
    milestone_msg: '🎉 You love Stensor! {count} conversations done. Advanced gives you Internet search + exclusive lessons.',
    daily_limit_msg: 'Daily tensors used 🕐 Resets in {hours}h — or upgrade to {plan} for unlimited daily usage.',
    pricing_title: 'Your AI Financial Coach, 24/7',
    pricing_sub: '1 flash = 1 AI response · Renewed monthly · Cancel anytime',
    monthly: 'Monthly', yearly: 'Yearly -20%',
    recommended: 'RECOMMENDED', current_plan: '✓ Current plan',
    free_cta: 'Start for free', choose_plan: 'Choose {name}',
    secure_payment: 'Secure payment · Cancel anytime · Instant access',
    put_level_up: 'Level Up', more_tensors: 'Get more tensors',
    tensors_label: 'Flash', low_tensors_warning: 'Only {remaining} flash left!',
    feature_preview: 'Unlockable Features', locked_feature: '🔒 {plan}',
    administration_title: 'Administration', manage_platform: 'Manage your Stensor platform',
    plans_tab: 'Plans', agents_tab: 'AI Agents', notifs_tab: 'Notifications', users_tab: 'Users',
    your_plan: 'YOUR PLAN', activate_test: 'Activate (test)',
    recent_discussions: 'Recent Discussions', see_all: 'See all',
    no_discussions: 'No discussions found', search_placeholder: 'Search…',
    learning_path: 'Your Learning Path', learning_sub: 'Master Stensor to maximize your financial results',
    locked: 'Locked', completed: 'Completed', in_progress: 'In Progress', available: 'Available',
    upgrade_to_unlock: 'Upgrade to unlock',
    no_notifications: 'No notifications',
    landing_not_sure: 'Not sure where to start?', landing_get_strategy: 'Get my strategy →',
    landing_pricing_title2: 'Plans for every ambition.',
    landing_pricing_sub2: 'A financial coach costs $200+/hr. Stensor starts free and scales with you.',
    landing_billing_monthly: 'Monthly', landing_billing_yearly: 'Yearly −20%',
    landing_compare_plans: 'Compare all plans',
    landing_stop_paying_title: 'Stop paying $200/hr for 1h of advice.',
    landing_unlimited_sub: 'Get unlimited, personalized financial guidance — starting free.',
    landing_start_free_cta: 'Start building for free', landing_features_badge: 'All Features',
    landing_features_title: 'Everything a financial AI coach can do.',
    landing_features_sub: 'Designed to give you a real edge on your finances — not just generic answers.',
    landing_features_cta: 'Ready to take control of your finances?',
    landing_features_start: 'Start building', landing_sign_in: 'Sign In', landing_get_started: 'Get Started',
    landing_most_popular: 'Most Popular · Essential', landing_best_value: 'Best Value',
    landing_coach_desc: 'A human coach charges $200+/hr for 1h/month. Stensor Essential gives unlimited access, 24/7, for a fraction of the price — and no judgment.',
    landing_10x_cheaper: '10× cheaper than 1 hour with a traditional financial advisor.',
    start_conversation: 'Start a conversation…', error_occurred: 'An error occurred. Please try again.',
    blocked_placeholder: 'Credits exhausted — upgrade to continue',
    credits_exhausted_month: 'Credits exhausted this month',
    upgrade_to_essential: 'Switch to Essential → 100 credits + no daily quota',
    upgrade_to_advanced: 'Switch to Advanced → 250 credits + Internet search',
    upgrade_to_higher_plan: 'Switch to a higher plan to continue',
    upgrade_overlay_title: 'Switch to Advanced',
    upgrade_not_available: 'is not available on your current plan.',
    upgrade_feature_internet: 'Real-time Internet', upgrade_feature_modes: 'Pro & Expert modes',
    upgrade_feature_files: 'File attachments', upgrade_feature_discussions: 'Unlimited discussions',
    see_plans: 'See plans →', continue_free: 'Continue on Free',
    ai_disclaimer: 'Stensor is an AI tool · Responses may contain errors',
    copied: 'Copied!', milestone_title: '🎉 You love Stensor!',
    milestone_sub: '10 messages sent. With Advanced, unlock real-time Internet search and exclusive lessons.',
    settings_title: 'Settings', settings_profile: 'Profile', settings_chat: 'Chat Settings',
    settings_plan: 'Plan & Billing', settings_usage: 'Tensor Usage',
    settings_email_label: 'Email address (read-only)', settings_fullname: 'Full name',
    settings_saving: 'Saving...', settings_save: 'Save',
    settings_delete_account: 'Delete account',
    settings_delete_irreversible: 'This action is irreversible. All your data will be permanently deleted.',
    settings_confirm_delete: 'Confirm deletion',
    settings_shortcut_label: 'Shortcut to send a message',
    settings_current_plan: 'Current plan', settings_manage_plan: 'Manage plan',
    settings_upgrade: 'Upgrade', settings_billing_history: 'Billing history',
    settings_tensors_month: 'Flash this month', settings_7days: 'Last 7 days',
    settings_activation_code: 'Activation code',
    settings_activation_desc: 'Enter a code received by email to activate a subscription.',
    settings_activate: 'Activate', settings_free_plan: 'Free plan', settings_plan_free: 'Free',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');

  const setLang = useCallback(() => {}, []);

  const t = useCallback((key, vars = {}) => {
    const dict = TRANSLATIONS.en;
    let str = dict[key] ?? TRANSLATIONS.en[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
    return str;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) return {
    lang: 'en',
    setLang: () => {},
    t: (key) => TRANSLATIONS.en[key] ?? key,
  };
  return ctx;
}