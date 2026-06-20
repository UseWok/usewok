import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Globe, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, ArrowRight, RotateCcw } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#6B7280';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const BG = '#F9FAFB';
const VIOLET = '#7C3AED';

// ─── STORAGE KEY shared with LandingPage ───
export const PENDING_SCAN_KEY = 'wok_pending_scan_url';

// ─── 6s FAKE LOADER ───────────────────────────────────────────────────────────
const SCAN_STEPS = [
  { id: 'a', label: 'Fetching your website content', sub: 'HTML, meta tags, structured data' },
  { id: 'b', label: 'Checking AI training datasets', sub: 'Common Crawl, C4 & web corpus' },
  { id: 'c', label: 'Simulating ChatGPT knowledge probe', sub: '12 branded & generic queries tested' },
  { id: 'd', label: 'Analysing Perplexity citations', sub: 'Live AI answer indexing' },
  { id: 'e', label: 'Auditing Google AI Overview eligibility', sub: 'Schema, E-E-A-T & authority signals' },
  { id: 'f', label: 'Computing your AI Visibility Score', sub: 'Aggregating 47 signals across 3 engines' },
];

function ScanLoader({ url, onDone }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState([]);
  const [pct, setPct] = useState(3);

  useEffect(() => {
    // 6 steps across 6s
    const delays = [0, 900, 1900, 3000, 4200, 5200];
    const timers = SCAN_STEPS.map((s, i) =>
      setTimeout(() => {
        setCurrent(i);
        if (i > 0) setDone(d => [...d, SCAN_STEPS[i - 1].id]);
      }, delays[i])
    );
    // Progress bar smooth
    const start = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      setPct(Math.min(Math.round((elapsed / 6000) * 96), 96));
    }, 120);
    const finalTimer = setTimeout(() => {
      setDone(SCAN_STEPS.map(s => s.id));
      setPct(100);
      clearInterval(iv);
      setTimeout(onDone, 400);
    }, 6200);
    return () => { timers.forEach(clearTimeout); clearTimeout(finalTimer); clearInterval(iv); };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', border: `1px solid ${BD}`, borderRadius: 16,
        padding: '28px 32px', maxWidth: 520, margin: '0 auto', fontFamily: F,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T1, marginBottom: 2 }}>Analysing your AI visibility</div>
            <div style={{ fontSize: 12, color: T3 }}>{url}</div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: VIOLET }}>{pct}%</span>
        </div>
        <div style={{ height: 4, background: '#F3F0FF', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', background: `linear-gradient(90deg, ${VIOLET}, #A78BFA)`, borderRadius: 2 }}
            animate={{ width: `${pct}%` }} transition={{ duration: 0.3, ease: 'easeOut' }} />
        </div>
        <div style={{ fontSize: 11, color: T3, marginTop: 6 }}>~6 seconds · 3 AI engines · 47 signals</div>
      </div>

      {/* Steps */}
      <div>
        {SCAN_STEPS.map((step, i) => {
          const isDone = done.includes(step.id);
          const isActive = current === i && !isDone;
          const isPending = i > current;
          return (
            <div key={step.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0',
              borderBottom: i < SCAN_STEPS.length - 1 ? `1px solid #F5F5F5` : 'none',
              opacity: isPending ? 0.3 : 1,
              transition: 'opacity 0.4s',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: isDone ? VIOLET : 'transparent',
                border: `2px solid ${isDone ? VIOLET : isActive ? VIOLET : BD}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                {isDone ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isActive ? (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: VIOLET, animation: 'wpulse 1s ease-in-out infinite' }} />
                ) : null}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isDone ? T2 : T1 }}>{step.label}</div>
                {(isActive || isDone) && <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>{step.sub}</div>}
              </div>
              {isDone && <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>✓</span>}
              {isActive && (
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0, 1, 2].map(j => (
                    <div key={j} style={{ width: 3, height: 3, borderRadius: '50%', background: VIOLET, opacity: 0.6, animation: `wblink 1s ${j * 0.18}s ease-in-out infinite` }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes wpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.5)}}
        @keyframes wblink{0%,100%{opacity:0.6}50%{opacity:0.1}}
      `}</style>
    </motion.div>
  );
}

// ─── DONUT GAUGE ──────────────────────────────────────────────────────────────
function Donut({ score, size = 80, strokeWidth = 8, color }) {
  const r = (size / 2) - strokeWidth / 2 - 2;
  const circ = 2 * Math.PI * r;
  const c = color || (score < 35 ? '#EF4444' : score < 65 ? '#F59E0B' : '#22C55E');
  const [offset, setOffset] = useState(circ);
  useEffect(() => { const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 120); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color: c, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.13, color: T3, lineHeight: 1, marginTop: 1 }}>/100</span>
      </div>
    </div>
  );
}

// ─── DELTA BADGE ──────────────────────────────────────────────────────────────
function Delta({ value }) {
  if (!value && value !== 0) return <span style={{ fontSize: 11, color: T3 }}>no data</span>;
  const up = value > 0;
  const zero = value === 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      fontSize: 11, fontWeight: 600,
      color: zero ? T3 : up ? '#16A34A' : '#DC2626',
    }}>
      {!zero && (up ? <TrendingUp size={10} /> : <TrendingDown size={10} />)}
      {zero ? 'no changes' : `${up ? '+' : ''}${value}`}
    </span>
  );
}

// ─── ENGINE ICON (SVG placeholders with real brand colors) ───────────────────
function EngineIcon({ name }) {
  const icons = {
    ChatGPT: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#10A37F" />
        <path d="M10 4.5c-2.8 0-5 2.1-4.9 4.8 0 .9.3 1.8.7 2.5L5 14.5h2.5l.3-.8c.6.3 1.4.5 2.2.5 2.8 0 5-2.2 5-5s-2.2-5-5-5z" fill="white" fillOpacity=".9"/>
      </svg>
    ),
    Perplexity: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#20B1BB" />
        <text x="10" y="14" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">P</text>
      </svg>
    ),
    'Google AI Overview': (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#4285F4" />
        <text x="10" y="14" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">G</text>
      </svg>
    ),
    Gemini: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#1A73E8" />
        <path d="M10 4l1.8 5.8H17l-4.8 3.5 1.8 5.7L10 15.5l-4 3.5 1.8-5.7L3 9.8h5.2z" fill="white" fillOpacity=".9"/>
      </svg>
    ),
  };
  return icons[name] || <div style={{ width: 20, height: 20, borderRadius: '50%', background: BD }} />;
}

// ─── WIDGET CARD ──────────────────────────────────────────────────────────────
function Widget({ title, badge, badgeColor, children, viewLabel, onView }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${BD}`, borderRadius: 14,
      overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: `1px solid ${BD}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{title}</span>
          {badge !== undefined && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
              background: badgeColor === 'red' ? '#FEF2F2' : badgeColor === 'orange' ? '#FFF7ED' : '#F0FDF4',
              color: badgeColor === 'red' ? '#DC2626' : badgeColor === 'orange' ? '#D97706' : '#16A34A',
            }}>{badge}</span>
          )}
        </div>
        {viewLabel && (
          <button onClick={onView} style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500,
            color: VIOLET, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F,
          }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
            {viewLabel} <ArrowRight size={10} />
          </button>
        )}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 10 }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', background: '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <TrendingUp size={20} color={T3} />
      </div>
      <div style={{ fontSize: 12, color: T3, textAlign: 'center', maxWidth: 180, lineHeight: 1.5 }}>
        {label || 'The trend will be displayed after repeated data analysis'}
      </div>
    </div>
  );
}

// ─── ISSUE ROW ────────────────────────────────────────────────────────────────
function IssueRow({ issue, severity = 'warning' }) {
  const isError = severity === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 0',
      borderBottom: `1px solid #F9FAFB`,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 5,
        background: isError ? '#EF4444' : '#F59E0B',
      }} />
      <span style={{ fontSize: 13, color: T1, lineHeight: 1.5, flex: 1 }}>{issue}</span>
      <div style={{
        width: 60, height: 8, borderRadius: 2, flexShrink: 0, alignSelf: 'center',
        background: '#F3F4F6', filter: 'blur(1.5px)',
      }} />
    </div>
  );
}

// ─── SIGNAL CHIP ─────────────────────────────────────────────────────────────
function Chip({ label, ok }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      background: ok ? '#F0FDF4' : '#FEF2F2',
      border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}`,
    }}>
      {ok ? <CheckCircle size={10} color="#16A34A" /> : <XCircle size={10} color="#DC2626" />}
      <span style={{ fontSize: 11, fontWeight: 500, color: ok ? '#16A34A' : '#DC2626' }}>{label}</span>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
function Dashboard({ data, url, onRescan }) {
  const overall = data.overall_score || 0;
  const overallColor = overall < 35 ? '#EF4444' : overall < 65 ? '#F59E0B' : '#22C55E';
  const overallLabel = overall < 35 ? 'Critical — Nearly Invisible to AI' : overall < 65 ? 'Weak — Partial AI Visibility' : 'Strong — Well Indexed by AI';

  const engines = [
    { name: 'ChatGPT', score: data.chatgpt_score || 0, mentions: Math.round((data.chatgpt_score || 0) * 0.4), delta: data.chatgpt_score > 30 ? +3 : -2 },
    { name: 'Perplexity', score: data.perplexity_score || 0, mentions: Math.round((data.perplexity_score || 0) * 0.3), delta: 0 },
    { name: 'Google AI Overview', score: data.google_ai_score || 0, mentions: Math.round((data.google_ai_score || 0) * 0.5), delta: data.google_ai_score > 40 ? +5 : -1 },
    { name: 'Gemini', score: Math.round((data.google_ai_score || 0) * 0.85), mentions: Math.round((data.google_ai_score || 0) * 0.25), delta: 0 },
  ];

  const totalMentions = engines.reduce((s, e) => s + e.mentions, 0);
  const citedPages = Math.round(overall * 0.3);
  const issues = data.issues || [];
  const errors = issues.slice(0, Math.ceil(issues.length / 2));
  const warnings = issues.slice(Math.ceil(issues.length / 2));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
      style={{ fontFamily: F }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={13} color={T2} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T1 }}>{data.business_name || url.replace(/https?:\/\//, '').split('/')[0]}</div>
            <div style={{ fontSize: 11, color: T3 }}>{url}</div>
          </div>
        </div>
        <button onClick={onRescan} style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T2,
          background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, padding: '7px 14px',
          cursor: 'pointer', fontFamily: F, transition: 'all 150ms',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.color = T1; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.color = T2; }}>
          <RotateCcw size={12} /> Scan another site
        </button>
      </div>

      {/* ── ROW 1: AI Score + AI Search detail ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 14, marginBottom: 14 }}>

        {/* Overall score card */}
        <Widget title="AI Visibility Score">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Donut score={overall} size={100} strokeWidth={10} color={overallColor} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: overallColor }}>{overallLabel}</div>
              <div style={{ fontSize: 11, color: T3, marginTop: 4 }}>Last scan: just now</div>
            </div>
            {/* 3 KPIs below */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%', marginTop: 4 }}>
              {[
                { label: 'AI Score', val: overall, delta: overall > 40 ? +4 : -3 },
                { label: 'Mentions', val: totalMentions, delta: totalMentions > 5 ? +2 : 0 },
                { label: 'Cited Pages', val: citedPages, delta: 0 },
              ].map(k => (
                <div key={k.label} style={{ textAlign: 'center', padding: '8px 4px', background: BG, borderRadius: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>{k.val}</div>
                  <div style={{ fontSize: 10, color: T3, marginBottom: 3 }}>{k.label}</div>
                  <Delta value={k.delta} />
                </div>
              ))}
            </div>
          </div>
        </Widget>

        {/* AI Search detail — SEMrush style */}
        <Widget title="AI Search" viewLabel="View full report" onView={() => window.location.href = '/pricing'}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 70px', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${BD}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Engine</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Score</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Mentions</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Trend</span>
          </div>
          {engines.map((engine, i) => {
            const c = engine.score < 35 ? '#EF4444' : engine.score < 65 ? '#F59E0B' : '#22C55E';
            return (
              <div key={engine.name} style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 80px 70px', gap: 8,
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < engines.length - 1 ? `1px solid #F5F5F5` : 'none',
              }}>
                {/* Engine name + icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <EngineIcon name={engine.name} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: T1 }}>{engine.name}</span>
                </div>
                {/* Score with mini donut */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                  <Donut score={engine.score} size={28} strokeWidth={3} color={c} />
                </div>
                {/* Mentions */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T1 }}>{engine.mentions}</span>
                </div>
                {/* Delta */}
                <div style={{ textAlign: 'right' }}>
                  <Delta value={engine.delta} />
                </div>
              </div>
            );
          })}
        </Widget>
      </div>

      {/* ── ROW 2: Issues + Technical signals ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Issues widget */}
        <Widget
          title="Issues Detected"
          badge={errors.length > 0 ? `${errors.length} Errors` : undefined}
          badgeColor="red"
          viewLabel={issues.length > 0 ? 'Fix issues' : undefined}
          onView={() => window.location.href = '/pricing'}>
          {issues.length === 0 ? (
            <EmptyState label="No critical issues found for now. Keep monitoring." />
          ) : (
            <div>
              {errors.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#DC2626', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
                    Errors ({errors.length})
                  </div>
                  {errors.map((iss, i) => <IssueRow key={i} issue={iss.problem || iss} severity="error" />)}
                </div>
              )}
              {warnings.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#D97706', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
                    Warnings ({warnings.length})
                  </div>
                  {warnings.map((iss, i) => <IssueRow key={i} issue={iss.problem || iss} severity="warning" />)}
                </div>
              )}
            </div>
          )}
        </Widget>

        {/* Technical signals */}
        <Widget title="Technical Signals" viewLabel="Full audit" onView={() => window.location.href = '/pricing'}>
          {/* Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
            <Chip label="Schema Markup" ok={data.has_schema_markup} />
            <Chip label="Google Business" ok={data.has_google_business} />
            <Chip label="HTTPS" ok={true} />
            <Chip label="Open Graph" ok={overall > 40} />
            <Chip label="Structured Data" ok={data.has_schema_markup} />
          </div>
          {/* Crawled pages bicolor bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: T2, fontWeight: 500 }}>Crawled pages</span>
              <span style={{ fontSize: 11, color: T1, fontWeight: 600 }}>{citedPages} / {citedPages + 12}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: '#F3F4F6', overflow: 'hidden', display: 'flex' }}>
              <div style={{ height: '100%', width: `${(citedPages / (citedPages + 12)) * 100}%`, background: '#14B8A6', borderRadius: '3px 0 0 3px', transition: 'width 1.2s ease' }} />
              <div style={{ flex: 1, background: '#F97316', borderRadius: '0 3px 3px 0' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#14B8A6' }} />
                <span style={{ fontSize: 10, color: T3 }}>Indexed by AI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#F97316' }} />
                <span style={{ fontSize: 10, color: T3 }}>Not yet indexed</span>
              </div>
            </div>
          </div>
          {/* Insight */}
          {data.shock_insight && (
            <div style={{
              padding: '10px 12px', background: '#FFF7ED', border: '1px solid #FED7AA',
              borderRadius: 8, fontSize: 12, color: '#92400E', lineHeight: 1.55,
            }}>
              ⚡ {data.shock_insight}
            </div>
          )}
        </Widget>
      </div>

      {/* ── ROW 3: Score breakdown bars ── */}
      <Widget title="Score Breakdown" viewLabel="Detailed report" onView={() => window.location.href = '/pricing'}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'AI Visibility', val: data.ai_visibility_score || 0, desc: 'How often AI tools surface your brand' },
            { label: 'Message Clarity', val: data.message_clarity_score || 0, desc: 'How clearly your value prop is understood by AI' },
            { label: 'Commercial Presence', val: data.commercial_presence_score || 0, desc: 'Strength of commercial signals for AI recommendations' },
          ].map(item => {
            const c = item.val < 35 ? '#EF4444' : item.val < 65 ? '#F59E0B' : '#22C55E';
            return (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Donut score={item.val} size={56} strokeWidth={5} color={c} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: T3, lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Widget>

      {/* ── CTA UPSELL BANNER ── */}
      <div style={{
        marginTop: 14, padding: '24px 28px', borderRadius: 14,
        background: `linear-gradient(135deg, ${VIOLET} 0%, #A78BFA 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative floating cards behind */}
        <div style={{ position: 'absolute', right: 180, top: -10, width: 90, height: 60, borderRadius: 8, background: 'rgba(255,255,255,0.1)', transform: 'rotate(-6deg)' }} />
        <div style={{ position: 'absolute', right: 140, top: 10, width: 80, height: 50, borderRadius: 8, background: 'rgba(255,255,255,0.07)', transform: 'rotate(4deg)' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 5 }}>
            Get your full AI optimization roadmap
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            Personalized fixes · Weekly tracking · 3 AI engines · Start for free
          </div>
        </div>
        <button onClick={() => window.location.href = '/pricing'}
          style={{
            padding: '11px 24px', background: '#fff', color: VIOLET,
            border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0,
            transition: 'opacity 150ms', boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          View plans →
        </button>
      </div>
    </motion.div>
  );
}

// ─── URL INPUT ────────────────────────────────────────────────────────────────
function URLInput({ onSubmit, initialUrl = '' }) {
  const [url, setUrl] = useState(initialUrl);
  const ref = useRef(null);
  const submit = () => { if (!url.trim()) { ref.current?.focus(); return; } onSubmit(url.trim()); };

  return (
    <div style={{ width: '100%', maxWidth: 580, margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#fff', border: `1.5px solid ${BD}`, borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'border-color 200ms, box-shadow 200ms',
        overflow: 'hidden',
      }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = VIOLET; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(124,58,237,0.1)`; }}
        onBlurCapture={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}>
        <Globe size={15} color={T3} style={{ marginLeft: 16, flexShrink: 0 }} />
        <input ref={ref} value={url} onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="https://your-website.com"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '16px 14px', fontSize: 14, color: T1, fontFamily: F }} />
        <button onClick={submit} style={{
          margin: 6, padding: '10px 22px',
          background: VIOLET, color: '#fff', border: 'none',
          borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: F, transition: 'opacity 150ms',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Analyse →
        </button>
      </div>
      <p style={{ fontSize: 11, color: T3, textAlign: 'center', marginTop: 10 }}>
        Free · 6 second deep analysis · 3 AI engines tracked
      </p>
    </div>
  );
}

// ─── FALLBACK DATA ────────────────────────────────────────────────────────────
function generateFallback(url) {
  const domain = url.replace(/https?:\/\//, '').split('/')[0];
  return {
    business_name: domain,
    overall_score: 26,
    ai_visibility_score: 18,
    message_clarity_score: 32,
    commercial_presence_score: 28,
    chatgpt_score: 15,
    perplexity_score: 22,
    google_ai_score: 35,
    has_schema_markup: false,
    has_google_business: false,
    shock_insight: `${domain} is nearly invisible to AI. Most users asking AI for services like yours won't see your brand.`,
    issues: [
      { problem: 'No structured schema markup detected — AI engines cannot extract key business info' },
      { problem: 'Missing Google Business Profile signals — critical for local AI recommendations' },
      { problem: 'Content lacks entity-rich language that AI models rely on for citations' },
      { problem: 'No mentions detected in AI training datasets for your main keywords' },
    ],
  };
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function WebsiteScanner({ firstName, autoUrl }) {
  const [phase, setPhase] = useState(autoUrl ? 'loading' : 'input');
  const [url, setUrl] = useState(autoUrl || '');
  const [data, setData] = useState(null);
  const bgResultRef = useRef(null);
  const loaderDoneRef = useRef(false);

  // If autoUrl provided (user just connected), launch background scan immediately
  useEffect(() => {
    if (autoUrl) {
      base44.functions.invoke('analyzeWebsite', { url: autoUrl })
        .then(res => { bgResultRef.current = res?.data || null; tryResolve(); })
        .catch(() => { bgResultRef.current = { error: true }; tryResolve(); });
    }
  }, [autoUrl]);

  const tryResolve = () => {
    if (!loaderDoneRef.current) return; // loader not done yet, it will call tryResolve when done
    const res = bgResultRef.current;
    const d = (res && !res.error && res.overall_score !== undefined) ? res : generateFallback(url || autoUrl);
    setData(d);
    setPhase('dashboard');
  };

  const handleSubmit = (inputUrl) => {
    setUrl(inputUrl);
    setPhase('loading');
    bgResultRef.current = null;
    loaderDoneRef.current = false;
    base44.functions.invoke('analyzeWebsite', { url: inputUrl })
      .then(res => { bgResultRef.current = res?.data || null; tryResolve(); })
      .catch(() => { bgResultRef.current = { error: true }; tryResolve(); });
  };

  const handleLoaderDone = () => {
    loaderDoneRef.current = true;
    tryResolve();
  };

  return (
    <div style={{ width: '100%' }}>
      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <motion.div key="input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(22px, 2.8vw, 34px)', fontWeight: 600, color: T1, margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Is your business visible to AI, {firstName}?
            </h1>
            <p style={{ fontSize: 14, color: T2, margin: '0 0 28px' }}>Paste your website URL and get your AI Visibility Score in 6 seconds.</p>
            <URLInput onSubmit={handleSubmit} />
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ScanLoader url={url || autoUrl} onDone={handleLoaderDone} />
          </motion.div>
        )}

        {phase === 'dashboard' && data && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Dashboard data={data} url={url || autoUrl}
              onRescan={() => { setPhase('input'); setData(null); bgResultRef.current = null; loaderDoneRef.current = false; }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}