/**
 * lib/contextRetrieval.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cloud-first context fetching for the WOK AI generation pipeline.
 *
 * BASE44 CONTRACT:
 *  - ZERO localStorage for context — all data from base44.entities.* to ensure
 *    perfect cross-device sync (same context on PC and mobile).
 *  - Uses Promise.all for zero-cost parallel fetching (no sequential API cost).
 *  - Returns aggregated context object ready for InvokeLLM prompt injection.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { base44 } from '@/api/base44Client';
import { CONTEXT, RATE_LIMIT, SECURITY } from './config';

/**
 * Fetch all context needed for generation in parallel — zero sequential cost.
 * @param {string} userId
 * @param {string|null} projectId
 * @returns {Promise<{recentGenerations, project, rateLimitInfo, contextSummary}>}
 */
export async function fetchGenerationContext(userId, projectId = null) {
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();

  const [recentGenerations, projectData, hourlyGens] = await Promise.all([
    base44.entities.Generation.filter(
      { created_by_id: userId },
      '-created_date',
      CONTEXT.MAX_HISTORY_MESSAGES
    ).catch(() => []),

    projectId
      ? base44.entities.Project.filter({ id: projectId, created_by_id: userId })
          .then(r => r[0] || null)
          .catch(() => null)
      : Promise.resolve(null),

    base44.entities.Generation.filter(
      { created_by_id: userId },
      '-created_date',
      RATE_LIMIT.GENERATIONS_PER_HOUR + 1
    ).catch(() => []),
  ]);

  const countThisHour = hourlyGens.filter(g => g.created_date > oneHourAgo).length;

  return {
    recentGenerations,
    project: projectData,
    rateLimitInfo: {
      countThisHour,
      isLimited: countThisHour >= RATE_LIMIT.GENERATIONS_PER_HOUR,
    },
    contextSummary: buildContextSummary(recentGenerations, projectData),
  };
}

/**
 * Build a telegraphic, token-efficient context summary for the LLM prompt.
 * Context Amnesia: only last code + project info — forget all prior discussion.
 */
function buildContextSummary(recentGenerations, project) {
  const lastGen = recentGenerations[0];
  const lines = [];

  if (project) {
    lines.push(`PROJECT: ${project.name}${project.description ? ' — ' + project.description.slice(0, 120) : ''}`);
  }

  if (lastGen?.code) {
    lines.push(`CURRENT_CODE:\n${lastGen.code.slice(0, CONTEXT.PROMPT_COMPRESSION_MAX)}`);
  }

  return lines.join('\n');
}

/**
 * Log a generation record to the cloud — fire-and-forget, never blocks UI.
 * @param {object} params
 */
export function logGeneration(params) {
  const { userId, message, code, model, executionTimeMs, securityScore, error, projectId } = params;

  const flag =
    securityScore >= SECURITY.CLEAN_THRESHOLD   ? 'clean'   :
    securityScore >= SECURITY.FLAGGED_THRESHOLD ? 'flagged' : 'blocked';

  base44.entities.Generation.create({
    created_by_id:     userId,
    message:           message?.slice(0, 500) || '',
    code:              code || '',
    security_score:    securityScore ?? 100,
    security_flag:     flag,
    model:             model || 'unknown',
    execution_time_ms: executionTimeMs || 0,
    error:             error || null,
    project_id:        projectId || null,
  }).catch(() => {}); // silent — logging must never crash generation
}

/**
 * Log an audit event (admin actions, security events, etc.).
 * @param {object} params
 */
export function logAudit(params) {
  const { userId, action, resourceType, resourceId, status, errorMessage, metadata } = params;

  base44.entities.AuditLog.create({
    created_by_id: userId,
    action,
    resource_type:  resourceType || '',
    resource_id:    resourceId   || '',
    status:         status       || 'success',
    error_message:  errorMessage || null,
    metadata:       metadata ? JSON.stringify(metadata) : null,
  }).catch(() => {});
}

/**
 * Server-side rate limit check — no localStorage.
 * @param {string} userId
 * @returns {Promise<boolean>} true if user is rate-limited
 */
export async function isRateLimited(userId) {
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
  const gens = await base44.entities.Generation.filter(
    { created_by_id: userId },
    '-created_date',
    RATE_LIMIT.GENERATIONS_PER_HOUR + 1
  ).catch(() => []);

  const count = gens.filter(g => g.created_date > oneHourAgo).length;
  return count >= RATE_LIMIT.GENERATIONS_PER_HOUR;
}