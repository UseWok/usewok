import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.25)';

// ── Animated counter
function useCounter(target, duration = 1600, started = false) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(null);
  useState(() => {
    if (!started || target === 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  });
  return val;
}

// ── Circular Score Gauge
function ScoreGauge({ score }) {
  const [started, setStarted] = useState(false);
  const [displayed, setDisplayed] = useState(0);
  const radius = 64;
  const circ = 2 * Math.PI * radius;
  const color = score < 35 ? '#ef4444' : score < 65 ? '#f59e0b' : '#22c55e';
  const glowColor = score < 35 ? 'rgba(239,68,68,0.3)' : score < 65 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)';

  // Start animation on mount
  useState(() => {
    const t = setTimeout(() => setStarted(true), 100);
    let start = null;
    const anim = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1800, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(ease * score));
      if (p < 1) requestAnimationFrame(anim);
    };
    const t2 = setTimeout(() => requestAnimationFrame(anim), 100);
    return () => { clearTimeout(t); clearTimeout(t2); };
  });

  const offset = started ? circ - (score / 100) * circ : circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 168, height: 168 }}>
        {/* Glow ring */}
        <div style={{
          position: 'absolute', inset: -12,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(16px)',
          transition: 'all 2s',
        }} />
        <svg width="168" height="168" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
          <circle cx="84" cy="84" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle
            cx="84" cy="84" r={radius}
            fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 2,
        }}>
          <span style={{ fontSize: 42, fontWeight: 700, color, fontFamily: F, lineHeight: 1, letterSpacing: '-0.04em' }}>
            {displayed}
          </span>
          <span style={{ fontSize: 12, color: T3, fontFamily: F }}>/100</span>
        </div>
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: `${color}15`, border: `1px solid ${color}40`,
        borderRadius: 20, padding: '4px 12px',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: F, letterSpacing: '0.04em' }}>
          {score < 35 ? 'CRITICAL — Invisible to AI' : score < 65 ? 'WEAK — Partially visible' : 'GOOD — Well optimized'}
        </span>
      </div>
    </div>
  );
}

// ── Animated bar
function Bar({ label, value, delay = 0 }) {
  const [w, setW] = useState(0);
  useState(() => {
    const t = setTimeout(() => setW(value), delay + 200);
    return () => clearTimeout(t);
  });
  const color = value < 35 ? '#ef4444' : value < 65 ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: T2, fontFamily: F }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: F }}>{value}<span style={{ color: T3, fontWeight: 400 }}>/100</span></span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${w}%`, background: color, borderRadius: 3,
          transition: `width 1.4s cubic-bezier(0.22,1,0.36,1)`,
          boxShadow: `0 0 10px ${color}60`,
        }} />
      </div>
    </div>
  );
}

// ── Skeleton loader
function Skeleton({ width = '100%', height = 14, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 4,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s ease-in-out infinite',
      ...style,
    }} />
  );
}

// ── AI source badges
function AIBadge({ name, score, icon }) {
  const color = score < 35 ? '#ef4444' : score < 65 ? '#f59e0b' : '#22c55e';
  return (
    <div style={{
      flex: 1, textAlign: 'center',
      background: '#111113', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10, padding: '14px 10px',
    }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 11, color: T3, fontFamily: F, marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: F }}>{score}</div>
    </div>
  );
}

// ── Curiosity Wall — issues are real (from AI), solutions are blurred
function CuriosityWall({ issues, onUnlock }) {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ fontSize: 12, color: T3, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, fontFamily: F }}>
        Issues detected on your site
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {issues.map((issue, i) => (
          <div key={i} style={{
            background: '#0D0D0F', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 10, overflow: 'hidden',
          }}>
            <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: '#ef4444', fontSize: 13, flexShrink: 0, marginTop: 1 }}>⚠</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, fontFamily: F }}>
                {issue.problem}
              </span>
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: 12, color: T3, fontFamily: F, flexShrink: 0 }}>→ Fix:</span>
              <div style={{
                flex: 1, height: 10, borderRadius: 2,
                background: 'rgba(255,255,255,0.08)',
                filter: 'blur(3px)',
              }} />
              <button onClick={onUnlock} style={{
                fontFamily: F, fontSize: 11, fontWeight: 600,
                color: '#0A0A0B', background: T1,
                border: 'none', borderRadius: 6, padding: '5px 12px',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'opacity 150ms',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Unlock fix</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Results view
function Results({ data, url, onUnlock }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '5px 14px', marginBottom: 24,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 12, color: T2, fontFamily: F }}>
            Analysis complete — <strong style={{ color: T1 }}>{data.business_name || url}</strong>
          </span>
        </div>
        <ScoreGauge score={data.overall_score || 0} />
      </div>

      {/* Shock insight */}
      {data.shock_insight && (
        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: 10, padding: '16px 20px', marginBottom: 28,
          fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontFamily: F,
        }}>
          {data.shock_insight}
        </div>
      )}

      {/* Category bars */}
      <div style={{ marginBottom: 28 }}>
        <Bar label="AI Visibility" value={data.ai_visibility_score || 0} delay={0} />
        <Bar label="Message Clarity" value={data.message_clarity_score || 0} delay={150} />
        <Bar label="Commercial Presence" value={data.commercial_presence_score || 0} delay={300} />
      </div>

      {/* AI sources breakdown */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <AIBadge name="ChatGPT" score={data.chatgpt_score || 0} icon="🤖" />
        <AIBadge name="Perplexity" score={data.perplexity_score || 0} icon="🔮" />
        <AIBadge name="Google AI" score={data.google_ai_score || 0} icon="🌐" />
      </div>

      {/* Tech signals */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Schema markup', ok: data.has_schema_markup },
          { label: 'Google Business', ok: data.has_google_business },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: item.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${item.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: 20, padding: '4px 12px',
          }}>
            <span style={{ fontSize: 12 }}>{item.ok ? '✓' : '✗'}</span>
            <span style={{ fontSize: 12, color: item.ok ? '#22c55e' : '#ef4444', fontFamily: F }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Issues wall */}
      {data.issues?.length > 0 && (
        <CuriosityWall issues={data.issues.slice(0, 3)} onUnlock={onUnlock} />
      )}

      {/* Final CTA */}
      <div style={{
        marginTop: 32, padding: '28px 24px', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(90,90,240,0.08), rgba(124,106,244,0.05))',
        border: '1px solid rgba(90,90,240,0.2)', borderRadius: 12,
      }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: T1, marginBottom: 8, letterSpacing: '-0.03em', fontFamily: F }}>
          Get your complete AI optimization roadmap
        </div>
        <div style={{ fontSize: 13, color: T2, marginBottom: 20, fontFamily: F }}>
          Unlock all fixes · Personalized for {data.business_name || 'your business'} · Free · 2 min
        </div>
        <button onClick={onUnlock} style={{
          fontFamily: F, fontSize: 15, fontWeight: 700,
          color: '#0A0A0B', background: T1,
          border: 'none', borderRadius: 8, padding: '14px 0', cursor: 'pointer',
          width: '100%', transition: 'opacity 150ms',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Build my AI visibility plan — free →
        </button>
      </div>
    </motion.div>
  );
}

// ── Scanning view — real 60s with organic task progression
function ScanningView({ url }) {
  // 8 meaningful tasks spread across ~60s
  const TASKS = [
    { id: 't1', label: `Fetching ${url}`, sub: 'Reading HTML, meta tags & structured data', duration: 5000 },
    { id: 't2', label: 'Parsing semantic content', sub: 'Extracting headings, body copy & entity signals', duration: 7000 },
    { id: 't3', label: 'Checking AI training corpus coverage', sub: 'Verifying presence in Common Crawl & C4 datasets', duration: 10000 },
    { id: 't4', label: 'Simulating ChatGPT knowledge probe', sub: 'Testing 12 branded & generic queries', duration: 9000 },
    { id: 't5', label: 'Running Perplexity citation analysis', sub: 'Checking if your domain is cited in live answers', duration: 9000 },
    { id: 't6', label: 'Auditing Google AI overview eligibility', sub: 'Schema markup, E-E-A-T signals & authority score', duration: 8000 },
    { id: 't7', label: 'Mapping competitor AI visibility', sub: 'Comparing vs. top 5 competitors in your segment', duration: 8000 },
    { id: 't8', label: 'Computing final visibility score', sub: 'Aggregating 47 signals across 3 AI engines', duration: 4000 },
  ];

  const [currentTask, setCurrentTask] = useState(0);
  const [doneTasks, setDoneTasks] = useState([]);
  const [progress, setProgress] = useState(2);

  const totalDuration = TASKS.reduce((s, t) => s + t.duration, 0);

  useState(() => {
    let elapsed = 0;
    const timers = TASKS.map((task, i) => {
      const t = setTimeout(() => {
        setCurrentTask(i);
        if (i > 0) setDoneTasks(d => [...d, TASKS[i - 1].id]);
        const pct = Math.round((elapsed / totalDuration) * 100);
        setProgress(Math.max(pct, 5));
      }, elapsed);
      elapsed += task.duration;
      return t;
    });
    // Final done
    const endTimer = setTimeout(() => {
      setDoneTasks(TASKS.map(t => t.id));
      setProgress(100);
    }, totalDuration);
    // Progress bar smooth
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (98 / (totalDuration / 300));
        return next > 98 ? 98 : next;
      });
    }, 300);
    return () => { timers.forEach(clearTimeout); clearTimeout(endTimer); clearInterval(interval); };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: 520, margin: '0 auto',
        background: '#111113', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '32px 36px', fontFamily: F,
      }}
    >
      {/* Progress header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Analysing your AI visibility</span>
          <span style={{ fontSize: 12, color: T3 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #5A5AF0, #7C6AF4)',
            transition: 'width 0.6s ease', borderRadius: 1,
          }} />
        </div>
        <div style={{ fontSize: 11, color: T3, marginTop: 6 }}>~60 seconds · 3 AI engines · 47 signals</div>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {TASKS.map((task, i) => {
          const isDone = doneTasks.includes(task.id);
          const isActive = currentTask === i && !isDone;
          const isPending = i > currentTask;
          return (
            <div key={task.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '13px 0',
              borderBottom: i < TASKS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              opacity: isPending ? 0.3 : 1,
              transition: 'opacity 0.5s',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: isDone ? 'rgba(34,197,94,0.15)' : 'transparent',
                border: `1.5px solid ${isDone ? 'rgba(34,197,94,0.5)' : isActive ? 'rgba(90,90,240,0.7)' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.4s',
              }}>
                {isDone ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isActive ? (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#5A5AF0',
                    animation: 'activePulse 1s ease-in-out infinite',
                  }} />
                ) : null}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13, fontWeight: isActive || isDone ? 500 : 400,
                  color: isDone ? 'rgba(255,255,255,0.6)' : isActive ? T1 : T3,
                  transition: 'all 0.3s', marginBottom: 2,
                }}>{task.label}</div>
                {(isActive || isDone) && (
                  <div style={{ fontSize: 11, color: T3, lineHeight: 1.4 }}>{task.sub}</div>
                )}
                {isActive && (
                  <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{
                        width: 3, height: 3, borderRadius: '50%',
                        background: 'rgba(90,90,240,0.6)',
                        animation: `blink 1.1s ${j * 0.18}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
              {isDone && (
                <span style={{ fontSize: 11, color: 'rgba(34,197,94,0.7)', fontWeight: 500, alignSelf: 'center', flexShrink: 0 }}>Done</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Skeleton preview */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={44} style={{ borderRadius: 10 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Skeleton height={24} width="33%" />
          <Skeleton height={24} width="33%" />
          <Skeleton height={24} width="33%" />
        </div>
        <Skeleton height={16} />
        <Skeleton height={16} width="70%" />
      </div>
      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes activePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.6)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </motion.div>
  );
}

// ── HERO INPUT
function HeroInput({ onAnalyze }) {
  const [url, setUrl] = useState('');
  const inputRef = useRef(null);

  const submit = () => {
    if (url.trim()) onAnalyze(url.trim());
    else inputRef.current?.focus();
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '4px 12px', marginBottom: 28,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
        <span style={{ fontSize: 12, color: T2, fontWeight: 500, fontFamily: F }}>3 847 analyses cette semaine</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontSize: 'clamp(38px, 5.5vw, 62px)', fontWeight: 700, color: T1,
          letterSpacing: '-0.04em', lineHeight: 1.06, margin: '0 0 18px', fontFamily: F,
        }}
      >
        ChatGPT vous recommande‑t‑il<br />à vos clients ?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ fontSize: 16, color: T2, lineHeight: 1.65, margin: '0 0 44px', fontFamily: F }}
      >
        Entrez l'adresse de votre site. On analyse 47 signaux sur<br />
        ChatGPT, Perplexity et Google AI — et vous dit si vous existez.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{
          display: 'flex', maxWidth: 580, margin: '0 auto',
          background: '#111113', border: '1.5px solid rgba(255,255,255,0.12)',
          borderRadius: 12, overflow: 'hidden',
          transition: 'border-color 200ms, box-shadow 200ms',
        }}
          onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(90,90,240,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(90,90,240,0.1)'; }}
          onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <input
            ref={inputRef}
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="https://votre-site.fr"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              padding: '17px 20px', fontSize: 15, color: T1, fontFamily: F, caretColor: '#5A5AF0',
            }}
          />
          <button onClick={submit} style={{
            fontFamily: F, fontSize: 14, fontWeight: 700,
            color: '#0A0A0B', background: T1,
            border: 'none', padding: '0 26px', cursor: 'pointer',
            whiteSpace: 'nowrap', transition: 'opacity 150ms',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Analyser →
          </button>
        </div>
        <p style={{ fontSize: 12, color: T3, marginTop: 12, fontFamily: F }}>
          Gratuit · Analyse complète en ~60 secondes
        </p>
      </motion.div>
    </div>
  );
}

// ── MAIN
export default function ScanHero({ onStartQuiz }) {
  const [phase, setPhase] = useState('hero'); // hero | scanning | results | error
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  const handleAnalyze = async (inputUrl) => {
    // Save URL so Home can auto-launch the scan after login
    localStorage.setItem('wok_pending_scan_url', inputUrl);
    setUrl(inputUrl);
    setPhase('scanning');

    // Launch scan in background immediately — don't await
    base44.functions.invoke('analyzeWebsite', { url: inputUrl })
      .then(result => {
        if (result?.data?.overall_score !== undefined) {
          setData(result.data);
        }
      })
      .catch(() => {});

    // After 2.5s of scan animation, go to quiz
    await new Promise(r => setTimeout(r, 2500));
    onStartQuiz();
  };

  return (
    <div style={{ fontFamily: F, background: BG, minHeight: '80vh' }}>
      <AnimatePresence mode="wait">
        {phase === 'hero' && (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
            <HeroInput onAnalyze={handleAnalyze} />
          </motion.div>
        )}

        {phase === 'scanning' && (
          <motion.div key="scan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: '80px 24px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: T3, fontFamily: F, marginBottom: 6 }}>Analyse en cours — 3 moteurs IA en parallèle</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: T1, fontFamily: F, letterSpacing: '-0.02em' }}>{url}</p>
            </div>
            <ScanningView url={url} onDone={() => {}} />
          </motion.div>
        )}

        {phase === 'results' && data && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: '60px 24px 80px', maxWidth: 580, margin: '0 auto' }}>
            <Results data={data} url={url} onUnlock={onStartQuiz} />
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: '100px 24px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T1, marginBottom: 8, fontFamily: F }}>Analysis failed</div>
            <div style={{ fontSize: 13, color: T2, marginBottom: 24, fontFamily: F }}>{errMsg}</div>
            <button onClick={() => setPhase('hero')} style={{
              fontFamily: F, fontSize: 14, fontWeight: 600, color: T1,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '10px 24px', cursor: 'pointer',
            }}>Try another URL</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}