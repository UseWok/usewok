import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

// Real AI logos — uploaded assets, mix-blend-mode:multiply removes white/black bg
const L = (src, blend = 'multiply') => (
  <img src={src} alt="" style={{ width: 24, height: 24, objectFit: 'contain', mixBlendMode: blend, display: 'block' }} />
);
const AI_LOGOS = {
  ChatGPT:    L('https://cdn.freebiesupply.com/logos/large/3x/chatgpt-symbol.png'),
  Gemini:     L('https://files.svgcdn.io/logos/gemini-icon.png', 'screen'),
  Claude:     L('https://files.svgcdn.io/logos/claude-icon.png', 'multiply'),
  Mistral:    L('https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png', 'multiply'),
  Llama:      L('https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png', 'multiply'),
  Perplexity: L('https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png', 'multiply'),
  Grok:       L('https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png', 'multiply'),
  Copilot:    L('https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png', 'normal'),
};

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
                <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {AI_LOGOS[e.name] || <span style={{ fontSize: 10, fontWeight: 700 }}>{e.name[0]}</span>}
                </div>
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