import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check, X } from 'lucide-react';
import { getPlansConfig } from '@/lib/plans-config';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const FEATURE_ROWS = [
  { label: 'Crédits mensuels', key: 'credits_limit', format: v => `${v}` },
  { label: 'Quota journalier', key: 'daily_credits_limit', format: v => v === 0 ? 'Illimité' : `${v}/jour` },
  { label: 'Discussions', key: 'max_discussions', format: v => v === 0 ? 'Illimitées' : `${v} max` },
  { label: 'Recherche Internet', key: 'internet_access', format: v => v },
  { label: 'Envoi de fichiers', key: 'file_upload', format: v => v },
  { label: 'Mode Expert (IA)', key: 'ultimate_access', format: v => v },
  { label: 'Support Premium', key: 'premium_support', format: v => v },
];

function GlowOrb({ x, y, size, color }) {
  return (
    <div className="absolute pointer-events-none rounded-full" style={{
      left: x, top: y, width: size, height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity: 1, filter: 'blur(60px)', transform: 'translate(-50%, -50%)',
    }} />
  );
}

export default function LandingPricingPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const plans = getPlansConfig().reverse(); // expensive first

  const handleCta = () => base44.auth.redirectToLogin('/app');
  const handleLogin = () => base44.auth.redirectToLogin('/app');

  const price = (plan) => billing === 'yearly' ? plan.price_yearly : plan.price_monthly;

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
            <button onClick={handleLogin} className="text-xs font-semibold px-4 py-2.5 transition-all" style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
              Connexion
            </button>
            <button onClick={handleCta} className="flex items-center gap-2 px-5 py-2.5 font-black text-xs" style={{ background: YUZU, color: FG }}>
              Commencer <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </nav>

      <div className="relative pt-36 pb-24 px-6 text-center">
        <GlowOrb x="20%" y="20%" size="600px" color="rgba(221,255,0,0.05)" />
        <GlowOrb x="80%" y="60%" size="500px" color="rgba(100,50,255,0.05)" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-[10px] font-black tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(221,255,0,0.6)' }}>Tarifs</p>
          <h1 className="font-black leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', color: 'white' }}>
            Investissez dans votre<br />
            <span style={{ color: YUZU, textShadow: '0 0 80px rgba(221,255,0,0.25)' }}>avenir financier.</span>
          </h1>
          <p className="text-base max-w-xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Chaque plan inclut un accès complet à Stensor. Choisissez selon vos ambitions.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center p-1 mb-16" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="px-5 py-2 text-xs font-black transition-all"
                style={{ background: billing === b ? YUZU : 'transparent', color: billing === b ? FG : 'rgba(255,255,255,0.4)' }}>
                {b === 'monthly' ? 'Mensuel' : 'Annuel'}{b === 'yearly' ? ' −20%' : ''}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plans — horizontal scroll on mobile, grid on desktop */}
        <div className="overflow-x-auto pb-6 -mx-6 px-6" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-4 md:grid md:grid-cols-5 w-max md:w-full min-w-max md:min-w-0">
            {plans.map((plan, i) => {
              const isTop = i === 0;
              const p = price(plan);
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="relative flex flex-col p-7 flex-shrink-0 md:flex-shrink"
                  style={{
                    width: '260px',
                    background: isTop ? YUZU : 'rgba(255,255,255,0.03)',
                    border: isTop ? 'none' : '1px solid rgba(255,255,255,0.07)',
                    scrollSnapAlign: 'start',
                  }}
                >
                  {isTop && (
                    <div className="absolute top-0 right-0 px-3 py-1.5 text-[9px] font-black tracking-wider" style={{ background: FG, color: YUZU }}>
                      MEILLEUR
                    </div>
                  )}
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: isTop ? 'rgba(10,10,10,0.5)' : 'rgba(255,255,255,0.3)' }}>
                    {plan.name}
                  </p>
                  <p className="font-black mb-1" style={{ fontSize: '2.2rem', color: isTop ? FG : 'white' }}>
                    {p === 0 ? 'Gratuit' : `${p}$`}
                  </p>
                  {p > 0 && <p className="text-xs mb-6" style={{ color: isTop ? 'rgba(10,10,10,0.5)' : 'rgba(255,255,255,0.3)' }}>/mois {billing === 'yearly' ? '(facturé annuellement)' : ''}</p>}
                  {p === 0 && <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>Pour commencer</p>}

                  <div className="space-y-2.5 mb-8 flex-1">
                    {FEATURE_ROWS.map(row => {
                      const val = row.format(plan[row.key]);
                      const isBool = typeof plan[row.key] === 'boolean';
                      return (
                        <div key={row.label} className="flex items-center justify-between gap-2">
                          <span className="text-xs" style={{ color: isTop ? 'rgba(10,10,10,0.55)' : 'rgba(255,255,255,0.35)' }}>{row.label}</span>
                          {isBool ? (
                            plan[row.key]
                              ? <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isTop ? FG : '#DDFF00' }} />
                              : <X className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.15)' }} />
                          ) : (
                            <span className="text-xs font-bold flex-shrink-0" style={{ color: isTop ? FG : 'white' }}>{val}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={plan.id === 'free' ? handleCta : () => navigate('/checkout?plan=' + plan.id + '&billing=' + billing)}
                    className="w-full py-3.5 font-black text-xs transition-all hover:opacity-85"
                    style={{ background: isTop ? FG : 'rgba(255,255,255,0.07)', color: isTop ? YUZU : 'white', border: isTop ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                    {plan.id === 'free' ? 'Commencer gratuitement' : 'Choisir ce plan'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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