import { base44 } from '@/api/base44Client';

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
    title: "Build your\nfinancial freedom.",
    subtitle: "Thousands of users trust Stensor to invest smarter and reach financial independence — starting from a simple conversation.",
    placeholder: "Describe your financial situation…",
    topics: ['Invest in ETFs', 'Pay off debt', 'Build retirement', 'Passive income', 'Tax optimization'],
  },
  section_title: 'Everything is possible.',
  cards: [
    {
      num: '01', total: '04',
      title: 'Invest at the speed of your ambitions.',
      desc: "Describe your situation to Stensor and watch your doubts transform into a clear, mathematical action plan.",
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    },
    {
      num: '02', total: '04',
      title: 'Financial engineering, running in the background.',
      desc: "Asset allocation, compound interest, risk management and tax optimization are handled automatically while you describe your goals.",
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    },
    {
      num: '03', total: '04',
      title: 'Actionable. Instantly.',
      desc: "From the first conversation, you get the exact steps to place your money, automate your finances and start building — today.",
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    },
    {
      num: '04', total: '04',
      title: 'One coach. Every AI brain.',
      desc: "Access the latest AI models (GPT, Claude, Gemini). Stensor automatically selects the best model for your question.",
      image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
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
    paid_price: '9',
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
    const results = await base44.entities.LandingContent.filter({ section: 'main' });
    if (results.length > 0) {
      return { ...DEFAULT_LANDING, ...JSON.parse(results[0].content), _id: results[0].id };
    }
  } catch {}
  return DEFAULT_LANDING;
}

export async function saveLandingContent(data) {
  try {
    const results = await base44.entities.LandingContent.filter({ section: 'main' });
    const { _id, ...clean } = data;
    const content = JSON.stringify(clean);
    if (results.length > 0) {
      await base44.entities.LandingContent.update(results[0].id, { section: 'main', content });
    } else {
      await base44.entities.LandingContent.create({ section: 'main', content });
    }
  } catch {}
}