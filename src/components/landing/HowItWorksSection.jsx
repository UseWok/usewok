import FadeIn from '@/components/landing/FadeIn';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.55)';
const T3 = 'rgba(255,255,255,0.3)';
const BORDER = 'rgba(255,255,255,0.07)';

const STEPS = [
  {
    title: 'UseWok finds why you\'re invisible.',
    desc: "Generative AI engines rely on structured, consistent and public data. When it's missing or contradictory, AI recommends your competitor instead. UseWok pinpoints exactly what you're missing.",
  },
  {
    title: 'And builds a tailored action plan.',
    desc: "Step by step, no technical jargon, in the order that actually matters.",
  },
  {
    title: 'The help adapts to how you work.',
    desc: "Whether you use no-code tools, already work with AI assistants, or have a developer on your team, UseWok adjusts its guidance accordingly — to be effective without wasting your time.",
  },
  {
    title: 'An assistant that knows your full context.',
    desc: "Our AI chatbot has access to your complete profile — industry, score, identified blockers — and responds like a consultant who knows you inside out.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', margin: '0 0 clamp(36px, 5vw, 60px)', textAlign: 'center' }}>
            How it works
          </h2>
        </FadeIn>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {STEPS.map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{ display: 'flex', gap: 20, padding: '24px 28px', background: 'rgba(255,255,255,0.025)', border: `1px solid ${BORDER}`, borderRadius: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(249,87,56,0.15)', border: '1px solid rgba(249,87,56,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: '#F95738' }}>
                  {i + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: T1, margin: '0 0 8px' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: T2, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}