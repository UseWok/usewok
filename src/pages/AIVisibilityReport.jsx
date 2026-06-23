import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Minus,
  ArrowRight, CheckCircle, XCircle, Star, Zap, Globe, ExternalLink, Link2
} from 'lucide-react';
import FixInstructionModal from '@/components/report/FixInstructionModal';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EFEFEF';
const SURFACE = '#F9F8F6';
const WHITE = '#FFFFFF';
const VIOLET = '#7C3AED';

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Label({ children }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px', fontFamily: F }}>
      {children}
    </p>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px', marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function Delta({ val }) {
  if (val == null) return null;
  const up = val > 0;
  const neutral = val === 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700,
      color: neutral ? INK3 : up ? '#059669' : '#DC2626',
      background: neutral ? SURFACE : up ? '#ECFDF5' : '#FEF2F2',
      padding: '2px 7px', borderRadius: 20,
    }}>
      {neutral ? <Minus size={9} /> : up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {!neutral && (up ? '+' : '')}{typeof val === 'number' ? val.toFixed(1) : val}%
    </span>
  );
}

// ── LRS Hero — the flagship metric ────────────────────────────────────────────
function LRSHero({ d }) {
  const lrs = Math.round(d.lrs_score || 0);
  const citation = Math.round(d.lrs_citation_score || 0);
  const sentiment = Math.round(d.lrs_sentiment_score || 0);
  const accuracy = Math.round(d.lrs_accuracy_score || 0);
  const trend = d.lrs_trend || 'stable';
  const vsIndustry = d.lrs_vs_industry;

  const scoreColor = lrs >= 65 ? '#34D399' : lrs >= 35 ? '#FBBF24' : '#F87171';
  const trendColor = trend === 'rising' ? '#34D399' : trend === 'declining' ? '#F87171' : 'rgba(255,255,255,0.4)';

  // Arc SVG
  const R = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * R;
  const pct = lrs / 100;

  return (
    <div style={{
      background: INK, borderRadius: 20, padding: '28px 24px 24px',
      marginBottom: 12, fontFamily: F, position: 'relative', overflow: 'hidden',
    }}>
      {/* background radial glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${scoreColor}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ position: 'relative' }}>
        {/* Top badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.07)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: scoreColor, boxShadow: `0 0 6px ${scoreColor}` }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>LLM Resonance Score™</span>
          </div>
          <a href={d.site_url || '#'} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
            <Globe size={10} />
            {(d.site_url || '').replace(/https?:\/\//, '').split('/')[0]}
            <ExternalLink size={9} />
          </a>
        </div>

        {/* Score + arc + sub-components */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* Arc gauge */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width={128} height={128} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} />
              <circle cx={cx} cy={cy} r={R} fill="none" stroke={scoreColor} strokeWidth={10}
                strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 38, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.04em' }}>{lrs}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>/100</div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: WHITE, marginBottom: 6, letterSpacing: '-0.02em' }}>
              {d.identity_name || (d.site_url || '').replace(/https?:\/\//, '').split('/')[0]}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: trendColor }}>
                {trend === 'rising' ? <TrendingUp size={12} /> : trend === 'declining' ? <TrendingDown size={12} /> : <Minus size={12} />}
                {trend === 'rising' ? 'En hausse' : trend === 'declining' ? 'En baisse' : 'Stable'}
              </span>
              {vsIndustry != null && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  {vsIndustry >= 0 ? `+${vsIndustry}` : vsIndustry} pts vs secteur
                </span>
              )}
            </div>

            {/* 3 sub-components */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Citation', value: citation, pct: '40%' },
                { label: 'Sentiment', value: sentiment, pct: '30%' },
                { label: 'Exactitude', value: accuracy, pct: '30%' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{s.label} <span style={{ opacity: 0.5 }}>({s.pct})</span></span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: WHITE }}>{s.value}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.value}%`, background: scoreColor, borderRadius: 2, transition: 'width 1.4s ease', opacity: 0.9 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {d.shock_insight && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '18px 0 0', lineHeight: 1.65, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
            {d.shock_insight}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Sub-scores row ──────────────────────────────────────────────────────────────
function SubScoresRow({ d }) {
  const items = [
    { label: 'Visibilité IA', value: Math.round(d.ai_visibility_score || d.score_ai_visibility || 0) },
    { label: 'Clarté', value: Math.round(d.message_clarity_score || d.score_message_clarity || 0) },
    { label: 'Commercial', value: Math.round(d.commercial_presence_score || d.score_commercial_signal || 0) },
    { label: 'Global', value: Math.round(d.overall_score || d.score_overall || 0) },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
      {items.map(s => {
        const c = s.value >= 65 ? '#059669' : s.value >= 35 ? '#D97706' : '#DC2626';
        return (
          <Card key={s.label} style={{ padding: '14px 12px', textAlign: 'center', margin: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ height: 2, background: SURFACE, borderRadius: 1, margin: '8px 0 5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${s.value}%`, background: c, borderRadius: 1, transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: 10, color: INK3, fontWeight: 600 }}>{s.label}</div>
          </Card>
        );
      })}
    </div>
  );
}

// ── AI Engines comparison ──────────────────────────────────────────────────────
// ChatGPT SVG inline to avoid broken external URLs
const ChatGPTLogo = () => (
  <svg width="18" height="18" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.136 10.079 10.079 0 0 0-9.618 6.977 9.967 9.967 0 0 0-6.69 4.839 10.081 10.081 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.135 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.691-4.839 10.079 10.079 0 0 0-1.24-11.818zm-15.019 21.069c-1.955 0-3.862-.662-5.409-1.873l.267-.151 8.979-5.184a1.505 1.505 0 0 0 .754-1.302V19.633l3.793 2.191a.139.139 0 0 1 .076.106v10.48c-.003 3.273-2.659 5.927-5.46 5.529zm-11.77-5.148a10.03 10.03 0 0 1-1.2-6.731l.267.161 8.979 5.184a1.505 1.505 0 0 0 1.508 0l10.963-6.333v4.381a.145.145 0 0 1-.057.112L21.4 35.501a9.956 9.956 0 0 1-10.657-2.71zm-1.545-14.91a9.943 9.943 0 0 1 5.201-4.382l-.004.31v10.368a1.503 1.503 0 0 0 .753 1.302l10.963 6.333-3.793 2.192a.139.139 0 0 1-.131.013L11.02 27.939a9.975 9.975 0 0 1-1.822-9.058zm31.1 8.575-10.963-6.333 3.793-2.192a.138.138 0 0 1 .131-.013l10.169 5.872a9.956 9.956 0 0 1-1.542 17.947v-.312l-.004-10.368a1.503 1.503 0 0 0-.752-1.301zm3.776-6.73-.267-.161-8.978-5.184a1.506 1.506 0 0 0-1.508 0L21.856 20.7v-4.381a.144.144 0 0 1 .057-.112l10.165-5.868a9.955 9.955 0 0 1 14.82 10.316zm-23.763 7.811-3.792-2.192a.14.14 0 0 1-.077-.107v-10.48c.002-3.276 2.661-5.93 5.462-5.527 1.954 0 3.861.661 5.408 1.872l-.267.151-8.979 5.184a1.505 1.505 0 0 0-.754 1.302l-.001 9.797zm2.06-4.43 4.879-2.818 4.879 2.817v5.635l-4.879 2.818-4.879-2.818V23.107z" fill="#10A37F"/>
  </svg>
);

const AI_ENGINES_CFG = [
  { key: 'chatgpt', label: 'ChatGPT',    color: '#10A37F', logoEl: <ChatGPTLogo /> },
  { key: 'gemini',  label: 'Gemini',     color: '#4285F4', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png' },
  { key: 'claude',  label: 'Claude',     color: '#C96442', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png' },
  { key: 'perplexity', label: 'Perplexity', color: '#20808D', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png' },
  { key: 'mistral', label: 'Mistral',    color: '#F97316', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png' },
  { key: 'llama',   label: 'Llama',      color: '#0064E0', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png' },
  { key: 'grok',    label: 'Grok',       color: '#1DA1F2', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png' },
  { key: 'copilot', label: 'Copilot',    color: '#7B5EA7', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png' },
];

function AIEnginesSection({ d }) {
  const [view, setView] = useState('bars');
  const engines = AI_ENGINES_CFG.map(e => ({
    ...e,
    score: d[`${e.key}_score`] || 0,
    sentiment: d[`${e.key}_sentiment`] || 'neutral',
    accuracy: d[`${e.key}_accuracy`] || 0,
    citFreq: d[`${e.key}_citation_freq`] || 0,
    reason: d[`${e.key}_reason`] || '',
  })).sort((a, b) => b.score - a.score);

  const sentimentColor = (s) => s === 'positive' ? '#059669' : s === 'negative' ? '#DC2626' : INK3;
  const sentimentLabel = (s) => s === 'positive' ? 'Positif' : s === 'negative' ? 'Négatif' : 'Neutre';

  const LogoEl = ({ e }) => {
    if (e.logoEl) return <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e.logoEl}</div>;
    return <img src={e.logo} alt={e.label} width={20} height={20} style={{ objectFit: 'contain', borderRadius: 4, flexShrink: 0 }} onError={ev => { ev.target.style.opacity = '0.3'; }} />;
  };

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Label>Présence par moteur IA</Label>
        <div style={{ display: 'flex', background: SURFACE, borderRadius: 8, padding: 3, gap: 2 }}>
          {['bars', 'detail'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700,
              background: view === v ? WHITE : 'transparent', color: view === v ? INK : INK3,
              boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s',
            }}>{v === 'bars' ? 'Scores' : 'Détail'}</button>
          ))}
        </div>
      </div>

      {view === 'bars' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {engines.map(e => (
            <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogoEl e={e} />
              <span style={{ fontSize: 12, fontWeight: 600, color: INK2, width: 78, flexShrink: 0 }}>{e.label}</span>
              <div style={{ flex: 1, height: 5, background: SURFACE, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${e.score}%`, background: e.color, borderRadius: 3, transition: 'width 1s ease' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 900, color: e.score >= 65 ? '#059669' : e.score >= 35 ? '#D97706' : '#DC2626', width: 28, textAlign: 'right', flexShrink: 0 }}>{e.score}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'detail' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {engines.map(e => (
            <div key={e.key} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: SURFACE }}>
                <LogoEl e={e} />
                <span style={{ fontSize: 13, fontWeight: 700, color: INK, flex: 1 }}>{e.label}</span>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: INK }}>{e.score}</div>
                    <div style={{ fontSize: 9, color: INK3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: INK }}>{e.accuracy}</div>
                    <div style={{ fontSize: 9, color: INK3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Exactitude</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: INK }}>{e.citFreq}</div>
                    <div style={{ fontSize: 9, color: INK3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Citations</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: sentimentColor(e.sentiment), padding: '3px 7px', background: sentimentColor(e.sentiment) + '15', borderRadius: 20 }}>
                      {sentimentLabel(e.sentiment)}
                    </div>
                    <div style={{ fontSize: 9, color: INK3, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Sentiment</div>
                  </div>
                </div>
              </div>
              {/* Reason */}
              {e.reason && (
                <div style={{ padding: '8px 14px 10px', borderTop: `1px solid ${BORDER}` }}>
                  <p style={{ fontSize: 11, color: INK2, margin: 0, lineHeight: 1.55 }}>{e.reason}</p>
                </div>
              )}
              {/* Progress bars */}
              <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { label: 'Score global', value: e.score, color: e.color },
                  { label: 'Exactitude des infos', value: e.accuracy, color: '#059669' },
                  { label: 'Fréquence citation', value: e.citFreq, color: '#7C3AED' },
                ].map(bar => (
                  <div key={bar.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>{bar.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: INK }}>{bar.value}</span>
                    </div>
                    <div style={{ height: 3, background: SURFACE, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${bar.value}%`, background: bar.color, borderRadius: 2, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Injection Plan ──────────────────────────────────────────────────────────────
function InjectionPlan({ plan, onOpenFix }) {
  const [expanded, setExpanded] = useState(null);
  if (!plan?.length) return null;

  return (
    <Card style={{ marginBottom: 12 }}>
      <Label>Ordonnance d'injection d'entité</Label>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Plan d'action personnalisé</p>
          <p style={{ fontSize: 12, color: INK3, margin: '3px 0 0' }}>{plan.length} leviers pour améliorer votre LRS ce mois</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {plan.map((item, i) => (
          <div key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', background: expanded === i ? SURFACE : WHITE, transition: 'background 0.15s' }}>
            <button onClick={() => setExpanded(expanded === i ? null : i)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: INK, color: WHITE, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{item.action_title}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: item.impact === 'high' ? '#059669' : '#D97706', background: item.impact === 'high' ? '#ECFDF5' : '#FFFBEB', padding: '2px 6px', borderRadius: 4 }}>
                    {item.impact === 'high' ? 'Impact élevé' : 'Impact moyen'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: INK3 }}>
                  <span style={{ background: '#EEF2FF', color: '#4338CA', padding: '1px 6px', borderRadius: 4, fontWeight: 600, marginRight: 5 }}>{item.engine}</span>
                  {item.gap}
                </div>
              </div>
              <ArrowRight size={12} color={INK3} style={{ transform: expanded === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>

            {expanded === i && (
              <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${BORDER}` }}>
                <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 5px' }}>Pourquoi vos concurrents sont cités à votre place</p>
                    <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.competitor_advantage}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 5px' }}>Action concrète</p>
                    <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.action_detail}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: SURFACE, borderRadius: 9, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={12} color={VIOLET} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>Plateforme : {item.platform}</span>
                    </div>
                    <button onClick={() => onOpenFix(item.action_title + ' — ' + item.action_detail, i)}
                      style={{ padding: '7px 14px', background: INK, color: WHITE, border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                      Générer →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Traffic metrics ──────────────────────────────────────────────────────────
function TrafficCard({ d, gscData, navigate }) {
  const hasGsc = gscData?.connected && gscData?.data;

  // Prefer real GSC data when available
  const metrics = hasGsc ? [
    { label: 'Clics (GSC)', value: gscData.data.totalClicks?.toLocaleString('fr') || '–', source: 'gsc' },
    { label: 'Impressions (GSC)', value: gscData.data.totalImpressions?.toLocaleString('fr') || '–', source: 'gsc' },
    { label: 'CTR moyen', value: `${gscData.data.avgCtr}%`, source: 'gsc' },
    { label: 'Position moyenne', value: gscData.data.avgPosition, source: 'gsc' },
  ] : [
    { label: 'Visiteurs / mois', value: fmt(d.organic_traffic), delta: d.organic_traffic_delta_pct },
    { label: 'Mots-clés', value: fmt(d.organic_keywords), delta: d.organic_keywords_delta_pct },
    { label: 'Backlinks', value: fmt(d.backlinks), delta: d.backlinks_delta_pct },
    { label: 'Autorité', value: d.authority_score ? `${d.authority_score}` : '–', delta: null },
  ];

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Label>Performances du site</Label>
        {hasGsc ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669' }} />
            Données GSC réelles
          </div>
        ) : (
          <button onClick={() => navigate('/connections')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: VIOLET, background: '#F5F3FF', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>
            <Link2 size={10} /> Connecter GSC
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: m.source === 'gsc' ? '#F0FDF4' : SURFACE, borderRadius: 10, padding: '13px 14px', border: m.source === 'gsc' ? '1px solid #D1FAE5' : 'none' }}>
            <div style={{ fontSize: 11, color: INK3, fontWeight: 600, marginBottom: 5 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: INK, lineHeight: 1 }}>{m.value}</div>
            {m.delta != null && <div style={{ marginTop: 5 }}><Delta val={m.delta} /></div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Technical signals ─────────────────────────────────────────────────────────
function TechnicalCard({ d }) {
  const items = [
    { label: 'Structure lisible par les IA', value: d.has_schema_markup, tip: 'Les IA comprennent votre contenu' },
    { label: 'Fiche Google My Business', value: d.has_google_business, tip: 'Présent sur Google Maps' },
    { label: 'Site sécurisé HTTPS', value: d.has_ssl, tip: 'Cadenas actif, site de confiance' },
    { label: 'Compatible mobile', value: d.has_mobile_friendly, tip: 'Optimisé pour les téléphones' },
  ];
  return (
    <Card style={{ marginBottom: 12 }}>
      <Label>Signaux techniques</Label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {items.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px',
            background: t.value ? '#F0FDF4' : SURFACE, borderRadius: 10,
            border: `1px solid ${t.value ? '#BBF7D0' : BORDER}`,
          }}>
            {t.value ? <CheckCircle size={15} color="#059669" style={{ flexShrink: 0 }} /> : <XCircle size={15} color="#D1D1D1" style={{ flexShrink: 0 }} />}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: INK }}>{t.label}</div>
              <div style={{ fontSize: 10, color: INK3, marginTop: 1 }}>{t.tip}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Strengths ────────────────────────────────────────────────────────────────
function StrengthsCard({ strengths }) {
  if (!strengths?.length) return null;
  return (
    <Card style={{ marginBottom: 12 }}>
      <Label>Points forts</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {strengths.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: SURFACE, borderRadius: 10 }}>
            <Star size={12} color={VIOLET} fill={VIOLET} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.55 }}>{s}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Keywords ──────────────────────────────────────────────────────────────────
function KeywordsCard({ keywords }) {
  if (!keywords?.length) return null;
  return (
    <Card style={{ marginBottom: 12 }}>
      <Label>Mots-clés organiques principaux</Label>
      <div>
        {keywords.map((kw, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < keywords.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <span style={{ fontSize: 13, color: INK, fontWeight: 500 }}>{kw.keyword}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: kw.position <= 3 ? '#059669' : kw.position <= 10 ? '#D97706' : INK3 }}>#{kw.position}</span>
              <span style={{ fontSize: 11, color: INK3 }}>{fmt(kw.volume)}/mois</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Competitors ──────────────────────────────────────────────────────────────
function CompetitorsCard({ competitors }) {
  if (!competitors?.length) return null;
  return (
    <Card style={{ marginBottom: 12 }}>
      <Label>Concurrents identifiés</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {competitors.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: SURFACE, borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{typeof c === 'string' ? c : c.domain}</div>
              {c.organic_traffic > 0 && <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>{fmt(c.organic_traffic)} visites/mois</div>}
            </div>
            {c.authority_score != null && (
              <div style={{ width: 38, height: 38, borderRadius: '50%', border: `2px solid ${BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: INK }}>{c.authority_score}</div>
                <div style={{ fontSize: 7, color: INK3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>DA</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Geo traffic ──────────────────────────────────────────────────────────────
function GeoCard({ geoTraffic }) {
  if (!geoTraffic?.length) return null;
  return (
    <Card style={{ marginBottom: 12 }}>
      <Label>Trafic par pays</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {geoTraffic.map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {g.country !== 'OTHER'
              ? <img src={`https://flagcdn.com/24x18/${g.country.toLowerCase()}.png`} alt={g.country} width={22} height={16} style={{ borderRadius: 2, flexShrink: 0, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
              : <span style={{ fontSize: 14, width: 22, textAlign: 'center', flexShrink: 0 }}>🌐</span>}
            <span style={{ fontSize: 12, fontWeight: 600, color: INK2, width: 100, flexShrink: 0 }}>{g.country_name || g.country}</span>
            <div style={{ flex: 1, height: 5, background: SURFACE, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${g.pct}%`, background: VIOLET, borderRadius: 3, opacity: 0.7 + i * 0.05 * -1 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: INK, width: 32, textAlign: 'right', flexShrink: 0 }}>{g.pct}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AIVisibilityReport() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [fixCache, setFixCache] = useState({});
  const [gscData, setGscData] = useState(null);

  useEffect(() => {
    const unsub = onActiveDomainChange(() => loadData());
    return unsub;
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      if (!u) { navigate('/'); return; }
      const active = getActiveDomain();
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const matched = active
        ? profiles.find(p => p.site_url === active.url) || profiles[0]
        : profiles[0];

      if (matched) {
        // Parse all stored data — keep flat structure for all fields
        let extra = {};
        try { extra = JSON.parse(matched.brand_keywords || '{}'); } catch {}
        setFixCache(extra.fix_cache || {});
        // Merge: entity fields + extra (extra has lrs_*, chatgpt_*, etc.)
        setData({ ...matched, ...extra });
      }
    } catch {}
    setLoading(false);
  };

  const handleRescan = async () => {
    if (!data?.site_url) return;
    setScanning(true);
    try {
      const res = await base44.functions.invoke('analyzeWebsite', { url: data.site_url });
      if (res?.data && !res.data.error) {
        // Save to profile
        const u = await base44.auth.me();
        if (u) {
          const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id });
          const matched = profiles.find(p => p.site_url === data.site_url) || profiles[0];
          if (matched) {
            const newExtra = { ...res.data };
            await base44.entities.BusinessProfile.update(matched.id, {
              brand_keywords: JSON.stringify(newExtra),
              score_overall: res.data.overall_score || 0,
              score_ai_visibility: res.data.ai_visibility_score || 0,
              score_message_clarity: res.data.message_clarity_score || 0,
              score_commercial_signal: res.data.commercial_presence_score || 0,
              last_scan: new Date().toISOString(),
            });
            setData({ ...matched, ...res.data });
          }
        }
      }
    } catch {}
    setScanning(false);
  };

  useEffect(() => { loadData(); }, []);

  // Try to load real GSC data
  useEffect(() => {
    base44.functions.invoke('getSearchConsoleData', {}).then(res => {
      if (res?.data?.connected) setGscData(res.data);
    }).catch(() => {});
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E0E0E0', borderTopColor: VIOLET, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Chargement…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', fontFamily: F }}>
      <div style={{ fontSize: 48, marginBottom: 4 }}>📡</div>
      <p style={{ fontSize: 17, fontWeight: 800, color: INK, margin: 0 }}>Aucun rapport disponible</p>
      <p style={{ fontSize: 13, color: INK3, margin: 0, maxWidth: 280 }}>Scannez votre site depuis l'accueil pour générer votre rapport IA.</p>
      <button onClick={() => navigate('/app')} style={{ padding: '11px 22px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
        ← Retour à l'accueil
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>
      {/* Header */}
      <div style={{
        background: WHITE, borderBottom: `1px solid ${BORDER}`,
        padding: '12px 20px', paddingTop: 'max(12px, calc(env(safe-area-inset-top) + 10px))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowLeft size={14} color={INK2} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Tableau de bord</h1>
            <p style={{ fontSize: 11, color: INK3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(data.site_url || '').replace(/https?:\/\//, '').split('/')[0]}
            </p>
          </div>
        </div>
        <button onClick={handleRescan} disabled={scanning}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: scanning ? 'wait' : 'pointer', opacity: scanning ? 0.6 : 1 }}>
          <RefreshCw size={11} style={{ animation: scanning ? 'spin 0.8s linear infinite' : 'none' }} />
          {scanning ? 'Analyse…' : 'Re-scanner'}
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 80px' }}>
        <LRSHero d={data} />
        <SubScoresRow d={data} />
        <AIEnginesSection d={data} />
        {data.injection_plan?.length > 0 && (
          <InjectionPlan plan={data.injection_plan} onOpenFix={(txt, idx) => { setSelectedIssue(txt); setSelectedIssueId(`injection_${idx}`); }} />
        )}
        <TrafficCard d={data} gscData={gscData} navigate={navigate} />
        <TechnicalCard d={data} />
        <GeoCard geoTraffic={data.geo_traffic} />
        <StrengthsCard strengths={data.strengths} />
        <KeywordsCard keywords={data.top_keywords} />
        <CompetitorsCard competitors={data.competitors} />
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {selectedIssue && (
        <FixInstructionModal
          issue={selectedIssue}
          issueId={selectedIssueId}
          profile={data}
          cachedFix={fixCache[selectedIssueId] || null}
          onClose={() => { setSelectedIssue(null); setSelectedIssueId(null); }}
          onFixSaved={(id, fix) => setFixCache(prev => ({ ...prev, [id]: fix }))}
        />
      )}
    </div>
  );
}