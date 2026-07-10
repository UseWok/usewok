// Temps 2 : "Est-ce positif ou négatif ?" — sentiment + 2 scores, avec vocabulaire humain et légende explicite.
const F = "'Wix Madefor Text', 'Wix Madefor Display', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const GREEN = '#10B981';
const GRAY = '#B8B4AB';
const RED = '#EF4444';

function Bar({ pct, color }) {
  return (
    <div style={{ flex: 1, height: 8, borderRadius: 999, background: '#F0EDE8', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
    </div>
  );
}

export default function BrandStatsRow({ scoreNarrative, scoreAuthority, sentiment }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18, fontFamily: F }}>
      {/* Sentiment — le plus important, à gauche */}
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 3px' }}>Positif ou négatif ?</p>
        <p style={{ fontSize: 11.5, color: INK3, margin: '0 0 14px', lineHeight: 1.5 }}>Le ton des réponses des IA quand elles parlent de toi.</p>
        <div style={{ display: 'flex', height: 26, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
          {sentiment.positive > 0 && <div style={{ width: `${sentiment.positive}%`, background: GREEN }} />}
          {sentiment.neutral > 0 && <div style={{ width: `${sentiment.neutral}%`, background: GRAY }} />}
          {sentiment.negative > 0 && <div style={{ width: `${sentiment.negative}%`, background: RED }} />}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Positif', v: sentiment.positive, c: GREEN },
            { label: 'Neutre', v: sentiment.neutral, c: GRAY },
            { label: 'Négatif', v: sentiment.negative, c: RED },
          ].map(s => (
            <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: INK3 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.c }} /> {s.label} {s.v}%
            </span>
          ))}
        </div>
      </div>

      {/* Scores — vocabulaire humain */}
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 3px' }}>Comment tu es perçu</p>
        <p style={{ fontSize: 11.5, color: INK3, margin: '0 0 14px', lineHeight: 1.5 }}>Deux dimensions clés de ton image auprès des IA.</p>
        {[
          { label: 'Comment on te décrit', v: scoreNarrative, c: '#7C3AED' },
          { label: 'À quel point on te fait confiance', v: scoreAuthority, c: GREEN },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ width: 130, fontSize: 11.5, color: INK3, lineHeight: 1.3 }}>{s.label}</span>
            <Bar pct={s.v} color={s.c} />
            <span style={{ width: 34, textAlign: 'right', fontSize: 13, fontWeight: 800, color: INK }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}