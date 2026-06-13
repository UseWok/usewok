/**
 * lib/credits.js
 * Cloud-synced credit engine — all state lives in the User entity.
 *
 * FREE PLAN defaults:
 *   credits_balance : 150 000   (reset every 30 days)
 *   credits_reset_at: ISO date of next reset
 *
 * PRICING MATRIX:
 *   Flash / Build       : 75 000
 *   Flash / Modify      : 30 000
 *   Max   / Build       : 100 000
 *   Max   / Modify      : 45 000
 *
 * OVERDRAFT: action always allowed; balance goes negative.
 * LOCKOUT:   balance <= 0 → no new message allowed.
 * RENEWAL:   debt carried over (newBalance = 150 000 - |debt|).
 */

import { base44 } from '@/api/base44Client';
import { PLAN_CREDIT_LIMITS } from './plans-config';

// ── Pricing matrix ──────────────────────────────────────────────
export const CREDIT_COSTS = {
  Flash: { build: 75_000, modify: 30_000 },
  Max:   { build: 100_000, modify: 45_000 },
};

export const FREE_PLAN_CREDITS = 150_000;
export const RESET_INTERVAL_DAYS = 30;

// ── Get the monthly credit limit for a user based on their plan ──
export function getPlanCreditLimit(user) {
  const planId = user?.subscription_plan || 'free';
  return PLAN_CREDIT_LIMITS[planId] ?? FREE_PLAN_CREDITS;
}

// ── Compute cost for a given action ────────────────────────────
export function computeCreditCost(buildMode = 'Flash', isModification = false) {
  const tier = CREDIT_COSTS[buildMode] || CREDIT_COSTS.Flash;
  return isModification ? tier.modify : tier.build;
}

// ── Check if user is locked (used >= plan limit) ──────────────────────
export function isUserLocked(user) {
  if (!user) return false;
  if (user.role === 'admin') return false;
  const balance = user.credits_balance ?? getPlanCreditLimit(user);
  return balance <= 0;
}

// ── Initialize credits for a new user (or user missing credits) ─
export async function initUserCredits(user) {
  if (!user) return;
  const hasCreditField = typeof user.credits_balance === 'number';
  const updates = {};
  if (!user.subscription_plan) updates.subscription_plan = 'free';
  if (!hasCreditField) {
    updates.credits_balance = getPlanCreditLimit({ ...user, subscription_plan: user.subscription_plan || 'free' });
    updates.credits_reset_at = new Date(Date.now() + RESET_INTERVAL_DAYS * 86_400_000).toISOString();
  }
  if (Object.keys(updates).length > 0) await base44.auth.updateMe(updates);
}

// ── Check if renewal is due, apply it, return updated user ──────
export async function checkAndRenewCredits(user) {
  if (!user || user.role === 'admin') return user;
  const resetAt = user.credits_reset_at ? new Date(user.credits_reset_at) : null;
  if (!resetAt || Date.now() < resetAt.getTime()) return user;

  // Renewal due — carry over any debt, use plan's actual limit
  const currentBalance = user.credits_balance ?? 0;
  const debt = currentBalance < 0 ? Math.abs(currentBalance) : 0;
  const planLimit = getPlanCreditLimit(user);
  const newBalance = planLimit - debt;
  const nextReset = new Date(Date.now() + RESET_INTERVAL_DAYS * 86_400_000).toISOString();

  await base44.auth.updateMe({
    credits_balance: newBalance,
    credits_reset_at: nextReset,
  });

  return { ...user, credits_balance: newBalance, credits_reset_at: nextReset };
}

// ── Deduct credits (overdraft allowed) — authoritative DB mutation ─
// Fetches the LIVE balance from the server before deducting to prevent
// race conditions and stale-state drift between sessions.
export async function deductCredits(user, cost) {
  if (!user || user.role === 'admin') return user;
  // Re-fetch the latest user state to get the real server-side balance
  let liveUser = user;
  try {
    liveUser = await base44.auth.me();
  } catch {
    // Fall back to passed-in user if me() fails
    liveUser = user;
  }
  const current = typeof liveUser.credits_balance === 'number' ? liveUser.credits_balance : FREE_PLAN_CREDITS;
  const newBalance = current - cost;
  await base44.auth.updateMe({ credits_balance: newBalance });
  return { ...liveUser, credits_balance: newBalance };
}

// ── Format next renewal date for display ────────────────────────
export function formatResetDate(user) {
  const iso = user?.credits_reset_at;
  if (!iso) return null;
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year} UTC`;
}

// ── Format balance for display (e.g. "120 000") ─────────────────
export function formatBalance(balance) {
  if (typeof balance !== 'number') return '—';
  return balance.toLocaleString('fr-FR');
}