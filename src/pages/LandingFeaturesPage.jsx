import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check } from 'lucide-react';
import GuestQuiz from '@/components/landing/GuestQuiz';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const LOGO = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

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
        <span className="text-xs font-black text-black border-b border-black pb-0.5">Features</span>
        <a href="/tarifs" className="text-xs text-gray-400 hover:text-black transition-colors">Pricing</a>
        <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs text-gray-400 hover:text-black transition-colors">Sign in</button>
      </div>
      <motion.button onClick={() => base44.auth.redirectToLogin('/app')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="text-xs font-black px-5 py-2.5" style={{ background: FG, color: 'white', borderRadius: '6px' }}>
        Start free →
      </motion.button>
      </div>
    </motion.header>
  );
}

// ─── Feature deep-dive sections ───────────────────────────────────────────────
const FEATURE_SECTIONS = [
  {
    tag: '01 — Le Moteur',
    headline: 'Une IA calibrée sur votre vie.',
    sub: 'Pas un profil générique. Votre situation exacte.',
    desc: "Stensor ne connaît pas \"l'utilisateur moyen\". Il connaît vos revenus, vos objectifs, votre tolérance au risque, vos plaisirs intouchables. Chaque réponse est construite pour vous — et uniquement vous.",
    proof: [
      'Contexte cumulé sur des mois de conversation',
      'Stratégies adaptées à votre psychologie de dépense',
      'Recommandations qui évoluent avec votre situation',
    ],
    bg: 'white',
    dark: false,
    big: '"Ton plan, pas le plan."',
  },
  {
    tag: '02 — Le Simulateur',
    headline: 'Testez avant d\'agir.',
    sub: 'Chaque décision simulée avant d\'être prise.',
    desc: "\"Si j'investis €200/mois pendant 15 ans, où j'en suis ?\" Stensor simule, calcule, compare — en temps réel. Vous voyez l'impact avant de vous engager. Zéro surprise. Zéro regret.",
    proof: [
      'Simulations Monte Carlo en temps réel',
      'Comparaison de scénarios côte à côte',
      'Impact calculé à l\'euro près',
    ],
    bg: '#fafaf8',
    dark: false,
    big: '"Simulé. Validé. Exécuté."',
  },
  {
    tag: '03 — L\'Internet',
    headline: 'Données de marché en direct.',
    sub: 'L\'IA qui sait ce qui se passe maintenant.',
    desc: "Taux d'intérêt du moment, performance des ETF cette semaine, actualités qui impactent votre portefeuille. Stensor connecte l'analyse à la réalité — pas à des données d'il y a 6 mois.",
    proof: [
      'Données boursières et taux en temps réel',
      'Actualités financières intégrées à l\'analyse',
      'Alertes contextuelles sur votre situation',
    ],
    bg: FG,
    dark: true,
    big: '"L\'IA qui lit le monde, pas les manuels."',
  },
  {
    tag: '04 — Les Documents',
    headline: 'Vos vrais chiffres. Pas des estimations.',
    sub: 'Uploadez. Stensor lit, analyse, optimise.',
    desc: "Relevés bancaires, fiches de paie, contrats d'assurance. Stensor extrait vos vrais chiffres automatiquement et construit une stratégie basée sur votre réalité financière — pas sur ce que vous pensez qu'elle est.",
    proof: [
      'Lecture automatique de PDF, Excel, images',
      'Extraction des postes de dépenses cachés',
      'Analyse des contrats et assurances',
    ],
    bg: 'white',
    dark: false,
    big: '"Vos données, votre vérité."',
  },
  {
    tag: '05 — Le Coaching',
    headline: 'Un coach qui ne vous jugera jamais.',
    sub: 'Ni votre café du matin, ni vos sorties du vendredi.',
    desc: "Pas de moralisation. Pas de jugement. Pas de \"vous devriez faire mieux\". Stensor vous guide vers vos objectifs en partant de qui vous êtes — et en gardant intact ce qui vous rend heureux.",
    proof: [
      'Zéro restriction sur vos plaisirs identifiés',
      'Coaching positif basé sur le renforcement',
      'Progression mesurable et visible chaque semaine',
    ],
    bg: YELLOW,
    dark: false,
    big: '"Votre bonheur est le plan."',
    yellowBg: true,
  },
];

// ─── Interactive Feature Tabs ─────────────────────────────────────────────────
function FeatureDeepDive() {
  const [active, setActive] = useState(0);
  const f = FEATURE_SECTIONS[active];

  return (
    <Scene bg="#fafaf8" minH="100vh">
      <div className="w-full max-w-5xl mx-auto">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-20 text-center"
          style={{ color: 'rgba(0,0,0,0.2)' }}>
          Dans les détails
        </motion.p>

        {/* Tab pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {FEATURE_SECTIONS.map((s, i) => (
            <motion.button key={i} onClick={() => setActive(i)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 text-xs font-black transition-all"
              style={{
                background: active === i ? FG : 'rgba(0,0,0,0.04)',
                color: active === i ? 'white' : 'rgba(0,0,0,0.5)',
                borderRadius: '40px',
                border: active === i ? 'none' : '1px solid rgba(0,0,0,0.07)',
              }}>
              {s.tag}
            </motion.button>
          ))}
        </div>

        {/* Detail card */}
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid md:grid-cols-2 gap-4">

            <div className="p-10 flex flex-col justify-between"
              style={{
                background: f.dark ? FG : (f.yellowBg ? YELLOW : 'white'),
                borderRadius: '12px',
                border: !f.dark && !f.yellowBg ? '1px solid rgba(0,0,0,0.06)' : 'none',
                boxShadow: f.dark ? '0 24px 64px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.06)',
              }}>
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase mb-6"
                  style={{ color: f.dark ? 'rgba(255,255,255,0.3)' : (f.yellowBg ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.3)') }}>
                  {f.tag}
                </p>
                <h3 className="font-black tracking-tighter mb-3"
                  style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.05, color: f.dark ? 'white' : FG }}>
                  {f.headline}
                </h3>
                <p className="text-sm font-black mb-6"
                  style={{ color: f.dark ? YELLOW : (f.yellowBg ? FG : FG) }}>
                  {f.sub}
                </p>
                <p className="text-sm leading-relaxed"
                  style={{ color: f.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontFamily: 'var(--font-open)' }}>
                  {f.desc}
                </p>
              </div>
              <p className="text-2xl font-black mt-8"
                style={{ color: f.dark ? 'rgba(255,255,255,0.15)' : (f.yellowBg ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)'), fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>
                {f.big}
              </p>
            </div>

            <div className="p-10 flex flex-col justify-center gap-4"
              style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: 'rgba(0,0,0,0.25)' }}>
                Ce que ça change
              </p>
              {f.proof.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-5"
                  style={{ background: '#fafaf8', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: YELLOW }}>
                    <Check className="w-3 h-3" style={{ color: FG }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: FG }}>{p}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Scene>
  );
}

export default function LandingFeaturesPage() {
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleCta = () => setShowQuiz(true);

  return (
    <div className="font-inter overflow-x-hidden bg-white">
      <AnimatePresence>{showQuiz && <GuestQuiz onClose={() => setShowQuiz(false)} />}</AnimatePresence>
      <Navbar scrolled={scrolled} />

      {/* HERO */}
      <Scene minH="100vh">
        <div className="text-center max-w-4xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
            style={{ color: 'rgba(0,0,0,0.2)' }}>
            Fonctionnalités
          </motion.p>

          {['Ce n\'est pas', 'un budget.', "C'est votre vie."].map((line, i) => (
            <div key={i} className="overflow-hidden mb-1">
              <motion.h1 initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.25 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-black tracking-tighter leading-[0.9] block"
                style={{
                  fontSize: 'clamp(3rem, 8vw, 7rem)',
                  color: i === 2 ? YELLOW : (i === 1 ? 'rgba(0,0,0,0.15)' : FG),
                }}>
                {line}
              </motion.h1>
            </div>
          ))}

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-base max-w-lg mx-auto mt-16 mb-14 leading-relaxed"
            style={{ color: 'rgba(0,0,0,0.35)', fontFamily: 'var(--font-open)' }}>
            Des outils construits sur une seule conviction : votre bonheur n'est pas l'ennemi de votre richesse. C'est son moteur.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <motion.button onClick={handleCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-12 py-5 font-black text-base mx-auto"
              style={{ background: YELLOW, color: FG, borderRadius: '8px', boxShadow: '0 12px 48px rgba(221,255,0,0.4)' }}>
              Découvrir gratuitement <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))' }} />
          <p className="text-[9px] tracking-[0.3em] uppercase text-gray-300">Explorer</p>
        </motion.div>
      </Scene>

      {/* PHILOSOPHY */}
      <Scene bg={FG} minH="80vh">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }}
            className="text-center mb-16">
            <p className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
              style={{ color: 'rgba(255,255,255,0.2)' }}>
              La philosophie
            </p>
            <p className="font-black tracking-tighter text-white"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', lineHeight: 1.15 }}>
              "Les outils qui vous demandent de souffrir aujourd'hui<br />
              pour être heureux demain<br />
              <span style={{ color: YELLOW }}>ne fonctionnent pas.</span>"
            </p>
            <p className="text-sm mt-8" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-open)' }}>
              Stensor a été construit sur cette vérité.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { emoji: '😤', title: 'Restriction totale', desc: 'Abandonnée en 3 semaines. Résultat : 0. Plus de culpabilité qu\'avant.', bad: true },
              { emoji: '📊', title: 'Tableau Excel', desc: 'Mort au bout de 2 semaines. Les humains ne vivent pas dans des cellules.', bad: true },
              { emoji: '🌟', title: 'Méthode Stensor', desc: 'Plaisirs gardés. Fuites éliminées. Objectifs atteints. 3× plus longtemps.', bad: false },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-7 flex flex-col gap-4"
                style={{
                  background: item.bad ? 'rgba(255,255,255,0.03)' : 'rgba(221,255,0,0.08)',
                  borderRadius: '12px',
                  border: item.bad ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${YELLOW}30`,
                }}>
                <span className="text-3xl">{item.emoji}</span>
                <p className="text-base font-black" style={{ color: item.bad ? 'rgba(255,255,255,0.5)' : 'white' }}>{item.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: item.bad ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-open)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Scene>

      {/* FEATURE DEEP DIVE */}
      <FeatureDeepDive />

      {/* FINAL CTA */}
      <Scene bg={YELLOW} minH="80vh">
        <div className="text-center max-w-2xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
            style={{ color: 'rgba(0,0,0,0.3)' }}>
            Prêt ?
          </motion.p>
          <div className="overflow-hidden mb-2">
            <motion.h2 initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', color: FG }}>
              Votre bonheur.
            </motion.h2>
          </div>
          <div className="overflow-hidden mb-16">
            <motion.h2 initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', color: 'rgba(0,0,0,0.22)' }}>
              Notre stratégie.
            </motion.h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }} className="flex flex-col items-center gap-4">
            <motion.button onClick={handleCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-12 py-5 font-black text-base"
              style={{ background: FG, color: 'white', borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
              Commencer gratuitement <ArrowRight className="w-4 h-4" />
            </motion.button>
            <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>Sans carte. Résiliation à tout moment.</p>
          </motion.div>
        </div>
      </Scene>

      {/* Footer */}
      <footer className="px-8 md:px-10 py-10 flex items-center justify-between flex-wrap gap-4"
        style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <img src={LOGO} alt="Stensor" className="w-5 h-5 object-contain" />
          <span className="text-xs font-black" style={{ color: FG }}>Stensor</span>
        </button>
        <div className="flex items-center gap-6">
          {[['Pricing', '/tarifs'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
            <a key={l} href={h} className="text-[11px] text-gray-300 hover:text-black transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-[10px] text-gray-200">2026 Stensor Inc.</p>
      </footer>
    </div>
  );
}