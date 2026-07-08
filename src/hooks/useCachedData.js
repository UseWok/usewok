import { useState, useEffect, useRef, useCallback } from 'react';
import { peekCache, isFresh, setCache, loadCached } from '@/lib/data-cache';

/**
 * Stale-while-revalidate data hook.
 *
 * - Returns cached data INSTANTLY (no flicker) if present.
 * - Silently revalidates in the background when the cache is stale.
 * - `loading` is only true on the very first load with no cache.
 *
 * @param {string|null} key       unique cache key (null = skip / not ready)
 * @param {() => Promise<any>} fetcher
 * @param {Array} deps            re-run when these change (e.g. active domain)
 */
export function useCachedData(key, fetcher, deps = []) {
  const cached = key ? peekCache(key) : undefined;
  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async (force = false) => {
    if (!key) { setLoading(false); return; }
    const has = peekCache(key) !== undefined;
    // Show data we already have immediately; only spin when we have nothing.
    if (has) { setData(peekCache(key)); setLoading(false); }
    else setLoading(true);

    // Skip network if fresh and not forced.
    if (!force && isFresh(key)) { setLoading(false); return; }

    try {
      const fresh = await loadCached(key, () => fetcherRef.current());
      setData(fresh);
      setError(null);
    } catch (e) {
      if (!has) setError(e);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps]);

  const refresh = useCallback(() => {
    if (key) setCache(key, peekCache(key)); // keep old until fresh arrives
    return run(true);
  }, [key, run]);

  return { data, loading, error, refresh, setData };
}