import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Globe, ExternalLink, ArrowRight, Link2, BarChart2, ClipboardCheck, TrendingUp, ChevronRight, AlertCircle, RefreshCw, Zap, Lock, Star } from 'lucide-react';
import { getActiveDomain, setActiveDomain, getDomainsList, saveDomainsList, onActiveDomainChange } from '@/lib/active-domain';
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
const CREAM = '#FDF8F0';

// ── AI Logos ─────────────────────────────────────────────────────────────────
const MX = { mixBlendMode: 'multiply' };
const AI_PILLS = [
  { label: 'ChatGPT', logo: (
    <svg width="14" height="14" viewBox="0 0 41 41" fill="none">
      <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.136 10.079 10.079 0 0 0-9.618 6.977 9.967 9.967 0 0 0-6.69 4.839 10.081 10.081 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.135 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.691-4.839 10.079 10.079 0 0 0-1.24-11.818z" fill="#10A37F"/>
    </svg>
  )},
  { label: 'Claude', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} alt="" /> },
  { label: 'Gemini', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png" width="14" height="14" style={{ objectFit: 'contain' }} alt="" /> },
  { label: 'Perplexity', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} alt="" /> },
  { label: 'Mistral', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} alt="" /> },
  { label: 'Grok', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} alt="" /> },
];

// ── Scan modules ──────────────────────────────────────────────────────────────
const SCAN_MODULES = [
  { label: 'Rapport IA', sub: 'LRS · 8 moteurs analysés', color: CORAL, steps: ['Récupération du site…', 'Simulation IA en cours…', 'Calcul du LRS…'] },
  { label: 'Audit technique', sub: 'Crawl · Structure · Signaux', color: '#0EA5E9', steps: ['Analyse des headers…', 'Vérification robots.txt…', 'Détection des erreurs…'] },
  { label: 'Performance', sub: 'Part de voix · Concurrents', color: '#10B981', steps: ['Données de trafic…', 'Benchmark secteur…', 'Analyse concurrents…'] },
];

function ScanModuleCard({ mod, index }) {
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(3);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), index * 400 + 2000);
    const t2 = setTimeout(() => setStep(2), index * 400 + 4500);
    const iv = setInterval(() => setPct(p => Math.min(p + 1, 91)), 220);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(iv); };
  }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12, duration: 0.4 }}
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: '16px 18px', backdropFilter: 'blur(12px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: WHITE }}>{mod.label}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{mod.sub}</div>
        </div>
        <span style={{ fontSize: 14, fontWeight: 900, color: mod.color }}>{pct}%</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
        <motion.div style={{ height: '100%', background: mod.color, borderRadius: 2 }}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.35, ease: 'easeOut' }} />
      </div>
      {mod.steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.4s' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: i < step ? mod.color : 'transparent', border: `2px solid ${i <= step ? mod.color : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
            {i < step ? <svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : i === step ? <div style={{ width: 4, height: 4, borderRadius: '50%', background: mod.color, animation: 'spulse 1s ease-in-out infinite' }} /> : null}
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s}</span>
        </div>
      ))}
    </motion.div>
  );
}

function ScanLoader({ url }) {
  const domain = url.replace(/https?:\/\//, '').split('/')[0];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: F, background: '#0A0A0B', overflow: 'hidden' }}>
      {/* Ambient background */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${CORAL}18 0%, transparent 70%)`, pointerEvents: 'none', animation: 'orbFloat 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)', pointerEvents: 'none', animation: 'orbFloat 8s ease-in-out infinite reverse' }} />
      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: `${CORAL}18`, borderRadius: 24, border: `1px solid ${CORAL}30`, marginBottom: 18 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL, animation: 'spulse 1s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: CORAL, letterSpacing: '0.1em' }}>ANALYSE EN COURS</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: WHITE, marginBottom: 6, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Analyse de <span style={{ color: CORAL }}>{domain}</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>8 moteurs IA interrogés simultanément</div>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SCAN_MODULES.map((mod, i) => <ScanModuleCard key={mod.label} mod={mod} index={i} />)}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ textAlign: 'center', marginTop: 24 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Résultats prêts en ~60 secondes</span>
        </motion.div>
      </div>
      <style>{`@keyframes spulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.5)}} @keyframes orbFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-18px)}}`}</style>
    </motion.div>
  );
}

// ── Scan Hero (empty state) ───────────────────────────────────────────────────
function ScanHero({ onScan }) {
  const [url, setUrl] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: F, background: SURFACE }}>
      {/* AI logo pills */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32, maxWidth: 380 }}>
        {AI_PILLS.map((p, i) => (
          <motion.div key={p.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 6px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 11, fontWeight: 500, color: INK2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.logo}</div>
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
            style={{ width: '100%', padding: '13px', background: INK, color: WHITE, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 150ms' }}
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

// ── Score ring mini ───────────────────────────────────────────────────────────
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

// ── Subtle upgrade nudge (non-intrusive) ─────────────────────────────────────
function UpgradeNudge({ navigate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      onClick={() => navigate('/pricing')}
      style={{ background: CREAM, border: `1px solid ${CORAL}22`, borderRadius: 12, padding: '14px 16px', marginBottom: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${CORAL}44`; e.currentTarget.style.background = '#FDF3EE'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${CORAL}22`; e.currentTarget.style.background = CREAM; }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${CORAL}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Star size={16} color={CORAL} fill={CORAL} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 1 }}>Passez au scan complet — 8 moteurs IA</div>
        <div style={{ fontSize: 11, color: INK3 }}>ChatGPT, Claude, Perplexity, Grok… et votre plan d'action détaillé</div>
      </div>
      <ChevronRight size={14} color={CORAL} style={{ flexShrink: 0 }} />
    </motion.div>
  );
}

// ── Add Domain Modal ──────────────────────────────────────────────────────────
function AddDomainModal({ open, onClose, onAdd }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const submit = () => {
    if (!url.trim()) return;
    const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const domain = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
    onAdd({ url: cleanUrl, name: name.trim() || domain });
    setUrl(''); setName(''); onClose();
  };
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: WHITE, borderRadius: 18, padding: '26px', width: '100%', maxWidth: 360, position: 'relative', fontFamily: F, boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer' }}>
          <X size={12} color={INK3} />
        </button>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Nouveau domaine</h2>
        <p style={{ fontSize: 12, color: INK3, margin: '0 0 18px', lineHeight: 1.5 }}>Chaque domaine est analysé séparément — données isolées.</p>
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
          placeholder="https://votre-site.com"
          style={{ width: '100%', padding: '11px 13px', fontSize: 13, border: `1.5px solid ${BORDER}`, borderRadius: 10, outline: 'none', boxSizing: 'border-box', marginBottom: 8, fontFamily: F, color: INK, background: SURFACE }} />
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Nom du projet (optionnel)"
          style={{ width: '100%', padding: '11px 13px', fontSize: 13, border: `1.5px solid ${BORDER}`, borderRadius: 10, outline: 'none', boxSizing: 'border-box', marginBottom: 18, fontFamily: F, color: INK, background: SURFACE }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', fontSize: 13, color: INK2, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 9, cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>Annuler</button>
          <button onClick={submit} disabled={!url.trim()}
            style={{ flex: 2, padding: '10px', fontSize: 13, fontWeight: 700, color: WHITE, background: url.trim() ? INK : '#ccc', border: 'none', borderRadius: 9, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: F }}>
            Ajouter
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Scan functions ────────────────────────────────────────────────────────────
async function runLiteScanForDomain(inputUrl, userId) {
  const main = await base44.functions.invoke('analyzeWebsiteLite', { url: inputUrl });
  const mainData = main?.data || {};
  const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: userId }).catch(() => []);
  const existing = profiles.find(p => p.site_url === inputUrl);
  const cachePayload = { ...mainData, scan_type: 'lite' };
  const brand_keywords = await uploadProfileData(cachePayload);
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
  };
  if (existing) { await base44.entities.BusinessProfile.update(existing.id, profileFields); }
  else { await base44.entities.BusinessProfile.create({ ...profileFields, created_by_id: userId }); }
  return cachePayload;
}

async function runFullScanForDomain(inputUrl, userId) {
  const [main, audit, perf] = await Promise.all([
    base44.functions.invoke('analyzeWebsite', { url: inputUrl }),
    base44.functions.invoke('analyzeAudit', { url: inputUrl }),
    base44.functions.invoke('analyzePerformance', { url: inputUrl, business_name: '' }),
  ]);
  const mainData = main?.data || {};
  const auditData = audit?.data || {};
  const perfData = perf?.data || {};
  const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: userId }).catch(() => []);
  const existing = profiles.find(p => p.site_url === inputUrl);
  const cachePayload = { ...mainData, audit_data: auditData, perf_data: perfData, audit_analyzed_at: new Date().toISOString(), perf_analyzed_at: new Date().toISOString(), scan_type: 'full' };
  const brand_keywords = await uploadProfileData(cachePayload);
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
  };
  if (existing) { await base44.entities.BusinessProfile.update(existing.id, profileFields); }
  else { await base44.entities.BusinessProfile.create({ ...profileFields, created_by_id: userId }); }
  return cachePayload;
}

function consumePendingUrl() {
  const url = localStorage.getItem('wok_pending_scan_url');
  if (!url) return null;
  localStorage.removeItem('wok_pending_scan_url');
  return url.startsWith('http') ? url : `https://${url}`;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [domains, setDomains] = useState(() => getDomainsList());
  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  const [domainProfiles, setDomainProfiles] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingScanUrl] = useState(consumePendingUrl);
  const [scanning, setScanning] = useState(() => null);
  const [scanUrl, setScanUrl] = useState(() => pendingScanUrl || '');
  const [onboardingData, setOnboardingData] = useState(null);
  const [planId, setPlanId] = useState('free');

  useEffect(() => {
    const unsub = onActiveDomainChange(d => setActiveDomainState(d));
    return unsub;
  }, []);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) { setUser(u); setPlanId(getWokPlanId(u)); }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!pendingScanUrl) return;
    const cleanUrl = pendingScanUrl;
    const label = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
    const newDomain = { url: cleanUrl, name: label };
    setScanUrl(cleanUrl);
    setScanning(cleanUrl);
    const run = async () => {
      const existingList = getDomainsList();
      let newList = existingList;
      if (!existingList.find(d => d.url === cleanUrl)) {
        newList = [...existingList, newDomain];
        setDomains(newList);
        saveDomainsList(newList);
      }
      setActiveDomain(newDomain);
      try {
        const u = await base44.auth.me();
        if (u) {
          const pid = getWokPlanId(u);
          setPlanId(pid);
          const features = getWokFeatures(u);
          const result = features.scan_type === 'full'
            ? await runFullScanForDomain(cleanUrl, u.id)
            : await runLiteScanForDomain(cleanUrl, u.id);
          await loadProfiles(newList);
          setScanning(null);
          setOnboardingData(result);
        } else {
          setScanning(null);
          navigate('/ai-report');
        }
      } catch {
        setScanning(null);
        navigate('/ai-report');
      }
    };
    run();
  }, []); // eslint-disable-line

  const loadProfiles = async (domainList) => {
    try {
      const u = await base44.auth.me();
      if (!u) return;
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const map = {};
      for (const d of domainList) {
        const match = profiles.find(p => p.site_url === d.url);
        if (match) {
          const extra = await getProfileData(match);
          map[d.url] = { ...match, ...extra };
        }
      }
      setDomainProfiles(map);
    } catch {}
  };

  useEffect(() => {
    if (domains.length) loadProfiles(domains);
  }, [domains.map(d => d.url).join(',')]); // eslint-disable-line

  const handleFirstScan = async (url) => {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const label = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
    const newDomain = { url: cleanUrl, name: label };
    setScanUrl(cleanUrl);
    setScanning(cleanUrl);
    let newList = domains;
    if (!domains.find(d => d.url === cleanUrl)) {
      newList = [...domains, newDomain];
      setDomains(newList);
      saveDomainsList(newList);
    }
    setActiveDomain(newDomain);
    try {
      const u = await base44.auth.me();
      if (u) {
        const pid = getWokPlanId(u);
        setPlanId(pid);
        const features = getWokFeatures(u);
        const result = features.scan_type === 'full'
          ? await runFullScanForDomain(cleanUrl, u.id)
          : await runLiteScanForDomain(cleanUrl, u.id);
        await loadProfiles(newList);
        setScanning(null);
        setOnboardingData(result);
      } else {
        setScanning(null);
        navigate('/ai-report');
      }
    } catch {
      setScanning(null);
      navigate('/ai-report');
    }
  };

  const handleAddDomain = (domain) => {
    const newList = [...domains, domain];
    setDomains(newList);
    saveDomainsList(newList);
    if (newList.length === 1) setActiveDomain(domain);
  };

  const handleDeleteDomain = (domain) => {
    const newList = domains.filter(d => d.url !== domain.url);
    setDomains(newList);
    saveDomainsList(newList);
    if (activeDomain?.url === domain.url) setActiveDomain(newList[0] || null);
  };

  if (scanning || (pendingScanUrl && !onboardingData)) return <ScanLoader url={scanUrl || pendingScanUrl} />;

  if (domains.length === 0) {
    return (
      <>
        <ScanHero onScan={handleFirstScan} />
        <AddDomainModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddDomain} />
        {onboardingData && (
          <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />
        )}
      </>
    );
  }

  const domain = activeDomain;
  const domainLabel = domain?.url?.replace(/https?:\/\//, '').split('/')[0] || '';
  const activeProfile = domain ? domainProfiles[domain.url] : null;
  const lrs = Math.round(activeProfile?.lrs_score || activeProfile?.overall_score || 0);
  const hasData = !!activeProfile;
  const isFree = planId === 'free';

  const lrsColor = lrs >= 65 ? '#10B981' : lrs >= 35 ? CORAL : '#EF4444';
  const lrsLabel = lrs >= 65 ? 'Bonne visibilité' : lrs >= 35 ? 'Visibilité partielle' : 'Faible visibilité';

  const ACTIONS = [
    { label: 'Rapport IA', desc: 'LRS · moteurs · injection', icon: BarChart2, route: '/ai-report', primary: true },
    { label: 'Audit', desc: 'Technique & crawl', icon: ClipboardCheck, route: '/audit' },
    { label: 'Performance', desc: 'Share of voice', icon: TrendingUp, route: '/performance' },
    { label: 'Connexions', desc: 'GSC · Analytics', icon: Link2, route: '/connections' },
  ];

  // Engine mini scores for display
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
              {domain && <img src={`https://www.google.com/s2/favicons?domain=${domainLabel}&sz=32`} alt="" width={18} height={18} style={{ borderRadius: 4 }} onError={e => { e.target.style.display = 'none'; }} />}
              <h1 style={{ fontSize: 19, fontWeight: 900, color: INK, margin: 0, letterSpacing: '-0.04em' }}>
                {domain ? (domain.name || domainLabel) : 'Accueil'}
              </h1>
            </div>
            {domain && (
              <a href={domain.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: INK3, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
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

        {/* ── Upgrade nudge for free plan (non-intrusive) ── */}
        {isFree && hasData && activeProfile?.scan_type === 'lite' && (
          <UpgradeNudge navigate={navigate} />
        )}

        {/* ── LRS Score Card ── */}
        {domain && (
          <div style={{ marginBottom: 14 }}>
            {hasData ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate('/ai-report')}
                style={{ background: INK, borderRadius: 18, padding: '22px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                {/* Ambient glow */}
                <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${lrsColor}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>LLM Resonance Score™</div>
                    {activeProfile?.scan_type === 'lite' && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: CORAL, background: `${CORAL}20`, border: `1px solid ${CORAL}30`, borderRadius: 20, padding: '1px 7px', letterSpacing: '0.08em' }}>LITE</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 14 }}>
                    <div>
                      <span style={{ fontSize: 62, fontWeight: 900, color: WHITE, letterSpacing: '-0.06em', lineHeight: 1 }}>{lrs}</span>
                      <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.25)', fontWeight: 500, marginLeft: 3 }}>/100</span>
                    </div>
                    {/* Mini engine bars */}
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
                  {/* LRS label */}
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
                  <button onClick={() => handleFirstScan(domain.url)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', background: INK, borderRadius: 9, fontSize: 12, fontWeight: 700, color: WHITE, flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: F }}>
                    <Zap size={11} fill={WHITE} stroke={WHITE} /> Analyser
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        {domain && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 9px' }}>Modules</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {ACTIONS.map(a => (
                <button key={a.label} onClick={() => navigate(a.route)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderRadius: 13, cursor: 'pointer', background: a.primary ? INK : WHITE, border: `1px solid ${a.primary ? INK : BORDER}`, textAlign: 'left', fontFamily: F, transition: 'all 0.15s' }}
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

        {/* ── Domain switcher ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Mes domaines</p>
            <button onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: `1px solid ${BORDER}`, borderRadius: 7, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
              <Plus size={10} /> Ajouter
            </button>
          </div>

          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            {domains.map((d, i) => {
              const p = domainProfiles[d.url];
              const score = Math.round(p?.lrs_score || p?.overall_score || 0);
              const isActive = activeDomain?.url === d.url;
              const label = d.url.replace(/https?:\/\//, '').split('/')[0];
              return (
                <div key={d.url}
                  onClick={() => setActiveDomain(d)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', cursor: 'pointer', background: isActive ? SURFACE : WHITE, borderBottom: i < domains.length - 1 ? `1px solid ${BORDER}` : 'none', transition: 'background 0.12s' }}>
                  <img src={`https://www.google.com/s2/favicons?domain=${label}&sz=32`} alt="" width={26} height={26} style={{ borderRadius: 6, flexShrink: 0 }} onError={e => { e.target.style.opacity = '0'; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name || label}</div>
                    <div style={{ fontSize: 10, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                  </div>
                  {score > 0 && <ScoreRing score={score} size={38} />}
                  {!p && <span style={{ fontSize: 9, color: INK3, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 5, padding: '2px 7px', flexShrink: 0 }}>Non analysé</span>}
                  {isActive && score > 0 && <div style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL, flexShrink: 0 }} />}
                  <button onClick={e => { e.stopPropagation(); handleDeleteDomain(d); }}
                    style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.25 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.25'}>
                    <Trash2 size={11} color="#EF4444" />
                  </button>
                </div>
              );
            })}
            <div onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', cursor: 'pointer', background: WHITE, borderTop: `1px solid ${BORDER}`, transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = SURFACE}
              onMouseLeave={e => e.currentTarget.style.background = WHITE}>
              <div style={{ width: 26, height: 26, borderRadius: 6, border: `1.5px dashed ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={11} color={INK3} />
              </div>
              <span style={{ fontSize: 12, color: INK3, fontWeight: 500 }}>Surveiller un nouveau domaine</span>
            </div>
          </div>
        </div>
      </div>

      <AddDomainModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddDomain} />
      {onboardingData && (
        <ScanResultsOnboarding data={onboardingData} onClose={() => { setOnboardingData(null); navigate('/ai-report'); }} />
      )}
      <style>{`@keyframes spulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.5)}} @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
    </div>
  );
}