import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check, X, Zap, TrendingUp, Clock, Star, ChevronDown, Play } from 'lucide-react';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const CORAL   = '#F95738';
const DARK    = '#1A1A1A';
const CREAM   = '#F5F0E8';
const BG      = '#1F1F1F';
const BG_DARK = '#111111';
const BG_XDARK= '#0D0D0D';

const FACES = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
];

// ── Live counter hook ─────────────────────────────────────────────────────────
function useLiveCounter(start, end, duration = 2000) {
  const [count, setCount] = useState(start);
  const ref = useRef(false);
  const startAnim = () => {
    if (ref.current) return;
    ref.current = true;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  return [count, startAnim];
}

// ── Activity notification ─────────────────────────────────────────────────────
const ACTIVITY_ITEMS = [
  { name: 'Marie L.', action: 'vient de créer un calculateur de budget' },
  { name: 'Thomas R.', action: 'a généré 340€ ce matin avec son quiz' },
  { name: 'Sophie M.', action: 'publie son premier outil interactif' },
  { name: 'Julien B.', action: 'a 23 nouveaux leads grâce à WOK' },
  { name: 'Camille D.', action: 'vient de dépasser les 1 000€/mois' },
  { name: 'Antoine V.', action: 'crée un simulateur en 28 secondes' },
];

function ActivityToast() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    const show = () => {
      idx.current = (idx.current + 1) % ACTIVITY_ITEMS.length;
      setCurrent(idx.current);
      setVisible(true);
      setTimeout(() => setVisible(false), 3800);
    };
    const t = setInterval(show, 5500);
    setTimeout(show, 2000);
    return () => clearInterval(t);
  }, []);

  const item = ACTIVITY_ITEMS[current];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={current}
          initial={{ opacity: 0, x: -20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -16, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed', bottom: 28, left: 28, zIndex: 200,
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(30,30,30,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            maxWidth: 320,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `rgba(249,87,56,0.15)`, border: `1px solid rgba(249,87,56,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: CORAL }} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{item.name}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0 }}>{item.action}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', padding: '16px 20px' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 960, padding: '10px 20px',
        background: scrolled ? 'rgba(15,15,15,0.98)' : 'rgba(15,15,15,0.7)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 999, transition: 'background 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 32, height: 'auto', objectFit: 'contain', mixBlendMode: 'screen' }} />
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>WOK</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[['Fonctionnalités', '/fonctionnalites'], ['Prix', '/tarifs'], ['Blog', '/blog']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
            >{l}</a>
          ))}
          <button onClick={() => base44.auth.redirectToLogin('/app')}
            style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Se connecter
          </button>
          <motion.button onClick={onCta} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: CORAL, border: 'none', borderRadius: 999, padding: '9px 20px', cursor: 'pointer' }}>
            Commencer →
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

// ── 01 HERO ───────────────────────────────────────────────────────────────────
function TypedWord() {
  const WORDS = ['quiz interactifs', 'simulateurs IA', 'calculateurs', 'apps sur-mesure', 'formations vivantes'];
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[wi];
    const delay = deleting ? 40 : (ci === word.length ? 2000 : 70);
    const t = setTimeout(() => {
      if (!deleting && ci === word.length) { setDeleting(true); return; }
      if (deleting && ci === 0) { setDeleting(false); setWi(p => (p + 1) % WORDS.length); return; }
      setCi(p => deleting ? p - 1 : p + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [ci, deleting, wi]);

  return (
    <span style={{ color: CORAL }}>
      {WORDS[wi].slice(0, ci)}
      <span style={{
        display: 'inline-block', width: 3, height: '0.85em',
        background: CORAL, marginLeft: 2, verticalAlign: 'middle',
        animation: 'blink 1s step-end infinite',
      }} />
    </span>
  );
}

// Parallax grid of floating product mockups
function FloatingCards() {
  const cards = [
    { top: '8%', left: '3%', rotate: -8, delay: 0, label: '📊 Simulateur budget', val: '+340€/j' },
    { top: '30%', left: '0%', rotate: -5, delay: 0.15, label: '🎯 Quiz diagnostic', val: '47 leads' },
    { top: '60%', left: '2%', rotate: -10, delay: 0.3, label: '⚡ App IA', val: '28 sec' },
    { top: '12%', right: '3%', rotate: 7, delay: 0.1, label: '🛍️ Formation live', val: '×3 ventes' },
    { top: '38%', right: '0%', rotate: 5, delay: 0.25, label: '📈 Dashboard pro', val: '68% rétention' },
    { top: '64%', right: '2%', rotate: 9, delay: 0.4, label: '🤖 Assistant IA', val: '4.9★' },
  ];

  return (
    <>
      {cards.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + c.delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            top: c.top, left: c.left, right: c.right,
            transform: `rotate(${c.rotate}deg)`,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '10px 14px',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            minWidth: 140,
            zIndex: 1,
          }}
        >
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>{c.val}</p>
          </motion.div>
        </motion.div>
      ))}
    </>
  );
}

function Hero({ onCta }) {
  const [liveCount, startCount] = useLiveCounter(2250, 2441, 2500);
  useEffect(() => { setTimeout(startCount, 1200); }, []);

  return (
    <section style={{
      minHeight: '100vh', background: BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* Background gradient */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 500,
        background: `radial-gradient(ellipse at center, rgba(249,87,56,0.14) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      {/* Floating product cards (desktop only feel) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <FloatingCards />
      </div>

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 800, margin: '0 auto', zIndex: 2 }}>

        {/* Live social proof pill with counter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999, padding: '8px 16px', marginBottom: 40,
          }}
        >
          {/* Live dot */}
          <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              display: 'block', width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
              boxShadow: '0 0 0 0 rgba(74,222,128,0.5)',
              animation: 'pulse-green 2s infinite',
            }} />
            <style>{`@keyframes pulse-green{0%{box-shadow:0 0 0 0 rgba(74,222,128,0.4)}70%{box-shadow:0 0 0 6px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}`}</style>
          </span>
          <div style={{ display: 'flex' }}>
            {FACES.map((src, i) => (
              <img key={i} src={src} alt="" style={{
                width: 22, height: 22, borderRadius: '50%', objectFit: 'cover',
                border: '2px solid #1F1F1F', marginLeft: i > 0 ? -7 : 0,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(s => <Star key={s} style={{ width: 10, height: 10, fill: CORAL, color: CORAL }} />)}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            <strong style={{ color: '#fff' }}>{liveCount.toLocaleString()} créateurs</strong> ont déjà switché
          </span>
        </motion.div>

        {/* Headline with typewriter */}
        <div style={{ overflow: 'hidden', marginBottom: 12 }}>
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.8rem, 7.5vw, 7rem)',
              fontWeight: 900, lineHeight: 0.93,
              letterSpacing: '-0.04em', color: '#fff', margin: 0,
            }}
          >
            Vos experts méritent
          </motion.h1>
        </div>
        <div style={{ marginBottom: 10 }}>
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.8rem, 7.5vw, 7rem)',
              fontWeight: 900, lineHeight: 0.93,
              letterSpacing: '-0.04em', margin: '0 0 12px',
              minHeight: '1.2em',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <TypedWord />
          </motion.h1>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: 36 }}>
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.8rem, 7.5vw, 7rem)',
              fontWeight: 900, lineHeight: 0.93,
              letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.18)', margin: 0,
            }}
          >
            qui vendent.
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            fontSize: 'clamp(15px, 2.2vw, 18px)',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.7, maxWidth: 540, margin: '0 auto 48px',
          }}
        >
          WOK génère en 30 secondes des outils interactifs bluffants — calculateurs, quiz, apps IA — qui convertissent vos leads et multiplient vos revenus.
          <br /><strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Zéro code. Zéro Canva. Résultat immédiat.</strong>
        </motion.p>

        {/* CTA block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
        >
          <motion.button onClick={onCta}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '18px 48px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: CORAL, color: '#fff',
              fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
              boxShadow: '0 0 0 0 rgba(249,87,56,0.5)',
              animation: 'cta-pulse 3s ease-in-out infinite',
            }}>
            Créer mon premier outil — gratuitement <ArrowRight style={{ width: 18, height: 18 }} />
          </motion.button>
          <style>{`@keyframes cta-pulse{0%,100%{box-shadow:0 20px 60px rgba(249,87,56,0.4)}50%{box-shadow:0 24px 80px rgba(249,87,56,0.6)}}`}</style>

          {/* Trust strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Sans carte bancaire', 'Sans code', 'Résultat en 30s'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Check style={{ width: 13, height: 13, color: '#4ade80', strokeWidth: 2.5 }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      >
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12))' }} />
        <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', margin: 0 }}>Découvrir</p>
      </motion.div>
    </section>
  );
}

// ── 02 PROOF BAR — logos partenaires / stats animées ─────────────────────────
function ProofBar() {
  const stats = [
    { n: 2441, suffix: '+', label: 'créateurs actifs', decimals: 0 },
    { n: 340, suffix: '€', label: 'revenus moyens/jour', decimals: 0 },
    { n: 12, suffix: '%', label: 'taux de conversion moyen', decimals: 0 },
    { n: 28, suffix: 's', label: 'pour créer un outil', decimals: 0 },
  ];
  const [started, setStarted] = useState(false);
  const [counts, setCounts] = useState(stats.map(s => 0));
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        stats.forEach((s, i) => {
          const start = Date.now();
          const tick = () => {
            const p = Math.min((Date.now() - start) / 1800, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCounts(prev => { const n = [...prev]; n[i] = Math.round(s.n * eased); return n; });
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  return (
    <section ref={ref} style={{ background: BG_DARK, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '60px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, textAlign: 'center' }}>
        {stats.map((s, i) => (
          <div key={i}>
            <p style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 8px' }}>
              {counts[i].toLocaleString()}{s.suffix}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── 03 LA DOULEUR — avec intensité croissante ─────────────────────────────────
const PAINS = [
  { emoji: '😩', intensity: 1, title: 'Des heures perdues pour un résultat décevant', desc: '20h sur Canva pour un PDF que personne ne lit. Des templates tous pareils qui ne vous ressemblent pas. À la fin, vos clients ne ressentent pas la valeur.' },
  { emoji: '🤯', intensity: 2, title: 'Une pile technique ingérable', desc: 'Notion + Gumroad + Teachable + Zapier... Chaque outil coûte, chaque outil demande des heures. Et au final, ça ne tient ensemble qu\'avec de la colle et des prières.' },
  { emoji: '😔', intensity: 3, title: 'Des ventes qui n\'arrivent jamais', desc: 'Vous avez créé quelque chose avec cœur. Mais l\'expérience est froide, générique. Vos prospects ne ressentent rien — donc ils n\'achètent pas.' },
  { emoji: '⏱️', intensity: 4, title: 'Vos concurrents vous dépassent avec l\'IA', desc: 'Pendant que vous bidouillez des PDFs, ils proposent des expériences interactives bluffantes. L\'écart se creuse chaque semaine.' },
];

function PainScene() {
  return (
    <section style={{ background: BG, padding: '110px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 20 }}>
            Le problème
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Pourquoi 9 créateurs sur 10<br />
            <span style={{ color: '#ef4444' }}>n'atteignent jamais leur 1er euro.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', maxWidth: 480, margin: '0 auto' }}>
            Ce n'est pas votre expertise qui est en cause. C'est l'expérience que vous proposez.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PAINS.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.65 }}
              whileHover={{ x: 6 }}
              style={{
                display: 'flex', gap: 24, alignItems: 'flex-start',
                padding: '28px 32px',
                background: `rgba(239,68,68,${0.02 + p.intensity * 0.015})`,
                border: `1px solid rgba(239,68,68,${0.05 + p.intensity * 0.04})`,
                borderLeft: `3px solid rgba(239,68,68,${0.2 + p.intensity * 0.1})`,
                borderRadius: 16,
                cursor: 'default',
                transition: 'all 200ms ease',
              }}
            >
              <div style={{ fontSize: 36, flexShrink: 0, lineHeight: 1 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{p.title}</h3>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {Array(p.intensity).fill(0).map((_, j) => (
                      <div key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: `rgba(239,68,68,${0.4 + j * 0.15})` }} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Emotional bridge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: 48, textAlign: 'center',
            padding: '32px', background: 'rgba(249,87,56,0.05)',
            border: '1px solid rgba(249,87,56,0.15)',
            borderRadius: 20,
          }}
        >
          <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
            Vous méritez mieux que ça.
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Et il existe une solution simple, immédiate, qui change tout.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ── 04 LA SOLUTION — Before/After animé ──────────────────────────────────────
function BeforeAfterCard({ before, after, desc, delay = 0 }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.65 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(249,87,56,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 18,
        cursor: 'default',
        transition: 'border-color 250ms, background 250ms',
      }}
    >
      <AnimatePresence mode="wait">
        {!hovered ? (
          <motion.div key="before" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(239,68,68,0.5)', margin: '0 0 12px' }}>Avant</p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>{before}</p>
          </motion.div>
        ) : (
          <motion.div key="after" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: CORAL, margin: '0 0 12px' }}>Avec WOK ✨</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.5 }}>{after}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.65 }}>{desc}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
        {!hovered ? 'Survolez pour voir la différence →' : ''}
      </div>
    </motion.div>
  );
}

function SolutionScene({ onCta }) {
  const BEFORES = [
    { before: '📄 Un PDF ou une vidéo statique que personne ne regarde', after: '⚡ Un outil interactif qui engage et qui reste', desc: 'Calculateur, quiz, simulateur, dashboard — vos clients l'utilisent encore et encore, et le partagent.' },
    { before: '😤 2 à 4 semaines de galère pour un résultat moyen', after: '🚀 Un résultat pro en 30 secondes chrono', desc: 'Décrivez ce que vous voulez en français. L'IA génère. Vous affinez. Vous publiez.' },
    { before: '🔗 5 outils à connecter, 5 abonnements à payer', after: '✅ Tout-en-un : création, publication, analytics', desc: 'Pas de Zapier, pas de dev, pas de migraine. Un outil. Un lien. Prêt à vendre.' },
  ];

  return (
    <section style={{ background: BG_DARK, padding: '110px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 80 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(249,87,56,0.5)', marginBottom: 20 }}>
            La solution
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 20px' }}>
            Arrêtez de vendre des fichiers.<br />
            <span style={{ color: CORAL }}>Vendez des expériences.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', maxWidth: 520, margin: '0 auto 16px' }}>
            WOK utilise l'IA de pointe pour transformer votre expertise en outils interactifs professionnels.
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', margin: 0 }}>Survolez chaque carte pour voir la transformation →</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 72 }}>
          {BEFORES.map((b, i) => <BeforeAfterCard key={i} {...b} delay={i * 0.1} />)}
        </div>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 64 }}>
          {[
            { icon: '🎯', title: 'Quiz & diagnostics', desc: 'Qualifiez vos leads automatiquement. Chaque résultat personnalisé mène à votre offre.' },
            { icon: '📊', title: 'Calculateurs interactifs', desc: 'Montrez la valeur que vous apportez avec des chiffres. Vos prospects se convainquent eux-mêmes.' },
            { icon: '🤖', title: 'Apps IA intégrées', desc: 'Propulsez vos outils avec GPT-4o. Vos clients ont l'impression d'un service premium.' },
            { icon: '🛍️', title: 'Formations dynamiques', desc: 'Des parcours qui s'adaptent à chaque élève. La rétention explose, les avis aussi.' },
            { icon: '⚡', title: 'Généré en 30 secondes', desc: 'Décrivez en français. WOK code. Vous validez. Personne ne sait que vous n\'avez pas de dev.' },
            { icon: '🌐', title: 'Publié & partageable', desc: 'Un lien propre. Pas de compte requis pour vos clients. Juste le WOW effect.' },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4, borderColor: 'rgba(249,87,56,0.3)' }}
              style={{
                padding: '24px 20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                cursor: 'default',
                transition: 'all 200ms ease',
              }}
            >
              <p style={{ fontSize: 26, margin: '0 0 12px' }}>{f.icon}</p>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <motion.button onClick={onCta} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '16px 48px', borderRadius: 12, border: 'none', cursor: 'pointer', background: CORAL, color: '#fff', fontSize: 15, fontWeight: 800, boxShadow: '0 16px 48px rgba(249,87,56,0.4)' }}>
            Essayer WOK maintenant — c'est gratuit
          </motion.button>
        </div>
      </div>
    </section>
  );
}

// ── 05 MARCHÉ / CHIFFRES ──────────────────────────────────────────────────────
const MARKET_STATS = [
  { n: '856 Mds€', label: 'Marché des produits digitaux', sub: 'd\'ici 2027 — +23% par an', icon: TrendingUp },
  { n: '2.4×', label: 'Plus de revenus', sub: 'outil interactif vs PDF statique', icon: Zap },
  { n: '68%', label: 'Des acheteurs reviennent', sub: 'quand le produit offre une vraie expérience', icon: Check },
];

function MarketScene() {
  return (
    <section style={{ background: BG, padding: '110px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 20 }}>Pourquoi maintenant</p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>
            Le marché explose.<br /><span style={{ color: CORAL }}>Votre fenêtre se ferme.</span>
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {MARKET_STATS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '40px 32px' }}
            >
              <s.icon style={{ width: 22, height: 22, color: CORAL, marginBottom: 20 }} />
              <p style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 12px' }}>{s.n}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', lineHeight: 1.6, margin: 0 }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 06 COMPARATIF ─────────────────────────────────────────────────────────────
const COMPARISONS = [
  { label: 'Temps pour créer', before: '2 à 4 semaines', after: '30 secondes' },
  { label: 'Compétences', before: 'Design + No-code + Dev', after: 'Zéro — juste votre idée' },
  { label: 'Résultat final', before: 'PDF ou vidéo statique', after: 'App interactive & belle' },
  { label: 'Réaction client', before: '"Intéressant..."', after: '"WOW, comment t\'as fait ?!"' },
  { label: 'Taux de conversion', before: '1 à 3%', after: 'Jusqu\'à 12% (moyenne WOK)' },
  { label: 'Partage spontané', before: 'Rare', after: 'Fréquent — trop bon pour garder' },
];

function CompareScene() {
  return (
    <section style={{ background: BG_DARK, padding: '110px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            La différence que vous<br /><span style={{ color: CORAL }}>allez ressentir.</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 10, padding: '0 4px' }}>
          <div />
          <div style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(239,68,68,0.07)', borderRadius: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avant WOK 😔</p>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(249,87,56,0.1)', border: '1px solid rgba(249,87,56,0.2)', borderRadius: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: CORAL, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avec WOK ✨</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMPARISONS.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'center' }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: 0, padding: '0 8px' }}>{c.label}</p>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', margin: 0 }}>{c.before}</p>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(249,87,56,0.08)', border: '1px solid rgba(249,87,56,0.15)', borderRadius: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>{c.after}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 07 TÉMOIGNAGES — Masonry feel ─────────────────────────────────────────────
const TESTIMONIALS = [
  { avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', name: 'Camille R.', role: 'Coach développement personnel', quote: 'J\'ai créé un calculateur de bilan en 2 minutes. Mes clients en sont fous. Mes ventes ont doublé en 3 semaines.', metric: '+124% revenus', stars: 5 },
  { avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face', name: 'Thomas M.', role: 'Formateur en finance', quote: 'Mon simulateur d\'épargne WOK est devenu mon meilleur outil de vente. Les gens le partagent — c\'est du marketing gratuit.', metric: '+47 leads/sem', stars: 5 },
  { avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face', name: 'Sophie L.', role: 'Consultante en marketing', quote: 'Avant, des semaines pour créer une ressource. Maintenant, en 30s j\'ai quelque chose de plus beau que tout ce que je faisais.', metric: '28 sec / outil', stars: 5 },
  { avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face', name: 'Marc D.', role: 'Entrepreneur en ligne', quote: '"C\'est quoi cet outil ?" me demandent mes clients. Je réponds : WOK. Et ils s\'inscrivent aussitôt.', metric: '×3 conversions', stars: 5 },
  { avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face', name: 'Laura B.', role: 'Créatrice de contenu', quote: 'J\'ai arrêté Notion, Canva et Teachable. WOK fait tout ça, 100 fois plus beau, en une fraction du temps.', metric: '-3 abonnements', stars: 5 },
  { avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', name: 'Kevin A.', role: 'Coach sportif en ligne', quote: 'Mon programme interactif génère 3× plus de ventes qu\'avant. L\'effet WOW, c\'est réel.', metric: '12% conversion', stars: 5 },
];

function TestimonialsScene() {
  return (
    <section style={{ background: BG_XDARK, padding: '110px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>
            Ce qu'ils en disent
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>
            Rejoignez ceux qui ont déjà<br /><span style={{ color: CORAL }}>transformé leur façon de vendre.</span>
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              style={{
                padding: '28px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20,
                position: 'relative', overflow: 'hidden',
                transition: 'all 200ms ease',
              }}
            >
              {/* Metric badge */}
              <div style={{
                position: 'absolute', top: 20, right: 20,
                background: 'rgba(249,87,56,0.12)', border: '1px solid rgba(249,87,56,0.2)',
                borderRadius: 8, padding: '4px 10px',
              }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: CORAL, margin: 0 }}>{t.metric}</p>
              </div>
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {Array(t.stars).fill(0).map((_, s) => <Star key={s} style={{ width: 12, height: 12, fill: CORAL, color: CORAL }} />)}
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: '0 0 24px', fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={t.avatar} alt={t.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
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

// ── 08 CTA FINAL — avec urgence ───────────────────────────────────────────────
function FinalCta({ onCta }) {
  const [spotsLeft] = useState(Math.floor(Math.random() * 40) + 60);

  return (
    <section style={{ background: BG, padding: '140px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* BG glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 70%, rgba(249,87,56,0.12) 0%, transparent 60%)`, pointerEvents: 'none' }} />
      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Urgency pill */}
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(249,87,56,0.1)', border: '1px solid rgba(249,87,56,0.3)',
              borderRadius: 999, padding: '8px 18px', marginBottom: 36,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL, animation: 'pulse-green 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
              Offre gratuite · Places limitées — <strong style={{ color: CORAL }}>{spotsLeft} restantes</strong>
            </span>
          </motion.div>

          <h2 style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 0.93, margin: '0 0 24px' }}>
            Votre expertise<br /><span style={{ color: CORAL }}>mérite mieux.</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.38)', marginBottom: 52, lineHeight: 1.65 }}>
            Arrêtez de perdre du temps sur des outils qui ne vous ressemblent pas.<br />
            Créez quelque chose dont vous êtes fier — en 30 secondes.
          </p>

          <motion.button onClick={onCta}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto 32px',
              padding: '22px 56px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: CORAL, color: '#fff',
              fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em',
              boxShadow: '0 24px 72px rgba(249,87,56,0.5)',
            }}>
            Créer mon premier outil — gratuitement <ArrowRight style={{ width: 20, height: 20 }} />
          </motion.button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {FACES.slice(0, 4).map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1F1F1F', marginLeft: i > 0 ? -10 : 0 }} />
              ))}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginLeft: 12, fontWeight: 600 }}>+2 400 créateurs nous font confiance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {['Sans CB', '5 builds offerts', 'Support humain'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Check style={{ width: 12, height: 12, color: '#4ade80', strokeWidth: 2.5 }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: BG_XDARK, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 28, height: 'auto', objectFit: 'contain', mixBlendMode: 'screen' }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>WOK</span>
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[['Fonctionnalités', '/fonctionnalites'], ['Prix', '/tarifs'], ['Blog', '/blog'], ['CGU', '/terms'], ['Confidentialité', '/privacy']].map(([l, h]) => (
          <a key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>{l}</a>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.12)', margin: 0 }}>© 2026 WOK</p>
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
      <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: CORAL, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const onCta = () => base44.auth.redirectToLogin('/app');

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: BG }}>
      <Navbar onCta={onCta} />
      <ActivityToast />
      <Hero onCta={onCta} />
      <ProofBar />
      <PainScene />
      <SolutionScene onCta={onCta} />
      <MarketScene />
      <CompareScene />
      <TestimonialsScene />
      <FinalCta onCta={onCta} />
      <Footer />
    </div>
  );
}
