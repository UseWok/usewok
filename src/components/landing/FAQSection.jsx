import { useState } from 'react';
import FadeIn from '@/components/landing/FadeIn';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.55)';
const BORDER = 'rgba(255,255,255,0.07)';

const FAQ = [
  { q: 'Do I need to be an AI or marketing expert to use UseWok?', a: "No. That's exactly the point of UseWok: easily multiply your AI visibility, without technical expertise or a marketing team. You follow the provided action plan, UseWok handles the rest." },
  { q: 'Why don\'t AI engines like ChatGPT recommend my business?', a: "AI engines don't work like Google. They synthesize public, structured and consistent information about your business. If your data is missing, incomplete or contradictory across the web, the AI recommends the competitor who has complete data instead." },
  { q: 'What is the AI Visibility Score?', a: "It's your score out of 100, calculated from the analysis of 8 AI engines: ChatGPT, Gemini, Claude, Perplexity, Grok, Mistral, Copilot and Llama." },
  { q: "My company doesn't have a marketing team — is UseWok right for me?", a: "Yes, that's the core audience: digital businesses that can afford to invest but can't justify building an in-house marketing team. No jargon, a clear and actionable plan from the very first login." },
  { q: "How does the free trial work?", a: "You start for free, no credit card required, with your first visibility score. To go further (full audit, action plan, AI assistant), you get a 7-day free trial on Starter and Pro plans before being charged." },
  { q: 'I manage multiple sites — can UseWok track them all?', a: "Yes, the Pro plan lets you track up to 10 sites simultaneously, each with its own score and its own action plan." },
  { q: 'Does UseWok replace traditional SEO?', a: "No, it's complementary. SEO optimizes your ranking in Google results. UseWok optimizes your presence in AI-generated answers — a distinct discovery channel that's growing fast." },
  { q: 'Is UseWok GDPR compliant?', a: "Yes — a French solution with data hosted in Europe." },
];

function FAQItem({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 4px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F }}>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: T1 }}>{item.q}</span>
        <span style={{ fontSize: 18, color: T2, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 150ms' }}>+</span>
      </button>
      {open && (
        <p style={{ fontSize: 13.5, color: T2, lineHeight: 1.75, margin: '0 4px 20px', maxWidth: 680 }}>{item.a}</p>
      )}
    </div>
  );
}

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section id="faq" style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', margin: '0 0 clamp(32px, 5vw, 48px)', textAlign: 'center' }}>
            FAQ
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div>
            {FAQ.map((item, i) => (
              <FAQItem key={i} item={item} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}