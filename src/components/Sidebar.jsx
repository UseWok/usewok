import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Search, Layers, Zap, LayoutDashboard,
  MessageSquare, Star, User, Users, Settings,
  CreditCard, HelpCircle, X, Check, Ticket,
  Gift, ChevronDown, Plus,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';
import { getPlansConfig } from '@/lib/plans-config';
import { getLocalDiscussions } from '@/lib/chat-storage';
import { toast } from 'sonner';

export const COLLAPSED_W = 0;   // fully hidden when collapsed
export const EXPANDED_W  = 240;
export const SIDEBAR_MARGIN = 0;

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

// ── Section label ──
const SectionLabel = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '14px 12px 6px' }}>
    {children}
  </p>
);

// ── Nav row ──
const NavRow = ({ icon: Icon, label, onClick, active, shortcut, badge }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', padding: '7px 12px', borderRadius: 8,
      background: active ? '#F0F0EE' : 'transparent',
      border: 'none', cursor: 'pointer', textAlign: 'left',
      transition: 'background 120ms',
      color: active ? '#111' : '#444',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F5F5F3'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    {Icon && <Icon style={{ width: 15, height: 15, flexShrink: 0, color: active ? '#111' : '#6B7280' }} />}
    <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 450, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {label}
    </span>
    {shortcut && (
      <span style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
        {shortcut.map((k, i) => (
          <kbd key={i} style={{ fontSize: 10, fontFamily: 'monospace', background: '#EBEBEB', border: '1px solid #D9D9D9', borderRadius: 4, padding: '1px 5px', color: '#666' }}>{k}</kbd>
        ))}
      </span>
    )}
    {badge && (
      <span style={{ fontSize: 10, fontWeight: 600, background: '#111', color: '#fff', borderRadius: 999, padding: '1px 6px' }}>{badge}</span>
    )}
  </button>
);

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

  // Load recent conversations from localStorage
  useEffect(() => {
    const workspaces = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
    const wsId = workspaces.find(w => w.current)?.id || 'default';
    const discs = getLocalDiscussions(wsId);
    setRecents((discs || []).slice(0, 5));
  }, [expanded]);

  // Global search shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); navigate('/discussions'); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan?.credits_limit || user?.credits_limit || 10;
  const creditsPct = Math.min(100, Math.round((creditsUsed / creditsLimit) * 100));
  const isFree = !userPlan || userPlan.price_monthly === 0;

  return (
    <>
      {/* Backdrop on mobile */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setExpanded(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,0.18)' }}
            className="md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: expanded ? 0 : -EXPANDED_W - 20 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0,
          width: EXPANDED_W, zIndex: 40,
          display: 'flex', flexDirection: 'column',
          background: '#F9F9F7',   // slightly lighter than #EFEFEF app bg
          borderRight: '1px solid #E8E8E6',
          fontFamily: 'Inter, system-ui, sans-serif',
          overflowY: 'auto', overflowX: 'hidden',
        }}
      >
        {/* ── Top: Logo + Workspace switcher ── */}
        <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid #EBEBEA', flexShrink: 0 }}>
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <img src={LOGO_URL} alt="Wok" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <button
              onClick={() => setExpanded(false)}
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF' }}
              onMouseEnter={e => e.currentTarget.style.background = '#EEEEED'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/>
              </svg>
            </button>
          </div>

          {/* Workspace switcher */}
          <button
            onClick={() => setShowProfileMenu(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '6px 8px', borderRadius: 8, border: 'none',
              background: 'transparent', cursor: 'pointer', textAlign: 'left',
              transition: 'background 120ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EEEEED'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div
              style={{ width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: getUserColor(user), color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}
            >
              {userInitial}
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name?.split(' ')[0]}'s Workspace
            </span>
            <ChevronDown style={{ width: 14, height: 14, color: '#9CA3AF', flexShrink: 0 }} />
          </button>
        </div>

        {/* ── Main nav ── */}
        <div style={{ padding: '8px 8px 0', flexShrink: 0 }}>
          <NavRow icon={Home} label="Home" onClick={() => navigate('/app')} active={location.pathname === '/app'} />
          <NavRow icon={Search} label="Search" onClick={() => navigate('/discussions')} shortcut={['Ctrl', 'K']} />
          <NavRow icon={MessageSquare} label="Discussions" onClick={() => navigate('/discussions')} active={location.pathname === '/discussions'} />
          <NavRow icon={LayoutDashboard} label="Visual Cockpit" onClick={() => navigate('/cockpit')} active={location.pathname === '/cockpit'} />
        </div>

        {/* ── Projects section ── */}
        <div style={{ padding: '0 8px', flexShrink: 0 }}>
          <SectionLabel>Projects</SectionLabel>
          <NavRow icon={Layers} label="All projects" onClick={() => navigate('/projects')} active={location.pathname === '/projects'} />
          <NavRow icon={Star} label="Starred" onClick={() => navigate('/projects')} />
          <NavRow icon={User} label="Created by me" onClick={() => navigate('/projects')} />
          <NavRow icon={Users} label="Shared with me" onClick={() => navigate('/discussions')} />
        </div>

        {/* ── Recents section ── */}
        {recents.length > 0 && (
          <div style={{ padding: '0 8px', flexShrink: 0 }}>
            <SectionLabel>Recents</SectionLabel>
            {recents.map((d) => (
              <NavRow
                key={d.id}
                label={d.title || 'Untitled'}
                onClick={() => navigate(`/chat?conversationId=${d.id}`)}
                active={false}
              />
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* ── Share CTA ── */}
        <div style={{ padding: '0 8px 6px', flexShrink: 0 }}>
          <button
            onClick={() => navigate('/pricing')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 12px', borderRadius: 10,
              background: '#fff', border: '1px solid #E8E8E6',
              cursor: 'pointer', textAlign: 'left',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'background 120ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F3'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Gift style={{ width: 15, height: 15, color: '#6B7280' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, lineHeight: 1.3 }}>Share Wok</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.3 }}>Earn credits per referral</p>
            </div>
          </button>
        </div>

        {/* ── Upgrade CTA (free users only) ── */}
        {isFree && (
          <div style={{ padding: '0 8px 8px', flexShrink: 0 }}>
            <button
              onClick={() => navigate('/pricing')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 12px', borderRadius: 10,
                background: '#fff', border: '1px solid #E8E8E6',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F5F3'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap style={{ width: 15, height: 15, color: '#6366F1' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, lineHeight: 1.3 }}>Upgrade to Pro</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.3 }}>Unlock more features</p>
              </div>
            </button>
          </div>
        )}

        {/* ── Profile footer ── */}
        <div
          ref={profileRef}
          style={{ padding: '8px 8px 10px', borderTop: '1px solid #EBEBEA', flexShrink: 0, position: 'relative' }}
        >
          <button
            onClick={() => setShowProfileMenu(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9, width: '100%',
              padding: '6px 8px', borderRadius: 8, border: 'none',
              background: 'transparent', cursor: 'pointer', textAlign: 'left',
              transition: 'background 120ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EEEEED'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div
              style={{ width: 28, height: 28, borderRadius: 999, background: getUserColor(user), color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              {userInitial}
            </div>
            {/* Inbox icon */}
            <svg style={{ width: 16, height: 16, color: '#9CA3AF', marginLeft: 'auto' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </button>

          {/* Profile popup */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', bottom: 'calc(100% + 4px)', left: 8, right: 8,
                  background: '#fff', border: '1px solid #E8E8E6', borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 999, padding: '6px 0',
                  overflow: 'hidden',
                }}
              >
                {[
                  { icon: Ticket, label: 'Redeem code', action: () => { setShowCodeModal(true); setShowProfileMenu(false); } },
                  { icon: Settings, label: 'Settings', action: () => { navigate('/settings'); setShowProfileMenu(false); } },
                  { icon: CreditCard, label: 'Upgrade plan', action: () => { navigate('/pricing'); setShowProfileMenu(false); } },
                  { icon: HelpCircle, label: 'Support', action: () => { navigate('/support'); setShowProfileMenu(false); } },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#444', transition: 'background 100ms' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F3'}
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

      {/* Code redemption modal */}
      <CodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} user={user} />
    </>
  );
}

// ── CodeModal (unchanged logic) ──
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
      let durationText = codeRecord.duration_type === 'lifetime' ? 'lifetime access'
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