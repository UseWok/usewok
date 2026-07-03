import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { F, INK, INK2, INK3, BORDER, CORAL, GREEN, GREEN_SOFT, ORANGE_DEEP, ORANGE_SOFT, CREAM_DEEP, CARD_DARK, WHITE } from '@/lib/report-constants';

export default function GrowthTimeline({ currentScore, previousScore, lastScanDate, prevScanDate }) {
  const hasPrev = previousScore > 0;
  const delta = hasPrev ? currentScore - previousScore : 0;
  const isUp = delta > 0;
  const isDown = delta < 0;
  const isFlat = delta === 0;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

  const label = !hasPrev
    ? 'First scan — your baseline is set'
    : isUp ? `You gained ${delta} points`
    : isDown ? `You lost ${Math.abs(delta)} points`
    : 'No change since last scan';

  const labelColor = !hasPrev ? INK2 : isUp ? GREEN : isDown ? ORANGE_DEEP : INK2;

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: INK2, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
        Your growth
      </div>
      <div style={{ background: CARD_DARK, borderRadius: 12, padding: 22, position: 'relative', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>What AI says about you</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: WHITE }}>{label}</div>
          </div>
          {hasPrev && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 11px', borderRadius: 999,
              background: isUp ? 'rgba(63,166,107,0.18)' : isDown ? 'rgba(255,90,31,0.18)' : 'rgba(255,255,255,0.08)',
            }}>
              {isUp && <ArrowUpRight size={14} color={GREEN} />}
              {isDown && <ArrowDownRight size={14} color={CORAL} />}
              {isFlat && <Minus size={14} color="rgba(255,255,255,0.5)" />}
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: isUp ? GREEN : isDown ? CORAL : 'rgba(255,255,255,0.6)',
              }}>
                {isUp ? '+' : ''}{delta} pts
              </span>
            </div>
          )}
        </div>

        {/* Timeline visual */}
        {hasPrev ? (
          <div style={{ position: 'relative', padding: '8px 0 4px' }}>
            <svg width="100%" height="90" viewBox="0 0 300 90" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="gt-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CORAL} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={CORAL} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <motion.polygon
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
                points={`30,${72 - (previousScore / 100) * 55} 270,${72 - (currentScore / 100) * 55} 270,80 30,80`}
                fill="url(#gt-grad)"
              />
              {/* Line */}
              <motion.line
                x1="30" y1={72 - (previousScore / 100) * 55}
                x2="270" y2={72 - (currentScore / 100) * 55}
                stroke={CORAL} strokeWidth="2.5" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: 'easeOut' }}
              />
              {/* Previous point */}
              <circle cx="30" cy={72 - (previousScore / 100) * 55} r="5" fill={CARD_DARK} stroke={CORAL} strokeWidth="2.5" />
              {/* Current point */}
              <motion.circle
                cx="270" cy={72 - (currentScore / 100) * 55} r="6" fill={CORAL}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
              />
            </svg>
            {/* Labels under points */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Last month</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{previousScore}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{fmtDate(prevScanDate)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: CORAL, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Today</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: WHITE }}>{currentScore}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{fmtDate(lastScanDate)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: WHITE }}>{currentScore}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                This is your starting point. Run another scan next week to see how your visibility evolves.
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{fmtDate(lastScanDate)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}