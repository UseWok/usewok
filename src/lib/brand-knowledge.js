// Brand Knowledge — the structured brand context that powers WOK AI answers & backend analysis.
// Stored inside the BusinessProfile JSON blob (brand_keywords) under the `brand_knowledge` key,
// so it is automatically loaded by getProfileData() everywhere and injected into the AI context.

import { base44 } from '@/api/base44Client';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';

// ── Default empty structure ────────────────────────────────────────
export function emptyBrandKnowledge() {
  return {
    // Identity
    business_name: '',
    site_url: '',
    industry: '',
    headquarters: '',
    // Target market
    audience: '',
    business_model: 'B2B', // B2B | B2C | B2B2C | Marketplace
    target_segment: '',
    // Value proposition
    value_description: '',
    value_keywords: [],
    // Sales plays / use cases
    use_cases: [],
    // Authority topics
    authority_topics: [],
    // Pre-purchase questions
    pre_purchase_questions: [],
    // Prospect objections
    objections: [],
    // Topics to avoid
    avoid_topics: [],
    // Scope / geography
    scope: 'Worldwide', // Local | Regional | National | Continental | Worldwide
    // Existing notoriety assets
    wikipedia_url: '',
    crunchbase_url: '',
    other_sources: [],
    // Languages & locations
    priority_countries: [], // array of ISO country codes
    languages: [], // array of ISO language codes
  };
}

export const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'Marketplace'];
export const SCOPES = ['Local', 'Regional', 'National', 'Continental', 'Worldwide'];

export const COUNTRIES = [
  { code: 'FR', label: 'France', flag: '🇫🇷' },
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', label: 'Germany', flag: '🇩🇪' },
  { code: 'ES', label: 'Spain', flag: '🇪🇸' },
  { code: 'IT', label: 'Italy', flag: '🇮🇹' },
  { code: 'CA', label: 'Canada', flag: '🇨🇦' },
  { code: 'BE', label: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', label: 'Switzerland', flag: '🇨🇭' },
  { code: 'NL', label: 'Netherlands', flag: '🇳🇱' },
  { code: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { code: 'AU', label: 'Australia', flag: '🇦🇺' },
  { code: 'JP', label: 'Japan', flag: '🇯🇵' },
  { code: 'BR', label: 'Brazil', flag: '🇧🇷' },
  { code: 'IN', label: 'India', flag: '🇮🇳' },
  { code: 'MX', label: 'Mexico', flag: '🇲🇽' },
];

export const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'ja', label: '日本語' },
];

// ── Load active profile + brand knowledge ──────────────────────────
export async function loadBrandKnowledge(activeDomainUrl) {
  const u = await base44.auth.me();
  const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
  const profile = activeDomainUrl
    ? (profiles.find(p => p.site_url === activeDomainUrl) || profiles[0])
    : profiles[0];
  if (!profile) return { profile: null, extra: {}, knowledge: emptyBrandKnowledge() };

  const extra = await getProfileData(profile);
  const stored = extra.brand_knowledge || {};
  // Seed from what the scan already knows
  const knowledge = {
    ...emptyBrandKnowledge(),
    business_name: profile.identity_name || '',
    site_url: profile.site_url || '',
    industry: profile.identity_industry || '',
    ...stored,
  };
  return { profile, extra, knowledge };
}

// ── Save brand knowledge back into the profile JSON blob ────────────
export async function saveBrandKnowledge(profile, extra, knowledge) {
  const newExtra = { ...extra, brand_knowledge: knowledge, brand_knowledge_updated_at: new Date().toISOString() };
  const brand_keywords = await uploadProfileData(newExtra);
  await base44.entities.BusinessProfile.update(profile.id, {
    brand_keywords,
    // keep the core identity fields in sync so scans / other pages stay consistent
    identity_name: knowledge.business_name || profile.identity_name || '',
    identity_industry: knowledge.industry || profile.identity_industry || '',
  });
  return newExtra;
}