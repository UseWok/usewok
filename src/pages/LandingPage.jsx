import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import StackingCards from '@/components/landing/StackingCards';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const PENDING_KEY = 'stensor_pending_query';

const TOPICS = [
  'Investir en ETF',
  'Rembourser mes dettes',
  'Construire ma retraite',
  'Générer des revenus passifs',
  'Optimiser mes impôts',
];

const CARDS = [
  {
    num: '01',
    total: '04',
    title: 'Investissez à la vitesse de vos ambitions',
    desc: "Décrivez votre situation à Stensor et regardez vos doutes se transformer en un plan d'action clair et mathématique.",
  },
  {
    num: '02',
    total: '04',
    title: "L'ingénierie financière, en arrière-plan.",
    desc: "Pendant que vous discutez de vos projets, Stensor calcule automatiquement la logique nécessaire pour sécuriser votre avenir. Allocation d'actifs, intérêts composés, gestion des risques et optimisation fiscale sont gérés en arrière-plan.",
  },
  {
    num: '03',
    total: '04',
    title: "Actionnable, instantanément.",
    desc: "Nous ne faisons pas dans la théorie. Dès la première discussion, vous obtenez les étapes exactes pour placer votre argent, automatiser vos finances et commencer à bâtir, dès aujourd'hui.",
  },
  {
    num: '04',
    total: '04',
    title: "Un seul coach. Tous les cerveaux de l'IA.",
    desc: "Accédez aux tout derniers modèles d'intelligence artificielle dès leur sortie (GPT, Claude, Gemini). Stensor sélectionne automatiquement le modèle le plus adapté à votre problématique financière.",
  },
];

const FAQS = [
  { q: "Qu'est-ce que Stensor ?", a: "Stensor est une plateforme propulsée par l'IA qui permet de structurer ses finances personnelles en quelques minutes. Il suffit d'utiliser un langage naturel pour transformer ses objectifs en plans d'investissement, stratégies de désendettement et solutions de retraite prêts à l'emploi, sans aucune expertise requise." },
  { q: "Ai-je besoin de connaissances en finance pour utiliser Stensor ?", a: "Absolument pas. Stensor s'adapte à votre niveau de connaissance. Que vous débutiez ou que vous soyez un investisseur expérimenté, les réponses sont toujours calibrées pour vous." },
  { q: "Quel type de stratégies puis-je créer avec Stensor ?", a: "Investissement en ETF, remboursement de dettes, planification retraite, optimisation fiscale, revenus passifs — et bien plus. Si c'est financier, Stensor peut vous aider." },
  { q: "Mes données financières sont-elles en sécurité ?", a: "Totalement. Vos conversations sont privées et chiffrées. Nous ne revendons jamais vos informations. Votre vie financière reste strictement la vôtre." },
  { q: "Puis-je annuler mon abonnement à tout moment ?", a: "Oui, sans condition. Aucun contrat, aucuns frais cachés, aucune pénalité. Vous gardez l'accès jusqu'à la fin de votre période de facturation en cours." },
];

function useAuth() {
  const [isAuth, setIsAuth] = useState(null);
  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuth(auth);
    }).catch(() => setIsAuth(false));
  }, []);
  return isAuth;
}

function GlowOrb({ x, y, size, color, opacity }) {
  return (
    <div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: x, top: y, width: size, height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity, filter: 'blur(60px)', transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

function FeatureCard({ card, index, onCta }) {
  const ref = useRef(null);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full"
    >
      <div
        className="relative overflow-hidden p-10 md:p-16"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Subtle gradient accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${index % 2 === 0 ? '0% 100%' : '100% 0%'}, rgba(221,255,0,0.04) 0%, transparent 60%)`,
          }}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-8">
            <span
              className="text-[11px] font-black tracking-[0.2em] uppercase"
              style={{ color: 'rgba(221,255,0,0.5)' }}
            >
              {card.num} / {card.total}
            </span>
            <div className="w-1 h-1 rounded-full mt-2" style={{ background: 'rgba(221,255,0,0.3)' }} />
          </div>

          <h3
            className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-6"
            style={{ color: 'white' }}
          >
            {card.title}
          </h3>
          <p
            className="text-base leading-relaxed max-w-xl mb-10"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {card.desc}
          </p>

          <button
            onClick={onCta}
            className="inline-flex items-center gap-3 px-7 py-3.5 font-black text-sm transition-all hover:gap-4"
            style={{ background: '#DDFF00', color: '#0A0A0A' }}
          >
            Obtenir ma stratégie <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuth = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);

  useEffect(() => {
    if (isAuth === true) navigate('/app', { replace: true });
  }, [isAuth, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCta = async () => {
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) navigate('/app');
      else base44.auth.redirectToLogin('/app');
    } catch {
      base44.auth.redirectToLogin('/app');
    }
  };

  const handleTopicClick = async (topic) => {
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) {
        navigate(`/chat?q=${encodeURIComponent(topic)}`);
      } else {
        localStorage.setItem(PENDING_KEY, topic);
        base44.auth.redirectToLogin('/app');
      }
    } catch {
      localStorage.setItem(PENDING_KEY, topic);
      base44.auth.redirectToLogin('/app');
    }
  };

  if (isAuth === null) return null;

  return (
    <div
      className="min-h-screen font-be"
      style={{ background: '#050508', overflowX: 'hidden', color: 'white' }}
    >
      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(13,13,24,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="Stensor" className="w-7 h-7 object-contain" />
            <span className="font-black text-sm tracking-tight">Stensor</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['Fonctionnalités', '/fonctionnalites'], ['Tarifs', '/tarifs']].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-xs font-medium transition-all"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              >
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => base44.auth.redirectToLogin('/app?mode=login')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 font-black text-xs transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Se connecter
            </button>
            <button
              onClick={handleCta}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 font-black text-xs transition-all hover:opacity-90"
              style={{ background: '#DDFF00', color: '#0A0A0A' }}
            >
              Créer un compte <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setMobileMenu(o => !o)}
              className="md:hidden"
              style={{ color: 'white' }}
            >
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden md:hidden"
              style={{ background: 'rgba(5,5,8,0.96)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="px-6 py-6 flex flex-col gap-5">
                {[['Fonctionnalités', '#features'], ['Tarifs', '/pricing']].map(([label, href]) => (
                  <a key={label} href={href} className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }} onClick={() => setMobileMenu(false)}>
                    {label}
                  </a>
                ))}
                <button onClick={() => { setMobileMenu(false); handleCta(); }} className="w-full py-3.5 font-black text-sm" style={{ background: '#DDFF00', color: '#0A0A0A' }}>
                  Commencer gratuitement
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ paddingTop: '120px', paddingBottom: '80px' }}
      >
        <GlowOrb x="20%" y="30%" size="600px" color="rgba(221,255,0,0.07)" opacity={1} />
        <GlowOrb x="80%" y="60%" size="500px" color="rgba(100,50,255,0.06)" opacity={1} />
        <GlowOrb x="50%" y="80%" size="400px" color="rgba(0,200,255,0.04)" opacity={1} />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 mb-10"
            style={{ border: '1px solid rgba(221,255,0,0.15)', background: 'rgba(221,255,0,0.04)' }}
          >
            <div className="w-1.5 h-1.5" style={{ background: '#DDFF00', borderRadius: '50%', boxShadow: '0 0 8px #DDFF00' }} />
            <span className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: '#DDFF00' }}>
              Coach financier IA
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-black tracking-tight leading-[1.02] mb-8"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)', color: 'white' }}
          >
            Bâtissons ensemble<br />
            <span
              style={{
                color: '#DDFF00',
                textShadow: '0 0 80px rgba(221,255,0,0.3)',
              }}
            >
              votre liberté financière.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base md:text-lg max-w-2xl mx-auto mb-14 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Stensor vous permet d'obtenir une stratégie financière complète et actionnable en quelques minutes, simplement avec vos mots. Sans tableur, sans jargon, sans effort.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Topics */}
            <p
              className="text-[10px] font-black tracking-[0.2em] uppercase mb-5"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              Vous ne savez pas par où commencer ? Essayez l'un de ces objectifs :
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 mb-10">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className="px-4 py-2 text-xs font-semibold transition-all duration-300"
                  style={{
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.45)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#DDFF00';
                    e.currentTarget.style.color = '#0A0A0A';
                    e.currentTarget.style.borderColor = '#DDFF00';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>

            <p className="text-sm font-bold mb-8" style={{ color: 'rgba(255,255,255,0.15)' }}>
              Tout est possible.
            </p>

            <button
              onClick={handleCta}
              className="inline-flex items-center gap-3 px-8 py-4 font-black text-sm transition-all hover:gap-5 hover:opacity-90"
              style={{ background: '#DDFF00', color: '#0A0A0A', boxShadow: '0 0 60px rgba(221,255,0,0.2)' }}
            >
              Obtenir ma stratégie <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.15)' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STACKING CARDS ── */}
      <StackingCards cards={CARDS} onCta={handleCta} />

      {/* ── PLANS ── */}
      {/* ── FAQ ── */}
      <section className="relative px-6 md:px-10 py-32">
        <GlowOrb x="20%" y="50%" size="600px" color="rgba(100,50,255,0.04)" opacity={1} />
        <div className="max-w-2xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(221,255,0,0.5)' }}>FAQ</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: 'white' }}>Foire aux questions</h2>
          </motion.div>

          <div className="space-y-px">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left gap-4 transition-all"
                  onMouseEnter={e => (e.currentTarget.style.paddingLeft = '4px')}
                  onMouseLeave={e => (e.currentTarget.style.paddingLeft = '0')}
                >
                  <span className="text-sm font-semibold pr-4" style={{ color: openFaq === i ? 'white' : 'rgba(255,255,255,0.6)' }}>
                    {faq.q}
                  </span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#DDFF00' }} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="relative px-6 text-center py-40 overflow-hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <GlowOrb x="50%" y="50%" size="1000px" color="rgba(221,255,0,0.05)" opacity={1} />
        <GlowOrb x="50%" y="50%" size="400px" color="rgba(221,255,0,0.08)" opacity={1} />
        <div className="relative max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="font-black tracking-tight leading-tight mb-8"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', color: 'white' }}
          >
            Alors, qu'allons-nous<br />
            <span style={{ color: '#DDFF00', textShadow: '0 0 100px rgba(221,255,0,0.4)' }}>bâtir ?</span>
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            onClick={handleCta}
            className="inline-flex items-center gap-3 px-10 py-5 font-black text-base transition-all hover:gap-5"
            style={{ background: '#DDFF00', color: '#0A0A0A', boxShadow: '0 0 80px rgba(221,255,0,0.25)' }}
          >
            Commencer à investir <ArrowRight className="w-5 h-5" />
          </motion.button>
          <p className="text-xs mt-8" style={{ color: 'rgba(255,255,255,0.12)' }}>
            Stensor est une plateforme propulsée par l'IA qui permet de structurer ses finances personnelles en quelques minutes. Avec Stensor, il suffit d'utiliser un langage naturel pour transformer ses objectifs en plans d'investissement, stratégies de désendettement et solutions de retraite prêts à l'emploi, sans aucune expertise requise.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-6 md:px-10 py-10"
        style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="w-4 h-4 object-contain opacity-20" />
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.12)' }}>Stensor 2026</span>
          </div>
          <div className="flex gap-6">
            {[['Conditions', '/terms'], ['Confidentialité', '/privacy'], ['Support', '/support']].map(([l, h]) => (
              <a key={l} href={h} className="text-xs transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.15)' }}>{l}</a>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.06)' }}>Les réponses IA peuvent contenir des inexactitudes</p>
        </div>
      </footer>
    </div>
  );
}