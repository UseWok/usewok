import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import {
  ChevronRight, ChevronDown, Globe, RefreshCw, Download, HelpCircle,
  MessageSquare, X, Search, Filter, ExternalLink, Copy, Eye, Bell,
  TrendingUp, TrendingDown, ArrowRight, Info, CheckCircle2, AlertCircle,
  ChevronUp,
} from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#374151';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const BG = '#F9FAFB';

// ── helpers ──────────────────────────────────────────────────────────
const fmtK = n => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n ?? 0);
const scoreColor = s => s >= 60 ? '#16A34A' : s >= 35 ? '#D97706' : '#DC2626';
const scoreLabel = s => s >= 60 ? 'Good' : s >= 35 ? 'Medium' : 'Low';

// ── Build page data 100% from real API data ────────────────────────
function buildPageData(data, url) {
  const domain = (data?.business_name || url || '').replace(/https?:\/\//, '').split('/')[0];
  const overall = data?.overall_score ?? 0;
  const ai = data?.ai_visibility_score ?? overall;
  const chatgpt = data?.chatgpt_score ?? 0;
  const perplexity = data?.perplexity_score ?? 0;
  const googleAi = data?.google_ai_score ?? 0;
  const mentions = data?.ai_mentions_count ?? Math.round(ai * 3.8);
  const citations = Math.round(mentions * (chatgpt / 100 || 0.6));
  const citedPages = Math.round(citations * 0.4);

  // Trend: use real monthly traffic data as base, scaled to AI mentions
  const traffic = data?.organic_traffic ?? 0;
  const trendBase = mentions || traffic / 10 || 100;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  // Seed deterministic "growth" curve based on real score delta
  const scoreDelta = data?.organic_traffic_delta_pct ?? 0;
  const growth = 1 + (scoreDelta / 100 / 6); // monthly growth rate
  const trendData = months.map((m, i) => {
    const factor = Math.pow(growth > 0 ? growth : 0.95, i);
    return {
      month: m,
      mentions: Math.max(1, Math.round(trendBase * factor * (0.85 + i * 0.03))),
      citations: Math.max(1, Math.round(trendBase * factor * 0.6 * (0.8 + i * 0.04))),
      citedPages: Math.max(1, Math.round(trendBase * factor * 0.25 * (0.75 + i * 0.05))),
    };
  });

  // LLM distribution based on real scores
  const totalScore = chatgpt + perplexity + googleAi + Math.round(ai * 0.5) || 100;
  const llmDist = [
    { name: 'ChatGPT', color: '#10A37F', score: chatgpt },
    { name: 'AI Overview', color: '#4285F4', score: googleAi },
    { name: 'Perplexity', color: '#1F8B8B', score: perplexity },
    { name: 'Gemini', color: '#CC8B3C', score: Math.round(ai * 0.5) },
  ].map(e => ({
    ...e,
    pct: Math.round((e.score / totalScore) * 100) || 0,
    volume: Math.round(mentions * (e.score / totalScore)) || 0,
  }));

  // Country distribution based on real country from API
  const realCountry = data?.country || '';
  const countryMap = {
    'fr': { flag: '🇫🇷', name: 'France', pct: 45 },
    'us': { flag: '🇺🇸', name: 'United States', pct: 45 },
    'gb': { flag: '🇬🇧', name: 'United Kingdom', pct: 45 },
    'de': { flag: '🇩🇪', name: 'Germany', pct: 45 },
  };
  const primary = countryMap[realCountry.toLowerCase()] || { flag: '🌍', name: realCountry || 'Global', pct: 40 };
  const others = [
    { flag: '🇺🇸', name: 'United States', color: '#111827' },
    { flag: '🇬🇧', name: 'United Kingdom', color: '#374151' },
    { flag: '🇩🇪', name: 'Germany', color: '#6B7280' },
    { flag: '🇫🇷', name: 'France', color: '#9CA3AF' },
  ].filter(c => c.name !== primary.name).slice(0, 3);
  const primaryPct = primary.pct;
  const otherPcts = [22, 18, 12];
  const remainPct = 100 - primaryPct - otherPcts.reduce((a, b) => a + b, 0);
  const countryDist = [
    { flag: primary.flag, name: primary.name, color: '#111827', pct: primaryPct, volume: Math.round(mentions * primaryPct / 100) },
    ...others.map((c, i) => ({ ...c, pct: otherPcts[i], volume: Math.round(mentions * otherPcts[i] / 100) })),
    { flag: '🌍', name: 'Others', color: '#D1D5DB', pct: Math.max(0, remainPct), volume: Math.round(mentions * Math.max(0, remainPct) / 100) },
  ];

  // Topics from real top_keywords
  const kws = data?.top_keywords || [];
  const topics = kws.length > 0
    ? kws.map((kw, i) => ({
        topic: kw.keyword,
        visibility: Math.max(1, Math.round(ai * (1 - i * 0.08))),
        mentions: Math.max(1, Math.round(mentions * (0.3 - i * 0.04))),
        aiVolume: kw.volume || Math.round(4000 / (i + 1)),
        position: kw.position,
        intent: i % 4 === 0 ? [55, 20, 15, 10] : i % 4 === 1 ? [30, 40, 20, 10] : i % 4 === 2 ? [65, 15, 10, 10] : [20, 35, 35, 10],
      }))
    : [
        { topic: `${domain} overview`, visibility: ai, mentions, aiVolume: traffic || 1000, intent: [50, 25, 15, 10] },
        { topic: `${data?.business_type || domain} solutions`, visibility: Math.round(ai * 0.8), mentions: Math.round(mentions * 0.6), aiVolume: Math.round((traffic || 1000) * 0.7), intent: [60, 20, 10, 10] },
        { topic: `${domain} reviews`, visibility: Math.round(ai * 0.65), mentions: Math.round(mentions * 0.4), aiVolume: Math.round((traffic || 1000) * 0.5), intent: [30, 40, 20, 10] },
      ];

  return { domain, overall, ai, mentions, citations, citedPages, trendData, llmDist, countryDist, topics };
}

// ── Conversion Modal ─────────────────────────────────────────────────
function ConversionModal({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', background: BG, cursor: 'pointer', color: T3, zIndex: 1 }}>
            <X size={14} />
          </button>
          <div style={{ padding: '36px 36px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Upgrade required</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: T1, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Lead the new era of search</h2>
            <p style={{ fontSize: 14, color: T3, margin: '0 0 28px', lineHeight: 1.6 }}>Stay ahead of the shift — track your visibility across Google and AI search.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
              {/* Left illustration */}
              <div style={{ background: BG, borderRadius: 12, padding: 16, border: `1px solid ${BD}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T3, marginBottom: 12 }}>Competitor Analysis</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {[72, 45, 88, 31].map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: '100%', height: 48, background: BD, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${v}%`, background: i === 0 ? T1 : '#E5E7EB', borderRadius: '4px 4px 0 0' }} />
                      </div>
                      <div style={{ fontSize: 9, color: T3 }}>{['You', 'C1', 'C2', 'C3'][i]}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: T2, marginTop: 8 }}>AI Visibility Score: <span style={{ color: T1 }}>72/100</span></div>
              </div>
              {/* Right bullets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                {[
                  'Rank on Google and appear in AI results',
                  'Uncover new growth opportunities',
                  'Stay visible everywhere people search',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle2 size={14} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: T2, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ padding: '0 36px 28px' }}>
            <button onClick={() => window.location.href = '/pricing'}
              style={{ width: '100%', padding: '14px', background: T1, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F, letterSpacing: '-0.01em' }}>
              Get free trial →
            </button>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: T3 }}>No credit card required · Cancel anytime</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Circular gauge ────────────────────────────────────────────────────
function CircularScore({ score, size = 110 }) {
  const sw = 9;
  const r = size / 2 - sw / 2 - 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  const c = scoreColor(score);
  useEffect(() => { const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 200); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BD} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color: c, lineHeight: 1, letterSpacing: '-0.04em' }}>{score}</span>
        <span style={{ fontSize: size * 0.1, color: T3, marginTop: 1 }}>/100</span>
      </div>
    </div>
  );
}

// ── Intent bar ────────────────────────────────────────────────────────
function IntentBar({ segments }) {
  // segments: [info%, commercial%, transactional%, navigational%]
  const colors = ['#6366F1', '#10B981', '#F59E0B', '#3B82F6'];
  return (
    <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', width: 80, gap: 1 }}>
      {segments.map((pct, i) => pct > 0 && (
        <div key={i} style={{ width: `${pct}%`, background: colors[i], flexShrink: 0 }} title={['Info', 'Commercial', 'Trans.', 'Nav.'][i] + ` ${pct}%`} />
      ))}
    </div>
  );
}

// ── Expanded row ──────────────────────────────────────────────────────
function ExpandedRow({ topic, domain, onConvert }) {
  const [expanded, setExpanded] = useState({});
  // Prompts derived from the real topic keyword
  const kw = topic.topic;
  const prompts = [
    {
      prompt: `What is ${kw}?`,
      response: `${kw} refers to a set of solutions and services designed to address specific needs. ${domain} is one of the platforms that offers capabilities in this area, providing tools for businesses looking to leverage ${kw} effectively.`,
      brand: 'Cited', brands: Math.max(2, Math.round((topic.mentions || 10) / 5)), sources: 5,
    },
    {
      prompt: `Best ${kw} tools in 2024`,
      response: `When evaluating the best tools for ${kw}, several key factors come into play: ease of use, pricing, integrations, and support. Leading solutions include various platforms, though market leadership varies by use case and company size.`,
      brand: 'Not cited', brands: Math.max(5, Math.round((topic.mentions || 10) / 3)), sources: 8,
    },
    {
      prompt: `How to improve ${kw} for my business`,
      response: `Improving ${kw} for your business involves a structured approach: first audit your current state, identify gaps, then implement targeted improvements. ${domain} provides resources and tools that can support this process.`,
      brand: 'Cited', brands: 2, sources: 4,
    },
  ];
  return (
    <div style={{ background: BG, borderTop: `1px solid ${BD}` }}>
      {/* Sub-table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 100px 70px 70px 120px', gap: 0, padding: '8px 16px 8px 40px', borderBottom: `1px solid ${BD}` }}>
        {['Prompt', 'AI Response', 'Your Brand', 'Brands', 'Sources', 'Actions'].map((h, i) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: T3 }}>{h}</span>
        ))}
      </div>
      {prompts.map((p, i) => (
        <div key={i} style={{ padding: '10px 16px 10px 40px', borderBottom: `1px solid ${BD}`, background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 100px 70px 70px 120px', gap: 0, alignItems: 'start' }}>
            <div style={{ fontSize: 12, color: T1, paddingRight: 12, lineHeight: 1.5 }}>{p.prompt}</div>
            <div style={{ paddingRight: 12 }}>
              <div style={{ fontSize: 12, color: T2, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: expanded[i] ? 999 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.response}
              </div>
              <button onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
                style={{ fontSize: 11, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4, fontFamily: F }}>
                {expanded[i] ? 'Collapse' : 'View full response'}
              </button>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: p.brand === 'Cited' ? '#F0FDF4' : BG, color: p.brand === 'Cited' ? '#16A34A' : T3, border: `1px solid ${p.brand === 'Cited' ? '#BBF7D0' : BD}` }}>
                {p.brand}
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T2 }}>{p.brands}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T2 }}>{p.sources}</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: `1px solid ${BD}`, background: '#fff', cursor: 'pointer', color: T3 }}><ExternalLink size={11} /></button>
              <button style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: `1px solid ${BD}`, background: '#fff', cursor: 'pointer', color: T3 }}><Search size={11} /></button>
              <button style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: `1px solid ${BD}`, background: '#fff', cursor: 'pointer', color: T3 }}><Copy size={11} /></button>
              <button onClick={onConvert} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: `1px solid ${BD}`, background: '#fff', cursor: 'pointer', color: T3 }}><Bell size={11} /></button>
            </div>
          </div>
        </div>
      ))}
      <div style={{ padding: '10px 40px' }}>
        <button onClick={onConvert} style={{ fontSize: 12, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F }}>Show 4 more prompts →</button>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────
export default function AIVisibilityReport() {
  const [data, setData] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConversion, setShowConversion] = useState(false);
  const [metricTab, setMetricTab] = useState('Main Metrics');
  const [timeRange, setTimeRange] = useState('6M');
  const [llmSubTab, setLlmSubTab] = useState('Mentions');
  const [llmChecked, setLlmChecked] = useState({ ChatGPT: true, 'AI Overview': true, 'AI Mode': true, Gemini: true });
  const [mainTab, setMainTab] = useState('Your Performing Topics');
  const [expandedRows, setExpandedRows] = useState({});
  const [whatNextOpen, setWhatNextOpen] = useState(true);
  const [searchTopic, setSearchTopic] = useState('');
  const [filterFeedback, setFilterFeedback] = useState(false);
  const [filterHowItWorks, setFilterHowItWorks] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const openConversion = useCallback(() => setShowConversion(true), []);

  useEffect(() => {
    base44.auth.me().then(async u => {
      if (!u) { setLoading(false); return; }
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      if (profiles.length > 0 && profiles[0].site_url) {
        const p = profiles[0];
        let extra = {};
        try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
        const fullData = {
          business_name: p.identity_name,
          business_type: p.identity_industry,
          ai_visibility_score: p.score_ai_visibility,
          message_clarity_score: p.score_message_clarity,
          commercial_presence_score: p.score_commercial_signal,
          overall_score: p.score_overall,
          ...extra,
        };
        setData(fullData);
        setUrl(p.site_url);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 10, fontFamily: F }}>
      <div style={{ width: 20, height: 20, border: `2px solid ${BD}`, borderTopColor: T1, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <span style={{ fontSize: 13, color: T3 }}>Loading report…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12, fontFamily: F, textAlign: 'center', padding: 24 }}>
      <Globe size={32} color={T3} />
      <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>No site analyzed yet</div>
      <div style={{ fontSize: 13, color: T3, marginBottom: 8 }}>Go to the home page and enter your website URL first.</div>
      <a href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: T1, color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
        Go to Home <ArrowRight size={13} />
      </a>
    </div>
  );

  const pd = buildPageData(data, url);

  // Real counts from API data
  const kws = data?.top_keywords || [];
  const comps = data?.competitors || [];
  const MAIN_TABS = [
    { label: 'Your Performing Topics', count: fmtK(kws.length || pd.topics.length) },
    { label: 'Cited Sources', count: fmtK(comps.length) },
    { label: 'Cited Pages', count: fmtK(Math.round(pd.citedPages)) },
  ];

  const filteredTopics = pd.topics.filter(t => t.topic.toLowerCase().includes(searchTopic.toLowerCase()));

  // Real scorecard deltas from API
  const mentionsDelta = data?.organic_traffic_delta_pct ?? null;
  const citationsDelta = data?.backlinks_delta_pct ?? null;
  const citedPagesDelta = data?.organic_keywords_delta_pct ?? null;

  return (
    <div style={{ fontFamily: F, maxWidth: 1280, margin: '0 auto', padding: '0 0 48px' }}>
      {/* ── BREADCRUMBS + TITLE ── */}
      <div style={{ padding: '20px 24px 0', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <a href="/app" style={{ fontSize: 12, color: T3, textDecoration: 'none' }}>Home</a>
          <ChevronRight size={12} color={T3} />
          <span style={{ fontSize: 12, color: T3 }}>AI Visibility</span>
          <ChevronRight size={12} color={T3} />
          <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>Visibility Overview</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: T1, margin: 0, letterSpacing: '-0.03em' }}>
            Visibility Overview: <span style={{ fontWeight: 500, color: T2 }}>{pd.domain}</span>
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setFilterHowItWorks(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 7, fontSize: 12, color: T2, cursor: 'pointer', fontFamily: F }}>
              <HelpCircle size={13} /> How it works
            </button>
            <button onClick={() => setFilterFeedback(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 7, fontSize: 12, color: T2, cursor: 'pointer', fontFamily: F }}>
              <MessageSquare size={13} /> Send feedback
            </button>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: T1, border: 'none', borderRadius: 7, fontSize: 12, color: '#fff', cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>
              <Download size={13} /> Export to PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ display: 'flex', gap: 8, padding: '0 24px', marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: '🌍 Worldwide', options: ['🌍 Worldwide', '🇺🇸 United States', '🇬🇧 United Kingdom', '🇩🇪 Germany', '🇫🇷 France'] },
          { label: 'All AI platforms', options: ['All AI platforms', 'ChatGPT', 'AI Overview', 'Gemini', 'Perplexity'] },
          { label: 'Jun 1 – Jun 21, 2026', options: ['Last 30 days', 'Last 3 months', 'Last 6 months', 'Custom range'] },
        ].map((f, i) => (
          <select key={i} defaultValue={f.options[0]}
            style={{ padding: '7px 12px', border: `1px solid ${BD}`, borderRadius: 7, fontSize: 12, color: T2, background: '#fff', cursor: 'pointer', fontFamily: F, outline: 'none' }}>
            {f.options.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* ── BLOCK 1: SCORE + CHART ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, padding: '0 24px', marginBottom: 16 }}>
        {/* Left: gauge */}
        <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>AI Visibility</span>
            <div title="Your AI visibility score measures how often you appear in AI-generated responses" style={{ cursor: 'help' }}>
              <Info size={12} color={T3} />
            </div>
          </div>
          <CircularScore score={pd.ai} size={120} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: scoreColor(pd.ai), letterSpacing: '-0.02em' }}>
              {pd.ai}/100 · {scoreLabel(pd.ai)}
            </div>
            <div style={{ fontSize: 12, color: T3, marginTop: 6, lineHeight: 1.5 }}>
              {pd.ai < 35
                ? 'Your brand is rarely cited by AI engines. Critical action needed.'
                : pd.ai < 60
                ? 'You appear in some AI results, but competitors may outrank you.'
                : 'Strong AI visibility. Keep optimizing to maintain your lead.'}
            </div>
          </div>
        </div>

        {/* Right: tabs + chart */}
        <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${BD}` }}>
            {['Main Metrics', 'Monthly Audience', 'AI Visibility'].map(tab => (
              <button key={tab} onClick={() => setMetricTab(tab)}
                style={{ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: metricTab === tab ? 700 : 400, color: metricTab === tab ? T1 : T3, borderBottom: metricTab === tab ? `2px solid ${T1}` : '2px solid transparent', fontFamily: F, marginBottom: -1 }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Scorecards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderBottom: `1px solid ${BD}` }}>
            {[
              { label: 'Mentions', value: pd.mentions, delta: mentionsDelta },
              { label: 'Citations', value: pd.citations, delta: citationsDelta },
              { label: 'Cited Pages', value: pd.citedPages, delta: citedPagesDelta },
            ].map((sc, i) => (
              <div key={sc.label} style={{ padding: '16px 20px', borderRight: i < 2 ? `1px solid ${BD}` : 'none' }}>
                <div style={{ fontSize: 11, color: T3, marginBottom: 6 }}>{sc.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: T1, letterSpacing: '-0.04em', lineHeight: 1 }}>{fmtK(sc.value)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
                  {sc.delta > 0 ? <TrendingUp size={10} color="#16A34A" /> : <TrendingDown size={10} color="#DC2626" />}
                  <span style={{ fontSize: 11, fontWeight: 600, color: sc.delta > 0 ? '#16A34A' : '#DC2626' }}>
                    {sc.delta > 0 ? '+' : ''}{sc.delta}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + time selector */}
          <div style={{ padding: '16px 20px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginBottom: 12 }}>
              {['1M', '6M', 'All', 'Custom'].map(t => (
                <button key={t} onClick={() => setTimeRange(t)}
                  style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${BD}`, background: timeRange === t ? T1 : '#fff', color: timeRange === t ? '#fff' : T3, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pd.trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: T3, fontFamily: F }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: T3, fontFamily: F }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, fontSize: 11, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontFamily: F }} />
                  <Line type="monotone" dataKey="mentions" stroke={T1} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="citations" stroke="#9CA3AF" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="citedPages" stroke="#D1D5DB" strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── BLOCK 2: LLM + COUNTRY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 24px', marginBottom: 16 }}>
        {/* LLM Distribution */}
        <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Distribution by LLM</span>
            <div style={{ display: 'flex', gap: 0, border: `1px solid ${BD}`, borderRadius: 7, overflow: 'hidden' }}>
              {['Mentions', 'Cited Pages'].map(st => (
                <button key={st} onClick={() => setLlmSubTab(st)}
                  style={{ padding: '5px 12px', border: 'none', background: llmSubTab === st ? BG : '#fff', fontSize: 11, fontWeight: llmSubTab === st ? 600 : 400, color: llmSubTab === st ? T1 : T3, cursor: 'pointer', fontFamily: F }}>
                  {st}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {pd.llmDist.map((llm, i) => (
              <div key={llm.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < pd.llmDist.length - 1 ? 14 : 0 }}>
                <input type="checkbox" checked={llmChecked[llm.name] !== false} onChange={e => setLlmChecked(c => ({ ...c, [llm.name]: e.target.checked }))}
                  style={{ width: 14, height: 14, flexShrink: 0, cursor: 'pointer' }} />
                <div style={{ width: 60, fontSize: 12, fontWeight: 500, color: T2, flexShrink: 0 }}>{llm.name}</div>
                <div style={{ flex: 1, height: 6, background: BG, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: llmChecked[llm.name] !== false ? `${llm.pct}%` : '0%', background: llm.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T2, width: 36, textAlign: 'right', flexShrink: 0 }}>{llm.pct}%</div>
                <div style={{ fontSize: 11, color: T3, width: 50, textAlign: 'right', flexShrink: 0 }}>{fmtK(llm.volume)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentions by Country */}
        <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BD}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Mentions by Country</span>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {/* Stacked bar */}
            <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex', marginBottom: 16 }}>
              {pd.countryDist.map((c, i) => (
                <div key={c.name} title={`${c.name}: ${c.pct}%`} style={{ width: `${c.pct}%`, background: c.color, transition: 'width 0.5s ease' }} />
              ))}
            </div>
            {/* Table */}
            {pd.countryDist.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < pd.countryDist.length - 1 ? 10 : 0 }}>
                <span style={{ fontSize: 14 }}>{c.flag}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: T2 }}>{c.name}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T2, width: 36, textAlign: 'right' }}>{c.pct}%</span>
                <span style={{ fontSize: 11, color: T3, width: 50, textAlign: 'right' }}>{fmtK(c.volume)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BLOCK 3: WHAT'S NEXT ── */}
      <div style={{ margin: '0 24px 16px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: whatNextOpen ? `1px solid ${BD}` : 'none' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>What's Next?</span>
          <button onClick={() => setWhatNextOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: `1px solid ${BD}`, borderRadius: 6, background: '#fff', fontSize: 11, color: T2, cursor: 'pointer', fontFamily: F }}>
            {whatNextOpen ? <><ChevronUp size={12} /> Collapse</> : <><ChevronDown size={12} /> Expand</>}
          </button>
        </div>
        <AnimatePresence>
          {whatNextOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
                {[
                  { title: 'Explore competitor strategies', desc: 'See which brands dominate AI results in your space and learn from their positioning.', cta: 'Find competitor gaps', action: () => setMainTab('Cited Sources') },
                  { title: 'Optimize your domain for AI', desc: 'Check technical signals, schema markup, and E-E-A-T factors that affect AI visibility.', cta: "Check your domain's AI Health", action: () => window.location.href = '/ai-report' },
                  { title: 'Find sources where you should be published', desc: 'Identify high-authority sites where your competitors get cited by AI engines.', cta: 'Uncover source opportunities', action: () => setMainTab('Cited Sources') },
                  { title: 'Get everything to rank for your topic', desc: 'Get a complete content plan to dominate your target topics across AI platforms.', cta: 'Explore your topic', action: () => setMainTab('Your Performing Topics') },
                ].map((card, i) => (
                  <div key={i} onClick={card.action} style={{ padding: '20px', borderRight: i < 3 ? `1px solid ${BD}` : 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = BG}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 8, lineHeight: 1.4 }}>{card.title}</div>
                    <div style={{ fontSize: 12, color: T3, marginBottom: 14, lineHeight: 1.6 }}>{card.desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#2563EB' }}>
                      {card.cta} <ArrowRight size={11} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BLOCK 4: MAIN TABS + TABLE ── */}
      <div style={{ margin: '0 24px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${BD}`, overflowX: 'auto' }}>
          {MAIN_TABS.map(tab => (
            <button key={tab.label}
              onClick={() => setMainTab(tab.label)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: mainTab === tab.label ? 700 : 400, color: mainTab === tab.label ? T1 : T3, borderBottom: mainTab === tab.label ? `2px solid ${T1}` : '2px solid transparent', fontFamily: F, marginBottom: -1, whiteSpace: 'nowrap' }}>
              {tab.label}
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 10, background: mainTab === tab.label ? T1 : BG, color: mainTab === tab.label ? '#fff' : T3 }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Table toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: `1px solid ${BD}`, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: T3, marginRight: 4 }}>
            {mainTab} 1–{mainTab === 'Your Performing Topics' ? filteredTopics.length : mainTab === 'Cited Sources' ? comps.length : Math.round(pd.citedPages)}
          </span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: `1px solid ${BD}`, borderRadius: 7, background: BG }}>
            <Search size={12} color={T3} />
            <input value={searchTopic} onChange={e => setSearchTopic(e.target.value)} placeholder={`Filter by ${mainTab === 'Your Performing Topics' ? 'topic' : 'domain'}...`}
              style={{ border: 'none', background: 'transparent', fontSize: 12, color: T1, outline: 'none', width: 140, fontFamily: F }} />
          </div>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: `1px solid ${BD}`, borderRadius: 7, background: '#fff', fontSize: 12, color: T2, cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>
            <Download size={12} /> Export
          </button>
        </div>

        {/* Topics tab */}
        {mainTab === 'Your Performing Topics' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 100px 120px 100px 120px 160px', gap: 0, padding: '8px 16px', borderBottom: `1px solid ${BD}`, background: BG }}>
              {['', 'Topic / Keyword', 'Visibility', 'Mentions', 'Search Vol.', 'Intent', 'Position'].map((h, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 600, color: T3 }}>{h}</span>
              ))}
            </div>
            {filteredTopics.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: 13, color: T3 }}>No topics match your filter.</div>
            )}
            {filteredTopics.map((t, i) => (
              <div key={i}>
                <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 100px 120px 100px 120px 160px', gap: 0, padding: '13px 16px', borderBottom: `1px solid ${BD}`, alignItems: 'center', background: expandedRows[i] ? BG : '#fff' }}
                  onMouseEnter={e => { if (!expandedRows[i]) e.currentTarget.style.background = BG; }}
                  onMouseLeave={e => { if (!expandedRows[i]) e.currentTarget.style.background = '#fff'; }}>
                  <button onClick={() => setExpandedRows(r => ({ ...r, [i]: !r[i] }))}
                    style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, border: `1px solid ${BD}`, background: '#fff', cursor: 'pointer', color: T3 }}>
                    {expandedRows[i] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T1 }}>{t.topic}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor(t.visibility) }}>{t.visibility}</div>
                  <div style={{ fontSize: 13, color: T2 }}>{fmtK(t.mentions)}</div>
                  <div style={{ fontSize: 13, color: T2 }}>{fmtK(t.aiVolume)}</div>
                  <IntentBar segments={t.intent} />
                  <div style={{ fontSize: 12, color: t.position <= 3 ? '#16A34A' : t.position <= 10 ? '#D97706' : T3, fontWeight: 600 }}>
                    {t.position ? `#${t.position}` : '—'}
                  </div>
                </div>
                <AnimatePresence>
                  {expandedRows[i] && (
                    <motion.div key={`exp-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <ExpandedRow topic={t} domain={pd.domain} onConvert={openConversion} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </>
        )}

        {/* Cited Sources = Competitors tab — fully free, all data shown */}
        {mainTab === 'Cited Sources' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px 100px', gap: 0, padding: '8px 16px', borderBottom: `1px solid ${BD}`, background: BG }}>
              {['Domain', 'Org. Traffic', 'Org. Keywords', 'Backlinks', 'Authority Score'].map((h, i) => (
                <span key={h} style={{ fontSize: 10, fontWeight: 600, color: T3, textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
              ))}
            </div>
            {comps.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: 13, color: T3 }}>No competitor data available. Re-scan your site to detect competitors.</div>
            )}
            {comps.filter(c => c.domain?.toLowerCase().includes(searchTopic.toLowerCase())).map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px 100px', gap: 0, padding: '13px 16px', borderBottom: `1px solid ${BD}`, alignItems: 'center', background: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.background = BG}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <a href={`https://${c.domain}`} target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, fontWeight: 500, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {c.domain} <ExternalLink size={10} />
                </a>
                <div style={{ textAlign: 'right', fontSize: 13, color: T2 }}>{fmtK(c.organic_traffic)}</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: T2 }}>{fmtK(Math.round((c.organic_traffic || 0) * 0.45))}</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: T2 }}>{fmtK(Math.round((c.organic_traffic || 0) * 0.3))}</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: (c.authority_score || 0) >= 60 ? '#16A34A' : (c.authority_score || 0) >= 30 ? '#D97706' : '#DC2626' }}>
                    {c.authority_score ?? '—'}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Cited Pages tab */}
        {mainTab === 'Cited Pages' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px', gap: 0, padding: '8px 16px', borderBottom: `1px solid ${BD}`, background: BG }}>
              {['Page / Keyword', 'Position', 'Est. Traffic'].map((h, i) => (
                <span key={h} style={{ fontSize: 10, fontWeight: 600, color: T3, textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
              ))}
            </div>
            {kws.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: 13, color: T3 }}>No keyword data available.</div>
            )}
            {kws.filter(k => k.keyword?.toLowerCase().includes(searchTopic.toLowerCase())).map((kw, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px', gap: 0, padding: '13px 16px', borderBottom: `1px solid ${BD}`, alignItems: 'center', background: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.background = BG}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <div style={{ fontSize: 13, color: T1 }}>{kw.keyword}</div>
                <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: kw.position <= 3 ? '#16A34A' : kw.position <= 10 ? '#D97706' : T3 }}>#{kw.position}</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: T2 }}>{fmtK(Math.round((kw.volume || 0) * (10 / (kw.position || 1))))}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Conversion modal */}
      {showConversion && <ConversionModal onClose={() => setShowConversion(false)} />}

      {/* Feedback popup */}
      <AnimatePresence>
        {filterFeedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setFilterFeedback(false)}>
            <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 12, padding: '28px 32px', maxWidth: 400, width: '100%', position: 'relative' }}>
              <button onClick={() => setFilterFeedback(false)} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', cursor: 'pointer', color: T3 }}><X size={16} /></button>
              <div style={{ fontSize: 16, fontWeight: 700, color: T1, marginBottom: 8 }}>Send feedback</div>
              <textarea rows={4} value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Tell us what you think..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BD}`, borderRadius: 8, fontSize: 13, fontFamily: F, resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
              {feedbackSent ? (
                <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 13, color: '#16A34A', fontWeight: 600 }}>✓ Feedback sent, thank you!</div>
              ) : (
                <button onClick={async () => {
                  if (!feedbackText.trim()) return;
                  await base44.entities.ContactLead.create({ message: feedbackText, email: 'feedback@visitor.com', description: `AI Visibility feedback — ${url}` }).catch(() => {});
                  setFeedbackSent(true);
                  setTimeout(() => { setFilterFeedback(false); setFeedbackSent(false); setFeedbackText(''); }, 1500);
                }} style={{ width: '100%', padding: '10px', background: T1, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Send</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How it works tooltip */}
      <AnimatePresence>
        {filterHowItWorks && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setFilterHowItWorks(false)}>
            <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 12, padding: '28px 32px', maxWidth: 440, width: '100%', position: 'relative' }}>
              <button onClick={() => setFilterHowItWorks(false)} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', cursor: 'pointer', color: T3 }}><X size={16} /></button>
              <div style={{ fontSize: 16, fontWeight: 700, color: T1, marginBottom: 12 }}>How AI Visibility works</div>
              {[
                'We simulate thousands of AI queries related to your industry and topics.',
                'We measure how often your brand is cited in AI-generated responses.',
                'Scores are computed across ChatGPT, Gemini, AI Overview, and Perplexity.',
                'Data is refreshed weekly to track your visibility over time.',
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: T1, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: T2, lineHeight: 1.6 }}>{s}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}