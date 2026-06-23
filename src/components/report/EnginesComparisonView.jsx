import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EFEFEF';
const SURFACE = '#F9F8F6';
const WHITE = '#FFFFFF';

const ChatGPTLogo = () => (
  <svg width="16" height="16" viewBox="0 0 41 41" fill="none">
    <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.136 10.079 10.079 0 0 0-9.618 6.977 9.967 9.967 0 0 0-6.69 4.839 10.081 10.081 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.135 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.691-4.839 10.079 10.079 0 0 0-1.24-11.818zm-15.019 21.069c-1.955 0-3.862-.662-5.409-1.873l.267-.151 8.979-5.184a1.505 1.505 0 0 0 .754-1.302V19.633l3.793 2.191a.139.139 0 0 1 .076.106v10.48c-.003 3.273-2.659 5.927-5.46 5.529zm-11.77-5.148a10.03 10.03 0 0 1-1.2-6.731l.267.161 8.979 5.184a1.505 1.505 0 0 0 1.508 0l10.963-6.333v4.381a.145.145 0 0 1-.057.112L21.4 35.501a9.956 9.956 0 0 1-10.657-2.71zm-1.545-14.91a9.943 9.943 0 0 1 5.201-4.382l-.004.31v10.368a1.503 1.503 0 0 0 .753 1.302l10.963 6.333-3.793 2.192a.139.139 0 0 1-.131.013L11.02 27.939a9.975 9.975 0 0 1-1.822-9.058zm31.1 8.575-10.963-6.333 3.793-2.192a.138.138 0 0 1 .131-.013l10.169 5.872a9.956 9.956 0 0 1-1.542 17.947v-.312l-.004-10.368a1.503 1.503 0 0 0-.752-1.301zm3.776-6.73-.267-.161-8.978-5.184a1.506 1.506 0 0 0-1.508 0L21.856 20.7v-4.381a.144.144 0 0 1 .057-.112l10.165-5.868a9.955 9.955 0 0 1 14.82 10.316zm-23.763 7.811-3.792-2.192a.14.14 0 0 1-.077-.107v-10.48c.002-3.276 2.661-5.93 5.462-5.527 1.954 0 3.861.661 5.408 1.872l-.267.151-8.979 5.184a1.505 1.505 0 0 0-.754 1.302l-.001 9.797zm2.06-4.43 4.879-2.818 4.879 2.817v5.635l-4.879 2.818-4.879-2.818V23.107z" fill="#10A37F"/>
  </svg>
);

const ENGINE_CFG = [
  { key: 'chatgpt',    label: 'ChatGPT',    logoEl: <ChatGPTLogo /> },
  { key: 'gemini',     label: 'Gemini',     logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png' },
  { key: 'claude',     label: 'Claude',     logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png' },
  { key: 'perplexity', label: 'Perplexity', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png' },
  { key: 'mistral',    label: 'Mistral',    logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png' },
  { key: 'llama',      label: 'Llama',      logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png' },
  { key: 'grok',       label: 'Grok',       logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png' },
  { key: 'copilot',    label: 'Copilot',    logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png' },
];

function EngLogo({ e, size = 18 }) {
  if (e.logoEl) return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {e.logoEl}
    </div>
  );
  return (
    <img src={e.logo} alt={e.label} width={size} height={size}
      style={{ objectFit: 'contain', borderRadius: 3, flexShrink: 0 }}
      onError={ev => { ev.target.style.opacity = '0.2'; }} />
  );
}

function scoreLevel(s) {
  if (s >= 65) return { label: 'Bon', color: '#059669', bg: '#ECFDF5' };
  if (s >= 35) return { label: 'Moyen', color: '#B45309', bg: '#FFFBEB' };
  return { label: 'Faible', color: '#DC2626', bg: '#FEF2F2' };
}

const SENTINEL_LABEL = (s) => s === 'positive' ? '👍 Positif' : s === 'negative' ? '👎 Négatif' : '→ Neutre';

export default function EnginesComparisonView({ d }) {
  const [view, setView] = useState('bars'); // 'bars' | 'radar' | 'detail'
  const [selected, setSelected] = useState(null);

  const engines = ENGINE_CFG.map(e => ({
    ...e,
    score: d[`${e.key}_score`] || 0,
    sentiment: d[`${e.key}_sentiment`] || 'neutral',
    accuracy: d[`${e.key}_accuracy`] || 0,
    citFreq: d[`${e.key}_citation_freq`] || 0,
    reason: d[`${e.key}_reason`] || '',
  })).sort((a, b) => b.score - a.score);

  const radarData = engines.map(e => ({ subject: e.label, score: e.score }));
  const avg = Math.round(engines.reduce((s, e) => s + e.score, 0) / engines.length);

  const sel = selected != null ? engines.find(e => e.key === selected) : null;

  return (
    <div style={{ fontFamily: F }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: INK, margin: '0 0 2px', letterSpacing: '-0.02em' }}>Comparaison des moteurs IA</h2>
          <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Score moyen : <strong style={{ color: INK }}>{avg}/100</strong></p>
        </div>
        <div style={{ display: 'flex', background: SURFACE, borderRadius: 9, padding: 3, gap: 2, border: `1px solid ${BORDER}` }}>
          {[{ k: 'bars', l: 'Barres' }, { k: 'radar', l: 'Radar' }, { k: 'detail', l: 'Détail' }].map(({ k, l }) => (
            <button key={k} onClick={() => setView(k)} style={{
              padding: '5px 11px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, fontFamily: F,
              background: view === k ? WHITE : 'transparent',
              color: view === k ? INK : INK3,
              boxShadow: view === k ? '0 1px 4px rgba(0,0,0,0.07)' : 'none',
              transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── BARS VIEW ── */}
      {view === 'bars' && (
        <div>
          {/* Global score bar */}
          <div style={{ background: INK, borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score moyen toutes IAs</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>{avg}<span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>/100</span></span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${avg}%`, background: avg >= 65 ? '#34D399' : avg >= 35 ? '#FBBF24' : '#F87171', borderRadius: 2, transition: 'width 1.2s ease' }} />
            </div>
          </div>

          {/* Per-engine bars */}
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            {engines.map((e, i) => {
              const lvl = scoreLevel(e.score);
              return (
                <div key={e.key}
                  onClick={() => setSelected(selected === e.key ? null : e.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', cursor: 'pointer',
                    borderBottom: i < engines.length - 1 ? `1px solid ${BORDER}` : 'none',
                    background: selected === e.key ? SURFACE : WHITE,
                    transition: 'background 0.12s',
                  }}>
                  <EngLogo e={e} size={20} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: INK, width: 80, flexShrink: 0 }}>{e.label}</span>
                  <div style={{ flex: 1, height: 5, background: SURFACE, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${e.score}%`, background: INK, borderRadius: 3, transition: 'width 1s ease', opacity: 0.12 + (e.score / 100) * 0.78 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: INK, width: 26, textAlign: 'right', flexShrink: 0 }}>{e.score}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: lvl.color, background: lvl.bg, padding: '3px 7px', borderRadius: 20, flexShrink: 0 }}>{lvl.label}</span>
                </div>
              );
            })}
          </div>

          {/* Engine detail panel */}
          {sel && (
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px', marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <EngLogo e={sel} size={24} />
                <span style={{ fontSize: 15, fontWeight: 800, color: INK }}>{sel.label}</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: INK, marginLeft: 'auto' }}>{sel.score}<span style={{ fontSize: 11, fontWeight: 500, color: INK3 }}>/100</span></span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { l: 'Score', v: sel.score },
                  { l: 'Exactitude', v: sel.accuracy },
                  { l: 'Citations/100', v: sel.citFreq },
                ].map(({ l, v }) => (
                  <div key={l} style={{ background: SURFACE, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: INK }}>{v}</div>
                    <div style={{ fontSize: 9, color: INK3, marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: SURFACE, borderRadius: 10, marginBottom: sel.reason ? 10 : 0 }}>
                <span style={{ fontSize: 11, color: INK3, fontWeight: 600 }}>Sentiment :</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{SENTINEL_LABEL(sel.sentiment)}</span>
              </div>
              {sel.reason && (
                <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.6, padding: '10px 12px', background: '#FAFAFA', borderRadius: 10, border: `1px solid ${BORDER}` }}>{sel.reason}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── RADAR VIEW ── */}
      {view === 'radar' && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 12px' }}>
          <p style={{ fontSize: 11, color: INK3, textAlign: 'center', margin: '0 0 8px', fontWeight: 600 }}>Vue radar — comparaison globale</p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke={BORDER} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: INK3, fontWeight: 600, fontFamily: F }} />
              <Radar dataKey="score" stroke={INK} fill={INK} fillOpacity={0.07} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 12 }}>
            {engines.map(e => (
              <div key={e.key} style={{ textAlign: 'center', padding: '8px 4px', background: SURFACE, borderRadius: 9 }}>
                <EngLogo e={e} size={16} />
                <div style={{ fontSize: 14, fontWeight: 900, color: INK, marginTop: 4 }}>{e.score}</div>
                <div style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>{e.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DETAIL VIEW ── */}
      {view === 'detail' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {engines.map(e => {
            const lvl = scoreLevel(e.score);
            return (
              <div key={e.key} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: `1px solid ${BORDER}` }}>
                  <EngLogo e={e} size={22} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: INK, flex: 1 }}>{e.label}</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.03em' }}>{e.score}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: lvl.color, background: lvl.bg, padding: '3px 8px', borderRadius: 20 }}>{lvl.label}</span>
                </div>
                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
                  {[
                    { l: 'Exactitude', v: e.accuracy },
                    { l: 'Citations', v: e.citFreq },
                    { l: 'Sentiment', v: SENTINEL_LABEL(e.sentiment), isText: true },
                  ].map(({ l, v, isText }, idx) => (
                    <div key={l} style={{
                      padding: '12px 14px', textAlign: 'center',
                      borderRight: idx < 2 ? `1px solid ${BORDER}` : 'none',
                    }}>
                      <div style={{ fontSize: isText ? 11 : 16, fontWeight: isText ? 600 : 900, color: INK }}>{v}</div>
                      <div style={{ fontSize: 9, color: INK3, fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{l}</div>
                    </div>
                  ))}
                </div>
                {/* Progress bars */}
                <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { l: 'Score global', v: e.score },
                    { l: 'Exactitude des infos', v: e.accuracy },
                    { l: 'Fréquence de citation', v: e.citFreq },
                  ].map(({ l, v }) => (
                    <div key={l}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: INK3, fontWeight: 600 }}>{l}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: INK }}>{v}/100</span>
                      </div>
                      <div style={{ height: 3, background: SURFACE, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${v}%`, background: INK, borderRadius: 2, opacity: 0.15 + (v / 100) * 0.75, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
                {e.reason && (
                  <div style={{ padding: '10px 16px 14px', borderTop: `1px solid ${BORDER}` }}>
                    <p style={{ fontSize: 11, color: INK2, margin: 0, lineHeight: 1.6 }}>{e.reason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}