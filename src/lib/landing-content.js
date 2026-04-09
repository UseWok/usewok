import { base44 } from '@/api/base44Client';

export const LANDING_QUERY_KEY = ['landing_content'];

// Force bypass cache for unauthenticated landing pages
export async function getLandingContentFresh() {
  return getLandingContent();
}

export const DEFAULT_LANDING = {
  nav: {
    logo_url: 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png',
    pricing_url: '/tarifs',
    features_url: '/fonctionnalites',
    tos_url: '#',
    cta_label: 'Start Building',
    login_label: 'Sign In',
  },
  hero: {
    badge: 'AI Financial Coach',
    title: "Let's build your\nfinancial freedom together.",
    subtitle: "Stensor allows you to obtain a complete and actionable financial strategy in minutes, simply using your own words. No spreadsheets, no jargon, no effort.",
    placeholder: "What is the #1 financial issue keeping you up at night...",
    topics: [
      { label: 'Investing in ETFs', prompt: 'I want to start investing in ETFs with $500/month. Give me a concrete step-by-step plan with exact funds to buy and the right allocation.' },
      { label: 'Pay off my debts', prompt: 'I want to eliminate all my debt as fast as possible. Compare avalanche vs snowball with real numbers and give me a monthly action plan.' },
      { label: 'Building my retirement', prompt: 'I want to retire early using the FIRE method. Calculate how much I need to save monthly, explain the 4% rule, and give me exact accounts and investments to prioritize.' },
      { label: 'Passive income', prompt: 'Give me the 5 best passive income strategies that actually work in 2025. For each: realistic monthly earnings, startup cost, and the exact first step I can take today.' },
      { label: 'Optimize my taxes', prompt: 'What are the most powerful legal tax optimization strategies I can use right now to keep more of my money? Be specific and actionable.' },
    ],
  },
  youtube_url: 'https://youtu.be/FXLmWojBELE?si=MUWhJev6EcedlHlV',
  section_title: 'Everything is Possible.',
  cards: [
    {
      num: '01', total: '04',
      title: 'Blueprint your wealth in seconds.',
      desc: "Drop the anxiety. Get a foolproof, step-by-step AI master plan to build your empire.",
      image: 'https://i.postimg.cc/0NRG1C5z/unnamed.png',
    },
    {
      num: '02', total: '04',
      title: 'Bulletproof strategies. Absolute data privacy.',
      desc: "Your data stays yours. Stensor applies strict guardrails for safe, reliable financial guidance.",
      image: 'https://i.postimg.cc/zBNsdMyc/unnamed.png',
    },
    {
      num: '03', total: '04',
      title: 'Your exact roadmap to wealth.',
      desc: "Get a crystal-clear checklist. You hold the keys, make the moves, and build wealth..",
      image: 'https://i.postimg.cc/ZKQ1k09d/unnamed.png',
    },
    {
      num: '04', total: '04',
      title: 'The ultimate AI intelligence network.',
      desc: "GPT, Claude, and Gemini inside. We seamlessly route your question to the smartest brain.",
      image: 'https://i.postimg.cc/mk56G6gJ/unnamed.png',
    },
  ],
  pricing: {
    title: 'Plans for every ambition.',
    subtitle: 'Scale your financial strategy at your own pace.',
    free_title: 'Start for free.',
    free_price: 'Free',
    free_features: ['10 credits/month', 'Standard mode', '3 discussions max', 'Access to all knowledge bases'],
    free_cta: 'Start Building',
    paid_title: 'Paid plans from',
    paid_price: '16',
    paid_currency: '$/mo',
    paid_features: ['100+ credits/month', 'Advanced & Expert modes', 'Unlimited discussions', 'Internet search', 'File attachments'],
    paid_cta: 'See all plans →',
    paid_url: '/tarifs',
  },
  faq: [
    { q: 'What is Stensor?', a: 'Stensor is an AI-powered platform that lets you structure your personal finances in minutes. Just use natural language to turn your goals into investment plans, debt strategies, and retirement solutions ready to execute.' },
    { q: 'Do I need financial knowledge to use Stensor?', a: 'Not at all. Stensor adapts to your level. Whether you\'re a beginner or an experienced investor, answers are always calibrated for you.' },
    { q: 'What strategies can I create with Stensor?', a: 'ETF investing, debt repayment, retirement planning, tax optimization, passive income — and much more. If it\'s financial, Stensor can help.' },
    { q: 'Is my financial data safe?', a: 'Completely. Your conversations are private and encrypted. We never sell your information. Your financial life remains strictly yours.' },
    { q: 'Can I cancel anytime?', a: 'Yes, no conditions. No contract, no hidden fees, no penalties. You keep access until the end of your current billing period.' },
  ],
  cta: {
    title: "So, what shall we\nbuild together?",
    button: 'Start investing →',
  },
  footer: {
    disclaimer: 'AI responses may contain inaccuracies.',
    links: [
      { label: 'Features', url: '/fonctionnalites' },
      { label: 'Pricing', url: '/tarifs' },
      { label: 'Support', url: '/support' },
      { label: 'Terms of Use', url: '#' },
    ],
  },
};

export async function getLandingContent() {
  try {
    const results = await base44.entities.AppSettings.list('-updated_date', 100);
    const record = results.find(r => r.key === 'landing_content');
    if (record) {
      const parsed = JSON.parse(record.value);
      const merged = {};
      for (const key of Object.keys(DEFAULT_LANDING)) {
        merged[key] = parsed[key] !== undefined ? parsed[key] : DEFAULT_LANDING[key];
      }
      return { ...merged, _settingsId: record.id };
    }
  } catch (e) {
    console.warn('getLandingContent error', e);
  }
  return { ...DEFAULT_LANDING };
}

export async function saveLandingContent(data) {
  const { _id, _settingsId, ...clean } = data;
  const value = JSON.stringify(clean);
  const results = await base44.entities.AppSettings.filter({ key: 'landing_content' });
  if (results.length > 0) {
    await base44.entities.AppSettings.update(results[0].id, { key: 'landing_content', value });
  } else {
    await base44.entities.AppSettings.create({ key: 'landing_content', value });
  }
}