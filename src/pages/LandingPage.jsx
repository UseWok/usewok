import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Zap, Check, Star } from 'lucide-react';

const CORAL = '#F95738';
const BG = '#111111';
const BG2 = '#161616';

const FACES = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
];

function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'center', padding: '14px 20px',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 980, padding: '10px 20px',
        background: scrolled ? 'rgba(17,17,17,0.97)' : 'rgba(17,17,17,0.75)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 999,
        transition: 'background 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 30, height: 'auto', mixBlendMode: 'screen' }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>WOK</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {[['Pricing', '/tarifs'], ['Blog', '/blog']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              className="hidden md:block"
            >{l}</a>
          ))}
          <button onClick={() => base44.auth.redirectToLogin('/app')}
            style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Sign in
          </button>
          <motion.button onClick={onCta} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: CORAL, border: 'none', borderRadius: 999, padding: '9px 20px', cursor: 'pointer' }}>
            Start free →
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

function Hero({ onCta }) {
  const words = ['interfaces.', 'apps.', 'tools.', 'experiences.'];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIndex(i => (i + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      minHeight: '100vh', background: BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 500,
        background: `radial-gradient(ellipse, rgba(249,87,56,0.13) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 999, padding: '7px 14px', marginBottom: 48,
          }}
        >
          <div style={{ display: 'flex' }}>
            {FACES.map((src, i) => (
              <img key={i} src={src} alt="" style={{
                width: 22, height: 22, borderRadius: '50%', objectFit: 'cover',
                border: '2px solid #111', marginLeft: i > 0 ? -7 : 0,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(s => <Star key={s} style={{ width: 10, height: 10, fill: CORAL, color: CORAL }} />)}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
            <strong style={{ color: '#fff' }}>+300 builders</strong> already switched
          </span>
        </motion.div>

        <div style={{ overflow: 'hidden', marginBottom: 6 }}>
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(3.5rem, 9vw, 8.5rem)',
              fontWeight: 900, lineHeight: 0.9,
              letterSpacing: '-0.04em', color: '#fff', margin: 0,
            }}
          >
            Describe it.
          </motion.h1>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: 6 }}>
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(3.5rem, 9vw, 8.5rem)',
              fontWeight: 900, lineHeight: 0.9,
              letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.18)', margin: 0,
            }}
          >
            WOK builds it.
          </motion.h1>
        </div>
        <div style={{ height: 'clamp(3.5rem, 9vw, 8.5rem)', overflow: 'hidden', marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.h1
              key={wordIndex}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(3.5rem, 9vw, 8.5rem)',
                fontWeight: 900, lineHeight: 0.9,
                letterSpacing: '-0.04em', color: CORAL, margin: 0,
              }}
            >
              {words[wordIndex]}
            </motion.h1>
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'rgba(255,255,255,0.38)',
            lineHeight: 1.65, maxWidth: 520, margin: '0 auto 52px',
          }}
        >
          AI-powered app builder for creators and makers. Type a prompt, get a fully working interactive app in under 2 minutes. No code. No designer. No limits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
        >
          <motion.button onClick={onCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '18px 48px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: CORAL, color: '#fff',
              fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
              boxShadow: '0 20px 60px rgba(249,87,56,0.4)',
            }}>
            Build your first app — free <ArrowRight style={{ width: 18, height: 18 }} />
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      >
        <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12))' }} />
      </motion.div>
    </section>
  );
}

const STATS = [
  { n: '< 2 min', label: 'Average build time', sub: 'From prompt to live app' },
  { n: '300+', label: 'Active builders', sub: 'Growing every week' },
  { n: '0', label: 'Lines of code needed', sub: 'Pure natural language' },
];

function Stats() {
  return (
    <section style={{ background: '#0D0D0D', padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1 }}>
        {STATS.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '40px 32px',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 8px' }}>{s.n}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{s.sub}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const HOW_STEPS = [
  { n: '01', title: 'Describe your app', body: 'Type what you want in plain English. A calculator, a dashboard, a quiz, a form — anything interactive.' },
  { n: '02', title: 'WOK builds it', body: 'Our AI generates a fully functional React app in real-time. Watch it appear in the preview panel.' },
  { n: '03', title: 'Refine with chat', body: 'Ask changes in plain language. "Make it dark", "add a chart", "change the colors". Done instantly.' },
  { n: '04', title: 'Publish & share', body: 'One click. Your app is live at a public URL. Share it, embed it, sell access to it.' },
];

function HowItWorks({ onCta }) {
  return (
    <section style={{ background: BG2, padding: '100px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 72 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(249,87,56,0.6)', marginBottom: 16 }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, maxWidth: 600 }}>
            From idea to live app<br /><span style={{ color: CORAL }}>in one conversation.</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          {HOW_STEPS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{
                padding: '36px 28px',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(249,87,56,0.5)', letterSpacing: '0.1em', marginBottom: 20 }}>{s.n}</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: 0 }}>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const USE_CASES = [
  { emoji: '🧮', label: 'Calculators & estimators' },
  { emoji: '📊', label: 'Interactive dashboards' },
  { emoji: '🧩', label: 'Quizzes & assessments' },
  { emoji: '📋', label: 'Client intake forms' },
  { emoji: '🤖', label: 'AI-powered tools' },
  { emoji: '📚', label: 'Interactive courses' },
  { emoji: '🗂️', label: 'Data visualizers' },
  { emoji: '🛒', label: 'Product configurators' },
];

function UseCases({ onCta }) {
  return (
    <section style={{ background: BG, padding: '100px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Anything you can describe,<br /><span style={{ color: CORAL }}>WOK can build.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', maxWidth: 480, margin: '0 auto' }}>
            Creators, consultants, coaches, and developers use WOK to ship products their clients love.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 64 }}>
          {USE_CASES.map((u, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ borderColor: 'rgba(249,87,56,0.35)', y: -2 }}
              style={{
                padding: '24px 20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'default',
                transition: 'border-color 200ms, transform 200ms',
              }}
            >
              <span style={{ fontSize: 22 }}>{u.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{u.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center' }}
        >
          <motion.button onClick={onCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '16px 44px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: CORAL, color: '#fff', fontSize: 15, fontWeight: 800,
              boxShadow: '0 16px 48px rgba(249,87,56,0.38)',
            }}>
            Start building now <ArrowRight style={{ width: 16, height: 16 }} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    name: 'Camille R.', role: 'Business Coach',
    quote: 'I built a personal assessment tool in under 2 minutes. My clients use it every day. Revenue doubled in 3 weeks.',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    name: 'Thomas M.', role: 'Finance Educator',
    quote: 'My savings simulator became my #1 sales tool. People share it with their friends — free marketing.',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    name: 'Sophie L.', role: 'Marketing Consultant',
    quote: 'I used to spend weeks on deliverables. Now I ship something more impressive in a single conversation.',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face',
    name: 'Marc D.', role: 'Online Entrepreneur',
    quote: "Everyone asks how I built it. I say WOK. That's how I got my last 40 clients.",
  },
];

function Testimonials() {
  return (
    <section style={{ background: '#0D0D0D', padding: '100px 24px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 14 }}>Builders love WOK</p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>
            Real results from<br /><span style={{ color: CORAL }}>real builders.</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                padding: '28px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 18,
              }}
            >
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {[1,2,3,4,5].map(s => <Star key={s} style={{ width: 11, height: 11, fill: CORAL, color: CORAL }} />)}
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: '0 0 24px', fontStyle: 'italic' }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={t.avatar} alt={t.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: 0 }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ onCta }) {
  return (
    <section style={{ background: BG, padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, rgba(249,87,56,0.12) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 0.92, margin: '0 0 28px' }}>
            Your idea.<br /><span style={{ color: CORAL }}>Live today.</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.35)', marginBottom: 52, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 52px' }}>
            Stop waiting. Stop planning. Open WOK, describe your app, and watch it come to life in minutes.
          </p>

          <motion.button onClick={onCta} whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              padding: '20px 56px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: CORAL, color: '#fff',
              fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em',
              boxShadow: '0 24px 72px rgba(249,87,56,0.45)',
            }}>
            Start building — it's free <ArrowRight style={{ width: 20, height: 20 }} />
          </motion.button>

          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {FACES.slice(0, 4).map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '2px solid #111', marginLeft: i > 0 ? -9 : 0 }} />
            ))}
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 10, fontWeight: 600 }}>
              Join 300+ builders already shipping
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 26, height: 'auto', mixBlendMode: 'screen' }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>WOK</span>
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[['Pricing', '/tarifs'], ['Blog', '/blog'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
          <a key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.22)'}>{l}</a>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.12)', margin: 0 }}>© 2026 WOK</p>
    </footer>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(a => { if (a) navigate('/app', { replace: true }); else setReady(true); })
      .catch(() => setReady(true));
  }, [navigate]);

  if (!ready) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: CORAL, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const onCta = () => base44.auth.redirectToLogin('/app');

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: BG }}>
      <Navbar onCta={onCta} />
      <Hero onCta={onCta} />
      <Stats />
      <HowItWorks onCta={onCta} />
      <UseCases onCta={onCta} />
      <Testimonials />
      <FinalCta onCta={onCta} />
      <Footer />
    </div>
  );
}