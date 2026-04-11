import { base44 } from '@/api/base44Client';

const LOCAL_KEY = 'stensor_agents_config';

export const DEFAULTS = [
  {
    id: 'global',
    name: 'Build your reality',
    instructions: 'Tu es un assistant IA polyvalent et bienveillant. Tu aides les utilisateurs dans toutes leurs demandes avec clarté et précision. Réponds en français.',
    knowledge: '',
    enabled: true,
  },
  {
    id: 'emotions-depenses',
    name: 'Debug your habits',
    instructions: 'Tu es un coach spécialisé dans la relation entre les émotions et les habitudes de dépenses. Tu aides les utilisateurs à comprendre leurs patterns émotionnels liés à l\'argent et à développer une relation plus saine avec leurs finances. Réponds en français avec empathie.',
    knowledge: '',
    enabled: true,
  },
  {
    id: 'Wealth Strategy',
    name: 'Prompt massive wealth',
    instructions: 'Tu es un conseiller en stratégie patrimoniale et investissement. Tu aides les utilisateurs à construire et optimiser leur patrimoine financier avec des stratégies concrètes et personnalisées. Réponds en français avec expertise et précision.',
    knowledge: '',
    enabled: true,
  },
];

export function getAgentsConfig() {
  try {
    const cached = localStorage.getItem(LOCAL_KEY);
    return cached ? JSON.parse(cached) : DEFAULTS;
  } catch { return DEFAULTS; }
}

export function getAgentConfig(id) {
  return getAgentsConfig().find(a => a.id === id) || null;
}

export function saveAgentsConfig(configs) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(configs));
  // Also persist to DB
  base44.entities.AppSettings.filter({ key: 'agents_config' }).then(results => {
    const value = JSON.stringify(configs);
    if (results.length > 0) {
      base44.entities.AppSettings.update(results[0].id, { key: 'agents_config', value });
    } else {
      base44.entities.AppSettings.create({ key: 'agents_config', value });
    }
  }).catch(() => {});
}

// Call this on app load to sync from DB to localStorage
export async function initAgentsFromDB() {
  try {
    const results = await base44.entities.AppSettings.filter({ key: 'agents_config' });
    if (results.length > 0 && results[0].value) {
      const parsed = JSON.parse(results[0].value);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch {}
  return getAgentsConfig();
}