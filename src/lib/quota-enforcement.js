/**
 * Quota Enforcement — all checks are performed SERVER-SIDE via the quotaGuard
 * backend function. The frontend only displays the result; the analyze
 * functions enforce the same limits again on the server, so tampering with
 * client code cannot bypass quotas.
 */

import { base44 } from '@/api/base44Client';

async function guard(payload) {
  const res = await base44.functions.invoke('quotaGuard', payload);
  return res?.data || { allowed: true };
}

/**
 * IMPORTANT: on error, quotas fail CLOSED (allowed: false), never open.
 * A silent "allow" fallback would let usage slip through uncounted — exactly what must never happen.
 */

/** Scan quota for the current period. @returns {allowed, used, limit, period, reason} */
export async function checkScanQuota(_user, siteUrl) {
  try { return await guard({ action: 'scan', site_url: siteUrl || null }); }
  catch { return { allowed: false, used: 0, limit: 1, period: 'month', reason: 'quota_check_failed' }; }
}

/** Chatbot message quota for the current month. @returns {allowed, used, limit} */
export async function checkChatQuota() {
  try { return await guard({ action: 'chat' }); }
  catch { return { allowed: false, used: 0, limit: 5, reason: 'quota_check_failed' }; }
}

/** Concurrent monitored-sites quota. @returns {allowed, used, limit} */
export async function checkSiteQuota() {
  try { return await guard({ action: 'site' }); }
  catch { return { allowed: false, used: 0, limit: 1, reason: 'quota_check_failed' }; }
}

/** History window (days) allowed by the user's plan. @returns {history_days, plan} */
export async function getHistoryWindow() {
  try { return await guard({ action: 'history' }); }
  catch { return { history_days: 30, plan: 'free' }; }
}