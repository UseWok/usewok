import { useState, useRef, useEffect } from 'react';
import {
  Globe, RefreshCw, X,
  ChevronDown, ArrowLeft, Star, HelpCircle,
  Pencil, Smartphone, Monitor,
  Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PricingPage from '@/pages/PricingPage';
import { useCredits } from '@/hooks/useCredits';

function formatNum(n) {
  if (typeof n !== 'number') return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toLocaleString();
}

// ── SVG icons ──
const HistoryIcon = () =>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
  </svg>;

const DiamondIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#000" stroke="none">
    <path d="M12 2L2 9l10 13 10-13z"/>
  </svg>
);

const PanelIcon = () =>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" />
  </svg>;


// ── Upgrade Modal ──
function UpgradeModal({ open, onClose }) {
  useEffect(() => {
    const h = (e) => {if (e.key === 'Escape') onClose();};
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '95vw', height: '95vh', background: '#111', border: '1px solid #2A2A2A', borderRadius: 16, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, width: 30, height: 30, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#2A2A2A'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <X style={{ width: 14, height: 14, color: '#aaa' }} />
        </button>
        <div style={{ flex: 1, overflowY: 'auto' }}><PricingPage /></div>
      </div>
    </div>);

}

// ── Rename Modal ──
function RenameModal({ open, onClose, currentTitle, onRename }) {
  const [val, setVal] = useState(currentTitle || '');
  useEffect(() => {if (open) setVal(currentTitle || '');}, [open, currentTitle]);
  const confirm = () => {if (val.trim()) {onRename(val.trim());onClose();}};
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999998, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, padding: '28px 28px 22px', width: 400 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Rename project</h3>
        <input autoFocus value={val} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {if (e.key === 'Enter') confirm();if (e.key === 'Escape') onClose();}}
        style={{ width: '100%', padding: '11px 14px', fontSize: 14, fontWeight: 500, border: '1px solid #333', borderRadius: 9, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', color: '#fff', background: '#1A1A1A' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #2A2A2A', borderRadius: 9, background: 'transparent', fontSize: 13, fontWeight: 500, color: '#888', cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirm} style={{ flex: 2, padding: '10px 0', border: 'none', borderRadius: 9, background: '#fff', fontSize: 13, fontWeight: 700, color: '#000', cursor: 'pointer' }}>Rename</button>
        </div>
      </div>
    </div>);

}

// ── Project menu ──
function ProjectMenu({ onClose, appTitle, onRename, onOpenSettings, user, onUpgrade }) {
  const ref = useRef(null);
  const [starred, setStarred] = useState(false);
  const { consumed, limit, pct, barColor, isLow } = useCredits(user);

  useEffect(() => {
    const h = (e) => {if (ref.current && !ref.current.contains(e.target)) onClose();};
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || 'W';
  const planName = (user?.subscription_plan || 'free').toUpperCase();

  const row = (icon, label, action, right) =>
  <button key={label} onClick={() => {action?.();onClose();}}
  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ccc', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}
  onMouseEnter={(e) => e.currentTarget.style.background = '#1E1E1E'}
  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>{icon}{label}</span>
      {right && <span style={{ fontSize: 11, color: '#555' }}>{right}</span>}
    </button>;

  const sep = () => <div style={{ height: 1, background: '#2A2A2A', margin: '2px 0' }} />;
  const ic = (I) => <I style={{ width: 13, height: 13, color: '#555' }} />;

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', left: 0,
      background: '#141414', border: '1px solid #2A2A2A',
      borderRadius: 12, overflow: 'hidden', minWidth: 240,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 99999, fontFamily: 'Inter, sans-serif'
    }}>
      {row(ic(ArrowLeft), 'Go to Dashboard', () => window.location.href = '/app')}
      {sep()}
      {/* Live credits section */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{userInitial}</div>
          <span style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{user?.full_name || 'WOK'}</span>
          <span style={{ fontSize: 10, color: '#555', background: '#1E1E1E', borderRadius: 4, padding: '2px 6px', marginLeft: 'auto' }}>{planName}</span>
        </div>
        <div style={{ height: 4, background: '#1E1E1E', borderRadius: 999, overflow: 'hidden', marginBottom: 5 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: isLow ? '#ef4444' : '#444' }}>
            {formatNum(consumed)} / {formatNum(limit)} consumed
          </span>
          <span style={{ fontSize: 11, color: '#333' }}>{Math.round(pct)}%</span>
        </div>
      </div>
      <button onClick={() => {onUpgrade?.();onClose();}}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#7B4FE0', fontFamily: 'Inter, sans-serif' }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#1A1A1A'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#7B4FE0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↑</span>
        Upgrade plan
      </button>
      {sep()}
      {row(<Settings style={{ width: 13, height: 13, color: '#555' }} />, 'Settings', () => onOpenSettings?.())}
      {row(ic(Pencil), 'Rename project', onRename)}
      <button onClick={() => setStarred(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ccc', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#1E1E1E'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <Star style={{ width: 13, height: 13, color: starred ? '#FFFFFF' : '#555', fill: starred ? '#FFFFFF' : 'none', transition: 'color 150ms, fill 150ms' }} />
        <span>{starred ? 'Starred' : 'Star project'}</span>
      </button>
      {sep()}
      <button style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ccc', fontFamily: 'Inter, sans-serif' }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#1E1E1E'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><HelpCircle style={{ width: 13, height: 13, color: '#555' }} /> Help</span>
        <span style={{ color: '#444' }}>↗</span>
      </button>
    </div>);
}



// ── Tab icons ──
const AnalyticsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const LayersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);

const TABS = [
{ id: 'preview', icon: Globe, label: 'Preview' },
{ id: 'analytics', icon: AnalyticsIcon, label: 'Analytics' },
{ id: 'more', icon: LayersIcon, label: 'More' }];


export default function ChatHeader({
  user, chatVisible, setChatVisible, viewMode, setViewMode,
  onPublish, onRefresh, appTitle, onTitleChange,
  mobilePreview, setMobilePreview,
  showHistory, setShowHistory
}) {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const projectAreaRef = useRef(null);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1300);
  };

  const btnBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'rgba(255,255,255,0.07)', cursor: 'pointer',
    borderRadius: 6, transition: 'background 120ms', flexShrink: 0,
    color: '#fff', fontFamily: 'Inter, sans-serif'
  };

  const activeTab = viewMode === 'analytics' ? 'analytics' : viewMode === 'preview' ? 'preview' : viewMode === 'more' ? 'more' : 'preview';
  const HEADER_BG = '#1F1F1F';

  return (
    <>
      {/* Single unified top bar spanning the full chat+preview area */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
        height: 44,
        display: 'flex', alignItems: 'center',
        background: HEADER_BG,
        borderBottom: '1px solid #222',
        backdropFilter: 'blur(12px)',
        fontFamily: 'Inter, system-ui, sans-serif', userSelect: 'none'
      }}>

        {/* ── LEFT: WOK logo + project name ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px 0 12px', flexShrink: 0 }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK"
          style={{ width: 36, height: 'auto', objectFit: 'contain', mixBlendMode: 'screen', flexShrink: 0 }} />
          <div ref={projectAreaRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProjectMenu((v) => !v)}
              style={{ ...btnBase, height: 28, padding: '0 7px', gap: 4, fontSize: 13, fontWeight: 500, color: '#ccc', maxWidth: 180 }}
              onMouseEnter={(e) => {e.currentTarget.style.background = '#2A2A2A';e.currentTarget.style.color = '#fff';}}
              onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent';e.currentTarget.style.color = '#ccc';}}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appTitle || 'My App'}</span>
              <ChevronDown style={{ width: 10, height: 10, color: '#555', flexShrink: 0 }} />
            </button>
            {showProjectMenu &&
            <ProjectMenu
              onClose={() => setShowProjectMenu(false)}
              appTitle={appTitle}
              onRename={() => setShowRename(true)}
              onOpenSettings={() => setViewMode('dashboard')}
              onUpgrade={() => setShowUpgrade(true)}
              user={user} />
            }
          </div>
        </div>

        {/* ── CENTER / PREVIEW controls ── */}
        <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px' }}>

          {/* ── Pill segmented control ── */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#0D0D0D', borderRadius: 999, padding: '3px',
            border: '1px solid #2A2A2A', gap: 1, flexShrink: 0,
          }}>
            {TABS.map(({ id, icon: TabIcon, label }, idx) => {
              const isActive = activeTab === id;
              const isMore = id === 'more';
              const isLast = idx === TABS.length - 1;
              const isFirst = idx === 0;
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <button
                    onClick={() => { setViewMode(id); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: isActive ? 5 : 0,
                      height: 26,
                      padding: isActive ? '0 10px 0 8px' : '0 9px',
                      border: 'none', cursor: 'pointer',
                      borderRadius: 999,
                      background: isActive ? '#2563EB' : 'transparent',
                      color: isActive ? '#fff' : '#555',
                      fontSize: 12, fontWeight: isActive ? 600 : 400,
                      fontFamily: 'Inter, sans-serif',
                      transition: 'background 150ms, color 150ms, padding 150ms',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#aaa'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#555'; }}
                  >
                    <TabIcon style={{ width: 13, height: 13, flexShrink: 0 }} />
                    {isActive && <span>{label}</span>}
                  </button>
                  {/* divider between inactive tabs */}
                  {!isLast && !isActive && activeTab !== TABS[idx + 1]?.id && (
                    <div style={{ width: 1, height: 12, background: '#2A2A2A', flexShrink: 0 }} />
                  )}

                </div>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* Panel toggle — moved here from left */}
          <button
            title={chatVisible ? 'Expand preview' : 'Show chat'}
            onClick={() => setChatVisible((v) => !v)}
            style={{ ...btnBase, width: 26, height: 26 }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
            <PanelIcon />
          </button>

          {/* Refresh — blur overlay while refreshing, no unmount */}
          <div style={{ position: 'relative' }}>
            <button title="Refresh preview" onClick={handleRefresh}
            style={{ ...btnBase, width: 26, height: 26 }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
              <RefreshCw style={{ width: 13, height: 13, animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            title={mobilePreview ? 'Desktop view' : 'Mobile view'}
            onClick={() => setMobilePreview && setMobilePreview((v) => !v)}
            style={{ ...btnBase, width: 26, height: 26, background: mobilePreview ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={(e) => e.currentTarget.style.background = mobilePreview ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}>
            {mobilePreview ? <Monitor style={{ width: 13, height: 13 }} /> : <Smartphone style={{ width: 13, height: 13 }} />}
          </button>

          <div style={{ width: 1, height: 16, background: '#2A2A2A', margin: '0 2px', flexShrink: 0 }} />

          {/* Upgrade */}
          <button
            onClick={() => setShowUpgrade(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 27, padding: '0 12px 0 10px', border: '1px solid rgba(249,130,80,0.35)', borderRadius: 999, cursor: 'pointer',
              background: 'linear-gradient(100deg, #FAF0E8 0%, #FBD5B0 45%, #F97240 100%)',
              color: '#C45000', fontSize: 12, fontWeight: 700, flexShrink: 0,
              boxShadow: 'none',
              transition: 'filter 180ms ease, box-shadow 180ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.04)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,114,64,0.28)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <DiamondIcon />
            Upgrade
          </button>

          {/* Publish — flush right */}
          <button onClick={onPublish} style={{
            display: 'flex', alignItems: 'center', height: 27, padding: '0 14px',
            border: 'none', borderRadius: 7, cursor: 'pointer',
            background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0,
            marginRight: 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2563EB'}>
            Publish
          </button>
          







          
        </div>
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <RenameModal open={showRename} onClose={() => setShowRename(false)} currentTitle={appTitle} onRename={(t) => {if (onTitleChange) onTitleChange(t);}} />
    </>);

}