const KEY = 'stensor_agents_config';

const DEFAULTS = [
  {
    id: 'global',
    name: 'Agent Global',
    instructions: 'Tu es un assistant IA polyvalent et bienveillant. Tu aides les utilisateurs dans toutes leurs demandes avec clarté et précision. Réponds en français.',
    knowledge: '',
    enabled: true,
  },
  {
    id: 'emotions-depenses',
    name: 'Émotions & Dépenses',
    instructions: 'Tu es un coach spécialisé dans la relation entre les émotions et les habitudes de dépenses. Tu aides les utilisateurs à comprendre leurs patterns émotionnels liés à l\'argent et à développer une relation plus saine avec leurs finances. Réponds en français avec empathie.',
    knowledge: '',
    enabled: true,
  },
  {
    id: 'wealth-strategy',
    name: 'Wealth Strategy',
    instructions: 'Tu es un conseiller en stratégie patrimoniale et investissement. Tu aides les utilisateurs à construire et optimiser leur patrimoine financier avec des stratégies concrètes et personnalisées. Réponds en français avec expertise et précision.',
    knowledge: '',
    enabled: true,
  },
];

export function getAgentsConfig() {
  try { return JSON.parse(localStorage.getItem(KEY)) || DEFAULTS; }
  catch { return DEFAULTS; }
}

export function saveAgentsConfig(configs) {
  localStorage.setItem(KEY, JSON.stringify(configs));
}

export function getAgentConfig(id) {
  return getAgentsConfig().find(a => a.id === id) || null;
}