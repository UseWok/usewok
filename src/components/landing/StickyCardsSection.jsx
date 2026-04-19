import { motion } from 'framer-motion';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

function FeatureCard({ card, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="overflow-hidden cursor-default"
      style={{ borderRadius: '20px', background: FG, boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}
    >
      <div className="flex flex-col md:flex-row min-h-[300px]">
        {/* Image */}
        <div className="md:w-72 h-56 md:h-auto overflow-hidden relative flex-shrink-0">
          <motion.img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.5 }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.5) 0%, transparent 60%)' }} />
          {/* Card number watermark */}
          <div className="absolute bottom-4 left-5">
            <span className="font-black text-5xl leading-none select-none"
              style={{ color: 'rgba(255,255,255,0.08)' }}>{card.num}</span>
          </div>
          {/* Yuzu accent line */}
          <div className="absolute top-0 left-0 w-1 h-full" style={{ background: YUZU, opacity: 0.7 }} />
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
          <div>
            {/* Progress indicators */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[9px] font-black tracking-[0.2em] uppercase px-2.5 py-1"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>
                {card.num} / {card.total}
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: parseInt(card.total) }).map((_, di) => (
                  <div key={di} className="rounded-full transition-all"
                    style={{
                      height: '3px',
                      width: di === index ? '24px' : '6px',
                      background: di === index ? YUZU : 'rgba(255,255,255,0.12)',
                    }} />
                ))}
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-black leading-tight mb-4 text-white">
              {card.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {card.desc}
            </p>
          </div>

          {/* Bottom accent */}
          <div className="mt-8 flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: YUZU }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function StickyCardsSection({ cards, section_title, onCta }) {
  return (
    <section style={{ background: '#f8f8f4' }}>
      {/* Section title */}
      <div className="relative overflow-hidden px-6 py-20 text-center">
        {/* Soft yuzu glow behind title */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div style={{ width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(221,255,0,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative z-10">
          <div className="inline-block px-3 py-1.5 mb-5 text-[10px] font-black tracking-[0.2em] uppercase rounded-full"
            style={{ background: YUZU, color: FG }}>
            Features
          </div>
          <h2 className="font-black text-4xl md:text-5xl lg:text-6xl tracking-tight" style={{ color: FG }}>
            {section_title}
          </h2>
        </motion.div>
      </div>

      {/* Cards grid — NO scroll trap */}
      <div className="px-6 md:px-10 pb-10">
        <div className="max-w-5xl mx-auto flex flex-col gap-5">
          {cards.map((card, i) => (
            <FeatureCard key={card.num} card={card} index={i} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-16 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={onCta}
          className="text-sm font-black px-8 py-4 transition-all hover:scale-[1.04] active:scale-95"
          style={{ background: FG, color: YUZU, borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
          Get my strategy
        </button>
      </div>
    </section>
  );
}