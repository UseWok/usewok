import DashCard from './DashCard';
import { Plus } from 'lucide-react';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const ORANGE = '#FF5A1F';
const GREEN = '#1E7A4C';
const CREAM2 = '#F3EEE3';
const F = 'Inter, system-ui, sans-serif';

const AI_LOGO_URLS = {
  chatgpt: 'https://media.base44.com/images/public/6a2edc91082e534601118582/67cb277ed_image.png',
  gemini: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f37dc5b5a_image.png',
  claude: 'https://media.base44.com/images/public/6a2edc91082e534601118582/d67c08a4b_image.png',
  perplexity: 'https://media.base44.com/images/public/6a2edc91082e534601118582/8e9ccea01_image.png',
  mistral: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3a3745646_image.png',
  grok: 'https://media.base44.com/images/public/6a2edc91082e534601118582/ddf7fe28b_image.png',
  copilot: 'https://media.base44.com/images/public/6a2edc91082e534601118582/92bb51643_image.png',
  llama: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1bdc7666b_image.png',
};

export default function LLMCitingCard({ llms, onDetail, onWantMore }) {
  const rows = (llms || []).slice().sort((a, b) => (b.citations || 0) - (a.citations || 0));
  const max = Math.max(1, ...rows.map(r => r.citations || 0));

  return (
    <DashCard title="LLM qui vous citent" dot={GREEN} action="Détail →" onAction={onDetail}>
      {rows.length === 0 && (
        <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>Aucune citation IA détectée pour vos moteurs activés.</p>
      )}
      {rows.map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: CREAM2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={AI_LOGO_URLS[l.engine]} width={14} height={14} alt={l.label} style={{ objectFit: 'contain' }} />
          </div>
          <span style={{ width: 76, fontSize: 12.5, fontWeight: 600, color: INK, flexShrink: 0 }}>{l.label}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 100, background: CREAM2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((l.citations || 0) / max) * 100}%`, background: ORANGE, borderRadius: 100 }} />
          </div>
          <span style={{ width: 56, fontSize: 11.5, color: INK3, textAlign: 'right', flexShrink: 0 }}>{l.citations || 0} citation{(l.citations || 0) > 1 ? 's' : ''}</span>
        </div>
      ))}

      <div style={{ fontSize: 11, color: INK3, lineHeight: 1.5, margin: '12px 0 14px' }}>
        Nombre de réponses IA où votre marque est citée, cumulées sur la période.
      </div>

      <button onClick={onWantMore}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: INK, color: '#FBF8F2', border: 'none', borderRadius: 10, height: 42, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
        <Plus size={14} /> Être cité davantage
      </button>
    </DashCard>
  );
}