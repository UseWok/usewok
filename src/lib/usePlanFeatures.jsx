/**
 * usePlanFeatures — détecte le plan actif et expose des helpers pour bloquer/libérer des features.
 * Source de vérité : user.subscription_plan (vient du backend via base44.auth.me())
 * Admins ont accès à tout.
 */

import { useAuth } from '@/lib/AuthContext';

const FEATURE_PLAN_REQUIREMENTS = {
  ai_report:              'free',
  audit:                  'free',
  performance_basic:      'free',
  performance_advanced:   'starter',
  fix_instructions:       'starter',
  weekly_scan:            'starter',
  multi_domain:           'starter',
  connections_gsc:        'starter',
  connections_ga:         'pro',
  export_pdf:             'pro',
  white_label:            'pro',
};

const PLAN_RANK = { free: 0, starter: 1, creator: 2, pro: 3 };

export function usePlanFeatures() {
  const { user } = useAuth();
  const planId = user?.subscription_plan || 'free';
  const isAdmin = user?.role === 'admin';

  const can = (featureKey) => {
    if (isAdmin) return true;
    const required = FEATURE_PLAN_REQUIREMENTS[featureKey];
    if (!required) return true;
    return (PLAN_RANK[planId] ?? 0) >= (PLAN_RANK[required] ?? 0);
  };

  const requiresPlan = (featureKey) => {
    if (can(featureKey)) return null;
    return FEATURE_PLAN_REQUIREMENTS[featureKey] || null;
  };

  const PLAN_LABELS = { free: 'Free', starter: 'Starter', creator: 'Creator', pro: 'Pro' };

  return { planId, isAdmin, can, requiresPlan, planLabel: PLAN_LABELS[planId] || 'Free', user };
}

export function FeatureGate({ feature, children, fallback = null }) {
  const { can, requiresPlan } = usePlanFeatures();
  if (can(feature)) return children;
  const needed = requiresPlan(feature);
  if (fallback) return fallback;
  const label = needed ? needed.charAt(0).toUpperCase() + needed.slice(1) : 'supérieur';
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