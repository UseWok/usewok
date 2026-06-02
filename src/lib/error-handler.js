/**
 * CONTEXTUAL ERROR HANDLER
 * Classifies runtime and network errors into actionable, user-friendly messages.
 * Each error has: title, detail, hint, severity, category.
 */

export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  QUOTA: 'quota',
  ABORT: 'abort',
  RUNTIME: 'runtime',
  AUTH: 'auth',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown',
};

/**
 * Classify any thrown error into a structured object.
 * @param {Error|string} err
 * @param {string} context — where the error occurred (e.g. "Code generation", "Auto-fix")
 * @returns {{ title, detail, hint, severity, category, raw }}
 */
export function classifyError(err, context = 'Operation') {
  const msg = typeof err === 'string' ? err : (err?.message || '');
  const lowerMsg = msg.toLowerCase();

  // User-aborted request
  if (err?.name === 'AbortError' || lowerMsg.includes('aborted')) {
    return {
      title: 'Generation stopped',
      detail: 'You cancelled the request before it completed.',
      hint: null,
      severity: 'info',
      category: ERROR_CATEGORIES.ABORT,
      raw: msg,
    };
  }

  // Credit / quota exhaustion
  if (lowerMsg.includes('quota') || lowerMsg.includes('credit') || lowerMsg.includes('limit') || lowerMsg.includes('429')) {
    return {
      title: 'Credit limit reached',
      detail: 'You have used all available credits for this period.',
      hint: 'Upgrade your plan or wait for the next reset cycle.',
      severity: 'warning',
      category: ERROR_CATEGORIES.QUOTA,
      raw: msg,
    };
  }

  // Authentication / session
  if (lowerMsg.includes('401') || lowerMsg.includes('unauthorized') || lowerMsg.includes('token') || lowerMsg.includes('auth')) {
    return {
      title: 'Session expired',
      detail: 'Your session is no longer valid.',
      hint: 'Reload the page and sign in again.',
      severity: 'error',
      category: ERROR_CATEGORIES.AUTH,
      raw: msg,
    };
  }

  // Network / connectivity
  if (lowerMsg.includes('network') || lowerMsg.includes('fetch') || lowerMsg.includes('failed to fetch') || lowerMsg.includes('econnrefused')) {
    return {
      title: 'Network error',
      detail: `${context} could not reach the server.`,
      hint: 'Check your internet connection and try again.',
      severity: 'error',
      category: ERROR_CATEGORIES.NETWORK,
      raw: msg,
    };
  }

  // Timeout
  if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
    return {
      title: 'Request timed out',
      detail: `${context} took too long to respond.`,
      hint: 'The model may be under heavy load — try a shorter prompt.',
      severity: 'warning',
      category: ERROR_CATEGORIES.TIMEOUT,
      raw: msg,
    };
  }

  // Generic runtime (includes LLM / generation failures)
  return {
    title: `${context} failed`,
    detail: msg || 'An unexpected error occurred.',
    hint: 'Try rephrasing your request or use the Auto-fix button if a preview is active.',
    severity: 'error',
    category: ERROR_CATEGORIES.RUNTIME,
    raw: msg,
  };
}

/**
 * Returns a short single-line display string for inline use.
 */
export function getErrorDisplayText(err, context) {
  const classified = classifyError(err, context);
  return classified.hint
    ? `${classified.title} — ${classified.hint}`
    : classified.title;
}