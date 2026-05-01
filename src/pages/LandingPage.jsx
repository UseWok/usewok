import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ArrowRight, Zap, Shield, TrendingUp, Brain, Clock, DollarSign } from 'lucide-react';
import GuestQuiz from '@/components/landing/GuestQuiz';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

// ─── Scroll-reveal wrapper (reverses on scroll up) ───────────────────────────
function Reveal({ children, delay = 0, y = 40, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Marquee ─────────────────────────────────────────────────────────────────
function Marquee({ children, speed = 30, reverse = false }) {
  return (
    <div className="overflow-hidden whitespace-nowrap" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
      <motion.div
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        className="inline-flex"
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} className="inline-flex items-center">{children}</span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-5 pt-4">
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3"
        style={{
          background: scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.75)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="flex items-center gap-2.5">
          <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-6 h-6 object-contain" />
          <span className="font-black text-sm tracking-tight text-white">Stensor</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs']].map(([l, h]) => (
            <a key={l} href={h} className="text-xs font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>{l}</a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => base44.auth.redirectToLogin('/app')}
            className="hidden md:block text-xs font-semibold transition-colors px-3 py-2"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}>
            Sign In
          </button>
          <button onClick={onCta}
            className="text-xs font-black px-4 py-2 transition-all hover:scale-105 active:scale-95"
            style={{ background: YELLOW, color: FG, borderRadius: '8px' }}>
            Get Started
          </button>
        </div>
      </motion.nav>
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero({ onCta }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: '#050505' }}>
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Glow orbs */}
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute pointer-events-none"
        style={{ width: 700, height: 700, top: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(221,255,0,0.12) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute pointer-events-none"
        style={{ width: 500, height: 500, bottom: '10%', right: '-5%', background: 'radial-gradient(circle, rgba(221,255,0,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold mb-8"
          style={{ background: 'rgba(221,255,0,0.1)', border: '1px solid rgba(221,255,0,0.2)', color: YELLOW }}>
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" /> AI Financial Coach — Invite Only
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-black tracking-tighter text-white leading-[0.95] mb-6"
          style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}>
          Live your life.<br />
          <span style={{ color: YELLOW }}>Let AI handle</span><br />
          the rest.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.45)' }}>
          The only AI coach that carries the mental load for you.<br />
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Zero spreadsheets. Zero guilt. Total autopilot.</span>
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={onCta}
            className="flex items-center gap-2 px-8 py-4 font-black text-base transition-all hover:scale-105 active:scale-95 rounded-xl"
            style={{ background: YELLOW, color: FG, boxShadow: '0 0 40px rgba(221,255,0,0.3)' }}>
            Start for free <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => base44.auth.redirectToLogin('/app')}
            className="flex items-center gap-2 px-8 py-4 font-semibold text-sm transition-all hover:bg-white/5 rounded-xl"
            style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Sign in →
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-4 mt-10">
          <div className="flex -space-x-2">
            {['#333', '#444', '#555', '#666'].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: c }}>{['J', 'M', 'A', 'S'][i]}</div>
            ))}
          </div>
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 800 }}>1,000+ people</span> already on autopilot
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <ChevronDown className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
      </motion.div>
    </section>
  );
}

// ─── Marquee strip ───────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = ['Zero Spreadsheets', '✦', 'Total Autopilot', '✦', 'Zero Guilt', '✦', 'Financial Freedom', '✦', 'Drop the Anxiety', '✦', 'Start Winning', '✦'];
  return (
    <div className="py-5 overflow-hidden" style={{ background: YELLOW }}>
      <Marquee speed={25}>
        {items.map((item, i) => (
          <span key={i} className="text-sm font-black uppercase tracking-widest mx-5" style={{ color: FG }}>{item}</span>
        ))}
      </Marquee>
    </div>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Brain, title: 'Thinks for you', desc: 'Drop your goal in plain words. Get a complete, expert strategy in 60 seconds — investing, debt, taxes, retirement. Done.', tag: 'AI-Powered' },
  { icon: Clock, title: 'Always on', desc: 'Your AI coach runs 24/7. Ask at 3am about that impulse purchase, get a real answer. No appointment needed.', tag: 'Instant' },
  { icon: Shield, title: 'No judgment', desc: 'Spent too much last month? It happens. Stensor resets your strategy without the guilt trip. Just forward momentum.', tag: 'Guilt-Free' },
  { icon: TrendingUp, title: 'Grows with you', desc: 'The more you use it, the more it understands your psychology, your goals, your life. Truly personalized over time.', tag: 'Adaptive' },
  { icon: Zap, title: 'Zero friction', desc: 'No spreadsheets. No jargon. No courses to watch. Just type what\'s on your mind and get a clear action.', tag: 'Simple' },
  { icon: DollarSign, title: 'Real money impact', desc: 'Users report finding €200–€800/month in leaks they didn\'t know existed. The ROI starts in the first conversation.', tag: 'Results' },
];

function FeaturesSection() {
  return (
    <section className="py-32 px-6" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-20">
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-4" style={{ color: YELLOW }}>Why Stensor</p>
          <h2 className="font-black tracking-tighter text-white" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05 }}>
            Your weekend plans.<br />Our problem to solve.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -4, borderColor: 'rgba(221,255,0,0.3)' }}
                transition={{ duration: 0.2 }}
                className="p-7 rounded-2xl h-full"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(221,255,0,0.1)' }}>
                    <f.icon className="w-5 h-5" style={{ color: YELLOW }} />
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 rounded-full tracking-widest uppercase"
                    style={{ background: 'rgba(221,255,0,0.08)', color: YELLOW }}>{f.tag}</span>
                </div>
                <h3 className="text-base font-black text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Manifesto ───────────────────────────────────────────────────────────────
const MANIFESTO = [
  { line: 'Drop the financial anxiety at the door.', size: 'clamp(1.8rem, 4vw, 3rem)' },
  { line: 'You focus on your weekend plans.', size: 'clamp(1.8rem, 4vw, 3rem)' },
  { line: 'We silently optimize your wealth in the background.', size: 'clamp(1.4rem, 3vw, 2.2rem)', muted: true },
];

function ManifestoSection() {
  return (
    <section className="py-36 px-6 overflow-hidden" style={{ background: '#050505' }}>
      <div className="max-w-4xl mx-auto space-y-8">
        {MANIFESTO.map((item, i) => (
          <Reveal key={i} delay={i * 0.12} y={24}>
            <p className="font-black tracking-tight leading-tight"
              style={{
                fontSize: item.size,
                color: item.muted ? 'rgba(255,255,255,0.25)' : 'white',
              }}>
              {item.line}
            </p>
          </Reveal>
        ))}
        <Reveal delay={0.45}>
          <div className="flex items-center gap-3 mt-10">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[11px] font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>That's the deal.</span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Big Statement ───────────────────────────────────────────────────────────
function BigStatement() {
  return (
    <section className="py-24 overflow-hidden" style={{ background: YELLOW }}>
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <p className="text-[10px] font-black tracking-[0.25em] uppercase mb-6" style={{ color: 'rgba(10,10,10,0.4)' }}>The numbers</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { stat: '60s', label: 'Average time to get a complete financial strategy' },
            { stat: '€400+', label: 'Average monthly savings discovered in the first session' },
            { stat: '94%', label: 'Of users say it reduced their financial anxiety immediately' },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.1} y={20}>
              <div>
                <p className="font-black mb-2" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', lineHeight: 1, color: FG }}>{item.stat}</p>
                <p className="text-sm font-medium" style={{ color: 'rgba(10,10,10,0.55)' }}>{item.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────────────────
const STEPS = [
  { num: '01', title: 'Tell it your situation', desc: 'No forms. No setup. Just type what\'s on your mind — a goal, a fear, a question. Anything.' },
  { num: '02', title: 'Get a real strategy', desc: 'Stensor thinks through your full picture and responds with a concrete, personalized action plan.' },
  { num: '03', title: 'Execute & grow', desc: 'Follow the steps. Ask follow-ups. Watch your financial clarity compound week after week.' },
];

function HowItWorks() {
  return (
    <section className="py-32 px-6" style={{ background: '#080808' }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-20">
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-4" style={{ color: YELLOW }}>How it works</p>
          <h2 className="font-black tracking-tighter text-white" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1 }}>
            Three steps to financial autopilot
          </h2>
        </Reveal>
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ x: 6 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-6 p-8 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-4xl font-black flex-shrink-0 leading-none" style={{ color: 'rgba(221,255,0,0.2)' }}>{s.num}</span>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.desc}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Julien M.', role: 'Freelancer, Paris', quote: "I used to dread thinking about money. Now I just ask Stensor. That's it. The anxiety is gone.", avatar: 'J' },
  { name: 'Sarah K.', role: 'Engineer, London', quote: "Found €600/month I was wasting in subscriptions and fees I didn't even know about. First conversation.", avatar: 'S' },
  { name: 'Marc D.', role: 'Entrepreneur, Brussels', quote: "It's like having a CFO in your pocket that actually speaks human. Game-changer for my finances.", avatar: 'M' },
];

function Testimonials() {
  return (
    <section className="py-32 px-6" style={{ background: '#050505' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-20">
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-4" style={{ color: YELLOW }}>Real people, real results</p>
          <h2 className="font-black tracking-tighter text-white" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            They stopped worrying.<br />You can too.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="p-7 rounded-2xl h-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-black flex-shrink-0"
                    style={{ background: YELLOW }}>{t.avatar}</div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is Stensor?', a: "Stensor is an AI-powered financial coach. Describe any goal in plain language and get a complete, actionable strategy — investing, debt, retirement, taxes, or anything else." },
  { q: 'Do I need financial knowledge?', a: 'Not at all. Just describe your situation and get expert-level guidance instantly.' },
  { q: 'What can I ask Stensor?', a: 'Anything financial — ETF investing, debt repayment, real estate, FIRE retirement, tax optimization, passive income, budgeting, and much more.' },
  { q: 'Is my data secure?', a: 'Completely. Your conversations are private and encrypted. We never sell or share your personal data.' },
  { q: 'Can I cancel anytime?', a: 'Yes, no conditions. Cancel anytime, no hidden fees.' },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-24 px-6" style={{ background: '#080808' }}>
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 className="text-3xl font-black tracking-tighter text-white">FAQ</h2>
        </Reveal>
        <div>
          {FAQS.map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left gap-4">
                  <span className="text-sm font-bold text-white">{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <p className="pb-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ───────────────────────────────────────────────────────────────
function FinalCta({ onCta }) {
  return (
    <section className="relative py-40 px-6 overflow-hidden" style={{ background: '#050505' }}>
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 5, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(221,255,0,0.1), transparent)' }} />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <Reveal>
          <h2 className="font-black tracking-tighter text-white mb-6" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 1 }}>
            I'm done<br />
            <span style={{ color: YELLOW }}>worrying.</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Start for free. No credit card. No setup. Just clarity.
          </p>
          <motion.button
            onClick={onCta}
            whileHover={{ scale: 1.04, boxShadow: '0 0 60px rgba(221,255,0,0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-10 py-5 font-black text-base rounded-2xl transition-all"
            style={{ background: YELLOW, color: FG }}>
            Build my financial freedom <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: '#030303', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-6 h-6 object-contain" />
              <span className="font-black text-white">Stensor</span>
            </div>
            <p className="text-sm max-w-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Your AI financial coach. Build wealth, invest smarter, reach financial freedom.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Product</p>
              {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs']].map(([l, h]) => (
                <a key={l} href={h} className="block text-sm mb-2 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>{l}</a>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Legal</p>
              {[['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
                <a key={l} href={h} className="block text-sm mb-2 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>2026 Stensor Inc. All rights reserved.</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.1)' }}>AI responses may contain inaccuracies. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#050505' }}>
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: YELLOW }} />
    </div>
  );

  return (
    <div className="font-inter overflow-x-hidden" style={{ background: '#050505' }}>
      <AnimatePresence>
        {showQuiz && <GuestQuiz onClose={() => setShowQuiz(false)} />}
      </AnimatePresence>
      <Navbar onCta={() => setShowQuiz(true)} />
      <Hero onCta={() => setShowQuiz(true)} />
      <MarqueeStrip />
      <ManifestoSection />
      <FeaturesSection />
      <BigStatement />
      <HowItWorks />
      <Testimonials />
      <FaqSection />
      <FinalCta onCta={() => setShowQuiz(true)} />
      <Footer />
    </div>
  );
}