// Base44-style: cards fade + slide up gracefully on scroll, no scroll trap
import { motion } from 'framer-motion';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

function FeatureCard({ card, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 64 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden group"
      style={{ borderRadius: '20px', background: FG, boxShadow: '0 4px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="flex flex-col md:flex-row min-h-[280px]">
        {/* Image */}
        <div className="md:w-72 h-56 md:h-auto overflow-hidden relative flex-shrink-0">
          <motion.img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover"
            style={{ transition: 'transform 0.6s ease' }}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.45) 0%, transparent 55%)' }} />
          {/* Yuzu accent bar */}
          <div className="absolute top-0 left-0 w-1 h-full" style={{ background: YUZU, opacity: 0.85 }} />
          {/* Number watermark */}
          <span className="absolute bottom-4 left-5 font-black text-5xl leading-none select-none"
            style={{ color: 'rgba(255,255,255,0.07)' }}>{card.num}</span>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
          <div>
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[9px] font-black tracking-[0.2em] uppercase px-2.5 py-1"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.28)', borderRadius: '4px' }}>
                {card.num} / {card.total}
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: parseInt(card.total) }).map((_, di) => (
                  <div key={di} className="rounded-full"
                    style={{
                      height: '3px',
                      width: di === index ? '22px' : '6px',
                      background: di === index ? YUZU : 'rgba(255,255,255,0.12)',
                      transition: 'all 0.3s',
                    }} />
                ))}
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-black leading-tight mb-4 text-white">
              {card.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>
              {card.desc}
            </p>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: YUZU }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function StickyCardsSection({ cards, section_title, onCta }) {
  return (
    <section>
      {/* Gradient transition from white above */}
      <div style={{ height: 80, background: 'linear-gradient(to bottom, white 0%, #f8f8f2 100%)' }} />

      <div style={{ background: '#f8f8f2' }}>
        {/* Section title */}
        <div className="relative overflow-hidden px-6 pt-12 pb-16 text-center">
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div style={{ width: 700, height: 300, background: 'radial-gradient(ellipse, rgba(221,255,0,0.20) 0%, transparent 70%)', filter: 'blur(50px)' }} />
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
            <div className="inline-block px-3 py-1.5 mb-5 text-[10px] font-black tracking-[0.2em] uppercase rounded-full"
              style={{ background: YUZU, color: FG }}>
              Features
            </div>
            <h2 className="font-black text-4xl md:text-5xl lg:text-6xl tracking-tight" style={{ color: FG }}>
              {section_title}
            </h2>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="px-6 md:px-10 pb-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-5">
            {cards.map((card, i) => (
              <FeatureCard key={card.num} card={card} index={i} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 py-16 text-center">
          <motion.button
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            onClick={onCta}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="text-sm font-black px-10 py-4"
            style={{ background: FG, color: YUZU, borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            Get my strategy
          </motion.button>
        </div>
      </div>

      {/* Gradient transition downward */}
      <div style={{ height: 80, background: 'linear-gradient(to bottom, #f8f8f2 0%, white 100%)' }} />
    </section>
  );
}