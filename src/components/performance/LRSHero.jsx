import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const CORAL = '#E8622A';
// Badge "High" / "Good" / "Low" — dark brown background as in the image
function MetricBadge({ score }) {
  const label = score >= 65 ? 'High' : score >= 35 ? 'Good' : 'Low';
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 12, fontWeight: 700, color: '#F4866A',
      background: '#3A1A0E',
      borderRadius: 7, padding: '5px 13px',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export default function LRSHero({ d }) {
  const lrs = Math.round(d?.lrs_score || d?.score_overall || d?.overall_score || 0);
  const citation = Math.round(d?.lrs_citation_score || d?.score_ai_visibility || 72);
  const sentiment = Math.round(d?.lrs_sentiment_score || d?.score_message_clarity || 68);
  const accuracy = Math.round(d?.lrs_accuracy_score || d?.score_commercial_signal || 65);
  const vsIndustry = d?.lrs_vs_industry || 11;
  const domain = (d?.site_url || '').replace(/https?:\/\//, '').split('/')[0];

  // Ring params
  const size = 88, sw = 7, R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;

  return (
    <div style={{ fontFamily: F }}>
      {/* Page title outside the card */}
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: DARK, margin: 0, letterSpacing: '-0.02em' }}>
          AI Reputation Report
          </h1>
          <p style={{ fontSize: 12, color: '#9B9BA8', margin: '3px 0 0' }}>
          {domain} · Updated today
        </p>
      </div>

      {/* Dark card */}
      <div style={{
        background: DARK, borderRadius: 16, padding: '20px 22px',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>

          {/* Left: donut + pts */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            {/* Donut */}
            <div style={{ position: 'relative', width: size, height: size }}>
              <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={sw} />
                <motion.circle
                  cx={size/2} cy={size/2} r={R} fill="none"
                  stroke={CORAL} strokeWidth={sw}
                  strokeDasharray={circ} strokeLinecap="round"
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ * (1 - lrs / 100) }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.04em' }}>{lrs}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', fontWeight: 500, marginTop: 1 }}>/100</span>
              </div>
            </div>
            {/* +pts */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width={10} height={10} viewBox="0 0 10 10">
                <path d="M2 8 L5 2 L8 8" stroke={CORAL} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: CORAL }}>+{vsIndustry} pts</span>
            </div>
          </div>

          {/* Right: mentions sectorielles */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', margin: '0 0 14px', letterSpacing: '0.01em' }}>
              Industry mentions
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { label: 'Citation frequency', score: citation },
                { label: 'Sentiment quality', score: sentiment },
                { label: 'Factual accuracy', score: accuracy },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.82)' }}>{row.label}</span>
                  <MetricBadge score={row.score} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}