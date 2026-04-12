import { base44 } from '@/api/base44Client';

const REF_KEY = 'stensor_pending_ref';
const TENSORS_PER_REFERRAL = 5;

/**
 * Capture a referral ID from URL and save to localStorage.
 * Call this on app load when ?ref=userId is present.
 */
export function captureReferralFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const refId = params.get('ref');
    if (refId && refId.length > 5) {
      localStorage.setItem(REF_KEY, refId);
    }
  } catch {}
}

/**
 * Complete the referral after the user's first message.
 * - Creates a Referral record (pending → completed)
 * - Gifts TENSORS_PER_REFERRAL bonus credits to the referrer
 */
export async function completeReferralOnFirstMessage(currentUserId) {
  if (!currentUserId) return;
  try {
    const referrerId = localStorage.getItem(REF_KEY);
    if (!referrerId || referrerId === currentUserId) return;

    // Avoid double-crediting: check if referral already exists
    const existing = await base44.entities.Referral.filter({
      referrer_id: referrerId,
      referee_email: currentUserId,
    });
    if (existing.length > 0) return;

    // Get current user email for the referee_email field
    const me = await base44.auth.me();
    if (!me) return;

    // Create completed referral record
    await base44.entities.Referral.create({
      referrer_id: referrerId,
      referee_email: me.email,
      status: 'completed',
    });

    // Gift credits to referrer
    const referrerList = await base44.entities.User.filter({ id: referrerId });
    if (referrerList.length > 0) {
      const referrer = referrerList[0];
      const newBonus = (referrer.credits_bonus || 0) + TENSORS_PER_REFERRAL;
      await base44.entities.User.update(referrer.id, { credits_bonus: newBonus });
    }

    // Clear the pending ref
    localStorage.removeItem(REF_KEY);
  } catch {}
}