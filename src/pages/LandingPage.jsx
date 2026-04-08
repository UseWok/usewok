import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Zap, ArrowRight, Globe, Menu, X, Check, ChevronDown, Brain, Lock, Lightbulb, Shield } from 'lucide-react';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
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

const FEATURES = [
  {
    icon: Brain,
    title: 'Votre stratégie en quelques secondes',
    desc: 'Décrivez vos objectifs et obtenez un plan d\'action complet adapté à votre situation financière.',
  },
  {
    icon: Zap,
    title: 'Coach disponible 24h/24',
    desc: 'Vos questions, vos réponses. Sans attendre. Sans jugement. À tout moment.',
  },
  {
    icon: Shield,
    title: 'IA de pointe, données sécurisées',
    desc: 'GPT, Claude, Gemini. Les meilleurs modèles du marché. Vos données restent privées.',
  },
  {
    icon: Lightbulb,
    title: 'Stratégies d\'experts accessibles',
    desc: 'Investissement, fiscalité, patrimoine. Autrefois réservé aux riches. Maintenant pour tous.',
  },
];

const WHY_STENSOR = [
  { icon: '⚡', title: 'Réponse instantanée', desc: 'Moins de 3 secondes' },
  { icon: '🎯', title: 'Plans sur mesure', desc: 'Basés sur votre situation exacte' },
  { icon: '🔒', title: 'Totalement privé', desc: 'Vos données ne quittent jamais' },
  { icon: '💰', title: '10× moins cher', desc: 'Qu\'un conseiller traditionnel' },
];

const FAQS = [
  { q: 'Qu\'est-ce que Stensor ?', a: 'Stensor est un coach financier IA qui vous aide à prendre de meilleures décisions : investissement, budget, épargne, stratégies patrimoniales.' },
  { q: 'Ai-je besoin de connaissances financières ?', a: 'Non. Stensor s\'adapte à votre niveau, que vous soyez débutant complet ou investisseur expérimenté.' },
  { q: 'Comment fonctionnent les Tensors ?', a: '1 Tensor = 1 réponse IA. Votre quota se renouvelle chaque mois selon votre plan. Le plan gratuit inclut 30 Tensors/mois.' },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Oui. Vos conversations sont privées et chiffrées. Nous ne partageons jamais vos informations.' },
  { q: 'Puis-je annuler mon abonnement ?', a: 'Oui, à tout moment. Pas de contrat, pas de pénalité. Vous gardez l\'accès jusqu\'à la fin de votre période de facturation.' },
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
        style={{ border: '2px solid ' + YUZU, boxShadow: '0 12px 48px rgba(221,255,0,0.15)' }}>
        <div className="px-6 pt-5 pb-2">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={e => { setQuery(e.target.value); autoResize(); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleStart(); } }}
            placeholder="Ex: Comment investir 500€/mois à 30 ans ?"
            rows={2}
            className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed"
            style={{ color: FG, minHeight: '52px' }}
          />
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={handleStart}
            disabled={!query.trim() || loading}
            className="w-full py-3 font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: query.trim() ? FG : 'rgba(0,0,0,0.08)', color: query.trim() ? YUZU : FG }}>
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-current rounded-full animate-spin" />
              : <><ArrowRight className="w-4 h-4" /> Commencer</>}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-5">
        {TOPICS.map(topic => (
          <button key={topic}
            onClick={() => { setQuery(topic); setTimeout(autoResize, 10); }}
            className="px-3.5 py-1.5 text-xs font-semibold transition-all"
            style={{ background: FG, color: YUZU, border: '1px solid ' + FG }}
            onMouseEnter={e => { e.currentTarget.style.background = YUZU; e.currentTarget.style.color = FG; }}
            onMouseLeave={e => { e.currentTarget.style.background = FG; e.currentTarget.style.color = YUZU; }}>
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}

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
      navigate('/app');
      return;
    }
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) {
        const params = new URLSearchParams({ q: query, mode: 'thinking', model: 'gemini_3_1_pro', webSearch: '0' });
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
    <div className="min-h-screen font-be" style={{ background: '#000000', overflowX: 'hidden', color: FG }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all m-4"
        style={{
          background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          border: scrolled ? '1px solid rgba(221,255,0,0.1)' : 'none',
        }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Stensor" className="w-9 h-9 object-contain" />
            <span className="font-black text-lg text-white">Stensor</span>
          </div>

          <div className="hidden md:flex items-center gap-12">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href}
                className="text-sm font-semibold transition-opacity hover:opacity-60"
                style={{ color: '#aaa' }}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex w-8 h-8 items-center justify-center transition-opacity hover:opacity-60"
              style={{ color: YUZU }}>
              <Globe className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleStart('')}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 font-black text-sm transition-all hover:opacity-88"
              style={{ background: YUZU, color: FG }}>
              Commencer
            </button>
            <button onClick={() => setMobileMenuOpen(o => !o)}
              className="flex md:hidden w-8 h-8 items-center justify-center"
              style={{ background: 'rgba(221,255,0,0.1)', color: YUZU }}>
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
              style={{ background: 'rgba(10,10,10,0.8)', borderTop: '1px solid rgba(221,255,0,0.1)' }}>
              <div className="px-6 py-4 flex flex-col gap-3">
                {NAV_LINKS.map(link => (
                  <a key={link.label} href={link.href}
                    className="text-sm font-semibold"
                    style={{ color: '#aaa' }}
                    onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleStart(''); }}
                  className="w-full py-2.5 font-black text-sm"
                  style={{ background: YUZU, color: FG }}>
                  Commencer →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-36 pb-20 px-6" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: '500px', height: '500px', background: `radial-gradient(circle, rgba(221,255,0,0.08) 0%, transparent 70%)`, filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', top: '40%', right: '0%', width: '600px', height: '400px', background: `radial-gradient(circle, rgba(221,255,0,0.05) 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center w-full">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 mb-10"
            style={{ background: 'rgba(221,255,0,0.08)', border: '1px solid rgba(221,255,0,0.2)' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: YUZU }} />
            <span className="text-[11px] font-black tracking-widest" style={{ color: YUZU }}>IA POUR VOTRE ARGENT</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
            className="text-6xl md:text-8xl font-black tracking-tight leading-[1.04] mb-8"
            style={{ color: 'white' }}>
            Bâtissons ensemble<br />
            <span style={{ color: YUZU }}>votre liberté<br />financière.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: '#aaa' }}>
            Stratégies d'investissement, plans d'action, conseils financiers. À vos questions, en quelques secondes.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <LandingInput onStart={handleStart} />
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-xs mt-8" style={{ color: '#666' }}>
            Gratuit pour commencer · Aucune carte bancaire
          </motion.p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6" style={{ background: '#0a0a0a' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: YUZU }}>Fonctionnalités</p>
            <h2 className="text-4xl md:text-6xl font-black mb-5" style={{ color: 'white' }}>Une IA conçue pour<br />votre situation financière</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="p-8"
                  style={{ background: 'rgba(221,255,0,0.04)', border: '1px solid rgba(221,255,0,0.15)' }}>
                  <div className="w-12 h-12 flex items-center justify-center mb-5"
                    style={{ background: YUZU }}>
                    <Icon className="w-6 h-6" style={{ color: FG }} />
                  </div>
                  <h3 className="text-xl font-black mb-3" style={{ color: 'white' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#aaa' }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY STENSOR ── */}
      <section className="py-24 px-6" style={{ background: '#000000' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: YUZU }}>Pourquoi Stensor ?</p>
            <h2 className="text-4xl md:text-6xl font-black" style={{ color: 'white' }}>
              Les experts ont un coach.<br />
              <span style={{ color: YUZU }}>Maintenant vous aussi.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WHY_STENSOR.map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6"
                style={{ background: 'rgba(221,255,0,0.06)', border: '1px solid rgba(221,255,0,0.12)' }}>
                <span className="text-3xl block mb-3">{item.icon}</span>
                <p className="text-sm font-black" style={{ color: YUZU }}>{item.title}</p>
                <p className="text-xs mt-1" style={{ color: '#666' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="py-24 px-6" style={{ background: '#0a0a0a' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: YUZU }}>Tarifs</p>
            <h2 className="text-4xl md:text-6xl font-black mb-3" style={{ color: 'white' }}>Plans simples</h2>
            <p className="text-base" style={{ color: '#aaa' }}>Commencez gratuitement. Évoluez quand vous êtes prêt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '0', features: ['30 Tensors/mois', 'Mode Standard', '10 discussions'], highlight: false },
              { name: 'Essential', price: '9', features: ['100 Tensors/mois', 'Mode Avancé', '30 discussions', 'Fichiers joints'], highlight: false },
              { name: 'Advanced', price: '19', features: ['250 Tensors/mois', 'Recherche Internet', 'Discussions illimitées', 'Support prioritaire'], highlight: true },
            ].map(plan => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="p-8"
                style={{
                  background: plan.highlight ? YUZU : 'rgba(221,255,0,0.05)',
                  border: '1px solid ' + (plan.highlight ? YUZU : 'rgba(221,255,0,0.15)'),
                }}>
                {plan.highlight && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 mb-4 inline-block"
                    style={{ background: FG, color: YUZU }}>
                    Populaire
                  </span>
                )}
                <p className="font-black text-lg mb-2" style={{ color: plan.highlight ? FG : 'white' }}>{plan.name}</p>
                <p className="text-4xl font-black mb-6" style={{ color: plan.highlight ? FG : YUZU }}>
                  {plan.price}€<span className="text-sm font-normal" style={{ opacity: 0.5 }}>/mois</span>
                </p>
                <div className="space-y-3 mb-7">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div style={{ background: plan.highlight ? FG : YUZU, width: '4px', height: '4px' }} />
                      <span className="text-sm" style={{ color: plan.highlight ? FG : '#aaa' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleStart('')}
                  className="w-full py-3 font-black text-sm transition-all hover:opacity-88"
                  style={{
                    background: plan.highlight ? FG : YUZU,
                    color: plan.highlight ? YUZU : FG,
                  }}>
                  Commencer
                </button>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-10">
            <a href="/pricing" className="text-sm font-bold transition-opacity hover:opacity-60" style={{ color: YUZU }}>
              Voir tous les plans →
            </a>
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6" style={{ background: '#000000' }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-center mb-4" style={{ color: YUZU }}>FAQ</p>
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: 'white' }}>Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                style={{ border: '1px solid rgba(221,255,0,0.15)', overflow: 'hidden', background: 'rgba(221,255,0,0.02)' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(221,255,0,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="text-sm font-semibold pr-4" style={{ color: 'white' }}>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{ color: YUZU, transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      transition={{ duration: 0.18 }} className="overflow-hidden">
                      <p className="px-6 pb-4 text-sm leading-relaxed" style={{ color: '#aaa', borderTop: '1px solid rgba(221,255,0,0.08)' }}>
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
        style={{ background: '#0a0a0a' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '400px', background: `radial-gradient(ellipse, rgba(221,255,0,0.06) 0%, transparent 70%)` }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-6" style={{ color: 'white' }}>
            Alors, qu'allons-nous<br />
            <span style={{ color: YUZU }}>construire ensemble ?</span>
          </h2>
          <p className="text-base mb-10" style={{ color: '#aaa' }}>
            Des milliers d'utilisateurs bâtissent leur liberté financière avec Stensor.
          </p>
          <button onClick={() => handleStart('')}
            className="inline-flex items-center gap-3 px-8 py-4 font-black text-base transition-all hover:opacity-88"
            style={{ background: YUZU, color: FG }}>
            Commencer gratuitement <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6" style={{ background: '#000000', borderTop: '1px solid rgba(221,255,0,0.08)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Stensor" className="w-5 h-5 object-contain opacity-40" />
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>Stensor © 2026</span>
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
          <p className="text-xs text-center md:text-right" style={{ color: 'rgba(255,255,255,0.1)' }}>
            Les réponses IA peuvent contenir des erreurs
          </p>
        </div>
      </footer>
    </div>
  );
}