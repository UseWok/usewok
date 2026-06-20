import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#6B7280';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const VIOLET = '#7C3AED';

function Donut({ score, size = 60, color }) {
  const sw = 5;
  const r = (size / 2) - sw / 2 - 1;
  const circ = 2 * Math.PI * r;
  const c = color || (score < 35 ? '#EF4444' : score < 65 ? '#F59E0B' : '#22C55E');
  const [offset, setOffset] = useState(circ);
  useEffect(() => { const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 300); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 700, color: c, lineHeight: 1 }}>{score}</span>
      </div>
    </div>
  );
}

function StatRow({ label, value, desc }) {
  const c = value < 35 ? '#EF4444' : value < 65 ? '#F59E0B' : '#22C55E';
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid #F9FAFB` }}>
      <Donut score={value} size={52} color={c} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: T3, marginBottom: 6 }}>{desc}</div>
        <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${w}%`, background: c, borderRadius: 2, transition: 'width 1.2s ease' }} />
        </div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: c, letterSpacing: '-0.03em' }}>{value}<span style={{ fontSize: 11, color: T3, fontWeight: 400 }}>/100</span></div>
    </div>
  );
}

export default function ScoreBreakdown({ data }) {
  const items = [
    { label: 'AI Visibility', value: data.ai_visibility_score || 0, desc: 'How often AI tools surface your brand in answers' },
    { label: 'Message Clarity', value: data.message_clarity_score || 0, desc: 'How clearly AI understands your value proposition' },
    { label: 'Commercial Presence', value: data.commercial_presence_score || 0, desc: 'Strength of buying signals detected by AI engines' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BD}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Score Breakdown</span>
        <button onClick={() => window.location.href = '/pricing'}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: VIOLET, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>
          Detailed report <ArrowRight size={10} />
        </button>
      </div>
      <div style={{ padding: '4px 20px 8px' }}>
        {items.map(item => <StatRow key={item.label} {...item} />)}
      </div>
    </motion.div>
  );
}