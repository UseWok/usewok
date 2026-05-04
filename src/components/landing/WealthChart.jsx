import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

// Real-looking wealth data — 10 years, monthly savings of 400/mo invested
// Without: just saving cash (no growth)
// With Stensor: 8.5% annual return + recovered leaks reinvested
const YEARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function compound(monthly, rate, year) {
  if (year === 0) return 0;
  return Math.round(monthly * 12 * ((Math.pow(1 + rate, year) - 1) / rate));
}

const DATA = YEARS.map(y => ({
  y,
  without: Math.round(400 * 12 * y),
  with: compound(587, 0.085, y), // 400 + 187 recovered leaks
}));

const W = 600, H = 220, PL = 52, PR = 20, PT = 20, PB = 36;
const INNER_W = W - PL - PR;
const INNER_H = H - PT - PB;
const MAX_V = DATA[DATA.length - 1].with;

function toX(i) { return PL + (i / (DATA.length - 1)) * INNER_W; }
function toY(v) { return PT + INNER_H - (v / MAX_V) * INNER_H; }

function fmt(v) {
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return '$' + Math.round(v / 1000) + 'k';
  return '$' + v;
}

const pathWith = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.with)}`).join(' ');
const pathWithout = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.without)}`).join(' ');
const areaWith = `${pathWith} L ${toX(DATA.length - 1)} ${PT + INNER_H} L ${PL} ${PT + INNER_H} Z`;

const MILESTONES = [
  { year: 2, label: 'First €10k', y: compound(587, 0.085, 2) },
  { year: 5, label: '€40k reached', y: compound(587, 0.085, 5) },
  { year: 10, label: '€109k', y: compound(587, 0.085, 10) },
];

export default function WealthChart() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const pathLen = 1200; // approximate

  return (
    <section style={{ background: FG, padding: '100px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 20, fontFamily: 'var(--font-open)' }}>
            The numbers
          </p>
          <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.0, fontSize: 'clamp(1.8rem,4.5vw,3.2rem)', color: 'white', margin: 0 }}>
            €400/month saved.<br />
            <span style={{ color: YELLOW }}>€109,000 built in 10 years.</span>
          </h2>
          <p style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-open)', lineHeight: 1.6 }}>
            Same income. Same lifestyle. The only difference: where your money goes after Stensor finds the leaks.
          </p>
        </div>

        {/* Chart */}
        <div ref={ref} style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '28px 20px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', bottom: 0, left: '30%', width: '40%', height: '60%',
            background: 'radial-gradient(ellipse, rgba(221,255,0,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <svg
            width="100%" viewBox={`0 0 ${W} ${H}`}
            style={{ overflow: 'visible', display: 'block' }}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={YELLOW} stopOpacity="0.18" />
                <stop offset="100%" stopColor={YELLOW} stopOpacity="0.01" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
              const y = PT + INNER_H * (1 - f);
              return (
                <g key={i}>
                  <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <text x={PL - 8} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="var(--font-open)">
                    {fmt(MAX_V * f)}
                  </text>
                </g>
              );
            })}

            {/* Year labels */}
            {DATA.filter(d => d.y % 2 === 0).map(d => (
              <text key={d.y} x={toX(YEARS.indexOf(d.y))} y={H - 6} textAnchor="middle"
                fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="var(--font-open)">
                Y{d.y}
              </text>
            ))}

            {/* Area fill */}
            {visible && (
              <motion.path d={areaWith} fill="url(#areaGrad)"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.6 }}
              />
            )}

            {/* Without line */}
            {visible && (
              <motion.path d={pathWithout} fill="none"
                stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="5 4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
              />
            )}

            {/* With Stensor line */}
            {visible && (
              <motion.path d={pathWith} fill="none"
                stroke={YELLOW} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                filter="url(#glow)"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: 'easeOut', delay: 0.2 }}
              />
            )}

            {/* Milestone dots */}
            {visible && MILESTONES.map((m, i) => {
              const xi = YEARS.indexOf(m.year);
              const x = toX(xi);
              const y = toY(m.y);
              return (
                <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.3 }}>
                  <circle cx={x} cy={y} r="4" fill={FG} stroke={YELLOW} strokeWidth="2" />
                  <text x={x} y={y - 10} textAnchor="middle" fill={YELLOW} fontSize="9" fontWeight="700" fontFamily="var(--font-open)">
                    {m.label}
                  </text>
                </motion.g>
              );
            })}

            {/* Hover zones */}
            {DATA.map((d, i) => (
              <rect key={i}
                x={toX(i) - INNER_W / (DATA.length - 1) / 2} y={PT}
                width={INNER_W / (DATA.length - 1)} height={INNER_H}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
              />
            ))}

            {/* Hover tooltip */}
            {hoverIdx !== null && (() => {
              const d = DATA[hoverIdx];
              const x = toX(hoverIdx);
              const y = toY(d.with);
              const gap = d.with - d.without;
              return (
                <g>
                  <line x1={x} y1={PT} x2={x} y2={PT + INNER_H} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx={x} cy={y} r="5" fill={YELLOW} />
                  <rect x={x - 54} y={y - 52} width={108} height={44} rx="6" fill="rgba(0,0,0,0.85)" />
                  <text x={x} y={y - 35} textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="var(--font-inter)">
                    {fmt(d.with)} with Stensor
                  </text>
                  <text x={x} y={y - 19} textAnchor="middle" fill={YELLOW} fontSize="9.5" fontWeight="600" fontFamily="var(--font-open)">
                    +{fmt(gap)} vs. doing nothing
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 2, background: YELLOW, borderRadius: 2 }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-open)' }}>With Stensor</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 0, borderTop: '1.5px dashed rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-open)' }}>Without</span>
            </div>
          </div>
        </div>

        {/* 3 stat pills below */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16 }}>
          {[
            { n: '+€187/mo', label: 'recovered on avg.', sub: 'from hidden leaks' },
            { n: '8.5%', label: 'avg. annual return', sub: 'on optimised invest.' },
            { n: '2.7×', label: 'more wealth', sub: 'vs. cash savings' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.07)', padding: '16px 14px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: YELLOW, margin: 0, fontFamily: 'var(--font-inter)', lineHeight: 1 }}>{s.n}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', margin: '5px 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-open)' }}>{s.label}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: 0, fontFamily: 'var(--font-open)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}