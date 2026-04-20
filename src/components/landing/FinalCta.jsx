import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

export default function FinalCta({ onCta }) {
  return (
    <section className="px-6 py-24 bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-[10px] font-black tracking-[0.2em] uppercase"
            style={{ background: YUZU, color: FG, borderRadius: '6px' }}>
            Start today — free
          </div>

          <h2 className="font-black leading-tight mb-6"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', color: FG, letterSpacing: '-0.03em' }}>
            So, what shall we<br />build together?
          </h2>

          <p className="text-sm mb-10 font-medium" style={{ color: 'rgba(10,10,10,0.45)' }}>
            Your AI financial coach. Available 24/7. No appointments needed.
          </p>

          <motion.button
            onClick={onCta}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 font-black text-sm px-8 py-4"
            style={{ background: FG, color: 'white', borderRadius: '10px' }}>
            Get started free
            <span className="w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{ background: YUZU, borderRadius: '6px' }}>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: FG }} />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}