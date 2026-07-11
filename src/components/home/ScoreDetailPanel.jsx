import { Globe, Languages, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const F = '"Wix Madefor Text", "Wix Madefor Display", system-ui, sans-serif';
const WHITE = '#FFFFFF';
const INK = '#15130F';
const INK2 = 'rgba(255,255,255,0.55)';
const INK3 = 'rgba(255,255,255,0.35)';
const CORAL = '#FF5A1F';
const GREEN = '#22A87A';
const AMBER = '#D97706';
const RED = '#F0533A';
const CARD_BG = '#15130F';

function tone(score) {
  if (score >= 60) return GREEN;
  if (score >= 30) return AMBER;
  return RED;
}

/**
 * Full detail panel — uses ONLY existing overview data, zero AI calls.
 * Shows: score breakdown, evolution chart, zones, languages, cited pages,
 * and a "why this score" explanation derived from the data.
 */
export default function ScoreDetailPanel({ overview, pillars }) {
  const sb = overview?.score_breakdown || {};
  const evolution = overview?.evolution || [];
  const zones = (overview?.zones || []).slice(0, 5);
  const languages = (overview?.languages || []).slice(0, 5);
  const citedPages = (overview?.cited_pages || []).slice(0, 5);
  const llms = overview?.llms_citing || [];
  const competitors = overview?.competitors || [];

  // ── Build "why this score" from real data ──
  const reasons = [];
  const youEntry = competitors.find(c => c.is_you);
  const yourPct = youEntry?.visibility_pct ?? 0;
  const citedCount = llms.filter(l => (l.citations || 0) > 0).length;
  const totalEngines = llms.length;

  if (yourPct < 30) reasons.push(`Tu n'apparais que dans ${Math.round(yourPct)}% des réponses IA testées.`);
  else if (yourPct < 60) reasons.push(`Tu apparais dans ${Math.round(yourPct)}% des réponses — il y a de la marge.`);
  else reasons.push(`Bonne présence: ${Math.round(yourPct)}% des réponses te citent.`);

  if (citedCount === 0) reasons.push(`Aucune IA ne te cite spontanément sur les ${totalEngines} moteurs testés.`);
  else if (citedCount < totalEngines / 2) reasons.push(`Seulement ${citedCount}/${totalEngines} moteurs IA te citent.`);
  else reasons.push(`${citedCount}/${totalEngines} moteurs IA te citent.`);

  if (citedPages.length === 0) reasons.push(`Aucune page de ton site n'est citée comme source par les IA.`);
  else reasons.push(`${citedPages.length} page(s) de ton site servent de source aux IA.`);

  // Score breakdown bars
  const breakdownBars = [
    { label: 'Narrative', value: sb.narrative ?? 0, max: Math.max(10, sb.narrative || 0, sb.authority || 0, sb.referral || 0), color: CORAL },
    { label: 'Authority', value: sb.authority ?? 0, max: Math.max(10, sb.narrative || 0, sb.authority || 0, sb.referral || 0), color: '#7C3AED' },
    { label: 'Referral', value: sb.referral ?? 0, max: Math.max(10, sb.narrative || 0, sb.authority || 0, sb.referral || 0), color: '#3B8BEB' },
  ];
  const pctBars = [
    { label: 'Brand', value: sb.brand_pct ?? 0, color: CORAL },
    { label: 'Website', value: sb.website_pct ?? 0, color: '#7C3AED' },
    { label: 'Earned', value: sb.earned_pct ?? 0, color: '#3B8BEB' },
  ];

  // Evolution mini-chart
  const evMax = Math.max(10, ...evolution.map(e => e.value || 0));
  const evPoints = evolution.map((e, i) => {
    const x = (i / Math.max(1, evolution.length - 1)) * 100;
    const y = 100 - ((e.value || 0) / evMax) * 100;
    return { x, y, label: e.date_label, value: e.value };
  });
  const evPath = evPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Pillars (3 scores) ── */}
      {pillars?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {pillars.map(p => {
            const has = p.score !== null && p.score !== undefined;
            const c = tone(p.score ?? 0);
            return (
              <div key={p.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '13px 13px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: WHITE, marginBottom: 3 }}>{p.label}</div>
                <p style={{ fontSize: 11, color: INK2, margin: '0 0 8px', lineHeight: 1.4, minHeight: 30 }}>{p.explain}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 5 }}>
                  <span style={{ fontSize: 19, fontWeight: 800, color: has ? WHITE : INK3 }}>{has ? p.score : '—'}</span>
                  {has && <span style={{ fontSize: 9.5, color: INK3 }}>/100</span>}
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.10)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${has ? Math.min(p.score, 100) : 0}%`, background: c, borderRadius: 999, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Why this score ── */}
      <div style={{ background: 'rgba(255,90,31,0.08)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,90,31,0.15)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Pourquoi ce score ?</div>
        {reasons.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i === reasons.length - 1 ? 0 : 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: CORAL, flexShrink: 0, marginTop: 6 }} />
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{r}</span>
          </div>
        ))}
      </div>

      {/* ── Score breakdown + Evolution ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Breakdown */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: INK2, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Décomposition</div>
          {breakdownBars.map(b => (
            <div key={b.label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{b.label}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: WHITE }}>{b.value}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (b.value / b.max) * 100)}%`, background: b.color, borderRadius: 999 }} />
              </div>
            </div>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
          {pctBars.map(b => (
            <div key={b.label} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{b.label}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: WHITE }}>{Math.round(b.value)}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, b.value)}%`, background: b.color, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Evolution chart */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: INK2, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Évolution 30j</div>
          {evolution.length > 1 ? (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 70 }}>
              <defs>
                <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CORAL} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={CORAL} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${evPath} L 100 100 L 0 100 Z`} fill="url(#evGrad)" />
              <path d={evPath} fill="none" stroke={CORAL} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              {evPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={CORAL} />
              ))}
            </svg>
          ) : (
            <div style={{ height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK3, fontSize: 11 }}>Pas assez de données</div>
          )}
          {evolution.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: INK3 }}>{evolution[0]?.date_label}</span>
              <span style={{ fontSize: 10, color: INK3 }}>{evolution[evolution.length - 1]?.date_label}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Zones + Languages ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Zones */}
        {zones.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Globe size={13} color={INK2} />
              <span style={{ fontSize: 11, fontWeight: 700, color: INK2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Zones</span>
            </div>
            {zones.map((z, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 16, fontSize: 10, fontWeight: 700, color: z.is_best ? CORAL : INK3, flexShrink: 0 }}>#{z.rank || i + 1}</span>
                <span style={{ flex: 1, fontSize: 11.5, color: z.is_best ? WHITE : 'rgba(255,255,255,0.7)', fontWeight: z.is_best ? 700 : 500 }}>{z.zone}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: z.is_best ? CORAL : WHITE }}>{z.score}</span>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Languages size={13} color={INK2} />
              <span style={{ fontSize: 11, fontWeight: 700, color: INK2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Langues</span>
            </div>
            {languages.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>{l.flag || '🌐'}</span>
                <span style={{ flex: 1, fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{l.language}</span>
                <span style={{ fontSize: 10, color: INK3 }}>{l.strength_label || ''}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: WHITE }}>{l.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Cited pages ── */}
      {citedPages.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <FileText size={13} color={INK2} />
            <span style={{ fontSize: 11, fontWeight: 700, color: INK2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pages citées par les IA</span>
          </div>
          {citedPages.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ flex: 1, fontSize: 11.5, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.url}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: CORAL, flexShrink: 0 }}>{p.citations}×</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}