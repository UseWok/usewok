/**
 * lib/config.js
 * Central configuration for the AI Builder pipeline.
 */

export const AI_CONFIG = {
  // ── Cache ──
  CACHE_TTL_MINUTES: 30,
  MAX_FILES_TO_READ: 5,
  MAX_ENTITY_SCHEMAS: 20,
  MAX_STORAGE_MB: 10,
  STORAGE_EVICTION_THRESHOLD_MB: 8,

  // ── Fake streaming — accelerated for snappy UX ──
  STREAMING_TOKEN_DELAY_MS: 15,
  STREAMING_TOKENS_PER_FRAME: 18,   // accelerated: ~18 tokens per rAF tick
  THINKING_RATIO: 0.3,

  // ── Model routing matrix ──
  // automatic    → gpt-4o-mini  : filter (msgs 1-3), extraction, autofix
  // gpt_5_mini   → default tasks, simple modifications
  // gemini_3_flash → web search
  // gemini_3_1_pro → new builds + complex modifications
  MODELS: {
    filter:      'automatic',       // gpt-4o-mini — spam/safety (disabled after msg 4)
    extraction:  'automatic',       // gpt-4o-mini — surgical code extractor
    fileRead:    'automatic',       // gpt-4o-mini — file & image analysis
    autofix:     'automatic',       // gpt-4o-mini — targeted error correction ONLY
    webBrowse:   'gemini_3_flash',  // web search
    default:     'gpt_5_mini',      // general tasks + simple modifications
    build:       'claude_opus_4_8', // new builds + complex modifications — top quality
    // Legacy aliases
    validation:  'automatic',
    structuring: 'gpt_5_mini',
    generation:  'claude_opus_4_8',
  },

  // ── Spam filter disabled after this many user messages ──
  SPAM_FILTER_DISABLE_AFTER: 4,

  // ── Timeouts (ms) ──
  TIMEOUTS: {
    context:    5000,
    validation: 10000,
    generation: 30000,
  },

  CACHE_KEY_PREFIX: 'aibuilder_context_',
};