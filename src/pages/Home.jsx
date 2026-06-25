import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Globe, ExternalLink, ArrowRight, Link2, BarChart2, ClipboardCheck, TrendingUp, ChevronRight, AlertCircle, Zap, Star, Loader } from 'lucide-react';
import { setActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';
import { getWokFeatures, getWokPlanId } from '@/lib/wok-plans';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const SURFACE = '#F8F7F5';
const WHITE = '#FFFFFF';
const CORAL = '#F95738';

const MAX_DOMAINS = 10;

// ── AI logo pills ─────────────────────────────────────────────────────────────
const AI_PILLS = [
  { label: 'ChatGPT', color: '#10A37F' },
  { label: 'Claude', color: '#D97757' },
  { label: 'Gemini', color: '#4285F4' },
  { label: 'Perplexity', color: '#20808D' },
  { label: 'Mistral', color: '#F97316' },
  { label: 'Grok', color: '#1DA1F2' },
];

// ── Scan loader overlay ───────────────────────────────────────────────────────
const SCAN_STEPS = ['Récupération du site…', 'Simulation IA en cours…', 'Calcul du LRS…', 'Génération du rapport…'];

function ScanLoader({ url }) {
  const [step, setStep] = useState(0);
  const domain = (url || '').replace(/https?:\/\//, '').split('/')[0];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, SCAN_STEPS.length - 1)), 8000);
    return () => clearInterval(iv);
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0A0A0B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: F }}>
      <div style={{ position: 'absolute', top: '15%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${CORAL}18 0%, transparent 70%)`, animation: 'orbFloat 6s ease-in-out infinite' }} />
      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: `${CORAL}18`, borderRadius: 24, border: `1px solid ${CORAL}30`, marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL, animation: 'spulse 1s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: CORAL, letterSpacing: '0.1em' }}>ANALYSE EN COURS</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: WHITE, marginBottom: 6, letterSpacing: '-0.03em' }}>
          Analyse de <span style={{ color: CORAL }}>{domain}</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>8 moteurs IA interrogés simultanément · ~60 secondes</div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 22px' }}>
          {SCAN_STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.5s' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, background: i < step ? CORAL : 'transparent', border: `2px solid ${i <= step ? CORAL : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i < step && <svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {i === step && <div style={{ width: 4, height: 4, borderRadius: '50%', background: CORAL, animation: 'spulse 1s ease-in-out infinite' }} />}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{s}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 20 }}>
          Vous pouvez fermer cette fenêtre — l'analyse continue en arrière-plan.
        </p>
      </div>
      <style>{`@keyframes spulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.5)}} @keyframes orbFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-18px)}}`}</style>
    </motion.div>
  );
}

// ── First-time scan hero ──────────────────────────────────────────────────────
function ScanHero({ onScan }) {
  const [url, setUrl] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: F, background: SURFACE }}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32, maxWidth: 360 }}>
        {AI_PILLS.map((p, i) => (
          <motion.div key={p.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 8px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 11, fontWeight: 500, color: INK2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            {p.label}
          </motion.div>
        ))}
      </div>
      <h1 style={{ fontSize: 'clamp(28px, 6vw, 44px)', fontWeight: 900, color: INK, margin: '0 0 10px', letterSpacing: '-0.04em', lineHeight: 1.05, textAlign: 'center', maxWidth: 480 }}>
        Êtes-vous recommandé<br />par les IA ?
      </h1>
      <p style={{ fontSize: 14, color: INK3, margin: '0 0 36px', lineHeight: 1.65, textAlign: 'center', maxWidth: 320 }}>
        Votre score LRS en 60 secondes — 8 moteurs IA analysés simultanément.
      </p>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', gap: 10 }}>
            <Globe size={14} color={INK3} style={{ flexShrink: 0 }} />
            <input value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && url.trim() && onScan(url.trim())}
              placeholder="https://votre-site.com" autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: INK, fontFamily: F, minWidth: 0 }} />
          </div>
          <button onClick={() => url.trim() && onScan(url.trim())}
            style={{ width: '100%', padding: '13px', background: INK, color: WHITE, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Analyser ma visibilité IA <ArrowRight size={14} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: INK3, marginTop: 10, textAlign: 'center' }}>Gratuit · Résultat instantané · Aucune carte requise</p>
      </div>
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 40 }) {
  const R = size / 2 - 4;
  const circ = 2 * Math.PI * R;
  const c = score >= 65 ? '#10B981' : score >= 35 ? CORAL : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="#F0F0EE" strokeWidth={3} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={c} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: INK }}>{Math.round(score)}</span>
      </div>
    </div>
  );
}

// ── Add Domain Modal ──────────────────────────────────────────────────────────
function AddDomainModal({ open, onClose, onStartScan }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const submit = () => {
    if (!url.trim()) return;
    const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const domain = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
    onStartScan({ url: cleanUrl, name: name.trim() || domain });
    setUrl(''); setName(''); onClose();
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: WHITE, borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 380, position: 'relative', fontFamily: F, boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer' }}>
          <X size={12} color={INK3} />
        </button>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Nouveau domaine</h2>
        <p style={{ fontSize: 12, color: INK3, margin: '0 0 18px', lineHeight: 1.5 }}>L'IA va analyser ce site et calculer son score LRS.</p>
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
          placeholder="https://votre-site.com"
          style={{ width: '100%', padding: '11px 13px', fontSize: 13, border: `1.5px solid ${BORDER}`, borderRadius: 10, outline: 'none', boxSizing: 'border-box', marginBottom: 8, fontFamily: F, color: INK, background: SURFACE }} />
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Nom du projet (optionnel)"
          style={{ width: '100%', padding: '11px 13px', fontSize: 13, border: `1.5px solid ${BORDER}`, borderRadius: 10, outline: 'none', boxSizing: 'border-box', marginBottom: 20, fontFamily: F, color: INK, background: SURFACE }} />
        <button onClick={submit} disabled={!url.trim()}
          style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 700, color: WHITE, background: url.trim() ? INK : '#ccc', border: 'none', borderRadius: 12, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Zap size={14} fill={url.trim() ? WHITE : '#aaa'} stroke="none" />
          L'IA va analyser ce site
        </button>
      </motion.div>
    </div>
  );
}

// ── Scan logic ────────────────────────────────────────────────────────────────
async function runScan(inputUrl, userId, features) {
  const scanFn = features?.scan_type === 'full' ? 'analyzeWebsite' : 'analyzeWebsiteLite';
  const res = await base44.functions.invoke(scanFn, { url: inputUrl });
  const mainData = res?.data || {};

  if (features?.scan_type === 'full') {
    const [audit, perf] = await Promise.all([
      base44.functions.invoke('analyzeAudit', { url: inputUrl }).catch(() => ({ data: {} })),
      base44.functions.invoke('analyzePerformance', { url: inputUrl, business_name: mainData.business_name || '' }).catch(() => ({ data: {} })),
    ]);
    mainData.audit_data = audit?.data || {};
    mainData.perf_data = perf?.data || {};
    mainData.audit_analyzed_at = new Date().toISOString();
    mainData.perf_analyzed_at = new Date().toISOString();
  }

  mainData.scan_type = features?.scan_type || 'lite';
  const brand_keywords = await uploadProfileData(mainData);

  const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: userId }).catch(() => []);
  const existing = profiles.find(p => p.site_url === inputUrl);
  const profileFields = {
    site_url: inputUrl,
    identity_name: mainData.business_name || '',
    identity_industry: mainData.business_type || '',
    identity_city: mainData.city || '',
    score_ai_visibility: mainData.ai_visibility_score || 0,
    score_message_clarity: mainData.message_clarity_score || 0,
    score_commercial_signal: mainData.commercial_presence_score || 0,
    score_overall: mainData.overall_score || 0,
    last_scan: new Date().toISOString(),
    brand_keywords,
    active: true,
  };

  if (existing) await base44.entities.BusinessProfile.update(existing.id, profileFields);
  else await base44.entities.BusinessProfile.create({ ...profileFields, created_by_id: userId });

  return mainData;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]); // all BusinessProfiles from cloud
  const [activeUrl, setActiveUrl] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stensor_active_domain') || 'null')?.url || null; } catch { return null; }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [planId, setPlanId] = useState('free');
  // Map of url → scanning status (local, for UX feedback while running)
  const [scanningUrls, setScanningUrls] = useState({});
  const scanningRef = useRef({});

  // Load user + profiles from cloud
  const loadAll = async () => {
    try {
      const u = await base44.auth.me();
      if (!u) return;
      setUser(u);
      setPlanId(getWokPlanId(u));
      const list = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const enriched = await Promise.all(list.map(async p => {
        const extra = await getProfileData(p).catch(() => ({}));
        return { ...p, ...extra };
      }));
      setProfiles(enriched);
      // Set active to first if none
      if (!activeUrl && enriched.length > 0) {
        const first = enriched[0];
        const d = { url: first.site_url, name: first.identity_name || first.site_url.replace(/https?:\/\//, '').split('/')[0] };
        setActiveUrl(first.site_url);
        setActiveDomain(d);
      }
      return { u, enriched };
    } catch {}
  };

  useEffect(() => { loadAll(); }, []);

  // Sync active domain to localStorage/listeners on change
  const switchDomain = (profile) => {
    const d = { url: profile.site_url, name: profile.identity_name || profile.site_url.replace(/https?:\/\//, '').split('/')[0] };
    setActiveUrl(profile.site_url);
    setActiveDomain(d);
  };

  // Handle scan from hero (first domain)
  const handleFirstScan = async (url) => {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    await startScan(cleanUrl);
  };

  // Start a scan for a given URL
  const startScan = async (cleanUrl) => {
    if (scanningRef.current[cleanUrl]) return; // already scanning
    scanningRef.current[cleanUrl] = true;
    setScanningUrls(prev => ({ ...prev, [cleanUrl]: true }));

    // Immediately add a placeholder profile so the domain appears
    setProfiles(prev => {
      if (prev.find(p => p.site_url === cleanUrl)) return prev;
      const label = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
      return [...prev, { site_url: cleanUrl, identity_name: label, score_overall: 0, _scanning: true }];
    });
    setActiveUrl(cleanUrl);
    setActiveDomain({ url: cleanUrl, name: cleanUrl.replace(/https?:\/\//, '').split('/')[0] });

    try {
      const u = await base44.auth.me();
      if (!u) return;
      const features = getWokFeatures(u);
      const result = await runScan(cleanUrl, u.id, features);
      await loadAll();
      setOnboardingData(result);
    } catch (err) {
      console.error('Scan failed', err);
    } finally {
      scanningRef.current[cleanUrl] = false;
      setScanningUrls(prev => { const n = { ...prev }; delete n[cleanUrl]; return n; });
    }
  };

  // Add domain modal submit — immediately triggers scan
  const handleAddDomain = ({ url, name }) => {
    startScan(url);
  };

  const handleDeleteDomain = async (profile) => {
    try {
      if (profile.id) await base44.entities.BusinessProfile.delete(profile.id);
      setProfiles(prev => prev.filter(p => p.site_url !== profile.site_url));
      if (activeUrl === profile.site_url) {
        const remaining = profiles.filter(p => p.site_url !== profile.site_url);
        if (remaining.length > 0) switchDomain(remaining[0]);
        else { setActiveUrl(null); setActiveDomain(null); }
      }
    } catch {}
  };

  // Active scanning URL for full-screen loader (only show if no profiles yet)
  const firstScanUrl = profiles.length === 0 && Object.keys(scanningUrls)[0];
  if (firstScanUrl) return <ScanLoader url={firstScanUrl} />;

  if (!user && profiles.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: SURFACE }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: INK, animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <>
        <ScanHero onScan={handleFirstScan} />
        {onboardingData && <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />}
      </>
    );
  }

  const activeProfile = profiles.find(p => p.site_url === activeUrl) || profiles[0];
  const domainLabel = activeProfile?.site_url?.replace(/https?:\/\//, '').split('/')[0] || '';
  const lrs = Math.round(activeProfile?.lrs_score || activeProfile?.score_overall || 0);
  const isFree = planId === 'free';
  const lrsColor = lrs >= 65 ? '#10B981' : lrs >= 35 ? CORAL : '#EF4444';
  const lrsLabel = lrs >= 65 ? 'Bonne visibilité' : lrs >= 35 ? 'Visibilité partielle' : 'Faible visibilité';
  const isScanningActive = !!scanningUrls[activeProfile?.site_url];
  const hasData = activeProfile && (activeProfile.score_overall > 0 || activeProfile.lrs_score > 0);

  const ACTIONS = [
    { label: 'Rapport IA', desc: 'LRS · moteurs · injection', icon: BarChart2, route: '/ai-report', primary: true },
    { label: 'Audit', desc: 'Technique & crawl', icon: ClipboardCheck, route: '/audit' },
    { label: 'Performance', desc: 'Share of voice', icon: TrendingUp, route: '/performance' },
    { label: 'Connexions', desc: 'GSC · Analytics', icon: Link2, route: '/connections' },
  ];

  const engineScores = [
    { key: 'chatgpt', label: 'ChatGPT' },
    { key: 'gemini', label: 'Gemini' },
    { key: 'claude', label: 'Claude' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '0 16px 100px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '24px 0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              {activeProfile && <img src={`https://www.google.com/s2/favicons?domain=${domainLabel}&sz=32`} alt="" width={18} height={18} style={{ borderRadius: 4 }} onError={e => { e.target.style.display = 'none'; }} />}
              <h1 style={{ fontSize: 19, fontWeight: 900, color: INK, margin: 0, letterSpacing: '-0.04em' }}>
                {activeProfile?.identity_name || domainLabel || 'Accueil'}
              </h1>
              {isScanningActive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: `${CORAL}15`, border: `1px solid ${CORAL}30`, borderRadius: 20 }}>
                  <Loader size={10} color={CORAL} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: CORAL }}>Analyse…</span>
                </div>
              )}
            </div>
            {activeProfile && (
              <a href={activeProfile.site_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: INK3, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {domainLabel} <ExternalLink size={9} />
              </a>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} style={{ padding: '5px 11px', borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, color: INK2, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Admin</button>
            )}
          </div>
        </div>

        {/* ── Upgrade nudge ── */}
        {isFree && hasData && activeProfile?.scan_type === 'lite' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            onClick={() => navigate('/pricing')}
            style={{ background: '#FDF8F0', border: `1px solid ${CORAL}22`, borderRadius: 12, padding: '14px 16px', marginBottom: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${CORAL}44`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${CORAL}22`; }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${CORAL}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Star size={16} color={CORAL} fill={CORAL} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 1 }}>Passez au scan complet — 8 moteurs IA</div>
              <div style={{ fontSize: 11, color: INK3 }}>ChatGPT, Claude, Perplexity, Grok… et votre plan d'action détaillé</div>
            </div>
            <ChevronRight size={14} color={CORAL} style={{ flexShrink: 0 }} />
          </motion.div>
        )}

        {/* ── LRS Score Card ── */}
        <div style={{ marginBottom: 14 }}>
          {isScanningActive ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: INK, borderRadius: 18, padding: '28px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.15)`, borderTopColor: CORAL, animation: 'spin 0.9s linear infinite' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: WHITE, margin: '0 0 6px' }}>L'IA analyse {domainLabel}…</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.6 }}>8 moteurs IA en parallèle · ~60 secondes<br />Vous pouvez naviguer, l'analyse continue.</p>
              </div>
            </motion.div>
          ) : hasData ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/ai-report')}
              style={{ background: INK, borderRadius: 18, padding: '22px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${lrsColor}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>LLM Resonance Score™</div>
                  {activeProfile?.scan_type === 'lite' && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: CORAL, background: `${CORAL}20`, border: `1px solid ${CORAL}30`, borderRadius: 20, padding: '1px 7px' }}>LITE</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 62, fontWeight: 900, color: WHITE, letterSpacing: '-0.06em', lineHeight: 1 }}>{lrs}</span>
                    <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.25)', fontWeight: 500, marginLeft: 3 }}>/100</span>
                  </div>
                  <div style={{ paddingBottom: 8, flex: 1 }}>
                    {engineScores.map((e, i) => {
                      const s = activeProfile[`${e.key}_score`] || 0;
                      return (
                        <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < engineScores.length - 1 ? 5 : 0 }}>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', width: 46, fontWeight: 600 }}>{e.label}</span>
                          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${s}%`, background: s >= 65 ? '#10B981' : s >= 35 ? CORAL : '#EF4444', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', width: 16, textAlign: 'right', fontWeight: 700 }}>{s}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: lrsColor }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: lrsColor }}>{lrsLabel}</span>
                </div>
                {activeProfile.shock_insight && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: '0 0 14px', lineHeight: 1.55 }}>
                    {activeProfile.shock_insight.slice(0, 100)}{activeProfile.shock_insight.length > 100 ? '…' : ''}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    Voir le rapport complet <ArrowRight size={11} />
                  </span>
                  {activeProfile?.last_scan && (
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
                      {new Date(activeProfile.last_scan).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: WHITE, borderRadius: 18, padding: '18px', border: `1.5px dashed ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertCircle size={18} color={INK3} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 2px' }}>Aucune analyse pour ce domaine</p>
                  <p style={{ fontSize: 11, color: INK3, margin: 0 }}>Lancez une analyse — 8 moteurs IA en parallèle</p>
                </div>
                <button onClick={() => startScan(activeProfile.site_url)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', background: INK, borderRadius: 9, fontSize: 12, fontWeight: 700, color: WHITE, flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: F }}>
                  <Zap size={11} fill={WHITE} stroke={WHITE} /> Analyser
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Action modules ── */}
        {hasData && !isScanningActive && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 9px' }}>Modules</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {ACTIONS.map(a => (
                <button key={a.label} onClick={() => navigate(a.route)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderRadius: 13, cursor: 'pointer', background: a.primary ? INK : WHITE, border: `1px solid ${a.primary ? INK : BORDER}`, textAlign: 'left', fontFamily: F, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <div style={{ width: 33, height: 33, borderRadius: 9, background: a.primary ? 'rgba(255,255,255,0.1)' : SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <a.icon size={15} color={a.primary ? WHITE : INK2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: a.primary ? WHITE : INK }}>{a.label}</div>
                    <div style={{ fontSize: 10, color: a.primary ? 'rgba(255,255,255,0.38)' : INK3, marginTop: 1 }}>{a.desc}</div>
                  </div>
                  <ChevronRight size={12} color={a.primary ? 'rgba(255,255,255,0.25)' : BORDER} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Domain list (cloud, max 10) ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              Mes domaines ({profiles.length}/{MAX_DOMAINS})
            </p>
            {profiles.length < MAX_DOMAINS && (
              <button onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: `1px solid ${BORDER}`, borderRadius: 7, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
                <Plus size={10} /> Ajouter
              </button>
            )}
          </div>

          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            {profiles.map((p, i) => {
              const score = Math.round(p?.lrs_score || p?.score_overall || 0);
              const isActive = (activeUrl || profiles[0]?.site_url) === p.site_url;
              const label = p.site_url?.replace(/https?:\/\//, '').split('/')[0] || '';
              const isScanning = !!scanningUrls[p.site_url];
              return (
                <div key={p.site_url || i}
                  onClick={() => switchDomain(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', cursor: 'pointer', background: isActive ? SURFACE : WHITE, borderBottom: i < profiles.length - 1 ? `1px solid ${BORDER}` : 'none', transition: 'background 0.12s' }}>
                  <img src={`https://www.google.com/s2/favicons?domain=${label}&sz=32`} alt="" width={26} height={26} style={{ borderRadius: 6, flexShrink: 0 }} onError={e => { e.target.style.opacity = '0'; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.identity_name || label}</div>
                    <div style={{ fontSize: 10, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                  </div>
                  {isScanning ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: `${CORAL}12`, borderRadius: 20, flexShrink: 0 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: CORAL, animation: 'spulse 1s ease-in-out infinite' }} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: CORAL }}>Analyse…</span>
                    </div>
                  ) : score > 0 ? (
                    <ScoreRing score={score} size={38} />
                  ) : (
                    <span style={{ fontSize: 9, color: INK3, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 5, padding: '2px 7px', flexShrink: 0 }}>Non analysé</span>
                  )}
                  {isActive && score > 0 && !isScanning && <div style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL, flexShrink: 0 }} />}
                  <button onClick={e => { e.stopPropagation(); handleDeleteDomain(p); }}
                    style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.2 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.2'}>
                    <Trash2 size={11} color="#EF4444" />
                  </button>
                </div>
              );
            })}
            {profiles.length < MAX_DOMAINS && (
              <div onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', cursor: 'pointer', background: WHITE, borderTop: `1px solid ${BORDER}`, transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                <div style={{ width: 26, height: 26, borderRadius: 6, border: `1.5px dashed ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Plus size={11} color={INK3} />
                </div>
                <span style={{ fontSize: 12, color: INK3, fontWeight: 500 }}>Surveiller un nouveau domaine</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddDomainModal open={showAddModal} onClose={() => setShowAddModal(false)} onStartScan={handleAddDomain} />
      {onboardingData && (
        <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />
      )}
      <style>{`@keyframes spulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.5)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}