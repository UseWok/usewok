import { useState } from 'react';
import DashCard from './DashCard';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const ORANGE = '#FF5A1F';
const ORANGE_DEEP = '#C43E14';
const AMBER_DEEP = '#B4740E';
const CREAM2 = '#F3EEE3';
const F = 'Inter, system-ui, sans-serif';

function ScoreRing({ score }) {
  const size = 96, sw = 8, R = 42;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - (score || 0) / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={R} fill="none" stroke={CREAM2} strokeWidth={sw} />
        <circle cx="50" cy="50" r={R} fill="none" stroke={ORANGE} strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <b style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: INK, lineHeight: 1 }}>{score || 0}</b>
        <span style={{ fontSize: 10, color: INK3, fontWeight: 600 }}>/ 100</span>
      </div>
    </div>
  );
}

function MetricRow({ label, color, value, max }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 92, fontSize: 12.5, fontWeight: 600, color, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 7, borderRadius: 100, background: CREAM2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100 }} />
      </div>
      <span style={{ width: 16, fontSize: 12.5, fontWeight: 700, textAlign: 'right', color: INK, flexShrink: 0 }}>{value || 0}</span>
    </div>
  );
}

function LineChart({ points }) {
  if (!points || points.length < 2) {
    return <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK3, fontSize: 12 }}>Pas assez d'historique</div>;
  }
  const W = 500, H = 80;
  const vals = points.map(p => p.value);
  const maxV = 100;
  const stepX = W / (points.length - 1);
  const toXY = (v, i) => [i * stepX, H - (v / maxV) * (H - 10) - 5];
  const linePts = points.map((p, i) => toXY(p.value, i));
  const linePath = linePts.map((xy, i) => `${i === 0 ? 'M' : 'L'}${xy[0]},${xy[1]}`).join(' ');
  const areaPath = `${linePath} L${linePts[linePts.length - 1][0]},${H} L${linePts[0][0]},${H} Z`;
  const dates = points.filter((_, i) => i % Math.ceil(points.length / 3) === 0).map(p => p.date_label);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 80, display: 'block' }}>
        <defs>
          <linearGradient id="evog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`${linePts.map(xy => `${xy[0]},${xy[1]}`).join(' ')} ${W},${H} 0,${H}`} fill="url(#evog)" />
        <polyline points={linePts.map(xy => `${xy[0]},${xy[1]}`).join(' ')} fill="none" stroke="#FF5A1F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: INK3 }}>
        {dates.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>30 derniers jours</div>
    </div>
  );
}

export default function EvolutionCard({ score, breakdown, evolution }) {
  const [tab, setTab] = useState('score');
  const b = breakdown || {};
  const maxBar = Math.max(b.narrative || 0, b.authority || 0, b.referral || 0, 1);

  return (
    <DashCard title="Ton score global" dot={ORANGE}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: -40, marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', gap: 3, background: CREAM2, borderRadius: 9, padding: 3 }}>
          {[['score', 'Ta note'], ['citations', 'Par IA']].map(([k, lbl]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding: '6px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: F,
                fontSize: 11.5, fontWeight: 700,
                background: tab === k ? '#fff' : 'transparent', color: tab === k ? INK : INK3,
                boxShadow: tab === k ? '0 1px 2px rgba(21,19,15,0.08)' : 'none' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 28, marginBottom: 20 }}>
        <ScoreRing score={score} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', minWidth: 0 }}>
          <MetricRow label="Ton image" color={ORANGE_DEEP} value={b.narrative || 0} max={maxBar} />
          <MetricRow label="Ta crédibilité" color={INK} value={b.authority || 0} max={maxBar} />
          <MetricRow label="Tes mentions" color={AMBER_DEEP} value={b.referral || 0} max={maxBar} />
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: INK3, paddingTop: 14, borderTop: '1px solid rgba(21,19,15,0.09)', marginBottom: 18 }}>
        {b.brand_pct ?? 40}% Image · {b.website_pct ?? 30}% Site · {b.earned_pct ?? 30}% Mentions externes
      </div>

      <LineChart points={evolution} />
    </DashCard>
  );
}