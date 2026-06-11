import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronDown, Mic, ArrowUp, ArrowRight, Check,
} from 'lucide-react';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';
import { loadDiscussionsFromCloud } from '@/lib/chat-storage';
import { getBuildMode, setBuildMode as setGlobalBuildMode, subscribeBuildMode, hydrateBuildModeFromCloud } from '@/lib/build-mode-store';
import { isUserLocked, initUserCredits, checkAndRenewCredits, formatBalance, formatResetDate, FREE_PLAN_CREDITS } from '@/lib/credits';

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

// ── Real image logos for model selector — mix-blend-mode:screen removes black bg ──
const StandardLogoHome = () => (
  <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/0e46ff93c_image.png" alt="Standard" style={{ width: 14, height: 14, objectFit: 'contain', mixBlendMode: 'screen' }} />
);
const MaxLogoHome = () => (
  <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/0ef7df817_image.png" alt="Max" style={{ width: 14, height: 14, objectFit: 'contain', mixBlendMode: 'screen' }} />
);

// ── Build mode dropdown — opens DOWNWARD ──
function BuildModeMenu({ mode, setMode, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
        background: '#1E1E1E', border: '1px solid #333', borderRadius: 12,
        padding: '4px', minWidth: 230,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 9999,
      }}
    >
      {/* Automatic — large 2x row */}
      <button
        onClick={() => { setMode('Automatic'); onClose(); }}
        style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          width: '100%', padding: '12px 14px', border: 'none',
          background: mode === 'Automatic' ? 'rgba(255,255,255,0.06)' : 'transparent',
          borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', gap: 8,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = mode === 'Automatic' ? 'rgba(255,255,255,0.06)' : 'transparent'}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Automatic</div>
          <div style={{ fontSize: 11, fontWeight: 400, color: '#555', marginTop: 3 }}>The best AI model is selected for each request.</div>
        </div>
        {mode === 'Automatic' && <Check style={{ width: 13, height: 13, color: '#fff', marginTop: 3, flexShrink: 0 }} />}
      </button>
      <div style={{ height: 1, background: '#2A2A2A', margin: '2px 0' }} />
      {/* Standard — thin with logo */}
      <button
        onClick={() => { setMode('Flash'); onClose(); }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 14px', border: 'none', background: mode === 'Flash' ? 'rgba(255,255,255,0.06)' : 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = mode === 'Flash' ? 'rgba(255,255,255,0.06)' : 'transparent'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StandardLogoHome /><span style={{ fontSize: 13, fontWeight: 500, color: '#ccc' }}>Standard</span>
        </span>
        {mode === 'Flash' && <Check style={{ width: 13, height: 13, color: '#fff' }} />}
      </button>
      {/* Max — thin with logo */}
      <button
        onClick={() => { setMode('Max'); onClose(); }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 14px', border: 'none', background: mode === 'Max' ? 'rgba(255,255,255,0.06)' : 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = mode === 'Max' ? 'rgba(255,255,255,0.06)' : 'transparent'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MaxLogoHome />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#ccc' }}>Max</span>
          <span style={{ fontSize: 10, fontWeight: 700, background: '#8F41FD', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>NEW</span>
        </span>
        {mode === 'Max' && <Check style={{ width: 13, height: 13, color: '#fff' }} />}
      </button>
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
  const [buildMode, setBuildModeLocal] = useState(() => getBuildMode());
  const buildMenuRef = useRef(null);

  const setBuildMode = (mode) => {
    setBuildModeLocal(mode);
    setGlobalBuildMode(mode);
  };

  const handleSend = (q) => {
    const query = q || input;
    if (!query.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const quizResults = JSON.parse(localStorage.getItem('stensor_quiz_results') || 'null');
    if (quizResults) {
      base44.auth.me().then((u) => {
        if (u && !u.quiz_answers) base44.auth.updateMe({ quiz_answers: quizResults });
        localStorage.removeItem('stensor_quiz_results');
      }).catch(() => localStorage.removeItem('stensor_quiz_results'));
    }
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) { localStorage.removeItem(PENDING_KEY); navigate(`/chat?q=${encodeURIComponent(pending)}`); return; }

    base44.auth.me().then(async u => {
      if (u) {
        await initUserCredits(u);
        const updated = await checkAndRenewCredits(u);
        setUser(updated);
      }
    }).catch(() => {});
    hydrateBuildModeFromCloud().then(() => setBuildModeLocal(getBuildMode()));

    if (shouldShowUserOnboarding()) setTimeout(() => setShowUserOnboarding(true), 800);
    else if (shouldShowTensorsOnboarding()) setTimeout(() => setShowOnboarding(true), 1200);

    // Load real projects from cloud (always fresh — no local-only fallback)
    loadDiscussionsFromCloud().then(discs => {
      setProjects(discs.slice(0, 8));
    }).catch(() => {});

    // Re-fetch when user returns from chat (visibility change)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadDiscussionsFromCloud().then(discs => setProjects(discs.slice(0, 8))).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Sync with global store
  useEffect(() => {
    const unsub = subscribeBuildMode(m => setBuildModeLocal(m));
    return unsub;
  }, []);

  // Alt+P shortcut for build mode
  useEffect(() => {
    const h = (e) => {
      if (e.altKey && e.key === 'p') {
        const next = buildMode === 'Flash' ? 'Max' : 'Flash';
        setBuildMode(next);
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
        radial-gradient(ellipse 80% 50% at 50% 120%, rgba(255,140,0,0.55) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 140%, rgba(249,87,56,0.45) 0%, transparent 55%),
        radial-gradient(ellipse 40% 30% at 20% 130%, rgba(255,200,0,0.3) 0%, transparent 50%),
        #1F1F1F
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

        {/* Main title */}
        <h1 style={{
          fontSize: 'clamp(26px, 3.5vw, 42px)',
          fontWeight: 500,
          color: '#fff',
          textAlign: 'center',
          margin: '0 0 32px',
          letterSpacing: '-0.02em',
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
            <div style={{ display: 'flex', alignItems: 'center', padding: '6px 10px 10px', gap: 4 }}>
              <button style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}>
                <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/be26ef948_image.png" alt="AI Sparkle" style={{ width: 16, height: 16, objectFit: 'contain', mixBlendMode: 'screen' }} />
              </button>
              <div style={{ flex: 1 }} />
              {/* Build mode dropdown */}
              <div ref={buildMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowBuildMenu(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, height: 28, padding: '0 8px', borderRadius: 6, background: 'rgba(255,255,255,0.10)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'background 120ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                >
                  {buildMode === 'Automatic' ? 'Automatic' : buildMode === 'Max' ? 'Max' : 'Standard'} <ChevronDown size={11} />
                </button>
                <AnimatePresence>
                  {showBuildMenu && (
                    <BuildModeMenu
                      mode={buildMode}
                      setMode={setBuildMode}
                      onClose={() => setShowBuildMenu(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
              {/* Mic */}
              <button style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0.6, transition: 'opacity 120ms' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}>
                <Mic size={14} />
              </button>
              {/* Send */}
              <button onClick={() => handleSend()} disabled={!input.trim()}
                style={{ width: 28, height: 28, borderRadius: '50%', background: input.trim() ? '#fff' : 'rgba(255,255,255,0.15)', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}>
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