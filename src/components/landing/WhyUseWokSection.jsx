import FadeIn from '@/components/landing/FadeIn';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.6)';
const BORDER = 'rgba(255,255,255,0.07)';
const CORAL = '#F95738';

export default function WhyUseWokSection() {
  return (
    <section id="pourquoi" style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', margin: '0 0 24px' }}>
            Pourquoi UseWok
          </h2>
          <p style={{ fontSize: 15, color: T2, lineHeight: 1.8, margin: 0 }}>
            UseWok s'adresse aux entreprises digitales qui ont les moyens d'investir, mais pas ceux de monter une équipe marketing en interne. Pas de jargon, pas besoin d'expert. Au-delà du score, UseWok vous aide à structurer vos informations pour que les IA qui circulent sur le web comprennent mieux qui vous êtes, ce que vous faites, et pourquoi vous recommander — y compris sur plusieurs sites à la fois si votre activité en compte.
          </p>
          <p style={{ fontSize: 15, color: T1, fontWeight: 600, lineHeight: 1.8, margin: '24px 0 0' }}>
            Là où d'autres solutions se contentent d'un score isolé, <span style={{ color: CORAL }}>UseWok reste le seul outil à transformer ce score en actions concrètes</span> — c'est ce qui fait la différence.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}