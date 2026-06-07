/**
 * lib/code-formatter.js
 * 
 * Client-side code formatter (zero dependencies, zero cost).
 * Formats JSX/JS output before display in the chat code block.
 * 
 * Uses a lightweight rule-based formatter — no Prettier (requires Node.js APIs).
 * Handles: indentation normalization, blank line cleanup, brace spacing.
 */

/**
 * Format a raw JSX/JS string for display.
 * @param {string} code
 * @returns {string} formatted code
 */
export function formatCode(code) {
  if (!code || typeof code !== 'string') return code;

  try {
    // Strip wrapping code fences if present
    const fenceMatch = code.match(/^```(?:jsx?|javascript|tsx?)?\n?([\s\S]*?)```$/);
    const raw = fenceMatch ? fenceMatch[1] : code;

    const lines = raw.split('\n');
    const formatted = [];
    let indentLevel = 0;
    const INDENT = '  '; // 2-space indent

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        // Collapse multiple blank lines into one
        if (formatted[formatted.length - 1] !== '') {
          formatted.push('');
        }
        continue;
      }

      // Decrease indent before closing braces/tags
      const closers = (trimmed.match(/^[}\])]|^<\/[A-Za-z]/g) || []).length;
      const openers = (trimmed.match(/[{[(]$|>$|=>\s*\{/g) || []).length;

      if (closers > 0) indentLevel = Math.max(0, indentLevel - closers);

      formatted.push(INDENT.repeat(indentLevel) + trimmed);

      if (openers > 0) indentLevel += openers;
    }

    // Remove trailing blank lines
    while (formatted.length > 0 && formatted[formatted.length - 1] === '') {
      formatted.pop();
    }

    return formatted.join('\n');
  } catch {
    // Never crash — return original on any error
    return code;
  }
}

/**
 * Strip <thinking>...</thinking> blocks from LLM output.
 * @param {string} text
 * @returns {{ thinking: string, code: string }}
 */
export function splitThinkingFromCode(text) {
  if (!text) return { thinking: '', code: '' };

  const thinkingMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/i);
  const thinking = thinkingMatch ? thinkingMatch[1].trim() : '';
  const code = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();

  return { thinking, code };
}