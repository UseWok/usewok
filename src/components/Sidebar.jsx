import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Search, Layers, Zap, MessageSquare, Star,
  Settings, CreditCard, HelpCircle, X, Check, Ticket,
  Gift, ChevronRight,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';
import { getPlansConfig } from '@/lib/plans-config';
import { getLocalDiscussions } from '@/lib/chat-storage';
import { toast } from 'sonner';

export const COLLAPSED_W = 54;
export const EXPANDED_W  = 240;
export const SIDEBAR_MARGIN = 0;

// ── Single transition — no delay so buttons don't lag ──
const SIDEBAR_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] };

// ── Section label (only visible when expanded) ──
const SectionLabel = ({ children, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, delay: 0.08 }}
        style={{
          fontSize: 11, fontWeight: 600, color: '#B0B0B0',
          textTransform: 'uppercase', letterSpacing: '0.07em',
          padding: '14px 14px 5px', margin: 0, whiteSpace: 'nowrap',
        }}
      >
        {children}
      </motion.p>
    )}
  </AnimatePresence>
);

// ── Single nav item — works in both collapsed (icon only) and expanded (icon + label) ──
const NavItem = ({ icon: Icon, label, onClick, active, shortcut, expanded }) => (
  <button
    onClick={onClick}
    title={!expanded ? label : undefined}
    style={{
      display: 'flex', alignItems: 'center',
      width: '100%',
      height: 34,
      padding: expanded ? '0 12px' : '0',
      justifyContent: expanded ? 'flex-start' : 'center',
      borderRadius: 8,
      background: active ? '#F0F0EE' : 'transparent',
      border: 'none', cursor: 'pointer',
      transition: 'background 120ms',
      color: active ? '#111' : '#555',
      flexShrink: 0,
      overflow: 'hidden',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F5F5F5'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    {/* Icon — always centered in a fixed 22px slot */}
    {Icon ? (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, flexShrink: 0 }}>
        <Icon style={{ width: 17, height: 17 }} />
      </span>
    ) : (
      /* No-icon items (recents) get a dot placeholder */
      expanded ? <span style={{ width: 6, height: 6, borderRadius: 999, background: '#D0D0D0', flexShrink: 0, marginLeft: 8 }} /> : null
    )}
    {/* Label — hidden via opacity/width, no AnimatePresence to avoid layout jumps */}
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
    {/* Shortcut keys */}
    {shortcut && (
      <span style={{
        display: 'flex', gap: 3, flexShrink: 0, marginLeft: 'auto',
        opacity: expanded ? 1 : 0,
        transition: 'opacity 0.15s ease',
      }}>
        {shortcut.map((k, i) => (
          <kbd key={i} style={{ fontSize: 10, fontFamily: 'monospace', background: '#EDEDED', border: '1px solid #D9D9D9', borderRadius: 4, padding: '1px 5px', color: '#777' }}>{k}</kbd>
        ))}
      </span>
    )}
  </button>
);

// ── User avatar ──
function Avatar({ user, size = 28 }) {
  const initial = user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: getUserColor(user), color: '#fff',
      fontSize: size * 0.42, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {initial}
    </div>
  );
}

export default function Sidebar({ expanded, setExpanded, user, userPlan }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [recents, setRecents] = useState([]);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const workspaces = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
    const wsId = workspaces.find(w => w.current)?.id || 'default';
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
        {/* ── Header: toggle button (collapsed) or Logo + collapse (expanded) ── */}
        <div style={{
          flexShrink: 0, borderBottom: '1px solid #EBEBEB',
          height: 52,
          display: 'flex', alignItems: 'center',
          padding: expanded ? '0 12px 0 14px' : '0',
          justifyContent: expanded ? 'space-between' : 'center',
          overflow: 'hidden',
        }}>
          {expanded ? (
            <>
              {/* WOK wordmark */}
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, delay: 0.05 }}
                style={{ fontSize: 22, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.01em', lineHeight: 1, fontFamily: "'Barlow Condensed', system-ui, sans-serif", fontStyle: 'italic', userSelect: 'none' }}
              >
                WOK
              </motion.span>
              {/* Collapse ← arrow */}
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
            /* Sidebar toggle icon — centered in the rail */
            <button
              onClick={() => setExpanded(true)}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#555' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* sidebar/panel toggle icon */}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 3v18"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── User workspace row (only in expanded) ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              style={{ flexShrink: 0, padding: '8px 8px 0' }}
            >
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '6px 8px',
                  borderRadius: 8, border: 'none', background: 'transparent',
                  cursor: 'pointer', transition: 'background 120ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Avatar user={user} size={26} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                  {user?.full_name?.split(' ')[0] || 'My'}'s Workspace
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: '#F0F0F0', margin: expanded ? '8px 12px 4px' : '8px 8px 4px', flexShrink: 0 }} />

        {/* ── Main nav ── */}
        <div style={{ padding: expanded ? '4px 8px 0' : '4px 5px 0', flexShrink: 0 }}>
          <NavItem icon={Home} label="Home" onClick={() => navigate('/app')} active={location.pathname === '/app'} expanded={expanded} />
          <NavItem icon={Search} label="Search" onClick={() => navigate('/discussions')} shortcut={expanded ? ['⌘', 'K'] : null} expanded={expanded} />
          <NavItem icon={MessageSquare} label="Discussions" onClick={() => navigate('/discussions')} active={location.pathname === '/discussions'} expanded={expanded} />
        </div>

        {/* ── Projects section ── */}
        <div style={{ padding: expanded ? '0 8px' : '0 5px', flexShrink: 0 }}>
          <SectionLabel visible={expanded}>Projects</SectionLabel>
          {!expanded && <div style={{ height: 8 }} />}
          <NavItem icon={Layers} label="All projects" onClick={() => navigate('/projects')} active={location.pathname === '/projects'} expanded={expanded} />
          <NavItem icon={Star} label="Starred" onClick={() => navigate('/projects')} expanded={expanded} />
        </div>

        {/* ── Recents (expanded only) ── */}
        <AnimatePresence>
          {expanded && recents.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.1 }}
              style={{ padding: '0 8px', flexShrink: 0 }}
            >
              <SectionLabel visible={true}>Recents</SectionLabel>
              {recents.map((d) => (
                <NavItem
                  key={d.id}
                  icon={null}
                  label={d.title || 'Untitled'}
                  onClick={() => navigate(`/chat?conversationId=${d.id}`)}
                  active={false}
                  expanded={true}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ flex: 1 }} />

        {/* ── Upgrade CTA (expanded + free only) ── */}
        <AnimatePresence>
          {expanded && isFree && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.08 }}
              style={{ padding: '0 10px 8px' }}
            >
              <button
                onClick={() => navigate('/pricing')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                  padding: '9px 11px', borderRadius: 10,
                  background: '#F7F7F7', border: '1px solid #EBEBEB',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 120ms',
                }}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Profile footer ── */}
        <div
          ref={profileRef}
          style={{
            borderTop: '1px solid #EBEBEB', flexShrink: 0,
            padding: expanded ? '8px 8px 10px' : '8px 5px 10px',
            position: 'relative',
          }}
        >
          {/* Avatar row */}
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
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: 0.06 }}
                  style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 6 }}
                >
                  {/* Inbox icon */}
                  <svg style={{ width: 15, height: 15, color: '#BBBBBB', marginLeft: 'auto', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Profile popup */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                style={{
                  position: 'absolute', bottom: 'calc(100% + 4px)',
                  left: expanded ? 8 : -180, right: expanded ? 8 : -8,
                  width: expanded ? undefined : 200,
                  background: '#fff', border: '1px solid #E8E8E6', borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 999, padding: '6px 0', overflow: 'hidden',
                }}
              >
                {[
                  { icon: Ticket, label: 'Redeem code', action: () => { setShowCodeModal(true); setShowProfileMenu(false); } },
                  { icon: Settings, label: 'Settings', action: () => { navigate('/settings'); setShowProfileMenu(false); } },
                  { icon: CreditCard, label: 'Upgrade plan', action: () => { navigate('/pricing'); setShowProfileMenu(false); } },
                  { icon: HelpCircle, label: 'Support', action: () => { navigate('/support'); setShowProfileMenu(false); } },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label} onClick={action}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#444', transition: 'background 100ms' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon style={{ width: 14, height: 14, color: '#9CA3AF' }} />
                    {label}
                  </button>
                ))}
                <div style={{ height: 1, background: '#EBEBEA', margin: '4px 0' }} />
                <button
                  onClick={async () => { await base44.auth.logout(); window.location.reload(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#EF4444', transition: 'background 100ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <CodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} user={user} />
    </>
  );
}

// ── CodeModal ──
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