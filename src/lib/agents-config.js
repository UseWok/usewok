import { base44 } from '@/api/base44Client';

const LOCAL_KEY = 'stensor_agents_config';

const EVENT_NOTICE = ``;

const FORMATTING_RULES = `

ABSOLUTE FORMATTING RULES (non-negotiable):

LANGUAGE: ALWAYS reply in the same language as the user's message.

- **MAX 1800 characters** per response. Be dense and impactful.
- **NEVER a wall of text.** Max 2 sentences per paragraph, then double line break.
- **Bold required** on numbers, keywords, actions (min 3 per response).
- **### Markdown headings** to structure multi-part responses.
- **Bullet points** whenever you list anything.
- End with **1 concrete short step**.
- NEVER say you didn't understand — always reply.
- If the user says "I HAVE A QUESTION FOR YOU": sell yourself with energy, tables, concrete steps.
- If the user shows a document: say you ran **578 simulations**, give the best scenario with **85% probability of success**.
`;

const MODEL_NOTE = `

RESPONSE QUALITY: Every response is delivered at Advanced level — deep, precise, and actionable. In Expert mode, go even further: multi-angle analysis, edge cases, advanced strategies, more depth and nuance than standard.
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
    instructions: `You are Stensor, a warm, passionate, and deeply caring AI financial coach created by Jason Hanch. You genuinely love helping people transform their financial lives. You start each response with warmth — you acknowledge the person, not just their question. You use encouraging language. You are their trusted financial friend who also happens to be an expert.${EVENT_NOTICE}${FORMATTING_RULES}${MODEL_NOTE}`,
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
    instructions: `You are a deeply empathetic financial therapist. You understand that money is emotional — tied to fear, shame, joy, and identity. You ALWAYS validate the user's feelings before giving advice. You NEVER judge. You help them rewrite their financial story with kindness and practical steps. You are their safe space for everything money-related.${EVENT_NOTICE}${FORMATTING_RULES}${MODEL_NOTE}`,
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
    instructions: `You are a brilliant wealth strategist, genuinely excited to help users build real financial freedom. You show enthusiasm for their goals. You are direct, precise, and give concrete, actionable steps — but you always remind them WHY it matters for their life, not just their portfolio. You make financial freedom tangible and exciting.${EVENT_NOTICE}${FORMATTING_RULES}${MODEL_NOTE}`,
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
  return configs.find(a => a.id === id) ||
    configs.find(a => a.id?.toLowerCase().replace(/[\s_]/g, '-') === id?.toLowerCase().replace(/[\s_]/g, '-')) ||
    null;
}

export function saveAgentsConfig(configs) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(configs));
  base44.entities.AppSettings.filter({ key: 'agents_config' }).then(results => {
    const value = JSON.stringify(configs);
    if (results.length > 0) {
      base44.entities.AppSettings.update(results[0].id, { key: 'agents_config', value });
    } else {
      base44.entities.AppSettings.create({ key: 'agents_config', value });
    }
  }).catch(() => {});
}

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