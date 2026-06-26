import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Trash2, ArrowUp, Link2, BarChart2, ClipboardCheck, TrendingUp, Mic, Zap, Loader, AlertCircle, ChevronDown, ArrowRight, Check } from 'lucide-react';
import { setActiveDomain } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';
import { getWokFeatures, getWokPlanId } from '@/lib/wok-plans';

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

// ── Real AI Logos ─────────────────────────────────────────────────────────────
const LogoAuto = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={INK} strokeWidth="1.5"/>
    <path d="M8 12h8M12 8l4 4-4 4" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoChatGPT = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387 2.019-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.411-.663zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" fill="#10A37F"/>
  </svg>
);

const LogoGemini = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.304 14.304 0 0 0 12 12 14.304 14.304 0 0 0-12 12z" fill="url(#gemini-grad)"/>
    <defs>
      <linearGradient id="gemini-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4285F4"/>
        <stop offset="50%" stopColor="#9B72CB"/>
        <stop offset="100%" stopColor="#EA4335"/>
      </linearGradient>
    </defs>
  </svg>
);

const LogoClaude = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M13.827 3.52h3.603L12 13.853 6.57 3.52H2.966l7.456 15.132L13.84 24l1.418-5.348 7.776-15.132z" fill="#D97757"/>
  </svg>
);

const LogoPerplexity = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7v5l10 5 10-5V7z" stroke="#20808D" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 12v5l10 5 10-5v-5" stroke="#20808D" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 12v10M2 7l10 5 10-5" stroke="#20808D" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const LogoMistral = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="1" y="1" width="5" height="5" rx="1" fill="#FF7000"/>
    <rect x="9" y="1" width="5" height="5" rx="1" fill="#FF7000"/>
    <rect x="17" y="1" width="5" height="5" rx="1" fill="#FF7000"/>
    <rect x="1" y="9" width="5" height="5" rx="1" fill="#FF7000" opacity="0.7"/>
    <rect x="17" y="9" width="5" height="5" rx="1" fill="#FF7000" opacity="0.7"/>
    <rect x="1" y="17" width="5" height="5" rx="1" fill="#FF7000" opacity="0.45"/>
    <rect x="17" y="17" width="5" height="5" rx="1" fill="#FF7000" opacity="0.45"/>
  </svg>
);

const LogoGrok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill={INK}/>
  </svg>
);

const LogoCopilot = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#0078D4"/>
    <path d="M8 10c0-1.1.9-2 2-2s2 .9 2 2v.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V10c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1.5c0-.28.22-.5.5-.5s.5.22.5.5V14c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2v-4z" fill="white"/>
  </svg>
);

// ── AI Engines config ──────────────────────────────────────────────────────────
const AI_ENGINES = [
  { id: 'auto',       label: 'Automatic',  Logo: LogoAuto },
  { id: 'chatgpt',    label: 'ChatGPT',    Logo: LogoChatGPT },
  { id: 'gemini',     label: 'Gemini',     Logo: LogoGemini },
  { id: 'claude',     label: 'Claude',     Logo: LogoClaude },
  { id: 'perplexity', label: 'Perplexity', Logo: LogoPerplexity },
  { id: 'mistral',    label: 'Mistral',    Logo: LogoMistral },
  { id: 'grok',       label: 'Grok',       Logo: LogoGrok },
  { id: 'copilot',    label: 'Copilot',    Logo: LogoCopilot },
];

// ── Vertical Engines Dropdown ─────────────────────────────────────────────────
function EnginesDropdown({ selected, onToggle, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  // Sort: selected first, then rest
  const sortedEngines = [
    ...AI_ENGINES.filter(e => selected.includes(e.id)),
    ...AI_ENGINES.filter(e => !selected.includes(e.id)),
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 9000,
        background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12,
        padding: '6px', minWidth: 200,
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
      }}>
      {/* Header */}
      <div style={{ padding: '6px 10px 8px', borderBottom: `1px solid ${BORDER}`, marginBottom: 4 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Moteurs IA</span>
      </div>
      {sortedEngines.map((e) => {
        const isSelected = selected.includes(e.id);
        return (
          <div key={e.id}
            onClick={() => onToggle(e.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
              background: isSelected ? '#F2EFE9' : 'transparent',
              transition: 'background 100ms',
            }}
            onMouseEnter={ev => { if (!isSelected) ev.currentTarget.style.background = '#EEE5D2'; }}
            onMouseLeave={ev => { ev.currentTarget.style.background = isSelected ? '#EEE5D2' : 'transparent'; }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: isSelected ? WHITE : '#EEE5D2', border: `1px solid rgba(21,19,15,0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 100ms' }}>
              <e.Logo />
            </div>
            <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: INK, flex: 1 }}>{e.label}</span>
            {isSelected && (
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={9} color={WHITE} strokeWidth={3} />
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

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

      {/* Listening overlay */}
      {listening && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
              background: INK, borderRadius: 10, padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
              zIndex: 100,
            }}>
            {/* Animated wave bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 18 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{
                  width: 2, borderRadius: 2, background: CORAL,
                  animation: `micWave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                  height: `${4 + Math.random() * 10}px`,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: WHITE, letterSpacing: '0.01em' }}>Écoute…</span>
            <button onClick={stopAll} style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={8} color={WHITE} />
            </button>
          </motion.div>
        </AnimatePresence>
      )}
      <style>{`
        @keyframes micWave {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}

// ── Engine selector in search bar (shows logos when selected) ─────────────────
function EngineSelector({ selected, showEngines, onToggle }) {
  const nonAuto = selected.filter(id => id !== 'auto');
  const displayEngines = nonAuto.slice(0, 2).map(id => AI_ENGINES.find(e => e.id === id)).filter(Boolean);

  if (selected.includes('auto') || selected.length === 0) {
    return (
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', cursor: 'pointer', flexShrink: 0, userSelect: 'none', borderRadius: 6, transition: 'background 120ms' }}
        onMouseEnter={e => e.currentTarget.style.background = '#EEE5D2'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <span style={{ fontSize: 12.5, color: INK2, whiteSpace: 'nowrap' }}>Automatic</span>
        <ChevronDown size={12} color={INK} strokeWidth={1.8} />
      </div>
    );
  }

  return (
    <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', cursor: 'pointer', flexShrink: 0, userSelect: 'none', borderRadius: 6, transition: 'background 120ms', border: `1px solid ${BORDER}` }}
      onMouseEnter={e => e.currentTarget.style.background = '#EEE5D2'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {displayEngines.map(e => (
        <div key={e.id} style={{ width: 20, height: 20, borderRadius: 5, background: WHITE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <e.Logo />
        </div>
      ))}
      {nonAuto.length > 2 && <span style={{ fontSize: 11, color: INK3, marginLeft: 2 }}>+{nonAuto.length - 2}</span>}
      <ChevronDown size={11} color={INK} strokeWidth={1.8} style={{ marginLeft: 2 }} />
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

function extractUrl(text) {
  const match = text.match(URL_REGEX);
  if (!match) return null;
  const raw = match[0];
  return raw.startsWith('http') ? raw : `https://${raw}`;
}

function isLikelyTroll(text) {
  // too short, no domain-like pattern, or clearly not a URL/site name
  if (!text || text.trim().length < 3) return true;
  const hasAlpha = /[a-zA-Z]/.test(text);
  if (!hasAlpha) return true;
  return false;
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
  const size = 68, sw = 6, R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={CORAL} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score/100)} strokeLinecap="round" />
      </svg>
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
  const [trollError, setTrollError] = useState(false);
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

  const handleSubmitSearch = () => {
    const raw = searchQuery.trim();
    if (!raw) return;

    // Try to extract URL from text (handles voice input like "analyse le site apple.com")
    const extracted = extractUrl(raw);
    if (!extracted || isLikelyTroll(raw)) {
      setTrollError(true);
      setTimeout(() => setTrollError(false), 3000);
      return;
    }
    setTrollError(false);
    startScan(extracted);
    setSearchQuery('');
  };

  const handleVoiceTranscript = (transcript) => {
    setSearchQuery(transcript);
    // Auto-trigger scan from voice
    const extracted = extractUrl(transcript);
    if (extracted && !isLikelyTroll(transcript)) {
      startScan(extracted);
      setSearchQuery('');
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
      return without.includes(id)
        ? (without.filter(x => x !== id).length === 0 ? ['auto'] : without.filter(x => x !== id))
        : [...without, id];
    });
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
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setTrollError(false); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmitSearch(); }}
              placeholder="Rechercher un domaine, lancer une analyse…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: INK, fontFamily: F, minWidth: 0 }}
            />

            {/* Engine selector */}
            <EngineSelector
              selected={selectedEngines}
              showEngines={showEngines}
              onToggle={() => setShowEngines(v => !v)}
            />

            {/* Mic */}
            <MicButton onTranscript={handleVoiceTranscript} />

            {/* Submit with tooltip */}
            <SubmitButton
              onClick={handleSubmitSearch}
              loading={Object.keys(scanningUrls).length > 0}
            />
          </div>

          {/* Troll error */}
          <AnimatePresence>
            {trollError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '5px 12px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertCircle size={12} color="#EF4444" />
                <span style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 500 }}>Entrez un nom de domaine valide.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Engine Dropdown */}
          <AnimatePresence>
            {showEngines && (
              <EnginesDropdown
                selected={selectedEngines}
                onToggle={toggleEngine}
                onClose={() => setShowEngines(false)}
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
            <div onClick={() => navigate('/ai-report')} style={{ background: CARD_BG, borderRadius: 14, padding: '18px 20px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 12.5, fontWeight: 400, color: 'rgba(255,255,255,0.38)' }}>Score d'autorité</span>
                <div style={{ padding: '3px 11px', background: 'rgba(249,87,56,0.13)', border: '1px solid rgba(249,87,56,0.25)', borderRadius: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 400, color: CORAL }}>{lrsLabel}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <BigDonut score={lrs} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 44, fontWeight: 300, color: WHITE, letterSpacing: '-0.04em', lineHeight: 1 }}>{lrs}</span>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>/100</span>
                </div>
              </div>
              <p style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', margin: '0 0 16px', lineHeight: 1.7 }}>
                {activeProfile?.shock_insight
                  ? activeProfile.shock_insight.slice(0, 150) + (activeProfile.shock_insight.length > 150 ? '…' : '')
                  : 'Tant que votre site reste sur une adresse de test, vos concurrents récupèrent vos clients potentiels sur Google et les IA.'}
              </p>
              <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 16 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                {ENGINES_BARS.map(e => {
                  const s = activeProfile[`${e.key}_score`] || 0;
                  return (
                    <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: WHITE, width: 70, flexShrink: 0 }}>{e.label}</span>
                      <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.10)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(s, 100)}%`, background: CORAL, borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: WHITE, width: 22, textAlign: 'right' }}>{s}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 400, color: CORAL }}>Voir le rapport complet</span>
                <ArrowRight size={13} color={CORAL} strokeWidth={1.8} />
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