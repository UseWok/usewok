import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import GuestQuiz from '@/components/landing/GuestQuiz';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const YT = 'https://www.youtube.com/embed/NnEe-G3VnIk?autoplay=1&mute=1&loop=1&playlist=NnEe-G3VnIk&controls=0&modestbranding=1&showinfo=0&rel=0&disablekb=1&iv_load_policy=3&fs=0';
const FACES = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
];

function Scene({ children, bg = 'white', minH = '100vh', className = '' }) {
  return (
    <section className={`relative w-full flex flex-col items-center justify-center px-6 md:px-8 ${className}`}
      style={{ minHeight: minH, background: bg }}>
      {children}
    </section>
  );
}

function Label({ text, light = false }) {
  return (
    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="text-[10px] font-black tracking-[0.35em] uppercase mb-20 text-center"
      style={{ color: light ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)' }}>
      {text}
    </motion.p>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 py-6"
      style={{ background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', transition: 'all 0.4s ease', borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
      <div className="flex items-center gap-2.5">
        <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-5 h-5 object-contain" />
        <span className="text-sm font-black tracking-tight" style={{ color: FG }}>Stensor</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="/fonctionnalites" className="text-xs font-medium text-gray-400 hover:text-black transition-colors">Features</a>
        <a href="/tarifs" className="text-xs font-medium text-gray-400 hover:text-black transition-colors">Pricing</a>
        <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs font-medium text-gray-400 hover:text-black transition-colors">Sign in</button>
      </div>
      <motion.button onClick={onCta} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="text-xs font-black px-5 py-2.5" style={{ background: FG, color: 'white', borderRadius: '6px' }}>
        Start free →
      </motion.button>
    </motion.header>
  );
}

// ─── 01 HERO ─────────────────────────────────────────────────────────────────
function Hero({ onCta }) {
  return (
    <Scene>
      <div className="text-center max-w-4xl mx-auto">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
          style={{ color: 'rgba(0,0,0,0.2)' }}>
          AI Financial Coach
        </motion.p>

        {['Keep Your Pleasures.', 'Build Real Wealth.'].map((line, i) => (
          <div key={i} className="overflow-hidden">
            <motion.h1 initial={{ y: 110, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.88] block"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 8.5rem)', color: i === 0 ? FG : YELLOW }}>
              {line}
            </motion.h1>
          </div>
        ))}

        {/* Subtitle — short, scannable */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78 }}
          className="text-lg leading-relaxed max-w-lg mx-auto mt-14 mb-12"
          style={{ color: 'rgba(0,0,0,0.38)', fontFamily: 'var(--font-open)' }}>
          The only AI coach that protects your lifestyle to build your wealth.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
          className="flex flex-col items-center gap-5">
          <motion.button onClick={onCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-12 py-5 font-black text-base"
            style={{ background: YELLOW, color: FG, borderRadius: '8px', boxShadow: '0 16px 56px rgba(221,255,0,0.45)' }}>
            Start your engine <ArrowRight className="w-4 h-4" />
          </motion.button>

          {/* Social proof — single clean line */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2.5">
              {FACES.map((src, i) => (
                <img key={i} src={src} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white"
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              <strong className="text-black font-black">1,000+ users</strong> already building their future
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-px h-14" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.12))' }} />
        <p className="text-[9px] tracking-[0.3em] uppercase text-gray-300">Scroll</p>
      </motion.div>
    </Scene>
  );
}

// ─── 02 VIDEO ─────────────────────────────────────────────────────────────────
function VideoScene() {
  return (
    <Scene bg="#f7f7f5" minH="auto" className="py-0">
      <div className="w-full max-w-6xl mx-auto py-24">
        <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full overflow-hidden"
          style={{ borderRadius: '20px', boxShadow: '0 40px 100px rgba(0,0,0,0.12)', aspectRatio: '16/9' }}>
          <div className="absolute inset-0 z-10" style={{ pointerEvents: 'none' }} />
          <iframe src={YT} className="absolute inset-0 w-full h-full"
            style={{ border: 'none', pointerEvents: 'none' }}
            allow="autoplay; encrypted-media" title="Stensor demo" />
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── 03 PLEASURE SIMULATOR ───────────────────────────────────────────────────
const PLEASURES = [
  {
    id: 'pizza', emoji: '🍕', label: 'Friday Pizza',
    chatgptText: '"Reduce food expenses by 30% — this is well above the recommended budget allocation."',
    stensorText: '"I found €94/month in forgotten subscriptions you never use. Pizza stays. Forever."',
    metric: '€94/month recovered', impact: '+€1,128/year · 0 sacrifices',
  },
  {
    id: 'travel', emoji: '✈️', label: '€2K Vacation',
    chatgptText: '"Your travel budget exceeds the recommended allocation for your income bracket."',
    stensorText: '"Funded in 11 weeks. Portfolio untouched. Boarding pass: ready."',
    metric: 'Trip fully funded', impact: 'Portfolio intact · Dream achieved',
  },
  {
    id: 'iphone', emoji: '📱', label: 'New iPhone',
    chatgptText: '"Avoid impulse purchases. Consider your long-term financial goals first."',
    stensorText: '"In 6 weeks, via your tech buffer. Day-by-day plan included."',
    metric: 'Purchased in 6 weeks', impact: 'Guilt-free · Zero debt · Plan enclosed',
  },
  {
    id: 'coffee', emoji: '☕', label: 'Daily Coffee',
    chatgptText: '"Cut your daily coffee. That\'s €400/year you could be saving right now."',
    stensorText: '"€400 protected. Found €1,200 in doubled insurance and forgotten SaaS."',
    metric: '€1,200/yr from real leaks', impact: 'Coffee intact · 3× more savings',
  },
  {
    id: 'gaming', emoji: '🎮', label: 'Netflix & Gaming',
    chatgptText: '"Limit entertainment subscriptions to a maximum of one platform."',
    stensorText: '"All kept. Found €187/month elsewhere. Redirected straight to your goals."',
    metric: '€187/mo redirected', impact: '0 entertainment cut · All goals funded',
  },
];

function PleasureSimulator({ onCta }) {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = (idx) => {
    if (animating || idx === active) return;
    setAnimating(true);
    setActive(idx);
    setTimeout(() => setAnimating(false), 400);
  };

  const p = PLEASURES[active];

  return (
    <Scene bg="white" minH="100vh">
      <div className="w-full max-w-5xl mx-auto py-20 flex flex-col justify-center" style={{ minHeight: '100vh' }}>
        <Label text="The Pleasure Simulator" />

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-10">
          <h2 className="font-black tracking-tighter mb-3"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: FG, lineHeight: 1.0 }}>
            What others cut,{' '}<span style={{ color: YELLOW }}>Stensor protects.</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto" style={{ fontFamily: 'var(--font-open)' }}>
            Pick a pleasure. See the difference instantly.
          </p>
        </motion.div>

        {/* Pills — horizontally aligned at top */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {PLEASURES.map((pl, i) => (
            <motion.button key={pl.id} onClick={() => go(i)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all"
              style={{
                borderRadius: '40px',
                background: active === i ? FG : 'transparent',
                color: active === i ? 'white' : 'rgba(0,0,0,0.4)',
                border: active === i ? '1.5px solid transparent' : '1.5px solid rgba(0,0,0,0.1)',
              }}>
              <span>{pl.emoji}</span>
              <span className="hidden sm:block">{pl.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Comparison — immediately below pills, no scroll needed */}
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid md:grid-cols-2 gap-3">

            {/* ChatGPT */}
            <div className="p-8 flex flex-col gap-5" style={{ background: '#f7f7f5', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.07)' }}>
                  <X className="w-2.5 h-2.5 text-gray-400" />
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-300">ChatGPT</span>
              </div>
              <p className="text-base flex-1 leading-relaxed"
                style={{ color: 'rgba(0,0,0,0.35)', fontFamily: '"Georgia", serif', fontStyle: 'italic', lineHeight: 1.75 }}>
                {p.chatgptText}
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-300 font-medium">Typical result: abandoned within 3 weeks.</p>
              </div>
            </div>

            {/* Stensor */}
            <div className="p-8 flex flex-col gap-5 relative overflow-hidden" style={{ background: FG, borderRadius: '16px' }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: YELLOW }}>
                  <Check className="w-2.5 h-2.5" style={{ color: FG }} />
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: YELLOW }}>Stensor</span>
              </div>
              <p className="text-base font-semibold text-white flex-1 leading-relaxed"
                style={{ fontFamily: 'var(--font-open)', lineHeight: 1.75 }}>
                {p.stensorText}
              </p>
              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xl font-black" style={{ color: YELLOW }}>{p.metric}</p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-open)' }}>{p.impact}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {PLEASURES.map((_, i) => (
            <button key={i} onClick={() => go(i)} className="rounded-full transition-all"
              style={{ width: active === i ? 20 : 6, height: 6, background: active === i ? FG : 'rgba(0,0,0,0.12)' }} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.4 }} className="text-center mt-12">
          <motion.button onClick={onCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-10 py-4 font-black text-sm mx-auto"
            style={{ background: YELLOW, color: FG, borderRadius: '8px', boxShadow: '0 8px 32px rgba(221,255,0,0.3)' }}>
            See how it works <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── 04 SCIENCE ───────────────────────────────────────────────────────────────
function ScienceScene() {
  const stats = [
    { n: '3×', label: 'longer on track', desc: 'People who keep their pleasures stay on their financial plan 3× longer than restriction-based methods.' },
    { n: '2×', label: 'faster to goals', desc: 'The dopamine of maintained pleasure boosts discipline across every other area of your financial life.' },
    { n: '94%', label: 'quit in 90 days', desc: 'Of all-restriction budgets are abandoned before 3 months. Stensor builds around this truth.' },
  ];
  return (
    <Scene bg={FG}>
      <div className="w-full max-w-5xl mx-auto">
        <Label text="The science behind Stensor" light />

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-24">
          <h2 className="font-black tracking-tighter leading-[0.95]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: 'white' }}>
            Total restriction doesn't work.<br />
            <span style={{ color: YELLOW }}>We knew it. We built around it.</span>
          </h2>
        </motion.div>

        {/* Stats — naked, no boxes, surgical */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-28">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3">
              <p className="font-black" style={{ fontSize: 'clamp(4.5rem, 7vw, 7rem)', color: YELLOW, lineHeight: 1 }}>{s.n}</p>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-open)', maxWidth: '260px' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Quote — no box, pure typography */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="text-center">
          <p className="font-black italic text-white leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.5rem)', fontFamily: '"Georgia", serif' }}>
            "Happiness is not the reward at the end of the road.<br />
            It's the fuel that gets you there."
          </p>
          <p className="mt-6 tracking-[0.25em] uppercase"
            style={{ fontSize: '10px', color: 'rgba(255,255,255,0.16)', fontFamily: 'var(--font-open)', fontWeight: 300 }}>
            — The Stensor Philosophy
          </p>
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── 05 CHAT DEMO ─────────────────────────────────────────────────────────────
const CHAT_DEMOS = [
  { userMsg: 'Can I buy the new iPhone 16?', aiMsg: "Yes — in 3 weeks via your tech buffer. Your investment portfolio stays untouched. Here's the day-by-day plan." },
  { userMsg: 'Am I on track for early retirement?', aiMsg: "You're at 82% of target. A €87/month adjustment gets you to 100% by Q3. That's less than one restaurant dinner." },
  { userMsg: "What's my next financial move?", aiMsg: 'Increase your auto-transfer by €50 this month. Impact on your retirement: +€12,400. Takes 2 minutes to set up.' },
];

function ChatScene() {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState('user');

  useEffect(() => {
    setPhase('user');
    const t1 = setTimeout(() => setPhase('typing'), 700);
    const t2 = setTimeout(() => setPhase('ai'), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [current]);

  const demo = CHAT_DEMOS[current];

  return (
    <Scene bg="#f7f7f5">
      <div className="w-full max-w-xl mx-auto">
        <Label text="Live conversation" />
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-6 h-6 object-contain" />
            <div>
              <p className="text-xs font-black" style={{ color: FG }}>Stensor</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-[10px] text-gray-400">Online</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-8 flex flex-col gap-4" style={{ minHeight: 200 }}>
            <AnimatePresence mode="wait">
              <motion.div key={`u-${current}`} initial={{ opacity: 0, y: 10, x: 16 }} animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.35 }} className="self-end px-5 py-3.5 max-w-[78%] text-sm font-medium text-white"
                style={{ background: FG, borderRadius: '18px 18px 4px 18px', fontFamily: 'var(--font-open)', lineHeight: 1.6 }}>
                {demo.userMsg}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {phase === 'typing' && (
                <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="self-start flex items-center gap-1.5 px-5 py-3.5"
                  style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '18px 18px 18px 4px' }}>
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.95, delay: i * 0.15 }}
                      className="w-1.5 h-1.5 rounded-full" style={{ background: FG }} />
                  ))}
                </motion.div>
              )}
              {phase === 'ai' && (
                <motion.div key={`a-${current}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }} className="self-start px-5 py-3.5 max-w-[80%] text-sm"
                  style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '18px 18px 18px 4px', color: '#1a1a1a', fontFamily: 'var(--font-open)', lineHeight: 1.65 }}>
                  {demo.aiMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between px-6 pb-5 pt-2">
            <div className="flex gap-1.5">
              {CHAT_DEMOS.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className="rounded-full transition-all"
                  style={{ width: current === i ? 20 : 6, height: 6, background: current === i ? FG : 'rgba(0,0,0,0.1)' }} />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setCurrent(c => (c - 1 + CHAT_DEMOS.length) % CHAT_DEMOS.length)}
                className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button onClick={() => setCurrent(c => (c + 1) % CHAT_DEMOS.length)}
                className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-10 text-center">
          <p className="text-xl font-black" style={{ color: FG }}>"Not a chatbot. A financial partner."</p>
          <p className="text-xs mt-2 text-gray-400" style={{ fontFamily: 'var(--font-open)' }}>
            Every answer built around your life — not a generic template.
          </p>
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── 06 RESULTS ───────────────────────────────────────────────────────────────
const RESULTS = [
  { name: 'Sarah K.', role: 'Engineer · London', result: '€640/month recovered', sub: 'First conversation', src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&crop=face' },
  { name: 'Julien M.', role: 'Freelance dev · Paris', result: 'Early retirement at 47', sub: '6-month plan', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face' },
  { name: 'Marc D.', role: 'Entrepreneur · Brussels', result: '€0 debt in 14 months', sub: 'Zero lifestyle cuts', src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop&crop=face' },
  { name: 'Camille F.', role: 'Designer · Nice', result: 'First ETF purchased', sub: 'After a 10-min chat', src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=face' },
  { name: 'Thomas R.', role: 'Marketing · Bordeaux', result: '+€23,000 in 2 years', sub: 'Morning coffee: intact', src: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&h=60&fit=crop&crop=face' },
  { name: 'Léa B.', role: 'Doctor · Lyon', result: '€2,800 trip funded', sub: 'In 8 weeks', src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face' },
];

function ResultsScene() {
  return (
    <Scene bg="white">
      <div className="w-full max-w-5xl mx-auto">
        <Label text="Real results" />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-16">
          <h2 className="font-black tracking-tighter"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)', color: FG, lineHeight: 1.0 }}>
            They kept their pleasures.<br />
            <span style={{ color: YELLOW }}>And built something real.</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESULTS.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="p-7 flex flex-col gap-5"
              style={{ background: '#f7f7f5', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div>
                <p className="text-2xl font-black mb-1" style={{ color: FG }}>{r.result}</p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-open)' }}>{r.sub}</p>
              </div>
              <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                <img src={r.src} alt={r.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <div>
                  <p className="text-xs font-black" style={{ color: FG }}>{r.name}</p>
                  <p className="text-[10px] text-gray-400">{r.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => <span key={j} style={{ color: '#c9a800', fontSize: '10px' }}>★</span>)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-24 text-center">
          <p className="font-black tracking-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', color: FG }}>
            "Your pleasure isn't the problem.
          </p>
          <p className="font-black tracking-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', color: YELLOW }}>
            It's the solution."
          </p>
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── 07 FINAL CTA ─────────────────────────────────────────────────────────────
function FinalScene({ onCta }) {
  return (
    <Scene bg={YELLOW}>
      <div className="text-center max-w-3xl mx-auto">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
          style={{ color: 'rgba(0,0,0,0.3)' }}>
          Your move
        </motion.p>
        {['Your pleasure.', 'Our problem.'].map((line, i) => (
          <div key={i} className="overflow-hidden mb-2">
            <motion.h2 initial={{ y: 80, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)', color: i === 0 ? FG : 'rgba(0,0,0,0.2)' }}>
              {line}
            </motion.h2>
          </div>
        ))}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.3 }} className="flex flex-col items-center gap-5 mt-16">
          <motion.button onClick={onCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-14 py-5 font-black text-base"
            style={{ background: FG, color: 'white', borderRadius: '8px', boxShadow: '0 20px 56px rgba(0,0,0,0.22)' }}>
            Start your engine <ArrowRight className="w-4 h-4" />
          </motion.button>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.38)', fontFamily: 'var(--font-open)' }}>
            No credit card. No setup. Just clarity.
          </p>
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="px-8 md:px-12 py-10 flex items-center justify-between flex-wrap gap-4"
      style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-2">
        <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-5 h-5 object-contain" />
        <span className="text-xs font-black" style={{ color: FG }}>Stensor</span>
      </div>
      <div className="flex items-center gap-6">
        {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
          <a key={l} href={h} className="text-[11px] text-gray-300 hover:text-black transition-colors">{l}</a>
        ))}
      </div>
      <p className="text-[10px] text-gray-200">© 2026 Stensor Inc. · Not financial advice.</p>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(a => { if (a) navigate('/app', { replace: true }); else setReady(true); })
      .catch(() => setReady(true));
  }, [navigate]);

  if (!ready) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
    </div>
  );

  const openQuiz = () => setShowQuiz(true);

  return (
    <div className="font-inter overflow-x-hidden bg-white">
      <AnimatePresence>{showQuiz && <GuestQuiz onClose={() => setShowQuiz(false)} />}</AnimatePresence>
      <Navbar onCta={openQuiz} />
      <Hero onCta={openQuiz} />
      <VideoScene />
      <PleasureSimulator onCta={openQuiz} />
      <ScienceScene />
      <ChatScene />
      <ResultsScene />
      <FinalScene onCta={openQuiz} />
      <Footer />
    </div>
  );
}