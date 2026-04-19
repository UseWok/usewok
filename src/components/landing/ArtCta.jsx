// Reusable "art explosion" CTA section — replaces flat black endings
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

export default function ArtCta({ title, subtitle, buttonLabel, onCta, topGradient = false }) {
  return (
    <section className="relative overflow-hidden px-6 py-32 text-center"
      style={topGradient ? {
        background: 'linear-gradient(to bottom, white 0%, #fefff0 8%, #04040a 18%)',
      } : {
        background: '#04040a',
      }}>

      {/* Art explosion — layered colorful orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Yuzu burst — center */}
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.80, 0.55] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', width: 900, height: 900,
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(221,255,0,0.13) 0%, rgba(180,230,0,0.05) 40%, transparent 68%)',
            filter: 'blur(50px)',
          }}
        />
        {/* Coral/red — top-left */}
        <motion.div
          animate={{ x: [0, 60, -20, 0], y: [0, -50, 30, 0], scale: [1, 1.12, 0.94, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', width: 600, height: 600,
            top: '-150px', left: '-100px',
            background: 'radial-gradient(circle, rgba(255,80,60,0.18) 0%, rgba(255,50,30,0.06) 45%, transparent 68%)',
            filter: 'blur(55px)',
          }}
        />
        {/* Electric blue — top-right */}
        <motion.div
          animate={{ x: [0, -70, 20, 0], y: [0, 40, -60, 0], scale: [1, 1.1, 1.16, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          style={{
            position: 'absolute', width: 700, height: 700,
            top: '-180px', right: '-150px',
            background: 'radial-gradient(circle, rgba(80,140,255,0.16) 0%, rgba(50,100,255,0.05) 45%, transparent 68%)',
            filter: 'blur(55px)',
          }}
        />
        {/* Green-lime — bottom-left */}
        <motion.div
          animate={{ x: [0, 50, -30, 0], y: [0, -30, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
          style={{
            position: 'absolute', width: 550, height: 550,
            bottom: '-100px', left: '10%',
            background: 'radial-gradient(circle, rgba(120,255,120,0.13) 0%, transparent 65%)',
            filter: 'blur(45px)',
          }}
        />
        {/* Violet — bottom-right */}
        <motion.div
          animate={{ x: [0, -40, 25, 0], y: [0, 35, -45, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 11 }}
          style={{
            position: 'absolute', width: 500, height: 500,
            bottom: '-80px', right: '10%',
            background: 'radial-gradient(circle, rgba(180,100,255,0.14) 0%, transparent 65%)',
            filter: 'blur(45px)',
          }}
        />
        {/* Pink accent — center-left */}
        <motion.div
          animate={{ x: [0, -30, 40, 0], y: [0, 50, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{
            position: 'absolute', width: 350, height: 350,
            top: '40%', left: '20%',
            background: 'radial-gradient(circle, rgba(255,120,200,0.12) 0%, transparent 65%)',
            filter: 'blur(35px)',
          }}
        />
        {/* Cyan — center-right */}
        <motion.div
          animate={{ x: [0, 30, -40, 0], y: [0, -40, 30, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          style={{
            position: 'absolute', width: 380, height: 380,
            top: '35%', right: '18%',
            background: 'radial-gradient(circle, rgba(0,220,220,0.11) 0%, transparent 65%)',
            filter: 'blur(35px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-black tracking-tight text-white mb-6 whitespace-pre-line"
          style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', lineHeight: 1.05 }}>
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-base mb-10 max-w-lg mx-auto"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            {subtitle}
          </motion.p>
        )}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.14 }}
          onClick={onCta}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 font-black text-base px-12 py-5"
          style={{
            background: YUZU,
            color: FG,
            borderRadius: '14px',
            boxShadow: '0 0 60px rgba(221,255,0,0.30), 0 0 120px rgba(221,255,0,0.12)',
          }}>
          {buttonLabel}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </section>
  );
}