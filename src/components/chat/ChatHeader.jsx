import { useState, useRef, useEffect } from 'react';
import {
  Globe, MoreHorizontal, RefreshCw, BarChart2, Settings2, Check, X,
  ChevronDown, ArrowLeft, Star, HelpCircle,
  Pencil, Smartphone, Monitor,
  Settings, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PricingPage from '@/pages/PricingPage';

// ── SVG icons ──
const HistoryIcon = () =>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
  </svg>;

const UpArrowIcon = () =>
<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>;

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
  useEffect(() => {
    const h = (e) => {if (ref.current && !ref.current.contains(e.target)) onClose();};
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || 'W';

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
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{userInitial}</div>
          <span style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{user?.full_name || 'WOK'}</span>
          <span style={{ fontSize: 10, color: '#555', background: '#1E1E1E', borderRadius: 4, padding: '2px 6px', marginLeft: 'auto' }}>FREE</span>
        </div>
        <div style={{ height: 5, background: '#1E1E1E', borderRadius: 999, overflow: 'hidden', marginBottom: 5 }}>
          <div style={{ width: '80%', height: '100%', background: '#2563EB', borderRadius: 999 }} />
        </div>
        <span style={{ fontSize: 11, color: '#444' }}>Daily credits reset at midnight UTC</span>
      </div>
      <button onClick={() => {onUpgrade?.();onClose();}}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#7B4FE0', fontFamily: 'Inter, sans-serif' }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#1A1A1A'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#7B4FE0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><UpArrowIcon /></span>
        Upgrade to Creator
      </button>
      {sep()}
      {/* Settings — first item, opens full settings modal */}
      {row(<Settings style={{ width: 13, height: 13, color: '#555' }} />, 'Settings', () => onOpenSettings?.())}
      {row(ic(Pencil), 'Rename project', onRename)}
      {/* Star — toggle with solid white fill when active */}
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

// ── More dropdown ──
function MoreMenu({ onClose, setViewMode }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => {if (ref.current && !ref.current.contains(e.target)) onClose();};
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const items = [
  { icon: BarChart2, label: 'Analytics', action: () => {setViewMode('analytics');onClose();} },
  { icon: Settings2, label: 'Logs', action: () => {setViewMode('logs');onClose();} },
  { icon: Settings2, label: 'Settings', action: () => {setViewMode('dashboard');onClose();} }];


  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0,
      background: '#141414', border: '1px solid #2A2A2A', borderRadius: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 99999, padding: '4px', minWidth: 160
    }}>
      {items.map(({ icon: Icon, label, action }) =>
      <button key={label} onClick={action} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '7px 10px', background: 'transparent', border: 'none',
        borderRadius: 7, cursor: 'pointer', fontSize: 13, color: '#ccc', fontFamily: 'Inter, sans-serif', textAlign: 'left'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#1E1E1E'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        
          <Icon style={{ width: 13, height: 13, color: '#555' }} />{label}
        </button>
      )}
    </div>);

}

const TABS = [
{ id: 'preview', icon: Globe, label: 'Preview', iconColor: '#F95738' },
{ id: 'analytics', icon: BarChart2, label: 'Analytics', iconColor: '#888' },
{ id: 'more', icon: MoreHorizontal, label: 'More', iconColor: '#888' }];


export default function ChatHeader({
  user, chatVisible, setChatVisible, viewMode, setViewMode,
  onPublish, onRefresh, appTitle, onTitleChange,
  mobilePreview, setMobilePreview,
  showHistory, setShowHistory
}) {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showMore, setShowMore] = useState(false);
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

  const activeTab = viewMode === 'analytics' ? 'analytics' : viewMode === 'preview' ? 'preview' : 'more';
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
          {/* WOK logo */}
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK"
          style={{ width: 36, height: 'auto', objectFit: 'contain', mixBlendMode: 'screen', flexShrink: 0 }} />

          {/* Project name */}
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

          {/* Tab group — sliding white underline */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            flexShrink: 0, position: 'relative'
          }}>
            {TABS.map(({ id, icon: Icon, label, iconColor }) => {
              const isActive = activeTab === id;
              const isMore = id === 'more';
              return (
                <div key={id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => {if (isMore) setShowMore((v) => !v);else {setViewMode(id);setShowMore(false);}}}
                    style={{
                      ...btnBase, height: 44,
                      padding: '0 11px', gap: 5,
                      background: 'transparent',
                      borderRadius: 0,
                      fontSize: 12, fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#fff' : '#555',
                      borderBottom: isActive ? '2px solid #fff' : '2px solid transparent',
                      transition: 'color 150ms, border-color 150ms'
                    }}
                    onMouseEnter={(e) => {if (!isActive) {e.currentTarget.style.color = '#aaa';}}}
                    onMouseLeave={(e) => {if (!isActive) {e.currentTarget.style.color = '#555';}}}>
                    
                    <Icon style={{ width: 12, height: 12, color: isActive ? iconColor : '#555', transition: 'color 150ms' }} />
                    <span style={{ fontSize: 12 }}>{label}</span>
                  </button>
                  {isMore && showMore && <MoreMenu onClose={() => setShowMore(false)} setViewMode={setViewMode} />}
                </div>);

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
              display: 'flex', alignItems: 'center', gap: 5,
              height: 27, padding: '0 11px', border: 'none', borderRadius: 7, cursor: 'pointer',
              background: 'linear-gradient(135deg, #7B4FE0 0%, #9B6BFF 100%)',
              color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0,
              transform: 'translateY(0px)', boxShadow: 'none',
              transition: 'transform 180ms ease, box-shadow 180ms ease, filter 180ms ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(123,79,224,0.55)'; e.currentTarget.style.filter = 'brightness(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.filter = 'brightness(1)'; }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UpArrowIcon /></span>
            Upgrade
          </button>

          {/* Publish */}
          <button onClick={onPublish} style={{
            display: 'flex', alignItems: 'center', height: 27, padding: '0 12px',
            border: 'none', borderRadius: 7, cursor: 'pointer',
            background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2563EB'}>
            Publish
          </button>

          <div style={{ width: 1, height: 16, background: '#2A2A2A', margin: '0 2px', flexShrink: 0 }} />
          







          
        </div>
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <RenameModal open={showRename} onClose={() => setShowRename(false)} currentTitle={appTitle} onRename={(t) => {if (onTitleChange) onTitleChange(t);}} />
    </>);

}