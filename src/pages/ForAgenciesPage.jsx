import { useEffect } from 'react';
import PersonaLanding from '@/components/landing/PersonaLanding';

// ── SEO ── page-specific title & description
const SEO = {
  title: 'AI visibility for agencies — track & grow your clients on ChatGPT | UseWok',
  description: "The AI visibility platform built for agencies and freelances. Monitor every client's presence across ChatGPT, Gemini and Claude, deliver white-label reports, and prove your impact month after month.",
};

// ── Unique persona content (~30% unique text) ──
const CONTENT = {
  hero: {
    eyebrow: 'Built for agencies & freelances',
    title: <>Grow the AI visibility<br />of <span className="hi">every client.</span></>,
    subtitle: "You already handle their SEO — now own their AI visibility too. Track each client across ChatGPT, Gemini and Claude from a single dashboard, and turn AI recommendations into a new billable service.",
    ctaPrimary: 'Analyze a client site →',
    ctaSecondary: 'See a demo',
  },
  trustLabel: 'Agencies already managing AI visibility for their clients',
  understand: {
    eyebrow: 'Understand',
    title: 'Know what AI says about your clients',
    feat1Title: 'One dashboard, every client',
    feat1Text: 'Switch between client domains in one click and see exactly where each one is cited — or ignored — by AI engines.',
    feat2Title: 'Reports that sell your work',
    feat2Text: 'Turn raw citation data into clean, shareable reports that justify your retainer and prove monthly progress.',
  },
  promptCard: <>Analyze the AI visibility of <b>my client's site</b> on ChatGPT</>,
  reliability: {
    title: 'Reliability your clients can trust',
    subtitle: 'Verified visibility data, continuously updated, on infrastructure hosted in France — ready to present to any client.',
    items: [
      { title: 'Multi-client monitoring', text: 'Manage several client domains and compare their AI share of voice side by side.' },
      { title: 'Full technical audit', text: 'Crawl, data structure and authority signals for each client site.' },
      { title: 'White-label ready tracking', text: 'Export progress week after week to include in your client deliverables.' },
    ],
  },
  how: {
    title: 'Turn client data into a new billable service — without an AI expert on staff',
    intro: <><b style={{color:'var(--ink)'}}>SEO</b> gets your clients clicks from search results. <b style={{color:'var(--orange-deep)'}}>AEO</b> gets them recommended inside AI answers. UseWok lets your agency sell both — with data to back it up.</>,
    items: [
      { title: 'Spot why a client is invisible', text: 'The reason AI cites a competitor instead of your client is buried in citation data. We surface it for you.' },
      { title: 'Build their action plan', text: 'You know exactly what to fix this month for each account — prioritized by impact.' },
      { title: 'Your client stays informed', text: 'Every recommendation is documented, so you present decisions instead of guesses.' },
      { title: 'And you show the ROI', text: 'Each action is tied to measurable movement in your client\'s AI share of voice.' },
    ],
  },
  confidence: {
    title: 'Deliver AI visibility with confidence',
    subtitle: 'Track every client improvement, share results with your team, and keep a clear view of each account\'s trajectory.',
    cards: [
      { title: 'Per-client score history', text: 'Look back at every change and prove the real impact of your work on each account.' },
      { title: 'Shared agency spaces', text: 'Centralize tracking so account managers and strategists stay aligned.' },
      { title: 'Guided action plans', text: 'A clear path per client, from diagnosis to visibility — no AI expertise required.' },
    ],
  },
  testimonials: [
    { text: 'We added AI visibility as a service and closed three retainers in a month. UseWok does the heavy lifting.', name: 'Camille Aubert', role: 'Founder, digital agency' },
    { text: 'The per-client dashboard is exactly what we needed to justify our fees during monthly reviews.', name: 'Julien Roze', role: 'Head of SEO' },
    { text: 'Managing ten client domains from one place saved my team hours every single week.', name: 'Sarah Nizan', role: 'Account Director' },
  ],
  stats: [
    { big: '+38%', lbl: 'client AI citations after 90 days' },
    { big: '10+', lbl: 'client domains managed in one place' },
    { big: '8', lbl: 'AI engines tracked per client' },
  ],
  pricingIntro: 'Hiring an AI visibility specialist costs thousands per month. UseWok gives your whole agency the tooling to offer the same service — for less than half the cost of one freelance report.',
  pricingCard: 'Full AI visibility score, action plan and guided fixes for every client, competitor benchmarking, and tracking across all 8 AI engines. Built for agencies and freelances that manage visibility at scale.',
  finalCta: 'So, which client are we analyzing?',
  faq: [
    { q: 'Can I manage several client sites with one account?', a: 'Yes. UseWok is built for agencies — add multiple client domains, switch between them in one click, and compare their AI share of voice side by side from a single dashboard.' },
    { q: 'Can I present the reports to my clients?', a: 'Absolutely. Progress and citation data are exportable and clean enough to include directly in your monthly client deliverables and QBRs.' },
    { q: 'Which AI engines can I track for my clients?', a: 'UseWok tracks the major AI engines for every client domain: ChatGPT, Perplexity, Google AI Overviews, Google AI mode, Claude, Microsoft Copilot and Gemini.' },
    { q: 'How fast will my clients see results?', a: "AI visibility moves faster than classic SEO. Agencies typically see measurable movement in a client's citations within 7 to 30 days, thanks to daily tracking and prioritized actions." },
    { q: 'Is this a new service I can bill for?', a: 'Yes — most agencies package AI visibility (AEO) as a standalone retainer or an add-on to existing SEO work. UseWok provides the data and action plan so you can deliver it profitably.' },
    { q: 'How is AEO different from the SEO I already sell?', a: 'SEO optimizes for clicks from search results. AEO optimizes for mentions and recommendations inside AI answers — often without any click. It\'s a distinct, growing service your clients now expect.' },
  ],
};

export default function ForAgenciesPage() {
  useEffect(() => {
    document.title = SEO.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', SEO.description);
  }, []);

  return <PersonaLanding content={CONTENT} />;
}