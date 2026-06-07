/**
 * lib/config.js
 * Central configuration for the AI Builder pipeline.
 * Base44 constrained environment — no external APIs.
 */

export const AI_CONFIG = {
  // ── Cache ──
  CACHE_TTL_MINUTES: 30,
  MAX_FILES_TO_READ: 5,
  MAX_ENTITY_SCHEMAS: 20,
  MAX_STORAGE_MB: 10,
  STORAGE_EVICTION_THRESHOLD_MB: 8,

  // ── Streaming ──
  STREAMING_TOKEN_DELAY_MS: 20,     // ms between token batches (setInterval mode)
  STREAMING_TOKENS_PER_FRAME: 5,    // tokens per requestAnimationFrame tick
  THINKING_RATIO: 0.3,              // 30% thinking / 70% code during fake stream

  // ── Base44 model names — EXACT strings, do not change ──
  // Routing matrix (see lib/ai-orchestrator.js for full strategy):
  //   automatic      → gpt_4o_mini: spam filter (msgs 1-3), file/image read, code extraction
  //   gpt_5_mini     → default tasks, simple modifications
  //   gemini_3_flash → web browsing (add_context_from_internet)
  //   gemini_3_1_pro → new builds + complex modifications (telegraphic prompt)
  MODELS: {
    filter:     'automatic',        // gpt_4o_mini — spam/safety (disabled after msg 4)
    extraction: 'automatic',        // gpt_4o_mini — code section extractor + complexity router
    fileRead:   'automatic',        // gpt_4o_mini — file & image analysis
    webBrowse:  'gemini_3_flash',   // web search
    default:    'gpt_5_mini',       // general tasks + simple modifications
    build:      'gemini_3_1_pro',   // new builds + complex modifications
    // Legacy aliases kept for useAIBuilder.js compatibility
    validation: 'automatic',
    structuring:'gpt_5_mini',
    generation: 'gemini_3_1_pro',
  },

  // ── Spam filter: disabled after this many user messages (0-based) ──
  SPAM_FILTER_DISABLE_AFTER: 4,

  // ── Timeouts (ms) ──
  TIMEOUTS: {
    context: 5000,      // project context fetch
    validation: 10000,  // message validation LLM call
    generation: 30000,  // code generation LLM call
  },

  // ── localStorage cache key prefix ──
  CACHE_KEY_PREFIX: 'aibuilder_context_',
};