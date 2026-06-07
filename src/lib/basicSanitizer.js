/**
 * lib/basicSanitizer.js
 * INPUT SANITIZATION — Security Layer Step 1
 *
 * Blocks obvious injection attacks, spam, and malformed input before
 * any LLM call is made. Zero cost — pure regex + string checks.
 *
 * Checks (in order, stop on first failure):
 *  1. Length validation (too short / too long)
 *  2. SQL / shell injection patterns
 *  3. XSS attempts
 *  4. File system traversal
 *  5. Private keys / API secrets
 *  6. Repeated character spam
 *  7. Excessive capital letters
 */

// ── Dangerous patterns that have no place in a UI generation request ──
const QUICK_BLOCKS = [
  // SQL injection & shell commands
  /\b(DROP|DELETE|UNION|SELECT|INSERT|UPDATE|exec|eval|system|cmd)\b/i,
  // XSS / HTML injection
  /<script|javascript:|onerror|onclick|<iframe|<object/i,
  // Path traversal / local file access
  /\.\.\/|\/etc\/|\/root\/|C:\\Windows|C:\\System/i,
  // Private cryptographic keys
  /-----BEGIN (PRIVATE|RSA) KEY-----/i,
  // API secrets / credentials
  /(sk_live_|sk_test_|api_key|secret_key|password=|Bearer\s)/i,
];

const MIN_LENGTH = 3;
const MAX_LENGTH = 5000;
const SPAM_REPEAT_THRESHOLD = 10;   // 10+ identical consecutive chars = spam
const CAPS_RATIO_THRESHOLD = 0.6;   // >60% uppercase letters = spam

/**
 * Validates and sanitizes a user message.
 * Returns early on the first failure (fast rejection).
 *
 * @param {string} message — raw user input
 * @returns {{ safe: boolean, reason?: string }}
 */
export const quickSanitize = (message) => {
  // Guard: must be a non-empty string
  if (typeof message !== 'string') {
    return { safe: false, reason: 'Invalid input type.' };
  }

  const trimmed = message.trim();

  // 1. Length check
  if (trimmed.length < MIN_LENGTH) {
    return { safe: false, reason: 'Message too short. Please describe what you want to build.' };
  }
  if (trimmed.length > MAX_LENGTH) {
    return { safe: false, reason: `Message too long. Please keep it under ${MAX_LENGTH} characters.` };
  }

  // 2–5. Dangerous pattern checks
  for (const pattern of QUICK_BLOCKS) {
    if (pattern.test(trimmed)) {
      // Log for monitoring (server-side equivalent — visible in browser devtools)
      console.warn('[Security] Input blocked by pattern:', pattern.toString().slice(0, 40));
      return { safe: false, reason: 'Potentially harmful content detected. Please rephrase your request.' };
    }
  }

  // 6. Repeated character spam (e.g. "aaaaaaaaaaaaaaaa" or "!!!!!!!!!!!!")
  if (/(.)\1{9,}/.test(trimmed)) {
    return { safe: false, reason: 'Message appears to be spam. Please describe what you want to build.' };
  }

  // 7. Excessive caps (e.g. "MAKE A BUTTON PLEASE NOW DO IT NOW")
  const letters = trimmed.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 10) {
    const capsRatio = (letters.match(/[A-Z]/g) || []).length / letters.length;
    if (capsRatio > CAPS_RATIO_THRESHOLD) {
      return { safe: false, reason: 'Message contains excessive capital letters. Please rephrase.' };
    }
  }

  return { safe: true };
};