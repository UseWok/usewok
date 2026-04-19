// Final CTA — cinematic dark transition + yuzu spotlight, squared aesthetic
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

export default function FinalCta({ onCta }) {
  return (
    <section className="relative overflow-hidden"
      style={{ background: 'white' }}>

      {/* ── Bridge: white → deep dark ────────────────────── */}
      <div style={{
        height: 180,
        background: 'linear-gradient(to bottom, white 0%, #f8ffd0 18%, #d4f500 45%, #0a0a0a 100%)',
      }} />

      {/* ── Main dark panel ──────────────────────────────── */}
      <div className="relative" style={{ background: '#0a0a0a', padding: '80px 24px 120px' }}>

        {/* Yuzu spotlight from above */}
        <div className="absolute top-0 left-1/2 pointer-events-none"
          style={{
            transform: 'translateX(-50%)',
            width: 900,
            height: 500,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(221,255,0,0.22) 0%, rgba(221,255,0,0.06) 40%, transparent 70%)',
            filter: 'blur(1px)',
          }} />

        {/* Animated side orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', borderRadius: '50%',
              width: 600, height: 600, top: '-100px', left: '-150px',
              background: 'radial-gradient(circle, rgba(221,255,0,0.07) 0%, transparent 65%)',
              filter: 'blur(40px)',
            }}
          />
          <motion.div
            animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0], scale: [1, 1.08, 0.92, 1] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            style={{
              position: 'absolute', borderRadius: '50%',
              width: 700, height: 700, bottom: '-150px', right: '-200px',
              background: 'radial-gradient(circle, rgba(221,255,0,0.06) 0%, transparent 65%)',
              filter: 'blur(50px)',
            }}
          />
        </div>

        {/* Central card */}
        <div className="relative z-10 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="text-center w-full"
            style={{ maxWidth: '640px' }}>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.06 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-[10px] font-black tracking-[0.2em] uppercase"
              style={{ background: 'rgba(221,255,0,0.10)', color: YUZU, border: '1px solid rgba(221,255,0,0.18)', borderRadius: '4px' }}>
              Start today — free
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-black leading-tight mb-6 text-white"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 4rem)', letterSpacing: '-0.03em' }}>
              So, what shall we<br />
              <span style={{ color: YUZU }}>build together?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="text-sm mb-10 font-medium"
              style={{ color: 'rgba(255,255,255,0.38)' }}>
              Your AI financial coach. Available 24/7. No appointments needed.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.22 }}
              onClick={onCta}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 font-black text-sm px-8 py-4"
              style={{
                background: YUZU,
                color: FG,
                borderRadius: '8px',
                boxShadow: '0 0 40px rgba(221,255,0,0.25), 0 4px 20px rgba(0,0,0,0.3)',
                letterSpacing: '-0.01em',
              }}>
              Get started free
              <span className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                style={{ background: FG, borderRadius: '6px' }}>
                <ArrowRight className="w-3.5 h-3.5" style={{ color: YUZU }} />
              </span>
            </motion.button>

          </motion.div>
        </div>
      </div>
    </section>
  );
}