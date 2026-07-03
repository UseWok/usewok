const CORAL = '#FF5A1F';
const INK = '#15130F';
const INK_FAINT = 'rgba(21,19,15,0.55)';

// Simple, deterministic 3-month score projection based on quiz answers
export function computeProjection(answers) {
  const base = 22;
  const goalBoost = { more_clients: 24, local_visibility: 20, brand_authority: 18, competitor_beat: 26 }[answers?.main_goal] || 20;
  const techBoost = { no_code: 0, ai_nocode: 4, claude_code: 6, developer: 8 }[answers?.tech_level] || 2;
  const month3 = Math.min(92, base + goalBoost + techBoost);
  return [
    { label: "Aujourd'hui", value: base },
    { label: 'Mois 1', value: Math.round(base + (month3 - base) * 0.35) },
    { label: 'Mois 2', value: Math.round(base + (month3 - base) * 0.68) },
    { label: 'Mois 3', value: month3 },
  ];
}

export default function ProjectionChart({ answers }) {
  const data = computeProjection(answers);
  const W = 280, H = 110, PAD = 12;
  const toX = (i) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const toY = (v) => H - PAD - (v / 100) * (H - PAD * 2);
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.value)}`).join(' ');
  const area = `${path} L ${toX(data.length - 1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
        Votre projection de score sur 3 mois
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
            <div style={{ fontSize: 13, fontWeight: 800, color: i === data.length - 1 ? CORAL : INK }}>{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}