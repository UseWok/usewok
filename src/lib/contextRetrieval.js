/**
 * lib/contextRetrieval.js
 * Project context manager with aggressive localStorage caching.
 *
 * BASE44 CONSTRAINTS:
 * - NO fetch() to external APIs.
 * - Entity data via base44.entities.*.schema() only (not full data).
 * - File reading is simulated — in Base44 there is no file-system API,
 *   so we read from known locations via the SDK or skip gracefully.
 * - Cache key: aibuilder_context_<projectId>
 * - TTL: 30 minutes (configurable)
 * - Max storage: 8 MB before auto-eviction kicks in
 */

import { base44 } from '@/api/base44Client';
import { AI_CONFIG } from './config';
import { safeLocalStorageSet, clearOldestContextCache, getCacheStatus } from './cacheManager';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Convert minutes to milliseconds */
const minutesToMs = (min) => min * 60 * 1000;

/** Build the localStorage key for a given project */
const cacheKey = (projectId) => `${AI_CONFIG.CACHE_KEY_PREFIX}${projectId}`;

/**
 * Wrap a promise with a hard timeout.
 * @param {Promise} promise
 * @param {number} ms — timeout in milliseconds
 * @param {string} label — used in the error message
 */
const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject({ code: 'CONTEXT_TIMEOUT', message: `${label} timed out after ${ms}ms` }),
        ms
      )
    ),
  ]);

// ─────────────────────────────────────────────
// 1. USER STATE
// ─────────────────────────────────────────────

/**
 * Fetches minimal user state. Caches only safe fields (no tokens).
 * @returns {{ userId, email, role }}
 */
const fetchUserState = async () => {
  try {
    const u = await withTimeout(base44.auth.me(), AI_CONFIG.TIMEOUTS.context, 'auth.me');
    // Only store non-sensitive fields
    return { userId: u.id, email: u.email, role: u.role };
  } catch (err) {
    if (err.code === 'CONTEXT_TIMEOUT') throw err;
    throw { code: 'AUTH_REQUIRED', message: 'User not authenticated' };
  }
};

// ─────────────────────────────────────────────
// 2. ENTITY SCHEMAS
// ─────────────────────────────────────────────

/**
 * Reads .schema() from all known Base44 entities (up to MAX_ENTITY_SCHEMAS).
 * Returns an object { [entityName]: jsonSchema }.
 *
 * NOTE: We only cache schemas (structure), NOT entity data (records).
 * This keeps the cache tiny and avoids stale data problems.
 */
const fetchEntitySchemas = async () => {
  // List all entities available on the SDK instance
  // base44.entities is a proxy — we enumerate known keys
  const entityProxy = base44.entities;

  // Collect entity names that are callable
  const allEntityNames = Object.keys(entityProxy).filter(
    (k) => typeof entityProxy[k]?.schema === 'function'
  );

  // Limit to MAX_ENTITY_SCHEMAS to avoid huge payloads
  const entityNames = allEntityNames.slice(0, AI_CONFIG.MAX_ENTITY_SCHEMAS);

  const schemas = {};
  await Promise.all(
    entityNames.map(async (name) => {
      try {
        schemas[name] = await entityProxy[name].schema();
      } catch {
        // If schema() fails for an entity, skip it silently
        console.warn(`[ContextRetrieval] Could not read schema for entity: ${name}`);
      }
    })
  );

  return schemas;
};

// ─────────────────────────────────────────────
// 3. PROJECT FILES (SELECTIVE)
// ─────────────────────────────────────────────

/**
 * Priority file list — we pick at most MAX_FILES_TO_READ files.
 * In Base44 there's no native FS API, so we attempt to import
 * known source paths dynamically. Failures are silently skipped.
 *
 * Heuristic: If userHint is provided (e.g., "Button"), files whose
 * path contains that hint are prioritized.
 *
 * @param {string} [userHint] — keyword from the user message
 * @returns {Array<{ filePath, content, language }>}
 */
const fetchProjectFiles = async (userHint = '') => {
  // Known candidate paths (adjust for your project structure)
  const candidates = [
    'pages/ChatPage',
    'components/chat/ChatInputBar',
    'components/chat/ChatHeader',
    'lib/chat-prompts.js',
    'lib/chat-storage.js',
    'components/Layout',
    'App.jsx',
  ];

  // If user mentioned a specific keyword, sort matching files first
  const hint = userHint.toLowerCase();
  const sorted = hint
    ? [
        ...candidates.filter((p) => p.toLowerCase().includes(hint)),
        ...candidates.filter((p) => !p.toLowerCase().includes(hint)),
      ]
    : candidates;

  const selected = sorted.slice(0, AI_CONFIG.MAX_FILES_TO_READ);

  const results = await Promise.allSettled(
    selected.map(async (filePath) => {
      try {
        // Dynamic import only works for known JS/JSX modules in Vite
        // For arbitrary paths this will fail — we catch and skip gracefully
        const mod = await import(/* @vite-ignore */ `../${filePath}`);
        const content = mod.default
          ? `// [dynamic import — source not readable at runtime]`
          : '';
        const language = filePath.endsWith('.json') ? 'json' : 'jsx';
        return { filePath, content, language };
      } catch {
        // File not importable — return path only (still useful for the LLM)
        const language = filePath.endsWith('.json') ? 'json' : 'jsx';
        return { filePath, content: '', language };
      }
    })
  );

  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
};

// ─────────────────────────────────────────────
// 4. PROJECT CONFIG
// ─────────────────────────────────────────────

/**
 * Reads lightweight project config from localStorage (set by the app on boot).
 * Falls back to safe defaults if nothing is stored.
 */
const fetchProjectConfig = (projectId) => {
  try {
    const raw = localStorage.getItem(`wok_project_config_${projectId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    projectName: 'WOK AI Builder',
    projectId,
    theme: 'dark',
    dependencies: ['react', 'tailwind', 'shadcn/ui', 'framer-motion', 'lucide-react'],
  };
};

// ─────────────────────────────────────────────
// 5. MAIN EXPORT: getProjectContext
// ─────────────────────────────────────────────

/**
 * Returns the full project context object, using cache when available.
 *
 * @param {string} projectId
 * @param {{ forceRefresh?: boolean, ttl?: number, userHint?: string }} options
 * @returns {Promise<{ files, entitySchemas, user, projectConfig, timestamp }>}
 */
export const getProjectContext = async (projectId, options = {}) => {
  if (!projectId) {
    throw { code: 'INVALID_PROJECT', message: 'projectId is required' };
  }

  const ttlMs = minutesToMs(options.ttl ?? AI_CONFIG.CACHE_TTL_MINUTES);
  const key = cacheKey(projectId);

  // ── Cache read (skip if forceRefresh) ──
  if (!options.forceRefresh) {
    try {
      const cached = JSON.parse(localStorage.getItem(key) || 'null');
      if (cached && Date.now() - cached.timestamp < ttlMs) {
        // Touch lastAccessed so eviction knows this was recently used
        cached.lastAccessed = Date.now();
        safeLocalStorageSet(key, cached);
        return cached;
      }
    } catch {
      // Corrupt cache entry — fall through to fresh fetch
      localStorage.removeItem(key);
    }
  }

  // ── Storage overflow check before fetching ──
  const storageStatus = getCacheStatus();
  if (storageStatus.isFull) {
    console.warn('[ContextRetrieval] Storage near limit, evicting oldest cache…');
    clearOldestContextCache();
  }

  // ── Fresh fetch (parallel where possible) ──
  let user, entitySchemas, files, projectConfig;

  try {
    [user, entitySchemas, files] = await Promise.all([
      fetchUserState(),
      fetchEntitySchemas(),
      fetchProjectFiles(options.userHint),
    ]);
    projectConfig = fetchProjectConfig(projectId);
  } catch (err) {
    // Re-throw typed errors (AUTH_REQUIRED, CONTEXT_TIMEOUT, etc.)
    if (err.code) throw err;
    throw { code: 'CONTEXT_TIMEOUT', message: `Failed to load project context: ${err.message}` };
  }

  const context = {
    files,
    entitySchemas,
    user,
    projectConfig,
    timestamp: Date.now(),
    lastAccessed: Date.now(),
  };

  // ── Cache write — trim files if context is too large ──
  const serialized = JSON.stringify(context);
  const sizeMB = (serialized.length * 2) / 1024 / 1024;

  if (sizeMB > 5) {
    // Trim to 3 files and retry
    console.warn('[ContextRetrieval] Context too large, trimming to 3 files…');
    context.files = context.files.slice(0, 3);
  }

  const written = safeLocalStorageSet(key, context);
  if (!written) {
    // Could not cache — throw so the caller knows (non-fatal for the pipeline)
    console.warn('[ContextRetrieval] Could not persist context to cache (storage full).');
    // We still return the context — just uncached
  }

  return context;
};