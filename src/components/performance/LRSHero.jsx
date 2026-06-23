import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const WHITE = '#FFFFFF';

// Accent palette — slightly warmer than pure black, adds "gaiety"
const VIOLET = '#7C3AED';
const EMERALD = '#059669';
const AMBER = '#D97706';

function getTrend(score) {
  if (score >= 65) return { label: 'Référence sectorielle', color: EMERALD, bg: '#F0FDF4', border: '#BBF7D0' };
  if (score >= 40) return { label: 'En progression', color: AMBER, bg: '#FFFBEB', border: '#FDE68A' };
  return { label: 'À optimiser', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
}

function MiniBar({ label, val, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: INK3, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: INK }}>{val}/100</span>
      </div>
      <div style={{ height: 3, background: '#F0F0EE', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

export default function LRSHero({ d }) {
  const lrs = Math.round(d?.lrs_score || d?.overall_score || 0);
  const citation = Math.round(d?.lrs_citation_score || 0);
  const sentiment = Math.round(d?.lrs_sentiment_score || 0);
  const accuracy = Math.round(d?.lrs_accuracy_score || 0);
  const trend = d?.lrs_trend || 'stable';
  const vsIndustry = d?.lrs_vs_industry || 0;
  const { label: trendLabel, color: trendColor, bg: trendBg, border: trendBorder } = getTrend(lrs);

  const R = 42;
  const size = 108;
  const circ = 2 * Math.PI * R;
  const pct = lrs / 100;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: INK, borderRadius: 22, padding: '24px', marginBottom: 14, overflow: 'hidden', position: 'relative', fontFamily: F }}>

      {/* background glow */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, ${VIOLET}22 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ position: 'relative' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20,
          background: `${VIOLET}22`, border: `1px solid ${VIOLET}44`, marginBottom: 14 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: VIOLET, animation: 'spulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: VIOLET, letterSpacing: '0.12em', textTransform: 'uppercase' }}>LLM Resonance Score™</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          {/* Big ring */}
          <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
              <motion.circle cx={size/2} cy={size/2} r={R} fill="none" stroke={VIOLET} strokeWidth={8}
                strokeDasharray={circ} strokeLinecap="round"
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ * (1 - pct) }}
                transition={{ duration: 1.6, ease: 'easeOut' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.05em' }}>{lrs}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>/100</span>
            </div>
          </div>

          {/* Text + bars */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20,
              background: trendBg, border: `1px solid ${trendBorder}`, marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: trendColor }}>{trendLabel}</span>
              {vsIndustry !== 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: trendColor }}>
                  {vsIndustry > 0 ? `+${vsIndustry}` : vsIndustry} vs secteur
                </span>
              )}
            </div>

            <MiniBar label="Fréquence de citation" val={citation} color={VIOLET} />
            <MiniBar label="Qualité du sentiment" val={sentiment} color={EMERALD} />
            <MiniBar label="Précision des infos" val={accuracy} color='#3B82F6' />
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '14px 0 0', lineHeight: 1.6, maxWidth: 460 }}>
          Le LRS agrège la fréquence de citation, la qualité du sentiment et la précision des informations
          communiquées par les 8 assistants IA majeurs sur votre marque. C'est le standard de l'ère IA.
        </p>
      </div>
      <style>{`@keyframes spulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.55)}}`}</style>
    </motion.div>
  );
}