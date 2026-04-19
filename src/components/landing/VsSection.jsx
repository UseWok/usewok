import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { X, Check, TrendingUp, Clock, DollarSign, Brain, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const coachDisadvantages = [
  { icon: DollarSign, text: '$300–$500/hour with no ROI guarantee', color: '#ef4444' },
  { icon: Clock, text: 'Weeks of waiting for your first plan', color: '#f97316' },
  { icon: Brain, text: 'Generic advice that doesn\'t fit your life', color: '#a855f7' },
  { icon: X, text: 'No real-time adaptation to market changes', color: '#ef4444' },
  { icon: X, text: 'Requires you to explain yourself over and over', color: '#f97316' },
  { icon: X, text: 'Limited to their own expertise only', color: '#a855f7' },
];

const stensorAdvantages = [
  { icon: Zap, text: 'Instant strategy — ready in 60 seconds', color: '#22c55e' },
  { icon: Check, text: 'Flat monthly fee, unlimited strategies', color: YUZU },
  { icon: TrendingUp, text: 'GPT + Claude + Gemini combined intelligence', color: '#22c55e' },
  { icon: Check, text: 'Updates in real-time with your goals', color: YUZU },
  { icon: Check, text: 'Remembers your full financial context', color: '#22c55e' },
  { icon: Check, text: 'Available 24/7, no appointments needed', color: YUZU },
];

const chartData = [
  { month: 'M1', stensor: 12, coach: 28 },
  { month: 'M2', stensor: 26, coach: 34 },
  { month: 'M3', stensor: 38, coach: 36 },
  { month: 'M4', stensor: 52, coach: 38 },
  { month: 'M5', stensor: 65, coach: 35 },
  { month: 'M6', stensor: 76, coach: 30 },
  { month: 'M7', stensor: 84, coach: 22 },
  { month: 'M8', stensor: 91, coach: 14 },
  { month: 'M9', stensor: 97, coach: 5 },
  { month: 'M10', stensor: 100, coach: -8 },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value > 0 ? '+' : ''}{p.value}</div>
      ))}
    </div>
  );
};

export default function VsSection({ onCta }) {
  const ref = useRef(null);

  return (
    <section ref={ref} className="relative overflow-hidden py-32 px-6" style={{ background: '#050508' }}>
      {/* Animated mesh background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Big blurred orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full"
          style={{ width: 600, height: 600, top: '-100px', left: '-150px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute rounded-full"
          style={{ width: 700, height: 700, top: '20%', right: '-200px', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, 50, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
          className="absolute rounded-full"
          style={{ width: 500, height: 500, bottom: '-50px', left: '30%', background: 'radial-gradient(circle, rgba(221,255,0,0.06) 0%, transparent 70%)' }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[10px] font-black tracking-[0.2em] uppercase rounded-full"
            style={{ background: 'rgba(221,255,0,0.08)', color: YUZU, border: '1px solid rgba(221,255,0,0.15)' }}>
            ⚡ The Real Comparison
          </div>
          <h2 className="font-black text-5xl md:text-7xl text-white mb-6 leading-none tracking-tight">
            Why pay a <span style={{ color: '#ef4444', textDecoration: 'line-through', opacity: 0.7 }}>coach</span><br />
            when AI is <span style={{ color: YUZU }}>smarter?</span>
          </h2>
          <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            The finance coach industry hasn't changed in 30 years. Stensor has.
          </p>
        </motion.div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {/* Finance Coach — Disadvantages */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl relative overflow-hidden"
            style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)' }} />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <span className="text-xl">💸</span>
              </div>
              <div>
                <h3 className="font-black text-white text-lg">Finance Coach</h3>
                <p className="text-xs" style={{ color: 'rgba(239,68,68,0.8)' }}>The old way</p>
              </div>
            </div>
            <div className="space-y-4">
              {coachDisadvantages.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(239,68,68,0.12)' }}>
                      <X className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Stensor — Advantages */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-3xl relative overflow-hidden"
            style={{ background: 'rgba(221,255,0,0.03)', border: `1px solid rgba(221,255,0,0.2)` }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, rgba(221,255,0,0.06) 0%, transparent 70%)` }} />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: `rgba(221,255,0,0.15)` }}>
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h3 className="font-black text-white text-lg">Stensor AI</h3>
                <p className="text-xs font-bold" style={{ color: YUZU }}>The new standard</p>
              </div>
            </div>
            <div className="space-y-4">
              {stensorAdvantages.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.1 }}
                    className="flex items-start gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
                      style={{ background: `rgba(34,197,94,0.15)` }}>
                      <Check className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{item.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* LVL 100 Chart */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Background shimmer */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.05) 0%, transparent 60%)',
          }} />

          <div className="text-center mb-10 relative z-10">
            <h3 className="font-black text-4xl md:text-5xl text-white mb-2 tracking-tight">
              LVL <span style={{ color: YUZU }}>100</span>
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Financial improvement over 10 months</p>
          </div>

          <div className="h-64 md:h-80 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="stensor" name="Stensor"
                  stroke="#67e8f9" strokeWidth={3} dot={false}
                  strokeShadowColor="#67e8f9"
                  activeDot={{ r: 6, fill: '#67e8f9', stroke: '#050508', strokeWidth: 2 }}
                />
                <Line
                  type="monotone" dataKey="coach" name="Finance Coach"
                  stroke="#f97316" strokeWidth={3} dot={false}
                  activeDot={{ r: 6, fill: '#f97316', stroke: '#050508', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-8 mt-8 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 rounded-full" style={{ background: '#67e8f9' }} />
              <span className="text-xs font-black tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>STENSOR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 rounded-full" style={{ background: '#f97316' }} />
              <span className="text-xs font-black tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>FINANCE COACH</span>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: '60s', label: 'Strategy ready', color: YUZU },
            { value: '$0', label: 'Hidden fees', color: '#22c55e' },
            { value: '3x', label: 'AI models used', color: '#67e8f9' },
            { value: '24/7', label: 'Always available', color: '#a855f7' },
          ].map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="text-center p-6 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="font-black text-3xl md:text-4xl mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center">
          <button onClick={onCta}
            className="inline-flex items-center gap-3 font-black text-base px-10 py-5 transition-all hover:scale-105 active:scale-95"
            style={{ background: YUZU, color: FG, borderRadius: '14px', boxShadow: `0 0 60px rgba(221,255,0,0.25)` }}>
            <Zap className="w-5 h-5" />
            Beat the coach. Start free.
          </button>
        </motion.div>
      </div>
    </section>
  );
}