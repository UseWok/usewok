import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ArrowRight, Check, X, ShoppingCart, Navigation, Zap } from 'lucide-react';
import GuestQuiz from '@/components/landing/GuestQuiz';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

// Bidirectional reveal — reverses on scroll up
function Reveal({ children, delay = 0, y = 40, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function RevealLeft({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function RevealRight({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MagneticBtn({ children, onClick, style, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const handleMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.22);
    y.set((e.clientY - r.top - r.height / 2) * 0.22);
  };
  return (
    <motion.button ref={ref} style={{ x: sx, y: sy, ...style }} className={className}
      onMouseMove={handleMove} onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick} whileTap={{ scale: 0.96 }}>
      {children}
    </motion.button>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-5">
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(0,0,0,0.07)', borderRadius: '10px',
          boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
          backdropFilter: 'blur(20px)', transition: 'all 0.35s ease',
        }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
          <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-6 h-6 object-contain" />
          <span className="font-black text-sm tracking-tight" style={{ color: FG }}>Stensor</span>
        </button>
        <div className="hidden md:flex items-center gap-8">
          {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs']].map(([l, h]) => (
            <a key={l} href={h} className="text-xs font-medium text-gray-400 hover:text-black transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => base44.auth.redirectToLogin('/app')} className="hidden md:block text-xs font-semibold text-gray-400 hover:text-black transition-colors px-3 py-2">Sign In</button>
          <MagneticBtn onClick={onCta} className="text-xs font-black px-4 py-2.5" style={{ background: FG, color: 'white', borderRadius: '8px' }}>
            Get Started
          </MagneticBtn>
        </div>
      </motion.nav>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
// 4 real faces: 2 women, 2 men
const FACE_AVATARS = [
  { src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face', alt: 'Emma' },
  { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', alt: 'James' },
  { src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face', alt: 'Sophia' },
  { src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', alt: 'Tom' },
];

function Hero({ onCta }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yTitle = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24" style={{ background: 'white' }}>
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.032) 1px, transparent 1px)`,
        backgroundSize: '52px 52px',
      }} />
      {/* Yellow glow */}
      <motion.div animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.65, 0.4] }} transition={{ duration: 9, repeat: Infinity }}
        className="absolute pointer-events-none"
        style={{ width: 800, height: 800, top: '-20%', left: '35%', background: 'radial-gradient(circle, rgba(221,255,0,0.3) 0%, transparent 65%)', filter: 'blur(70px)', zIndex: 0 }} />

      <motion.div style={{ y: yTitle, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-full text-xs font-bold"
          style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', color: '#555' }}>
          <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
            className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
          The only AI that builds wealth around the life you actually love
        </motion.div>

        {/* Stacked headline — each line slides up independently */}
        {[
          { text: 'Keep Your Pleasures.', color: FG },
          { text: 'Ditch The Guilt.', color: '#aaa' },
          { text: 'Build Real Wealth.', gradient: true },
        ].map((line, i) => (
          <div key={i} className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: 110, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
              className="font-black tracking-tighter leading-[0.93]"
              style={{
                fontSize: 'clamp(2.8rem, 8.5vw, 7rem)',
                ...(line.gradient
                  ? { background: `linear-gradient(135deg, ${YELLOW} 0%, #a8c400 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 28px rgba(221,255,0,0.35))' }
                  : { color: line.color }),
              }}>
              {line.text}
            </motion.h1>
          </div>
        ))}

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mt-8 mb-12 leading-relaxed" style={{ color: 'rgba(0,0,0,0.4)' }}>
          Your pizza nights. Your Netflix. Your weekend escapes.<br />
          <strong style={{ color: FG }}>Stensor keeps what you love and builds your future — automatically.</strong>
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <MagneticBtn onClick={onCta}
            className="flex items-center gap-2.5 px-10 py-5 font-black text-base rounded-sm"
            style={{ background: FG, color: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            Start for free <ArrowRight className="w-4 h-4" />
          </MagneticBtn>
          <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-sm font-medium text-gray-400 hover:text-black transition-colors">
            Already have an account →
          </button>
        </motion.div>

        {/* Social proof — image style like provided */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}
          className="flex items-center justify-center gap-3">
          <div className="flex -space-x-3">
            {FACE_AVATARS.map((av, i) => (
              <motion.img key={i} src={av.src} alt={av.alt}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65 + i * 0.07, type: 'spring', stiffness: 300 }}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.14)' }} />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Joined by <strong style={{ color: FG }}>1,000+ users</strong> already building their future
          </p>
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <ChevronDown className="w-5 h-5 text-gray-300" />
      </motion.div>
    </section>
  );
}

// ─── Pleasure Marquee ─────────────────────────────────────────────────────────
const PLEASURE_ITEMS = [
  '🍕 Friday pizza', '☕ Morning coffee', '✈️ Summer escape', '📺 Netflix binge',
  '🎮 New game', '👟 Sneaker drop', '🍣 Sushi night', '🏋️ Gym membership',
  '🎵 Spotify', '🚗 Road trip', '🍷 Wine Friday', '📱 New phone',
  '🎬 Cinema date', '🧘 Yoga studio', '🍔 Cheat meal', '🎧 AirPods',
];

function PleasureMarquee() {
  return (
    <div style={{ background: YELLOW, borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }} className="py-4 overflow-hidden">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        className="flex w-max gap-0"
      >
        {[...PLEASURE_ITEMS, ...PLEASURE_ITEMS].map((item, i) => (
          <span key={i} className="text-sm font-bold px-8 whitespace-nowrap" style={{ color: FG, borderRight: '1px solid rgba(0,0,0,0.08)' }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Black marquee strip ───────────────────────────────────────────────────────
const BANK_ARGS = [
  '✦ Your bank keeps your money stagnant', '✦ ChatGPT optimizes budgets, not lives', '✦ Advisors cost €200/hr for generic advice',
  '✦ Spreadsheets die after 2 weeks', '✦ Apps track — they don\'t strategize', '✦ Most budgets kill pleasure first',
  '✦ Zero guilt spending is possible', '✦ Wealth and pleasure are not opposites',
];

function BlackMarquee() {
  return (
    <div className="py-5 overflow-hidden" style={{ background: FG }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="flex w-max"
      >
        {[...BANK_ARGS, ...BANK_ARGS].map((item, i) => (
          <span key={i} className="text-[11px] font-bold uppercase tracking-widest mx-6 whitespace-nowrap"
            style={{ color: i % 2 === 0 ? YELLOW : 'rgba(255,255,255,0.35)' }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── VS Section ───────────────────────────────────────────────────────────────
const VS_ROWS = [
  { pleasure: '🍕 Pizza Friday', chatgpt: '"Reduce your food expenses"', stensor: '"Keep the pizza — we found €94 in unused subscriptions instead."' },
  { pleasure: '📺 Netflix €17/mo', chatgpt: '"Cancel non-essential subscriptions"', stensor: '"Netflix stays. That €17 becomes an ETF — your future self thanks you."' },
  { pleasure: '✈️ €2,000 vacation', chatgpt: '"Your travel budget exceeds recommendations"', stensor: '"Trip fully funded. Here\'s how without touching your investments."' },
  { pleasure: '📱 New iPhone', chatgpt: '"Avoid impulse purchases"', stensor: '"Can I buy this? Yes — in 6 weeks with your tech buffer. Here\'s the plan."' },
];

function VsSection() {
  return (
    <section className="py-28 px-6" style={{ background: '#fafaf8' }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-5 text-gray-400">The difference that changes everything</p>
          <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: FG, lineHeight: 1.02 }}>
            Other tools optimize budgets.<br />
            <span style={{ color: YELLOW, WebkitTextStroke: '1px #a0b800' }}>Stensor optimizes your life.</span>
          </h2>
          <p className="mt-5 text-lg text-gray-400 max-w-xl mx-auto">Your pleasures are not the problem. They're the whole point.</p>
        </Reveal>

        <Reveal>
          <div className="overflow-hidden rounded-sm" style={{ border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 16px 60px rgba(0,0,0,0.07)' }}>
            <div className="grid grid-cols-3 text-[10px] font-black uppercase tracking-[0.2em]" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', background: '#f5f5f5' }}>
              <div className="px-6 py-4 text-gray-400">Your Pleasure</div>
              <div className="px-6 py-4 text-gray-400" style={{ borderLeft: '1px solid rgba(0,0,0,0.06)' }}>Others say</div>
              <div className="px-6 py-4 font-black" style={{ borderLeft: '1px solid rgba(0,0,0,0.06)', background: YELLOW, color: FG }}>Stensor says ✦</div>
            </div>
            {VS_ROWS.map((row, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="grid grid-cols-3"
                style={{ borderBottom: i < VS_ROWS.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                <div className="px-6 py-5 text-sm font-bold bg-white" style={{ color: FG }}>{row.pleasure}</div>
                <div className="px-6 py-5 text-sm text-gray-400 italic bg-white" style={{ borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
                  <span className="flex items-start gap-2"><X className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />{row.chatgpt}</span>
                </div>
                <div className="px-6 py-5 text-sm font-semibold" style={{ borderLeft: '1px solid rgba(0,0,0,0.05)', background: 'rgba(221,255,0,0.07)', color: '#3a4a00' }}>
                  <span className="flex items-start gap-2"><Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#5a7a00' }} />{row.stensor}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Skills — Scroll Journey ──────────────────────────────────────────────────
const SKILLS = [
  {
    id: 'buy', emoji: '🛒', tag: 'Can I buy this?', Icon: ShoppingCart,
    headline: 'Buy. Or not.\nIn 10 seconds.',
    why: 'Because anxiety after every purchase is not a financial strategy.',
    desc: "Stensor reads your real-time financial picture and tells you exactly if you can afford it — and how, if yes. No spreadsheet. No guilt.",
    example: '"Can I buy this iPhone 16?" → "Yes — in 3 weeks with your tech buffer. Don\'t touch your investment portfolio."',
    accent: '#22c55e', bg: '#f0fdf4',
  },
  {
    id: 'track', emoji: '🧭', tag: 'Am I on track?', Icon: Navigation,
    headline: 'Never drift\nwithout knowing.',
    why: 'Most people only discover they\'ve drifted when it\'s too late.',
    desc: "Stensor checks your trajectory in real time and tells you exactly how to course-correct — before a small drift becomes a big problem.",
    example: '"Am I on track?" → "You\'re at 82% of your savings goal. A €87/month adjustment puts you back at 100% this quarter."',
    accent: '#3b82f6', bg: '#eff6ff',
  },
  {
    id: 'move', emoji: '🎯', tag: "What's my next move?", Icon: Zap,
    headline: 'Always know\nwhat to do next.',
    why: 'Financial paralysis kills more wealth than bad investments.',
    desc: "One concrete, measurable action every week — so you never lose momentum or lose sight of your goals.",
    example: '"What\'s my next move?" → "Increase your auto-transfer by €50. Impact: +€12,400 at retirement."',
    accent: '#a855f7', bg: '#fdf4ff',
  },
];

function SkillCard({ skill, index }) {
  const isEven = index % 2 === 0;
  return (
    <div className="py-20 px-6" style={{ background: skill.bg }}>
      <div className="max-w-5xl mx-auto">
        <div className={`grid md:grid-cols-2 gap-16 items-center ${!isEven ? 'md:direction-rtl' : ''}`}>
          <RevealLeft delay={0} className={!isEven ? 'md:order-2' : ''}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-sm flex items-center justify-center text-2xl" style={{ background: skill.accent + '20' }}>
                  {skill.emoji}
                </div>
                <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-sm" style={{ background: skill.accent + '18', color: skill.accent }}>
                  {skill.tag}
                </span>
              </div>
              <h2 className="font-black tracking-tighter mb-4 whitespace-pre-line" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: FG, lineHeight: 1.05 }}>
                {skill.headline}
              </h2>
              <p className="text-base font-bold mb-3" style={{ color: skill.accent }}>{skill.why}</p>
              <p className="text-base leading-relaxed text-gray-500 mb-6">{skill.desc}</p>
            </div>
          </RevealLeft>
          <RevealRight delay={0.1} className={!isEven ? 'md:order-1' : ''}>
            <div className="p-8 rounded-sm" style={{ background: 'white', border: `1.5px solid ${skill.accent}25`, boxShadow: `0 20px 60px ${skill.accent}12` }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: skill.accent + '88' }}>Real conversation</p>
              <div className="p-5 rounded-sm" style={{ background: skill.bg, border: `1px solid ${skill.accent}20` }}>
                <p className="text-sm leading-relaxed text-gray-700 italic">💬 {skill.example}</p>
              </div>
              <div className="mt-5 flex items-center gap-2 pt-5" style={{ borderTop: `1px solid ${skill.accent}15` }}>
                <div className="flex -space-x-2">
                  {FACE_AVATARS.slice(0, 3).map((av, i) => (
                    <img key={i} src={av.src} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <p className="text-xs text-gray-400">Used daily by <strong style={{ color: FG }}>1,000+ users</strong></p>
              </div>
            </div>
          </RevealRight>
        </div>
      </div>
    </div>
  );
}

function SkillsSection() {
  return (
    <section>
      <Reveal className="text-center py-20 px-6 bg-white">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-5 text-gray-400">Three modes. Total serenity.</p>
        <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: FG, lineHeight: 1.02 }}>
          Instant answer.<br />Concrete action. Always.
        </h2>
        <p className="mt-5 text-base text-gray-400 max-w-lg mx-auto">No more paralysis. No more anxiety. Just one clear answer every time.</p>
      </Reveal>
      {SKILLS.map((skill, i) => <SkillCard key={skill.id} skill={skill} index={i} />)}
    </section>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { n: '1,000+', label: 'Active users', sub: '+312 this month' },
    { n: '€384', label: 'Saved / month', sub: 'average per user' },
    { n: '60s', label: 'Full strategy', sub: 'complete & personal' },
    { n: '94%', label: 'Less anxiety', sub: 'from session one' },
  ];
  return (
    <section className="py-20 px-6" style={{ background: FG }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.08} y={16}>
              <div className="text-center">
                <p className="font-black mb-1 leading-none" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', color: YELLOW }}>{s.n}</p>
                <p className="text-sm font-black mb-0.5 text-white">{s.label}</p>
                <p className="text-[11px] text-gray-500">{s.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Julien M.', role: 'Freelance dev, Paris', quote: "I used to dread thinking about money. Now I ask Stensor and move on with my life. The anxiety is completely gone.", src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face', style: { fontFamily: '"Georgia", serif', fontSize: '13px' }, color: '#6366f1' },
  { name: 'Sarah K.', role: 'Engineer, London', quote: "€640/month found in subscriptions I didn't notice. First conversation. I'm still shocked.", src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&crop=face', style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '-0.01em' }, color: '#ec4899' },
  { name: 'Marc D.', role: 'Entrepreneur, Brussels', quote: "It's like having a CFO in your pocket that actually speaks human. Never once asked me to sacrifice a pleasure.", src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop&crop=face', style: { fontFamily: '"Times New Roman", serif', fontSize: '13px', fontStyle: 'italic' }, color: '#f59e0b' },
  { name: 'Léa B.', role: 'Doctor, Lyon', quote: '"Can I buy this?" became my superpower. 10 seconds and I know. Zero post-purchase stress.', src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face', style: { fontFamily: '"Courier New", monospace', fontSize: '12px' }, color: '#10b981' },
  { name: 'Thomas R.', role: 'Marketing, Bordeaux', quote: "ChatGPT wanted to cancel my morning coffee. Stensor optimized my savings without touching a single pleasure.", src: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&h=60&fit=crop&crop=face', style: { fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px' }, color: '#8b5cf6' },
  { name: 'Camille F.', role: 'Designer, Nice', quote: "My FIRE goal in 8 years. Stensor tells me every week exactly where I stand and what to do next.", src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=face', style: { fontFamily: '"Palatino", serif', fontSize: '13px' }, color: '#f43f5e' },
  { name: 'Antoine V.', role: 'Architect, Nantes', quote: '"Am I on track?" saved me from an €8,000 real estate mistake. Stensor caught what I missed.', src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face', style: { fontFamily: 'Inter, sans-serif', fontSize: '12px' }, color: '#0ea5e9' },
  { name: 'Emma C.', role: 'Consultant, Geneva', quote: '"What\'s my next move?" every Monday. 5 minutes. My financial week is planned. Simple, unstoppable.', src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop&crop=face', style: { fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px' }, color: '#a855f7' },
  { name: 'Hugo S.', role: 'Engineer, Strasbourg', quote: "€800/month saved without changing my lifestyle. I just stopped ignoring Stensor.", src: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=60&h=60&fit=crop&crop=face', style: { fontFamily: '"Courier New", monospace', fontSize: '12px' }, color: '#14b8a6' },
  { name: 'Sophie M.', role: 'HR, Lille', quote: "My ex told me to make a budget. Stensor tells me how to live AND save. Not the same thing.", src: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=60&h=60&fit=crop&crop=face', style: { fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '13px' }, color: '#e11d48' },
  { name: 'Lucas B.', role: 'Developer, Montpellier', quote: "It calculated that raising my transfer by €73 gets my home down payment 14 months earlier. Insane precision.", src: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=face', style: { fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700 }, color: '#2563eb' },
  { name: 'Inès D.', role: 'Lawyer, Paris', quote: "I earned well but had no idea where my money went. Stensor mapped everything in one conversation.", src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=face', style: { fontFamily: '"Palatino", serif', fontSize: '13px' }, color: '#7c3aed' },
  { name: 'Baptiste G.', role: 'Sales, Rennes', quote: "Before: stress with every purchase. After: I live my life and the AI handles the rest.", src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face', style: { fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px' }, color: '#059669' },
  { name: 'Chloé N.', role: 'Physio, Marseille', quote: "Bought my first ETF after a 10-minute chat. I thought AI finance was for rich people. Wrong.", src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face', style: { fontFamily: '"Georgia", serif', fontSize: '13px' }, color: '#d97706' },
  { name: 'Romain L.', role: 'Chef, Paris', quote: "Stensor didn't tell me to stop eating out. It found 3 other leaks. That's the whole difference.", src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face', style: { fontFamily: '"Trebuchet MS", sans-serif', fontSize: '13px' }, color: '#f97316' },
  { name: 'Margot P.', role: 'Teacher, Toulouse', quote: "Stensor showed me I'm outperforming 70% of people earning double. That changes everything.", src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face', style: { fontFamily: '"Georgia", serif', fontSize: '13px' }, color: '#22c55e' },
];

function TestimonialsSection() {
  function TestimonialRow({ items, reverse = false, speed = 60 }) {
    return (
      <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
        <motion.div
          animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
          transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
          className="flex gap-4 w-max py-2">
          {[...items, ...items].map((t, i) => (
            <div key={i} className="flex-shrink-0 w-80 p-6 bg-white rounded-sm"
              style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
              <p className="leading-relaxed mb-5" style={{ ...t.style, color: '#444' }}>"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <img src={t.src} alt={t.name} className="w-9 h-9 rounded-sm object-cover flex-shrink-0"
                  style={{ border: `2px solid ${t.color}40` }} />
                <div>
                  <p className="text-xs font-black" style={{ color: FG }}>{t.name}</p>
                  <p className="text-[10px] text-gray-400">{t.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} style={{ color: YELLOW, fontSize: '11px', textShadow: '0 0 6px rgba(221,255,0,0.6)' }}>★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    );
  }
  return (
    <section className="py-28 overflow-hidden" style={{ background: '#fafaf8' }}>
      <Reveal className="text-center mb-14 px-6">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-5 text-gray-400">Real people, real results</p>
        <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: FG, lineHeight: 1.02 }}>
          They kept their pleasures.<br />And built real wealth.
        </h2>
      </Reveal>
      <div className="flex flex-col gap-5">
        <TestimonialRow items={TESTIMONIALS.slice(0, 8)} speed={65} />
        <TestimonialRow items={TESTIMONIALS.slice(8)} reverse speed={75} />
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Tell it your situation', desc: 'No forms. No setup. Just type what\'s on your mind — a goal, a fear, a question. Even "can I afford this vacation?"' },
    { n: '02', title: 'Get a real strategy', desc: 'Stensor builds a concrete, personalized action plan around your life — not a generic checklist that cuts what you love.' },
    { n: '03', title: 'Execute and grow', desc: 'Follow the steps. Ask follow-ups. Watch your financial clarity compound week after week, effortlessly.' },
  ];
  return (
    <section className="py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-20">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-5 text-gray-400">How it works</p>
          <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: FG, lineHeight: 1.05 }}>
            Three steps to financial autopilot.
          </h2>
        </Reveal>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div whileHover={{ x: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }} transition={{ duration: 0.2 }}
                className="flex items-start gap-8 p-8 rounded-sm"
                style={{ background: '#fafaf8', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="font-black flex-shrink-0 leading-none" style={{ fontSize: '3rem', color: 'rgba(0,0,0,0.05)' }}>{s.n}</span>
                <div>
                  <h3 className="text-xl font-black mb-2" style={{ color: FG }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "What exactly is Stensor?", a: "The only AI financial coach that builds your wealth around the life you love — not by sacrificing what matters. Describe any goal in plain English and get a complete strategy in 60 seconds." },
  { q: "How is it different from ChatGPT?", a: "ChatGPT optimizes your budget. Stensor optimizes your life. ChatGPT tells you to cancel Netflix. Stensor keeps Netflix and finds 3 other leaks you didn't notice." },
  { q: "Do I need financial knowledge?", a: "Zero. Stensor is built for everyone, from total beginners to experienced investors. Just describe your situation in plain language." },
  { q: "Is my data secure?", a: "Completely. Your conversations are private and encrypted. We never sell or share your data." },
  { q: "Can I cancel anytime?", a: "Yes. No conditions, no hidden fees. You keep access until the end of your billing period." },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-24 px-6" style={{ background: '#fafaf8' }}>
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-14">
          <h2 className="text-3xl font-black tracking-tighter" style={{ color: FG }}>Frequently Asked Questions</h2>
        </Reveal>
        {FAQS.map((faq, i) => (
          <Reveal key={i} delay={i * 0.04}>
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between py-5 text-left gap-4">
                <span className="text-base font-bold" style={{ color: FG }}>{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-300" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <p className="pb-5 text-sm leading-relaxed text-gray-500">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCta({ onCta }) {
  return (
    <section className="relative py-40 px-6 overflow-hidden" style={{ background: 'white' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.028) 1px, transparent 1px)`,
        backgroundSize: '52px 52px',
      }} />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }} transition={{ duration: 7, repeat: Infinity }}
        className="absolute pointer-events-none inset-0"
        style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 60%, rgba(221,255,0,0.42), transparent)' }} />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <Reveal>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-8 text-gray-400">Ready for autopilot?</p>
          <h2 className="font-black tracking-tighter mb-6" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', color: FG, lineHeight: 0.95 }}>
            Your pleasure.<br />Your life.<br />
            <span style={{ color: '#aaa' }}>Our problem.</span>
          </h2>
          <p className="text-lg mb-12 text-gray-400">Start free. No credit card. No setup. Just clarity.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <MagneticBtn onClick={onCta}
              className="inline-flex items-center gap-3 px-12 py-6 font-black text-base rounded-sm"
              style={{ background: FG, color: 'white', boxShadow: '0 12px 50px rgba(0,0,0,0.18)' }}>
              Build my financial freedom <ArrowRight className="w-5 h-5" />
            </MagneticBtn>
          </div>

          {/* Bottom social proof */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {FACE_AVATARS.map((av, i) => (
                <img key={i} src={av.src} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
              ))}
            </div>
            <p className="text-sm text-gray-500">Joined by <strong style={{ color: FG }}>1,000+ users</strong> already building their future</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-6 h-6 object-contain" />
              <span className="font-black" style={{ color: FG }}>Stensor</span>
            </div>
            <p className="text-sm max-w-xs text-gray-400">The only AI coach that builds your wealth around the life you love.</p>
          </div>
          <div className="flex gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-300">Product</p>
              {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs']].map(([l, h]) => (
                <a key={l} href={h} className="block text-sm mb-2 text-gray-400 hover:text-black transition-colors">{l}</a>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-300">Legal</p>
              {[['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
                <a key={l} href={h} className="block text-sm mb-2 text-gray-400 hover:text-black transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-xs text-gray-300">2026 Stensor Inc. All rights reserved.</p>
          <p className="text-xs text-gray-200">AI responses may contain inaccuracies. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
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
      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="font-inter overflow-x-hidden bg-white">
      <AnimatePresence>
        {showQuiz && <GuestQuiz onClose={() => setShowQuiz(false)} />}
      </AnimatePresence>
      <Navbar onCta={() => setShowQuiz(true)} />
      <Hero onCta={() => setShowQuiz(true)} />
      <PleasureMarquee />
      <BlackMarquee />
      <VsSection />
      <SkillsSection />
      <StatsSection />
      <HowItWorks />
      <TestimonialsSection />
      <FaqSection />
      <FinalCta onCta={() => setShowQuiz(true)} />
      <Footer />
    </div>
  );
}