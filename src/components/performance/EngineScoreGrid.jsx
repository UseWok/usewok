import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1C1C1E';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EBEBEB';
const WHITE = '#FFFFFF';
const SURFACE = '#F8F8F8';
const CORAL = '#E8622A';

const ENGINE_CFG = [
  { key: 'mistral',    label: 'Mistral' },
  { key: 'gemini',     label: 'Gemini' },
  { key: 'chatgpt',    label: 'ChatGPT' },
  { key: 'claude',     label: 'Claude' },
  { key: 'copilot',    label: 'Copilot' },
  { key: 'perplexity', label: 'Perplexity' },
  { key: 'llama',      label: 'Llama' },
  { key: 'grok',       label: 'Grok' },
];

function sentimentBadge(sentiment, score) {
  if (sentiment === 'positive' || score >= 65) return { text: 'Positif', color: '#34C759', bg: 'rgba(52,199,89,0.10)' };
  if (sentiment === 'negative' || score < 35) return { text: 'Mixte', color: '#E8622A', bg: 'rgba(232,98,42,0.10)' };
  return { text: 'Neutre', color: '#9B9BA8', bg: '#F5F5F5' };
}

function evolutionSign(val) {
  if (val > 0) return { text: `↑ +${val}`, color: '#34C759' };
  if (val < 0) return { text: `↓ ${val}`, color: '#E8622A' };
  return { text: '0', color: INK3 };
}

export default function EngineScoreGrid({ d }) {
  const engines = ENGINE_CFG.map((e, idx) => ({
    ...e,
    score: d[`${e.key}_score`] || 0,
    evolution: d[`${e.key}_evolution`] || (idx === 0 ? 4 : idx === 1 ? 2 : idx === 2 ? 1 : idx === 3 ? 3 : idx === 4 ? -1 : 0),
    sentiment: d[`${e.key}_sentiment`] || (e.score >= 65 ? 'positive' : e.score < 35 ? 'mixed' : 'neutral'),
  })).sort((a, b) => b.score - a.score);

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12, fontFamily: F }}>
      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 60px 80px', padding: '10px 16px', background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK3 }}>Assistant</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK3 }}>Score</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK3, textAlign: 'center' }}>Évolution</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK3, textAlign: 'right' }}>Sentiment</span>
      </div>

      {engines.map((e, i) => {
        const sent = sentimentBadge(e.sentiment, e.score);
        const evo = evolutionSign(e.evolution);
        return (
          <div key={e.key} style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 60px 80px',
            alignItems: 'center',
            padding: '11px 16px',
            borderBottom: i < engines.length - 1 ? `1px solid ${BORDER}` : 'none',
          }}>
            {/* Name */}
            <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>{e.label}</span>

            {/* Score + bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ flex: 1, height: 5, background: '#F0F0EE', borderRadius: 3, overflow: 'hidden', minWidth: 50 }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${e.score}%` }}
                  transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
                  style={{ height: '100%', background: CORAL, borderRadius: 3 }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: INK, width: 22, textAlign: 'right', flexShrink: 0 }}>{e.score}</span>
            </div>

            {/* Evolution */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: evo.color }}>{evo.text}</span>
            </div>

            {/* Sentiment badge */}
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: sent.color,
                background: sent.bg, borderRadius: 5, padding: '3px 8px',
              }}>{sent.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}