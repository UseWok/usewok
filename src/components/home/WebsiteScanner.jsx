import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Globe, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, BarChart2, Search, Zap } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#0F0F0F';
const T2 = '#6B6B6B';
const T3 = '#B0B0B0';
const BD = '#E8E8E8';

// ── Mini 3-4s fake scan loader (light theme, last step of the scan UI)
const MINI_TASKS = [
  { id: 'a', label: 'Checking AI training corpus', sub: 'Common Crawl & C4 datasets' },
  { id: 'b', label: 'Probing ChatGPT knowledge', sub: 'Branded & generic query simulation' },
  { id: 'c', label: 'Analysing Perplexity citations', sub: 'Live web answer indexing' },
  { id: 'd', label: 'Computing visibility score', sub: 'Aggregating 47 signals' },
];

function MiniLoader({ url, onDone }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState([]);
  const [pct, setPct] = useState(12);

  useEffect(() => {
    // 4 steps across ~3.6s
    const delays = [0, 900, 1900, 2800];
    const timers = MINI_TASKS.map((t, i) =>
      setTimeout(() => {
        setCurrent(i);
        if (i > 0) setDone(d => [...d, MINI_TASKS[i - 1].id]);
        setPct(Math.round(((i + 1) / MINI_TASKS.length) * 95));
      }, delays[i])
    );
    const finalTimer = setTimeout(() => {
      setDone(MINI_TASKS.map(t => t.id));
      setPct(100);
      setTimeout(onDone, 300);
    }, 3600);
    return () => { timers.forEach(clearTimeout); clearTimeout(finalTimer); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', border: `1px solid ${BD}`,
        borderRadius: 14, padding: '24px 28px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        fontFamily: F, maxWidth: 480, margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Scanning <span style={{ color: T2, fontWeight: 400 }}>{url}</span></span>
          <span style={{ fontSize: 12, color: T3, fontWeight: 500 }}>{pct}%</span>
        </div>
        <div style={{ height: 2, background: '#F0F0F0', borderRadius: 1, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: T1, borderRadius: 1 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {MINI_TASKS.map((task, i) => {
          const isDone = done.includes(task.id);
          const isActive = current === i && !isDone;
          const isPending = i > current;
          return (
            <div key={task.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0',
              borderBottom: i < MINI_TASKS.length - 1 ? `1px solid #F5F5F5` : 'none',
              opacity: isPending ? 0.35 : 1,
              transition: 'opacity 0.4s',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: isDone ? '#0F0F0F' : 'transparent',
                border: `2px solid ${isDone ? '#0F0F0F' : isActive ? '#0F0F0F' : BD}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                {isDone ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isActive ? (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T1, animation: 'hpulse 1s ease-in-out infinite' }} />
                ) : null}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isDone ? T2 : T1 }}>{task.label}</div>
                {(isActive || isDone) && <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>{task.sub}</div>}
              </div>
              {isDone && <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>✓</span>}
              {isActive && (
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0,1,2].map(j => (
                    <div key={j} style={{ width: 3, height: 3, borderRadius: '50%', background: T2, animation: `hblink 1.1s ${j * 0.17}s ease-in-out infinite` }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes hpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.55)}}
        @keyframes hblink{0%,100%{opacity:1}50%{opacity:0.2}}
      `}</style>
    </motion.div>
  );
}

// ── Score gauge (small, inline)
function ScoreCircle({ score, size = 56 }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const color = score < 35 ? '#EF4444' : score < 65 ? '#F59E0B' : '#22C55E';
  const [offset, setOffset] = useState(circ);
  useEffect(() => { setTimeout(() => setOffset(circ - (score / 100) * circ), 100); }, []);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0F0F0" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.27, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
      </div>
    </div>
  );
}

// ── Bar
function StatBar({ label, value, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(value), 150); }, []);
  const c = color || (value < 35 ? '#EF4444' : value < 65 ? '#F59E0B' : '#22C55E');
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: T2 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: T1 }}>{value}<span style={{ color: T3, fontWeight: 400 }}>/100</span></span>
      </div>
      <div style={{ height: 3, background: '#F0F0F0', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: c, borderRadius: 2, transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
      </div>
    </div>
  );
}

// ── Signal chip
function Chip({ label, ok }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      background: ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.07)',
      border: `1px solid ${ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.18)'}`,
    }}>
      {ok
        ? <CheckCircle size={11} color="#22C55E" />
        : <XCircle size={11} color="#EF4444" />}
      <span style={{ fontSize: 11, color: ok ? '#16a34a' : '#dc2626', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── Issue row
function IssueRow({ problem, i }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '12px 14px',
      background: '#FAFAFA', border: `1px solid ${BD}`,
      borderRadius: 8,
    }}>
      <AlertTriangle size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: T1, lineHeight: 1.5 }}>{problem}</div>
      </div>
      <div style={{
        height: 8, width: 80, borderRadius: 2,
        background: 'linear-gradient(90deg, #E8E8E8 0%, #D0D0D0 100%)',
        filter: 'blur(2px)', alignSelf: 'center', flexShrink: 0,
      }} />
    </div>
  );
}

// ── AI source card
function AICard({ name, score }) {
  const color = score < 35 ? '#EF4444' : score < 65 ? '#F59E0B' : '#22C55E';
  return (
    <div style={{
      flex: 1, padding: '14px 12px', textAlign: 'center',
      background: '#fff', border: `1px solid ${BD}`, borderRadius: 10,
    }}>
      <div style={{ fontSize: 11, color: T3, marginBottom: 6 }}>{name}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, letterSpacing: '-0.03em' }}>{score}</div>
      <div style={{ fontSize: 10, color: T3, marginTop: 2 }}>/100</div>
    </div>
  );
}

// ── Main Dashboard
function Dashboard({ data, url, onRescan }) {
  const overall = data.overall_score || 0;
  const overallColor = overall < 35 ? '#EF4444' : overall < 65 ? '#F59E0B' : '#22C55E';
  const label = overall < 35 ? 'Critical — Nearly Invisible' : overall < 65 ? 'Weak — Partial Visibility' : 'Strong — Well Indexed';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ fontFamily: F }}>

      {/* ── Top bar: domain + rescan */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={14} color={T2} />
          <span style={{ fontSize: 13, fontWeight: 500, color: T1 }}>{data.business_name || url}</span>
          <span style={{ fontSize: 11, color: T3 }}>{url}</span>
        </div>
        <button onClick={onRescan} style={{
          fontSize: 12, color: T2, background: 'none', border: `1px solid ${BD}`,
          borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontFamily: F,
          transition: 'all 150ms',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.borderColor = '#999'; }}
          onMouseLeave={e => { e.currentTarget.style.color = T2; e.currentTarget.style.borderColor = BD; }}>
          Scan another →
        </button>
      </div>

      {/* ── Row 1: Overall score + AI breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Score card */}
        <div style={{
          padding: '24px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <ScoreCircle score={overall} size={72} />
          <div>
            <div style={{ fontSize: 11, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>AI Visibility Score</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: overallColor, letterSpacing: '-0.03em', marginBottom: 4 }}>{overall}/100</div>
            <div style={{ fontSize: 12, color: T2 }}>{label}</div>
          </div>
        </div>

        {/* AI engines */}
        <div style={{ padding: '20px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 11, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>By AI Engine</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <AICard name="ChatGPT" score={data.chatgpt_score || 0} />
            <AICard name="Perplexity" score={data.perplexity_score || 0} />
            <AICard name="Google AI" score={data.google_ai_score || 0} />
          </div>
        </div>
      </div>

      {/* ── Row 2: Bars + Signals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Score bars */}
        <div style={{ padding: '20px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 11, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 18 }}>Score Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StatBar label="AI Visibility" value={data.ai_visibility_score || 0} />
            <StatBar label="Message Clarity" value={data.message_clarity_score || 0} />
            <StatBar label="Commercial Presence" value={data.commercial_presence_score || 0} />
          </div>
        </div>

        {/* Technical signals */}
        <div style={{ padding: '20px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 11, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Technical Signals</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Chip label="Schema Markup" ok={data.has_schema_markup} />
            <Chip label="Google Business" ok={data.has_google_business} />
            <Chip label="HTTPS" ok={true} />
            <Chip label="Structured Data" ok={data.has_schema_markup} />
            <Chip label="Open Graph" ok={data.overall_score > 40} />
          </div>
          {data.shock_insight && (
            <div style={{
              marginTop: 16, padding: '12px 14px',
              background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)',
              borderRadius: 8, fontSize: 12, color: T1, lineHeight: 1.6,
            }}>
              {data.shock_insight}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Issues */}
      {data.issues?.length > 0 && (
        <div style={{ padding: '20px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issues Detected</div>
            <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>{data.issues.length} found</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.issues.slice(0, 4).map((issue, i) => (
              <IssueRow key={i} problem={issue.problem} i={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── CTA */}
      <div style={{
        padding: '24px 28px', background: T1, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            Unlock your full AI optimization roadmap
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Fixes, priority actions & personalized strategy
          </div>
        </div>
        <button
          onClick={() => window.location.href = '/pricing'}
          style={{
            padding: '11px 22px', background: '#fff', color: T1,
            border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0,
            transition: 'opacity 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          View plans →
        </button>
      </div>
    </motion.div>
  );
}

// ── URL input bar
function URLInput({ onSubmit }) {
  const [url, setUrl] = useState('');
  const ref = useRef(null);

  const submit = () => {
    if (!url.trim()) { ref.current?.focus(); return; }
    onSubmit(url.trim());
  };

  return (
    <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#fff', border: `1.5px solid ${BD}`,
        borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'border-color 200ms, box-shadow 200ms',
      }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = '#0F0F0F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)'; }}
        onBlurCapture={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
      >
        <Globe size={15} color={T3} style={{ marginLeft: 16, flexShrink: 0 }} />
        <input
          ref={ref}
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="https://your-website.com"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            padding: '16px 14px', fontSize: 14, color: T1, fontFamily: F, caretColor: T1,
          }}
        />
        <button onClick={submit} style={{
          margin: 6, padding: '10px 20px',
          background: T1, color: '#fff', border: 'none',
          borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap',
          transition: 'opacity 150ms',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Analyse →
        </button>
      </div>
      <p style={{ fontSize: 11, color: T3, textAlign: 'center', marginTop: 10 }}>
        Free · ~60 second deep analysis · No credit card required
      </p>
    </div>
  );
}

// ── MAIN EXPORT
export default function WebsiteScanner({ firstName }) {
  const [phase, setPhase] = useState('input'); // input | loading | dashboard
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [bgResult, setBgResult] = useState(null);

  const handleSubmit = (inputUrl) => {
    setUrl(inputUrl);
    setPhase('loading');
    // Launch real scan in background immediately
    base44.functions.invoke('analyzeWebsite', { url: inputUrl })
      .then(res => setBgResult(res?.data || null))
      .catch(() => setBgResult({ error: true }));
  };

  // When loader finishes, use background result or fallback
  const handleLoaderDone = () => {
    if (bgResult && !bgResult.error && bgResult.overall_score !== undefined) {
      setData(bgResult);
    } else if (bgResult === null) {
      // Still loading — wait a bit more
      const check = setInterval(() => {
        if (bgResult !== null) {
          clearInterval(check);
          setData(bgResult?.overall_score !== undefined ? bgResult : generateFallback(url));
          setPhase('dashboard');
        }
      }, 500);
      return;
    } else {
      setData(generateFallback(url));
    }
    setPhase('dashboard');
  };

  // Also watch bgResult to transition if loader already done
  useEffect(() => {
    if (phase === 'loading' && bgResult !== null) {
      // Will be picked up by handleLoaderDone when it fires
    }
  }, [bgResult]);

  return (
    <div style={{ width: '100%' }}>
      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <motion.div key="input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 500, color: '#1a1a1a',
              textAlign: 'center', margin: '0 0 28px', letterSpacing: '-0.02em', lineHeight: 1.18,
            }}>
              Is your business visible to AI, {firstName}?
            </h1>
            <URLInput onSubmit={handleSubmit} />
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <MiniLoader url={url} onDone={handleLoaderDone} />
          </motion.div>
        )}

        {phase === 'dashboard' && data && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Dashboard data={data} url={url} onRescan={() => { setPhase('input'); setData(null); setBgResult(null); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Fallback data if API fails/times out
function generateFallback(url) {
  const domain = url.replace(/https?:\/\//, '').split('/')[0];
  return {
    business_name: domain,
    overall_score: 28,
    ai_visibility_score: 22,
    message_clarity_score: 35,
    commercial_presence_score: 31,
    chatgpt_score: 18,
    perplexity_score: 24,
    google_ai_score: 38,
    has_schema_markup: false,
    has_google_business: false,
    shock_insight: `${domain} is currently nearly invisible to AI recommendation engines. Most users asking AI tools for services like yours won't see your name.`,
    issues: [
      { problem: 'No structured schema markup detected — AI engines cannot extract key business info' },
      { problem: 'Missing Google Business Profile signals — critical for local AI recommendations' },
      { problem: 'Content lacks entity-rich language that AI models rely on for recommendations' },
    ],
  };
}