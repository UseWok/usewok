import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ParticleField from '@/components/landing/ParticleField';
import OnboardingQuizModal from '@/components/landing/OnboardingQuizModal';

// ── Design tokens ──
const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const BG2 = '#111113';
const BORDER = 'rgba(255,255,255,0.07)';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.25)';
const CORAL = '#F95738';
const CORAL2 = 'rgba(249,87,56,0.15)';

function FadeIn({ children, delay = 0, y = 24, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}>
      {children}
    </motion.div>
  );
}

// ── AI engine logos ────────────────────────────────────────────────────────────
const ENGINES = [
  { label: 'ChatGPT', color: '#10A37F' },
  { label: 'Gemini', color: '#4285F4' },
  { label: 'Claude', color: '#D97757' },
  { label: 'Perplexity', color: '#20808D' },
  { label: 'Grok', color: '#1DA1F2' },
  { label: 'Mistral', color: '#F97316' },
  { label: 'Copilot', color: '#0078D4' },
  { label: 'Llama', color: '#A259FF' },
];

// ── NAVBAR ─────────────────────────────────────────────────────────────────────
function Navbar({ onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      height: 58, display: 'flex', alignItems: 'center',
      padding: '0 clamp(20px, 5vw, 60px)', fontFamily: F,
      background: scrolled ? 'rgba(10,10,11,0.88)' : 'rgba(10,10,11,0.5)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
      transition: 'background 300ms, border-color 300ms',
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L10.5 9H1.5L6 1Z" fill="white" />
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: T1, letterSpacing: '-0.02em' }}>UseWok</span>
      </a>

      <div style={{ flex: 1 }} />

      <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {[['Tarifs', '/tarifs'], ['Blog', '/blog']].map(([l, h]) => (
          <a key={l} href={h} style={{ fontSize: 13, fontWeight: 400, color: T2, textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = T1}
            onMouseLeave={e => e.currentTarget.style.color = T2}>{l}</a>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onSignup} style={{
          fontFamily: F, fontSize: 13, fontWeight: 500,
          color: '#0A0A0B', background: T1,
          border: 'none', borderRadius: 20, padding: '6px 18px',
          cursor: 'pointer', transition: 'opacity 150ms', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Analyser gratuitement →
        </button>
      </div>
    </header>
  );
}

// ── HERO SCAN INPUT ────────────────────────────────────────────────────────────
function HeroScanInput({ onStartQuiz }) {
  const [url, setUrl] = useState('');
  const handleScan = () => {
    if (url.trim()) {
      localStorage.setItem('wok_pending_url', url.trim());
      onStartQuiz();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 500 }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 14,
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder="https://votre-site.com"
            autoFocus
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 14, color: T1, fontFamily: F,
              '::placeholder': { color: T3 },
            }}
          />
        </div>
        <button onClick={handleScan}
          style={{
            width: '100%', padding: '14px', background: CORAL,
            border: 'none', fontSize: 14, fontWeight: 700,
            color: '#fff', cursor: 'pointer', fontFamily: F,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Vérifier ma visibilité IA gratuitement →
        </button>
      </div>
      <p style={{ fontSize: 11, color: T3, marginTop: 10, textAlign: 'center' }}>
        3 questions · 20 secondes · Corrections 10× plus précises
      </p>
    </div>
  );
}

// ── HERO ───────────────────────────────────────────────────────────────────────
function Hero({ onSignup, onStartQuiz }) {
  return (
    <section style={{ background: BG, paddingTop: 58, fontFamily: F, position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      {/* Background ambiance */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <ParticleField count={60} />
      </div>
      <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(249,87,56,0.14) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, #0A0A0B)', pointerEvents: 'none', zIndex: 2 }} />

      <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 860, margin: '0 auto', padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 60px) 80px', textAlign: 'center' }}>

        {/* Badge */}
        <FadeIn delay={0}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(249,87,56,0.12)', border: `1px solid rgba(249,87,56,0.25)`, borderRadius: 20, padding: '5px 14px', marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL, animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, color: CORAL, fontWeight: 600, letterSpacing: '0.03em' }}>8 moteurs IA analysés simultanément</span>
          </div>
        </FadeIn>

        {/* H1 */}
        <FadeIn delay={0.08}>
          <h1 style={{
            fontSize: 'clamp(32px, 5.5vw, 62px)',
            fontWeight: 800,
            color: T1,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            margin: '0 0 24px',
          }}>
            Vos futurs clients demandent à{' '}
            <span style={{ color: CORAL }}>ChatGPT</span> à qui faire appel.
            <br />
            <span style={{ color: T2, fontWeight: 700 }}>Est-ce que votre nom sort ?</span>
          </h1>
        </FadeIn>

        {/* Subheadline */}
        <FadeIn delay={0.16}>
          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: T2,
            margin: '0 auto 40px',
            maxWidth: 600,
            lineHeight: 1.65,
            fontWeight: 400,
          }}>
            Les gens ne tapent plus dans Google. Ils demandent directement à une IA : <em style={{ color: T1, fontStyle: 'normal' }}>"Quel plombier fiable à Lyon ?"</em>, <em style={{ color: T1, fontStyle: 'normal' }}>"Meilleur graphiste freelance ?"</em>. Si l'IA ne vous connaît pas, vous n'existez pas.
          </p>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.22}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroScanInput onStartQuiz={onStartQuiz} />
          </div>
        </FadeIn>

        {/* Engine pills */}
        <FadeIn delay={0.32}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 40 }}>
            {ENGINES.map((e) => (
              <div key={e.label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                fontSize: 12, fontWeight: 500, color: T2,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                {e.label}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}`}</style>
    </section>
  );
}

// ── SCORE MOCK ─────────────────────────────────────────────────────────────────
function ScoreMock() {
  const engines = [
    { name: 'Gemini', score: 23, color: '#4285F4' },
    { name: 'ChatGPT', score: 8, color: '#10A37F' },
    { name: 'Claude', score: 31, color: '#D97757' },
    { name: 'Perplexity', score: 12, color: '#20808D' },
    { name: 'Grok', score: 5, color: '#1DA1F2' },
    { name: 'Copilot', score: 19, color: '#0078D4' },
    { name: 'Mistral', score: 14, color: '#F97316' },
    { name: 'Llama', score: 9, color: '#A259FF' },
  ];
  return (
    <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', fontFamily: F }}>
      {/* Header */}
      <div style={{ background: '#0D0D0F', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF5F56', '#FFBD2E', '#27C93F'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
        </div>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>usewok.app — Rapport IA</span>
      </div>

      <div style={{ padding: '20px' }}>
        {/* LRS Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '16px', background: '#0D0D0F', borderRadius: 12 }}>
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="#EF4444" strokeWidth="4"
                strokeDasharray={163} strokeDashoffset={163 * (1 - 15 / 100)} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: T1, lineHeight: 1 }}>15</span>
              <span style={{ fontSize: 8, color: T3 }}>/100</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: T3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>LRS™ — Entity Authority Score</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T1, marginBottom: 4 }}>artisan-plombier-lyon.fr</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444' }}>Faible visibilité IA</span>
            </div>
          </div>
        </div>

        {/* Engine bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80, marginBottom: 10 }}>
          {engines.map((e) => (
            <div key={e.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 8, fontWeight: 800, color: T3 }}>{e.score}</span>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: '3px 3px 0 0', height: `${(e.score / 35) * 60}px`, background: `linear-gradient(180deg, ${e.color}99, ${e.color}55)` }} />
              <span style={{ fontSize: 7, color: T3, textAlign: 'center', lineHeight: 1.2 }}>{e.name}</span>
            </div>
          ))}
        </div>

        {/* Issues */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { text: 'Données structurées Schema.org manquantes', sev: 'error' },
            { text: 'Fiche Google My Business incomplète', sev: 'error' },
            { text: 'Aucune mention sur Perplexity, Grok, Llama', sev: 'warning' },
          ].map((issue, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: issue.sev === 'error' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${issue.sev === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`, borderRadius: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: issue.sev === 'error' ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: T2 }}>{issue.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PROBLEM SECTION ────────────────────────────────────────────────────────────
function ProblemSection() {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center' }}>
        <div>
          <FadeIn>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '4px 12px', marginBottom: 24 }}>
              <span style={{ fontSize: 11, color: T3, fontWeight: 600, letterSpacing: '0.06em' }}>LE PROBLÈME</span>
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 20px' }}>
              Les IA ignorent<br />la plupart des pros.
              <br />
              <span style={{ color: T2, fontWeight: 600 }}>Pas parce qu'ils sont mauvais.</span>
            </h2>
            <p style={{ fontSize: 15, color: T2, lineHeight: 1.7, margin: '0 0 28px' }}>
              Les moteurs IA ne cherchent pas comme Google. Ils ne voient pas les publicités. Ils synthétisent les informations disponibles sur votre activité — et si ces informations sont absentes, incomplètes ou incohérentes, ils recommandent quelqu'un d'autre.
            </p>
            <p style={{ fontSize: 15, color: T2, lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: T1 }}>Votre site ne transmet pas ses informations structurées.</strong> Les moteurs IA ne savent pas précisément ce que vous vendez, votre zone géographique, ni vos prix. UseWok vous dit exactement quoi corriger.
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.15}>
          <ScoreMock />
        </FadeIn>
      </div>
    </section>
  );
}

// ── FEATURES SECTION ───────────────────────────────────────────────────────────
function FeaturesSection({ onSignup }) {
  const features = [
    {
      num: '01',
      icon: '🎯',
      title: 'Un score clair — en 30 secondes',
      desc: 'On analyse votre présence sur 8 intelligences artificielles en parallèle (ChatGPT, Gemini, Perplexity, Copilot…) et on vous donne un score simple. Pas de jargon. Vous savez immédiatement où vous en êtes.',
    },
    {
      num: '02',
      icon: '🔍',
      title: 'Un audit précis — quoi bloque ?',
      desc: 'Chaque problème qui empêche les IA de vous citer est identifié et listé. Informations manquantes, données structurées absentes, incohérences par rapport à vos concurrents — tout est visible noir sur blanc.',
    },
    {
      num: '03',
      icon: '🛠️',
      title: 'Des corrections guidées, étape par étape',
      desc: 'Pour chaque problème détecté, vous recevez une réponse sur mesure : quoi faire, comment le faire, dans quel ordre. Pas besoin d\'être expert. Pas besoin d\'agence. Vous suivez, vous corrigez.',
    },
    {
      num: '04',
      icon: '📋',
      title: 'Une to-do list automatique',
      desc: 'UseWok génère votre plan d\'action personnalisé. Vous cochez, vous avancez, vous progressez — à votre rythme, sans vous perdre.',
    },
    {
      num: '05',
      icon: '📊',
      title: 'Vos concurrents vs vous',
      desc: 'Graphiques, stats, comparatifs : voyez exactement où vos concurrents vous devancent sur les recommandations IA — et quoi faire pour les rattraper.',
    },
    {
      num: '06',
      icon: '💬',
      title: 'Un assistant IA qui connaît votre dossier',
      desc: 'Le chatbot UseWok a tout votre contexte : votre score, vos problèmes, votre secteur. Posez votre question, il vous répond comme un consultant qui vous connaît par cœur.',
    },
  ];

  return (
    <section style={{ background: BG2, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ marginBottom: 'clamp(40px, 6vw, 72px)', maxWidth: 580 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '4px 12px', marginBottom: 20 }}>
              <span style={{ fontSize: 11, color: T3, fontWeight: 600, letterSpacing: '0.06em' }}>CE QUE ÇA FAIT CONCRÈTEMENT</span>
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 16px' }}>
              Tout ce qu'il faut pour exister dans les réponses IA.
            </h2>
            <p style={{ fontSize: 15, color: T2, lineHeight: 1.65, margin: 0 }}>
              Un seul outil. Du score au plan d'action. Zéro jargon, zéro équipe nécessaire.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div style={{
                padding: 'clamp(24px, 3vw, 36px)',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                border: `1px solid ${BORDER}`,
                borderRadius: 0,
                transition: 'background 200ms',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                  <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, color: T3, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 5 }}>{f.num}</div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: T1, margin: 0, lineHeight: 1.3 }}>{f.title}</h3>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: T2, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FOR WHO SECTION ────────────────────────────────────────────────────────────
function ForWhoSection({ onSignup }) {
  const personas = [
    { emoji: '🔧', title: 'L\'artisan', desc: 'Qui se demande "pourquoi mon concurrent sort toujours en premier" quand ses clients cherchent en ligne.' },
    { emoji: '💻', title: 'Le freelance', desc: 'Qui n\'a ni le temps ni l\'argent pour une agence, mais qui veut être recommandé par les IA.' },
    { emoji: '🏪', title: 'Le commerçant', desc: 'Qui veut que les clients du quartier le trouvent — même quand ils demandent à une IA.' },
    { emoji: '👔', title: 'Le gérant de PME', desc: 'Qui fait déjà tout lui-même et ne peut pas en plus devenir expert en marketing IA.' },
  ];

  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'clamp(40px, 5vw, 64px)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '4px 12px', marginBottom: 20 }}>
              <span style={{ fontSize: 11, color: T3, fontWeight: 600, letterSpacing: '0.06em' }}>POUR QUI ?</span>
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 16px', maxWidth: 580 }}>
              Pensé pour les pros qui font tout eux-mêmes.
            </h2>
            <p style={{ fontSize: 15, color: T2, lineHeight: 1.65, margin: 0, maxWidth: 480 }}>
              Pas besoin d'équipe marketing. Pas besoin de budget à 4 chiffres. Juste un outil honnête qui vous dit où vous en êtes.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {personas.map((p, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{
                padding: '28px 24px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                transition: 'background 200ms, border-color 200ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = BORDER; }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 14 }}>{p.emoji}</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T1, margin: '0 0 8px' }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: T2, lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* NOT section */}
        <FadeIn delay={0.2}>
          <div style={{ marginTop: 48, padding: '28px 32px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, borderRadius: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Ce que UseWok n'est PAS</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {[
                '❌ Du référencement Google classique (SEO)',
                '❌ Un outil de pub payante',
                '❌ Un truc qui demande une équipe ou un budget mensuel à 4 chiffres',
              ].map((t, i) => (
                <div key={i} style={{ fontSize: 13, color: T2, lineHeight: 1.5 }}>{t}</div>
              ))}
            </div>
            <div style={{ width: '100%', height: 1, background: BORDER, margin: '18px 0' }} />
            <div style={{ fontSize: 14, color: T1, fontWeight: 600 }}>
              ✅ C'est le premier outil français pensé pour les indépendants et les petites entreprises qui veulent exister là où les clients cherchent désormais : dans les <span style={{ color: CORAL }}>réponses des IA</span>.
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
function Testimonials() {
  const quotes = [
    { emoji: '🔧', name: 'Marc D.', role: 'Plombier, Lyon', quote: "En 3 semaines, j'ai vu ma fiche remonter dans les réponses de ChatGPT. Un client m'a dit qu'il m'avait trouvé via une IA. Ça ne m'était jamais arrivé avant." },
    { emoji: '🎨', name: 'Léa M.', role: 'Graphiste freelance, Paris', quote: "Je ne savais même pas que ça existait comme problème. UseWok m'a montré que j'avais un score de 8/100 sur Gemini. Maintenant je suis à 54 et j'ai de nouvelles demandes." },
    { emoji: '🏪', name: 'Thomas R.', role: 'Gérant épicerie fine, Bordeaux', quote: "Simple, clair, actionnable. On m'a dit exactement quoi faire étape par étape. J'ai rien compris au SEO toute ma vie, mais là j'ai suivi les étapes et ça marche." },
  ];

  return (
    <section style={{ background: BG2, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', margin: '0 0 clamp(32px, 5vw, 56px)', textAlign: 'center' }}>
            Ils ont commencé à apparaître.
          </h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {quotes.map((q, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{ padding: '28px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 16 }}>
                <p style={{ fontSize: 15, color: T1, lineHeight: 1.7, margin: '0 0 22px', fontStyle: 'italic' }}>"{q.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{q.emoji}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{q.name}</div>
                    <div style={{ fontSize: 11, color: T3 }}>{q.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FINAL CTA ─────────────────────────────────────────────────────────────────
function FinalCta({ onStartQuiz }) {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 120px)', textAlign: 'center', fontFamily: F, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(249,87,56,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 800, color: T1, letterSpacing: '-0.05em', lineHeight: 1.05, margin: '0 0 20px' }}>
            Vérifiez gratuitement si les IA vous recommandent.
          </h2>
          <p style={{ fontSize: 16, color: T2, lineHeight: 1.65, margin: '0 auto 40px', maxWidth: 440 }}>
            Résultat en 2 minutes. Sans carte bancaire. Sans engagement.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroScanInput onStartQuiz={onStartQuiz} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── FOOTER ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: 'clamp(32px, 4vw, 48px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1L10.5 9H1.5L6 1Z" fill="white" /></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: T1, letterSpacing: '-0.02em' }}>UseWok</span>
          <span style={{ fontSize: 12, color: T3, marginLeft: 4 }}>— L'outil français de visibilité IA</span>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[['Tarifs', '/tarifs'], ['Blog', '/blog'], ['Confidentialité', '/privacy'], ['CGU', '/terms']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: T3, textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = T2}
              onMouseLeave={e => e.currentTarget.style.color = T3}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 12, color: T3 }}>© 2026 UseWok</span>
      </div>
    </footer>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#0A0A0B';
    document.body.style.color = '#F0F0EE';
    document.documentElement.style.backgroundColor = '#0A0A0B';
    const style = document.createElement('style');
    style.id = 'lp-dark-override';
    style.textContent = `#root::before { display: none !important; } body { background-color: #0A0A0B !important; }`;
    document.head.appendChild(style);
    return () => {
      document.body.style.backgroundColor = prev;
      document.body.style.color = '';
      document.documentElement.style.backgroundColor = '';
      document.getElementById('lp-dark-override')?.remove();
    };
  }, []);

  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(a => { if (a) navigate('/app', { replace: true }); else setReady(true); })
      .catch(() => setReady(true));
  }, [navigate]);

  if (!ready) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  const onSignup = () => base44.auth.redirectToLogin('/app');
  const onStartQuiz = () => setShowQuiz(true);
  const onQuizComplete = (answers) => {
    setShowQuiz(false);
    // Pass pending URL and quiz answers via sessionStorage for Home to pick up after login
    const pendingUrl = localStorage.getItem('wok_pending_url');
    if (pendingUrl) sessionStorage.setItem('wok_post_login_url', pendingUrl);
    if (answers) sessionStorage.setItem('wok_post_login_quiz', JSON.stringify(answers));
    base44.auth.redirectToLogin('/app');
  };
  const onQuizSkip = () => {
    setShowQuiz(false);
    const pendingUrl = localStorage.getItem('wok_pending_url');
    if (pendingUrl) sessionStorage.setItem('wok_post_login_url', pendingUrl);
    base44.auth.redirectToLogin('/app');
  };

  return (
    <div style={{ background: BG, fontFamily: F }}>
      <AnimatePresence>
        {showQuiz && <OnboardingQuizModal onComplete={onQuizComplete} onSkip={onQuizSkip} />}
      </AnimatePresence>

      {/* ── Liseré tricolore — sous la navbar, bien visible, qualité Retina ── */}
      <div style={{
        position: 'fixed', top: 58, left: 0, right: 0, zIndex: 299, height: 3,
        background: 'linear-gradient(90deg, #1C3D6E 0%, #1C3D6E 33.33%, rgba(240,238,232,0.18) 33.33%, rgba(240,238,232,0.18) 66.66%, #7A2820 66.66%, #7A2820 100%)',
        opacity: 0.85,
      }} />

      <Navbar onSignup={onSignup} />
      <Hero onSignup={onSignup} onStartQuiz={onStartQuiz} />
      <ProblemSection />
      <FeaturesSection onSignup={onSignup} />

      {/* ── Section French Tech ── */}
      <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,120px)', fontFamily: F }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <FadeIn>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, marginBottom: 'clamp(36px,5vw,56px)' }}>
              <div style={{ maxWidth: 540 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  {/* Drapeau SVG net Retina */}
                  <svg width="28" height="20" viewBox="0 0 28 20" fill="none" style={{ borderRadius: 3, flexShrink: 0, boxShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                    <rect width="28" height="20" fill="#2A2520"/>
                    <rect width="9.33" height="20" fill="#1C3D6E"/>
                    <rect x="9.33" width="9.34" height="20" fill="#3A3530" opacity="0.7"/>
                    <rect x="18.67" width="9.33" height="20" fill="#7A2820"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>French Tech · Solution souveraine</span>
                </div>
                <h2 style={{ fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 16px' }}>
                  Conçu en France,<br />pour le marché français.
                </h2>
                <p style={{ fontSize: 15, color: T2, lineHeight: 1.7, margin: 0 }}>
                  Dans un monde où les outils IA viennent majoritairement des États-Unis, UseWok est fier d'être une solution française. Souveraineté des données, compréhension du tissu local, support humain en français — pas des généralités US traduites.
                </p>
              </div>

              {/* Sceau circulaire */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ position: 'relative', width: 88, height: 88 }}>
                  <svg width="88" height="88" viewBox="0 0 88 88" style={{ position: 'absolute', inset: 0 }}>
                    <circle cx="44" cy="44" r="42" fill="none" stroke="#1C3D6E" strokeWidth="3" strokeDasharray="88 176" strokeDashoffset="0"/>
                    <circle cx="44" cy="44" r="42" fill="none" stroke="rgba(240,238,232,0.22)" strokeWidth="3" strokeDasharray="88 176" strokeDashoffset="-88"/>
                    <circle cx="44" cy="44" r="42" fill="none" stroke="#7A2820" strokeWidth="3" strokeDasharray="88 176" strokeDashoffset="-176"/>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <span style={{ fontSize: 24 }}>🇫🇷</span>
                    <span style={{ fontSize: 8, fontWeight: 800, color: T3, letterSpacing: '0.07em', textAlign: 'center', lineHeight: 1.4 }}>FAIT EN<br/>FRANCE</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 3 piliers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 12 }}>
            {[
              {
                accent: '#1A3A6B',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                label: 'Conformité RGPD native',
                desc: 'Vos données ne quittent jamais l\'Europe. Traitement transparent, droit à l\'effacement garanti, aucune revente. Pas une case à cocher — une vraie politique.',
              },
              {
                accent: '#4A5568',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
                label: 'Calibré pour la France',
                desc: 'Nos audits comprennent les spécificités du commerce local, de l\'artisanat et des TPE françaises. Pas un outil californien traduit en français.',
              },
              {
                accent: '#A0312A',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                label: 'Support humain, en français',
                desc: 'Une vraie équipe qui connaît les contraintes d\'un indépendant ou d\'un gérant de PME. Réponse sous 24h, en français, par des humains.',
              },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div style={{
                  padding: '28px 24px',
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${BORDER}`,
                  borderTop: `3px solid ${p.accent}`,
                  borderRadius: '0 0 14px 14px',
                  transition: 'background 200ms',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.055)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${p.accent}22`, border: `1px solid ${p.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: T2 }}>
                    {p.icon}
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T1, margin: '0 0 8px' }}>{p.label}</h3>
                  <p style={{ fontSize: 13, color: T2, lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Strip réassurance */}
          <FadeIn delay={0.2}>
            <div style={{ marginTop: 16, padding: '14px 22px', background: 'rgba(26,58,107,0.10)', border: '1px solid rgba(26,58,107,0.22)', borderRadius: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 22, justifyContent: 'center' }}>
              {[['🔒','Serveurs hébergés en Europe'],['📋','RGPD natif'],['🇫🇷','Support en français'],['🚫','Aucune revente de données']].map(([icon, text], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T2 }}>{text}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <ForWhoSection onSignup={onSignup} />
      <Testimonials />
      <FinalCta onStartQuiz={onStartQuiz} />
      <Footer />
    </div>
  );
}