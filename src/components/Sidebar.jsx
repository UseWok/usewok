import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Search, Layers, Zap, MessageSquare, Star,
  Settings, CreditCard, HelpCircle, X, Check, Ticket,
  Users, Plus, LogOut, User, Palette, BookOpen, ChevronDown,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';
import { getPlansConfig } from '@/lib/plans-config';
import { getLocalDiscussions } from '@/lib/chat-storage';
import { toast } from 'sonner';

export const COLLAPSED_W = 54;
export const EXPANDED_W  = 240;
export const SIDEBAR_MARGIN = 0;

const SIDEBAR_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] };

// ── Section label ──
const SectionLabel = ({ children }) => (
  <p style={{
    fontSize: 11, fontWeight: 600, color: '#B0B0B0',
    textTransform: 'uppercase', letterSpacing: '0.07em',
    padding: '14px 14px 5px', margin: 0, whiteSpace: 'nowrap',
  }}>
    {children}
  </p>
);

// ── Nav item ──
const NavItem = ({ icon: Icon, label, onClick, active, shortcut, expanded, hideWhenCollapsed }) => {
  if (!expanded && hideWhenCollapsed) return null;
  return (
    <button
      onClick={onClick}
      title={!expanded ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        width: '100%', height: 34,
        padding: expanded ? '0 12px' : '0',
        justifyContent: expanded ? 'flex-start' : 'center',
        borderRadius: 8,
        background: active ? '#F0F0EE' : 'transparent',
        border: 'none', cursor: 'pointer',
        transition: 'background 120ms',
        color: active ? '#111' : '#555',
        flexShrink: 0, overflow: 'hidden',
        textAlign: 'left',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F5F5F5'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {Icon ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, flexShrink: 0 }}>
          <Icon style={{ width: 17, height: 17 }} />
        </span>
      ) : (
        expanded ? <span style={{ width: 6, height: 6, borderRadius: 999, background: '#D0D0D0', flexShrink: 0, marginLeft: 8 }} /> : null
      )}
      <span style={{
        fontSize: 13.5, fontWeight: active ? 600 : 450,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        marginLeft: Icon ? 10 : 8,
        opacity: expanded ? 1 : 0,
        maxWidth: expanded ? 160 : 0,
        transition: 'opacity 0.18s ease, max-width 0.18s ease',
        flex: expanded ? 1 : '0 0 0',
      }}>
        {label}
      </span>
      {shortcut && (
        <span style={{
          display: 'flex', gap: 3, flexShrink: 0, marginLeft: 'auto',
          opacity: expanded ? 1 : 0, transition: 'opacity 0.15s ease',
        }}>
          {shortcut.map((k, i) => (
            <kbd key={i} style={{ fontSize: 10, fontFamily: 'monospace', background: '#EDEDED', border: '1px solid #D9D9D9', borderRadius: 4, padding: '1px 5px', color: '#777' }}>{k}</kbd>
          ))}
        </span>
      )}
    </button>
  );
};

// ── Avatar ──
function Avatar({ user, size = 28, forceRed = false }) {
  const initial = user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  const bg = forceRed ? '#E53935' : getUserColor(user);
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: bg, color: '#fff',
      fontSize: size * 0.42, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {initial}
    </div>
  );
}

// ── Workspace dropdown (inside sidebar, no overflow) ──
function WorkspaceMenu({ user, userPlan, workspaces, onSwitchWorkspace, onCreateWorkspace, onClose, creditsUsed, creditsLimit }) {
  const navigate = useNavigate();
  const pct = creditsLimit > 0 ? Math.min(100, Math.round((creditsUsed / creditsLimit) * 100)) : 0;
  const currentWs = workspaces.find(w => w.current) || workspaces[0] || { name: "My Workspace" };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute', top: '100%', left: 4, right: 4,
        background: '#fff', border: '1px solid #E8E8E6', borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 999,
        overflow: 'hidden', marginTop: 4,
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Avatar user={user} size={32} forceRed />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentWs.name}
            </div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>
              {userPlan?.name || 'Free'} · {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => { navigate('/settings'); onClose(); }}
            style={{ flex: 1, padding: '5px 0', fontSize: 12, fontWeight: 500, color: '#444', background: '#F5F5F5', border: '1px solid #E8E8E6', borderRadius: 7, cursor: 'pointer', textAlign: 'left', paddingLeft: 10, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => e.currentTarget.style.background = '#ECECEC'}
            onMouseLeave={e => e.currentTarget.style.background = '#F5F5F5'}
          >
            <Settings style={{ width: 12, height: 12 }} /> Settings
          </button>
          <button
            onClick={() => { toast.info('Invite members coming soon'); onClose(); }}
            style={{ flex: 1, padding: '5px 0', fontSize: 12, fontWeight: 500, color: '#444', background: '#F5F5F5', border: '1px solid #E8E8E6', borderRadius: 7, cursor: 'pointer', textAlign: 'right', paddingRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}
            onMouseEnter={e => e.currentTarget.style.background = '#ECECEC'}
            onMouseLeave={e => e.currentTarget.style.background = '#F5F5F5'}
          >
            <Users style={{ width: 12, height: 12 }} /> Invite
          </button>
        </div>
      </div>

      {/* Credits */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #F5F5F5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: '#888' }}>Credits</span>
          <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>{creditsUsed} / {creditsLimit}</span>
        </div>
        <div style={{ height: 4, background: '#F0F0F0', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct > 80 ? '#EF4444' : '#6366F1', borderRadius: 999, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Workspaces list */}
      <div style={{ padding: '6px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#BBBBBB', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 14px 6px' }}>All Workspaces</div>
        {workspaces.map(ws => (
          <button
            key={ws.id}
            onClick={() => { onSwitchWorkspace(ws.id); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 14px', border: 'none', background: ws.current ? '#F5F5FF' : 'transparent', cursor: 'pointer', fontSize: 13, color: '#333', transition: 'background 100ms', textAlign: 'left' }}
            onMouseEnter={e => { if (!ws.current) e.currentTarget.style.background = '#F7F7F7'; }}
            onMouseLeave={e => { if (!ws.current) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ width: 22, height: 22, borderRadius: 6, background: ws.current ? '#6366F1' : '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: ws.current ? '#fff' : '#777', flexShrink: 0 }}>
              {ws.name?.charAt(0).toUpperCase() || 'W'}
            </div>
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.name}</span>
            {ws.current && <div style={{ width: 6, height: 6, borderRadius: 999, background: '#6366F1', flexShrink: 0 }} />}
          </button>
        ))}
      </div>

      {/* Create workspace */}
      <div style={{ padding: '4px 6px 8px', borderTop: '1px solid #F0F0F0' }}>
        <button
          onClick={() => { onCreateWorkspace(); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#555', borderRadius: 8, transition: 'background 100ms' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Plus style={{ width: 14, height: 14 }} /> Create a workspace
        </button>
      </div>
    </motion.div>
  );
}

// ── Profile dropdown ──
function ProfileMenu({ user, onClose }) {
  const navigate = useNavigate();
  const email = user?.email || '';
  const truncatedEmail = email.length > 18 ? email.slice(0, 18) + '...' : email;

  const links = [
    { icon: User, label: 'Profile', action: () => { navigate('/settings'); onClose(); } },
    { icon: Settings, label: 'Settings', action: () => { navigate('/settings'); onClose(); } },
    { icon: Palette, label: 'Appearance', action: () => { navigate('/settings'); onClose(); } },
    { icon: HelpCircle, label: 'Support', action: () => { navigate('/support'); onClose(); } },
    { icon: BookOpen, label: 'Documentation', action: () => { toast.info('Documentation coming soon'); onClose(); } },
    { icon: Home, label: 'Home', action: () => { navigate('/app'); onClose(); } },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute', bottom: 'calc(100% + 4px)', left: 4, right: 4,
        background: '#fff', border: '1px solid #E8E8E6', borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 999, overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={user} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.full_name || 'User'}
          </div>
          <div style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }} title={email}>
            {truncatedEmail}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ padding: '4px 0' }}>
        {links.map(({ icon: Icon, label, action }) => (
          <button
            key={label} onClick={action}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '7px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#444', transition: 'background 100ms', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon style={{ width: 14, height: 14, color: '#9CA3AF', flexShrink: 0 }} />
            {label}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: '#F0F0F0', margin: '2px 0' }} />

      {/* Log out — NOT red */}
      <div style={{ padding: '4px 0 4px' }}>
        <button
          onClick={async () => { await base44.auth.logout(); window.location.reload(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '7px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#444', transition: 'background 100ms', textAlign: 'left' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut style={{ width: 14, height: 14, color: '#9CA3AF', flexShrink: 0 }} />
          Log out
        </button>
      </div>
    </motion.div>
  );
}

// ── Create Workspace Modal ──
function CreateWorkspaceModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    onCreate(name.trim());
    setName('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: '#fff', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', width: '100%', maxWidth: 400, padding: 24, position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>Create a workspace</h2>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>Organize your projects in a dedicated space.</p>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Workspace name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Marketing Team"
                autoFocus
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #E0E0E0', borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={onClose}
                  style={{ flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 500, color: '#555', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  style={{ flex: 2, padding: '10px 0', fontSize: 14, fontWeight: 600, color: '#fff', background: '#111', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#333'}
                  onMouseLeave={e => e.currentTarget.style.background = '#111'}
                >
                  Create workspace
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Sidebar ──
export default function Sidebar({ expanded, setExpanded, user, userPlan }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const [recents, setRecents] = useState([]);
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('wok_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'My Workspace', current: true }];
  });

  const wsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wsRef.current && !wsRef.current.contains(e.target)) setShowWorkspaceMenu(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const workspacesData = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
    const wsId = workspacesData.find(w => w.current)?.id || 'default';
    setRecents((getLocalDiscussions(wsId) || []).slice(0, 5));
  }, [expanded]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); navigate('/discussions'); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const isFree = !userPlan || userPlan.price_monthly === 0;
  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = user?.credits_limit || userPlan?.credits_limit || 10;
  const currentWs = workspaces.find(w => w.current) || workspaces[0];

  const handleSwitchWorkspace = (wsId) => {
    const updated = workspaces.map(w => ({ ...w, current: w.id === wsId }));
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
  };

  const handleCreateWorkspace = (name) => {
    if (workspaces.length >= 4) { toast.error('Maximum 4 workspaces'); return; }
    const newWs = { id: `ws_${Date.now()}`, name, current: true };
    const updated = workspaces.map(w => ({ ...w, current: false })).concat(newWs);
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    toast.success('Workspace created');
  };

  // Nav click: navigate without closing sidebar
  const nav = (path) => { navigate(path); };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setExpanded(false)}
            className="md:hidden"
            style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,0.15)' }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={SIDEBAR_TRANSITION}
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0,
          zIndex: 40, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          background: '#FFFFFF',
          borderRight: '1px solid #EBEBEB',
          fontFamily: 'Inter, system-ui, sans-serif',
          minWidth: COLLAPSED_W,
        }}
      >
        {/* ── Header ── */}
        <div style={{
          flexShrink: 0, borderBottom: '1px solid #EBEBEB',
          height: 52, display: 'flex', alignItems: 'center',
          padding: expanded ? '0 12px 0 8px' : '0',
          justifyContent: expanded ? 'space-between' : 'center',
          overflow: 'hidden',
        }}>
          {expanded ? (
            <>
              {/* WOK logo — clickable, hover bg */}
              <button
                onClick={() => nav('/app')}
                style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 120ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.01em', lineHeight: 1, fontFamily: "'Barlow Condensed', system-ui, sans-serif", fontStyle: 'italic', userSelect: 'none' }}>
                  WOK
                </span>
              </button>
              {/* Collapse ← */}
              <button
                onClick={() => setExpanded(false)}
                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#C0C0C0', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#555'}
                onMouseLeave={e => e.currentTarget.style.color = '#C0C0C0'}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={() => setExpanded(true)}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#555' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 3v18"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── Workspace row (always visible, triggers dropdown) ── */}
        <div ref={wsRef} style={{ flexShrink: 0, padding: expanded ? '8px 8px 0' : '8px 5px 0', position: 'relative' }}>
          <button
            onClick={() => { if (expanded) setShowWorkspaceMenu(v => !v); else setExpanded(true); }}
            title={!expanded ? currentWs?.name || 'Workspace' : undefined}
            style={{
              display: 'flex', alignItems: 'center',
              gap: expanded ? 8 : 0,
              justifyContent: expanded ? 'flex-start' : 'center',
              width: '100%', padding: expanded ? '6px 8px' : '7px 0',
              borderRadius: 8, border: 'none', background: 'transparent',
              cursor: 'pointer', transition: 'background 120ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar user={user} size={26} forceRed />
            <span style={{
              fontSize: 13, fontWeight: 600, color: '#111', flex: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left',
              opacity: expanded ? 1 : 0, maxWidth: expanded ? 140 : 0,
              transition: 'opacity 0.18s ease, max-width 0.18s ease',
            }}>
              {currentWs?.name || "My Workspace"}
            </span>
            {expanded && <ChevronDown style={{ width: 14, height: 14, color: '#BBBBBB', flexShrink: 0, transform: showWorkspaceMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />}
          </button>

          <AnimatePresence>
            {showWorkspaceMenu && expanded && (
              <WorkspaceMenu
                user={user}
                userPlan={userPlan}
                workspaces={workspaces}
                onSwitchWorkspace={handleSwitchWorkspace}
                onCreateWorkspace={() => setShowCreateWsModal(true)}
                onClose={() => setShowWorkspaceMenu(false)}
                creditsUsed={creditsUsed}
                creditsLimit={creditsLimit}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: '#F0F0F0', margin: expanded ? '8px 12px 4px' : '8px 8px 4px', flexShrink: 0 }} />

        {/* ── Main nav ── */}
        <div style={{ padding: expanded ? '4px 8px 0' : '4px 5px 0', flexShrink: 0 }}>
          <NavItem icon={Home} label="Home" onClick={() => nav('/app')} active={location.pathname === '/app'} expanded={expanded} />
          <NavItem icon={Search} label="Search" onClick={() => nav('/discussions')} shortcut={expanded ? ['⌘', 'K'] : null} expanded={expanded} />
          {/* Discussions hidden when collapsed */}
          <NavItem icon={MessageSquare} label="Discussions" onClick={() => nav('/discussions')} active={location.pathname === '/discussions'} expanded={expanded} hideWhenCollapsed />
        </div>

        {/* ── Projects section ── */}
        <div style={{ padding: expanded ? '0 8px' : '0 5px', flexShrink: 0 }}>
          {expanded && <SectionLabel>Projects</SectionLabel>}
          {!expanded && <div style={{ height: 8 }} />}
          <NavItem icon={Layers} label="All projects" onClick={() => nav('/projects')} active={location.pathname === '/projects'} expanded={expanded} />
          <NavItem icon={Star} label="Starred" onClick={() => nav('/projects')} expanded={expanded} />
        </div>

        {/* ── Recents (expanded only) ── */}
        {expanded && recents.length > 0 && (
          <div style={{ padding: '0 8px', flexShrink: 0 }}>
            <SectionLabel>Recents</SectionLabel>
            {recents.map((d) => (
              <NavItem
                key={d.id} icon={null} label={d.title || 'Untitled'}
                onClick={() => nav(`/chat?conversationId=${d.id}`)}
                active={false} expanded={true}
              />
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* ── Upgrade CTA ── */}
        {expanded && isFree && (
          <div style={{ padding: '0 10px 8px' }}>
            <button
              onClick={() => nav('/pricing')}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 11px', borderRadius: 10, background: '#F7F7F7', border: '1px solid #EBEBEB', cursor: 'pointer', textAlign: 'left', transition: 'background 120ms' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={e => e.currentTarget.style.background = '#F7F7F7'}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap style={{ width: 14, height: 14, color: '#6366F1' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: '#111', margin: 0, lineHeight: 1.3 }}>Upgrade to Pro</p>
                <p style={{ fontSize: 11, color: '#AAAAAA', margin: 0, lineHeight: 1.3 }}>Unlock more features</p>
              </div>
            </button>
          </div>
        )}

        {/* ── Profile footer ── */}
        <div
          ref={profileRef}
          style={{ borderTop: '1px solid #EBEBEB', flexShrink: 0, padding: expanded ? '8px 8px 10px' : '8px 5px 10px', position: 'relative' }}
        >
          <button
            onClick={() => setShowProfileMenu(v => !v)}
            title={!expanded ? 'Profile' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: expanded ? 9 : 0,
              justifyContent: expanded ? 'flex-start' : 'center',
              width: '100%', padding: expanded ? '6px 8px' : '7px 0',
              borderRadius: 8, border: 'none', background: 'transparent',
              cursor: 'pointer', transition: 'background 120ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar user={user} size={28} />
            {expanded && (
              <svg style={{ width: 15, height: 15, color: '#BBBBBB', marginLeft: 'auto', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            )}
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <ProfileMenu user={user} onClose={() => setShowProfileMenu(false)} />
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <CreateWorkspaceModal
        open={showCreateWsModal}
        onClose={() => setShowCreateWsModal(false)}
        onCreate={handleCreateWorkspace}
      />
      <CodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} user={user} />
    </>
  );
}

// ── CodeModal (preserved) ──
function CodeModal({ open, onClose, user }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const activate = async () => {
    setError('');
    if (!code.trim()) return;
    setLoading(true);
    try {
      const results = await base44.entities.AccessCode.filter({ code: code.trim().toUpperCase(), used: false, visible: true });
      if (results.length === 0) {
        const any = await base44.entities.AccessCode.filter({ code: code.trim().toUpperCase() });
        setError(any.length > 0 ? 'This code has already been used.' : 'Invalid code.');
        setLoading(false);
        return;
      }
      const codeRecord = results[0];
      const plans = getPlansConfig();
      const newPlan = plans.find(p => p.id === codeRecord.plan_id);
      if (!newPlan) { setError('Plan not found.'); setLoading(false); return; }
      const durationText = codeRecord.duration_type === 'lifetime' ? 'lifetime access'
        : codeRecord.duration_type === 'day' ? `${codeRecord.duration_value} days`
        : codeRecord.duration_type === 'month' ? `${codeRecord.duration_value} months`
        : `${codeRecord.duration_value} year${codeRecord.duration_value > 1 ? 's' : ''}`;
      await base44.auth.updateMe({
        subscription_plan: newPlan.id,
        credits_limit: newPlan.credits_limit || codeRecord.credits || 10,
        credits_used: 0,
        credits_bonus: codeRecord.credits > 0 ? (user?.credits_bonus || 0) + codeRecord.credits : (user?.credits_bonus || 0),
        billing_cycle: codeRecord.billing || 'monthly',
        subscription_date: new Date().toISOString(),
      });
      await base44.entities.AccessCode.update(codeRecord.id, { used: true, used_by: user?.email, use_count: (codeRecord.use_count || 0) + 1 });
      setSuccess({ planName: newPlan.name, duration: durationText });
      toast.success(`Code activated: ${newPlan.name}`);
    } catch { setError('An error occurred.'); }
    finally { setLoading(false); }
  };

  const handleClose = () => { setCode(''); setSuccess(null); setError(''); onClose(); };
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }} transition={{ duration: 0.2, ease: [0.4,0,0.2,1] }}
              className="relative w-full bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
              style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-foreground">Redeem Code</h2>
                <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-lg transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-6">
                {success ? (
                  <div className="text-center space-y-5">
                    <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[16px] font-semibold text-foreground">Code activated!</p>
                      <p className="text-sm mt-2 text-muted-foreground">Plan <strong className="text-foreground">{success.planName}</strong> — {success.duration}</p>
                    </div>
                    <button onClick={handleClose} className="w-full py-3 text-[14px] font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Close</button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <input value={code} onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setError(''); }}
                        placeholder="EX: LAUNCH-XXXX" maxLength={20} autoFocus onKeyDown={e => { if (e.key === 'Enter') activate(); }}
                        className="w-full px-4 py-3.5 text-[15px] font-mono border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                      <p className="text-[12px] text-muted-foreground mt-2.5">Codes give you access to premium features.</p>
                    </div>
                    <button onClick={activate} disabled={loading || !code.trim()}
                      className="w-full py-3 text-[14px] font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" />
                      ) : <><Zap className="w-4 h-4" />Activate Code</>}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}