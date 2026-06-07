/**
 * lib/accountAge.js
 * ACCOUNT AGE CHECK — Security Layer Step 5
 *
 * Brand-new accounts are a strong signal of throwaway fraud / bot accounts.
 * This check calculates account age and assigns a risk level.
 *
 * Risk levels:
 *  CRITICAL  — < 2.4 hours  (score 100) → block generation
 *  HIGH      — < 24 hours   (score 80)  → allow but flag for monitoring
 *  MEDIUM    — < 7 days     (score 40)  → allow
 *  LOW       — >= 7 days    (score 0)   → allow, trusted account
 *
 * Uses base44.auth.me() — no external API call.
 */

import { base44 } from '@/api/base44Client';

const THRESHOLDS = {
  CRITICAL_DAYS: 0.1,  // 0.1 day = 2.4 hours
  HIGH_DAYS: 1,        // 1 day
  MEDIUM_DAYS: 7,      // 1 week
};

/**
 * Checks the current authenticated user's account age.
 *
 * @returns {Promise<{ risk: 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW', score: number, ageDays: number }>}
 */
export const checkAccountAge = async () => {
  let user;
  try {
    user = await base44.auth.me();
  } catch {
    // If we can't fetch the user, fail safe — treat as unknown risk (MEDIUM)
    console.warn('[Security] Could not fetch user for account age check.');
    return { risk: 'MEDIUM', score: 40, ageDays: -1 };
  }

  // base44 built-in field: created_date (ISO string)
  const createdRaw = user?.created_date;
  if (!createdRaw) {
    // No creation date available — assume LOW risk (legacy / admin account)
    return { risk: 'LOW', score: 0, ageDays: -1 };
  }

  const createdMs = new Date(createdRaw).getTime();
  if (isNaN(createdMs)) {
    return { risk: 'LOW', score: 0, ageDays: -1 };
  }

  const ageDays = (Date.now() - createdMs) / (1000 * 60 * 60 * 24);

  if (ageDays < THRESHOLDS.CRITICAL_DAYS) {
    return { risk: 'CRITICAL', score: 100, ageDays };
  }
  if (ageDays < THRESHOLDS.HIGH_DAYS) {
    return { risk: 'HIGH', score: 80, ageDays };
  }
  if (ageDays < THRESHOLDS.MEDIUM_DAYS) {
    return { risk: 'MEDIUM', score: 40, ageDays };
  }
  return { risk: 'LOW', score: 0, ageDays };
};