import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const WHITE = '#FFFFFF';
const VIOLET = '#7C3AED';

const AXES = [
  { key: 'chatgpt',    label: 'ChatGPT' },
  { key: 'gemini',     label: 'Gemini' },
  { key: 'claude',     label: 'Claude' },
  { key: 'perplexity', label: 'Perplexity' },
  { key: 'mistral',    label: 'Mistral' },
  { key: 'llama',      label: 'Llama' },
  { key: 'grok',       label: 'Grok' },
  { key: 'copilot',    label: 'Copilot' },
];

function polarToCart(angle, r, cx, cy) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildPath(values, maxVal, cx, cy, radius) {
  const pts = values.map((v, i) => {
    const angle = (360 / values.length) * i;
    const r = (v / maxVal) * radius;
    return polarToCart(angle, r, cx, cy);
  });
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z';
}

export default function LRSRadarChart({ d }) {
  const cx = 140, cy = 140, R = 100, maxVal = 100;
  const scores = AXES.map(a => d[`${a.key}_score`] || 0);
  const avgComp = AXES.map(() => 45); // industry average baseline
  const gridLevels = [25, 50, 75, 100];

  const yourPath = buildPath(scores, maxVal, cx, cy, R);
  const avgPath = buildPath(avgComp, maxVal, cx, cy, R);

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '18px', marginBottom: 14, fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Radar des 8 assistants IA</p>
          <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>Votre marque vs moyenne sectorielle</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: INK3 }}>
            <div style={{ width: 10, height: 3, background: VIOLET, borderRadius: 2 }} /> Vous
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: INK3 }}>
            <div style={{ width: 10, height: 3, background: '#E0E0DE', borderRadius: 2 }} /> Secteur
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
        <svg width={280} height={280} viewBox={`0 0 280 280`}>
          {/* Grid circles */}
          {gridLevels.map(level => (
            <circle key={level} cx={cx} cy={cy} r={(level / 100) * R} fill="none" stroke="#F0F0EE" strokeWidth={1} />
          ))}

          {/* Axis lines */}
          {AXES.map((_, i) => {
            const angle = (360 / AXES.length) * i;
            const end = polarToCart(angle, R, cx, cy);
            return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E8E8E6" strokeWidth={1} />;
          })}

          {/* Industry avg area */}
          <path d={avgPath} fill="#F0F0EE" fillOpacity={0.5} stroke="#D4D4D2" strokeWidth={1.5} strokeDasharray="4,3" />

          {/* Your brand area */}
          <motion.path d={yourPath} fill={VIOLET} fillOpacity={0.15} stroke={VIOLET} strokeWidth={2}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />

          {/* Data points */}
          {scores.map((v, i) => {
            const angle = (360 / scores.length) * i;
            const r = (v / maxVal) * R;
            const pt = polarToCart(angle, r, cx, cy);
            return <circle key={i} cx={pt.x} cy={pt.y} r={4} fill={VIOLET} stroke={WHITE} strokeWidth={2} />;
          })}

          {/* Labels */}
          {AXES.map((axis, i) => {
            const angle = (360 / AXES.length) * i;
            const labelR = R + 18;
            const pt = polarToCart(angle, labelR, cx, cy);
            const score = scores[i];
            return (
              <g key={i}>
                <text x={pt.x} y={pt.y - 3} textAnchor="middle" fontSize={9} fill={INK3} fontFamily={F} fontWeight={600}>{axis.label}</text>
                <text x={pt.x} y={pt.y + 9} textAnchor="middle" fontSize={9} fill={INK} fontFamily={F} fontWeight={800}>{score}</text>
              </g>
            );
          })}

          {/* Center score */}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fill={INK} fontFamily={F} fontWeight={900}>
            {Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}
          </text>
          <text x={cx} y={cy + 11} textAnchor="middle" fontSize={9} fill={INK3} fontFamily={F} fontWeight={600}>MOY.</text>
        </svg>
      </div>
    </div>
  );
}