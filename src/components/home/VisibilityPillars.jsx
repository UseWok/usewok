const F = '"Wix Madefor Text", "Wix Madefor Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const INK = '#1A1814';
const INK2 = '#857E6E';
const INK3 = '#A8A49F';
const WHITE = '#FFFFFF';
const BORDER = 'rgba(21,19,15,0.12)';
const GREEN = '#22A87A';
const AMBER = '#D97706';
const RED = '#EF4444';

// Color by score so the whole thing is never all-red — good scores turn green.
function tone(score) {
  if (score === null || score === undefined) return { c: INK3, bg: 'rgba(21,19,15,0.04)', word: 'À analyser' };
  if (score >= 65) return { c: GREEN, bg: 'rgba(34,168,122,0.10)', word: 'Bon' };
  if (score >= 35) return { c: AMBER, bg: 'rgba(217,119,6,0.10)', word: 'Correct' };
  return { c: RED, bg: 'rgba(239,68,68,0.08)', word: 'À améliorer' };
}

/**
 * The three pillars in plain human language.
 * pillars: [{ label, explain, score (number|null) }]
 */
export default function VisibilityPillars({ pillars }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
      {pillars.map((p) => {
        const t = tone(p.score);
        const hasScore = p.score !== null && p.score !== undefined;
        return (
          <div key={p.label} style={{
            background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12,
            padding: '14px 14px 13px', fontFamily: F,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{p.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.c, background: t.bg, borderRadius: 6, padding: '3px 8px' }}>{t.word}</span>
            </div>
            <p style={{ fontSize: 12.5, color: INK2, margin: '0 0 12px', lineHeight: 1.5, minHeight: 36 }}>{p.explain}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: hasScore ? INK : INK3, letterSpacing: '-0.02em' }}>
                {hasScore ? p.score : '—'}
              </span>
              {hasScore && <span style={{ fontSize: 11, color: INK3, fontWeight: 500 }}>/100</span>}
            </div>
            <div style={{ height: 5, background: 'rgba(21,19,15,0.07)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${hasScore ? Math.min(p.score, 100) : 0}%`, background: t.c, borderRadius: 999, transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}