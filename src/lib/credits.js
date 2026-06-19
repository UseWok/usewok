/**
 * lib/credits.js — Client-side credit helpers
 * La source de vérité est le BACKEND (creditEngine function).
 * Le client appelle le backend pour déduire/obtenir le solde.
 * Direction compteur: 0 → limit (crédits consommés, jamais à rebours)
 */

import { base44 } from '@/api/base44Client';
import { PLAN_CREDIT_LIMITS } from './plans-config';

// ── Coûts par action ──────────────────────────────────────────────
export const CREDIT_COSTS = {
  Flash: { build: 75_000, modify: 30_000 },
  Max:   { build: 100_000, modify: 45_000 },
};

export const FREE_PLAN_CREDITS = 150_000;
export const RESET_INTERVAL_DAYS = 30;

export function getPlanCreditLimit(user) {
  const planId = user?.subscription_plan || 'free';
  return PLAN_CREDIT_LIMITS[planId] ?? FREE_PLAN_CREDITS;
}

export function computeCreditCost(buildMode = 'Flash', isModification = false) {
  const tier = CREDIT_COSTS[buildMode] || CREDIT_COSTS.Flash;
  return isModification ? tier.modify : tier.build;
}

// ── Never hard-locked — users can exceed quota, renewal will reset
export function isUserLocked(user) {
  return false;
}

// ── Initialiser les crédits d'un nouvel utilisateur via backend ──
// No exemptions — all users (including admins) must have credits initialized
export async function initUserCredits(user) {
  if (!user) return;
  // Always call backend to init if missing — no exemptions for any role
  if (typeof user.credits_used !== 'number' || typeof user.credits_limit !== 'number' || !user.credits_reset_at) {
    try {
      await base44.functions.invoke('creditEngine', { action: 'renew' });
    } catch {}
  }
}

// ── Vérifier et renouveler si le cycle est dépassé ──────────────
export async function checkAndRenewCredits(user) {
  if (!user) return user;
  const resetAt = user.credits_reset_at ? new Date(user.credits_reset_at) : null;
  if (!resetAt || Date.now() < resetAt.getTime()) return user;

  // Cycle dépassé → appeler le backend pour renouveler
  try {
    const result = await base44.functions.invoke('creditEngine', { action: 'renew' });
    if (result?.data?.success) {
      return {
        ...user,
        credits_used: 0,
        credits_limit: result.data.credits_limit,
        credits_reset_at: result.data.credits_reset_at,
      };
    }
  } catch {}
  return user;
}

// ── Déduire des crédits via le backend (autoritaire) ─────────────
export async function deductCredits(user, cost, idempotencyKey, isNewBuild = false) {
  if (!user) return user;
  try {
    const result = await base44.functions.invoke('creditEngine', {
      action: 'deduct',
      cost,
      idempotency_key: idempotencyKey || null,
      is_new_build: isNewBuild,
    });
    if (result?.data?.success) {
      return {
        ...user,
        credits_used: result.data.credits_used,
        credits_limit: result.data.credits_limit,
        project_count: result.data.project_count,
      };
    }
  } catch (err) {
    if (err?.response?.data?.error === 'LIMIT_REACHED') {
      throw new Error('LIMIT_REACHED');
    }
  }
  return user;
}

// ── Obtenir le solde depuis le backend ───────────────────────────
export async function fetchCreditsFromBackend() {
  try {
    const result = await base44.functions.invoke('creditEngine', { action: 'get' });
    return result?.data || null;
  } catch { return null; }
}

// ── Format date de renouvellement ────────────────────────────────
export function formatResetDate(user) {
  const iso = user?.credits_reset_at;
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Format balance ────────────────────────────────────────────────
export function formatBalance(balance) {
  if (typeof balance !== 'number') return '—';
  return balance.toLocaleString('fr-FR');
}