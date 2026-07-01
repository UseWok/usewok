import FadeIn from '@/components/landing/FadeIn';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG2 = '#111113';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.55)';
const T3 = 'rgba(255,255,255,0.3)';
const CORAL = '#F95738';
const BORDER = 'rgba(255,255,255,0.07)';

const PLANS = [
  { name: 'Découverte', price: 'Gratuit', sub: 'sans carte bancaire', highlight: false },
  { name: 'Starter', price: '45€', per: '/mois', sub: '7 jours d\'essai gratuit', highlight: true },
  { name: 'Pro', price: '85€', per: '/mois', sub: "jusqu'à 10 sites en simultané", highlight: false },
];

export default function PricingSection({ onSignup }) {
  return (
    <section id="tarifs" style={{ background: BG2, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', margin: '0 0 clamp(32px, 5vw, 56px)', textAlign: 'center' }}>
            Tarifs
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
                    LE PLUS CHOISI
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
                  Démarrer
                </button>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <p style={{ fontSize: 13, color: T2, lineHeight: 1.75, maxWidth: 720, margin: '32px auto 0', textAlign: 'center' }}>
            À titre de comparaison, une agence spécialisée démarre généralement au-delà de 100€/mois et suppose d'avoir déjà un minimum d'expertise en interne. UseWok est pensé pour s'en passer.
            <br /><br />
            <strong style={{ color: T1 }}>Et contrairement à la plupart des autres outils de visibilité IA qui se contentent de vous donner un score et vous laissent seul face au jargon technique, UseWok est le seul à aller jusqu'au bout : diagnostic, plan d'action détaillé et assistant dédié — sans supplément.</strong>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}