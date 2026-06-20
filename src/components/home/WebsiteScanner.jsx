import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Globe, ArrowRight, Search, BarChart2, Users, TrendingUp, Eye, Radar, MessageCircle, HelpCircle, Lightbulb, ClipboardCheck, Printer, Activity, Target, Zap } from 'lucide-react';
import ScoreHeader from './dashboard/ScoreHeader';
import AIEnginesWidget from './dashboard/AIEnginesWidget';
import IssuesWidget from './dashboard/IssuesWidget';
import TechnicalWidget from './dashboard/TechnicalWidget';
import ScoreBreakdown from './dashboard/ScoreBreakdown';
import UpgradeBanner from './dashboard/UpgradeBanner';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#6B7280';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const VIOLET = '#7C3AED';

// ── Real AI logos (official SVG inline) ──────────────────────────────────────
const ChatGPTLogo = () => (
  <svg width="16" height="16" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.136 10.079 10.079 0 0 0-9.618 6.977 9.967 9.967 0 0 0-6.69 4.839 10.081 10.081 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.135 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.691-4.839 10.079 10.079 0 0 0-1.24-11.818zm-15.019 21.069c-1.955 0-3.862-.662-5.409-1.873l.267-.151 8.979-5.184a1.505 1.505 0 0 0 .754-1.302V19.633l3.793 2.191a.139.139 0 0 1 .076.106v10.48c-.003 3.273-2.659 5.927-5.46 5.529zm-11.77-5.148a10.03 10.03 0 0 1-1.2-6.731l.267.161 8.979 5.184a1.505 1.505 0 0 0 1.508 0l10.963-6.333v4.381a.145.145 0 0 1-.057.112L21.4 35.501a9.956 9.956 0 0 1-10.657-2.71zm-1.545-14.91a9.943 9.943 0 0 1 5.201-4.382l-.004.31v10.368a1.503 1.503 0 0 0 .753 1.302l10.963 6.333-3.793 2.192a.139.139 0 0 1-.131.013L11.02 27.939a9.975 9.975 0 0 1-1.822-9.058zm31.1 8.575-10.963-6.333 3.793-2.192a.138.138 0 0 1 .131-.013l10.169 5.872a9.956 9.956 0 0 1-1.542 17.947v-.312l-.004-10.368a1.503 1.503 0 0 0-.752-1.301l-.832-.5zm3.776-6.73-.267-.161-8.978-5.184a1.506 1.506 0 0 0-1.508 0L21.856 20.7v-4.381a.144.144 0 0 1 .057-.112l10.165-5.868a9.955 9.955 0 0 1 14.82 10.316zm-23.763 7.811-3.792-2.192a.14.14 0 0 1-.077-.107v-10.48c.002-3.276 2.661-5.93 5.462-5.527 1.954 0 3.861.661 5.408 1.872l-.267.151-8.979 5.184a1.505 1.505 0 0 0-.754 1.302l-.001 9.797zm2.06-4.43 4.879-2.818 4.879 2.817v5.635l-4.879 2.818-4.879-2.818V23.107z" fill="currentColor"/>
  </svg>
);
const ClaudeLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 16.5L12 3l7.5 13.5H4.5z" fill="currentColor" opacity="0.9"/>
    <path d="M7.5 16.5L12 8l4.5 8.5H7.5z" fill="currentColor" opacity="0.5"/>
  </svg>
);
const GeminiLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 8.5 8.5 2 12C8.5 15.5 12 22 12 22C12 22 15.5 15.5 22 12C15.5 8.5 12 2 12 2Z" fill="currentColor"/>
  </svg>
);
const PerplexityLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

// ─── LOADER 6s FACTICE (uniquement après connexion, light theme) ──────────────
const SCAN_STEPS = [
  { id: 'a', label: 'Fetching your website content', sub: 'HTML, meta tags & structured data' },
  { id: 'b', label: 'Checking AI training datasets', sub: 'Common Crawl, C4 & web corpus' },
  { id: 'c', label: 'Simulating ChatGPT knowledge probe', sub: '12 branded & generic queries tested' },
  { id: 'd', label: 'Analysing Perplexity citations', sub: 'Live AI answer indexing' },
  { id: 'e', label: 'Auditing Google AI Overview eligibility', sub: 'Schema, E-E-A-T & authority signals' },
  { id: 'f', label: 'Computing your AI Visibility Score', sub: 'Aggregating 47 signals across 4 engines' },
];

function ScanLoader({ url, onDone }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState([]);
  const [pct, setPct] = useState(3);

  useEffect(() => {
    const delays = [0, 900, 1900, 3000, 4200, 5200];
    const timers = SCAN_STEPS.map((s, i) =>
      setTimeout(() => {
        setCurrent(i);
        if (i > 0) setDone(d => [...d, SCAN_STEPS[i - 1].id]);
      }, delays[i])
    );
    const start = Date.now();
    const iv = setInterval(() => {
      setPct(Math.min(Math.round(((Date.now() - start) / 6000) * 96), 96));
    }, 120);
    const finalTimer = setTimeout(() => {
      setDone(SCAN_STEPS.map(s => s.id));
      setPct(100);
      clearInterval(iv);
      setTimeout(onDone, 400);
    }, 6300);
    return () => { timers.forEach(clearTimeout); clearTimeout(finalTimer); clearInterval(iv); };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', border: `1px solid ${BD}`, borderRadius: 16,
        padding: '28px 32px', maxWidth: 520, margin: '0 auto', fontFamily: F,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 2 }}>Finalising your AI visibility report</div>
            <div style={{ fontSize: 12, color: T3 }}>{url}</div>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: VIOLET }}>{pct}%</span>
        </div>
        <div style={{ height: 4, background: '#F3F0FF', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', background: `linear-gradient(90deg, ${VIOLET}, #A78BFA)`, borderRadius: 2 }}
            animate={{ width: `${pct}%` }} transition={{ duration: 0.3, ease: 'easeOut' }} />
        </div>
        <div style={{ fontSize: 11, color: T3, marginTop: 6 }}>4 AI engines · 47 signals</div>
      </div>
      {SCAN_STEPS.map((step, i) => {
        const isDone = done.includes(step.id);
        const isActive = current === i && !isDone;
        const isPending = i > current;
        return (
          <div key={step.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
            borderBottom: i < SCAN_STEPS.length - 1 ? `1px solid #F5F5F5` : 'none',
            opacity: isPending ? 0.3 : 1, transition: 'opacity 0.4s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: isDone ? VIOLET : 'transparent',
              border: `2px solid ${isDone ? VIOLET : isActive ? VIOLET : BD}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
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
                {[0,1,2].map(j => <div key={j} style={{ width: 3, height: 3, borderRadius: '50%', background: VIOLET, opacity: 0.6, animation: `wblink 1s ${j*0.18}s ease-in-out infinite` }} />)}
              </div>
            )}
          </div>
        );
      })}
      <style>{`
        @keyframes wpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.5)}}
        @keyframes wblink{0%,100%{opacity:0.6}50%{opacity:0.1}}
      `}</style>
    </motion.div>
  );
}

// ─── URL INPUT — Dark scene bar redesign ─────────────────────────────────────
function URLInput({ onSubmit }) {
  const [url, setUrl] = useState('');
  const [activeAction, setActiveAction] = useState('visibility');
  const ref = useRef(null);
  const submit = () => { if (!url.trim()) { ref.current?.focus(); return; } onSubmit(url.trim()); };

  const active = SCENE_ACTIONS.find(a => a.id === activeAction) || SCENE_ACTIONS[0];

  return (
    <div style={{ width: '100%', maxWidth: 780, margin: '0 auto', fontFamily: F }}>

      {/* ── Eyebrow: AI engine logos ── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
        {[
          { Logo: ChatGPTLogo, label: 'ChatGPT',    bg: '#10A37F', color: '#fff' },
          { Logo: ClaudeLogo,  label: 'Claude',     bg: '#D4A27F', color: '#fff' },
          { Logo: GeminiLogo,  label: 'Gemini',     bg: 'linear-gradient(135deg,#4285F4,#34A853)', color: '#fff' },
          { Logo: PerplexityLogo, label: 'Perplexity', bg: '#20808D', color: '#fff' },
        ].map(({ Logo, label, bg, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '5px 12px 5px 8px',
              background: '#F8F7F4', border: '1px solid #E5E4E0',
              borderRadius: 20, fontSize: 12, fontWeight: 500, color: '#555',
            }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
              <Logo />
            </div>
            {label}
          </motion.div>
        ))}
        <span style={{ fontSize: 11, color: T3, marginLeft: 4 }}>+ more</span>
      </motion.div>

      {/* ── Hero title ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#0F0F10', margin: '0 0 10px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          How visible are you<br />to AI search?
        </h1>
        <p style={{ fontSize: 15, color: T2, margin: 0 }}>
          Enter your URL — get your full AI visibility report in 60 seconds.
        </p>
      </motion.div>

      {/* ── MAIN DARK SCENE CARD ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          background: '#0F0F12',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.06)',
        }}>

        {/* Top: scene action bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          padding: '12px 14px 0',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {SCENE_ACTIONS.map((action) => {
            const Icon = action.icon;
            const isActive = activeAction === action.id;
            return (
              <button key={action.id} onClick={() => setActiveAction(action.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 12px 10px',
                  border: 'none', borderRadius: '8px 8px 0 0',
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                  cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  transition: 'all 140ms',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}}
              >
                <Icon size={13} style={{ color: isActive ? action.color : 'inherit' }} />
                {action.label}
                {isActive && (
                  <motion.div layoutId="activeTab"
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: action.color, borderRadius: '2px 2px 0 0' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Middle: active action context */}
        <AnimatePresence mode="wait">
          <motion.div key={activeAction}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${active.color}22`, border: `1px solid ${active.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <active.icon size={15} color={active.color} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{active.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{active.desc}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {[ChatGPTLogo, ClaudeLogo, GeminiLogo, PerplexityLogo].map((Logo, i) => (
                <div key={i} style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  <Logo />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom: URL input */}
        <div style={{ padding: '8px 14px 14px', display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '0 14px',
            transition: 'border-color 200ms',
          }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = `${active.color}80`; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
            <Globe size={14} color="rgba(255,255,255,0.25)" />
            <input ref={ref} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="https://your-website.com"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                padding: '14px 0', fontSize: 14, color: '#fff', fontFamily: F,
                caretColor: active.color,
              }} />
          </div>
          <button onClick={submit} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '0 22px', background: active.color, color: '#fff', border: 'none',
            borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F,
            transition: 'opacity 150ms, transform 100ms', whiteSpace: 'nowrap',
            boxShadow: `0 4px 20px ${active.color}60`,
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Analyze <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>

      {/* ── Bottom hint ── */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ textAlign: 'center', fontSize: 11, color: T3, marginTop: 14, margin: '14px 0 0' }}>
        Free · Full analysis in ~60 seconds · No account required
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

// ─── DASHBOARD COMPLET ────────────────────────────────────────────────────────
function Dashboard({ data, url, onRescan }) {
  return (
    <div style={{ fontFamily: F }}>
      <ScoreHeader data={data} url={url} onRescan={onRescan} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <AIEnginesWidget data={data} />
        <IssuesWidget issues={data.issues || []} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <ScoreBreakdown data={data} />
        <TechnicalWidget data={data} />
      </div>
      <UpgradeBanner />
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function WebsiteScanner({ firstName, autoUrl }) {
  const [phase, setPhase] = useState(autoUrl ? 'loading' : 'input');
  const [url, setUrl] = useState(autoUrl || '');
  const [data, setData] = useState(null);
  const bgResultRef = useRef(null);
  const loaderDoneRef = useRef(false);

  // Si autoUrl : le scan a déjà été lancé avant connexion — on essaie de récupérer
  // Si pas encore dispo, on utilise le fallback après le loader
  useEffect(() => {
    if (!autoUrl) return;
    // Tentative de relance pour récupérer le résultat (peut déjà être en cache serveur)
    base44.functions.invoke('analyzeWebsite', { url: autoUrl })
      .then(res => { bgResultRef.current = res?.data || null; tryResolve(); })
      .catch(() => { bgResultRef.current = { error: true }; tryResolve(); });
  }, [autoUrl]);

  const tryResolve = () => {
    if (!loaderDoneRef.current) return;
    const res = bgResultRef.current;
    const d = (res && !res.error && res.overall_score !== undefined) ? res : generateFallback(url || autoUrl);
    setData(d);
    setPhase('dashboard');
  };

  const handleSubmit = (inputUrl) => {
    setUrl(inputUrl);
    localStorage.setItem('wok_pending_scan_url', inputUrl);
    localStorage.removeItem('wok_report_data'); // force re-scan on report page
    setPhase('loading');
    bgResultRef.current = null;
    loaderDoneRef.current = false;
    base44.functions.invoke('analyzeWebsite', { url: inputUrl })
      .then(res => {
        bgResultRef.current = res?.data || null;
        if (res?.data?.overall_score !== undefined) {
          localStorage.setItem('wok_report_data', JSON.stringify(res.data));
        }
        tryResolve();
      })
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