import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowUp, ChevronDown, Globe } from 'lucide-react';

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
    num: '01', total: '04',
    title: 'Investissez à la vitesse de vos ambitions',
    desc: "Décrivez votre situation à Stensor et regardez vos doutes se transformer en un plan d'action clair et mathématique.",
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
  },
  {
    num: '02', total: '04',
    title: "L'ingénierie financière, en arrière-plan.",
    desc: "Allocation d'actifs, intérêts composés, gestion des risques et optimisation fiscale sont gérés automatiquement pendant que vous décrivez vos projets.",
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  },
  {
    num: '03', total: '04',
    title: "Actionnable, instantanément.",
    desc: "Dès la première discussion, vous obtenez les étapes exactes pour placer votre argent, automatiser vos finances et commencer à bâtir, dès aujourd'hui.",
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  },
  {
    num: '04', total: '04',
    title: "Un seul coach. Tous les cerveaux de l'IA.",
    desc: "Accédez aux tout derniers modèles d'intelligence artificielle (GPT, Claude, Gemini). Stensor sélectionne automatiquement le modèle le plus adapté à votre question.",
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
  },
];

const FAQS = [
  { q: "Qu'est-ce que Stensor ?", a: "Stensor est une plateforme propulsée par l'IA qui permet de structurer ses finances personnelles en quelques minutes. Il suffit d'utiliser un langage naturel pour transformer ses objectifs en plans d'investissement, stratégies de désendettement et solutions de retraite prêts à l'emploi." },
  { q: "Ai-je besoin de connaissances en finance pour utiliser Stensor ?", a: "Absolument pas. Stensor s'adapte à votre niveau de connaissance. Que vous débutiez ou que vous soyez un investisseur expérimenté, les réponses sont toujours calibrées pour vous." },
  { q: "Quel type de stratégies puis-je créer avec Stensor ?", a: "Investissement en ETF, remboursement de dettes, planification retraite, optimisation fiscale, revenus passifs — et bien plus. Si c'est financier, Stensor peut vous aider." },
  { q: "Mes données financières sont-elles en sécurité ?", a: "Totalement. Vos conversations sont privées et chiffrées. Nous ne revendons jamais vos informations. Votre vie financière reste strictement la vôtre." },
  { q: "Puis-je annuler mon abonnement à tout moment ?", a: "Oui, sans condition. Aucun contrat, aucuns frais cachés, aucune pénalité. Vous gardez l'accès jusqu'à la fin de votre période de facturation en cours." },
];

function useAuthState() {
  const [isAuth, setIsAuth] = useState(null);
  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => setIsAuth(false));
  }, []);
  return isAuth;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuth = useAuthState();
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAuth === true) navigate('/app', { replace: true });
  }, [isAuth, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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

  const handleSend = async () => {
    if (!query.trim()) return;
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) navigate(`/chat?q=${encodeURIComponent(query)}`);
      else {
        localStorage.setItem(PENDING_KEY, query);
        base44.auth.redirectToLogin('/app');
      }
    } catch {
      localStorage.setItem(PENDING_KEY, query);
      base44.auth.redirectToLogin('/app');
    }
  };

  const handleTopicClick = async (topic) => {
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) navigate(`/chat?q=${encodeURIComponent(topic)}`);
      else {
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
    <div className="min-h-screen font-be overflow-x-hidden" style={{ background: 'linear-gradient(160deg, #c8eee8 0%, #d8f0ea 20%, #e8f4f0 40%, #f5ede8 70%, #f8e8e0 100%)' }}>
      
      {/* ── FLOATING NAV ── */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3"
          style={{
            background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(20px)',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.10)' : '0 4px 20px rgba(0,0,0,0.06)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="Stensor" className="w-7 h-7 object-contain" />
            <span className="font-black text-sm tracking-tight text-gray-900">Stensor</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7">
            {[['Fonctionnalités', '/fonctionnalites'], ['Tarifs', '/tarifs']].map(([label, href]) => (
              <a key={label} href={href}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                {label}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => base44.auth.redirectToLogin('/app?mode=login')}
              className="hidden md:block text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
              Se connecter
            </button>
            <button
              onClick={handleCta}
              className="text-xs font-black px-4 py-2.5 transition-all hover:opacity-90"
              style={{ background: '#DDFF00', color: '#0A0A0A', borderRadius: '999px' }}>
              Commencer à créer
            </button>
          </div>
        </motion.nav>
      </div>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-black tracking-tight leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(3rem, 9vw, 6.5rem)', color: '#0A0A0A', maxWidth: '800px' }}
        >
          Bâtissons votre<br />liberté financière.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed"
          style={{ color: 'rgba(10,10,10,0.5)' }}
        >
          Stensor vous permet d'obtenir une stratégie financière complète et actionnable en quelques minutes, simplement avec vos mots. Sans tableur, sans jargon.
        </motion.p>

        {/* Big Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="w-full max-w-2xl mb-8"
        >
          <div
            className="relative flex items-end gap-3 p-5"
            style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,1)',
              boxShadow: '0 4px 40px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <textarea
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Décrivez votre situation financière…"
              rows={3}
              className="flex-1 resize-none bg-transparent text-sm focus:outline-none leading-relaxed"
              style={{ color: '#0A0A0A', minHeight: '72px' }}
            />
            <button
              onClick={handleSend}
              disabled={!query.trim()}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center transition-all"
              style={{
                borderRadius: '999px',
                background: query.trim() ? '#FF5722' : 'rgba(0,0,0,0.1)',
                cursor: query.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <ArrowUp className="w-4 h-4" style={{ color: query.trim() ? 'white' : '#bbb' }} />
            </button>
          </div>
        </motion.div>

        {/* Topics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(10,10,10,0.35)' }}>
            Vous ne savez pas par où commencer ? Essayez l'un de ces objectifs :
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                className="px-4 py-2 text-xs font-medium transition-all hover:shadow-md"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  color: 'rgba(10,10,10,0.7)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  borderRadius: '999px',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0A0A0A'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.color = 'rgba(10,10,10,0.7)'; }}
              >
                {topic}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── EVERYTHING IS POSSIBLE ── */}
      <section className="px-6 py-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-black text-3xl md:text-4xl"
          style={{ color: '#0A0A0A' }}
        >
          Tout est possible.
        </motion.h2>
      </section>

      {/* ── STACKING CARDS ── */}
      <section className="px-6 md:px-10 pb-32">
        <div className="max-w-5xl mx-auto space-y-6">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.num}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="sticky"
              style={{ top: `${80 + i * 16}px` }}
            >
              <div
                className="overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.95)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 48px rgba(0,0,0,0.08)',
                }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-64 md:flex-shrink-0 h-48 md:h-auto overflow-hidden" style={{ borderRadius: '20px 0 0 20px' }}>
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      style={{ filter: 'brightness(0.95)' }}
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-10 md:p-12">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(10,10,10,0.3)' }}>
                        {card.num} / {card.total}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black leading-tight mb-5" style={{ color: '#0A0A0A' }}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(10,10,10,0.5)' }}>
                      {card.desc}
                    </p>
                    <button
                      onClick={handleCta}
                      className="text-sm font-black px-6 py-3 transition-all hover:opacity-85"
                      style={{ background: '#0A0A0A', color: 'white', borderRadius: '999px' }}
                    >
                      Obtenir ma stratégie →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-black text-3xl md:text-5xl mb-4" style={{ color: '#0A0A0A' }}>
              Plans d'abonnement pour tous les besoins
            </h2>
            <p className="text-sm" style={{ color: 'rgba(10,10,10,0.45)' }}>
              Faites évoluer votre stratégie financière à votre rythme.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="p-10"
              style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', backdropFilter: 'blur(20px)' }}
            >
              <h3 className="text-xl font-black mb-2" style={{ color: '#0A0A0A' }}>Commencez gratuitement.</h3>
              <p className="text-3xl font-black mb-6" style={{ color: '#0A0A0A' }}>Gratuit</p>
              <div className="space-y-3 mb-8">
                {['10 crédits par mois', 'Mode Standard', '3 discussions max', 'Accès à toutes les bases'].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#DDFF00' }}>
                      <span className="text-[10px] font-black text-black">✓</span>
                    </div>
                    <span className="text-sm" style={{ color: 'rgba(10,10,10,0.6)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCta}
                className="w-full py-3.5 font-black text-sm transition-all hover:opacity-90"
                style={{ background: '#0A0A0A', color: 'white', borderRadius: '999px' }}
              >
                Commencer à créer
              </button>
            </motion.div>

            {/* Paid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-10"
              style={{ background: '#0A0A0A', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
            >
              <h3 className="text-xl font-black mb-2 text-white">Plans payants à partir de</h3>
              <p className="font-black mb-1" style={{ fontSize: '2.5rem', color: '#DDFF00' }}>9 €</p>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>/mois</p>
              <div className="space-y-3 mb-8">
                {['100+ crédits par mois', 'Modes Avancé & Expert', 'Discussions illimitées', 'Recherche Internet', 'Fichiers joints'].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#DDFF00' }}>
                      <span className="text-[10px] font-black text-black">✓</span>
                    </div>
                    <span className="text-sm text-white/70">{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/tarifs')}
                className="w-full py-3.5 font-black text-sm transition-all hover:opacity-90"
                style={{ background: '#DDFF00', color: '#0A0A0A', borderRadius: '999px' }}
              >
                Voir tous les plans →
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-black text-3xl md:text-5xl" style={{ color: '#0A0A0A' }}>Foire aux questions</h2>
          </motion.div>

          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.9)',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                >
                  <span className="text-sm font-semibold" style={{ color: '#0A0A0A' }}>{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(10,10,10,0.4)' }} />
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
                      <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: 'rgba(10,10,10,0.5)' }}>
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
      <section className="px-6 py-32 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-black tracking-tight mb-10"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', color: '#0A0A0A' }}
        >
          Alors, qu'allons-nous<br />bâtir ensemble ?
        </motion.h2>
        <motion.button
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
          onClick={handleCta}
          className="font-black text-base px-10 py-5 transition-all hover:opacity-90 hover:scale-105"
          style={{ background: '#0A0A0A', color: 'white', borderRadius: '999px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        >
          Commencer à investir →
        </motion.button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-10 py-10" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="w-5 h-5 object-contain opacity-40" />
            <span className="text-xs font-semibold" style={{ color: 'rgba(10,10,10,0.3)' }}>Stensor 2026</span>
          </div>
          <div className="flex gap-6">
            {[['Fonctionnalités', '/fonctionnalites'], ['Tarifs', '/tarifs'], ['Support', '/support']].map(([l, h]) => (
              <a key={l} href={h} className="text-xs transition-opacity hover:opacity-80" style={{ color: 'rgba(10,10,10,0.35)' }}>{l}</a>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'rgba(10,10,10,0.2)' }}>Les réponses IA peuvent contenir des inexactitudes</p>
        </div>
      </footer>
    </div>
  );
}