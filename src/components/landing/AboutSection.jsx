import FadeIn from '@/components/landing/FadeIn';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG2 = '#111113';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.55)';
const CORAL = '#F95738';
const BORDER = 'rgba(255,255,255,0.07)';

export default function AboutSection() {
  return (
    <section id="a-propos" style={{ background: BG2, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', margin: '0 0 20px' }}>
            À propos
          </h2>
          <p style={{ fontSize: 14.5, color: T2, lineHeight: 1.8, margin: '0 0 20px' }}>
            UseWok a été fondé par Antoine Valton, en Gironde. Une équipe de plus de 9 personnes travaille chaque jour à rendre la visibilité IA accessible aux entreprises qui n'ont pas les moyens d'une équipe marketing dédiée.
          </p>
          <a href="mailto:support@usewok.com" style={{ fontSize: 14, color: CORAL, textDecoration: 'none', fontWeight: 600 }}>
            Contact : support@usewok.com
          </a>
        </FadeIn>
      </div>
    </section>
  );
}