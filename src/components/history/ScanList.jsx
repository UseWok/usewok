import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const INK = '#15130F';
const BORDER = 'rgba(21,19,15,0.10)';

export default function ScanList({ records }) {
  if (records.length === 0) {
    return (
      <div style={{ padding: '26px 20px', textAlign: 'center', fontSize: 13, color: 'rgba(21,19,15,0.4)', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16 }}>
        No scans recorded in this period.
      </div>
    );
  }

  // Newest first, delta vs the previous (older) scan
  const rows = [...records].reverse();

  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
      {rows.map((r, i) => {
        const prev = rows[i + 1];
        const score = Math.round(r.score_overall || 0);
        const delta = prev ? score - Math.round(prev.score_overall || 0) : 0;
        const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
        const deltaColor = delta > 0 ? '#16A34A' : delta < 0 ? '#EF4444' : 'rgba(21,19,15,0.35)';
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < rows.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>
                {new Date(r.created_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(21,19,15,0.45)', marginTop: 2 }}>
                {new Date(r.created_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: r.scan_type === 'full' ? '#C43E14' : 'rgba(21,19,15,0.45)', background: r.scan_type === 'full' ? '#FFE7D6' : '#F0EFEB', padding: '3px 9px', borderRadius: 100, flexShrink: 0 }}>
              {r.scan_type === 'full' ? 'Full scan' : 'Lite scan'}
            </span>
            {prev && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: deltaColor, width: 48, justifyContent: 'flex-end', flexShrink: 0 }}>
                <DeltaIcon size={12} /> {delta > 0 ? `+${delta}` : delta}
              </span>
            )}
            <span style={{ fontSize: 15, fontWeight: 800, color: INK, width: 60, textAlign: 'right', flexShrink: 0 }}>{score}<span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(21,19,15,0.4)' }}>/100</span></span>
          </div>
        );
      })}
    </div>
  );
}