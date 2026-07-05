import { useState } from 'react';
import DashCard from './DashCard';

const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const VIOLET = '#7C3AED';
const F = 'Inter, system-ui, sans-serif';

function ScoreRing({ score }) {
  const size = 68, sw = 6, R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#EDEBE6" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={VIOLET} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: INK, lineHeight: 1, letterSpacing: '-0.03em' }}>{score}</span>
        <span style={{ fontSize: 9, color: INK3, marginTop: 1 }}>/ 100</span>
      </div>
    </div>
  );
}

function Bar({ label, color, value, max }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color, width: 62, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: '#F0EEE9', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: INK, width: 26, textAlign: 'right', flexShrink: 0 }}>{value}</span>
    </div>
  );
}

function LineChart({ points }) {
  if (!points || points.length < 2) {
    return <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK3, fontSize: 12 }}>Not enough history yet</div>;
  }
  const W = 620, H = 120, pad = 6;
  const vals = points.map(p => p.value);
  const maxV = 100;
  const stepX = (W - pad * 2) / (points.length - 1);
  const toXY = (v, i) => [pad + i * stepX, H - pad - (v / maxV) * (H - pad * 2)];
  const linePts = points.map((p, i) => toXY(p.value, i));
  const linePath = linePts.map((xy, i) => `${i === 0 ? 'M' : 'L'}${xy[0]},${xy[1]}`).join(' ');
  const areaPath = `${linePath} L${linePts[linePts.length - 1][0]},${H - pad} L${linePts[0][0]},${H - pad} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={130} preserveAspectRatio="none">
        <defs>
          <linearGradient id="evoGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VIOLET} stopOpacity="0.18" />
            <stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 50, 100].map(v => {
          const y = H - pad - (v / maxV) * (H - pad * 2);
          return <line key={v} x1={pad} y1={y} x2={W - pad} y2={y} stroke="#F0EEE9" strokeWidth="1" />;
        })}
        <path d={areaPath} fill="url(#evoGrad)" />
        <path d={linePath} fill="none" stroke={VIOLET} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {points.filter((_, i) => i % Math.ceil(points.length / 4) === 0).map((p, i) => (
          <span key={i} style={{ fontSize: 10, color: INK3 }}>{p.date_label}</span>
        ))}
      </div>
    </div>
  );
}

export default function EvolutionCard({ score, breakdown, evolution }) {
  const [tab, setTab] = useState('score');
  const b = breakdown || {};
  const maxBar = Math.max(b.narrative || 0, b.authority || 0, b.referral || 0, 1);

  return (
    <DashCard title="Evolution" dot={VIOLET}
      action={null}
      style={{ minHeight: 260 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: -40, marginBottom: 14 }}>
        <div style={{ display: 'inline-flex', background: '#F5F3EF', borderRadius: 8, padding: 3 }}>
          {[['score', 'GEO SCORE'], ['citations', 'CITATIONS / ENGINE']].map(([k, lbl]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding: '5px 11px', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: F,
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
                background: tab === k ? '#fff' : 'transparent', color: tab === k ? INK : INK3,
                boxShadow: tab === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}>
        <ScoreRing score={score} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Bar label="Narrative" color={VIOLET} value={b.narrative || 0} max={maxBar} />
          <Bar label="Authority" color="#EF6C4D" value={b.authority || 0} max={maxBar} />
          <Bar label="Referral" color="#E8184A" value={b.referral || 0} max={maxBar} />
          <p style={{ fontSize: 11, color: INK3, margin: '6px 0 0' }}>
            {b.brand_pct ?? 40}% Brand · {b.website_pct ?? 30}% Website · {b.earned_pct ?? 30}% Earned
          </p>
        </div>
      </div>

      <LineChart points={evolution} />
      <p style={{ fontSize: 11, color: INK3, margin: '6px 0 0' }}>Last 30 days</p>
    </DashCard>
  );
}