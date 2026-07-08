import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, X, Check, ChevronDown, LogOut, Settings, HelpCircle, Tag, CreditCard, FileCode2, Layers, Clock, Star, Home, FolderOpen, ChevronRight, Gift, BarChart2, TrendingUp, Lightbulb, ClipboardCheck, Sparkles, MessageSquare, Trash2, Zap, Trophy, LayoutDashboard, BookOpen, Target, FileSearch, Users, CheckSquare, Award, Sparkle, PanelLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getPlansConfig } from '@/lib/plans-config';
import { getLocalDiscussions, loadDiscussionsFromCloud, saveLocalDiscussions } from '@/lib/chat-storage';
import { toast } from 'sonner';
import { useCredits } from '@/hooks/useCredits';

export const COLLAPSED_W = 52;
export const EXPANDED_W = 232;
export const SIDEBAR_MARGIN = 0;

const T = { duration: 0.22, ease: [0.4, 0, 0.2, 1] };

// ─── Referral Banner ──────────────────────────────────────────────
function ReferralBanner({ expanded, onClick }) {
  if (!expanded) return null;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '10px 12px', margin: '0 0 0 0',
        background: '#fff', border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 120ms',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}
    >
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>Earn bonus credits</p>
        <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', margin: 0 }}>Refer a friend</p>
      </div>
      <Gift style={{ width: 16, height: 16, color: 'rgba(0,0,0,0.4)', flexShrink: 0 }} />
    </button>
  );
}

// ─── Account menu (bottom trigger: avatar + name + plan) ───────────
function AccountMenu({ user, userPlan, navigate, expanded }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', h);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', h); document.removeEventListener('keydown', esc); };
  }, [open]);

  const items = [
    { label: 'Settings', action: () => navigate('/settings') },
    { label: 'Get help', action: () => navigate('/support') },
    { label: 'Upgrade', action: () => navigate('/pricing') },
    { label: 'Log out', action: async () => { await base44.auth.logout(); window.location.reload(); }, danger: true },
  ];

  return (
    <div ref={ref} style={{ position: 'relative', padding: expanded ? '4px 8px 8px' : '4px 0 8px', flexShrink: 0 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: expanded ? 8 : '50%',
              transform: expanded ? 'none' : 'translateX(-50%)',
              background: '#fff', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 12,
              boxShadow: '0 12px 40px rgba(0,0,0,0.14)', zIndex: 9999, width: 200, overflow: 'hidden', padding: 6,
            }}
          >
            {items.map((it, i) => (
              <button key={i}
                onClick={() => { setOpen(false); it.action(); }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: it.danger ? '#E8184A' : '#222', fontFamily: 'inherit', transition: 'background 100ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {it.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(v => !v)}
        title={!expanded ? 'Account' : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          width: expanded ? '100%' : 32, height: expanded ? 'auto' : 32,
          padding: expanded ? '7px 8px' : 0,
          borderRadius: expanded ? 10 : 8,
          border: '1px solid rgba(0,0,0,0.08)',
          background: open ? 'rgba(0,0,0,0.04)' : '#fff',
          cursor: 'pointer', fontFamily: 'inherit',
          justifyContent: expanded ? 'flex-start' : 'center',
          margin: expanded ? 0 : '0 auto',
          transition: 'background 100ms',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = '#fff'; }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Settings size={14} color="#666" strokeWidth={1.8} />
        </div>
        {expanded && (
          <div style={{ minWidth: 0, textAlign: 'left' }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: '#111', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || user?.email?.split('@')[0] || 'Account'}
            </p>
            <p style={{ fontSize: 11, color: '#999', margin: 0 }}>{userPlan?.name ? `${userPlan.name} plan` : 'Free plan'}</p>
          </div>
        )}
      </button>
    </div>
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
        width: '100%', height: 34,
        padding: indent ? '0 10px 0 30px' : '0 10px',
        justifyContent: 'flex-start',
        borderRadius: 7, border: 'none', cursor: 'pointer',
        background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
        color: active ? '#111' : '#666',
        transition: 'background 100ms',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(21,19,15,0.05)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {Icon && <Icon style={{ width: 15, height: 15, flexShrink: 0, strokeWidth: active ? 2 : 1.7, color: active ? '#111' : '#777' }} />}
      <span style={{
        fontSize: 13.5, fontWeight: active ? 600 : 450,
        marginLeft: 9, flex: 1, textAlign: 'left',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        letterSpacing: '-0.01em', color: active ? '#111' : '#555',
        opacity: expanded ? 1 : 0,
        transition: 'opacity 80ms',
        pointerEvents: expanded ? 'auto' : 'none',
      }}>
        {label}
      </span>
      {expanded && shortcut && (
        <span style={{ display: 'flex', gap: 2 }}>
          {shortcut.map((k, i) => (
            <kbd key={i} style={{ fontSize: 9.5, fontFamily: 'monospace', background: '#EEEEED', border: '1px solid #D5D5D5', borderRadius: 4, padding: '1px 4px', color: '#777', fontWeight: 600 }}>{k}</kbd>
          ))}
        </span>
      )}
    </button>
  );
}

// ─── Section Label ────────────────────────────────────────────────
function SectionLabel({ label, expanded }) {
  if (!expanded) return <div style={{ height: 16 }} />;
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A8', margin: '18px 12px 6px', letterSpacing: '0.06em', textTransform: 'uppercase', userSelect: 'none' }}>
      {label}
    </p>
  );
}

// ─── WOK AI History Sidebar ───────────────────────────────────────
async function loadAIConvsCloud() {
  try {
    const recs = await base44.entities.Conversation.list('-updated_at', 50);
    return recs.map(r => ({ id: r.id, title: r.title || 'Untitled', updatedAt: r.updated_at || new Date(r.updated_date).getTime() }));
  } catch { return []; }
}

function WokAISidebar({ navigate, onBack }) {
  const location = useLocation();
  const [convs, setConvs] = useState([]);
  const activeId = new URLSearchParams(location.search).get('conv');

  useEffect(() => { loadAIConvsCloud().then(setConvs); }, []);

  const handleSelect = (id) => { navigate(`/wok-ai?conv=${id}`); };
  const handleNew = () => { navigate('/wok-ai'); };
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try { await base44.entities.Conversation.delete(id); } catch {}
    loadAIConvsCloud().then(setConvs);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '10px 8px 6px' }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: 'rgba(0,0,0,0.45)', fontFamily: 'Inter, sans-serif', padding: '4px 4px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#111'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.45)'}>
          <ChevronRight style={{ width: 13, height: 13, transform: 'rotate(180deg)' }} />
          <span style={{ fontSize: 12.5 }}>Back</span>
        </button>
      </div>
      <div style={{ padding: '0 8px 6px' }}>
        <button onClick={handleNew}
          style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '7px 10px', border: '1px dashed rgba(0,0,0,0.15)', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#555', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Plus style={{ width: 11, height: 11 }} /> New conversation
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 8px' }}>
        {convs.length === 0 && (
          <p style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.35)', padding: '8px 10px' }}>No conversations</p>
        )}
        {convs.map(c => {
          const isAct = c.id === activeId;
          return (
            <div key={c.id} onClick={() => handleSelect(c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', background: isAct ? 'rgba(0,0,0,0.07)' : 'transparent', marginBottom: 1, transition: 'background 80ms' }}
              onMouseEnter={e => { if (!isAct) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
              onMouseLeave={e => { if (!isAct) e.currentTarget.style.background = isAct ? 'rgba(0,0,0,0.07)' : 'transparent'; }}>
              <MessageSquare style={{ width: 11, height: 11, color: isAct ? '#111' : '#999', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, fontWeight: isAct ? 600 : 400, color: isAct ? '#111' : '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.title || 'Discussion'}
              </span>
              <button onClick={e => handleDelete(e, c.id)}
                style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0, flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.stopPropagation(); }}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                <Trash2 style={{ width: 9, height: 9, color: '#EF4444' }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Settings Sidebar (replaces main nav when Settings clicked) ───
function SettingsSidebar({ navigate, onBack, user }) {
  const location = useLocation();
  const activeSection = new URLSearchParams(location.search).get('section') || 'profile';
  const isAdmin = user?.role === 'admin';
  const sections = [
    { id: 'profile', label: 'Profile' },
    { id: 'usage', label: 'Usage' },
    { id: 'plan', label: 'Billing' },
    { id: 'integrations', label: 'Integrations' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Back — arrow only, no bg */}
      <div style={{ padding: '10px 8px 6px' }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: 'rgba(0,0,0,0.45)', fontFamily: 'Inter, sans-serif', padding: '4px 4px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#111'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.45)'}>
          <ChevronRight style={{ width: 13, height: 13, transform: 'rotate(180deg)' }} />
          <span style={{ fontSize: 12.5 }}>Back</span>
        </button>
      </div>
      <div style={{ padding: '4px 6px', flex: 1, overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(0,0,0,0.35)', margin: '8px 4px 4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Personal</p>
        {sections.map(s => {
          const isActive = activeSection === s.id;
          return (
            <button key={s.id}
              onClick={() => navigate(`/settings?section=${s.id}`)}
              style={{
                display: 'flex', alignItems: 'center', width: '100%',
                padding: '6px 10px', borderRadius: 5, border: 'none',
                background: isActive ? 'rgba(0,0,0,0.07)' : 'transparent',
                cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 500 : 400,
                color: isActive ? '#111' : '#555',
                fontFamily: 'inherit', textAlign: 'left', transition: 'background 100ms',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(0,0,0,0.07)' : 'transparent'; }}
            >
              {s.label}
            </button>
          );
        })}

        {/* Admin section — visible pour les admins uniquement */}
        {isAdmin && (
          <>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(0,0,0,0.25)', margin: '16px 4px 4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Admin</p>
            <button
              onClick={() => navigate('/admin/overview')}
              style={{
                display: 'flex', alignItems: 'center', width: '100%',
                padding: '7px 10px', borderRadius: 7, border: '1px solid rgba(249,87,56,0.25)',
                background: 'rgba(249,87,56,0.06)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: '#F95738',
                fontFamily: 'inherit', textAlign: 'left', transition: 'all 120ms', gap: 7,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,87,56,0.12)'; e.currentTarget.style.borderColor = 'rgba(249,87,56,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,87,56,0.06)'; e.currentTarget.style.borderColor = 'rgba(249,87,56,0.25)'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Administration
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────
export default function Sidebar({ expanded, setExpanded, user, userPlan }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [recents, setRecents] = useState([]);
  const [recentsOpen, setRecentsOpen] = useState(true);
  const [starredOpen, setStarredOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState(false);
  const [wokAIMode, setWokAIMode] = useState(false);

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

  const isActive = path => location.pathname === path;
  const nav = path => { navigate(path); };

  // Sync modes with URL
  useEffect(() => {
    if (location.pathname.startsWith('/settings')) { setSettingsMode(true); setWokAIMode(false); }
    else if (location.pathname.startsWith('/wok-ai')) { setWokAIMode(true); setSettingsMode(false); }
    else { setSettingsMode(false); setWokAIMode(false); }
  }, [location.pathname]);

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

      {/* Floating collapse/expand toggle — sits just outside the sidebar, no background */}
      {!isMobile && (
        <button
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse' : 'Expand'}
          style={{
            position: 'fixed', top: 18, left: (expanded ? EXPANDED_W : COLLAPSED_W) + 8, zIndex: 41,
            width: 26, height: 26, borderRadius: 6, border: 'none',
            background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0,
            transition: 'left 220ms cubic-bezier(0.4,0,0.2,1)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#333'}
        >
          <PanelLeft size={15} color="#999" strokeWidth={2} />
        </button>
      )}

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
          background: '#FFFFFF',
          borderRight: '1px solid #FFFFFF',
          fontFamily: 'Inter, system-ui, sans-serif',
          minWidth: isMobile ? EXPANDED_W : COLLAPSED_W,
        }}
      >
        {/* ── Top: App logo + name ── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: expanded ? 'flex-start' : 'center', gap: 9, padding: expanded ? '16px 12px 14px' : '16px 0 14px' }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
              <img src="https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/02ac593f2_pcloud_552088188_3_202607_1_common-20260707001315-30789-22a14-cf87f.jpg" alt="UseWok" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            {expanded && <span style={{ fontSize: 16, fontWeight: 700, color: '#15130F', letterSpacing: '-0.01em', whiteSpace: 'nowrap', fontFamily: "'Wix Madefor Text', 'Wix Madefor Display', Inter, sans-serif" }}>UseWok</span>}
          </div>
        </div>

        {/* ── Settings mode ── */}
        {expanded && settingsMode && (
          <SettingsSidebar navigate={nav} onBack={() => { setSettingsMode(false); nav('/app'); }} user={user} />
        )}

        {/* ── WOK AI history mode ── */}
        {expanded && wokAIMode && (
          <WokAISidebar navigate={nav} onBack={() => { setWokAIMode(false); nav('/app'); }} />
        )}

        <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', padding: expanded ? '0 8px' : '0 6px', display: (expanded && (settingsMode || wokAIMode)) ? 'none' : 'flex' }}>

          {/* Main nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
            <NavItem icon={Home} label="Home" onClick={() => nav('/app')} active={isActive('/app')} expanded={expanded} />
            <NavItem icon={LayoutDashboard} label="Dashboard" onClick={() => nav('/dashboard')} active={isActive('/dashboard')} expanded={expanded} />
            <NavItem icon={Sparkles} label="WOK AI" onClick={() => nav('/wok-ai')} active={isActive('/wok-ai')} expanded={expanded} />
          </div>

          {/* ── Grouped nav sections ── */}
          {expanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, overflowY: 'auto', flex: 1 }}>
              {[
                {
                  section: 'STRATEGY',
                  items: [
                    { id: 'brand', label: 'Brand Knowledge', icon: BookOpen, route: '/brand-knowledge' },
                    { id: 'geo',   label: 'GEO Strategy',    icon: Sparkle,  route: '/geo-strategy' },
                  ],
                },
                {
                  section: 'AUDIT',
                  items: [
                    { id: 'siteaudit',   label: 'Site audit',   icon: FileSearch, route: '/site-audit' },
                    { id: 'competitors', label: 'Competitors',  icon: Users,      route: '/competitors' },
                  ],
                },
                {
                  section: 'ACTIONS',
                  items: [
                    { id: 'tasks', label: 'Tasks',     icon: CheckSquare, route: '/tasks' },
                  ],
                },
                {
                  section: 'AI VISIBILITY',
                  items: [
                    { id: 'auth',  label: 'Authority',        icon: Award,    route: '/ai-report' },
                    { id: 'reco',  label: 'Recommendations',  icon: Target,   route: '/recommendations' },
                  ],
                },
              ].map(group => (
                <div key={group.section} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <SectionLabel label={group.section} expanded={expanded} />
                  {group.items.map(tool => {
                    const Icon = tool.icon;
                    const isToolActive = location.pathname === tool.route;
                    return (
                      <button key={tool.id}
                        onClick={() => nav(tool.route)}
                        style={{
                          display: 'flex', alignItems: 'center', width: '100%', height: 36,
                          padding: '0 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                          background: isToolActive ? 'rgba(123,79,224,0.12)' : 'transparent',
                          fontFamily: 'inherit', transition: 'background 100ms', gap: 12,
                        }}
                        onMouseEnter={e => { if (!isToolActive) e.currentTarget.style.background = 'rgba(21,19,15,0.05)'; }}
                        onMouseLeave={e => { if (!isToolActive) e.currentTarget.style.background = isToolActive ? 'rgba(123,79,224,0.12)' : 'transparent'; }}
                      >
                        <Icon style={{ width: 18, height: 18, flexShrink: 0, color: isToolActive ? '#7B4FE0' : '#555', strokeWidth: 1.9 }} />
                        <span style={{ fontSize: 14.5, fontWeight: 600, color: isToolActive ? '#7B4FE0' : '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {tool.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {!expanded && <div style={{ flex: 1 }} />}

            {/* collapsed: WOK AI icon */}
          {!expanded && (
            <NavItem icon={Sparkles} label="Ask AI" onClick={() => { setExpanded(true); setWokAIMode(true); nav('/wok-ai'); }} active={isActive('/wok-ai')} expanded={expanded} />
          )}

          {/* ── Account menu (settings / help / upgrade / logout) ── */}
          <AccountMenu user={user} userPlan={userPlan} navigate={navigate} expanded={expanded} />
        </div>
      </motion.aside>

      <CodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} user={user} />
    </>
  );
}