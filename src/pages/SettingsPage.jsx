import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User, CreditCard, Zap, ArrowLeft, Save, Gift, Clock, Trash2, X, Download, ChevronRight, Check } from 'lucide-react';
import { writeAuditLog } from '@/lib/serverGuard';
import AISettingsModal from '@/components/settings/AISettingsModal';
import { getUserPlan, getPlansConfig } from '@/lib/plans-config';
import CreditsBar from '@/components/CreditsBar';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

// ── Dark theme tokens matching Linear/img2 ──
const S = {
  bg: '#0A0A0B',
  surface: '#111113',
  surface2: '#16161A',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F0EE',
  muted: 'rgba(255,255,255,0.4)',
  muted2: 'rgba(255,255,255,0.22)',
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '10px 13px',
  fontSize: 13,
  color: S.text,
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
};

function CodeRedeemer({ user, setUser }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRedeem = async () => {
    setError(''); setSuccess('');
    if (!code.trim()) { setError('Enter a code.'); return; }
    setLoading(true);
    try {
      const results = await base44.entities.AccessCode.filter({ code: code.trim().toUpperCase(), visible: true });
      const usable = results.filter(r => !r.used || r.unlimited || (r.max_uses && (r.use_count || 0) < r.max_uses));
      if (usable.length === 0) {
        const any = await base44.entities.AccessCode.filter({ code: code.trim().toUpperCase() });
        setError(any.length > 0 ? 'This code has already been used.' : 'Invalid code.');
        setLoading(false); return;
      }
      const rec = usable[0];
      if (rec.plan_id) {
        const plans = getPlansConfig();
        const newPlan = plans.find(p => p.id === rec.plan_id);
        const billing = rec.billing || 'monthly';
        if (newPlan) {
          await base44.auth.updateMe({
            subscription_plan: newPlan.id,
            credits_limit: newPlan.credits_limit || 150_000,
            credits_used: 0,
            billing_cycle: billing,
            subscription_date: new Date().toISOString(),
            credits_reset_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
          });
          setSuccess(`Plan ${newPlan.name} (${billing === 'yearly' ? 'yearly' : 'monthly'}) activated!`);
          toast.success(`Plan ${newPlan.name} activated`);
        }
      } else if (rec.credits > 0) {
        await base44.auth.updateMe({ credits_bonus: (user?.credits_bonus || 0) + rec.credits });
        setSuccess(`+${rec.credits} credits added!`);
        toast.success(`+${rec.credits} credits`);
      }

      const historyEntry = { email: user?.email, userId: user?.id, at: new Date().toISOString() };
      const existingHistory = (() => { try { return JSON.parse(rec.used_by_history || '[]'); } catch { return []; } })();
      existingHistory.push(historyEntry);

      if (rec.unlimited) {
        await base44.entities.AccessCode.update(rec.id, { use_count: (rec.use_count || 0) + 1, used_by: user?.email, used_by_history: JSON.stringify(existingHistory) });
      } else {
        await base44.entities.AccessCode.update(rec.id, { used: true, used_by: user?.email, use_count: (rec.use_count || 0) + 1, used_by_history: JSON.stringify(existingHistory) });
      }

      writeAuditLog(user?.id, { action: 'save', resource_type: 'AccessCode', resource_id: rec.id, status: 'success', metadata: { code: rec.code, plan_id: rec.plan_id, credits: rec.credits, email: user?.email } }).catch(() => {});

      if (!rec.unlimited && (!rec.max_uses || (rec.use_count || 0) + 1 >= rec.max_uses)) {
        base44.entities.AccessCode.delete(rec.id).catch(() => {});
      }

      const updated = await base44.auth.me();
      if (setUser) setUser(updated);
      setCode('');
    } catch (e) {
      writeAuditLog(user?.id || 'anonymous', { action: 'save', resource_type: 'AccessCode', resource_id: 'failed_redemption', status: 'failed', error_message: e?.message || 'Validation error', metadata: { attempted_code: code.trim(), email: user?.email } }).catch(() => {});
      setError('Error during validation.');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: S.surface2, border: `1px solid ${S.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <Gift style={{ width: 14, height: 14, color: '#F95738' }} />
        <p style={{ fontSize: 13, fontWeight: 600, color: S.text, margin: 0 }}>Activate a code</p>
      </div>
      <p style={{ fontSize: 12, color: S.muted, margin: '0 0 12px', lineHeight: 1.5 }}>Enter an access code to activate a subscription.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); setSuccess(''); }}
          placeholder="XXXX-XXXX-XXXX"
          maxLength={24}
          onKeyDown={e => { if (e.key === 'Enter') handleRedeem(); }}
          style={{ ...inputStyle, flex: 1, border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}` }}
        />
        <button onClick={handleRedeem} disabled={loading || !code.trim()}
          style={{ padding: '10px 16px', background: code.trim() ? S.text : 'rgba(255,255,255,0.08)', color: code.trim() ? '#0A0A0B' : S.muted, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: code.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', transition: 'all 150ms' }}>
          {loading ? '...' : 'Activate'}
        </button>
      </div>
      {error && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>{error}</p>}
      {success && <p style={{ fontSize: 11, color: '#22c55e', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Check style={{ width: 10, height: 10 }} />{success}</p>}
    </div>
  );
}

function getRenewalDate(user) {
  const base = user?.subscription_date || user?.created_date;
  if (!base) return null;
  const d = new Date(base);
  const now = new Date();
  const yearly = user?.billing_cycle === 'yearly';
  if (yearly) { while (d <= now) d.setFullYear(d.getFullYear() + 1); }
  else { while (d <= now) d.setMonth(d.getMonth() + 1); }
  return d;
}

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user: authUser, refreshUser: refreshAuthUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [invoiceRequested, setInvoiceRequested] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAIDNAModal, setShowAIDNAModal] = useState(false);
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [cancelTicket, setCancelTicket] = useState(null);

  const loadUser = (u) => {
    if (!u) return;
    setUser(u);
    setFullName(u?.full_name || '');
    setInvoiceEmail(u?.email || '');
    setUserPlan(getUserPlan(u));
    if (u?.email) {
      base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: u.email }).then(ts => {
        if (ts.length > 0) setCancelTicket(ts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0]);
      }).catch(() => {});
    }
  };

  const handleSetUser = async (u) => {
    if (u) loadUser(u);
    if (refreshAuthUser) {
      const freshUser = await refreshAuthUser();
      if (freshUser) loadUser(freshUser);
    }
  };

  useEffect(() => {
    if (authUser?.id) {
      loadUser(authUser);
    } else {
      base44.auth.me().then(loadUser).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isYearly = user?.billing_cycle === 'yearly';

  const getDailyUsage = () => {
    try {
      const data = JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}');
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        return { date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), tensors: data[key] || 0 };
      });
    } catch { return []; }
  };

  const saveProfile = async () => {
    setProfileError('');
    if (!fullName.trim() || fullName.trim().length < 2) { setProfileError('Name must be at least 2 characters.'); return; }
    if (!user) return;
    setSavingProfile(true);
    await base44.auth.updateMe({ full_name: fullName.trim() });
    setSavingProfile(false);
    toast.success('Profile updated');
  };

  const requestInvoice = async () => {
    if (!user || !invoiceEmail.trim()) return;
    setInvoiceLoading(true);
    await base44.entities.SupportTicket.create({
      title: `Invoice request — ${user.full_name || user.email}`,
      description: `Invoice request for plan ${userPlan?.name}. Email: ${invoiceEmail.trim()}`,
      category: 'invoice', status: 'open',
      user_email: user.email, user_name: user.full_name || user.email,
      user_plan: userPlan?.name, invoice_email: invoiceEmail.trim(),
      messages_json: JSON.stringify([]),
    });
    setInvoiceLoading(false);
    setShowInvoiceModal(false);
    setInvoiceRequested(p => ({ ...p, [userPlan?.name]: true }));
    toast.success('Invoice request sent');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await base44.entities.User.delete(user.id);
    base44.auth.logout();
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'plan', label: 'Plan & Billing', icon: CreditCard },
    { id: 'usage', label: 'Usage', icon: Zap },
  ];

  if (!user) return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.4)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'Inter, system-ui, sans-serif', color: S.text }}>
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '40px 24px 100px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <button onClick={() => navigate('/app')} style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.muted, transition: 'background 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            <ArrowLeft style={{ width: 13, height: 13 }} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: S.text, margin: 0, letterSpacing: '-0.01em' }}>Settings</h1>
        </div>

        <div style={{ display: 'flex', gap: 36 }}>
          {/* Sidebar nav */}
          <nav style={{ width: 168, flexShrink: 0 }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                    padding: '8px 12px', borderRadius: 7, border: 'none',
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    cursor: 'pointer', fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    color: active ? S.text : S.muted,
                    fontFamily: 'Inter, sans-serif', textAlign: 'left',
                    marginBottom: 2, transition: 'all 120ms',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ── PROFILE ── */}
            {activeSection === 'profile' && (
              <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${S.border}` }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: S.text, margin: 0 }}>Account</p>
                  </div>
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: S.muted, marginBottom: 6, letterSpacing: '0.01em' }}>Email</label>
                      <input value={user?.email || ''} disabled style={{ ...inputStyle, opacity: 0.4, cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: S.muted, marginBottom: 6 }}>Full name</label>
                      <input value={fullName} onChange={e => setFullName(e.target.value)} style={{ ...inputStyle, border: `1px solid ${profileError ? '#ef4444' : 'rgba(255,255,255,0.1)'}` }}
                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
                        onBlur={e => e.currentTarget.style.borderColor = profileError ? '#ef4444' : 'rgba(255,255,255,0.1)'} />
                      {profileError && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{profileError}</p>}
                    </div>
                    <div>
                      <button onClick={saveProfile} disabled={savingProfile}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: S.text, color: S.bg, border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: savingProfile ? 0.6 : 1, transition: 'opacity 150ms' }}>
                        <Save style={{ width: 12, height: 12 }} />
                        {savingProfile ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ background: S.surface, border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(239,68,68,0.12)' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', margin: 0 }}>Danger zone</p>
                  </div>
                  <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: S.text, margin: '0 0 3px' }}>Delete account</p>
                      <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>Permanently delete your account and all data.</p>
                    </div>
                    <button onClick={() => setShowDeleteModal(true)}
                      style={{ padding: '7px 14px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 120ms' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── PLAN ── */}
            {activeSection === 'plan' && (
              <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Current plan card */}
                <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${S.border}` }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: S.muted2, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Current plan</p>
                  </div>
                  <div style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <p style={{ fontSize: 17, fontWeight: 700, color: S.text, margin: 0 }}>{userPlan?.name || 'Free'}</p>
                          {isYearly && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(249,87,56,0.15)', color: '#F95738', letterSpacing: '0.04em' }}>YEARLY</span>}
                          {!isYearly && userPlan?.price_monthly > 0 && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(59,139,235,0.15)', color: '#3B8BEB', letterSpacing: '0.04em' }}>MONTHLY</span>}
                        </div>
                        <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>
                          {isYearly ? `$${userPlan?.price_yearly || (userPlan?.price_monthly * 12)}/mo (billed annually)` : userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/mo` : 'Free forever'}
                        </p>
                        {getRenewalDate(user) && userPlan?.price_monthly > 0 && (
                          <p style={{ fontSize: 11, color: S.muted2, margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock style={{ width: 10, height: 10 }} />
                            Renews {formatDate(getRenewalDate(user))}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: S.muted, border: `1px solid ${S.border}` }}>
                        {userPlan?.credits_limit ? `${userPlan.credits_limit.toLocaleString('en-US')} credits/mo` : 'Free'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate('/manage-plan')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${S.border}`, borderRadius: 7, fontSize: 12, color: S.muted, cursor: 'pointer', transition: 'background 120ms' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                        Manage <ChevronRight style={{ width: 11, height: 11 }} />
                      </button>
                      <button onClick={() => navigate('/pricing')}
                        style={{ padding: '7px 16px', background: '#F95738', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', transition: 'opacity 150ms' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        Upgrade plan
                      </button>
                    </div>
                  </div>
                </div>

                <CodeRedeemer user={user} setUser={handleSetUser} />

                {userPlan?.price_monthly > 0 && (
                  <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 18px', borderBottom: `1px solid ${S.border}` }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: S.muted2, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Billing history</p>
                    </div>
                    <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: S.text, margin: '0 0 3px' }}>{userPlan.name}</p>
                        <p style={{ fontSize: 11, color: S.muted, margin: 0 }}>Since {formatDate(user?.subscription_date || user?.created_date)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {cancelTicket?.cancel_status === 'pending' && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>PENDING</span>}
                        {cancelTicket?.cancel_status === 'approved' && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>CANCELLED</span>}
                        {!cancelTicket && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>ACTIVE</span>}
                        <button onClick={() => setShowInvoiceModal(true)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${S.border}`, borderRadius: 5, fontSize: 11, fontWeight: 500, color: invoiceRequested[userPlan.name] ? '#22c55e' : S.muted, cursor: 'pointer' }}>
                          <Download style={{ width: 10, height: 10 }} />
                          {invoiceRequested[userPlan.name] ? 'Sent' : 'Invoice'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── USAGE ── */}
            {activeSection === 'usage' && (
              <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, color: S.muted2, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Current plan</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: S.text, margin: 0 }}>{userPlan?.name || 'Free'}</p>
                  </div>
                  <button onClick={() => navigate('/pricing')}
                    style={{ padding: '7px 14px', background: '#F95738', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                    Upgrade
                  </button>
                </div>

                <CreditsBar user={user} variant="settings" />

                <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: '16px 18px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: S.muted, margin: '0 0 16px' }}>Activity — last 7 days</p>
                  <ResponsiveContainer width="100%" height={90}>
                    <BarChart data={getDailyUsage()} barSize={14}>
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 11, background: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff' }} />
                      <Bar dataKey="tensors" fill="#F95738" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AISettingsModal open={showAIDNAModal} onClose={() => setShowAIDNAModal(false)} />

      {/* Invoice modal */}
      {showInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowInvoiceModal(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.border}` }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: S.text, margin: 0 }}>Request an invoice</p>
              <button onClick={() => setShowInvoiceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.muted }}><X style={{ width: 14, height: 14 }} /></button>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 12, color: S.muted, margin: '0 0 12px', lineHeight: 1.5 }}>Enter the email used for your payment.</p>
              <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)} placeholder="email@example.com" style={{ ...inputStyle, marginBottom: 12 }} />
              <button onClick={requestInvoice} disabled={invoiceLoading || !invoiceEmail.trim()}
                style={{ width: '100%', padding: '10px 0', background: S.text, color: S.bg, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: invoiceLoading || !invoiceEmail.trim() ? 0.5 : 1 }}>
                {invoiceLoading ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: S.surface, border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', margin: 0 }}>Delete account</p>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 12, color: S.muted, margin: '0 0 12px', lineHeight: 1.5 }}>This action is irreversible. All your data will be permanently deleted.</p>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '8px 12px', marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>Account: <strong style={{ color: S.text }}>{user?.email}</strong></p>
              </div>
              <button onClick={deleteAccount} style={{ width: '100%', padding: '10px 0', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
                Confirm deletion
              </button>
              <button onClick={() => setShowDeleteModal(false)} style={{ width: '100%', padding: '10px 0', background: 'transparent', color: S.muted, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}