/**
 * lib/velocitySimple.js
 * VELOCITY TRACKER — Security Layer Step 6
 *
 * Tracks how many requests a user makes per hour.
 * A high velocity in a short window is a strong bot signal.
 *
 * Window: 1 hour (3600 seconds). Limit: 50 requests per hour.
 *
 * Difference from simpleLimiter.js:
 *  - simpleLimiter: 5 req / 1 minute (burst protection)
 *  - velocitySimple: 50 req / 1 hour  (sustained abuse protection)
 *
 * Both are needed — a bot could stay under the per-minute limit
 * while still making hundreds of requests per hour.
 */

// Module-level store: userId → array of timestamps (ms)
const velocityLog = new Map();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 50;           // per hour

/**
 * Records a request and checks whether the user has exceeded
 * the hourly velocity limit.
 *
 * @param {string} userId
 * @returns {{ blocked: boolean, reason?: string, remaining?: number }}
 */
export const checkVelocity = (userId) => {
  if (!userId) return { blocked: true, reason: 'Unknown user.' };

  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  // Purge timestamps older than the window (memory efficiency)
  const timestamps = (velocityLog.get(userId) || []).filter((t) => t > cutoff);

  if (timestamps.length >= MAX_REQUESTS) {
    // Calculate minutes until the oldest entry expires
    const oldestTs = timestamps[0];
    const waitMin = Math.ceil((oldestTs + WINDOW_MS - now) / 60000);
    return {
      blocked: true,
      reason: `Hourly request limit reached. Please wait approximately ${waitMin} minute${waitMin !== 1 ? 's' : ''}.`,
    };
  }

  // Record this request
  timestamps.push(now);
  velocityLog.set(userId, timestamps);

  return {
    blocked: false,
    remaining: MAX_REQUESTS - timestamps.length,
  };
};