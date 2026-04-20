import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronDown, Check, X } from 'lucide-react';

const PENDING_KEY = 'stensor_pending_query';

// ── Brand colors ──────────────────────────────────────────────────────────
const YELLOW = '#eab308';   // yellow-500
const TEAL   = '#2dd4bf';   // teal-400
const FG     = '#0A0A0A';

// ── Static dots (fixed, not animated) ────────────────────────────────────
const DOT_CONFIGS = [
  { top:'44%',left:'93%',color:'rgba(234,179,8,0.12)'},
  { top:'21%',left:'7%', color:'rgba(45,212,191,0.12)'},
  { top:'79%',left:'61%',color:'rgba(45,212,191,0.12)'},
  { top:'15%',left:'97%',color:'rgba(180,180,180,0.1)'},
  { top:'30%',left:'88%',color:'rgba(234,179,8,0.10)'},
  { top:'60%',left:'17%',color:'rgba(180,180,180,0.1)'},
  { top:'65%',left:'41%',color:'rgba(45,212,191,0.10)'},
  { top:'33%',left:'19%',color:'rgba(180,180,180,0.08)'},
  { top:'11%',left:'91%',color:'rgba(180,180,180,0.08)'},
  { top:'93%',left:'92%',color:'rgba(234,179,8,0.10)'},
  { top:'8%', left:'57%',color:'rgba(45,212,191,0.10)'},
  { top:'71%',left:'11%',color:'rgba(234,179,8,0.10)'},
  { top:'20%',left:'77%',color:'rgba(45,212,191,0.12)'},
  { top:'14%',left:'74%',color:'rgba(234,179,8,0.08)'},
  { top:'94%',left:'25%',color:'rgba(234,179,8,0.10)'},
  { top:'29%',left:'71%',color:'rgba(45,212,191,0.10)'},
  { top:'17%',left:'23%',color:'rgba(234,179,8,0.08)'},
  { top:'73%',left:'43%',color:'rgba(45,212,191,0.10)'},
  { top:'39%',left:'62%',color:'rgba(180,180,180,0.07)'},
];

function PageBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Large gradient blobs — static */}
      <div className="absolute rounded-full"
        style={{ width:700, height:700, top:-160, left:-160,
          background:'radial-gradient(circle, rgba(234,179,8,0.13) 0%, rgba(244,63,94,0.04) 40%, transparent 70%)',
          filter:'blur(40px)' }} />
      <div className="absolute rounded-full"
        style={{ width:700, height:700, top:'25%', right:-160,
          background:'radial-gradient(circle, rgba(45,212,191,0.18) 0%, rgba(59,130,246,0.07) 40%, transparent 70%)',
          filter:'blur(50px)' }} />
      <div className="absolute rounded-full"
        style={{ width:600, height:600, bottom:-150, left:'30%',
          background:'radial-gradient(circle, rgba(45,212,191,0.10) 0%, transparent 70%)',
          filter:'blur(40px)' }} />

      {/* Static dots */}
      {DOT_CONFIGS.map((d, i) => (
        <div key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ top:d.top, left:d.left, background:d.color }} />
      ))}

      {/* Grid overlay — white lines masking */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.8) 2px, transparent 2px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse at center, transparent 20%, black 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black 70%)',
      }} />
    </div>
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
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(45,212,191,0.15) 100%)' }}>
            <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png"
              alt="Stensor" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: FG }}>Stensor</span>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {[['Features','/fonctionnalites'],['Pricing','/tarifs']].map(([label, href]) => (
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
      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="font-bold tracking-tighter sm:text-6xl md:text-7xl"
          style={{
            fontSize: 'clamp(2.6rem, 7vw, 4.5rem)',
            lineHeight: 1.1,
            background: `linear-gradient(to right, ${YELLOW}, #facc15, ${TEAL})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          Turn your financial goals<br />into a plan, in minutes.
        </motion.h1>
        {/* horizontal line accent */}
        <div className="absolute -inset-x-20 top-1/2 h-px"
          style={{ background: `linear-gradient(to right, transparent, rgba(234,179,8,0.2), transparent)` }} />
      </div>

      <motion.p initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
        className="mt-4 text-xl max-w-2xl mx-auto" style={{ color:'rgba(0,0,0,0.5)' }}>
        The first all-in-one AI platform to easily build your <strong style={{ color: FG }}>complete financial strategy</strong> — without spreadsheets.
      </motion.p>

      {/* Glowing textarea box */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
        className="max-w-3xl mx-auto mt-12 px-4">
        <div className="relative group">
          {/* glow ring */}
          <div className="absolute -inset-1 rounded-xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:-inset-2"
            style={{ background:`linear-gradient(to right, rgba(234,179,8,0.4), rgba(45,212,191,0.4))` }} />
          <div className="relative rounded-xl p-2 shadow-xl transition-transform duration-300 group-hover:scale-[1.005]"
            style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(8px)' }}>
            <div className="w-full relative shadow-sm border rounded-lg"
              style={{ background:'rgba(255,255,255,0.85)', borderColor:'rgba(0,0,0,0.08)' }}>
              <textarea
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="What is your #1 financial goal? e.g. 'I want to retire at 45 with $2M'"
                className="w-full pl-4 pt-4 pr-16 text-sm resize-none focus:outline-none bg-transparent rounded-t-lg"
                style={{ height:'auto', minHeight:'76px', maxHeight:'400px', color: FG }}
              />
              <div className="flex justify-end p-4 pt-2" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Social proof */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
        className="flex items-center justify-center gap-3 mt-6">
        <div className="flex -space-x-2">
          {[YELLOW, TEAL, '#6366f1'].map((c, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: c }}>
              {['J','M','A'][i]}
            </div>
          ))}
        </div>
        <span className="text-sm" style={{ color:'rgba(0,0,0,0.5)' }}>
          Loved by over 1k users worldwide
        </span>
      </motion.div>
    </section>
  );
}

// ── Comparison ────────────────────────────────────────────────────────────
function ComparisonSection() {
  const traditional = [
    ['Manual spreadsheet setup','Manual Supabase integration'],
    ['Hours reading finance books','OpenAI API setup required'],
    ['Expensive advisor required','Resend/SendGrid setup needed'],
    ['Generic one-size-fits-all advice','Auth provider configuration'],
    ['No real-time market data','Third-party integration needed'],
    ['Starts from zero every session','Cloud storage setup'],
  ].map(r => r[0]);

  const stensor = [
    'AI financial plan in 60 seconds',
    'Built-in financial intelligence',
    'AI coach available 24/7',
    'Personalized to your situation',
    'Real-time internet search',
    'Remembers your goals & context',
  ];

  const Row = ({ label, good, right }) => (
    <div className="flex items-center py-3.5 border-b" style={{ borderColor:'rgba(0,0,0,0.06)' }}>
      <span className="flex-1 text-sm font-medium" style={{ color: good ? TEAL : 'rgba(0,0,0,0.65)' }}>{label}</span>
      <div className="flex items-center gap-1.5">
        {good
          ? <span className="text-sm font-semibold" style={{ color: TEAL }}>{right}</span>
          : <span className="text-xs text-gray-400">{right}</span>}
      </div>
    </div>
  );

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1.5"
          style={{ color:'rgba(0,0,0,0.4)' }}>
          all-in-one vs doing it yourself
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-12" style={{ color: FG }}>
          Stensor vs. The Old Way
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Traditional */}
          <div className="rounded-2xl p-8"
            style={{ background:'white', border:'1px solid rgba(0,0,0,0.08)', boxShadow:'0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 className="font-bold text-base mb-1" style={{ color: FG }}>Traditional Approach</h3>
            <div className="space-y-0 mt-5">
              {traditional.map((item, i) => (
                <motion.div key={i} initial={{ opacity:0, x:-12 }} whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }} transition={{ delay: i*0.06 }}
                  className="flex items-center gap-3 py-3 border-b" style={{ borderColor:'rgba(0,0,0,0.06)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(239,68,68,0.1)' }}>
                    <X className="w-2.5 h-2.5" style={{ color:'#ef4444' }} />
                  </div>
                  <span className="text-sm" style={{ color:'rgba(0,0,0,0.6)' }}>{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 pt-4 rounded-xl px-4 py-3" style={{ background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.1)' }}>
              <p className="text-xs font-semibold" style={{ color:'rgba(239,68,68,0.7)' }}>
                Hours spent on tedious work with no personalized guidance
              </p>
            </div>
          </div>

          {/* Stensor — teal light */}
          <div className="rounded-2xl p-8 relative overflow-hidden"
            style={{ background:'linear-gradient(145deg, #f0fdfb 0%, #e6faf6 100%)', border:`1px solid rgba(45,212,191,0.25)`, boxShadow:'0 4px 20px rgba(45,212,191,0.08)' }}>
            {/* subtle teal top glow */}
            <div className="absolute top-0 right-0 w-56 h-56 pointer-events-none rounded-full"
              style={{ background:`radial-gradient(circle, rgba(45,212,191,0.2) 0%, transparent 70%)`, filter:'blur(30px)' }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background:`linear-gradient(to right, transparent, rgba(45,212,191,0.6), transparent)` }} />

            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background:'rgba(45,212,191,0.12)', border:`1px solid rgba(45,212,191,0.2)` }}>
                <Check className="w-5 h-5" style={{ color: TEAL }} />
              </div>
              <h3 className="font-bold text-base" style={{ color: FG }}>STENSOR</h3>
            </div>

            <div className="space-y-0 relative z-10">
              {stensor.map((item, i) => (
                <motion.div key={i} initial={{ opacity:0, x:12 }} whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }} transition={{ delay: i*0.06 }}
                  className="flex items-center gap-3 py-3 border-b" style={{ borderColor:'rgba(45,212,191,0.12)' }}>
                  <span className="flex-1 text-sm font-medium" style={{ color: FG }}>{item}</span>
                  <span className="text-sm font-semibold" style={{ color: TEAL }}>Built-in</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 pt-4 rounded-xl px-4 py-3 relative z-10 flex items-center gap-2"
              style={{ background:`rgba(45,212,191,0.08)`, border:`1px solid rgba(45,212,191,0.2)` }}>
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: TEAL }} />
              <p className="text-xs font-semibold" style={{ color: TEAL }}>
                Everything you need, ready to use instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Use Cases ─────────────────────────────────────────────────────────────
function UseCasesSection({ onCta }) {
  const cases = [
    { emoji:'📈', title:'Build your investment strategy', desc:'Create a personalized ETF portfolio, stock picks, or crypto allocation based on your risk profile and timeline.' },
    { emoji:'💰', title:'Eliminate your debt fast', desc:'Get a concrete payoff plan using avalanche or snowball method with exact monthly numbers and a clear calendar.' },
    { emoji:'🏠', title:'Plan your real estate purchase', desc:'Calculate affordability, compare renting vs. buying, and model mortgage scenarios in seconds.' },
    { emoji:'🔥', title:'Achieve early retirement (FIRE)', desc:'Calculate your FIRE number, savings rate, and exact timeline to financial independence.' },
    { emoji:'💼', title:'Optimize your taxes legally', desc:"Discover every legal deduction and tax optimization strategy available for your situation." },
    { emoji:'🌱', title:'Build passive income streams', desc:'Evaluate dividends, rental income, side businesses and more — with real ROI calculations.' },
  ];

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'rgba(0,0,0,0.4)' }}>
          use cases
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-4" style={{ color: FG }}>
          Save time, money and headaches.
          <br /><span style={{ color:'rgba(0,0,0,0.4)' }}>Let AI build your strategy.</span>
        </h2>
        <p className="text-center text-xl mb-14" style={{ color:'rgba(0,0,0,0.4)' }}>
          No spreadsheets, no expensive advisors, no wasted weekends.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-40px' }} transition={{ delay:(i%3)*0.08 }}
              onClick={onCta}
              className="rounded-2xl p-8 cursor-pointer group transition-all hover:scale-[1.01] hover:shadow-md text-center"
              style={{ background:'white', border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background:'rgba(0,0,0,0.05)', border:'1px solid rgba(0,0,0,0.08)' }}>
                <span className="text-2xl">{c.emoji}</span>
              </div>
              <h3 className="font-semibold text-base mb-3" style={{ color: FG }}>{c.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color:'rgba(0,0,0,0.5)' }}>{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────
function CtaBanner({ onCta }) {
  return (
    <section className="relative z-10 py-24 px-6 text-center overflow-hidden"
      style={{ background:'linear-gradient(135deg, rgba(254,252,232,0.8) 0%, rgba(240,253,250,0.8) 100%)' }}>
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full" style={{ width:500, height:500, top:-100, left:-100, background:'radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 70%)', filter:'blur(40px)' }} />
        <div className="absolute rounded-full" style={{ width:500, height:500, bottom:-100, right:-100, background:'radial-gradient(circle, rgba(45,212,191,0.20) 0%, transparent 70%)', filter:'blur(40px)' }} />
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage:'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize:'48px 48px',
        }} />
      </div>
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-3">
            <span style={{ color: YELLOW }}>Ready to get</span>{' '}
            <span style={{ color: TEAL }}>started?</span>
          </h2>
          <p className="text-lg mb-10" style={{ color:'rgba(0,0,0,0.5)' }}>
            Sign up for free and start building your financial strategy today!
          </p>
          <button onClick={onCta}
            className="inline-flex items-center gap-2 text-base font-semibold px-10 py-4 rounded-2xl transition-all hover:scale-[1.02] shadow-xl"
            style={{ background:'white', color: FG, border:'1px solid rgba(0,0,0,0.1)', boxShadow:'0 8px 30px rgba(0,0,0,0.08)' }}>
            Start Building
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────
const FAQS = [
  { q:'What is Stensor?', a:"Stensor is an AI-powered financial coaching platform. You describe your goals in plain language, and Stensor instantly produces a complete, actionable strategy — whether it's investing, debt repayment, retirement planning, or tax optimization." },
  { q:'Do I need financial knowledge to use Stensor?', a:'Not at all. Stensor is built for everyone, from complete beginners to experienced investors. Just describe your situation in plain language and get expert-level guidance instantly.' },
  { q:'What types of financial plans can I create?', a:'ETF & stock investing, debt payoff strategies, real estate planning, FIRE retirement, tax optimization, passive income streams, budget creation, and much more.' },
  { q:'Does Stensor search the internet?', a:'Yes, on Advanced and Expert plans. Stensor can browse live market data, current interest rates, ETF performance, financial news, and more to give you up-to-date advice.' },
  { q:'How does the AI financial coaching work?', a:'You type your financial question or goal. Stensor selects the best AI model for the task (GPT-4o, Claude, or Gemini), generates a personalized strategy, and formats it into an actionable plan you can follow immediately.' },
  { q:'Is my financial data secure?', a:'Completely. Your conversations are private and encrypted. We never sell or share your personal financial information. Your data is strictly yours.' },
  { q:'Can I cancel anytime?', a:'Yes, no conditions. Cancel anytime, no hidden fees, no penalties. You keep access until the end of your current billing period.' },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-4" style={{ color: FG }}>
          Frequently Asked Questions
        </h2>
        <p className="text-center text-lg mb-12" style={{ color:'rgba(0,0,0,0.4)' }}>
          Got questions? We've got answers. If you can't find what you're looking for, feel free to contact our support team.
        </p>
        <div>
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay: i*0.05 }}
              className="border-b" style={{ borderColor:'rgba(0,0,0,0.08)' }}>
              <button onClick={() => setOpen(open===i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4">
                <span className="text-base font-semibold" style={{ color: FG }}>{faq.q}</span>
                <motion.div animate={{ rotate: open===i ? 180 : 0 }} transition={{ duration:0.2 }}>
                  <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color:'rgba(0,0,0,0.3)' }} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open===i && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                    exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} className="overflow-hidden">
                    <p className="pb-5 text-base leading-relaxed" style={{ color:'rgba(0,0,0,0.55)' }}>{faq.a}</p>
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

// ── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 border-t" style={{ borderColor:'rgba(0,0,0,0.07)', background:'rgba(255,255,255,0.6)', backdropFilter:'blur(8px)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background:'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(45,212,191,0.15) 100%)' }}>
                <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-5 h-5 object-contain" />
              </div>
              <span className="font-bold text-lg" style={{ color: FG }}>Stensor</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color:'rgba(0,0,0,0.45)', maxWidth:280 }}>
              Your personal AI financial coach. Build wealth, invest smarter, and reach financial freedom — in minutes.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:'rgba(0,0,0,0.3)' }}>Product</p>
            <div className="space-y-3">
              {[['Features','/fonctionnalites'],['Pricing','/tarifs']].map(([l,h]) => (
                <a key={l} href={h} className="block text-sm transition-colors hover:text-black" style={{ color:'rgba(0,0,0,0.55)' }}>{l}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:'rgba(0,0,0,0.3)' }}>Legal</p>
            <div className="space-y-3">
              {[['Terms of Use','#'],['Privacy Policy','#'],['Support','#']].map(([l,h]) => (
                <a key={l} href={h} className="block text-sm transition-colors hover:text-black" style={{ color:'rgba(0,0,0,0.55)' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8 border-t" style={{ borderColor:'rgba(0,0,0,0.07)' }}>
          <p className="text-xs" style={{ color:'rgba(0,0,0,0.3)' }}>© 2026 Stensor Inc. All rights reserved.</p>
          <p className="text-xs" style={{ color:'rgba(0,0,0,0.25)' }}>AI responses may contain inaccuracies. Not financial advice.</p>
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
    <div className="min-h-screen font-inter overflow-x-hidden"
      style={{ background:'linear-gradient(to bottom, rgb(250,249,248) 0%, white 100%)' }}>
      <PageBackground />
      <Navbar onCta={handleCta} />
      <main className="flex-1 relative">
        <Hero />
        <ComparisonSection />
        <UseCasesSection onCta={handleCta} />
        <CtaBanner onCta={handleCta} />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}