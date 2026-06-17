import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';

// ── Tokens ──────────────────────────────────────────────────────────────────
const CORAL  = '#F95738';
const BG     = '#0A0A0A';
const S = {
  font: "'Space Grotesk', system-ui, sans-serif",
};

// ── Inject Space Grotesk ──────────────────────────────────────────────────────
function FontLoader() {
  useEffect(() => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(l);
  }, []);
  return null;
}

// ── Magnetic button ───────────────────────────────────────────────────────────
function MagneticButton({ children, onClick, style = {} }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ x: sx, y: sy, ...style }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}

// ── Cursor follower ───────────────────────────────────────────────────────────
function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  useEffect(() => {
    const h = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0,
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,87,56,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        translateX: '-50%', translateY: '-50%',
        x, y,
      }}
    />
  );
}

// ── Noise grain overlay ───────────────────────────────────────────────────────
function Grain() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none', opacity: 0.025,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: '160px 160px',
    }} />
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png"
          alt="WOK" style={{ width: 28, mixBlendMode: 'screen' }} />
        <span style={{ fontFamily: S.font, fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>WOK</span>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs'], ['Blog', '/blog']].map(([l, h]) => (
          <a key={l} href={h} style={{ fontFamily: S.font, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >{l}</a>
        ))}
        <button onClick={() => base44.auth.redirectToLogin('/app')} style={{ fontFamily: S.font, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
          Sign in
        </button>
        <MagneticButton onClick={onCta} style={{
          fontFamily: S.font, fontSize: 13, fontWeight: 700, color: '#fff',
          background: CORAL, border: 'none', borderRadius: 100,
          padding: '10px 22px', cursor: 'pointer',
        }}>
          Get started
        </MagneticButton>
      </nav>
    </motion.header>
  );
}

// ── Interface preview card ────────────────────────────────────────────────────
function InterfaceCard({ url, label, delay = 0, rotation = 0, scale = 1 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotation }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ rotate: 0, scale: 1.04, zIndex: 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', cursor: 'pointer',
        borderRadius: 16,
        border: `1px solid ${hovered ? 'rgba(249,87,56,0.4)' : 'rgba(255,255,255,0.08)'}`,
        overflow: 'hidden',
        boxShadow: hovered ? '0 32px 80px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,0,0,0.4)',
        transition: 'border-color 300ms, box-shadow 300ms',
        scale,
      }}
      onClick={() => window.open(url, '_blank')}
    >
      <iframe
        src={url}
        title={label}
        style={{ width: 520, height: 360, border: 'none', display: 'block', pointerEvents: hovered ? 'none' : 'none', transform: 'scale(0.75)', transformOrigin: '0 0', width: '133%', height: '133%' }}
        loading="lazy"
      />
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)',
              display: 'flex', alignItems: 'flex-end', padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p style={{ fontFamily: S.font, fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{label}</p>
              <ArrowUpRight style={{ width: 16, height: 16, color: CORAL }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Word reveal animation ─────────────────────────────────────────────────────
function WordReveal({ text, style = {}, delay = 0 }) {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline', ...style }}>
      {words.map((w, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <motion.span
            display="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: delay + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ── 01 HERO ───────────────────────────────────────────────────────────────────
function Hero({ onCta }) {
  return (
    <section style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 40px 80px', position: 'relative', overflow: 'hidden' }}>

      {/* Background landscape image */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `url("https://media.base44.com/images/public/6a2edc91082e534601118582/ae0bcf9a2_x1.jpg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'high-quality',
        transform: 'scale(1)',
      }} />
      {/* Bottom fade to BG */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: `linear-gradient(to bottom, transparent, ${BG})`, zIndex: 1, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 48 }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
          <span style={{ fontFamily: S.font, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
            300 creators already building — join them
          </span>
        </motion.div>

        {/* Headline */}
        <h1 style={{ fontFamily: S.font, fontSize: 'clamp(3.5rem, 8vw, 7.5rem)', fontWeight: 700, lineHeight: 0.92, letterSpacing: '-0.04em', color: '#fff', margin: '0 0 32px' }}>
          <div style={{ overflow: 'hidden' }}>
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'block' }}
            >
              Sell smarter.
            </motion.span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'block', color: 'rgba(255,255,255,0.2)' }}
            >
              Win faster.
            </motion.span>
          </div>
        </h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          style={{ fontFamily: S.font, fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 52px', fontWeight: 400 }}
        >
          Build AI-powered interactive interfaces — calculators, quizzes, tools — that make your clients say <em style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'normal' }}>"wow"</em> and buy on the spot. No code. 30 seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}
        >
          <MagneticButton onClick={onCta} style={{
            fontFamily: S.font, display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px 36px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: CORAL, color: '#fff', fontSize: 15, fontWeight: 700,
          }}>
            Start building free <ArrowRight style={{ width: 17, height: 17 }} />
          </MagneticButton>
          <button onClick={() => document.getElementById('interfaces')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ fontFamily: S.font, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.4)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 28px', cursor: 'pointer', transition: 'all 200ms', letterSpacing: '-0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            See live examples
          </button>
        </motion.div>
      </div>

      {/* Hero screenshot image — 50% screen width */}
      <motion.div
        id="interfaces"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative', zIndex: 2,
          marginTop: 72,
          width: '50vw', maxWidth: 800, minWidth: 320,
        }}
      >
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>
          <img
            src="https://media.base44.com/images/public/6a2edc91082e534601118582/32e59afe8_image.png"
            alt="WOK interface preview"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          {/* Bottom blur fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
            background: `linear-gradient(to bottom, transparent, ${BG})`,
            pointerEvents: 'none',
          }} />
        </div>
      </motion.div>
    </section>
  );
}

// ── 02 BENEFIT STRIP ─────────────────────────────────────────────────────────
function BenefitStrip() {
  const items = [
    { metric: 'More revenue', desc: 'Interactive tools convert 4× better than PDFs' },
    { metric: 'More leads', desc: 'People share tools they love — viral by design' },
    { metric: 'Sell faster', desc: 'Your client says "wow" before you say a word' },
  ];

  return (
    <section style={{ background: '#0E0E0E', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '72px 40px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1 }}>
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '40px 40px',
              borderRight: i < items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <p style={{ fontFamily: S.font, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 10px' }}>
              {item.metric}
            </p>
            <p style={{ fontFamily: S.font, fontSize: 14, color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── 03 INTERFACES SHOWCASE ────────────────────────────────────────────────────
function InterfaceShowcase({ onCta }) {
  const [active, setActive] = useState(0);

  const interfaces = [
    {
      url: 'https://wok-co.base44.app/p/conv_1781371421484',
      tag: 'Financial tool',
      title: 'Give your client a calculator they\'ll open every day.',
      desc: 'Instead of a PDF they\'ll forget, give them something they actually use. Every interaction is a reminder of your expertise.',
    },
    {
      url: 'https://wok-co.base44.app/p/conv_1781438064546',
      tag: 'AI diagnostic',
      title: 'Qualify leads automatically — before you even get on a call.',
      desc: 'Your interface asks the questions. The client gets a personalized result. You get a warm lead who already trusts you.',
    },
  ];

  return (
    <section style={{ background: BG, padding: '120px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ marginBottom: 80 }}>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ fontFamily: S.font, fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 24 }}
          >
            What you build
          </motion.p>
          <h2 style={{ fontFamily: S.font, fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.05, margin: 0 }}>
            <WordReveal text="Not a file." delay={0} />
            {' '}
            <WordReveal text="An experience." style={{ color: 'rgba(255,255,255,0.25)' }} delay={0.1} />
          </h2>
        </div>

        {/* Tab selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {interfaces.map((iface, i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{
                fontFamily: S.font, fontSize: 12, fontWeight: 600,
                padding: '8px 18px', borderRadius: 100, cursor: 'pointer',
                border: '1px solid',
                borderColor: active === i ? CORAL : 'rgba(255,255,255,0.1)',
                background: active === i ? 'rgba(249,87,56,0.12)' : 'transparent',
                color: active === i ? CORAL : 'rgba(255,255,255,0.35)',
                transition: 'all 200ms',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {iface.tag}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 60, alignItems: 'center' }}>

          {/* Text side */}
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: '6px 14px', background: 'rgba(249,87,56,0.08)', border: '1px solid rgba(249,87,56,0.15)', borderRadius: 100 }}>
                <span style={{ fontFamily: S.font, fontSize: 11, fontWeight: 600, color: CORAL, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{interfaces[active].tag}</span>
              </div>
              <h3 style={{ fontFamily: S.font, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, margin: '0 0 20px' }}>
                {interfaces[active].title}
              </h3>
              <p style={{ fontFamily: S.font, fontSize: 15, color: 'rgba(255,255,255,0.35)', lineHeight: 1.75, margin: '0 0 40px' }}>
                {interfaces[active].desc}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
                {['Built in under 30 seconds', 'Shared with a single link', 'No account needed for your client'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(249,87,56,0.15)', border: '1px solid rgba(249,87,56,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check style={{ width: 9, height: 9, color: CORAL, strokeWidth: 3 }} />
                    </div>
                    <span style={{ fontFamily: S.font, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{t}</span>
                  </div>
                ))}
              </div>
              <a href={interfaces[active].url} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: S.font, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2, transition: 'border-color 200ms' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = CORAL}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              >
                Open live interface <ArrowUpRight style={{ width: 14, height: 14 }} />
              </a>
            </motion.div>
          </AnimatePresence>

          {/* Interface preview */}
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
              onClick={() => window.open(interfaces[active].url, '_blank')}
              whileHover={{ borderColor: 'rgba(249,87,56,0.3)' }}
            >
              <iframe
                src={interfaces[active].url}
                title={interfaces[active].tag}
                style={{ width: '133%', height: '133%', border: 'none', display: 'block', transform: 'scale(0.75)', transformOrigin: '0 0', minHeight: 500 }}
                loading="lazy"
              />
              <div style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, transparent, rgba(10,10,10,0.8))' }} />
              <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.7)', borderRadius: 100, padding: '5px 12px', backdropFilter: 'blur(8px)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontFamily: S.font, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>LIVE</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ── 04 HOW IT WORKS — process steps ─────────────────────────────────────────
function HowItWorks({ onCta }) {
  const steps = [
    { n: '01', title: 'Describe your tool', body: 'Type what you want in plain English. "A mortgage calculator for my real estate clients." That\'s it.' },
    { n: '02', title: 'WOK builds it instantly', body: 'AI generates a fully working, beautiful interface in under 30 seconds. No templates. No drag-and-drop.' },
    { n: '03', title: 'Share. Convert. Win.', body: 'One link. Your client opens it, gets value, remembers you. Revenue follows.' },
  ];

  return (
    <section style={{ background: '#0E0E0E', padding: '120px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 80 }}>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ fontFamily: S.font, fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 24 }}>
            How it works
          </motion.p>
          <h2 style={{ fontFamily: S.font, fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0, maxWidth: 600 }}>
            From idea to<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>live interface in 30 seconds.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, position: 'relative' }}>
          {/* Connecting line */}
          <div style={{ position: 'absolute', top: 28, left: '16%', right: '16%', height: 1, background: 'linear-gradient(to right, rgba(249,87,56,0.3), rgba(249,87,56,0.1), rgba(249,87,56,0.3))', zIndex: 0 }} />

          {steps.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              style={{ padding: '0 32px 0 0', position: 'relative', zIndex: 1 }}
            >
              {/* Step number */}
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: BG,
                border: `1px solid rgba(255,255,255,0.1)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 32,
              }}>
                <span style={{ fontFamily: S.font, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.01em' }}>{s.n}</span>
              </div>
              <h3 style={{ fontFamily: S.font, fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 12px' }}>{s.title}</h3>
              <p style={{ fontFamily: S.font, fontSize: 14, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, margin: 0 }}>{s.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: 80, display: 'flex', justifyContent: 'center' }}
        >
          <MagneticButton onClick={onCta} style={{
            fontFamily: S.font, display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px 40px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: CORAL, color: '#fff', fontSize: 15, fontWeight: 700,
          }}>
            Try it free — no card needed <ArrowRight style={{ width: 17, height: 17 }} />
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

// ── 05 TESTIMONIALS — ultra minimal ──────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Camille R.', role: 'Personal development coach', quote: 'My clients share the tool themselves. I haven\'t done any marketing in 3 weeks and my leads doubled.', metric: '×2 leads' },
  { name: 'Thomas M.', role: 'Finance educator', quote: 'I sent a savings simulator instead of a brochure. The client signed within the hour.', metric: 'Signed same day' },
  { name: 'Sophie L.', role: 'Marketing consultant', quote: 'I stopped using Canva, Notion, and Teachable. WOK replaced all three.', metric: '3 tools → 1' },
  { name: 'Kevin A.', role: 'Online fitness coach', quote: 'First sale came from someone who found my tool shared in a Facebook group. I didn\'t even know.', metric: 'Organic reach' },
];

function TestimonialsScene() {
  return (
    <section style={{ background: BG, padding: '120px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 72 }}>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ fontFamily: S.font, fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 24 }}>
            Creators
          </motion.p>
          <h2 style={{ fontFamily: S.font, fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            300 builders.<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>Real results.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 1 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                padding: '40px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                borderLeft: i % 2 === 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <p style={{ fontFamily: S.font, fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>{t.name}</p>
                  <p style={{ fontFamily: S.font, fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>{t.role}</p>
                </div>
                <div style={{ padding: '4px 10px', background: 'rgba(249,87,56,0.08)', border: '1px solid rgba(249,87,56,0.15)', borderRadius: 6 }}>
                  <p style={{ fontFamily: S.font, fontSize: 11, fontWeight: 700, color: CORAL, margin: 0 }}>{t.metric}</p>
                </div>
              </div>
              <p style={{ fontFamily: S.font, fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>"{t.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 06 FINAL CTA ──────────────────────────────────────────────────────────────
function FinalCta({ onCta }) {
  return (
    <section style={{ background: '#0E0E0E', padding: '160px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 style={{ fontFamily: S.font, fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 0.92, margin: '0 0 28px' }}>
            Your expertise<br />
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>deserves better.</span>
          </h2>
          <p style={{ fontFamily: S.font, fontSize: 17, color: 'rgba(255,255,255,0.3)', marginBottom: 52, lineHeight: 1.65, maxWidth: 460, margin: '0 auto 52px' }}>
            Stop selling files. Start delivering experiences that make people talk.
          </p>

          <MagneticButton onClick={onCta} style={{
            fontFamily: S.font, display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '20px 52px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: CORAL, color: '#fff', fontSize: 17, fontWeight: 700,
            letterSpacing: '-0.01em',
          }}>
            Build your first interface free <ArrowRight style={{ width: 20, height: 20 }} />
          </MagneticButton>

          <p style={{ fontFamily: S.font, fontSize: 12, color: 'rgba(255,255,255,0.18)', marginTop: 24 }}>
            No credit card · No code · Works in 30 seconds
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: BG, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 24, mixBlendMode: 'screen' }} />
        <span style={{ fontFamily: S.font, fontSize: 13, fontWeight: 700, color: '#fff' }}>WOK</span>
      </div>
      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
        {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs'], ['Blog', '/blog'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
          <a key={l} href={h} style={{ fontFamily: S.font, fontSize: 12, color: 'rgba(255,255,255,0.18)', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}>{l}</a>
        ))}
      </div>
      <p style={{ fontFamily: S.font, fontSize: 11, color: 'rgba(255,255,255,0.12)', margin: 0 }}>© 2026 WOK</p>
    </footer>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
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
      <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.06)', borderTopColor: CORAL, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const onCta = () => base44.auth.redirectToLogin('/app');

  return (
    <div style={{ background: BG }}>
      <FontLoader />
      <Grain />
      <CursorGlow />
      <Navbar onCta={onCta} />
      <Hero onCta={onCta} />
      <BenefitStrip />
      <InterfaceShowcase onCta={onCta} />
      <HowItWorks onCta={onCta} />
      <TestimonialsScene />
      <FinalCta onCta={onCta} />
      <Footer />
    </div>
  );
}