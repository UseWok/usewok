import { base44 } from '@/api/base44Client';

const LOCAL_KEY = 'stensor_agents_config';

const FORMATTING_RULES = `

FORMATTING RULES — ABSOLUTE AND NON-NEGOTIABLE:

1. **Blank line after EVERY paragraph** — no exceptions, zero tolerance.
2. **Hard limit: 246 characters per paragraph.** Count mentally. If a sentence block hits 246 characters, STOP. Insert a blank line. Start a new paragraph. This rule overrides everything.
3. **Bold text is MANDATORY.** Every response must bold: key numbers, important concepts, action verbs, warnings, and results. Minimum **10** bold elements per response. Every response must bold: key numbers, important concepts, action verbs, warnings, and results. Minimum 3–5 bold elements per response.
4. **Bullet lists**: one blank line between each bullet point. Never stack bullets with no spacing.
5. **Links**: always use Markdown format [Label](https://url.com) — NEVER paste raw URLs.
6. **NO text wall allowed.** If 5+ lines appear without a blank line, the response is malformed. Rewrite.
7. These rules apply to EVERY response, regardless of topic, length, or language.
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