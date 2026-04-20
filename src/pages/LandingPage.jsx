import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowUp, ChevronDown, Check, X } from 'lucide-react';

const PENDING_KEY = 'stensor_pending_query';
const YUZU = '#DDFF00';
const FG = '#0A0A0A';

// ── Floating dot ────────────────────────────────────────────────────────────
function FloatingDot({ style }) {
  return (
    <motion.div
      animate={{ y: [0, -18, 0], x: [0, 6, 0] }}
      transition={{ duration: style.duration || 8, repeat: Infinity, ease: 'easeInOut', delay: style.delay || 0 }}
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{ ...style }}
    />
  );
}

// ── Animated background ─────────────────────────────────────────────────────
function PageBackground() {
  const dots = [
    { top: '44%', left: '93%', background: 'rgba(221,255,0,0.25)', delay: 0.7, duration: 8.9 },
    { top: '21%', left: '7%', background: 'rgba(221,255,0,0.15)', delay: 4.5, duration: 7.1 },
    { top: '58%', left: '56%', background: 'rgba(0,0,0,0.08)', delay: 0.2, duration: 9.7 },
    { top: '12%', left: '49%', background: 'rgba(221,255,0,0.20)', delay: 3.8, duration: 9.0 },
    { top: '79%', left: '61%', background: 'rgba(221,255,0,0.12)', delay: 2.6, duration: 9.7 },
    { top: '15%', left: '97%', background: 'rgba(0,0,0,0.06)', delay: 2.6, duration: 9.0 },
    { top: '29%', left: '88%', background: 'rgba(221,255,0,0.18)', delay: 4.1, duration: 8.0 },
    { top: '47%', left: '49%', background: 'rgba(221,255,0,0.10)', delay: 4.4, duration: 7.3 },
    { top: '60%', left: '16%', background: 'rgba(0,0,0,0.07)', delay: 1.2, duration: 8.6 },
    { top: '29%', left: '89%', background: 'rgba(221,255,0,0.14)', delay: 2.0, duration: 8.9 },
    { top: '64%', left: '41%', background: 'rgba(221,255,0,0.12)', delay: 0.4, duration: 7.5 },
    { top: '33%', left: '19%', background: 'rgba(0,0,0,0.05)', delay: 0.9, duration: 8.4 },
    { top: '55%', left: '12%', background: 'rgba(221,255,0,0.18)', delay: 2.3, duration: 7.9 },
    { top: '59%', left: '47%', background: 'rgba(221,255,0,0.10)', delay: 2.2, duration: 7.1 },
    { top: '11%', left: '91%', background: 'rgba(0,0,0,0.06)', delay: 3.2, duration: 8.2 },
    { top: '93%', left: '92%', background: 'rgba(221,255,0,0.16)', delay: 2.9, duration: 7.9 },
    { top: '8%',  left: '56%', background: 'rgba(221,255,0,0.12)', delay: 0.7, duration: 9.3 },
    { top: '12%', left: '40%', background: 'rgba(0,0,0,0.06)', delay: 2.4, duration: 9.4 },
    { top: '71%', left: '11%', background: 'rgba(221,255,0,0.20)', delay: 1.6, duration: 7.8 },
    { top: '20%', left: '77%', background: 'rgba(221,255,0,0.12)', delay: 4.5, duration: 8.7 },
    { top: '20%', left: '6%',  background: 'rgba(0,0,0,0.05)', delay: 1.3, duration: 7.7 },
    { top: '14%', left: '73%', background: 'rgba(221,255,0,0.18)', delay: 4.9, duration: 8.3 },
    { top: '53%', left: '52%', background: 'rgba(221,255,0,0.08)', delay: 2.5, duration: 9.7 },
    { top: '24%', left: '11%', background: 'rgba(0,0,0,0.06)', delay: 3.3, duration: 7.3 },
    { top: '94%', left: '24%', background: 'rgba(221,255,0,0.16)', delay: 1.9, duration: 7.3 },
    { top: '29%', left: '71%', background: 'rgba(221,255,0,0.12)', delay: 1.0, duration: 9.7 },
    { top: '62%', left: '57%', background: 'rgba(0,0,0,0.05)', delay: 3.1, duration: 7.2 },
    { top: '17%', left: '22%', background: 'rgba(221,255,0,0.18)', delay: 3.6, duration: 9.2 },
    { top: '72%', left: '42%', background: 'rgba(221,255,0,0.12)', delay: 4.9, duration: 9.7 },
    { top: '38%', left: '62%', background: 'rgba(0,0,0,0.05)', delay: 1.1, duration: 9.5 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Gradient blobs */}
      <motion.div animate={{ x: [0, 20, -10, 0], y: [0, -30, 15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full"
        style={{ width: 600, height: 600, top: -160, left: -160, background: 'rgba(221,255,0,0.12)', filter: 'blur(80px)' }} />
      <motion.div animate={{ x: [0, -25, 10, 0], y: [0, 20, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute rounded-full"
        style={{ width: 600, height: 600, top: '25%', right: -160, background: 'rgba(221,255,0,0.08)', filter: 'blur(80px)' }} />
      <motion.div animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
        className="absolute rounded-full"
        style={{ width: 600, height: 600, bottom: -150, left: '30%', background: 'rgba(221,255,0,0.06)', filter: 'blur(80px)' }} />
      {/* Floating dots */}
      {dots.map((d, i) => <FloatingDot key={i} style={d} />)}
      {/* Grid overlay */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.8) 2px, transparent 2px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, transparent 20%, black 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black 70%)',
        }} />
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────
function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50"
      style={{ background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : 'none', transition: 'all 0.3s ease' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
          <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-7 h-7 object-contain" />
          <span className="font-bold text-lg tracking-tight" style={{ color: FG }}>Stensor</span>
        </button>
        <nav className="hidden md:flex items-center gap-8">
          <a href="/fonctionnalites" className="text-sm font-medium" style={{ color: 'rgba(0,0,0,0.55)' }}
            onMouseEnter={e => e.target.style.color = FG} onMouseLeave={e => e.target.style.color = 'rgba(0,0,0,0.55)'}>Features</a>
          <a href="/tarifs" className="text-sm font-medium" style={{ color: 'rgba(0,0,0,0.55)' }}
            onMouseEnter={e => e.target.style.color = FG} onMouseLeave={e => e.target.style.color = 'rgba(0,0,0,0.55)'}>Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: FG }} onMouseEnter={e => e.target.style.background = 'rgba(0,0,0,0.05)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
            Sign In
          </button>
          <button onClick={onCta} className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: FG, color: 'white' }}>
            Start Building
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onCta }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const handleSend = async () => {
    if (!query.trim()) return;
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) {
        window.location.href = `/chat?q=${encodeURIComponent(query)}`;
      } else {
        localStorage.setItem(PENDING_KEY, query);
        base44.auth.redirectToLogin('/app');
      }
    } catch {
      localStorage.setItem(PENDING_KEY, query);
      base44.auth.redirectToLogin('/app');
    }
  };

  return (
    <section className="relative z-10 pt-36 pb-16 text-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-bold tracking-tighter mb-5"
          style={{
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            lineHeight: 1.08,
            background: `linear-gradient(135deg, ${FG} 0%, rgba(10,10,10,0.7) 60%, #8a9a00 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          Turn your financial goals<br />into a plan, in minutes.
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-12 font-normal" style={{ color: 'rgba(0,0,0,0.5)' }}>
          The first all-in-one AI platform to easily build your <strong style={{ color: FG, fontWeight: 700 }}>complete financial strategy</strong> — without spreadsheets.
        </p>
      </motion.div>

      {/* Input box */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
        className="max-w-3xl mx-auto px-4">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:-inset-2"
            style={{ background: `linear-gradient(135deg, rgba(221,255,0,0.5) 0%, rgba(180,200,0,0.3) 100%)` }} />
          <div className="relative rounded-xl p-2 shadow-xl transition-transform duration-300 group-hover:scale-[1.005]"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full relative shadow-sm rounded-lg border"
              style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', borderColor: 'rgba(0,0,0,0.1)' }}>
              <textarea
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="What is your #1 financial goal? e.g. 'I want to retire at 45 with $2M'"
                rows={3}
                className="w-full pl-5 pt-4 pr-16 text-sm resize-none focus:outline-none bg-transparent rounded-t-lg leading-relaxed"
                style={{ color: FG, minHeight: '76px' }}
              />
              <div className="flex justify-end p-4 pt-2">
                <button onClick={handleSend} disabled={!query.trim()}
                  className="w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:scale-105 disabled:opacity-30"
                  style={{ background: query.trim() ? FG : 'rgba(0,0,0,0.08)' }}>
                  <ArrowUp className="w-4 h-4" style={{ color: query.trim() ? 'white' : '#bbb' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Social proof */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-3 mt-8">
        <div className="flex -space-x-2">
          {['bg-yellow-400', 'bg-green-400', 'bg-blue-400'].map((c, i) => (
            <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white`}>
              {['J', 'M', 'A'][i]}
            </div>
          ))}
        </div>
        <span className="text-sm font-medium" style={{ color: 'rgba(0,0,0,0.5)' }}>
          Loved by over 10k users worldwide
        </span>
      </motion.div>
    </section>
  );
}

// ── Comparison Section ───────────────────────────────────────────────────────
function ComparisonSection() {
  const traditional = [
    'Manual spreadsheet setup',
    'Hours reading finance books',
    'Expensive advisor required',
    'Generic one-size-fits-all advice',
    'No real-time market data',
    'Starts from zero every session',
  ];
  const stensor = [
    'AI financial plan in 60 seconds',
    'Built-in financial intelligence',
    'AI coach available 24/7',
    'Personalized to your situation',
    'Real-time internet search',
    'Remembers your goals & context',
  ];

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.45)' }}>
            all-in-one vs the old way
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-12"
          style={{ color: FG }}>
          Stensor vs. Doing It Yourself
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional */}
          <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(8px)' }}>
            <h3 className="font-bold text-lg mb-6" style={{ color: FG }}>Traditional Approach</h3>
            <div className="space-y-4">
              {traditional.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <X className="w-3 h-3" style={{ color: '#ef4444' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'rgba(0,0,0,0.6)' }}>{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
              <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>
                Hours spent on tedious work with no personalized guidance
              </p>
            </div>
          </div>

          {/* Stensor */}
          <div className="rounded-2xl p-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #f0fdfb 0%, #e6faf6 100%)', border: '1px solid rgba(20,184,166,0.2)' }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }} />
            <h3 className="font-bold text-lg mb-6 relative z-10" style={{ color: FG }}>STENSOR</h3>
            <div className="space-y-4 relative z-10">
              {stensor.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(20,184,166,0.15)' }}>
                    <Check className="w-3 h-3" style={{ color: '#14b8a6' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: FG }}>{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t relative z-10" style={{ borderColor: 'rgba(20,184,166,0.15)' }}>
              <p className="text-xs font-semibold" style={{ color: '#14b8a6' }}>
                Everything you need, ready to use instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Use Cases ────────────────────────────────────────────────────────────────
function UseCasesSection({ onCta }) {
  const cases = [
    { emoji: '📈', title: 'Build your investment strategy', desc: 'Create a personalized ETF portfolio, stock picks, or crypto allocation based on your risk profile and timeline.' },
    { emoji: '💰', title: 'Eliminate your debt fast', desc: 'Get a concrete payoff plan using avalanche or snowball method with exact monthly numbers.' },
    { emoji: '🏠', title: 'Plan your real estate purchase', desc: 'Calculate affordability, compare renting vs. buying, and model mortgage scenarios in seconds.' },
    { emoji: '🔥', title: 'Achieve early retirement (FIRE)', desc: 'Calculate your FIRE number, savings rate, and exact timeline to financial independence.' },
    { emoji: '💼', title: 'Optimize your taxes legally', desc: "Discover every legal deduction and tax optimization strategy available for your situation." },
    { emoji: '🌱', title: 'Build passive income streams', desc: 'Evaluate dividends, rental income, side businesses and more — with real ROI calculations.' },
  ];

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.45)' }}>
            use cases
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-4" style={{ color: FG }}>
          Save time, money and headaches.<br />
          <span style={{ color: 'rgba(0,0,0,0.4)' }}>Let AI plan your finances.</span>
        </h2>
        <p className="text-center text-lg mb-14 font-normal" style={{ color: 'rgba(0,0,0,0.4)' }}>
          No spreadsheets, no expensive advisors, no wasted weekends.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 3) * 0.08 }}
              className="rounded-2xl p-7 cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(8px)' }}
              onClick={onCta}>
              <div className="text-3xl mb-4">{c.emoji}</div>
              <h3 className="font-bold text-base mb-2" style={{ color: FG }}>{c.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(0,0,0,0.5)' }}>{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ───────────────────────────────────────────────────────────────
function CtaBanner({ onCta }) {
  return (
    <section className="relative z-10 py-20 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4" style={{ color: FG }}>
            Ready to get started?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(0,0,0,0.45)' }}>
            Sign up for free and start building your financial strategy today!
          </p>
          <button onClick={onCta}
            className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-xl transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg"
            style={{ background: FG, color: 'white' }}>
            Start Building
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is Stensor?', a: 'Stensor is an AI-powered financial coaching platform. You describe your goals in plain language, and Stensor instantly produces a complete, actionable strategy — whether it\'s investing, debt repayment, retirement planning, or tax optimization.' },
  { q: 'Do I need financial knowledge to use Stensor?', a: 'Not at all. Stensor is built for everyone, from complete beginners to experienced investors. Just describe your situation in plain language and get expert-level guidance instantly.' },
  { q: 'What types of financial plans can I create?', a: 'ETF & stock investing, debt payoff strategies, real estate planning, FIRE retirement, tax optimization, passive income streams, budget creation, and much more.' },
  { q: 'Does Stensor search the internet?', a: 'Yes, on Advanced and Expert plans. Stensor can browse live market data, current interest rates, ETF performance, financial news, and more to give you up-to-date advice.' },
  { q: 'How does the AI financial coaching work?', a: 'You type your financial question or goal. Stensor selects the best AI model for the task (GPT-4o, Claude, or Gemini), generates a personalized strategy, and formats it into an actionable plan you can follow immediately.' },
  { q: 'Is my financial data secure?', a: 'Completely. Your conversations are private and encrypted. We never sell or share your personal financial information. Your data is strictly yours.' },
  { q: 'Can I cancel anytime?', a: 'Yes, no conditions. Cancel anytime, no hidden fees, no penalties. You keep access until the end of your current billing period.' },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-4" style={{ color: FG }}>
          Frequently Asked Questions
        </h2>
        <p className="text-center text-lg mb-12" style={{ color: 'rgba(0,0,0,0.4)' }}>
          Got questions? We've got answers. If you can't find what you're looking for, feel free to contact our support team.
        </p>
        <div className="space-y-0">
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-7 h-7 object-contain" />
              <span className="font-bold text-lg" style={{ color: FG }}>Stensor</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(0,0,0,0.45)', maxWidth: 280 }}>
              Your personal AI financial coach. Build wealth, invest smarter, and reach financial freedom — in minutes.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(0,0,0,0.3)' }}>Product</p>
            <div className="space-y-3">
              {[{ label: 'Features', href: '/fonctionnalites' }, { label: 'Pricing', href: '/tarifs' }].map(l => (
                <a key={l.label} href={l.href} className="block text-sm font-medium transition-colors"
                  style={{ color: 'rgba(0,0,0,0.55)' }}
                  onMouseEnter={e => e.target.style.color = FG} onMouseLeave={e => e.target.style.color = 'rgba(0,0,0,0.55)'}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(0,0,0,0.3)' }}>Legal</p>
            <div className="space-y-3">
              {[{ label: 'Terms of Use', href: '#' }, { label: 'Privacy Policy', href: '#' }, { label: 'Support', href: '#' }].map(l => (
                <a key={l.label} href={l.href} className="block text-sm font-medium transition-colors"
                  style={{ color: 'rgba(0,0,0,0.55)' }}
                  onMouseEnter={e => e.target.style.color = FG} onMouseLeave={e => e.target.style.color = 'rgba(0,0,0,0.55)'}>
                  {l.label}
                </a>
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

// ── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(a => { if (a) navigate('/app', { replace: true }); else setIsAuth(false); }).catch(() => setIsAuth(false));
  }, [navigate]);

  const handleCta = async () => {
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) navigate('/app');
      else base44.auth.redirectToLogin('/app');
    } catch {
      base44.auth.redirectToLogin('/app');
    }
  };

  if (isAuth === null) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen font-inter overflow-x-hidden" style={{ background: 'linear-gradient(to bottom, #fafafa, white)' }}>
      <PageBackground />
      <Navbar onCta={handleCta} />
      <main className="relative">
        <Hero onCta={handleCta} />
        <ComparisonSection />
        <UseCasesSection onCta={handleCta} />
        <CtaBanner onCta={handleCta} />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}