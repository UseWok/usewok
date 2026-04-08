import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const CARD_COLORS = [
  { bg: '#0F0F1A', border: 'rgba(255,255,255,0.07)' },
  { bg: '#111116', border: 'rgba(221,255,0,0.08)' },
  { bg: '#0D0D18', border: 'rgba(255,255,255,0.07)' },
  { bg: '#0F0F1A', border: 'rgba(221,255,0,0.1)' },
];

function StickyCard({ card, index, total, onCta }) {
  const colors = CARD_COLORS[index];
  const topOffset = 80 + index * 20;

  return (
    <div
      className="sticky"
      style={{ top: topOffset }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto relative overflow-hidden"
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
          borderRadius: '2px',
        }}
      >
        {/* Accent gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: index % 2 === 0
              ? 'radial-gradient(ellipse at 10% 90%, rgba(221,255,0,0.04) 0%, transparent 55%)'
              : 'radial-gradient(ellipse at 90% 10%, rgba(221,255,0,0.05) 0%, transparent 55%)',
          }}
        />

        <div className="relative p-10 md:p-16">
          <div className="flex items-start justify-between mb-10">
            <div
              className="px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase"
              style={{ color: YUZU, background: 'rgba(221,255,0,0.08)', border: '1px solid rgba(221,255,0,0.12)' }}
            >
              {card.num} / {card.total}
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 transition-all duration-300"
                  style={{
                    background: i === index ? YUZU : 'rgba(255,255,255,0.1)',
                    borderRadius: '1px',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="md:grid md:grid-cols-2 md:gap-16 md:items-end">
            <div>
              <h3
                className="font-black leading-tight mb-6"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', color: 'white' }}
              >
                {card.title}
              </h3>
            </div>
            <div>
              <p
                className="text-base leading-relaxed mb-8"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {card.desc}
              </p>
              <button
                onClick={onCta}
                className="inline-flex items-center gap-3 px-6 py-3 font-black text-sm transition-all hover:gap-4"
                style={{ background: YUZU, color: FG }}
              >
                Obtenir ma stratégie <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function StackingCards({ cards, onCta }) {
  return (
    <section className="relative px-6 md:px-10" style={{ paddingBottom: '120px' }}>
      <div className="max-w-4xl mx-auto">
        {/* Title above stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(221,255,0,0.5)' }}>
            Pourquoi Stensor
          </p>
          <h2
            className="font-black leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white' }}
          >
            Tout ce qui vous manquait<br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>dans votre coach financier.</span>
          </h2>
        </motion.div>

        {/* Stacking cards */}
        <div className="space-y-6">
          {cards.map((card, i) => (
            <StickyCard
              key={card.num}
              card={card}
              index={i}
              total={cards.length}
              onCta={onCta}
            />
          ))}
        </div>
      </div>
    </section>
  );
}