import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, ArrowRight, Link2, BarChart2, ClipboardCheck, TrendingUp, Mic, Zap, Loader, AlertCircle, ChevronDown } from 'lucide-react';
import { setActiveDomain } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';
import { getWokFeatures, getWokPlanId } from '@/lib/wok-plans';

// ── Tokens fidèles à l'image ──
const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG       = '#F0EDE6';   // fond crème légèrement plus chaud
const CARD_BG  = '#4A4740';   // carte score — brun-gris chaud
const WHITE    = '#FFFFFF';
const INK      = '#1C1A17';
const INK2     = '#6B6760';
const INK3     = '#A09C97';
const BORDER   = '#DDD9D0';
const CORAL    = '#F06030';   // orange coral fidèle
const MAX_DOMAINS = 10;

const getDomain = (url) => (url || '').replace(/https?:\/\//, '').split('/')[0];
const getFirstName = (n) => (n || '').split(' ')[0] || 'vous';

// Génère couleur + initiales pour avatar domaine
const AV_COLORS = ['#7B7D8C', '#F06030', '#3B7DD8', '#1EA87A', '#8B5CF6', '#D97706'];
function avatarColor(str) {
  let h = 0;
  for (let i = 0; i < (str||'').length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}
function initials(name) {
  const p = (name||'').trim().split(/[\s\-\.]+/);
  if (p.length >= 2) return (p[0][0]+p[1][0]).toUpperCase();
  return (name||'??').slice(0,2).toUpperCase();
}

// ── Scan logic ──
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

// ── Grand ring score pour la carte sombre ──
function BigRing({ score }) {
  const size = 64, sw = 5, R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  const color = score >= 65 ? '#22C55E' : score >= 30 ? CORAL : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score/100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: WHITE }}>{score}</span>
      </div>
    </div>
  );
}

// ── Petit ring pour la liste domaines ──
function SmallRing({ score }) {
  const size = 44, sw = 3.5, R = (size - sw) / 2 - 1;
  const circ = 2 * Math.PI * R;
  const color = score >= 65 ? '#22C55E' : score >= 30 ? CORAL : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={BORDER} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score/100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK }}>{score}</span>
      </div>
    </div>
  );
}

// ── Bouton module (hover: fond gris → blanc + mini rebond) ──
function ModuleCard({ label, sub, Icon, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: 10, padding: '14px 12px', borderRadius: 14, cursor: 'pointer',
        background: hovered ? WHITE : BG,
        border: `1.5px solid ${hovered ? '#CBC7BE' : BORDER}`,
        textAlign: 'left', fontFamily: F, width: '100%',
        transition: 'background 180ms, border-color 180ms',
        outline: 'none',
      }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: hovered ? BG : WHITE,
        border: `1.5px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 180ms',
      }}>
        <Icon size={16} color={INK2} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: INK, lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: 11, color: INK3, marginTop: 3, fontWeight: 400 }}>{sub}</div>
      </div>
    </motion.button>
  );
}

// ── Scan loader plein écran ──
function ScanLoader({ url }) {
  const [step, setStep] = useState(0);
  const steps = ['Récupération du site…','Simulation IA en cours…','Calcul du LRS…','Génération du rapport…'];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s+1, steps.length-1)), 8000);
    return () => clearInterval(iv);
  }, []);
  const domain = getDomain(url);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: CARD_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: F }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.12)`, borderTopColor: CORAL, animation: 'spin 0.9s linear infinite', marginBottom: 20 }} />
      <div style={{ fontSize: 20, fontWeight: 800, color: WHITE, marginBottom: 8, letterSpacing: '-0.03em' }}>Analyse de <span style={{ color: CORAL }}>{domain}</span></div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>8 moteurs IA · ~60 secondes</div>
      <div style={{ width: '100%', maxWidth: 340, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.5s' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: i < step ? CORAL : 'transparent', border: `2px solid ${i <= step ? CORAL : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i < step && <svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {i === step && <div style={{ width: 4, height: 4, borderRadius: '50%', background: CORAL, animation: 'pulse 1s ease-in-out infinite' }} />}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{s}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </motion.div>
  );
}

// ── Premier scan (pas encore de domaines) ──
function ScanHero({ onScan }) {
  const [url, setUrl] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: F, background: BG }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: '0 0 6px', letterSpacing: '-0.03em', textAlign: 'center' }}>Êtes-vous recommandé par les IA ?</h1>
      <p style={{ fontSize: 14, color: INK3, margin: '0 0 32px', textAlign: 'center' }}>Votre score LRS en 60 secondes — 8 moteurs IA analysés.</p>
      <div style={{ width: '100%', maxWidth: 460, background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', gap: 10 }}>
          <Plus size={14} color={INK3} />
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && url.trim() && onScan(url.trim())}
            placeholder="Rechercher un domaine, lancer une analyse…" autoFocus
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: INK, fontFamily: F }} />
        </div>
        <button onClick={() => url.trim() && onScan(url.trim())}
          style={{ width: '100%', padding: '12px', background: CORAL, color: WHITE, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Analyser ma visibilité IA <ArrowRight size={14} />
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
  const [planId, setPlanId] = useState('free');
  const [scanningUrls, setScanningUrls] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const scanningRef = useRef({});

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
  const domain = getDomain(activeProfile?.site_url);
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
    { label: 'Rapport IA',   sub: 'LRS · moteurs',      Icon: BarChart2,    route: '/ai-report' },
    { label: 'Audit',        sub: 'Technique et crawl', Icon: ClipboardCheck, route: '/audit' },
    { label: 'Performance',  sub: 'Part de voix',       Icon: TrendingUp,   route: '/performance' },
    { label: 'Connexions',   sub: 'GSC · Analytics',    Icon: Link2,        route: '/connections' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '32px 20px 100px' }}>

        {/* ── Titre ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Bonjour {getFirstName(user?.full_name)}.
          </h1>
          <p style={{ fontSize: 13, color: INK3, margin: 0, fontWeight: 400 }}>Que souhaitez-vous analyser aujourd'hui ?</p>
        </div>

        {/* ── Barre recherche ── */}
        <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <Plus size={15} color={INK3} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchQuery.trim() && startScan(searchQuery.trim().startsWith('http') ? searchQuery.trim() : `https://${searchQuery.trim()}`)}
            placeholder="Rechercher un domaine, lancer une analyse…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: INK, fontFamily: F, minWidth: 0 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, cursor: 'pointer', flexShrink: 0, userSelect: 'none' }}>
            <span style={{ fontSize: 12.5, color: INK2, whiteSpace: 'nowrap', fontWeight: 400 }}>Tous les moteurs</span>
            <ChevronDown size={13} color={INK3} strokeWidth={1.8} />
          </div>
          <button style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 8 }}>
            <Mic size={15} color={INK3} strokeWidth={1.8} />
          </button>
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => searchQuery.trim() && startScan(searchQuery.trim().startsWith('http') ? searchQuery.trim() : `https://${searchQuery.trim()}`)}
            style={{ width: 34, height: 34, border: 'none', background: CORAL, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowRight size={15} color={WHITE} strokeWidth={2.2} />
          </motion.button>
        </div>

        {/* ── Score card ── */}
        <div style={{ marginBottom: 14 }}>
          {isScanningActive ? (
            <div style={{ background: CARD_BG, borderRadius: 16, padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.12)`, borderTopColor: CORAL, animation: 'spin 0.9s linear infinite' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: WHITE, margin: 0 }}>Analyse de {domain}…</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, textAlign: 'center' }}>8 moteurs IA · ~60s · Vous pouvez naviguer</p>
            </div>
          ) : hasData ? (
            <motion.div
              onClick={() => navigate('/ai-report')}
              whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.998 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              style={{ background: CARD_BG, borderRadius: 16, padding: '20px 22px', cursor: 'pointer', userSelect: 'none' }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>Score d'autorité</span>
                <div style={{ padding: '4px 11px', background: `${lrsColor}28`, border: `1px solid ${lrsColor}55`, borderRadius: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: lrsColor }}>{lrsLabel}</span>
                </div>
              </div>

              {/* Score + chiffre */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <BigRing score={lrs} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: WHITE, letterSpacing: '-0.05em', lineHeight: 1 }}>{lrs}</span>
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/100</span>
                </div>
              </div>

              {/* Insight */}
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', lineHeight: 1.65, fontWeight: 400 }}>
                {activeProfile?.shock_insight
                  ? activeProfile.shock_insight.slice(0, 140) + (activeProfile.shock_insight.length > 140 ? '…' : '')
                  : 'Tant que votre site reste sur une adresse de test, vos concurrents récupèrent vos clients potentiels sur Google et les IA.'}
              </p>

              {/* Engine bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
                {ENGINES.map(e => {
                  const s = activeProfile[`${e.key}_score`] || 0;
                  return (
                    <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', width: 58, flexShrink: 0, fontWeight: 400 }}>{e.label}</span>
                      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${Math.min(s, 100)}%` }}
                          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                          style={{ height: '100%', background: CORAL, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', width: 16, textAlign: 'right', fontWeight: 500 }}>{s}</span>
                    </div>
                  );
                })}
              </div>

              {/* Lien rapport */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: CORAL }}>Voir le rapport complet</span>
                <ArrowRight size={13} color={CORAL} strokeWidth={2.2} />
              </div>
            </motion.div>
          ) : (
            <div style={{ background: CARD_BG, borderRadius: 16, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertCircle size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: WHITE, margin: '0 0 2px' }}>Aucune analyse pour ce domaine</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Lancez une analyse — 8 moteurs IA en parallèle</p>
              </div>
              <motion.button onClick={() => startScan(activeProfile.site_url)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: CORAL, borderRadius: 9, fontSize: 12, fontWeight: 700, color: WHITE, border: 'none', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
                <Zap size={12} strokeWidth={2} /> Analyser
              </motion.button>
            </div>
          )}
        </div>

        {/* ── Modules 4 colonnes ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 26 }}>
          {MODULES.map(m => (
            <ModuleCard key={m.label} label={m.label} sub={m.sub} Icon={m.Icon} onClick={() => navigate(m.route)} />
          ))}
        </div>

        {/* ── Mes domaines ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: INK2 }}>Mes domaines · {profiles.length}/{MAX_DOMAINS}</span>
            {profiles.length < MAX_DOMAINS && (
              <motion.button
                onClick={() => setShowAddModal(true)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', border: 'none', borderRadius: 999, background: INK, fontSize: 12.5, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F }}>
                <Zap size={12} color={CORAL} fill={CORAL} strokeWidth={0} />
                Analyser
              </motion.button>
            )}
          </div>

          <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            {profiles.map((p, i) => {
              const score = Math.round(p?.lrs_score || p?.score_overall || 0);
              const isActive = (activeUrl || profiles[0]?.site_url) === p.site_url;
              const lbl = getDomain(p.site_url);
              const name = p.identity_name || lbl;
              const av = avatarColor(lbl);
              const init = initials(name);
              const isScanning = !!scanningUrls[p.site_url];

              return (
                <motion.div key={p.site_url || i}
                  onClick={() => switchDomain(p)}
                  whileHover={{ backgroundColor: '#F5F2EC' }}
                  transition={{ duration: 0.15 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', cursor: 'pointer', background: isActive ? '#F0EDE6' : WHITE, borderBottom: i < profiles.length - 1 ? `1px solid ${BORDER}` : 'none' }}>

                  {/* Avatar */}
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: WHITE, letterSpacing: '-0.01em' }}>{init}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: 12, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1, fontWeight: 400 }}>{lbl}</div>
                  </div>

                  {isScanning ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: `${CORAL}12`, borderRadius: 20, flexShrink: 0 }}>
                      <Loader size={10} color={CORAL} style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: CORAL }}>Analyse…</span>
                    </div>
                  ) : score > 0 ? (
                    <SmallRing score={score} />
                  ) : (
                    <span style={{ fontSize: 11, color: INK3, background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '2px 8px', flexShrink: 0, fontWeight: 400 }}>—</span>
                  )}

                  <button onClick={e => { e.stopPropagation(); handleDeleteDomain(p); }}
                    style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0, transition: 'opacity 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                    <Trash2 size={12} color="#EF4444" strokeWidth={1.8} />
                  </button>
                </motion.div>
              );
            })}

            {profiles.length < MAX_DOMAINS && (
              <motion.div onClick={() => setShowAddModal(true)}
                whileHover={{ backgroundColor: '#F5F2EC' }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', cursor: 'pointer', borderTop: `1px solid ${BORDER}`, background: WHITE }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px dashed ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Plus size={14} color={INK3} strokeWidth={1.8} />
                </div>
                <span style={{ fontSize: 13, color: INK3, fontWeight: 400 }}>Ajouter un domaine à surveiller</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ajout domaine ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', padding: 16 }}
            onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: WHITE, borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 380, position: 'relative', fontFamily: F, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
              <button onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, cursor: 'pointer' }}>
                <X size={11} color={INK3} />
              </button>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Nouveau domaine</h2>
              <p style={{ fontSize: 12, color: INK3, margin: '0 0 18px' }}>L'IA va analyser ce site et calculer son score LRS.</p>
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
        style={{ width: '100%', padding: '11px 13px', fontSize: 13, border: `1.5px solid #DDD9D0`, borderRadius: 10, outline: 'none', boxSizing: 'border-box', marginBottom: 14, fontFamily: "'Inter', sans-serif", color: '#1C1A17', background: '#F0EDE6' }} />
      <button onClick={() => url.trim() && onSubmit(clean())} disabled={!url.trim()}
        style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, color: '#FFFFFF', background: url.trim() ? '#F06030' : '#ccc', border: 'none', borderRadius: 11, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Zap size={14} />
        Lancer l'analyse
      </button>
    </div>
  );
}