import { base44 } from '@/api/base44Client';

const SETTINGS_KEY = 'page_modes';

export async function getPageModes() {
  try {
    const results = await base44.entities.AppSettings.filter({ key: SETTINGS_KEY });
    if (results.length > 0) return JSON.parse(results[0].value);
  } catch {}
  return { parcours: 'live', community: 'live' };
}

export async function savePageModes(modes) {
  const val = JSON.stringify(modes);
  const existing = await base44.entities.AppSettings.filter({ key: SETTINGS_KEY });
  if (existing.length > 0) await base44.entities.AppSettings.update(existing[0].id, { value: val });
  else await base44.entities.AppSettings.create({ key: SETTINGS_KEY, value: val });
}