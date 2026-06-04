import { useState, useRef, useEffect } from 'react';
import {
  Globe, MoreHorizontal, RefreshCw, BarChart2, Settings2, Check, X,
  ChevronDown, ArrowLeft, Star, FolderOpen, Info, HelpCircle,
  Pencil, Smartphone, Monitor, Gift,
  Settings, Share2, GitFork, FileCode,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PricingPage from '@/pages/PricingPage';

// ── Small SVG icons ──
const HistoryIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
  </svg>
);
const SidebarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);

// ── Upgrade Modal: instant open/close, 95%, dimmed backdrop ──
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
        {/* Close — plain X, square on hover */}
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

// ── Rename Modal ──
function RenameModal({ open, onClose, currentTitle, onRename }) {
  const [val, setVal] = useState(currentTitle || '');
  useEffect(() => { if (open) setVal(currentTitle || ''); }, [open, currentTitle]);
  const confirm = () => { if (val.trim()) { onRename(val.trim()); onClose(); } };
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999998,
      background: 'rgba(0,0,0,0.40)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, padding: '24px 24px 20px',
        width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.20)',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 4px 0' }}>Rename project</h3>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px 0' }}>Choose a new name for your project.</p>
        <input
          autoFocus value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') onClose(); }}
          style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: '1.5px solid #2563EB', borderRadius: 8, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', color: '#111' }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px 0', border: '1px solid #E0E0E0', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 500, color: '#555', cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirm} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, background: '#2563EB', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Rename</button>
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
      {/* Dashboard */}
      {row(ic(ArrowLeft), 'Go to Dashboard', () => window.location.href = '/app')}
      {sep()}

      {/* User / credits */}
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

      {/* Get free credits */}
      <button onClick={() => { onUpgrade?.(); onClose(); }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#8F41FD', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => e.currentTarget.style.background = '#F5F3EF'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Gift style={{ width: 14, height: 14, color: '#8F41FD' }} /> Get free credits
      </button>
      {sep()}

      {/* Actions */}
      {row(ic(Settings), 'Settings', null, 'Ctrl.')}
      {row(ic(Share2), 'Connectors', null)}
      {row(ic(GitFork), 'Remix this project', null)}
      {row(ic(FileCode), 'Publish to profile', onPublish)}
      {row(ic(Pencil), 'Rename project', onRename)}
      {row(ic(Star), 'Star project', null)}
      {row(ic(FolderOpen), 'Move to folder', null)}
      {row(ic(Info), 'Details', null)}
      {sep()}

      {/* Appearance / Help */}
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

// ── More dropdown (Analytics / Logs / Settings) ──
function MoreMenu({ onClose, setViewMode }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const items = [
    { icon: BarChart2, label: 'Analytics', action: () => { setViewMode('analytics'); onClose(); } },
    { icon: Settings2, label: 'Logs',      action: () => { setViewMode('logs'); onClose(); } },
    { icon: Settings2, label: 'Settings',  action: () => { setViewMode('dashboard'); onClose(); } },
  ];

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0,
      background: '#fff', border: '1px solid #E4E2DC', borderRadius: 10,
      boxShadow: '0 4px 16px rgba(0,0,0,0.09)', zIndex: 99999, padding: '4px', minWidth: 160,
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
  { id: 'preview',   icon: Globe,         label: 'Preview',   iconColor: '#4F46E5' },
  { id: 'analytics', icon: BarChart2,      label: 'Analytics', iconColor: '#555' },
  { id: 'more',      icon: MoreHorizontal, label: 'More',      iconColor: '#555' },
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
    color: '#555', fontFamily: 'Inter, sans-serif',
  };

  const iconBtn = (onClick, children, title, active) => (
    <button title={title} onClick={onClick}
      style={{ ...btnBase, width: 28, height: 28, background: active ? '#E8E4DC' : 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = '#E8E4DC'}
      onMouseLeave={e => e.currentTarget.style.background = active ? '#E8E4DC' : 'transparent'}
    >
      {children}
    </button>
  );

  const activeTab = viewMode === 'analytics' ? 'analytics' : viewMode === 'preview' ? 'preview' : 'more';

  return (
    <>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
        height: 44, background: '#F5F2EB',
        borderBottom: '1px solid #E8E4DC',
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '0 10px', fontFamily: 'Inter, system-ui, sans-serif', userSelect: 'none',
      }}>

        {/* ── LEFT: Mobile toggle + WOK brand + project title ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          {/* Mobile/Desktop toggle — functional */}
          <button
            title={mobilePreview ? 'Desktop view' : 'Mobile view'}
            onClick={() => setMobilePreview && setMobilePreview(v => !v)}
            style={{ ...btnBase, width: 28, height: 28 }}
            onMouseEnter={e => e.currentTarget.style.background = '#E8E4DC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {mobilePreview
              ? <Monitor style={{ width: 14, height: 14 }} />
              : <Smartphone style={{ width: 14, height: 14 }} />
            }
          </button>
        </div>

        {/* WOK + Project name (triggers project menu) */}
        <div ref={projectAreaRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* WOK logo / initials */}
          <div style={{
            width: 22, height: 22, borderRadius: 5,
            background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px',
          }}>W</div>

          <button
            onClick={() => setShowProjectMenu(v => !v)}
            style={{ ...btnBase, height: 26, padding: '0 6px', gap: 4, fontSize: 13, fontWeight: 500, color: '#333', maxWidth: 180 }}
            onMouseEnter={e => e.currentTarget.style.background = '#E8E4DC'}
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

        <div style={{ width: 1, height: 18, background: '#E0DDD6', margin: '0 3px', flexShrink: 0 }} />

        {/* ── History icon ── */}
        <button
          title={showHistory ? 'Hide history' : 'Show history'}
          onClick={() => setShowHistory && setShowHistory(v => !v)}
          style={{ ...btnBase, width: 28, height: 28, background: showHistory ? '#E0DDD6' : 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = '#E8E4DC'}
          onMouseLeave={e => e.currentTarget.style.background = showHistory ? '#E0DDD6' : 'transparent'}
        >
          <HistoryIcon />
        </button>

        {/* Sidebar toggle */}
        <button
          title={chatVisible ? 'Hide chat' : 'Show chat'}
          onClick={() => setChatVisible(v => !v)}
          style={{ ...btnBase, width: 28, height: 28 }}
          onMouseEnter={e => e.currentTarget.style.background = '#E8E4DC'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <SidebarIcon />
        </button>

        <div style={{ width: 1, height: 18, background: '#E0DDD6', margin: '0 3px', flexShrink: 0 }} />

        {/* ── Tab pill group ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 1,
          background: '#EAE6DF', borderRadius: 9, padding: 3, flexShrink: 0,
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
                    background: isActive ? '#fff' : 'transparent',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    borderRadius: 7, fontSize: 13, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#111' : '#777',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#DDD9D3'; }}
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

        {/* ── Right: Refresh / Upgrade / Publish ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <button title="Refresh" onClick={onRefresh}
            style={{ ...btnBase, width: 28, height: 28 }}
            onMouseEnter={e => e.currentTarget.style.background = '#E8E4DC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
          </button>

          <div style={{ width: 1, height: 18, background: '#E0DDD6', margin: '0 3px', flexShrink: 0 }} />

          {/* Upgrade — #8F41FD */}
          <button onClick={() => setShowUpgrade(true)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            height: 29, padding: '0 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
            background: '#8F41FD', color: '#fff', fontSize: 13, fontWeight: 600,
            boxShadow: 'none', flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <ZapIcon /> Upgrade
          </button>

          {/* Publish — blue */}
          <button onClick={onPublish} style={{
            display: 'flex', alignItems: 'center', height: 29, padding: '0 14px',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600,
            boxShadow: 'none', flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
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