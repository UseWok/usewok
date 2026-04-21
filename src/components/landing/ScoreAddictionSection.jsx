import { motion } from 'framer-motion';
import { X, Check, DollarSign, Clock, Zap, TrendingUp, Shield, MessageCircle } from 'lucide-react';
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

const KEY_POINTS = [
  {
    icon: Clock,
    title: 'A plan in 60 seconds',
    desc: 'Tell Stensor your goal. Get a step-by-step financial plan instantly — no waiting, no appointments.',
  },
  {
    icon: DollarSign,
    title: 'Stop losing money to fees',
    desc: "Most people overpay on bank fees, bad rates, and overpriced advice. Stensor shows you exactly where your money is leaking.",
  },
  {
    icon: TrendingUp,
    title: 'Invest without being lost',
    desc: "ETFs, index funds, Roth IRA — you don't need to be an expert. Stensor explains it simply and tells you what to do with your money.",
  },
  {
    icon: Zap,
    title: 'Get out of debt faster',
    desc: "Stensor calculates the fastest path to zero debt — whether it's $5k or $50k — and gives you a month-by-month payoff plan.",
  },
  {
    icon: MessageCircle,
    title: 'Ask anything, anytime',
    desc: "Broke before payday? Thinking about buying a house? Just ask. Your AI coach is available 24/7 and never judges you.",
  },
  {
    icon: Shield,
    title: 'Built for the 20–35 crowd',
    desc: "Not your parents' finance advice. Stensor is built for your life — side hustles, student loans, rent vs buy, FIRE, and more.",
  },
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

      <section className="relative overflow-hidden px-4 py-24" style={{ background: '#f8faff' }}>

        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 40, -10, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: 700, height: 700, top: '-200px', left: '-150px', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }}
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

          {/* Comparison — mobile-friendly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">

            {/* Coach */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
              className="relative overflow-hidden"
              style={{ borderRadius: '20px', background: 'white', border: '1px solid rgba(239,68,68,0.12)', padding: '28px 24px' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
                <p className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(239,68,68,0.6)' }}>The old way</p>
              </div>
              <h3 className="text-lg font-black mb-5" style={{ color: FG }}>Finance Coach</h3>
              <div className="space-y-3">
                {coachCons.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0"
                      style={{ background: 'rgba(239,68,68,0.10)' }}>
                      <X className="w-2.5 h-2.5" style={{ color: '#ef4444' }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: FG }}>{item.title}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stensor */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay: 0.08 }}
              className="relative overflow-hidden"
              style={{ borderRadius: '20px', background: 'linear-gradient(145deg, #0a0a0a 0%, #111108 100%)', border: '1px solid rgba(221,255,0,0.15)', padding: '28px 24px', boxShadow: '0 8px 60px rgba(221,255,0,0.08)' }}>
              <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(221,255,0,0.10) 0%, transparent 70%)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: YUZU }} />
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: YUZU }}>The new standard</p>
                </div>
                <h3 className="text-lg font-black mb-5 text-white">Stensor</h3>
                <div className="space-y-3">
                  {stensorPros.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0"
                        style={{ background: 'rgba(221,255,0,0.12)' }}>
                        <Check className="w-2.5 h-2.5" style={{ color: YUZU }} />
                      </div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* 6 Key Points */}
          <motion.div {...fadeUp(0.1)} className="text-center mb-10">
            <h2 className="font-black tracking-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: FG }}>
              Why people aged 20–35 choose Stensor
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {KEY_POINTS.map((point, i) => {
              const Icon = point.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.06 }}
                  className="flex flex-col items-center text-center p-8 rounded-2xl"
                  style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl mb-5 flex-shrink-0"
                    style={{ background: 'rgba(0,0,0,0.06)' }}>
                    <Icon className="w-5 h-5" style={{ color: FG }} />
                  </div>
                  <h3 className="text-base font-black mb-3" style={{ color: FG }}>{point.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(10,10,10,0.5)' }}>{point.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
}