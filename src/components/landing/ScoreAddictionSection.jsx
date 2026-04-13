import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap, Eye, BarChart3, RefreshCw, Award } from 'lucide-react';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const WHY_SCORE = [
  {
    icon: Eye,
    title: 'Voir la réalité en face',
    desc: 'Arrête de deviner. Ton score te dit exactement où tu en es financièrement — sans te mentir.',
    color: '#3b82f6',
  },
  {
    icon: TrendingUp,
    title: 'Mesurer tes progrès',
    desc: 'Chaque action compte. Rembourse une dette → ton score monte. Épargne 50€ → ton score monte.',
    color: '#22c55e',
  },
  {
    icon: BarChart3,
    title: 'Prioriser ce qui compte',
    desc: 'Plutôt que de tout faire en même temps, le score t\'indique le pilier qui impactera le plus ta vie.',
    color: '#a855f7',
  },
  {
    icon: RefreshCw,
    title: 'Mis à jour automatiquement',
    desc: 'Chaque jour à 5H, ton score se recalcule. Même si tu changes d\'appareil — tout est dans le cloud.',
    color: '#f97316',
  },
  {
    icon: Award,
    title: 'L\'addiction positive',
    desc: 'Débloque des badges, maintiens ta série. Voir 68 là où il y avait 42 = la meilleure sensation.',
    color: YUZU,
    dark: true,
  },
];

function AnimatedScoreArc({ score, size = 120, color = '#22c55e', delay = 0 }) {
  const r = 46;
  const circ = Math.PI * r;
  const dashOffset = circ * (1 - Math.min(score / 100, 1));
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size / 2 + 24 }}>
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
        <path d={`M 8 ${size/2} A ${r} ${r} 0 0 1 ${size-8} ${size/2}`}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} strokeLinecap="round" />
        <motion.path
          d={`M 8 ${size/2} A ${r} ${r} 0 0 1 ${size-8} ${size/2}`}
          fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay }}
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
        <span className="font-black text-3xl leading-none text-white">{score}</span>
        <span className="text-[10px] text-white/30 mt-0.5">/100</span>
      </div>
    </div>
  );
}

export default function ScoreAddictionSection({ onCta }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{ background: FG, borderTop: '1px solid rgba(255,255,255,0.06)' }} className="px-6 py-28 overflow-hidden relative">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(221,255,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(221,255,0,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(221,255,0,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] uppercase rounded-lg"
            style={{ background: 'rgba(221,255,0,0.1)', color: YUZU, border: '1px solid rgba(221,255,0,0.2)' }}>
            <Zap className="w-3 h-3" /> Stensor Score
          </div>
          <h2 className="font-black text-4xl md:text-6xl text-white mb-5 leading-tight tracking-tight">
            Un chiffre qui change<br />
            <span style={{ color: YUZU }}>tout.</span>
          </h2>
          <p className="text-base md:text-lg max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Ton score financier de 0 à 100. Calculé par l'IA. Mis à jour chaque jour. Synchronisé sur tous tes appareils.
          </p>
        </motion.div>

        {/* Score demo — before / after */}
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 mb-24">

          {/* Today */}
          <div className="flex-1 max-w-xs p-8 rounded-3xl flex flex-col items-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>Aujourd'hui</p>
            <AnimatedScoreArc score={42} color="#f97316" delay={0.3} />
            <div className="mt-5 w-full space-y-2">
              {[['Épargne', 35, '#3b82f6'], ['Investissement', 20, '#22c55e'], ['Dettes', 55, '#f97316']].map(([label, v, c]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs w-24 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: c }}
                      initial={{ width: 0 }} whileInView={{ width: `${v}%` }}
                      viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} />
                  </div>
                  <span className="text-[10px] font-bold w-6 text-right" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-2 px-4">
            <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black"
                style={{ background: YUZU, color: FG }}>
                +26 pts
              </div>
              <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>en 7 jours<br />avec le plan Stensor</p>
            </motion.div>
          </div>

          {/* In 7 days */}
          <div className="flex-1 max-w-xs p-8 rounded-3xl flex flex-col items-center"
            style={{ background: 'rgba(221,255,0,0.05)', border: `1px solid rgba(221,255,0,0.2)` }}>
            <div className="flex items-center gap-2 mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: YUZU }}>Dans 7 jours</p>
            </div>
            <AnimatedScoreArc score={68} color="#22c55e" delay={0.6} />
            <div className="mt-5 w-full space-y-2">
              {[['Épargne', 62, '#3b82f6'], ['Investissement', 55, '#22c55e'], ['Dettes', 78, '#22c55e']].map(([label, v, c]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs w-24 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: c }}
                      initial={{ width: 0 }} whileInView={{ width: `${v}%` }}
                      viewport={{ once: true }} transition={{ duration: 1, delay: 0.8 }} />
                  </div>
                  <span className="text-[10px] font-bold w-6 text-right" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Why score — 5 reasons */}
        <div className="mb-20">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-[10px] font-black uppercase tracking-widest mb-10"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Pourquoi un score ?
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_SCORE.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="p-6 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-4"
                    style={{ background: item.color + '20' }}>
                    <Icon className="w-5 h-5" style={{ color: item.color === YUZU ? '#b3cc00' : item.color }} />
                  </div>
                  <h3 className="font-black text-white mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Débloque des insignes en progressant
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: '⚔️', label: 'Vainqueur de dettes', color: '#f97316' },
              { icon: '🔥', label: '7 jours consécutifs', color: '#ef4444' },
              { icon: '🎯', label: 'Retraite en bonne voie', color: '#22c55e' },
              { icon: '🛡️', label: 'Épargnant élite', color: '#3b82f6' },
              { icon: '📈', label: 'Investisseur actif', color: '#a855f7' },
              { icon: '🧠', label: 'Maître financier', color: '#06b6d4' },
            ].map((b, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 260 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                style={{ background: b.color + '18', color: b.color, border: `1px solid ${b.color}30` }}>
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center">
          <button onClick={onCta}
            className="inline-flex items-center gap-2 text-sm font-black px-10 py-5 transition-all hover:scale-105 active:scale-95"
            style={{ background: YUZU, color: FG, borderRadius: '12px', boxShadow: `0 0 40px ${YUZU}30` }}>
            <Zap className="w-4 h-4" />
            Simuler mon score maintenant (gratuit)
          </button>
          <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Synchronisé sur tous tes appareils · 100/100 = zéro souci financier
          </p>
        </motion.div>
      </div>
    </section>
  );
}