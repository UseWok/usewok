// Skeleton shown in the preview panel while AI is generating
const SkeletonRow = ({ width, height = 14, delay = 0, opacity = 1 }) => (
  <div
    className="skeleton-block"
    style={{
      width, height, opacity, borderRadius: 8, flexShrink: 0,
      animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${delay}ms both`
    }}
  />
);

export default function PreviewSkeleton() {
  return (
    <div className="w-full h-full bg-zinc-50 rounded-2xl p-6 flex flex-col gap-0 overflow-hidden">
      <div className="flex flex-col gap-2.5 mb-8">
        <SkeletonRow width="38%" height={22} delay={0} />
        <SkeletonRow width="58%" height={13} delay={40} opacity={0.5} />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-7">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-block rounded-xl h-20"
            style={{ animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${80 + i * 50}ms both` }} />
        ))}
      </div>
      <div className="skeleton-block rounded-2xl mb-6"
        style={{ height: 180, animation: 'wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out 230ms both' }} />
      <div className="flex flex-col gap-2.5 mb-6">
        {[{ w: '91%', d: 310 }, { w: '76%', d: 350 }, { w: '83%', d: 390 }, { w: '55%', d: 430, op: 0.5 }].map((r, i) => (
          <SkeletonRow key={i} width={r.w} height={13} delay={r.d} opacity={r.op || 1} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="skeleton-block rounded-2xl h-28"
            style={{ animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${470 + i * 60}ms both` }} />
        ))}
      </div>
    </div>
  );
}