import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E4DC';
const WHITE = '#FFFFFF';
const SURFACE = '#F5F0E8'; // beige crème pour la piste de barre
const CORAL = '#E8622A';
const GREEN = '#3CC660';

// Engines in order matching the image (sorted by score desc)
const ENGINE_ORDER = ['mistral', 'gemini', 'chatgpt', 'claude', 'copilot', 'perplexity', 'llama', 'grok'];
const ENGINE_LABELS = {
  mistral: 'Mistral', gemini: 'Gemini', chatgpt: 'ChatGPT',
  claude: 'Claude', copilot: 'Copilot', perplexity: 'Perplexity',
  llama: 'Llama', grok: 'Grok',
};
// Demo evolutions matching the image
const DEMO_EVO = { mistral: 4, gemini: 2, chatgpt: 1, claude: 3, copilot: -1, perplexity: 0, llama: -2, grok: -3 };

function SentimentBadge({ sentiment, score }) {
  let text, color, bg;
  if (sentiment === 'positive' || (!sentiment && score >= 65)) {
    text = 'Positif'; color = GREEN; bg = 'rgba(60,198,96,0.12)';
  } else if (sentiment === 'mixed' || (!sentiment && score < 40)) {
    text = 'Mixte'; color = CORAL; bg = 'rgba(232,98,42,0.12)';
  } else {
    text = 'Neutre'; color = INK3; bg = '#F0EDE8';
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 6, padding: '3px 9px' }}>
      {text}
    </span>
  );
}

function EvoLabel({ val }) {
  if (val > 0) return <span style={{ fontSize: 11, fontWeight: 600, color: GREEN }}>↗ +{val}</span>;
  if (val < 0) return <span style={{ fontSize: 11, fontWeight: 600, color: CORAL }}>↘ {val}</span>;
  return <span style={{ fontSize: 11, fontWeight: 600, color: INK3 }}>— 0</span>;
}

export default function EngineScoreGrid({ d }) {
  const engines = ENGINE_ORDER.map(key => ({
    key, label: ENGINE_LABELS[key],
    score: d[`${key}_score`] || 0,
    evolution: d[`${key}_evolution`] ?? DEMO_EVO[key] ?? 0,
    sentiment: d[`${key}_sentiment`] || null,
  })).sort((a, b) => b.score - a.score);

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12, fontFamily: F }}>
      {/* Section label */}
      <div style={{ padding: '12px 18px 0' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
          Scores par assistant IA
        </p>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 48px 68px 76px', alignItems: 'center', padding: '10px 18px 8px', gap: 8 }}>
        <span style={{ fontSize: 11, color: INK3, fontWeight: 500 }}>Assistant</span>
        <span style={{ fontSize: 11, color: INK3, fontWeight: 500 }}>Score</span>
        <span style={{ fontSize: 11, color: INK3, fontWeight: 500, textAlign: 'right' }}></span>
        <span style={{ fontSize: 11, color: INK3, fontWeight: 500, textAlign: 'center' }}>Évolution</span>
        <span style={{ fontSize: 11, color: INK3, fontWeight: 500, textAlign: 'right' }}>Sentiment</span>
      </div>

      {engines.map((e, i) => (
        <div key={e.key} style={{
          display: 'grid', gridTemplateColumns: '120px 1fr 48px 68px 76px',
          alignItems: 'center', gap: 8,
          padding: '12px 18px',
          borderTop: `1px solid ${BORDER}`,
        }}>
          {/* Name */}
          <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{e.label}</span>

          {/* Progress bar */}
          <div style={{ height: 7, background: SURFACE, borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${e.score}%` }}
              transition={{ duration: 0.9, delay: i * 0.05, ease: 'easeOut' }}
              style={{ height: '100%', background: CORAL, borderRadius: 4 }}
            />
          </div>

          {/* Score number */}
          <span style={{ fontSize: 13.5, fontWeight: 800, color: INK, textAlign: 'right' }}>{e.score}</span>

          {/* Evolution */}
          <div style={{ textAlign: 'center' }}>
            <EvoLabel val={e.evolution} />
          </div>

          {/* Sentiment */}
          <div style={{ textAlign: 'right' }}>
            <SentimentBadge sentiment={e.sentiment} score={e.score} />
          </div>
        </div>
      ))}
    </div>
  );
}