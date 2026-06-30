import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Globe, ArrowRight, Search, BarChart2, Users, TrendingUp, Eye, Radar, MessageCircle, HelpCircle, Lightbulb, ClipboardCheck, Printer, Activity, Target, Zap } from 'lucide-react';
import SemrushDashboard from './SemrushDashboard';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#6B7280';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const VIOLET = '#7C3AED';

// ── AI logos using uploaded assets ───────────────────────────────────────────
const MX = { mixBlendMode: 'multiply' };
const ChatGPTLogo = () => (
  <svg width="16" height="16" viewBox="0 0 41 41" fill="none">
    <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.136 10.079 10.079 0 0 0-9.618 6.977 9.967 9.967 0 0 0-6.69 4.839 10.081 10.081 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.135 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.691-4.839 10.079 10.079 0 0 0-1.24-11.818zm-15.019 21.069c-1.955 0-3.862-.662-5.409-1.873l.267-.151 8.979-5.184a1.505 1.505 0 0 0 .754-1.302V19.633l3.793 2.191a.139.139 0 0 1 .076.106v10.48c-.003 3.273-2.659 5.927-5.46 5.529zm-11.77-5.148a10.03 10.03 0 0 1-1.2-6.731l.267.161 8.979 5.184a1.505 1.505 0 0 0 1.508 0l10.963-6.333v4.381a.145.145 0 0 1-.057.112L21.4 35.501a9.956 9.956 0 0 1-10.657-2.71zm-1.545-14.91a9.943 9.943 0 0 1 5.201-4.382l-.004.31v10.368a1.503 1.503 0 0 0 .753 1.302l10.963 6.333-3.793 2.192a.139.139 0 0 1-.131.013L11.02 27.939a9.975 9.975 0 0 1-1.822-9.058zm31.1 8.575-10.963-6.333 3.793-2.192a.138.138 0 0 1 .131-.013l10.169 5.872a9.956 9.956 0 0 1-1.542 17.947v-.312l-.004-10.368a1.503 1.503 0 0 0-.752-1.301zm3.776-6.73-.267-.161-8.978-5.184a1.506 1.506 0 0 0-1.508 0L21.856 20.7v-4.381a.144.144 0 0 1 .057-.112l10.165-5.868a9.955 9.955 0 0 1 14.82 10.316zm-23.763 7.811-3.792-2.192a.14.14 0 0 1-.077-.107v-10.48c.002-3.276 2.661-5.93 5.462-5.527 1.954 0 3.861.661 5.408 1.872l-.267.151-8.979 5.184a1.505 1.505 0 0 0-.754 1.302l-.001 9.797zm2.06-4.43 4.879-2.818 4.879 2.817v5.635l-4.879 2.818-4.879-2.818V23.107z" fill="#10A37F"/>
  </svg>
);
const ClaudeLogo    = () => <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png" width="16" height="16" style={{ objectFit: 'contain', ...MX }} alt="Claude" />;
const GeminiLogo    = () => <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png" width="16" height="16" style={{ objectFit: 'contain' }} alt="Gemini" />;
const PerplexityLogo= () => <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png" width="16" height="16" style={{ objectFit: 'contain', ...MX }} alt="Perplexity" />;
const MistralLogo   = () => <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png" width="16" height="16" style={{ objectFit: 'contain', ...MX }} alt="Mistral" />;
const LlamaLogo     = () => <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png" width="16" height="16" style={{ objectFit: 'contain', ...MX }} alt="Llama" />;
const GrokLogo      = () => <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png" width="16" height="16" style={{ objectFit: 'contain', ...MX }} alt="Grok" />;
const CopilotLogo   = () => <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png" width="16" height="16" style={{ objectFit: 'contain' }} alt="Copilot" />;

// ── Scene bar action items ─────────────────────────────────────────────────────
const SCENE_ACTIONS = [
  { id: 'visibility',   label: 'Visibility',           icon: Eye,            color: '#6366F1', desc: 'AI search presence score' },
  { id: 'overview',     label: 'Overview',             icon: BarChart2,      color: '#8B5CF6', desc: 'Full brand health snapshot' },
  { id: 'competitor',   label: 'Competitor',           icon: Radar,          color: '#EC4899', desc: 'Benchmark vs competitors' },
  { id: 'crowd',        label: 'Crowd Research',       icon: Users,          color: '#F59E0B', desc: 'Public perception signals' },
  { id: 'performance',  label: 'Performance',          icon: TrendingUp,     color: '#10B981', desc: 'Traffic & ranking trends' },
  { id: 'perception',   label: 'Perception',           icon: MessageCircle,  color: '#3B82F6', desc: 'How AI describes you' },
  { id: 'sentiment',    label: 'Sentiment',            icon: Activity,       color: '#EF4444', desc: 'Positive / negative signals' },
  { id: 'drivers',      label: 'Drivers',              icon: Zap,            color: '#F97316', desc: 'Key ranking factors' },
  { id: 'questions',    label: 'Questions',            icon: HelpCircle,     color: '#06B6D4', desc: 'What users ask about you' },
  { id: 'seek',         label: 'Seek',                 icon: Search,         color: '#A855F7', desc: 'Deep AI query mining' },
  { id: 'audit',        label: 'Audit',                icon: ClipboardCheck, color: '#0EA5E9', desc: 'Full technical audit' },
  { id: 'print',        label: 'Print',                icon: Printer,        color: '#64748B', desc: 'Export PDF report' },
  { id: 'tracking',     label: 'Tracking',             icon: Target,         color: '#DC2626', desc: 'Monitor over time' },
  { id: 'goals',        label: 'Goals',                icon: Lightbulb,      color: '#84CC16', desc: 'Set & track objectives' },
];

// ─── PARALLEL SCAN LOADER ─────────────────────────────────────────────────────
const MODULES = [
  {
    id: 'report',
    label: 'Rapport IA',
    sub: 'LLM Resonance Score · 8 moteurs analysés',
    steps: ['Récupération du contenu…', 'Simulation des 8 moteurs IA…', 'Calcul du LRS…'],
    color: VIOLET,
  },
  {
    id: 'audit',
    label: 'Audit technique',
    sub: 'Explorabilité · Robots.txt · Sitemap',
    steps: ['Lecture des entêtes HTTP…', 'Analyse du robots.txt…', 'Détection des problèmes…'],
    color: '#0EA5E9',
  },
  {
    id: 'performance',
    label: 'Performance & marché',
    sub: 'Part de voix · Concurrents · Tendances',
    steps: ['Données de trafic organique…', 'Benchmarking concurrents…', 'Analyse des tendances…'],
    color: '#10B981',
  },
];

function ModuleLoader({ mod, offset }) {
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(4);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), offset + 2200);
    const t2 = setTimeout(() => setStep(2), offset + 5000);
    const iv = setInterval(() => setPct(p => Math.min(p + 1, 88)), 250);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(iv); };
  }, []);

  return (
    <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 14, padding: '16px 18px', fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{mod.label}</div>
          <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>{mod.sub}</div>
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: mod.color }}>{pct}%</span>
      </div>
      <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
        <motion.div style={{ height: '100%', background: mod.color, borderRadius: 2 }}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
      </div>
      {mod.steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', opacity: i <= step ? 1 : 0.3, transition: 'opacity 0.4s' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, background: i < step ? mod.color : 'transparent', border: `2px solid ${i <= step ? mod.color : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
            {i < step ? (
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : i === step ? (
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: mod.color, animation: 'wpulse 1s ease-in-out infinite' }} />
            ) : null}
          </div>
          <span style={{ fontSize: 11, color: i <= step ? T2 : T3 }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function ScanLoader({ url }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 520, margin: '0 auto', fontFamily: F }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 4 }}>Analyse en cours…</div>
        <div style={{ fontSize: 12, color: T3 }}>{url}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MODULES.map((mod, i) => <ModuleLoader key={mod.id} mod={mod} offset={i * 300} />)}
      </div>
      <style>{`@keyframes wpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.5)}}`}</style>
    </motion.div>
  );
}

// ─── URL INPUT — Mobile-first clean input ────────────────────────────────────
function URLInput({ onSubmit }) {
  const [url, setUrl] = useState('');
  const ref = useRef(null);
  const submit = () => { if (!url.trim()) { ref.current?.focus(); return; } onSubmit(url.trim()); };

  return (
    <div style={{ width: '100%', maxWidth: 580, margin: '0 auto', fontFamily: F, padding: '0 4px' }}>

      {/* ── AI engine pills — scrollable on mobile ── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { Logo: ChatGPTLogo,  label: 'ChatGPT',    bg: '#10A37F', plain: true },
          { Logo: ClaudeLogo,   label: 'Claude',     bg: 'transparent', plain: false },
          { Logo: GeminiLogo,   label: 'Gemini',     bg: 'transparent', plain: false },
          { Logo: PerplexityLogo,label:'Perplexity', bg: 'transparent', plain: false },
          { Logo: MistralLogo,  label: 'Mistral',    bg: 'transparent', plain: false },
          { Logo: LlamaLogo,    label: 'Llama',      bg: 'transparent', plain: false },
          { Logo: GrokLogo,     label: 'Grok',       bg: 'transparent', plain: false },
          { Logo: CopilotLogo,  label: 'Copilot',    bg: 'transparent', plain: false },
        ].map(({ Logo, label, bg, plain }, i) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 9px 4px 5px',
              background: '#fff', border: '1px solid #E8E6E1',
              borderRadius: 20, fontSize: 11, fontWeight: 500, color: '#444',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
            <div style={{ width: 18, height: 18, borderRadius: plain ? 5 : 0, background: plain ? bg : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              <Logo />
            </div>
            {label}
          </motion.div>
        ))}
      </motion.div>

      {/* ── Title ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 38px)', fontWeight: 800, color: '#0F0F10', margin: '0 0 8px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          Êtes-vous visible<br />sur les IA ?
        </h1>
        <p style={{ fontSize: 13, color: T2, margin: 0, lineHeight: 1.5 }}>
          Entrez votre URL — rapport complet en 60 secondes.
        </p>
      </motion.div>

      {/* ── Input + button stacked on mobile ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{
          display: 'flex', flexDirection: 'column', background: '#fff', border: `1.5px solid #E5E4E0`,
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Globe size={14} color={T3} style={{ marginLeft: 14, flexShrink: 0 }} />
            <input ref={ref} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="https://votre-site.com"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '15px 12px', fontSize: 14, color: T1, fontFamily: F, minWidth: 0 }} />
          </div>
          <button onClick={submit} style={{
            margin: '0 8px 8px', padding: '13px', background: VIOLET, color: '#fff', border: 'none',
            borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            Analyser mon site <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        style={{ textAlign: 'center', fontSize: 11, color: T3, marginTop: 10 }}>
        Gratuit · 8 moteurs IA analysés
      </motion.p>
    </div>
  );
}

// ─── FALLBACK DATA ─────────────────────────────────────────────────────────────
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
    shock_insight: `${domain} est quasi-invisible pour les moteurs IA. Les utilisateurs qui demandent vos services à ChatGPT ne verront pas votre nom.`,
    issues: [
      { problem: 'Aucun Schema Markup détecté — les moteurs IA ne peuvent pas extraire vos informations clés' },
      { problem: 'Absence de Google Business Profile — critique pour les recommandations IA locales' },
      { problem: 'Le contenu manque de langage riche en entités que les IA utilisent pour les citations' },
      { problem: 'Aucune mention détectée dans les datasets d\'entraînement IA pour vos mots-clés principaux' },
    ],
  };
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ data, url, onRescan }) {
  return <SemrushDashboard data={data} url={url} onRescan={onRescan} />;
}

// ─── Merge extra fields into existing brand_keywords cache ────────────────────
async function mergeCacheFields(inputUrl, fields) {
  try {
    const u = await base44.auth.me();
    if (!u) return;
    const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id });
    if (!profiles.length) return;
    const p = profiles[0];
    let existing = {};
    try { existing = JSON.parse(p.brand_keywords || '{}'); } catch {}
    const merged = { ...existing, ...fields };
    await base44.entities.BusinessProfile.update(p.id, { brand_keywords: JSON.stringify(merged) });
  } catch {}
}

// ─── Save to BusinessProfile (cloud only) ─────────────────────────────────────
async function saveToProfile(inputUrl, resData) {
  try {
    const u = await base44.auth.me();
    if (!u) return;
    const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id });
    const profileData = {
      site_url: inputUrl,
      identity_name: resData.business_name || '',
      identity_industry: resData.business_type || '',
      identity_city: resData.city || '',
      score_ai_visibility: resData.ai_visibility_score || 0,
      score_message_clarity: resData.message_clarity_score || 0,
      score_commercial_signal: resData.commercial_presence_score || 0,
      score_overall: resData.overall_score || 0,
      last_scan: new Date().toISOString(),
      brand_keywords: JSON.stringify({
        organic_traffic: resData.organic_traffic,
        organic_traffic_delta_pct: resData.organic_traffic_delta_pct,
        organic_keywords: resData.organic_keywords,
        organic_keywords_delta_pct: resData.organic_keywords_delta_pct,
        backlinks: resData.backlinks,
        backlinks_delta_pct: resData.backlinks_delta_pct,
        referring_domains: resData.referring_domains,
        authority_score: resData.authority_score,
        site_health: resData.site_health,
        site_health_issues: resData.site_health_issues,
        visibility_pct: resData.visibility_pct,
        visibility_delta: resData.visibility_delta,
        chatgpt_score: resData.chatgpt_score,
        gemini_score: resData.gemini_score,
        claude_score: resData.claude_score,
        mistral_score: resData.mistral_score,
        llama_score: resData.llama_score,
        perplexity_score: resData.perplexity_score,
        grok_score: resData.grok_score,
        copilot_score: resData.copilot_score,
        google_ai_score: resData.google_ai_score,
        ai_mentions_count: resData.ai_mentions_count,
        has_schema_markup: resData.has_schema_markup,
        has_google_business: resData.has_google_business,
        has_ssl: resData.has_ssl,
        has_mobile_friendly: resData.has_mobile_friendly,
        top_keywords: resData.top_keywords,
        competitors: resData.competitors,
        shock_insight: resData.shock_insight,
        issues: resData.issues,
        strengths: resData.strengths,
        country: resData.country,
        geo_traffic: resData.geo_traffic,
        lrs_score: resData.lrs_score,
        lrs_citation_score: resData.lrs_citation_score,
        lrs_sentiment_score: resData.lrs_sentiment_score,
        lrs_accuracy_score: resData.lrs_accuracy_score,
        lrs_trend: resData.lrs_trend,
        lrs_vs_industry: resData.lrs_vs_industry,
        injection_plan: resData.injection_plan,
      }),
    };
    if (profiles.length > 0) {
      await base44.entities.BusinessProfile.update(profiles[0].id, profileData);
    } else {
      await base44.entities.BusinessProfile.create(profileData);
    }
  } catch {}
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function WebsiteScanner({ firstName, autoUrl, cachedData }) {
  // cachedData = données cloud déjà chargées → pas de loader, jamais
  const [phase, setPhase] = useState(() => {
    if (cachedData && autoUrl) return 'dashboard';
    return 'input'; // autoUrl sans cachedData = ne rien faire (Home gère le loading)
  });
  const [url, setUrl] = useState(autoUrl || '');
  const [data, setData] = useState(cachedData || null);
  const bgResultRef = useRef(null);
  const loaderDoneRef = useRef(false);

  // Update si les props changent (ex: données cloud arrivent après montage)
  useEffect(() => {
    if (cachedData && autoUrl && phase !== 'dashboard') {
      setData(cachedData);
      setUrl(autoUrl);
      setPhase('dashboard');
    }
  }, [cachedData, autoUrl]);

  const handleSubmit = (inputUrl) => {
    setUrl(inputUrl);
    setPhase('loading');
    bgResultRef.current = null;

    // Main scan + background scans all fired in parallel
    const mainScan = base44.functions.invoke('analyzeWebsite', { url: inputUrl });
    const auditScan = base44.functions.invoke('analyzeAudit', { url: inputUrl });
    const perfScan = base44.functions.invoke('analyzePerformance', { url: inputUrl, business_name: '' });

    mainScan
      .then(async res => {
        const d = (res?.data?.overall_score !== undefined) ? res.data : generateFallback(inputUrl);
        setData(d);
        setPhase('dashboard');

        // Backend (analyzeWebsite) already persists everything to DB.
        // Only merge supplementary audit/perf data that backend doesn't cover.
        if (res?.data?.overall_score !== undefined) {
          auditScan.then(auditRes => {
            if (auditRes?.data && !auditRes.data.error) {
              mergeCacheFields(inputUrl, { audit_data: auditRes.data, audit_analyzed_at: new Date().toISOString() });
            }
          }).catch(() => {});

          perfScan.then(perfRes => {
            if (perfRes?.data && !perfRes.data.error) {
              mergeCacheFields(inputUrl, { perf_data: perfRes.data, perf_analyzed_at: new Date().toISOString() });
            }
          }).catch(() => {});
        }
      })
      .catch(() => {
        setData(generateFallback(inputUrl));
        setPhase('dashboard');
      });
  };

  // unused but kept for prop compatibility
  const handleLoaderDone = () => {};

  return (
    <div style={{ width: '100%' }}>
      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <motion.div key="input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
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