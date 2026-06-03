// ChatHeader — top bar matching the Lovable-style design
// Left: history, toggle-chat, Preview/Code tabs, page-icon, edit-title, more
// Center: device icon, slash
// Right: fullscreen, refresh, comment, avatar+Share, Upgrade, Publish

import { useState } from 'react';
import {
  RotateCcw, Maximize2, RefreshCw, MonitorSmartphone,
  MoreHorizontal, FileText, Globe, ChevronDown, Pencil, Check, X
} from 'lucide-react';
import { getUserColor } from '@/lib/user-color';

// Icon helpers
const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
  </svg>
);

const SidebarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18"/>
  </svg>
);

const DeviceIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
  </svg>
);

const ZapIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

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

  const initial = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A';
  const avatarBg = getUserColor ? getUserColor(user) : '#7C3AED';

  const btnBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'transparent', cursor: 'pointer',
    borderRadius: 6, transition: 'background 120ms', flexShrink: 0,
    color: '#555',
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

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
      height: 44,
      background: '#FFFFFF',
      borderBottom: '1px solid #E8E8E6',
      display: 'flex', alignItems: 'center',
      gap: 4,
      padding: '0 10px',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
    }}>

      {/* ── Left group ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        {/* History */}
        {iconBtn(undefined, <HistoryIcon />, 'History')}

        {/* Toggle chat (sidebar icon — hides chat, expands preview) */}
        {iconBtn(() => setChatVisible(v => !v), <SidebarIcon />, chatVisible ? 'Hide chat' : 'Show chat')}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: '#E8E8E6', margin: '0 4px', flexShrink: 0 }} />

      {/* Preview / Code tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 1, background: '#F4F4F4', borderRadius: 8, padding: '3px', flexShrink: 0 }}>
        <button
          onClick={() => setViewMode('preview')}
          style={{
            ...btnBase,
            height: 26, padding: '0 10px',
            background: viewMode === 'preview' ? '#fff' : 'transparent',
            boxShadow: viewMode === 'preview' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            borderRadius: 6,
            fontSize: 13, fontWeight: 600,
            color: viewMode === 'preview' ? '#111' : '#888',
            gap: 5,
          }}
          onMouseEnter={e => { if (viewMode !== 'preview') e.currentTarget.style.background = '#EAEAEA'; }}
          onMouseLeave={e => { if (viewMode !== 'preview') e.currentTarget.style.background = 'transparent'; }}
        >
          <Globe style={{ width: 13, height: 13, color: viewMode === 'preview' ? '#4F46E5' : '#888' }} />
          Preview
        </button>
        <button
          onClick={() => setViewMode('code')}
          style={{
            ...btnBase,
            width: 28, height: 26,
            background: viewMode === 'code' ? '#fff' : 'transparent',
            boxShadow: viewMode === 'code' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            borderRadius: 6,
          }}
          onMouseEnter={e => { if (viewMode !== 'code') e.currentTarget.style.background = '#EAEAEA'; }}
          onMouseLeave={e => { if (viewMode !== 'code') e.currentTarget.style.background = 'transparent'; }}
        >
          <FileText style={{ width: 13, height: 13, color: viewMode === 'code' ? '#111' : '#888' }} />
        </button>
        {iconBtn(undefined, <MoreHorizontal style={{ width: 14, height: 14 }} />, 'More')}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: '#E8E8E6', margin: '0 4px', flexShrink: 0 }} />

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
        {/* Device icon */}
        <DeviceIcon />
        <span style={{ color: '#D0D0CE', fontSize: 14, flexShrink: 0 }}>/</span>

        {editingTitle ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
              style={{ fontSize: 13, fontWeight: 500, color: '#111', border: '1px solid #4F46E5', borderRadius: 5, padding: '2px 6px', outline: 'none', width: 160, fontFamily: 'inherit' }}
            />
            <button onClick={confirmTitle} style={{ ...btnBase, width: 22, height: 22, color: '#16A34A' }}><Check style={{ width: 12, height: 12 }} /></button>
            <button onClick={() => setEditingTitle(false)} style={{ ...btnBase, width: 22, height: 22, color: '#888' }}><X style={{ width: 12, height: 12 }} /></button>
          </div>
        ) : (
          <button
            onClick={() => { setTitleDraft(appTitle || 'My App'); setEditingTitle(true); }}
            style={{ ...btnBase, height: 26, padding: '0 6px', gap: 4, fontSize: 13, fontWeight: 500, color: '#333' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {appTitle || 'My App'}
            <Pencil style={{ width: 11, height: 11, color: '#AAAAAA' }} />
          </button>
        )}
      </div>

      {/* ── Right group ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Fullscreen */}
        {iconBtn(undefined, <Maximize2 style={{ width: 14, height: 14 }} />, 'Fullscreen')}
        {/* Refresh */}
        {iconBtn(onRefresh, <RefreshCw style={{ width: 14, height: 14 }} />, 'Refresh preview')}

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: '#E8E8E6', margin: '0 2px', flexShrink: 0 }} />

        {/* Avatar + Share */}
        <button
          style={{
            ...btnBase,
            height: 30, padding: '0 10px 0 5px',
            gap: 6,
            background: 'transparent',
            borderRadius: 8,
            fontSize: 13, fontWeight: 600, color: '#333',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 999,
            background: avatarBg, color: '#fff',
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>{initial}</div>
          Share
        </button>

        {/* Upgrade */}
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            height: 30, padding: '0 12px',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            transition: 'opacity 120ms', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <ZapIcon />
          Upgrade
        </button>

        {/* Publish */}
        <button
          onClick={onPublish}
          style={{
            display: 'flex', alignItems: 'center',
            height: 30, padding: '0 14px',
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