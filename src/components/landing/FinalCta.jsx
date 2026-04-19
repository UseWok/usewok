// Final CTA — vivid yuzu/coral background + floating cream card, Base44-style
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

export default function FinalCta({ onCta }) {
  return (
    <section className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #eeff55 0%, #DDFF00 45%, #ccee00 100%)',
        padding: '100px 24px 120px',
      }}>

      {/* Animated soft orb blobs for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 60, -30, 0], y: [0, -50, 30, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', borderRadius: '50%',
            width: 700, height: 700, top: '-200px', left: '-180px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, transparent 65%)',
            filter: 'blur(30px)',
          }}
        />
        <motion.div
          animate={{ x: [0, -80, 40, 0], y: [0, 60, -40, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          style={{
            position: 'absolute', borderRadius: '50%',
            width: 800, height: 800, bottom: '-250px', right: '-200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)',
            filter: 'blur(40px)',
          }}
        />
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
          style={{
            position: 'absolute', borderRadius: '50%',
            width: 500, height: 500, top: '10%', right: '15%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)',
            filter: 'blur(35px)',
          }}
        />
      </div>

      {/* Central cream card */}
      <div className="relative z-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden text-center"
          style={{
            background: '#FEFFF0',
            borderRadius: '12px',
            padding: '64px 80px 72px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 24px 70px rgba(0,0,0,0.14), 0 6px 20px rgba(0,0,0,0.08)',
          }}>

          {/* Subtle inner reflex */}
          <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 100%)' }} />

          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-black leading-tight mb-10"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', color: FG, letterSpacing: '-0.02em' }}>
            So, what shall we<br />build together?
          </motion.h2>

          <motion.button
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.18 }}
            onClick={onCta}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 font-black text-sm px-8 py-4 rounded-full"
            style={{
              background: FG,
              color: YUZU,
              boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
              letterSpacing: '-0.01em',
            }}>
            Start building free
            <span className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0"
              style={{ background: YUZU }}>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: FG }} />
            </span>
          </motion.button>


        </motion.div>
      </div>
    </section>
  );
}