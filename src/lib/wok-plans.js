/**
 * WOK Plans — source de vérité des features par abonnement.
 * planId stocké dans user.subscription_plan (free | starter | pro)
 * Admins ont accès à tout.
 *
 * ⚠️  TOUTES LES VALEURS CI-DESSOUS SONT DES DÉFAUTS.
 *      L'Admin peut les écraser à tout moment via Admin > Paramètres.
 *      Les overrides Admin sont stockés dans AppSettings { key: 'plan_limits' }
 *      et chargés au runtime via loadPlanSettings().
 *      Un override Admin écrase IMMÉDIATEMENT la valeur par défaut.
 */

import { base44 } from '@/api/base44Client';

export const PLAN_RANK = { free: 0, starter: 1, pro: 2, elite: 3 };

// ─────────────────────────────────────────────────────────────
//  VALEURS PAR DÉFAUT — modifiables via Admin > Paramètres
// ─────────────────────────────────────────────────────────────
export const WOK_PLAN_FEATURES_DEFAULT = {
  free: {
    // Scans
    scan_type: 'lite',              // Type d'analyse : 'lite' (rapide, sans IA lourde)
    scans_per_period: 1,            // 1 scan manuel autorisé par mois
    scan_period: 'month',           // Période du quota scan
    auto_scan: false,               // Pas de scan automatique planifié
    auto_scan_hour: null,           // Heure du scan auto (null = inactif)
    // Moteurs IA
    // FREE : Gemini seulement actif — tous les autres sont floutés avec données fake (aucun appel IA réel)
    engines: ['gemini'],
    engines_locked: [],             // Cadenas (calculé mais caché) — non utilisé en free
    engines_blurred: ['chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'grok', 'copilot'],
    engines_count: 1,               // Nombre de moteurs actifs
    // Sites
    max_sites: 1,                   // Nombre max de sites surveillés simultanément
    max_competitors: 0,              // Nombre max de concurrents suivis (0 = pas accès)
    // Historique
    history_days: 30,               // Jours d'historique conservés
    // Chatbot IA
    chatbot_messages: 5,            // Messages chatbot par mois (conversations persistées en cloud)
    // Features
    fix_instructions: false,        // Guides de correction étape par étape
    see_competitors: false,         // Analyse comparative concurrents
    pdf_export: false,              // Export PDF du rapport
    white_label: false,             // Rapport sans branding WOK
    audit_access: false,            // Accès à l'audit technique SEO complet
    integrations: false,            // Intégrations Google Search Console & Analytics
    monitored_questions: 3,         // Nombre de questions IA surveillées (null = illimité)
  },

  starter: {
    // Scans
    scan_type: 'full',              // Type d'analyse : 'full' (analyse IA complète tous moteurs actifs)
    scans_per_period: 12,           // 12 scans manuels par mois (≈ 3/semaine)
    scan_period: 'month',           // Période du quota scan
    auto_scan: true,                // Scan automatique planifié activé
    auto_scan_hour: 6,              // Heure du scan auto : 6h heure de Paris (Europe/Paris)
    // Moteurs IA
    // STARTER : 5 moteurs actifs — Mistral, Copilot, Grok affichent un cadenas (Pro requis)
    engines: ['gemini', 'chatgpt', 'claude', 'llama', 'perplexity'],
    engines_locked: ['mistral', 'copilot', 'grok'], // Cadenas — aucun appel IA pour ces moteurs
    engines_blurred: [],
    engines_count: 5,               // Nombre de moteurs actifs
    // Sites
    max_sites: 5,                   // Nombre max de sites surveillés simultanément
    max_competitors: 3,              // Nombre max de concurrents suivis
    // Historique
    history_days: 180,              // 6 mois d'historique
    // Chatbot IA
    chatbot_messages: 50,           // Messages chatbot par mois (conversations persistées en cloud)
    // Features
    fix_instructions: true,         // Guides de correction étape par étape (persistés en cloud)
    see_competitors: true,          // Analyse comparative concurrents
    pdf_export: true,               // Export PDF du rapport
    white_label: false,             // Rapport sans branding WOK (Pro uniquement)
    audit_access: true,             // Accès à l'audit technique SEO complet
    integrations: true,             // Intégrations Google Search Console & Analytics
    monitored_questions: null,      // Questions IA surveillées : illimité
  },

  pro: {
    // Scans
    scan_type: 'full',              // Type d'analyse : 'full' (analyse IA complète 8 moteurs)
    scans_per_period: 1,            // 1 scan automatique PAR JOUR (intervalle régulier quotidien)
    scan_period: 'day',             // Période : par jour
    auto_scan: true,                // Scan automatique planifié activé
    auto_scan_hour: 6,              // Heure du scan auto : 6h heure de Paris (Europe/Paris)
    // Moteurs IA
    // PRO : 8 moteurs actifs — aucun cadenas, aucun flou, toutes les données calculées
    engines: ['gemini', 'chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'copilot', 'grok'],
    engines_locked: [],             // Aucun moteur verrouillé
    engines_blurred: [],            // Aucun moteur flouté
    engines_count: 8,               // 8 moteurs IA testés en parallèle
    // Sites
    max_sites: 10,                  // Nombre max de sites surveillés simultanément
    max_competitors: 5,              // Nombre max de concurrents suivis
    // Historique
    history_days: 365,              // 12 mois d'historique complet
    // Chatbot IA
    chatbot_messages: 200,          // Messages chatbot par mois (conversations persistées en cloud)
    // Features
    fix_instructions: true,         // Guides de correction étape par étape (persistés en cloud)
    see_competitors: true,          // Analyse comparative concurrents
    pdf_export: true,               // Export PDF du rapport
    white_label: true,              // Rapport sans branding WOK
    audit_access: true,             // Accès à l'audit technique SEO complet
    integrations: true,             // Intégrations Google Search Console & Analytics
    monitored_questions: null,      // Questions IA surveillées : illimité
  },

  elite: {
    // Scans
    scan_type: 'full',
    scans_per_period: -1,           // Illimité (daily + on-demand)
    scan_period: 'day',
    auto_scan: true,
    auto_scan_hour: 6,
    // Moteurs IA — 8 moteurs actifs
    engines: ['gemini', 'chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'copilot', 'grok'],
    engines_locked: [],
    engines_blurred: [],
    engines_count: 8,
    // Sites
    max_sites: -1,                  // Illimité
    max_competitors: 10,             // Nombre max de concurrents suivis
    // Historique
    history_days: 730,              // 24 mois
    // Chatbot IA
    chatbot_messages: -1,           // Illimité
    // Features
    fix_instructions: true,
    see_competitors: true,
    pdf_export: true,
    white_label: true,
    audit_access: true,
    integrations: true,
    monitored_questions: null,
  },
};

// Valeurs actives en mémoire (fusionnées avec les overrides Admin)
let _activePlanFeatures = { ...WOK_PLAN_FEATURES_DEFAULT };
let _settingsLoaded = false;
let _loadPromise = null;

/**
 * Charge les overrides Admin depuis AppSettings (key: 'plan_limits').
 * Fusionne avec les valeurs par défaut — l'override Admin écrase immédiatement.
 * À appeler au démarrage de l'app (AuthContext ou Layout).
 */
export async function loadPlanSettings() {
  if (_settingsLoaded) return _activePlanFeatures;
  if (_loadPromise) return _loadPromise;

  _loadPromise = base44.entities.AppSettings.filter({ key: 'plan_limits' })
    .then(results => {
      if (results.length > 0) {
        try {
          const overrides = JSON.parse(results[0].value);
          // Fusionner chaque plan : défaut + override Admin
          for (const planId of ['free', 'starter', 'pro', 'elite']) {
            if (overrides[planId]) {
              _activePlanFeatures[planId] = { ...WOK_PLAN_FEATURES_DEFAULT[planId], ...overrides[planId] };
            }
          }
        } catch {}
      }
      _settingsLoaded = true;
      return _activePlanFeatures;
    })
    .catch(() => {
      _settingsLoaded = true;
      return _activePlanFeatures;
    });

  return _loadPromise;
}

/** Force le rechargement des settings (après sauvegarde Admin) */
export function invalidatePlanSettings() {
  _settingsLoaded = false;
  _loadPromise = null;
  _activePlanFeatures = { ...WOK_PLAN_FEATURES_DEFAULT };
}

/** Features actives (avec overrides Admin si chargés, sinon défauts) */
export const WOK_PLAN_FEATURES = new Proxy({}, {
  get(_, planId) {
    return _activePlanFeatures[planId] || WOK_PLAN_FEATURES_DEFAULT[planId];
  }
});

export const PLAN_LABELS = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  elite: 'Elite',
};

export const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  starter: { monthly: 49, yearly: 468 },
  pro: { monthly: 99, yearly: 960 },
  elite: { monthly: 299, yearly: 2870 },
};

export function getWokFeatures(user) {
  if (user?.role === 'admin') return _activePlanFeatures.elite || WOK_PLAN_FEATURES_DEFAULT.elite;
  const planId = user?.subscription_plan || 'free';
  return _activePlanFeatures[planId] || WOK_PLAN_FEATURES_DEFAULT[planId] || WOK_PLAN_FEATURES_DEFAULT.free;
}

export function getWokPlanId(user) {
  if (user?.role === 'admin') return 'elite';
  const raw = user?.subscription_plan || 'free';
  if (raw === 'free' || raw === 'starter' || raw === 'pro' || raw === 'elite') return raw;
  return 'free';
}

/** Retourne la config d'affichage des moteurs pour un user */
export function getEngineConfig(user) {
  const features = getWokFeatures(user);
  return {
    active: features.engines || ['gemini'],
    locked: features.engines_locked || [],
    blurred: features.engines_blurred || [],
  };
}

/**
 * Vérifie si une feature est disponible selon le plan.
 */
export function canUseFeature(user, featureKey) {
  const features = getWokFeatures(user);
  const val = features[featureKey];
  if (val === undefined) return true;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val > 0;
  return true;
}

/**
 * Retourne le plan minimum requis pour une feature.
 */
export function requiredPlanFor(featureKey) {
  for (const planId of ['free', 'starter', 'pro', 'elite']) {
    const features = _activePlanFeatures[planId] || WOK_PLAN_FEATURES_DEFAULT[planId];
    const val = features[featureKey];
    if (val === true || (typeof val === 'number' && val > 0) || (typeof val === 'string' && val !== '')) {
      return planId;
    }
  }
  return 'free';
}