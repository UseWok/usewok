// Skeleton for the Brand Knowledge page — mirrors the real layout so the
// page feels "already there" while data loads from the cloud.

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#111827';
const BORDER = '#E5E7EB';
const BG = '#FBFAF7';
const VIOLET = '#7B4FE0';

const shimmer = {
  background: 'linear-gradient(90deg, rgba(17,24,39,0.04) 30%, rgba(17,24,39,0.08) 50%, rgba(17,24,39,0.04) 70%)',
  backgroundSize: '800px 100%',
  animation: 'bk-skel 2s ease-in-out infinite',
};

function Skel({ w = '100%', h = 14, r = 8, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, ...shimmer, ...style }} />;
}

export default function BrandKnowledgeSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <style>{`@keyframes bk-skel{0%{background-position:-800px 0}100%{background-position:800px 0}}`}</style>

      {/* Sticky header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <Skel w={180} h={24} r={6} style={{ marginBottom: 6 }} />
            <Skel w={260} h={13} r={4} />
          </div>
          <Skel w={100} h={36} r={10} />
        </div>
        {/* Progress bar */}
        <div style={{ height: 3, background: '#F0EDE6' }}>
          <div style={{ height: '100%', width: '0%', background: VIOLET }} />
        </div>
      </div>

      {/* Content sections */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[0, 1, 2, 3].map(s => (
          <section key={s} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px' }}>
            <Skel w={160} h={18} r={6} style={{ marginBottom: 4 }} />
            <Skel w={280} h={13} r={4} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[0, 1].map(f => (
                <div key={f}>
                  <Skel w={120} h={12} r={4} style={{ marginBottom: 5 }} />
                  <Skel w="100%" h={36} r={8} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}