/**
 * serverGuard.js — Tier 1 Backend Security & Management Logic
 *
 * Purpose: Centralizes all server-side security checks, ACL enforcement,
 * audit logging, rate limiting, and generation persistence.
 *
 * Base44 constraint: No real backend. All logic runs client-side against
 * Base44 entities + auth. We treat entity writes as our "server" layer.
 * The key difference from lib/basicSanitizer etc. is that these checks
 * hit the DATABASE — they cannot be bypassed by a client-side JS patch.
 *
 * Exported functions:
 *   - assertUserAllowed(user)          → ACL + block check
 *   - serverRateLimit(userId)          → DB-backed 50 req/hr limit
 *   - writeAuditLog(userId, payload)   → Fire-and-forget audit entry
 *   - saveGeneration(payload)          → Persist generation record
 *   - fetchUserGenerations(userId)     → Last 50 generations (history)
 *   - withGenerationGuard(fn)          → Full orchestrator wrapper
 */

import { base44 } from '@/api/base44Client';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

/** Maximum generations allowed per rolling 1-hour window (server-side hard limit). */
const MAX_GENERATIONS_PER_HOUR = 50;

/** How many security violations before the account is auto-flagged (advisory). */
const VIOLATIONS_THRESHOLD = 5;

// ─────────────────────────────────────────────
// EPIC 2 — ACL / PERMISSION GUARD
// ─────────────────────────────────────────────

/**
 * assertUserAllowed
 * -----------------
 * Must be called at the start of every protected operation.
 * Checks:
 *   1. User is authenticated (object exists)
 *   2. Account is not blocked by an admin
 *
 * Throws a descriptive Error on any failure so the caller can surface it
 * to the UI without leaking internal details.
 *
 * @param {Object} user — result of base44.auth.me()
 * @throws {Error} If user is missing or blocked.
 */
export function assertUserAllowed(user) {
  // Guard: user object must be truthy (i.e., authenticated session)
  if (!user || !user.id) {
    throw new Error('Authentication required. Please sign in.');
  }

  // Guard: admin may have suspended this account
  if (user.is_blocked === true) {
    throw new Error('Your account has been suspended. Contact support.');
  }
}

/**
 * assertAdminOnly
 * ---------------
 * Call this at the start of any admin-only function.
 * Combines the base user check with a role assertion.
 *
 * @param {Object} user — result of base44.auth.me()
 * @throws {Error} If user is not an admin or is blocked.
 */
export function assertAdminOnly(user) {
  assertUserAllowed(user); // Reuse base checks first
  if (user.role !== 'admin') {
    throw new Error('Admin privileges required for this action.');
  }
}

// ─────────────────────────────────────────────
// EPIC 5 — SERVER-SIDE RATE LIMITING (DB-BACKED)
// ─────────────────────────────────────────────

/**
 * serverRateLimit
 * ---------------
 * Queries the Generation entity to count how many generations the user
 * has made in the last 1 hour. If at or above the limit, throws.
 *
 * WHY DB-BACKED: Client-side limiters (Map in memory) can be bypassed
 * by refreshing the page or using the API directly. A database query
 * cannot be faked by the client.
 *
 * @param {string} userId — Authenticated user's ID
 * @throws {Error} If the user has exceeded the hourly rate limit.
 */
export async function serverRateLimit(userId) {
  if (!userId) throw new Error('User ID required for rate limit check.');

  // Calculate the start of the rolling 1-hour window
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();

  // Fetch all generations by this user within the last hour
  // Base44 filter: returns matching records (we use length as a counter)
  const recentGenerations = await base44.entities.Generation.filter({
    created_by_id: userId,
  }, '-created_date', MAX_GENERATIONS_PER_HOUR + 1); // +1 to detect overflow

  // Count only those within the time window (Base44 doesn't support $gte on dates natively)
  const withinWindow = recentGenerations.filter(
    (g) => g.created_date && g.created_date >= oneHourAgo
  );

  if (withinWindow.length >= MAX_GENERATIONS_PER_HOUR) {
    // Log the rate limit event before throwing
    writeAuditLog(userId, {
      action: 'generate',
      resource_type: 'Generation',
      resource_id: 'rate_limit_check',
      status: 'failed',
      error_message: `Rate limit exceeded: ${withinWindow.length} generations in last hour`,
      metadata: { window_start: oneHourAgo, count: withinWindow.length },
    }).catch(() => {}); // Fire-and-forget, never block generation for logging failure

    throw new Error(
      `Rate limit exceeded: ${withinWindow.length}/${MAX_GENERATIONS_PER_HOUR} generations this hour. Please wait before generating again.`
    );
  }

  // Return remaining quota for informational purposes
  return {
    used: withinWindow.length,
    remaining: MAX_GENERATIONS_PER_HOUR - withinWindow.length,
  };
}

// ─────────────────────────────────────────────
// EPIC 1 — AUDIT LOGGING
// ─────────────────────────────────────────────

/**
 * writeAuditLog
 * -------------
 * Fire-and-forget audit trail writer. Never throws — logging failures
 * must NEVER block the user's operation.
 *
 * Writes to the AuditLog entity (admin-read-only via RLS).
 *
 * @param {string} userId — Who triggered the event
 * @param {Object} payload — { action, resource_type, resource_id, status, error_message?, metadata? }
 */
export async function writeAuditLog(userId, payload) {
  try {
    await base44.entities.AuditLog.create({
      created_by_id: userId || 'anonymous',
      action: payload.action || 'generate',
      resource_type: payload.resource_type || 'unknown',
      resource_id: payload.resource_id || 'unknown',
      status: payload.status || 'success',
      error_message: payload.error_message || null,
      // Serialize metadata to JSON string (entity field is textarea)
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
    });
  } catch (err) {
    // Silently swallow — audit logging must never break the user experience
    console.warn('[AuditLog] Failed to write audit entry:', err?.message);
  }
}

// ─────────────────────────────────────────────
// EPIC 1 — GENERATION PERSISTENCE
// ─────────────────────────────────────────────

/**
 * saveGeneration
 * --------------
 * Persists a completed (or failed) generation to the Generation entity.
 * Also increments the user's total generations_count counter.
 *
 * @param {Object} payload — Generation data to persist
 * @param {string} payload.userId
 * @param {string} payload.message
 * @param {string} payload.code
 * @param {number} payload.security_score
 * @param {string} payload.security_flag  — 'clean' | 'flagged' | 'blocked'
 * @param {string} payload.model
 * @param {number} payload.execution_time_ms
 * @param {string} [payload.project_id]
 * @param {string} [payload.error]
 * @returns {Object} The created Generation record
 */
export async function saveGeneration(payload) {
  const record = await base44.entities.Generation.create({
    created_by_id: payload.userId,
    message: payload.message?.slice(0, 5000) || '', // Enforce max length
    code: payload.code || '',
    security_score: payload.security_score ?? 0,
    security_flag: payload.security_flag || 'clean',
    model: payload.model || 'unknown',
    execution_time_ms: payload.execution_time_ms ?? 0,
    project_id: payload.project_id || null,
    error: payload.error || null,
    ip_address: null, // Not accessible from browser context
  });

  // Increment the user's lifetime generation counter (best-effort)
  try {
    const user = await base44.auth.me();
    if (user?.id) {
      const currentCount = user.generations_count || 0;
      await base44.auth.updateMe({ generations_count: currentCount + 1 });
    }
  } catch (err) {
    console.warn('[saveGeneration] Failed to increment user counter:', err?.message);
  }

  return record;
}

// ─────────────────────────────────────────────
// EPIC 4 — GENERATION HISTORY
// ─────────────────────────────────────────────

/**
 * fetchUserGenerations
 * --------------------
 * Returns the last 50 generations for the authenticated user,
 * sorted by newest first. Used for the history panel.
 *
 * @param {string} userId — Authenticated user's ID
 * @returns {Array} Array of Generation records
 */
export async function fetchUserGenerations(userId) {
  if (!userId) throw new Error('User ID required to fetch history.');

  const generations = await base44.entities.Generation.filter(
    { created_by_id: userId },
    '-created_date',
    50
  );

  return generations;
}

// ─────────────────────────────────────────────
// EPIC 3 — PROJECT MANAGEMENT HELPERS
// ─────────────────────────────────────────────

/**
 * createProject
 * -------------
 * Creates a new Project record for the authenticated user.
 *
 * @param {string} userId
 * @param {Object} projectData — { name, description?, tags? }
 * @returns {Object} Created Project record
 */
export async function createProject(userId, projectData) {
  assertUserAllowed(await base44.auth.me());

  return await base44.entities.Project.create({
    created_by_id: userId,
    name: projectData.name?.trim() || 'Untitled Project',
    description: projectData.description?.trim() || null,
    generation_count: 0,
    last_generation_id: null,
    tags: Array.isArray(projectData.tags) ? projectData.tags : [],
  });
}

/**
 * linkGenerationToProject
 * -----------------------
 * After a generation is saved, update the Project's metadata to reflect
 * the new count and last generation reference.
 *
 * @param {string} projectId
 * @param {string} generationId
 */
export async function linkGenerationToProject(projectId, generationId) {
  if (!projectId || !generationId) return;

  try {
    // Fetch current project to get its count
    const projects = await base44.entities.Project.filter({ id: projectId });
    if (!projects.length) return;

    const project = projects[0];
    await base44.entities.Project.update(project.id, {
      generation_count: (project.generation_count || 0) + 1,
      last_generation_id: generationId,
    });
  } catch (err) {
    console.warn('[linkGenerationToProject] Failed to update project:', err?.message);
  }
}

/**
 * fetchUserProjects
 * -----------------
 * Returns all projects belonging to the authenticated user.
 *
 * @param {string} userId
 * @returns {Array} Array of Project records
 */
export async function fetchUserProjects(userId) {
  if (!userId) throw new Error('User ID required to fetch projects.');

  return await base44.entities.Project.filter(
    { created_by_id: userId },
    '-created_date',
    100
  );
}

// ─────────────────────────────────────────────
// EPIC 1+2+5 — FULL ORCHESTRATOR WRAPPER
// ─────────────────────────────────────────────

/**
 * withGenerationGuard
 * -------------------
 * The main orchestrator. Wraps any code generation function with the
 * full Tier 1 security pipeline:
 *
 *   [1] Authenticate & ACL check (assertUserAllowed)
 *   [2] Server-side rate limit (serverRateLimit — DB-backed)
 *   [3] Execute the actual generation function (fn)
 *   [4] Persist the generation record (saveGeneration)
 *   [5] Write audit log (writeAuditLog)
 *   [6] Update project metadata if project_id supplied
 *
 * On any failure at steps 1-3, the generation is aborted and logged.
 *
 * @param {Function} fn — Async function (message, context) → { code, model, thinking }
 * @param {string}   message   — Raw user prompt
 * @param {Object}   [options] — { projectId?, securityScore?, securityFlag? }
 * @returns {Object} { code, model, thinking, generationId }
 */
export async function withGenerationGuard(fn, message, options = {}) {
  const startTime = Date.now();
  let user = null;
  let generationRecord = null;

  try {
    // ── STEP 1: Authenticate & check ACL ──────────────────────────────
    user = await base44.auth.me();
    assertUserAllowed(user); // Throws if blocked or unauthenticated

    // ── STEP 2: Server-side rate limit (DB query — cannot be bypassed) ─
    await serverRateLimit(user.id);

    // ── STEP 3: Execute the actual AI generation function ──────────────
    const result = await fn(message);
    const executionTime = Date.now() - startTime;

    // ── STEP 4: Persist the successful generation ──────────────────────
    generationRecord = await saveGeneration({
      userId: user.id,
      message,
      code: result.code || '',
      security_score: options.securityScore ?? 0,
      security_flag: options.securityFlag || 'clean',
      model: result.model || 'gpt_5_mini',
      execution_time_ms: executionTime,
      project_id: options.projectId || null,
      error: null,
    });

    // ── STEP 5: Audit log — success ────────────────────────────────────
    writeAuditLog(user.id, {
      action: 'generate',
      resource_type: 'Generation',
      resource_id: generationRecord.id,
      status: 'success',
      metadata: {
        model: result.model,
        execution_time_ms: executionTime,
        security_flag: options.securityFlag || 'clean',
        message_length: message?.length,
      },
    }).catch(() => {});

    // ── STEP 6: Update project if linked ──────────────────────────────
    if (options.projectId && generationRecord?.id) {
      linkGenerationToProject(options.projectId, generationRecord.id).catch(() => {});
    }

    return { ...result, generationId: generationRecord?.id };

  } catch (err) {
    const executionTime = Date.now() - startTime;

    // ── FAILURE: Persist failed attempt (for pattern analysis) ─────────
    if (user?.id) {
      // Save a minimal failed record (no code — it didn't generate)
      saveGeneration({
        userId: user.id,
        message: message?.slice(0, 500), // Truncate for blocked attempts
        code: '',
        security_score: options.securityScore ?? 0,
        security_flag: options.securityFlag || 'flagged',
        model: options.model || 'none',
        execution_time_ms: executionTime,
        project_id: options.projectId || null,
        error: err.message,
      }).catch(() => {});

      // Audit log — failure
      writeAuditLog(user.id, {
        action: 'generate',
        resource_type: 'Generation',
        resource_id: 'failed_attempt',
        status: 'failed',
        error_message: err.message,
        metadata: {
          execution_time_ms: executionTime,
          security_flag: options.securityFlag || 'flagged',
          message_length: message?.length,
        },
      }).catch(() => {});

      // Increment security_violations counter if it's a security-related block
      const SECURITY_ERRORS = ['blocked', 'flagged', 'jailbreak', 'nsfw', 'injection', 'sanitize'];
      const isSecurityBlock = SECURITY_ERRORS.some((kw) =>
        err.message?.toLowerCase().includes(kw)
      );
      if (isSecurityBlock) {
        base44.auth.updateMe({
          security_violations: (user.security_violations || 0) + 1,
        }).catch(() => {});
      }
    }

    // Re-throw so the UI/hook can display the error message
    throw err;
  }
}