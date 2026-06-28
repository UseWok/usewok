import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1C1C1E';
const INK3 = '#9B9BA8';
const BORDER = '#EBEBEB';
const WHITE = '#FFFFFF';
const CORAL = '#E8622A';

const AXES = [
  { key: 'mistral',    label: 'Mistral' },
  { key: 'gemini',     label: 'Gemini' },
  { key: 'chatgpt',    label: 'ChatGPT' },
  { key: 'claude',     label: 'Claude' },
  { key: 'copilot',    label: 'Copilot' },
  { key: 'perplexity', label: 'Perplexity' },
  { key: 'llama',      label: 'Llama' },
  { key: 'grok',       label: 'Grok' },
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
  const cx = 120, cy = 120, R = 82, maxVal = 100;
  const scores = AXES.map(a => d[`${a.key}_score`] || 0);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const gridLevels = [25, 50, 75, 100];
  const yourPath = buildPath(scores, maxVal, cx, cy, R);

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px', marginBottom: 12, fontFamily: F }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 12px' }}>RADAR DES ASSISTANTS IA</p>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={240} height={240} viewBox="0 0 240 240">
          {/* Grid */}
          {gridLevels.map(level => (
            <circle key={level} cx={cx} cy={cy} r={(level / 100) * R} fill="none" stroke="#EBEBEB" strokeWidth={1} />
          ))}
          {/* Axis lines */}
          {AXES.map((_, i) => {
            const angle = (360 / AXES.length) * i;
            const end = polarToCart(angle, R, cx, cy);
            return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#EBEBEB" strokeWidth={1} />;
          })}
          {/* Your area */}
          <motion.path d={yourPath} fill={CORAL} fillOpacity={0.12} stroke={CORAL} strokeWidth={1.5}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
          {/* Data points */}
          {scores.map((v, i) => {
            const angle = (360 / scores.length) * i;
            const r = (v / maxVal) * R;
            const pt = polarToCart(angle, r, cx, cy);
            return <circle key={i} cx={pt.x} cy={pt.y} r={3} fill={CORAL} stroke={WHITE} strokeWidth={1.5} />;
          })}
          {/* Labels */}
          {AXES.map((axis, i) => {
            const angle = (360 / AXES.length) * i;
            const pt = polarToCart(angle, R + 16, cx, cy);
            return (
              <text key={i} x={pt.x} y={pt.y + 4} textAnchor="middle" fontSize={9} fill={INK3} fontFamily={F} fontWeight={600}>
                {axis.label}
              </text>
            );
          })}
          {/* Center avg */}
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize={17} fill={INK} fontFamily={F} fontWeight={900}>{avg}</text>
        </svg>
      </div>
    </div>
  );
}