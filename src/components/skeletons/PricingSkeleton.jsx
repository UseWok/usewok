// Custom skeleton for the pricing page — mirrors the real layout so the
// page feels "already there" while plans load from the cloud.

const WIX = "'Inter', 'Madefor Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const BG = '#FAF9F6';

const shimmer = {
  background: 'linear-gradient(90deg, rgba(21,19,15,0.04) 30%, rgba(21,19,15,0.08) 50%, rgba(21,19,15,0.04) 70%)',
  backgroundSize: '800px 100%',
  animation: 'pr-skel 2s ease-in-out infinite',
};

function Skel({ w = '100%', h = 14, r = 8, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, ...shimmer, ...style }} />;
}

export default function PricingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: WIX, color: '#15130F' }}>
      <style>{`@keyframes pr-skel{0%{background-position:-800px 0}100%{background-position:800px 0}}`}</style>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '56px 40px 8px' }}>
        <Skel w={140} h={22} r={999} style={{ margin: '0 auto 14px' }} />
        <Skel w={320} h={38} r={10} style={{ margin: '0 auto 12px' }} />
        <Skel w={200} h={15} r={6} style={{ margin: '0 auto' }} />
        {/* Toggle */}
        <Skel w={200} h={36} r={999} style={{ margin: '28px auto 0' }} />
      </div>

      {/* Pricing cards */}
      <div style={{ maxWidth: 960, margin: '67px auto 0', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, alignItems: 'stretch' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: '#fff', border: '1px solid rgba(21,19,15,0.06)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 18px 16px' }}>
              <Skel w={80} h={24} r={6} style={{ marginBottom: 10 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                <Skel w={50} h={18} r={4} />
                <Skel w={60} h={32} r={6} />
                <Skel w={28} h={13} r={4} />
              </div>
              {/* Engine logos */}
              <div style={{ display: 'flex', gap: -5, marginBottom: 8 }}>
                {[0, 1, 2, 3].map(j => (
                  <Skel key={j} w={28} h={28} r={999} style={{ marginLeft: j > 0 ? -5 : 0, border: '2px solid #fff' }} />
                ))}
              </div>
              <Skel w={100} h={12} r={4} />
              <Skel w="100%" h={44} r={10} style={{ marginTop: 18 }} />
            </div>
            <div style={{ padding: '16px 18px 20px', flex: 1 }}>
              <Skel w={90} h={11} r={4} style={{ marginBottom: 14 }} />
              {[0, 1, 2, 3, 4].map(j => (
                <div key={j} style={{ display: 'flex', gap: 9, marginBottom: 10 }}>
                  <Skel w={14} h={14} r={4} />
                  <Skel w="80%" h={12} r={4} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}