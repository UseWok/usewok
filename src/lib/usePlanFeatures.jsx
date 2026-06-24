/**
 * usePlanFeatures — hook principal pour vérifier les droits d'accès WOK.
 * Source de vérité : lib/wok-plans.js
 */

import { useAuth } from '@/lib/AuthContext';
import { getWokFeatures, getWokPlanId, canUseFeature, WOK_PLAN_FEATURES } from '@/lib/wok-plans';

export function usePlanFeatures() {
  const { user } = useAuth();
  const planId = getWokPlanId(user);
  const isAdmin = user?.role === 'admin';
  const features = getWokFeatures(user);

  /** Vérifie si l'utilisateur peut utiliser une feature */
  const can = (featureKey) => {
    if (isAdmin) return true;
    return canUseFeature(user, featureKey);
  };

  /** Retourne le plan requis si l'user ne peut pas, null sinon */
  const requiresPlan = (featureKey) => {
    if (can(featureKey)) return null;
    const planOrder = ['free', 'starter', 'pro'];
    for (const pid of planOrder) {
      const val = WOK_PLAN_FEATURES[pid][featureKey];
      if (val === true || (typeof val === 'number' && val > 0) || (typeof val === 'string' && val !== '')) {
        return pid;
      }
    }
    return 'starter';
  };

  const PLAN_LABELS = { free: 'Gratuit', starter: 'Starter', pro: 'Pro' };

  return {
    planId,
    isAdmin,
    can,
    requiresPlan,
    features,
    planLabel: PLAN_LABELS[planId] || 'Gratuit',
    user,
    isFree: planId === 'free',
    isStarter: planId === 'starter',
    isPro: planId === 'pro',
  };
}

/** Gate composant — affiche fallback ou la modale upsell si feature bloquée */
export function FeatureGate({ feature, children, fallback = null }) {
  const { can, requiresPlan } = usePlanFeatures();
  if (can(feature)) return children;
  const needed = requiresPlan(feature);
  if (fallback) return fallback;
  const label = needed ? (needed.charAt(0).toUpperCase() + needed.slice(1)) : 'supérieur';
  return (
    <div style={{
      padding: '16px', borderRadius: 12, border: '1px dashed #E0E0DE',
      background: '#FAFAF8', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 4 }}>
        Disponible avec le plan {label}
      </div>
      <a href="/pricing" style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>
        Voir les offres →
      </a>
    </div>
  );
}