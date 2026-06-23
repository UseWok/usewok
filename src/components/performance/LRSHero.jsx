import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const WHITE = '#FFFFFF';

function MiniBar({ label, val }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>{val}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ height: '100%', background: 'rgba(255,255,255,0.55)', borderRadius: 2 }} />
      </div>
    </div>
  );
}

export default function LRSHero({ d }) {
  const lrs = Math.round(d?.lrs_score || d?.overall_score || 0);
  const citation = Math.round(d?.lrs_citation_score || 0);
  const sentiment = Math.round(d?.lrs_sentiment_score || 0);
  const accuracy = Math.round(d?.lrs_accuracy_score || 0);
  const vsIndustry = d?.lrs_vs_industry || 0;

  const trendLabel = lrs >= 65 ? 'Référence sectorielle' : lrs >= 40 ? 'En progression' : 'À optimiser';

  const R = 44, size = 112;
  const circ = 2 * Math.PI * R;

  return (
    <div style={{ background: INK, borderRadius: 20, padding: '24px', marginBottom: 14, fontFamily: F }}>
      {/* Badge */}
      <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
        LLM Resonance Score™
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        {/* Ring */}
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
            <motion.circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={7}
              strokeDasharray={circ} strokeLinecap="round"
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ * (1 - lrs / 100) }}
              transition={{ duration: 1.6, ease: 'easeOut' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.05em' }}>{lrs}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>/100</span>
          </div>
        </div>

        {/* Bars + trend */}
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{trendLabel}</span>
            {vsIndustry !== 0 && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>
                {vsIndustry > 0 ? `+${vsIndustry}` : vsIndustry}pts vs secteur
              </span>
            )}
          </div>
          <MiniBar label="Fréquence de citation" val={citation} />
          <MiniBar label="Qualité du sentiment" val={sentiment} />
          <MiniBar label="Précision des infos" val={accuracy} />
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '14px 0 0', lineHeight: 1.55 }}>
        Agrège citation · sentiment · précision sur 8 assistants IA. Standard de l'ère IA — comme le DA pour le SEO.
      </p>
    </div>
  );
}