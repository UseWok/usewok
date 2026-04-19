// Cinematic closing CTA — "The only choice" energy
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const pills = [
  { icon: Zap, label: 'Instant strategy' },
  { icon: Shield, label: 'Fully private' },
  { icon: Clock, label: '24/7 available' },
];

export default function FinalCta({ onCta }) {
  return (
    <section className="relative overflow-hidden" style={{ background: '#05050c' }}>

      {/* Top gradient bridge */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, white 0%, #05050c 100%)' }} />

      {/* Ambient light show */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Central yuzu halo */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.18, 0.32, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', width: 1000, height: 1000,
            top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(221,255,0,0.18) 0%, rgba(180,230,0,0.06) 35%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Left teal */}
        <motion.div
          animate={{ x: [0, 60, -20, 0], y: [0, -40, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute', width: 700, height: 700,
            top: '-100px', left: '-150px',
            background: 'radial-gradient(circle, rgba(0,210,180,0.12) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Right violet */}
        <motion.div
          animate={{ x: [0, -50, 20, 0], y: [0, 50, -30, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
          style={{
            position: 'absolute', width: 700, height: 700,
            top: '-80px', right: '-150px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Bottom coral */}
        <motion.div
          animate={{ x: [0, 30, -40, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          style={{
            position: 'absolute', width: 600, height: 600,
            bottom: '-100px', left: '25%',
            background: 'radial-gradient(circle, rgba(255,100,60,0.10) 0%, transparent 65%)',
            filter: 'blur(50px)',
          }}
        />
        {/* Soft stars pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-52 pb-36 text-center">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-full"
          style={{ background: 'rgba(221,255,0,0.08)', border: '1px solid rgba(221,255,0,0.20)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: YUZU }} />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: YUZU }}>
            The only choice
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="font-black leading-[1.0] tracking-tight text-white mb-8 whitespace-pre-line"
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>
          {"Your wealth.\nYour rules.\nYour AI."}
        </motion.h2>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg max-w-xl mx-auto mb-14 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.38)' }}>
          Stop outsourcing your financial future to someone who doesn't know you.
          Stensor is the last financial tool you'll ever need.
        </motion.p>

        {/* Pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.14 }}
          className="flex flex-wrap justify-center gap-3 mb-14">
          {pills.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Icon className="w-3.5 h-3.5" style={{ color: YUZU }} />
              <span className="text-xs font-bold text-white">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.18 }}
          className="flex flex-col items-center gap-4">
          <button
            onClick={onCta}
            className="group relative inline-flex items-center gap-3 font-black text-lg px-14 py-6 overflow-hidden"
            style={{
              background: YUZU,
              color: FG,
              borderRadius: '16px',
              boxShadow: '0 0 40px rgba(221,255,0,0.35), 0 0 80px rgba(221,255,0,0.15)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 60px rgba(221,255,0,0.55), 0 0 120px rgba(221,255,0,0.25)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(221,255,0,0.35), 0 0 80px rgba(221,255,0,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}>
            Start free — no credit card
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.20)' }}>
            Join 12,000+ people already building wealth with Stensor
          </p>
        </motion.div>

      </div>
    </section>
  );
}