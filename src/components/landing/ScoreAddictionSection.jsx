import { motion } from 'framer-motion';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

function MiniScoreWidget({ score, label, delta, isProjected, delay = 0 }) {
  const color = score >= 60 ? '#22c55e' : score >= 40 ? '#f97316' : '#ef4444';
  const r = 38;
  const circ = Math.PI * r;
  const dashOffset = circ * (1 - Math.min(score / 100, 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center p-5 rounded-3xl relative"
      style={{
        background: isProjected ? FG : 'white',
        border: isProjected ? `2px solid ${YUZU}` : '1px solid rgba(0,0,0,0.08)',
        boxShadow: isProjected ? `0 8px 40px rgba(0,0,0,0.15), 0 0 0 1px ${YUZU}20` : '0 4px 20px rgba(0,0,0,0.06)',
        flex: 1,
        minWidth: 0,
      }}>
      {isProjected && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: YUZU, color: FG }}>
          Dans 7 jours
        </span>
      )}
      <svg width={100} height={56} viewBox="0 0 100 56" className="mb-1">
        <path d={`M 11 50 A ${r} ${r} 0 0 1 89 50`}
          fill="none" stroke={isProjected ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'}
          strokeWidth={8} strokeLinecap="round" />
        <motion.path
          d={`M 11 50 A ${r} ${r} 0 0 1 89 50`}
          fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: delay + 0.4 }}
        />
      </svg>
      <div className="flex items-end gap-0.5">
        <span className="text-3xl font-black leading-none" style={{ color }}>
          {score}
        </span>
        <span className="text-xs mb-0.5 font-bold" style={{ color: isProjected ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>/100</span>
      </div>
      {delta && (
        <div className="flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)' }}>
          <span className="text-xs font-black" style={{ color: '#22c55e' }}>+{delta} pts 📈</span>
        </div>
      )}
      <p className="text-[11px] font-semibold mt-2 text-center" style={{ color: isProjected ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
        {label}
      </p>
    </motion.div>
  );
}

function BadgePreview({ icon, label, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center"
      style={{ background: color + '12', border: `1px solid ${color}25` }}>
      <span className="text-3xl">{icon}</span>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </motion.div>
  );
}

export default function ScoreAddictionSection({ onCta }) {
  return (
    <section className="px-6 py-24 bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] uppercase rounded-lg"
            style={{ background: YUZU, color: FG }}>
            🔥 L'addiction positive
          </div>
          <h2 className="font-black text-4xl md:text-5xl mb-5 leading-tight" style={{ color: FG }}>
            Un score qui te fait revenir<br />tous les jours
          </h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(10,10,10,0.45)' }}>
            Chaque jour Stensor recalcule ton score financier global (0-100) en fonction de tes progrès, tes nouvelles données et tes objectifs.
            <br /><strong style={{ color: FG }}>Voir ton score monter = la meilleure sensation du monde.</strong>
          </p>
        </motion.div>

        {/* Score cards */}
        <div className="flex gap-4 mb-14 max-w-2xl mx-auto">
          <MiniScoreWidget score={42} label="Aujourd'hui" delay={0} />
          <MiniScoreWidget score={68} label="Dans 7 jours" delta={26} isProjected delay={0.15} />
        </div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-14">
          <p className="text-center text-xs font-black uppercase tracking-widest mb-6" style={{ color: 'rgba(0,0,0,0.3)' }}>
            Débloque des insignes en progressant
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <BadgePreview icon="⚔️" label="Vainqueur de dettes" color="#f97316" delay={0} />
            <BadgePreview icon="🔥" label="7 jours consécutifs" color="#ef4444" delay={0.08} />
            <BadgePreview icon="🎯" label="Retraite en bonne voie" color="#22c55e" delay={0.16} />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center">
          <button onClick={onCta}
            className="inline-flex items-center gap-2 text-sm font-black px-8 py-4 transition-all hover:scale-105 active:scale-95"
            style={{ background: FG, color: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            Simuler mon score maintenant (gratuit) →
          </button>
          <p className="text-xs mt-3" style={{ color: 'rgba(0,0,0,0.3)' }}>Mis à jour automatiquement chaque jour à 5H • Résultats synchronisés sur tous tes appareils</p>
        </motion.div>
      </div>
    </section>
  );
}