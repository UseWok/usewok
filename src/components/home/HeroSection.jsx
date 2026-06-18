import { useState, useRef, useEffect } from 'react';
import { Plus, X, FileText, Wifi, Send, Zap, ChevronDown, Upload, Target, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan, getPlanFeatures } from '@/lib/plans-config';
import { useLanguage } from '@/lib/i18n';
import { ALL_MODES as CHAT_ALL_MODES } from '@/lib/modes-config';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import DragDropOverlay from '@/components/DragDropOverlay';

const ALL_MODES = CHAT_ALL_MODES;
const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const F = 'Inter, system-ui, sans-serif';

const popUp = {
  initial: { opacity: 0, y: 6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.97 },
  transition: { duration: 0.12 },
};

// ─── Official logos via CDN ───────────────────────────────────────────────────
const ClaudeLogo = ({ size = 16 }) => (
  <img src="https://www.anthropic.com/images/icons/apple-touch-icon.png" alt="Claude"
    style={{ width: size, height: size, borderRadius: 4, objectFit: 'contain', flexShrink: 0 }} />
);
const OpenAILogo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.897zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.681zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
);
const GeminiLogo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="gem-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4285F4"/>
        <stop offset="50%" stopColor="#9B72CB"/>
        <stop offset="100%" stopColor="#D96570"/>
      </linearGradient>
    </defs>
    <path d="M12 2C12 2 14 8 20 12C14 16 12 22 12 22C12 22 10 16 4 12C10 8 12 2 12 2Z" fill="url(#gem-g)"/>
  </svg>
);

// ─── Model data ───────────────────────────────────────────────────────────────
const MODEL_FAMILIES = [
  {
    id: 'automatic',
    name: 'Automatic',
    desc: 'Combinaison intelligente des meilleurs modèles IA',
    logo: null,
    isAutomatic: true,
  },
  {
    id: 'claude-opus-48', family: 'claude',
    name: 'Claude Opus 4.8',
    logo: 'claude',
  },
  {
    id: 'claude-sonnet-46', family: 'claude',
    name: 'Claude Sonnet 4.6',
    logo: 'claude',
  },
  {
    id: 'claude-opus-47', family: 'claude',
    name: 'Claude Opus 4.7',
    logo: 'claude',
  },
  {
    id: 'chatgpt-55', family: 'openai',
    name: 'ChatGPT 5.5',
    logo: 'openai',
  },
  {
    id: 'chatgpt-50', family: 'openai',
    name: 'ChatGPT 5.0',
    logo: 'openai',
  },
  {
    id: 'gemini-advanced', family: 'gemini',
    name: 'Gemini Advanced',
    logo: 'gemini',
  },
];

function ModelLogo({ type, size = 16 }) {
  if (type === 'claude') return <ClaudeLogo size={size} />;
  if (type === 'openai') return <OpenAILogo size={size} />;
  if (type === 'gemini') return <GeminiLogo size={size} />;
  // Automatic: sparkle star
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3L13.5 9H19.5L14.5 13L16.5 19L12 15.5L7.5 19L9.5 13L4.5 9H10.5L12 3Z" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Model Selector Dropdown ──────────────────────────────────────────────────
function ModelSelector({ selectedModel, onSelect, isLight = true }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const model = MODEL_FAMILIES.find(m => m.id === selectedModel) || MODEL_FAMILIES[0];

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const btnStyle = isLight
    ? { height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.10)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(0,0,0,0.65)', fontFamily: F, transition: 'background 120ms' }
    : { height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fff', fontFamily: F };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button style={btnStyle}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={e => { if (isLight) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
        onMouseLeave={e => { if (isLight) e.currentTarget.style.background = '#fff'; }}>
        <ModelLogo type={model.logo} size={14} />
        <span style={{ color: '#6366F1', fontWeight: 500 }}>Modèle intelligent</span>
        <ChevronDown style={{ width: 11, height: 11, opacity: 0.5 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...popUp}
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
              background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.09)',
              borderRadius: 14, padding: 6, minWidth: 280,
              boxShadow: '0 12px 40px rgba(0,0,0,0.14)', zIndex: 999,
              fontFamily: F,
            }}
          >
            {/* Header */}
            <div style={{ padding: '6px 12px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.02em' }}>Changer de modèle</span>
            </div>

            {MODEL_FAMILIES.map((m) => {
              const isSelected = selectedModel === m.id;
              const isAuto = m.isAutomatic;
              return (
                <button
                  key={m.id}
                  onClick={() => { onSelect(m.id); setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: isAuto ? 'flex-start' : 'center',
                    gap: 10, padding: isAuto ? '10px 12px' : '8px 12px',
                    background: isAuto ? 'rgba(99,102,241,0.04)' : 'transparent',
                    border: 'none', borderRadius: 9, cursor: 'pointer', textAlign: 'left',
                    marginBottom: isAuto ? 6 : 0,
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isAuto ? 'rgba(99,102,241,0.08)' : 'rgba(0,0,0,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = isAuto ? 'rgba(99,102,241,0.04)' : 'transparent'}
                >
                  <div style={{ flexShrink: 0, marginTop: isAuto ? 2 : 0 }}>
                    <ModelLogo type={m.logo} size={isAuto ? 18 : 15} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: isAuto ? 14 : 13, fontWeight: isAuto ? 700 : 500, color: isAuto ? '#6366F1' : '#1A1A1A', display: 'block', lineHeight: 1.3 }}>
                      {m.name}
                    </span>
                    {isAuto && m.desc && (
                      <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.42)', lineHeight: 1.4, display: 'block', marginTop: 2 }}>{m.desc}</span>
                    )}
                  </div>
                  {isSelected && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check style={{ width: 11, height: 11, color: '#fff' }} />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Separator before non-auto */}
            <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '2px 8px 6px' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Objectif button with hover tooltip ──────────────────────────────────────
function ObjectifButton({ active, onToggle }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Tooltip on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
              background: '#1A1A1A', color: '#fff', fontSize: 12, lineHeight: 1.5,
              padding: '8px 12px', borderRadius: 8, whiteSpace: 'nowrap', maxWidth: 220,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 100, pointerEvents: 'none',
              whiteSpaceCollapse: 'preserve-breaks',
              textAlign: 'center',
            }}
          >
            Le mode objectif améliore la qualité,<br />consomme plus de crédits
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 32, height: 32, borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.10)',
          background: 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 120ms',
        }}
        onMouseEnterCapture={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
        onMouseLeaveCapture={e => e.currentTarget.style.background = 'transparent'}
      >
        <Target style={{ width: 15, height: 15, color: active ? '#3B82F6' : 'rgba(0,0,0,0.45)' }} />
      </button>
    </div>
  );
}

// ─── Compétence button with "À venir" badge ───────────────────────────────────
function CompetenceButton({ selected, onClick }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* À venir badge */}
      <span style={{
        position: 'absolute', top: -6, right: -4, zIndex: 2,
        fontSize: 8, fontWeight: 600, letterSpacing: '0.03em',
        padding: '1px 4px', borderRadius: 999,
        background: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.35)',
        pointerEvents: 'none', lineHeight: 1.5,
      }}>
        À venir
      </span>
      <button
        onClick={onClick}
        style={{
          height: 32, paddingLeft: 10, paddingRight: 10,
          display: 'flex', alignItems: 'center', gap: 5,
          borderRadius: 8, border: '1px solid rgba(0,0,0,0.10)',
          background: selected ? 'rgba(221,255,0,0.12)' : '#fff',
          cursor: 'pointer', fontSize: 13, color: 'rgba(0,0,0,0.55)', fontFamily: F,
          transition: 'background 120ms',
        }}
        onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
        onMouseLeave={e => { if (!selected) e.currentTarget.style.background = '#fff'; }}
      >
        <Zap style={{ width: 13, height: 13, color: selected ? '#0A0A0A' : 'rgba(0,0,0,0.5)' }} />
        <span style={{ fontWeight: selected ? 600 : 400 }}>Compétence</span>
      </button>
    </div>
  );
}

export default function HeroSection({ agentId }) {
  const [query, setQuery] = useState(() => localStorage.getItem('stensor_home_draft') || '');
  const [files, setFiles] = useState([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [objectifActive, setObjectifActive] = useState(false);
  const [competenceSelected, setCompetenceSelected] = useState(false);
  const [selectedModel, setSelectedModel] = useState('automatic');
  const [userPlan, setUserPlan] = useState(null);
  const [planFeatures, setPlanFeatures] = useState(null);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsTotal, setCreditsTotal] = useState(10);
  const [dailyBlocked, setDailyBlocked] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [hasInternetState, setHasInternetState] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const dragCounterRef = useRef(0);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const plusMenuRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    base44.auth.me().then((u) => {
      const plan = getUserPlan(u);
      const feats = getPlanFeatures(u);
      setUserPlan(plan);
      setPlanFeatures(feats);
      const used = u?.credits_used || 0;
      const bonus = u?.credits_bonus || 0;
      setCreditsUsed(used);
      setCreditsTotal((plan.credits_limit || 10) + bonus);
      if (plan.daily_credits_limit > 0) {
        const todayKey = new Date().toISOString().slice(0, 10);
        const dailyUsed = (() => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0; } catch { return 0; } })();
        if (dailyUsed >= plan.daily_credits_limit) setDailyBlocked(true);
      }
      if (plan.internet_access || feats?.web_search) setHasInternetState(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) setShowPlusMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [query]);

  const canUpload = planFeatures?.file_upload || false;
  const hasInternet = hasInternetState;
  const hasText = query.trim().length > 0;
  const isBlocked = creditsUsed >= creditsTotal || dailyBlocked;

  const handleFileSelect = (e) => { setFiles(prev => [...prev, ...Array.from(e.target.files || [])]); setShowPlusMenu(false); };
  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleEnhance = async () => {
    if (!query.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setShowPlusMenu(false);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        model: 'gpt_5_mini',
        prompt: `Rewrite this user prompt to be highly optimized, clear, and specific for an AI UI builder. Output ONLY the rewritten prompt in French, under 150 characters. No explanation, no quotes, no prefix.\n\nOriginal: "${query.trim()}"`,
      });
      if (typeof result === 'string' && result.trim()) setQuery(result.trim().slice(0, 200));
    } catch {
      toast.error('Could not enhance prompt.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSend = () => {
    if (!query.trim() || isBlocked) return;
    localStorage.removeItem('stensor_home_draft');
    const mode = ALL_MODES.find(m => m.id === 'thinking') || ALL_MODES[ALL_MODES.length - 1];
    const params = new URLSearchParams({ q: query, mode: mode.id, webSearch: useWebSearch && hasInternet ? '1' : '0', model: selectedModel });
    if (agentId) params.set('agent', agentId);
    navigate(`/chat?${params.toString()}`);
  };

  const POWER_TOPICS = [
    { label: 'Build Wealth', prompt: "I want to build serious wealth starting now. Give me a concrete 90-day action plan." },
    { label: 'Crush Debt', prompt: "I want to eliminate all my debt as fast as possible. Give me a realistic monthly plan." },
    { label: 'Start Investing', prompt: "I have $500/month to invest. Tell me exactly where to put it." },
    { label: 'Retire Early', prompt: "I want to retire early using the FIRE method. Calculate how much I need to save monthly." },
  ];

  return (
    <div className="w-full px-8 pt-12 pb-8"
      onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current++; setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragging(false); } }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault(); dragCounterRef.current = 0; setIsDragging(false);
        const dropped = Array.from(e.dataTransfer.files || []);
        if (dropped.length && canUpload) setFiles(prev => [...prev, ...dropped]);
      }}
    >
      <DragDropOverlay visible={isDragging} canUpload={canUpload} />
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />

      {/* Label */}
      <div className="mb-6">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase px-2 py-1" style={{ background: YUZU, color: FG }}>
          AI Financial Coach
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight" style={{ color: FG }}>
        Build your financial freedom.
      </h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(0,0,0,0.38)' }}>
        Ask anything. Get expert-grade answers, instantly.
      </p>

      {/* ── Input card ── */}
      <div style={{
        maxWidth: 640, background: '#FFFFFF',
        border: '1.5px solid rgba(0,0,0,0.09)',
        borderRadius: 16, overflow: 'visible',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        {/* File chips */}
        {files.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '12px 16px 0' }}>
            {files.map((file, idx) => (
              <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 6, fontSize: 11, color: '#555' }}>
                <FileText style={{ width: 11, height: 11 }} />
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <button onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#aaa' }}>
                  <X style={{ width: 9, height: 9 }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <div style={{ padding: '16px 18px 8px' }}>
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); localStorage.setItem('stensor_home_draft', e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isBlocked) handleSend(); } }}
            placeholder={isBlocked ? 'Limit reached — upgrade to continue' : 'Essayez tâches, flux ou jobs récurrents — tapez @ pour ajouter fichiers ou skills'}
            disabled={isBlocked}
            rows={2}
            style={{
              width: '100%', resize: 'none', background: 'transparent', outline: 'none', border: 'none',
              fontSize: 14, lineHeight: '1.6', color: '#1A1A1A', minHeight: 52,
              fontFamily: F,
            }}
            className="placeholder:text-[rgba(0,0,0,0.32)] disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px 10px', gap: 4 }}>

          {/* LEFT: + | Objectif | Compétence */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

            {/* Plus button */}
            <div style={{ position: 'relative' }} ref={plusMenuRef}>
              <button
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,0,0,0.10)', background: showPlusMenu ? 'rgba(0,0,0,0.06)' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = showPlusMenu ? 'rgba(0,0,0,0.06)' : '#fff'}
              >
                <Plus style={{ width: 15, height: 15, color: 'rgba(0,0,0,0.5)' }} />
              </button>

              <AnimatePresence>
                {showPlusMenu && (
                  <motion.div
                    {...popUp}
                    style={{
                      position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
                      background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 14, minWidth: 240,
                      boxShadow: '0 16px 48px rgba(0,0,0,0.13)', zIndex: 200,
                      overflow: 'hidden', fontFamily: F,
                    }}
                  >
                    {/* Enhance Prompt */}
                    <button
                      onClick={handleEnhance}
                      disabled={isEnhancing || !query.trim()}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'none', border: 'none', cursor: query.trim() ? 'pointer' : 'default', fontFamily: F, opacity: query.trim() ? 1 : 0.45 }}
                      onMouseEnter={e => { if (query.trim()) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <defs><linearGradient id="sp" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#EF4444"/><stop offset="50%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#22C55E"/></linearGradient></defs>
                          <path d="M12 2L13.5 8.5H20L14.5 12.5L16.5 19L12 15.5L7.5 19L9.5 12.5L4 8.5H10.5L12 2Z" fill="url(#sp)"/>
                        </svg>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>{isEnhancing ? 'Amélioration…' : 'Améliorer le prompt'}</span>
                      </div>
                      <span style={{ color: 'rgba(0,0,0,0.25)', fontSize: 16 }}>›</span>
                    </button>

                    <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '0 12px' }} />

                    {/* Import from Computer */}
                    <button
                      onClick={() => { if (canUpload) { fileInputRef.current?.click(); setShowPlusMenu(false); } }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'none', border: 'none', cursor: canUpload ? 'pointer' : 'default', fontFamily: F, opacity: canUpload ? 1 : 0.45 }}
                      onMouseEnter={e => { if (canUpload) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Upload style={{ width: 16, height: 16, color: '#6366F1' }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>Importer depuis l'ordinateur</span>
                      </div>
                      <span style={{ color: 'rgba(0,0,0,0.25)', fontSize: 16 }}>›</span>
                    </button>

                    <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '0 12px' }} />

                    {/* Search Google */}
                    <button
                      onClick={() => { if (hasInternet) { setUseWebSearch(v => !v); setShowPlusMenu(false); } }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'none', border: 'none', cursor: hasInternet ? 'pointer' : 'default', fontFamily: F, opacity: hasInternet ? 1 : 0.45 }}
                      onMouseEnter={e => { if (hasInternet) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Google G */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>Rechercher sur Google</span>
                        {hasInternet && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: useWebSearch ? '#111' : 'rgba(0,0,0,0.07)', color: useWebSearch ? '#fff' : '#888' }}>
                            {useWebSearch ? 'ON' : 'OFF'}
                          </span>
                        )}
                      </div>
                      <span style={{ color: 'rgba(0,0,0,0.25)', fontSize: 16 }}>›</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Objectif button */}
            <ObjectifButton active={objectifActive} onToggle={() => setObjectifActive(v => !v)} />

            {/* Compétence button */}
            <CompetenceButton selected={competenceSelected} onClick={() => setCompetenceSelected(v => !v)} />
          </div>

          <div style={{ flex: 1 }} />

          {/* RIGHT: Model selector + Send */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} isLight={true} />

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!hasText || isBlocked}
              style={{
                width: 34, height: 34, borderRadius: 10, border: 'none',
                cursor: !hasText || isBlocked ? 'not-allowed' : 'pointer',
                background: hasText && !isBlocked ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 120ms',
              }}
            >
              <Send style={{ width: 14, height: 14, color: hasText && !isBlocked ? '#fff' : 'rgba(0,0,0,0.25)' }} />
            </button>
          </div>
        </div>
      </div>

      {isBlocked && (
        <div onClick={() => navigate('/pricing')}
          className="mt-3 py-3 flex items-center justify-between px-4 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: FG, maxWidth: '640px' }}>
          <p className="text-sm font-bold text-white">{dailyBlocked ? 'Daily limit reached' : 'Monthly limit reached'}</p>
          <span className="text-xs font-black px-3 py-1" style={{ background: YUZU, color: FG }}>Upgrade →</span>
        </div>
      )}

      {/* Topic chips */}
      <div className="mt-8" style={{ maxWidth: '640px' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(0,0,0,0.2)' }}>Quick start</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {POWER_TOPICS.map((topic) => (
            <button key={topic.label} onClick={() => setQuery(topic.prompt)}
              className="text-left px-3 py-3 bg-white border hover:bg-black/3 transition-colors"
              style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
              <p className="text-xs font-black" style={{ color: FG }}>{topic.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}