import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = '#E8E4DC';
const WHITE = '#FFFFFF';
const CORAL = '#E8622A';
// Grid color: same beige/cream as the image background
const GRID_COLOR = '#DDD8CE';
const GRID_FILL = '#EEE9E0';

// Axes as shown in the image (clockwise from top)
const AXES = [
  { key: 'mistral',    label: 'Mistral' },
  { key: 'gemini',     label: 'Gemini' },
  { key: 'chatgpt',    label: 'ChatGf' },
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
  const cx = 130, cy = 130, R = 88, maxVal = 100;
  const scores = AXES.map(a => d[`${a.key}_score`] || 0);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.filter(s => s > 0).length || 1);

  // Background polygon rings (25, 50, 75, 100)
  const gridLevels = [25, 50, 75, 100];
  const gridPaths = gridLevels.map(level => buildPath(AXES.map(() => level), maxVal, cx, cy, R));

  const yourPath = buildPath(scores, maxVal, cx, cy, R);

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px', marginBottom: 12, fontFamily: F }}>
      {/* Section label */}
      <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>
        Radar des assistants IA
      </p>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={260} height={260} viewBox="0 0 260 260">
          {/* Grid polygons */}
          {gridPaths.map((path, i) => (
            <path key={i} d={path} fill={GRID_FILL} fillOpacity={gridLevels[i] === 100 ? 0 : 0.4} stroke={GRID_COLOR} strokeWidth={1} />
          ))}

          {/* Axis lines */}
          {AXES.map((_, i) => {
            const angle = (360 / AXES.length) * i;
            const end = polarToCart(angle, R, cx, cy);
            return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={GRID_COLOR} strokeWidth={1} />;
          })}

          {/* Your data area */}
          <motion.path
            d={yourPath}
            fill={CORAL} fillOpacity={0.18}
            stroke={CORAL} strokeWidth={2}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
          />

          {/* Labels */}
          {AXES.map((axis, i) => {
            const angle = (360 / AXES.length) * i;
            const pt = polarToCart(angle, R + 17, cx, cy);
            return (
              <text key={i} x={pt.x} y={pt.y + 4}
                textAnchor="middle" fontSize={10} fill={INK3}
                fontFamily={F} fontWeight={500}>
                {axis.label}
              </text>
            );
          })}

          {/* Center score */}
          <circle cx={cx} cy={cy} r={24} fill={WHITE} stroke={GRID_COLOR} strokeWidth={1} />
          <text x={cx} y={cy + 6} textAnchor="middle" fontSize={19} fill={INK} fontFamily={F} fontWeight={900}>
            {avg}
          </text>
        </svg>
      </div>
    </div>
  );
}