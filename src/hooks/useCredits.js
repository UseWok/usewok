/**
 * useCredits — hook temps réel pour le solde de crédits
 * Se synchronise via subscription sur l'entité User (mise à jour par creditEngine côté serveur)
 * et récupère le solde initial depuis le backend.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { fetchCreditsFromBackend } from '@/lib/credits';

export function useCredits(user) {
  const [credits, setCredits] = useState({
    used: user?.credits_used ?? 0,
    limit: user?.credits_limit ?? 150_000,
    resetAt: user?.credits_reset_at ?? null,
    loading: true,
  });

  // Sync from user prop whenever it changes (e.g. after deductCredits updates ChatPage state)
  useEffect(() => {
    if (typeof user?.credits_used === 'number') {
      setCredits(prev => ({
        ...prev,
        used: user.credits_used,
        limit: user.credits_limit ?? prev.limit,
        resetAt: user.credits_reset_at ?? prev.resetAt,
      }));
    }
  }, [user?.credits_used, user?.credits_limit]);

  // Fetch authoritative value from backend on mount / user change
  useEffect(() => {
    fetchCreditsFromBackend().then(d => {
      if (d) {
        setCredits({
          used: d.credits_used ?? 0,
          limit: d.credits_limit ?? 150_000,
          resetAt: d.credits_reset_at ?? null,
          loading: false,
        });
      } else {
        setCredits(prev => ({ ...prev, loading: false }));
      }
    }).catch(() => setCredits(prev => ({ ...prev, loading: false })));
  }, [user?.id]);

  // Poll backend every 10s to stay in sync with any server-side deductions
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      fetchCreditsFromBackend().then(d => {
        if (d && typeof d.credits_used === 'number') {
          setCredits(prev => ({
            ...prev,
            used: d.credits_used,
            limit: d.credits_limit ?? prev.limit,
            resetAt: d.credits_reset_at ?? prev.resetAt,
          }));
        }
      }).catch(() => {});
    }, 10_000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Real-time subscription: when creditEngine updates credits_used on the user, this fires
  useEffect(() => {
    if (!user?.id) return;
    const unsub = base44.entities.User.subscribe((event) => {
      const data = event?.data;
      // Accept any update event that carries credits_used for this user
      if (!data || (data.id && data.id !== user.id)) return;
      if (typeof data.credits_used !== 'number') return;
      if (data && typeof data.credits_used === 'number') {
        setCredits(prev => ({
          ...prev,
          used: data.credits_used,
          limit: data.credits_limit ?? prev.limit,
          resetAt: data.credits_reset_at ?? prev.resetAt,
        }));
      }
    });
    return unsub;
  }, [user?.id]);

  // Allow over-limit: bar can go beyond 100%, show overuse in red
  const rawPct = credits.limit > 0 ? (credits.used / credits.limit) * 100 : 0;
  const pct = Math.min(rawPct, 100); // visual bar capped at 100%
  const isOverLimit = credits.used > credits.limit;
  const remaining = Math.max(0, credits.limit - credits.used);
  const consumed = credits.used;
  const isLow = rawPct > 85;
  const isMedium = rawPct > 60;
  const barColor = isOverLimit ? '#ef4444' : isLow ? '#ef4444' : isMedium ? '#f59e0b' : '#111111';

  return { ...credits, pct, rawPct, remaining, consumed, barColor, isLow, isOverLimit };
}