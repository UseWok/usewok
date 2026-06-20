import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const VIOLET = '#7C3AED';

export default function UpgradeBanner() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
      style={{
        padding: '22px 28px',
        background: `linear-gradient(135deg, ${VIOLET} 0%, #A78BFA 100%)`,
        borderRadius: 16, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 20,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(124,58,237,0.25)',
      }}>
      {/* Decorative floating cards */}
      <div style={{ position: 'absolute', right: 200, top: -12, width: 80, height: 52, borderRadius: 8, background: 'rgba(255,255,255,0.12)', transform: 'rotate(-6deg)' }} />
      <div style={{ position: 'absolute', right: 162, top: 14, width: 70, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.07)', transform: 'rotate(5deg)' }} />
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Unlock your full AI optimization roadmap
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
          Personalized fixes · Weekly tracking · 4 AI engines · Priority actions
        </div>
      </div>
      <button onClick={() => window.location.href = '/pricing'}
        style={{
          padding: '11px 22px', background: '#fff', color: VIOLET,
          border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0,
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)', transition: 'opacity 150ms',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
        View plans →
      </button>
    </motion.div>
  );
}