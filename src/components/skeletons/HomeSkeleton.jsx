// Custom skeleton for the Home dashboard — mirrors the real layout so the
// page feels "already there" while data loads from the cloud.

const F = '"Wix Madefor Text", "Wix Madefor Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const BG = '#F7F5F0';
const CARD_DARK = '#15130F';
const WHITE = '#FFFFFF';
const BORDER = 'rgba(21,19,15,0.12)';

const shimmer = {
  background: 'linear-gradient(90deg, rgba(21,19,15,0.04) 30%, rgba(21,19,15,0.08) 50%, rgba(21,19,15,0.04) 70%)',
  backgroundSize: '800px 100%',
  animation: 'hm-skel 2s ease-in-out infinite',
};

const shimmerDark = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 70%)',
  backgroundSize: '800px 100%',
  animation: 'hm-skel 2s ease-in-out infinite',
};

function Skel({ w = '100%', h = 14, r = 8, style = {}, dark = false }) {
  return <div style={{ width: w, height: h, borderRadius: r, ...(dark ? shimmerDark : shimmer), ...style }} />;
}

export default function HomeSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <style>{`@keyframes hm-skel{0%{background-position:-800px 0}100%{background-position:800px 0}}`}</style>

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '26px 32px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <Skel w={220} h={28} r={6} style={{ marginBottom: 6 }} />
            <Skel w={300} h={15} r={4} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Skel w={140} h={38} r={11} />
            <Skel w={120} h={38} r={11} />
          </div>
        </div>

        {/* Dashboard cards row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '5%', marginBottom: 24 }}>
          {/* Evolution card */}
          <div style={{ background: CARD_DARK, borderRadius: 14, padding: 22 }}>
            <Skel w={120} h={14} r={4} dark style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Skel w={56} h={56} r={999} dark />
              <div>
                <Skel w={80} h={20} r={4} dark style={{ marginBottom: 6 }} />
                <Skel w={160} h={12} r={4} dark />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ flex: 1 }}>
                  <Skel w="100%" h={12} r={4} dark style={{ marginBottom: 6 }} />
                  <Skel w="60%" h={20} r={4} dark />
                </div>
              ))}
            </div>
          </div>
          {/* Tasks card */}
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22 }}>
            <Skel w={80} h={14} r={4} style={{ marginBottom: 16 }} />
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <Skel w={18} h={18} r={6} />
                <div style={{ flex: 1 }}>
                  <Skel w="90%" h={12} r={4} style={{ marginBottom: 4 }} />
                  <Skel w="50%" h={10} r={4} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Authority tasks strip */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22, marginBottom: 24 }}>
          <Skel w={140} h={14} r={4} style={{ marginBottom: 14 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ background: BG, borderRadius: 10, padding: 14 }}>
                <Skel w={28} h={28} r={8} style={{ marginBottom: 8 }} />
                <Skel w="80%" h={12} r={4} style={{ marginBottom: 4 }} />
                <Skel w="50%" h={10} r={4} />
              </div>
            ))}
          </div>
        </div>

        {/* Three-column row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5%', marginBottom: 24 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22 }}>
              <Skel w={70} h={14} r={4} style={{ marginBottom: 14 }} />
              {[0, 1, 2].map(j => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Skel w={24} h={24} r={999} />
                  <Skel w="70%" h={12} r={4} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Score summary dark card */}
        <div style={{ background: CARD_DARK, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Skel w={56} h={56} r={999} dark />
            <div style={{ flex: 1 }}>
              <Skel w={200} h={16} r={4} dark style={{ marginBottom: 6 }} />
              <Skel w={280} h={13} r={4} dark />
            </div>
          </div>
        </div>

        {/* Pillars row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 22 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
              <Skel w={24} h={24} r={8} style={{ marginBottom: 8 }} />
              <Skel w="70%" h={13} r={4} style={{ marginBottom: 4 }} />
              <Skel w="40%" h={20} r={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}