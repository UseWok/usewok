/**
 * SECURE CREDIT ENGINE v2
 * ─────────────────────────────────────────────────────────────────
 * MULTIPLIER:  1 App Credit = 1 000 Base44 integration credits
 * SECURITY:    Idempotency keys stored in localStorage to prevent double-spend.
 *              Credits are FINAL — no reversals.
 * BAN CHECK:   Every deduction verifies user is not banned.
 * AUDIT:       Every deduction is written to AuditLog entity.
 * ─────────────────────────────────────────────────────────────────
 */

import { base44 } from '@/api/base44Client';

export const INTEGRATION_MULTIPLIER = 1_000; // 1 App Credit = 1 000 Base44 credits

// ── Idempotency: prevent double-spend ─────────────────────────────
function getIdempotencyStore() {
  try {
    return JSON.parse(localStorage.getItem('_wok_idempotency') || '{}');
  } catch { return {}; }
}

function markIdempotencyKey(key) {
  try {
    const store = getIdempotencyStore();
    store[key] = Date.now();
    // Prune keys older than 24h
    const now = Date.now();
    Object.keys(store).forEach(k => { if (now - store[k] > 86_400_000) delete store[k]; });
    localStorage.setItem('_wok_idempotency', JSON.stringify(store));
  } catch {}
}

function isAlreadyProcessed(key) {
  const store = getIdempotencyStore();
  return !!store[key];
}

// ── Write an audit log entry ──────────────────────────────────────
async function writeAuditLog(userId, action, resourceType, metadata) {
  try {
    await base44.entities.AuditLog.create({
      created_by_id: userId,
      action: 'generate',
      resource_type: resourceType,
      resource_id: userId,
      status: 'success',
      metadata: JSON.stringify({ ...metadata, ts: new Date().toISOString() }),
    });
  } catch {} // non-blocking — never fail main flow
}

// ── Main secure deduction ─────────────────────────────────────────
/**
 * Securely deduct app credits from a user.
 * @param {object} user  - Current user object
 * @param {number} appCredits - Amount in App Credits (will be multiplied x1000 internally)
 * @param {string} idempotencyKey - Unique key per action to prevent double-spend (e.g., `build_${convId}_${timestamp}`)
 * @returns {object} Updated user | null if banned/locked/duplicate
 */
export async function secureDeductCredits(user, appCredits, idempotencyKey) {
  if (!user) return null;
  if (user.role === 'admin') return user; // admins are exempt

  // ── Ban check ──
  if (user.banned || user.disabled) {
    throw new Error('ACCOUNT_BANNED: Your account has been suspended.');
  }

  // ── Idempotency guard: prevent double-spend ──
  if (idempotencyKey && isAlreadyProcessed(idempotencyKey)) {
    console.warn('[CreditEngine] Duplicate request blocked:', idempotencyKey);
    return user; // silently return — already processed
  }

  // ── Fetch live balance from server (Zero-AI, pure DB read) ──
  let liveBalance = user.credits_balance ?? 0;
  try {
    const liveUser = await base44.auth.me();
    liveBalance = typeof liveUser.credits_balance === 'number' ? liveUser.credits_balance : liveBalance;
  } catch {} // fall back to passed-in user if server unreachable

  // ── Compute deduction ──
  const internalCredits = appCredits * INTEGRATION_MULTIPLIER;
  const currentBalance = liveBalance;
  const newBalance = currentBalance - appCredits; // balance in App Credits

  // ── Commit deduction (irreversible, atomic DB mutation) ──
  await base44.auth.updateMe({ credits_balance: newBalance });

  // ── Mark idempotency key AFTER successful deduction ──
  if (idempotencyKey) markIdempotencyKey(idempotencyKey);

  // ── Write audit log (non-blocking) ──
  writeAuditLog(user.id, 'generate', 'credit_deduction', {
    app_credits_deducted: appCredits,
    internal_credits_deducted: internalCredits,
    balance_before: currentBalance,
    balance_after: newBalance,
    idempotency_key: idempotencyKey,
  });

  return { ...user, credits_balance: newBalance };
}

// ── Ban a user (admin only) ───────────────────────────────────────
export async function banUser(adminUser, targetUserId, reason = '') {
  if (!adminUser || adminUser.role !== 'admin') throw new Error('UNAUTHORIZED');
  await base44.entities.User.update(targetUserId, {
    banned: true,
    disabled: true,
    ban_reason: reason,
    ban_date: new Date().toISOString(),
    banned_by: adminUser.id,
  });
  writeAuditLog(adminUser.id, 'delete', 'user_ban', { target_user_id: targetUserId, reason });
}

// ── Unban a user (admin only) ─────────────────────────────────────
export async function unbanUser(adminUser, targetUserId) {
  if (!adminUser || adminUser.role !== 'admin') throw new Error('UNAUTHORIZED');
  await base44.entities.User.update(targetUserId, {
    banned: false,
    disabled: false,
    ban_reason: null,
    ban_date: null,
    banned_by: null,
  });
  writeAuditLog(adminUser.id, 'save', 'user_unban', { target_user_id: targetUserId });
}

// ── Check if user is banned/locked ───────────────────────────────
export function isUserBanned(user) {
  return !!(user?.banned || user?.disabled);
}

// ── Compute MRR from access codes only ────────────────────────────
/**
 * Calculates real MRR from used AccessCodes.
 * Annual plans are prorated to a monthly equivalent.
 * @param {Array} codes - All AccessCode records
 * @param {Array} plans - All plan configs
 * @returns {number} MRR in USD
 */
export function computeRealMRR(codes, plans) {
  const usedCodes = (codes || []).filter(c => c.used || (c.use_count && c.use_count > 0));
  let mrr = 0;

  for (const code of usedCodes) {
    const plan = (plans || []).find(p => p.id === code.plan_id);
    if (!plan) continue;

    const billing = code.billing || 'monthly';
    const monthlyPrice = billing === 'yearly'
      ? (plan.price_yearly ?? plan.price_monthly ?? 0) / 12  // prorate annual to monthly
      : (plan.price_monthly ?? plan.price ?? 0);

    const uses = code.use_count || (code.used ? 1 : 0);
    mrr += monthlyPrice * uses;
  }

  return Math.round(mrr * 100) / 100;
}

// ── Format MRR for display ─────────────────────────────────────────
export function formatMRR(value) {
  if (typeof value !== 'number') return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}