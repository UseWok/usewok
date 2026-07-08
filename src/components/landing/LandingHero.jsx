import ParticleField from '@/components/landing/ParticleField';
import FadeIn from '@/components/landing/FadeIn';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.3)';
const CORAL = '#F95738';

function scrollToHowItWorks() {
  document.getElementById('comment-ca-marche')?.scrollIntoView({ behavior: 'smooth' });
}

export default function LandingHero({ onStartQuiz }) {
  return (
    <section style={{ background: BG, paddingTop: 58, fontFamily: F, position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <ParticleField count={60} />
      </div>
      <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(249,87,56,0.14) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(to bottom, transparent, #0A0A0B)', pointerEvents: 'none', zIndex: 2 }} />

      <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 760, margin: '0 auto', padding: 'clamp(70px, 10vh, 120px) clamp(20px, 5vw, 60px) 70px', textAlign: 'center' }}>

        <FadeIn delay={0}>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 54px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', lineHeight: 1.12, margin: '0 0 24px' }}>
            10x your AI visibility.
            <br />
            <span style={{ color: CORAL }}>Built for people who know nothing about it.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: T2, margin: '0 auto 14px', maxWidth: 600, lineHeight: 1.65 }}>
            UseWok analyzes your presence across 8 AI engines, gives you a clear score in 2 minutes, and an action plan so ChatGPT, Gemini and Claude finally recommend you to your future customers.
          </p>
          <p style={{ fontSize: 15, color: T1, fontWeight: 600, margin: '0 0 36px' }}>
            No expertise needed. UseWok handles the rest.
          </p>
        </FadeIn>

        <FadeIn delay={0.18}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onStartQuiz} style={{
              fontFamily: F, fontSize: 14.5, fontWeight: 700, color: '#fff',
              background: CORAL, border: 'none', borderRadius: 12, padding: '14px 28px',
              cursor: 'pointer', transition: 'opacity 150ms',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Get Started Free →
            </button>
            <button onClick={scrollToHowItWorks} style={{
              fontFamily: F, fontSize: 14.5, fontWeight: 600, color: T1,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 12, padding: '14px 28px', cursor: 'pointer',
            }}>
              See a Demo
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.26}>
          <p style={{ fontSize: 12, color: T3, marginTop: 24 }}>
            Free to start, no credit card · 7-day free trial to go further · Results in 2 minutes
          </p>
        </FadeIn>
      </div>
    </section>
  );
}