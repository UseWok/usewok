// Neon glow line chart — dark background, cyan Stensor vs red/orange Finance Coach
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const chartData = [
  { month: 'M1',  stensor: 8,   coach: 22 },
  { month: 'M2',  stensor: 18,  coach: 36 },
  { month: 'M3',  stensor: 28,  coach: 42 },
  { month: 'M4',  stensor: 38,  coach: 44 },
  { month: 'M5',  stensor: 52,  coach: 43 },
  { month: 'M6',  stensor: 65,  coach: 40 },
  { month: 'M7',  stensor: 76,  coach: 32 },
  { month: 'M8',  stensor: 86,  coach: 18 },
  { month: 'M9',  stensor: 94,  coach: 8  },
  { month: 'M10', stensor: 100, coach: 2  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(5,5,12,0.95)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '10px 14px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 6, fontWeight: 700, letterSpacing: '0.1em' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 12, fontWeight: 800 }}>
          {p.name}: +{p.value}%
        </p>
      ))}
    </div>
  );
};

export default function NeonChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 0 80px rgba(103,232,249,0.06), 0 0 160px rgba(103,232,249,0.03), 0 20px 60px rgba(0,0,0,0.4)',
        padding: '40px 32px 32px',
      }}>

      {/* Grid dot pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Glow behind cyan line */}
      <div className="absolute pointer-events-none" style={{
        bottom: 80, left: '60%', right: 0, height: 120,
        background: 'radial-gradient(ellipse, rgba(103,232,249,0.12) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }} />

      {/* Title */}
      <div className="relative z-10 mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Financial improvement over 10 months
        </p>
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.12)' }}>
          Stensor users vs Finance Coach clients
        </p>
      </div>

      {/* Chart */}
      <div className="relative z-10" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -30, bottom: 0 }}>
            <defs>
              <filter id="glow-cyan">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-red">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="stensor" name="Stensor"
              stroke="#67e8f9" strokeWidth={3} dot={false}
              filter="url(#glow-cyan)"
              activeDot={{ r: 6, fill: '#67e8f9', stroke: '#07070f', strokeWidth: 2 }}
            />
            <Line
              type="monotone" dataKey="coach" name="Finance Coach"
              stroke="#f97316" strokeWidth={2.5} dot={false}
              filter="url(#glow-red)"
              strokeDasharray="0"
              activeDot={{ r: 5, fill: '#f97316', stroke: '#07070f', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="relative z-10 flex items-center justify-center gap-8 mt-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-0.5 rounded-full" style={{ background: '#67e8f9', boxShadow: '0 0 6px #67e8f9' }} />
          <span className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: 'rgba(103,232,249,0.7)' }}>Stensor</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-0.5 rounded-full" style={{ background: '#f97316', boxShadow: '0 0 6px #f97316' }} />
          <span className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: 'rgba(249,115,22,0.7)' }}>Finance Coach</span>
        </div>
      </div>
    </motion.div>
  );
}