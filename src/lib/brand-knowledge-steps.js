// Guided Brand Knowledge — step-by-step config.
// Each step is one friendly "question" the assistant asks, one at a time.
// `why` = plain-language reason it matters (shown to reassure non-experts).
// `fields` describe what to collect and how to render it.

export const BK_STEPS = [
  {
    id: 'identity',
    emoji: '🏷️',
    title: "Let's start with the basics",
    intro: "First, the essentials — who you are.",
    why: "This is the very first thing AI needs. Get it right and every answer about you starts on solid ground.",
    fields: [
      { key: 'business_name', type: 'text', label: 'Your business name', placeholder: 'e.g. UseWok' },
      { key: 'industry',      type: 'text', label: 'What do you do, in a few words?', placeholder: 'e.g. marketing software' },
      { key: 'site_url',      type: 'text', label: 'Your website', placeholder: 'usewok.com' },
      { key: 'headquarters',  type: 'text', label: 'Where are you based?', placeholder: 'e.g. Paris, France' },
    ],
  },
  {
    id: 'audience',
    emoji: '🎯',
    title: 'Who do you sell to?',
    intro: 'Now, your customers.',
    why: "When AI knows exactly who you serve, it recommends you to the right people instead of a generic competitor.",
    fields: [
      { key: 'audience',       type: 'textarea', label: 'Describe your typical customers', placeholder: 'e.g. small business owners who want more visibility…', rows: 3 },
      { key: 'target_segment', type: 'text',     label: 'What type of customers? (short)', placeholder: 'e.g. small businesses' },
      { key: 'scope',          type: 'select',   label: 'Where do you sell?', options: ['Local', 'Regional', 'National', 'Continental', 'Worldwide'] },
    ],
  },
  {
    id: 'value',
    emoji: '💎',
    title: 'What makes you special?',
    intro: "Let's talk about your edge.",
    why: "This is why AI would pick you over someone else. The clearer your strengths, the more often you get recommended by name.",
    fields: [
      { key: 'value_description', type: 'textarea', label: 'In one sentence, what do you do best?', placeholder: 'e.g. we help businesses show up in ChatGPT answers…', rows: 3 },
      { key: 'value_keywords',    type: 'tags',     label: 'Your strengths (up to 5)', suggestKey: 'value_keywords', placeholder: 'e.g. easy to use' },
    ],
  },
  {
    id: 'use_cases',
    emoji: '🛠️',
    title: 'How do people use you?',
    intro: 'Real situations where customers turn to you.',
    why: "AI matches questions to real needs. List the moments people need you, and you'll surface in those exact conversations.",
    fields: [
      { key: 'use_cases', type: 'tags', label: 'Common use cases (up to 5)', suggestKey: 'use_cases', placeholder: 'e.g. check your AI presence' },
    ],
  },
  {
    id: 'authority',
    emoji: '🧠',
    title: "What are you an expert in?",
    intro: 'The topics you own.',
    why: "AI trusts specialists. Name your areas of expertise and it'll cite you as a source, not just a vendor.",
    fields: [
      { key: 'authority_topics', type: 'tags', label: 'Your expertise topics (up to 5)', suggestKey: 'authority_topics', placeholder: 'e.g. AI visibility' },
    ],
  },
  {
    id: 'questions',
    emoji: '❓',
    title: 'What do customers wonder before buying?',
    intro: 'The questions running through their heads.',
    why: "These are the exact things people ask AI. Answer them here and you become the reply they get.",
    fields: [
      { key: 'pre_purchase_questions', type: 'tags', label: 'Questions people ask (up to 5)', suggestKey: 'pre_purchase_questions', placeholder: 'e.g. how to get cited by AI?' },
    ],
  },
  {
    id: 'objections',
    emoji: '🚧',
    title: 'What holds people back?',
    intro: 'Common hesitations you overcome.',
    why: "When AI knows your customers' worries, it can reassure them for you — turning doubt into a recommendation.",
    fields: [
      { key: 'objections', type: 'tags', label: 'Common hesitations (up to 5)', suggestKey: 'objections', placeholder: 'e.g. is it hard to set up?' },
    ],
  },
  {
    id: 'avoid',
    emoji: '🙅',
    title: 'Anything to steer clear of?',
    intro: "Last one — topics you'd rather not be linked to.",
    why: "This keeps AI from associating you with the wrong things. Totally optional, but it sharpens your image.",
    fields: [
      { key: 'avoid_topics', type: 'tags', label: 'Topics to avoid (optional)', suggestKey: 'avoid_topics', placeholder: 'e.g. sensitive topics' },
    ],
  },
];

// All field keys that count toward completion.
export const BK_COMPLETION_KEYS = [
  'business_name', 'industry', 'site_url', 'headquarters',
  'audience', 'target_segment', 'scope',
  'value_description', 'value_keywords',
  'use_cases', 'authority_topics', 'pre_purchase_questions', 'objections',
  // avoid_topics is optional and intentionally NOT counted
];

function filled(v) {
  if (Array.isArray(v)) return v.length > 0;
  return !!(v && String(v).trim());
}

// Completion % across the meaningful fields (0–100).
export function completionPercent(k) {
  const total = BK_COMPLETION_KEYS.length;
  const done = BK_COMPLETION_KEYS.filter(key => filled(k?.[key])).length;
  return Math.round((done / total) * 100);
}

// Is a single step considered "done"? (all its non-optional fields filled)
export function isStepComplete(step, k) {
  if (!step || !Array.isArray(step.fields)) return false;
  const keys = step.fields.map(f => f.key).filter(key => key !== 'avoid_topics');
  if (keys.length === 0) return true;
  return keys.every(key => filled(k?.[key]));
}

// Friendly line based on completion.
export function completionMessage(pct) {
  if (pct >= 100) return "Your profile is complete — AI now knows you inside out. 🎉";
  if (pct >= 75)  return `Almost there! The more complete, the more precise your AI answers.`;
  if (pct >= 40)  return `Nice progress — keep going, every detail helps AI recommend you.`;
  return `Just getting started. The more you add, the better AI talks about you.`;
}