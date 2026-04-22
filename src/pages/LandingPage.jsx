import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ArrowRight } from 'lucide-react';
import ScoreAddictionSection from '@/components/landing/ScoreAddictionSection';

const PENDING_KEY = 'stensor_pending_query';
const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

// ── Background ────────────────────────────────────────────────────────────
function PageBackground() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        zIndex: 0,
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, top: -100, left: -100, background: 'radial-gradient(circle, rgba(221,255,0,0.20) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, top: 0, right: -80, background: 'radial-gradient(circle, rgba(221,255,0,0.10) 0%, transparent 70%)', filter: 'blur(55px)' }} />
      </div>
    </>
  );
}

// ── Navbar (floating pill — same as LandingPricingPage) ───────────────────
function Navbar({ onCta }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-5">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5 relative"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.90)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '10px',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : '0 2px 12px rgba(0,0,0,0.04)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s ease',
        }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
          <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png"
            alt="Stensor" className="w-6 h-6 object-contain" />
          <span className="font-black text-sm tracking-tight" style={{ color: FG }}>Stensor</span>
        </button>
        <div className="hidden md:flex items-center gap-8">
          <a href="/fonctionnalites" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">Features</a>
          <a href="/tarifs" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => base44.auth.redirectToLogin('/app')}
            className="hidden md:block text-xs font-semibold text-gray-500 hover:text-black transition-colors px-3 py-2">
            Sign In
          </button>
          <button onClick={onCta}
            className="text-xs font-black px-4 py-2.5 transition-all hover:scale-105"
            style={{ background: YELLOW, color: FG, borderRadius: '8px' }}>
            Get Started
          </button>
        </div>
      </nav>
    </div>
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
    <section className="relative z-10 pt-48 pb-16 text-center px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="font-bold tracking-tighter"
        style={{
          fontSize: 'clamp(2.6rem, 7vw, 4.5rem)',
          lineHeight: 1.1,
          color: FG,
        }}>
        Stop guessing.{' '}
        <span style={{
          background: `linear-gradient(to right, #a08800, #eab308)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>Start winning financially.</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="mt-5 text-xl max-w-2xl mx-auto" style={{ color: 'rgba(0,0,0,0.5)' }}>
        Tell Stensor your goal in plain words. Get a <strong style={{ color: FG }}>complete, actionable strategy</strong> in 60 seconds — investing, debt, taxes, retirement. Done.
      </motion.p>

      {/* Input box */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="max-w-3xl mx-auto mt-12 px-4">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:-inset-2"
            style={{ background: `linear-gradient(to right, rgba(221,255,0,0.5), rgba(180,220,0,0.4))` }} />
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
                  <ArrowRight className="w-3.5 h-3.5" />
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
          {[FG, '#555', '#888'].map((c, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: c }}>
              {['J', 'M', 'A'][i]}
            </div>
          ))}
        </div>
        <span className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.55)' }}>
          Joined by <span style={{ color: FG, fontWeight: 800 }}>1,000+ users</span> already building their future
        </span>
      </motion.div>
    </section>
  );
}

// ── Video Section ─────────────────────────────────────────────────────────
function VideoSection() {
  return (
    <section className="relative z-10 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="overflow-hidden rounded-2xl shadow-2xl"
          style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'black' }}>
          <div style={{ aspectRatio: '16/9' }}>
            <iframe
              src="https://www.youtube.com/embed/FXLmWojBELE?rel=0&modestbranding=1"
              title="Stensor demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{ border: 'none', display: 'block' }}
            />
          </div>
        </div>
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
              {[['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Support', '#']].map(([l, h]) => (
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
        <VideoSection />
        <ScoreAddictionSection onCta={handleCta} />
        <CtaBanner onCta={handleCta} />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}