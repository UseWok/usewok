import { useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowRight, RotateCcw } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#555554';
const INK3 = '#999997';
const BORDER = '#E8E8E6';
const SURFACE = '#F7F6F4';
const WHITE = '#FFFFFF';

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function ScoreCircle({ value, size = 80 }) {
  const R = size / 2 - 6;
  const circ = 2 * Math.PI * R;
  const pct = Math.min(value / 100, 1);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="#E8E8E6" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={INK} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.04em' }}>{value}</span>
        <span style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>/100</span>
      </div>
    </div>
  );
}

export default function SemrushDashboard({ data, url, onRescan }) {
  const navigate = useNavigate();
  const domain = (url || '').replace(/https?:\/\//, '').split('/')[0];
  const score = Math.round(data.lrs_score || data.overall_score || 0);

  const subScores = [
    { label: 'Présence IA', value: Math.round(data.ai_visibility_score || 0) },
    { label: 'Clarté', value: Math.round(data.message_clarity_score || 0) },
    { label: 'Signaux vente', value: Math.round(data.commercial_presence_score || 0) },
  ];

  const technical = [
    { label: 'Compris par les IA', ok: data.has_schema_markup },
    { label: 'Fiche Google', ok: data.has_google_business },
    { label: 'Site sécurisé', ok: data.has_ssl !== false },
    { label: 'Compatible mobile', ok: data.has_mobile_friendly !== false },
  ];

  const plan = data.injection_plan || [];
  const competitors = (data.competitors || []).filter(c => typeof c === 'object' && c.domain && c.domain !== domain);

  return (
    <div style={{ fontFamily: F }}>

      {/* Score principal */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '20px', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <ScoreCircle value={score} size={80} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Score de visibilité</p>
            <p style={{ fontSize: 17, fontWeight: 900, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {data.business_name || domain}
            </p>
            <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: INK3, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {domain} <ExternalLink size={9} />
            </a>
          </div>
        </div>

        {/* Sub scores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {subScores.map(s => (
            <div key={s.label} style={{ background: SURFACE, borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: INK, lineHeight: 1 }}>{s.value}</div>
              <div style={{ height: 2, background: '#E8E8E6', borderRadius: 1, margin: '6px 0 4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.value}%`, background: INK, borderRadius: 1, opacity: 0.5, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {data.shock_insight && (
          <p style={{ fontSize: 12, color: INK3, margin: '14px 0 0', lineHeight: 1.65, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>{data.shock_insight}</p>
        )}
      </div>

      {/* Signaux techniques */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
        {technical.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: i < technical.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.ok ? '#10B981' : '#EF4444', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: t.ok ? INK2 : INK, flex: 1 }}>{t.label}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: t.ok ? '#059669' : '#EF4444' }}>{t.ok ? '✓' : '✗'}</span>
          </div>
        ))}
      </div>

      {/* Plan d'action — aperçu */}
      {plan.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Plan d'amélioration</p>
            <button onClick={() => navigate('/ai-report')} style={{ fontSize: 11, fontWeight: 600, color: INK2, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: F }}>
              Tout voir <ArrowRight size={11} />
            </button>
          </div>
          {plan.slice(0, 3).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 16px', borderBottom: i < Math.min(plan.length, 3) - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: INK3 }}>{i+1}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: INK, margin: '0 0 2px' }}>{item.action_title}</p>
                <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{item.platform} · {item.effort === 'low' ? 'Rapide' : item.effort === 'medium' ? 'Moyen' : 'Long'}</p>
              </div>
              {item.impact === 'high' && (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#F0FDF4', padding: '2px 6px', borderRadius: 20, flexShrink: 0, alignSelf: 'center' }}>Fort</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Concurrents */}
      {competitors.length > 0 && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>Concurrents</p>
          {competitors.slice(0, 3).map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: i < competitors.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: INK }}>{c.domain}</div>
                {c.organic_traffic > 0 && <div style={{ fontSize: 10, color: INK3, marginTop: 1 }}>{fmt(c.organic_traffic)} visiteurs/mois</div>}
              </div>
              {c.authority_score != null && (
                <div style={{ padding: '4px 9px', background: SURFACE, borderRadius: 7, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: INK }}>{c.authority_score}</div>
                  <div style={{ fontSize: 8, color: INK3, textTransform: 'uppercase' }}>score</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => navigate('/ai-report')}
          style={{ flex: 1, padding: '12px', background: INK, color: WHITE, border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          Rapport complet <ArrowRight size={13} />
        </button>
        <button onClick={onRescan}
          style={{ padding: '12px 16px', background: WHITE, color: INK2, border: `1px solid ${BORDER}`, borderRadius: 11, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={12} /> Autre site
        </button>
      </div>

    </div>
  );
}