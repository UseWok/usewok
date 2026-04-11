// Shared utility for the 48h welcome offer
export const OFFER_HOURS = 48;
export const OFFER_DISMISS_KEY = 'stensor_welcome_dismissed';
export const EVENT_URLS_KEY = 'checkout_urls_event';
export const ELIGIBLE_PLANS = ['advanced', 'expert', 'supreme']; // Only yearly

export function getOfferExpiry(user) {
  if (!user?.created_date) return null;
  return new Date(user.created_date).getTime() + OFFER_HOURS * 3600 * 1000;
}

export function isOfferActive(user) {
  if (!user) return false;
  // Paid users never see the offer
  const plan = user.subscription_plan;
  if (plan && plan !== 'free') return false;
  const dismissed = localStorage.getItem(OFFER_DISMISS_KEY);
  if (dismissed) return false;
  const expiry = getOfferExpiry(user);
  if (!expiry) return false;
  return Date.now() < expiry;
}

export function isEligibleForDiscount(planId, billing) {
  return billing === 'yearly' && ELIGIBLE_PLANS.includes(planId);
}

export function getDiscountedPrice(price) {
  return Math.round(price * 0.7 * 100) / 100;
}