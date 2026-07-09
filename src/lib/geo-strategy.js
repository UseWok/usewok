// SEO Strategy — plan de visibilité IA qui guide les optimisations UseWok.
// Stocké dans le blob JSON BusinessProfile (brand_keywords) sous la clé `geo_strategy`.
// Pré-remplit automatiquement à partir des données Brand Knowledge pour ne rien redemander.

import { base44 } from '@/api/base44Client';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';

// ── Structure vide par défaut ─────────────────────────────────────
export function emptyGeoStrategy() {
  return {
    positioning_target: '',
    positioning_note: '',
    target_queries: [],
    query_intents: [],
    query_philosophy: '',
    authority_sources: [],
    known_sources: [],
    content_pillars: [],
    priority_competitors: [],
  };
}

export const POSITIONING_TARGETS = [
  'Leader — recommandation n°1',
  'Challenger — alternative crédible',
  'Expert — spécialiste de votre segment',
  'Alternative — concurrent d\'un leader spécifique',
];

export const QUERY_INTENTS = [
  { code: 'informational', label: 'Informationnel' },
  { code: 'commercial',    label: 'Commercial' },
  { code: 'comparison',    label: 'Comparatif' },
  { code: 'transactional', label: 'Transactionnel' },
  { code: 'local',         label: 'Local' },
];

export const KNOWN_SOURCES = [
  { code: 'wikipedia',    label: 'Wikipedia' },
  { code: 'reddit',       label: 'Reddit' },
  { code: 'g2',           label: 'G2' },
  { code: 'capterra',     label: 'Capterra' },
  { code: 'producthunt',  label: 'Product Hunt' },
  { code: 'linkedin',     label: 'LinkedIn' },
  { code: 'youtube',      label: 'YouTube' },
  { code: 'medium',       label: 'Medium' },
  { code: 'lesechos',     label: 'Les Échos' },
  { code: 'lemonde',      label: 'Le Monde' },
  { code: 'lefigaro',     label: 'Le Figaro' },
  { code: 'techcrunch',   label: 'TechCrunch' },
];

// Suggestions pré-faites pour les champs de tags
export const TARGET_QUERY_CHIPS = [
  'Quel est le meilleur outil pour la visibilité IA ?',
  'Comment apparaître dans ChatGPT ?',
  'Comment être cité par les IA ?',
  'Quelle solution pour le SEO IA ?',
  'Comment optimiser pour Gemini ?',
];

export const CONTENT_PILLAR_CHIPS = [
  'Guides pratiques',
  'Comparatifs',
  'Témoignages clients',
  'Études de cas',
  'Tutoriels',
  'Analyses de marché',
  'FAQ détaillées',
];

export const COMPETITOR_CHIPS = [
  'Semrush',
  'Ahrefs',
  'Jasper',
  'WriterAccess',
  'Surfer SEO',
];

// ── Charger la stratégie + pré-remplir depuis Brand Knowledge ─────
export async function loadGeoStrategy(activeDomainUrl) {
  const u = await base44.auth.me();
  const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
  const profile = activeDomainUrl
    ? (profiles.find(p => p.site_url === activeDomainUrl) || profiles[0])
    : profiles[0];
  if (!profile) return { profile: null, extra: {}, strategy: emptyGeoStrategy() };

  const extra = await getProfileData(profile);
  const stored = extra.geo_strategy || {};
  const bk = extra.brand_knowledge || {};

  // Pré-remplir les champs vides depuis Brand Knowledge (ne pas écraser ce qui existe déjà)
  const seededCompetitors = Array.isArray(extra.competitors)
    ? extra.competitors.map(c => c.name || c.domain).filter(Boolean)
    : [];

  // Ne pré-remplir que si le champ est vide dans la stratégie stockée
  const mergeIfEmpty = (existing, seeded) =>
    (Array.isArray(existing) && existing.length > 0) ? existing : (Array.isArray(seeded) ? seeded : []);
  const fillIfEmpty = (existing, seeded) =>
    (existing && String(existing).trim()) ? existing : (seeded || '');

  const strategy = {
    ...emptyGeoStrategy(),
    ...stored,
    // Pré-remplir les champs vides depuis Brand Knowledge / données de scan
    positioning_note: fillIfEmpty(stored.positioning_note, bk.value_description || ''),
    target_queries:   mergeIfEmpty(stored.target_queries, bk.pre_purchase_questions || []),
    content_pillars:  mergeIfEmpty(stored.content_pillars, bk.authority_topics || []),
    priority_competitors: mergeIfEmpty(stored.priority_competitors, seededCompetitors),
  };

  return { profile, extra, strategy };
}

// ── Sauvegarder la stratégie dans le blob JSON ────────────────────
export async function saveGeoStrategy(profile, extra, strategy) {
  const newExtra = { ...extra, geo_strategy: strategy, geo_strategy_updated_at: new Date().toISOString() };
  const brand_keywords = await uploadProfileData(newExtra);
  await base44.entities.BusinessProfile.update(profile.id, { brand_keywords });
  return newExtra;
}