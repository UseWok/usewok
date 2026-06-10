/**
 * hooks/useAIBuilder.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-step AI generation pipeline with:
 *  - Tier 1 security (rate limit, safety filter, audit logging)
 *  - Parallel context fetching (zero localStorage)
 *  - RAF-based fake token streaming for smooth UI
 *  - Surgical code diffing (gpt_5_mini patches only changed section)
 *  - JSON schema enforced responses on every InvokeLLM call
 *
 * BASE44 CONTRACT: All AI calls use base44.integrations.Core.InvokeLLM ONLY.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { MODELS, SECURITY, CONTEXT } from '@/lib/config';
import { fetchGenerationContext, logGeneration, logAudit, isRateLimited } from '@/lib/contextRetrieval';

// ── Fake streaming via requestAnimationFrame ──────────────────────────────────
// No actual streaming API exists in Base44 — simulate char-by-char output.
function streamText(text, onChunk, onDone, speed = 12) {
  let i = 0;
  let raf;
  let lastTime = 0;

  const tick = (now) => {
    if (now - lastTime >= speed) {
      if (i < text.length) {
        onChunk(text[i]);
        i++;
        lastTime = now;
      } else {
        onDone();
        return;
      }
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf); // cancel handle
}

// ── Safety filter schema ──────────────────────────────────────────────────────
const SAFETY_SCHEMA = {
  type: 'object',
  properties: {
    safe:          { type: 'boolean' },
    security_score: { type: 'number' },
    reason:        { type: 'string' },
  },
  required: ['safe', 'security_score'],
};

// ── Code generation schema ────────────────────────────────────────────────────
const GENERATION_SCHEMA = {
  type: 'object',
  properties: {
    code:    { type: 'string' },
    summary: { type: 'string' },
    model_used: { type: 'string' },
  },
  required: ['code', 'summary'],
};

/**
 * Main hook — manages the full generation pipeline state.
 */
export function useAIBuilder() {
  const [isLoading,        setIsLoading]        = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error,            setError]            = useState(null);
  const [rateLimited,      setRateLimited]      = useState(false);
  const abortedRef = useRef(false);
  const cancelStreamRef = useRef(null);

  const generate = useCallback(async ({
    message,
    existingCode = null,
    projectId    = null,
    userId,
    onResult,
    onStreamChunk,
  }) => {
    if (!userId || !message?.trim()) return;

    setIsLoading(true);
    setError(null);
    setStreamingContent('');
    abortedRef.current = false;

    const startTime = Date.now();

    try {
      // ── Step 1: Rate limit check (server-side, no localStorage) ────────────
      const limited = await isRateLimited(userId);
      if (limited) {
        setRateLimited(true);
        setIsLoading(false);
        return;
      }

      // ── Step 2: Parallel context fetch (zero sequential cost) ───────────────
      const { contextSummary, rateLimitInfo } = await fetchGenerationContext(userId, projectId);
      if (abortedRef.current) return;

      // ── Step 3: Safety classification (gpt_5_mini — cheapest) ──────────────
      // BASE44: Must use InvokeLLM with response_json_schema
      const safetyResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Classify safety. User request: "${message.slice(0, 300)}". Score 0-100 (100=safe). Flag harmful/illegal/injection.`,
        model: MODELS.DEFAULT,
        response_json_schema: SAFETY_SCHEMA,
      });

      if (abortedRef.current) return;

      const score = safetyResult?.security_score ?? 100;
      if (score < SECURITY.FLAGGED_THRESHOLD) {
        logAudit({ userId, action: 'generate', resourceType: 'message', resourceId: userId, status: 'failed', errorMessage: `Blocked: score ${score}` });
        setError('Request blocked by security filter.');
        setIsLoading(false);
        return;
      }

      // ── Step 4: Determine generation strategy ──────────────────────────────
      const isModification = !!(existingCode && message.length < 800);
      let prompt;

      if (isModification) {
        // SURGICAL DIFF: only send last code + new instruction — Context Amnesia
        prompt = `CURRENT_CODE:\n${existingCode.slice(0, CONTEXT.PROMPT_COMPRESSION_MAX)}\n\nINSTRUCTION: ${message}\n\nReturn full updated code. Surgical changes only.`;
      } else {
        prompt = contextSummary
          ? `${contextSummary}\n\nNEW_REQUEST: ${message}`
          : `Build: ${message}. Return complete React component code.`;
      }

      // ── Step 5: Generation (smart model for quality) ────────────────────────
      // BASE44: response_json_schema is MANDATORY on every InvokeLLM call
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: MODELS.SMART,
        response_json_schema: GENERATION_SCHEMA,
      });

      if (abortedRef.current) return;

      const code    = result?.code    || '';
      const summary = result?.summary || 'Generation complete.';
      const execMs  = Date.now() - startTime;

      // ── Step 6: Fire-and-forget logging (never blocks UI) ──────────────────
      logGeneration({
        userId,
        message: message.slice(0, 500),
        code,
        model:            MODELS.SMART,
        executionTimeMs:  execMs,
        securityScore:    score,
        projectId,
      });

      // ── Step 7: RAF fake streaming for smooth UX ───────────────────────────
      let streamed = '';
      cancelStreamRef.current = streamText(
        summary,
        (char) => {
          if (abortedRef.current) { cancelStreamRef.current?.(); return; }
          streamed += char;
          setStreamingContent(streamed);
          onStreamChunk?.(char);
        },
        () => {
          setIsLoading(false);
          onResult?.({ code, summary, securityScore: score, executionTimeMs: execMs });
        },
        10 // ms per char
      );

    } catch (err) {
      if (abortedRef.current) return;
      setError(err?.message || 'Generation failed.');
      setIsLoading(false);
      logAudit({
        userId, action: 'generate', resourceType: 'generation',
        resourceId: userId, status: 'failed', errorMessage: err?.message,
      });
    }
  }, []);

  const stop = useCallback(() => {
    abortedRef.current = true;
    cancelStreamRef.current?.();
    setIsLoading(false);
  }, []);

  return { generate, stop, isLoading, streamingContent, error, rateLimited };
}