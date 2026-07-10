// ── Launch promotion config ──────────────────────────────────
// Single source of truth for the -15% launch offer.
// Toggle `PROMO_ACTIVE` off (or pass today's date past the deadline) to hide everything.

export const PROMO = {
  active: true,
  discountPct: 15,
  // Offer runs until Aug 1st.
  deadline: new Date('2026-08-01T23:59:59'),
  bannerText: 'Launch offer: 15% off all plans until August 1st.',
  badgeText: '-15%',
  // Per-plan Stripe promotion code IDs — applied at checkout.
  stripePromoCodes: {
    starter: 'promo_1TrYzjGzhCsAbRD1fgcsKL6F',
    pro: 'promo_1TrZ0SGzhCsAbRD1sqxFOV7a',
    elite: 'promo_1TrZ1XGzhCsAbRD1Hrg7GJ2s',
  },
};

/** Returns the Stripe promo code id for a given plan, or undefined. */
export function getPromoCodeForPlan(planId) {
  if (!isPromoActive()) return undefined;
  return PROMO.stripePromoCodes[planId];
}

export function isPromoActive() {
  return PROMO.active && new Date() <= PROMO.deadline;
}

// Apply the discount and round UP to a whole dollar.
// $49→$42, $99→$85, $299→$255 (matches Stripe promo code charge).
export function discountedPrice(amount) {
  if (!isPromoActive() || !amount) return amount;
  const discounted = amount * (1 - PROMO.discountPct / 100);
  return Math.ceil(discounted);
}

// Format a price for display — shows whole dollars without decimals, cents otherwise.
export function formatPrice(amount) {
  if (amount === null || amount === undefined) return '$0';
  if (Number.isInteger(amount)) return `$${amount}`;
  return `$${amount.toFixed(2)}`;
}