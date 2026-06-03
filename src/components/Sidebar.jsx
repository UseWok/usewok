import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Search, Star, Zap, X, Check, Ticket,
  Users, Plus, LogOut, User, Palette, BookOpen,
  ChevronDown, LayoutGrid, Gift, Inbox, Compass,
  Network, UserRound, UsersRound,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';
import { getPlansConfig } from '@/lib/plans-config';
import { getLocalDiscussions, loadDiscussionsFromCloud, saveLocalDiscussions } from '@/lib/chat-storage';
import { toast } from 'sonner';

export const COLLAPSED_W = 54;
export const EXPANDED_W  = 256;
export const SIDEBAR_MARGIN = 0;

const SIDEBAR_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] };

// ── Avatar (circle) ──
function Avatar({ user, size = 28, forceRed = false, square = false }) {
  const initial = user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  const bg = forceRed ? '#C0392B' : '#8B9EB0';
  return (
    <div style={{
      width: size, height: size,
      borderRadius: square ? 8 : 999,
      background: bg, color: '#fff',
      fontSize: size * 0.42, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, letterSpacing: '-0.01em',
    }}>
      {initial}
    </div>
  );
}

// ── Workspace Dropdown Menu ──
function WorkspaceMenu({ user, userPlan, workspaces, onSwitchWorkspace, onCreateWorkspace, onClose, creditsUsed, creditsLimit, onSettings }) {
  const navigate = useNavigate();
  const creditsLeft = Math.max(0, creditsLimit - creditsUsed);
  const pct = creditsLimit > 0 ? Math.min(100, Math.round((creditsUsed / creditsLimit) * 100)) : 0;
  const currentWs = workspaces.find(w => w.current) || workspaces[0] || { name: 'My Workspace' };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
        background: '#fff', border: '1px solid #E8E8E6', borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 999,
        overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #F2F2F2' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
            {currentWs.name?.charAt(0).toUpperCase() || 'W'}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111', lineHeight: 1.3 }}>{currentWs.name}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{userPlan?.name || 'Free'} Plan · 1 member</div>
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { onSettings(); onClose(); }}
            style={{ flex: 1, padding: '7px 10px', fontSize: 13, fontWeight: 500, color: '#333', background: '#F5F5F5', border: '1px solid #E8E8E6', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#ECECEC'}
            onMouseLeave={e => e.currentTarget.style.background = '#F5F5F5'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Settings
          </button>
          <button
            onClick={() => { toast.info('Invite members coming soon'); onClose(); }}
            style={{ flex: 1, padding: '7px 10px', fontSize: 13, fontWeight: 500, color: '#333', background: '#F5F5F5', border: '1px solid #E8E8E6', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#ECECEC'}
            onMouseLeave={e => e.currentTarget.style.background = '#F5F5F5'}
          >
            <UserRound style={{ width: 14, height: 14 }} /> Invite members
          </button>
        </div>
      </div>

      {/* Turn Pro */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #F2F2F2' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F8F8', borderRadius: 10, padding: '10px 12px', border: '1px solid #EBEBEB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap style={{ width: 16, height: 16, color: '#111' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Turn Pro</span>
          </div>
          <button
            onClick={() => { navigate('/pricing'); onClose(); }}
            style={{ padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#2563EB', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'background 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
          >
            Upgrade
          </button>
        </div>
      </div>

      {/* Credits */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F2F2F2' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Credits</span>
          <span style={{ fontSize: 13, color: '#555', cursor: 'pointer' }}>{creditsLeft} left &gt;</span>
        </div>
        <div style={{ height: 8, background: '#E8E8E8', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#2563EB', borderRadius: 999, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: 999, background: '#BBBBBB', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#888' }}>Daily credits reset at midnight UTC</span>
        </div>
      </div>

      {/* All workspaces */}
      <div style={{ padding: '8px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#AAAAAA', padding: '4px 16px 8px' }}>All workspaces</div>
        {workspaces.map(ws => (
          <button
            key={ws.id}
            onClick={() => { onSwitchWorkspace(ws.id); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 100ms', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F7F7F7'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {ws.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ flex: 1, fontSize: 14, color: '#111', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#666', background: '#F0F0F0', borderRadius: 5, padding: '2px 7px', flexShrink: 0 }}>{ws.current ? 'FREE' : 'INACTIVE'}</span>
            {ws.current && <Check style={{ width: 15, height: 15, color: '#666', flexShrink: 0 }} />}
          </button>
        ))}
      </div>

      {/* Create workspace */}
      <div style={{ borderTop: '1px solid #F2F2F2', padding: '4px 0' }}>
        <button
          onClick={() => { onCreateWorkspace(); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#333', fontWeight: 500, transition: 'background 100ms' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F7F7F7'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Plus style={{ width: 16, height: 16 }} /> Create new workspace
        </button>
      </div>
    </motion.div>
  );
}

// ── Profile dropdown ──
function ProfileMenu({ user, onClose, navigate }) {
  const email = user?.email || '';
  const truncatedEmail = email.length > 22 ? email.slice(0, 22) + '…' : email;

  const menuBtn = (IconComp, label, action) => (
    <button key={label} onClick={action}
      style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#333', transition: 'background 100ms', textAlign: 'left', fontFamily: 'inherit' }}
      onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <IconComp style={{ width: 14, height: 14, color: '#888', flexShrink: 0 }} />
      {label}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      style={{
        position: 'absolute', bottom: 'calc(100% + 6px)', left: 4, right: 4,
        background: '#fff', border: '1px solid #E8E8E6', borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 999, overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* User info */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={user} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.full_name || 'User'}
          </div>
          <div style={{ fontSize: 11, color: '#888' }} title={email}>{truncatedEmail}</div>
        </div>
      </div>

      {/* Nav items group 1 */}
      <div style={{ padding: '4px 0' }}>
        {menuBtn(User, 'Profile', () => navigate('/settings'))}
        {menuBtn(Settings2Icon, 'Settings', () => navigate('/settings'))}
        {menuBtn(Palette, 'Appearance', () => navigate('/settings'))}
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: '#F0F0F0' }} />

      {/* Upgrade Plan — above Support */}
      <div style={{ padding: '4px 0' }}>
        <button
          onClick={() => navigate('/pricing')}
          style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#333', transition: 'background 100ms', textAlign: 'left', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {/* Blue circle with white arrow */}
          <span style={{ width: 18, height: 18, borderRadius: 999, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 6L6 10M2 6H10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          Upgrade Plan
        </button>
        {menuBtn(BookOpen, 'Support', () => navigate('/support'))}
        {menuBtn(Compass, 'Documentation', () => toast.info('Coming soon'))}
        {menuBtn(Home, 'Home', () => navigate('/app'))}
      </div>

      <div style={{ height: 1, background: '#F0F0F0' }} />
      <div style={{ padding: '4px 0 4px' }}>
        <button
          onClick={async () => { await base44.auth.logout(); window.location.reload(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#C0392B', transition: 'background 100ms', textAlign: 'left', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut style={{ width: 14, height: 14, color: '#C0392B', flexShrink: 0 }} /> Log out
        </button>
      </div>
    </motion.div>
  );
}

// Settings icon (inline since lucide Settings may conflict)
const Settings2Icon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// dummy ref to avoid unused var warning
const svgSettings = null;

// ── Sidebar Builds Section (Favorites + Recents collapsible) ──
function SidebarBuildsSection({ recents, nav }) {
  const [favorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wok_favorites') || '[]'); } catch { return []; }
  });
  const [recentsOpen, setRecentsOpen] = useState(false);

  const favBuilds = recents.filter(d => favorites.includes(d.id));
  const allBuilds = recents;

  const itemStyle = (active) => ({
    display: 'flex', alignItems: 'center', width: '100%', height: 32,
    padding: '0 10px', borderRadius: 8, border: 'none',
    background: active ? '#F0F0EE' : 'transparent',
    cursor: 'pointer', transition: 'background 120ms', textAlign: 'left',
    fontSize: 13, color: '#333', fontWeight: 400, fontFamily: 'inherit',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  });

  return (
    <div style={{ padding: '8px 8px 0', flexShrink: 0 }}>
      {/* Favorites */}
      <p style={{ fontSize: 12, fontWeight: 500, color: '#AAAAAA', margin: '4px 10px 6px' }}>Favorites</p>
      {favBuilds.length === 0 ? (
        <p style={{ fontSize: 12, color: '#CCCCCC', padding: '0 10px', marginBottom: 6 }}>No favorites yet</p>
      ) : favBuilds.map(d => (
        <button key={d.id} onClick={() => nav(`/chat?conversationId=${d.id}`)}
          style={itemStyle(false)}
          onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Star style={{ width: 12, height: 12, marginRight: 6, color: '#F59E0B', fill: '#F59E0B', flexShrink: 0 }} />
          {d.title || 'Untitled'}
        </button>
      ))}

      {/* Recents — collapsible, closed by default */}
      <button
        onClick={() => setRecentsOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px 4px', marginTop: 6 }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: '#AAAAAA' }}>Recents</span>
        <ChevronDown style={{ width: 12, height: 12, color: '#AAAAAA', transform: recentsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
      </button>
      <AnimatePresence initial={false}>
        {recentsOpen && (
          <motion.div
            key="recents"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {allBuilds.map(d => (
              <button key={d.id} onClick={() => nav(`/chat?conversationId=${d.id}`)}
                style={itemStyle(false)}
                onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {d.title || 'Untitled'}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Create Workspace Modal ──
function CreateWorkspaceModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const handleCreate = () => {
    if (name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    onCreate(name.trim()); setName(''); onClose();
  };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={onClose} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: '#fff', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', width: '100%', maxWidth: 400, padding: 24, position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={onClose}
                style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <X style={{ width: 16, height: 16 }} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>Create a workspace</h2>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>Organize your projects in a dedicated space.</p>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Workspace name *</label>
              <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Marketing Team" autoFocus
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #E0E0E0', borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 16, fontFamily: 'Inter, sans-serif' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onClose} style={{ flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 500, color: '#555', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreate}
                  style={{ flex: 2, padding: '10px 0', fontSize: 14, fontWeight: 600, color: '#fff', background: '#111', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#333'}
                  onMouseLeave={e => e.currentTarget.style.background = '#111'}>
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
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [recents, setRecents] = useState([]);
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('wok_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: "Antoine's Lovable", current: true }];
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
    // Load recents from cloud first, fallback to local cache
    loadDiscussionsFromCloud().then(cloudDiscs => {
      if (cloudDiscs.length > 0) {
        setRecents(cloudDiscs.slice(0, 5));
        const wsData = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
        const wsId = wsData.find(w => w.current)?.id || 'default';
        saveLocalDiscussions(wsId, cloudDiscs);
      } else {
        const wsData = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
        const wsId = wsData.find(w => w.current)?.id || 'default';
        setRecents((getLocalDiscussions(wsId) || []).slice(0, 5));
      }
    }).catch(() => {
      const wsData = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
      const wsId = wsData.find(w => w.current)?.id || 'default';
      setRecents((getLocalDiscussions(wsId) || []).slice(0, 5));
    });
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
    setWorkspaces(updated); localStorage.setItem('wok_workspaces', JSON.stringify(updated));
  };
  const handleCreateWorkspace = (name) => {
    if (workspaces.length >= 4) { toast.error('Maximum 4 workspaces'); return; }
    const newWs = { id: `ws_${Date.now()}`, name, current: true };
    const updated = workspaces.map(w => ({ ...w, current: false })).concat(newWs);
    setWorkspaces(updated); localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    toast.success('Workspace created');
  };

  const nav = (path) => navigate(path);

  // NavItem inline
  const NavItem = ({ icon: Icon, label, onClick, active, shortcut, hideCollapsed }) => {
    if (!expanded && hideCollapsed) return null;
    // Collapsed active: square 34×34, darker background
    const collapsedActiveStyle = !expanded && active ? {
      width: 34, height: 34, borderRadius: 7, background: '#DCDCDA', justifyContent: 'center',
    } : {};
    return (
      <button onClick={onClick} title={!expanded ? label : undefined}
        style={{
          display: 'flex', alignItems: 'center', width: '100%', height: 36,
          padding: expanded ? '0 10px' : '0',
          justifyContent: expanded ? 'flex-start' : 'center',
          borderRadius: 8,
          background: active ? (expanded ? '#F0F0EE' : 'transparent') : 'transparent',
          border: 'none', cursor: 'pointer', transition: 'background 120ms',
          color: active ? '#111' : '#444', flexShrink: 0,
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F5F5F5'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        {Icon && (
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: !expanded && active ? 34 : 22,
            height: !expanded && active ? 34 : 22,
            borderRadius: !expanded && active ? 7 : 0,
            background: !expanded && active ? '#DCDCDA' : 'transparent',
            flexShrink: 0, transition: 'background 120ms, width 120ms, height 120ms',
          }}>
            <Icon style={{ width: 16, height: 16 }} />
          </span>
        )}
        {expanded && (
          <>
            <span style={{ fontSize: 14, fontWeight: active ? 500 : 400, whiteSpace: 'nowrap', marginLeft: Icon ? 10 : 0, flex: 1, textAlign: 'left', color: active ? '#111' : '#333' }}>
              {label}
            </span>
            {shortcut && (
              <span style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                {shortcut.map((k, i) => (
                  <kbd key={i} style={{ fontSize: 10.5, fontFamily: 'monospace', background: '#F0F0F0', border: '1px solid #DCDCDC', borderRadius: 4, padding: '1px 5px', color: '#666', fontWeight: 500 }}>{k}</kbd>
                ))}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={() => setExpanded(false)} className="md:hidden"
            style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,0.15)' }} />
        )}
      </AnimatePresence>

      <motion.aside initial={false} animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={SIDEBAR_TRANSITION}
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 40, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', background: '#FAFAFA',
          borderRight: '1px solid #EBEBEB', fontFamily: 'Inter, system-ui, sans-serif',
          minWidth: COLLAPSED_W,
        }}
      >
        {/* ── Header ── */}
        <div style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: expanded ? '0 14px' : '0', paddingLeft: expanded ? 14 : 0, justifyContent: expanded ? 'space-between' : 'center' }}>
          {expanded ? (
            <>
              {/* Multicolor logo */}
              <button onClick={() => nav('/app')}
                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 8, transition: 'background 120ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4C10 4 6 8 6 14C6 18 8 21 12 23L16 28L20 23C24 21 26 18 26 14C26 8 22 4 16 4Z" fill="url(#grad1)"/>
                  <defs>
                    <linearGradient id="grad1" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FF6B6B"/>
                      <stop offset="50%" stopColor="#FF9A3C"/>
                      <stop offset="100%" stopColor="#A855F7"/>
                    </linearGradient>
                  </defs>
                </svg>
              </button>
              {/* Collapse button */}
              <button onClick={() => setExpanded(false)}
                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#AAAAAA', transition: 'color 120ms, background 120ms' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = '#F0F0F0'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#AAAAAA'; e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
                </svg>
              </button>
            </>
          ) : (
            <button onClick={() => setExpanded(true)}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#555', transition: 'background 120ms' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Workspace selector */}
          <div ref={wsRef} style={{ padding: expanded ? '0 8px 4px' : '0 5px 4px', flexShrink: 0, position: 'relative' }}>
            <button
              onClick={() => { if (expanded) setShowWorkspaceMenu(v => !v); else setExpanded(true); }}
              title={!expanded ? currentWs?.name : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                justifyContent: expanded ? 'flex-start' : 'center',
                width: '100%', padding: expanded ? '7px 8px' : '7px 0',
                borderRadius: 9,
                border: expanded ? '1px solid #E4E4E2' : 'none',
                background: 'transparent',
                cursor: 'pointer', transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Colored avatar */}
              <div style={{ width: 26, height: 26, borderRadius: 7, background: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {currentWs?.name?.charAt(0).toUpperCase() || 'W'}
              </div>
              {expanded && (
                <>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                    {currentWs?.name || 'My Workspace'}
                  </span>
                  <ChevronDown style={{ width: 14, height: 14, color: '#AAAAAA', flexShrink: 0, transform: showWorkspaceMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />
                </>
              )}
            </button>
            {/* Always-visible separator line below workspace */}
            <div style={{ height: 1, background: '#EBEBEB', margin: expanded ? '4px 2px 0' : '4px 6px 0' }} />
            <AnimatePresence>
              {showWorkspaceMenu && expanded && (
                <WorkspaceMenu
                  user={user} userPlan={userPlan} workspaces={workspaces}
                  onSwitchWorkspace={handleSwitchWorkspace}
                  onCreateWorkspace={() => setShowCreateWsModal(true)}
                  onClose={() => setShowWorkspaceMenu(false)}
                  onSettings={() => nav('/workspace-settings')}
                  creditsUsed={creditsUsed} creditsLimit={creditsLimit}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Main nav */}
          <div style={{ padding: expanded ? '2px 8px' : '2px 5px', flexShrink: 0 }}>
            <NavItem icon={Home} label="Home" onClick={() => nav('/app')} active={location.pathname === '/app'} />
            <NavItem icon={Search} label="Search" onClick={() => nav('/discussions')} shortcut={['Ctrl', 'K']} />
            <NavItem icon={Compass} label="Resources" onClick={() => nav('/app')} />
            <NavItem icon={Network} label="Connectors" onClick={() => nav('/app')} />
          </div>

          {/* Projects */}
          <div style={{ padding: expanded ? '8px 8px 0' : '8px 5px 0', flexShrink: 0 }}>
            {expanded && <p style={{ fontSize: 12, fontWeight: 500, color: '#AAAAAA', margin: '4px 10px 6px', letterSpacing: '0.01em' }}>Projects</p>}
            {!expanded && <div style={{ height: 6 }} />}
            <NavItem icon={LayoutGrid} label="All projects" onClick={() => nav('/projects')} active={location.pathname === '/projects'} />
            <NavItem icon={Star} label="Starred" onClick={() => nav('/projects')} />
          </div>

          {/* Favorites + Recents */}
          {expanded && recents.length > 0 && (
            <SidebarBuildsSection recents={recents} nav={nav} />
          )}

          <div style={{ flex: 1 }} />
        </div>

        {/* ── Footer ── */}
        <div style={{ borderTop: '1px solid #EBEBEB', flexShrink: 0, padding: expanded ? '8px 12px 10px' : '8px 5px 10px', position: 'relative' }}
          ref={profileRef}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: expanded ? 'space-between' : 'center' }}>
            <button onClick={() => setShowProfileMenu(v => !v)} title={!expanded ? 'Profile' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '5px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 120ms' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar user={user} size={30} />
            </button>
            {expanded && (
              <button title="Inbox"
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#AAAAAA', transition: 'background 120ms, color 120ms' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0F0F0'; e.currentTarget.style.color = '#555'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#AAAAAA'; }}
              >
                <Inbox style={{ width: 17, height: 17 }} />
              </button>
            )}
          </div>
          <AnimatePresence>
            {showProfileMenu && (
              <ProfileMenu user={user} onClose={() => setShowProfileMenu(false)} navigate={navigate} />
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <CreateWorkspaceModal open={showCreateWsModal} onClose={() => setShowCreateWsModal(false)} onCreate={handleCreateWorkspace} />
      <CodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} user={user} />

      {/* Floating Share Lovable */}
      <motion.div
        initial={false}
        animate={{ left: (expanded ? EXPANDED_W : COLLAPSED_W) + 12, opacity: 1 }}
        transition={SIDEBAR_TRANSITION}
        style={{ position: 'fixed', bottom: 24, zIndex: 50, pointerEvents: 'auto' }}
      >
        <button
          onClick={() => toast.info('Referral program coming soon')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 999,
            background: '#fff', border: '1px solid #E0E0E0',
            cursor: 'pointer', transition: 'background 120ms, box-shadow 120ms',
            fontSize: 13, fontWeight: 600, color: '#111',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontFamily: 'Inter, system-ui, sans-serif',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F8F8F8'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
        >
          <Gift style={{ width: 15, height: 15, color: '#555', flexShrink: 0 }} />
          Share Lovable
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888', background: '#F0F0F0', borderRadius: 5, padding: '2px 6px' }}>100 cr</span>
        </button>
      </motion.div>
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
      const durationText = codeRecord.duration_type === 'lifetime' ? 'lifetime access'
        : codeRecord.duration_type === 'day' ? `${codeRecord.duration_value} days`
        : codeRecord.duration_type === 'month' ? `${codeRecord.duration_value} months`
        : `${codeRecord.duration_value} year${codeRecord.duration_value > 1 ? 's' : ''}`;
      await base44.auth.updateMe({ subscription_plan: newPlan.id, credits_limit: newPlan.credits_limit || codeRecord.credits || 10, credits_used: 0, credits_bonus: codeRecord.credits > 0 ? (user?.credits_bonus || 0) + codeRecord.credits : (user?.credits_bonus || 0), billing_cycle: codeRecord.billing || 'monthly', subscription_date: new Date().toISOString() });
      await base44.entities.AccessCode.update(codeRecord.id, { used: true, used_by: user?.email, use_count: (codeRecord.use_count || 0) + 1 });
      setSuccess({ planName: newPlan.name, duration: durationText });
      toast.success(`Code activated: ${newPlan.name}`);
    } catch { setError('An error occurred.'); } finally { setLoading(false); }
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
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }} transition={{ duration: 0.2, ease: [0.4,0,0.2,1] }}
              className="relative w-full bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
              style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
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