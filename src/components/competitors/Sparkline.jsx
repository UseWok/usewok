// Tiny inline sparkline for the 90d trend column
export default function Sparkline({ trend }) {
  // Deterministic simple 3-point path based on trend direction
  const pts = trend === 'up'
    ? [10, 7, 3]
    : trend === 'down'
      ? [3, 6, 10]
      : [6, 5, 6];
  const color = trend === 'up' ? '#0B815A' : trend === 'down' ? '#EF4444' : '#F97316';
  const d = `M2,${pts[0]} L20,${pts[1]} L38,${pts[2]}`;
  return (
    <svg width={44} height={14} viewBox="0 0 40 13" fill="none" style={{ display: 'block' }}>
      <path d={d} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}