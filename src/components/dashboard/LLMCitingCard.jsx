import DashCard from './DashCard';
import { Plus } from 'lucide-react';

const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const GREEN = '#22A87A';
const VIOLET = '#7C3AED';
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
    <DashCard title="LLMs that cite you" dot={GREEN} action="Detail →" onAction={onDetail}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.length === 0 && (
          <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>No AI citations detected yet for your enabled engines.</p>
        )}
        {rows.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={AI_LOGO_URLS[l.engine]} width={18} height={18} alt={l.label} style={{ objectFit: 'contain', flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: INK, width: 70, flexShrink: 0 }}>{l.label}</span>
            <div style={{ flex: 1, height: 6, background: '#F0EEE9', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((l.citations || 0) / max) * 100}%`, background: GREEN, borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: INK, flexShrink: 0 }}>{l.citations || 0}</span>
            <span style={{ fontSize: 10, color: INK3, flexShrink: 0, width: 42 }}>citations</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: INK3, margin: '14px 0 12px', lineHeight: 1.5 }}>
        Number of AI answers where your brand is cited, aggregated over the period.
      </p>

      <button onClick={onWantMore}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '11px 14px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, cursor: 'pointer', fontFamily: F }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: VIOLET }}>I want to be cited more</span>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: VIOLET, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={14} color="#fff" strokeWidth={2.5} />
        </span>
      </button>
    </DashCard>
  );
}