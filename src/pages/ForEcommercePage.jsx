import { useEffect } from 'react';
import PersonaLanding from '@/components/landing/PersonaLanding';

// ── SEO ── page-specific title & description
const SEO = {
  title: 'Get your products recommended by ChatGPT | UseWok for e-commerce',
  description: "The AI visibility platform for online stores. Find out whether ChatGPT, Gemini and Claude recommend your products — and get a clear plan to become the answer when shoppers ask AI what to buy.",
};

// ── Unique persona content (~30% unique text) ──
const CONTENT = {
  hero: {
    eyebrow: 'Built for e-commerce & online stores',
    title: <>Get your products<br />recommended by <span className="hi">ChatGPT.</span></>,
    subtitle: "Shoppers now ask AI what to buy before they ever hit Google. See whether ChatGPT, Gemini and Claude suggest your products — and get the exact steps to become the recommendation instead of your competitor.",
    ctaPrimary: 'Analyze my store →',
    ctaSecondary: 'See a demo',
  },
  trustLabel: 'Online stores already tracking their AI product visibility',
  understand: {
    eyebrow: 'Understand',
    title: 'Know if AI recommends your products',
    feat1Title: 'Find the buying prompts you miss',
    feat1Text: 'Discover the "best product for…" queries where AI names a competitor\'s catalog instead of yours on ChatGPT, Claude and Gemini.',
    feat2Title: 'Prioritize what drives sales',
    feat2Text: 'A clear plan, ranked by impact on purchase-intent queries, so you win the recommendations that actually convert.',
  },
  promptCard: <>What are the best products to buy from <b>my store</b>?</>,
  reliability: {
    title: 'Reliability for your whole catalog',
    subtitle: 'Verified visibility data on your product queries, continuously updated, on infrastructure hosted in France.',
    items: [
      { title: 'Product-level analysis', text: 'See how AI treats your key products and categories across every engine.' },
      { title: 'Structured data audit', text: 'Check the product schema and signals that help AI understand and recommend your catalog.' },
      { title: 'Share of voice vs competitors', text: 'Measure how often AI picks your products over rival stores, week after week.' },
    ],
  },
  how: {
    title: 'Turn AI recommendations into orders — without a marketing team',
    intro: <><b style={{color:'var(--ink)'}}>SEO</b> brings shoppers from search results. <b style={{color:'var(--orange-deep)'}}>AEO</b> gets your products named inside AI answers when people ask what to buy — often without a single click. UseWok helps your store win both.</>,
    items: [
      { title: 'Find why AI skips your products', text: 'The reason ChatGPT recommends a competitor\'s catalog instead of yours is hidden in citation data. We dig it out.' },
      { title: 'Build your product action plan', text: 'You finally know which pages, descriptions and schema to fix first to get recommended.' },
      { title: 'You stay in control of the store', text: 'You validate every change before publishing — UseWok prepares, you decide.' },
      { title: 'And watch product citations climb', text: 'Every action is tied to measurable impact on how often AI recommends your products.' },
    ],
  },
  confidence: {
    title: 'Grow your store\'s AI presence with confidence',
    subtitle: 'Track every product improvement, share results with your team, and keep a clear view of your buying-query trajectory.',
    cards: [
      { title: 'Full citation history', text: 'Look back at every change and measure the real impact on your product recommendations.' },
      { title: 'Team spaces for your shop', text: 'Keep merchandisers and marketers aligned on the same AI visibility goals.' },
      { title: 'Guided product action plan', text: 'A clear path, step by step, from diagnosis to getting your catalog recommended.' },
    ],
  },
  testimonials: [
    { text: 'We finally know which of our products ChatGPT recommends — and which ones we were completely invisible for.', name: 'Camille Aubert', role: 'E-commerce owner' },
    { text: 'After fixing our product data, we started showing up in "best gift for…" answers within weeks.', name: 'Julien Roze', role: 'Head of Growth, online store' },
    { text: 'The share-of-voice view against competitor shops is exactly what we were missing.', name: 'Sarah Nizan', role: 'D2C brand founder' },
  ],
  stats: [
    { big: '+38%', lbl: 'product citations in AI answers' },
    { big: '30 sec', lbl: 'to your first store score' },
    { big: '8', lbl: 'AI engines checked for your catalog' },
  ],
  pricingIntro: 'A shopping-visibility agency typically charges $100+/mo and assumes you already understand AI recommendations. UseWok replaces all of that for your store — for less than half the cost.',
  pricingCard: 'Full AI visibility score for your catalog, product action plan, guided fix instructions, competitor benchmarking, and tracking on all 8 AI engines. For online stores that want to be the product AI recommends.',
  finalCta: 'So, which store are we analyzing?',
  faq: [
    { q: 'How do I know if ChatGPT recommends my products?', a: 'UseWok runs the real buying prompts shoppers type — like "best [product] to buy" — and shows you whether your products are named in the answers, and how you compare to competing stores.' },
    { q: 'Does UseWok analyze individual products or the whole store?', a: 'Both. You get a store-level AI visibility score plus insight into how AI treats your key products and categories across every engine.' },
    { q: 'Which AI engines can I track for my store?', a: 'UseWok tracks the major AI engines: ChatGPT, Perplexity, Google AI Overviews, Google AI mode, Claude, Microsoft Copilot and Gemini — all for your product queries.' },
    { q: 'What do I fix to get my products recommended?', a: 'UseWok points to the concrete changes — product descriptions, structured data (schema), and authority signals — that help AI understand and recommend your catalog, ranked by impact.' },
    { q: 'How fast will my products start appearing in AI answers?', a: "Faster than classic SEO. Many stores see movement in product citations within 7 to 30 days, thanks to daily tracking and a prioritized action plan." },
    { q: 'How is this different from the SEO on my product pages?', a: 'SEO optimizes for clicks from search results. AEO optimizes for your products being mentioned and recommended inside AI answers when shoppers ask what to buy — often with no click at all.' },
  ],
};

export default function ForEcommercePage() {
  useEffect(() => {
    document.title = SEO.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', SEO.description);
  }, []);

  return <PersonaLanding content={CONTENT} />;
}