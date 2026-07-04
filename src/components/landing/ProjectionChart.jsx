const CORAL = '#FF5A1F';
const INK = '#15130F';
const INK_FAINT = 'rgba(21,19,15,0.55)';
const INK_MUTED = 'rgba(21,19,15,0.30)';

// Avant/Après — risk of inaction: stagnant curve vs. UseWok growth curve.
export function computeProjection(answers) {
  const base = 40;
  const goalBoost = { more_clients: 260, local_visibility: 190, competitor_beat: 300 }[answers?.main_goal] || 200;
  const techBoost = { no_code: 0, ai_nocode: 40 }[answers?.tech_level] || 20;
  const month3 = base + goalBoost + techBoost;
  return {
    current: [
      { label: 'Today', value: base },
      { label: 'Month 1', value: base - 3 },
      { label: 'Month 2', value: base - 8 },
      { label: 'Month 3', value: base - 14 },
    ],
    usewok: [
      { label: 'Today', value: base },
      { label: 'Month 1', value: Math.round(base + (month3 - base) * 0.3) },
      { label: 'Month 2', value: Math.round(base + (month3 - base) * 0.62) },
      { label: 'Month 3', value: month3 },
    ],
  };
}

export default function ProjectionChart({ answers }) {
  const data = computeProjection(answers);
  const allValues = [...data.current.map(d => d.value), ...data.usewok.map(d => d.value)];
  const max = Math.max(...allValues) * 1.12;
  const W = 280, H = 120, PAD = 14;
  const toX = (i) => PAD + (i / 3) * (W - PAD * 2);
  const toY = (v) => H - PAD - (v / max) * (H - PAD * 2);

  const curPath = data.current.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.value)}`).join(' ');
  const wokPath = data.usewok.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.value)}`).join(' ');

  // Gap area between the two curves
  const gapArea = `${wokPath} L ${toX(3)} ${toY(data.current[3].value)} L ${toX(2)} ${toY(data.current[2].value)} L ${toX(1)} ${toY(data.current[1].value)} L ${toX(0)} ${toY(data.current[0].value)} Z`;
  const gap = data.usewok[3].value - data.current[3].value;

  return (
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
        Stagnant vs. with UseWok — 3-month projection
      </p>
      <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 12, height: 0, borderTop: `2px dashed ${INK_MUTED}` }} />
          <span style={{ fontSize: 10, color: INK_MUTED, fontWeight: 600 }}>Without UseWok</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 12, height: 2.5, background: CORAL, borderRadius: 2 }} />
          <span style={{ fontSize: 10, color: CORAL, fontWeight: 600 }}>With UseWok</span>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="projGap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CORAL} stopOpacity="0.20" />
            <stop offset="100%" stopColor={CORAL} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={gapArea} fill="url(#projGap)" />
        <path d={curPath} fill="none" stroke={INK_MUTED} strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d={wokPath} fill="none" stroke={CORAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.usewok.map((d, i) => (
          <circle key={`w-${i}`} cx={toX(i)} cy={toY(d.value)} r={i === 3 ? 4.5 : 3} fill={CORAL} />
        ))}
        {data.current.map((d, i) => (
          <circle key={`c-${i}`} cx={toX(i)} cy={toY(d.value)} r={2.5} fill={INK_MUTED} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {data.usewok.map((d, i) => (
          <div key={i} style={{ textAlign: i === 0 ? 'left' : i === 3 ? 'right' : 'center' }}>
            <div style={{ fontSize: 10, color: INK_FAINT }}>{d.label}</div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: i === 3 ? CORAL : INK }}>+{d.value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,90,31,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <span style={{ fontSize: 11.5, color: INK, fontWeight: 500, lineHeight: 1.4 }}>
          Every day without action, the gap with your competitors grows by <b style={{ color: CORAL }}>+{gap} visitors/month</b>.
        </span>
      </div>
    </div>
  );
}