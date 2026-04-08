import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Globe, Menu, X, ChevronDown, ChevronRight, Check, Minus } from 'lucide-react';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const PENDING_KEY = 'stensor_pending_query';

const NAV_LINKS = [
  { label: 'Fonctionnalites', href: '#features' },
  { label: 'Tarifs', href: '/pricing' },
  { label: 'Communaute', href: '/community' },
];

const TOPICS = [
  'Investir en ETF',
  'Rembourser mes dettes',
  'Construire ma retraite',
  'Revenus passifs',
  'Optimiser mes impots',
];

function LandingInput({ onStart }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const handleStart = () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    onStart(query.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white overflow-hidden"
        style={{ border: '2px solid ' + YUZU, boxShadow: '0 12px 48px rgba(221,255,0,0.12), 0 4px 16px rgba(0,0,0,0.08)' }}>
        <div className="px-6 pt-5 pb-2">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={e => { setQuery(e.target.value); autoResize(); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleStart(); } }}
            placeholder="Comment investir 500$/mois a 30 ans ?"
            rows={2}
            className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed"
            style={{ color: FG, minHeight: '52px' }}
          />
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={handleStart}
            disabled={!query.trim() || loading}
            className="w-full py-3.5 font-black text-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-40"
            style={{ background: query.trim() ? FG : 'rgba(0,0,0,0.08)', color: query.trim() ? YUZU : FG }}>
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-current rounded-full animate-spin" />
              : <><ArrowRight className="w-4 h-4" /> Obtenir ma strategie</>}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-5">
        {TOPICS.map(topic => (
          <button key={topic}
            onClick={() => { setQuery(topic); setTimeout(autoResize, 10); }}
            className="px-3.5 py-1.5 text-xs font-semibold transition-all"
            style={{ background: 'transparent', color: '#888', border: '1px solid rgba(255,255,255,0.12)' }}
            onMouseEnter={e => { e.currentTarget.style.background = YUZU; e.currentTarget.style.color = FG; e.currentTarget.style.borderColor = YUZU; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}

const PROOF_NUMBERS = [
  { value: '24/7', label: 'Disponibilite' },
  { value: '<3s', label: 'Temps de reponse' },
  { value: '10x', label: 'Moins cher qu\'un conseiller' },
  { value: '100%', label: 'Confidentialite' },
];

const PILLARS = [
  {
    number: '01',
    title: 'Votre situation, votre strategie',
    desc: 'Decrivez vos objectifs financiers. L\'IA analyse votre contexte — revenus, dettes, horizon — et construit un plan d\'action concret en quelques secondes.',
    visual: 'Strategie personnalisee',
  },
  {
    number: '02',
    title: 'Les meilleurs modeles IA du marche',
    desc: 'GPT, Claude, Gemini. Nous selectionnons le meilleur modele pour chaque question. Vous obtenez des reponses de niveau expert, sans le prix d\'un conseiller.',
    visual: 'Intelligence artificielle avancee',
  },
  {
    number: '03',
    title: 'Un coach, pas un chatbot',
    desc: 'Stensor ne se contente pas de repondre. Il structure, challenge, et vous pousse vers l\'action. Chaque reponse est un pas vers votre liberte financiere.',
    visual: 'Coaching actionnable',
  },
];

const TRANSFORMATION = [
  { before: 'Vous ne savez pas ou placer votre argent', after: 'Un portefeuille diversifie, adapte a votre profil' },
  { before: 'Les conseillers financiers sont hors budget', after: 'Des strategies d\'expert pour une fraction du prix' },
  { before: 'L\'information financiere est ecrasante', after: 'Des reponses claires, structurees, actionnables' },
  { before: 'Vous reportez vos decisions financieres', after: 'Un plan d\'action immediat, etape par etape' },
];

const PLANS_PREVIEW = [
  { name: 'Free', price: '0', period: '', features: ['10 Tensors/mois', 'Mode Standard', '15 discussions'], cta: 'Commencer gratuitement' },
  { name: 'Essential', price: '20', period: '/mois', features: ['100 Tensors/mois', 'Mode Avance', '30 discussions', 'Fichiers joints'], cta: 'Choisir Essential' },
  { name: 'Advanced', price: '50', period: '/mois', features: ['250 Tensors/mois', 'Recherche Internet', 'Discussions illimitees', 'Support prioritaire'], cta: 'Choisir Advanced', popular: true },
];

const FAQS = [
  { q: 'Qu\'est-ce que Stensor exactement ?', a: 'Stensor est votre coach financier personnel propulse par l\'IA. Il analyse votre situation, repond a vos questions et construit des plans d\'action concrets pour atteindre vos objectifs financiers.' },
  { q: 'Ai-je besoin de connaissances en finance ?', a: 'Absolument pas. Stensor s\'adapte a votre niveau. Que vous debutiez ou que vous soyez investisseur confirme, les reponses sont calibrees pour vous.' },
  { q: 'Comment fonctionnent les Tensors ?', a: 'Les Tensors sont l\'unite de mesure de votre utilisation. Chaque interaction consomme des Tensors selon la complexite. Votre quota se renouvelle chaque mois.' },
  { q: 'Mes donnees sont-elles protegees ?', a: 'Totalement. Vos conversations sont privees et chiffrees. Nous ne revendons jamais vos informations. Votre vie financiere reste la votre.' },
  { q: 'Puis-je annuler a tout moment ?', a: 'Oui, sans condition. Pas de contrat, pas de frais caches, pas de penalite. Vous gardez l\'acces jusqu\'a la fin de votre periode de facturation.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) navigate('/app', { replace: true });
      else setIsAuth(false);
    }).catch(() => setIsAuth(false));
  }, [navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleStart = async (query) => {
    if (!query?.trim()) {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (auth) { navigate('/app'); return; }
      } catch {}
      base44.auth.redirectToLogin('/app');
      return;
    }
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) {
        const params = new URLSearchParams({ q: query });
        navigate(`/chat?${params.toString()}`);
      } else {
        localStorage.setItem(PENDING_KEY, query);
        base44.auth.redirectToLogin('/app');
      }
    } catch {
      localStorage.setItem(PENDING_KEY, query);
      base44.auth.redirectToLogin('/app');
    }
  };

  if (isAuth === null) return null;

  return (
    <div className="min-h-screen font-be" style={{ background: '#000000', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all"
        style={{
          background: scrolled ? 'rgba(0,0,0,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="Stensor" className="w-8 h-8 object-contain" />
            <span className="font-black text-base text-white tracking-tight">Stensor</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href}
                className="text-[13px] font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => base44.auth.redirectToLogin('/app')}
              className="hidden md:block text-[13px] font-semibold transition-colors px-4 py-2"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
              Connexion
            </button>
            <button
              onClick={() => handleStart('')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 font-black text-[13px] transition-all hover:opacity-90"
              style={{ background: YUZU, color: FG }}>
              Commencer
            </button>
            <button onClick={() => setMobileMenuOpen(o => !o)}
              className="flex md:hidden w-8 h-8 items-center justify-center"
              style={{ color: 'white' }}>
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="px-6 py-5 flex flex-col gap-4">
                {NAV_LINKS.map(link => (
                  <a key={link.label} href={link.href}
                    className="text-sm font-medium"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                    onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleStart(''); }}
                  className="w-full py-3 font-black text-sm"
                  style={{ background: YUZU, color: FG }}>
                  Commencer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 md:pt-40 pb-24 px-6" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        {/* Subtle glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '500px', background: `radial-gradient(ellipse, rgba(221,255,0,0.06) 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center w-full">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8"
            style={{ border: '1px solid rgba(221,255,0,0.2)', background: 'rgba(221,255,0,0.05)' }}>
            <div className="w-1.5 h-1.5" style={{ background: YUZU }} />
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: YUZU }}>Coach financier IA</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[1.02] mb-8"
            style={{ color: 'white' }}>
            Votre argent merite
            <br />
            <span style={{ color: YUZU }}>mieux qu'un tableur.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-base md:text-lg max-w-xl mx-auto mb-14 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            Stensor est le coach financier que vous n'avez jamais eu.
            Strategies d'investissement, plans d'action, decisions eclairees
            — en quelques secondes, pas en quelques semaines.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <LandingInput onStart={handleStart} />
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-xs mt-10" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Gratuit pour commencer. Aucune carte bancaire requise.
          </motion.p>
        </div>
      </section>

      {/* PROOF BAR */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {PROOF_NUMBERS.map((item, i) => (
            <motion.div key={item.label}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="text-center">
              <p className="text-3xl md:text-4xl font-black mb-1" style={{ color: YUZU }}>{item.value}</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* THE PROBLEM / TRANSFORMATION */}
      <section className="py-28 px-6" style={{ background: '#050505' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: YUZU }}>Le constat</p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight" style={{ color: 'white' }}>
              La finance personnelle ne devrait<br />
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>pas etre un privilege.</span>
            </h2>
          </div>

          <div className="space-y-4">
            {TRANSFORMATION.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-[1fr,40px,1fr] gap-4 items-center p-6"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  <Minus className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.15)' }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.before}</p>
                </div>
                <div className="hidden md:flex items-center justify-center">
                  <ChevronRight className="w-5 h-5" style={{ color: YUZU }} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: YUZU }} />
                  <p className="text-sm font-semibold" style={{ color: 'white' }}>{item.after}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — PILLARS */}
      <section id="features" className="py-28 px-6" style={{ background: '#000' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: YUZU }}>Comment ca marche</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: 'white' }}>
              Trois piliers.<br />
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Un seul objectif.</span>
            </h2>
          </div>

          <div className="space-y-6">
            {PILLARS.map((pillar, i) => (
              <motion.div key={pillar.number}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="grid grid-cols-1 md:grid-cols-[80px,1fr] gap-6 p-8 md:p-10"
                style={{ background: 'rgba(221,255,0,0.02)', border: '1px solid rgba(221,255,0,0.08)' }}>
                <div>
                  <span className="text-5xl font-black" style={{ color: 'rgba(221,255,0,0.15)' }}>{pillar.number}</span>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black mb-4" style={{ color: 'white' }}>{pillar.title}</h3>
                  <p className="text-sm leading-relaxed max-w-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>{pillar.desc}</p>
                  <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5"
                    style={{ background: 'rgba(221,255,0,0.06)', border: '1px solid rgba(221,255,0,0.12)' }}>
                    <div className="w-1 h-1" style={{ background: YUZU }} />
                    <span className="text-[11px] font-bold" style={{ color: YUZU }}>{pillar.visual}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF QUOTE */}
      <section className="py-24 px-6" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="w-12 h-[2px] mx-auto mb-10" style={{ background: YUZU }} />
            <p className="text-xl md:text-2xl font-medium leading-relaxed italic mb-8"
              style={{ color: 'rgba(255,255,255,0.7)' }}>
              "En 10 minutes avec Stensor, j'ai obtenu un plan d'investissement
              plus clair que 3 rendez-vous avec mon banquier."
            </p>
            <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Un utilisateur Stensor
            </p>
          </motion.div>
        </div>
      </section>

      {/* PLANS */}
      <section className="py-28 px-6" style={{ background: '#000' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: YUZU }}>Tarifs</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: 'white' }}>
              Un investissement dans<br />
              <span style={{ color: YUZU }}>votre avenir financier.</span>
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Sans engagement. Annulez quand vous voulez.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS_PREVIEW.map(plan => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="p-7 relative"
                style={{
                  background: plan.popular ? YUZU : 'rgba(255,255,255,0.02)',
                  border: '1px solid ' + (plan.popular ? YUZU : 'rgba(255,255,255,0.06)'),
                }}>
                {plan.popular && (
                  <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-2.5 py-1"
                    style={{ background: FG, color: YUZU }}>
                    Populaire
                  </span>
                )}
                <p className="text-sm font-black mb-3" style={{ color: plan.popular ? FG : 'rgba(255,255,255,0.5)' }}>{plan.name}</p>
                <p className="text-4xl font-black mb-6" style={{ color: plan.popular ? FG : 'white' }}>
                  {plan.price}$<span className="text-sm font-normal" style={{ opacity: 0.4 }}>{plan.period}</span>
                </p>
                <div className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-1 h-1 flex-shrink-0" style={{ background: plan.popular ? FG : YUZU }} />
                      <span className="text-[13px]" style={{ color: plan.popular ? FG : 'rgba(255,255,255,0.5)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleStart('')}
                  className="w-full py-3 font-black text-sm transition-all hover:opacity-90"
                  style={{
                    background: plan.popular ? FG : 'rgba(255,255,255,0.06)',
                    color: plan.popular ? YUZU : 'white',
                    border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  }}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-8">
            <a href="/pricing" className="text-sm font-bold transition-opacity hover:opacity-60" style={{ color: YUZU }}>
              Comparer tous les plans
            </a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 px-6" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-center mb-5" style={{ color: YUZU }}>FAQ</p>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-14" style={{ color: 'white' }}>Vos questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="text-sm font-semibold pr-4" style={{ color: 'white' }}>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{ color: YUZU, transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      transition={{ duration: 0.18 }} className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 px-6 relative overflow-hidden text-center" style={{ background: '#000' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '400px', background: `radial-gradient(ellipse, rgba(221,255,0,0.04) 0%, transparent 70%)` }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ color: 'white' }}>
            Chaque jour sans strategie<br />
            <span style={{ color: YUZU }}>vous coute de l'argent.</span>
          </h2>
          <p className="text-base mb-12 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Rejoignez les utilisateurs qui construisent leur liberte financiere
            avec un coach IA disponible 24h/24.
          </p>
          <button onClick={() => handleStart('')}
            className="inline-flex items-center gap-3 px-8 py-4 font-black text-base transition-all hover:opacity-90"
            style={{ background: YUZU, color: FG }}>
            Commencer maintenant <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs mt-6" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Gratuit. Sans carte bancaire. Sans engagement.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Stensor" className="w-4 h-4 object-contain opacity-30" />
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.15)' }}>Stensor 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/terms" className="text-xs transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Conditions
            </a>
            <a href="/privacy" className="text-xs transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Confidentialite
            </a>
            <a href="/support" className="text-xs transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Support
            </a>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.08)' }}>
            Les reponses IA peuvent contenir des inexactitudes
          </p>
        </div>
      </footer>
    </div>
  );
}