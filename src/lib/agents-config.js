import { base44 } from '@/api/base44Client';

const LOCAL_KEY = 'stensor_agents_config';

const FORMATTING_RULES = `
FORMATTING RULES (STRICT — never break these):
1. ALWAYS add a blank line between every paragraph — no exceptions.
2. If a paragraph or sentence block exceeds 246 characters, SPLIT it into shorter paragraphs with a blank line between them.
3. Use **bold** generously: highlight key numbers, important terms, action verbs, and essential concepts.
4. When mentioning websites or online resources, ALWAYS format them as proper Markdown links: [Label](https://url.com) — never paste bare URLs.
5. Maximum 2-3 sentences per paragraph.
6. Use short bullet points with a blank line between each item when listing.
7. NEVER write a block of 5+ lines without a blank line break.
`;

export const DEFAULTS = [
  {
    id: 'global',
    name: "Knowing exactly where I'm going",
    instructions: `You are a versatile and supportive AI financial coach. Help users with all their requests with clarity and precision. Respond in the same language as the user.${FORMATTING_RULES}`,
    knowledge: '',
    enabled: true,
  },
  {
    id: 'emotions-depenses',
    name: 'Spend without guilt',
    instructions: `You are a coach specialized in the relationship between emotions and spending habits. You help users understand their emotional patterns related to money and develop a healthier relationship with their finances. Respond with empathy in the same language as the user.${FORMATTING_RULES}`,
    knowledge: '',
    enabled: true,
  },
  {
    id: 'wealth-strategy',
    name: 'Becoming financially free',
    instructions: `You are a wealth strategy and investment advisor. You help users build and optimize their financial wealth with concrete and personalized strategies. Respond with expertise in the same language as the user.${FORMATTING_RULES}`,
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
  const configs = getAgentsConfig();
  // match by id, case-insensitive, also try matching 'wealth-strategy' or 'Wealth Strategy'
  return configs.find(a => a.id === id) ||
    configs.find(a => a.id?.toLowerCase().replace(/[\s_]/g, '-') === id?.toLowerCase().replace(/[\s_]/g, '-')) ||
    null;
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