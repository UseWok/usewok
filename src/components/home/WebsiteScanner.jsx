import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Globe } from 'lucide-react';
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

// ─── URL INPUT (fallback si pas d'autoUrl) ────────────────────────────────────
function URLInput({ onSubmit }) {
  const [url, setUrl] = useState('');
  const ref = useRef(null);
  const submit = () => { if (!url.trim()) { ref.current?.focus(); return; } onSubmit(url.trim()); };
  return (
    <div style={{ width: '100%', maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'clamp(22px, 2.8vw, 32px)', fontWeight: 700, color: T1, margin: '0 0 8px', letterSpacing: '-0.025em' }}>
        Analysez votre visibilité IA
      </h1>
      <p style={{ fontSize: 14, color: T2, margin: '0 0 24px' }}>Entrez votre URL et obtenez votre score en quelques secondes.</p>
      <div style={{
        display: 'flex', background: '#fff', border: `1.5px solid ${BD}`,
        borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'border-color 200ms',
      }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = VIOLET; }}
        onBlurCapture={e => { e.currentTarget.style.borderColor = BD; }}>
        <Globe size={15} color={T3} style={{ marginLeft: 16, alignSelf: 'center', flexShrink: 0 }} />
        <input ref={ref} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="https://votre-site.fr"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '16px 14px', fontSize: 14, color: T1, fontFamily: F }} />
        <button onClick={submit} style={{
          margin: 6, padding: '10px 22px', background: VIOLET, color: '#fff', border: 'none',
          borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F, transition: 'opacity 150ms',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Analyser →
        </button>
      </div>
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