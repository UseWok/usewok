import { motion } from 'framer-motion';

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
  { key: 'chatgpt',    label: 'ChatGPT',    logoEl: <ChatGPTLogo /> },
  { key: 'gemini',     label: 'Gemini',     logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/120px-Google_Gemini_logo.svg.png' },
  { key: 'claude',     label: 'Claude',     logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png' },
  { key: 'perplexity', label: 'Perplexity', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png' },
  { key: 'mistral',    label: 'Mistral',    logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png' },
  { key: 'llama',      label: 'Llama',      logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png' },
  { key: 'grok',       label: 'Grok',       logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png' },
  { key: 'copilot',    label: 'Copilot',    logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png' },
];

function EngLogo({ e, size = 18 }) {
  if (e.logoEl) return (
    <div style={{ width: size, height: size, borderRadius: 5, background: '#fff', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {e.logoEl}
    </div>
  );
  return (
    <div style={{ width: size, height: size, borderRadius: 5, background: '#fff', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      <img src={e.logo} alt={e.label} width={size - 4} height={size - 4} style={{ objectFit: 'contain' }} onError={ev => { ev.target.style.opacity = '0.2'; }} />
    </div>
  );
}

function scoreColor(s) {
  if (s >= 65) return '#059669';
  if (s >= 35) return '#D97706';
  return '#DC2626';
}

function sentimentLabel(s) {
  if (s === 'positive') return { text: 'Positif', color: '#059669' };
  if (s === 'negative') return { text: 'Négatif', color: '#DC2626' };
  return { text: 'Neutre', color: INK3 };
}

export default function EngineScoreGrid({ d }) {
  const engines = ENGINE_CFG.map(e => ({
    ...e,
    score: d[`${e.key}_score`] || 0,
    accuracy: d[`${e.key}_accuracy`] || 0,
    sentiment: d[`${e.key}_sentiment`] || 'neutral',
    citFreq: d[`${e.key}_citation_freq`] || 0,
  })).sort((a, b) => b.score - a.score);

  const avg = Math.round(engines.reduce((s, e) => s + e.score, 0) / engines.length);

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14, fontFamily: F }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Scores par assistant IA</p>
          <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>8 modèles analysés — citation, sentiment, précision</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.03em' }}>{avg}</span>
          <span style={{ fontSize: 11, color: INK3 }}>/100</span>
          <div style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>MOYENNE</div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 52px 72px', gap: 0, padding: '8px 18px', background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Assistant</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Score</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Précision</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Citation</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Sentiment</span>
      </div>

      {/* Rows */}
      {engines.map((e, i) => {
        const sent = sentimentLabel(e.sentiment);
        const sc = scoreColor(e.score);
        return (
          <div key={e.key} style={{
            display: 'grid', gridTemplateColumns: '1fr 52px 52px 52px 72px',
            alignItems: 'center', gap: 0,
            padding: '13px 18px',
            borderBottom: i < engines.length - 1 ? `1px solid ${BORDER}` : 'none',
            background: WHITE,
          }}>
            {/* Name + bar */}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
                <EngLogo e={e} size={16} />
                <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>{e.label}</span>
              </div>
              <div style={{ height: 5, background: SURFACE, borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${e.score}%` }}
                  transition={{ duration: 0.9, delay: i * 0.05, ease: 'easeOut' }}
                  style={{ height: '100%', background: sc, borderRadius: 3 }} />
              </div>
            </div>

            {/* Score */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: sc, letterSpacing: '-0.02em' }}>{e.score}</span>
            </div>

            {/* Accuracy */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: INK2 }}>{e.accuracy}</span>
            </div>

            {/* Citation */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: INK2 }}>{e.citFreq}</span>
            </div>

            {/* Sentiment */}
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: sent.color }}>{sent.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}