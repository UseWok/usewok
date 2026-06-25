import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

// AI logos — hosted assets, wrapped in white bg containers
const AI_LOGO_SRCS = {
  ChatGPT:    'https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png',
  Gemini:     'https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png',
  Claude:     'https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png',
  Mistral:    'https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png',
  Llama:      'https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png',
  Perplexity: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png',
  Grok:       'https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png',
  Copilot:    'https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png',
};

// ChatGPT SVG (vert officiel, pas d'image externe)
const ChatGPTSVG = () => (
  <svg width="14" height="14" viewBox="0 0 41 41" fill="none">
    <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.136 10.079 10.079 0 0 0-9.618 6.977 9.967 9.967 0 0 0-6.69 4.839 10.081 10.081 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.135 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.691-4.839 10.079 10.079 0 0 0-1.24-11.818zm-15.019 21.069c-1.955 0-3.862-.662-5.409-1.873l.267-.151 8.979-5.184a1.505 1.505 0 0 0 .754-1.302V19.633l3.793 2.191a.139.139 0 0 1 .076.106v10.48c-.003 3.273-2.659 5.927-5.46 5.529zm-11.77-5.148a10.03 10.03 0 0 1-1.2-6.731l.267.161 8.979 5.184a1.505 1.505 0 0 0 1.508 0l10.963-6.333v4.381a.145.145 0 0 1-.057.112L21.4 35.501a9.956 9.956 0 0 1-10.657-2.71zm-1.545-14.91a9.943 9.943 0 0 1 5.201-4.382l-.004.31v10.368a1.503 1.503 0 0 0 .753 1.302l10.963 6.333-3.793 2.192a.139.139 0 0 1-.131.013L11.02 27.939a9.975 9.975 0 0 1-1.822-9.058zm31.1 8.575-10.963-6.333 3.793-2.192a.138.138 0 0 1 .131-.013l10.169 5.872a9.956 9.956 0 0 1-1.542 17.947v-.312l-.004-10.368a1.503 1.503 0 0 0-.752-1.301zm3.776-6.73-.267-.161-8.978-5.184a1.506 1.506 0 0 0-1.508 0L21.856 20.7v-4.381a.144.144 0 0 1 .057-.112l10.165-5.868a9.955 9.955 0 0 1 14.82 10.316zm-23.763 7.811-3.792-2.192a.14.14 0 0 1-.077-.107v-10.48c.002-3.276 2.661-5.93 5.462-5.527 1.954 0 3.861.661 5.408 1.872l-.267.151-8.979 5.184a1.505 1.505 0 0 0-.754 1.302l-.001 9.797zm2.06-4.43 4.879-2.818 4.879 2.817v5.635l-4.879 2.818-4.879-2.818V23.107z" fill="#10A37F"/>
  </svg>
);

function AILogo({ name, size = 20 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 5, background: '#fff', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      {name === 'ChatGPT' ? <ChatGPTSVG /> : (
        <img src={AI_LOGO_SRCS[name]} alt={name} width={size - 4} height={size - 4} style={{ objectFit: 'contain' }} onError={e => { e.target.style.opacity = '0.2'; }} />
      )}
    </div>
  );
}

const AI_COLORS = {
  ChatGPT: '#10A37F',
  Gemini: '#4285F4',
  Claude: '#C96442',
  Mistral: '#F97316',
  Llama: '#0064E0',
  Perplexity: '#20808D',
  Grok: '#1DA1F2',
  Copilot: '#7B5EA7',
};

const VIEWS = ['Mondial', 'Par IA', 'Radar'];

function scoreColor(s) {
  if (s >= 65) return '#10B981';
  if (s >= 35) return '#F59E0B';
  return '#EF4444';
}

export default function AIEnginesChart({ data }) {
  const [view, setView] = useState('Par IA');

  const engines = [
    { name: 'ChatGPT', score: data.chatgpt_score || 0 },
    { name: 'Gemini', score: data.gemini_score || data.google_ai_score || 0 },
    { name: 'Claude', score: data.claude_score || 0 },
    { name: 'Mistral', score: data.mistral_score || 0 },
    { name: 'Llama', score: data.llama_score || 0 },
    { name: 'Perplexity', score: data.perplexity_score || 0 },
    { name: 'Grok', score: data.grok_score || 0 },
    { name: 'Copilot', score: data.copilot_score || 0 },
  ];

  const radarData = engines.map(e => ({ subject: e.name, score: e.score, fullMark: 100 }));

  // Geo data
  const geoData = data.geo_traffic || [];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <span style={{ color: '#888' }}>{payload[0]?.payload?.name || payload[0]?.payload?.subject}</span>
        <span style={{ color: '#1a1a1a', marginLeft: 8 }}>{payload[0]?.value}/100</span>
      </div>
    );
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header + tabs */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F0EE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F0F10', margin: 0 }}>Visibilité IA</h3>
          <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>Comment chaque IA voit votre site</p>
        </div>
        <div style={{ display: 'flex', background: '#F5F4F1', borderRadius: 8, padding: 3, gap: 2 }}>
          {VIEWS.map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                background: view === v ? '#fff' : 'transparent',
                color: view === v ? '#1a1a1a' : '#888',
                boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* BAR VIEW */}
        {view === 'Par IA' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {engines.map(e => (
             <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
               <AILogo name={e.name} size={20} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#444', width: 72, flexShrink: 0 }}>{e.name}</span>
                <div style={{ flex: 1, height: 6, background: '#F1F0EE', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${e.score}%`, background: AI_COLORS[e.name] || '#7C3AED', borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: scoreColor(e.score), width: 28, textAlign: 'right', flexShrink: 0 }}>{e.score}</span>
              </div>
            ))}
          </div>
        )}

        {/* RADAR VIEW */}
        {view === 'Radar' && (
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#F1F0EE" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }} />
              <Radar name="Score" dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {/* GEO VIEW */}
        {view === 'Mondial' && (
          <div>
            {geoData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#888', fontSize: 13 }}>Données géographiques non disponibles</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {geoData.map((g, i) => {
                  const isOther = g.country === 'OTHER';
                  const flag = isOther ? '🌐' : `https://flagcdn.com/24x18/${g.country.toLowerCase()}.png`;
                  const barColor = isOther ? '#D1D5DB' : ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B'][i] || '#7C3AED';
                  return (
                    <div key={g.country} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {isOther ? (
                        <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center' }}>{flag}</span>
                      ) : (
                        <img src={flag} alt={g.country} width="24" height="18" style={{ borderRadius: 3, flexShrink: 0, objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
                      )}
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#444', width: 100, flexShrink: 0 }}>{g.country_name || g.country}</span>
                      <div style={{ flex: 1, height: 6, background: '#F1F0EE', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${g.pct}%`, background: barColor, borderRadius: 3, transition: 'width 1s ease' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#1a1a1a', width: 36, textAlign: 'right', flexShrink: 0 }}>{g.pct}%</span>
                    </div>
                  );
                })}
                <p style={{ fontSize: 11, color: '#aaa', marginTop: 8, textAlign: 'center' }}>Répartition estimée du trafic par pays</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}