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

  // "consumed" = credits.used, bar fills as you consume
  const pct = credits.limit > 0 ? Math.min((credits.used / credits.limit) * 100, 100) : 0;
  const remaining = Math.max(0, credits.limit - credits.used);
  const consumed = credits.used;
  const isLow = pct > 85;
  const isMedium = pct > 60;
  const barColor = isLow ? '#ef4444' : isMedium ? '#f59e0b' : '#F95738';

  return { ...credits, pct, remaining, consumed, barColor, isLow };
}