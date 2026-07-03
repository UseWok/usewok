// ── Shared constants & helpers for AIVisibilityReport ──

export const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';
export const INK = '#1A1814';
export const INK2 = '#857E6E';
export const INK3 = '#A8A49F';
export const BORDER = 'rgba(21,19,15,0.12)';
export const SURFACE = '#F7F2E9';
export const WHITE = '#FFFFFF';
export const CORAL = '#FF5A1F';
export const CARD_DARK = '#15130F';
export const GREEN = '#3FA66B';
export const GREEN_SOFT = '#E3F1E9';
export const CREAM_DEEP = '#EEE5D2';
export const ORANGE_DEEP = '#B23E10';
export const ORANGE_SOFT = '#FCE3D2';

export const AI_LOGOS = {
  chatgpt: 'https://media.base44.com/images/public/6a2edc91082e534601118582/67cb277ed_image.png',
  gemini: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f37dc5b5a_image.png',
  claude: 'https://media.base44.com/images/public/6a2edc91082e534601118582/d67c08a4a_image.png',
  perplexity: 'https://media.base44.com/images/public/6a2edc91082e534601118582/8e9ccea01_image.png',
  mistral: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3a3745646_image.png',
  grok: 'https://media.base44.com/images/public/6a2edc91082e534601118582/ddf7fe28b_image.png',
  copilot: 'https://media.base44.com/images/public/6a2edc91082e534601118582/92bb51643_image.png',
  llama: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1bdc7666b_image.png'
};

export const ALL_ENGINES = ['mistral', 'gemini', 'chatgpt', 'claude', 'copilot', 'perplexity', 'llama', 'grok'];
export const ENGINE_NAMES = { chatgpt: 'ChatGPT', gemini: 'Gemini', claude: 'Claude', mistral: 'Mistral', llama: 'Llama', perplexity: 'Perplexity', grok: 'Grok', copilot: 'Copilot' };
export const RADAR_LABELS = [
  { name: 'Mistral', x: 100, y: 8 },
  { name: 'Gemini', x: 166, y: 40 },
  { name: 'ChatGPT', x: 188, y: 103 },
  { name: 'Claude', x: 166, y: 166 },
  { name: 'Copilot', x: 100, y: 195 },
  { name: 'Perplexity', x: 34, y: 166 },
  { name: 'Llama', x: 12, y: 103 },
  { name: 'Grok', x: 34, y: 40 },
];

export const STATUS_CFG = {
  todo: { label: 'To do', color: INK2, bg: WHITE, border: BORDER },
  in_progress: { label: 'In progress', color: CORAL, bg: `${CORAL}10`, border: `${CORAL}40` },
  done: { label: '✓ Done', color: WHITE, bg: INK, border: INK }
};

// ── In-memory fix cache (module-level, shared across drawer instances) ──
export const FIX_MEM = {};

export function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function normalizeIssueKey(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9àâäéèêëîïôùûüç\s]/g, '').replace(/\s+/g, '_').slice(0, 80);
}

// ── Radar geometry helpers ──
export function radarPoints(scores, maxR = 70, cx = 100, cy = 100) {
  return ALL_ENGINES.map((e, i) => {
    const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
    const s = scores[e] || 0;
    const r = maxR * (s / 100);
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}

export function radarOuter(maxR = 70, cx = 100, cy = 100) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
    pts.push(`${(cx + maxR * Math.cos(angle)).toFixed(1)},${(cy + maxR * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(' ');
}

export function radarInner(maxR = 35, cx = 100, cy = 100) {
  return radarOuter(maxR, cx, cy);
}

export function radarLines(maxR = 70, cx = 100, cy = 100) {
  return ALL_ENGINES.map((_, i) => {
    const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
    return { x1: cx, y1: cy, x2: cx + maxR * Math.cos(angle), y2: cy + maxR * Math.sin(angle) };
  });
}

export function getSentiment(val) {
  if (val >= 65) return { label: 'Positive', color: GREEN, bg: GREEN_SOFT };
  if (val >= 40) return { label: 'Neutral', color: INK2, bg: CREAM_DEEP };
  return { label: 'Mixed', color: ORANGE_DEEP, bg: ORANGE_SOFT };
}