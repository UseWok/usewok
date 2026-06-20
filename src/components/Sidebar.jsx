import { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, X, Check, ChevronDown, LogOut, Settings, HelpCircle, Tag, CreditCard, FileCode2, Layers, Clock, Star, Search, Home, FolderOpen, ChevronRight, Gift, BarChart2, Eye, Users, TrendingUp, MessageCircle, Activity, Zap, HelpCircle as HelpIcon, Lightbulb, ClipboardCheck, Printer, Target, Radar } from 'lucide-react';
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
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>Gagnez des crédits bonus</p>
        <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', margin: 0 }}>Parrainer un ami</p>
      </div>
      <Gift style={{ width: 16, height: 16, color: 'rgba(0,0,0,0.4)', flexShrink: 0 }} />
    </button>
  );
}

// ─── User Popover (floating panel, not touching edges) ───────────
function UserPopover({ user, expanded, navigate, userPlan, onSettingsClick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { used, limit, pct, barColor, isOverLimit } = useCredits(user);
  const formatK = n => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

  // Renewal date
  const renewalDate = (() => {
    const base = user?.credits_reset_at || user?.subscription_date || user?.created_date;
    if (!base) return null;
    return new Date(base).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' });
  })();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const initials = (user?.full_name || user?.email || '?').slice(0, 2).toUpperCase();

  return (
    <div ref={ref} style={{ position: 'relative', padding: '6px 8px 0', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '6px 8px', borderRadius: 8,
          border: 'none', background: open ? 'rgba(0,0,0,0.05)' : 'transparent',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 120ms',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = open ? 'rgba(0,0,0,0.05)' : 'transparent'}
      >
        <div style={{ width: 26, height: 26, borderRadius: 7, background: '#7C6AF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, letterSpacing: '-0.02em' }}>
          {initials}
        </div>
        {expanded && (
          <>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: '#111', flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || user?.email?.split('@')[0] || 'Account'}
            </span>
            <ChevronDown style={{ width: 12, height: 12, color: '#888', flexShrink: 0 }} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 6,
              background: '#fff', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 14,
              boxShadow: '0 12px 40px rgba(0,0,0,0.14)', zIndex: 9999,
              width: 232, overflow: 'hidden',
            }}
          >
            {/* Paramètres — large primary button */}
            <div style={{ padding: '12px 12px 8px' }}>
              <button
                onClick={() => { setOpen(false); onSettingsClick(); }}
                style={{
                  width: '100%', padding: '10px 14px', border: 'none',
                  background: '#F5F5F3', borderRadius: 9,
                  cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#111',
                  textAlign: 'left', fontFamily: 'inherit', transition: 'background 120ms',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#ECECEA'}
                onMouseLeave={e => e.currentTarget.style.background = '#F5F5F3'}
              >
                Settings
              </button>
            </div>

            {/* Credits section */}
            <div style={{ padding: '8px 12px 10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>Credits</span>
                  {renewalDate && (
                    <p style={{ fontSize: 10.5, color: 'rgba(0,0,0,0.4)', margin: '1px 0 0' }}>Renewal {renewalDate}</p>
                  )}
                </div>
                <span style={{ fontSize: 12, color: isOverLimit ? '#ef4444' : '#555', fontVariantNumeric: 'tabular-nums', fontWeight: isOverLimit ? 600 : 500 }}>
                  {formatK(used)}/{formatK(limit)}{isOverLimit ? ' ⚠' : ''}
                </span>
              </div>
              <div style={{ height: 5, background: '#E8E8E4', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Get help + Logout */}
            <div style={{ padding: '6px 12px 12px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button
                onClick={() => { navigate('/support'); setOpen(false); }}
                style={{ width: '100%', padding: '8px 10px', border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer', fontSize: 13, color: '#444', textAlign: 'left', fontFamily: 'inherit', transition: 'background 100ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Help
              </button>
              <button
                onClick={async () => { setOpen(false); await base44.auth.logout(); window.location.reload(); }}
                style={{ width: '100%', padding: '8px 10px', border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer', fontSize: 13, color: '#E8184A', textAlign: 'left', fontFamily: 'inherit', transition: 'background 100ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,24,74,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        background: active ? 'rgba(0,0,0,0.07)' : 'transparent',
        color: active ? '#111' : '#555',
        transition: 'background 100ms',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {Icon && <Icon style={{ width: 14, height: 14, flexShrink: 0, strokeWidth: active ? 2 : 1.7, color: active ? '#111' : '#666' }} />}
      <span style={{
        fontSize: 13, fontWeight: active ? 600 : 450,
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

// ─── Sidebar Credits Bar ──────────────────────────────────────────
function SidebarCreditsBar({ user, onUpgrade }) {
  const { used, limit, pct, barColor, isLow, isOverLimit } = useCredits(user);
  const formatK = n => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
  return (
    <div style={{ margin: '4px 8px 6px', padding: '10px 10px 8px', background: '#EFEFED', borderRadius: 8, border: '1px solid #E5E5E3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Credits</span>
        {(isLow || isOverLimit) && (
          <button onClick={onUpgrade} style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 4, padding: '1px 5px', cursor: 'pointer' }}>Upgrade</button>
        )}
      </div>
      <div style={{ height: 5, background: '#DDDDD9', borderRadius: 999, marginBottom: 5 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 10, color: isOverLimit ? '#ef4444' : '#555', fontVariantNumeric: 'tabular-nums', fontWeight: isOverLimit ? 600 : 400 }}>
        {formatK(used)} / {formatK(limit)}{isOverLimit ? ' ⚠' : ''}
      </span>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────
function SectionLabel({ label, expanded }) {
  if (!expanded) return <div style={{ height: 16 }} />;
  return (
    <p style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(0,0,0,0.3)', margin: '12px 10px 3px', letterSpacing: '0.08em', textTransform: 'uppercase', userSelect: 'none' }}>
      {label}
    </p>
  );
}

// ─── Divider ──────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '5px 0' }} />;
}

// ─── Settings Sidebar (replaces main nav when Settings clicked) ───
function SettingsSidebar({ navigate, onBack }) {
  const location = useLocation();
  const activeSection = new URLSearchParams(location.search).get('section') || 'profile';
  const sections = [
    { id: 'profile', label: 'Profile' },
    { id: 'usage', label: 'Usage' },
    { id: 'plan', label: 'Billing' },
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
      </div>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────
export default function Sidebar({ expanded, setExpanded, user, userPlan }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [recents, setRecents] = useState([]);
  const [recentsOpen, setRecentsOpen] = useState(true);
  const [starredOpen, setStarredOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState(false);

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

  const isActive = path => location.pathname === path;
  const nav = path => { navigate(path); };

  // Sync settingsMode with URL
  useEffect(() => {
    if (location.pathname.startsWith('/settings')) setSettingsMode(true);
    else setSettingsMode(false);
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
          fontFamily: 'Inter, system-ui, sans-serif',
          minWidth: isMobile ? EXPANDED_W : COLLAPSED_W,
        }}
      >
        {/* ── Top: User dropdown + toggle ── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: expanded ? 'space-between' : 'center', padding: expanded ? '4px 8px 4px 0' : '6px 0' }}>
            {expanded
              ? <UserPopover user={user} expanded={expanded} navigate={nav} userPlan={userPlan} onSettingsClick={() => { setSettingsMode(true); nav('/settings'); }} />
              : (
                <button
                  onClick={() => setExpanded(true)} title="Expand"
                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#888' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EDEAE5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
                  </svg>
                </button>
              )
            }
            {expanded && (
              <button onClick={() => setExpanded(false)} title="Collapse"
                style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', color: '#888', flexShrink: 0, marginRight: 2 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EDEAE5'; e.currentTarget.style.color = '#333'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        {/* Settings mode: show settings sidebar */}
        {expanded && settingsMode && (
          <SettingsSidebar navigate={nav} onBack={() => { setSettingsMode(false); nav('/app'); }} />
        )}

        <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', padding: expanded ? '0 8px' : '0 6px', display: expanded && settingsMode ? 'none' : 'flex' }}>

          {/* Main nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
            <NavItem icon={Home} label="Home" onClick={() => nav('/app')} active={isActive('/app')} expanded={expanded} />
            <NavItem icon={BarChart2} label="AI Report" onClick={() => nav('/ai-report')} active={isActive('/ai-report')} expanded={expanded} />
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
                  style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', height: 34, padding: '0 10px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#555', fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Star style={{ width: 14, height: 14, flexShrink: 0, strokeWidth: 1.7, color: '#666' }} />
                  <span style={{ fontSize: 13, fontWeight: 450, flex: 1, textAlign: 'left', letterSpacing: '-0.01em', color: '#555' }}>Starred</span>
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
                  style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', height: 34, padding: '0 10px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#555', fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Clock style={{ width: 14, height: 14, flexShrink: 0, strokeWidth: 1.7, color: '#666' }} />
                  <span style={{ fontSize: 13, fontWeight: 450, flex: 1, textAlign: 'left', letterSpacing: '-0.01em', color: '#555' }}>Recent</span>
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



          <Divider />

          {/* ── AI Tools ── */}
          {expanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0, overflowY: 'auto', flex: 1 }}>
              <SectionLabel label="AI Tools" expanded={expanded} />
              {[
                { id: 'visibility',  label: 'Visibility',       icon: Eye,            color: '#6366F1' },
                { id: 'overview',    label: 'Overview',         icon: BarChart2,      color: '#8B5CF6' },
                { id: 'competitor',  label: 'Competitor',       icon: Radar,          color: '#EC4899' },
                { id: 'crowd',       label: 'Crowd Research',   icon: Users,          color: '#F59E0B' },
                { id: 'performance', label: 'Performance',      icon: TrendingUp,     color: '#10B981' },
                { id: 'perception',  label: 'Perception',       icon: MessageCircle,  color: '#3B82F6' },
                { id: 'sentiment',   label: 'Sentiment',        icon: Activity,       color: '#EF4444' },
                { id: 'drivers',     label: 'Drivers',          icon: Zap,            color: '#F97316' },
                { id: 'questions',   label: 'Questions',        icon: HelpIcon,       color: '#06B6D4' },
                { id: 'seek',        label: 'Seek',             icon: Search,         color: '#A855F7' },
                { id: 'audit',       label: 'Audit',            icon: ClipboardCheck, color: '#0EA5E9' },
                { id: 'print',       label: 'Print',            icon: Printer,        color: '#64748B' },
                { id: 'tracking',    label: 'Tracking',         icon: Target,         color: '#DC2626' },
                { id: 'goals',       label: 'Goals',            icon: Lightbulb,      color: '#84CC16' },
              ].map(tool => {
                const Icon = tool.icon;
                const isToolActive = location.pathname === '/ai-report' && new URLSearchParams(location.search).get('tool') === tool.id;
                return (
                  <button key={tool.id}
                    onClick={() => nav(`/ai-report?tool=${tool.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', width: '100%', height: 30,
                      padding: '0 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: isToolActive ? `${tool.color}12` : 'transparent',
                      fontFamily: 'inherit', transition: 'background 100ms', gap: 8,
                    }}
                    onMouseEnter={e => { if (!isToolActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { if (!isToolActive) e.currentTarget.style.background = isToolActive ? `${tool.color}12` : 'transparent'; }}
                  >
                    <Icon style={{ width: 13, height: 13, flexShrink: 0, color: isToolActive ? tool.color : '#888', strokeWidth: 1.8 }} />
                    <span style={{ fontSize: 12.5, fontWeight: isToolActive ? 600 : 400, color: isToolActive ? tool.color : '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tool.label}
                    </span>
                    {isToolActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: tool.color, marginLeft: 'auto', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          )}

          {!expanded && <div style={{ flex: 1 }} />}

          {/* ── Support button — circle with ? ── */}
          <div style={{ padding: '4px 0 8px', display: 'flex', justifyContent: expanded ? 'flex-start' : 'center', paddingLeft: expanded ? 0 : 0 }}>
            <button
              onClick={() => navigate('/support')}
              title="Support"
              style={{
                width: 26, height: 26, borderRadius: '50%',
                border: '1.5px solid rgba(0,0,0,0.18)',
                background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 120ms',
                marginLeft: expanded ? 10 : 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#111', lineHeight: 1 }}>?</span>
            </button>
          </div>
        </div>
      </motion.aside>

      <CodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} user={user} />
      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}