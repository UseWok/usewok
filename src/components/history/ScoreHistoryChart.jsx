const F = 'Inter, system-ui, sans-serif';
const INK = '#15130F';
const BORDER = 'rgba(21,19,15,0.10)';
const ORANGE = '#FF5A1F';

export default function ScoreHistoryChart({ current, previous }) {
  const hasTrend = previous > 0;
  const points = hasTrend
    ? `0,${(70 - (previous / 100) * 55).toFixed(0)} 300,${(70 - (current / 100) * 55).toFixed(0)}`
    : '';
  const delta = current - previous;

  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>Évolution du score</span>
        {hasTrend && (
          <span style={{ fontSize: 12, fontWeight: 600, color: delta >= 0 ? '#16A34A' : '#DC2626', background: delta >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', padding: '3px 10px', borderRadius: 999 }}>
            {delta >= 0 ? '+' : ''}{delta} pts
          </span>
        )}
      </div>
      {hasTrend ? (
        <svg width="100%" height="90" viewBox="0 0 300 80" preserveAspectRatio="none">
          <polyline points={points} fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="0" cy={70 - (previous / 100) * 55} r="3.5" fill={ORANGE} opacity="0.4" />
          <circle cx="300" cy={70 - (current / 100) * 55} r="4" fill={ORANGE} />
        </svg>
      ) : (
        <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(21,19,15,0.4)' }}>Pas encore d'historique — relancez un scan pour suivre votre progression.</span>
        </div>
      )}
    </div>
  );
}