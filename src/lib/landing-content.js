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
    title: "Build your\nfinancial freedom.",
    subtitle: "Stensor allows you to obtain a complete and actionable financial strategy in minutes, simply using your own words. No spreadsheets, no jargon, no effort.",
    placeholder: "Describe your financial situation…",
    topics: [
      { label: 'Investing in ETFs', prompt: 'I want to start investing in ETFs with $500/month. Give me a concrete step-by-step plan with exact funds to buy and the right allocation.' },
      { label: 'Pay off my debts', prompt: 'I want to eliminate all my debt as fast as possible. Compare avalanche vs snowball with real numbers and give me a monthly action plan.' },
      { label: 'Building my retirement', prompt: 'I want to retire early using the FIRE method. Calculate how much I need to save monthly, explain the 4% rule, and give me exact accounts and investments to prioritize.' },
      { label: 'Générer des revenus passifs', prompt: 'Give me the 5 best passive income strategies that actually work in 2025. For each: realistic monthly earnings, startup cost, and the exact first step I can take today.' },
      { label: 'Optimize my taxes', prompt: 'What are the most powerful legal tax optimization strategies I can use right now to keep more of my money? Be specific and actionable.' },
    ],
  },
  section_title: 'Everything is possible.',
  cards: [
    {
      num: '01', total: '04',
      title: 'Strategize at the speed of thought.',
      desc: "Describe your financial goals to Stensor and watch them instantly transform into a tailor-made investment plan.",
      image: 'https://mail.google.com/mail/u/1?ui=2&ik=d3e253f90c&attid=0.1&permmsgid=msg-a:r-7800607063244962501&th=19d6d4a340c5adc0&view=fimg&fur=ip&permmsgid=msg-a:r-7800607063244962501&sz=s0-l75-ft&attbid=ANGjdJ_QPMb3l9vRQ7tEAsB3ewe0w-CjNwT7KykE-t4yrjSWZCZ8a9L455UOspBOzVjBSUSQmT-pT87BrRtej2N6_6RPh7Zo8G-0DdmPkTrzXx1r4RPTmywt4s3m7Jc&disp=emb&realattid=ii_mnpxi8so0&zw',
    },
    {
      num: '02', total: '04',
      title: 'Financial engineering, running in the background.',
      desc: "Asset allocation, compound interest, risk management and tax optimization are handled automatically while you describe your goals.",
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    },
    {
      num: '03', total: '04',
      title: 'Ready to take action, instantly.',
      desc: "From the first conversation, you get the exact steps to place your money, automate your finances and start building — today.",
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    },
    {
      num: '04', total: '04',
      title: 'One coach. All the brains of AI.',
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