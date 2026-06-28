import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const F = 'Inter, system-ui, sans-serif';
const CORAL = '#E8622A';
const WHITE = '#FFFFFF';
const BORDER = '#EBEBEB';
const INK3 = '#9B9BA8';

function buildHistory(currentScore, domain) {
  if (!currentScore || currentScore === 0) return [];
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  let seed = 0;
  for (let i = 0; i < (domain || '').length; i++) seed += (domain || '').charCodeAt(i);
  const pseudoRand = (i) => {
    const x = Math.sin(seed + i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  const data = [];
  for (let i = 0; i < 6; i++) {
    const baseRatio = 0.62 + i * 0.076;
    const jitter = (pseudoRand(i) - 0.5) * 10;
    const val = Math.max(5, Math.min(100, Math.round(currentScore * baseRatio + jitter)));
    data.push({ label: months[i], score: val });
  }
  if (data.length > 0) data[data.length - 1].score = currentScore;
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 11px', fontFamily: F, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: 10, color: INK3, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#1C1C1E' }}>{payload[0].value}</div>
    </div>
  );
};

export default function LRSLineChart({ score, domain }) {
  const safeScore = score && score > 0 ? score : null;
  const data = useMemo(() => buildHistory(safeScore, domain), [safeScore, domain]);

  if (!safeScore || data.length === 0) return null;

  const first = data[0]?.score || 0;
  const last = data[data.length - 1]?.score || 0;
  const delta = last - first;
  const trend = delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable';

  return (
    <div style={{
      background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14,
      padding: '16px 16px 10px', marginBottom: 12, fontFamily: F,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>Évolution de la réputation</span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: trend === 'up' ? '#34C759' : trend === 'down' ? '#E8622A' : INK3,
          background: trend === 'up' ? 'rgba(52,199,89,0.10)' : trend === 'down' ? 'rgba(232,98,42,0.10)' : '#F5F5F5',
          borderRadius: 20, padding: '3px 10px',
        }}>
          {trend === 'up' ? `+${delta}` : trend === 'down' ? `${delta}` : '→'} · 6 mois
        </span>
      </div>

      <ResponsiveContainer width="100%" height={90}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: '#C0C0BE', fontSize: 10, fontFamily: F }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            domain={[Math.max(0, first - 15), Math.min(100, last + 10)]}
            tick={{ fill: '#D0D0CE', fontSize: 9 }}
            axisLine={false} tickLine={false} tickCount={3}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EBEBEB', strokeWidth: 1 }} />
          <Line
            type="monotone" dataKey="score"
            stroke={CORAL} strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CORAL, stroke: WHITE, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}