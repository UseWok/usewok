import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Globe, ExternalLink, ArrowRight, Link2, BarChart2, ClipboardCheck, TrendingUp, ChevronRight, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { getActiveDomain, setActiveDomain, getDomainsList, saveDomainsList, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const SURFACE = '#F7F7F5';
const WHITE = '#FFFFFF';

// ── AI Logos ─────────────────────────────────────────────────────────────────
const MX = { mixBlendMode: 'multiply' };
const AI_PILLS = [
  { label: 'ChatGPT', logo: (
    <svg width="14" height="14" viewBox="0 0 41 41" fill="none">
      <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.136 10.079 10.079 0 0 0-9.618 6.977 9.967 9.967 0 0 0-6.69 4.839 10.081 10.081 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.135 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.691-4.839 10.079 10.079 0 0 0-1.24-11.818zm-15.019 21.069c-1.955 0-3.862-.662-5.409-1.873l.267-.151 8.979-5.184a1.505 1.505 0 0 0 .754-1.302V19.633l3.793 2.191a.139.139 0 0 1 .076.106v10.48c-.003 3.273-2.659 5.927-5.46 5.529zm-11.77-5.148a10.03 10.03 0 0 1-1.2-6.731l.267.161 8.979 5.184a1.505 1.505 0 0 0 1.508 0l10.963-6.333v4.381a.145.145 0 0 1-.057.112L21.4 35.501a9.956 9.956 0 0 1-10.657-2.71zm-1.545-14.91a9.943 9.943 0 0 1 5.201-4.382l-.004.31v10.368a1.503 1.503 0 0 0 .753 1.302l10.963 6.333-3.793 2.192a.139.139 0 0 1-.131.013L11.02 27.939a9.975 9.975 0 0 1-1.822-9.058zm31.1 8.575-10.963-6.333 3.793-2.192a.138.138 0 0 1 .131-.013l10.169 5.872a9.956 9.956 0 0 1-1.542 17.947v-.312l-.004-10.368a1.503 1.503 0 0 0-.752-1.301zm3.776-6.73-.267-.161-8.978-5.184a1.506 1.506 0 0 0-1.508 0L21.856 20.7v-4.381a.144.144 0 0 1 .057-.112l10.165-5.868a9.955 9.955 0 0 1 14.82 10.316zm-23.763 7.811-3.792-2.192a.14.14 0 0 1-.077-.107v-10.48c.002-3.276 2.661-5.93 5.462-5.527 1.954 0 3.861.661 5.408 1.872l-.267.151-8.979 5.184a1.505 1.505 0 0 0-.754 1.302l-.001 9.797zm2.06-4.43 4.879-2.818 4.879 2.817v5.635l-4.879 2.818-4.879-2.818V23.107z" fill="#10A37F"/>
    </svg>
  ) },
  { label: 'Claude', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} alt="" /> },
  { label: 'Gemini', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png" width="14" height="14" style={{ objectFit: 'contain' }} alt="" /> },
  { label: 'Perplexity', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} alt="" /> },
  { label: 'Mistral', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} alt="" /> },
  { label: 'Llama', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} alt="" /> },
  { label: 'Grok', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} alt="" /> },
  { label: 'Copilot', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png" width="14" height="14" style={{ objectFit: 'contain' }} alt="" /> },
];

// ── Skeleton shimmer ──────────────────────────────────────────────────────────
function Skeleton({ width = '100%', height = 16, borderRadius = 6 }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #F0F0EE 25%, #E6E6E4 50%, #F0F0EE 75%)',
      backgroundSize: '600px 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  );
}

// ── Parallel scan loader — 3 modules simultaneously ───────────────────────────
const SCAN_MODULES = [
  { label: 'Rapport IA', sub: 'LRS · 8 moteurs analysés', color: '#7C3AED', steps: ['Récupération du site…', 'Simulation IA en cours…', 'Calcul du LRS…'] },
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
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12, duration: 0.4 }}
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 18px', backdropFilter: 'blur(12px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{mod.label}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{mod.sub}</div>
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: mod.color, textShadow: `0 0 10px ${mod.color}60` }}>{pct}%</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
        <motion.div style={{ height: '100%', background: mod.color, borderRadius: 2, boxShadow: `0 0 8px ${mod.color}` }}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.35, ease: 'easeOut' }} />
      </div>
      {mod.steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.4s' }}>
          <div style={{ width: 15, height: 15, borderRadius: '50%', flexShrink: 0, background: i < step ? mod.color : 'transparent', border: `2px solid ${i <= step ? mod.color : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
            {i < step ? (
              <svg width="7" height="7" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : i === step ? (
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: mod.color, animation: 'spulse 1s ease-in-out infinite', boxShadow: `0 0 6px ${mod.color}` }} />
            ) : null}
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{s}</span>
        </div>
      ))}
    </motion.div>
  );
}

function ScanLoader({ url }) {
  const domain = url.replace(/https?:\/\//, '').split('/')[0];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px', fontFamily: F,
        background: 'radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0A0A0B 55%, #001a0f 100%)',
        overflow: 'hidden',
      }}>

      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none', animation: 'orbFloat 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none', animation: 'orbFloat 8s ease-in-out infinite reverse' }} />
      <div style={{ position: 'absolute', top: '50%', right: '20%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)', pointerEvents: 'none', animation: 'orbFloat 5s ease-in-out infinite 2s' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', background: 'rgba(124,58,237,0.15)', borderRadius: 24, border: '1px solid rgba(124,58,237,0.3)', marginBottom: 20 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#A78BFA', animation: 'spulse 1s ease-in-out infinite', boxShadow: '0 0 8px #A78BFA' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.1em' }}>ANALYSE IA EN COURS</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginBottom: 8, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Analyse de <span style={{ color: '#A78BFA' }}>{domain}</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>8 moteurs IA interrogés simultanément</div>
        </motion.div>

        {/* 3 module cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SCAN_MODULES.map((mod, i) => <ScanModuleCard key={mod.label} mod={mod} index={i} />)}
        </div>

        {/* Bottom hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ textAlign: 'center', marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.35 }}>
            <div style={{ height: 1, width: 32, background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Résultats prêts en ~60 secondes</span>
            <div style={{ height: 1, width: 32, background: 'rgba(255,255,255,0.3)' }} />
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.5)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes orbFloat{0%,100%{transform:translateY(0px) scale(1)}50%{transform:translateY(-20px) scale(1.05)}}
      `}</style>
    </motion.div>
  );
}

// ── Scan Hero (empty state) ───────────────────────────────────────────────────
function ScanHero({ onScan }) {
  const [url, setUrl] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: F, background: WHITE }}>
      {/* AI logo pills */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36, maxWidth: 400 }}>
        {AI_PILLS.map((p, i) => (
          <motion.div key={p.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 6px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 11, fontWeight: 500, color: INK2, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.logo}</div>
            {p.label}
          </motion.div>
        ))}
      </div>

      <h1 style={{ fontSize: 'clamp(28px, 6vw, 46px)', fontWeight: 900, color: INK, margin: '0 0 12px', letterSpacing: '-0.04em', lineHeight: 1.05, textAlign: 'center', maxWidth: 500 }}>
        Êtes-vous recommandé<br />par les IA ?
      </h1>
      <p style={{ fontSize: 14, color: INK3, margin: '0 0 40px', lineHeight: 1.6, textAlign: 'center', maxWidth: 340 }}>
        Votre score LRS en 60 secondes — 8 moteurs IA analysés simultanément.
      </p>

      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '15px 18px', gap: 10 }}>
            <Globe size={15} color={INK3} style={{ flexShrink: 0 }} />
            <input value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && url.trim() && onScan(url.trim())}
              placeholder="https://votre-site.com"
              autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: INK, fontFamily: F, minWidth: 0 }} />
          </div>
          <button onClick={() => url.trim() && onScan(url.trim())}
            style={{ width: '100%', padding: '14px', background: INK, color: WHITE, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
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
  const c = score >= 65 ? '#10B981' : score >= 35 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="#F0F0F0" strokeWidth={3} />
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: WHITE, borderRadius: 20, padding: '28px', width: '100%', maxWidth: 380, position: 'relative', fontFamily: F, boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer' }}>
          <X size={13} color={INK3} />
        </button>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Nouveau domaine</h2>
        <p style={{ fontSize: 13, color: INK3, margin: '0 0 20px' }}>Chaque domaine est analysé séparément — données isolées, rapport dédié.</p>
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
          placeholder="https://votre-site.com"
          style={{ width: '100%', padding: '12px 14px', fontSize: 14, border: `1.5px solid ${BORDER}`, borderRadius: 11, outline: 'none', boxSizing: 'border-box', marginBottom: 10, fontFamily: F, color: INK }} />
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Nom du projet (optionnel)"
          style={{ width: '100%', padding: '12px 14px', fontSize: 14, border: `1.5px solid ${BORDER}`, borderRadius: 11, outline: 'none', boxSizing: 'border-box', marginBottom: 20, fontFamily: F, color: INK }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', fontSize: 13, color: INK2, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>Annuler</button>
          <button onClick={submit} disabled={!url.trim()}
            style={{ flex: 2, padding: '11px', fontSize: 13, fontWeight: 700, color: WHITE, background: url.trim() ? INK : '#ccc', border: 'none', borderRadius: 10, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: F }}>
            Ajouter ce domaine
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Save + parallel scan for a new domain ────────────────────────────────────
async function runFullScanForDomain(inputUrl, userId) {
  const [main, audit, perf] = await Promise.all([
    base44.functions.invoke('analyzeWebsite', { url: inputUrl }),
    base44.functions.invoke('analyzeAudit', { url: inputUrl }),
    base44.functions.invoke('analyzePerformance', { url: inputUrl, business_name: '' }),
  ]);

  const mainData = main?.data || {};
  const auditData = audit?.data || {};
  const perfData = perf?.data || {};

  // Find or create profile for this specific domain
  const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: userId }).catch(() => []);
  const existing = profiles.find(p => p.site_url === inputUrl);

  const cachePayload = {
    ...mainData,
    audit_data: auditData,
    perf_data: perfData,
    audit_analyzed_at: new Date().toISOString(),
    perf_analyzed_at: new Date().toISOString(),
  };

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

  if (existing) {
    await base44.entities.BusinessProfile.update(existing.id, profileFields);
  } else {
    await base44.entities.BusinessProfile.create({ ...profileFields, created_by_id: userId });
  }

  return cachePayload;
}

// ── Detect pending URL from landing page (read once, before any render) ───────
function consumePendingUrl() {
  const url = localStorage.getItem('wok_pending_scan_url');
  if (!url) return null;
  localStorage.removeItem('wok_pending_scan_url');
  return url.startsWith('http') ? url : `https://${url}`;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [domains, setDomains] = useState(() => getDomainsList());
  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  const [domainProfiles, setDomainProfiles] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  // Read pending URL ONCE at mount — drives both scanning state and url display
  const [pendingScanUrl] = useState(consumePendingUrl);
  const [scanning, setScanning] = useState(() => null);
  const [scanUrl, setScanUrl] = useState(() => pendingScanUrl || '');
  const [onboardingData, setOnboardingData] = useState(null);

  useEffect(() => {
    const unsub = onActiveDomainChange(d => setActiveDomainState(d));
    return unsub;
  }, []);

  useEffect(() => {
    base44.auth.me().then(u => { if (u) setUser(u); }).catch(() => {});
  }, []);

  // ── Auto-scan déclenché UNIQUEMENT si URL en attente depuis landing page
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
        const result = u ? await runFullScanForDomain(cleanUrl, u.id) : null;
        await loadProfiles(newList);
        setScanning(null);
        if (result) setOnboardingData(result);
        else navigate('/ai-report');
      } catch (e) {
        setScanning(null);
        navigate('/ai-report');
      }
    };
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfiles = async (domainList) => {
    try {
      const u = await base44.auth.me();
      if (!u) return;
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const map = {};
      for (const d of domainList) {
        // Match profile by site_url exactly (each domain is isolated)
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
  }, [domains.map(d => d.url).join(',')]);

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
      const result = u ? await runFullScanForDomain(cleanUrl, u.id) : null;
      await loadProfiles(newList);
      setScanning(null);
      if (result) setOnboardingData(result);
      else navigate('/ai-report');
    } catch (e) {
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

  // Show scan loader — triggered either by pending URL from landing or manual scan
  if (scanning || (pendingScanUrl && !onboardingData)) return <ScanLoader url={scanUrl || pendingScanUrl} />;

  // Empty state
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

  const ACTIONS = [
    { label: 'Rapport IA', desc: 'LRS · moteurs · injection', icon: BarChart2, route: '/ai-report', primary: true },
    { label: 'Audit', desc: 'Technique & crawl', icon: ClipboardCheck, route: '/audit' },
    { label: 'Performance', desc: 'Share of voice', icon: TrendingUp, route: '/performance' },
    { label: 'Connexions', desc: 'GSC · Analytics', icon: Link2, route: '/connections' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: WHITE, fontFamily: F }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 100px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '24px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              {domain && <img src={`https://www.google.com/s2/favicons?domain=${domainLabel}&sz=32`} alt="" width={20} height={20} style={{ borderRadius: 4 }} onError={e => { e.target.style.display = 'none'; }} />}
              <h1 style={{ fontSize: 20, fontWeight: 900, color: INK, margin: 0, letterSpacing: '-0.04em' }}>
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
              <button onClick={() => navigate('/admin')} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, color: INK2, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Admin</button>
            )}
          </div>
        </div>

        {/* ── LRS Score Card ── */}
        {domain && (
          <div style={{ marginBottom: 20 }}>
            {hasData ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate('/ai-report')}
                style={{ background: INK, borderRadius: 20, padding: '22px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${lrs >= 65 ? '#10B98120' : lrs >= 35 ? '#F59E0B20' : '#EF444420'} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>LLM Resonance Score™</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: 64, fontWeight: 900, color: WHITE, letterSpacing: '-0.06em', lineHeight: 1 }}>{lrs}</span>
                      <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginLeft: 4 }}>/100</span>
                    </div>
                    <div style={{ paddingBottom: 10, flex: 1 }}>
                      {['chatgpt', 'gemini', 'claude'].map((k, i) => {
                        const s = activeProfile[`${k}_score`] || 0;
                        return (
                          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < 2 ? 4 : 0 }}>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', width: 46, fontWeight: 600 }}>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                              <div style={{ height: '100%', width: `${s}%`, background: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', width: 16, textAlign: 'right', fontWeight: 700 }}>{s}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {activeProfile.shock_insight && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 14px', lineHeight: 1.5 }}>
                      {activeProfile.shock_insight.slice(0, 90)}{activeProfile.shock_insight.length > 90 ? '…' : ''}
                    </p>
                  )}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>
                    Voir le rapport complet <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: SURFACE, borderRadius: 20, padding: '20px', border: `1.5px dashed ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: WHITE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertCircle size={20} color={INK3} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 3px' }}>Aucun rapport pour ce domaine</p>
                    <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Lancez une analyse complète — 8 moteurs IA en parallèle</p>
                  </div>
                  <button onClick={() => handleFirstScan(domain.url)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', background: INK, borderRadius: 10, fontSize: 12, fontWeight: 700, color: WHITE, flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: F }}>
                    <Zap size={11} fill={WHITE} stroke={WHITE} /> Analyser
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        {domain && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Modules d'analyse</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {ACTIONS.map(a => (
                <button key={a.label} onClick={() => navigate(a.route)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, cursor: 'pointer', background: a.primary ? INK : WHITE, border: `1px solid ${a.primary ? INK : BORDER}`, textAlign: 'left', fontFamily: F, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: a.primary ? 'rgba(255,255,255,0.1)' : SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <a.icon size={16} color={a.primary ? WHITE : INK2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: a.primary ? WHITE : INK }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: a.primary ? 'rgba(255,255,255,0.4)' : INK3, marginTop: 1 }}>{a.desc}</div>
                  </div>
                  <ChevronRight size={13} color={a.primary ? 'rgba(255,255,255,0.3)' : BORDER} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Domain switcher ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Mes domaines</p>
              <p style={{ fontSize: 10, color: INK3, margin: '2px 0 0' }}>Chaque domaine a ses propres données isolées</p>
            </div>
            <button onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: `1px solid ${BORDER}`, borderRadius: 7, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
              <Plus size={10} /> Ajouter
            </button>
          </div>

          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
            {domains.map((d, i) => {
              const p = domainProfiles[d.url];
              const score = Math.round(p?.lrs_score || p?.overall_score || 0);
              const isActive = activeDomain?.url === d.url;
              const label = d.url.replace(/https?:\/\//, '').split('/')[0];
              return (
                <div key={d.url}
                  onClick={() => setActiveDomain(d)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', background: isActive ? SURFACE : WHITE, borderBottom: i < domains.length - 1 ? `1px solid ${BORDER}` : 'none', transition: 'background 0.12s' }}>
                  <img src={`https://www.google.com/s2/favicons?domain=${label}&sz=32`} alt="" width={28} height={28} style={{ borderRadius: 7, flexShrink: 0 }} onError={e => { e.target.style.opacity = '0'; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name || label}</div>
                    <div style={{ fontSize: 11, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                  </div>
                  {score > 0 && <ScoreRing score={score} size={40} />}
                  {!p && <span style={{ fontSize: 9, color: INK3, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '2px 7px', flexShrink: 0 }}>Non analysé</span>}
                  {isActive && score > 0 && <div style={{ width: 7, height: 7, borderRadius: '50%', background: INK, flexShrink: 0 }} />}
                  <button onClick={e => { e.stopPropagation(); handleDeleteDomain(d); }}
                    style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.3 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}>
                    <Trash2 size={12} color="#EF4444" />
                  </button>
                </div>
              );
            })}
            <div onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', background: WHITE, borderTop: `1px solid ${BORDER}`, transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = SURFACE}
              onMouseLeave={e => e.currentTarget.style.background = WHITE}>
              <div style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px dashed ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={12} color={INK3} />
              </div>
              <span style={{ fontSize: 13, color: INK3, fontWeight: 500 }}>Surveiller un nouveau domaine</span>
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