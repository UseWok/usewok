const F = 'Inter, system-ui, sans-serif';
const WHITE = '#FFFFFF';
const BORDER = '#D8D4CC';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';

export default function LRSLineChart({ score, domain }) {
  const safeScore = score && score > 0 ? score : null;
  if (!safeScore) return null;

  return (
    <div style={{
      background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 14,
      padding: '16px 16px 12px', marginBottom: 12, fontFamily: F,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Reputation trend</span>
      </div>
      <div style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 12, color: INK3, textAlign: 'center' }}>
          No trend history yet — your progress will appear here after multiple scans.
        </span>
      </div>
    </div>
  );
}