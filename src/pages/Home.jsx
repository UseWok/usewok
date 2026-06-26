import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Trash2, ArrowUp, Link2, BarChart2, ClipboardCheck, TrendingUp, Mic, Zap, Loader, AlertCircle, ChevronDown, ArrowRight, Check } from 'lucide-react';
import { setActiveDomain } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';
import { getWokFeatures, getWokPlanId } from '@/lib/wok-plans';

// ── Design System ─────────────────────────────────────────────────────────────
const F       = "'Inter', -apple-system, system-ui, sans-serif";
const BG      = '#F9F8F5';
const CARD_BG = '#5A5756';
const WHITE   = '#FFFFFF';
const INK     = '#111110';    // noir pur pour textes et icônes
const INK2    = '#6B6762';
const INK3    = '#A8A49F';
const BORDER  = '#E8E5DF';
const CORAL   = '#F17B5D';
const MAX_DOMAINS = 10;

const getDomain    = (url) => (url || '').replace(/https?:\/\//, '').split('/')[0];
const getFirstName = (n)   => (n || '').split(' ')[0] || 'vous';

const AV_COLORS = ['#9CA3AF', CORAL, '#4B83DB', '#22A87A', '#8B5CF6', '#D97706'];
function avatarBg(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}
function initials(name) {
  const p = (name || '').trim().split(/[\s\-\.]+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return (name || '??').slice(0, 2).toUpperCase();
}

// ── Moteurs IA disponibles (dropdown) ─────────────────────────────────────────
const AI_ENGINES = [
  {
    id: 'auto', label: 'Automatique',
    sub: 'Le meilleur modèle IA est sélectionné pour chaque requête',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    id: 'gemini', label: 'Gemini 1.5 Pro',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.9 7.1 6.9 16.9 12 22c5.1-5.1 5.1-14.9 0-20z" fill="#4285F4"/>
        <path d="M2 12C7.1 6.9 16.9 6.9 22 12c-5.1 5.1-14.9 5.1-20 0z" fill="#EA4335"/>
        <path d="M12 2c5.1 5.1 5.1 14.9 0 20C6.9 16.9 6.9 7.1 12 2z" fill="#FBBC04" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 'claude_sonnet', label: 'Claude Sonnet 4.6',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 8.5v7L12 21l8-5.5v-7L12 3z" fill="#D97757" opacity="0.9"/>
        <path d="M12 3v18M4 8.5L20 15.5M20 8.5L4 15.5" stroke="#fff" strokeWidth="1" opacity="0.3"/>
      </svg>
    ),
  },
  {
    id: 'claude_opus46', label: 'Claude Opus 4.6',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 8.5v7L12 21l8-5.5v-7L12 3z" fill="#C06040" opacity="0.9"/>
        <path d="M12 3v18M4 8.5L20 15.5M20 8.5L4 15.5" stroke="#fff" strokeWidth="1" opacity="0.3"/>
      </svg>
    ),
  },
  {
    id: 'claude_opus48', label: 'Claude Opus 4.8',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 8.5v7L12 21l8-5.5v-7L12 3z" fill="#9B3020" opacity="0.9"/>
        <path d="M12 3v18M4 8.5L20 15.5M20 8.5L4 15.5" stroke="#fff" strokeWidth="1" opacity="0.3"/>
      </svg>
    ),
  },
  {
    id: 'gpt55', label: 'GPT-5.5',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.6">
        <path d="M12 2a5.5 5.5 0 0 1 5.17 7.39A5.5 5.5 0 0 1 12 22a5.5 5.5 0 0 1-5.17-7.39A5.5 5.5 0 0 1 12 2z"/>
        <path d="M2.65 9A5.5 5.5 0 0 1 9 6.83M21.35 15A5.5 5.5 0 0 1 15 17.17M9 17.17A5.5 5.5 0 0 1 2.65 15M15 6.83A5.5 5.5 0 0 1 21.35 9"/>
      </svg>
    ),
  },
  {
    id: 'perplexity', label: 'Perplexity',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#20808D" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/>
      </svg>
    ),
  },
  {
    id: 'mistral', label: 'Mistral Large',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" fill="#F97316"/>
        <rect x="9.5" y="2" width="5" height="5" rx="1" fill="#F97316"/>
        <rect x="17" y="2" width="5" height="5" rx="1" fill="#F97316"/>
        <rect x="2" y="9.5" width="5" height="5" rx="1" fill="#F97316" opacity="0.7"/>
        <rect x="17" y="9.5" width="5" height="5" rx="1" fill="#F97316" opacity="0.7"/>
        <rect x="2" y="17" width="5" height="5" rx="1" fill="#F97316" opacity="0.5"/>
        <rect x="17" y="17" width="5" height="5" rx="1" fill="#F97316" opacity="0.5"/>
      </svg>
    ),
  },
];

// ── Dropdown moteurs multi-sélection ──────────────────────────────────────────
function EnginesDropdown({ selected, onToggle, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 9000,
      background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12,
      minWidth: 280, overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    }}>
      {AI_ENGINES.map((e, i) => {
        const isSelected = selected.includes(e.id);
        return (
          <div key={e.id}
            onClick={() => onToggle(e.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
              cursor: 'pointer',
              background: isSelected ? '#F4F2EE' : WHITE,
              borderBottom: i < AI_ENGINES.length - 1 ? `1px solid #F0EDE8` : 'none',
              transition: 'background 120ms',
            }}
            onMouseEnter={e2 => { if (!isSelected) e2.currentTarget.style.background = '#FAFAF7'; }}
            onMouseLeave={e2 => { e2.currentTarget.style.background = isSelected ? '#F4F2EE' : WHITE; }}>
            <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {e.logo}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: isSelected ? 600 : 400, color: INK }}>{e.label}</div>
              {e.sub && <div style={{ fontSize: 11.5, color: INK3, marginTop: 1, lineHeight: 1.4 }}>{e.sub}</div>}
            </div>
            {isSelected && <Check size={15} color={INK} strokeWidth={2.2} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Scan logic ─────────────────────────────────────────────────────────────────
async function runScan(inputUrl, userId, features) {
  const fn = features?.scan_type === 'full' ? 'analyzeWebsite' : 'analyzeWebsiteLite';
  const res = await base44.functions.invoke(fn, { url: inputUrl });
  const d = res?.data || {};
  if (features?.scan_type === 'full') {
    const [audit, perf] = await Promise.all([
      base44.functions.invoke('analyzeAudit', { url: inputUrl }).catch(() => ({ data: {} })),
      base44.functions.invoke('analyzePerformance', { url: inputUrl, business_name: d.business_name || '' }).catch(() => ({ data: {} })),
    ]);
    d.audit_data = audit?.data || {};
    d.perf_data = perf?.data || {};
    d.audit_analyzed_at = new Date().toISOString();
    d.perf_analyzed_at = new Date().toISOString();
  }
  d.scan_type = features?.scan_type || 'lite';
  const brand_keywords = await uploadProfileData(d);
  const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: userId }).catch(() => []);
  const existing = profiles.find(p => p.site_url === inputUrl);
  const fields = {
    site_url: inputUrl, identity_name: d.business_name || '',
    identity_industry: d.business_type || '', identity_city: d.city || '',
    score_ai_visibility: d.ai_visibility_score || 0,
    score_message_clarity: d.message_clarity_score || 0,
    score_commercial_signal: d.commercial_presence_score || 0,
    score_overall: d.overall_score || 0,
    last_scan: new Date().toISOString(), brand_keywords, active: true,
  };
  if (existing) await base44.entities.BusinessProfile.update(existing.id, fields);
  else await base44.entities.BusinessProfile.create({ ...fields, created_by_id: userId });
  return d;
}

// ── Grand donut (carte score) ──────────────────────────────────────────────────
function BigDonut({ score }) {
  const size = 68, sw = 6, R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  const color = score >= 65 ? '#22C55E' : score >= 30 ? CORAL : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score/100)}
          strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── Petit donut (liste domaines) ───────────────────────────────────────────────
function SmallDonut({ score }) {
  const size = 46, sw = 3.5, R = (size - sw) / 2 - 1;
  const circ = 2 * Math.PI * R;
  const color = score >= 65 ? '#22C55E' : score >= 30 ? CORAL : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={BORDER} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score/100)}
          strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK }}>{score}</span>
      </div>
    </div>
  );
}

// ── Carte module — hover simple sans animation ─────────────────────────────────
function ModuleCard({ label, sub, Icon, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
        padding: '14px 12px', borderRadius: 12, cursor: 'pointer',
        background: hov ? '#EEECE8' : WHITE,
        border: `1px solid ${BORDER}`,
        textAlign: 'left', fontFamily: F, width: '100%', outline: 'none',
        transition: 'background 140ms',
      }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: hov ? WHITE : '#F2F0EB',
        border: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 140ms',
      }}>
        <Icon size={16} color={INK} strokeWidth={1.7} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: 11, color: INK3, marginTop: 3, fontWeight: 400 }}>{sub}</div>
      </div>
    </button>
  );
}

// ── Scan loader ────────────────────────────────────────────────────────────────
function ScanLoader({ url }) {
  const [step, setStep] = useState(0);
  const steps = ['Récupération du site…','Simulation IA en cours…','Calcul du LRS…','Génération du rapport…'];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s+1, steps.length-1)), 8000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: CARD_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: F }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.12)`, borderTopColor: CORAL, animation: 'spin 0.9s linear infinite', marginBottom: 18 }} />
      <div style={{ fontSize: 19, fontWeight: 700, color: WHITE, marginBottom: 5 }}>Analyse de <span style={{ color: CORAL }}>{getDomain(url)}</span></div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>8 moteurs IA · ~60 secondes</div>
      <div style={{ width: '100%', maxWidth: 320, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 18px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.5s' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: i < step ? CORAL : 'transparent', border: `2px solid ${i <= step ? CORAL : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i < step && <svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {i === step && <div style={{ width: 4, height: 4, borderRadius: '50%', background: CORAL, animation: 'pulse 1s ease-in-out infinite' }} />}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{s}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

// ── ScanHero ──────────────────────────────────────────────────────────────────
function ScanHero({ onScan }) {
  const [url, setUrl] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: F, background: BG }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em', textAlign: 'center' }}>Êtes-vous recommandé par les IA ?</h1>
      <p style={{ fontSize: 14, color: INK3, margin: '0 0 28px', textAlign: 'center' }}>Votre score LRS en 60 secondes — 8 moteurs IA analysés.</p>
      <div style={{ width: '100%', maxWidth: 480, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', padding: '9px 9px 9px 16px', gap: 8 }}>
        <Plus size={14} color={INK3} strokeWidth={1.7} style={{ flexShrink: 0 }} />
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && url.trim() && onScan(url.trim())}
          placeholder="Rechercher un domaine, lancer une analyse…" autoFocus
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: INK, fontFamily: F }} />
        <button onClick={() => url.trim() && onScan(url.trim())}
          style={{ width: 34, height: 34, borderRadius: '50%', background: CORAL, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowUp size={14} color={WHITE} strokeWidth={2.2} />
        </button>
      </div>
      <p style={{ fontSize: 11, color: INK3, marginTop: 10 }}>Gratuit · Résultat instantané · Aucune carte requise</p>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [activeUrl, setActiveUrl] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stensor_active_domain') || 'null')?.url || null; } catch { return null; }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [scanningUrls, setScanningUrls] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showEngines, setShowEngines] = useState(false);
  const [selectedEngines, setSelectedEngines] = useState(['auto']);
  const scanningRef = useRef({});

  const loadAll = async () => {
    try {
      const u = await base44.auth.me();
      if (!u) return;
      setUser(u);
      const list = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const enriched = await Promise.all(list.map(async p => {
        const extra = await getProfileData(p).catch(() => ({}));
        return { ...p, ...extra };
      }));
      setProfiles(enriched);
      if (!activeUrl && enriched.length > 0) {
        const first = enriched[0];
        setActiveUrl(first.site_url);
        setActiveDomain({ url: first.site_url, name: first.identity_name || getDomain(first.site_url) });
      }
    } catch {}
  };

  useEffect(() => { loadAll(); }, []);

  const switchDomain = (p) => {
    setActiveUrl(p.site_url);
    setActiveDomain({ url: p.site_url, name: p.identity_name || getDomain(p.site_url) });
  };

  const startScan = async (cleanUrl) => {
    if (scanningRef.current[cleanUrl]) return;
    scanningRef.current[cleanUrl] = true;
    setScanningUrls(prev => ({ ...prev, [cleanUrl]: true }));
    setProfiles(prev => {
      if (prev.find(p => p.site_url === cleanUrl)) return prev;
      return [...prev, { site_url: cleanUrl, identity_name: getDomain(cleanUrl), score_overall: 0, _scanning: true }];
    });
    setActiveUrl(cleanUrl);
    setActiveDomain({ url: cleanUrl, name: getDomain(cleanUrl) });
    try {
      const u = await base44.auth.me();
      if (!u) return;
      const result = await runScan(cleanUrl, u.id, getWokFeatures(u));
      await loadAll();
      setOnboardingData(result);
    } catch (err) { console.error(err); }
    finally {
      scanningRef.current[cleanUrl] = false;
      setScanningUrls(prev => { const n = { ...prev }; delete n[cleanUrl]; return n; });
    }
  };

  const handleDeleteDomain = async (p) => {
    try {
      if (p.id) await base44.entities.BusinessProfile.delete(p.id);
      setProfiles(prev => prev.filter(x => x.site_url !== p.site_url));
      if (activeUrl === p.site_url) {
        const rem = profiles.filter(x => x.site_url !== p.site_url);
        if (rem.length > 0) switchDomain(rem[0]);
        else { setActiveUrl(null); setActiveDomain(null); }
      }
    } catch {}
  };

  const toggleEngine = (id) => {
    setSelectedEngines(prev => {
      if (id === 'auto') return ['auto'];
      const without = prev.filter(x => x !== 'auto');
      return without.includes(id) ? (without.filter(x => x !== id).length === 0 ? ['auto'] : without.filter(x => x !== id)) : [...without, id];
    });
  };

  const engineLabel = () => {
    if (selectedEngines.includes('auto') || selectedEngines.length === 0) return 'Tous les moteurs';
    if (selectedEngines.length === 1) return AI_ENGINES.find(e => e.id === selectedEngines[0])?.label || 'Moteurs';
    return `${selectedEngines.length} moteurs`;
  };

  const firstScanUrl = profiles.length === 0 && Object.keys(scanningUrls)[0];
  if (firstScanUrl) return <ScanLoader url={firstScanUrl} />;

  if (!user && profiles.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: CORAL, animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (profiles.length === 0) return (
    <>
      <ScanHero onScan={(url) => startScan(url.startsWith('http') ? url : `https://${url}`)} />
      {onboardingData && <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />}
    </>
  );

  const activeProfile = profiles.find(p => p.site_url === activeUrl) || profiles[0];
  const lrs = Math.round(activeProfile?.lrs_score || activeProfile?.score_overall || 0);
  const lrsLabel = lrs >= 65 ? 'Bonne visibilité' : lrs >= 30 ? 'Visibilité partielle' : 'Faible visibilité';
  const isScanningActive = !!scanningUrls[activeProfile?.site_url];
  const hasData = !!(activeProfile?.score_overall > 0 || activeProfile?.lrs_score > 0);

  const ENGINES_BARS = [
    { key: 'chatgpt', label: 'ChatGPT' },
    { key: 'gemini',  label: 'Gemini' },
    { key: 'claude',  label: 'Claude' },
  ];

  const MODULES = [
    { label: 'Rapport IA',  sub: 'LRS · moteurs',      Icon: BarChart2,      route: '/ai-report' },
    { label: 'Audit',       sub: 'Technique et crawl', Icon: ClipboardCheck,  route: '/audit' },
    { label: 'Performance', sub: 'Part de voix',       Icon: TrendingUp,      route: '/performance' },
    { label: 'Connexions',  sub: 'GSC · Analytics',    Icon: Link2,           route: '/connections' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ fontSize: 25, fontWeight: 600, color: INK, margin: '0 0 3px', letterSpacing: '-0.02em' }}>
            Bonjour {getFirstName(user?.full_name)}.
          </h1>
          <p style={{ fontSize: 13.5, color: INK2, margin: 0 }}>Que souhaitez-vous analyser aujourd'hui ?</p>
        </div>

        {/* ── Barre de recherche (légèrement carrée) ── */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div style={{
            background: WHITE, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: '9px 9px 9px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Plus size={14} color={INK} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  const u = searchQuery.trim();
                  startScan(u.startsWith('http') ? u : `https://${u}`);
                  setSearchQuery('');
                }
              }}
              placeholder="Rechercher un domaine, lancer une analyse…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: INK, fontFamily: F, minWidth: 0 }}
            />
            {/* Dropdown moteurs */}
            <div
              onClick={() => setShowEngines(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', cursor: 'pointer', flexShrink: 0, userSelect: 'none', borderRadius: 6, transition: 'background 120ms' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F2F0EB'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 12.5, color: INK2, whiteSpace: 'nowrap' }}>{engineLabel()}</span>
              <ChevronDown size={12} color={INK} strokeWidth={1.8} />
            </div>
            {/* Micro */}
            <button style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, transition: 'background 120ms', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = '#F2F0EB'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Mic size={15} color={INK} strokeWidth={1.7} />
            </button>
            {/* Submit */}
            <button
              onClick={() => {
                if (!searchQuery.trim()) return;
                const u = searchQuery.trim();
                startScan(u.startsWith('http') ? u : `https://${u}`);
                setSearchQuery('');
              }}
              style={{ width: 34, height: 34, borderRadius: '50%', background: CORAL, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowUp size={14} color={WHITE} strokeWidth={2.2} />
            </button>
          </div>
          {/* Dropdown panel */}
          {showEngines && (
            <EnginesDropdown
              selected={selectedEngines}
              onToggle={toggleEngine}
              onClose={() => setShowEngines(false)}
            />
          )}
        </div>

        {/* ── Carte Score ── */}
        <div style={{ marginBottom: 12 }}>
          {isScanningActive ? (
            <div style={{ background: CARD_BG, borderRadius: 14, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.12)`, borderTopColor: CORAL, animation: 'spin 0.9s linear infinite' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: WHITE, margin: 0 }}>Analyse de {getDomain(activeProfile?.site_url)}…</p>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', margin: 0, textAlign: 'center' }}>8 moteurs IA · ~60s · Vous pouvez naviguer</p>
            </div>
          ) : hasData ? (
            <div
              onClick={() => navigate('/ai-report')}
              style={{ background: CARD_BG, borderRadius: 14, padding: '18px 20px', cursor: 'pointer' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 12.5, fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>Score d'autorité</span>
                <div style={{ padding: '3px 11px', background: 'rgba(241,123,93,0.18)', border: `1px solid rgba(241,123,93,0.35)`, borderRadius: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: CORAL }}>{lrsLabel}</span>
                </div>
              </div>
              {/* Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <BigDonut score={lrs} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: WHITE, letterSpacing: '-0.05em', lineHeight: 1 }}>{lrs}</span>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/100</span>
                </div>
              </div>
              {/* Insight */}
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', lineHeight: 1.65, fontWeight: 400 }}>
                {activeProfile?.shock_insight
                  ? activeProfile.shock_insight.slice(0, 150) + (activeProfile.shock_insight.length > 150 ? '…' : '')
                  : 'Tant que votre site reste sur une adresse de test, vos concurrents récupèrent vos clients potentiels sur Google et les IA.'}
              </p>
              {/* Séparateur */}
              <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />
              {/* Barres */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
                {ENGINES_BARS.map(e => {
                  const s = activeProfile[`${e.key}_score`] || 0;
                  return (
                    <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, color: WHITE, width: 56, flexShrink: 0 }}>{e.label}</span>
                      <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(s, 100)}%`, background: CORAL, borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 13, color: WHITE, width: 14, textAlign: 'right', fontWeight: 600 }}>{s}</span>
                    </div>
                  );
                })}
              </div>
              {/* Lien */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: CORAL }}>Voir le rapport complet</span>
                <ArrowRight size={13} color={CORAL} strokeWidth={2} />
              </div>
            </div>
          ) : (
            <div style={{ background: CARD_BG, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertCircle size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.7} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: WHITE, margin: '0 0 2px' }}>Aucune analyse pour ce domaine</p>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Lancez une analyse — 8 moteurs IA en parallèle</p>
              </div>
              <button onClick={() => startScan(activeProfile.site_url)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', background: CORAL, borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: WHITE, border: 'none', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
                <Zap size={12} strokeWidth={2} /> Analyser
              </button>
            </div>
          )}
        </div>

        {/* ── Modules 4 colonnes ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 22 }}>
          {MODULES.map(m => (
            <ModuleCard key={m.label} label={m.label} sub={m.sub} Icon={m.Icon} onClick={() => navigate(m.route)} />
          ))}
        </div>

        {/* ── Mes domaines ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 400, color: INK2 }}>
              Mes domaines · {profiles.length}/{MAX_DOMAINS}
            </span>
            {profiles.length < MAX_DOMAINS && (
              <button
                onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', border: 'none', borderRadius: 999, background: '#2D2B28', fontSize: 12.5, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F }}>
                <Zap size={12} color={CORAL} fill={CORAL} strokeWidth={0} />
                Analyser
              </button>
            )}
          </div>

          {/* Liste */}
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 13, overflow: 'hidden' }}>
            {profiles.map((p, i) => {
              const score = Math.round(p?.lrs_score || p?.score_overall || 0);
              const lbl   = getDomain(p.site_url);
              const name  = p.identity_name || lbl;
              const av    = avatarBg(lbl);
              const init  = initials(name);
              const isScanning = !!scanningUrls[p.site_url];
              const isActive = (activeUrl || profiles[0]?.site_url) === p.site_url;

              return (
                <div key={p.site_url || i}
                  onClick={() => switchDomain(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    cursor: 'pointer', background: isActive ? '#F4F2EE' : WHITE,
                    borderBottom: i < profiles.length - 1 ? `1px solid ${BORDER}` : 'none',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#FAFAF7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isActive ? '#F4F2EE' : WHITE; }}>
                  {/* Avatar cercle */}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: WHITE }}>{init}</span>
                  </div>
                  {/* Textes */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: 11.5, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{lbl}</div>
                  </div>
                  {/* Score */}
                  {isScanning ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: `${CORAL}15`, borderRadius: 20, flexShrink: 0 }}>
                      <Loader size={10} color={CORAL} style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: CORAL }}>Analyse…</span>
                    </div>
                  ) : score > 0 ? (
                    <SmallDonut score={score} />
                  ) : (
                    <span style={{ fontSize: 11, color: INK3, background: BG, border: `1px solid ${BORDER}`, borderRadius: 5, padding: '2px 7px', flexShrink: 0 }}>—</span>
                  )}
                  {/* Supprimer */}
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteDomain(p); }}
                    style={{ width: 22, height: 22, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0, transition: 'opacity 120ms', borderRadius: 5 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.stopPropagation(); }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}>
                    <Trash2 size={11} color="#EF4444" strokeWidth={1.8} />
                  </button>
                </div>
              );
            })}

            {profiles.length < MAX_DOMAINS && (
              <div onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', borderTop: `1px solid ${BORDER}`, transition: 'background 120ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAF7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px dashed ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Plus size={13} color={INK3} strokeWidth={1.8} />
                </div>
                <span style={{ fontSize: 13, color: INK3 }}>Ajouter un domaine à surveiller</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ajout domaine ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)', padding: 16 }}
            onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}
              onClick={e => e.stopPropagation()}
              style={{ background: WHITE, borderRadius: 16, padding: '26px 22px', width: '100%', maxWidth: 360, position: 'relative', fontFamily: F }}>
              <button onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: 13, right: 13, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: `1px solid ${BORDER}`, background: BG, cursor: 'pointer' }}>
                <X size={11} color={INK3} />
              </button>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 3px', letterSpacing: '-0.02em' }}>Nouveau domaine</h2>
              <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 16px' }}>L'IA va analyser ce site et calculer son score LRS.</p>
              <AddDomainForm onSubmit={(url) => { startScan(url); setShowAddModal(false); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {onboardingData && (
        <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function AddDomainForm({ onSubmit }) {
  const [url, setUrl] = useState('');
  const clean = () => url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
  return (
    <div>
      <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && url.trim() && onSubmit(clean())} autoFocus
        placeholder="https://votre-site.com"
        style={{ width: '100%', padding: '10px 13px', fontSize: 13.5, border: `1px solid #E8E5DF`, borderRadius: 9, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: "'Inter',sans-serif", color: '#111110', background: '#F9F8F5' }} />
      <button onClick={() => url.trim() && onSubmit(clean())} disabled={!url.trim()}
        style={{ width: '100%', padding: '11px', fontSize: 13.5, fontWeight: 700, color: WHITE, background: url.trim() ? CORAL : '#ccc', border: 'none', borderRadius: 9, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <Zap size={13} />
        Lancer l'analyse
      </button>
    </div>
  );
}