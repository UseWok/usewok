const CORAL = '#FF5A1F';
const INK = '#15130F';
const INK_FAINT = 'rgba(21,19,15,0.55)';

// Simple, deterministic 3-month projection based on quiz answers — expressed in
// something people relate to (extra AI-driven visits/month) rather than an abstract score.
export function computeProjection(answers) {
  const base = 40;
  const goalBoost = { more_clients: 260, local_visibility: 190, competitor_beat: 300 }[answers?.main_goal] || 200;
  const techBoost = { no_code: 0, ai_nocode: 40 }[answers?.tech_level] || 20;
  const month3 = base + goalBoost + techBoost;
  return [
    { label: 'Today', value: base },
    { label: 'Month 1', value: Math.round(base + (month3 - base) * 0.3) },
    { label: 'Month 2', value: Math.round(base + (month3 - base) * 0.62) },
    { label: 'Month 3', value: month3 },
  ];
}

export default function ProjectionChart({ answers }) {
  const data = computeProjection(answers);
  const max = data[data.length - 1].value;
  const W = 280, H = 110, PAD = 12;
  const toX = (i) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const toY = (v) => H - PAD - (v / max) * (H - PAD * 2);
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.value)}`).join(' ');
  const area = `${path} L ${toX(data.length - 1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
        Monthly visitors brought by AI — 3-month projection
      </p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CORAL} stopOpacity="0.25" />
            <stop offset="100%" stopColor={CORAL} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#projGrad)" />
        <path d={path} fill="none" stroke={CORAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.value)} r={i === data.length - 1 ? 4.5 : 3} fill={CORAL} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ textAlign: i === 0 ? 'left' : i === data.length - 1 ? 'right' : 'center' }}>
            <div style={{ fontSize: 10.5, color: INK_FAINT }}>{d.label}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: i === data.length - 1 ? CORAL : INK }}>+{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}