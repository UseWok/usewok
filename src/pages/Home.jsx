import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, ArrowUp, Link2, BarChart2, ClipboardCheck, TrendingUp, Mic, Zap, Loader, AlertCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { setActiveDomain } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';
import { getWokFeatures, getWokPlanId } from '@/lib/wok-plans';

// ── Design System ──────────────────────────────────────────────────────────────
const F        = "'Inter', -apple-system, system-ui, sans-serif";
const BG       = '#F9F8F5';   // fond beige très clair
const CARD_BG  = '#5A5756';   // carte score — gris anthracite chaud
const WHITE    = '#FFFFFF';
const INK      = '#1E1C1A';   // titres gris très sombre
const INK2     = '#6B6762';   // textes secondaires
const INK3     = '#A8A49F';   // placeholder / tertiaire
const BORDER   = '#E8E5DF';   // bordures gris clair
const CORAL    = '#F17B5D';   // orange corail primaire
const MAX_DOMAINS = 10;

const getDomain   = (url) => (url || '').replace(/https?:\/\//, '').split('/')[0];
const getFirstName = (n) => (n || '').split(' ')[0] || 'vous';

// Initiales + couleur pour avatar
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

// ── Scan logic (inchangé) ──────────────────────────────────────────────────────
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

// ── Donut chart (grand — carte score) ─────────────────────────────────────────
function BigDonut({ score }) {
  const size = 68, sw = 6, R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  const color = score >= 65 ? '#22C55E' : score >= 30 ? CORAL : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.1s ease' }} />
      </svg>
    </div>
  );
}

// ── Donut chart (petit — liste domaines) ──────────────────────────────────────
function SmallDonut({ score }) {
  const size = 46, sw = 3.5, R = (size - sw) / 2 - 1;
  const circ = 2 * Math.PI * R;
  const color = score >= 65 ? '#22C55E' : score >= 30 ? CORAL : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={BORDER} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK, lineHeight: 1 }}>{score}</span>
      </div>
    </div>
  );
}

// ── Carte module (hover spring) ────────────────────────────────────────────────
function ModuleCard({ label, sub, Icon, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
        padding: '16px 14px', borderRadius: 14, cursor: 'pointer',
        background: hov ? '#EEECE8' : WHITE,
        border: `1px solid ${hov ? '#D8D4CC' : BORDER}`,
        boxShadow: hov ? 'none' : '0 1px 4px rgba(0,0,0,0.05)',
        textAlign: 'left', fontFamily: F, width: '100%', outline: 'none',
        transition: 'background 180ms, border-color 180ms, box-shadow 180ms',
      }}>
      {/* Icône wrapper */}
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: hov ? WHITE : '#F2F0EB',
        border: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 180ms',
      }}>
        <Icon size={16} color={INK2} strokeWidth={1.7} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: INK3, marginTop: 3, fontWeight: 400 }}>{sub}</div>
      </div>
    </motion.button>
  );
}

// ── Scan loader plein écran ────────────────────────────────────────────────────
function ScanLoader({ url }) {
  const [step, setStep] = useState(0);
  const steps = ['Récupération du site…','Simulation IA en cours…','Calcul du LRS…','Génération du rapport…'];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 8000);
    return () => clearInterval(iv);
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: CARD_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: F }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.12)`, borderTopColor: CORAL, animation: 'spin 0.9s linear infinite', marginBottom: 20 }} />
      <div style={{ fontSize: 20, fontWeight: 700, color: WHITE, marginBottom: 6, letterSpacing: '-0.02em' }}>Analyse de <span style={{ color: CORAL }}>{getDomain(url)}</span></div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>8 moteurs IA · ~60 secondes</div>
      <div style={{ width: '100%', maxWidth: 340, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.5s' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: i < step ? CORAL : 'transparent', border: `2px solid ${i <= step ? CORAL : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i < step && <svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {i === step && <div style={{ width: 4, height: 4, borderRadius: '50%', background: CORAL, animation: 'pulse 1s ease-in-out infinite' }} />}
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{s}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </motion.div>
  );
}

// ── ScanHero (zéro domaine) ────────────────────────────────────────────────────
function ScanHero({ onScan }) {
  const [url, setUrl] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: F, background: BG }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em', textAlign: 'center' }}>Êtes-vous recommandé par les IA ?</h1>
      <p style={{ fontSize: 14, color: INK3, margin: '0 0 30px', textAlign: 'center' }}>Votre score LRS en 60 secondes — 8 moteurs IA analysés.</p>
      <div style={{ width: '100%', maxWidth: 500, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 50, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', padding: '8px 8px 8px 20px', gap: 10 }}>
        <Plus size={14} color={INK3} strokeWidth={1.8} style={{ flexShrink: 0 }} />
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && url.trim() && onScan(url.trim())}
          placeholder="Rechercher un domaine, lancer une analyse…" autoFocus
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: INK, fontFamily: F }} />
        <motion.button onClick={() => url.trim() && onScan(url.trim())}
          whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 420, damping: 20 }}
          style={{ width: 36, height: 36, borderRadius: '50%', background: CORAL, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowUp size={15} color={WHITE} strokeWidth={2.2} />
        </motion.button>
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
  const lrsColor = lrs >= 65 ? '#22C55E' : lrs >= 30 ? CORAL : '#EF4444';
  const lrsLabel = lrs >= 65 ? 'Bonne visibilité' : lrs >= 30 ? 'Visibilité partielle' : 'Faible visibilité';
  const isScanningActive = !!scanningUrls[activeProfile?.site_url];
  const hasData = !!(activeProfile?.score_overall > 0 || activeProfile?.lrs_score > 0);

  const ENGINES = [
    { key: 'chatgpt', label: 'ChatGPT' },
    { key: 'gemini',  label: 'Gemini' },
    { key: 'claude',  label: 'Claude' },
  ];

  const MODULES = [
    { label: 'Rapport IA',  sub: 'LRS · moteurs',      Icon: BarChart2,     route: '/ai-report' },
    { label: 'Audit',       sub: 'Technique et crawl', Icon: ClipboardCheck, route: '/audit' },
    { label: 'Performance', sub: 'Part de voix',       Icon: TrendingUp,    route: '/performance' },
    { label: 'Connexions',  sub: 'GSC · Analytics',    Icon: Link2,         route: '/connections' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '32px 20px 100px' }}>

        {/* ── I. Header ── */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Bonjour {getFirstName(user?.full_name)}.
          </h1>
          <p style={{ fontSize: 14, color: INK2, margin: 0, fontWeight: 400 }}>
            Que souhaitez-vous analyser aujourd'hui ?
          </p>
        </div>

        {/* ── II. Barre recherche (pilule) ── */}
        <div style={{
          background: WHITE, border: `1px solid ${BORDER}`,
          borderRadius: 50, padding: '10px 10px 10px 20px',
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <Plus size={15} color={INK3} strokeWidth={1.7} style={{ flexShrink: 0 }} />
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
          {/* Filtre moteurs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', cursor: 'pointer', flexShrink: 0, userSelect: 'none' }}>
            <span style={{ fontSize: 13, color: INK3, whiteSpace: 'nowrap', fontWeight: 400 }}>Tous les moteurs</span>
            <ChevronDown size={13} color={INK3} strokeWidth={1.7} />
          </div>
          {/* Micro */}
          <button style={{ width: 34, height: 34, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%' }}>
            <Mic size={16} color={INK3} strokeWidth={1.7} />
          </button>
          {/* Submit — cercle coral */}
          <motion.button
            whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            onClick={() => {
              if (!searchQuery.trim()) return;
              const u = searchQuery.trim();
              startScan(u.startsWith('http') ? u : `https://${u}`);
              setSearchQuery('');
            }}
            style={{ width: 36, height: 36, borderRadius: '50%', background: CORAL, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowUp size={15} color={WHITE} strokeWidth={2.3} />
          </motion.button>
        </div>

        {/* ── III. Carte Score d'autorité ── */}
        <div style={{ marginBottom: 14 }}>
          {isScanningActive ? (
            <div style={{ background: CARD_BG, borderRadius: 16, padding: '28px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.12)`, borderTopColor: CORAL, animation: 'spin 0.9s linear infinite' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: WHITE, margin: 0 }}>Analyse de {getDomain(activeProfile?.site_url)}…</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>8 moteurs IA · ~60s · Vous pouvez naviguer</p>
            </div>
          ) : hasData ? (
            <motion.div
              onClick={() => navigate('/ai-report')}
              whileHover={{ scale: 1.006 }}
              whileTap={{ scale: 0.998 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              style={{ background: CARD_BG, borderRadius: 16, padding: '20px 22px', cursor: 'pointer', userSelect: 'none' }}>

              {/* 1. En-tête carte */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>Score d'autorité</span>
                <div style={{ padding: '4px 12px', background: 'rgba(241,123,93,0.18)', border: `1px solid rgba(241,123,93,0.4)`, borderRadius: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: CORAL }}>{lrsLabel}</span>
                </div>
              </div>

              {/* 2. Score — donut + chiffre */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                <BigDonut score={lrs} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 46, fontWeight: 800, color: WHITE, letterSpacing: '-0.05em', lineHeight: 1 }}>{lrs}</span>
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>/100</span>
                </div>
              </div>

              {/* 3. Message */}
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', margin: '0 0 18px', lineHeight: 1.65, fontWeight: 400 }}>
                {activeProfile?.shock_insight
                  ? activeProfile.shock_insight.slice(0, 150) + (activeProfile.shock_insight.length > 150 ? '…' : '')
                  : 'Tant que votre site reste sur une adresse de test, vos concurrents récupèrent vos clients potentiels sur Google et les IA.'}
              </p>

              {/* 4. Séparateur */}
              <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 18 }} />

              {/* 5. Barres moteurs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {ENGINES.map(e => {
                  const s = activeProfile[`${e.key}_score`] || 0;
                  return (
                    <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, color: WHITE, width: 58, flexShrink: 0, fontWeight: 400 }}>{e.label}</span>
                      <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(s, 100)}%` }}
                          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                          style={{ height: '100%', background: CORAL, borderRadius: 999 }}
                        />
                      </div>
                      <span style={{ fontSize: 13, color: WHITE, width: 14, textAlign: 'right', fontWeight: 600 }}>{s}</span>
                    </div>
                  );
                })}
              </div>

              {/* 6. Lien rapport */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: CORAL }}>Voir le rapport complet</span>
                <ArrowRight size={14} color={CORAL} strokeWidth={2} />
              </div>
            </motion.div>
          ) : (
            <div style={{ background: CARD_BG, borderRadius: 16, padding: '22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertCircle size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.7} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: WHITE, margin: '0 0 2px' }}>Aucune analyse pour ce domaine</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Lancez une analyse — 8 moteurs IA en parallèle</p>
              </div>
              <motion.button
                onClick={() => startScan(activeProfile.site_url)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: CORAL, borderRadius: 9, fontSize: 13, fontWeight: 700, color: WHITE, border: 'none', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
                <Zap size={12} strokeWidth={2} /> Analyser
              </motion.button>
            </div>
          )}
        </div>

        {/* ── IV. Grille modules ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 28 }}>
          {MODULES.map(m => (
            <ModuleCard key={m.label} label={m.label} sub={m.sub} Icon={m.Icon} onClick={() => navigate(m.route)} />
          ))}
        </div>

        {/* ── V. Mes domaines ── */}
        <div>
          {/* En-tête section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 400, color: INK2 }}>
              Mes domaines · {profiles.length}/{MAX_DOMAINS}
            </span>
            {profiles.length < MAX_DOMAINS && (
              <motion.button
                onClick={() => setShowAddModal(true)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', border: 'none', borderRadius: 999, background: '#2D2B28', fontSize: 13, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F }}>
                <Zap size={13} color={CORAL} fill={CORAL} strokeWidth={0} />
                Analyser
              </motion.button>
            )}
          </div>

          {/* Liste cartes domaines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profiles.map((p, i) => {
              const score = Math.round(p?.lrs_score || p?.score_overall || 0);
              const lbl   = getDomain(p.site_url);
              const name  = p.identity_name || lbl;
              const av    = avatarBg(lbl);
              const init  = initials(name);
              const isScanning = !!scanningUrls[p.site_url];
              const isActive = (activeUrl || profiles[0]?.site_url) === p.site_url;

              return (
                <motion.div key={p.site_url || i}
                  onClick={() => switchDomain(p)}
                  whileHover={{ backgroundColor: '#F5F2EC' }}
                  transition={{ duration: 0.15 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px',
                    cursor: 'pointer', background: isActive ? '#F2EFE8' : WHITE,
                    border: `1px solid ${BORDER}`, borderRadius: 13,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                  {/* Avatar */}
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: WHITE, letterSpacing: '-0.01em' }}>{init}</span>
                  </div>
                  {/* Textes */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: 12, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, fontWeight: 400 }}>{lbl}</div>
                  </div>
                  {/* Score ou scanning */}
                  {isScanning ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: `${CORAL}15`, borderRadius: 20, flexShrink: 0 }}>
                      <Loader size={10} color={CORAL} style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: CORAL }}>Analyse…</span>
                    </div>
                  ) : score > 0 ? (
                    <SmallDonut score={score} />
                  ) : (
                    <span style={{ fontSize: 11, color: INK3, background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>—</span>
                  )}
                  {/* Supprimer */}
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteDomain(p); }}
                    style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0, transition: 'opacity 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                    <Trash2 size={12} color="#EF4444" strokeWidth={1.8} />
                  </button>
                </motion.div>
              );
            })}

            {/* Ajouter domaine */}
            {profiles.length < MAX_DOMAINS && (
              <motion.div
                onClick={() => setShowAddModal(true)}
                whileHover={{ backgroundColor: '#F2EFE8' }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', cursor: 'pointer', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 13, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', border: `1.5px dashed ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Plus size={14} color={INK3} strokeWidth={1.8} />
                </div>
                <span style={{ fontSize: 13.5, color: INK3, fontWeight: 400 }}>Ajouter un domaine à surveiller</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ajout domaine ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)', padding: 16 }}
            onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: WHITE, borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 380, position: 'relative', fontFamily: F, boxShadow: '0 24px 80px rgba(0,0,0,0.16)' }}>
              <button onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, cursor: 'pointer' }}>
                <X size={11} color={INK3} />
              </button>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Nouveau domaine</h2>
              <p style={{ fontSize: 13, color: INK3, margin: '0 0 18px' }}>L'IA va analyser ce site et calculer son score LRS.</p>
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
        style={{ width: '100%', padding: '11px 14px', fontSize: 13.5, border: `1px solid #E8E5DF`, borderRadius: 10, outline: 'none', boxSizing: 'border-box', marginBottom: 14, fontFamily: "'Inter',sans-serif", color: '#1E1C1A', background: '#F9F8F5' }} />
      <motion.button
        onClick={() => url.trim() && onSubmit(clean())}
        disabled={!url.trim()}
        whileHover={url.trim() ? { scale: 1.02 } : {}}
        whileTap={url.trim() ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, color: '#FFFFFF', background: url.trim() ? '#F17B5D' : '#ccc', border: 'none', borderRadius: 11, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Zap size={14} />
        Lancer l'analyse
      </motion.button>
    </div>
  );
}