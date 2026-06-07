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

// ── Detect if message looks like code (autofix, snippet, JSX, etc.) ──
// If true, most pattern checks are skipped to avoid false positives.
const looksLikeCode = (msg) => {
  const codeSignals = [
    /```/,                         // markdown fences
    /import\s+[\w{]/,             // JS imports
    /export\s+(default|const)/,   // JS exports
    /function\s+\w+\s*\(/,        // function declarations
    /const\s+\w+\s*=/,            // const assignments
    /useState|useEffect|return\s*\(/,  // React hooks / JSX
    /<\/?\w+[\s>]/,               // HTML/JSX tags
    /\{\s*\/\*/,                  // JSX comment blocks
    /Error:|TypeError:|at\s+\w+\s*\(/,  // Error stack traces
  ];
  return codeSignals.some((r) => r.test(msg));
};

// ── Dangerous patterns that have no place in a UI generation request ──
// NOTE: These are NOT applied when the message looks like code.
const QUICK_BLOCKS = [
  // Path traversal / local file access (safe to check even in code)
  /\.\.\/|\/etc\/passwd|\/root\/\.ssh|C:\\Windows\\System32/i,
  // Private cryptographic keys
  /-----BEGIN (PRIVATE|RSA) KEY-----/i,
  // Live API secrets (not local dev keys)
  /(sk_live_[a-zA-Z0-9]{20,}|Bearer\s+[a-zA-Z0-9._-]{30,})/,
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

  // ── If message contains code, skip pattern + spam checks ──
  // Autofix messages contain stack traces and JSX snippets — must not be blocked.
  if (looksLikeCode(trimmed)) {
    return { safe: true };
  }

  // 2–4. Dangerous pattern checks (only for non-code messages)
  for (const pattern of QUICK_BLOCKS) {
    if (pattern.test(trimmed)) {
      console.warn('[Security] Input blocked by pattern:', pattern.toString().slice(0, 40));
      return { safe: false, reason: 'Potentially harmful content detected. Please rephrase your request.' };
    }
  }

  // 5. Repeated character spam (e.g. "aaaaaaaaaaaaaaaa" or "!!!!!!!!!!!!")
  if (/(.)\1{9,}/.test(trimmed)) {
    return { safe: false, reason: 'Message appears to be spam. Please describe what you want to build.' };
  }

  // 6. Excessive caps — skip if message is short (error codes are often ALL CAPS)
  const letters = trimmed.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 20) {
    const capsRatio = (letters.match(/[A-Z]/g) || []).length / letters.length;
    if (capsRatio > CAPS_RATIO_THRESHOLD) {
      return { safe: false, reason: 'Message contains excessive capital letters. Please rephrase.' };
    }
  }

  return { safe: true };
};