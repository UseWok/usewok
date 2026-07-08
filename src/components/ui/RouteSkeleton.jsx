import { useLocation } from 'react-router-dom';

// Content-area skeleton — the sidebar stays visible, only the page content
// shimmers. Each sidebar page gets a custom layout. Slow, subtle animation.

const BG = '#F5F2EC';
const shimmer = {
  background: 'linear-gradient(90deg, rgba(21,19,15,0.04) 30%, rgba(21,19,15,0.075) 50%, rgba(21,19,15,0.04) 70%)',
  backgroundSize: '900px 100%',
  animation: 'rs-shimmer 2.6s ease-in-out infinite',
};

const B = ({ w = '100%', h = 14, r = 8, mb = 0, style = {} }) => (
  <div style={{ width: w, height: h, borderRadius: r, marginBottom: mb, flexShrink: 0, ...shimmer, ...style }} />
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', border: '1px solid rgba(21,19,15,0.06)', borderRadius: 14, padding: 18, ...style }}>
    {children}
  </div>
);

function Rows({ n = 6 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[...Array(n)].map((_, i) => (
        <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <B w={34} h={34} r={9} />
          <div style={{ flex: 1 }}>
            <B w={`${55 - i * 4}%`} h={13} mb={8} />
            <B w={`${35 + i * 3}%`} h={10} />
          </div>
          <B w={70} h={26} r={999} />
        </Card>
      ))}
    </div>
  );
}

function WidgetGrid() {
  return (
    <>
      <B w={200} h={24} mb={20} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 12 }}>
        {[0, 1, 2].map(i => (
          <Card key={i}>
            <B w="45%" h={11} mb={14} />
            <B w="55%" h={30} mb={10} />
            <B w="70%" h={10} />
          </Card>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <Card><B w="30%" h={12} mb={16} /><B h={180} r={10} /></Card>
        <Card><B w="50%" h={12} mb={16} /><Rows n={3} /></Card>
      </div>
    </>
  );
}

function ScoreReport() {
  return (
    <>
      <Card style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 12 }}>
        <B w={110} h={110} r={999} />
        <div style={{ flex: 1 }}>
          <B w="40%" h={20} mb={12} />
          <B w="65%" h={12} mb={8} />
          <B w="50%" h={12} />
        </div>
      </Card>
      <Card style={{ marginBottom: 12 }}><B w="25%" h={12} mb={16} /><B h={160} r={10} /></Card>
      <Rows n={3} />
    </>
  );
}

function ChatSkeleton() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-end', paddingBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}><B w="45%" h={40} r={16} /></div>
      <div style={{ marginBottom: 16 }}><B w="70%" h={14} mb={8} /><B w="62%" h={14} mb={8} /><B w="40%" h={14} /></div>
      <B h={52} r={16} />
    </div>
  );
}

function FormSkeleton() {
  return (
    <div style={{ maxWidth: 620 }}>
      <B w={220} h={24} mb={24} />
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ marginBottom: 20 }}>
          <B w={130} h={11} mb={8} />
          <B h={40} r={10} />
        </div>
      ))}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', width: '100%', paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <B w={240} h={30} mb={14} />
      <B w={340} h={14} mb={36} />
      <B h={56} r={16} mb={28} style={{ width: '100%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
        {[0, 1].map(i => <Card key={i}><B w="50%" h={12} mb={12} /><B w="80%" h={10} /></Card>)}
      </div>
    </div>
  );
}

export default function RouteSkeleton() {
  const { pathname } = useLocation();

  let content;
  if (pathname.startsWith('/dashboard')) content = <WidgetGrid />;
  else if (pathname.startsWith('/wok-ai')) content = <ChatSkeleton />;
  else if (['/ai-report', '/performance', '/recommendations', '/brand-image', '/history'].some(p => pathname.startsWith(p))) content = <ScoreReport />;
  else if (['/site-audit', '/competitors', '/tasks'].some(p => pathname.startsWith(p))) content = <><B w={200} h={24} mb={20} /><Rows n={6} /></>;
  else if (['/brand-knowledge', '/geo-strategy', '/settings'].some(p => pathname.startsWith(p))) content = <FormSkeleton />;
  else if (pathname === '/app') content = <HomeSkeleton />;
  else content = <><B w={200} h={24} mb={20} /><Rows n={5} /></>;

  return (
    <div style={{ flex: 1, background: BG, padding: '28px 32px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 960, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {content}
      </div>
      <style>{`@keyframes rs-shimmer{0%{background-position:-900px 0}100%{background-position:900px 0}}`}</style>
    </div>
  );
}