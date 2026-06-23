import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ChevronRight, Loader } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#555554';
const INK3 = '#999997';
const BORDER = '#E8E8E6';
const SURFACE = '#F7F6F4';
const WHITE = '#FFFFFF';

const ChatGPTLogo = () => (
  <svg width="16" height="16" viewBox="0 0 41 41" fill="none">
    <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.136 10.079 10.079 0 0 0-9.618 6.977 9.967 9.967 0 0 0-6.69 4.839 10.081 10.081 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.135 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.691-4.839 10.079 10.079 0 0 0-1.24-11.818zm-15.019 21.069c-1.955 0-3.862-.662-5.409-1.873l.267-.151 8.979-5.184a1.505 1.505 0 0 0 .754-1.302V19.633l3.793 2.191a.139.139 0 0 1 .076.106v10.48c-.003 3.273-2.659 5.927-5.46 5.529zm-11.77-5.148a10.03 10.03 0 0 1-1.2-6.731l.267.161 8.979 5.184a1.505 1.505 0 0 0 1.508 0l10.963-6.333v4.381a.145.145 0 0 1-.057.112L21.4 35.501a9.956 9.956 0 0 1-10.657-2.71zm-1.545-14.91a9.943 9.943 0 0 1 5.201-4.382l-.004.31v10.368a1.503 1.503 0 0 0 .753 1.302l10.963 6.333-3.793 2.192a.139.139 0 0 1-.131.013L11.02 27.939a9.975 9.975 0 0 1-1.822-9.058zm31.1 8.575-10.963-6.333 3.793-2.192a.138.138 0 0 1 .131-.013l10.169 5.872a9.956 9.956 0 0 1-1.542 17.947v-.312l-.004-10.368a1.503 1.503 0 0 0-.752-1.301zm3.776-6.73-.267-.161-8.978-5.184a1.506 1.506 0 0 0-1.508 0L21.856 20.7v-4.381a.144.144 0 0 1 .057-.112l10.165-5.868a9.955 9.955 0 0 1 14.82 10.316zm-23.763 7.811-3.792-2.192a.14.14 0 0 1-.077-.107v-10.48c.002-3.276 2.661-5.93 5.462-5.527 1.954 0 3.861.661 5.408 1.872l-.267.151-8.979 5.184a1.505 1.505 0 0 0-.754 1.302l-.001 9.797zm2.06-4.43 4.879-2.818 4.879 2.817v5.635l-4.879 2.818-4.879-2.818V23.107z" fill="#10A37F"/>
  </svg>
);

const ENGINE_CFG = [
  { key: 'chatgpt',    label: 'ChatGPT',    logoEl: <ChatGPTLogo />, color: '#10A37F' },
  { key: 'gemini',     label: 'Gemini',     logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png', color: '#4285F4' },
  { key: 'claude',     label: 'Claude',     logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png', color: '#D97706' },
  { key: 'perplexity', label: 'Perplexity', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png', color: '#20B2AA' },
  { key: 'mistral',    label: 'Mistral',    logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png', color: '#FF6B35' },
  { key: 'llama',      label: 'Llama',      logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png', color: '#0064E0' },
  { key: 'grok',       label: 'Grok',       logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png', color: '#1DA1F2' },
  { key: 'copilot',    label: 'Copilot',    logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png', color: '#0078D4' },
];

function EngLogo({ e, size = 18 }) {
  if (e.logoEl) return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{e.logoEl}</div>
  );
  return (
    <img src={e.logo} alt={e.label} width={size} height={size}
      style={{ objectFit: 'contain', flexShrink: 0 }}
      onError={ev => { ev.target.style.opacity = '0.2'; }} />
  );
}

// Simule le prompt envoyé à chaque IA selon le domaine
function buildPrompt(domain, businessName) {
  const name = businessName || domain;
  return `Quels sont les meilleurs services proposés par "${name}" (${domain}) ? Peux-tu me donner une recommandation détaillée avec leurs points forts et leurs tarifs ?`;
}

// ── Card détail d'un moteur ───────────────────────────────────────────────────
function EngineDetailCard({ e, siteUrl, businessName }) {
  const [open, setOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const prompt = buildPrompt(
    (siteUrl || '').replace(/https?:\/\//, '').split('/')[0],
    businessName
  );

  const score = e.score;
  const barColor = e.color;

  const loadResponse = async () => {
    if (aiResponse || loading) return;
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu simules le comportement de l'IA "${e.label}". 
        
        Question posée : "${prompt}"
        
        Réponds comme le ferait réellement ${e.label} à cette question, en français. 
        - Si la marque est bien connue et présente en ligne, mentionne-la avec des détails.
        - Si elle est peu connue, dis-le honnêtement et suggère des alternatives génériques.
        - Sois concis (3-5 phrases max).
        - Ne mentionne pas que tu simules ${e.label}.`,
        model: 'gpt_5_mini',
      });
      setAiResponse(typeof res === 'string' ? res : res?.response || res?.content || JSON.stringify(res));
    } catch {
      setAiResponse('Impossible de charger la réponse simulée pour ce moteur.');
    }
    setLoading(false);
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadResponse();
  };

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
      {/* Row */}
      <button onClick={handleToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F }}>
        <EngLogo e={e} size={20} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{e.label}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: score >= 60 ? '#059669' : score >= 35 ? INK3 : '#DC2626' }}>
              {score >= 60 ? 'Vous cite' : score >= 35 ? 'Parfois' : 'Vous ignore'}
            </span>
          </div>
          <div style={{ height: 3, background: SURFACE, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${score}%`, background: barColor, borderRadius: 2, transition: 'width 1s ease', opacity: 0.7 }} />
          </div>
        </div>
        <span style={{ fontSize: 18, fontWeight: 900, color: INK, letterSpacing: '-0.03em', flexShrink: 0 }}>{score}</span>
        {open ? <ChevronDown size={14} color={INK3} /> : <ChevronRight size={14} color={INK3} />}
      </button>

      {/* Expanded */}
      {open && (
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px' }}>
          {/* Prompt simulé */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Question testée</p>
            <div style={{ background: SURFACE, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#E0E0DE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: INK3, marginTop: 1 }}>U</div>
              <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.6 }}>{prompt}</p>
            </div>
          </div>

          {/* Réponse IA */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Réponse de {e.label}</p>
            <div style={{ background: SURFACE, borderRadius: 10, padding: '12px', display: 'flex', gap: 10 }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <EngLogo e={e} size={16} />
              </div>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader size={13} color={INK3} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 12, color: INK3 }}>Simulation en cours…</span>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.7 }}>{aiResponse}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 12 }}>
            {[
              { l: 'Score', v: `${e.score}/100` },
              { l: 'Exactitude', v: `${e.accuracy}/100` },
              { l: 'Sentiment', v: e.sentiment === 'positive' ? '👍 Positif' : e.sentiment === 'negative' ? '👎 Négatif' : '→ Neutre' },
            ].map(({ l, v }) => (
              <div key={l} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: INK }}>{v}</div>
                <div style={{ fontSize: 9, color: INK3, fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function EnginesComparisonView({ d }) {
  const engines = ENGINE_CFG.map(e => ({
    ...e,
    score: d[`${e.key}_score`] || 0,
    sentiment: d[`${e.key}_sentiment`] || 'neutral',
    accuracy: d[`${e.key}_accuracy`] || 0,
    citFreq: d[`${e.key}_citation_freq`] || 0,
    reason: d[`${e.key}_reason`] || '',
  })).sort((a, b) => b.score - a.score);

  const avg = Math.round(engines.reduce((s, e) => s + e.score, 0) / engines.length);
  const domain = (d.site_url || '').replace(/https?:\/\//, '').split('/')[0];

  return (
    <div style={{ fontFamily: F }}>
      {/* Header */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Analyse par assistant IA</p>
            <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>Score moyen sur 8 assistants</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.04em' }}>{avg}</div>
            <div style={{ fontSize: 10, color: INK3, fontWeight: 600 }}>/100</div>
          </div>
        </div>
        {/* Global bar */}
        <div style={{ height: 4, background: SURFACE, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${avg}%`, background: INK, borderRadius: 2, transition: 'width 1.2s ease' }} />
        </div>
      </div>

      {/* Engine cards */}
      <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
        Cliquez sur un assistant pour voir la vraie réponse simulée
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {engines.map(e => (
          <EngineDetailCard key={e.key} e={e} siteUrl={d.site_url} businessName={d.identity_name || d.business_name} />
        ))}
      </div>
    </div>
  );
}