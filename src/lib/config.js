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
  MODELS: {
    validation: 'gpt_5_mini',       // cheapest, fast classification
    structuring: 'gpt_5_mini',      // prompt engineering pass
    generation: 'gemini_3_1_pro',   // best code quality
  },

  // ── Timeouts (ms) ──
  TIMEOUTS: {
    context: 5000,      // project context fetch
    validation: 10000,  // message validation LLM call
    generation: 30000,  // code generation LLM call
  },

  // ── localStorage cache key prefix ──
  CACHE_KEY_PREFIX: 'aibuilder_context_',
};