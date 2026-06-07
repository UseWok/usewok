/**
 * lib/simpleLimiter.js
 * CLIENT-SIDE RATE LIMITING — Security Layer Step 2
 *
 * Tracks per-user request timestamps in a module-level Map.
 * Window: 1 minute (60 seconds). Limit: 5 requests per minute.
 *
 * Why Map and not localStorage?
 * localStorage reads/writes are synchronous and slow (~1ms each).
 * A module-level Map is in-memory and effectively instant (<0.01ms).
 * The trade-off: resets on page reload — acceptable for short windows.
 */

// Module-level store: userId → array of timestamps (ms)
// Persists across React re-renders but resets on full page reload.
const requestLog = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;       // per window

/**
 * Checks whether a user is within the allowed request rate.
 * Automatically purges timestamps older than the window before checking.
 *
 * @param {string} userId
 * @returns {{ allowed: boolean, wait?: string }}
 */
export const checkLimit = (userId) => {
  if (!userId) return { allowed: false, wait: 'Unknown user.' };

  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  // Get existing timestamps, filter out expired ones
  const timestamps = (requestLog.get(userId) || []).filter((t) => t > cutoff);

  if (timestamps.length >= MAX_REQUESTS) {
    // Calculate how many seconds until the oldest request expires
    const oldestTs = timestamps[0];
    const waitSec = Math.ceil((oldestTs + WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      wait: `Too many requests. Please wait ${waitSec} second${waitSec !== 1 ? 's' : ''} before trying again.`,
    };
  }

  // Record this request
  timestamps.push(now);
  requestLog.set(userId, timestamps);

  return { allowed: true };
};