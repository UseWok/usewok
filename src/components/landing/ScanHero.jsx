import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.25)';

// Animated counter hook
function useCounter(target, duration = 1500, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return val;
}

// Animated bar
function AnimatedBar({ value, color, label, delay = 0, started = false }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay, started]);

  const barColor = value < 40 ? '#ef4444' : value < 70 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: T2, fontFamily: F }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: barColor, fontFamily: F }}>{value}/100</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          background: barColor,
          borderRadius: 3,
          transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: `0 0 8px ${barColor}60`,
        }} />
      </div>
    </div>
  );
}

// Circular gauge
function CircularGauge({ score, started }) {
  const displayScore = useCounter(score, 1800, started);
  const radius = 56;
  const circ = 2 * Math.PI * radius;
  const progress = started ? (score / 100) * circ : 0;
  const color = score < 40 ? '#ef4444' : score < 70 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
      <div style={{ position: 'relative', width: 148, height: 148 }}>
        <svg width="148" height="148" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="74" cy="74" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="74" cy="74" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={circ - progress}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 38, fontWeight: 700, color, fontFamily: F, lineHeight: 1 }}>{displayScore}</span>
          <span style={{ fontSize: 11, color: T3, fontFamily: F, marginTop: 2 }}>/ 100</span>
        </div>
      </div>
      <div style={{
        marginTop: 12, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: color, fontFamily: F,
      }}>
        {score < 40 ? 'Critical' : score < 70 ? 'Average' : 'Good'}
      </div>
    </div>
  );
}

// Scan step animation
const SCAN_STEPS = [
  'Connecting to your website...',
  'Reading your content...',
  'Querying ChatGPT...',
  'Querying Perplexity...',
  'Querying Gemini...',
  'Calculating final score...',
];

function ScanAnimation({ onComplete }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState([]);

  useEffect(() => {
    const interval = 900;
    const timers = SCAN_STEPS.map((_, i) => setTimeout(() => {
      setDone(prev => [...prev, i]);
      setStep(i + 1);
      if (i === SCAN_STEPS.length - 1) {
        setTimeout(onComplete, 400);
      }
    }, (i + 1) * interval));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      style={{
        background: '#111113',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 12,
        padding: '28px 32px',
        maxWidth: 480,
        margin: '0 auto',
        fontFamily: F,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: T3, marginBottom: 6 }}>Analyzing your AI visibility...</div>
        <div style={{
          height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(step / SCAN_STEPS.length) * 100}%`,
            background: 'linear-gradient(90deg, #5A5AF0, #7C6AF4)',
            transition: 'width 0.8s ease',
            borderRadius: 2,
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SCAN_STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              background: done.includes(i) ? '#22c55e' : (i === step ? 'rgba(90,90,240,0.3)' : 'rgba(255,255,255,0.06)'),
              border: i === step && !done.includes(i) ? '1px solid #5A5AF0' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              {done.includes(i) ? (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : i === step ? (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5A5AF0', animation: 'pulse 1s infinite' }} />
              ) : null}
            </div>
            <span style={{
              fontSize: 13, fontFamily: F,
              color: done.includes(i) ? T1 : i === step ? 'rgba(255,255,255,0.7)' : T3,
              transition: 'color 0.3s',
            }}>{s}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </motion.div>
  );
}

// Blurred solution wall
function CuriosityWall({ onUnlock }) {
  const issues = [
    { problem: "Your homepage doesn't mention your city or service area", blurred: "Add your city name and service area in the first 50 words of your homepage to appear in local AI searches" },
    { problem: "No FAQ section — AI models can't find answers to common questions about you", blurred: "Create a FAQ page with at least 8 questions. Structure them as 'Can you recommend a [your job] in [your city]?'" },
    { problem: "Your brand name is never mentioned in AI results for your category", blurred: "Add structured data (schema.org) to your website. It tells AI models who you are and what you do with precision." },
  ];

  return (
    <div style={{ marginTop: 32, fontFamily: F }}>
      <div style={{ fontSize: 13, color: T3, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
        Issues detected
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {issues.map((issue, i) => (
          <div key={i} style={{
            background: '#111113',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                  <strong style={{ color: T1 }}>Issue detected:</strong> {issue.problem}
                </span>
              </div>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: T3 }}>→ Solution:</span>
                <div style={{
                  flex: 1,
                  height: 12,
                  borderRadius: 2,
                  background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 12px)',
                  filter: 'blur(1px)',
                  maxWidth: 240,
                }} />
              </div>
              <button
                onClick={onUnlock}
                style={{
                  fontFamily: F, fontSize: 12, fontWeight: 600,
                  color: '#0A0A0B', background: T1,
                  border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'opacity 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Unlock →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Social proof
function SocialProof({ siteCount }) {
  return (
    <div style={{ marginTop: 56, paddingTop: 56, borderTop: '1px solid rgba(255,255,255,0.07)', fontFamily: F }}>
      {/* Counter */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: T1, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {siteCount.toLocaleString()}
        </div>
        <div style={{ fontSize: 14, color: T2, marginTop: 6 }}>sites already analyzed</div>
      </div>

      {/* Logos strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
        {[
          { name: 'Maison Fleurie', initial: 'MF', color: '#5A5AF0' },
          { name: 'Café Vernet', initial: 'CV', color: '#E87C3E' },
          { name: 'Studio Lena', initial: 'SL', color: '#22c55e' },
          { name: 'Atelier Dupont', initial: 'AD', color: '#f59e0b' },
          { name: 'Boulangerie Saveur', initial: 'BS', color: '#7C6AF4' },
        ].map((logo, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: logo.color + '20',
              border: `1px solid ${logo.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: logo.color,
            }}>{logo.initial}</div>
            <span style={{ fontSize: 12, color: T3 }}>{logo.name}</span>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div style={{
        background: '#111113',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        padding: '24px 28px',
        maxWidth: 520,
        margin: '0 auto',
      }}>
        <p style={{ fontSize: 15, color: T1, lineHeight: 1.65, margin: '0 0 16px', fontStyle: 'italic' }}>
          "My score went from 18 to 76 in three weeks. I now appear in 3 AI recommendations for my city."
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C6AF4, #E87C3E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }}>C</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Camille Renaud</div>
            <div style={{ fontSize: 12, color: T3 }}>Florist, Lyon</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Competitor comparison
function ComparisonChart({ score }) {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStarted(true);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const bars = [
    { label: 'You', value: score, color: score < 40 ? '#ef4444' : score < 70 ? '#f59e0b' : '#22c55e' },
    { label: 'Sector average', value: 54, color: '#5A5AF0' },
    { label: 'Best in your area', value: 81, color: '#22c55e' },
  ];

  return (
    <div ref={ref} style={{ marginTop: 56, paddingTop: 56, borderTop: '1px solid rgba(255,255,255,0.07)', fontFamily: F }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T1, letterSpacing: '-0.03em', marginBottom: 6 }}>
          How do you compare to your sector?
        </div>
        <div style={{ fontSize: 13, color: T2 }}>
          You're currently behind {bars[1].value - score > 0 ? bars[1].value - score : 0} points from the sector average.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {bars.map((bar, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: i === 0 ? T1 : T2, fontWeight: i === 0 ? 600 : 400 }}>{bar.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: bar.color }}>{bar.value}</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: started ? `${bar.value}%` : '0%',
                background: bar.color,
                borderRadius: 4,
                transition: `width 1.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s`,
                boxShadow: `0 0 10px ${bar.color}50`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Results section
function Results({ score, url, onUnlock }) {
  const [gaugeStarted, setGaugeStarted] = useState(false);
  const barsStarted = gaugeStarted;

  useEffect(() => {
    const t = setTimeout(() => setGaugeStarted(true), 200);
    return () => clearTimeout(t);
  }, []);

  const scoreMsg = score < 40
    ? `73% of searches now go through AI. You are invisible on most of them.`
    : score < 70
    ? `You have potential, but 54% of AI searches in your category don't return your name.`
    : `Good start! But your top competitor outperforms you by 24 points.`;

  const categories = [
    { label: 'AI Visibility', value: Math.round(score * 0.8) },
    { label: 'Message Clarity', value: Math.round(score * 1.2 > 100 ? 100 : score * 1.2) },
    { label: 'Commercial Presence', value: Math.round(score * 0.5) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ fontFamily: F }}
    >
      {/* URL badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 20, padding: '5px 14px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 12, color: T2 }}>Analysis completed for <strong style={{ color: T1 }}>{url}</strong></span>
        </div>
      </div>

      {/* Gauge */}
      <CircularGauge score={score} started={gaugeStarted} />

      {/* Shock sentence */}
      <div style={{
        background: score < 40 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
        border: `1px solid ${score < 40 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
        borderRadius: 10, padding: '14px 18px',
        marginBottom: 28,
        fontSize: 13, color: T2, lineHeight: 1.65,
      }}>
        {scoreMsg}
      </div>

      {/* Bars */}
      <div>
        {categories.map((cat, i) => (
          <AnimatedBar
            key={i}
            label={cat.label}
            value={cat.value}
            delay={i * 200}
            started={barsStarted}
          />
        ))}
      </div>

      {/* Curiosity wall */}
      <CuriosityWall onUnlock={onUnlock} />
    </motion.div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function ScanHero({ onStartQuiz }) {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState('hero'); // hero | scanning | results
  const [score, setScore] = useState(null);
  const [siteCount] = useState(2847 + Math.floor(Math.random() * 12));
  const inputRef = useRef(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      inputRef.current?.focus();
      return;
    }
    setPhase('scanning');

    // Simulate a real score (biased toward low scores for urgency)
    const baseScore = Math.floor(Math.random() * 45) + 8; // 8-52
    setScore(baseScore);

    // Save lead if possible
    try {
      await base44.entities.ContactLead.create({ website: url, status: 'new', message: 'AI Visibility scan' });
    } catch {}
  };

  const handleScanComplete = () => setPhase('results');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAnalyze();
  };

  return (
    <div style={{ fontFamily: F }}>
      <AnimatePresence mode="wait">
        {phase === 'hero' && (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
            {/* Hero content */}
            <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto', padding: '80px 24px 0' }}>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px', marginBottom: 28 }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>New · AI Visibility Score</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 'clamp(36px, 6vw, 64px)',
                  fontWeight: 700, color: T1,
                  letterSpacing: '-0.04em', lineHeight: 1.05,
                  margin: '0 0 20px',
                }}
              >
                Do AI models<br />know you exist?
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 16, color: T2, lineHeight: 1.65, margin: '0 0 48px' }}
              >
                Enter your website. We show you in 10 seconds whether ChatGPT,<br />
                Perplexity and Google recommend you to your future clients.
              </motion.p>

              {/* Input */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{
                  display: 'flex', alignItems: 'stretch', gap: 0,
                  background: '#111113',
                  border: '1.5px solid rgba(255,255,255,0.14)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 0 0 1px rgba(90,90,240,0)', // will animate on focus
                  transition: 'border-color 200ms, box-shadow 200ms',
                  maxWidth: 580, margin: '0 auto',
                }}
                  onFocus={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(90,90,240,0.6)'; el.style.boxShadow = '0 0 0 3px rgba(90,90,240,0.12)'; }}
                  onBlur={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.14)'; el.style.boxShadow = 'none'; }}
                >
                  <input
                    ref={inputRef}
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://your-website.com"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      padding: '16px 20px',
                      fontSize: 15, color: T1, fontFamily: F,
                      caretColor: '#5A5AF0',
                    }}
                  />
                  <button
                    onClick={handleAnalyze}
                    style={{
                      fontFamily: F, fontSize: 14, fontWeight: 600,
                      color: '#0A0A0B', background: T1,
                      border: 'none', padding: '0 24px', cursor: 'pointer',
                      whiteSpace: 'nowrap', flexShrink: 0,
                      transition: 'opacity 150ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    Analyze for free
                  </button>
                </div>
                <p style={{ fontSize: 12, color: T3, marginTop: 12 }}>
                  No credit card required · Result in 10 seconds
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {phase === 'scanning' && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ padding: '80px 24px 0' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: T1, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                Analyzing <span style={{ color: 'rgba(90,90,240,0.9)' }}>{url}</span>
              </h2>
              <p style={{ fontSize: 13, color: T3 }}>Please wait, this takes 5 to 6 seconds...</p>
            </div>
            <ScanAnimation onComplete={handleScanComplete} />
          </motion.div>
        )}

        {phase === 'results' && score !== null && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '60px 24px 0', maxWidth: 560, margin: '0 auto' }}
          >
            <Results score={score} url={url} onUnlock={onStartQuiz} />
            <ComparisonChart score={score} />
            <SocialProof siteCount={siteCount} />

            {/* Final CTA */}
            <div style={{
              marginTop: 56, padding: '32px', textAlign: 'center',
              background: '#111113',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T1, marginBottom: 8, letterSpacing: '-0.02em' }}>
                Unlock all {3} solutions + get your AI optimization plan
              </div>
              <div style={{ fontSize: 13, color: T2, marginBottom: 20 }}>
                Free · Takes 2 minutes · No credit card required
              </div>
              <button
                onClick={onStartQuiz}
                style={{
                  fontFamily: F, fontSize: 15, fontWeight: 600,
                  color: '#0A0A0B', background: T1,
                  border: 'none', borderRadius: 8,
                  padding: '14px 32px', cursor: 'pointer',
                  transition: 'opacity 150ms',
                  width: '100%',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Get my free AI optimization plan →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}