import { useState, useRef, useEffect } from 'react';
import {
  Globe, MoreHorizontal, RefreshCw,
  BarChart2, Settings2, Check, X,
  ChevronDown, ArrowLeft, Star, FolderOpen, Info, Zap, HelpCircle,
  Pencil, GitFork, Eye, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PricingPage from '@/pages/PricingPage';

// ── Icons ──
const HistoryIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
  </svg>
);

const SidebarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18"/>
  </svg>
);

const DeviceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
  </svg>
);

const ZapIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

// ── Upgrade Modal (fullscreen, 95%, black backdrop) ──
function UpgradeModal({ open, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
            style={{
              width: '95vw', height: '95vh',
              background: '#fff', borderRadius: 16,
              overflow: 'hidden', position: 'relative',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Close inside modal */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 14, right: 14, zIndex: 10,
                width: 32, height: 32, borderRadius: '50%',
                background: '#F4F4F4', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X style={{ width: 15, height: 15, color: '#333' }} />
            </button>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <PricingPage />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Rename Modal ──
function RenameModal({ open, onClose, currentTitle, onRename }) {
  const [val, setVal] = useState(currentTitle || '');
  useEffect(() => { if (open) setVal(currentTitle || ''); }, [open, currentTitle]);

  const confirm = () => {
    if (val.trim()) { onRename(val.trim()); onClose(); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999998,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.14 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 14,
              padding: '24px 24px 20px',
              width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 4px 0' }}>Rename project</h3>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px 0' }}>Choose a new name for your project.</p>
            <input
              autoFocus
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') onClose(); }}
              style={{
                width: '100%', padding: '9px 12px', fontSize: 13,
                border: '1.5px solid #2563EB', borderRadius: 8,
                outline: 'none', fontFamily: 'Inter, sans-serif',
                boxSizing: 'border-box', color: '#111',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '9px 0', border: '1px solid #E0E0E0', borderRadius: 8,
                background: '#fff', fontSize: 13, fontWeight: 500, color: '#555', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={confirm} style={{
                flex: 1, padding: '9px 0', border: 'none', borderRadius: 8,
                background: '#2563EB', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
              }}>Rename</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Project menu (triggered by app title button) ──
function ProjectMenu({ onClose, appTitle, onRename, onPublish, user }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  const itemStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '8px 14px', border: 'none',
    background: 'transparent', cursor: 'pointer',
    fontSize: 13, color: '#111', fontFamily: 'Inter, sans-serif', textAlign: 'left',
    borderRadius: 0,
  };

  const sectionItems = [
    { icon: ArrowLeft, label: 'Go to Dashboard', action: () => { window.location.href = '/app'; onClose(); } },
  ];

  const projectItems = [
    { icon: Pencil, label: 'Rename project', action: () => { onRename(); onClose(); } },
    { icon: Star, label: 'Star project', action: onClose },
    { icon: FolderOpen, label: 'Move to folder', action: onClose },
    { icon: Info, label: 'Details', action: onClose },
  ];

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', left: 0,
      background: '#fff', border: '1px solid #E0E0DE',
      borderRadius: 12, overflow: 'hidden', minWidth: 240,
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 99999,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Go to Dashboard */}
      <div style={{ borderBottom: '1px solid #F0F0EE' }}>
        {sectionItems.map(({ icon: Icon, label, action }) => (
          <button key={label} onClick={action} style={itemStyle}
            onMouseEnter={e => e.currentTarget.style.background = '#F7F7F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon style={{ width: 14, height: 14, color: '#888' }} /> {label}
          </button>
        ))}
      </div>

      {/* Credits / user section */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #F0F0EE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: '#E85425', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{userInitial}</div>
          <span style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>{user?.full_name || 'My Project'}</span>
          <span style={{ fontSize: 11, color: '#888', background: '#F0F0EE', borderRadius: 4, padding: '2px 6px', marginLeft: 'auto' }}>FREE</span>
        </div>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 500 }}>Credits</span>
          <span style={{ color: '#888' }}>reset Jul 1</span>
        </div>
        <div style={{ height: 6, background: '#EEE', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ width: '80%', height: '100%', background: '#2563EB', borderRadius: 999 }} />
        </div>
      </div>

      {/* Project actions */}
      <div style={{ borderBottom: '1px solid #F0F0EE' }}>
        {projectItems.map(({ icon: Icon, label, action }) => (
          <button key={label} onClick={action} style={itemStyle}
            onMouseEnter={e => e.currentTarget.style.background = '#F7F7F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon style={{ width: 14, height: 14, color: '#888' }} /> {label}
          </button>
        ))}
      </div>

      {/* Publish + Edit — blue buttons */}
      <div style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
        <button onClick={() => { onPublish(); onClose(); }} style={{
          flex: 1, padding: '8px 0', border: 'none', borderRadius: 8,
          background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Publish</button>
        <button onClick={onClose} style={{
          flex: 1, padding: '8px 0', border: '1.5px solid #2563EB', borderRadius: 8,
          background: '#fff', color: '#2563EB', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Edit</button>
      </div>

      {/* Bottom: Appearance + Help */}
      <div style={{ borderTop: '1px solid #F0F0EE' }}>
        <button style={{ ...itemStyle, justifyContent: 'space-between' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F7F7F5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14 }}>◑</span> Appearance
          </span>
          <span style={{ color: '#AAA', fontSize: 12 }}>›</span>
        </button>
        <button style={{ ...itemStyle, justifyContent: 'space-between' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F7F7F5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HelpCircle style={{ width: 14, height: 14, color: '#888' }} /> Help
          </span>
          <span style={{ color: '#AAA', fontSize: 12 }}>↗</span>
        </button>
      </div>
    </div>
  );
}

// ── Analytics dropdown ──
function MoreMenu({ onClose, setViewMode }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const items = [
    { icon: BarChart2, label: 'Analytics',  action: () => { setViewMode('analytics'); onClose(); } },
    { icon: Settings2, label: 'Settings',   action: () => { setViewMode('dashboard'); onClose(); } },
  ];

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0,
      background: '#fff', border: '1px solid #E8E8E6', borderRadius: 10,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 99999,
      padding: '4px', minWidth: 160,
    }}>
      {items.map(({ icon: Icon, label, action }) => (
        <button key={label} onClick={action} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '7px 10px', background: 'transparent', border: 'none',
          borderRadius: 7, cursor: 'pointer', fontSize: 13, color: '#333',
          fontFamily: 'Inter, sans-serif', textAlign: 'left',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon style={{ width: 14, height: 14, color: '#666' }} />
          {label}
        </button>
      ))}
    </div>
  );
}

const TABS = [
  { id: 'preview',   icon: Globe,          label: 'Preview',   iconColor: '#4F46E5' },
  { id: 'analytics', icon: BarChart2,       label: 'Analytics', iconColor: '#555' },
  { id: 'more',      icon: MoreHorizontal,  label: 'More',      iconColor: '#555' },
];

export default function ChatHeader({
  user,
  chatVisible,
  setChatVisible,
  viewMode,
  setViewMode,
  onPublish,
  onRefresh,
  appTitle,
  onTitleChange,
  mobilePreview,
  setMobilePreview,
}) {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const projectBtnRef = useRef(null);

  const btnBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'transparent', cursor: 'pointer',
    borderRadius: 6, transition: 'background 120ms', flexShrink: 0,
    color: '#555', fontFamily: 'Inter, sans-serif',
  };

  const iconBtn = (onClick, children, title) => (
    <button title={title} onClick={onClick}
      style={{ ...btnBase, width: 28, height: 28 }}
      onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {children}
    </button>
  );

  const activeTab = viewMode === 'analytics' ? 'analytics' : viewMode === 'preview' ? 'preview' : 'more';

  return (
    <>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
        height: 44,
        background: '#F2EFE9',
        borderBottom: 'none',
        display: 'flex', alignItems: 'center',
        gap: 4,
        padding: '0 10px',
        fontFamily: 'Inter, system-ui, sans-serif',
        userSelect: 'none',
      }}>

        {/* ── Left: history + sidebar toggle ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {iconBtn(undefined, <HistoryIcon />, 'History')}
          {iconBtn(() => setChatVisible(v => !v), <SidebarIcon />, chatVisible ? 'Hide chat' : 'Show chat')}
        </div>

        <div style={{ width: 1, height: 18, background: '#E0E0DE', margin: '0 3px', flexShrink: 0 }} />

        {/* ── Tab pill group ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 1,
          background: '#E8E4DE', borderRadius: 9, padding: 3, flexShrink: 0,
        }}>
          {TABS.map(({ id, icon: Icon, label, iconColor }) => {
            const isActive = activeTab === id;
            const isMore = id === 'more';
            return (
              <div key={id} style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    if (isMore) { setShowMore(v => !v); }
                    else { setViewMode(id); setShowMore(false); }
                  }}
                  style={{
                    ...btnBase,
                    height: 27,
                    padding: isActive ? '0 10px' : '0 7px',
                    gap: 5,
                    background: isActive ? '#fff' : 'transparent',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.09)' : 'none',
                    borderRadius: 7,
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#111' : '#777',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#DDD9D3'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon style={{ width: 13, height: 13, color: isActive ? iconColor : '#888' }} />
                  {isActive && !isMore && <span>{label}</span>}
                </button>
                {isMore && showMore && (
                  <MoreMenu onClose={() => setShowMore(false)} setViewMode={setViewMode} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ width: 1, height: 18, background: '#E0E0DE', margin: '0 3px', flexShrink: 0 }} />

        {/* ── Project title button (triggers project menu) ── */}
        <div ref={projectBtnRef} style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0, position: 'relative' }}>
          <DeviceIcon />
          <span style={{ color: '#CCCCCA', fontSize: 14, flexShrink: 0 }}>/</span>
          <button
            onClick={() => setShowProjectMenu(v => !v)}
            style={{ ...btnBase, height: 26, padding: '0 6px', gap: 4, fontSize: 13, fontWeight: 500, color: '#333', maxWidth: 200 }}
            onMouseEnter={e => e.currentTarget.style.background = '#E8E4DE'}
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
              user={user}
            />
          )}
        </div>

        {/* ── Right group (no Share, no Mobile) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          {iconBtn(onRefresh, <RefreshCw style={{ width: 14, height: 14 }} />, 'Refresh')}

          <div style={{ width: 1, height: 18, background: '#E0E0DE', margin: '0 3px', flexShrink: 0 }} />

          {/* Upgrade */}
          <button
            onClick={() => setShowUpgrade(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              height: 29, padding: '0 12px',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              transition: 'opacity 120ms', flexShrink: 0,
              boxShadow: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <ZapIcon /> Upgrade
          </button>

          {/* Publish — blue */}
          <button onClick={onPublish} style={{
            display: 'flex', alignItems: 'center',
            height: 29, padding: '0 14px',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            background: '#2563EB', color: '#fff',
            fontSize: 13, fontWeight: 600,
            transition: 'background 120ms', flexShrink: 0,
            boxShadow: 'none',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
          >
            Publish
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <RenameModal
        open={showRename}
        onClose={() => setShowRename(false)}
        currentTitle={appTitle}
        onRename={(t) => { if (onTitleChange) onTitleChange(t); }}
      />
    </>
  );
}