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

/** Scan quota for the current period. @returns {allowed, used, limit, period, reason} */
export async function checkScanQuota(_user, siteUrl) {
  try { return await guard({ action: 'scan', site_url: siteUrl || null }); }
  catch { return { allowed: true, used: 0, limit: 1, period: 'month' }; }
}

/** Chatbot message quota for the current month. @returns {allowed, used, limit} */
export async function checkChatQuota() {
  try { return await guard({ action: 'chat' }); }
  catch { return { allowed: true, used: 0, limit: 5 }; }
}

/** Concurrent monitored-sites quota. @returns {allowed, used, limit} */
export async function checkSiteQuota() {
  try { return await guard({ action: 'site' }); }
  catch { return { allowed: true, used: 0, limit: 1 }; }
}

/** History window (days) allowed by the user's plan. @returns {history_days, plan} */
export async function getHistoryWindow() {
  try { return await guard({ action: 'history' }); }
  catch { return { history_days: 30, plan: 'free' }; }
}