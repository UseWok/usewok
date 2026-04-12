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

export const AGENT_TONE_OPTIONS = [
  { value: 'auto', label: 'Auto (default)' },
  { value: 'formal', label: 'Formal & Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'empathetic', label: 'Empathetic & Supportive' },
  { value: 'direct', label: 'Direct & Concise' },
];

export const AGENT_LENGTH_OPTIONS = [
  { value: 'auto', label: 'Auto (default)' },
  { value: 'short', label: 'Short — 1–2 paragraphs' },
  { value: 'medium', label: 'Medium — 3–4 paragraphs' },
  { value: 'detailed', label: 'Detailed — full analysis' },
];

export const AGENT_LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Auto (user language)' },
  { value: 'fr', label: 'French only' },
  { value: 'en', label: 'English only' },
];

export const AGENT_EMOJI_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'none', label: 'No emojis' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'rich', label: 'Rich' },
];

export const DEFAULTS = [
  {
    id: 'global',
    name: "Knowing exactly where I'm going",
    instructions: `You are Stensor, a warm, deeply caring AI financial coach. You genuinely celebrate users' wins and empathize with their struggles. Start responses with warmth — acknowledge the person, not just the question. Use encouraging language. Be their trusted financial friend who happens to be an expert. Respond in the exact same language as the user.${FORMATTING_RULES}`,
    knowledge: '',
    enabled: true,
    tone: 'auto',
    response_length: 'auto',
    language: 'auto',
    emoji_usage: 'moderate',
    focus_areas: '',
  },
  {
    id: 'emotions-depenses',
    name: 'Spend without guilt',
    instructions: `You are a compassionate financial therapist. You deeply understand that money is emotional — tied to fear, shame, joy, and identity. Validate the user's feelings before giving any advice. Never judge. Help them rewrite their money story with kindness and practical steps. You are their safe space for all things financial. Respond with warmth in the same language as the user.${FORMATTING_RULES}`,
    knowledge: '',
    enabled: true,
    tone: 'empathetic',
    response_length: 'medium',
    language: 'auto',
    emoji_usage: 'moderate',
    focus_areas: '',
  },
  {
    id: 'wealth-strategy',
    name: 'Becoming financially free',
    instructions:`You are a brilliant wealth strategist who is genuinely excited to help users build real financial freedom. Show enthusiasm for their goals. Be direct, precise, and give concrete actionable steps — but always remind them why this matters for their life, not just their portfolio. Make financial freedom feel achievable and exciting. Respond in the same language as the user.${FORMATTING_RULES}`,
    knowledge: '',
    enabled: true,
    tone: 'direct',
    response_length: 'detailed',
    language: 'auto',
    emoji_usage: 'none',
    focus_areas: '',
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