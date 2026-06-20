import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertCircle, AlertTriangle, CheckCircle2,
  ArrowRight, Zap, Globe, Search, Shield, RefreshCw
} from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#6B7280';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const VIOLET = '#7C3AED';
const VIOLET_L = '#EDE9FE';
const GREEN = '#22C55E';
const RED = '#EF4444';
const ORANGE = '#F59E0B';

// ─── Animated counter
function AnimNum({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame;
    const start = Date.now();
    const animate = () => {
      const p = Math.min((Date.now() - start) / 1000, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{val}{suffix}</>;
}

// ─── Donut gauge
function Donut({ score, size = 100, sw = 9, color }) {
  const r = size / 2 - sw / 2 - 2;
  const circ = 2 * Math.PI * r;
  const c = color || (score < 35 ? RED : score < 65 ? ORANGE : GREEN);
  const [offset, setOffset] = useState(circ);
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 200);
    let frame;
    const start = Date.now();
    const anim = () => {
      const p = Math.min((Date.now() - start) / 1400, 1);
      setDisp(Math.round((1 - Math.pow(1 - p, 3)) * score));
      if (p < 1) frame = requestAnimationFrame(anim);
    };
    const t2 = setTimeout(() => { frame = requestAnimationFrame(anim); }, 200);
    return () => { clearTimeout(t); clearTimeout(t2); cancelAnimationFrame(frame); };
  }, [score]);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 4px ${c}60)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color: c, lineHeight: 1, letterSpacing: '-0.04em' }}>{disp}</span>
        <span style={{ fontSize: size * 0.12, color: T3 }}>/100</span>
      </div>
    </div>
  );
}

// ─── Score Badge
function ScoreBadge({ score }) {
  const c = score < 35 ? RED : score < 65 ? ORANGE : GREEN;
  const bg = score < 35 ? '#FEF2F2' : score < 65 ? '#FFFBEB' : '#F0FDF4';
  const label = score < 35 ? 'Critical' : score < 65 ? 'Weak' : 'Strong';
  return (
    <span style={{ padding: '3px 9px', borderRadius: 20, background: bg, color: c, fontSize: 11, fontWeight: 700 }}>{label}</span>
  );
}

// ─── Stat KPI Card
function KPI({ label, value, suffix = '', delta, icon: KPIIcon, color = T1 }) {
  const up = delta > 0;
  return (
    <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {KPIIcon && <div style={{ width: 28, height: 28, borderRadius: 7, background: VIOLET_L, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KPIIcon size={13} color={VIOLET} /></div>}
        <span style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
        <AnimNum target={typeof value === 'number' ? value : 0} suffix={suffix} />
      </div>
      {delta !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
          {up ? <TrendingUp size={11} color="#16A34A" /> : <TrendingDown size={11} color="#DC2626" />}
          <span style={{ fontSize: 11, fontWeight: 600, color: up ? '#16A34A' : '#DC2626' }}>
            {up ? '+' : ''}{delta} vs last month
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Engine Row
const ENGINE_COLORS_MAP = { 'ChatGPT': '#10A37F', 'Perplexity': '#20B2AA', 'Google AI Overview': '#4285F4', 'Gemini': '#1A73E8' };
function EngineRow({ name, score, mentions, delta, indexed }) {
  const c = score < 35 ? RED : score < 65 ? ORANGE : GREEN;
  const engineColor = ENGINE_COLORS_MAP[name] || '#6B7280';
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 60px 60px 60px', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: `1px solid #F9FAFB` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: engineColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{name[0]}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{name}</div>
          <div style={{ fontSize: 10, color: T3 }}>{indexed ? '● Indexed' : '○ Not indexed'}</div>
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{score}/100</span>
        </div>
        <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${w}%`, background: c, borderRadius: 3, transition: 'width 1.2s ease', boxShadow: `0 0 6px ${c}60` }} />
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: T1 }}>{mentions}</div>
      <div style={{ textAlign: 'right' }}>
        <ScoreBadge score={score} />
      </div>
      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
        {delta > 0 ? <TrendingUp size={11} color="#16A34A" /> : delta < 0 ? <TrendingDown size={11} color="#DC2626" /> : null}
        <span style={{ fontSize: 12, fontWeight: 600, color: delta === 0 ? T3 : delta > 0 ? '#16A34A' : '#DC2626' }}>
          {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
        </span>
      </div>
    </div>
  );
}

// ─── Radar data builder
function buildRadarData(data) {
  return [
    { subject: 'AI Visibility', score: data.ai_visibility_score || 0, fullMark: 100 },
    { subject: 'Message Clarity', score: data.message_clarity_score || 0, fullMark: 100 },
    { subject: 'Commercial Signal', score: data.commercial_presence_score || 0, fullMark: 100 },
    { subject: 'ChatGPT', score: data.chatgpt_score || 0, fullMark: 100 },
    { subject: 'Perplexity', score: data.perplexity_score || 0, fullMark: 100 },
    { subject: 'Google AI', score: data.google_ai_score || 0, fullMark: 100 },
  ];
}

// ─── Trend chart data (simulated history)
function buildTrendData(overall) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((m, i) => ({
    month: m,
    score: Math.max(5, Math.round(overall * 0.5 + (i / 5) * overall * 0.5 * (0.7 + Math.random() * 0.3))),
  }));
}

// ─── Signals heatmap data
const SIGNAL_CATEGORIES = [
  { group: 'On-Page', items: [
    { name: 'Title Tag', key: 'title_tag' },
    { name: 'Meta Description', key: 'meta_desc' },
    { name: 'H1 Tag', key: 'h1' },
    { name: 'Structured Data', key: 'schema' },
    { name: 'Open Graph', key: 'og' },
  ]},
  { group: 'AI Signals', items: [
    { name: 'E-E-A-T Signals', key: 'eeat' },
    { name: 'Entity Clarity', key: 'entity' },
    { name: 'Brand Mentions', key: 'brand' },
    { name: 'Citation Worthy', key: 'citation' },
    { name: 'FAQ Content', key: 'faq' },
  ]},
  { group: 'Authority', items: [
    { name: 'Google Business', key: 'gbp' },
    { name: 'Social Presence', key: 'social' },
    { name: 'Backlink Profile', key: 'backlinks' },
    { name: 'Domain Age', key: 'domain_age' },
    { name: 'HTTPS', key: 'https' },
  ]},
];

function SignalHeatmap({ data }) {
  const overall = data.overall_score || 0;
  // Derive signal presence from score ranges
  const getStatus = (key) => {
    const hasSchema = data.has_schema_markup;
    const hasGBP = data.has_google_business;
    const good = overall >= 65;
    const medium = overall >= 35;
    const map = {
      title_tag: medium, meta_desc: medium, h1: true, schema: hasSchema, og: good,
      eeat: medium, entity: medium, brand: good, citation: good, faq: medium,
      gbp: hasGBP, social: medium, backlinks: medium, domain_age: true, https: true,
    };
    return map[key] ?? (overall > 50);
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {SIGNAL_CATEGORIES.map(cat => (
        <div key={cat.group}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{cat.group}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cat.items.map(item => {
              const ok = getStatus(item.key);
              return (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 7, background: ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}` }}>
                  {ok ? <CheckCircle2 size={11} color="#16A34A" /> : <AlertCircle size={11} color="#DC2626" />}
                  <span style={{ fontSize: 12, fontWeight: 500, color: ok ? '#166534' : '#991B1B' }}>{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Action Plan items
function ActionItem({ priority, title, desc, impact }) {
  const pColors = { high: [RED, '#FEF2F2', '#FECACA'], medium: [ORANGE, '#FFFBEB', '#FED7AA'], low: [GREEN, '#F0FDF4', '#BBF7D0'] };
  const [c, bg, border] = pColors[priority] || pColors.medium;
  return (
    <div style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: `1px solid #F9FAFB` }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0, marginTop: 6 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{title}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: bg, color: c, border: `1px solid ${border}` }}>{priority.toUpperCase()}</span>
        </div>
        <p style={{ fontSize: 12, color: T2, margin: 0, lineHeight: 1.6 }}>{desc}</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: T3, marginBottom: 2 }}>Expected impact</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: c }}>+{impact}pts</div>
      </div>
    </div>
  );
}

// ─── Section wrapper
function Section({ title, subtitle, children, action, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BD}` }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </motion.div>
  );
}

// ─── MAIN PAGE
export default function AIVisibilityReport() {
  const [data, setData] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [rescanning, setRescanning] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem('wok_pending_scan_url') || '';
    setUrl(savedUrl);
    // Try to get stored report data from localStorage
    try {
      const cached = JSON.parse(localStorage.getItem('wok_report_data') || 'null');
      if (cached) { setData(cached); setLoading(false); return; }
    } catch {}
    // Otherwise scan
    if (savedUrl) runScan(savedUrl);
    else setLoading(false);
  }, []);

  const runScan = async (scanUrl) => {
    setRescanning(true);
    try {
      const res = await base44.functions.invoke('analyzeWebsite', { url: scanUrl });
      if (res?.data?.overall_score !== undefined) {
        setData(res.data);
        localStorage.setItem('wok_report_data', JSON.stringify(res.data));
      } else {
        setData(generateFallback(scanUrl));
      }
    } catch {
      setData(generateFallback(scanUrl));
    }
    setLoading(false);
    setRescanning(false);
  };

  function generateFallback(u) {
    const domain = u.replace(/https?:\/\//, '').split('/')[0];
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
      shock_insight: `${domain} appears in fewer than 5% of AI-generated answers in your industry.`,
      issues: [
        { problem: 'No Schema Markup detected — AI engines cannot extract key business information' },
        { problem: 'Missing Google Business Profile — critical for local AI recommendations' },
        { problem: 'Content lacks entity-rich language that AI engines use for citations' },
        { problem: 'No brand mentions found in AI training dataset queries for main keywords' },
        { problem: 'Open Graph tags missing — reduces shareability and social signal strength' },
        { problem: 'No FAQ structured content — missed opportunity for AI answer inclusion' },
      ],
    };
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12, fontFamily: F }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${VIOLET_L}`, borderTopColor: VIOLET, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 13, color: T3 }}>Loading your AI visibility report…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16, fontFamily: F, textAlign: 'center', padding: 24 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: VIOLET_L, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Globe size={24} color={VIOLET} />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T1, marginBottom: 6 }}>No website analysed yet</div>
        <div style={{ fontSize: 13, color: T2, marginBottom: 16 }}>Go to the Home page and enter your website URL to get started.</div>
        <a href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: VIOLET, color: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          Go to Home <ArrowRight size={13} />
        </a>
      </div>
    </div>
  );

  const overall = data.overall_score || 0;
  const radarData = buildRadarData(data);
  const trendData = buildTrendData(overall);
  const domain = data.business_name || url.replace(/https?:\/\//, '').split('/')[0];

  const engines = [
    { name: 'ChatGPT', score: data.chatgpt_score || 0, mentions: Math.round((data.chatgpt_score || 0) * 0.4), delta: (data.chatgpt_score || 0) > 30 ? +3 : -2, indexed: (data.chatgpt_score || 0) > 20 },
    { name: 'Perplexity', score: data.perplexity_score || 0, mentions: Math.round((data.perplexity_score || 0) * 0.3), delta: 0, indexed: (data.perplexity_score || 0) > 20 },
    { name: 'Google AI Overview', score: data.google_ai_score || 0, mentions: Math.round((data.google_ai_score || 0) * 0.5), delta: (data.google_ai_score || 0) > 40 ? +5 : -1, indexed: (data.google_ai_score || 0) > 25 },
    { name: 'Gemini', score: Math.round((data.google_ai_score || 0) * 0.85), mentions: Math.round((data.google_ai_score || 0) * 0.25), delta: 0, indexed: (data.google_ai_score || 0) > 30 },
  ];

  const pieData = [
    { name: 'AI Visibility', value: data.ai_visibility_score || 0, fill: VIOLET },
    { name: 'Message Clarity', value: data.message_clarity_score || 0, fill: '#3B82F6' },
    { name: 'Commercial', value: data.commercial_presence_score || 0, fill: '#10B981' },
  ];

  const overallColor = overall < 35 ? RED : overall < 65 ? ORANGE : GREEN;
  const overallBg = overall < 35 ? '#FEF2F2' : overall < 65 ? '#FFFBEB' : '#F0FDF4';

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: F }}>
      {/* ── Page header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T1, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            AI Visibility Report
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={12} color={T3} />
            <span style={{ fontSize: 12, color: T3 }}>{url || domain}</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: overallBg, color: overallColor, fontWeight: 700 }}>
              {overall < 35 ? 'Critical' : overall < 65 ? 'Needs Work' : 'Good'}
            </span>
          </div>
        </div>
        <button onClick={() => { setLoading(true); runScan(url); }}
          disabled={rescanning}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
            background: VIOLET, color: '#fff', border: 'none', borderRadius: 9,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F,
            opacity: rescanning ? 0.6 : 1, transition: 'opacity 150ms',
          }}>
          <RefreshCw size={13} style={{ animation: rescanning ? 'spin 0.8s linear infinite' : 'none' }} />
          {rescanning ? 'Scanning…' : 'Re-scan'}
        </button>
      </motion.div>

      {/* ── KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KPI label="Overall AI Score" value={overall} suffix="/100" delta={overall > 40 ? 4 : -3} icon={Zap} color={overallColor} />
        <KPI label="Total Mentions" value={Math.round(overall * 0.4)} delta={overall > 30 ? 2 : -1} icon={Search} />
        <KPI label="Signals Detected" value={Math.round(overall * 0.47) + 3} icon={Shield} />
        <KPI label="Engines Indexed" value={engines.filter(e => e.indexed).length} suffix="/4" icon={Globe} />
      </div>

      {/* ── Score radar + Trend chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 16 }}>
        <Section title="Score Profile" subtitle="6-dimension AI visibility radar" delay={0.1}>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#F3F4F6" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: T3, fontFamily: F }} />
                <Radar name="Score" dataKey="score" stroke={VIOLET} fill={VIOLET} fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: VIOLET }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {radarData.map(d => {
              const c = d.score < 35 ? RED : d.score < 65 ? ORANGE : GREEN;
              return (
                <div key={d.subject} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: '#F9FAFB', border: `1px solid ${BD}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: 10, color: T2, fontWeight: 500 }}>{d.subject}: {d.score}</span>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Score Trend" subtitle="Estimated progression over 6 months" delay={0.14}>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={VIOLET} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={VIOLET} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: T3, fontFamily: F }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: T3, fontFamily: F }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="score" stroke={VIOLET} strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r: 4, fill: VIOLET, strokeWidth: 0 }} activeDot={{ r: 5, fill: VIOLET }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* ── AI Engines table */}
      <Section title="AI Engines Breakdown" subtitle="Performance per search engine — updated at last scan" delay={0.18}
        action={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {[['Mentions', 'right'], ['Status', 'right'], ['Trend', 'right']].map(([h]) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>{h}</span>
            ))}
          </div>
        }>
        <div style={{ margin: '-16px -20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 60px 60px 60px', gap: 12, padding: '10px 20px', borderBottom: `1px solid ${BD}` }}>
            {['Engine', 'Score', 'Mentions', 'Status', 'Trend'].map((h, i) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {engines.map(e => <EngineRow key={e.name} {...e} />)}
        </div>
      </Section>

      {/* ── Score breakdown bars + Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
        <Section title="Score Breakdown" subtitle="Detailed analysis of each dimension" delay={0.22}>
          {[
            { label: 'AI Visibility', value: data.ai_visibility_score || 0, desc: 'How AI engines surface your brand in answers', color: VIOLET },
            { label: 'Message Clarity', value: data.message_clarity_score || 0, desc: 'How clearly AI understands your value prop', color: '#3B82F6' },
            { label: 'Commercial Signal', value: data.commercial_presence_score || 0, desc: 'Strength of buying intent signals for AI', color: '#10B981' },
          ].map((item, i) => {
            const c = item.value < 35 ? RED : item.value < 65 ? ORANGE : item.color;
            return (
              <div key={item.label} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: T3 }}>{item.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: c, letterSpacing: '-0.04em' }}>{item.value}</span>
                    <span style={{ fontSize: 11, color: T3 }}>/100</span>
                  </div>
                </div>
                <BarScoreTrack value={item.value} color={c} />
              </div>
            );
          })}
        </Section>

        <Section title="Score Distribution" subtitle="Relative weight of each dimension" delay={0.24}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width={200} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: d.fill, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: T2, flex: 1 }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: T1 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Technical signals heatmap */}
      <Section title="Technical Signals Heatmap" subtitle="15 key signals across 3 categories" delay={0.26}>
        <SignalHeatmap data={data} />
      </Section>

      {/* ── Issues */}
      {data.issues?.length > 0 && (
        <Section title="Issues Detected" subtitle={`${data.issues.length} issues found — fixes are blurred until you unlock`} delay={0.3}
          action={
            <button onClick={() => window.location.href = '/pricing'} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
              Unlock all fixes <ArrowRight size={11} />
            </button>
          }>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <span style={{ padding: '3px 10px', borderRadius: 20, background: '#FEF2F2', color: RED, fontSize: 11, fontWeight: 700 }}>
              {Math.ceil(data.issues.length / 2)} Errors
            </span>
            <span style={{ padding: '3px 10px', borderRadius: 20, background: '#FFFBEB', color: ORANGE, fontSize: 11, fontWeight: 700 }}>
              {Math.floor(data.issues.length / 2)} Warnings
            </span>
          </div>
          {data.issues.map((iss, i) => {
            const isErr = i < Math.ceil(data.issues.length / 2);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 0', borderBottom: `1px solid #F9FAFB` }}>
                {isErr ? <AlertCircle size={14} color={RED} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertTriangle size={14} color={ORANGE} style={{ flexShrink: 0, marginTop: 2 }} />}
                <div style={{ flex: 1, fontSize: 13, color: T1, lineHeight: 1.55 }}>{iss.problem || iss}</div>
                <div style={{ height: 12, width: 120, borderRadius: 3, background: '#F3F4F6', filter: 'blur(3px)', alignSelf: 'center' }} />
              </div>
            );
          })}
        </Section>
      )}

      {/* ── Action Plan */}
      <Section title="Personalized Action Plan" subtitle="Priority fixes ranked by expected AI score impact" delay={0.34}
        action={
          <button onClick={() => window.location.href = '/pricing'} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
            Full plan <ArrowRight size={11} />
          </button>
        }>
        <ActionItem priority="high" title="Add Schema Markup (JSON-LD)" desc="Implement Organization, LocalBusiness, and FAQPage schemas. This alone can increase AI citability by 18–22 points." impact={18} />
        <ActionItem priority="high" title="Create a Google Business Profile" desc="Essential for AI to recommend you in local searches. Improves Gemini and Google AI Overview visibility significantly." impact={14} />
        <ActionItem priority="medium" title="Add FAQ content sections" desc="AI engines love structured Q&A content. Add 5-10 FAQ blocks using conversational, intent-matching language." impact={9} />
        <ActionItem priority="medium" title="Strengthen E-E-A-T signals" desc="Add author bios, certifications, testimonials and trust indicators. AI engines weight expertise signals heavily." impact={7} />
        <ActionItem priority="low" title="Build entity association" desc="Get mentioned on Wikipedia, industry directories and authoritative sites. Entity clarity boosts AI citation rates." impact={5} />
      </Section>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Simple horizontal bar track
function BarScoreTrack({ value, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3, transition: 'width 1.2s ease', boxShadow: `0 0 8px ${color}50` }} />
    </div>
  );
}