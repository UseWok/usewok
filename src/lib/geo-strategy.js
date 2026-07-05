// GEO Strategy — structured Generative Engine Optimization strategy that powers WOK AI answers & backend analysis.
// Stored inside the BusinessProfile JSON blob (brand_keywords) under the `geo_strategy` key,
// so it is automatically loaded by getProfileData() everywhere and injected into the AI context.

import { base44 } from '@/api/base44Client';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';

// ── Default empty structure ────────────────────────────────────────
export function emptyGeoStrategy() {
  return {
    // Target positioning
    positioning_target: 'Leader',      // Leader | Challenger | Niche | Alternative
    positioning_note: '',
    // Target queries
    target_queries: [],                // array of strings
    query_intents: [],                 // array of intent codes (informational / commercial / …)
    // Query philosophy
    query_philosophy: '',
    // Target authority sources
    authority_sources: [],             // custom media / sites
    known_sources: [],                 // preset media toggled on
    // Content pillars
    content_pillars: [],
    // Priority competitors
    priority_competitors: [],
  };
}

export const POSITIONING_TARGETS = [
  { value: 'Leader', label: 'Leader — recommandation n°1' },
  { value: 'Challenger', label: 'Challenger — alternative crédible' },
  { value: 'Niche', label: 'Niche — spécialiste d\'un segment' },
  { value: 'Alternative', label: 'Alternative — challenger d\'un leader précis' },
];

export const QUERY_INTENTS = [
  { code: 'informational', label: 'Informationnelle' },
  { code: 'commercial', label: 'Commerciale' },
  { code: 'comparison', label: 'Comparaison' },
  { code: 'transactional', label: 'Transactionnelle' },
  { code: 'local', label: 'Locale' },
];

export const KNOWN_SOURCES = [
  { code: 'wikipedia', label: 'Wikipedia' },
  { code: 'reddit', label: 'Reddit' },
  { code: 'g2', label: 'G2' },
  { code: 'capterra', label: 'Capterra' },
  { code: 'producthunt', label: 'Product Hunt' },
  { code: 'linkedin', label: 'LinkedIn' },
  { code: 'youtube', label: 'YouTube' },
  { code: 'medium', label: 'Medium' },
  { code: 'lesechos', label: 'Les Échos' },
  { code: 'lemonde', label: 'Le Monde' },
  { code: 'lefigaro', label: 'Le Figaro' },
  { code: 'techcrunch', label: 'TechCrunch' },
];

// ── Load active profile + geo strategy ──────────────────────────
export async function loadGeoStrategy(activeDomainUrl) {
  const u = await base44.auth.me();
  const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
  const profile = activeDomainUrl
    ? (profiles.find(p => p.site_url === activeDomainUrl) || profiles[0])
    : profiles[0];
  if (!profile) return { profile: null, extra: {}, strategy: emptyGeoStrategy() };

  const extra = await getProfileData(profile);
  const stored = extra.geo_strategy || {};
  // Seed competitors from what the scan already knows
  const seededCompetitors = Array.isArray(extra.competitors)
    ? extra.competitors.map(c => c.name || c.domain).filter(Boolean)
    : [];
  const strategy = {
    ...emptyGeoStrategy(),
    priority_competitors: seededCompetitors,
    ...stored,
  };
  return { profile, extra, strategy };
}

// ── Save geo strategy back into the profile JSON blob ────────────
export async function saveGeoStrategy(profile, extra, strategy) {
  const newExtra = { ...extra, geo_strategy: strategy, geo_strategy_updated_at: new Date().toISOString() };
  const brand_keywords = await uploadProfileData(newExtra);
  await base44.entities.BusinessProfile.update(profile.id, { brand_keywords });
  return newExtra;
}