/**
 * lib/nsfwFilter.js
 * NSFW KEYWORD FILTER — Security Layer Step 3
 *
 * Blocks requests that mention prohibited content categories.
 * Uses simple substring matching (no regex) — fast and easy to maintain.
 *
 * Why not regex? For keyword lists this large, simple includes() is
 * faster, more readable, and easier to audit / extend by non-engineers.
 *
 * Categories: adult content, violence, drugs, weapons, fraud, hacking.
 */

// Flat keyword list — lowercase only (input is lowercased before checking).
// Add / remove keywords here without touching any other code.
const BLOCKED_KEYWORDS = [
  // ── Adult content ──
  'porn', 'pornography', 'xxx', 'nude', 'naked', 'masturbat',
  'orgasm', 'erotic', 'onlyfans', 'nsfw',

  // ── Violence ──
  'gore', 'snuff', 'decapitat', 'torture', 'behead', 'mutilat',
  'kill yourself', 'suicide method', 'self-harm how',

  // ── Drugs ──
  'cocaine', 'heroin', 'methamphetamine', 'fentanyl', 'synthesize drug',
  'drug synthesis', 'buy drugs', 'dark web drugs',

  // ── Weapons / WMD ──
  'make a bomb', 'build a bomb', 'explosive device', 'poison recipe',
  'cyanide synthesis', 'bioweapon', 'nuclear weapon', 'dirty bomb',
  'grenade instructions',

  // ── Fraud / Financial crime ──
  'credit card fraud', 'carding tutorial', 'identity theft',
  'money laundering', 'fake invoice', 'phishing page',

  // ── Hacking / Cybercrime ──
  'write malware', 'create ransomware', 'ddos attack', 'botnet',
  'sql injection attack', 'hack into', 'brute force password',
  'keylogger', 'spyware', 'rootkit',
];

/**
 * Checks whether a message contains any prohibited keywords.
 * Returns early on the first match.
 *
 * @param {string} message
 * @returns {{ safe: boolean, keyword?: string }}
 */
export const checkNSFW = (message) => {
  if (!message || typeof message !== 'string') return { safe: true };

  const lower = message.toLowerCase();

  for (const keyword of BLOCKED_KEYWORDS) {
    if (lower.includes(keyword)) {
      console.warn('[Security] NSFW keyword matched:', keyword);
      return {
        safe: false,
        keyword,
        reason: 'Inappropriate content detected. This request cannot be processed.',
      };
    }
  }

  return { safe: true };
};