import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Zap, ArrowRight, TrendingUp, Brain, Shield, ChevronDown, Star, Check } from 'lucide-react';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const PURPLE = '#3A0088';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const TOPICS = [
  'Investir en ETF 📈',
  'Rembourser mes dettes 💪',
  'Construire ma retraite 🏝️',
  'Revenus passifs 💡',
  'Optimiser mes impôts 🎯',
];

const FEATURES = [
  {
    num: '01', title: 'Votre stratégie financière personnalisée',
    desc: 'Décrivez vos objectifs à Stensor et obtenez un plan d\'action concret, adapté à votre situation réelle — budget, épargne, investissement.',
  },
  {
    num: '02', title: 'Un coach disponible 24h/24',
    desc: 'Plus besoin d\'attendre un rendez-vous. Posez vos questions financières à tout moment, obtenez des réponses précises en quelques secondes.',
  },
  {
    num: '03', title: 'Des stratégies d\'experts, accessibles à tous',
    desc: 'Les meilleures stratégies d\'investissement et de gestion patrimoniale, autrefois réservées aux plus fortunés, maintenant à portée de main.',
  },
  {
    num: '04', title: 'Intelligence artificielle de pointe',
    desc: 'Accédez aux modèles IA les plus avancés du marché — GPT, Claude, Gemini — tous optimisés pour la finance.',
  },
];

const FAQS = [
  { q: 'Qu\'est-ce que Stensor ?', a: 'Stensor est un coach financier IA qui vous aide à prendre de meilleures décisions financières : investissement, budget, épargne, stratégies patrimoniales.' },
  { q: 'Ai-je besoin de connaissances financières ?', a: 'Non. Stensor s\'adapte à votre niveau, que vous soyez débutant complet ou investisseur expérimenté. Il explique simplement les concepts complexes.' },
  { q: 'Quelle est la différence avec un conseiller traditionnel ?', a: 'Stensor est disponible 24h/24, répond instantanément, et coûte une fraction du prix. Il traite vos questions sans jugement et avec toute l\'information disponible.' },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Oui. Vos conversations sont privées et chiffrées. Nous ne partageons jamais vos informations financières.' },
  { q: 'Comment fonctionnent les Tensors ?', a: '1 Tensor = 1 réponse IA. Votre quota se renouvelle chaque mois selon votre plan. Le plan gratuit inclut 30 Tensors/mois.' },
];

const STATS = [
  { value: '10 000+', label: 'utilisateurs actifs' },
  { value: '98%', label: 'satisfaction' },
  { value: '< 3s', label: 'temps de réponse' },
  { value: '24/7', label: 'disponible' },
];

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [query, setQuery] = useState('');

  const handleStart = async (q) => {
    setLoading(true);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        window.location.href = q ? `/app?q=${encodeURIComponent(q)}` : '/app';
      } else {
        base44.auth.redirectToLogin('/app');
      }
    } catch {
      base44.auth.redirectToLogin('/app');
    }
  };

  return (
    <div className="min-h-screen font-be" style={{ background: '#fafafa' }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <img src={LOGO_URL} alt="Stensor" className="w-8 h-8 object-contain" />
          <span className="font-black text-base" style={{ color: FG }}>Stensor</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Fonctionnalités', 'Tarifs', 'Communauté'].map(item => (
            <a key={item} href={item === 'Tarifs' ? '/pricing' : '#'}
              className="text-sm font-medium transition-opacity hover:opacity-60" style={{ color: '#555' }}>
              {item}
            </a>
          ))}
        </div>
        <button onClick={() => handleStart('')}
          className="px-5 py-2 text-sm font-black transition-all hover:opacity-85"
          style={{ background: PURPLE, color: 'white', borderRadius: '8px' }}>
          Commencer →
        </button>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6 text-center"
        style={{
          background: 'linear-gradient(160deg, #f5f0ff 0%, #fafafa 40%, #fffde7 100%)',
        }}>
        {/* Blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'rgba(58,0,136,0.06)', filter: 'blur(80px)', transform: 'translate(-50%,-50%)' }} />
        <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(221,255,0,0.12)', filter: 'blur(60px)', transform: 'translate(50%,-50%)' }} />

        <div className="relative max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-8"
            style={{ background: YUZU, borderRadius: '20px' }}>
            <Zap className="w-3 h-3" style={{ color: FG }} />
            <span className="text-[10px] font-black tracking-widest" style={{ color: FG }}>COACH FINANCIER IA · DISPONIBLE 24H/24</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6"
            style={{ color: FG }}>
            Bâtissons ensemble<br />
            <span style={{ color: PURPLE }}>votre liberté financière.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: '#666' }}>
            Analyses financières, stratégies d'investissement et plans d'action personnalisés — en quelques secondes.
          </motion.p>

          {/* Input CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-2 p-2 bg-white"
              style={{ borderRadius: '14px', border: '1.5px solid rgba(0,0,0,0.1)', boxShadow: '0 8px 40px rgba(58,0,136,0.08)' }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && query.trim()) handleStart(query); }}
                placeholder="Ex: Comment investir 500€/mois à 30 ans ?"
                className="flex-1 px-4 py-3 text-sm bg-transparent focus:outline-none"
                style={{ color: FG }} />
              <button onClick={() => handleStart(query)} disabled={loading}
                className="flex items-center gap-2 px-5 py-3 font-black text-sm transition-all disabled:opacity-60"
                style={{ background: PURPLE, color: 'white', borderRadius: '10px' }}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Démarrer</>
                )}
              </button>
            </div>
          </motion.div>

          {/* Topic chips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mb-4">
            <p className="w-full text-xs mb-1" style={{ color: '#bbb' }}>Essayez l'un de ces sujets :</p>
            {TOPICS.map(topic => (
              <button key={topic} onClick={() => { setQuery(topic); handleStart(topic); }}
                className="px-4 py-2 text-sm font-medium transition-all"
                style={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '20px', color: '#444' }}
                onMouseEnter={e => { e.currentTarget.style.background = PURPLE; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = PURPLE; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#444'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}>
                {topic}
              </button>
            ))}
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-xs" style={{ color: '#ccc' }}>
            Gratuit pour commencer · Aucune carte requise
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'white' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-black mb-1" style={{ color: PURPLE }}>{value}</p>
              <p className="text-sm" style={{ color: '#888' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-center mb-16" style={{ color: PURPLE }}>Tout est possible.</p>
          <div className="space-y-20">
            {FEATURES.map((f, i) => (
              <motion.div key={f.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-8 md:gap-16">
                <div className="flex-shrink-0 w-12 text-right">
                  <span className="text-sm font-black" style={{ color: 'rgba(0,0,0,0.15)' }}>{f.num}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-black mb-3" style={{ color: FG }}>{f.title}</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#666' }}>{f.desc}</p>
                  <button onClick={() => handleStart('')}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
                    style={{ color: PURPLE }}>
                    Commencer à créer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="hidden md:block flex-shrink-0 w-40 h-28 rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${i % 2 === 0 ? 'rgba(58,0,136,0.08)' : 'rgba(221,255,0,0.15)'}, rgba(0,0,0,0.03))`, border: '1px solid rgba(0,0,0,0.06)' }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 px-6" style={{ background: FG }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Tarifs</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Plans pour tous les besoins</h2>
          <p className="text-base mb-12" style={{ color: 'rgba(255,255,255,0.45)' }}>Commencez gratuitement. Évoluez quand vous êtes prêt.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { name: 'Free', price: '0', tensors: '30', highlight: false, features: ['30 Tensors/mois', 'Mode Standard', '10 discussions'] },
              { name: 'Essential', price: '9', tensors: '100', highlight: false, features: ['100 Tensors/mois', 'Mode Avancé', '30 discussions', 'Fichiers joints'] },
              { name: 'Advanced', price: '19', tensors: '250', highlight: true, features: ['250 Tensors/mois', 'Recherche Internet', 'Discussions illimitées', 'Support prioritaire'] },
            ].map(plan => (
              <div key={plan.name}
                className="p-6 text-left"
                style={{
                  background: plan.highlight ? YUZU : 'rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}>
                {plan.highlight && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 mb-3 inline-block"
                    style={{ background: FG, color: YUZU, borderRadius: '4px' }}>
                    Populaire
                  </span>
                )}
                <p className="font-black text-lg mb-1" style={{ color: plan.highlight ? FG : 'white' }}>{plan.name}</p>
                <p className="text-3xl font-black mb-4" style={{ color: plan.highlight ? FG : 'white' }}>
                  {plan.price}€<span className="text-sm font-normal opacity-50">/mois</span>
                </p>
                <div className="space-y-2 mb-5">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.highlight ? FG : YUZU }} />
                      <span className="text-sm" style={{ color: plan.highlight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleStart('')}
                  className="w-full py-2.5 font-black text-sm transition-all"
                  style={{ background: plan.highlight ? FG : 'rgba(255,255,255,0.1)', color: plan.highlight ? 'white' : 'white', borderRadius: '8px' }}>
                  Commencer
                </button>
              </div>
            ))}
          </div>

          <a href="/pricing" className="text-sm font-bold transition-opacity hover:opacity-70" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Voir tous les plans →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-center mb-4" style={{ color: PURPLE }}>FAQ</p>
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: FG }}>Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.01)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="text-sm font-semibold pr-4" style={{ color: FG }}>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{ color: '#bbb', transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      transition={{ duration: 0.18 }} className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#666', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
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

      {/* Final CTA */}
      <section className="py-24 px-6 text-center" style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #1a0040 100%)` }}>
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center"
            style={{ background: YUZU, borderRadius: '20px' }}>
            <img src={LOGO_URL} alt="Stensor" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Alors, qu'allons-nous<br />construire ensemble ?
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Rejoignez des milliers d'utilisateurs qui bâtissent leur liberté financière avec Stensor.
          </p>
          <button onClick={() => handleStart('')}
            className="inline-flex items-center gap-3 px-8 py-4 font-black text-base transition-all hover:opacity-88"
            style={{ background: YUZU, color: FG, borderRadius: '12px', boxShadow: '0 8px 32px rgba(221,255,0,0.25)' }}>
            Commencer gratuitement <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <p className="text-xs" style={{ color: '#ccc' }}>© 2026 Stensor · Les réponses IA peuvent contenir des erreurs</p>
      </footer>
    </div>
  );
}