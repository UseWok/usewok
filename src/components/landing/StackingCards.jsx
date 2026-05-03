import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

// ── Icons ──────────────────────────────────────────────────────────────────────
function BadMark() {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #ef4444',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function GoodMark() {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #16a34a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
const CRITERIA = [
  { label: 'Adapts to your real lifestyle', budget: false, genericAI: false, stensor: true, stensorNote: 'Learns your actual habits across every conversation' },
  { label: 'Never tells you to cut your pleasures', budget: false, genericAI: false, stensor: true, stensorNote: 'Sacred items are permanently protected — our core promise' },
  { label: 'Finds hidden money leaks', budget: false, genericAI: false, stensor: true, stensorNote: 'Avg. €187/month recovered from dormant subscriptions & plans' },
  { label: 'Gives personalised investment steps', budget: false, genericAI: false, stensor: true, stensorNote: 'Exact ETFs, amounts & timing — not generic advice' },
  { label: 'Understands your psychology', budget: false, genericAI: false, stensor: true, stensorNote: 'Emotional triggers, fear patterns, spending personality' },
  { label: 'Tracks your progress over time', budget: true, genericAI: false, stensor: true, stensorNote: 'Real-time score, milestones & dynamic re-planning' },
  { label: 'Available 24/7 in seconds', budget: false, genericAI: true, stensor: true, stensorNote: 'Instant answers, no appointment, no judgment' },
];

const CARDS = [
  {
    id: 'budget',
    name: 'Budget Apps',
    subtitle: 'Spreadsheets & trackers',
    field: 'budget',
    accent: '#ef4444',
    bg: '#ffffff',
    tagBg: 'rgba(239,68,68,0.07)',
    tagColor: '#ef4444',
    tagLabel: 'Outdated',
    zBase: 0,
    rotate: -3,
    translateY: 0,
  },
  {
    id: 'generic',
    name: 'Generic AI',
    subtitle: 'ChatGPT, Claude, etc.',
    field: 'genericAI',
    accent: '#f97316',
    bg: '#ffffff',
    tagBg: 'rgba(249,115,22,0.07)',
    tagColor: '#f97316',
    tagLabel: 'Too generic',
    zBase: 1,
    rotate: 1.5,
    translateY: 0,
  },
  {
    id: 'stensor',
    name: 'Stensor',
    subtitle: 'Your financial co-pilot',
    field: 'stensor',
    accent: YELLOW,
    bg: FG,
    tagBg: YELLOW,
    tagColor: FG,
    tagLabel: '★ Best choice',
    zBase: 2,
    rotate: 0,
    translateY: 0,
  },
];

// ── Single Card ────────────────────────────────────────────────────────────────
function CompCard({ card, progress, index, total }) {
  const isDark = card.id === 'stensor';

  // Each card enters as scroll progresses
  const cardTrigger = index / total;
  const cardEnd = (index + 1) / total;
  const localProgress = Math.max(0, Math.min(1, (progress - cardTrigger) / (cardEnd - cardTrigger)));

  const y = (1 - localProgress) * 80;
  const opacity = localProgress;
  const scale = 0.92 + localProgress * 0.08;

  const badColor = isDark ? 'rgba(255,255,255,0.22)' : '#888';
  const badTextColor = isDark ? 'rgba(255,255,255,0.3)' : '#bbb';
  const goodTextColor = isDark ? 'rgba(255,255,255,0.85)' : FG;
  const noteColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
  const sepColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: index + 1,
        y,
        opacity,
        scale,
        transformOrigin: 'center bottom',
      }}
    >
      <div style={{
        background: card.bg,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(221,255,0,0.18)'
          : '0 12px 40px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.06)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 24px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 900, color: isDark ? 'white' : FG, lineHeight: 1.1, margin: 0 }}>
                {card.name}
              </p>
              <p style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.35)' : '#aaa', marginTop: 3, fontFamily: 'var(--font-open)' }}>
                {card.subtitle}
              </p>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 800,
              background: card.tagBg, color: card.tagColor,
              letterSpacing: '0.05em', flexShrink: 0, marginTop: 2,
            }}>
              {card.tagLabel}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: sepColor, margin: '0 24px', flexShrink: 0 }} />

        {/* Criteria list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 20px' }}>
          {CRITERIA.map((c, i) => {
            const isGood = c[card.field];
            return (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0' }}>
                  {isGood
                    ? <GoodMarkDark dark={isDark} />
                    : <BadMarkDark dark={isDark} />
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 12.5, fontWeight: isGood ? 700 : 500, margin: 0,
                      color: isGood ? goodTextColor : badTextColor,
                      textDecoration: !isGood ? 'line-through' : 'none',
                      fontFamily: isGood ? 'var(--font-inter)' : 'var(--font-open)',
                    }}>
                      {c.label}
                    </p>
                    {isGood && c.stensorNote && isDark && (
                      <p style={{ fontSize: 10.5, color: noteColor, margin: '2px 0 0', fontFamily: 'var(--font-open)', lineHeight: 1.45 }}>
                        {c.stensorNote}
                      </p>
                    )}
                  </div>
                </div>
                {i < CRITERIA.length - 1 && (
                  <div style={{ height: 1, background: sepColor }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Score badge */}
        <div style={{
          padding: '12px 24px', flexShrink: 0,
          borderTop: `1px solid ${sepColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.3)' : '#ccc', margin: 0, fontFamily: 'var(--font-open)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Score
          </p>
          <div style={{ display: 'flex', gap: 4 }}>
            {CRITERIA.map((c, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: c[card.field]
                  ? (isDark ? YELLOW : '#16a34a')
                  : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'),
              }} />
            ))}
          </div>
          <p style={{
            fontSize: 14, fontWeight: 900, margin: 0,
            color: isDark ? YELLOW : '#bbb',
          }}>
            {CRITERIA.filter(c => c[card.field]).length}/{CRITERIA.length}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function BadMarkDark({ dark }) {
  const color = dark ? 'rgba(255,255,255,0.2)' : '#ddd';
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
    }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function GoodMarkDark({ dark }) {
  const color = dark ? YELLOW : '#16a34a';
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function StackingCards() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const scrolled = -top;
      const total = height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section style={{ background: '#f7f7f5' }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', padding: '100px 24px 64px' }}>
        <p style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.18)', marginBottom: 44, fontFamily: 'var(--font-open)',
        }}>
          The honest comparison
        </p>
        <h2 style={{
          fontFamily: 'var(--font-inter)', fontWeight: 900, letterSpacing: '-0.04em',
          lineHeight: 1.0, fontSize: 'clamp(2rem,5vw,3.8rem)', color: FG, margin: '0 0 16px',
        }}>
          Most tools fix numbers.<br />
          <span style={{ color: YELLOW }}>We fix your life.</span>
        </h2>
        <p style={{
          fontSize: 14, color: 'rgba(0,0,0,0.38)', maxWidth: 440, margin: '0 auto',
          lineHeight: 1.7, fontFamily: 'var(--font-open)',
        }}>
          Scroll to see why Stensor is in a different category entirely.
        </p>
      </div>

      {/* Scroll-driven stacking */}
      <div ref={containerRef} style={{ height: `${CARDS.length * 80 + 100}vh`, position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 24px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 420, height: 'min(580px, 82vh)' }}>
            {CARDS.map((card, i) => (
              <CompCard
                key={card.id}
                card={card}
                progress={progress}
                index={i}
                total={CARDS.length}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom stat bar */}
      <div style={{ padding: '48px 24px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'flex', gap: 0,
          background: 'white', borderRadius: 14,
          border: '1px solid rgba(0,0,0,0.07)',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: 680, width: '100%',
        }}>
          {[
            { n: '7/7', label: 'criteria met', sub: 'Only Stensor scores a perfect 7', accent: YELLOW },
            { n: '0', label: 'sacrifices required', sub: 'Your lifestyle stays intact', accent: '#16a34a' },
            { n: '42×', label: 'avg. ROI', sub: 'Vs. cost of subscription', accent: '#3b82f6' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '24px 20px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none',
            }}>
              <p style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 900, color: s.accent, margin: 0, lineHeight: 1 }}>{s.n}</p>
              <p style={{ fontSize: 11, fontWeight: 800, color: FG, margin: '4px 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ fontSize: 10, color: '#aaa', margin: 0, fontFamily: 'var(--font-open)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '0 5%' }} />
    </section>
  );
}