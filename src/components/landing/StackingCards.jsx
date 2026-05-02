import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

const SCENARIOS = [
  {
    id: 'pizza', emoji: '🍕', tag: '01 — Food & Lifestyle',
    question: "I spend $45/week on pizza with friends. Should I cut it to hit my savings goal?",
    leftBot: 'FinanceBot',
    leftMsg: "Your food discretionary budget exceeds 18% of net income. Eliminate dining-out expenses by at least 30% and redirect those funds immediately.",
    rightMsg: "I found $94/month across 3 subscriptions you haven't opened in 4+ months. Your pizza stays — every single Friday. That $94 now flows directly into your savings target. Already configured.",
    rightHighlight: '$94/month recovered · 0 cuts made',
  },
  {
    id: 'iphone', emoji: '📱', tag: '02 — Tech Purchase',
    question: "I want to buy the new iPhone Pro ($1,199). Is that a bad financial decision right now?",
    leftBot: 'FinanceBot',
    leftMsg: "A $1,199 impulse tech purchase is irresponsible at your current savings rate. Defer until your emergency fund covers at least 6 months of expenses.",
    rightMsg: "Funded in 6 weeks via your dedicated tech buffer. Investment portfolio: untouched. I've set daily micro-transfers — they start tonight. You'll have it before the next iOS drop.",
    rightHighlight: 'In your hands in 6 weeks · Zero debt',
  },
  {
    id: 'coffee', emoji: '☕', tag: '03 — Daily Habits',
    question: "My $6 daily coffee costs $2,190/year. Should I quit to save more?",
    leftBot: 'FinanceBot',
    leftMsg: "Yes. Cutting your daily coffee saves $2,190/year. Small habitual expenses compound dramatically. Discipline starts here.",
    rightMsg: "$2,190/year protected. I found $1,340 in duplicate insurance charges and a phone plan you're overpaying by $60/month. Your coffee is a line item I will never touch — ever.",
    rightHighlight: '$1,340 found elsewhere · Coffee sacred',
  },
  {
    id: 'vacation', emoji: '✈️', tag: '04 — Travel & Goals',
    question: "I want a $2,000 trip this summer. Can I pull it off without wrecking my finances?",
    leftBot: 'FinanceBot',
    leftMsg: "A $2,000 discretionary vacation exceeds what is advisable given your current savings rate. I recommend postponing this to next fiscal year.",
    rightMsg: "Fully funded in 11 weeks via micro-saving. Flights are bookable now. Portfolio: completely intact. Your week-by-week breakdown is ready — no compromise required, anywhere.",
    rightHighlight: 'Booked in 11 weeks · Portfolio untouched',
  },
  {
    id: 'gaming', emoji: '🎮', tag: '05 — Subscriptions',
    question: "I have Netflix, Spotify, and 2 gaming subscriptions. Should I cut some of them?",
    leftBot: 'FinanceBot',
    leftMsg: "Four entertainment subscriptions is excessive and financially irresponsible. Reduce to a maximum of one platform immediately. You are wasting $67/month.",
    rightMsg: "All of them: kept. I found $187/month in an expired promo plan and 2 services auto-renewed without your notice. Everything you enjoy is still running. That $187 now goes to your goal.",
    rightHighlight: '$187/month freed · Every subscription intact',
  },
];

function TypingDots({ dark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '10px 16px', borderRadius: '16px 16px 16px 4px',
      background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      width: 'fit-content',
    }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.5)' : '#aaa' }} />
      ))}
    </div>
  );
}

function Bubble({ text, isUser, dark, isGood, delay = 0 }) {
  const userBg = dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb';
  const botBg = isGood ? 'rgba(221,255,0,0.1)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)');
  return (
    <motion.p
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        maxWidth: '88%',
        padding: '10px 15px',
        fontSize: 13,
        lineHeight: 1.6,
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        background: isUser ? userBg : botBg,
        color: isUser ? (dark ? 'white' : '#333') : (dark ? 'rgba(255,255,255,0.88)' : '#333'),
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        border: isGood ? `1.5px solid ${YELLOW}` : 'none',
        fontFamily: 'var(--font-open)',
        margin: 0,
      }}>
      {text}
    </motion.p>
  );
}

function LeftPanel({ scenario, phase }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: '#f9f9f9', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🤖</div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#555', fontFamily: 'var(--font-open)', margin: 0 }}>{scenario.leftBot}</p>
          <p style={{ fontSize: 10, color: '#aaa', fontFamily: 'var(--font-open)', margin: 0 }}>Generic · One-size-fits-all</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ddd' }} />
          <span style={{ fontSize: 10, color: '#ccc', fontFamily: 'var(--font-open)' }}>Standard</span>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: 18, overflow: 'hidden', background: 'white' }}>
        {phase >= 1 && <Bubble text={scenario.question} isUser delay={0} />}
        {phase === 2 && <TypingDots />}
        {phase >= 3 && <Bubble text={scenario.leftMsg} delay={0} />}
      </div>
    </div>
  );
}

function RightPanel({ scenario, phase }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: FG }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>S</div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, color: 'white', fontFamily: 'var(--font-open)', margin: 0 }}>Stensor</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-open)', margin: 0 }}>Personalized · Your life, your rules</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ fontSize: 10, color: 'rgba(74,222,128,0.7)', fontFamily: 'var(--font-open)' }}>Live</span>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: 18, overflow: 'hidden' }}>
        {phase >= 1 && <Bubble text={scenario.question} isUser dark delay={0} />}
        {phase === 4 && <TypingDots dark />}
        {phase >= 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Bubble text={scenario.rightMsg} dark isGood delay={0} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 8, color: FG, fontWeight: 900 }}>✓</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: YELLOW, fontFamily: 'var(--font-open)' }}>{scenario.rightHighlight}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ChatCard({ scenario, index, total }) {
  const [phase, setPhase] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    setPhase(0);
    timers.current = [
      setTimeout(() => setPhase(1), 250),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 2300),
      setTimeout(() => setPhase(4), 3200),
      setTimeout(() => setPhase(5), 4700),
    ];
    return () => timers.current.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', fontFamily: 'var(--font-open)' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 820, marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.22)', fontFamily: 'var(--font-open)' }}>
          {scenario.tag}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {SCENARIOS.map((_, i) => (
            <div key={i} style={{ height: 5, borderRadius: 99, background: i === index ? FG : 'rgba(0,0,0,0.12)', width: i === index ? 20 : 5, transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </div>

      {/* Split card */}
      <div style={{
        width: '100%', maxWidth: 820, height: 480,
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 20px 80px rgba(0,0,0,0.13)',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
      }}>
        <LeftPanel scenario={scenario} phase={phase} />
        <RightPanel scenario={scenario} phase={phase} />
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 820, marginTop: 14 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ccc', fontFamily: 'var(--font-open)', margin: 0 }}>Generic AI</p>
          <p style={{ fontSize: 11, color: '#bbb', fontFamily: 'var(--font-open)', margin: '2px 0 0' }}>Restricts your life</p>
        </div>
        <div style={{ width: 1, height: 28, background: 'rgba(0,0,0,0.08)' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: FG, fontFamily: 'var(--font-open)', margin: 0 }}>Stensor</p>
          <p style={{ fontSize: 11, color: '#999', fontFamily: 'var(--font-open)', margin: '2px 0 0' }}>Protects your life</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function StackingCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sentinelRefs = useRef([]);

  const setSentinelRef = useCallback((el, i) => {
    sentinelRefs.current[i] = el;
  }, []);

  useEffect(() => {
    const observers = SCENARIOS.map((_, i) => {
      const el = sentinelRefs.current[i];
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(i); },
        { threshold: 0, rootMargin: '-15% 0px -75% 0px' }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return (
    <section style={{ background: '#ffffff', fontFamily: 'var(--font-open)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '100px 24px 72px' }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.18)', marginBottom: 48, fontFamily: 'var(--font-open)' }}>
          The Stensor Difference
        </p>
        <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.0, fontSize: 'clamp(2rem,5vw,3.8rem)', color: FG, margin: '0 0 20px' }}>
          Same question.<br />
          <span style={{ color: YELLOW }}>Completely different life.</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.38)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontFamily: 'var(--font-open)' }}>
          Scroll through 5 real scenarios — and see how Stensor responds without ever touching what makes your life worth living.
        </p>
      </div>

      {/* Scroll container */}
      <div style={{ position: 'relative', height: `${SCENARIOS.length * 100}vh` }}>
        {SCENARIOS.map((_, i) => (
          <div
            key={i}
            ref={el => setSentinelRef(el, i)}
            style={{ position: 'absolute', top: `${i * 100}vh`, height: 1, width: '100%', pointerEvents: 'none' }}
          />
        ))}

        {/* Sticky viewport */}
        <div style={{ position: 'sticky', top: 0, height: '100vh', background: '#ffffff', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <ChatCard
              key={activeIndex}
              scenario={SCENARIOS[activeIndex]}
              index={activeIndex}
              total={SCENARIOS.length}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom separator */}
      <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '0 5%' }} />
    </section>
  );
}