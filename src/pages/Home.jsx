import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, ArrowRight, Link2, BarChart2, ClipboardCheck, TrendingUp, Mic, Zap, Loader, AlertCircle, ChevronDown } from 'lucide-react';
import { setActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';
import { getWokFeatures, getWokPlanId } from '@/lib/wok-plans';

// ── Design tokens (fidèles à l'image) ──
const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#F5F3EE';          // fond crème chaud
const CARD_BG = '#3D3A35';     // carte score — brun-noir chaud (pas noir froid)
const CARD_BORDER = 'rgba(255,255,255,0.07)';
const WHITE = '#FFFFFF';
const INK = '#1A1916';         // texte principal — noir chaud
const INK2 = '#5C5952';        // texte secondaire
const INK3 = '#9A9590';        // texte tertiaire
const BORDER = '#E4E1DA';      // bordure crème
const CORAL = '#F25C38';       // orange/corail fidèle image
const MODULE_BG = '#FFFFFF';
const MAX_DOMAINS = 10;

// ── Utilitaires ──
const getDomainLabel = (url) => (url || '').replace(/https?:\/\//, '').split('/')[0];
const getFirstName = (fullName) => (fullName || '').split(' ')[0];

// Couleurs d'avatar pour les domaines (comme dans l'image)
const AVATAR_COLORS = ['#6B7280', '#F25C38', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
function getAvatarColor(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function getInitials(name) {
  const parts = (name || '').split(/[\s\-\.]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || '??').slice(0, 2).toUpperCase();
}

// ── Score ring (fidèle image — fin, élégant) ──
function ScoreRing({ score, size = 42, strokeWidth = 3 }) {
  const R = size / 2 - strokeWidth - 1;
  const circ = 2 * Math.PI * R;
  const color = score >= 65 ? '#10B981' : score >= 30 ? CORAL : '#EF4444';
  const trackColor = 'rgba(255,255,255,0.12)';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size > 36 ? 11 : 9, fontWeight: 700, color: size > 50 ? WHITE : INK }}>{Math.round(score)}</span>
      </div>
    </div>
  );
}

// ── Score ring pour carte sombre (grand) ──
function LargeScoreRing({ score, size = 72 }) {
  const R = size / 2 - 6;
  const circ = 2 * Math.PI * R;
  const color = score >= 65 ? '#10B981' : score >= 30 ? CORAL : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: WHITE, lineHeight: 1, letterSpacing: '-0.03em' }}>{Math.round(score)}</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>/100</span>
      </div>
    </div>
  );
}

// ── Scan loader ──
function ScanLoader({ url }) {
  const [step, setStep] = useState(0);
  const steps = ['Récupération du site…', 'Simulation IA en cours…', 'Calcul du LRS…', 'Génération du rapport…'];
  const domain = getDomainLabel(url);
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 8000);
    return () => clearInterval(iv);
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: CARD_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: F }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.12)`, borderTopColor: CORAL, animation: 'spin 0.9s linear infinite', margin: '0 auto 20px' }} />
        <div style={{ fontSize: 20, fontWeight: 800, color: WHITE, marginBottom: 8, letterSpacing: '-0.03em' }}>Analyse de <span style={{ color: CORAL }}>{domain}</span></div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>8 moteurs IA · ~60 secondes</div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px', textAlign: 'left' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.5s' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: i < step ? CORAL : 'transparent', border: `2px solid ${i <= step ? CORAL : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i < step && <svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {i === step && <div style={{ width: 4, height: 4, borderRadius: '50%', background: CORAL, animation: 'spulse 1s ease-in-out infinite' }} />}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.5)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}

// ── ScanHero (premier domaine) ──
function ScanHero({ onScan }) {
  const [url, setUrl] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: F, background: BG }}>
      <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: '-0.04em', textAlign: 'center' }}>Êtes-vous recommandé par les IA ?</h1>
      <p style={{ fontSize: 14, color: INK3, margin: '0 0 32px', textAlign: 'center', maxWidth: 320 }}>Votre score LRS en 60 secondes — 8 moteurs IA analysés simultanément.</p>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', gap: 10 }}>
            <Plus size={14} color={INK3} style={{ flexShrink: 0 }} />
            <input value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && url.trim() && onScan(url.trim())}
              placeholder="Rechercher un domaine, lancer une analyse…" autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: INK, fontFamily: F }} />
          </div>
          <button onClick={() => url.trim() && onScan(url.trim())}
            style={{ width: '100%', padding: '13px', background: CORAL, color: WHITE, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 150ms' }}
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

// ── Scan logic ──
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
    site_url: inputUrl, identity_name: mainData.business_name || '',
    identity_industry: mainData.business_type || '', identity_city: mainData.city || '',
    score_ai_visibility: mainData.ai_visibility_score || 0,
    score_message_clarity: mainData.message_clarity_score || 0,
    score_commercial_signal: mainData.commercial_presence_score || 0,
    score_overall: mainData.overall_score || 0,
    last_scan: new Date().toISOString(), brand_keywords, active: true,
  };
  if (existing) await base44.entities.BusinessProfile.update(existing.id, profileFields);
  else await base44.entities.BusinessProfile.create({ ...profileFields, created_by_id: userId });
  return mainData;
}

// ── MAIN ──
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
        setActiveDomain({ url: first.site_url, name: first.identity_name || getDomainLabel(first.site_url) });
      }
      return { u, enriched };
    } catch {}
  };

  useEffect(() => { loadAll(); }, []);

  const switchDomain = (profile) => {
    setActiveUrl(profile.site_url);
    setActiveDomain({ url: profile.site_url, name: profile.identity_name || getDomainLabel(profile.site_url) });
  };

  const startScan = async (cleanUrl) => {
    if (scanningRef.current[cleanUrl]) return;
    scanningRef.current[cleanUrl] = true;
    setScanningUrls(prev => ({ ...prev, [cleanUrl]: true }));
    setProfiles(prev => {
      if (prev.find(p => p.site_url === cleanUrl)) return prev;
      const label = getDomainLabel(cleanUrl);
      return [...prev, { site_url: cleanUrl, identity_name: label, score_overall: 0, _scanning: true }];
    });
    setActiveUrl(cleanUrl);
    setActiveDomain({ url: cleanUrl, name: getDomainLabel(cleanUrl) });
    try {
      const u = await base44.auth.me();
      if (!u) return;
      const features = getWokFeatures(u);
      const result = await runScan(cleanUrl, u.id, features);
      await loadAll();
      setOnboardingData(result);
    } catch (err) { console.error('Scan failed', err); }
    finally {
      scanningRef.current[cleanUrl] = false;
      setScanningUrls(prev => { const n = { ...prev }; delete n[cleanUrl]; return n; });
    }
  };

  const handleSearchScan = () => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    const url = q.startsWith('http') ? q : `https://${q}`;
    startScan(url);
    setSearchQuery('');
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

  const firstScanUrl = profiles.length === 0 && Object.keys(scanningUrls)[0];
  if (firstScanUrl) return <ScanLoader url={firstScanUrl} />;

  if (!user && profiles.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: CORAL, animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <>
        <ScanHero onScan={(url) => startScan(url.startsWith('http') ? url : `https://${url}`)} />
        {onboardingData && <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />}
      </>
    );
  }

  const activeProfile = profiles.find(p => p.site_url === activeUrl) || profiles[0];
  const domainLabel = getDomainLabel(activeProfile?.site_url);
  const lrs = Math.round(activeProfile?.lrs_score || activeProfile?.score_overall || 0);
  const lrsColor = lrs >= 65 ? '#10B981' : lrs >= 30 ? CORAL : '#EF4444';
  const lrsLabel = lrs >= 65 ? 'Bonne visibilité' : lrs >= 30 ? 'Visibilité partielle' : 'Faible visibilité';
  const isScanningActive = !!scanningUrls[activeProfile?.site_url];
  const hasData = activeProfile && (activeProfile.score_overall > 0 || activeProfile.lrs_score > 0);
  const firstName = getFirstName(user?.full_name);

  const engineScores = [
    { key: 'chatgpt', label: 'ChatGPT' },
    { key: 'gemini', label: 'Gemini' },
    { key: 'claude', label: 'Claude' },
  ];

  const ACTIONS = [
    { label: 'Rapport IA', desc: 'LRS · moteurs', icon: BarChart2, route: '/ai-report' },
    { label: 'Audit', desc: 'Technique et crawl', icon: ClipboardCheck, route: '/audit' },
    { label: 'Performance', desc: 'Part de voix', icon: TrendingUp, route: '/performance' },
    { label: 'Connexions', desc: 'GSC · Analytics', icon: Link2, route: '/connections' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 20px 100px' }}>

        {/* ── Salutation ── */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: '0 0 2px', letterSpacing: '-0.03em' }}>
            Bonjour {firstName || 'Antoine'}.
          </h1>
          <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Que souhaitez-vous analyser aujourd'hui ?</p>
        </div>

        {/* ── Barre de recherche / analyse ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: WHITE, border: `1.5px solid ${BORDER}`,
          borderRadius: 12, padding: '10px 14px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 20,
        }}>
          <Plus size={14} color={INK3} style={{ flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchScan()}
            placeholder="Rechercher un domaine, lancer une analyse…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: INK, fontFamily: F }}
          />
          {/* Dropdown moteurs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, border: `1px solid ${BORDER}`, cursor: 'pointer', flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: INK2, whiteSpace: 'nowrap' }}>Tous les moteurs</span>
            <ChevronDown size={12} color={INK3} />
          </div>
          <button style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mic size={14} color={INK3} />
          </button>
          <button
            onClick={handleSearchScan}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: CORAL, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'opacity 150ms' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <ArrowRight size={14} color={WHITE} />
          </button>
        </div>

        {/* ── Score Card — brun-noir chaud ── */}
        <div style={{ marginBottom: 14 }}>
          {isScanningActive ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: CARD_BG, borderRadius: 16, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.12)`, borderTopColor: CORAL, animation: 'spin 0.9s linear infinite' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: WHITE, margin: 0 }}>Analyse de {domainLabel}…</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>8 moteurs IA · ~60 secondes · Continuez à naviguer</p>
            </motion.div>
          ) : hasData ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/ai-report')}
              style={{ background: CARD_BG, borderRadius: 16, padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>

              {/* Header carte */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.01em' }}>Score d'autorité</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: `${lrsColor}22`, border: `1px solid ${lrsColor}44`, borderRadius: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: lrsColor }}>{lrsLabel}</span>
                </div>
              </div>

              {/* Score + insight */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <LargeScoreRing score={lrs} size={72} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, color: WHITE, letterSpacing: '-0.05em', lineHeight: 1 }}>{lrs}</span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>/100</span>
                  </div>
                </div>
              </div>

              {/* Insight texte */}
              {activeProfile?.shock_insight ? (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '0 0 18px', lineHeight: 1.6 }}>
                  {activeProfile.shock_insight.slice(0, 130)}{activeProfile.shock_insight.length > 130 ? '…' : ''}
                </p>
              ) : (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 18px', lineHeight: 1.6 }}>
                  Tant que votre site reste sur une adresse de test, vos concurrents récupèrent vos clients potentiels sur Google et les IA.
                </p>
              )}

              {/* Engine bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {engineScores.map((e) => {
                  const s = activeProfile[`${e.key}_score`] || 0;
                  return (
                    <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', width: 56, fontWeight: 500, flexShrink: 0 }}>{e.label}</span>
                      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${Math.min(s, 100)}%`, background: CORAL, borderRadius: 2, transition: 'width 1s ease' }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', width: 18, textAlign: 'right', fontWeight: 600 }}>{s}</span>
                    </div>
                  );
                })}
              </div>

              {/* CTA lien */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: CORAL }}>Voir le rapport complet</span>
                <ArrowRight size={12} color={CORAL} />
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: CARD_BG, borderRadius: 16, padding: '22px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertCircle size={18} color={'rgba(255,255,255,0.4)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: WHITE, margin: '0 0 2px' }}>Aucune analyse pour ce domaine</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Lancez une analyse — 8 moteurs IA en parallèle</p>
                </div>
                <button onClick={() => startScan(activeProfile.site_url)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: CORAL, borderRadius: 9, fontSize: 12, fontWeight: 700, color: WHITE, border: 'none', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
                  <Zap size={11} /> Analyser
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Modules 4 colonnes ── */}
        {!isScanningActive && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
            {ACTIONS.map((a) => (
              <button key={a.label} onClick={() => navigate(a.route)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: '14px 12px', borderRadius: 12, cursor: 'pointer', background: MODULE_BG, border: `1.5px solid ${BORDER}`, textAlign: 'left', fontFamily: F, transition: 'border-color 150ms, box-shadow 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#CDC9C2'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <a.icon size={15} color={INK2} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK, lineHeight: 1.2 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Liste domaines ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: INK2 }}>
              Mes domaines · {profiles.length}/{MAX_DOMAINS}
            </span>
            {profiles.length < MAX_DOMAINS && (
              <button onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: 'none', borderRadius: 999, background: CARD_BG, fontSize: 12, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F, transition: 'opacity 150ms' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <Zap size={11} color={CORAL} fill={CORAL} strokeWidth={0} />
                Analyser
              </button>
            )}
          </div>

          <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            {profiles.map((p, i) => {
              const score = Math.round(p?.lrs_score || p?.score_overall || 0);
              const isActive = (activeUrl || profiles[0]?.site_url) === p.site_url;
              const label = getDomainLabel(p.site_url);
              const name = p.identity_name || label;
              const initials = getInitials(name);
              const avatarColor = getAvatarColor(label);
              const isScanning = !!scanningUrls[p.site_url];

              return (
                <div key={p.site_url || i}
                  onClick={() => switchDomain(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', background: isActive ? '#F8F6F1' : WHITE, borderBottom: i < profiles.length - 1 ? `1px solid ${BORDER}` : 'none', transition: 'background 0.12s' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#FAFAF7'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = WHITE; }}>

                  {/* Avatar initiales coloré */}
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: WHITE, letterSpacing: '-0.01em' }}>{initials}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: 11, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{label}</div>
                  </div>

                  {isScanning ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: `${CORAL}12`, borderRadius: 20, flexShrink: 0 }}>
                      <Loader size={10} color={CORAL} style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: CORAL }}>Analyse…</span>
                    </div>
                  ) : score > 0 ? (
                    // Ring avec fond crème pour les items de liste
                    <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                      <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="20" cy="20" r="16" fill="none" stroke="#EDE9E2" strokeWidth="3" />
                        <circle cx="20" cy="20" r="16" fill="none"
                          stroke={score >= 65 ? '#10B981' : score >= 30 ? CORAL : '#EF4444'}
                          strokeWidth="3"
                          strokeDasharray={2 * Math.PI * 16}
                          strokeDashoffset={2 * Math.PI * 16 * (1 - score / 100)}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1s ease' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: INK }}>{score}</span>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 10, color: INK3, background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>—</span>
                  )}

                  <button onClick={e => { e.stopPropagation(); handleDeleteDomain(p); }}
                    style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.stopPropagation(); }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}
                    ref={el => { if (el) { el.closest('[data-row]') || el.parentElement?.addEventListener('mouseenter', () => el.style.opacity = '0.4'); } }}>
                    <Trash2 size={11} color="#EF4444" />
                  </button>
                </div>
              );
            })}

            {profiles.length < MAX_DOMAINS && (
              <div onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', borderTop: `1px solid ${BORDER}`, transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAF7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px dashed ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Plus size={13} color={INK3} />
                </div>
                <span style={{ fontSize: 13, color: INK3, fontWeight: 500 }}>Ajouter un domaine à surveiller</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ajout domaine ── */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', padding: 16 }}
            onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              onClick={e => e.stopPropagation()}
              style={{ background: WHITE, borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 380, position: 'relative', fontFamily: F, boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}>
              <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, cursor: 'pointer' }}>
                <X size={11} color={INK3} />
              </button>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Nouveau domaine</h2>
              <p style={{ fontSize: 12, color: INK3, margin: '0 0 18px' }}>L'IA va analyser ce site et calculer son score LRS.</p>
              <AddDomainForm onSubmit={(url) => { startScan(url); setShowAddModal(false); }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {onboardingData && (
        <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />
      )}
      <style>{`@keyframes spulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.5)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function AddDomainForm({ onSubmit }) {
  const [url, setUrl] = useState('');
  const submit = () => {
    if (!url.trim()) return;
    const clean = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    onSubmit(clean);
  };
  return (
    <div>
      <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
        placeholder="https://votre-site.com"
        style={{ width: '100%', padding: '11px 13px', fontSize: 13, border: `1.5px solid ${BORDER}`, borderRadius: 10, outline: 'none', boxSizing: 'border-box', marginBottom: 14, fontFamily: "'Inter', sans-serif", color: '#1A1916', background: '#F5F3EE' }} />
      <button onClick={submit} disabled={!url.trim()}
        style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, color: '#FFFFFF', background: url.trim() ? '#F25C38' : '#ccc', border: 'none', borderRadius: 11, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Zap size={14} />
        Lancer l'analyse
      </button>
    </div>
  );
}