import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const WHITE = '#FFFFFF';
const DARK = '#1C1C1E';
const CORAL = '#E8622A';

// Badge niveau
function Badge({ label, color }) {
  const bg = color === 'red' ? '#E8622A' : color === 'green' ? '#34C759' : '#34C759';
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color: WHITE,
      background: bg, borderRadius: 5,
      padding: '3px 9px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export default function LRSHero({ d }) {
  const lrs = Math.round(d?.lrs_score || d?.score_overall || d?.overall_score || 0);
  const citation = Math.round(d?.lrs_citation_score || d?.score_ai_visibility || 0);
  const sentiment = Math.round(d?.lrs_sentiment_score || d?.score_message_clarity || 0);
  const accuracy = Math.round(d?.lrs_accuracy_score || d?.score_commercial_signal || 0);
  const vsIndustry = d?.lrs_vs_industry || 0;
  const domain = (d?.site_url || '').replace(/https?:\/\//, '').split('/')[0];

  const R = 36, size = 86;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - lrs / 100);

  const citLabel = citation >= 65 ? 'Élevée' : citation >= 35 ? 'Bonne' : 'Faible';
  const sentLabel = sentiment >= 65 ? 'Bonne' : sentiment >= 35 ? 'Bonne' : 'Faible';
  const accLabel = accuracy >= 65 ? 'Bonne' : accuracy >= 35 ? 'Bonne' : 'Faible';

  return (
    <div style={{
      background: DARK, borderRadius: 14, padding: '18px 18px 16px',
      marginBottom: 12, fontFamily: F,
    }}>
      {/* Domain line */}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 14 }}>
        {domain} · Mis à jour aujourd'hui
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={6} />
            <motion.circle
              cx={size/2} cy={size/2} r={R} fill="none"
              stroke={CORAL} strokeWidth={6}
              strokeDasharray={circ} strokeLinecap="round"
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.04em' }}>{lrs}</span>
          </div>
          {/* +pts vs secteur */}
          {vsIndustry !== 0 && (
            <div style={{ marginTop: 6, textAlign: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#34C759' }}>
                {vsIndustry > 0 ? '+' : ''}{vsIndustry}pts
              </span>
            </div>
          )}
        </div>

        {/* Mentions sectorielles */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>
            Mentions sectorielles
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Fréquence de citation</span>
              <Badge label={citLabel} color={citation >= 35 ? 'green' : 'red'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Qualité du sentiment</span>
              <Badge label={sentLabel} color={sentiment >= 35 ? 'green' : 'red'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Précision des faits</span>
              <Badge label={accLabel} color={accuracy >= 35 ? 'green' : 'red'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}