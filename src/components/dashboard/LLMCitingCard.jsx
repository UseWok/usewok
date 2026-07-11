import DashCard from './DashCard';
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const ORANGE = '#FF5A1F';
const GREEN = '#1E7A4C';
const RED = '#E53E3E';
const CREAM2 = '#F5F1E8';
const F = '"Wix Madefor Text", "Wix Madefor Display", system-ui, sans-serif';

const AI_LOGO_URLS = {
  chatgpt: 'https://media.base44.com/images/public/6a2edc91082e534601118582/67cb277ed_image.png',
  gemini: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f37dc5b5a_image.png',
  claude: 'https://media.base44.com/images/public/6a2edc91082e534601118582/d67c08a4b_image.png',
  perplexity: 'https://media.base44.com/images/public/6a2edc91082e534601118582/8e9ccea01_image.png',
  mistral: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3a3745646_image.png',
  grok: 'https://media.base44.com/images/public/6a2edc91082e534601118582/ddf7fe28b_image.png',
  copilot: 'https://media.base44.com/images/public/6a2edc91082e534601118582/92bb51643_image.png',
  llama: 'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/5189c1dc8_image.png',
};

// Brand color per engine — used for the progress bar
const ENGINE_COLORS = {
  chatgpt: '#10A37F',
  gemini: '#4285F4',
  claude: '#D97757',
  perplexity: '#20808D',
  mistral: '#FA520F',
  grok: '#1D1D1F',
  copilot: '#0078D4',
  llama: '#0866FF',
};

function TrendBadge({ current, previous }) {
  if (previous === undefined || previous === null) return (
    <span style={{ width: 44, flexShrink: 0 }} />
  );
  const delta = Math.round(current - previous);
  if (delta === 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: INK3, width: 44 }}>
      <Minus size={11} />
    </span>
  );
  if (delta > 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: GREEN, width: 44 }}>
      <TrendingUp size={12} /> +{delta}
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: RED, width: 44 }}>
      <TrendingDown size={12} /> {delta}
    </span>
  );
}

export default function LLMCitingCard({ llms, previousLlms = [], onDetail, onWantMore }) {
  const rows = (llms || []).slice().sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  const prevMap = {};
  (previousLlms || []).forEach(l => { prevMap[l.engine] = l.pct ?? 0; });

  return (
    <DashCard title="Tes citations IA" dot={GREEN} action="Voir détails →" onAction={onDetail}>
      {rows.length === 0 && (
        <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>Aucune IA ne te mentionne encore.</p>
      )}
      {rows.map((l, i) => {
        const pct = Math.min(100, Math.max(0, l.pct ?? 0));
        const prev = prevMap[l.engine];
        const color = ENGINE_COLORS[l.engine] || ORANGE;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i === rows.length - 1 ? 'none' : '1px solid rgba(21,19,15,0.05)' }}>
            {/* Logo only — no circle, no dot */}
            <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={AI_LOGO_URLS[l.engine]} width={20} height={20} alt={l.label} style={{ objectFit: 'contain' }} />
            </div>
            <span style={{ width: 64, fontSize: 12.5, fontWeight: 600, color: INK, flexShrink: 0 }}>{l.label}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 100, background: CREAM2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ width: 34, fontSize: 14, fontWeight: 800, color: INK, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
            <TrendBadge current={pct} previous={prev} />
          </div>
        );
      })}

      <div style={{ fontSize: 11, color: INK3, lineHeight: 1.5, margin: '14px 0 14px' }}>
        Pourcentage de réponses où chaque IA te cite.
      </div>

      <button onClick={onWantMore}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: INK, color: '#FBF8F2', border: 'none', borderRadius: 12, height: 44, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F, transition: 'opacity 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
        onMouseLeave={e => e.currentTarget.style.opacity = 1}>
        <Plus size={15} /> Être plus cité
      </button>
    </DashCard>
  );
}