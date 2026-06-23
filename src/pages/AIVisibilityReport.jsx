import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Minus,
  CheckCircle, XCircle, Star, Link2, Globe, ExternalLink
} from 'lucide-react';
import FixInstructionModal from '@/components/report/FixInstructionModal';
import EnginesComparisonView from '@/components/report/EnginesComparisonView';
import ActionPlanView from '@/components/report/ActionPlanView';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EFEFEF';
const SURFACE = '#F9F8F6';
const WHITE = '#FFFFFF';

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Delta({ val }) {
  if (val == null) return null;
  const up = val > 0, neutral = val === 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700,
      color: neutral ? INK3 : up ? '#059669' : '#DC2626',
      background: neutral ? SURFACE : up ? '#ECFDF5' : '#FEF2F2',
      padding: '2px 7px', borderRadius: 20, fontFamily: F,
    }}>
      {neutral ? <Minus size={9} /> : up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {!neutral && (up ? '+' : '')}{typeof val === 'number' ? val.toFixed(1) : val}%
    </span>
  );
}

// ── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',  label: 'Vue globale' },
  { key: 'engines',   label: 'Moteurs IA' },
  { key: 'actions',   label: 'Plan d\'action' },
  { key: 'data',      label: 'Données' },
];

// ── LRS Hero ──────────────────────────────────────────────────────────────────
function LRSHero({ d }) {
  const lrs = Math.round(d.lrs_score || 0);
  const citation = Math.round(d.lrs_citation_score || 0);
  const sentiment = Math.round(d.lrs_sentiment_score || 0);
  const accuracy = Math.round(d.lrs_accuracy_score || 0);
  const trend = d.lrs_trend || 'stable';
  const vsIndustry = d.lrs_vs_industry;
  const scoreColor = lrs >= 65 ? '#34D399' : lrs >= 35 ? '#FBBF24' : '#F87171';
  const R = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * R;

  return (
    <div style={{
      background: INK, borderRadius: 18, padding: '24px',
      marginBottom: 12, fontFamily: F, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${scoreColor}1A 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        {/* Badge + domain */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.07)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: scoreColor, boxShadow: `0 0 6px ${scoreColor}` }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>LLM Resonance Score™</span>
          </div>
          <a href={d.site_url || '#'} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            <Globe size={10} />
            {(d.site_url || '').replace(/https?:\/\//, '').split('/')[0]}
            <ExternalLink size={9} />
          </a>
        </div>

        {/* Score + sub-bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          {/* Gauge */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={9} />
              <circle cx={cx} cy={cy} r={R} fill="none" stroke={scoreColor} strokeWidth={9}
                strokeDasharray={circ} strokeDashoffset={circ * (1 - lrs / 100)}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.04em' }}>{lrs}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>/100</div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: WHITE, marginBottom: 4, letterSpacing: '-0.02em' }}>
              {d.identity_name || (d.site_url || '').replace(/https?:\/\//, '').split('/')[0]}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: trend === 'rising' ? '#34D399' : trend === 'declining' ? '#F87171' : 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {trend === 'rising' ? <TrendingUp size={11} /> : trend === 'declining' ? <TrendingDown size={11} /> : <Minus size={11} />}
                {trend === 'rising' ? 'En hausse' : trend === 'declining' ? 'En baisse' : 'Stable'}
              </span>
              {vsIndustry != null && (
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{vsIndustry >= 0 ? `+${vsIndustry}` : vsIndustry} pts vs secteur</span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[{ label: 'Citation', v: citation, w: '40%' }, { label: 'Sentiment', v: sentiment, w: '30%' }, { label: 'Exactitude', v: accuracy, w: '30%' }].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{s.label} <span style={{ opacity: 0.5 }}>({s.w})</span></span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: WHITE }}>{s.v}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.v}%`, background: scoreColor, borderRadius: 2, transition: 'width 1.4s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {d.shock_insight && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '16px 0 0', lineHeight: 1.65, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
            {d.shock_insight}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ d, onTabChange }) {
  const scores = [
    { label: 'Visibilité IA', value: Math.round(d.ai_visibility_score || d.score_ai_visibility || 0) },
    { label: 'Clarté', value: Math.round(d.message_clarity_score || d.score_message_clarity || 0) },
    { label: 'Commercial', value: Math.round(d.commercial_presence_score || d.score_commercial_signal || 0) },
    { label: 'Global', value: Math.round(d.overall_score || d.score_overall || 0) },
  ];

  return (
    <div>
      {/* Sub-scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {scores.map(s => {
          const c = s.value >= 65 ? '#059669' : s.value >= 35 ? '#D97706' : '#DC2626';
          return (
            <div key={s.label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 13, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ height: 2, background: SURFACE, borderRadius: 1, margin: '8px 0 5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.value}%`, background: c, borderRadius: 1, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 9, color: INK3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Issues */}
      {d.issues?.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: INK, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Problèmes détectés</p>
            <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{d.issues.length} points à corriger pour améliorer votre LRS</p>
          </div>
          {d.issues.map((issue, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 16px',
              borderBottom: i < d.issues.length - 1 ? `1px solid ${BORDER}` : 'none',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: issue.severity === 'error' ? '#DC2626' : '#D97706', marginTop: 5, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.6 }}>{issue.problem}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick CTA */}
      <button onClick={() => onTabChange('actions')}
        style={{
          width: '100%', padding: '14px', background: INK, color: WHITE, border: 'none',
          borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '-0.01em',
        }}>
        Voir mon plan d'action →
      </button>
    </div>
  );
}

// ── Data tab ──────────────────────────────────────────────────────────────────
function DataTab({ d, gscData, navigate }) {
  const hasGsc = gscData?.connected && gscData?.data;

  const traffic = hasGsc ? [
    { label: 'Clics (GSC)', value: gscData.data.totalClicks?.toLocaleString('fr') || '–', real: true },
    { label: 'Impressions', value: gscData.data.totalImpressions?.toLocaleString('fr') || '–', real: true },
    { label: 'CTR moyen', value: `${gscData.data.avgCtr}%`, real: true },
    { label: 'Position moy.', value: gscData.data.avgPosition, real: true },
  ] : [
    { label: 'Visiteurs / mois', value: fmt(d.organic_traffic), delta: d.organic_traffic_delta_pct },
    { label: 'Mots-clés', value: fmt(d.organic_keywords), delta: d.organic_keywords_delta_pct },
    { label: 'Backlinks', value: fmt(d.backlinks), delta: d.backlinks_delta_pct },
    { label: 'Autorité', value: d.authority_score ? `${d.authority_score}` : '–' },
  ];

  const technical = [
    { label: 'Structure lisible par les IA', value: d.has_schema_markup, tip: 'Les IA comprennent votre contenu' },
    { label: 'Fiche Google My Business', value: d.has_google_business, tip: 'Présent sur Google Maps' },
    { label: 'Site sécurisé HTTPS', value: d.has_ssl, tip: 'Connexion chiffrée, site de confiance' },
    { label: 'Compatible mobile', value: d.has_mobile_friendly, tip: 'Optimisé pour les smartphones' },
  ];

  return (
    <div>
      {/* Traffic section */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${BORDER}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: INK, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Trafic & performance</p>
          {hasGsc ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669' }} /> Données GSC réelles
            </span>
          ) : (
            <button onClick={() => navigate('/connections')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#4338CA', background: '#EEF2FF', border: 'none', borderRadius: 6, padding: '4px 9px', cursor: 'pointer', fontFamily: F }}>
              <Link2 size={10} /> Connecter GSC
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0 }}>
          {traffic.map((m, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              borderBottom: i < 2 ? `1px solid ${BORDER}` : 'none',
              borderRight: i % 2 === 0 ? `1px solid ${BORDER}` : 'none',
              background: m.real ? '#FAFFF9' : WHITE,
            }}>
              <div style={{ fontSize: 10, color: INK3, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: INK, lineHeight: 1 }}>{m.value}</div>
              {m.delta != null && <div style={{ marginTop: 5 }}><Delta val={m.delta} /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Technical */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: INK, margin: 0, padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Signaux techniques</p>
        {technical.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
            borderBottom: i < technical.length - 1 ? `1px solid ${BORDER}` : 'none',
          }}>
            {t.value
              ? <CheckCircle size={16} color="#059669" style={{ flexShrink: 0 }} />
              : <XCircle size={16} color="#D1D1D1" style={{ flexShrink: 0 }} />}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{t.label}</div>
              <div style={{ fontSize: 11, color: INK3, marginTop: 1 }}>{t.tip}</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: t.value ? '#059669' : INK3 }}>
              {t.value ? 'OK' : 'À corriger'}
            </span>
          </div>
        ))}
      </div>

      {/* Strengths */}
      {d.strengths?.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: INK, margin: 0, padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Points forts</p>
          {d.strengths.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: i < d.strengths.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <Star size={12} color={INK} fill={INK} style={{ flexShrink: 0, marginTop: 3 }} />
              <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.55 }}>{s}</p>
            </div>
          ))}
        </div>
      )}

      {/* Geo */}
      {d.geo_traffic?.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: INK, margin: 0, padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Trafic par pays</p>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.geo_traffic.map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {g.country !== 'OTHER'
                  ? <img src={`https://flagcdn.com/24x18/${g.country.toLowerCase()}.png`} alt="" width={22} height={16} style={{ borderRadius: 2, flexShrink: 0, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                  : <span style={{ fontSize: 13, width: 22, textAlign: 'center', flexShrink: 0 }}>🌐</span>}
                <span style={{ fontSize: 12, fontWeight: 600, color: INK2, width: 100, flexShrink: 0 }}>{g.country_name || g.country}</span>
                <div style={{ flex: 1, height: 4, background: SURFACE, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${g.pct}%`, background: INK, borderRadius: 2, opacity: 0.15 + (g.pct / 100) * 0.7 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: INK, width: 32, textAlign: 'right', flexShrink: 0 }}>{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {d.top_keywords?.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: INK, margin: 0, padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mots-clés principaux</p>
          {d.top_keywords.map((kw, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: i < d.top_keywords.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <span style={{ fontSize: 13, color: INK, fontWeight: 500 }}>{kw.keyword}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: kw.position <= 3 ? '#059669' : kw.position <= 10 ? '#D97706' : INK3 }}>#{kw.position}</span>
                <span style={{ fontSize: 11, color: INK3 }}>{fmt(kw.volume)}/mois</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Competitors */}
      {d.competitors?.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: INK, margin: 0, padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Concurrents identifiés</p>
          {d.competitors.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < d.competitors.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{typeof c === 'string' ? c : c.domain}</div>
                {c.organic_traffic > 0 && <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>{fmt(c.organic_traffic)} visites/mois</div>}
              </div>
              {c.authority_score != null && (
                <div style={{ padding: '4px 10px', background: SURFACE, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: INK }}>{c.authority_score}</div>
                  <div style={{ fontSize: 8, color: INK3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DA</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AIVisibilityReport() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
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
      const matched = active ? profiles.find(p => p.site_url === active.url) || profiles[0] : profiles[0];
      if (matched) {
        let extra = {};
        try { extra = JSON.parse(matched.brand_keywords || '{}'); } catch {}
        setFixCache(extra.fix_cache || {});
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
        const u = await base44.auth.me();
        if (u) {
          const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id });
          const matched = profiles.find(p => p.site_url === data.site_url) || profiles[0];
          if (matched) {
            await base44.entities.BusinessProfile.update(matched.id, {
              brand_keywords: JSON.stringify(res.data),
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

  useEffect(() => {
    base44.functions.invoke('getSearchConsoleData', {}).then(res => {
      if (res?.data?.connected) setGscData(res.data);
    }).catch(() => {});
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E0E0E0', borderTopColor: INK, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Chargement du rapport…</p>
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
      {/* ── Header ── */}
      <div style={{
        background: WHITE, borderBottom: `1px solid ${BORDER}`,
        padding: '12px 20px',
        paddingTop: 'max(12px, calc(env(safe-area-inset-top) + 10px))',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={14} color={INK2} />
            </button>
            <div>
              <h1 style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Rapport IA</h1>
              <p style={{ fontSize: 11, color: INK3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                {(data.site_url || '').replace(/https?:\/\//, '').split('/')[0]}
              </p>
            </div>
          </div>
          <button onClick={handleRescan} disabled={scanning}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: scanning ? 'wait' : 'pointer', opacity: scanning ? 0.6 : 1, fontFamily: F }}>
            <RefreshCw size={11} style={{ animation: scanning ? 'spin 0.8s linear infinite' : 'none' }} />
            {scanning ? 'Analyse…' : 'Re-scanner'}
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 1 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: F,
              fontSize: 12, fontWeight: tab === t.key ? 700 : 500, whiteSpace: 'nowrap',
              background: tab === t.key ? INK : 'transparent',
              color: tab === t.key ? WHITE : INK3,
              transition: 'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 80px' }}>
        <LRSHero d={data} />

        {tab === 'overview' && <OverviewTab d={data} onTabChange={setTab} />}
        {tab === 'engines' && <EnginesComparisonView d={data} />}
        {tab === 'actions' && (
          <ActionPlanView
            plan={data.injection_plan}
            onGenerate={(txt, idx) => { setSelectedIssue(txt); setSelectedIssueId(`injection_${idx}`); }}
          />
        )}
        {tab === 'data' && <DataTab d={data} gscData={gscData} navigate={navigate} />}
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