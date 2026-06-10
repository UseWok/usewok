import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Search, Star, Zap, X, Check, Ticket,
  Users, Plus, LogOut, User, Palette, BookOpen,
  ChevronDown, LayoutGrid, Gift, Inbox, Compass,
  Network, UserRound, UsersRound,
} from 'lucide-react';
import SearchModal from './SearchModal';
import { base44 } from '@/api/base44Client';
import { getPlansConfig } from '@/lib/plans-config';
import { getLocalDiscussions, loadDiscussionsFromCloud, saveLocalDiscussions } from '@/lib/chat-storage';
import { toast } from 'sonner';

export const COLLAPSED_W = 54;
export const EXPANDED_W  = 240;
export const SIDEBAR_MARGIN = 0;

const SIDEBAR_TRANSITION = { duration: 0.26, ease: [0.4, 0, 0.2, 1] };

// ── Avatar ──
function Avatar({ user, size = 28 }) {
  const initial = user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 999,
      background: '#F95738', color: '#fff',
      fontSize: size * 0.42, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, letterSpacing: '-0.01em',
    }}>
      {initial}
    </div>
  );
}

// ── WorkspaceMenu ──
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
        background: '#1E1E1E', border: '1px solid #333', borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 999,
        overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
            {currentWs.name?.charAt(0).toUpperCase() || 'W'}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{currentWs.name}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{userPlan?.name || 'Free'} Plan · 1 member</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { onSettings(); onClose(); }}
            style={{ flex: 1, padding: '7px 10px', fontSize: 13, fontWeight: 500, color: '#ccc', background: '#2A2A2A', border: '1px solid #333', borderRadius: 8, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#333'}
            onMouseLeave={e => e.currentTarget.style.background = '#2A2A2A'}
          >Settings</button>
          <button onClick={() => { toast.info('Invite members coming soon'); onClose(); }}
            style={{ flex: 1, padding: '7px 10px', fontSize: 13, fontWeight: 500, color: '#ccc', background: '#2A2A2A', border: '1px solid #333', borderRadius: 8, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#333'}
            onMouseLeave={e => e.currentTarget.style.background = '#2A2A2A'}
          >Invite</button>
        </div>
      </div>

      <div style={{ padding: '10px 12px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#2A2A2A', borderRadius: 10, padding: '10px 12px', border: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap style={{ width: 16, height: 16, color: '#fff' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Turn Pro</span>
          </div>
          <button onClick={() => { navigate('/pricing'); onClose(); }}
            style={{ padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#F95738', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e04a2e'}
            onMouseLeave={e => e.currentTarget.style.background = '#F95738'}
          >Upgrade</button>
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Credits</span>
          <span style={{ fontSize: 13, color: '#666' }}>{creditsLeft} left</span>
        </div>
        <div style={{ height: 8, background: '#2A2A2A', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#F95738', borderRadius: 999 }} />
        </div>
        <span style={{ fontSize: 12, color: '#555' }}>Daily credits reset at midnight UTC</span>
      </div>

      <div style={{ padding: '8px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#555', padding: '4px 16px 8px' }}>All workspaces</div>
        {workspaces.map(ws => (
          <button key={ws.id} onClick={() => { onSwitchWorkspace(ws.id); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {ws.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ flex: 1, fontSize: 14, color: '#ccc', fontWeight: 500 }}>{ws.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#555', background: '#2A2A2A', borderRadius: 5, padding: '2px 7px' }}>{ws.current ? 'FREE' : 'INACTIVE'}</span>
            {ws.current && <Check style={{ width: 15, height: 15, color: '#666' }} />}
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #2A2A2A', padding: '4px 0' }}>
        <button onClick={() => { onCreateWorkspace(); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#ccc', fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Plus style={{ width: 16, height: 16 }} /> Create new workspace
        </button>
      </div>
    </motion.div>
  );
}

// ── ProfileMenu ──
const Settings2Icon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

function ProfileMenu({ user, onClose, navigate }) {
  const email = user?.email || '';
  const truncated = email.length > 24 ? email.slice(0, 24) + '…' : email;

  const menuBtn = (IconComp, label, action) => (
    <button key={label} onClick={action}
      style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ccc', textAlign: 'left', fontFamily: 'inherit' }}
      onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <IconComp style={{ width: 14, height: 14, color: '#666', flexShrink: 0 }} />
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
        background: '#1E1E1E', border: '1px solid #333', borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 999, overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={user} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.full_name || 'User'}</div>
          <div style={{ fontSize: 11, color: '#666' }}>{truncated}</div>
        </div>
      </div>
      <div style={{ padding: '4px 0' }}>
        {menuBtn(User, 'Profile', () => navigate('/settings'))}
        {menuBtn(Settings2Icon, 'Settings', () => navigate('/settings'))}
        {menuBtn(Palette, 'Appearance', () => navigate('/settings'))}
      </div>
      <div style={{ height: 1, background: '#2A2A2A' }} />
      <div style={{ padding: '4px 0' }}>
        <button onClick={() => navigate('/pricing')}
          style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ccc', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ width: 18, height: 18, borderRadius: 999, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 6L6 10M2 6H10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          Upgrade Plan
        </button>
        {menuBtn(BookOpen, 'Support', () => navigate('/support'))}
        {menuBtn(Compass, 'Documentation', () => toast.info('Coming soon'))}
        {menuBtn(Home, 'Home', () => navigate('/app'))}
      </div>
      <div style={{ height: 1, background: '#2A2A2A' }} />
      <div style={{ padding: '4px 0' }}>
        {menuBtn(LogOut, 'Log out', async () => { await base44.auth.logout(); window.location.reload(); })}
      </div>
    </motion.div>
  );
}

// ── Recents section — max 4 visible, inner scroll only ──
function SidebarBuildsSection({ recents, nav }) {
  const ITEM_H = 30;
  const MAX_VISIBLE = 4;
  const listHeight = Math.min(recents.length, MAX_VISIBLE) * ITEM_H;

  return (
    <div style={{ padding: '6px 8px 0', flexShrink: 0 }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: '#444', margin: '4px 10px 4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Recents</p>
      <div style={{ maxHeight: listHeight, overflowY: recents.length > MAX_VISIBLE ? 'auto' : 'hidden' }}>
        {recents.map(d => (
          <button key={d.id} onClick={() => nav(`/chat?conversationId=${d.id}`)}
            style={{ display: 'flex', alignItems: 'center', width: '100%', height: ITEM_H, padding: '0 9px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {d.title || 'Untitled'}
          </button>
        ))}
      </div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: '#1E1E1E', border: '1px solid #333', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.5)', width: '100%', maxWidth: 400, padding: 24, position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Create a workspace</h2>
              <p style={{ fontSize: 13, color: '#666', margin: '0 0 20px' }}>Organize your projects in a dedicated space.</p>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', display: 'block', marginBottom: 6 }}>Workspace name *</label>
              <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Marketing Team" autoFocus
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #333', background: '#2A2A2A', color: '#fff', borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 16, fontFamily: 'Inter, sans-serif' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onClose} style={{ flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 500, color: '#888', background: '#2A2A2A', border: '1px solid #333', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreate} style={{ flex: 2, padding: '10px 0', fontSize: 14, fontWeight: 600, color: '#fff', background: '#F95738', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create workspace</button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Code Modal ──
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
      <div style={{ background: '#1E1E1E', border: '1px solid #333', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Redeem Code</h2>
        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1A3A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Check style={{ width: 24, height: 24, color: '#4ade80' }} />
            </div>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}>Code activated! Plan: {success.planName}</p>
            <button onClick={() => { setSuccess(null); onClose(); }} style={{ padding: '10px 24px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Close</button>
          </div>
        ) : (
          <>
            <input value={code} onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')); setError(''); }}
              placeholder="LAUNCH-XXXX" maxLength={20} autoFocus onKeyDown={e => e.key === 'Enter' && activate()}
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #333', background: '#2A2A2A', color: '#fff', borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 8, fontFamily: 'monospace' }} />
            {error && <p style={{ color: '#E8184A', fontSize: 13, marginBottom: 8 }}>{error}</p>}
            <button onClick={activate} disabled={loading || !code.trim()}
              style={{ width: '100%', padding: '10px 0', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, opacity: loading || !code.trim() ? 0.5 : 1 }}>
              {loading ? 'Activating...' : 'Activate Code'}
            </button>
          </>
        )}
      </div>
    </div>
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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [recents, setRecents] = useState([]);
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('wok_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: "Antoine's WOK", current: true }];
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
    loadDiscussionsFromCloud().then(cloudDiscs => {
      if (cloudDiscs.length > 0) {
        setRecents(cloudDiscs.slice(0, 6));
        const wsData = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
        const wsId = wsData.find(w => w.current)?.id || 'default';
        saveLocalDiscussions(wsId, cloudDiscs);
      } else {
        const wsData = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
        const wsId = wsData.find(w => w.current)?.id || 'default';
        setRecents((getLocalDiscussions(wsId) || []).slice(0, 6));
      }
    }).catch(() => {
      const wsData = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
      const wsId = wsData.find(w => w.current)?.id || 'default';
      setRecents((getLocalDiscussions(wsId) || []).slice(0, 6));
    });
  }, [expanded]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearchModal(true); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

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

  // NavItem for dark sidebar
  const NavItem = ({ icon: Icon, label, onClick, active, shortcut }) => (
    <div style={{ padding: '1px 4px' }}>
      <button onClick={onClick} title={!expanded ? label : undefined}
        style={{
          display: 'flex', alignItems: 'center', width: '100%', height: 30,
          padding: expanded ? '0 9px' : '0',
          justifyContent: expanded ? 'flex-start' : 'center',
          borderRadius: 7,
          background: active ? 'rgba(255,255,255,0.09)' : 'transparent',
          border: 'none', cursor: 'pointer',
          color: '#fff',
          transition: 'background 120ms',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        {Icon && <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />}
        {expanded && (
          <>
            <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', marginLeft: 9, flex: 1, textAlign: 'left', color: '#fff' }}>
              {label}
            </span>
            {shortcut && (
              <span style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                {shortcut.map((k, i) => (
                  <kbd key={i} style={{ fontSize: 10, fontFamily: 'monospace', background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: 4, padding: '1px 5px', color: '#555', fontWeight: 500 }}>{k}</kbd>
                ))}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={() => setExpanded(false)} className="md:hidden"
            style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,0.3)' }} />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={SIDEBAR_TRANSITION}
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 40, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          background: '#0E0E0E',
          borderRight: '1px solid #1A1A1A',
          fontFamily: 'Inter, system-ui, sans-serif',
          minWidth: COLLAPSED_W,
        }}
      >
        {/* ── Header ── */}
        <div style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: expanded ? 'space-between' : 'center', padding: expanded ? '0 14px' : '0' }}>
          {expanded ? (
            <>
              <button onClick={() => nav('/app')}
                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* WOK gradient logo */}
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4C10 4 6 8 6 14C6 18 8 21 12 23L16 28L20 23C24 21 26 18 26 14C26 8 22 4 16 4Z" fill="url(#wokGrad)"/>
                  <defs>
                    <linearGradient id="wokGrad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FF6B6B"/>
                      <stop offset="50%" stopColor="#FF9A3C"/>
                      <stop offset="100%" stopColor="#A855F7"/>
                    </linearGradient>
                  </defs>
                </svg>
              </button>
              <button onClick={() => setExpanded(false)}
                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#444' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
                </svg>
              </button>
            </>
          ) : (
            <button onClick={() => setExpanded(true)}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#555' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── Body — NO scroll on main container ── */}
        <div style={{ flex: 1, overflowY: 'hidden', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Workspace selector */}
          <div ref={wsRef} style={{ padding: expanded ? '0 8px 8px' : '0 5px 8px', flexShrink: 0, position: 'relative' }}>
            <button
              onClick={() => { if (expanded) setShowWorkspaceMenu(v => !v); else setExpanded(true); }}
              title={!expanded ? currentWs?.name : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                justifyContent: expanded ? 'flex-start' : 'center',
                width: '100%', padding: expanded ? '7px 8px' : '7px 0',
                borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 26, height: 26, borderRadius: 7, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {currentWs?.name?.charAt(0).toUpperCase() || 'W'}
              </div>
              {expanded && (
                <>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                    {currentWs?.name || 'My Workspace'}
                  </span>
                  <ChevronDown style={{ width: 14, height: 14, color: '#555', flexShrink: 0, transform: showWorkspaceMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />
                </>
              )}
            </button>
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
            <NavItem icon={Search} label="Search" onClick={() => setShowSearchModal(true)} shortcut={['Ctrl', 'K']} />
            <NavItem icon={Compass} label="Resources" onClick={() => nav('/app')} />
            <NavItem icon={Network} label="Connectors" onClick={() => nav('/app')} />
          </div>

          {/* Projects */}
          <div style={{ padding: expanded ? '8px 8px 0' : '8px 5px 0', flexShrink: 0 }}>
            {expanded && <p style={{ fontSize: 11, fontWeight: 500, color: '#444', margin: '4px 10px 4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Projects</p>}
            {!expanded && <div style={{ height: 6 }} />}
            <NavItem icon={LayoutGrid} label="All projects" onClick={() => nav('/projects')} active={location.pathname === '/projects'} />
            <NavItem icon={Star} label="Starred" onClick={() => nav('/projects')} />
            <NavItem icon={User} label="Created by me" onClick={() => nav('/projects')} />
            <NavItem icon={Users} label="Shared with me" onClick={() => nav('/projects')} />
          </div>

          {/* Recents */}
          {expanded && recents.length > 0 && (
            <SidebarBuildsSection recents={recents} nav={nav} />
          )}

          <div style={{ flex: 1 }} />

          {/* Share / Upgrade cards */}
          {expanded && (
            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => toast.info('Referral program coming soon')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: '#1A1A1A', border: '1px solid #2A2A2A', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#222'}
                onMouseLeave={e => e.currentTarget.style.background = '#1A1A1A'}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Share WOK</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>100 credits per paid referral</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Gift style={{ width: 15, height: 15, color: '#888' }} />
                </div>
              </button>
              <button onClick={() => nav('/pricing')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: '#1A1A1A', border: '1px solid #2A2A2A', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#222'}
                onMouseLeave={e => e.currentTarget.style.background = '#1A1A1A'}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Upgrade to Pro</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Unlock more features</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#7B4FE0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap style={{ width: 15, height: 15, color: '#fff' }} />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ flexShrink: 0, padding: expanded ? '8px 12px 10px' : '8px 5px 10px', position: 'relative' }} ref={profileRef}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: expanded ? 'space-between' : 'center' }}>
            <button onClick={() => setShowProfileMenu(v => !v)} title={!expanded ? 'Profile' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar user={user} size={30} />
              {expanded && <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{user?.email || ''}</span>}
            </button>
            {expanded && (
              <button title="Inbox"
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#444', position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#aaa'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#444'; }}
              >
                <Inbox style={{ width: 17, height: 17 }} />
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, background: '#E8184A', borderRadius: '50%', border: '1.5px solid #0E0E0E' }} />
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
      <SearchModal open={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </>
  );
}