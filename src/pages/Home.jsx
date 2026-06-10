import { useState, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { base44 } from '@/api/base44Client';

import { motion, AnimatePresence } from 'framer-motion';

import {
  Plus, ChevronDown, Mic, ArrowUp, ArrowRight, Check, SlidersHorizontal, Sparkles, Globe, Loader2,
} from 'lucide-react';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';

import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';

import { loadDiscussionsFromCloud } from '@/lib/chat-storage';


const PENDING_KEY = 'stensor_pending_query';
const BUILD_MODE_KEY = 'wok_build_mode';


// ── Logos for pill ──

const GumroadLogo = () => (
  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#FF90E8', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #111', flexShrink: 0 }}>
    <span style={{ fontSize: 11, fontWeight: 900, color: '#000', lineHeight: 1 }}>G</span>
  </div>
);

const BeehiivLogo = () => (
  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#C77DFF,#48CAE4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #111', flexShrink: 0, overflow: 'hidden' }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="8" rx="7" ry="4" fill="rgba(255,255,255,0.9)"/>
      <ellipse cx="12" cy="13" rx="7" ry="4" fill="rgba(255,255,255,0.7)"/>
      <rect x="9" y="17" width="6" height="4" rx="2" fill="rgba(255,255,255,0.85)"/>
    </svg>
  </div>
);

const StripeLogo = () => (
  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #111', flexShrink: 0 }}>
    <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', lineHeight: 1 }}>S</span>
  </div>
);


// ── Model options ──
const HOME_MODEL_OPTIONS = [
  { id: 'Low', label: 'Low', isNew: false },
  { id: 'Medium', label: 'Medium', isNew: false },
  { id: 'High', label: 'High', isNew: false },
  { id: 'Max', label: 'Max', isNew: true },
];

function HomeModelMenu({ selectedModel, setSelectedModel, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
        background: '#1C1C1C', border: '1px solid #2A2A2A',
        borderRadius: 14, padding: '5px', minWidth: 240,
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)', zIndex: 9999,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Automatic — 2x height */}
      <button
        onClick={() => { setSelectedModel('Automatic'); onClose(); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', minHeight: 64, padding: '12px 11px', border: 'none',
          background: selectedModel === 'Automatic' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
          borderRadius: 9, cursor: 'pointer', textAlign: 'left', gap: 8, marginBottom: 2,
        }}
        onMouseEnter={e => { if (selectedModel !== 'Automatic') e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = selectedModel === 'Automatic' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'; }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Automatic</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 3, lineHeight: 1.4 }}>The best AI model is selected for each request.</div>
        </div>
        {selectedModel === 'Automatic' && <Check style={{ width: 13, height: 13, color: '#fff', flexShrink: 0 }} />}
      </button>

      {HOME_MODEL_OPTIONS.map(m => {
        const isActive = selectedModel === m.id;
        return (
          <button key={m.id}
            onClick={() => { setSelectedModel(m.id); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', height: 36, padding: '0 11px', border: 'none',
              background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
              borderRadius: 9, cursor: 'pointer', textAlign: 'left', gap: 8,
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(255,255,255,0.07)' : 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{m.label}</span>
              {m.isNew && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#7B4FE0', background: 'rgba(123,79,224,0.15)', border: '1px solid rgba(123,79,224,0.3)', borderRadius: 5, padding: '1px 6px' }}>New</span>
              )}
            </div>
            {isActive && <Check style={{ width: 13, height: 13, color: '#fff', flexShrink: 0 }} />}
          </button>
        );
      })}
    </motion.div>
  );
}

function HomeEnhanceMenu({ onEnhance, isEnhancing, webSearch, setWebSearch, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
        background: '#1C1C1C', border: '1px solid #2A2A2A',
        borderRadius: 14, padding: '5px', minWidth: 240,
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)', zIndex: 9999,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Enhance prompt */}
      <button onClick={onEnhance} disabled={isEnhancing}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 44, padding: '0 12px', border: 'none', background: 'transparent', borderRadius: 9, cursor: isEnhancing ? 'not-allowed' : 'pointer', textAlign: 'left' }}
        onMouseEnter={e => { if (!isEnhancing) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {isEnhancing
          ? <Loader2 style={{ width: 14, height: 14, color: '#7B4FE0', flexShrink: 0, animation: 'hspin 0.6s linear infinite' }} />
          : <Sparkles style={{ width: 14, height: 14, color: '#7B4FE0', flexShrink: 0 }} />
        }
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{isEnhancing ? 'Rewriting...' : 'Enhance prompt'}</span>
      </button>

      {/* Search the web — 2x height */}
      <button onClick={() => setWebSearch(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', minHeight: 64, padding: '12px 12px', border: 'none',
          background: webSearch ? 'rgba(56,189,248,0.07)' : 'transparent',
          borderRadius: 9, cursor: 'pointer', textAlign: 'left', gap: 8,
        }}
        onMouseEnter={e => { if (!webSearch) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = webSearch ? 'rgba(56,189,248,0.07)' : 'transparent'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Globe style={{ width: 14, height: 14, color: webSearch ? '#38BDF8' : '#555', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: webSearch ? '#fff' : '#aaa' }}>Search the web</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 2, lineHeight: 1.4 }}>Include live web results in responses.</div>
          </div>
        </div>
        {webSearch && <Check style={{ width: 13, height: 13, color: '#38BDF8', flexShrink: 0 }} />}
      </button>
      <style>{`@keyframes hspin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
    </motion.div>
  );
}

// ── Build mode dropdown ──

function BuildModeMenu({ mode, setMode, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const MODES = [
    { id: 'Flash', label: 'Flash', desc: 'Fast, direct changes' },
    { id: 'Expert', label: 'Expert', desc: 'Deep reasoning mode' },
  ];

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
        background: '#1E1E1E', border: '1px solid #333', borderRadius: 12,
        padding: '4px', minWidth: 220,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 9999,
      }}
    >
      {MODES.map(m => {
        const isActive = mode === m.id;
        return (
          <button key={m.id}
            onClick={() => {
              setMode(m.id);
              base44.auth.me().then(u => {
                if (u) base44.auth.updateMe({ build_mode: m.id });
              }).catch(() => {});
              localStorage.setItem(BUILD_MODE_KEY, m.id);
              onClose();
            }}
            style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              width: '100%', padding: '10px 12px', border: 'none',
              background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
              borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', gap: 8,
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{m.label}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{m.desc}</div>
            </div>
            {isActive && <Check style={{ width: 14, height: 14, color: '#fff', marginTop: 2, flexShrink: 0 }} />}
          </button>
        );
      })}
      <div style={{ borderTop: '1px solid #2A2A2A', margin: '4px 0', padding: '8px 12px' }}>
        <span style={{ fontSize: 11, color: '#444', display: 'flex', alignItems: 'center', gap: 6 }}>
          Toggle with <kbd style={{ fontSize: 10, background: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: 4, padding: '1px 5px', color: '#666', fontFamily: 'monospace' }}>Alt</kbd>
          <kbd style={{ fontSize: 10, background: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: 4, padding: '1px 5px', color: '#666', fontFamily: 'monospace' }}>P</kbd>
        </span>
      </div>
    </motion.div>
  );
}


// ── Real Project Card ──

function ProjectCard({ conv, onClick }) {
  const [imgError, setImgError] = useState(false);
  const previewUrl = conv.conv_id ? `https://wok.base44.app/tools/${conv.conv_id}` : null;

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Edited recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 2) return 'Edited just now';
    if (mins < 60) return `Edited ${mins} min ago`;
    if (hours < 24) return `Edited ${hours}h ago`;
    return `Edited ${days}d ago`;
  };

  return (
    <div
      onClick={onClick}
      style={{ flexShrink: 0, width: 220, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#1A1A1A', cursor: 'pointer', transition: 'border-color 140ms, transform 140ms' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Preview area */}
      <div style={{ height: 130, background: '#111', position: 'relative', overflow: 'hidden' }}>
        {previewUrl && !imgError ? (
          <iframe
            src={previewUrl}
            style={{ width: '200%', height: '200%', border: 'none', transform: 'scale(0.5)', transformOrigin: '0 0', pointerEvents: 'none' }}
            onError={() => setImgError(true)}
            title={conv.title}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 5, padding: 12 }}>
            <div style={{ height: 7, background: 'rgba(255,255,255,0.12)', borderRadius: 4, width: '65%' }} />
            <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 4, width: '85%' }} />
            <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 4, width: '50%' }} />
          </div>
        )}
      </div>
      <div style={{ padding: '9px 12px 12px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {conv.title || 'Untitled build'}
        </p>
        <p style={{ fontSize: 11, color: '#555', margin: '3px 0 0' }}>{timeAgo(conv.updatedAt || conv.updated_date)}</p>
      </div>
    </div>
  );
}


export default function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [projectTab, setProjectTab] = useState('My projects');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserOnboarding, setShowUserOnboarding] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [buildMode, setBuildMode] = useState(() => localStorage.getItem(BUILD_MODE_KEY) || 'Flash');
  const buildMenuRef = useRef(null);
  const homeFileInputRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState('High');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [webSearch, setWebSearch] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!input.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a prompt engineering expert. Rewrite the following user prompt to make it clearer, more structured, and more effective for an AI UI builder. Keep the same intent. Be concise. Return ONLY the improved prompt, no explanation.\n\nOriginal prompt: "${input}"`,
        model: 'gpt_5_mini',
      });
      const improved = typeof result === 'string' ? result.trim() : input;
      setInput(improved);
      setShowEnhanceMenu(false);
    } catch {}
    setIsEnhancing(false);
  };

  const handleSend = (q) => {
    const query = q || input;
    if (!query.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    // Inject Space Grotesk font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const quizResults = JSON.parse(localStorage.getItem('stensor_quiz_results') || 'null');
    if (quizResults) {
      base44.auth.me().then((u) => {
        if (u && !u.quiz_answers) base44.auth.updateMe({ quiz_answers: quizResults });
        localStorage.removeItem('stensor_quiz_results');
      }).catch(() => localStorage.removeItem('stensor_quiz_results'));
    }
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) { localStorage.removeItem(PENDING_KEY); navigate(`/chat?q=${encodeURIComponent(pending)}`); return; }

    base44.auth.me().then(u => {
      setUser(u);
      if (u?.build_mode) {
        setBuildMode(u.build_mode);
        localStorage.setItem(BUILD_MODE_KEY, u.build_mode);
      }
    }).catch(() => {});

    if (shouldShowUserOnboarding()) setTimeout(() => setShowUserOnboarding(true), 800);
    else if (shouldShowTensorsOnboarding()) setTimeout(() => setShowOnboarding(true), 1200);

    loadDiscussionsFromCloud().then(discs => {
      setProjects(discs.slice(0, 8));
    }).catch(() => {});

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadDiscussionsFromCloud().then(discs => setProjects(discs.slice(0, 8))).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Alt+P shortcut for build mode
  useEffect(() => {
    const h = (e) => {
      if (e.altKey && e.key === 'p') {
        const next = buildMode === 'Flash' ? 'Expert' : 'Flash';
        setBuildMode(next);
        localStorage.setItem(BUILD_MODE_KEY, next);
        base44.auth.me().then(u => { if (u) base44.auth.updateMe({ build_mode: next }); }).catch(() => {});
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [buildMode]);

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const TABS = ['My projects', 'Recently viewed'];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: `
        radial-gradient(ellipse 100% 60% at 90% 0%, rgba(30,80,200,0.9) 0%, transparent 55%),
        radial-gradient(ellipse 80% 70% at 50% 50%, rgba(220,40,180,0.95) 0%, transparent 55%),
        radial-gradient(ellipse 80% 60% at 10% 80%, rgba(255,80,20,0.9) 0%, transparent 55%),
        radial-gradient(ellipse 60% 50% at 80% 100%, rgba(255,120,0,0.7) 0%, transparent 50%),
        #050508
      `,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflowY: 'auto',
    }}>
      {showUserOnboarding && <UserOnboarding onClose={() => setShowUserOnboarding(false)} />}
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}

      {/* ── Hero section ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px 40px', minHeight: '65vh' }}>

        {/* Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px 6px 8px',
          background: 'rgba(0,0,0,0.65)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 999,
          marginBottom: 28,
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <GumroadLogo />
            <div style={{ marginLeft: -6 }}><BeehiivLogo /></div>
            <div style={{ marginLeft: -6 }}><StripeLogo /></div>
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Sell via your favorite tools</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>→</span>
        </div>

        {/* Main title — Space Grotesk 700, tighter tracking */}
        <h1 style={{
          fontSize: 'clamp(26px, 3.5vw, 42px)',
          fontWeight: 400,
          fontFamily: "'Space Grotesk', Inter, system-ui, sans-serif",
          color: '#fff',
          textAlign: 'center',
          margin: '0 0 32px',
          letterSpacing: '-0.03em',
          lineHeight: 1.18,
        }}>
          What should we build, {firstName}?
        </h1>

        {/* Chat input bar */}
        <div style={{ width: '100%', maxWidth: 640, position: 'relative' }}>
          <div style={{
            background: 'rgba(28,28,28,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 18,
            backdropFilter: 'blur(14px)',
            overflow: 'visible',
          }}>
            <div style={{ padding: '14px 16px 4px' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask WOK to build a landing page for my..."
                rows={2}
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, color: '#fff', resize: 'none', fontFamily: 'inherit',
                  lineHeight: 1.6,
                }}
                className="placeholder:text-[#555]"
              />
            </div>
            {/* Bottom toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '6px 10px 10px', gap: 5, position: 'relative' }}>
              {/* Hidden file input */}
              <input type="file" multiple ref={homeFileInputRef} style={{ display: 'none' }} />

              {/* Plus — attach */}
              <button
                onClick={() => homeFileInputRef.current?.click()}
                style={{ height: 28, padding: '0 10px', borderRadius: 8, background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#111', fontSize: 12, fontWeight: 600, flexShrink: 0, transition: 'opacity 120ms' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Plus size={13} color="#111" />
                Attach
              </button>

              {/* Model selector */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => { setShowModelMenu(v => !v); setShowEnhanceMenu(false); }}
                  style={{ height: 28, padding: '0 10px', borderRadius: 8, background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#111', fontSize: 12, fontWeight: 600, transition: 'opacity 120ms' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <SlidersHorizontal size={12} color="#111" />
                  {selectedModel}
                </button>
                <AnimatePresence>
                  {showModelMenu && (
                    <HomeModelMenu selectedModel={selectedModel} setSelectedModel={setSelectedModel} onClose={() => setShowModelMenu(false)} />
                  )}
                </AnimatePresence>
              </div>

              {/* Enhance prompt */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => { setShowEnhanceMenu(v => !v); setShowModelMenu(false); }}
                  style={{ height: 28, padding: '0 10px', borderRadius: 8, background: showEnhanceMenu ? 'rgba(123,79,224,0.2)' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: showEnhanceMenu ? '#7B4FE0' : '#111', fontSize: 12, fontWeight: 600, transition: 'opacity 120ms, background 120ms' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Sparkles size={12} color={showEnhanceMenu ? '#7B4FE0' : '#111'} />
                  Enhance
                </button>
                <AnimatePresence>
                  {showEnhanceMenu && (
                    <HomeEnhanceMenu onEnhance={handleEnhancePrompt} isEnhancing={isEnhancing} webSearch={webSearch} setWebSearch={setWebSearch} onClose={() => setShowEnhanceMenu(false)} />
                  )}
                </AnimatePresence>
              </div>

              <div style={{ flex: 1 }} />

              {/* Mic */}
              <button style={{ width: 30, height: 30, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
                onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                <Mic size={14} />
              </button>
              {/* Send — disabled when no input */}
              <button onClick={() => handleSend()} disabled={!input.trim()}
                style={{ width: 30, height: 30, borderRadius: '50%', background: '#fff', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 120ms', flexShrink: 0, opacity: input.trim() ? 1 : 0.35 }}>
                <ArrowUp size={14} color="#111" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── My Builds section ── */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          background: 'rgba(15,15,15,0.88)',
          backdropFilter: 'blur(20px)',
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '20px 22px 22px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setProjectTab(tab)} style={{
                  padding: '5px 14px', borderRadius: 999,
                  border: projectTab === tab ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  background: projectTab === tab ? 'rgba(255,255,255,0.09)' : 'transparent',
                  fontSize: 13, fontWeight: projectTab === tab ? 600 : 400,
                  color: projectTab === tab ? '#fff' : '#555', cursor: 'pointer',
                }}>
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={() => navigate('/projects')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#555'}
            >
              Browse all <ArrowRight size={13} />
            </button>
          </div>

          {/* Project cards */}
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {projects.length > 0 ? (
              projects.map(p => (
                <ProjectCard key={p.id} conv={p} onClick={() => navigate(`/chat?conversationId=${p.id}`)} />
              ))
            ) : (
              // Empty state — new build CTA cards
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {['Start a new project', 'Build a landing page', 'Create a dashboard'].map((title, i) => (
                  <div key={i} onClick={() => navigate(`/chat?q=${encodeURIComponent(title)}`)}
                    style={{ flexShrink: 0, width: 220, height: 160, borderRadius: 12, border: '1px dashed rgba(255,255,255,0.12)', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'border-color 140ms' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={16} color="#666" />
                    </div>
                    <span style={{ fontSize: 12, color: '#555', textAlign: 'center', padding: '0 16px' }}>{title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}