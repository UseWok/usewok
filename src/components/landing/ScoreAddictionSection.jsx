import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import SavingsCounter from './SavingsCounter';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const coachCons = [
  { title: '$300–$500/hour' },
  { title: 'Weeks of waiting' },
  { title: 'One opinion, one brain' },
  { title: 'Offline at 3 AM' },
  { title: 'Generic templates' },
  { title: 'Starts from scratch every session' },
];

const stensorPros = [
  { title: 'Answer in 60 seconds' },
  { title: '3 AI models fused' },
  { title: 'Knows your full context' },
  { title: '24/7 — always on' },
  { title: 'Adapts in real-time' },
  { title: 'Flat monthly fee' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function ScoreAddictionSection({ onCta }) {
  return (
    <>
      <div style={{ height: 60, background: 'linear-gradient(to bottom, white 0%, #f8faff 100%)' }} />

      <section className="relative overflow-hidden px-6 py-24" style={{ background: '#f8faff' }}>

        {/* Background orbs — light */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 40, -10, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: 700, height: 700, top: '-200px', left: '-150px', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }}
          />
          <motion.div
            animate={{ x: [0, -40, 20, 0], y: [0, 30, -30, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            style={{ position: 'absolute', width: 600, height: 600, top: '-100px', right: '-150px', background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 65%)', filter: 'blur(55px)' }}
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">

          {/* Header */}
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="font-black leading-none tracking-tight mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: FG }}>
              Fire your coach.<br />
              <span style={{ background: 'linear-gradient(90deg, #a08800 0%, #0A0A0A 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Upgrade to intelligence.
              </span>
            </h2>
            <p className="text-sm font-medium max-w-md mx-auto" style={{ color: 'rgba(10,10,10,0.4)' }}>
              Finance coaches haven't changed in 30 years. Stensor changes everything in 60 seconds.
            </p>
          </motion.div>

          {/* Savings Counter */}
          <motion.div {...fadeUp(0.1)} className="mb-16 max-w-2xl mx-auto">
            <SavingsCounter />
          </motion.div>

          {/* Comparison — compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">

            {/* Coach */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
              className="relative overflow-hidden"
              style={{ borderRadius: '20px', background: 'linear-gradient(145deg, #fdfcfc 0%, #fff5f5 100%)', border: '1px solid rgba(239,68,68,0.10)', padding: '28px 28px' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }} />
                <p className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(239,68,68,0.6)' }}>The old way</p>
              </div>
              <h3 className="text-xl font-black mb-5" style={{ color: FG }}>Finance Coach</h3>
              <div className="space-y-3">
                {coachCons.map((item, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0"
                      style={{ background: 'rgba(239,68,68,0.10)' }}>
                      <X className="w-2.5 h-2.5" style={{ color: '#ef4444' }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: FG }}>{item.title}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stensor */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay: 0.08 }}
              className="relative overflow-hidden"
              style={{ borderRadius: '20px', background: 'linear-gradient(145deg, #0a0a0a 0%, #111108 100%)', border: '1px solid rgba(221,255,0,0.15)', padding: '28px 28px', boxShadow: '0 8px 60px rgba(221,255,0,0.08)' }}>
              <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(221,255,0,0.10) 0%, transparent 70%)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ background: YUZU, boxShadow: '0 0 8px rgba(221,255,0,0.8)' }} />
                  <p className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: YUZU }}>The new standard</p>
                </div>
                <h3 className="text-xl font-black mb-5 text-white">Stensor AI</h3>
                <div className="space-y-3">
                  {stensorPros.map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05 + 0.08 }}
                      className="flex items-center gap-3">
                      <div className="w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0"
                        style={{ background: 'rgba(221,255,0,0.12)' }}>
                        <Check className="w-2.5 h-2.5" style={{ color: YUZU }} />
                      </div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '60s',  label: 'Strategy ready',  color: '#a08800' },
              { value: '$0',   label: 'Hidden fees',      color: '#22c55e' },
              { value: '3',    label: 'AI models fused',  color: FG },
              { value: '24/7', label: 'Always on',        color: '#f97316' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.07 }}
                className="text-center p-6 rounded-2xl"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="font-black text-3xl md:text-4xl mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-semibold" style={{ color: 'rgba(10,10,10,0.30)' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}