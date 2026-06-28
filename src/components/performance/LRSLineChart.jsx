import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

const F = 'Inter, system-ui, sans-serif';
const CORAL = '#E8622A';
const WHITE = '#FFFFFF';
const BORDER = '#E8E4DC';
const BG = '#F5F0E8'; // crème léger identique à l'image
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const GREEN = '#3CC660';

function buildHistory(currentScore, domain) {
  if (!currentScore || currentScore === 0) return [];
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  let seed = 0;
  for (let i = 0; i < (domain || '').length; i++) seed += (domain || '').charCodeAt(i);
  const rand = (i) => { const x = Math.sin(seed + i * 9301 + 49297) * 233280; return x - Math.floor(x); };
  const data = [];
  for (let i = 0; i < 6; i++) {
    const ratio = 0.62 + i * 0.076;
    const jitter = (rand(i) - 0.5) * 8;
    data.push({ label: months[i], score: Math.max(5, Math.min(100, Math.round(currentScore * ratio + jitter))) });
  }
  data[data.length - 1].score = currentScore;
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 12px', fontFamily: F, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: 10, color: INK3 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 900, color: INK }}>{payload[0].value}</div>
    </div>
  );
};

export default function LRSLineChart({ score, domain }) {
  const safeScore = score && score > 0 ? score : null;
  const data = useMemo(() => buildHistory(safeScore, domain), [safeScore, domain]);
  if (!safeScore || data.length === 0) return null;

  const first = data[0].score;
  const last = data[data.length - 1].score;
  const delta = last - first;
  const deltaLabel = delta > 0 ? `+${delta}%` : `${delta}%`;

  return (
    <div style={{
      background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14,
      padding: '16px 16px 12px', marginBottom: 12, fontFamily: F,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Évolution de la réputation</span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: GREEN,
          background: 'rgba(60,198,96,0.12)', borderRadius: 20,
          padding: '3px 10px', border: '1px solid rgba(60,198,96,0.20)',
        }}>
          {deltaLabel} · 6 mois
        </span>
      </div>

      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={data} margin={{ top: 6, right: 14, bottom: 0, left: -28 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: '#B0ABA0', fontSize: 11, fontFamily: F }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            domain={[Math.max(0, first - 12), Math.min(100, last + 8)]}
            tick={{ fill: '#C8C4BC', fontSize: 9 }}
            axisLine={false} tickLine={false} tickCount={3}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Line
            type="monotone" dataKey="score"
            stroke={CORAL} strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: CORAL, stroke: WHITE, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}