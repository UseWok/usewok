import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader, ChevronDown, ChevronRight } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const SURFACE = '#F7F6F4';
const WHITE = '#FFFFFF';

const ChatGPTLogo = () => (
  <svg width="16" height="16" viewBox="0 0 41 41" fill="none">
    <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.136 10.079 10.079 0 0 0-9.618 6.977 9.967 9.967 0 0 0-6.69 4.839 10.081 10.081 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.135 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.691-4.839 10.079 10.079 0 0 0-1.24-11.818zm-15.019 21.069c-1.955 0-3.862-.662-5.409-1.873l.267-.151 8.979-5.184a1.505 1.505 0 0 0 .754-1.302V19.633l3.793 2.191a.139.139 0 0 1 .076.106v10.48c-.003 3.273-2.659 5.927-5.46 5.529zm-11.77-5.148a10.03 10.03 0 0 1-1.2-6.731l.267.161 8.979 5.184a1.505 1.505 0 0 0 1.508 0l10.963-6.333v4.381a.145.145 0 0 1-.057.112L21.4 35.501a9.956 9.956 0 0 1-10.657-2.71zm-1.545-14.91a9.943 9.943 0 0 1 5.201-4.382l-.004.31v10.368a1.503 1.503 0 0 0 .753 1.302l10.963 6.333-3.793 2.192a.139.139 0 0 1-.131.013L11.02 27.939a9.975 9.975 0 0 1-1.822-9.058zm31.1 8.575-10.963-6.333 3.793-2.192a.138.138 0 0 1 .131-.013l10.169 5.872a9.956 9.956 0 0 1-1.542 17.947v-.312l-.004-10.368a1.503 1.503 0 0 0-.752-1.301zm3.776-6.73-.267-.161-8.978-5.184a1.506 1.506 0 0 0-1.508 0L21.856 20.7v-4.381a.144.144 0 0 1 .057-.112l10.165-5.868a9.955 9.955 0 0 1 14.82 10.316zm-23.763 7.811-3.792-2.192a.14.14 0 0 1-.077-.107v-10.48c.002-3.276 2.661-5.93 5.462-5.527 1.954 0 3.861.661 5.408 1.872l-.267.151-8.979 5.184a1.505 1.505 0 0 0-.754 1.302l-.001 9.797zm2.06-4.43 4.879-2.818 4.879 2.817v5.635l-4.879 2.818-4.879-2.818V23.107z" fill="#10A37F"/>
  </svg>
);

const ENGINE_CFG = [
  { key: 'chatgpt',    label: 'ChatGPT',    logoEl: <ChatGPTLogo />,  color: '#10A37F', accent: '#F0FDF9' },
  { key: 'gemini',     label: 'Gemini',     logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png', color: '#4285F4', accent: '#EFF6FF' },
  { key: 'claude',     label: 'Claude',     logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png', color: '#D97706', accent: '#FFFBEB' },
  { key: 'perplexity', label: 'Perplexity', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png', color: '#20B2AA', accent: '#F0FDFD' },
  { key: 'mistral',    label: 'Mistral',    logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png', color: '#FF6B35', accent: '#FFF7F4' },
  { key: 'llama',      label: 'Llama',      logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png', color: '#0064E0', accent: '#EFF6FF' },
  { key: 'grok',       label: 'Grok',       logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png', color: '#1DA1F2', accent: '#F0F9FF' },
  { key: 'copilot',    label: 'Copilot',    logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png', color: '#0078D4', accent: '#EFF6FF' },
];

function EngLogo({ e, size = 18 }) {
  if (e.logoEl) return <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{e.logoEl}</div>;
  return <img src={e.logo} alt={e.label} width={size} height={size} style={{ objectFit: 'contain', flexShrink: 0 }} onError={ev => { ev.target.style.opacity = '0.2'; }} />;
}

function sentimentBadge(s) {
  if (s === 'positive') return { label: '👍 Positif', color: '#059669', bg: '#F0FDF4' };
  if (s === 'negative') return { label: '👎 Négatif', color: '#DC2626', bg: '#FEF2F2' };
  return { label: '→ Neutre', color: '#6B7280', bg: SURFACE };
}

function EngineCard({ e, d, businessName, siteUrl }) {
  const [open, setOpen] = useState(false);
  const [simResponse, setSimResponse] = useState(null);
  const [loadingSim, setLoadingSim] = useState(false);

  const score = d[`${e.key}_score`] || 0;
  const accuracy = d[`${e.key}_accuracy`] || 0;
  const sentiment = d[`${e.key}_sentiment`] || 'neutral';
  const citFreq = d[`${e.key}_citation_freq`] || 0;
  const reason = d[`${e.key}_reason`] || '';
  const domain = (siteUrl || '').replace(/https?:\/\//, '').split('/')[0];
  const sentBadge = sentimentBadge(sentiment);

  const prompt = `Quels sont les meilleurs services ou produits proposés par "${businessName || domain}" (${domain}) ? Peux-tu me recommander leur offre ?`;

  const loadSim = async () => {
    if (simResponse || loadingSim) return;
    setLoadingSim(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Simule exactement comment l'IA "${e.label}" répondrait à cette question :
"${prompt}"

Réponds comme ${e.label} le ferait réellement, en français, de manière naturelle (3-4 phrases). 
Si la marque est connue, sois précis. Sinon, réponds honnêtement que tu n'as pas d'infos spécifiques.
Ne dis pas que tu simules.`,
        model: 'gpt_5_mini',
      });
      setSimResponse(typeof res === 'string' ? res : res?.response || JSON.stringify(res));
    } catch { setSimResponse('Simulation indisponible pour le moment.'); }
    setLoadingSim(false);
  };

  const toggle = () => { const next = !open; setOpen(next); if (next) loadSim(); };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 8 }}>
      {/* Row */}
      <button onClick={toggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: e.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <EngLogo e={e} size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{e.label}</span>
            <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 20, background: sentBadge.bg, color: sentBadge.color, fontWeight: 700 }}>{sentBadge.label}</span>
          </div>
          <div style={{ height: 4, background: SURFACE, borderRadius: 2, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', background: e.color, borderRadius: 2, opacity: 0.85 }} />
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.03em' }}>{score}</div>
          <div style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>/100</div>
        </div>
        {open ? <ChevronDown size={14} color={INK3} /> : <ChevronRight size={14} color={INK3} />}
      </button>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px' }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 16 }}>
            {[
              { l: 'Score LRS', v: `${score}/100`, color: e.color },
              { l: 'Précision', v: `${accuracy}/100`, color: '#3B82F6' },
              { l: 'Fréquence', v: `${citFreq}/100`, color: '#7C3AED' },
            ].map(({ l, v, color }) => (
              <div key={l} style={{ background: SURFACE, borderRadius: 10, padding: '10px 12px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 14, fontWeight: 900, color, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 9, color: INK3, fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Prompt */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Prompt testé</p>
            <div style={{ background: SURFACE, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8, border: `1px solid ${BORDER}` }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#E0E0DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: INK3, flexShrink: 0, marginTop: 1 }}>U</div>
              <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.65 }}>{prompt}</p>
            </div>
          </div>

          {/* Simulated response */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Réponse simulée de {e.label}</p>
            <div style={{ background: e.accent, borderRadius: 10, padding: '12px', display: 'flex', gap: 10, border: `1px solid ${BORDER}` }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}><EngLogo e={e} size={16} /></div>
              {loadingSim ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader size={12} color={INK3} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 12, color: INK3 }}>Simulation en cours…</span>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.7 }}>{simResponse}</p>
              )}
            </div>
          </div>

          {reason && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A' }}>
              <p style={{ fontSize: 11, color: '#92400E', margin: 0, lineHeight: 1.5 }}>💡 {reason}</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}

export default function EngineScoreGrid({ d }) {
  const engines = ENGINE_CFG.map(e => ({ ...e, score: d[`${e.key}_score`] || 0 })).sort((a, b) => b.score - a.score);
  const avg = Math.round(engines.reduce((s, e) => s + e.score, 0) / engines.length);

  return (
    <div style={{ fontFamily: F, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Score par assistant IA</p>
          <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>Cliquez pour voir le prompt testé et la réponse simulée</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.03em' }}>{avg}<span style={{ fontSize: 11, color: INK3, fontWeight: 500 }}>/100</span></div>
          <div style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>Moyenne 8 IA</div>
        </div>
      </div>
      {engines.map(e => <EngineCard key={e.key} e={e} d={d} businessName={d.identity_name || d.business_name} siteUrl={d.site_url} />)}
    </div>
  );
}