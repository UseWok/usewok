import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import GuestQuiz from '@/components/landing/GuestQuiz';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

// ─── Minimal navbar ───────────────────────────────────────────────────────────
function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-7"
      style={{ background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent', transition: 'background 0.5s ease' }}
    >
      <div className="flex items-center gap-2.5">
        <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-5 h-5 object-contain" />
        <span className="text-sm font-black tracking-tight" style={{ color: FG }}>Stensor</span>
      </div>
      <div className="flex items-center gap-8">
        <a href="/fonctionnalites" className="text-xs text-gray-400 hover:text-black transition-colors tracking-wide">Features</a>
        <a href="/tarifs" className="text-xs text-gray-400 hover:text-black transition-colors tracking-wide">Pricing</a>
        <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs text-gray-400 hover:text-black transition-colors tracking-wide">Sign in</button>
        <motion.button
          onClick={onCta}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-xs font-black px-5 py-2.5"
          style={{ background: FG, color: 'white', borderRadius: '6px' }}
        >
          Start free →
        </motion.button>
      </div>
    </motion.header>
  );
}

// ─── Section wrapper — full viewport ─────────────────────────────────────────
function Scene({ children, bg = 'white', center = true }) {
  return (
    <section
      className={`relative w-full flex flex-col ${center ? 'items-center justify-center' : ''} px-8`}
      style={{ minHeight: '100vh', background: bg }}
    >
      {children}
    </section>
  );
}

// ─── 01 HERO ─────────────────────────────────────────────────────────────────
function Hero({ onCta }) {
  const FACE_AVATARS = [
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
  ];

  return (
    <Scene>
      <div className="text-center max-w-4xl mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
          style={{ color: 'rgba(0,0,0,0.2)' }}
        >
          AI Financial Coach
        </motion.p>

        {/* Giant headline */}
        {['Keep Your Pleasures.', 'Build Real Wealth.'].map((line, i) => (
          <div key={i} className="overflow-hidden">
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.35 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9] block"
              style={{
                fontSize: 'clamp(3.5rem, 9vw, 8rem)',
                color: i === 0 ? FG : YELLOW,
              }}
            >
              {line}
            </motion.h1>
          </div>
        ))}

        {/* Spacer */}
        <div className="mt-20 mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: 'rgba(0,0,0,0.35)', fontFamily: 'var(--font-open)' }}
          >
            The only AI that builds your future around the life you love —
            not against it.
          </motion.p>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.button
            onClick={onCta}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-12 py-5 font-black text-base"
            style={{ background: YELLOW, color: FG, borderRadius: '8px', boxShadow: '0 12px 48px rgba(221,255,0,0.4)' }}
          >
            Discover my plan <ArrowRight className="w-4 h-4" />
          </motion.button>

          {/* Social proof inline */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {FACE_AVATARS.map((src, i) => (
                <img key={i} src={src} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              <strong className="text-black font-black">1,000+ users</strong> already building their future
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))' }} />
        <p className="text-[9px] tracking-[0.3em] uppercase text-gray-300">Scroll</p>
      </motion.div>
    </Scene>
  );
}

// ─── 02 PROBLEM — Bento floating cards ────────────────────────────────────────
function ProblemScene() {
  const problems = [
    { label: 'ChatGPT says', text: '"Reduce your food expenses."', bad: true },
    { label: 'Your advisor says', text: '"Cut the vacation budget."', bad: true },
    { label: 'Stensor says', text: '"Keep the pizza. I found €94 in forgotten subscriptions."', bad: false },
  ];

  return (
    <Scene bg="#fafaf8">
      <div className="w-full max-w-5xl mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-24 text-center"
          style={{ color: 'rgba(0,0,0,0.2)' }}
        >
          The difference
        </motion.p>

        {/* Three cards — floating bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-8 flex flex-col gap-6"
              style={{
                background: p.bad ? 'white' : FG,
                borderRadius: '12px',
                border: p.bad ? '1px solid rgba(0,0,0,0.06)' : 'none',
                boxShadow: p.bad ? '0 4px 24px rgba(0,0,0,0.04)' : '0 24px 64px rgba(0,0,0,0.18)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: p.bad ? 'rgba(0,0,0,0.06)' : YELLOW }}>
                  {p.bad
                    ? <X className="w-2.5 h-2.5 text-gray-400" />
                    : <Check className="w-2.5 h-2.5" style={{ color: FG }} />
                  }
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase"
                  style={{ color: p.bad ? 'rgba(0,0,0,0.25)' : YELLOW }}>
                  {p.label}
                </span>
              </div>
              <p className="text-base leading-relaxed font-semibold"
                style={{ color: p.bad ? 'rgba(0,0,0,0.4)' : 'white', fontFamily: 'var(--font-open)' }}>
                {p.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Scene>
  );
}

// ─── 03 VIDEO — Full width, immersive ─────────────────────────────────────────
const YT = 'https://www.youtube.com/embed/NnEe-G3VnIk?autoplay=1&mute=1&loop=1&playlist=NnEe-G3VnIk&controls=0&modestbranding=1&showinfo=0&rel=0&disablekb=1&iv_load_policy=3&fs=0';

function VideoScene() {
  return (
    <Scene bg="white">
      <div className="w-full max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-16 text-center"
          style={{ color: 'rgba(0,0,0,0.2)' }}
        >
          See it in action
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full overflow-hidden"
          style={{ borderRadius: '16px', boxShadow: '0 32px 80px rgba(0,0,0,0.1)', aspectRatio: '16/9' }}
        >
          <div className="absolute inset-0 z-10" style={{ pointerEvents: 'none' }} />
          <iframe
            src={YT}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none', pointerEvents: 'none' }}
            allow="autoplay; encrypted-media"
            title="Stensor demo"
          />
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── 04 THREE SKILLS — Bento vertical ─────────────────────────────────────────
const SKILLS = [
  { emoji: '🛒', tag: 'Can I buy this?', headline: 'Buy it — or not — in 10 seconds.', desc: 'Stensor reads your real picture and tells you exactly if you can afford it. No spreadsheet. No guilt.' },
  { emoji: '🧭', tag: 'Am I on track?', headline: 'Never drift without knowing it.', desc: 'Stensor checks your trajectory and tells you how to course-correct before a small drift becomes a big problem.' },
  { emoji: '🎯', tag: "What's my next move?", headline: 'Always know exactly what to do next.', desc: 'One concrete, measurable action every week. You never lose momentum, never feel stuck.' },
];

function SkillsScene({ onCta }) {
  return (
    <Scene bg={FG}>
      <div className="w-full max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-24 text-center"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Three modes
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-24">
          {SKILLS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 flex flex-col gap-5"
              style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded"
                  style={{ background: YELLOW, color: FG }}>{s.tag}</span>
              </div>
              <h3 className="text-xl font-black text-white leading-tight tracking-tight">{s.headline}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-open)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={onCta}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-10 py-4 font-black text-sm"
            style={{ background: YELLOW, color: FG, borderRadius: '8px' }}
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── 05 CHAT DEMO — Floating bubble UI ───────────────────────────────────────
const CHAT_DEMOS = [
  {
    userMsg: 'Can I buy the new iPhone 16?',
    aiMsg: "Yes — in 3 weeks with your tech buffer. Don't touch your investment portfolio. Here's the exact timeline.",
  },
  {
    userMsg: 'Am I on track for my retirement goal?',
    aiMsg: "You're at 82% of your target. A €87/month adjustment puts you back at 100% by Q3. That's less than one dinner out.",
  },
  {
    userMsg: "What's my next financial move?",
    aiMsg: 'Increase your auto-transfer by €50 this month. Impact on your retirement: +€12,400. It takes 2 minutes to set up.',
  },
];

function ChatScene() {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState('user'); // user | typing | ai

  useEffect(() => {
    setPhase('user');
    const t1 = setTimeout(() => setPhase('typing'), 800);
    const t2 = setTimeout(() => setPhase('ai'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [current]);

  const demo = CHAT_DEMOS[current];

  return (
    <Scene bg="#fafaf8">
      <div className="w-full max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-20 text-center"
          style={{ color: 'rgba(0,0,0,0.2)' }}
        >
          Live conversation
        </motion.p>

        {/* Chat window */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-6 h-6 object-contain" />
            <div>
              <p className="text-xs font-black" style={{ color: FG }}>Stensor</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-[10px] text-gray-400">Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="px-6 py-8 flex flex-col gap-5 min-h-[220px]">
            {/* User bubble */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`user-${current}`}
                initial={{ opacity: 0, y: 10, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.4 }}
                className="self-end px-5 py-3.5 max-w-xs text-sm font-medium"
                style={{ background: FG, color: 'white', borderRadius: '18px 18px 4px 18px', fontFamily: 'var(--font-open)' }}
              >
                {demo.userMsg}
              </motion.div>
            </AnimatePresence>

            {/* AI bubble */}
            <AnimatePresence mode="wait">
              {phase === 'typing' && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="self-start flex items-center gap-1.5 px-5 py-3.5"
                  style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '18px 18px 18px 4px' }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: FG }}
                    />
                  ))}
                </motion.div>
              )}
              {phase === 'ai' && (
                <motion.div
                  key={`ai-${current}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="self-start px-5 py-3.5 max-w-xs text-sm"
                  style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '18px 18px 18px 4px', color: '#1a1a1a', fontFamily: 'var(--font-open)', lineHeight: 1.65 }}
                >
                  {demo.aiMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 pb-5 pt-1">
            <div className="flex gap-1.5">
              {CHAT_DEMOS.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className="transition-all rounded-full"
                  style={{ width: current === i ? 20 : 6, height: 6, background: current === i ? FG : 'rgba(0,0,0,0.12)' }} />
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setCurrent(c => (c - 1 + CHAT_DEMOS.length) % CHAT_DEMOS.length)}
                className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button onClick={() => setCurrent(c => (c + 1) % CHAT_DEMOS.length)}
                className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

// ─── 06 TESTIMONIALS — 2 floating cards ──────────────────────────────────────
const QUOTES = [
  { name: 'Sarah K.', role: 'Engineer, London', quote: "€640/month found in subscriptions I didn't even notice. First conversation. Still shocked.", src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&crop=face' },
  { name: 'Julien M.', role: 'Freelance dev, Paris', quote: "I used to dread thinking about money. Now I ask Stensor and move on with my life.", src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face' },
  { name: 'Marc D.', role: 'Entrepreneur, Brussels', quote: "It's like a CFO in your pocket that speaks human. Never asked me to sacrifice a single pleasure.", src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop&crop=face' },
  { name: 'Camille F.', role: 'Designer, Nice', quote: "FIRE goal in 8 years. Stensor tells me every week exactly where I stand and what to do.", src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=face' },
];

function TestimonialsScene() {
  return (
    <Scene bg="white">
      <div className="w-full max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-24 text-center"
          style={{ color: 'rgba(0,0,0,0.2)' }}
        >
          Real results
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUOTES.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 flex flex-col gap-6"
              style={{ background: '#fafaf8', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}
            >
              <p className="text-base leading-relaxed text-gray-600" style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>
                "{q.quote}"
              </p>
              <div className="flex items-center gap-3">
                <img src={q.src} alt={q.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                <div>
                  <p className="text-xs font-black" style={{ color: FG }}>{q.name}</p>
                  <p className="text-[10px] text-gray-400">{q.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => <span key={j} style={{ color: '#c9a800', fontSize: '11px' }}>★</span>)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Scene>
  );
}

// ─── 07 FINAL CTA ─────────────────────────────────────────────────────────────
function FinalScene({ onCta }) {
  return (
    <Scene bg={YELLOW}>
      <div className="text-center max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
          style={{ color: 'rgba(0,0,0,0.3)' }}
        >
          Your move
        </motion.p>

        <div className="overflow-hidden mb-6">
          <motion.h2
            initial={{ y: 80, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-black tracking-tighter leading-[0.9]"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', color: FG }}
          >
            Your pleasure.
          </motion.h2>
        </div>
        <div className="overflow-hidden mb-16">
          <motion.h2
            initial={{ y: 80, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-black tracking-tighter leading-[0.9]"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', color: 'rgba(0,0,0,0.25)' }}
          >
            Our problem.
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col items-center gap-5"
        >
          <motion.button
            onClick={onCta}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-14 py-5 font-black text-base"
            style={{ background: FG, color: 'white', borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </motion.button>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>No credit card. No setup. Just clarity.</p>
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="px-10 py-10 flex items-center justify-between flex-wrap gap-4"
      style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-2">
        <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-5 h-5 object-contain" />
        <span className="text-xs font-black" style={{ color: FG }}>Stensor</span>
      </div>
      <div className="flex items-center gap-8">
        {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
          <a key={l} href={h} className="text-[11px] text-gray-300 hover:text-black transition-colors">{l}</a>
        ))}
      </div>
      <p className="text-[10px] text-gray-200">2026 Stensor Inc. · Not financial advice.</p>
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
    <div className="font-inter overflow-x-hidden" style={{ background: 'white' }}>
      <AnimatePresence>{showQuiz && <GuestQuiz onClose={() => setShowQuiz(false)} />}</AnimatePresence>
      <Navbar onCta={openQuiz} />
      <Hero onCta={openQuiz} />
      <ProblemScene />
      <VideoScene />
      <SkillsScene onCta={openQuiz} />
      <ChatScene />
      <TestimonialsScene />
      <FinalScene onCta={openQuiz} />
      <Footer />
    </div>
  );
}