import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Zap, Brain, TrendingUp, ArrowRight, Shield } from 'lucide-react';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        window.location.href = '/app';
      } else {
        base44.auth.redirectToLogin('/app');
      }
    } catch {
      base44.auth.redirectToLogin('/app');
    }
  };

  return (
    <div className="min-h-screen bg-white font-be flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <img src={LOGO_URL} alt="Stensor" className="w-8 h-8 object-contain" />
          <span className="font-black text-base" style={{ color: FG }}>Stensor</span>
        </div>
        <button onClick={handleStart}
          className="px-4 py-2 text-sm font-bold transition-all hover:opacity-80"
          style={{ background: FG, color: 'white', borderRadius: '6px' }}>
          Connexion
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-8"
          style={{ background: YUZU, borderRadius: '6px' }}>
          <Zap className="w-3 h-3" style={{ color: FG }} />
          <span className="text-[10px] font-black tracking-widest" style={{ color: FG }}>IA · FINANCE · CROISSANCE</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6 max-w-3xl"
          style={{ color: FG }}>
          Bâtissons ensemble<br />
          <span style={{ color: FG }}>votre liberté financière.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="text-base md:text-lg max-w-xl mb-10 leading-relaxed"
          style={{ color: '#666' }}>
          Analyses financières, stratégies d'investissement et conseils personnalisés — disponibles 24h/24, en quelques secondes.
        </motion.p>

        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onClick={handleStart} disabled={loading}
          className="flex items-center gap-3 px-8 py-4 text-base font-black transition-all disabled:opacity-60"
          style={{ background: FG, color: 'white', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)'; }}>
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Commencer <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-4 text-xs" style={{ color: '#bbb' }}>
          Gratuit pour commencer · Aucune carte requise
        </motion.p>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 max-w-2xl w-full">
          {[
            { icon: Brain, title: 'IA Avancée', desc: 'Modèles de pointe pour des réponses précises et contextualisées' },
            { icon: TrendingUp, title: 'Stratégies Finance', desc: 'Budget, investissements, épargne — tout en un seul endroit' },
            { icon: Shield, title: '100% Privé', desc: 'Vos conversations restent confidentielles et sécurisées' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 text-left"
              style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="w-9 h-9 flex items-center justify-center mb-3"
                style={{ background: YUZU, borderRadius: '8px' }}>
                <Icon className="w-4 h-4" style={{ color: FG }} />
              </div>
              <p className="text-sm font-black mb-1" style={{ color: FG }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#888' }}>{desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="text-center py-6 text-xs" style={{ color: '#ccc' }}>
        © 2026 Stensor · Pas un conseil en investissement
      </footer>
    </div>
  );
}