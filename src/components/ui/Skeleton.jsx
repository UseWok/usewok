export default function Skeleton({ height, width, radius = 6, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        height: height || undefined,
        width: width || undefined,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #EBEBEB 25%, #F5F5F5 50%, #EBEBEB 75%)',
        backgroundSize: '400% 100%',
        animation: 'sk-shimmer 1.4s ease-in-out infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function PlanCardSkeleton() {
  return (
    <div style={{
      background: '#1E1E1F',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '24px 20px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ height: 18, width: '55%', borderRadius: 5, background: 'rgba(255,255,255,0.07)', animation: 'sk-shimmer-dark 1.4s ease-in-out infinite', backgroundSize: '400% 100%' }} />
      <div style={{ height: 36, width: '40%', borderRadius: 5, background: 'rgba(255,255,255,0.07)', animation: 'sk-shimmer-dark 1.4s ease-in-out infinite 0.1s', backgroundSize: '400% 100%' }} />
      <div style={{ height: 52, borderRadius: 8, background: 'rgba(255,255,255,0.05)', animation: 'sk-shimmer-dark 1.4s ease-in-out infinite 0.15s', backgroundSize: '400% 100%' }} />
      <div style={{ height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.07)', animation: 'sk-shimmer-dark 1.4s ease-in-out infinite 0.2s', backgroundSize: '400% 100%' }} />
      {[0.25, 0.3, 0.35].map((d, i) => (
        <div key={i} style={{ height: 12, width: `${70 - i * 10}%`, borderRadius: 4, background: 'rgba(255,255,255,0.05)', animation: `sk-shimmer-dark 1.4s ease-in-out infinite ${d}s`, backgroundSize: '400% 100%' }} />
      ))}
    </div>
  );
}