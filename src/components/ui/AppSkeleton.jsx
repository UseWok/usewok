// Global page skeleton — replaces the full-screen spinner everywhere.
// Shows a page-shaped shimmer: navbar + hero + content cards, so the UI
// feels "already there" while data / code loads.

const shimmer = {
  background: 'linear-gradient(90deg, rgba(21,19,15,0.05) 25%, rgba(21,19,15,0.09) 50%, rgba(21,19,15,0.05) 75%)',
  backgroundSize: '600px 100%',
  animation: 'skel-shimmer 1.4s ease-in-out infinite',
};

export function SkelBlock({ w = '100%', h = 14, r = 8, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, ...shimmer, ...style }} />;
}

export default function AppSkeleton({ bg = '#F8F7F4' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: bg, overflow: 'hidden', zIndex: 50 }}>
      {/* Navbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: '1px solid rgba(21,19,15,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SkelBlock w={32} h={32} r={9} />
          <SkelBlock w={90} h={14} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <SkelBlock w={70} h={30} r={999} />
          <SkelBlock w={110} h={30} r={999} />
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <SkelBlock w={140} h={22} r={999} />
        <SkelBlock w="70%" h={36} r={10} />
        <SkelBlock w="45%" h={16} />
      </div>

      {/* Content cards */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: '#fff', border: '1px solid rgba(21,19,15,0.08)', borderRadius: 16, padding: 22 }}>
            <SkelBlock w="40%" h={12} style={{ marginBottom: 14 }} />
            <SkelBlock w="65%" h={26} style={{ marginBottom: 18 }} />
            <SkelBlock h={12} style={{ marginBottom: 8 }} />
            <SkelBlock w="85%" h={12} style={{ marginBottom: 8 }} />
            <SkelBlock w="60%" h={12} style={{ marginBottom: 20 }} />
            <SkelBlock h={40} r={999} />
          </div>
        ))}
      </div>

      <style>{`@keyframes skel-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
    </div>
  );
}