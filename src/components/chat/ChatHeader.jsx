import { useState, useRef, useEffect } from 'react';
import {
  Globe, FileText, MoreHorizontal, RefreshCw, Maximize2,
  BarChart2, Settings2, Search, Pencil, Check, X
} from 'lucide-react';
import { getUserColor } from '@/lib/user-color';

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

// The three tab definitions
const TABS = [
  { id: 'preview', icon: Globe,     label: 'Preview',    iconColor: '#4F46E5' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics',  iconColor: '#555' },
  { id: 'more',    icon: MoreHorizontal, label: 'More',  iconColor: '#555' },
];

// More dropdown menu items
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
    { icon: Search,    label: 'SEO',        action: () => { setViewMode('dashboard'); onClose(); } },
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
          transition: 'background 100ms',
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
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(appTitle || 'My App');
  const [showMore, setShowMore] = useState(false);

  const avatarBg = getUserColor ? getUserColor(user) : '#7C3AED';

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

  const confirmTitle = () => {
    setEditingTitle(false);
    if (titleDraft.trim() && onTitleChange) onTitleChange(titleDraft.trim());
  };

  // active tab id
  const activeTab = viewMode === 'analytics' ? 'analytics' : viewMode === 'preview' ? 'preview' : 'more';

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
      height: 44,
      background: '#FAFAFA',
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

      {/* Divider */}
      <div style={{ width: 1, height: 18, background: '#E0E0DE', margin: '0 3px', flexShrink: 0 }} />

      {/* ── Tab pill group (Preview / Analytics / More) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 1,
        background: '#EFEFED', borderRadius: 9, padding: 3, flexShrink: 0,
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
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#E6E6E4'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon style={{ width: 13, height: 13, color: isActive ? iconColor : '#888' }} />
                {isActive && !isMore && <span>{label}</span>}
                {isMore && <span style={{ fontSize: 13, color: '#777' }}></span>}
              </button>
              {isMore && showMore && (
                <MoreMenu onClose={() => setShowMore(false)} setViewMode={setViewMode} />
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 18, background: '#E0E0DE', margin: '0 3px', flexShrink: 0 }} />

      {/* ── Title (device icon + slash + editable name) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
        <DeviceIcon />
        <span style={{ color: '#CCCCCA', fontSize: 14, flexShrink: 0 }}>/</span>
        {editingTitle ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
              style={{ fontSize: 13, fontWeight: 500, color: '#111', border: '1px solid #4F46E5', borderRadius: 5, padding: '2px 6px', outline: 'none', width: 160, fontFamily: 'inherit', background: '#fff' }}
            />
            <button onClick={confirmTitle} style={{ ...btnBase, width: 22, height: 22, color: '#16A34A' }}><Check style={{ width: 12, height: 12 }} /></button>
            <button onClick={() => setEditingTitle(false)} style={{ ...btnBase, width: 22, height: 22, color: '#888' }}><X style={{ width: 12, height: 12 }} /></button>
          </div>
        ) : (
          <button
            onClick={() => { setTitleDraft(appTitle || 'My App'); setEditingTitle(true); }}
            style={{ ...btnBase, height: 26, padding: '0 6px', gap: 4, fontSize: 13, fontWeight: 500, color: '#333' }}
            onMouseEnter={e => e.currentTarget.style.background = '#EBEBEA'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {appTitle || 'My App'}
            <Pencil style={{ width: 10, height: 10, color: '#BBBBBB' }} />
          </button>
        )}
      </div>

      {/* ── Right group ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        {iconBtn(undefined, <Maximize2 style={{ width: 14, height: 14 }} />, 'Fullscreen')}
        {iconBtn(onRefresh, <RefreshCw style={{ width: 14, height: 14 }} />, 'Refresh')}

        <div style={{ width: 1, height: 18, background: '#E0E0DE', margin: '0 3px', flexShrink: 0 }} />

        {/* Share — no avatar, just text */}
        <button
          style={{
            ...btnBase,
            height: 29, padding: '0 12px',
            fontSize: 13, fontWeight: 600, color: '#333',
            borderRadius: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#EBEBEA'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Share
        </button>

        {/* Upgrade */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 5,
          height: 29, padding: '0 12px',
          border: 'none', borderRadius: 8, cursor: 'pointer',
          background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
          color: '#fff', fontSize: 13, fontWeight: 600,
          transition: 'opacity 120ms', flexShrink: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <ZapIcon /> Upgrade
        </button>

        {/* Publish */}
        <button onClick={onPublish} style={{
          display: 'flex', alignItems: 'center',
          height: 29, padding: '0 14px',
          border: 'none', borderRadius: 8, cursor: 'pointer',
          background: '#111', color: '#fff',
          fontSize: 13, fontWeight: 600,
          transition: 'background 120ms', flexShrink: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#333'}
          onMouseLeave={e => e.currentTarget.style.background = '#111'}
        >
          Publish
        </button>
      </div>
    </div>
  );
}