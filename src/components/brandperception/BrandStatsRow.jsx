const F = 'Inter, system-ui, sans-serif';
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
      {/* Score narrative & authority */}
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 14px' }}>Score Narrative & autorité stratégique</p>
        {[{ label: 'Narrative', v: scoreNarrative, c: '#7C3AED' }, { label: 'Authority', v: scoreAuthority, c: GREEN }].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ width: 76, fontSize: 12, color: INK3 }}>{s.label}</span>
            <Bar pct={s.v} color={s.c} />
            <span style={{ width: 34, textAlign: 'right', fontSize: 13, fontWeight: 800, color: INK }}>{s.v}</span>
          </div>
        ))}
      </div>

      {/* Sentiment */}
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 14px' }}>Sentiment des réponses IA</p>
        <div style={{ display: 'flex', height: 26, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ width: `${sentiment.positive}%`, background: GREEN }} />
          <div style={{ width: `${sentiment.neutral}%`, background: GRAY }} />
          <div style={{ width: `${sentiment.negative}%`, background: RED }} />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[{ label: 'Positif', v: sentiment.positive, c: GREEN }, { label: 'Neutre', v: sentiment.neutral, c: GRAY }, { label: 'Négatif', v: sentiment.negative, c: RED }].map(s => (
            <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: INK3 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.c }} /> {s.label} {s.v}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}