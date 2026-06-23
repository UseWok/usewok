import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, Link2, Globe, ExternalLink, Zap, ChevronDown, ArrowRight } from 'lucide-react';
import FixInstructionModal from '@/components/report/FixInstructionModal';
import EnginesComparisonView from '@/components/report/EnginesComparisonView';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const SURFACE = '#F7F7F5';
const WHITE = '#FFFFFF';

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const TABS = [
  { key: 'overview', label: 'Vue globale' },
  { key: 'engines',  label: 'Moteurs IA' },
  { key: 'actions',  label: 'Plan d\'action' },
  { key: 'data',     label: 'Données' },
];

// ── Reusable section header ───────────────────────────────────────────────────
function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, color: INK, margin: '0 0 2px', letterSpacing: '-0.02em' }}>{title}</h2>
      {sub && <p style={{ fontSize: 12, color: INK3, margin: 0 }}>{sub}</p>}
    </div>
  );
}

// ── LRS Hero ─────────────────────────────────────────────────────────────────
function LRSHero({ d, onScan, scanning }) {
  const lrs = Math.round(d.lrs_score || 0);
  const citation = Math.round(d.lrs_citation_score || 0);
  const sentiment = Math.round(d.lrs_sentiment_score || 0);
  const accuracy = Math.round(d.lrs_accuracy_score || 0);
  const trend = d.lrs_trend || 'stable';
  const vsIndustry = d.lrs_vs_industry;
  const c = lrs >= 65 ? '#10B981' : lrs >= 35 ? '#F59E0B' : '#EF4444';
  const R = 54, cx = 68, cy = 68, circ = 2 * Math.PI * R;

  const hasData = lrs > 0;

  return (
    <div style={{ background: INK, borderRadius: 20, padding: '24px', marginBottom: 16, position: 'relative', overflow: 'hidden', fontFamily: F }}>
      <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${c}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>LLM Resonance Score™</span>
          <a href={d.site_url || '#'} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            <Globe size={10} />
            {(d.site_url || '').replace(/https?:\/\//, '').split('/')[0]}
            <ExternalLink size={9} />
          </a>
        </div>

        {!hasData ? (
          /* Empty state — score is 0, prompt to scan */
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: 'rgba(255,255,255,0.15)', letterSpacing: '-0.06em', lineHeight: 1, marginBottom: 12 }}>–</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 18px', lineHeight: 1.6 }}>
              Votre score LRS n'a pas encore été calculé.<br />Lancez l'analyse pour voir votre visibilité IA.
            </p>
            <button onClick={onScan} disabled={scanning}
              style={{ padding: '12px 24px', background: WHITE, color: INK, border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: scanning ? 'wait' : 'pointer', fontFamily: F, opacity: scanning ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              {scanning ? <><RefreshCw size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Analyse en cours…</> : <>Analyser maintenant <ArrowRight size={13} /></>}
            </button>
          </div>
        ) : (
          /* Score display */
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Gauge */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width={136} height={136} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={9} />
                <circle cx={cx} cy={cy} r={R} fill="none" stroke={c} strokeWidth={9}
                  strokeDasharray={circ} strokeDashoffset={circ * (1 - lrs / 100)}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.05em' }}>{lrs}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>/100</div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: WHITE, marginBottom: 4, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.identity_name || (d.site_url || '').replace(/https?:\/\//, '').split('/')[0]}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: trend === 'rising' ? '#10B981' : trend === 'declining' ? '#EF4444' : 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {trend === 'rising' ? <TrendingUp size={11} /> : trend === 'declining' ? <TrendingDown size={11} /> : <Minus size={11} />}
                  {trend === 'rising' ? 'En hausse' : trend === 'declining' ? 'En baisse' : 'Stable'}
                </span>
                {vsIndustry != null && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{vsIndustry >= 0 ? `+${vsIndustry}` : vsIndustry} pts vs secteur</span>}
              </div>
              {/* 3 pillars */}
              {[{ l: 'Citation', v: citation, w: '40%' }, { l: 'Sentiment', v: sentiment, w: '30%' }, { l: 'Exactitude', v: accuracy, w: '30%' }].map(s => (
                <div key={s.l} style={{ marginBottom: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{s.l} ({s.w})</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: WHITE }}>{s.v}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.v}%`, background: c, borderRadius: 2, transition: 'width 1.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasData && d.shock_insight && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', margin: '16px 0 0', lineHeight: 1.65, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
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
    { label: 'Visibilité IA', value: Math.round(d.ai_visibility_score || d.score_ai_visibility || 0), desc: 'Présence dans les réponses IA' },
    { label: 'Clarté', value: Math.round(d.message_clarity_score || d.score_message_clarity || 0), desc: 'Message compris par les IA' },
    { label: 'Commercial', value: Math.round(d.commercial_presence_score || d.score_commercial_signal || 0), desc: 'Signal d\'achat détecté' },
    { label: 'Global', value: Math.round(d.overall_score || d.score_overall || 0), desc: 'Score consolidé' },
  ];

  const hasNoData = scores.every(s => s.value === 0);

  if (hasNoData) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
        <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Pas encore de données</p>
        <p style={{ fontSize: 13, color: INK3, margin: '0 0 20px', maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
          Lancez un scan depuis l'en-tête pour obtenir votre rapport complet sur les 8 moteurs IA.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 4 key scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        {scores.map(s => {
          const c = s.value >= 65 ? '#10B981' : s.value >= 35 ? '#F59E0B' : '#EF4444';
          return (
            <div key={s.label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: INK, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
              <div style={{ height: 3, background: SURFACE, borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${s.value}%`, background: c, borderRadius: 2, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: INK3 }}>{s.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Issues */}
      {d.issues?.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 1px' }}>Points bloquants détectés</p>
              <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{d.issues.length} problèmes à résoudre pour booster votre LRS</p>
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#EF4444' }}>{d.issues.length}</span>
          </div>
          {d.issues.map((issue, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 18px', borderBottom: i < d.issues.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: issue.severity === 'error' ? '#EF4444' : '#F59E0B', marginTop: 6, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{issue.problem}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <button onClick={() => onTabChange('actions')}
        style={{ width: '100%', padding: '15px', background: INK, color: WHITE, border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '-0.01em' }}>
        <Zap size={14} fill={WHITE} stroke={WHITE} /> Voir mon plan d'action
      </button>
    </div>
  );
}

// ── Action Plan tab ───────────────────────────────────────────────────────────
function ActionsTab({ plan, onGenerate }) {
  const [expanded, setExpanded] = useState(0);
  const [done, setDone] = useState({});

  if (!plan?.length) return (
    <div style={{ textAlign: 'center', padding: '48px 20px', fontFamily: F }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
      <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Plan d'action non disponible</p>
      <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Lancez un scan pour obtenir votre plan personnalisé.</p>
    </div>
  );

  const remaining = plan.filter((_, i) => !done[i]).length;

  return (
    <div>
      {/* Progress */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Votre plan d'injection d'entité</p>
          <span style={{ fontSize: 12, fontWeight: 800, color: INK }}>{plan.length - remaining}/{plan.length}</span>
        </div>
        <div style={{ height: 5, background: SURFACE, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((plan.length - remaining) / plan.length) * 100}%`, background: INK, borderRadius: 3, transition: 'width 0.5s ease' }} />
        </div>
        <p style={{ fontSize: 11, color: INK3, margin: '8px 0 0' }}>{remaining} action{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} · Chaque action augmente votre LRS</p>
      </div>

      {plan.map((item, i) => {
        const isOpen = expanded === i;
        const isDone = done[i];
        const isHigh = item.impact === 'high';

        return (
          <div key={i} style={{ background: WHITE, border: `1px solid ${isDone ? '#D1FAE5' : BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 8, opacity: isDone ? 0.65 : 1 }}>
            <button onClick={() => setExpanded(isOpen ? null : i)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F }}>
              {/* Check circle */}
              <div onClick={e => { e.stopPropagation(); setDone(prev => ({ ...prev, [i]: !prev[i] })); }}
                style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, border: `2px solid ${isDone ? '#10B981' : BORDER}`, background: isDone ? '#ECFDF5' : WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {isDone && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {!isDone && <span style={{ fontSize: 10, fontWeight: 800, color: INK3 }}>{i + 1}</span>}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{item.action_title}</span>
                  {isHigh && <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: 20, flexShrink: 0 }}>Impact élevé</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#4338CA', background: '#EEF2FF', padding: '1px 6px', borderRadius: 4 }}>{item.engine}</span>
                  {item.platform && <span style={{ fontSize: 10, color: INK3 }}>→ {item.platform}</span>}
                </div>
              </div>
              <ChevronDown size={14} color={INK3} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>

            {isOpen && (
              <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Lacune identifiée</p>
                  <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '10px 12px', border: '1px solid #FEF3C7' }}>
                    <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.6 }}>{item.gap}</p>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Pourquoi vos concurrents vous dépassent</p>
                  <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.6 }}>{item.competitor_advantage}</p>
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Action à faire maintenant</p>
                  <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.6 }}>{item.action_detail}</p>
                </div>
                <button onClick={() => onGenerate(item.action_title + ' — ' + item.action_detail, i)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px', background: INK, color: WHITE, border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                  <Zap size={13} fill={WHITE} stroke={WHITE} />
                  Générer le contenu d'injection
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Data tab ──────────────────────────────────────────────────────────────────
function DataTab({ d, gscData, navigate }) {
  const hasGsc = gscData?.connected && gscData?.data;

  const traffic = hasGsc ? [
    { label: 'Clics GSC', value: gscData.data.totalClicks?.toLocaleString('fr') || '–', real: true },
    { label: 'Impressions', value: gscData.data.totalImpressions?.toLocaleString('fr') || '–', real: true },
    { label: 'CTR moyen', value: `${gscData.data.avgCtr}%`, real: true },
    { label: 'Position moy.', value: String(gscData.data.avgPosition), real: true },
  ] : [
    { label: 'Visiteurs / mois', value: fmt(d.organic_traffic) },
    { label: 'Mots-clés indexés', value: fmt(d.organic_keywords) },
    { label: 'Backlinks', value: fmt(d.backlinks) },
    { label: 'Autorité du domaine', value: d.authority_score ? `${d.authority_score}` : '–' },
  ];

  const technical = [
    { label: 'Structure IA-lisible (Schema)', ok: d.has_schema_markup, fix: 'Les IA ne comprennent pas votre contenu' },
    { label: 'Fiche Google My Business', ok: d.has_google_business, fix: 'Introuvable sur Google Maps' },
    { label: 'HTTPS / Sécurité', ok: d.has_ssl, fix: 'Site non sécurisé — pénalité IA' },
    { label: 'Compatible mobile', ok: d.has_mobile_friendly, fix: 'Non optimisé smartphone' },
  ];

  return (
    <div>
      {/* Traffic */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Trafic organique</p>
          {hasGsc
            ? <span style={{ fontSize: 9, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} /> Données GSC réelles</span>
            : <button onClick={() => navigate('/connections')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#4338CA', background: '#EEF2FF', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: F }}><Link2 size={10} /> Connecter GSC</button>
          }
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {traffic.map((m, i) => (
            <div key={i} style={{ padding: '14px 18px', borderBottom: i < 2 ? `1px solid ${BORDER}` : 'none', borderRight: i % 2 === 0 ? `1px solid ${BORDER}` : 'none', background: m.real ? '#F0FDF4' : WHITE }}>
              <div style={{ fontSize: 10, color: INK3, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: INK, letterSpacing: '-0.03em', lineHeight: 1 }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical signals */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>Signaux techniques IA</p>
        {technical.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < technical.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            {t.ok ? <CheckCircle size={17} color="#10B981" style={{ flexShrink: 0 }} /> : <XCircle size={17} color="#EF4444" style={{ flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{t.label}</div>
              {!t.ok && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 1 }}>{t.fix}</div>}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: t.ok ? '#10B981' : '#EF4444' }}>{t.ok ? '✓ OK' : '✗ Manquant'}</span>
          </div>
        ))}
      </div>

      {/* Geo */}
      {d.geo_traffic?.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>Trafic par pays</p>
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.geo_traffic.map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {g.country !== 'OTHER'
                  ? <img src={`https://flagcdn.com/24x18/${g.country.toLowerCase()}.png`} alt="" width={22} height={16} style={{ borderRadius: 2, flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                  : <span style={{ width: 22, textAlign: 'center', flexShrink: 0 }}>🌐</span>}
                <span style={{ fontSize: 12, fontWeight: 600, color: INK2, width: 100, flexShrink: 0 }}>{g.country_name || g.country}</span>
                <div style={{ flex: 1, height: 4, background: SURFACE, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${g.pct}%`, background: INK, opacity: 0.2 + (g.pct / 100) * 0.7, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: INK, width: 32, textAlign: 'right', flexShrink: 0 }}>{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {d.top_keywords?.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>Mots-clés organiques</p>
          {d.top_keywords.map((kw, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', borderBottom: i < d.top_keywords.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <span style={{ fontSize: 13, color: INK }}>{kw.keyword}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: kw.position <= 3 ? '#10B981' : kw.position <= 10 ? '#F59E0B' : INK3 }}>#{kw.position}</span>
                <span style={{ fontSize: 11, color: INK3 }}>{fmt(kw.volume)}/mois</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Competitors */}
      {d.competitors?.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>Concurrents détectés</p>
          {d.competitors.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: i < d.competitors.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{typeof c === 'string' ? c : c.domain}</div>
                {c.organic_traffic > 0 && <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>{fmt(c.organic_traffic)} visites/mois</div>}
              </div>
              {c.authority_score != null && (
                <div style={{ padding: '5px 10px', background: SURFACE, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: INK }}>{c.authority_score}</div>
                  <div style={{ fontSize: 8, color: INK3, textTransform: 'uppercase' }}>DA</div>
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
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E8E8E8', borderTopColor: INK, animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Chargement…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center', fontFamily: F }}>
      <div style={{ fontSize: 52 }}>📡</div>
      <p style={{ fontSize: 18, fontWeight: 800, color: INK, margin: 0 }}>Aucun rapport disponible</p>
      <p style={{ fontSize: 13, color: INK3, margin: 0, maxWidth: 280 }}>Scannez votre site depuis l'accueil pour obtenir votre rapport IA.</p>
      <button onClick={() => navigate('/app')} style={{ padding: '12px 24px', background: INK, color: WHITE, border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
        ← Retour à l'accueil
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>
      {/* ── Sticky header ── */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 20, paddingTop: 'max(0px, env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/app')} style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowLeft size={14} color={INK2} />
            </button>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Rapport IA</p>
              <p style={{ fontSize: 11, color: INK3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                {(data.site_url || '').replace(/https?:\/\//, '').split('/')[0]}
              </p>
            </div>
          </div>
          <button onClick={handleRescan} disabled={scanning}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: `1px solid ${BORDER}`, borderRadius: 9, background: scanning ? INK : WHITE, fontSize: 11, fontWeight: 600, color: scanning ? WHITE : INK2, cursor: scanning ? 'wait' : 'pointer', opacity: scanning ? 0.8 : 1, fontFamily: F, transition: 'all 0.2s' }}>
            <RefreshCw size={11} style={{ animation: scanning ? 'spin 0.8s linear infinite' : 'none' }} />
            {scanning ? 'Analyse…' : 'Re-scanner'}
          </button>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', padding: '10px 18px 0', gap: 0, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F,
              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', color: tab === t.key ? INK : INK3,
              borderBottom: `2px solid ${tab === t.key ? INK : 'transparent'}`,
              transition: 'all 0.15s', marginBottom: -1,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 16px 80px' }}>
        <LRSHero d={data} onScan={handleRescan} scanning={scanning} />

        {tab === 'overview' && <OverviewTab d={data} onTabChange={setTab} />}
        {tab === 'engines' && <EnginesComparisonView d={data} />}
        {tab === 'actions' && (
          <ActionsTab
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