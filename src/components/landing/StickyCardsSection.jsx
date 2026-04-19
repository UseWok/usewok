import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

function StickyCard({ card, index, total, progress }) {
  // Each card occupies 1/total of the scroll range
  const start = index / total;
  const end = (index + 1) / total;

  // Scale: comes in from below (scale 0.85) to full (1.0), stays full, then slightly scales down as next comes
  const scale = useTransform(progress, [start - 0.05, start + 0.05, end - 0.02, end], [0.88, 1, 1, 0.96]);
  const opacity = useTransform(progress, [start - 0.05, start + 0.03], [0, 1]);
  const yOffset = useTransform(progress, [start - 0.05, start + 0.05], [60, 0]);

  return (
    <motion.div
      style={{
        scale,
        opacity,
        y: yOffset,
        position: 'sticky',
        top: `${80 + index * 20}px`,
        zIndex: 10 + index,
        transformOrigin: 'top center',
      }}
      className="w-full max-w-5xl mx-auto mb-6 overflow-hidden"
      // No borderRadius here, put it on inner
    >
      <div className="overflow-hidden" style={{ background: FG, borderRadius: '16px', boxShadow: `0 ${20 + index * 8}px ${60 + index * 10}px rgba(0,0,0,0.35)` }}>
        <div className="flex flex-col md:flex-row min-h-[280px]">
          {/* Image */}
          <div className="md:w-80 h-56 md:h-auto overflow-hidden relative flex-shrink-0">
            <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-6">
              <span className="text-6xl font-black" style={{ color: 'rgba(255,255,255,0.07)', lineHeight: 1 }}>
                {card.num}
              </span>
            </div>
            {/* Gradient overlay */}
            <div className="absolute inset-0 md:hidden" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 60%)' }} />
          </div>

          {/* Content */}
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase px-2.5 py-1"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>
                  {card.num} / {card.total}
                </span>
                <div className="flex gap-1.5">
                  {Array.from({ length: parseInt(card.total) }).map((_, di) => (
                    <div key={di} className="h-0.5 rounded-full transition-all"
                      style={{
                        width: di === index ? '20px' : '6px',
                        background: di === index ? YUZU : 'rgba(255,255,255,0.15)',
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function StickyCardsSection({ cards, section_title, onCta }) {
  const containerRef = useRef(null);

  // The sticky scroll container: height = viewport * (cards.length + 1) so user scrolls through all
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section>
      {/* Section title */}
      <div className="px-6 py-16 text-center bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-black text-4xl md:text-5xl" style={{ color: FG }}>
          {section_title}
        </motion.h2>
      </div>

      {/* Sticky scroll container */}
      <div
        ref={containerRef}
        className="relative bg-white"
        style={{ height: `${cards.length * 100}vh` }}
      >
        {/* Sticky inner */}
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden px-6 md:px-10">
          <div className="relative w-full max-w-5xl mx-auto">
            {cards.map((card, i) => (
              <StickyCard
                key={card.num}
                card={card}
                index={i}
                total={cards.length}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA after cards */}
      <div className="bg-white px-6 py-16 text-center" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={onCta}
          className="text-sm font-black px-8 py-4 transition-all hover:scale-[1.03]"
          style={{ background: FG, color: 'white', borderRadius: '10px' }}>
          Get my strategy →
        </button>
      </div>
    </section>
  );
}