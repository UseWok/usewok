import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ArrowRight, Zap, Shield, TrendingUp, Brain, Clock, DollarSign, Check, X } from 'lucide-react';
import GuestQuiz from '@/components/landing/GuestQuiz';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

function Reveal({ children, delay = 0, y = 32, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
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
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.90)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '10px',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : '0 2px 12px rgba(0,0,0,0.04)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s ease',
        }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
          <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-6 h-6 object-contain" />
          <span className="font-black text-sm tracking-tight" style={{ color: FG }}>Stensor</span>
        </button>
        <div className="hidden md:flex items-center gap-8">
          <a href="/fonctionnalites" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">Features</a>
          <a href="/tarifs" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => base44.auth.redirectToLogin('/app')} className="hidden md:block text-xs font-semibold text-gray-500 hover:text-black transition-colors px-3 py-2">Sign In</button>
          <button onClick={onCta} className="text-xs font-black px-4 py-2.5 transition-all hover:scale-105 active:scale-95" style={{ background: YELLOW, color: FG, borderRadius: '8px' }}>
            Get Started
          </button>
        </div>
      </nav>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onCta }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24" style={{ background: 'white' }}>
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />
      {/* Yellow glow */}
      <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.6, 0.35] }} transition={{ duration: 7, repeat: Infinity }}
        className="absolute pointer-events-none"
        style={{ width: 800, height: 800, top: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(221,255,0,0.3) 0%, transparent 65%)', filter: 'blur(60px)', zIndex: 0 }} />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px] font-bold mb-8"
          style={{ background: 'rgba(221,255,0,0.2)', border: '1px solid rgba(221,255,0,0.5)', color: '#7a8f00' }}>
          <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          Le seul coach IA qui construit votre patrimoine autour de la vie que vous aimez
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-black tracking-tighter leading-[0.95] mb-6"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)', color: FG }}>
          Votre pizza,<br />
          <span style={{ color: '#888' }}>votre Netflix,</span><br />
          <span style={{ background: `linear-gradient(135deg, ${FG}, #444)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>votre liberté financière.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'rgba(0,0,0,0.45)', lineHeight: 1.7 }}>
          Stensor ne vous demande pas de sacrifier ce que vous aimez.<br />
          <strong style={{ color: FG }}>Il optimise votre argent autour de votre vie.</strong>
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <motion.button onClick={onCta} whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(221,255,0,0.5)' }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-4 font-black text-base rounded-sm transition-all"
            style={{ background: FG, color: 'white' }}>
            Commencer gratuitement <ArrowRight className="w-4 h-4" />
          </motion.button>
          <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-sm font-medium text-gray-400 hover:text-black transition-colors px-4 py-4">
            J'ai déjà un compte →
          </button>
        </motion.div>

        {/* Social proof numbers */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-6 flex-wrap">
          {[
            { n: '1,247', label: 'utilisateurs actifs' },
            { n: '€384', label: 'économisés/mois en moy.' },
            { n: '94%', label: 'réduction d\'anxiété' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-black text-lg" style={{ color: FG }}>{item.n}</span>
              <span className="text-xs text-gray-400">{item.label}</span>
              {i < 2 && <div className="w-px h-4 bg-gray-200 ml-4" />}
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <ChevronDown className="w-5 h-5 text-gray-300" />
      </motion.div>
    </section>
  );
}

// ─── VS ChatGPT ───────────────────────────────────────────────────────────────
const VS_ROWS = [
  { topic: 'Budget pizza du vendredi', chatgpt: '"Réduisez vos dépenses alimentaires"', stensor: '"Keep your pizza night. On coupe les 3 abos inutiles à la place."' },
  { topic: 'Netflix à 17€/mois', chatgpt: '"Considérez annuler les abonnements non essentiels"', stensor: '"Netflix reste. On déplace 17€ en ETF — votre futur vous remercie."' },
  { topic: 'Vacances à 2 000€', chatgpt: '"Votre budget voyage dépasse les recommandations"', stensor: '"Vos vacances sont planifiées. Voici comment les financer sans toucher à l\'investissement."' },
  { topic: 'Nouveau téléphone', chatgpt: '"Évitez les achats impulsifs"', stensor: '"Can you buy this? Oui — dans 6 semaines avec votre buffer tech. Voici le plan."' },
];

function VsSection() {
  return (
    <section className="py-28 px-6" style={{ background: '#fafaf8' }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-[10px] font-black tracking-[0.25em] uppercase mb-4" style={{ color: '#888' }}>La différence qui change tout</p>
          <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: FG, lineHeight: 1.05 }}>
            ChatGPT vous juge.<br />Stensor vous comprend.
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-2xl mx-auto">ChatGPT optimise votre budget. Stensor optimise votre vie.</p>
        </Reveal>

        <div className="rounded-sm overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div className="grid grid-cols-3 text-xs font-black uppercase tracking-widest" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <div className="px-5 py-4 text-gray-400">Situation</div>
            <div className="px-5 py-4 text-gray-400 border-l border-gray-100">ChatGPT</div>
            <div className="px-5 py-4 border-l" style={{ background: YELLOW, color: FG }}>Stensor ✦</div>
          </div>
          {VS_ROWS.map((row, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="grid grid-cols-3" style={{ borderBottom: i < VS_ROWS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <div className="px-5 py-5 text-sm font-bold" style={{ color: FG, background: 'white' }}>{row.topic}</div>
                <div className="px-5 py-5 text-sm text-gray-400 italic border-l border-gray-100" style={{ background: 'white' }}>
                  <span className="flex items-start gap-2"><X className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />{row.chatgpt}</span>
                </div>
                <div className="px-5 py-5 text-sm font-semibold border-l" style={{ background: 'rgba(221,255,0,0.08)', color: '#3a4a00' }}>
                  <span className="flex items-start gap-2"><Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#7a8f00' }} />{row.stensor}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Skills / Modes ───────────────────────────────────────────────────────────
const SKILL_CARDS = [
  {
    id: 'buy',
    emoji: '🛒',
    tag: 'Can I buy this?',
    title: 'Achète. Ou pas. En 10 secondes.',
    desc: 'Cette dépense entre dans votre plan ou elle le compromet ? Stensor analyse votre situation en temps réel et vous dit exactement si vous pouvez vous l\'offrir — et comment, si oui.',
    example: '"Can I buy this iPhone 16 à 1 199€?" → "Oui. Dans 3 semaines avec votre buffer tech. Ne touche pas à l\'investissement."',
    color: '#f0fdf4',
    accent: '#22c55e',
  },
  {
    id: 'track',
    emoji: '🧭',
    tag: 'Am I on track?',
    title: 'Ne dérivez jamais sans le savoir.',
    desc: 'Vous avancez vers vos objectifs ou vous avez dérivé sans vous en rendre compte ? Stensor vérifie votre trajectoire et vous remet dans les clous immédiatement.',
    example: '"Am I on track?" → "Vous êtes à 82% de votre objectif épargne. Un ajustement de 87€/mois ce trimestre vous remet à 100%."',
    color: '#eff6ff',
    accent: '#3b82f6',
  },
  {
    id: 'move',
    emoji: '🎯',
    tag: "What's my next move?",
    title: 'Toujours savoir quoi faire ensuite.',
    desc: 'Plus jamais de paralysie financière. Stensor vous donne une action concrète et mesurable à faire cette semaine — pour ne jamais perdre de vue vos objectifs.',
    example: '"What\'s my next move?" → "Augmentez votre virement automatique de 50€ ce mois. Impact sur votre retraite : +€12,400."',
    color: '#fdf4ff',
    accent: '#a855f7',
  },
];

function SkillsSection() {
  const [active, setActive] = useState(0);
  const card = SKILL_CARDS[active];

  return (
    <section className="py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-[10px] font-black tracking-[0.25em] uppercase mb-4 text-gray-400">Trois modes. Un seul objectif : la sérénité.</p>
          <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: FG, lineHeight: 1.05 }}>
            Réponse instantanée.<br />Action concrète. Toujours.
          </h2>
        </Reveal>

        <Reveal>
          {/* Tab buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mb-8 justify-center">
            {SKILL_CARDS.map((s, i) => (
              <button key={s.id} onClick={() => setActive(i)}
                className="flex items-center gap-2 px-5 py-3 rounded-sm text-sm font-bold transition-all"
                style={{
                  background: active === i ? FG : 'rgba(0,0,0,0.04)',
                  color: active === i ? 'white' : '#666',
                  transform: active === i ? 'translateY(-1px)' : 'none',
                  boxShadow: active === i ? '0 4px 16px rgba(0,0,0,0.15)' : 'none',
                }}>
                <span>{s.emoji}</span> {s.tag}
              </button>
            ))}
          </div>

          {/* Card */}
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-10 rounded-sm" style={{ background: card.color, border: `1.5px solid ${card.accent}22` }}>
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{card.emoji}</span>
                  <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-sm" style={{ background: card.accent + '20', color: card.accent }}>{card.tag}</span>
                </div>
                <h3 className="text-2xl font-black mb-4" style={{ color: FG }}>{card.title}</h3>
                <p className="text-base leading-relaxed mb-6 text-gray-600">{card.desc}</p>
                <div className="p-4 rounded-sm text-sm font-medium italic" style={{ background: 'white', border: `1px solid ${card.accent}30`, color: '#444' }}>
                  💬 {card.example}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { n: '1,247', label: 'Utilisateurs actifs', sub: '+312 ce mois' },
    { n: '€384', label: 'Économisés/mois', sub: 'en moyenne par utilisateur' },
    { n: '60s', label: 'Pour une stratégie', sub: 'complète et personnalisée' },
    { n: '94%', label: 'Anxiété réduite', sub: 'dès la première session' },
  ];
  return (
    <section className="py-20 px-6" style={{ background: YELLOW }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.08} y={16}>
              <div className="text-center">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false }}
                  className="font-black mb-1"
                  style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: FG, lineHeight: 1 }}>
                  {s.n}
                </motion.p>
                <p className="text-sm font-bold" style={{ color: FG }}>{s.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>{s.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Julien M.', role: 'Freelance dev, Paris', quote: "J'avais peur de toucher à mon argent. Maintenant je pose la question à Stensor et je passe à autre chose. L'anxiété a disparu.", style: { fontFamily: '"Georgia", serif', fontSize: '14px' }, avatar: 'J', color: '#6366f1' },
  { name: 'Sarah K.', role: 'Ingénieure, Londres', quote: "€640/mois retrouvés en abos et frais que je ne voyais même plus. Première conversation. Je suis encore choquée.", style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '-0.01em' }, avatar: 'S', color: '#ec4899' },
  { name: 'Marc D.', role: 'Entrepreneur, Bruxelles', quote: "C'est comme avoir un CFO dans la poche qui parle humain. Il ne me demande pas de sacrifier mon weekend pour épargner.", style: { fontFamily: '"Times New Roman", serif', fontSize: '14px', fontStyle: 'italic' }, avatar: 'M', color: '#f59e0b' },
  { name: 'Léa B.', role: 'Médecin, Lyon', quote: "\"Can I buy this?\" est devenu mon meilleur ami. 10 secondes et je sais. Fini le stress post-achat.", style: { fontFamily: '"Courier New", monospace', fontSize: '13px' }, avatar: 'L', color: '#10b981' },
  { name: 'Thomas R.', role: 'Marketing, Bordeaux', quote: "J'avais essayé ChatGPT pour mes finances. Il voulait supprimer mon café matinal. Stensor a optimisé mon épargne sans toucher à mes petits plaisirs.", style: { fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px' }, avatar: 'T', color: '#8b5cf6' },
  { name: 'Camille F.', role: 'Designer, Nice', quote: "Mon objectif FIRE dans 8 ans. Stensor me dit chaque semaine exactement où j'en suis et quoi faire ensuite. Je n'ai plus d'excuse pour dériver.", style: { fontFamily: '"Palatino", serif', fontSize: '14px' }, avatar: 'C', color: '#f43f5e' },
  { name: 'Antoine V.', role: 'Architecte, Nantes', quote: "La fonctionnalité Am I on track? m'a évité une erreur à 8 000€ en immobilier. Je ne réalise toujours pas.", style: { fontFamily: 'Inter, sans-serif', fontSize: '13px' }, avatar: 'A', color: '#0ea5e9' },
  { name: 'Margot P.', role: 'Prof, Toulouse', quote: "Mon salaire n'est pas énorme mais Stensor m'a montré que j'avançais mieux que 70% des gens avec le double. Ça change tout psychologiquement.", style: { fontFamily: '"Georgia", serif', fontSize: '13px' }, avatar: 'M', color: '#22c55e' },
  { name: 'Romain L.', role: 'Chef, Paris', quote: "Je cuisinais au resto 6j/7. Stensor n'a pas dit de cuisiner chez moi. Il a trouvé 3 autres fuites que je ne voyais pas. Respect.", style: { fontFamily: '"Trebuchet MS", sans-serif', fontSize: '14px' }, avatar: 'R', color: '#f97316' },
  { name: 'Emma C.', role: 'Consultante, Genève', quote: "What's my next move? chaque lundi matin. 5 minutes. Ma semaine financière est planifiée. Simple, efficace, imparable.", style: { fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '0.01em', fontSize: '13px' }, avatar: 'E', color: '#a855f7' },
  { name: 'Hugo S.', role: 'Ingénieur, Strasbourg', quote: "J'économise 800€/mois sans changer de style de vie. J'ai juste arrêté d'ignorer ce que Stensor me disait depuis 3 mois.", style: { fontFamily: '"Courier New", monospace', fontSize: '12px' }, avatar: 'H', color: '#14b8a6' },
  { name: 'Sophie M.', role: 'RH, Lille', quote: "Mon ex me disait de faire un budget. Stensor me dit comment vivre ma vie ET épargner. C'est pas pareil.", style: { fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '14px' }, avatar: 'S', color: '#e11d48' },
  { name: 'Lucas B.', role: 'Développeur, Montpellier', quote: "La précision est dingue. Il a calculé que si j'augmentais mon virement de 73€, j'avais mon apport immobilier 14 mois plus tôt.", style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '-0.02em', fontWeight: 600 }, avatar: 'L', color: '#2563eb' },
  { name: 'Inès D.', role: 'Avocate, Paris', quote: "Je gagnais bien mais je ne savais pas où allait mon argent. Stensor a tout mis à plat en une conversation. Jamais vu ça.", style: { fontFamily: '"Palatino", serif', fontSize: '14px' }, avatar: 'I', color: '#7c3aed' },
  { name: 'Baptiste G.', role: 'Commercial, Rennes', quote: "Avant Stensor : stress à chaque achat. Après Stensor : je vis ma vie et l'IA gère le reste. C'est exactement ce qu'ils promettent.", style: { fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px' }, avatar: 'B', color: '#059669' },
  { name: 'Chloé N.', role: 'Kinésithérapeute, Marseille', quote: "Je pensais que l'IA financière c'était pour les riches. Stensor m'a prouvé le contraire. Mon premier ETF acheté après 10 minutes de conversation.", style: { fontFamily: '"Georgia", serif', fontSize: '13px' }, avatar: 'C', color: '#d97706' },
];

function TestimonialsSection() {
  const row1 = TESTIMONIALS.slice(0, 8);
  const row2 = TESTIMONIALS.slice(8);

  function TestimonialRow({ items, reverse = false }) {
    return (
      <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
        <motion.div
          animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="flex gap-4 w-max"
        >
          {[...items, ...items].map((t, i) => (
            <div key={i} className="flex-shrink-0 w-80 p-6 rounded-sm"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <p className="leading-relaxed mb-5 text-gray-700" style={t.style}>"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: t.color }}>{t.avatar}</div>
                <div>
                  <p className="text-xs font-bold" style={{ color: FG }}>{t.name}</p>
                  <p className="text-[10px] text-gray-400">{t.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400 text-xs">★</span>)}
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
      <Reveal className="text-center mb-16 px-6">
        <p className="text-[10px] font-black tracking-[0.25em] uppercase mb-4 text-gray-400">Ce qu'ils disent</p>
        <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: FG, lineHeight: 1.05 }}>
          Ils ont arrêté de s'inquiéter.<br />Vous aussi, vous pouvez.
        </h2>
      </Reveal>
      <div className="flex flex-col gap-4">
        <TestimonialRow items={row1} />
        <TestimonialRow items={row2} reverse />
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Dites-lui votre situation', desc: 'Pas de formulaires. Pas de setup. Juste tapez ce qui vous passe par la tête — un objectif, une peur, une question. Même "est-ce que je peux me payer cette pizza ?"' },
    { n: '02', title: 'Obtenez une vraie stratégie', desc: 'Stensor analyse votre profil complet et vous répond avec un plan d\'action concret, personnalisé à votre vie — pas un conseil générique copié-collé.' },
    { n: '03', title: 'Exécutez et grandissez', desc: 'Suivez les étapes. Posez des questions de suivi. Regardez votre clarté financière se multiplier semaine après semaine, sans effort.' },
  ];
  return (
    <section className="py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-20">
          <p className="text-[10px] font-black tracking-[0.25em] uppercase mb-4 text-gray-400">Comment ça marche</p>
          <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: FG, lineHeight: 1.1 }}>
            Trois étapes vers l'autopilote financier.
          </h2>
        </Reveal>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div whileHover={{ x: 6 }} transition={{ duration: 0.2 }}
                className="flex items-start gap-6 p-8 rounded-sm"
                style={{ background: '#fafaf8', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="text-5xl font-black flex-shrink-0 leading-none" style={{ color: 'rgba(0,0,0,0.06)' }}>{s.n}</span>
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
  { q: "C'est quoi Stensor exactement ?", a: "Le seul coach IA financier qui construit votre patrimoine autour de la vie que vous aimez — pas en sacrifiant ce qui compte pour vous. Décrivez n'importe quel objectif en langage naturel et obtenez une stratégie complète en 60 secondes." },
  { q: "C'est différent de ChatGPT comment ?", a: "ChatGPT optimise votre budget. Stensor optimise votre vie. ChatGPT vous dit de supprimer votre Netflix. Stensor garde votre Netflix et trouve 3 autres fuites que vous ne voyiez pas." },
  { q: "J'ai besoin de connaissances financières ?", a: "Zéro. Stensor est fait pour tout le monde, du débutant total à l'investisseur expérimenté. Décrivez juste votre situation." },
  { q: "Est-ce que mes données sont sécurisées ?", a: "Complètement. Vos conversations sont privées et chiffrées. Nous ne vendons jamais vos données personnelles." },
  { q: "Je peux annuler quand je veux ?", a: "Oui, sans conditions. Annulez à tout moment, sans frais cachés. Vous gardez l'accès jusqu'à la fin de votre période de facturation." },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-24 px-6" style={{ background: '#fafaf8' }}>
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tighter mb-3" style={{ color: FG }}>Questions fréquentes</h2>
        </Reveal>
        <div>
          {FAQS.map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between py-5 text-left gap-4">
                  <span className="text-base font-bold" style={{ color: FG }}>{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-300" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <p className="pb-5 text-base leading-relaxed text-gray-500">{faq.a}</p>
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

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCta({ onCta }) {
  return (
    <section className="relative py-40 px-6 overflow-hidden" style={{ background: 'white' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }} transition={{ duration: 6, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(221,255,0,0.4), transparent)' }} />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <Reveal>
          <p className="text-[10px] font-black tracking-[0.25em] uppercase mb-6 text-gray-400">Prêt pour l'autopilote ?</p>
          <h2 className="font-black tracking-tighter mb-6" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', color: FG, lineHeight: 1 }}>
            Votre pizza.<br />Votre liberté.<br /><span style={{ color: '#888' }}>Notre problème.</span>
          </h2>
          <p className="text-lg mb-10 text-gray-400">Commencez gratuitement. Sans carte bancaire. Sans setup.</p>
          <motion.button onClick={onCta}
            whileHover={{ scale: 1.04, boxShadow: '0 16px 48px rgba(221,255,0,0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-10 py-5 font-black text-base rounded-sm transition-all"
            style={{ background: FG, color: 'white' }}>
            Construire ma liberté financière <ArrowRight className="w-5 h-5" />
          </motion.button>
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
            <p className="text-sm max-w-xs text-gray-400">Le seul coach IA qui construit votre patrimoine autour de la vie que vous aimez.</p>
          </div>
          <div className="flex gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-300">Produit</p>
              {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs']].map(([l, h]) => (
                <a key={l} href={h} className="block text-sm mb-2 text-gray-400 hover:text-black transition-colors">{l}</a>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-300">Légal</p>
              {[['CGU', '/terms'], ['Confidentialité', '/privacy']].map(([l, h]) => (
                <a key={l} href={h} className="block text-sm mb-2 text-gray-400 hover:text-black transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-xs text-gray-300">2026 Stensor Inc. Tous droits réservés.</p>
          <p className="text-xs text-gray-200">Les réponses IA peuvent contenir des inexactitudes. Pas un conseil financier.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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
    <div className="font-inter overflow-x-hidden" style={{ background: 'white' }}>
      <AnimatePresence>
        {showQuiz && <GuestQuiz onClose={() => setShowQuiz(false)} />}
      </AnimatePresence>
      <Navbar onCta={() => setShowQuiz(true)} />
      <Hero onCta={() => setShowQuiz(true)} />
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