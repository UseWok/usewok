import { motion } from 'framer-motion';
import AnimatedScore from './AnimatedScore';
import { CORAL } from '@/lib/report-constants';

export default function ScoreRing({ value, size = 72 }) {
  const sw = 6, R = 26;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: 'block' }}>
        <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(247,242,233,0.12)" strokeWidth={sw} />
        <motion.circle cx="32" cy="32" r={R} fill="none" stroke={CORAL} strokeWidth={sw}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - value / 100) }}
          transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1], delay: 0.1 }} />
        <text x="32" y="29" textAnchor="middle" fontSize="17" fontWeight="500" fill="#F7F2E9">
          <AnimatedScore value={value} size={17} />
        </text>
        <text x="32" y="42" textAnchor="middle" fontSize="8" fill="rgba(247,242,233,0.55)">/100</text>
      </svg>
    </div>
  );
}