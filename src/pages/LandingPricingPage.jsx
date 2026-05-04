import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Check, ArrowRight } from 'lucide-react';
import GuestQuiz from '@/components/landing/GuestQuiz';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { getLandingContent, LANDING_QUERY_KEY } from '@/lib/landing-content';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const LOGO = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const PLAN_FEATURES = {
  free:      ['10 Tensors/mois', '3 discussions max', 'Toutes les bases de connaissance'],
  essential: ['100 Tensors/mois', '30 discussions max', 'Upload de fichiers'],
  advanced:  ['250 Tensors/mois', 'Discussions illimitées', 'Recherche Internet', 'Upload de fichiers', 'Mode IA Avancé'],
  expert:    ['500 Tensors/mois', 'Discussions illimitées', 'Recherche Internet', 'Upload de fichiers', 'Mode IA Expert', 'Support prioritaire'],
  supreme:   ['1200 Tensors/mois', 'Discussions illimitées', 'Recherche Internet', 'Upload de fichiers', 'Mode IA Expert', 'Support prioritaire'],
};

function Scene({ children, bg = 'white', minH = '100vh' }) {
  return (
    <section className="relative w-full flex flex-col items-center justify-center px-6 md:px-8"
      style={{ minHeight: minH, background: bg }}>
      {children}
    </section>
  );
}

function Navbar({ scrolled }) {
  const navigate = useNavigate();
  return (
    <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center"
      style={{ paddingTop: 24 }}>
      <div className="flex items-center justify-between w-full px-6 py-3"
        style={{ maxWidth: 850, background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'all 0.4s ease', borderRadius: 999, border: '1px solid rgba(0,0,0,0.06)', boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)' }}>
      <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
        <img src={LOGO} alt="Stensor" className="w-5 h-5 object-contain" />
        <span className="text-sm font-black tracking-tight" style={{ color: FG }}>Stensor</span>
      </button>
      <div className="hidden md:flex items-center gap-8">
        <a href="/fonctionnalites" className="text-xs text-gray-400 hover:text-black transition-colors">Features</a>
        <span className="text-xs font-black text-black border-b border-black pb-0.5">Pricing</span>
        <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs text-gray-400 hover:text-black transition-colors">Sign in</button>
      </div>
      <motion.button onClick={() => base44.auth.redirectToLogin('/app')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="text-xs font-black px-5 py-2.5" style={{ background: FG, color: 'white', borderRadius: '6px' }}>
        Commencer →
      </motion.button>
      </div>
    </motion.header>
  );
}

export default function LandingPricingPage() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [plansConfig, setPlansConfig] = useState(() => getPlansConfig());
  const [billing, setBilling] = useState('monthly');
  const { data: landingData } = useQuery({ queryKey: LANDING_QUERY_KEY, queryFn: getLandingContent, staleTime: 0 });

  useEffect(() => { loadPlansFromDB().then(p => { if (p) setPlansConfig(p); }); }, []);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const visibleIds = ['free', 'essential', 'advanced', 'expert', 'supreme'];
  const planOverrides = landingData?.pricing?.plan_overrides || {};
  const plans = plansConfig
    .filter(p => visibleIds.includes(p.id))
    .sort((a, b) => visibleIds.indexOf(a.id) - visibleIds.indexOf(b.id))
    .map(p => ({ ...p, ...planOverrides[p.id] }));

  const handleCta = () => setShowQuiz(true);

  return (
    <div className="font-inter overflow-x-hidden bg-white">
      <AnimatePresence>{showQuiz && <GuestQuiz onClose={() => setShowQuiz(false)} />}</AnimatePresence>
      <Navbar scrolled={scrolled} />

      {/* HERO */}
      <Scene minH="100vh">
        <div className="text-center max-w-3xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
            style={{ color: 'rgba(0,0,0,0.2)' }}>
            Tarifs
          </motion.p>

          <div className="overflow-hidden mb-2">
            <motion.h1 initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: FG }}>
              Simple.
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-2">
            <motion.h1 initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.37, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: YELLOW }}>
              Transparent.
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-16">
            <motion.h1 initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.49, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: 'rgba(0,0,0,0.15)' }}>
              Sans surprise.
            </motion.h1>
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            className="text-base max-w-md mx-auto mb-12"
            style={{ color: 'rgba(0,0,0,0.35)', fontFamily: 'var(--font-open)' }}>
            Choisissez le plan qui garde vos plaisirs et construit votre richesse. Commencez gratuitement, sans carte bancaire.
          </motion.p>

          {/* Billing toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="inline-flex items-center gap-1 p-1 mb-4"
            style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="px-5 py-2 text-xs font-black transition-all"
                style={{
                  background: billing === b ? FG : 'transparent',
                  color: billing === b ? 'white' : 'rgba(0,0,0,0.4)',
                  borderRadius: '6px',
                }}>
                {b === 'monthly' ? 'Mensuel' : 'Annuel'}
                {b === 'yearly' && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded" style={{ background: YELLOW, color: FG }}>-20%</span>}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))' }} />
          <p className="text-[9px] tracking-[0.3em] uppercase text-gray-300">Plans</p>
        </motion.div>
      </Scene>

      {/* PLANS */}
      <Scene bg="#fafaf8" minH="100vh">
        <div className="w-full max-w-6xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-20 text-center"
            style={{ color: 'rgba(0,0,0,0.2)' }}>
            Choisissez votre niveau
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {plans.map((plan, i) => {
              const features = (plan.features?.length > 0) ? plan.features : (PLAN_FEATURES[plan.id] || []);
              const isHighlighted = plan.id === 'advanced';
              const price = billing === 'yearly'
                ? Math.round((plan.price_monthly || 0) * 0.8)
                : (plan.price_monthly || 0);

              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col p-6"
                  style={{
                    background: isHighlighted ? FG : 'white',
                    borderRadius: '12px',
                    border: isHighlighted ? 'none' : '1px solid rgba(0,0,0,0.06)',
                    boxShadow: isHighlighted ? '0 24px 64px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.04)',
                  }}>
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full"
                      style={{ background: YELLOW, color: FG }}>
                      Populaire
                    </div>
                  )}

                  <p className="text-[10px] font-black uppercase tracking-widest mb-4"
                    style={{ color: isHighlighted ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' }}>
                    {plan.name}
                  </p>

                  <div className="mb-6">
                    <span className="font-black" style={{ fontSize: '2.2rem', lineHeight: 1, color: isHighlighted ? 'white' : FG }}>
                      {plan.price_label || (price === 0 ? 'Gratuit' : `$${price}`)}
                    </span>
                    {price > 0 && <span className="text-xs ml-1" style={{ color: isHighlighted ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>/mois</span>}
                  </div>

                  <div className="mb-5" style={{ height: 1, background: isHighlighted ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }} />

                  <ul className="space-y-2.5 flex-1 mb-7">
                    {features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-xs">
                        <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: isHighlighted ? YELLOW : FG }} />
                        <span style={{ color: isHighlighted ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button onClick={handleCta}
                    className="w-full py-3 font-black text-xs transition-all hover:opacity-85"
                    style={{
                      background: isHighlighted ? YELLOW : FG,
                      color: isHighlighted ? FG : 'white',
                      borderRadius: '6px',
                    }}>
                    Start your engine
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Enterprise */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 text-center" style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="font-black text-base mb-2" style={{ color: FG }}>Plan Entreprise</p>
            <p className="text-xs mb-5" style={{ color: 'rgba(0,0,0,0.4)', fontFamily: 'var(--font-open)' }}>
              Tarif sur mesure pour les organisations avec des besoins illimités.
            </p>
            <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
              {['Tensors illimités', 'Support dédié', 'Intégrations custom', 'SLA Premium'].map(f => (
                <span key={f} className="text-xs text-gray-400">· {f}</span>
              ))}
            </div>
            <a href="mailto:contact.stensor@proton.me"
              className="inline-flex items-center gap-2 px-8 py-3 font-black text-xs rounded-lg transition-opacity hover:opacity-80"
              style={{ background: FG, color: 'white' }}>
              Contacter l'équipe <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          <p className="text-center text-[11px] mt-6 text-gray-300">
            Résiliation à tout moment · Aucuns frais cachés · Paiement sécurisé
          </p>
        </div>
      </Scene>

      {/* WHY PAY */}
      <Scene bg={FG} minH="80vh">
        <div className="w-full max-w-4xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-20 text-center"
            style={{ color: 'rgba(255,255,255,0.2)' }}>
            Pourquoi investir
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-center mb-16">
            <h2 className="font-black tracking-tighter text-white"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.0 }}>
              €15/mois investis ici<br />
              <span style={{ color: YELLOW }}>rapportent en moyenne €640/mois.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: '42×', label: 'ROI moyen', desc: 'Pour chaque euro investi dans Stensor, nos utilisateurs récupèrent en moyenne 42× via les optimisations trouvées.' },
              { n: '3 sem.', label: 'Pour voir les premiers résultats', desc: 'La plupart des utilisateurs identifient leurs premières économies dans les 3 premières semaines.' },
              { n: '0 sacrifice', label: 'Sur vos plaisirs', desc: 'Notre méthode ne touche jamais à ce qui vous rend heureux. C\'est notre promesse absolue.' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-7 flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="font-black" style={{ fontSize: '2.5rem', color: YELLOW, lineHeight: 1 }}>{s.n}</p>
                <p className="text-base font-black text-white">{s.label}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-open)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Scene>

      {/* FINAL CTA */}
      <Scene bg={YELLOW} minH="80vh">
        <div className="text-center max-w-2xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
            style={{ color: 'rgba(0,0,0,0.3)' }}>
            Commencez maintenant
          </motion.p>
          <div className="overflow-hidden mb-4">
            <motion.h2 initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', color: FG }}>
              Votre plaisir intact.
            </motion.h2>
          </div>
          <div className="overflow-hidden mb-16">
            <motion.h2 initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', color: 'rgba(0,0,0,0.22)' }}>
              Votre futur construit.
            </motion.h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }} className="flex flex-col items-center gap-4">
            <motion.button onClick={() => setShowQuiz(true)}
              whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-12 py-5 font-black text-base"
              style={{ background: FG, color: 'white', borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
              Start your engine <ArrowRight className="w-4 h-4" />
            </motion.button>
            <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>Sans carte. Résiliation à tout moment.</p>
          </motion.div>
        </div>
      </Scene>

      {/* Footer */}
      <footer className="px-8 md:px-10 py-10 flex items-center justify-between flex-wrap gap-4"
        style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <button onClick={() => window.location.href = '/'} className="flex items-center gap-2">
          <img src={LOGO} alt="Stensor" className="w-5 h-5 object-contain" />
          <span className="text-xs font-black" style={{ color: FG }}>Stensor</span>
        </button>
        <div className="flex items-center gap-6">
          {[['Features', '/fonctionnalites'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
            <a key={l} href={h} className="text-[11px] text-gray-300 hover:text-black transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-[10px] text-gray-200">2026 Stensor Inc.</p>
      </footer>
    </div>
  );
}