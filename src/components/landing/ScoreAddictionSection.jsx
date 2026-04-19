import { motion } from 'framer-motion';
import { Zap, X, Check } from 'lucide-react';
import ArtCta from './ArtCta';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const coachCons = [
  { title: '$300–$500/hour', sub: 'No ROI guarantee — you pay whether it works or not' },
  { title: 'Weeks of waiting', sub: 'Scheduled appointments, no access when you need it most' },
  { title: 'One brain, one opinion', sub: 'Their knowledge ceiling becomes your strategy ceiling' },
  { title: 'Generic templates', sub: 'The same plan they gave the last 50 clients' },
  { title: 'Starts from zero each time', sub: 'You explain yourself over and over, every session' },
  { title: 'Offline at 3 AM', sub: 'Markets don\'t sleep — your coach does' },
];

const stensorPros = [
  { title: 'Strategy in 60 seconds', sub: 'Ask anything, get an expert answer instantly — any time, any day' },
  { title: 'GPT-4o + Claude + Gemini', sub: 'The three most powerful AIs in the world, fused into one' },
  { title: 'Knows your full story', sub: 'Remembers your goals, your income, your context — forever' },
  { title: 'Adapts in real-time', sub: 'Market shifts, life changes — Stensor adjusts your plan live' },
  { title: 'Flat monthly fee', sub: 'Unlimited strategies. No surprises, no invoice shock' },
  { title: 'Completely private', sub: 'Your financial life is encrypted and never sold to anyone' },
];

export default function ScoreAddictionSection({ onCta }) {
  return (
    <>
      {/* Gradient bridge from above section */}
      <div style={{ height: 80, background: 'linear-gradient(to bottom, #f8f8f2 0%, white 100%)' }} />

      <section className="relative overflow-hidden px-6 py-24" style={{ background: 'white' }}>

        {/* Joyful background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 40, -10, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.97, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: 800, height: 800, top: '-250px', left: '-200px', background: 'radial-gradient(circle, rgba(221,255,0,0.30) 0%, rgba(221,255,0,0.07) 45%, transparent 70%)', filter: 'blur(60px)' }}
          />
          <motion.div
            animate={{ x: [0, -50, 20, 0], y: [0, 30, -40, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            style={{ position: 'absolute', width: 700, height: 700, top: '-150px', right: '-180px', background: 'radial-gradient(circle, rgba(255,200,80,0.25) 0%, rgba(255,160,50,0.07) 45%, transparent 70%)', filter: 'blur(55px)' }}
          />
          <motion.div
            animate={{ x: [0, 30, -25, 0], y: [0, -20, 35, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
            style={{ position: 'absolute', width: 600, height: 600, bottom: '-100px', left: '30%', background: 'radial-gradient(circle, rgba(180,255,60,0.18) 0%, transparent 65%)', filter: 'blur(50px)' }}
          />
          <motion.div
            animate={{ x: [0, -20, 30, 0], y: [0, 40, -15, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
            style={{ position: 'absolute', width: 450, height: 450, top: '35%', left: '5%', background: 'radial-gradient(circle, rgba(255,150,200,0.12) 0%, transparent 65%)', filter: 'blur(40px)' }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 mb-8 text-[10px] font-black tracking-[0.25em] uppercase rounded-full"
              style={{ background: 'rgba(10,10,10,0.07)', color: FG, border: '1px solid rgba(10,10,10,0.10)' }}>
              The Real Comparison
            </div>
            <h2 className="font-black text-5xl md:text-7xl mb-6 leading-none tracking-tight" style={{ color: FG }}>
              Fire your coach.<br />
              <span style={{ background: 'linear-gradient(90deg, #a08800 0%, #0A0A0A 55%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Upgrade to intelligence.
              </span>
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(10,10,10,0.42)' }}>
              Finance coaches haven't changed in 30 years. Stensor changes everything — in 60 seconds.
            </p>
          </motion.div>

          {/* LVL 100 image */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-20 rounded-3xl overflow-hidden relative"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 20px 80px rgba(221,255,0,0.14), 0 4px 24px rgba(0,0,0,0.05)' }}>
            <img
              src="https://media.base44.com/images/public/69e4a2ce69b2e02735690e23/9077c083f_image.png"
              alt="LVL 100 — Stensor vs Finance Coach"
              className="w-full h-auto block"
            />
            <div className="absolute bottom-0 left-0 right-0 px-8 py-5"
              style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)' }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(10,10,10,0.32)' }}>
                Financial improvement over 10 months — Stensor users vs Finance Coach clients
              </p>
            </div>
          </motion.div>

          {/* Side-by-side comparison — card layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">

            {/* Finance Coach */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl overflow-hidden"
              style={{ border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(255,250,250,0.8)' }}>
              <div className="px-8 pt-8 pb-6"
                style={{ background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.10)' }}>
                <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(239,68,68,0.65)' }}>The old way</p>
                <h3 className="text-2xl font-black" style={{ color: FG }}>Finance Coach</h3>
                <p className="text-sm mt-1" style={{ color: 'rgba(10,10,10,0.38)' }}>Expensive. Slow. Limited.</p>
              </div>
              <div className="p-8 space-y-5">
                {coachCons.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(239,68,68,0.10)' }}>
                      <X className="w-3 h-3" style={{ color: '#ef4444' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: FG }}>{item.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(10,10,10,0.42)' }}>{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stensor */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl overflow-hidden"
              style={{ background: FG, border: '1px solid rgba(221,255,0,0.15)' }}>
              <div className="px-8 pt-8 pb-6" style={{ background: 'rgba(221,255,0,0.05)', borderBottom: '1px solid rgba(221,255,0,0.08)' }}>
                <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-1" style={{ color: YUZU }}>The new standard</p>
                <h3 className="text-2xl font-black text-white">Stensor AI</h3>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>Instant. Intelligent. Yours.</p>
              </div>
              <div className="p-8 space-y-5">
                {stensorPros.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 + 0.1 }}
                    className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(221,255,0,0.15)' }}>
                      <Check className="w-3 h-3" style={{ color: YUZU }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { value: '60s',  label: 'Strategy ready',  color: '#a08800' },
              { value: '$0',   label: 'Hidden fees',      color: '#22c55e' },
              { value: '3',    label: 'AI models fused',  color: FG },
              { value: '24/7', label: 'Always available', color: '#f97316' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="text-center p-6 rounded-2xl"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="font-black text-3xl md:text-4xl mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-semibold" style={{ color: 'rgba(10,10,10,0.32)' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Art CTA — with gradient bridge */}
      <ArtCta
        topGradient={true}
        title={"Stop paying for mediocrity.\nYour money deserves more."}
        subtitle="Join thousands who ditched their finance coach and never looked back."
        buttonLabel="Start free — no credit card"
        onCta={onCta}
      />
    </>
  );
}