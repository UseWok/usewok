import { useState, useRef, useEffect } from 'react';
import {
  Globe, MoreHorizontal, RefreshCw, BarChart2, Settings2, Check, X,
  ChevronDown, ArrowLeft, Star, FolderOpen, Info, HelpCircle,
  Pencil, Smartphone, Monitor, Gift,
  Settings, Share2, GitFork, FileCode,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PricingPage from '@/pages/PricingPage';

// ── SVG icons ──
const HistoryIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
  </svg>
);
const UpArrowIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7"/>
  </svg>
);

// ── Upgrade Modal ──
function UpgradeModal({ open, onClose }) {
  const [closeHovered, setCloseHovered] = useState(false);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '95vw', height: '95vh',
        background: '#fff', borderRadius: 16,
        overflow: 'hidden', position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        <button
          onClick={onClose}
          onMouseEnter={() => setCloseHovered(true)}
          onMouseLeave={() => setCloseHovered(false)}
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 10,
            width: 30, height: 30,
            borderRadius: closeHovered ? 6 : 0,
            background: closeHovered ? '#111' : 'transparent',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 100ms, border-radius 100ms',
          }}
        >
          <X style={{ width: 14, height: 14, color: closeHovered ? '#fff' : '#555' }} />
        </button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <PricingPage />
        </div>
      </div>
    </div>
  );
}

// ── Rename Modal — bold, impactful design ──
function RenameModal({ open, onClose, currentTitle, onRename }) {
  const [val, setVal] = useState(currentTitle || '');
  useEffect(() => { if (open) setVal(currentTitle || ''); }, [open, currentTitle]);
  const confirm = () => { if (val.trim()) { onRename(val.trim()); onClose(); } };
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999998,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 18, padding: '32px 32px 26px',
        width: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <Pencil style={{ width: 20, height: 20, color: '#fff' }} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>Rename project</h3>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px 0', lineHeight: 1.5 }}>Give your project a clear, memorable name.</p>
        <input
          autoFocus value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') onClose(); }}
          style={{
            width: '100%', padding: '12px 16px', fontSize: 15, fontWeight: 500,
            border: '2px solid #111', borderRadius: 10, outline: 'none',
            fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', color: '#111',
            background: '#FAFAFA',
          }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 0', border: '1.5px solid #E0E0E0', borderRadius: 10,
            background: '#fff', fontSize: 14, fontWeight: 500, color: '#555', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={confirm} style={{
            flex: 2, padding: '11px 0', border: 'none', borderRadius: 10,
            background: '#111', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
            letterSpacing: '-0.1px',
          }}>Rename project</button>
        </div>
      </div>
    </div>
  );
}

// ── Project menu ──
function ProjectMenu({ onClose, appTitle, onRename, onPublish, user, onUpgrade }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'W';

  const row = (icon, label, action, right) => (
    <button key={label} onClick={() => { action?.(); onClose(); }}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#111', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}
      onMouseEnter={e => e.currentTarget.style.background = '#F5F3EF'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>{icon}{label}</span>
      {right && <span style={{ fontSize: 11, color: '#999' }}>{right}</span>}
    </button>
  );

  const sep = () => <div style={{ height: 1, background: '#EDEAE4', margin: '2px 0' }} />;
  const ic = (I) => <I style={{ width: 14, height: 14, color: '#888' }} />;

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', left: 0,
      background: '#fff', border: '1.5px solid #D0CEC9',
      borderRadius: 12, overflow: 'hidden', minWidth: 250,
      boxShadow: 'none', zIndex: 99999, fontFamily: 'Inter, sans-serif',
    }}>
      {row(ic(ArrowLeft), 'Go to Dashboard', () => window.location.href = '/app')}
      {sep()}
      <div style={{ padding: '12px 16px', borderBottom: '1.5px solid #EDEAE4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E85425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{userInitial}</div>
          <span style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>{user?.full_name || 'WOK'}</span>
          <span style={{ fontSize: 11, color: '#777', background: '#EDEAE4', borderRadius: 4, padding: '2px 7px', marginLeft: 'auto', fontWeight: 500 }}>FREE</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>Credits</span>
          <span style={{ fontSize: 12, color: '#888' }}>reset Jul 1 <span style={{ color: '#AAA' }}>›</span></span>
        </div>
        <div style={{ height: 7, background: '#E8E4DC', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ width: '80%', height: '100%', background: '#2563EB', borderRadius: 999 }} />
        </div>
        <span style={{ fontSize: 11, color: '#AAA', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#CCC', display: 'inline-block' }} />Daily credits reset at midnight UTC
        </span>
      </div>
      <button onClick={() => { onUpgrade?.(); onClose(); }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#8F41FD', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => e.currentTarget.style.background = '#F5F3EF'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#8F41FD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <UpArrowIcon />
        </span>
        Upgrade to Creator
      </button>
      {sep()}
      {row(ic(Settings), 'Settings', null, 'Ctrl.')}
      {row(ic(Share2), 'Connectors', null)}
      {row(ic(GitFork), 'Remix this project', null)}
      {row(ic(FileCode), 'Publish to profile', onPublish)}
      {row(ic(Pencil), 'Rename project', onRename)}
      {row(ic(Star), 'Star project', null)}
      {row(ic(FolderOpen), 'Move to folder', null)}
      {row(ic(Info), 'Details', null)}
      {sep()}
      <button style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', width: '100%', padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#111', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => e.currentTarget.style.background = '#F5F3EF'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span>◑</span> Appearance</span>
        <span style={{ color: '#AAA' }}>›</span>
      </button>
      <button style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', width: '100%', padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#111', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => e.currentTarget.style.background = '#F5F3EF'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><HelpCircle style={{ width: 14, height: 14, color: '#888' }} /> Help</span>
        <span style={{ color: '#AAA' }}>↗</span>
      </button>
    </div>
  );
}

// ── More dropdown ──
function MoreMenu({ onClose, setViewMode }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const items = [
    { icon: BarChart2, label: 'Analytics', action: () => { setViewMode('analytics'); onClose(); } },
    { icon: Settings2, label: 'Logs', action: () => { setViewMode('logs'); onClose(); } },
    { icon: Settings2, label: 'Settings', action: () => { setViewMode('dashboard'); onClose(); } },
  ];

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0,
      background: '#fff', border: '1px solid #E4E2DC', borderRadius: 10,
      boxShadow: 'none', zIndex: 99999, padding: '4px', minWidth: 160,
    }}>
      {items.map(({ icon: Icon, label, action }) => (
        <button key={label} onClick={action} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '7px 10px', background: 'transparent', border: 'none',
          borderRadius: 7, cursor: 'pointer', fontSize: 13, color: '#333', fontFamily: 'Inter, sans-serif', textAlign: 'left',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#F5F3EF'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon style={{ width: 14, height: 14, color: '#666' }} />{label}
        </button>
      ))}
    </div>
  );
}

const TABS = [
  { id: 'preview', icon: Globe, label: 'Preview', iconColor: '#F95738' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics', iconColor: '#555' },
  { id: 'more', icon: MoreHorizontal, label: 'More', iconColor: '#555' },
];

export default function ChatHeader({
  user, chatVisible, setChatVisible, viewMode, setViewMode,
  onPublish, onRefresh, appTitle, onTitleChange,
  mobilePreview, setMobilePreview,
  showHistory, setShowHistory,
}) {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const projectAreaRef = useRef(null);

  const btnBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'transparent', cursor: 'pointer',
    borderRadius: 6, transition: 'background 120ms', flexShrink: 0,
    color: '#aaa', fontFamily: 'Inter, sans-serif',
  };

  const activeTab = viewMode === 'analytics' ? 'analytics' : viewMode === 'preview' ? 'preview' : 'more';

  const HEADER_BG = '#181818';
  const BORDER_COLOR = '#2A2A2A';

  return (
    <>
      {/* ── Top bar — split into LEFT (outside preview, in chat column) and RIGHT (inside preview) ── */}
      {/* This bar spans the full width but visually we treat left=chat area, right=preview area */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
        height: 44,
        display: 'flex', alignItems: 'center',
        fontFamily: 'Inter, system-ui, sans-serif', userSelect: 'none',
      }}>

        {/* ── LEFT SECTION: WOK brand + project name + history — outside preview ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 12px 0 14px', height: '100%', flexShrink: 0,
          background: '#181818',
        }}>
          {/* WOK logo */}
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', flexShrink: 0,
          }}>W</div>

          {/* Project name + chevron */}
          <div ref={projectAreaRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProjectMenu(v => !v)}
              style={{ ...btnBase, height: 28, padding: '0 8px', gap: 4, fontSize: 13, fontWeight: 500, color: '#ddd', maxWidth: 200 }}
              onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appTitle || 'My App'}</span>
              <ChevronDown style={{ width: 11, height: 11, color: '#BBBBBB', flexShrink: 0 }} />
            </button>
            {showProjectMenu && (
              <ProjectMenu
                onClose={() => setShowProjectMenu(false)}
                appTitle={appTitle}
                onRename={() => setShowRename(true)}
                onPublish={onPublish}
                onUpgrade={() => setShowUpgrade(true)}
                user={user}
              />
            )}
          </div>

          {/* Vertical separator */}
          <div style={{ width: 1, height: 18, background: '#333', margin: '0 2px', flexShrink: 0 }} />

          {/* History / Versions button — outside preview, to its left */}
          <button
            title={showHistory ? 'Hide versions' : 'Show versions'}
            onClick={() => setShowHistory && setShowHistory(v => !v)}
            style={{ ...btnBase, width: 28, height: 28, background: showHistory ? '#2A2A2A' : 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
            onMouseLeave={e => e.currentTarget.style.background = showHistory ? '#2A2A2A' : 'transparent'}
          >
            <HistoryIcon />
          </button>
        </div>

        {/* ── RIGHT SECTION: Preview header bar ── */}
        <div style={{
          flex: 1, height: '100%',
          background: HEADER_BG,
          borderBottom: 'none',
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '0 10px',
        }}>

          {/* Expand (chat toggle / expand preview) — leftmost inside preview */}
          <button
            title={chatVisible ? 'Expand preview' : 'Show chat'}
            onClick={() => setChatVisible(v => !v)}
            style={{ ...btnBase, width: 28, height: 28 }}
            onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Original sidebar/panel toggle icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18"/>
            </svg>
          </button>

          {/* Tab pill group */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 1,
            background: '#242424', borderRadius: 9, padding: 3, flexShrink: 0, marginLeft: 2,
          }}>
            {TABS.map(({ id, icon: Icon, label, iconColor }) => {
              const isActive = activeTab === id;
              const isMore = id === 'more';
              return (
                <div key={id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => { if (isMore) setShowMore(v => !v); else { setViewMode(id); setShowMore(false); } }}
                    style={{
                      ...btnBase, height: 27,
                      padding: isActive ? '0 10px' : '0 7px', gap: 5,
                      background: isActive ? '#333' : 'transparent',
                      boxShadow: 'none',
                      borderRadius: 7, fontSize: 13, fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#fff' : '#777',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#2A2A2A'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon style={{ width: 13, height: 13, color: isActive ? iconColor : '#888' }} />
                    {isActive && !isMore && <span>{label}</span>}
                  </button>
                  {isMore && showMore && <MoreMenu onClose={() => setShowMore(false)} setViewMode={setViewMode} />}
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* Refresh — right side, before smartphone */}
          <button title="Refresh preview" onClick={onRefresh}
            style={{ ...btnBase, width: 28, height: 28 }}
            onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
          </button>

          {/* Smartphone toggle — immediately right of Refresh */}
          <button
            title={mobilePreview ? 'Desktop view' : 'Mobile view'}
            onClick={() => setMobilePreview && setMobilePreview(v => !v)}
            style={{ ...btnBase, width: 28, height: 28, background: mobilePreview ? '#333' : 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
            onMouseLeave={e => e.currentTarget.style.background = mobilePreview ? '#333' : 'transparent'}
          >
            {mobilePreview ? <Monitor style={{ width: 14, height: 14 }} /> : <Smartphone style={{ width: 14, height: 14 }} />}
          </button>

          <div style={{ width: 1, height: 18, background: '#333', margin: '0 2px', flexShrink: 0 }} />

          {/* Upgrade */}
          <button onClick={() => setShowUpgrade(true)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            height: 29, padding: '0 11px', border: 'none', borderRadius: 8, cursor: 'pointer',
            background: 'transparent', color: '#7B4FE0', fontSize: 13, fontWeight: 600,
            boxShadow: 'none', flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#2a1f44'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#7B4FE0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UpArrowIcon />
            </span>
            Upgrade
          </button>

          {/* Publish */}
          <button onClick={onPublish} style={{
            display: 'flex', alignItems: 'center', height: 29, padding: '0 14px',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            background: '#F95738', color: '#fff', fontSize: 13, fontWeight: 600,
            boxShadow: 'none', flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#e04a2e'}
            onMouseLeave={e => e.currentTarget.style.background = '#F95738'}
          >
            Publish
          </button>
        </div>
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <RenameModal open={showRename} onClose={() => setShowRename(false)} currentTitle={appTitle} onRename={(t) => { if (onTitleChange) onTitleChange(t); }} />
    </>
  );
}