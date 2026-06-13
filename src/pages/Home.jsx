import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Star, MoreHorizontal, Pencil, Trash2, X, Check } from 'lucide-react';
import HomeInputWrapper from '../components/home/HomeInputWrapper';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';
import { loadDiscussionsFromCloud, saveLocalDiscussions } from '@/lib/chat-storage';
import { getBuildMode, setBuildMode as setGlobalBuildMode, subscribeBuildMode, hydrateBuildModeFromCloud } from '@/lib/build-mode-store';
import { isUserLocked, initUserCredits, checkAndRenewCredits } from '@/lib/credits';

const PENDING_KEY = 'stensor_pending_query';

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

function timeAgo(dateStr) {
  if (!dateStr) return 'Edited recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ── Kebab Menu ──
function KebabMenu({ convId, title, onRename, onDelete, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.1 }}
      style={{
        position: 'absolute', bottom: 'calc(100% + 4px)', right: 0,
        background: '#1E1E1E', border: '1px solid #333', borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)', zIndex: 100, minWidth: 140, overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onRename}
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ccc', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Pencil size={12} /> Rename
      </button>
      <button onClick={onDelete}
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#E8184A', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Trash2 size={12} /> Delete
      </button>
    </motion.div>
  );
}

// ── Rename Modal ──
function RenameModal({ title, onConfirm, onClose }) {
  const [val, setVal] = useState(title || '');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}
        style={{ background: '#1E1E1E', border: '1px solid #333', borderRadius: 12, padding: 24, width: 360, position: 'relative' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 14px' }}>Rename build</h3>
        <input value={val} onChange={e => setVal(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && onConfirm(val)}
          style={{ width: '100%', padding: '9px 12px', background: '#2A2A2A', border: '1px solid #444', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#2A2A2A', border: '1px solid #444', borderRadius: 8, color: '#ccc', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={() => onConfirm(val)} style={{ padding: '8px 16px', background: '#F95738', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Save</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Static preview placeholder (no iframe = no lag) ──
const PREVIEW_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #1a0a0a 0%, #2d1515 50%, #4a1942 100%)',
  'linear-gradient(135deg, #0a1a0a 0%, #152d15 50%, #1a4a19 100%)',
  'linear-gradient(135deg, #1a1500 0%, #2d2800 50%, #4a3f00 100%)',
  'linear-gradient(135deg, #0a0a1a 0%, #15152d 50%, #1a194a 100%)',
  'linear-gradient(135deg, #1a0a14 0%, #2d1520 50%, #4a1930 100%)',
];
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return Math.abs(h); }
function PreviewPlaceholder({ title, id, thumbnailUrl }) {
  const idx = hashStr(id || title || '') % PREVIEW_GRADIENTS.length;
  const initials = (title || '?').slice(0, 2).toUpperCase();

  if (thumbnailUrl) {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img src={thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: PREVIEW_GRADIENTS[idx], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>
        {initials}
      </div>
      <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ height: 3, width: 48, background: 'rgba(255,255,255,0.12)', borderRadius: 99 }} />
        <div style={{ height: 3, width: 32, background: 'rgba(255,255,255,0.07)', borderRadius: 99 }} />
      </div>
    </div>
  );
}

// ── Project Card ──
function ProjectCard({ conv, onClick, onDelete, onRename }) {
  const [hovered, setHovered] = useState(false);
  const [showKebab, setShowKebab] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowKebab(false);
    if (!confirm('Delete this build permanently?')) return;
    try {
      const results = await base44.entities.Conversation.filter({ conv_id: conv.conv_id || conv.id });
      if (results.length > 0) await base44.entities.Conversation.delete(results[0].id);
    } catch {}
    onDelete(conv.id);
  };

  const handleRename = async (newTitle) => {
    setShowRename(false);
    if (!newTitle?.trim()) return;
    try {
      const results = await base44.entities.Conversation.filter({ conv_id: conv.conv_id || conv.id });
      if (results.length > 0) await base44.entities.Conversation.update(results[0].id, { title: newTitle.trim() });
    } catch {}
    onRename(conv.id, newTitle.trim());
  };

  return (
    <>
      {showRename && <RenameModal title={conv.title} onConfirm={handleRename} onClose={() => setShowRename(false)} />}
      <div
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); }}
        onClick={onClick}
      >
        {/* Top: 16:9 preview rectangle */}
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#141414', borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <PreviewPlaceholder title={conv.title} id={conv.id} thumbnailUrl={conv.thumbnail_url} />
          </div>
          {/* Star icon — top right, always rendered, opacity toggles (zero layout shift) */}
          <button
            onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 6, background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', opacity: hovered ? 1 : 0, transition: 'opacity 120ms', pointerEvents: hovered ? 'auto' : 'none' }}
          >
            <Star size={12} color="#fff" />
          </button>
        </div>

        {/* Bottom: title + meta — detached, no background */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, position: 'relative' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 400, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
              {conv.title || 'Untitled build'}
            </p>
            <p style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0', lineHeight: 1 }}>
              {timeAgo(conv.updatedAt || conv.updated_date)}
            </p>
          </div>
          {/* Kebab — always rendered, opacity toggles (zero layout shift) */}
          <div style={{ position: 'relative', flexShrink: 0, width: 24, height: 24 }}>
            <button
              onClick={e => { e.stopPropagation(); setShowKebab(v => !v); }}
              style={{ width: 24, height: 24, borderRadius: 5, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 120ms', pointerEvents: hovered ? 'auto' : 'none' }}
            >
              <MoreHorizontal size={13} color="#fff" />
            </button>
            <AnimatePresence>
              {showKebab && (
                <KebabMenu
                  convId={conv.id}
                  title={conv.title}
                  onRename={() => { setShowKebab(false); setShowRename(true); }}
                  onDelete={handleDelete}
                  onClose={() => setShowKebab(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [projectTab, setProjectTab] = useState('My builds');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserOnboarding, setShowUserOnboarding] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [buildMode, setBuildModeLocal] = useState(() => getBuildMode());
  const [homeFiles, setHomeFiles] = useState([]);

  const setBuildMode = (mode) => { setBuildModeLocal(mode); setGlobalBuildMode(mode); };
  const handleSend = (q) => { const query = q || input; if (!query.trim()) return; navigate(`/chat?q=${encodeURIComponent(query)}`); };

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
      if (u) { await initUserCredits(u); const updated = await checkAndRenewCredits(u); setUser(updated); }
    }).catch(() => {});
    hydrateBuildModeFromCloud().then(() => setBuildModeLocal(getBuildMode()));

    if (shouldShowUserOnboarding()) setTimeout(() => setShowUserOnboarding(true), 800);
    else if (shouldShowTensorsOnboarding()) setTimeout(() => setShowOnboarding(true), 1200);

    loadDiscussionsFromCloud().then(discs => { setProjects(discs.slice(0, 12)); setProjectsLoading(false); }).catch(() => setProjectsLoading(false));

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadDiscussionsFromCloud().then(discs => setProjects(discs.slice(0, 12))).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  useEffect(() => { const unsub = subscribeBuildMode(m => setBuildModeLocal(m)); return unsub; }, []);

  useEffect(() => {
    const h = (e) => { if (e.altKey && e.key === 'p') { const next = buildMode === 'Flash' ? 'Max' : 'Flash'; setBuildMode(next); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [buildMode]);

  const handleDeleteProject = (id) => setProjects(prev => prev.filter(p => p.id !== id));
  const handleRenameProject = (id, newTitle) => setProjects(prev => prev.map(p => p.id === id ? { ...p, title: newTitle } : p));

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const TABS = ['My builds', 'Recently viewed'];

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#1F1F1F',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif', overflowY: 'auto',
    }}>
      {/* ── Grain texture overlay ── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '160px 160px',
        opacity: 0.045,
        mixBlendMode: 'overlay',
      }} />

      {showUserOnboarding && <UserOnboarding onClose={() => setShowUserOnboarding(false)} />}
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}

      {/* ── Hero section ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px 60px', minHeight: '65vh', position: 'relative', zIndex: 1 }}>
        {/* Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 8px', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, marginBottom: 28, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <GumroadLogo />
            <div style={{ marginLeft: -6 }}><BeehiivLogo /></div>
            <div style={{ marginLeft: -6 }}><StripeLogo /></div>
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Sell via your favorite tools</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>→</span>
        </div>

        {/* Main title */}
        <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 500, color: '#fff', textAlign: 'center', margin: '0 0 32px', letterSpacing: '-0.02em', lineHeight: 1.18 }}>
          What should we build, {firstName}?
        </h1>

        {/* Chat input bar — HomeInputWrapper adds file attach at top-left of textarea */}
        <div style={{ width: '100%', maxWidth: 640, position: 'relative' }}>
          <HomeInputWrapper
            input={input}
            setInput={setInput}
            onSend={(q) => handleSend(q)}
            buildMode={buildMode}
            files={homeFiles}
            setFiles={setHomeFiles}
          />
        </div>
      </div>

      {/* ── Glow ambiance — fixed, bottom-anchored, never touches chat bar ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '55vh',
        pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(210,72,8,0.62) 0%, rgba(175,55,4,0.40) 35%, rgba(140,42,2,0.18) 65%, transparent 100%)',
      }} />

      {/* ── My Builds section ── */}
      <div style={{
        padding: '0 28px 48px', marginTop: 80, position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setProjectTab(tab)} style={{
                padding: '5px 14px', borderRadius: 999,
                border: projectTab === tab ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                background: projectTab === tab ? 'rgba(255,255,255,0.09)' : 'transparent',
                fontSize: 13, fontWeight: projectTab === tab ? 500 : 400,
                color: projectTab === tab ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer',
              }}>
                {tab}
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/projects')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            All projects <ArrowRight size={12} />
          </button>
        </div>

        {/* 3-col grid — skeleton while loading, real cards or empty state after */}
        {projectsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '28px 24px' }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i}>
                <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', borderRadius: 6, overflow: 'hidden', marginBottom: 10, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'skshimmer 1.4s ease-in-out infinite',
                  }} />
                </div>
                <div style={{ height: 12, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 6, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'skshimmer 1.4s ease-in-out infinite' }} />
                </div>
                <div style={{ height: 10, width: '35%', borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'skshimmer 1.4s ease-in-out 0.1s infinite' }} />
                </div>
              </div>
            ))}
            <style>{`@keyframes skshimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
          </div>
        ) : projects.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '28px 24px' }}>
            {projects.slice(0, 12).map(p => (
              <ProjectCard key={p.id} conv={p}
                onClick={() => navigate(`/chat?conversationId=${p.id}`)}
                onDelete={handleDeleteProject}
                onRename={handleRenameProject}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px 24px' }}>
            {['Start a new project', 'Build a landing page', 'Create a dashboard'].map((title, i) => (
              <div key={i} onClick={() => navigate(`/chat?q=${encodeURIComponent(title)}`)}
                style={{ cursor: 'pointer' }}>
                <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', borderRadius: 6, border: '1px dashed rgba(255,255,255,0.1)', background: 'transparent', marginBottom: 10, transition: 'border-color 140ms' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={14} color="#666" />
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}