import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#6B7280';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const VIOLET = '#7C3AED';

function MiniDonut({ score, size = 32, color }) {
  const sw = 3;
  const r = (size / 2) - sw / 2 - 1;
  const circ = 2 * Math.PI * r;
  const c = color || (score < 35 ? '#EF4444' : score < 65 ? '#F59E0B' : '#22C55E');
  const [offset, setOffset] = useState(circ);
  useEffect(() => { const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 300); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 700, color: c, lineHeight: 1 }}>{score}</span>
      </div>
    </div>
  );
}

// Brand-colored engine logos
const ENGINE_COLORS = {
  'ChatGPT': '#10A37F',
  'Perplexity': '#20B2AA',
  'Google AI Overview': '#4285F4',
  'Gemini': '#1A73E8',
};

function EngineAvatar({ name }) {
  const color = ENGINE_COLORS[name] || '#6B7280';
  const initial = name[0];
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>{initial}</div>
  );
}

export default function AIEnginesWidget({ data }) {
  const engines = [
    { name: 'ChatGPT', score: data.chatgpt_score || 0, mentions: null, delta: data.chatgpt_score || 0 },
    { name: 'Perplexity', score: data.perplexity_score || 0, mentions: null, delta: data.perplexity_score || 0 },
    { name: 'Google AI Overview', score: data.google_ai_score || 0, mentions: null, delta: data.google_ai_score || 0 },
    { name: 'Gemini', score: data.gemini_score || 0, mentions: null, delta: data.gemini_score || 0 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
      style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BD}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>AI Search Engines</span>
        <button onClick={() => window.location.href = '/pricing'}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: VIOLET, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>
          Full report <ArrowRight size={10} />
        </button>
      </div>
      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 64px', gap: 8, padding: '10px 20px', borderBottom: `1px solid #F9FAFB` }}>
        {['Engine', 'Score', 'Mentions', 'Trend'].map((h, i) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
        ))}
      </div>
      {/* Rows */}
      {engines.map((e, i) => {
        const c = e.score < 35 ? '#EF4444' : e.score < 65 ? '#F59E0B' : '#22C55E';
        const hasDelta = e.delta != null;
        const up = hasDelta && e.delta > 0;
        const zero = !hasDelta || e.delta === 0;
        return (
          <div key={e.name} style={{
            display: 'grid', gridTemplateColumns: '1fr 72px 72px 64px', gap: 8,
            alignItems: 'center', padding: '14px 20px',
            borderBottom: i < engines.length - 1 ? `1px solid #F9FAFB` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <EngineAvatar name={e.name} />
              <span style={{ fontSize: 13, fontWeight: 500, color: T1 }}>{e.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <MiniDonut score={e.score} size={34} color={c} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{e.mentions ?? '—'}</span>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
              {!zero && (up ? <TrendingUp size={11} color="#16A34A" /> : <TrendingDown size={11} color="#DC2626" />)}
              <span style={{ fontSize: 11, fontWeight: 600, color: zero ? T3 : up ? '#16A34A' : '#DC2626' }}>
                {zero ? '—' : `${up ? '+' : ''}${e.delta}`}
              </span>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}