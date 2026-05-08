import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check } from 'lucide-react';
import GuestQuiz from '@/components/landing/GuestQuiz';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const LOGO = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

function Scene({ children, bg = 'white', minH = '100vh' }) {
  return (
    <section className="relative w-full flex flex-col items-center justify-center px-6 md:px-8"
      style={{ minHeight: minH, background: bg }}>
      {children}
    </section>
  );
}

function Navbar({ scrolled, onCta }) {
  const navigate = useNavigate();
  return (
    <>
      {/* Desktop top pill navbar */}
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ paddingTop: 24 }}>
        <div className="flex items-center justify-between w-full px-6 py-3"
          style={{ maxWidth: 850, background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'all 0.4s ease', borderRadius: 999, border: '1px solid rgba(0,0,0,0.06)', boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)' }}>
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <img src={LOGO} alt="Stensor" className="w-8 h-8 object-contain" />
            <span className="text-sm font-black tracking-tight" style={{ color: FG }}>Stensor</span>
          </button>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-xs font-black text-black border-b border-black pb-0.5">Features</span>
            <a href="/tarifs" className="text-xs text-gray-400 hover:text-black transition-colors">Pricing</a>
            <a href="/blog" className="text-xs text-gray-400 hover:text-black transition-colors">Blog</a>
            <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs font-black px-4 py-2 rounded-lg border-2 border-black hover:bg-black hover:text-white transition-all">Sign in</button>
          </div>
          <motion.button onClick={onCta} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="text-xs font-black px-5 py-2.5" style={{ background: FG, color: 'white', borderRadius: '6px' }}>
            Start free →
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile floating bottom bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="fixed bottom-4 left-4 right-4 z-50 flex md:hidden items-center justify-between px-5 py-3.5 rounded-full"
        style={{ background: 'rgba(10,10,10,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <span className="text-xs font-black text-white border-b border-white pb-0.5">Features</span>
        <a href="/tarifs" className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>Pricing</a>
        <a href="/blog" className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>Blog</a>
        <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs font-black px-3 py-1.5 rounded-full border border-white/50" style={{ color: 'white' }}>Sign in</button>
        <button onClick={onCta} className="text-xs font-black px-4 py-2 rounded-full" style={{ background: YELLOW, color: FG }}>Start →</button>
      </motion.div>
    </>
  );
}

// ─── Feature deep-dive sections ───────────────────────────────────────────────
const FEATURE_SECTIONS = [
  {
    tag: '01 — The Engine',
    headline: 'An AI calibrated to your life.',
    sub: 'Not a generic profile. Your exact situation.',
    desc: "Stensor doesn't know \"the average user\". It knows your income, goals, risk tolerance, and untouchable pleasures. Every answer is built for you — and only you.",
    proof: [
      'Cumulative context built over months of conversation',
      'Strategies adapted to your spending psychology',
      'Recommendations that evolve with your situation',
    ],
    bg: 'white',
    dark: false,
    big: '"Your plan, not the plan."',
  },
  {
    tag: '02 — The Simulator',
    headline: 'Test before you act.',
    sub: 'Every decision simulated before it\'s made.',
    desc: '"If I invest $200/month for 15 years, where will I be?" Stensor simulates, calculates, compares — in real time. You see the impact before committing. Zero surprises. Zero regrets.',
    proof: [
      'Real-time Monte Carlo simulations',
      'Side-by-side scenario comparison',
      'Impact calculated to the dollar',
    ],
    bg: '#fafaf8',
    dark: false,
    big: '"Simulated. Validated. Executed."',
  },
  {
    tag: '03 — The Internet',
    headline: 'Live market data.',
    sub: 'The AI that knows what\'s happening right now.',
    desc: "Current interest rates, this week's ETF performance, news impacting your portfolio. Stensor connects analysis to reality — not data from 6 months ago.",
    proof: [
      'Real-time stock and rate data',
      'Financial news integrated into analysis',
      'Contextual alerts for your situation',
    ],
    bg: FG,
    dark: true,
    big: '"The AI that reads the world, not textbooks."',
  },
  {
    tag: '04 — Documents',
    headline: 'Your real numbers. Not estimates.',
    sub: 'Upload. Stensor reads, analyzes, optimizes.',
    desc: "Bank statements, pay stubs, insurance contracts. Stensor automatically extracts your real numbers and builds a strategy based on your actual financial reality — not what you think it is.",
    proof: [
      'Automatic reading of PDF, Excel, images',
      'Detection of hidden spending categories',
      'Contract and insurance analysis',
    ],
    bg: 'white',
    dark: false,
    big: '"Your data, your truth."',
  },
  {
    tag: '05 — The Coaching',
    headline: 'A coach who will never judge you.',
    sub: 'Not your morning coffee. Not your Friday nights out.',
    desc: "No moralizing. No judgment. No \"you should do better\". Stensor guides you toward your goals starting from who you are — keeping intact what makes you happy.",
    proof: [
      'Zero restrictions on your identified pleasures',
      'Positive coaching based on reinforcement',
      'Measurable progress visible every week',
    ],
    bg: YELLOW,
    dark: false,
    big: '"Your happiness is the plan."',
    yellowBg: true,
  },
];

// ─── Interactive Feature Tabs ─────────────────────────────────────────────────
function FeatureDeepDive({ onCta }) {
  const [active, setActive] = useState(0);
  const f = FEATURE_SECTIONS[active];

  return (
    <Scene bg="#fafaf8" minH="100vh">
      <div className="w-full max-w-5xl mx-auto">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-20 text-center"
          style={{ color: 'rgba(0,0,0,0.2)' }}>
          Deep dive
        </motion.p>

        {/* Tab pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {FEATURE_SECTIONS.map((s, i) => (
            <motion.button key={i} onClick={() => setActive(i)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 text-xs font-black transition-all"
              style={{
                background: active === i ? FG : 'rgba(0,0,0,0.04)',
                color: active === i ? 'white' : 'rgba(0,0,0,0.5)',
                borderRadius: '40px',
                border: active === i ? 'none' : '1px solid rgba(0,0,0,0.07)',
              }}>
              {s.tag}
            </motion.button>
          ))}
        </div>

        {/* Detail card */}
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid md:grid-cols-2 gap-4">

            <div className="p-10 flex flex-col justify-between"
              style={{
                background: f.dark ? FG : (f.yellowBg ? YELLOW : 'white'),
                borderRadius: '12px',
                border: !f.dark && !f.yellowBg ? '1px solid rgba(0,0,0,0.06)' : 'none',
                boxShadow: f.dark ? '0 24px 64px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.06)',
              }}>
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase mb-6"
                  style={{ color: f.dark ? 'rgba(255,255,255,0.3)' : (f.yellowBg ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.3)') }}>
                  {f.tag}
                </p>
                <h3 className="font-black tracking-tighter mb-3"
                  style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.05, color: f.dark ? 'white' : FG }}>
                  {f.headline}
                </h3>
                <p className="text-sm font-black mb-6"
                  style={{ color: f.dark ? YELLOW : FG }}>
                  {f.sub}
                </p>
                <p className="text-sm leading-relaxed"
                  style={{ color: f.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontFamily: 'var(--font-open)' }}>
                  {f.desc}
                </p>
              </div>
              <p className="text-2xl font-black mt-8"
                style={{ color: f.dark ? 'rgba(255,255,255,0.15)' : (f.yellowBg ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)'), fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>
                {f.big}
              </p>
            </div>

            <div className="p-10 flex flex-col justify-center gap-4"
              style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: 'rgba(0,0,0,0.25)' }}>
                What changes
              </p>
              {f.proof.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-5"
                  style={{ background: '#fafaf8', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: YELLOW }}>
                    <Check className="w-3 h-3" style={{ color: FG }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: FG }}>{p}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Scene>
  );
}

export default function LandingFeaturesPage() {
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleCta = () => setShowQuiz(true);

  return (
    <div className="font-inter overflow-x-hidden bg-white pb-20 md:pb-0">
      <AnimatePresence>{showQuiz && <GuestQuiz onClose={() => setShowQuiz(false)} />}</AnimatePresence>
      <Navbar scrolled={scrolled} onCta={handleCta} />

      {/* HERO */}
      <Scene minH="100vh">
        <div className="text-center max-w-4xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
            style={{ color: 'rgba(0,0,0,0.2)' }}>
            Features
          </motion.p>

          {["Not a budget.", "Your life."].map((line, i) => (
            <div key={i} className="overflow-hidden mb-1">
              <motion.h1 initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.25 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-black tracking-tighter leading-[0.9] block"
                style={{
                  fontSize: 'clamp(3rem, 8vw, 7rem)',
                  color: i === 1 ? YELLOW : FG,
                }}>
                {line}
              </motion.h1>
            </div>
          ))}

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-base max-w-lg mx-auto mt-16 mb-14 leading-relaxed"
            style={{ color: 'rgba(0,0,0,0.35)', fontFamily: 'var(--font-open)' }}>
            Tools built on one conviction: your happiness is not the enemy of your wealth. It's its engine.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <motion.button onClick={handleCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-12 py-5 font-black text-base mx-auto"
              style={{ background: YELLOW, color: FG, borderRadius: '8px', boxShadow: '0 12px 48px rgba(221,255,0,0.4)' }}>
              Explore for free <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))' }} />
          <p className="text-[9px] tracking-[0.3em] uppercase text-gray-300">Explore</p>
        </motion.div>
      </Scene>

      {/* PHILOSOPHY */}
      <Scene bg={FG} minH="80vh">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }}
            className="text-center mb-16">
            <p className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
              style={{ color: 'rgba(255,255,255,0.2)' }}>
              The philosophy
            </p>
            <p className="font-black tracking-tighter text-white"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', lineHeight: 1.15 }}>
              "Tools that ask you to suffer today<br />
              to be happy tomorrow<br />
              <span style={{ color: YELLOW }}>don't work."</span>
            </p>
            <p className="text-sm mt-8" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-open)' }}>
              Stensor was built on this truth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { emoji: '😤', title: 'Total restriction', desc: 'Abandoned in 3 weeks. Result: 0. More guilt than before.', bad: true },
              { emoji: '📊', title: 'Excel spreadsheet', desc: 'Dead after 2 weeks. Humans don\'t live in cells.', bad: true },
              { emoji: '🌟', title: 'The Stensor Method', desc: 'Pleasures kept. Leaks eliminated. Goals reached. 3× longer.', bad: false },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-7 flex flex-col gap-4"
                style={{
                  background: item.bad ? 'rgba(255,255,255,0.03)' : 'rgba(221,255,0,0.08)',
                  borderRadius: '12px',
                  border: item.bad ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${YELLOW}30`,
                }}>
                <span className="text-3xl">{item.emoji}</span>
                <p className="text-base font-black" style={{ color: item.bad ? 'rgba(255,255,255,0.5)' : 'white' }}>{item.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: item.bad ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-open)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Scene>

      {/* FEATURE DEEP DIVE */}
      <FeatureDeepDive onCta={handleCta} />

      {/* FINAL CTA */}
      <Scene bg={YELLOW} minH="80vh">
        <div className="text-center max-w-2xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
            style={{ color: 'rgba(0,0,0,0.3)' }}>
            Ready?
          </motion.p>
          <div className="overflow-hidden mb-2">
            <motion.h2 initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', color: FG }}>
              Your happiness.
            </motion.h2>
          </div>
          <div className="overflow-hidden mb-16">
            <motion.h2 initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', color: 'rgba(0,0,0,0.22)' }}>
              Our strategy.
            </motion.h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }} className="flex flex-col items-center gap-4">
            <motion.button onClick={handleCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-12 py-5 font-black text-base"
              style={{ background: FG, color: 'white', borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
              Start for free <ArrowRight className="w-4 h-4" />
            </motion.button>
            <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>No card. Cancel anytime.</p>
          </motion.div>
        </div>
      </Scene>

      {/* Footer */}
      <footer className="px-8 md:px-10 py-10 flex items-center justify-between flex-wrap gap-4"
        style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <img src={LOGO} alt="Stensor" className="w-7 h-7 object-contain" />
          <span className="text-xs font-black" style={{ color: FG }}>Stensor</span>
        </button>
        <div className="flex items-center gap-6">
          {[['Pricing', '/tarifs'], ['Blog', '/blog'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
            <a key={l} href={h} className="text-[11px] text-gray-300 hover:text-black transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-[10px] text-gray-200">2026 Stensor Inc.</p>
      </footer>
    </div>
  );
}