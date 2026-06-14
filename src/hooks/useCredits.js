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

  // Fetch initial value from backend
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
      if (event?.data?.id !== user.id && event?.data?.credits_used === undefined) return;
      const data = event?.data;
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

  const pct = credits.limit > 0 ? Math.min((credits.used / credits.limit) * 100, 100) : 0;
  const remaining = Math.max(0, credits.limit - credits.used);
  const isLow = pct > 85;
  const isMedium = pct > 60;
  const barColor = isLow ? '#ef4444' : isMedium ? '#f59e0b' : '#F95738';

  return { ...credits, pct, remaining, barColor, isLow };
}