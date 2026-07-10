import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Zap, AlertCircle, Plus, Globe, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { setActiveDomain, getActiveDomain, initActiveDomainFromUser, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import { getCachedUser, getCachedProfiles, invalidateProfiles, peekCache, setCache } from '@/lib/data-cache';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';
import ScanStatusIndicator from '@/components/home/ScanStatusIndicator';
import NextStepCard from '@/components/home/NextStepCard';
import VisibilityPillars from '@/components/home/VisibilityPillars';
import TestedQuestions from '@/components/home/TestedQuestions';
import DomainManagerModal from '@/components/home/DomainManagerModal';
import { getWokFeatures } from '@/lib/wok-plans';
import { checkScanQuota, checkSiteQuota } from '@/lib/quota-enforcement';
import { isDemoDomain, runDemoScan } from '@/lib/demo-data';

import CustomizePanel, { DASHBOARD_WIDGETS } from '@/components/dashboard/CustomizePanel';
import EvolutionCard from '@/components/dashboard/EvolutionCard';
import TasksCard from '@/components/dashboard/TasksCard';
import CompetitorsCard from '@/components/dashboard/CompetitorsCard';
import LLMCitingCard from '@/components/dashboard/LLMCitingCard';
import CitedPagesCard from '@/components/dashboard/CitedPagesCard';
import AuthorityTasksCard from '@/components/authority/AuthorityTasksCard';
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
  const [mainRes, auditRes, perfRes, overviewRes] = await Promise.all([
    base44.functions.invoke(mainFn, { url: inputUrl }),
    isFull && base44.functions.invoke('analyzeAudit', { url: inputUrl }).catch(() => ({ data: {} })),
    isFull && base44.functions.invoke('analyzePerformance', { url: inputUrl, business_name: '' }).catch(() => ({ data: {} })),
    isFull && base44.functions.invoke('dashboardOverview', { url: inputUrl, business_name: '' }).catch(() => ({ data: null })),
  ]);
  Promise.all([
    base44.functions.invoke('siteAudit', { url: inputUrl }).catch(() => null),
    base44.functions.invoke('brandPerception', { url: inputUrl, kind: 'brand' }).catch(() => null),
    base44.functions.invoke('brandPerception', { url: inputUrl, kind: 'reco' }).catch(() => null),
    base44.functions.invoke('generateBrandKnowledge', { url: inputUrl }).catch(() => null),
    base44.functions.invoke('competitorEngine', { url: inputUrl }).catch(() => null),
    base44.functions.invoke('authorityTasks', { url: inputUrl }).catch(() => null),
    base44.functions.invoke('trackCitations', { url: inputUrl }).catch(() => null),
    base44.functions.invoke('citationGaps', { url: inputUrl }).catch(() => null),
  ]).catch(() => {});
  const d = mainRes?.data || {};
  if (isFull) {
    d.audit_data = auditRes?.data || {};
    d.perf_data = perfRes?.data || {};
    d.audit_analyzed_at = new Date().toISOString();
    d.perf_analyzed_at = new Date().toISOString();
    if (overviewRes?.data && !overviewRes.data.error) {
      d.overview_data = overviewRes.data;
      d.overview_analyzed_at = new Date().toISOString();
    }
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
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [widgetVis, setWidgetVis] = useState({});

  const scanningRef = useRef({});
  const pendingScanUrlsRef = useRef([]);

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
      toResume.forEach(url => { if (!scanningRef.current[url]) startScan(url); });

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
    if (seed?.data && !forceRefresh) { setOverview(seed.data); setWidgetVis(seed.visibility || {}); setOverviewPhase('done'); }
    try {
      const profs = await getCachedProfiles(user.id);
      const p = profs.find(pr => pr.site_url === active.url) || profs[0];
      if (!p?.site_url) { setOverviewPhase('done'); return; }
      const extra = await getProfileData(p);
      let vis = {};
      try { vis = p.dashboard_widgets ? JSON.parse(p.dashboard_widgets) : {}; } catch { vis = {}; }
      setWidgetVis(vis);

      if (!forceRefresh && extra.overview_data && extra.overview_analyzed_at) {
        const age = Date.now() - new Date(extra.overview_analyzed_at).getTime();
        if (age < 24 * 60 * 60 * 1000) {
          setOverview(extra.overview_data); setOverviewPhase('done');
          setCache(cacheKey, { data: extra.overview_data, visibility: vis });
          return;
        }
      }
      if (!seed?.data) setOverviewPhase('thinking');
      const res = await base44.functions.invoke('dashboardOverview', { url: p.site_url, business_name: p.identity_name || '' });
      if (!res?.data || res.data.error) { if (!seed?.data) setOverviewPhase('error'); return; }
      setOverview(res.data);
      setOverviewPhase('done');
      setCache(cacheKey, { data: res.data, visibility: vis });
      const newExtra = { ...extra, overview_data: res.data, overview_analyzed_at: new Date().toISOString() };
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

  const toggleWidget = (id) => {
    setWidgetVis(prev => {
      const next = { ...prev, [id]: prev[id] === false ? true : false };
      const active = getActiveDomain();
      const p = profiles.find(pr => pr.site_url === active?.url);
      if (p?.id) base44.entities.BusinessProfile.update(p.id, { dashboard_widgets: JSON.stringify(next) }).catch(() => {});
      return next;
    });
  };

  const planFeatures = user ? getWokFeatures(user) : getWokFeatures(null);
  const maxDomains = planFeatures?.max_sites || 1;

  const startScan = async (cleanUrl) => {
    const demo = isDemoDomain(cleanUrl);
    if (!demo) {
      const scanQuota = await checkScanQuota(user || await base44.auth.me().catch(() => null));
      if (!scanQuota.allowed) { setDomainModal('manage'); return; }
      const isNew = !profiles.find(p => p.site_url === cleanUrl);
      if (isNew) {
        const siteQuota = await checkSiteQuota(user || await base44.auth.me().catch(() => null));
        if (!siteQuota.allowed) { setDomainModal('manage'); return; }
      }
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
      const result = demo
        ? await runDemoScan(cleanUrl, u.id)
        : await runScan(cleanUrl, u.id, getWokFeatures(u));
      const updatedProfiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const updatedP = updatedProfiles.find(p => p.site_url === cleanUrl);
      if (updatedP) base44.entities.BusinessProfile.update(updatedP.id, { scan_in_progress: false }).catch(() => {});
      invalidateProfiles(u.id);
      await loadAll();
      if (demo && result.overview_data) {
        setOverview(result.overview_data);
        setOverviewPhase('done');
        setCache(`dash_${cleanUrl}`, { data: result.overview_data, visibility: {} });
      } else {
        await loadOverview(true);
      }
      setOnboardingData(result);
    } catch (err) { console.error(err); }
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

  const issues = Array.isArray(activeProfile?.issues) ? activeProfile.issues : [];
  const actionsLeft = issues.length;
  const nextMilestone = lrs < 50 ? 50 : lrs < 65 ? 65 : lrs < 85 ? 85 : 100;
  const topIssue = issues[0]?.problem || null;

  const ENGINES_TESTED = [
    { label: 'ChatGPT', logoId: 'chatgpt', question: 'Does it recommend you in your category?', score: (activeProfile?.chatgpt_score ?? null) },
    { label: 'Gemini',  logoId: 'gemini',  question: 'Does it cite you as a source?',          score: (activeProfile?.gemini_score ?? null) },
    { label: 'Claude',  logoId: 'claude',  question: 'Does it mention your brand?',             score: (activeProfile?.claude_score ?? null) },
  ];
  const engineScores = ENGINES_TESTED.map(e => e.score).filter(s => s !== null && s !== undefined);
  const positives = engineScores.filter(s => s >= 50).length;
  const testedCount = engineScores.length;
  const onTen = testedCount > 0 ? Math.round((positives / testedCount) * 10) : null;

  const PILLARS = [
    { label: 'Your content',   explain: 'What AI reads about you.',           score: (activeProfile?.score_message_clarity ?? null) },
    { label: 'Your mentions',  explain: 'Who talks about you elsewhere.',      score: (activeProfile?.score_commercial_signal ?? null) },
    { label: 'Your website',   explain: 'Can AI actually read your site?',     score: (activeProfile?.score_ai_visibility ?? null) },
  ];

  const brand = overview?.brand_name || activeProfile?.identity_name || getDomain(activeProfile?.site_url);
  const lastScanDate = activeProfile?.last_scan
    ? new Date(activeProfile.last_scan).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    : '';
  const vis = (id) => widgetVis[id] !== false;
  const allHidden = DASHBOARD_WIDGETS.every(w => widgetVis[w.id] === false);

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '26px 32px 80px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Hi {getFirstName(user?.full_name)} 👋
            </h1>
            <p style={{ fontSize: 15, color: INK2, margin: 0 }}>Here's how AI sees {brand}{lastScanDate ? ` · Last check on ${lastScanDate}` : ''}.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setDomainModal('add')}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, border: 'none', background: CORAL, color: WHITE, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              <Plus size={14} strokeWidth={2.4} /> Add a website
            </button>
            <button onClick={() => setCustomizeOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, border: `1px solid ${CORAL}`, background: '#FFE7D6', color: ORANGE_DEEP, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              <SlidersHorizontal size={14} /> Customize
            </button>
          </div>
        </div>

        {/* ── Scanning banner ── */}
        {isScanningActive && (
          <div style={{ background: CARD_BG, borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: CORAL, animation: 'spin 0.9s linear infinite', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: WHITE, margin: '0 0 2px' }}>Checking {getDomain(activeProfile?.site_url)}…</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>8 AI engines · about 60s · you can keep browsing</p>
            </div>
          </div>
        )}

        {/* ═══════════ DASHBOARD CARDS FIRST ═══════════ */}
        {overviewPhase === 'thinking' && !overview && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '5%', marginBottom: 24 }}>
              <div style={{ background: CARD_BG, borderRadius: 14, padding: 22 }}>
                <div style={{ height: 14, borderRadius: 4, marginBottom: 16, background: 'rgba(255,255,255,0.06)', backgroundSize: '800px 100%', animation: 'hm-sk 2s ease-in-out infinite' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backgroundSize: '800px 100%', animation: 'hm-sk 2s ease-in-out infinite' }} />
                  <div>
                    <div style={{ width: 80, height: 20, borderRadius: 4, marginBottom: 6, background: 'rgba(255,255,255,0.06)', backgroundSize: '800px 100%', animation: 'hm-sk 2s ease-in-out infinite' }} />
                    <div style={{ width: 160, height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.06)', backgroundSize: '800px 100%', animation: 'hm-sk 2s ease-in-out infinite' }} />
                  </div>
                </div>
              </div>
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 6, background: 'rgba(21,19,15,0.05)', backgroundSize: '800px 100%', animation: 'hm-sk 2s ease-in-out infinite' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '90%', height: 12, borderRadius: 4, marginBottom: 4, background: 'rgba(21,19,15,0.05)', backgroundSize: '800px 100%', animation: 'hm-sk 2s ease-in-out infinite' }} />
                      <div style={{ width: '50%', height: 10, borderRadius: 4, background: 'rgba(21,19,15,0.05)', backgroundSize: '800px 100%', animation: 'hm-sk 2s ease-in-out infinite' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ background: BG, borderRadius: 10, padding: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, marginBottom: 8, background: 'rgba(21,19,15,0.05)', backgroundSize: '800px 100%', animation: 'hm-sk 2s ease-in-out infinite' }} />
                    <div style={{ width: '80%', height: 12, borderRadius: 4, marginBottom: 4, background: 'rgba(21,19,15,0.05)', backgroundSize: '800px 100%', animation: 'hm-sk 2s ease-in-out infinite' }} />
                    <div style={{ width: '50%', height: 10, borderRadius: 4, background: 'rgba(21,19,15,0.05)', backgroundSize: '800px 100%', animation: 'hm-sk 2s ease-in-out infinite' }} />
                  </div>
                ))}
              </div>
            </div>
            <style>{`@keyframes hm-sk{0%{background-position:-800px 0}100%{background-position:800px 0}}`}</style>
          </div>
        )}

        {overview && !allHidden && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 28 }}>
            {(vis('evolution') || vis('tasks')) && (
              <div style={{ display: 'grid', gridTemplateColumns: vis('evolution') && vis('tasks') ? '1.55fr 1fr' : '1fr', gap: '5%', alignItems: 'stretch' }}>
                {vis('evolution') && <EvolutionCard score={overview.geo_score} breakdown={overview.score_breakdown} evolution={overview.evolution} />}
                {vis('tasks') && <TasksCard tasks={overview.tasks} onSeeAll={() => navigate('/tasks')} onLaunch={() => navigate('/tasks')} />}
              </div>
            )}

            <AuthorityTasksCard siteUrl={activeProfile?.site_url} score={activeProfile?.score_ai_visibility || 0} onScoreUpdate={() => {}} />

            {(vis('competitors') || vis('llms') || vis('pages')) && (
              <div style={{ display: 'grid', gridTemplateColumns: [vis('competitors'), vis('llms'), vis('pages')].filter(Boolean).map(() => '1fr').join(' '), gap: '5%', alignItems: 'stretch' }}>
                {vis('competitors') && <CompetitorsCard competitors={overview.competitors} onSeeAll={() => navigate('/competitors')} onWantRank2={() => navigate('/wok-ai', { state: { autoSend: 'How can I reach 2nd place vs my competitors in AI recommendations?' } })} />}
                {vis('llms') && <LLMCitingCard llms={overview.llms_citing} onDetail={() => navigate('/ai-report')} onWantMore={() => navigate('/wok-ai', { state: { autoSend: 'How can I get cited more often by AI engines?' } })} />}
                {vis('pages') && <CitedPagesCard pages={overview.cited_pages} />}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ SMALLER SCORE SUMMARY ═══════════ */}
        {hasData && !isScanningActive && (
          <>
            <NextStepCard
              currentScore={lrs}
              targetScore={nextMilestone}
              actionsLeft={actionsLeft}
              action={topIssue}
              onClick={() => navigate('/audit')}
            />

            <div style={{ background: CARD_BG, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', position: 'relative', marginBottom: 12 }}
              onClick={e => { if (!e.target.closest('button')) navigate('/ai-report'); }}>
              <div style={{ position: 'absolute', top: 12, right: 14 }} onClick={e => e.stopPropagation()}>
                <ScanStatusIndicator
                  lastScan={activeProfile?.last_scan}
                  planId={user?.subscription_plan || 'free'}
                  onScan={() => startScan(activeProfile.site_url)}
                  scanning={isScanningActive}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <ScoreDonut score={lrs} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: WHITE, lineHeight: 1.3 }}>AI visibility score: {lrs}/100</div>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    {onTen !== null
                      ? `You show up in ${onTen} out of 10 answers we tested.`
                      : `Run a full analysis to measure how often you appear in AI answers.`}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: CORAL }}>See the full report</span>
                    <ArrowRight size={12} color={CORAL} strokeWidth={1.8} />
                  </div>
                </div>
              </div>
            </div>

            <VisibilityPillars pillars={PILLARS} />

            <div style={{ marginBottom: 22 }}>
              <TestedQuestions engines={ENGINES_TESTED} scanning={isScanningActive} AILogoImg={AILogoImg} />
            </div>
          </>
        )}

        {/* ── No data for this domain ── */}
        {!hasData && !isScanningActive && (
          <div style={{ background: CARD_BG, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.7} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14.5, fontWeight: 600, color: WHITE, margin: '0 0 2px' }}>No analysis for this website yet</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Run a check — 8 AI engines at once</p>
            </div>
            <button onClick={() => startScan(activeProfile.site_url)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: CORAL, borderRadius: 8, fontSize: 13, fontWeight: 700, color: WHITE, border: 'none', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
              <Zap size={13} strokeWidth={2} /> Check now
            </button>
          </div>
        )}

        {overviewPhase === 'error' && !overview && hasData && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '18px' }}>
            <button onClick={() => loadOverview(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              <RefreshCw size={13} /> Refresh dashboard
            </button>
          </div>
        )}
      </div>

      <CustomizePanel open={customizeOpen} onClose={() => setCustomizeOpen(false)} visibility={widgetVis} onToggle={toggleWidget} />

      <DomainManagerModal open={!!domainModal} tab={domainModal || 'add'} onClose={() => setDomainModal(null)} user={user} maxDomains={maxDomains} scanningUrls={scanningUrls} />

      {onboardingData && (
        <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}