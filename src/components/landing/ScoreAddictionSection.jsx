import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Eye, BarChart3, RefreshCw, Award, X, Check, Clock, DollarSign, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

/* ─── Score section data ─── */
const WHY_SCORE = [
  { icon: Eye,       title: 'Face reality head-on',    desc: 'Stop guessing. Your score tells you exactly where you stand — no sugarcoating.', color: '#3b82f6' },
  { icon: TrendingUp,title: 'Measure your progress',   desc: 'Pay off debt → score rises. Save $50 → score rises. See it happen live.',         color: '#22c55e' },
  { icon: BarChart3, title: 'Prioritize what matters',  desc: 'The score shows the single pillar that will change your financial life the most.',  color: '#a855f7' },
  { icon: RefreshCw, title: 'Automatically updated',    desc: 'Every day at 5 AM your score recalculates. Cloud-synced across all devices.',       color: '#f97316' },
  { icon: Award,     title: 'The positive addiction',   desc: 'Unlock badges, keep your streak. Seeing 68 where there was 42 is the best feeling.',color: YUZU },
];

/* ─── Comparison data ─── */
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

/* ─── Chart ─── */
const chartData = [
  { m: 'M1', s: 10, c: 22 }, { m: 'M2', s: 22, c: 32 }, { m: 'M3', s: 35, c: 37 },
  { m: 'M4', s: 50, c: 38 }, { m: 'M5', s: 63, c: 36 }, { m: 'M6', s: 74, c: 30 },
  { m: 'M7', s: 83, c: 21 }, { m: 'M8', s: 91, c: 12 }, { m: 'M9', s: 97, c: 4  },
  { m: 'M10',s: 100,c: -6  },
];

const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(5,5,10,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
      {payload.map((p, i) => (
        <div key={i} className="text-xs font-bold" style={{ color: p.color }}>
          {p.name}: {p.value > 0 ? '+' : ''}{p.value}
        </div>
      ))}
    </div>
  );
};

/* ─── Animated score arc ─── */
function ScoreArc({ score, color, delay = 0 }) {
  const r = 46, circ = Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: 120, height: 84 }}>
      <svg width={120} height={68} viewBox="0 0 120 68">
        <path d="M 8 60 A 46 46 0 0 1 112 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} strokeLinecap="round" />
        <motion.path d="M 8 60 A 46 46 0 0 1 112 60" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
        <span className="font-black text-3xl leading-none text-white">{score}</span>
        <span className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>/100</span>
      </div>
    </div>
  );
}

export default function ScoreAddictionSection({ onCta }) {
  return (
    <>
      {/* ════════════════════════════════════
          BLOCK 1 — STENSOR SCORE
      ════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-28" style={{ background: FG }}>
        {/* Lights */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ x: [0,30,0], y: [0,-20,0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full" style={{ width: 600, height: 600, top: '-150px', left: '-100px', background: 'radial-gradient(circle, rgba(221,255,0,0.07) 0%, transparent 65%)', filter: 'blur(40px)' }} />
          <motion.div animate={{ x: [0,-40,0], y: [0,30,0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            className="absolute rounded-full" style={{ width: 500, height: 500, bottom: '-100px', right: '-80px', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 65%)', filter: 'blur(40px)' }} />
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(221,255,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(221,255,0,0.025) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] uppercase rounded-lg"
              style={{ background: 'rgba(221,255,0,0.1)', color: YUZU, border: '1px solid rgba(221,255,0,0.2)' }}>
              <Zap className="w-3 h-3" /> Stensor Score
            </div>
            <h2 className="font-black text-4xl md:text-6xl text-white mb-5 leading-tight tracking-tight">
              One number that changes<br /><span style={{ color: YUZU }}>everything.</span>
            </h2>
            <p className="text-base md:text-lg max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Your financial score from 0 to 100. Calculated by AI. Updated every day. Synced across all your devices.
            </p>
          </motion.div>

          {/* Before / After */}
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 mb-24">
            <div className="flex-1 max-w-xs p-8 rounded-3xl flex flex-col items-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>Today</p>
              <ScoreArc score={42} color="#f97316" delay={0.3} />
              <div className="mt-6 w-full space-y-2.5">
                {[['Savings', 35, '#3b82f6'], ['Investment', 20, '#22c55e'], ['Debt', 55, '#f97316']].map(([l, v, c]) => (
                  <div key={l} className="flex items-center gap-2">
                    <span className="text-xs w-24 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: c }} initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} />
                    </div>
                    <span className="text-[10px] font-bold w-6 text-right" style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center gap-2 px-4">
              <div className="px-5 py-2.5 rounded-full text-sm font-black" style={{ background: YUZU, color: FG, boxShadow: `0 0 30px rgba(221,255,0,0.35)` }}>+26 pts</div>
              <p className="text-[10px] text-center mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>in 7 days<br />with Stensor</p>
            </motion.div>

            <div className="flex-1 max-w-xs p-8 rounded-3xl flex flex-col items-center"
              style={{ background: 'rgba(221,255,0,0.04)', border: '1px solid rgba(221,255,0,0.2)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: YUZU }}>In 7 days</p>
              <ScoreArc score={68} color="#22c55e" delay={0.6} />
              <div className="mt-6 w-full space-y-2.5">
                {[['Savings', 62, '#3b82f6'], ['Investment', 55, '#22c55e'], ['Debt', 78, '#22c55e']].map(([l, v, c]) => (
                  <div key={l} className="flex items-center gap-2">
                    <span className="text-xs w-24 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: c }} initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.8 }} />
                    </div>
                    <span className="text-[10px] font-bold w-6 text-right" style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Why grid */}
          <div className="mb-20">
            <p className="text-center text-[10px] font-black uppercase tracking-widest mb-10" style={{ color: 'rgba(255,255,255,0.2)' }}>Why a score?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WHY_SCORE.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-4" style={{ background: item.color + '20' }}>
                      <Icon className="w-5 h-5" style={{ color: item.color === YUZU ? '#c8e800' : item.color }} />
                    </div>
                    <h3 className="font-black text-white mb-2">{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.2)' }}>Unlock badges as you grow</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Debt Slayer',          color: '#f97316' },
                { label: '7-Day Streak',          color: '#ef4444' },
                { label: 'Retirement on Track',   color: '#22c55e' },
                { label: 'Elite Saver',           color: '#3b82f6' },
                { label: 'Active Investor',       color: '#a855f7' },
                { label: 'Finance Master',        color: '#06b6d4' },
              ].map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 260 }}
                  className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: b.color + '18', color: b.color, border: `1px solid ${b.color}30` }}>
                  {b.label}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <button onClick={onCta}
              className="inline-flex items-center gap-2 text-sm font-black px-10 py-5 transition-all hover:scale-105 active:scale-95"
              style={{ background: YUZU, color: FG, borderRadius: '12px', boxShadow: `0 0 40px rgba(221,255,0,0.28)` }}>
              <Zap className="w-4 h-4" />
              Simulate my score now — it's free
            </button>
            <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Synced across all devices · 100/100 = zero financial worries
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════
          BLOCK 2 — DESTROY THE COACH MARKET
      ════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-32" style={{ background: '#04040a' }}>

        {/* ── Vivid joyful light orbs ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Cyan-teal top-left */}
          <motion.div animate={{ x: [0, 50, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.12, 0.96, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: 700, height: 700, top: '-200px', left: '-180px',
              background: 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, rgba(6,182,212,0.06) 40%, transparent 70%)',
              filter: 'blur(50px)' }} />
          {/* Violet top-right */}
          <motion.div animate={{ x: [0, -60, 30, 0], y: [0, 30, -50, 0], scale: [1, 1.08, 1.15, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            style={{ position: 'absolute', width: 750, height: 750, top: '-100px', right: '-220px',
              background: 'radial-gradient(circle, rgba(167,139,250,0.13) 0%, rgba(124,58,237,0.05) 45%, transparent 70%)',
              filter: 'blur(55px)' }} />
          {/* Green bottom-center */}
          <motion.div animate={{ x: [0, 40, -30, 0], y: [0, -30, 50, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
            style={{ position: 'absolute', width: 600, height: 600, bottom: '-150px', left: '25%',
              background: 'radial-gradient(circle, rgba(74,222,128,0.10) 0%, transparent 65%)',
              filter: 'blur(45px)' }} />
          {/* Pink accent */}
          <motion.div animate={{ x: [0, -30, 20, 0], y: [0, 40, -20, 0] }}
            transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
            style={{ position: 'absolute', width: 450, height: 450, top: '40%', left: '50%',
              background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 65%)',
              filter: 'blur(40px)' }} />
          {/* Subtle grid */}
          <div style={{ position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)',
            backgroundSize: '64px 64px' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <div className="inline-block px-4 py-1.5 mb-8 text-[10px] font-black tracking-[0.25em] uppercase rounded-full"
              style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.18)' }}>
              The Real Comparison
            </div>
            <h2 className="font-black text-5xl md:text-7xl text-white mb-6 leading-none tracking-tight">
              Fire your coach.<br />
              <span style={{
                background: 'linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #4ade80 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Upgrade to intelligence.
              </span>
            </h2>
            <p className="text-base md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Finance coaches are expensive, slow, and capped by one person's knowledge.
              Stensor brings you the top 1% of financial strategy — instantly, privately, at a fraction of the cost.
            </p>
          </motion.div>

          {/* ── LVL 100 image ── */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="mb-16 rounded-3xl overflow-hidden relative"
            style={{ border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 0 80px rgba(34,211,238,0.08)' }}>
            <img
              src="https://media.base44.com/images/public/69e4a2ce69b2e02735690e23/9077c083f_image.png"
              alt="LVL 100 — Stensor vs Finance Coach improvements over time"
              className="w-full h-auto block"
            />
            {/* caption overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-8 py-5"
              style={{ background: 'linear-gradient(to top, rgba(4,4,10,0.9) 0%, transparent 100%)' }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Financial improvement over 10 months — Stensor users vs Finance Coach clients
              </p>
            </div>
          </motion.div>

          {/* ── Side-by-side comparison ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">

            {/* Coach — red */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.14)' }}>
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              <div className="mb-8">
                <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(239,68,68,0.7)' }}>The old way</p>
                <h3 className="text-2xl font-black text-white">Finance Coach</h3>
              </div>
              <div className="space-y-4">
                {coachCons.map((text, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(239,68,68,0.15)' }}>
                      <X className="w-3 h-3" style={{ color: '#ef4444' }} />
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stensor — cyan/green */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{ background: 'rgba(34,211,238,0.03)', border: '1px solid rgba(34,211,238,0.18)' }}>
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              <div className="mb-8">
                <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2" style={{ color: '#22d3ee' }}>The new standard</p>
                <h3 className="text-2xl font-black text-white">Stensor AI</h3>
              </div>
              <div className="space-y-4">
                {stensorPros.map((text, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 + 0.1 }}
                    className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(34,211,238,0.12)' }}>
                      <Check className="w-3 h-3" style={{ color: '#22d3ee' }} />
                    </div>
                    <span className="text-sm leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Live chart ── */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(34,211,238,0.06) 0%, transparent 60%)' }} />
            <div className="text-center mb-10 relative z-10">
              <h3 className="font-black text-4xl md:text-5xl text-white tracking-tight mb-2">
                LVL <span style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 12px rgba(34,211,238,0.5))' }}>100</span>
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
                  <Line type="monotone" dataKey="s" name="Stensor" stroke="#22d3ee" strokeWidth={3} dot={false}
                    activeDot={{ r: 6, fill: '#22d3ee', stroke: '#04040a', strokeWidth: 2 }}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.7))' }} />
                  <Line type="monotone" dataKey="c" name="Finance Coach" stroke="#f97316" strokeWidth={3} dot={false}
                    activeDot={{ r: 6, fill: '#f97316', stroke: '#04040a', strokeWidth: 2 }}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.6))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-10 mt-8 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-0.5 rounded-full" style={{ background: '#22d3ee', boxShadow: '0 0 6px #22d3ee' }} />
                <span className="text-xs font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>STENSOR</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-0.5 rounded-full" style={{ background: '#f97316', boxShadow: '0 0 6px #f97316' }} />
                <span className="text-xs font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>FINANCE COACH</span>
              </div>
            </div>
          </motion.div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: '60s',   label: 'Strategy ready',  color: '#22d3ee' },
              { value: '$0',    label: 'Hidden fees',      color: '#4ade80' },
              { value: '3',     label: 'AI models fused',  color: '#a78bfa' },
              { value: '24/7',  label: 'Always available', color: '#f472b6' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="text-center p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="font-black text-3xl md:text-4xl mb-1" style={{ color: s.color, filter: `drop-shadow(0 0 10px ${s.color}60)` }}>{s.value}</div>
                <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* ── CTA ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <h3 className="font-black text-2xl md:text-3xl text-white mb-8 leading-tight">
              Stop paying for mediocrity.<br />
              <span style={{ color: '#22d3ee' }}>Your financial future deserves better.</span>
            </h3>
            <button onClick={onCta}
              className="inline-flex items-center gap-3 font-black text-base px-12 py-5 transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%)', color: '#030306',
                borderRadius: '14px', boxShadow: '0 0 60px rgba(34,211,238,0.25), 0 0 30px rgba(167,139,250,0.15)' }}>
              <Zap className="w-5 h-5" />
              Start free — no credit card
            </button>
            <p className="text-xs mt-5" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Join thousands who already ditched their finance coach
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}