// ============================================================
// STENSOR — Central Constants (Enterprise-Grade)
// Never import colors/urls/strings directly in components.
// Always use these tokens.
// ============================================================

// ── Brand Assets ──────────────────────────────────────────
export const LOGO_URL =
  'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

// ── Storage Keys (localStorage — cache only, non-critical) ──
export const STORAGE_KEYS = {
  DISCUSSIONS:       'stensor_discussions',
  NOTIFS_LAST_SEEN:  'stensor_notifs_last_seen',
  DAILY_USAGE:       'stensor_daily_usage',
  AI_RECO_CACHE:     'stensor_ai_reco_cache',
  CART:              'stensor_cart_v1',
  AGENTS_CONFIG:     'stensor_agents_config',
  LANGUAGE:          'stensor_language',
  SESSION_START:     'stensor_session_start',
  SESSION_TOTAL:     'stensor_session_total',
};

// ── AI / Chat ─────────────────────────────────────────────
export const CHAR_SPEED_MS = 15;

export const AI_MODES = [
  {
    id: 'ultimate',
    labelKey: 'mode_ultimate',
    label: 'Expert',
    model: 'claude_opus_4_6',
    descKey: 'mode_ultimate_desc',
    desc: 'Le plus puissant',
    requiredPlan: 'expert',
    credit_cost: 4,
    credit_max: 8,
  },
  {
    id: 'pro',
    labelKey: 'mode_pro',
    label: 'Avancé',
    model: 'gemini_3_1_pro',
    descKey: 'mode_pro_desc',
    desc: 'Analyse avancée',
    requiredPlan: 'essential',
    credit_cost: 2,
    credit_max: 5,
  },
  {
    id: 'thinking',
    labelKey: 'mode_thinking',
    label: 'Standard',
    model: 'gpt_5',
    descKey: 'mode_thinking_desc',
    desc: 'Mode standard',
    requiredPlan: null,
    credit_cost: 1,
    credit_max: 3,
  },
];

export const AGENT_IDS = {
  GLOBAL:   'global',
  EMOTIONS: 'emotions-depenses',
  WEALTH:   'wealth-strategy',
};

// ── Analytics / Value Props ───────────────────────────────
export const MINS_SAVED_PER_AI_RESPONSE = 17; // 18 min human coach - 1 min AI
export const COACH_HOURLY_RATE_USD      = 100;

// ── Gibberish detection ───────────────────────────────────
export const GIBBERISH_RESPONSE_KEYS = [
  'gibberish_1',
  'gibberish_2',
  'gibberish_3',
];

// ── File Upload ───────────────────────────────────────────
export const MAX_TOTAL_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_VISIBLE_FILES_INLINE  = 1;
export const BASIC_FILE_TYPES  = '.jpg,.jpeg,.png,.gif,.txt,.csv';
export const ALL_FILE_TYPES    =
  '.jpg,.jpeg,.png,.gif,.txt,.csv,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.mp3,.mp4,.json,.html,.xml,.md';