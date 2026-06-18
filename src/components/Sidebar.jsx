import { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, X, Check, ChevronDown, LogOut, Settings, HelpCircle, Tag, CreditCard, FileCode2, Layers, Clock, Star, Search, Home, FolderOpen, ChevronRight } from 'lucide-react';
import SearchModal from './SearchModal';
import { base44 } from '@/api/base44Client';
import { getPlansConfig } from '@/lib/plans-config';
import { getLocalDiscussions, loadDiscussionsFromCloud, saveLocalDiscussions } from '@/lib/chat-storage';
import { toast } from 'sonner';
import { useCredits } from '@/hooks/useCredits';

export const COLLAPSED_W = 52;
export const EXPANDED_W = 232;
export const SIDEBAR_MARGIN = 0;

const T = { duration: 0.22, ease: [0.4, 0, 0.2, 1] };

// ─── Avatar ───────────────────────────────────────────────────────
function Avatar({ user, size = 24 }) {
  const ch = user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: '#F95738', color: '#fff',
      fontSize: Math.round(size * 0.44), fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{ch}</div>
  );
}

// ─── Workspace Switcher Dropdown ──────────────────────────────────
function WorkspaceDropdown({ workspaces, currentWs, onSwitch, onCreate, onSettings, onClose, user, userPlan }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const { used, limit, pct, barColor } = useCredits(user);

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.14 }}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
        background: '#fff', border: '1px solid #E5E5E5', borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 999, overflow: 'hidden',
      }}
    >
      {/* Workspace list */}
      <div style={{ padding: '6px 6px 0' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px 6px' }}>Workspaces</p>
        {workspaces.map(ws => (
          <button key={ws.id} onClick={() => { onSwitch(ws.id); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 8px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 22, height: 22, borderRadius: 5, background: ws.current ? '#F95738' : '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {ws.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ flex: 1, fontSize: 13, color: ws.current ? '#111' : '#666', fontWeight: ws.current ? 500 : 400 }}>{ws.name}</span>
            {ws.current && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />}
          </button>
        ))}
      </div>

      <div style={{ margin: '6px', padding: '10px 10px 8px', background: '#F8F7F4', borderRadius: 8, border: '1px solid #E5E5E5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#333' }}>Usage</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#333', fontVariantNumeric: 'tabular-nums' }}>{used.toLocaleString()} / {limit.toLocaleString()}</span>
        </div>
        <div style={{ height: 7, background: '#E5E5E5', borderRadius: 999, marginBottom: 5 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#999' }}>0</span>
          <span style={{ fontSize: 10, color: '#999' }}>{limit.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ padding: '4px 6px', borderTop: '1px solid #F0F0F0' }}>
        <button onClick={() => { onSettings(); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 8px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#777', fontFamily: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.color = '#111'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#777'; }}
        >
          <Settings style={{ width: 12, height: 12 }} /> Workspace settings
        </button>
        <button onClick={() => { onCreate(); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 8px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#777', fontFamily: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.color = '#111'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#777'; }}
        >
          <Plus style={{ width: 12, height: 12 }} /> New workspace
        </button>
      </div>
    </motion.div>
  );
}

// ─── Profile Menu ─────────────────────────────────────────────────
function ProfileMenu({ user, onClose, navigate }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const email = user?.email || '';
  const Row = ({ icon: Icon, label, onClick, danger }) => (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: danger ? '#E8184A' : '#666', textAlign: 'left', fontFamily: 'inherit' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.color = danger ? '#E8184A' : '#111'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = danger ? '#E8184A' : '#666'; }}
    >
      <Icon style={{ width: 13, height: 13, flexShrink: 0 }} /> {label}
    </button>
  );

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.13 }}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
        background: '#fff', border: '1px solid #E5E5E5', borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 999, overflow: 'hidden',
      }}
    >
      <div style={{ padding: '12px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 9 }}>
        <Avatar user={user} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'User'}</p>
          <p style={{ fontSize: 10, color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
        </div>
      </div>
      <div style={{ padding: '4px 0' }}>
        <Row icon={Settings} label="Account settings" onClick={() => navigate('/settings')} />
        <Row icon={CreditCard} label="Upgrade your plan" onClick={() => navigate('/pricing')} />
        <Row icon={HelpCircle} label="Support" onClick={() => navigate('/support')} />
      </div>
      <div style={{ height: 1, background: '#F0F0F0' }} />
      <div style={{ padding: '4px 0' }}>
        <Row icon={LogOut} label="Sign out" danger onClick={async () => { await base44.auth.logout(); window.location.reload(); }} />
      </div>
    </motion.div>
  );
}

// ─── Create Workspace Modal ────────────────────────────────────────
function CreateWorkspaceModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const submit = () => {
    if (name.trim().length < 2) { toast.error('Minimum 2 characters'); return; }
    onCreate(name.trim()); setName(''); onClose();
  };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={onClose} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 14, padding: '28px 24px', width: '100%', maxWidth: 380, position: 'relative' }}
            >
              <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#555' }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>New workspace</h2>
              <p style={{ fontSize: 12, color: '#888', margin: '0 0 20px' }}>Isolated environment — zero credits, zero builds.</p>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
                placeholder="e.g. Acme Corp"
                style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid #D1D1D1', background: '#F8F7F4', color: '#111', borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 16, fontFamily: 'Inter, sans-serif' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onClose} style={{ flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 500, color: '#555', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                <button onClick={submit} style={{ flex: 2, padding: '9px 0', fontSize: 13, fontWeight: 600, color: '#fff', background: '#F95738', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create</button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Code Activation Modal ─────────────────────────────────────────
function CodeModal({ open, onClose, user }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const activate = async () => {
    setError(''); if (!code.trim()) return; setLoading(true);
    try {
      const results = await base44.entities.AccessCode.filter({ code: code.trim().toUpperCase(), used: false, visible: true });
      if (results.length === 0) {
        const any = await base44.entities.AccessCode.filter({ code: code.trim().toUpperCase() });
        setError(any.length > 0 ? 'This code has already been used.' : 'Invalid code.'); setLoading(false); return;
      }
      const codeRecord = results[0];
      const plans = getPlansConfig();
      const newPlan = plans.find(p => p.id === codeRecord.plan_id);
      if (!newPlan) { setError('Plan not found.'); setLoading(false); return; }
      await base44.auth.updateMe({ subscription_plan: newPlan.id, credits_limit: newPlan.credits_limit || codeRecord.credits || 10, credits_used: 0 });
      await base44.entities.AccessCode.update(codeRecord.id, { used: true, used_by: user?.email, use_count: (codeRecord.use_count || 0) + 1 });
      setSuccess({ planName: newPlan.name });
      toast.success(`Code activated: ${newPlan.name}`);
    } catch { setError('An error occurred.'); } finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 14, padding: 24, width: '100%', maxWidth: 400, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>Activate a code</h2>
        {success ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#1A2A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Check style={{ width: 22, height: 22, color: '#4ade80' }} />
            </div>
            <p style={{ color: '#fff', fontWeight: 500, marginBottom: 8, fontSize: 13 }}>Plan activated: {success.planName}</p>
            <button onClick={() => { setSuccess(null); onClose(); }} style={{ padding: '8px 20px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Done</button>
          </div>
        ) : (
          <>
            <input value={code} onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')); setError(''); }}
              placeholder="LAUNCH-XXXX" maxLength={20} autoFocus onKeyDown={e => e.key === 'Enter' && activate()}
              style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid #D1D1D1', background: '#F8F7F4', color: '#111', borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 8, fontFamily: 'monospace', letterSpacing: '0.06em' }} />
            {error && <p style={{ color: '#E8184A', fontSize: 12, marginBottom: 8 }}>{error}</p>}
            <button onClick={activate} disabled={loading || !code.trim()}
              style={{ width: '100%', padding: '9px 0', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, opacity: loading || !code.trim() ? 0.45 : 1 }}>
              {loading ? 'Activating…' : 'Activate'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, onClick, active, expanded, shortcut, indent = false }) {
  return (
    <button onClick={onClick} title={!expanded ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        width: '100%', height: 32,
        padding: indent ? '0 10px 0 28px' : '0 10px',
        justifyContent: 'flex-start',
        borderRadius: 6, border: 'none', cursor: 'pointer',
        background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
        color: active ? '#111' : '#444',
        transition: 'background 100ms',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {Icon && <Icon style={{ width: 14, height: 14, flexShrink: 0, strokeWidth: 1.7, color: 'inherit' }} />}
      <span style={{
        fontSize: 12.5, fontWeight: active ? 500 : 400,
        marginLeft: 9, flex: 1, textAlign: 'left',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        letterSpacing: '-0.01em',
        opacity: expanded ? 1 : 0,
        transition: 'opacity 80ms',
        pointerEvents: expanded ? 'auto' : 'none',
      }}>
        {label}
      </span>
      {expanded && shortcut && (
        <span style={{ display: 'flex', gap: 2 }}>
          {shortcut.map((k, i) => (
            <kbd key={i} style={{ fontSize: 9.5, fontFamily: 'monospace', background: '#F0F0F0', border: '1px solid #D5D5D5', borderRadius: 4, padding: '1px 4px', color: '#888', fontWeight: 500 }}>{k}</kbd>
          ))}
        </span>
      )}
    </button>
  );
}

// ─── Sidebar Credits Bar ──────────────────────────────────────────
function SidebarCreditsBar({ user, onUpgrade }) {
  const { used, limit, pct, barColor, isLow } = useCredits(user);
  const formatK = n => n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
  return (
    <div style={{ margin: '4px 8px 6px', padding: '10px 10px 8px', background: '#F5F3EF', borderRadius: 8, border: '1px solid #E5E5E5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Consumption</span>
        {isLow && (
          <button onClick={onUpgrade} style={{ fontSize: 9, fontWeight: 700, color: '#F95738', background: 'rgba(249,87,56,0.12)', border: '1px solid rgba(249,87,56,0.25)', borderRadius: 4, padding: '1px 5px', cursor: 'pointer' }}>Upgrade</button>
        )}
      </div>
      <div style={{ height: 5, background: '#E0DDD8', borderRadius: 999, marginBottom: 5 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 10, color: '#555', fontVariantNumeric: 'tabular-nums' }}>
        {formatK(used)} / {formatK(limit)} used
      </span>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────
function SectionLabel({ label, expanded }) {
  if (!expanded) return <div style={{ height: 16 }} />;
  return (
    <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(0,0,0,0.35)', margin: '10px 10px 4px', letterSpacing: '0.07em', textTransform: 'uppercase', userSelect: 'none' }}>
      {label}
    </p>
  );
}

// ─── Divider ──────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: '#E8E5E0', margin: '6px 0' }} />;
}

// ─── Main Sidebar ─────────────────────────────────────────────────
export default function Sidebar({ expanded, setExpanded, user, userPlan }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWsMenu, setShowWsMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [recents, setRecents] = useState([]);
  const [recentsOpen, setRecentsOpen] = useState(true);
  const [starredOpen, setStarredOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wok_workspaces')) || [{ id: 'default', name: "My Workspace", current: true }]; }
    catch { return [{ id: 'default', name: "My Workspace", current: true }]; }
  });

  const wsRef = useRef(null);
  const profileRef = useRef(null);
  const currentWs = workspaces.find(w => w.current) || workspaces[0] || { name: 'Workspace' };
  // Load recents
  useEffect(() => {
    loadDiscussionsFromCloud().then(discs => {
      if (discs.length > 0) {
        setRecents(discs.slice(0, 5));
        const wsId = JSON.parse(localStorage.getItem('wok_workspaces') || '[{}]').find(w => w.current)?.id || 'default';
        saveLocalDiscussions(wsId, discs);
      } else {
        const wsId = JSON.parse(localStorage.getItem('wok_workspaces') || '[{}]').find(w => w.current)?.id || 'default';
        setRecents((getLocalDiscussions(wsId) || []).slice(0, 5));
      }
    }).catch(() => {
      const wsId = JSON.parse(localStorage.getItem('wok_workspaces') || '[{}]').find(w => w.current)?.id || 'default';
      setRecents((getLocalDiscussions(wsId) || []).slice(0, 5));
    });
  }, [expanded]);

  // Ctrl+K
  useEffect(() => {
    const h = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const handleSwitchWorkspace = id => {
    const updated = workspaces.map(w => ({ ...w, current: w.id === id }));
    setWorkspaces(updated); localStorage.setItem('wok_workspaces', JSON.stringify(updated));
  };
  const handleCreateWorkspace = name => {
    if (workspaces.length >= 4) { toast.error('Max 4 workspaces'); return; }
    const nw = { id: `ws_${Date.now()}`, name, current: true };
    const updated = workspaces.map(w => ({ ...w, current: false })).concat(nw);
    setWorkspaces(updated); localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    toast.success('Workspace created');
  };

  const isActive = path => location.pathname === path;
  const nav = path => navigate(path);

  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {expanded && isMobile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }} onClick={() => setExpanded(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }} />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isMobile
          ? { x: expanded ? 0 : -EXPANDED_W, width: EXPANDED_W }
          : { width: expanded ? EXPANDED_W : COLLAPSED_W }
        }
        transition={T}
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 40,
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          background: '#F8F7F4',
          borderRight: '1px solid #E0DDD8',
          fontFamily: 'Inter, system-ui, sans-serif',
          minWidth: isMobile ? EXPANDED_W : COLLAPSED_W,
        }}
      >
        {/* ── Logo / Toggle ── */}
        <div style={{ height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: expanded ? 'space-between' : 'center', padding: expanded ? '0 12px 0 14px' : '0', borderBottom: '1px solid #E0DDD8' }}>
          {expanded ? (
            <>
              <button onClick={() => nav('/app')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 38, height: 'auto', objectFit: 'contain', filter: 'invert(1)' }} />
              </button>
              <button onClick={() => setExpanded(false)} title="Collapse"
                style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', color: '#888', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EDEAE5'; e.currentTarget.style.color = '#333'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
                </svg>
              </button>
            </>
          ) : (
            <button onClick={() => setExpanded(true)} title="Expand"
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#EDEAE5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 30, height: 'auto', objectFit: 'contain', filter: 'invert(1)' }} />
            </button>
          )}
        </div>

        {/* ── Workspace Selector ── */}
        <div ref={wsRef} style={{ padding: expanded ? '8px 8px 4px' : '8px 6px 4px', flexShrink: 0, position: 'relative' }}>
          <button
            onClick={() => { if (expanded) { setShowWsMenu(v => !v); } else setExpanded(true); }}
            title={!expanded ? currentWs.name : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', height: 34,
              padding: expanded ? '0 8px' : '0',
              justifyContent: expanded ? 'flex-start' : 'center',
              borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EDEAE5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 22, height: 22, borderRadius: 5, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {currentWs.name?.charAt(0).toUpperCase() || 'W'}
            </div>
            {expanded && (
              <>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', letterSpacing: '-0.01em' }}>
                  {currentWs.name}
                </span>
                <ChevronDown style={{ width: 12, height: 12, color: '#999', flexShrink: 0, transform: showWsMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </>
            )}
          </button>
          <AnimatePresence>
            {showWsMenu && expanded && (
              <WorkspaceDropdown
                workspaces={workspaces} currentWs={currentWs}
                onSwitch={handleSwitchWorkspace}
                onCreate={() => setShowCreateWs(true)}
                onSettings={() => nav('/workspace-settings')}
                onClose={() => setShowWsMenu(false)}
                user={user} userPlan={userPlan}

              />
            )}
          </AnimatePresence>
        </div>

        <Divider />

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', padding: expanded ? '0 8px' : '0 6px' }}>

          {/* Main nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
            <NavItem icon={Home} label="Home" onClick={() => nav('/app')} active={isActive('/app')} expanded={expanded} />
            <NavItem icon={Search} label="Search" onClick={() => setShowSearch(true)} expanded={expanded} shortcut={['⌘', 'K']} />
          </div>

          <Divider />

          {/* Builds */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
            <SectionLabel label="Builds" expanded={expanded} />
            <NavItem icon={Layers} label="All builds" onClick={() => nav('/projects')} active={isActive('/projects')} expanded={expanded} />

            {/* Starred — collapsible */}
            {expanded ? (
              <>
                <button
                  onClick={() => setStarredOpen(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', height: 32, padding: '0 10px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#444', fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Star style={{ width: 14, height: 14, flexShrink: 0, strokeWidth: 1.7, color: '#666' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 400, flex: 1, textAlign: 'left', letterSpacing: '-0.01em', color: '#444' }}>Starred</span>
                  <ChevronRight style={{ width: 12, height: 12, flexShrink: 0, transition: 'transform 0.15s', transform: starredOpen ? 'rotate(90deg)' : 'none' }} />
                </button>
                <AnimatePresence initial={false}>
                  {starredOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '2px 0 4px 20px' }}>
                        <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', margin: '4px 10px', fontStyle: 'italic' }}>No starred builds yet</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <NavItem icon={Star} label="Starred" onClick={() => nav('/projects')} expanded={false} />
            )}

            {/* Recent — collapsible */}
            {expanded ? (
              <>
                <button
                  onClick={() => setRecentsOpen(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', height: 32, padding: '0 10px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#444', fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Clock style={{ width: 14, height: 14, flexShrink: 0, strokeWidth: 1.7, color: '#666' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 400, flex: 1, textAlign: 'left', letterSpacing: '-0.01em', color: '#444' }}>Recent</span>
                  <ChevronRight style={{ width: 12, height: 12, flexShrink: 0, transition: 'transform 0.15s', transform: recentsOpen ? 'rotate(90deg)' : 'none' }} />
                </button>
                <AnimatePresence initial={false}>
                  {recentsOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '2px 0 4px' }}>
                        {recents.length > 0 ? recents.map(d => (
                          <button key={d.id} onClick={() => nav(`/chat?conversationId=${d.id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', height: 28, padding: '0 10px 0 28px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <FileCode2 style={{ width: 11, height: 11, color: 'rgba(0,0,0,0.35)', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'left' }}>
                              {d.title || 'Untitled'}
                            </span>
                          </button>
                        )) : (
                          <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', margin: '4px 10px 4px 28px', fontStyle: 'italic' }}>No recent builds</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <NavItem icon={Clock} label="Recent" onClick={() => nav('/projects')} expanded={false} />
            )}
          </div>



          <div style={{ flex: 1 }} />

          {/* Bottom utility links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0, paddingBottom: 4 }}>
            <Divider />
            {/* ── Consumption bar (expanded only) ── */}
            {expanded && user && user.role !== 'admin' && <SidebarCreditsBar user={user} onUpgrade={() => nav('/pricing')} />}
            <NavItem icon={CreditCard} label="Upgrade your plan" onClick={() => nav('/pricing')} active={isActive('/pricing')} expanded={expanded} />
            <NavItem icon={Settings} label="Settings" onClick={() => nav('/settings')} active={isActive('/settings')} expanded={expanded} />
            <NavItem icon={HelpCircle} label="Support" onClick={() => nav('/support')} active={isActive('/support')} expanded={expanded} />
          </div>
        </div>

        {/* ── Footer / Profile ── */}
        <div style={{ flexShrink: 0, borderTop: '1px solid #E0DDD8', padding: expanded ? '8px 8px 10px' : '8px 6px 10px', position: 'relative' }} ref={profileRef}>
          <button onClick={() => setShowProfileMenu(v => !v)} title={!expanded ? user?.email || 'Profile' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', height: 34,
              padding: expanded ? '0 8px' : '0',
              justifyContent: expanded ? 'flex-start' : 'center',
              borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EDEAE5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar user={user} size={24} />
            {expanded && (
              <span style={{ fontSize: 12.5, fontWeight: 500, color: '#111', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                {user?.full_name || user?.email?.split('@')[0] || 'Account'}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showProfileMenu && (
              <ProfileMenu user={user} onClose={() => setShowProfileMenu(false)} navigate={navigate} />
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <CreateWorkspaceModal open={showCreateWs} onClose={() => setShowCreateWs(false)} onCreate={handleCreateWorkspace} />
      <CodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} user={user} />
      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}