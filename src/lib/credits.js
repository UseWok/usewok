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

// ── Pricing matrix ──────────────────────────────────────────────
export const CREDIT_COSTS = {
  Flash: { build: 75_000, modify: 30_000 },
  Max:   { build: 100_000, modify: 45_000 },
};

export const FREE_PLAN_CREDITS = 150_000;
export const RESET_INTERVAL_DAYS = 30;

// ── Compute cost for a given action ────────────────────────────
export function computeCreditCost(buildMode = 'Flash', isModification = false) {
  const tier = CREDIT_COSTS[buildMode] || CREDIT_COSTS.Flash;
  return isModification ? tier.modify : tier.build;
}

// ── Check if user is locked (balance <= 0) ──────────────────────
export function isUserLocked(user) {
  if (!user) return false;
  if (user.role === 'admin') return false;
  const balance = user.credits_balance ?? FREE_PLAN_CREDITS;
  return balance <= 0;
}

// ── Initialize credits for a new user (or user missing credits) ─
export async function initUserCredits(user) {
  if (!user) return;
  const hasCreditField = typeof user.credits_balance === 'number';
  // Ensure subscription_plan defaults to 'free'
  const updates = {};
  if (!user.subscription_plan) updates.subscription_plan = 'free';
  if (!hasCreditField) {
    updates.credits_balance = FREE_PLAN_CREDITS;
    updates.credits_reset_at = new Date(Date.now() + RESET_INTERVAL_DAYS * 86_400_000).toISOString();
  }
  if (Object.keys(updates).length > 0) await base44.auth.updateMe(updates);
}

// ── Check if renewal is due, apply it, return updated user ──────
export async function checkAndRenewCredits(user) {
  if (!user || user.role === 'admin') return user;
  const resetAt = user.credits_reset_at ? new Date(user.credits_reset_at) : null;
  if (!resetAt || Date.now() < resetAt.getTime()) return user;

  // Renewal due — carry over any debt
  const currentBalance = user.credits_balance ?? 0;
  const debt = currentBalance < 0 ? Math.abs(currentBalance) : 0;
  const newBalance = FREE_PLAN_CREDITS - debt;
  const nextReset = new Date(Date.now() + RESET_INTERVAL_DAYS * 86_400_000).toISOString();

  await base44.auth.updateMe({
    credits_balance: newBalance,
    credits_reset_at: nextReset,
  });

  return { ...user, credits_balance: newBalance, credits_reset_at: nextReset };
}

// ── Deduct credits (overdraft allowed) — returns updated balance ─
export async function deductCredits(user, cost) {
  if (!user || user.role === 'admin') return user;
  const current = user.credits_balance ?? FREE_PLAN_CREDITS;
  const newBalance = current - cost;
  await base44.auth.updateMe({ credits_balance: newBalance });
  return { ...user, credits_balance: newBalance };
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