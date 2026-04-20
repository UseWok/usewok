import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronDown, Check, X, ArrowRight } from 'lucide-react';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';

const PENDING_KEY = 'stensor_pending_query';
const FG = '#0A0A0A';
const YELLOW = '#eab308';
const TEAL = '#2dd4bf';

const PLAN_FEATURES = {
  free:      ['10 credits/month', '3 discussions max', 'Standard AI mode', 'All knowledge bases'],
  essential: ['50 credits/month', 'Unlimited discussions', 'Standard AI mode', 'File uploads'],
  advanced:  ['150 credits/month', 'Unlimited discussions', 'Internet search', 'File uploads', 'Advanced AI mode'],
  expert:    ['500 credits/month', 'Unlimited discussions', 'Internet search', 'File uploads', 'Expert AI mode', 'Priority support'],
};

// ── Background (same as pricing page) ────────────────────────────────────
function PageBackground() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        zIndex: 0,
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, top: -100, left: -100, background: 'radial-gradient(circle, rgba(234,179,8,0.20) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, top: 0, right: -80, background: 'radial-gradient(circle, rgba(45,212,191,0.15) 0%, transparent 70%)', filter: 'blur(55px)' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, bottom: -100, left: '30%', background: 'radial-gradient(circle, rgba(234,179,8,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>
    </>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────
function Navbar({ onCta }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header className="sticky top-0 left-0 right-0 z-50"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        transition: 'all 0.3s ease',
      }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — large, classic, white bg */}
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm"
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
            <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png"
              alt="Stensor" className="w-7 h-7 object-contain" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: FG }}>Stensor</span>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs']].map(([label, href]) => (
            <a key={label} href={href}
              className="text-sm font-medium transition-colors hover:text-black"
              style={{ color: 'rgba(0,0,0,0.55)' }}>{label}</a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => base44.auth.redirectToLogin('/app')}
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:bg-black hover:text-white hover:border-black"
            style={{ color: FG, borderColor: 'rgba(0,0,0,0.2)', background: 'transparent' }}>
            Sign In
          </button>
          <button onClick={onCta}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: FG, color: 'white' }}>
            Start Building
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const handleSend = async () => {
    if (!query.trim()) return;
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) window.location.href = `/chat?q=${encodeURIComponent(query)}`;
      else { localStorage.setItem(PENDING_KEY, query); base44.auth.redirectToLogin('/app'); }
    } catch {
      localStorage.setItem(PENDING_KEY, query);
      base44.auth.redirectToLogin('/app');
    }
  };

  return (
    <section className="relative z-10 pt-36 pb-16 text-center px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="font-bold tracking-tighter"
        style={{
          fontSize: 'clamp(2.6rem, 7vw, 4.5rem)',
          lineHeight: 1.1,
          color: FG,
        }}>
        Build a complete plan for{' '}
        <span style={{
          background: `linear-gradient(to right, ${YELLOW}, #facc15, ${TEAL})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>anything financial.</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="mt-5 text-xl max-w-2xl mx-auto" style={{ color: 'rgba(0,0,0,0.5)' }}>
        Describe your goal in plain language. Stensor instantly creates a <strong style={{ color: FG }}>complete, actionable strategy</strong> — investing, debt, retirement, taxes, or anything else.
      </motion.p>

      {/* Input box */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="max-w-3xl mx-auto mt-12 px-4">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:-inset-2"
            style={{ background: `linear-gradient(to right, rgba(234,179,8,0.4), rgba(45,212,191,0.4))` }} />
          <div className="relative rounded-xl p-2 shadow-xl"
            style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full relative border rounded-lg bg-white"
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              <textarea
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="e.g. 'I want to retire at 45 with $2M' or 'Help me pay off $30k debt in 3 years'"
                className="w-full pl-4 pt-4 pr-4 pb-4 text-sm resize-none focus:outline-none bg-transparent rounded-lg"
                style={{ minHeight: '80px', color: FG }}
              />
              <div className="flex justify-end px-3 pb-3">
                <button onClick={handleSend}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-90"
                  style={{ background: FG, color: 'white' }}>
                  Generate my plan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Social proof */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-3 mt-6">
        <div className="flex -space-x-2">
          {[YELLOW, TEAL, '#6366f1'].map((c, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: c }}>
              {['J', 'M', 'A'][i]}
            </div>
          ))}
        </div>
        <span className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
          Loved by over 1k users worldwide
        </span>
      </motion.div>
    </section>
  );
}

// ── Use Cases (no emojis, strong text) ───────────────────────────────────
function UseCasesSection({ onCta }) {
  const cases = [
    {
      tag: 'Investing',
      title: 'Build your investment strategy',
      desc: 'Get a concrete ETF portfolio, stock allocation or crypto plan tailored to your risk profile and timeline — ready to execute today.',
    },
    {
      tag: 'Debt',
      title: 'Eliminate your debt fast',
      desc: 'Stensor runs avalanche vs. snowball scenarios with your exact numbers and hands you a month-by-month repayment calendar.',
    },
    {
      tag: 'Real Estate',
      title: 'Plan your property purchase',
      desc: 'Compare renting vs. buying, model mortgage scenarios, and calculate the true cost of ownership in seconds.',
    },
    {
      tag: 'Retirement',
      title: 'Reach early retirement (FIRE)',
      desc: 'Calculate your FIRE number, required savings rate, and the exact date you can stop working — based on your actual income.',
    },
    {
      tag: 'Tax',
      title: 'Legally reduce your tax bill',
      desc: 'Discover every deduction, account type, and optimization strategy applicable to your situation — no accountant needed.',
    },
    {
      tag: 'Income',
      title: 'Build passive income streams',
      desc: 'Model dividends, rental yields, and side businesses with real ROI projections and a step-by-step launch plan.',
    },
  ];

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(0,0,0,0.35)' }}>
          What Stensor can do for you
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-4" style={{ color: FG }}>
          A plan for every goal.
        </h2>
        <p className="text-center text-lg mb-14 max-w-xl mx-auto" style={{ color: 'rgba(0,0,0,0.45)' }}>
          Describe any financial situation in plain language and get a complete, actionable strategy in under 60 seconds.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 3) * 0.08 }}
              onClick={onCta}
              className="rounded-2xl p-7 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mb-4"
                style={{ background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.4)' }}>
                {c.tag}
              </span>
              <h3 className="font-bold text-base mb-2" style={{ color: FG }}>{c.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(0,0,0,0.55)' }}>{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing Section (yearly only, 4 plans horizontal) ────────────────────
function PricingSection({ onCta }) {
  const [plansConfig, setPlansConfig] = useState(() => getPlansConfig());
  useEffect(() => { loadPlansFromDB().then(p => { if (p) setPlansConfig(p); }); }, []);

  const visibleIds = ['free', 'essential', 'advanced', 'expert'];
  const plans = plansConfig
    .filter(p => visibleIds.includes(p.id))
    .sort((a, b) => visibleIds.indexOf(a.id) - visibleIds.indexOf(b.id));

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(0,0,0,0.35)' }}>
          Pricing
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-4" style={{ color: FG }}>
          Simple, transparent pricing.
        </h2>
        <p className="text-center text-lg mb-12 max-w-md mx-auto" style={{ color: 'rgba(0,0,0,0.45)' }}>
          Start free. Upgrade when you need more power.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(0,0,0,0.10)', background: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
          {plans.map((plan, i) => {
            const isAdvanced = plan.id === 'advanced';
            const isLast = i === plans.length - 1;
            const features = PLAN_FEATURES[plan.id] || [];
            const price = plan.price_yearly;

            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative flex flex-col p-7"
                style={{
                  borderRight: isLast ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  outline: isAdvanced ? `2px solid ${FG}` : 'none',
                  outlineOffset: '-1px',
                  zIndex: isAdvanced ? 1 : 0,
                  background: 'white',
                }}>

                {isAdvanced && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 text-[9px] font-black uppercase tracking-widest"
                      style={{ background: FG, color: '#DDFF00' }}>
                      Most Popular
                    </div>
                  </div>
                )}

                <p className="text-xs font-black uppercase tracking-widest mb-3 text-center"
                  style={{ color: isAdvanced ? FG : 'rgba(10,10,10,0.45)', marginTop: isAdvanced ? 12 : 0 }}>
                  {plan.name}
                </p>

                <div className="text-center mb-5">
                  <div className="flex items-end justify-center gap-1">
                    <span className="font-black" style={{ fontSize: '2.6rem', lineHeight: 1, color: FG }}>
                      {price === 0 ? '$0' : `$${price}`}
                    </span>
                    <span className="text-xs font-medium mb-1.5" style={{ color: 'rgba(10,10,10,0.4)' }}>/mo</span>
                  </div>
                  {price > 0 && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(10,10,10,0.3)' }}>billed yearly</p>
                  )}
                </div>

                <div className="mb-5" style={{ height: 1, background: 'rgba(0,0,0,0.07)' }} />

                <ul className="space-y-3 flex-1 mb-7">
                  {features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-xs font-medium">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FG }} />
                      <span style={{ color: 'rgba(10,10,10,0.65)' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.id === 'free' ? onCta() : base44.auth.redirectToLogin('/manage-plan')}
                  className="w-full py-3 font-black text-xs transition-all hover:opacity-80 rounded-lg"
                  style={{
                    background: isAdvanced ? FG : 'transparent',
                    color: isAdvanced ? 'white' : FG,
                    border: isAdvanced ? 'none' : '1.5px solid rgba(0,0,0,0.15)',
                  }}>
                  {plan.id === 'free' ? 'Get Started Free' : 'Get Started'}
                </button>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs mt-5 font-medium" style={{ color: 'rgba(10,10,10,0.3)' }}>
          Cancel anytime · No hidden fees · Secure payment
        </p>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is Stensor?', a: "Stensor is an AI-powered financial coaching platform. Describe any goal in plain language and get a complete, actionable strategy — investing, debt, retirement, taxes, or anything else." },
  { q: 'Do I need financial knowledge?', a: 'Not at all. Stensor is built for everyone, from complete beginners to experienced investors. Just describe your situation and get expert-level guidance instantly.' },
  { q: 'What can I ask Stensor?', a: 'Anything financial — ETF investing, debt repayment, real estate planning, FIRE retirement, tax optimization, passive income, budgeting, and much more.' },
  { q: 'Does Stensor search the internet?', a: 'Yes, on Advanced and Expert plans. Stensor browses live market data, interest rates, ETF performance, and financial news to give you up-to-date advice.' },
  { q: 'Is my data secure?', a: 'Completely. Your conversations are private and encrypted. We never sell or share your personal financial information.' },
  { q: 'Can I cancel anytime?', a: 'Yes, no conditions. Cancel anytime, no hidden fees. You keep access until the end of your billing period.' },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tighter text-center mb-12" style={{ color: FG }}>
          Frequently Asked Questions
        </h2>
        <div>
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4">
                <span className="text-base font-semibold" style={{ color: FG }}>{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(0,0,0,0.3)' }} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <p className="pb-5 text-base leading-relaxed" style={{ color: 'rgba(0,0,0,0.55)' }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────
function CtaBanner({ onCta }) {
  return (
    <section className="relative z-10 py-24 px-6 text-center" style={{ background: 'white' }}>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4" style={{ color: FG }}>
            Ready to build your strategy?
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(0,0,0,0.45)' }}>
            Start free, no credit card required.
          </p>
          <button onClick={onCta}
            className="inline-flex items-center gap-2 text-base font-semibold px-10 py-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{ background: FG, color: 'white' }}>
            Get started free <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer (pure white) ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)', background: 'white' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center"
                style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-bold text-lg" style={{ color: FG }}>Stensor</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(0,0,0,0.45)', maxWidth: 280 }}>
              Your personal AI financial coach. Build wealth, invest smarter, and reach financial freedom — in minutes.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(0,0,0,0.3)' }}>Product</p>
            <div className="space-y-3">
              {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs']].map(([l, h]) => (
                <a key={l} href={h} className="block text-sm transition-colors hover:text-black" style={{ color: 'rgba(0,0,0,0.55)' }}>{l}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(0,0,0,0.3)' }}>Legal</p>
            <div className="space-y-3">
              {[['Terms of Use', '#'], ['Privacy Policy', '#'], ['Support', '#']].map(([l, h]) => (
                <a key={l} href={h} className="block text-sm transition-colors hover:text-black" style={{ color: 'rgba(0,0,0,0.55)' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>© 2026 Stensor Inc. All rights reserved.</p>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.25)' }}>AI responses may contain inaccuracies. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(a => { if (a) navigate('/app', { replace: true }); else setReady(true); })
      .catch(() => setReady(true));
  }, [navigate]);

  const handleCta = async () => {
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) navigate('/app'); else base44.auth.redirectToLogin('/app');
    } catch { base44.auth.redirectToLogin('/app'); }
  };

  if (!ready) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen font-inter overflow-x-hidden" style={{ background: '#fafaf8' }}>
      <PageBackground />
      <Navbar onCta={handleCta} />
      <main className="flex-1 relative">
        <Hero />
        <UseCasesSection onCta={handleCta} />
        <PricingSection onCta={handleCta} />
        <CtaBanner onCta={handleCta} />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}