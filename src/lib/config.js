/**
 * lib/config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central configuration constants for the WOK platform.
 *
 * BASE44 CONTRACT:
 *  - All LLM calls go through base44.integrations.Core.InvokeLLM — no direct API calls.
 *  - Model name strings must match exactly what Base44 accepts.
 *  - Rate limiting is enforced server-side via Generation entity query counts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── LLM Model identifiers (exact Base44 strings — do NOT change) ──────────────
export const MODELS = {
  DEFAULT:    'gpt_5_mini',      // cheapest, fastest — use for classification/safety
  SMART:      'gpt_5_4',         // balanced quality for standard generation
  PRO:        'gemini_3_1_pro',  // deep reasoning, long-context modifications
  AUTO:       'automatic',       // Base44 picks best model per request
};

// ── Rate limiting ─────────────────────────────────────────────────────────────
export const RATE_LIMIT = {
  GENERATIONS_PER_HOUR: 50,   // max generations per user per rolling hour
  MESSAGES_PER_DAY_FREE: 5,   // free plan daily cap
  MESSAGES_PER_MONTH_FREE: 25,
};

// ── Security scoring thresholds ───────────────────────────────────────────────
export const SECURITY = {
  CLEAN_THRESHOLD:   70,  // score >= 70 → "clean"
  FLAGGED_THRESHOLD: 40,  // score 40–69 → "flagged" (warn but allow)
  BLOCKED_THRESHOLD: 0,   // score < 40 → "blocked"
  MAX_VIOLATIONS_BEFORE_BLOCK: 3,
};

// ── Context retrieval limits ──────────────────────────────────────────────────
export const CONTEXT = {
  MAX_HISTORY_MESSAGES:   50,   // last N generation records to load
  MAX_PROJECT_GENS:       10,   // recent gens per project for context
  PROMPT_COMPRESSION_MAX: 4000, // chars — telegraphic prompt cap
};

// ── Sidebar dimensions ────────────────────────────────────────────────────────
export const SIDEBAR = {
  COLLAPSED_W: 54,
  EXPANDED_W:  280,
};

// ── Skeleton loading delays (ms) ─────────────────────────────────────────────
export const SKELETON = {
  MIN_DISPLAY_MS: 400,   // min time to show skeleton (avoid flash)
  STAGGER_MS:     60,    // stagger between skeleton rows
};