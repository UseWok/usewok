import { motion } from 'framer-motion';
import { completionMessage } from '@/lib/brand-knowledge-steps';

const VIOLET = '#7B4FE0';
const INK = '#111827';
const INK3 = '#6B7280';

// Gamified completion bar — shows % complete + an encouraging line.
export default function CompletionMeter({ percent }) {
  const msg = completionMessage(percent);
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE9FE', borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>Your profile is {percent}% complete</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: VIOLET }}>{percent}%</span>
      </div>
      <div style={{ height: 8, background: '#F3F0FB', borderRadius: 999, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${VIOLET}, #A78BFA)`, borderRadius: 999 }}
        />
      </div>
      <p style={{ fontSize: 12, color: INK3, margin: '9px 0 0', lineHeight: 1.5 }}>{msg}</p>
    </div>
  );
}