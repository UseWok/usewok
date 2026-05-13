const PLANS_STORAGE_KEY = 'stensor_plans_v5';
const DB_PLANS_KEY = 'plans_config';

export const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price_monthly: 0,
    price_yearly: 0,
    checkout_url_monthly: null,
    checkout_url_yearly: null,
    features_header: 'Éléments clefs\nComprend :',
    features: [
      { text: 'Formulaires de base' },
      { text: 'Sites de base' },
      { text: 'Automatisations de base' },
      { text: 'Bases de données personnalisées' },
      { text: 'Stensor Calendar' },
      { text: 'Stensor Mail' }
    ]
  },
  {
    id: 'plus',
    name: 'Plus',
    price_monthly: 11.50,
    price_yearly: 9.50,
    checkout_url_monthly: 'https://buy.stripe.com/test_plus_monthly',
    checkout_url_yearly: 'https://buy.stripe.com/test_plus_yearly',
    features_header: 'Toutes les fonctionnalités de l’accès gratuit, plus :',
    features: [
      { text: 'Blocs illimités' },
      { text: 'Graphiques illimités' },
      { text: 'Formulaires personnalisés' },
      { text: 'Sites personnalisés' },
      { text: 'Intégrations de base' }
    ]
  },
  {
    id: 'business',
    name: 'Business',
    badge: 'Populaire',
    price_monthly: 23.50,
    price_yearly: 19.50,
    checkout_url_monthly: 'https://buy.stripe.com/test_business_monthly',
    checkout_url_yearly: 'https://buy.stripe.com/test_business_yearly',
    features_header: 'Toutes les fonctionnalités du forfait Plus, plus :',
    features: [
      { text: 'Agent Stensor' },
      { text: 'Agents personnalisés' },
      { text: 'Notes d’IA', tag: 'Bêta' },
      { text: 'Autorisations de base de données' },
      { text: 'SSO SAML' },
      { text: 'Recherche Enterprise' },
      { text: 'Intégrations Premium', prefix: '+4' },
      { text: 'Vérifier n’importe quelle page', prefix: '+5' }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'Limited',
    price_monthly: 31.50,
    price_yearly: 25.50,
    checkout_url_monthly: 'mailto:contact@stensor.com',
    checkout_url_yearly: 'mailto:contact@stensor.com',
    features_header: 'Toutes les fonctionnalités du forfait Business, plus :',
    features: [
      { text: 'Données analytiques et contrôles de l’IA' },
      { text: 'Aucune conservation des données avec les fournisseurs LLM' },
      { text: 'Provisionnement des utilisateurs via SCIM' },
      { text: 'Contrôles et sécurité avancés' },
      { text: 'Journal d’audit' },
      { text: 'Intégrations de sécurité et de conformité (DLP, SIEM)' },
      { text: 'Gestion de domaine' },
      { text: 'Intégrations avancées' }
    ]
  },
];

export function getPlansConfig() {
  try { return JSON.parse(localStorage.getItem(PLANS_STORAGE_KEY)) || DEFAULT_PLANS; } catch { return DEFAULT_PLANS; }
}

export function savePlansConfig(plans) {
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  import('@/api/base44Client').then(({ base44 }) => {
    base44.entities.AppSettings.filter({ key: DB_PLANS_KEY }).then(results => {
      const val = JSON.stringify(plans);
      if (results.length > 0) { base44.entities.AppSettings.update(results[0].id, { value: val }); } 
      else { base44.entities.AppSettings.create({ key: DB_PLANS_KEY, value: val }); }
    });
  });
}

export async function loadPlansFromDB() {
  try {
    const { base44 } = await import('@/api/base44Client');
    const results = await base44.entities.AppSettings.filter({ key: DB_PLANS_KEY });
    if (results.length > 0) {
      const plans = JSON.parse(results[0].value);
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
      return plans;
    }
  } catch {}
  return null;
}

export function getPlanById(planId) {
  const plans = getPlansConfig();
  return plans.find(p => p.id === planId) || plans[0];
}

export function getUserPlan(user) {
  const planId = user?.subscription_plan || 'free';
  return getPlanById(planId);
}