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
};

export function isPromoActive() {
  return PROMO.active && new Date() <= PROMO.deadline;
}

// Apply the discount and round UP to a whole dollar (never add cents).
export function discountedPrice(amount) {
  if (!isPromoActive() || !amount) return amount;
  const discounted = amount * (1 - PROMO.discountPct / 100);
  return Math.ceil(discounted);
}