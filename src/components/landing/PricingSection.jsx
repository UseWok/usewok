import FadeIn from '@/components/landing/FadeIn';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG2 = '#111113';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.55)';
const T3 = 'rgba(255,255,255,0.3)';
const CORAL = '#F95738';
const BORDER = 'rgba(255,255,255,0.07)';

const PLANS = [
  { name: 'Discovery', price: 'Free', sub: 'no credit card', highlight: false },
  { name: 'Starter', price: '$45', per: '/mo', sub: '7-day free trial', highlight: true },
  { name: 'Pro', price: '$85', per: '/mo', sub: 'up to 10 sites simultaneously', highlight: false },
];

export default function PricingSection({ onSignup }) {
  return (
    <section id="tarifs" style={{ background: BG2, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', margin: '0 0 clamp(32px, 5vw, 56px)', textAlign: 'center' }}>
            Pricing
          </h2>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {PLANS.map((p, i) => (
            <FadeIn key={p.name} delay={i * 0.08}>
              <div style={{
                padding: '28px 26px',
                background: p.highlight ? 'rgba(249,87,56,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${p.highlight ? 'rgba(249,87,56,0.35)' : BORDER}`,
                borderRadius: 18,
                position: 'relative',
              }}>
                {p.highlight && (
                  <div style={{ position: 'absolute', top: -11, left: 26, background: CORAL, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.04em' }}>
                    MOST POPULAR
                  </div>
                )}
                <p style={{ fontSize: 13, fontWeight: 700, color: T2, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>{p.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: T1, letterSpacing: '-0.03em' }}>{p.price}</span>
                  {p.per && <span style={{ fontSize: 14, color: T3 }}>{p.per}</span>}
                </div>
                <p style={{ fontSize: 13, color: T2, margin: '0 0 20px' }}>{p.sub}</p>
                <button onClick={onSignup} style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: F, fontSize: 13.5, fontWeight: 700,
                  background: p.highlight ? CORAL : 'rgba(255,255,255,0.08)',
                  color: p.highlight ? '#fff' : T1,
                }}>
                  Get started
                </button>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <p style={{ fontSize: 13, color: T2, lineHeight: 1.75, maxWidth: 720, margin: '32px auto 0', textAlign: 'center' }}>
            For comparison, a specialized agency typically starts well above $100/mo and assumes you already have some in-house expertise. UseWok is designed to make that unnecessary.
            <br /><br />
            <strong style={{ color: T1 }}>And unlike most AI visibility tools that just give you a score and leave you alone with technical jargon, UseWok is the only one that goes all the way: diagnosis, detailed action plan and a dedicated assistant — at no extra cost.</strong>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}