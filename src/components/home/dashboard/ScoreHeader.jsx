import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#6B7280';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const VIOLET = '#7C3AED';

function Donut({ score, size = 110, strokeWidth = 10, color }) {
  const r = (size / 2) - strokeWidth / 2 - 2;
  const circ = 2 * Math.PI * r;
  const c = color || (score < 35 ? '#EF4444' : score < 65 ? '#F59E0B' : '#22C55E');
  const [offset, setOffset] = useState(circ);
  useEffect(() => { const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 200); return () => clearTimeout(t); }, [score]);

  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let frame;
    const start = Date.now();
    const animate = () => {
      const p = Math.min((Date.now() - start) / 1200, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(ease * score));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    const t = setTimeout(() => { frame = requestAnimationFrame(animate); }, 200);
    return () => { clearTimeout(t); cancelAnimationFrame(frame); };
  }, [score]);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.24, fontWeight: 800, color: c, lineHeight: 1, letterSpacing: '-0.04em' }}>{displayed}</span>
        <span style={{ fontSize: size * 0.12, color: T3, lineHeight: 1, marginTop: 2 }}>/100</span>
      </div>
    </div>
  );
}

export default function ScoreHeader({ data, url, onRescan }) {
  const overall = data.overall_score || 0;
  const overallColor = overall < 35 ? '#EF4444' : overall < 65 ? '#F59E0B' : '#22C55E';
  const overallBg = overall < 35 ? '#FEF2F2' : overall < 65 ? '#FFFBEB' : '#F0FDF4';
  const overallLabel = overall < 35 ? 'Critical — Nearly Invisible to AI' : overall < 65 ? 'Weak — Partially Visible' : 'Strong — Well Indexed';

  const kpis = [
    { label: 'AI Score', val: overall, delta: null, unit: '/100' },
    { label: 'Mentions', val: '—', delta: null, unit: '' },
    { label: 'Cited Pages', val: '—', delta: null, unit: '' },
    { label: 'Competitors', val: '—', delta: null, unit: '' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', border: `1px solid ${BD}`, borderRadius: 16,
        padding: '24px 28px', fontFamily: F, marginBottom: 14,
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F9FAFB', border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={15} color={T2} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{data.business_name || url.replace(/https?:\/\//, '').split('/')[0]}</div>
            <div style={{ fontSize: 11, color: T3 }}>{url}</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
            background: overallBg, color: overallColor, marginLeft: 4,
          }}>{overallLabel}</span>
        </div>
        <button onClick={onRescan} style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T2,
          background: '#F9FAFB', border: `1px solid ${BD}`, borderRadius: 8,
          padding: '7px 14px', cursor: 'pointer', fontFamily: F, transition: 'all 150ms',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.borderColor = '#9CA3AF'; }}
          onMouseLeave={e => { e.currentTarget.style.color = T2; e.currentTarget.style.borderColor = BD; }}>
          <RotateCcw size={12} /> Scan another site
        </button>
      </div>

      {/* Score + KPIs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <Donut score={overall} size={110} strokeWidth={11} color={overallColor} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {kpis.map((k, i) => {
            const up = k.delta > 0;
            const zero = k.delta === 0;
            return (
              <div key={k.label} style={{
                padding: '16px 20px',
                borderLeft: i > 0 ? `1px solid ${BD}` : 'none',
              }}>
                <div style={{ fontSize: 11, color: T3, marginBottom: 6, fontWeight: 500 }}>{k.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: T1, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {k.val}<span style={{ fontSize: 13, color: T3, fontWeight: 400 }}>{k.unit}</span>
                </div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                  {!zero && (up ? <TrendingUp size={11} color="#16A34A" /> : <TrendingDown size={11} color="#DC2626" />)}
                  <span style={{ fontSize: 11, fontWeight: 600, color: zero ? T3 : up ? '#16A34A' : '#DC2626' }}>
                    {zero ? 'no changes' : `${up ? '+' : ''}${k.delta}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}