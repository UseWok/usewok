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
            Why UseWok
          </h2>
          <p style={{ fontSize: 15, color: T2, lineHeight: 1.8, margin: 0 }}>
            UseWok is for digital businesses that can afford to invest, but can't justify building an in-house marketing team. No jargon, no expertise required. Beyond the score, UseWok helps you structure your information so that AI engines crawling the web better understand who you are, what you do, and why they should recommend you — across multiple sites at once if your business has several.
          </p>
          <p style={{ fontSize: 15, color: T1, fontWeight: 600, lineHeight: 1.8, margin: '24px 0 0' }}>
            While other solutions stop at an isolated score, <span style={{ color: CORAL }}>UseWok remains the only tool that turns that score into concrete actions</span> — that's what makes the difference.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}