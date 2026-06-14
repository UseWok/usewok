import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check, X, Zap, TrendingUp, Clock, Frown, Star } from 'lucide-react';

// ── Brand tokens ──
const CORAL = '#F95738';
const DARK = '#1A1A1A';
const CREAM = '#F5F0E8';
const BG = '#1F1F1F';

const FACES = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
];

// ── Scroll-to section ──
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ── Navbar ──────────────────────────────────────────────────────────────────
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
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'center', padding: '16px 20px',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 960, padding: '10px 20px',
        background: scrolled ? 'rgba(20,20,20,0.95)' : 'rgba(20,20,20,0.7)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 999,
        transition: 'background 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 32, height: 'auto', objectFit: 'contain', mixBlendMode: 'screen' }} />
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>WOK</span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[['Fonctionnalités', '/fonctionnalites'], ['Prix', '/tarifs'], ['Blog', '/blog']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              className="hidden md:block"
            >{l}</a>
          ))}
          <button onClick={() => base44.auth.redirectToLogin('/app')}
            style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Se connecter
          </button>
          <motion.button onClick={onCta} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ fontSize: 13, fontWeight: 700, color: '#000', background: CORAL, border: 'none', borderRadius: 999, padding: '9px 20px', cursor: 'pointer' }}>
            Commencer →
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

// ── 01 HERO ──────────────────────────────────────────────────────────────────
function Hero({ onCta }) {
  return (
    <section style={{
      minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: `radial-gradient(ellipse at center, rgba(249,87,56,0.18) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>

        {/* Social proof pill — herd effect */}
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {FACES.map((src, i) => (
              <img key={i} src={src} alt="" style={{
                width: 24, height: 24, borderRadius: '50%', objectFit: 'cover',
                border: '2px solid #1F1F1F',
                marginLeft: i > 0 ? -8 : 0,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[1,2,3,4,5].map(s => <Star key={s} style={{ width: 11, height: 11, fill: '#F95738', color: '#F95738' }} />)}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            <strong style={{ color: '#fff' }}>+2 400 créateurs</strong> ont déjà switché
          </span>
        </motion.div>

        {/* Main headline */}
        <div style={{ overflow: 'hidden', marginBottom: 8 }}>
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(3.2rem, 8vw, 7.5rem)',
              fontWeight: 900, lineHeight: 0.92,
              letterSpacing: '-0.035em', color: '#fff',
              margin: 0,
            }}
          >
            Vos produits méritent
          </motion.h1>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: 32 }}>
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(3.2rem, 8vw, 7.5rem)',
              fontWeight: 900, lineHeight: 0.92,
              letterSpacing: '-0.035em', color: CORAL,
              margin: 0,
            }}
          >
            l'effet WOW.
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.65, maxWidth: 580, margin: '0 auto 48px',
            fontWeight: 400,
          }}
        >
          Créez des outils interactifs, des apps et des formations qui captivent — et qui vendent — en quelques secondes grâce à l'IA.
          <br /><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Fini Canva, Notion, et les bidouillages sans fin.</strong>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        >
          <motion.button onClick={onCta} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '18px 44px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: CORAL, color: '#fff',
              fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
              boxShadow: '0 20px 60px rgba(249,87,56,0.45)',
            }}>
            Créer mon premier outil — gratuitement <ArrowRight style={{ width: 18, height: 18 }} />
          </motion.button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
            Sans carte bancaire · Sans code · Résultat en 30 secondes
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      >
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15))' }} />
        <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>Découvrir</p>
      </motion.div>
    </section>
  );
}

// ── 02 MARCHÉ EN CROISSANCE — Logos ─────────────────────────────────────────
const MARKET_STATS = [
  { n: '856 Mds€', label: 'Marché mondial des produits digitaux', sub: 'd\'ici 2027 — +23% par an', icon: TrendingUp },
  { n: '2.4×', label: 'Plus de revenus', sub: 'pour un outil interactif vs un PDF statique', icon: Zap },
  { n: '68%', label: 'Des acheteurs reviennent', sub: 'quand le produit offre une vraie expérience', icon: Check },
];

function MarketScene() {
  return (
    <section style={{ background: '#111', padding: '100px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
            Le contexte — pourquoi maintenant
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>
            Le marché des créateurs explose.<br />
            <span style={{ color: CORAL }}>Êtes-vous prêt à en profiter ?</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {MARKET_STATS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '36px 32px',
              }}
            >
              <s.icon style={{ width: 24, height: 24, color: CORAL, marginBottom: 20 }} />
              <p style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 10px' }}>{s.n}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 03 LA DOULEUR — Pathos ───────────────────────────────────────────────────
const PAINS = [
  {
    emoji: '😩',
    title: 'Des heures perdues pour un résultat décevant',
    desc: '20h sur Canva pour un PDF que personne ne lit. Des templates tous pareils qui ne vous ressemblent pas. Et à la fin, vos clients ne comprennent pas la valeur de ce que vous leur offrez.',
  },
  {
    emoji: '🤯',
    title: 'Une complexité technique qui paralyse',
    desc: 'Notion, Gumroad, Teachable, Zapier... Chaque outil demande des heures d\'apprentissage, des abonnements qui s\'accumulent, et au final une pile technique impossible à maintenir.',
  },
  {
    emoji: '😔',
    title: 'Des ventes qui ne décollent jamais',
    desc: 'Vous avez créé votre produit avec amour. Mais l\'expérience proposée est froide, générique. Vos clients potentiels ne ressentent rien — donc ils n\'achètent pas.',
  },
  {
    emoji: '⏱️',
    title: 'Pas à la page des nouvelles IA',
    desc: 'L\'IA transforme tout. Vos concurrents proposent des expériences interactives bluffantes. Vous, vous êtes encore en train de faire des glisser-déposer sur des outils qui datent de 2018.',
  },
];

function PainScene() {
  return (
    <section style={{ background: BG, padding: '100px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
            Le problème
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Pourquoi 9 créateurs sur 10<br />
            <span style={{ color: '#ef4444' }}>abandonnent avant leur 1er euro.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', maxWidth: 520, margin: '0 auto' }}>
            Ce n'est pas un problème de talent. C'est un problème d'outils.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
          {PAINS.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.7 }}
              style={{
                display: 'flex', gap: 20, alignItems: 'flex-start',
                padding: '28px 28px',
                background: 'rgba(239,68,68,0.04)',
                border: '1px solid rgba(239,68,68,0.12)',
                borderRadius: 16,
              }}
            >
              <span style={{ fontSize: 32, flexShrink: 0 }}>{p.emoji}</span>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 04 LA SOLUTION — Ethos ───────────────────────────────────────────────────
const SOLUTIONS = [
  {
    before: '📄 Un PDF ou une vidéo statique',
    after: '⚡ Un outil interactif qui engage',
    desc: 'Calculateur, quiz, simulateur, dashboard personnalisé — WOK génère des expériences que vos clients vont utiliser encore et encore.',
  },
  {
    before: '😤 Des heures à bidouiller Canva',
    after: '🚀 Un résultat pro en 30 secondes',
    desc: 'Décrivez ce que vous voulez en français, l\'IA crée l\'interface. Vous affinez. Vous publiez. Vos clients sont impressionnés.',
  },
  {
    before: '🔗 5 outils différents à connecter',
    after: '✅ Tout en un seul endroit',
    desc: 'Création, publication, partage, analytics — tout est intégré. Pas besoin de Zapier, pas besoin de développeur, pas besoin de migraine.',
  },
];

function SolutionScene({ onCta }) {
  return (
    <section style={{ background: '#111', padding: '100px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(249,87,56,0.6)', marginBottom: 20 }}>
            La solution WOK
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 20px' }}>
            Arrêtez de vendre des fichiers.<br />
            <span style={{ color: CORAL }}>Vendez des expériences.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', maxWidth: 560, margin: '0 auto' }}>
            WOK utilise l'IA de pointe pour transformer votre expertise en outils interactifs professionnels — sans une seule ligne de code.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 72 }}>
          {SOLUTIONS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr auto',
                alignItems: 'center', gap: 20,
                padding: '24px 32px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
              }}
            >
              {/* Before */}
              <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{s.before}</p>
              </div>
              {/* Arrow */}
              <div style={{ padding: '0 8px', color: CORAL, fontSize: 18, fontWeight: 900 }}>→</div>
              {/* After */}
              <div style={{ padding: '14px 20px', background: 'rgba(249,87,56,0.1)', border: `1px solid rgba(249,87,56,0.25)`, borderRadius: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{s.after}</p>
              </div>
              {/* Description */}
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, margin: 0, maxWidth: 260, display: 'none' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 60 }}>
          {[
            { icon: '🎯', title: 'Calculateurs & Quiz', desc: 'Des outils que vos clients gardent et partagent à leurs amis.' },
            { icon: '📊', title: 'Dashboards personnalisés', desc: 'Transformez vos données en tableaux de bord qui impressionnent.' },
            { icon: '🤖', title: 'Apps IA sur-mesure', desc: 'Des assistants et outils propulsés par les dernières IA pour vos clients.' },
            { icon: '🛍️', title: 'Formations interactives', desc: 'Fini les PDFs ennuyeux. Des parcours qui engagent et qui vendent plus.' },
            { icon: '⚡', title: 'Généré en 30 secondes', desc: 'Décrivez votre idée en français. WOK fait le reste instantanément.' },
            { icon: '🌐', title: 'Publié & partageable', desc: 'Un lien unique, une expérience professionnelle. Prêt à vendre.' },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              style={{
                padding: '28px 24px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                transition: 'border-color 200ms',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,87,56,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <p style={{ fontSize: 28, margin: '0 0 14px' }}>{f.icon}</p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center' }}
        >
          <motion.button onClick={onCta} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '16px 48px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: CORAL, color: '#fff', fontSize: 15, fontWeight: 800,
              boxShadow: '0 16px 48px rgba(249,87,56,0.4)',
            }}>
            Essayer WOK maintenant — c'est gratuit
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ── 05 AVANT / APRÈS — Comparatif ────────────────────────────────────────────
const COMPARISONS = [
  { label: 'Temps pour créer', before: '2 à 4 semaines', after: '30 secondes' },
  { label: 'Compétences requises', before: 'Design + No-code + Dev', after: 'Zéro — juste votre idée' },
  { label: 'Résultat final', before: 'PDF ou vidéo statique', after: 'App interactive & belle' },
  { label: 'Réaction des clients', before: '"Intéressant..."', after: '"WOW, comment t\'as fait ?!"' },
  { label: 'Taux de conversion', before: '1 à 3%', after: 'Jusqu\'à 12% (moyenne utilisateurs WOK)' },
  { label: 'Partage spontané', before: 'Rare', after: 'Fréquent — l\'outil est trop bon pour être gardé' },
];

function CompareScene() {
  return (
    <section style={{ background: BG, padding: '100px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            La différence que vous<br />
            <span style={{ color: CORAL }}>allez ressentir.</span>
          </h2>
        </motion.div>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 8, padding: '0 4px' }}>
          <div />
          <div style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Avant WOK 😔
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(249,87,56,0.1)', border: '1px solid rgba(249,87,56,0.2)', borderRadius: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: CORAL, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Avec WOK ✨
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMPARISONS.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'center' }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: 0, padding: '0 8px' }}>{c.label}</p>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{c.before}</p>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(249,87,56,0.07)', border: '1px solid rgba(249,87,56,0.15)', borderRadius: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{c.after}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 06 TÉMOIGNAGES ───────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    name: 'Camille R.',
    role: 'Coach en développement personnel',
    quote: 'J\'ai créé un calculateur de bilan personnel en 2 minutes. Mes clients en sont fous. Mes ventes ont doublé en 3 semaines.',
    stars: 5,
  },
  {
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    name: 'Thomas M.',
    role: 'Formateur en finance',
    quote: 'Mon simulateur d\'épargne WOK est devenu mon meilleur outil de vente. Les gens le partagent entre eux — c\'est du marketing gratuit.',
    stars: 5,
  },
  {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    name: 'Sophie L.',
    role: 'Consultante en marketing',
    quote: 'Avant, je passais des semaines à créer des ressources. Maintenant, en 30 secondes j\'ai quelque chose de plus beau que tout ce que je faisais.',
    stars: 5,
  },
  {
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face',
    name: 'Marc D.',
    role: 'Entrepreneur en ligne',
    quote: 'Le retour de mes clients est hallucinant. "C\'est quoi cet outil ?" me demandent-ils. Je leur réponds : WOK. Et ils s\'inscrivent aussitôt.',
    stars: 5,
  },
  {
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
    name: 'Laura B.',
    role: 'Créatrice de contenu',
    quote: 'J\'ai arrêté Notion, Canva et Teachable. WOK fait tout ça, mais 100 fois plus beau et en une fraction du temps.',
    stars: 5,
  },
  {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    name: 'Kevin A.',
    role: 'Coach sportif en ligne',
    quote: 'Mon programme d\'entraînement interactif génère 3× plus de ventes qu\'avant. L\'effet WOW, c\'est réel.',
    stars: 5,
  },
];

function TestimonialsScene() {
  return (
    <section style={{ background: '#0D0D0D', padding: '100px 24px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Ce qu'ils en disent
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>
            Rejoignez ceux qui ont déjà<br />
            <span style={{ color: CORAL }}>transformé leur façon de créer.</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              style={{
                padding: '28px 28px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20,
              }}
            >
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {Array(t.stars).fill(0).map((_, s) => (
                  <Star key={s} style={{ width: 13, height: 13, fill: CORAL, color: CORAL }} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: '0 0 24px', fontStyle: 'italic' }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={t.avatar} alt={t.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 07 CTA FINAL ─────────────────────────────────────────────────────────────
function FinalCta({ onCta }) {
  return (
    <section style={{ background: BG, padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 60%, rgba(249,87,56,0.15) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 28 }}>
            Votre tour
          </p>
          <h2 style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 0.93, margin: '0 0 24px' }}>
            Votre expertise<br />
            <span style={{ color: CORAL }}>mérite mieux.</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', marginBottom: 48, lineHeight: 1.6 }}>
            Arrêtez de perdre du temps sur des outils qui ne vous ressemblent pas.<br />
            Créez quelque chose dont vous êtes fier — en 30 secondes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <motion.button onClick={onCta} whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '20px 52px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: CORAL, color: '#fff',
                fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em',
                boxShadow: '0 24px 72px rgba(249,87,56,0.5)',
              }}>
              Créer mon premier outil — gratuitement <ArrowRight style={{ width: 20, height: 20 }} />
            </motion.button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {FACES.slice(0, 4).map((src, i) => (
                  <img key={i} src={src} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1F1F1F', marginLeft: i > 0 ? -10 : 0 }} />
                ))}
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginLeft: 10, fontWeight: 600 }}>
                  +2 400 créateurs nous font confiance
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
                Sans carte bancaire · 5 builds offerts · Résultat immédiat
              </p>
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
    <footer style={{ background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 28, height: 'auto', objectFit: 'contain', mixBlendMode: 'screen' }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>WOK</span>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        {[['Fonctionnalités', '/fonctionnalites'], ['Prix', '/tarifs'], ['Blog', '/blog'], ['CGU', '/terms'], ['Confidentialité', '/privacy']].map(([l, h]) => (
          <a key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>{l}</a>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', margin: 0 }}>© 2026 WOK</p>
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
      <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: CORAL, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const onCta = () => base44.auth.redirectToLogin('/app');

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: BG }}>
      <Navbar onCta={onCta} />
      <Hero onCta={onCta} />
      <MarketScene />
      <PainScene />
      <SolutionScene onCta={onCta} />
      <CompareScene />
      <TestimonialsScene />
      <FinalCta onCta={onCta} />
      <Footer />
    </div>
  );
}