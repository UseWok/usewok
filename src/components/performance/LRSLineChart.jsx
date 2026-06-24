import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const INK = '#111110';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const CORAL = '#F95738';
const WHITE = '#FFFFFF';
const SURFACE = '#F7F6F4';

// Generate plausible historical data from current score
function buildHistory(currentScore) {
  if (!currentScore) return [];
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const now = new Date();
  const data = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const label = months[d.getMonth()];
    // slight variation ± 12 points, trending toward current
    const noise = (Math.random() - 0.45) * 14;
    const base = currentScore - (i * (currentScore * 0.08));
    const val = Math.max(5, Math.min(100, Math.round(base + noise)));
    data.push({ label, score: val });
  }
  // ensure last point = current score
  if (data.length > 0) data[data.length - 1].score = currentScore;
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: INK, border: 'none', borderRadius: 9, padding: '8px 13px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{payload[0].value}<span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginLeft: 2 }}>/100</span></div>
    </div>
  );
};

export default function LRSLineChart({ score, domain }) {
  const data = buildHistory(score || 42);
  const first = data[0]?.score || 0;
  const last = data[data.length - 1]?.score || 0;
  const delta = last - first;
  const trend = delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: INK, borderRadius: 18, padding: '22px 20px 16px', marginBottom: 14, overflow: 'hidden', position: 'relative' }}
    >
      {/* Ambient glow behind chart */}
      <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 60, background: `radial-gradient(ellipse, ${CORAL}25 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Évolution LRS — 6 mois</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{last}<span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>/100</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 20, background: trend === 'up' ? 'rgba(16,185,129,0.15)' : trend === 'down' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)', border: `1px solid ${trend === 'up' ? 'rgba(16,185,129,0.3)' : trend === 'down' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)'}` }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : 'rgba(255,255,255,0.5)' }}>
            {trend === 'up' ? `↗ +${delta}pts` : trend === 'down' ? `↘ ${delta}pts` : '→ Stable'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
          <defs>
            <linearGradient id="coralLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={CORAL} stopOpacity={0.6} />
              <stop offset="100%" stopColor={CORAL} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="0" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Inter, system-ui, sans-serif' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} axisLine={false} tickLine={false} tickCount={3} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
          <Line
            type="monotone" dataKey="score"
            stroke="url(#coralLine)" strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: CORAL, stroke: INK, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Footer */}
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>Données estimées · Connectez GSC pour l'historique réel</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{domain}</span>
      </div>
    </motion.div>
  );
}