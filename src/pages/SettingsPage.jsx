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

const DK = { bg: '#1F1F1F', surface: '#141414', border: '#2A2A2A', text: '#fff', muted: '#888' };

const inputStyle = {
  width: '100%', background: '#141414', border: '1px solid #2A2A2A',
  borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#fff',
  outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
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
        await base44.entities.AccessCode.update(rec.id, {
          use_count: (rec.use_count || 0) + 1,
          used_by: user?.email,
          used_by_history: JSON.stringify(existingHistory),
        });
      } else {
        await base44.entities.AccessCode.update(rec.id, {
          used: true, used_by: user?.email,
          use_count: (rec.use_count || 0) + 1,
          used_by_history: JSON.stringify(existingHistory),
        });
      }

      writeAuditLog(user?.id, {
        action: 'save',
        resource_type: 'AccessCode',
        resource_id: rec.id,
        status: 'success',
        metadata: { code: rec.code, plan_id: rec.plan_id, credits: rec.credits, email: user?.email },
      }).catch(() => {});

      // Auto-delete single-use codes after successful redemption
      if (!rec.unlimited && (!rec.max_uses || (rec.use_count || 0) + 1 >= rec.max_uses)) {
        base44.entities.AccessCode.delete(rec.id).catch(() => {});
      }

      const updated = await base44.auth.me();
      if (setUser) setUser(updated);
      setCode('');
    } catch (e) {
      writeAuditLog(user?.id || 'anonymous', {
        action: 'save',
        resource_type: 'AccessCode',
        resource_id: 'failed_redemption',
        status: 'failed',
        error_message: e?.message || 'Validation error',
        metadata: { attempted_code: code.trim(), email: user?.email },
      }).catch(() => {});
      setError('Error during validation.');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: DK.surface, border: `1px solid ${DK.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <Gift style={{ width: 14, height: 14, color: '#F95738' }} />
        <p style={{ fontSize: 13, fontWeight: 600, color: DK.text, margin: 0 }}>Activate a code</p>
      </div>
      <p style={{ fontSize: 12, color: DK.muted, margin: '0 0 12px', lineHeight: 1.5 }}>Enter an access code to activate a subscription.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); setSuccess(''); }}
          placeholder="XXXX-XXXX-XXXX"
          maxLength={24}
          onKeyDown={e => { if (e.key === 'Enter') handleRedeem(); }}
          style={{ ...inputStyle, flex: 1, border: `1px solid ${error ? '#ef4444' : DK.border}` }}
        />
        <button onClick={handleRedeem} disabled={loading || !code.trim()}
          style={{ padding: '10px 16px', background: !code.trim() ? '#2A2A2A' : '#fff', color: !code.trim() ? '#555' : '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: code.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', transition: 'opacity 150ms' }}>
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

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      setFullName(u?.full_name || '');
      setInvoiceEmail(u?.email || '');
      const plan = getUserPlan(u);
      setUserPlan(plan);
      if (u?.email) {
        base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: u.email }).then(ts => {
          if (ts.length > 0) setCancelTicket(ts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0]);
        }).catch(() => {});
      }
    }).catch(() => {});
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
    <div style={{ minHeight: '100vh', background: DK.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2A2A2A' }} />
          <div style={{ width: 110, height: 20, borderRadius: 6, background: '#2A2A2A' }} />
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[120, 150, 100].map((w, i) => (
              <div key={i} style={{ height: 36, borderRadius: 8, background: '#1A1A1A', width: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)', backgroundSize: '200% 100%', animation: 'sk 1.4s ease-in-out infinite' }} />
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 52, borderRadius: 8, background: '#141414', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)', backgroundSize: '200% 100%', animation: `sk 1.4s ease-in-out ${i*0.1}s infinite` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: DK.bg, fontFamily: 'Inter, system-ui, sans-serif', color: DK.text }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 8, background: '#2A2A2A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: DK.text, margin: 0 }}>Settings</h1>
        </div>

        <div style={{ display: 'flex', gap: 32 }}>
          {/* Sidebar */}
          <nav style={{ width: 180, flexShrink: 0 }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: active ? '#2A2A2A' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? DK.text : DK.muted, fontFamily: 'Inter, sans-serif', textAlign: 'left', marginBottom: 2, transition: 'all 120ms' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#1A1A1A'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  <Icon style={{ width: 14, height: 14 }} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* PROFILE */}
            {activeSection === 'profile' && (
              <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: DK.muted, marginBottom: 6 }}>Email (read-only)</label>
                  <input value={user?.email || ''} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: DK.muted, marginBottom: 6 }}>Full name</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} style={{ ...inputStyle, border: `1px solid ${profileError ? '#ef4444' : DK.border}` }} />
                  {profileError && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{profileError}</p>}
                </div>
                <button onClick={saveProfile} disabled={savingProfile}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', opacity: savingProfile ? 0.6 : 1 }}>
                  <Save style={{ width: 13, height: 13 }} />
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${DK.border}` }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DK.text, margin: '0 0 6px' }}>Delete account</p>
                  <p style={{ fontSize: 12, color: DK.muted, margin: '0 0 12px', lineHeight: 1.5 }}>This action is irreversible. All your data will be deleted.</p>
                  <button onClick={() => setShowDeleteModal(true)}
                    style={{ padding: '9px 16px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Delete my account
                  </button>
                </div>
              </div>
            )}

            {/* PLAN */}
            {activeSection === 'plan' && (
              <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: DK.surface, border: `1px solid ${DK.border}`, borderRadius: 12, padding: 18 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Current plan</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: DK.text, margin: 0 }}>{userPlan?.name || 'Free'}</p>
                        {isYearly && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(249,87,56,0.12)', color: '#F95738' }}>YEARLY</span>}
                        {!isYearly && userPlan?.price_monthly > 0 && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(59,139,235,0.12)', color: '#3B8BEB' }}>MONTHLY</span>}
                      </div>
                      <p style={{ fontSize: 12, color: DK.muted, margin: 0 }}>
                        {isYearly
                          ? `$${userPlan?.price_yearly || (userPlan?.price_monthly * 12)}/yr`
                          : userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/mo` : 'Free'}
                      </p>
                      {getRenewalDate(user) && userPlan?.price_monthly > 0 && (
                        <p style={{ fontSize: 11, color: '#555', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock style={{ width: 10, height: 10 }} />
                          {isYearly ? 'Yearly renewal on' : 'Monthly renewal on'} {formatDate(getRenewalDate(user))}
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#2A2A2A', color: DK.muted }}>
                      {userPlan?.credits_limit ? `${userPlan.credits_limit.toLocaleString('en-US')} credits/mo` : 'Free'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button onClick={() => navigate('/manage-plan')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: 'transparent', border: `1px solid ${DK.border}`, borderRadius: 7, fontSize: 12, color: DK.muted, cursor: 'pointer' }}>
                      Manage <ChevronRight style={{ width: 11, height: 11 }} />
                    </button>
                    <button onClick={() => navigate('/pricing')}
                      style={{ padding: '7px 14px', background: '#F95738', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                      Upgrade your plan
                    </button>
                  </div>
                </div>

                <CodeRedeemer user={user} setUser={setUser} />

                {userPlan?.price_monthly > 0 && (
                  <div style={{ background: DK.surface, border: `1px solid ${DK.border}`, borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 16px', borderBottom: `1px solid ${DK.border}` }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Billing history</p>
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: DK.text, margin: '0 0 2px' }}>{userPlan.name}</p>
                        <p style={{ fontSize: 11, color: DK.muted, margin: 0 }}>
                          Since {formatDate(user?.subscription_date || user?.created_date)}
                          {isYearly && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: '#2A2A2A', color: '#888' }}>Yearly</span>}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {cancelTicket?.cancel_status === 'pending' && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>CANCELLATION PENDING</span>}
                        {cancelTicket?.cancel_status === 'approved' && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>CANCELLED</span>}
                        {!cancelTicket && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>ACTIVE</span>}
                        <button onClick={() => setShowInvoiceModal(true)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 9px', background: '#2A2A2A', border: 'none', borderRadius: 5, fontSize: 10, fontWeight: 600, color: invoiceRequested[userPlan.name] ? '#22c55e' : DK.muted, cursor: 'pointer' }}>
                          <Download style={{ width: 10, height: 10 }} />
                          {invoiceRequested[userPlan.name] ? 'Sent' : 'Invoice'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* USAGE */}
            {activeSection === 'usage' && (
              <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#141414', border: `1px solid ${DK.border}`, borderRadius: 10 }}>
                  <div>
                    <p style={{ fontSize: 10, color: '#555', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Current plan</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: DK.text, margin: 0 }}>{userPlan?.name || 'Free'}</p>
                  </div>
                  <button onClick={() => navigate('/pricing')}
                    style={{ padding: '7px 12px', background: '#F95738', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                    Upgrade
                  </button>
                </div>

                <CreditsBar user={user} variant="settings" />

                <div style={{ background: DK.surface, border: `1px solid ${DK.border}`, borderRadius: 10, padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DK.muted, margin: '0 0 14px' }}>Activity — last 7 days</p>
                  <ResponsiveContainer width="100%" height={90}>
                    <BarChart data={getDailyUsage()} barSize={14}>
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 11, background: '#141414', border: '1px solid #2A2A2A', borderRadius: 6, color: '#fff' }} />
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowInvoiceModal(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#141414', border: `1px solid ${DK.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${DK.border}` }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: DK.text, margin: 0 }}>Request an invoice</p>
              <button onClick={() => setShowInvoiceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><X style={{ width: 14, height: 14 }} /></button>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 12, color: DK.muted, margin: '0 0 12px', lineHeight: 1.5 }}>Enter the email used for your payment.</p>
              <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)} placeholder="email@example.com" style={{ ...inputStyle, marginBottom: 12 }} />
              <button onClick={requestInvoice} disabled={invoiceLoading || !invoiceEmail.trim()}
                style={{ width: '100%', padding: '10px 0', background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: invoiceLoading || !invoiceEmail.trim() ? 0.5 : 1 }}>
                {invoiceLoading ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#141414', border: `1px solid ${DK.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px 12px', background: 'rgba(239,68,68,0.1)', borderBottom: `1px solid rgba(239,68,68,0.2)` }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', margin: 0 }}>Delete account</p>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 12, color: DK.muted, margin: '0 0 12px', lineHeight: 1.5 }}>This action is irreversible. All your data will be deleted.</p>
              <div style={{ background: '#1A1A1A', borderRadius: 7, padding: '8px 12px', marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: DK.muted, margin: 0 }}>Email: <strong style={{ color: DK.text }}>{user?.email}</strong></p>
              </div>
              <button onClick={deleteAccount} style={{ width: '100%', padding: '10px 0', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
                Confirm deletion
              </button>
              <button onClick={() => setShowDeleteModal(false)} style={{ width: '100%', padding: '10px 0', background: 'transparent', color: DK.muted, border: `1px solid ${DK.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}