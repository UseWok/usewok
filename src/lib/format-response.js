/**
 * Formats AI responses with recommendations and readability standards
 * Use when presenting data, insights, or analytics to users
 */

// ── Icons for recommendation types
const ICONS = {
  opportunity: '✦',
  risk: '⚠',
  action: '→'
};

// ── Validate recommendation constraints
const validateRecommendation = (insight, support) => {
  const insightWords = insight.split(' ').length;
  const supportWords = support.split(' ').length;
  
  if (insightWords > 12) console.warn('Insight exceeds 12 words');
  if (supportWords > 25) console.warn('Support exceeds 25 words');
};

// ── Format a single recommendation
const formatRecommendation = (type, insight, support) => {
  validateRecommendation(insight, support);
  const icon = ICONS[type] || ICONS.action;
  return `**${icon} ${insight}**\n${support}`;
};

// ── Build complete recommendations section (max 3)
export const buildRecommendations = (recs) => {
  if (!recs || recs.length === 0) return '';
  
  const top3 = recs.slice(0, 3);
  const formatted = top3.map(r => formatRecommendation(r.type, r.insight, r.support));
  
  return '\n\n---\n\n### Recommendations\n\n' + formatted.join('\n\n');
};

// ── Check Flesch-Kincaid readability (simplified)
export const checkReadability = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  return Math.round(score);
};

// ── Count syllables (naive implementation)
const countSyllables = (word) => {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
};

// ── Simplify text to Grade 7 level
export const simplifyText = (text) => {
  const bannedWords = ['leverage', 'utilize', 'synergy', 'robust', 'comprehensive', 'streamline'];
  const replacements = {
    'leverage': 'use',
    'utilize': 'use',
    'synergy': 'collaboration',
    'robust': 'strong',
    'comprehensive': 'complete',
    'streamline': 'simplify'
  };
  
  let simplified = text;
  bannedWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    simplified = simplified.replace(regex, replacements[word]);
  });
  
  // Break long sentences
  simplified = simplified.replace(/([.!?])\s+(However|Therefore|Furthermore|Additionally|Moreover),\s+/g, '$1 ');
  
  return simplified;
};

// ── Format complete response with structure
export const formatAIResponse = (data) => {
  const { framing, visual, insight, recommendations, question } = data;
  
  let response = '';
  
  // 1. Framing (one line)
  if (framing) response += framing + '\n\n';
  
  // 2. Visual placeholder (handled by UI)
  if (visual) response += `[Visual: ${visual.type}]\n\n`;
  
  // 3. Key insight (2-3 sentences)
  if (insight) {
    const simplified = simplifyText(insight);
    response += simplified + '\n';
  }
  
  // 4. Recommendations
  if (recommendations) {
    response += buildRecommendations(recommendations);
  }
  
  // 5. Open question
  if (question) {
    response += `\n\n---\n\n${question}`;
  }
  
  return response;
};

// ── Example usage for AI prompts
export const RESPONSE_FORMAT_PROMPT = `When presenting data or insights, use this structure:

1. One-line framing (what this is about)
2. Visual suggestion (chart, gauge, or card)
3. Key insight (2-3 sentences max, Grade 7 reading level)
4. Recommendations (max 3, ranked by impact)
   Format: **✦/⚠/→ Bold insight** + supporting sentence
5. Optional: one open question

Rules:
- Active voice only
- Max 20 words per sentence
- No: "leverage", "utilize", "synergy", "robust", "comprehensive", "streamline"
- Use conversational connectors: "So,", "Here's the thing:", "What this means:"
- Vary sentence rhythm: short. Then longer with context. Then short again.`;