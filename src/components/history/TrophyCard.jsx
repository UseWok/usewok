import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#15130F';
const BORDER = 'rgba(21,19,15,0.10)';

export default function TrophyCard({ trophy, index }) {
  const Icon = trophy.icon;
  const unlocked = trophy.unlocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      style={{
        background: unlocked ? '#FFFFFF' : '#FAF9F6',
        border: unlocked ? `1px solid ${trophy.color}33` : `1px solid ${BORDER}`,
        borderRadius: 16, padding: '20px 18px', fontFamily: F,
        display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {unlocked && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: 90, height: 90, background: `radial-gradient(circle at top right, ${trophy.color}14, transparent 70%)` }} />
      )}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: unlocked ? `${trophy.color}14` : 'rgba(21,19,15,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
      }}>
        {unlocked ? <Icon size={20} color={trophy.color} strokeWidth={2} /> : <Lock size={16} color="rgba(21,19,15,0.3)" strokeWidth={2} />}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: unlocked ? INK : 'rgba(21,19,15,0.4)', marginBottom: 4 }}>
          {trophy.name}
        </div>
        <p style={{ fontSize: 12, color: unlocked ? 'rgba(21,19,15,0.55)' : 'rgba(21,19,15,0.35)', lineHeight: 1.5, margin: 0 }}>
          {trophy.description}
        </p>
      </div>
      {trophy.progress != null && !unlocked && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ height: 4, borderRadius: 999, background: BORDER, marginBottom: 5 }}>
            <div style={{ width: `${Math.min(100, trophy.progress)}%`, height: '100%', borderRadius: 999, background: trophy.color }} />
          </div>
          <span style={{ fontSize: 10.5, color: 'rgba(21,19,15,0.4)', fontWeight: 600 }}>{trophy.progressLabel}</span>
        </div>
      )}
      {unlocked && trophy.date && (
        <span style={{ fontSize: 10.5, color: 'rgba(21,19,15,0.4)', fontWeight: 600, position: 'relative', zIndex: 1 }}>
          Débloqué le {trophy.date}
        </span>
      )}
    </motion.div>
  );
}