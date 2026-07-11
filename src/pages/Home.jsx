import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Zap, AlertCircle, Plus, Globe, RefreshCw } from 'lucide-react';
import { setActiveDomain, getActiveDomain, initActiveDomainFromUser, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import { getCachedUser, getCachedProfiles, invalidateProfiles, peekCache, setCache } from '@/lib/data-cache';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';
import HeroVerdict from '@/components/home/HeroVerdict';
import DomainManagerModal from '@/components/home/DomainManagerModal';
import { getWokFeatures } from '@/lib/wok-plans';
import { checkScanQuota, checkSiteQuota } from '@/lib/quota-enforcement';

import CompetitorsCard from '@/components/dashboard/CompetitorsCard';
import LLMCitingCard from '@/components/dashboard/LLMCitingCard';
import HomeSkeleton from '@/components/skeletons/HomeSkeleton';

// ── Design System ──────────────────────────────
const F       = '"Wix Madefor Text", "Wix Madefor Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const BG      = '#F7F5F0';
const CARD_BG = '#15130F';
const WHITE   = '#FFFFFF';
const INK     = '#1A1814';
const INK2    = '#857E6E';
const INK3    = '#A8A49F';
const BORDER  = 'rgba(21,19,15,0.12)';
const CORAL   = '#FF5A1F';
const ORANGE_DEEP = '#C43E14';

const getDomain    = (url) => (url || '').replace(/https?:\/\//, '').split('/')[0];
const getFirstName = (n)   => (n || '').split(' ')[0] || 'there';

// ── AI Logo URLs ────────────────────────────────
const AI_LOGO_URLS = {
  chatgpt:    'https://media.base44.com/images/public/6a2edc91082e534601118582/67cb277ed_image.png',
  gemini:     'https://media.base44.com/images/public/6a2edc91082e534601118582/f37dc5b5a_image.png',
  claude:     'https://media.base44.com/images/public/6a2edc91082e534601118582/d67c08a4b_image.png',
};

const AILogoImg = ({ id, size = 18 }) => {
  const url = AI_LOGO_URLS[id];
  if (!url) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={INK} strokeWidth="1.5"/>
      <path d="M8 12h8M12 8l4 4-4 4" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return <img src={url} width={size} height={size} style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }} alt={id} />;
};

// ── Compact score donut ─────────────────────────
function ScoreDonut({ score }) {
  const size = 56, sw = 5, R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={CORAL} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score/100)} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: WHITE, lineHeight: 1, letterSpacing: '-0.03em', fontFamily: F }}>{score}</span>
        <span style={{ fontSize: 8, fontWeight: 500, color: 'rgba(255,255,255,0.35)', lineHeight: 1.2, fontFamily: F }}>/100</span>
      </div>
    </div>
  );
}

// ── Scan loader (full screen — first scan) ──────
function ScanLoader({ url }) {
  const [step, setStep] = useState(0);
  const steps = ['Reading your website…', 'Asking the AI engines…', 'Calculating your score…', 'Building your report…'];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 8000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: CARD_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: F }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: CORAL, animation: 'spin 0.9s linear infinite', marginBottom: 18 }} />
      <div style={{ fontSize: 20, fontWeight: 700, color: WHITE, marginBottom: 5 }}>Checking <span style={{ color: CORAL }}>{getDomain(url)}</span></div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>8 AI engines · about 60 seconds</div>
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

// ── Empty state (no website yet) ────────────────
function EmptyState({ onAdd }) {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: F, textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: 18, background: WHITE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Globe size={26} color={CORAL} strokeWidth={1.8} />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Let's see how AI sees your business</h1>
      <p style={{ fontSize: 15, color: INK2, margin: '0 0 24px', maxWidth: 400, lineHeight: 1.55 }}>
        Add your website and we'll instantly check whether AI engines like ChatGPT recommend you.
      </p>
      <button onClick={onAdd}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: CORAL, color: WHITE, border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
        <Plus size={16} strokeWidth={2.4} /> Add your website
      </button>
      <p style={{ fontSize: 12, color: INK3, marginTop: 12 }}>Free · Instant result · No card required</p>
    </div>
  );
}

// ── Scan logic (kept — used by autoScan navigation) ──────────────
async function runScan(inputUrl, userId, features) {
  const isFull = features?.scan_type === 'full';
  const mainFn = isFull ? 'analyzeWebsite' : 'analyzeWebsiteLite';

  // SEQUENTIAL — not parallel. Browsers cap at 6 connections per domain.
  // Firing 12 simultaneous backend calls saturates the pool and freezes the entire app.
  const mainRes = await base44.functions.invoke(mainFn, { url: inputUrl });
  const d = mainRes?.data || {};

  if (isFull) {
    // These are optional enrichments — run one at a time, never block the main result
    try {
      const auditRes = await base44.functions.invoke('analyzeAudit', { url: inputUrl }).catch(() => ({ data: {} }));
      d.audit_data = auditRes?.data || {};
      d.audit_analyzed_at = new Date().toISOString();
    } catch {}
    try {
      const perfRes = await base44.functions.invoke('analyzePerformance', { url: inputUrl, business_name: '' }).catch(() => ({ data: {} }));
      d.perf_data = perfRes?.data || {};
      d.perf_analyzed_at = new Date().toISOString();
    } catch {}
    try {
      const overviewRes = await base44.functions.invoke('dashboardOverview', { url: inputUrl, business_name: '' }).catch(() => ({ data: null }));
      if (overviewRes?.data && !overviewRes.data.error) {
        d.overview_data = overviewRes.data;
        d.overview_analyzed_at = new Date().toISOString();
      }
    } catch {}
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

// ── MAIN ──────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(authUser || peekCache('__user__') || null);
  const [profiles, setProfiles] = useState(() => peekCache('__home_profiles__') || []);
  const [activeUrl, setActiveUrl] = useState(() => getActiveDomain()?.url || null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [scanningUrls, setScanningUrls] = useState({});
  const [domainModal, setDomainModal] = useState(null); // 'add' | 'manage' | null

  // Dashboard overview state
  const [overview, setOverview] = useState(null);
  const [overviewPhase, setOverviewPhase] = useState('loading'); // loading | thinking | done | error
  const [scanError, setScanError] = useState(null); // { url, message } when a scan fails

  const scanningRef = useRef({});
  const pendingScanUrlsRef = useRef([]);
  const resumedRef = useRef(new Set()); // tracks auto-resumed URLs — prevents infinite retry loops

  // ── Auto-scan from navigation state (sidebar "Add a website", WOK AI scan mode) ──
  useEffect(() => {
    if (location.state?.autoScan) {
      const raw = location.state.autoScan.trim();
      navigate(location.pathname, { replace: true, state: {} });
      if (raw) {
        const clean = raw.startsWith('http') ? raw : `https://${raw}`;
        startScan(clean);
      }
    }
  }, [location.state]);

  const loadAll = async () => {
    try {
      // Use authUser from context first — avoids redundant base44.auth.me() network call
      const u = authUser || peekCache('__user__') || await getCachedUser();
      if (!u) return;
      setUser(u);
      setCache('__user__', u);
      initActiveDomainFromUser(); // non-blocking (has internal guard)
      const list = await getCachedProfiles(u.id);
      const enriched = await Promise.all(list.map(async p => {
        const extra = await getProfileData(p).catch(() => ({}));
        return { ...p, ...extra };
      }));
      setProfiles(enriched);
      setCache('__home_profiles__', enriched);
      let curUrl = activeUrl;
      if (!curUrl && enriched.length > 0) {
        curUrl = enriched[0].site_url;
        setActiveUrl(curUrl);
        setActiveDomain({ url: curUrl, name: enriched[0].identity_name || getDomain(curUrl) });
      }
      const inProgress = enriched.filter(p => p.scan_in_progress);
      if (inProgress.length > 0) {
        const map = {};
        inProgress.forEach(p => { map[p.site_url] = true; });
        setScanningUrls(prev => ({ ...prev, ...map }));
        pendingScanUrlsRef.current = inProgress.map(p => p.site_url);
      }
    } catch {}
  };

  useEffect(() => {
    loadAll().then(async () => {
      const toResume = pendingScanUrlsRef.current || [];
      pendingScanUrlsRef.current = [];
      toResume.forEach(url => {
        // Only auto-resume once per session — if it fails again, let the user trigger manually
        if (!scanningRef.current[url] && !resumedRef.current.has(url)) {
          resumedRef.current.add(url);
          startScan(url);
        } else {
          // Already tried — mark as not scanning so the UI shows the "retry" button instead of a frozen state
          base44.entities.BusinessProfile.filter({ site_url: url }).then(profs => {
            const p = profs?.[0];
            if (p?.scan_in_progress) base44.entities.BusinessProfile.update(p.id, { scan_in_progress: false }).catch(() => {});
          }).catch(() => {});
        }
      });

      const pendingUrl = sessionStorage.getItem('wok_post_login_url');
      const pendingQuiz = sessionStorage.getItem('wok_post_login_quiz');
      if (pendingUrl) {
        sessionStorage.removeItem('wok_post_login_url');
        const cleanUrl = pendingUrl.startsWith('http') ? pendingUrl : `https://${pendingUrl}`;
        if (pendingQuiz) {
          sessionStorage.removeItem('wok_post_login_quiz');
          base44.auth.updateMe({ quiz_profile: pendingQuiz }).catch(() => {});
        }
        setTimeout(() => startScan(cleanUrl), 500);
      }
    });
  }, []);

  // ── Load dashboard overview for the active domain ──
  const loadOverview = async (forceRefresh = false) => {
    const active = getActiveDomain();
    if (!active?.url || !user?.id) { setOverviewPhase('done'); return; }
    const cacheKey = `dash_${active.url}`;
    const seed = peekCache(cacheKey);
    if (seed?.data && !forceRefresh) { setOverview(seed.data); setOverviewPhase('done'); }
    try {
      const profs = await getCachedProfiles(user.id);
      const p = profs.find(pr => pr.site_url === active.url) || profs[0];
      if (!p?.site_url) { setOverviewPhase('done'); return; }
      const extra = await getProfileData(p);


      if (!forceRefresh && extra.overview_data && extra.overview_analyzed_at) {
        const age = Date.now() - new Date(extra.overview_analyzed_at).getTime();
        if (age < 24 * 60 * 60 * 1000) {
          setOverview(extra.overview_data); setOverviewPhase('done');
          setCache(cacheKey, { data: extra.overview_data, visibility: {} });
          return;
        }
      }
      if (!seed?.data) setOverviewPhase('thinking');
      const res = await Promise.race([
        base44.functions.invoke('dashboardOverview', { url: p.site_url, business_name: p.identity_name || '' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('overview_timeout')), 30000)),
      ]);
      if (!res?.data || res.data.error) { if (!seed?.data) setOverviewPhase('error'); return; }
      setOverview(res.data);
      setOverviewPhase('done');
      setCache(cacheKey, { data: res.data, visibility: {} });
      const newExtra = { ...extra, previous_overview_data: extra.overview_data || null, previous_overview_at: extra.overview_analyzed_at || null, overview_data: res.data, overview_analyzed_at: new Date().toISOString() };
      const brand_keywords = await uploadProfileData(newExtra);
      base44.entities.BusinessProfile.update(p.id, { brand_keywords }).catch(() => {});
    } catch { if (!seed?.data) setOverviewPhase('error'); }
  };

  useEffect(() => {
    if (user?.id && activeUrl) loadOverview();
  }, [user?.id, activeUrl]);

  // Reload data when the active domain changes elsewhere (sidebar switch, etc.)
  useEffect(() => {
    const unsub = onActiveDomainChange((d) => {
      if (d?.url) { setActiveUrl(d.url); loadAll(); }
    });
    return unsub;
  }, []);

  const planFeatures = user ? getWokFeatures(user) : getWokFeatures(null);
  const maxDomains = planFeatures?.max_sites === -1 ? 999999 : (planFeatures?.max_sites || 1);

  const startScan = async (cleanUrl) => {
    const scanQuota = await checkScanQuota(user || await base44.auth.me().catch(() => null));
    if (!scanQuota.allowed) { setDomainModal('manage'); return; }
    const isNew = !profiles.find(p => p.site_url === cleanUrl);
    if (isNew) {
      const siteQuota = await checkSiteQuota(user || await base44.auth.me().catch(() => null));
      if (!siteQuota.allowed) { setDomainModal('manage'); return; }
    }
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
      const existingProfiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const existingP = existingProfiles.find(p => p.site_url === cleanUrl);
      if (existingP) base44.entities.BusinessProfile.update(existingP.id, { scan_in_progress: true }).catch(() => {});
      else base44.entities.BusinessProfile.create({ site_url: cleanUrl, identity_name: getDomain(cleanUrl), score_overall: 0, scan_in_progress: true, created_by_id: u.id }).catch(() => {});
      // Timeout: if the scan hangs (e.g. usewok.com behind Cloudflare), abort after 60s
      const result = await Promise.race([
        runScan(cleanUrl, u.id, getWokFeatures(u)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Scan timeout')), 60000)),
      ]);
      const updatedProfiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const updatedP = updatedProfiles.find(p => p.site_url === cleanUrl);
      if (updatedP) base44.entities.BusinessProfile.update(updatedP.id, { scan_in_progress: false }).catch(() => {});
      invalidateProfiles(u.id);
      await loadAll();
      await loadOverview(true);
      setOnboardingData(result);
    } catch (err) {
      console.error('Scan failed:', err);
      setScanError({ url: cleanUrl, message: err?.message || 'Scan failed' });
      // CRITICAL: reset scan_in_progress so the page doesn't get stuck in an infinite retry loop on reload
      try {
        const u = await base44.auth.me();
        if (u) {
          const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
          const p = profiles.find(pr => pr.site_url === cleanUrl);
          if (p) base44.entities.BusinessProfile.update(p.id, { scan_in_progress: false }).catch(() => {});
          invalidateProfiles(u.id);
          await loadAll();
          // If this was a NEW site (no score), switch back to a profile that has data
          // so the user doesn't stare at an empty "no analysis" card for the failed site
          const refreshed = await getCachedProfiles(u.id);
          const withData = refreshed.filter(p => (p.score_overall || 0) > 0);
          if (withData.length > 0 && !withData.find(p => p.site_url === cleanUrl)) {
            const fallback = withData[0];
            setActiveUrl(fallback.site_url);
            setActiveDomain({ url: fallback.site_url, name: fallback.identity_name || getDomain(fallback.site_url) });
          }
        }
      } catch {}
    }
    finally {
      scanningRef.current[cleanUrl] = false;
      setScanningUrls(prev => { const n = { ...prev }; delete n[cleanUrl]; return n; });
    }
  };

  const firstScanUrl = profiles.length === 0 && Object.keys(scanningUrls)[0];
  if (firstScanUrl) return <ScanLoader url={firstScanUrl} />;

  if (!user && profiles.length === 0) return <HomeSkeleton />;

  if (profiles.length === 0) return (
    <>
      <EmptyState onAdd={() => setDomainModal('add')} />
      <DomainManagerModal open={!!domainModal} tab={domainModal || 'add'} onClose={() => setDomainModal(null)} user={user} maxDomains={maxDomains} scanningUrls={scanningUrls} />
      {onboardingData && <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />}
    </>
  );

  const activeProfile = profiles.find(p => p.site_url === activeUrl) || profiles[0];
  const lrs = Math.round(activeProfile?.lrs_score || activeProfile?.score_overall || 0);
  const isScanningActive = !!scanningUrls[activeProfile?.site_url];
  const hasData = !!(activeProfile?.score_overall > 0 || activeProfile?.lrs_score > 0);

  // Real visibility %: the brand's own share-of-voice from the overview competitors data
  const youEntry = (overview?.competitors || []).find(c => c.is_you);
  const appearPct = youEntry ? Math.round(youEntry.visibility_pct || 0) : null;
  // The single top competitor to beat — highest visibility that isn't the user's own brand
  const leader = (() => {
    const comp = (overview?.competitors || []).filter(c => !c.is_you && c.name);
    if (!comp.length) return null;
    const top = [...comp].sort((a, b) => (b.visibility_pct || 0) - (a.visibility_pct || 0))[0];
    return { name: top.name, pct: Math.round(top.visibility_pct || 0) };
  })();

  // Previous scan data — used for trend arrows
  const previousOverview = activeProfile?.previous_overview_data || null;
  const previousLlms = previousOverview?.llms_citing || [];
  const previousCompetitors = previousOverview?.competitors || [];

  const PILLARS = [
    { label: 'Ton contenu',    explain: 'Ce que les IA lisent sur toi.',        score: (activeProfile?.score_message_clarity ?? null) },
    { label: 'Tes mentions',   explain: 'Qui parle de toi ailleurs.',           score: (activeProfile?.score_commercial_signal ?? null) },
    { label: 'Ton site',       explain: 'Les IA peuvent-elles lire ton site ?', score: (activeProfile?.score_ai_visibility ?? null) },
  ];

  const brand = overview?.brand_name || activeProfile?.identity_name || getDomain(activeProfile?.site_url);
  const lastScanDate = activeProfile?.last_scan
    ? new Date(activeProfile.last_scan).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    : '';
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '26px 24px 80px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Salut {getFirstName(user?.full_name)} 👋
            </h1>
            <p style={{ fontSize: 15, color: INK2, margin: 0 }}>Voici comment les IA voient {brand}{lastScanDate ? ` · Dernière analyse le ${lastScanDate}` : ''}.</p>
          </div>
          <button onClick={() => setDomainModal('add')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, border: 'none', background: CORAL, color: WHITE, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
            <Plus size={14} strokeWidth={2.4} /> Ajouter un site
          </button>
        </div>

        {/* ── Scanning banner ── */}
        {isScanningActive && (
          <div style={{ background: CARD_BG, borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: CORAL, animation: 'spin 0.9s linear infinite', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: WHITE, margin: '0 0 2px' }}>Analyse de {getDomain(activeProfile?.site_url)}…</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>8 moteurs IA · environ 60s · tu peux continuer à naviguer</p>
            </div>
          </div>
        )}

        {/* ═══════════ Thinking skeleton ═══════════ */}
        {overviewPhase === 'thinking' && !overview && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ background: CARD_BG, borderRadius: 18, padding: '26px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ height: 12, width: 100, borderRadius: 4, marginBottom: 10, background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ height: 20, width: '70%', borderRadius: 4, marginBottom: 6, background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ height: 14, width: '50%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                </div>
              </div>
            </div>
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '26px 24px' }}>
              <div style={{ height: 16, width: 120, borderRadius: 4, marginBottom: 16, background: 'rgba(21,19,15,0.05)' }} />
              <div style={{ height: 22, width: '60%', borderRadius: 4, marginBottom: 8, background: 'rgba(21,19,15,0.05)' }} />
              <div style={{ height: 14, width: '40%', borderRadius: 4, background: 'rgba(21,19,15,0.05)' }} />
            </div>
          </div>
        )}

        {/* ═══════════ THE STORY: score + one action ═══════════ */}
        {/* ═══════════ THE STORY: score ═══════════ */}
        {hasData && !isScanningActive && overview && (
          <HeroVerdict score={lrs} appearPct={appearPct} leader={leader} pillars={PILLARS} overview={overview} />
        )}

        {/* ═══════════ ESSENTIAL DATA ═══════════ */}
        {hasData && !isScanningActive && overview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 4 }}>
            <CompetitorsCard competitors={overview.competitors} previousCompetitors={previousCompetitors} onSeeAll={() => navigate('/competitors')} onWantRank2={() => navigate('/wok-ai', { state: { autoSend: 'How can I reach 2nd place vs my competitors in AI recommendations?' } })} />
            <LLMCitingCard llms={overview.llms_citing} previousLlms={previousLlms} onDetail={() => navigate('/ai-report')} onWantMore={() => navigate('/wok-ai', { state: { autoSend: 'How can I get cited more often by AI engines?' } })} />
          </div>
        )}

        {/* ── Scan error (e.g. Cloudflare block, timeout) ── */}
        {scanError?.url === activeProfile?.site_url && !isScanningActive && (
          <div style={{ background: CARD_BG, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <AlertCircle size={18} color="#F0533A" strokeWidth={1.7} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 14.5, fontWeight: 600, color: WHITE, margin: '0 0 2px' }}>Analyse impossible pour {getDomain(scanError.url)}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Le site bloque le crawl (Cloudflare) ou met trop de temps à répondre. Réessaie dans un instant.</p>
            </div>
            <button onClick={() => { setScanError(null); startScan(activeProfile.site_url); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: CORAL, borderRadius: 8, fontSize: 13, fontWeight: 700, color: WHITE, border: 'none', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
              <Zap size={13} strokeWidth={2} /> Réessayer
            </button>
          </div>
        )}

        {/* ── No data for this domain ── */}
        {!hasData && !isScanningActive && !scanError && (
          <div style={{ background: CARD_BG, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <AlertCircle size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.7} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 14.5, fontWeight: 600, color: WHITE, margin: '0 0 2px' }}>Pas encore d'analyse pour ce site</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Lance une analyse — 8 moteurs IA d'un coup</p>
            </div>
            <button onClick={() => startScan(activeProfile.site_url)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: CORAL, borderRadius: 8, fontSize: 13, fontWeight: 700, color: WHITE, border: 'none', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
              <Zap size={13} strokeWidth={2} /> Analyser
            </button>
          </div>
        )}

        {overviewPhase === 'error' && !overview && hasData && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '18px' }}>
            <button onClick={() => loadOverview(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              <RefreshCw size={13} /> Actualiser le tableau de bord
            </button>
          </div>
        )}
      </div>

      <DomainManagerModal open={!!domainModal} tab={domainModal || 'add'} onClose={() => setDomainModal(null)} user={user} maxDomains={maxDomains} scanningUrls={scanningUrls} />

      {onboardingData && (
        <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}