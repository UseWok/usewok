import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

function XMark() {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #ef4444',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
        <path d="M1 1L6 6M6 1L1 6" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function DotMark() {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #16a34a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
    </div>
  );
}

const ROWS = [
  { them: 'Tells you to cut your pleasures',      us: 'Your pleasures are permanently protected' },
  { them: 'Generic advice for everyone',           us: 'Built around your exact situation' },
  { them: 'Ignores your psychology',               us: 'Reads your emotional money patterns' },
  { them: 'Misses hidden money leaks',             us: 'Recovers avg. 187/mo in forgotten costs' },
  { them: 'No long-term financial vision',         us: 'Builds your wealth trajectory, now' },
  { them: 'Judges your spending habits',           us: 'Zero judgment. Always on your side' },
  { them: 'Resets every conversation',             us: 'Remembers your full financial story' },
];

export default function StackingCards() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ background: '#f7f7f5', padding: '100px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.18)', marginBottom: 32, fontFamily: 'var(--font-open)',
        }}>
          The honest comparison
        </p>
        <h2 style={{
          fontFamily: 'var(--font-inter)', fontWeight: 900, letterSpacing: '-0.04em',
          lineHeight: 1.0, fontSize: 'clamp(2rem,5vw,3.5rem)', color: FG, margin: 0,
        }}>
          Most tools fix numbers.<br />
          <span style={{ color: YELLOW }}>We build your future.</span>
        </h2>
      </div>

      <div ref={ref} style={{ maxWidth: 780, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* LEFT — Others */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={visible ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'white', borderRadius: 16,
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, fontFamily: 'var(--font-open)' }}>
              Other tools
            </p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#ccc', margin: '4px 0 0', fontFamily: 'var(--font-inter)' }}>
              Budget apps + generic AI
            </p>
          </div>
          <div style={{ padding: '8px 0' }}>
            {ROWS.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 22px',
                borderBottom: i < ROWS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
              }}>
                <XMark />
                <span style={{ fontSize: 13, fontFamily: 'var(--font-open)', color: '#bbb', fontWeight: 400, lineHeight: 1.4 }}>
                  {r.them}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — Stensor */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={visible ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'white', borderRadius: 16,
            border: `1.5px solid ${YELLOW}`,
            boxShadow: '0 8px 40px rgba(221,255,0,0.18)',
            overflow: 'hidden', position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to bottom, rgba(221,255,0,0.08), transparent)',
            pointerEvents: 'none',
          }} />
          <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, fontFamily: 'var(--font-open)' }}>
                  Stensor
                </p>
                <p style={{ fontSize: 15, fontWeight: 800, color: FG, margin: '4px 0 0', fontFamily: 'var(--font-inter)' }}>
                  Your financial co-pilot
                </p>
              </div>
              <div style={{ padding: '3px 9px', background: YELLOW, borderRadius: 99, fontSize: 10, fontWeight: 800, color: FG }}>
                Winner
              </div>
            </div>
          </div>
          <div style={{ padding: '8px 0', position: 'relative' }}>
            {ROWS.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 22px',
                borderBottom: i < ROWS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
              }}>
                <DotMark />
                <span style={{ fontSize: 13, fontFamily: 'var(--font-open)', color: FG, fontWeight: 600, lineHeight: 1.4 }}>
                  {r.us}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}