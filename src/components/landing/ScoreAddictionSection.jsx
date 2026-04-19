import { motion } from 'framer-motion';
import { Zap, X, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const coachCons = [
  '$300–$500 per hour with zero ROI guarantee',
  'Weeks of waiting before you get a first plan',
  'Generic advice that ignores your real situation',
  'No adaptation when markets or life change',
  'You repeat yourself every single session',
  'Capped by one human brain, one expertise',
];

const stensorPros = [
  'Full strategy ready in under 60 seconds',
  'Flat monthly fee — unlimited strategies',
  'GPT-4o, Claude 3 and Gemini combined',
  'Evolves in real-time with your goals',
  'Remembers your full financial context forever',
  'Available at 3 AM, no appointment needed',
];

const chartData = [
  { m: 'M1', s: 10, c: 22 }, { m: 'M2', s: 22, c: 32 }, { m: 'M3', s: 35, c: 37 },
  { m: 'M4', s: 50, c: 38 }, { m: 'M5', s: 63, c: 36 }, { m: 'M6', s: 74, c: 30 },
  { m: 'M7', s: 83, c: 21 }, { m: 'M8', s: 91, c: 12 }, { m: 'M9', s: 97, c: 4 },
  { m: 'M10', s: 100, c: -6 },
];

const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: '8px 12px' }}>
      {payload.map((p, i) => (
        <div key={i} className="text-xs font-bold" style={{ color: p.color }}>
          {p.name}: {p.value > 0 ? '+' : ''}{p.value}
        </div>
      ))}
    </div>
  );
};

export default function ScoreAddictionSection({ onCta }) {
  return (
    <section className="relative overflow-hidden px-6 py-28" style={{ background: 'white' }}>

      {/* ── Lunair-style joyful light orbs on white ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Big yuzu/yellow top-left */}
        <motion.div
          animate={{ x: [0, 40, -10, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.97, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', width: 800, height: 800,
            top: '-250px', left: '-200px',
            background: 'radial-gradient(circle, rgba(221,255,0,0.35) 0%, rgba(221,255,0,0.08) 45%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Peach/orange top-right */}
        <motion.div
          animate={{ x: [0, -50, 20, 0], y: [0, 30, -40, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          style={{
            position: 'absolute', width: 700, height: 700,
            top: '-150px', right: '-180px',
            background: 'radial-gradient(circle, rgba(255,200,80,0.28) 0%, rgba(255,160,50,0.08) 45%, transparent 70%)',
            filter: 'blur(55px)',
          }}
        />
        {/* Green-lime bottom-center */}
        <motion.div
          animate={{ x: [0, 30, -25, 0], y: [0, -20, 35, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
          style={{
            position: 'absolute', width: 600, height: 600,
            bottom: '-100px', left: '30%',
            background: 'radial-gradient(circle, rgba(180,255,60,0.20) 0%, transparent 65%)',
            filter: 'blur(50px)',
          }}
        />
        {/* Pink accent center-left */}
        <motion.div
          animate={{ x: [0, -20, 30, 0], y: [0, 40, -15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
          style={{
            position: 'absolute', width: 450, height: 450,
            top: '35%', left: '5%',
            background: 'radial-gradient(circle, rgba(255,150,200,0.14) 0%, transparent 65%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-6">
          <div className="inline-block px-4 py-1.5 mb-8 text-[10px] font-black tracking-[0.25em] uppercase rounded-full"
            style={{ background: 'rgba(10,10,10,0.07)', color: FG, border: '1px solid rgba(10,10,10,0.10)' }}>
            The Real Comparison
          </div>
          <h2 className="font-black text-5xl md:text-7xl mb-6 leading-none tracking-tight" style={{ color: FG }}>
            Fire your coach.<br />
            <span style={{
              background: 'linear-gradient(90deg, #b8a000 0%, #0A0A0A 60%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Upgrade to intelligence.
            </span>
          </h2>
          <p className="text-base md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(10,10,10,0.45)' }}>
            Finance coaches are expensive, slow, and capped by one person's knowledge.
            Stensor brings you top 1% financial strategy — instantly, privately, at a fraction of the cost.
          </p>
        </motion.div>

        {/* LVL 100 image */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 rounded-3xl overflow-hidden relative"
          style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 20px 80px rgba(221,255,0,0.15), 0 4px 24px rgba(0,0,0,0.06)' }}>
          <img
            src="https://media.base44.com/images/public/69e4a2ce69b2e02735690e23/9077c083f_image.png"
            alt="LVL 100 — Stensor vs Finance Coach"
            className="w-full h-auto block"
          />
          <div className="absolute bottom-0 left-0 right-0 px-8 py-5"
            style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)' }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(10,10,10,0.35)' }}>
              Financial improvement over 10 months — Stensor users vs Finance Coach clients
            </p>
          </div>
        </motion.div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">

          {/* Coach */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl relative overflow-hidden"
            style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.14)' }}>
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }} />
            <div className="mb-8">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(239,68,68,0.7)' }}>The old way</p>
              <h3 className="text-2xl font-black" style={{ color: FG }}>Finance Coach</h3>
            </div>
            <div className="space-y-4">
              {coachCons.map((text, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(239,68,68,0.12)' }}>
                    <X className="w-3 h-3" style={{ color: '#ef4444' }} />
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: 'rgba(10,10,10,0.5)' }}>{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stensor */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-3xl relative overflow-hidden"
            style={{ background: FG, border: `1px solid rgba(221,255,0,0.2)` }}>
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, rgba(221,255,0,0.12) 0%, transparent 70%)`, filter: 'blur(20px)' }} />
            <div className="mb-8">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2" style={{ color: YUZU }}>The new standard</p>
              <h3 className="text-2xl font-black text-white">Stensor AI</h3>
            </div>
            <div className="space-y-4">
              {stensorPros.map((text, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 + 0.1 }}
                  className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(221,255,0,0.15)' }}>
                    <Check className="w-3 h-3" style={{ color: YUZU }} />
                  </div>
                  <span className="text-sm leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Live chart */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden"
          style={{ background: FG, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(221,255,0,0.07) 0%, transparent 60%)' }} />
          <div className="text-center mb-10 relative z-10">
            <h3 className="font-black text-4xl md:text-5xl text-white tracking-tight mb-2">
              LVL <span style={{ color: YUZU, filter: 'drop-shadow(0 0 12px rgba(221,255,0,0.5))' }}>100</span>
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>Financial improvement score — 10 months</p>
          </div>
          <div className="h-64 md:h-72 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" />
                <XAxis dataKey="m" tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="s" name="Stensor" stroke={YUZU} strokeWidth={3} dot={false}
                  activeDot={{ r: 6, fill: YUZU, stroke: FG, strokeWidth: 2 }}
                  style={{ filter: `drop-shadow(0 0 8px rgba(221,255,0,0.8))` }} />
                <Line type="monotone" dataKey="c" name="Finance Coach" stroke="#f97316" strokeWidth={3} dot={false}
                  activeDot={{ r: 6, fill: '#f97316', stroke: FG, strokeWidth: 2 }}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.6))' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-10 mt-8 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-0.5 rounded-full" style={{ background: YUZU, boxShadow: `0 0 6px ${YUZU}` }} />
              <span className="text-xs font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>STENSOR</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-0.5 rounded-full" style={{ background: '#f97316', boxShadow: '0 0 6px #f97316' }} />
              <span className="text-xs font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>FINANCE COACH</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: '60s',  label: 'Strategy ready',  color: '#b8a000' },
            { value: '$0',   label: 'Hidden fees',      color: '#22c55e' },
            { value: '3',    label: 'AI models fused',  color: FG },
            { value: '24/7', label: 'Always available', color: '#f97316' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="text-center p-6 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)' }}>
              <div className="font-black text-3xl md:text-4xl mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold" style={{ color: 'rgba(10,10,10,0.35)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center">
          <h3 className="font-black text-2xl md:text-3xl mb-8 leading-tight" style={{ color: FG }}>
            Stop paying for mediocrity.<br />
            <span style={{ color: '#b8a000' }}>Your financial future deserves better.</span>
          </h3>
          <button onClick={onCta}
            className="inline-flex items-center gap-3 font-black text-base px-12 py-5 transition-all hover:scale-105 active:scale-95"
            style={{ background: FG, color: YUZU, borderRadius: '14px', boxShadow: '0 8px 40px rgba(10,10,10,0.20)' }}>
            <Zap className="w-5 h-5" />
            Start free — no credit card
          </button>
          <p className="text-xs mt-5" style={{ color: 'rgba(10,10,10,0.25)' }}>
            Join thousands who already ditched their finance coach
          </p>
        </motion.div>

      </div>
    </section>
  );
}