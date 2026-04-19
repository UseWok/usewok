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