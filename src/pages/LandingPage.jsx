import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Zap, ArrowRight, Globe, Menu, X, Check, ChevronDown, Star, Shield, TrendingUp, Brain, Users, Lock } from 'lucide-react';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const PURPLE = '#3A0088';
const PURPLE_LIGHT = '#6B21D6';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const PENDING_KEY = 'stensor_pending_query';

const NAV_LINKS = [
  { label: 'Tarifs', href: '/pricing' },
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Communauté', href: '/community' },
];

const TOPICS = [
  'Investir en ETF 📈',
  'Rembourser mes dettes 💪',
  'Construire ma retraite 🏝️',
  'Revenus passifs 💡',
  'Optimiser mes impôts 🎯',
];

const STATS = [
  { value: '10 000+', label: 'utilisateurs actifs' },
  { value: '98%', label: 'satisfaction' },
  { value: '< 3s', label: 'temps de réponse' },
  { value: '24/7', label: 'disponible' },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Votre stratégie personnalisée',
    desc: 'Décrivez vos objectifs et obtenez un plan d\'action concret adapté à votre situation — budget, épargne, investissement.',
    accent: PURPLE,
  },
  {
    icon: Zap,
    title: 'Coach disponible 24h/24',
    desc: 'Plus besoin d\'attendre un rendez-vous. Posez vos questions financières à tout moment et obtenez des réponses précises en quelques secondes.',
    accent: PURPLE_LIGHT,
  },
  {
    icon: TrendingUp,
    title: 'Stratégies d\'experts accessibles',
    desc: 'Les meilleures stratégies d\'investissement et de gestion patrimoniale, autrefois réservées aux plus fortunés, maintenant à portée de main.',
    accent: '#7C3AED',
  },
  {
    icon: Shield,
    title: 'IA de pointe, données sécurisées',
    desc: 'GPT, Claude, Gemini — les modèles les plus puissants du marché, tous optimisés pour la finance. Vos données restent privées.',
    accent: PURPLE,
  },
];

const FAQS = [
  { q: 'Qu\'est-ce que Stensor ?', a: 'Stensor est un coach financier IA qui vous aide à prendre de meilleures décisions : investissement, budget, épargne, stratégies patrimoniales.' },
  { q: 'Ai-je besoin de connaissances financières ?', a: 'Non. Stensor s\'adapte à votre niveau, que vous soyez débutant complet ou investisseur expérimenté.' },
  { q: 'Quelle est la différence avec un conseiller traditionnel ?', a: 'Stensor est disponible 24h/24, répond instantanément, et coûte une fraction du prix. Sans jugement, avec toute l\'information disponible.' },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Oui. Vos conversations sont privées et chiffrées. Nous ne partageons jamais vos informations.' },
  { q: 'Comment fonctionnent les Tensors ?', a: '1 Tensor = 1 réponse IA. Votre quota se renouvelle chaque mois selon votre plan. Le plan gratuit inclut 30 Tensors/mois.' },
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
        style={{ border: '2px solid rgba(58,0,136,0.15)', borderRadius: '16px', boxShadow: '0 8px 40px rgba(58,0,136,0.12)' }}>
        <div className="px-5 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={e => { setQuery(e.target.value); autoResize(); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleStart(); } }}
            placeholder="Ex: Comment investir 500€/mois à 30 ans avec peu de risques ?"
            rows={2}
            className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed"
            style={{ color: FG, minHeight: '52px' }}
          />
        </div>
        <div className="px-4 pb-4">
          <button
            onClick={handleStart}
            disabled={!query.trim() || loading}
            className="w-full py-3.5 font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: query.trim() ? PURPLE : 'rgba(58,0,136,0.08)', color: query.trim() ? 'white' : PURPLE, borderRadius: '10px' }}>
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><ArrowRight className="w-4 h-4" /> Commencer</>}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {TOPICS.map(topic => (
          <button key={topic}
            onClick={() => { setQuery(topic); setTimeout(autoResize, 10); }}
            className="px-3.5 py-1.5 text-xs font-medium transition-all"
            style={{ background: 'rgba(58,0,136,0.06)', border: '1px solid rgba(58,0,136,0.12)', borderRadius: '20px', color: PURPLE }}
            onMouseEnter={e => { e.currentTarget.style.background = PURPLE; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(58,0,136,0.06)'; e.currentTarget.style.color = PURPLE; }}>
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleStart = async (query) => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const params = new URLSearchParams({ q: query, mode: 'thinking', model: 'gemini_3_1_pro', webSearch: '0' });
        window.location.href = `/chat?${params.toString()}`;
      } else {
        localStorage.setItem(PENDING_KEY, query);
        base44.auth.redirectToLogin('/app');
      }
    } catch {
      localStorage.setItem(PENDING_KEY, query);
      base44.auth.redirectToLogin('/app');
    }
  };

  return (
    <div className="min-h-screen font-be" style={{ background: '#fafafa', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all"
        style={{
          background: scrolled ? 'rgba(250,250,250,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
        }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="Stensor" className="w-8 h-8 object-contain" />
            <span className="font-black text-base" style={{ color: FG }}>Stensor</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href}
                className="text-sm font-medium transition-opacity hover:opacity-60"
                style={{ color: '#555' }}>
                {link.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="hidden md:flex w-9 h-9 items-center justify-center transition-opacity hover:opacity-60"
              style={{ color: '#666' }}>
              <Globe className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleStart('')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-black transition-all hover:opacity-88"
              style={{ background: PURPLE, color: 'white', borderRadius: '999px' }}>
              Commencer à créer
            </button>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(o => !o)}
              className="flex md:hidden w-9 h-9 items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
              {mobileMenuOpen ? <X className="w-4 h-4" style={{ color: FG }} /> : <Menu className="w-4 h-4" style={{ color: FG }} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-white"
              style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
              <div className="px-6 py-4 flex flex-col gap-4">
                {NAV_LINKS.map(link => (
                  <a key={link.label} href={link.href}
                    className="text-sm font-semibold py-1"
                    style={{ color: '#333' }}
                    onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleStart(''); }}
                  className="w-full py-3 font-black text-sm"
                  style={{ background: PURPLE, color: 'white', borderRadius: '12px' }}>
                  Commencer à créer →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-28 pb-20 px-6" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{ background: 'linear-gradient(160deg, #f3eeff 0%, #fafafa 50%, #fffde7 100%)' }} />
          <div className="absolute" style={{ top: '10%', left: '5%', width: '500px', height: '500px', background: `radial-gradient(circle, rgba(58,0,136,0.12) 0%, transparent 70%)`, filter: 'blur(40px)' }} />
          <div className="absolute" style={{ top: '20%', right: '5%', width: '400px', height: '400px', background: `radial-gradient(circle, rgba(107,33,214,0.08) 0%, transparent 70%)`, filter: 'blur(40px)' }} />
          <div className="absolute" style={{ bottom: '10%', left: '30%', width: '600px', height: '300px', background: `radial-gradient(circle, rgba(221,255,0,0.1) 0%, transparent 70%)`, filter: 'blur(60px)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center w-full">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8"
            style={{ background: 'rgba(58,0,136,0.08)', border: '1px solid rgba(58,0,136,0.15)', borderRadius: '999px' }}>
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: YUZU }}>
              <Zap className="w-2.5 h-2.5" style={{ color: FG }} />
            </div>
            <span className="text-xs font-black tracking-widest" style={{ color: PURPLE }}>COACH FINANCIER IA · 24H/24</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.04] mb-6">
            <span style={{ color: FG }}>Bâtissons ensemble</span>
            <br />
            <span style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_LIGHT} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              votre liberté financière.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: '#666' }}>
            Analyses financières, stratégies d'investissement et plans d'action personnalisés — en quelques secondes.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <LandingInput onStart={handleStart} />
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-xs mt-6" style={{ color: '#bbb' }}>
            Gratuit pour commencer · Aucune carte bancaire requise
          </motion.p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 px-6 bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-3xl font-black mb-1"
                style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_LIGHT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {value}
              </p>
              <p className="text-sm" style={{ color: '#888' }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6" style={{ background: '#fafafa' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Tout est possible.</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: FG }}>Une IA conçue pour<br />votre argent</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-7 bg-white"
                  style={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 20px rgba(0,0,0,0.04)' }}>
                  <div className="w-12 h-12 flex items-center justify-center mb-5"
                    style={{ background: `linear-gradient(135deg, ${f.accent}18, ${f.accent}08)`, borderRadius: '14px', border: `1px solid ${f.accent}20` }}>
                    <Icon className="w-5 h-5" style={{ color: f.accent }} />
                  </div>
                  <h3 className="text-lg font-black mb-2" style={{ color: FG }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#777' }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── IMMERSIVE SECTION ── */}
      <section className="py-24 px-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #1a0040 60%, #0d0020 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: `radial-gradient(circle, rgba(221,255,0,0.06) 0%, transparent 70%)` }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: `radial-gradient(circle, rgba(107,33,214,0.3) 0%, transparent 70%)` }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: 'rgba(221,255,0,0.6)' }}>Pourquoi Stensor ?</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
              Les experts financiers ont<br />
              <span style={{ color: YUZU }}>un coach personnel.</span><br />
              Maintenant vous aussi.
            </h2>
            <p className="text-base max-w-2xl mx-auto mb-12" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Stensor démocratise l'accès aux stratégies financières de haut niveau.
              Investissement, fiscalité, patrimoine — des réponses d'expert, accessibles à tous.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {[
                { icon: '🧠', title: 'IA de pointe', desc: 'Claude, GPT, Gemini — les meilleurs modèles du marché' },
                { icon: '⚡', title: 'Réponse instantanée', desc: 'Obtenez votre stratégie en moins de 3 secondes' },
                { icon: '🔒', title: '100% privé', desc: 'Vos données financières ne quittent jamais nos serveurs' },
              ].map(item => (
                <div key={item.title} className="p-5 text-left"
                  style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-2xl block mb-3">{item.icon}</span>
                  <p className="font-black text-white text-sm mb-1">{item.title}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <button onClick={() => handleStart('')}
              className="inline-flex items-center gap-3 px-8 py-4 font-black text-base transition-all hover:opacity-88"
              style={{ background: YUZU, color: FG, borderRadius: '14px', boxShadow: '0 8px 32px rgba(221,255,0,0.2)' }}>
              Démarrer gratuitement <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Tarifs</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3" style={{ color: FG }}>Plans pour tous les besoins</h2>
            <p className="text-base" style={{ color: '#888' }}>Commencez gratuitement. Évoluez quand vous êtes prêt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { name: 'Free', price: '0', features: ['30 Tensors/mois', 'Mode Standard', '10 discussions'], highlight: false },
              { name: 'Essential', price: '9', features: ['100 Tensors/mois', 'Mode Avancé', '30 discussions', 'Fichiers joints'], highlight: false },
              { name: 'Advanced', price: '19', features: ['250 Tensors/mois', 'Recherche Internet', 'Discussions illimitées', 'Support prioritaire'], highlight: true },
            ].map(plan => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="p-6"
                style={{
                  borderRadius: '20px',
                  background: plan.highlight ? `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_LIGHT} 100%)` : 'white',
                  border: plan.highlight ? 'none' : '1.5px solid rgba(0,0,0,0.08)',
                  boxShadow: plan.highlight ? `0 20px 60px rgba(58,0,136,0.25)` : '0 2px 16px rgba(0,0,0,0.04)',
                }}>
                {plan.highlight && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 mb-4 inline-block"
                    style={{ background: YUZU, color: FG, borderRadius: '6px' }}>
                    Populaire
                  </span>
                )}
                <p className="font-black text-lg mb-1" style={{ color: plan.highlight ? 'white' : FG }}>{plan.name}</p>
                <p className="text-3xl font-black mb-5" style={{ color: plan.highlight ? 'white' : FG }}>
                  {plan.price}€<span className="text-sm font-normal" style={{ opacity: 0.5 }}>/mois</span>
                </p>
                <div className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0"
                        style={{ background: plan.highlight ? 'rgba(255,255,255,0.15)' : 'rgba(58,0,136,0.08)', borderRadius: '4px' }}>
                        <Check className="w-2.5 h-2.5" style={{ color: plan.highlight ? YUZU : PURPLE }} />
                      </div>
                      <span className="text-sm" style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#555' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleStart('')}
                  className="w-full py-2.5 font-black text-sm transition-all hover:opacity-88"
                  style={{
                    background: plan.highlight ? YUZU : PURPLE,
                    color: plan.highlight ? FG : 'white',
                    borderRadius: '10px',
                  }}>
                  Commencer
                </button>
              </motion.div>
            ))}
          </div>
          <p className="text-center">
            <a href="/pricing" className="text-sm font-bold transition-opacity hover:opacity-60" style={{ color: PURPLE }}>
              Voir tous les plans →
            </a>
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6" style={{ background: '#fafafa' }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-center mb-4" style={{ color: PURPLE }}>FAQ</p>
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: FG }}>Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                style={{ border: '1.5px solid rgba(58,0,136,0.1)', borderRadius: '14px', overflow: 'hidden', background: 'white' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(58,0,136,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="text-sm font-semibold pr-4" style={{ color: FG }}>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{ color: PURPLE, transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      transition={{ duration: 0.18 }} className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#666', borderTop: '1px solid rgba(58,0,136,0.06)' }}>
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
      <section className="py-24 px-6 relative overflow-hidden text-center"
        style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #1a0040 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '400px', background: `radial-gradient(ellipse, rgba(221,255,0,0.06) 0%, transparent 70%)` }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center"
            style={{ background: YUZU, borderRadius: '20px', boxShadow: '0 8px 32px rgba(221,255,0,0.3)' }}>
            <img src={LOGO_URL} alt="Stensor" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Alors, qu'allons-nous<br />construire ensemble ?
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Rejoignez des milliers d'utilisateurs qui bâtissent leur liberté financière avec Stensor.
          </p>
          <button onClick={() => handleStart('')}
            className="inline-flex items-center gap-3 px-8 py-4 font-black text-base transition-all hover:opacity-88"
            style={{ background: YUZU, color: FG, borderRadius: '14px', boxShadow: '0 8px 32px rgba(221,255,0,0.25)' }}>
            Commencer gratuitement <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain opacity-60" />
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>Stensor © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/terms" className="text-xs transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Conditions d'utilisation
            </a>
            <a href="/privacy" className="text-xs transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Politique de confidentialité
            </a>
            <a href="/support" className="text-xs transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Support
            </a>
          </div>
          <p className="text-xs text-center md:text-right" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Les réponses IA peuvent contenir des erreurs
          </p>
        </div>
      </footer>
    </div>
  );
}