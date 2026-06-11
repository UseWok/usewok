import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronDown, ArrowRight, Check,
} from 'lucide-react';
import ChatInputBar from '../components/chat/ChatInputBar';
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
  const [buildMode, setBuildModeLocal] = useState(() => getBuildMode());

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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px 60px', minHeight: '65vh' }}>

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

        {/* Chat input bar — shared component from /chat */}
        <div style={{ width: '100%', maxWidth: 640, position: 'relative' }}>
          <ChatInputBar
            input={input}
            setInput={setInput}
            onSend={(q) => handleSend(q)}
            isLoading={false}
            files={[]}
            setFiles={() => {}}
            buildMode={buildMode}
          />
        </div>
      </div>

      {/* ── My Builds section ── */}
      <div style={{ padding: '0 20px 32px', marginTop: 24 }}>
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