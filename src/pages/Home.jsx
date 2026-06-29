import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ModeSelector, ModeDropdown } from '@/components/home/ModeSelector';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Trash2, ArrowUp, Link2, BarChart2, ClipboardCheck, TrendingUp, Mic, Zap, Loader, AlertCircle, ChevronDown, ArrowRight, Check, Globe } from 'lucide-react';
import { setActiveDomain } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';
import ScanStatusIndicator from '@/components/home/ScanStatusIndicator';
import { getWokFeatures, getWokPlanId } from '@/lib/wok-plans';
import { DEMO_PROFILE, DEMO_SITE_URL } from '@/lib/demo-data';

// ── Design System — LRS palette + Anthropic Sans ──────────────────────────────
const F       = '"Anthropic Sans", "Anthropic Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const BG      = '#F7F2E9';
const CARD_BG = '#15130F';
const WHITE   = '#FFFFFF';
const INK     = '#1A1814';
const INK2    = '#857E6E';
const INK3    = '#A8A49F';
const BORDER  = 'rgba(21,19,15,0.12)';
const CORAL   = '#FF5A1F';
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

// ── AI Logo URLs (exact images, no background) ────────────────────────────────
const AI_LOGO_URLS = {
  chatgpt:    'https://media.base44.com/images/public/6a2edc91082e534601118582/67cb277ed_image.png',
  gemini:     'https://media.base44.com/images/public/6a2edc91082e534601118582/f37dc5b5a_image.png',
  claude:     'https://media.base44.com/images/public/6a2edc91082e534601118582/d67c08a4b_image.png',
  perplexity: 'https://media.base44.com/images/public/6a2edc91082e534601118582/8e9ccea01_image.png',
  mistral:    'https://media.base44.com/images/public/6a2edc91082e534601118582/3a3745646_image.png',
  grok:       'https://media.base44.com/images/public/6a2edc91082e534601118582/ddf7fe28b_image.png',
  copilot:    'https://media.base44.com/images/public/6a2edc91082e534601118582/92bb51643_image.png',
  llama:      'https://media.base44.com/images/public/6a2edc91082e534601118582/1bdc7666b_image.png',
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



// ── Mic Button with Voice Recording ───────────────────────────────────────────
function MicButton({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  const stopAll = () => {
    recognitionRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(animRef.current);
    setListening(false);
    setVolume(0);
  };

  const startListening = async () => {
    if (listening) { stopAll(); return; }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Audio analyser for visual feedback
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(avg);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}

    const rec = new SpeechRecognition();
    rec.lang = 'fr-FR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onTranscript(transcript);
      stopAll();
    };
    rec.onerror = () => stopAll();
    rec.onend = () => stopAll();

    setListening(true);
    rec.start();
  };

  const bars = 5;
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={startListening}
        style={{
          width: 32, height: 32, border: 'none',
          background: listening ? `rgba(241,123,93,0.12)` : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 7, transition: 'background 120ms', flexShrink: 0,
          outline: 'none',
        }}
        onMouseEnter={e => { if (!listening) e.currentTarget.style.background = '#EEE5D2'; }}
        onMouseLeave={e => { if (!listening) e.currentTarget.style.background = 'transparent'; }}>
        {listening ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 16 }}>
            {Array.from({ length: bars }).map((_, i) => {
              const h = listening ? Math.max(3, Math.min(14, (volume / 30) * 14 + Math.sin(Date.now() / 150 + i) * 4)) : 3;
              return (
                <div key={i} style={{
                  width: 2.5, borderRadius: 2,
                  background: CORAL,
                  height: `${h}px`,
                  transition: 'height 80ms ease',
                }} />
              );
            })}
          </div>
        ) : (
          <Mic size={15} color={INK} strokeWidth={1.7} />
        )}
      </button>


    </div>
  );
}



// ── Submit button with tooltip ────────────────────────────────────────────────
function SubmitButton({ onClick, loading }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ width: 34, height: 34, borderRadius: '50%', background: CORAL, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading
          ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: WHITE, animation: 'spin 0.7s linear infinite' }} />
          : <ArrowUp size={14} color={WHITE} strokeWidth={2.2} />
        }
      </button>
      {hovered && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
          background: INK, color: WHITE, fontSize: 11, fontWeight: 600, borderRadius: 6,
          padding: '4px 9px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 100,
          letterSpacing: '0.01em',
        }}>
          Analyser
          <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `4px solid ${INK}` }} />
        </div>
      )}
    </div>
  );
}

// ── Scan logic ─────────────────────────────────────────────────────────────────
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+)(?:\/[^\s]*)?/i;

function extractUrlDirect(text) {
  const match = text.match(URL_REGEX);
  if (!match) return null;
  const raw = match[0];
  return raw.startsWith('http') ? raw : `https://${raw}`;
}

// ── LLM-based URL extraction (gpt-4o-mini) — with anti-abuse ─────────────────
const LLM_CACHE = {};
const LLM_CALL_LOG = [];
const MAX_LLM_PER_MIN = 5;

function isRateLimited() {
  const now = Date.now();
  const recent = LLM_CALL_LOG.filter(t => now - t < 60000);
  if (recent.length >= MAX_LLM_PER_MIN) return true;
  LLM_CALL_LOG.splice(0, LLM_CALL_LOG.length, ...recent, now);
  return false;
}

async function extractUrlFromText(text) {
  if (!text || text.trim().length < 2) return null;

  // 1. Direct URL detection (instant, no LLM needed)
  const direct = extractUrlDirect(text);
  if (direct) return direct;

  // 2. Anti-abuse: rate limit LLM calls
  if (isRateLimited()) return null;

  // 3. Cache identical queries
  const key = text.trim().toLowerCase().slice(0, 120);
  if (LLM_CACHE[key] !== undefined) return LLM_CACHE[key];

  // 4. LLM extraction with gemini_3_flash (fast, supports web search)
  try {
    const res = await base44.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `Find the official website URL for: "${text.trim().slice(0, 200)}". Return JSON with url (string, e.g. "https://lamborghini.com") and name (brand/company name). If genuinely not found, url must be "null".`,
      response_json_schema: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          name: { type: 'string' }
        }
      }
    });
    const extracted = res?.url || null;
    const name = res?.name || null;
    if (!extracted || extracted === 'null' || !extracted.includes('.')) {
      LLM_CACHE[key] = null;
      return null;
    }
    const clean = extracted.startsWith('http') ? extracted : `https://${extracted}`;
    LLM_CACHE[key] = clean;
    return { url: clean, name };
  } catch {
    return null;
  }
}

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
  const size = 72, sw = 5.5, R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={CORAL} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score/100)} strokeLinecap="round" />
      </svg>
      {/* Score vertical dans le donut */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 0,
      }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: WHITE, lineHeight: 1, letterSpacing: '-0.03em', fontFamily: F }}>{score}</span>
        <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.35)', lineHeight: 1.2, fontFamily: F }}>/100</span>
      </div>
    </div>
  );
}

// ── Petit donut (liste domaines) ───────────────────────────────────────────────
function SmallDonut({ score }) {
  const size = 46, sw = 3.5, R = (size - sw) / 2 - 1;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(21,19,15,0.10)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={CORAL} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score/100)} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK }}>{score}</span>
      </div>
    </div>
  );
}

// ── Carte module ───────────────────────────────────────────────────────────────
function ModuleCard({ label, sub, Icon, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: '14px 12px', borderRadius: 12, cursor: 'pointer', background: hov ? '#EEE5D2' : WHITE, border: `1px solid rgba(21,19,15,0.12)`, textAlign: 'left', fontFamily: F, width: '100%', outline: 'none', transition: 'background 140ms' }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: hov ? WHITE : '#EEE5D2', border: `1px solid rgba(21,19,15,0.10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 140ms' }}>
        <Icon size={16} color={INK} strokeWidth={1.7} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: 11, color: INK3, marginTop: 3 }}>{sub}</div>
      </div>
    </button>
  );
}

// ── Scan loader ────────────────────────────────────────────────────────────────
function ScanLoader({ url }) {
  const [step, setStep] = useState(0);
  const steps = ['Récupération du site…', 'Simulation IA en cours…', 'Calcul du LRS…', 'Génération du rapport…'];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 8000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: CARD_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: F }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: CORAL, animation: 'spin 0.9s linear infinite', marginBottom: 18 }} />
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
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [activeUrl, setActiveUrl] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stensor_active_domain') || 'null')?.url || null; } catch { return null; }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [scanningUrls, setScanningUrls] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showModes, setShowModes] = useState(false);
  const [mode, setMode] = useState('scan');
  const [trollError, setTrollError] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [confirmSite, setConfirmSite] = useState(null); // { url, name }
  const scanningRef = useRef({});

  useEffect(() => {
    if (location.state?.autoScan) {
      const text = location.state.autoScan;
      setSearchQuery(text);
      navigate(location.pathname, { replace: true, state: {} });
      // execute search directly
      (async () => {
        const raw = text.trim();
        if (!raw) return;
        const direct = extractUrlDirect(raw);
        if (direct) { startScan(direct); return; }
        setExtracting(true);
        setTrollError(false);
        const result = await extractUrlFromText(raw);
        setExtracting(false);
        if (!result) { setTrollError(true); setTimeout(() => setTrollError(false), 3500); return; }
        setConfirmSite(result);
      })();
    }
  }, [location.state]);

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

  const confirmAndScan = (url) => {
    setConfirmSite(null);
    startScan(url);
    setSearchQuery('');
  };

  const loadDemoData = () => {
    setSearchQuery('');
    // Inject demo profile into state as if a real scan completed
    const demoP = { ...DEMO_PROFILE, _demo: true };
    setProfiles(prev => {
      const without = prev.filter(p => p.site_url !== DEMO_SITE_URL);
      return [demoP, ...without];
    });
    setActiveUrl(DEMO_SITE_URL);
    setActiveDomain({ url: DEMO_SITE_URL, name: 'UseWok' });
    // Also store in localStorage so sub-pages can read it
    try {
      localStorage.setItem('demo_profile_usewok', JSON.stringify(demoP));
      localStorage.setItem('stensor_active_domain', JSON.stringify({ url: DEMO_SITE_URL, name: 'UseWok' }));
    } catch {}
    // Store profile data so getProfileData works on sub-pages
    try {
      localStorage.setItem(`profile_data_${DEMO_SITE_URL}`, JSON.stringify(demoP));
    } catch {}
  };

  const handleSubmitSearch = async () => {
    const raw = searchQuery.trim();
    if (!raw || extracting) return;

    if (mode === 'chat') {
        navigate('/wok-ai', { state: { autoSend: raw } });
        return;
    }

    // Direct URL → scan immediately, no confirmation needed
    const direct = extractUrlDirect(raw);
    if (direct) {
      startScan(direct);
      setSearchQuery('');
      return;
    }

    setExtracting(true);
    setTrollError(false);
    const result = await extractUrlFromText(raw);
    setExtracting(false);

    if (!result) {
      setTrollError(true);
      setTimeout(() => setTrollError(false), 3500);
      return;
    }
    // Show confirmation modal for LLM-resolved URLs
    setConfirmSite(result);
  };

  const handleVoiceTranscript = async (transcript) => {
    setSearchQuery(transcript);
    if (mode === 'chat') {
        navigate('/wok-ai', { state: { autoSend: transcript } });
        return;
    }
    const direct = extractUrlDirect(transcript);
    if (direct) {
      startScan(direct);
      setSearchQuery('');
    } else {
      setTimeout(async () => {
        const result = await extractUrlFromText(transcript);
        if (result) { setConfirmSite(result); setSearchQuery(''); }
      }, 600);
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
  const lrsLabel = lrs >= 65 ? 'Bonne visibilité' : lrs >= 30 ? 'Visibilité partielle' : 'Faible visibilité';
  const isScanningActive = !!scanningUrls[activeProfile?.site_url];
  const hasData = !!(activeProfile?.score_overall > 0 || activeProfile?.lrs_score > 0);

  const ENGINES_BARS = [
    { key: 'chatgpt', label: 'ChatGPT', logoId: 'chatgpt' },
    { key: 'gemini',  label: 'Gemini',  logoId: 'gemini' },
    { key: 'claude',  label: 'Claude',  logoId: 'claude' },
  ];

  const MODULES = [
    { label: 'Rapport IA',  sub: 'LRS · moteurs',      Icon: BarChart2,      route: '/ai-report' },
    { label: 'Audit',       sub: 'Technique et crawl', Icon: ClipboardCheck,  route: '/audit' },
    { label: 'Performance', sub: 'Part de voix',       Icon: TrendingUp,      route: '/performance' },
    { label: 'Connexions',  sub: 'GSC · Analytics',    Icon: Link2,           route: '/connections' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ fontSize: 25, fontWeight: 600, color: INK, margin: '0 0 3px', letterSpacing: '-0.02em' }}>
            Bonjour {getFirstName(user?.full_name)}.
          </h1>
          <p style={{ fontSize: 13.5, color: INK2, margin: 0 }}>Que souhaitez-vous analyser aujourd'hui ?</p>
        </div>

        {/* ── Barre de recherche ── */}
        <div style={{ position: 'relative', marginBottom: trollError ? 8 : 16 }}>
          <div style={{
            background: WHITE, border: `1px solid ${trollError ? '#EF4444' : BORDER}`,
            borderRadius: 10, padding: '9px 9px 9px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'border-color 200ms',
          }}>
            <Plus size={14} color={INK} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            <textarea
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setTrollError(false); }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitSearch(); } }}
              placeholder={mode === 'scan' ? "Rechercher un domaine, lancer une analyse…" : "Poser une question, demander de l'aide..."}
              rows={1}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 13.5, color: INK, fontFamily: F, minWidth: 0,
                resize: 'none', lineHeight: '1.5',
                minHeight: '20px',
                maxHeight: `${4 * 1.5 * 13.5}px`,
                overflowY: 'auto',
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                const maxH = 4 * 1.5 * 13.5;
                e.target.style.height = Math.min(e.target.scrollHeight, maxH) + 'px';
              }}
            />

            {/* Mode selector */}
            <ModeSelector
              mode={mode}
              onToggle={() => setShowModes(v => !v)}
            />

            {/* Mic */}
            <MicButton onTranscript={handleVoiceTranscript} />

            {/* Submit with tooltip */}
            <SubmitButton
              onClick={handleSubmitSearch}
              loading={extracting || Object.keys(scanningUrls).length > 0}
            />
          </div>

          {/* Troll error */}
          <AnimatePresence>
            {trollError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '5px 12px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertCircle size={12} color="#EF4444" />
                <span style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 500 }}>Impossible d'identifier un site web. Essayez avec un lien direct ou un nom de domaine.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode Dropdown */}
          <AnimatePresence>
            {showModes && (
              <ModeDropdown
                mode={mode}
                onSelect={setMode}
                onClose={() => setShowModes(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Carte Score ── */}
        <div style={{ marginBottom: 12 }}>
          {isScanningActive ? (
            <div style={{ background: CARD_BG, borderRadius: 14, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: CORAL, animation: 'spin 0.9s linear infinite' }} />
              <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.82)', margin: 0 }}>Analyse de {getDomain(activeProfile?.site_url)}…</p>
              <p style={{ fontSize: 12.5, fontWeight: 400, color: 'rgba(255,255,255,0.3)', margin: 0, textAlign: 'center' }}>8 moteurs IA · ~60s · Vous pouvez naviguer</p>
            </div>
          ) : hasData ? (
            <div style={{ background: CARD_BG, borderRadius: 14, padding: '16px 18px', cursor: 'pointer', position: 'relative' }}
              onClick={e => { if (!e.target.closest('button')) navigate('/ai-report'); }}>

              {/* ── Ring + pastille en haut à droite ── */}
              <div style={{ position: 'absolute', top: 13, right: 14 }} onClick={e => e.stopPropagation()}>
                <ScanStatusIndicator
                  lastScan={activeProfile?.last_scan}
                  planId={user?.subscription_plan || 'free'}
                  onScan={() => startScan(activeProfile.site_url)}
                  scanning={isScanningActive}
                />
              </div>

              {/* ── Row 1: donut + badge visibilité ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <BigDonut score={lrs} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ padding: '3px 10px', background: 'rgba(249,87,56,0.13)', border: '1px solid rgba(249,87,56,0.25)', borderRadius: 20, display: 'inline-block' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: CORAL }}>{lrsLabel}</span>
                  </div>
                </div>
              </div>

              {/* ── Insight ── */}
              <p style={{ fontSize: 12.5, fontWeight: 400, color: 'rgba(255,255,255,0.40)', margin: '0 0 12px', lineHeight: 1.65 }}>
                {activeProfile?.shock_insight
                  ? activeProfile.shock_insight.slice(0, 130) + (activeProfile.shock_insight.length > 130 ? '…' : '')
                  : 'Analysez votre visibilité sur les 8 moteurs IA — ChatGPT, Gemini, Claude et plus.'}
              </p>

              <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 12 }} />

              {/* ── Engine bars ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
                {ENGINES_BARS.map(e => {
                  const s = activeProfile[`${e.key}_score`] || 0;
                  return (
                    <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.65, filter: 'grayscale(1) brightness(10)' }}>
                        <AILogoImg id={e.logoId} size={16} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: WHITE, width: 54, flexShrink: 0 }}>{e.label}</span>
                      <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.10)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(s, 100)}%`, background: CORAL, borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: WHITE, width: 20, textAlign: 'right' }}>{s}</span>
                    </div>
                  );
                })}
              </div>

              {/* ── Footer: voir rapport ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 12.5, fontWeight: 400, color: CORAL }}>Voir le rapport complet</span>
                <ArrowRight size={12} color={CORAL} strokeWidth={1.8} />
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

        {/* ── Modules 2x2 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 7, marginBottom: 22 }}>
          {MODULES.map(m => (
            <ModuleCard key={m.label} label={m.label} sub={m.sub} Icon={m.Icon} onClick={() => navigate(m.route)} />
          ))}
        </div>

        {/* ── Mes domaines ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 400, color: INK2 }}>Mes domaines · {profiles.length}/{MAX_DOMAINS}</span>
            <button onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', border: 'none', borderRadius: 999, background: '#272522', fontSize: 12.5, fontWeight: 400, color: 'rgba(255,255,255,0.82)', cursor: 'pointer', fontFamily: F }}>
              <Zap size={12} color={WHITE} strokeWidth={2} />
              Analyser
            </button>
          </div>

          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 13, overflow: 'hidden' }}>
            {profiles.map((p, i) => {
              const score = Math.round(p?.lrs_score || p?.score_overall || 0);
              const lbl   = getDomain(p.site_url);
              const name  = p.identity_name || lbl;
              const av    = avatarBg(lbl);
              const init  = initials(name);
              const isScanning = !!scanningUrls[p.site_url];

              return (
                <div key={p.site_url || i} onClick={() => switchDomain(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: WHITE, borderBottom: i < profiles.length - 1 ? `1px solid ${BORDER}` : 'none', transition: 'background 120ms' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F2EBD9'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = WHITE; }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: WHITE }}>{init}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: 12, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{lbl}</div>
                  </div>
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
                  <button onClick={e => { e.stopPropagation(); handleDeleteDomain(p); }}
                    style={{ width: 22, height: 22, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0, transition: 'opacity 120ms', borderRadius: 5 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.stopPropagation(); }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}>
                    <Trash2 size={11} color="#EF4444" strokeWidth={1.8} />
                  </button>
                </div>
              );
            })}
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

      {/* ── Confirmation modal ── */}
      <AnimatePresence>
        {confirmSite && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmSite(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(21,19,15,0.35)', backdropFilter: 'blur(8px)' }} />
            <motion.div key="modal" initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, width: '100%', maxWidth: 380, padding: '0 16px', fontFamily: F }}>
              <div style={{ background: WHITE, borderRadius: 20, overflow: 'hidden' }}>
                {/* Site preview header */}
                <div style={{ background: CARD_BG, padding: '24px 24px 20px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>Site identifié</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Globe size={18} color="rgba(255,255,255,0.6)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 16, fontWeight: 800, color: WHITE, margin: 0, letterSpacing: '-0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {confirmSite.name || confirmSite.url.replace(/https?:\/\//, '').split('/')[0]}
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {confirmSite.url}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ padding: '16px' }}>
                  <button onClick={() => confirmAndScan(confirmSite.url)}
                    style={{ width: '100%', padding: '13px', background: CARD_BG, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Zap size={13} color={CORAL} />
                    Analyser ce site
                  </button>
                  <button onClick={() => setConfirmSite(null)}
                    style={{ width: '100%', padding: '11px', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 12, fontSize: 13, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
                    Ce n'est pas le bon site
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
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
        style={{ width: '100%', padding: '10px 13px', fontSize: 13.5, border: `1px solid rgba(21,19,15,0.15)`, borderRadius: 9, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: F, color: INK, background: '#EEE5D2' }} />
      <button onClick={() => url.trim() && onSubmit(clean())} disabled={!url.trim()}
        style={{ width: '100%', padding: '11px', fontSize: 13.5, fontWeight: 700, color: WHITE, background: url.trim() ? CORAL : '#ccc', border: 'none', borderRadius: 9, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <Zap size={13} />
        Lancer l'analyse
      </button>
    </div>
  );
}