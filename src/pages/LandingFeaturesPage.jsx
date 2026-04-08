import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Brain, Globe, Paperclip, MessageSquare, Zap, Crown, BarChart2, Shield, Clock, Users } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const FEATURES = [
  {
    icon: Brain,
    title: 'Intelligence Financière Contextuelle',
    desc: "Stensor comprend votre situation unique : revenus, charges, objectifs, tolérance au risque. Chaque réponse est calibrée pour vous, pas pour un profil générique.",
    tag: 'Standard',
  },
  {
    icon: Globe,
    title: 'Recherche Internet en Temps Réel',
    desc: "Accédez aux dernières données de marché, taux d'intérêt, performances d'ETF et actualités financières intégrées directement dans vos analyses.",
    tag: 'Advanced+',
    accent: true,
  },
  {
    icon: Paperclip,
    title: 'Analyse de Documents Financiers',
    desc: "Importez relevés bancaires, bulletins de salaire, contrats d'assurance-vie. Stensor les analyse automatiquement et intègre vos chiffres réels dans la stratégie.",
    tag: 'Essential+',
  },
  {
    icon: Zap,
    title: 'Modèles IA de Pointe',
    desc: "Accédez aux modèles GPT-4o, Claude Opus, Gemini Ultra — Stensor sélectionne automatiquement le meilleur pour chaque type de question financière.",
    tag: 'Expert+',
    accent: true,
  },
  {
    icon: MessageSquare,
    title: 'Discussions Illimitées',
    desc: "Posez autant de questions que vous voulez. Construisez une relation continue avec votre coach IA sur des mois, avec mémoire contextuelle de vos objectifs.",
    tag: 'Advanced+',
  },
  {
    icon: Crown,
    title: 'Mode Expert — Raisonnement Approfondi',
    desc: "Pour les questions complexes : simulation Monte Carlo, optimisation de portefeuille multi-actifs, analyse fiscale détaillée. Résultats d'un niveau professionnel.",
    tag: 'Expert+',
    accent: true,
  },
  {
    icon: BarChart2,
    title: 'Planificateur de Retraite',
    desc: 'Calculez précisément votre âge de retraite possible, le capital nécessaire et le montant mensuel à épargner selon votre situation actuelle.',
    tag: 'Tous plans',
  },
  {
    icon: Shield,
    title: 'Confidentialité Totale',
    desc: 'Vos données financières ne sont jamais revendues, jamais partagées. Chiffrement de bout en bout sur toutes vos conversations.',
    tag: 'Tous plans',
  },
  {
    icon: Clock,
    title: "Plans d'Action Actionnables",
    desc: "Pas de théorie vague. Chaque réponse inclut les étapes exactes, les comptes à ouvrir, les montants précis à investir — dès aujourd'hui.",
    tag: 'Tous plans',
  },
];

function GlowOrb({ x, y, size, color }) {
  return (
    <div className="absolute pointer-events-none rounded-full" style={{
      left: x, top: y, width: size, height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: 'blur(60px)', transform: 'translate(-50%, -50%)',
    }} />
  );
}

export default function LandingFeaturesPage() {
  const navigate = useNavigate();
  const handleCta = () => base44.auth.redirectToLogin('/app');

  return (
    <div className="min-h-screen font-be" style={{ background: '#0d0d18', color: 'white', overflowX: 'hidden' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(13,13,24,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="Stensor" className="w-7 h-7 object-contain" />
            <span className="font-black text-sm tracking-tight">Stensor</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs font-semibold px-4 py-2.5"
              style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Connexion
            </button>
            <button onClick={handleCta} className="flex items-center gap-2 px-5 py-2.5 font-black text-xs" style={{ background: YUZU, color: FG }}>
              Commencer <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </nav>

      <div className="relative pt-40 pb-24 px-6">
        <GlowOrb x="80%" y="10%" size="700px" color="rgba(221,255,0,0.04)" />
        <GlowOrb x="10%" y="60%" size="500px" color="rgba(100,50,255,0.05)" />

        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
            <p className="text-[10px] font-black tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(221,255,0,0.6)' }}>Fonctionnalités</p>
            <h1 className="font-black leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', color: 'white' }}>
              Tout ce qu'un coach<br />
              <span style={{ color: YUZU, textShadow: '0 0 80px rgba(221,255,0,0.25)' }}>financier IA peut faire.</span>
            </h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Conçu pour vous donner un avantage réel sur vos finances, pas seulement des réponses génériques.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                  className="relative p-8 overflow-hidden"
                  style={{
                    background: f.accent ? 'rgba(221,255,0,0.04)' : 'rgba(255,255,255,0.025)',
                    border: f.accent ? '1px solid rgba(221,255,0,0.1)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                      style={{ background: f.accent ? 'rgba(221,255,0,0.1)' : 'rgba(255,255,255,0.05)' }}>
                      <Icon className="w-5 h-5" style={{ color: f.accent ? YUZU : 'rgba(255,255,255,0.5)' }} />
                    </div>
                    <span className="text-[9px] font-black px-2 py-1 uppercase tracking-wider flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-black mb-3" style={{ color: 'white' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mt-20">
            <button onClick={handleCta} className="inline-flex items-center gap-3 px-10 py-5 font-black text-base"
              style={{ background: YUZU, color: FG, boxShadow: '0 0 60px rgba(221,255,0,0.2)' }}>
              Accéder à toutes ces fonctionnalités <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>

      <footer className="px-6 md:px-10 py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="w-4 h-4 object-contain opacity-20" />
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.12)' }}>Stensor 2026</span>
          </div>
          <button onClick={() => navigate('/')} className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>← Retour à l'accueil</button>
        </div>
      </footer>
    </div>
  );
}