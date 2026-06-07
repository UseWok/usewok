/**
 * lib/cacheManager.js
 * Utilities to inspect, evict, and clear the AI Builder localStorage cache.
 *
 * BASE44 CONSTRAINT: No server-side storage — everything lives in localStorage.
 * Hard limits: ~5 MB per item, ~10 MB total (browser-dependent).
 */

import { AI_CONFIG } from './config';

// ─────────────────────────────────────────────
// 1. STORAGE SIZE INSPECTION
// ─────────────────────────────────────────────

/**
 * Returns how much localStorage is in use (rough estimate via Blob).
 * @returns {{ usedMB: string, limitMB: number, isFull: boolean }}
 */
export const getCacheStatus = () => {
  try {
    const used = new Blob(Object.values(localStorage)).size / 1024 / 1024;
    return {
      usedMB: used.toFixed(2),
      limitMB: AI_CONFIG.MAX_STORAGE_MB,
      isFull: used > AI_CONFIG.STORAGE_EVICTION_THRESHOLD_MB,
    };
  } catch {
    // If Blob fails (some browsers), fall back to string-length estimate
    let chars = 0;
    for (const key in localStorage) chars += (localStorage.getItem(key) || '').length;
    const usedMB = (chars * 2) / 1024 / 1024; // UTF-16 = 2 bytes per char
    return {
      usedMB: usedMB.toFixed(2),
      limitMB: AI_CONFIG.MAX_STORAGE_MB,
      isFull: usedMB > AI_CONFIG.STORAGE_EVICTION_THRESHOLD_MB,
    };
  }
};

// ─────────────────────────────────────────────
// 2. EVICT OLDEST CONTEXT CACHE ENTRY
// ─────────────────────────────────────────────

/**
 * Finds and removes the oldest AI Builder context cache entry.
 * Called automatically when storage exceeds the threshold.
 */
export const clearOldestContextCache = () => {
  let oldest = { key: null, timestamp: Infinity };

  for (const key in localStorage) {
    if (!key.startsWith(AI_CONFIG.CACHE_KEY_PREFIX)) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      // Use lastAccessed if available, otherwise fall back to creation timestamp
      const ts = data.lastAccessed || data.timestamp || Infinity;
      if (ts < oldest.timestamp) {
        oldest = { key, timestamp: ts };
      }
    } catch {
      // Corrupt entry — remove it immediately
      localStorage.removeItem(key);
    }
  }

  if (oldest.key) {
    localStorage.removeItem(oldest.key);
    console.log(`[CacheManager] Evicted oldest cache: ${oldest.key}`);
    return oldest.key;
  }
  return null;
};

// ─────────────────────────────────────────────
// 3. CLEAR ALL AI BUILDER CACHE
// ─────────────────────────────────────────────

/**
 * Removes every key that belongs to the AI Builder cache namespace.
 * Use this as a hard reset (e.g., settings page "Clear AI cache" button).
 */
export const clearAllAICache = () => {
  const keys = Object.keys(localStorage).filter(
    (k) => k.startsWith(AI_CONFIG.CACHE_KEY_PREFIX) || k.startsWith('aibuilder_')
  );
  keys.forEach((k) => localStorage.removeItem(k));
  console.log(`[CacheManager] Cleared ${keys.length} cache entries.`);
  return keys.length;
};

// ─────────────────────────────────────────────
// 4. SAFE WRITE WITH OVERFLOW PROTECTION
// ─────────────────────────────────────────────

/**
 * Safely writes a value to localStorage.
 * If storage is full, evicts the oldest context cache first, then retries once.
 *
 * @param {string} key
 * @param {any} value — will be JSON.stringify'd
 * @returns {boolean} true if written successfully
 */
export const safeLocalStorageSet = (key, value) => {
  const serialized = JSON.stringify(value);

  // Guard: single item must not exceed ~5 MB
  const itemSizeMB = (serialized.length * 2) / 1024 / 1024;
  if (itemSizeMB > 5) {
    console.warn(`[CacheManager] Item too large (${itemSizeMB.toFixed(2)} MB), skipping cache write.`);
    return false;
  }

  try {
    localStorage.setItem(key, serialized);
    return true;
  } catch (e) {
    // QuotaExceededError — evict oldest and retry once
    console.warn('[CacheManager] Storage full, evicting oldest entry…');
    clearOldestContextCache();
    try {
      localStorage.setItem(key, serialized);
      return true;
    } catch {
      console.error('[CacheManager] Storage still full after eviction. Cannot cache.');
      return false;
    }
  }
};