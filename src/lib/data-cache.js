// ─────────────────────────────────────────────────────────────
// Global in-memory data cache — kills the "flicker on every page"
// problem by serving already-known data instantly while a fresh
// copy loads silently in the background (stale-while-revalidate).
//
// Nothing here changes WHAT is loaded — only avoids re-loading
// the same slow cloud data from scratch on every navigation.
// ─────────────────────────────────────────────────────────────
import { base44 } from '@/api/base44Client';

const store = new Map();          // key -> { data, ts }
const inflight = new Map();       // key -> Promise (dedupes concurrent loads)
const TTL = 60 * 1000;            // background revalidate window (1 min)

/** Synchronous peek — returns cached value or undefined (no network). */
export function peekCache(key) {
  const entry = store.get(key);
  return entry ? entry.data : undefined;
}

export function isFresh(key) {
  const entry = store.get(key);
  return !!entry && (Date.now() - entry.ts) < TTL;
}

export function setCache(key, data) {
  store.set(key, { data, ts: Date.now() });
}

export function clearCache(key) {
  if (key) store.delete(key);
  else store.clear();
}

/**
 * Load a value through the cache using stale-while-revalidate.
 * If cached data exists, returns it INSTANTLY and revalidates in the background.
 * If no cache, waits for the fetcher. Dedupes concurrent calls for the same key.
 * @param {string} key
 * @param {() => Promise<any>} fetcher
 * @returns {Promise<any>}
 */
export async function loadCached(key, fetcher) {
  const entry = store.get(key);
  if (entry) {
    // Serve stale data instantly — revalidate in background if stale
    if (!inflight.has(key) && (Date.now() - entry.ts) > TTL) {
      const p = (async () => {
        try { const data = await fetcher(); setCache(key, data); return data; }
        catch {} finally { inflight.delete(key); }
      })();
      inflight.set(key, p);
    }
    return entry.data;
  }
  // No cache — must wait for fetch
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    try {
      const data = await fetcher();
      setCache(key, data);
      return data;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

// ── Shared, frequently-needed loaders ──────────────────────────

/** Current user — cached across the whole app. */
export function getCachedUser() {
  return loadCached('__user__', () => base44.auth.me());
}

/** All BusinessProfile records for the current user — cached. */
export function getCachedProfiles(userId) {
  return loadCached(`__profiles__${userId}`, () =>
    base44.entities.BusinessProfile.filter({ created_by_id: userId }).catch(() => [])
  );
}

/** Invalidate profile cache (call after creating/updating a profile). */
export function invalidateProfiles(userId) {
  if (userId) clearCache(`__profiles__${userId}`);
  else {
    for (const k of Array.from(store.keys())) {
      if (k.startsWith('__profiles__')) store.delete(k);
    }
  }
}