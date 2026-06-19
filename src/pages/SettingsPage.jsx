import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Save, Gift, Clock, X, Download, ChevronRight, Check, ChevronLeft, Search,
         User, CreditCard, Zap, BarChart2, Database, Activity, Shield } from 'lucide-react';
import { writeAuditLog } from '@/lib/serverGuard';
import AISettingsModal from '@/components/settings/AISettingsModal';
import { getUserPlan, getPlansConfig, loadPlansFromDB, COMPARISON_FEATURES, DEFAULT_PLANS } from '@/lib/plans-config';
import CreditsBar from '@/components/CreditsBar';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

const F = 'Inter, system-ui, sans-serif';
const BG = '#F9F9F8';
const BORDER = 'rgba(0,0,0,0.07)';

// ── Shared input style ──
const inp = {
  width: '100%', background: '#F5F5F3', border: '1px solid rgba(0,0,0,0.10)',
  borderRadius: 6, padding: '7px 10px', fontSize: 13, color: '#111',
  outline: 'none', fontFamily: F, boxSizing: 'border-box',
};

// ── Row: label+desc left, control right ──
function Row({ label, description, children, last = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', gap: 24, borderBottom: last ? 'none' : `1px solid ${BORDER}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, color: '#111', margin: 0, lineHeight: 1.35 }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.42)', margin: '2px 0 0', lineHeight: 1.4 }}>{description}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: 0, letterSpacing: '-0.015em' }}>{children}</h2>
      {sub && <p style={{ fontSize: 12.5, color: 'rgba(0,0,0,0.42)', margin: '3px 0 0' }}>{sub}</p>}
    </div>
  );
}

// ── Billing toggle ──
function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width: 36, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2, background: on ? '#5B5FEF' : 'rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background 180ms', flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
    </button>
  );
}

// ── Plan comparison cell ──
function Cell({ value }) {
  if (value === undefined || value === null || value === '-' || value === '') return <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: 13 }}>—</span>;
  if (value === true || value === 'Yes') return <Check style={{ width: 13, height: 13, color: 'rgba(0,0,0,0.5)' }} />;
  if (value === false) return <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: 13 }}>—</span>;
  return <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>{value}</span>;
}

// ── Code redeemer ──
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
          await base44.auth.updateMe({ subscription_plan: newPlan.id, credits_limit: newPlan.credits_limit || 150_000, credits_used: 0, billing_cycle: billing, subscription_date: new Date().toISOString(), credits_reset_at: new Date(Date.now() + 30 * 86_400_000).toISOString() });
          setSuccess(`Plan ${newPlan.name} activated!`);
          toast.success(`Plan ${newPlan.name} activated`);
        }
      } else if (rec.credits > 0) {
        await base44.auth.updateMe({ credits_bonus: (user?.credits_bonus || 0) + rec.credits });
        setSuccess(`+${rec.credits} credits added!`);
        toast.success(`+${rec.credits} credits`);
      }
      const histEntry = { email: user?.email, userId: user?.id, at: new Date().toISOString() };
      const hist = (() => { try { return JSON.parse(rec.used_by_history || '[]'); } catch { return []; } })();
      hist.push(histEntry);
      if (rec.unlimited) {
        await base44.entities.AccessCode.update(rec.id, { use_count: (rec.use_count || 0) + 1, used_by: user?.email, used_by_history: JSON.stringify(hist) });
      } else {
        await base44.entities.AccessCode.update(rec.id, { used: true, used_by: user?.email, use_count: (rec.use_count || 0) + 1, used_by_history: JSON.stringify(hist) });
      }
      writeAuditLog(user?.id, { action: 'save', resource_type: 'AccessCode', resource_id: rec.id, status: 'success', metadata: { code: rec.code } }).catch(() => {});
      if (!rec.unlimited && (!rec.max_uses || (rec.use_count || 0) + 1 >= rec.max_uses)) base44.entities.AccessCode.delete(rec.id).catch(() => {});
      const updated = await base44.auth.me();
      if (setUser) setUser(updated);
      setCode('');
    } catch (e) {
      setError('Error during validation.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); setSuccess(''); }}
          placeholder="XXXX-XXXX-XXXX" maxLength={24}
          onKeyDown={e => e.key === 'Enter' && handleRedeem()}
          style={{ ...inp, flex: 1, border: `1px solid ${error ? '#ef4444' : 'rgba(0,0,0,0.10)'}` }} />
        <button onClick={handleRedeem} disabled={loading || !code.trim()}
          style={{ padding: '7px 14px', background: code.trim() ? '#111' : '#EBEBEA', color: code.trim() ? '#fff' : '#aaa', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: code.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
          {loading ? '…' : 'Activate'}
        </button>
      </div>
      {error && <p style={{ fontSize: 11.5, color: '#ef4444', margin: 0 }}>{error}</p>}
      {success && <p style={{ fontSize: 11.5, color: '#16a34a', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}><Check style={{ width: 10, height: 10 }} />{success}</p>}
    </div>
  );
}

function getRenewalDate(user) {
  const base = user?.subscription_date || user?.created_date;
  if (!base) return null;
  const d = new Date(base);
  const now = new Date();
  if (user?.billing_cycle === 'yearly') { while (d <= now) d.setFullYear(d.getFullYear() + 1); }
  else { while (d <= now) d.setMonth(d.getMonth() + 1); }
  return d;
}
const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

// ── Sidebar nav item ──
function NavItem({ label, icon: Icon, active, onClick, indent = false }) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: indent ? '5px 10px 5px 22px' : '5px 10px', borderRadius: 5, border: 'none', background: active ? 'rgba(0,0,0,0.07)' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: active ? 500 : 400, color: active ? '#111' : 'rgba(0,0,0,0.52)', fontFamily: F, textAlign: 'left', transition: 'background 100ms' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(0,0,0,0.07)' : 'transparent'; }}>
      {Icon && <Icon style={{ width: 13, height: 13, flexShrink: 0, opacity: 0.65 }} />}
      {label}
    </button>
  );
}

function NavGroup({ label }) {
  return <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.33)', margin: '12px 0 2px 10px' }}>{label}</p>;
}

// ══════════════════════════════════════════════════════════════════
// BILLING TAB — full inline pricing replica (Image 2)
// ══════════════════════════════════════════════════════════════════
function BillingTab({ user, userPlan, navigate, setUser, refreshAuthUser }) {
  const [plans, setPlans] = useState([]);
  const [billingYearly, setBillingYearly] = useState({});
  const [showContact, setShowContact] = useState(false);
  const [invoiceRequested, setInvoiceRequested] = useState({});
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceEmail, setInvoiceEmail] = useState(user?.email || '');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [cancelTicket, setCancelTicket] = useState(null);
  const [view, setView] = useState('plans'); // 'plans' | 'billing'

  useEffect(() => {
    loadPlansFromDB()
      .then(dbPlans => setPlans(dbPlans || DEFAULT_PLANS))
      .catch(() => setPlans(DEFAULT_PLANS));
    if (user?.email) {
      base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: user.email })
        .then(ts => { if (ts.length > 0) setCancelTicket(ts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0]); })
        .catch(() => {});
    }
  }, []);

  // Default all paid plans to yearly
  useEffect(() => {
    if (plans.length === 0) return;
    const defaults = {};
    plans.forEach(p => { if (p.price_monthly > 0 && p.checkout_url_yearly) defaults[p.id] = true; });
    setBillingYearly(defaults);
  }, [plans]);

  const allPlans = plans.length > 0 ? plans : DEFAULT_PLANS;
  const isYearly = user?.billing_cycle === 'yearly';

  // Determine next-tier plan (current + 1)
  const currentIdx = allPlans.findIndex(p => p.id === userPlan?.id);
  const highlightPlanId = currentIdx >= 0 && currentIdx < allPlans.length - 1 ? allPlans[currentIdx + 1].id : null;

  const handleUpgrade = (plan) => {
    const yearly = billingYearly[plan.id];
    const url = yearly ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (url?.startsWith('http')) { window.location.href = url; return; }
    navigate(`/checkout?plan=${plan.id}&billing=${yearly ? 'yearly' : 'monthly'}`);
  };

  const requestInvoice = async () => {
    if (!user || !invoiceEmail.trim()) return;
    setInvoiceLoading(true);
    await base44.entities.SupportTicket.create({ title: `Invoice — ${user.full_name || user.email}`, description: `Invoice for plan ${userPlan?.name}. Email: ${invoiceEmail.trim()}`, category: 'invoice', status: 'open', user_email: user.email, user_name: user.full_name || user.email, user_plan: userPlan?.name, invoice_email: invoiceEmail.trim(), messages_json: JSON.stringify([]) });
    setInvoiceLoading(false); setShowInvoiceModal(false);
    setInvoiceRequested(p => ({ ...p, [userPlan?.name]: true }));
    toast.success('Invoice request sent');
  };

  return (
    <div>
      {/* Top summary — like "You are on the Free plan" */}
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Plans</h1>
      <p style={{ fontSize: 13.5, color: 'rgba(0,0,0,0.5)', margin: '0 0 28px', lineHeight: 1.5 }}>
        You are on the <strong style={{ color: '#111' }}>{userPlan?.name || 'Free'} plan</strong>.{' '}
        {userPlan?.price_monthly > 0 && (
          <span>If you have questions about your subscription, <button onClick={() => setShowContact(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B5FEF', fontSize: 13.5, fontFamily: F, padding: 0, textDecoration: 'underline' }}>contact us</button>.</span>
        )}
      </p>

      {/* Plan cards — horizontal row */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${allPlans.length}, 1fr)`, gap: 0, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', background: BG, marginBottom: 0 }}>
        {allPlans.map((plan, idx) => {
          const isCurrent = plan.id === userPlan?.id;
          const isHighlight = plan.id === highlightPlanId;
          const isFree = plan.price_monthly === 0;
          const yearly = billingYearly[plan.id];
          const priceDisplay = yearly && plan.price_yearly ? plan.price_yearly : plan.price_monthly;

          return (
            <div key={plan.id} style={{
              padding: '20px 18px 18px',
              background: isHighlight ? '#FFFFFF' : 'transparent',
              borderRight: idx < allPlans.length - 1 ? `1px solid ${BORDER}` : 'none',
              position: 'relative',
            }}>
              {/* Plan name */}
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>{plan.name}</p>

              {/* Price */}
              {isFree ? (
                <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', margin: '0 0 10px' }}>$0 per user/month</p>
              ) : (
                <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', margin: '0 0 10px' }}>
                  <strong style={{ color: '#111', fontSize: 14 }}>${priceDisplay}</strong> per user/month
                </p>
              )}

              {/* Billing note */}
              {isFree && <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', margin: '0 0 10px', minHeight: 18 }}>Free for everyone</p>}
              {!isFree && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  {plan.checkout_url_yearly && <Toggle on={!!yearly} onToggle={() => setBillingYearly(b => ({ ...b, [plan.id]: !b[plan.id] }))} />}
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Billed yearly</span>
                </div>
              )}
              {isFree && <div style={{ height: 26, marginBottom: 10 }} />}

              {/* CTA button */}
              {isCurrent ? (
                <button style={{ width: '100%', padding: '7px 0', borderRadius: 7, fontSize: 13, fontWeight: 500, fontFamily: F, background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,0,0,0.10)', cursor: 'default' }}>
                  Current plan
                </button>
              ) : isHighlight ? (
                <button onClick={() => handleUpgrade(plan)}
                  style={{ width: '100%', padding: '7px 0', borderRadius: 7, fontSize: 13, fontWeight: 600, fontFamily: F, background: '#5B5FEF', color: '#fff', border: 'none', cursor: 'pointer', transition: 'opacity 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Upgrade
                </button>
              ) : isFree ? (
                <button onClick={() => navigate('/app')}
                  style={{ width: '100%', padding: '7px 0', borderRadius: 7, fontSize: 13, fontWeight: 500, fontFamily: F, background: 'transparent', color: 'rgba(0,0,0,0.45)', border: '1px solid rgba(0,0,0,0.10)', cursor: 'pointer' }}>
                  Get started
                </button>
              ) : (
                <button onClick={() => handleUpgrade(plan)}
                  style={{ width: '100%', padding: '7px 0', borderRadius: 7, fontSize: 13, fontWeight: 500, fontFamily: F, background: '#111', color: '#fff', border: 'none', cursor: 'pointer', transition: 'opacity 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.78'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Upgrade
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div style={{ overflowX: 'auto', marginTop: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: F, minWidth: allPlans.length * 140 + 180 }}>
          <tbody>
            {COMPARISON_FEATURES.map((group) => (
              <>
                <tr key={`g-${group.category}`}>
                  <td colSpan={allPlans.length + 1} style={{ padding: '18px 0 6px', fontSize: 13, fontWeight: 600, color: '#111', borderTop: `1px solid ${BORDER}` }}>
                    {group.category}
                  </td>
                </tr>
                {group.items.map((item, ri) => (
                  <tr key={item.name} style={{ borderTop: `1px solid rgba(0,0,0,0.04)` }}>
                    <td style={{ padding: '9px 0', fontSize: 13, color: 'rgba(0,0,0,0.55)', width: 180 }}>{item.name}</td>
                    {allPlans.map(plan => (
                      <td key={plan.id} style={{ padding: '9px 16px', fontSize: 13, background: plan.id === highlightPlanId ? 'rgba(91,95,239,0.04)' : 'transparent' }}>
                        <Cell value={item[plan.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Redeem code */}
      <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>Redeem access code</p>
        <p style={{ fontSize: 12.5, color: 'rgba(0,0,0,0.42)', margin: '0 0 12px' }}>Enter a code to activate a plan or add credits.</p>
        <CodeRedeemer user={user} setUser={setUser} />
      </div>

      {/* Billing history */}
      {userPlan?.price_monthly > 0 && (
        <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Billing history</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: '0 0 2px' }}>{userPlan.name}</p>
              <p style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.42)', margin: 0 }}>
                Since {fmtDate(user?.subscription_date || user?.created_date)}
                {isYearly && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'rgba(0,0,0,0.06)', color: '#555' }}>Yearly</span>}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {cancelTicket?.cancel_status === 'pending' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>PENDING</span>}
              {cancelTicket?.cancel_status === 'approved' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>CANCELLED</span>}
              {!cancelTicket && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>ACTIVE</span>}
              <button onClick={() => setShowInvoiceModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#F5F5F3', border: `1px solid ${BORDER}`, borderRadius: 5, fontSize: 12, fontWeight: 500, color: invoiceRequested[userPlan.name] ? '#16a34a' : '#555', cursor: 'pointer' }}>
                <Download style={{ width: 11, height: 11 }} />
                {invoiceRequested[userPlan.name] ? 'Sent' : 'Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice modal */}
      {showInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowInvoiceModal(false)}>
          <div style={{ width: '100%', maxWidth: 360, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>Request an invoice</p>
              <button onClick={() => setShowInvoiceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X style={{ width: 14, height: 14 }} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 12.5, color: 'rgba(0,0,0,0.45)', margin: '0 0 10px', lineHeight: 1.5 }}>Enter the email address used for your payment.</p>
              <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)} placeholder="email@example.com" style={{ ...inp, marginBottom: 12 }} />
              <button onClick={requestInvoice} disabled={invoiceLoading || !invoiceEmail.trim()}
                style={{ width: '100%', padding: '9px 0', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: invoiceLoading || !invoiceEmail.trim() ? 0.5 : 1 }}>
                {invoiceLoading ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN SETTINGS PAGE
// ══════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const navigate = useNavigate();
  const { user: authUser, refreshUser: refreshAuthUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAIDNAModal, setShowAIDNAModal] = useState(false);

  const loadUser = (u) => {
    if (!u) return;
    setUser(u); setFullName(u?.full_name || '');
    setUserPlan(getUserPlan(u));
  };

  const handleSetUser = async (u) => {
    if (u) loadUser(u);
    if (refreshAuthUser) { const fresh = await refreshAuthUser(); if (fresh) loadUser(fresh); }
  };

  useEffect(() => {
    if (authUser?.id) loadUser(authUser);
    else base44.auth.me().then(loadUser).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async () => {
    setProfileError('');
    if (!fullName.trim() || fullName.trim().length < 2) { setProfileError('Name must be at least 2 characters.'); return; }
    if (!user) return;
    setSavingProfile(true);
    await base44.auth.updateMe({ full_name: fullName.trim() });
    setSavingProfile(false);
    toast.success('Profile updated');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await base44.entities.User.delete(user.id);
    base44.auth.logout();
  };

  const getDailyUsage = () => {
    try {
      const data = JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}');
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        return { date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), credits: data[key] || 0 };
      });
    } catch { return []; }
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, border: '2px solid #E5E5E0', borderTopColor: '#999', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Sidebar nav structure ──
  const sidebarSections = [
    {
      group: 'Personal',
      items: [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'usage', label: 'Usage', icon: BarChart2 },
        { id: 'security', label: 'Security', icon: Shield },
      ],
    },
    {
      group: null,
      items: [],
      bottom: true,
    },
  ];

  const sectionLabel = { profile: 'Profile', usage: 'Usage', security: 'Security', billing: 'Plans', notifications: 'Notifications' };

  return (
    <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: F, overflow: 'hidden' }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: 196, flexShrink: 0, background: '#F3F3F1', borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {/* Back */}
        <div style={{ padding: '14px 10px 10px' }}>
          <button onClick={() => navigate('/app')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: 'rgba(0,0,0,0.42)', fontFamily: F, padding: '4px 2px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#111'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.42)'}>
            <ChevronLeft style={{ width: 13, height: 13 }} />
            Back to app
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 10px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px 10px' }}>
            <Search style={{ width: 12, height: 12, color: 'rgba(0,0,0,0.3)', flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12.5, color: '#111', fontFamily: F }} />
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: '0 6px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <NavGroup label="Personal" />
          <NavItem label="Profile" icon={User} active={activeSection === 'profile'} onClick={() => setActiveSection('profile')} />
          <NavItem label="Usage" icon={Zap} active={activeSection === 'usage'} onClick={() => setActiveSection('usage')} />

          {/* Bottom: Plan & Billing */}
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 8, marginBottom: 10 }}>
            <NavItem label="Billing" icon={CreditCard} active={activeSection === 'billing'} onClick={() => setActiveSection('billing')} />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 52px 80px', background: BG }}>
        <div style={{ maxWidth: 660 }}>

          {/* ── PROFILE ── */}
          {activeSection === 'profile' && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 28px', letterSpacing: '-0.02em' }}>Profile</h1>
              <SectionTitle children="General" />
              <div style={{ marginTop: 8 }}>
                <Row label="Email" description="Your login email — cannot be changed.">
                  <input value={user?.email || ''} disabled style={{ ...inp, width: 230, opacity: 0.45, cursor: 'not-allowed', background: '#ECECEA' }} />
                </Row>
                <Row label="Full name" description="Your display name across the app." last>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div>
                      <input value={fullName} onChange={e => setFullName(e.target.value)}
                        style={{ ...inp, width: 200, border: `1px solid ${profileError ? '#ef4444' : 'rgba(0,0,0,0.10)'}` }}
                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.28)'}
                        onBlur={e => e.currentTarget.style.borderColor = profileError ? '#ef4444' : 'rgba(0,0,0,0.10)'} />
                      {profileError && <p style={{ fontSize: 11, color: '#ef4444', margin: '3px 0 0' }}>{profileError}</p>}
                    </div>
                    <button onClick={saveProfile} disabled={savingProfile}
                      style={{ padding: '7px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: savingProfile ? 0.55 : 1, whiteSpace: 'nowrap' }}>
                      {savingProfile ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </Row>
              </div>

              <div style={{ height: 32 }} />
              <SectionTitle children="Danger zone" />
              <div style={{ marginTop: 8 }}>
                <Row label="Delete account" description="Permanently delete your account and all data. This cannot be undone." last>
                  <button onClick={() => setShowDeleteModal(true)}
                    style={{ padding: '7px 14px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    Delete account
                  </button>
                </Row>
              </div>
            </div>
          )}

          {/* ── USAGE ── */}
          {activeSection === 'usage' && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 28px', letterSpacing: '-0.02em' }}>Usage</h1>

              <SectionTitle children="Credits" sub="Credits consumed in your current billing cycle." />
              <div style={{ marginTop: 12, marginBottom: 28 }}>
                <Row label="Current plan" description={userPlan?.name === 'Free' ? 'Free tier' : `${userPlan?.credits_limit?.toLocaleString('en-US')} credits / month`}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{userPlan?.name || 'Free'}</span>
                    <button onClick={() => setActiveSection('billing')}
                      style={{ padding: '4px 10px', background: '#5B5FEF', color: '#fff', border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Upgrade
                    </button>
                  </div>
                </Row>
                <Row label="Credits used" description="Resets every billing cycle." last>
                  <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>
                    {(user?.credits_used || 0).toLocaleString('en-US')} / {(user?.credits_limit || 150000).toLocaleString('en-US')}
                  </span>
                </Row>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px 16px', marginBottom: 28 }}>
                <CreditsBar user={user} variant="settings" />
              </div>

              <SectionTitle children="Activity" sub="Credits used over the last 7 days." />
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '16px 16px 10px', marginTop: 12 }}>
                <ResponsiveContainer width="100%" height={90}>
                  <BarChart data={getDailyUsage()} barSize={14}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 6, color: '#111' }} />
                    <Bar dataKey="credits" fill="#5B5FEF" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ height: 28 }} />
              <SectionTitle children="Backend metrics" sub="Platform usage for this workspace." />
              <div style={{ marginTop: 12 }}>
                {[
                  { label: 'Database rows', description: 'Total entity records stored', value: '—' },
                  { label: 'API calls', description: 'Requests processed this month', value: '—' },
                  { label: 'File storage', description: 'Total storage used by uploads', value: '—' },
                  { label: 'Active builds', description: 'Live published applications', value: '—', last: true },
                ].map((item, i) => (
                  <Row key={i} label={item.label} description={item.description} last={item.last}>
                    <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)' }}>{item.value}</span>
                  </Row>
                ))}
              </div>
            </div>
          )}

          {/* ── BILLING (inline pricing) ── */}
          {activeSection === 'billing' && (
            <BillingTab
              user={user}
              userPlan={userPlan}
              navigate={navigate}
              setUser={handleSetUser}
              refreshAuthUser={refreshAuthUser}
            />
          )}

        </div>
      </div>

      <AISettingsModal open={showAIDNAModal} onClose={() => setShowAIDNAModal(false)} />

      {/* Delete modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div style={{ width: '100%', maxWidth: 380, background: '#fff', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '13px 18px', background: 'rgba(239,68,68,0.04)', borderBottom: '1px solid rgba(239,68,68,0.10)' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', margin: 0 }}>Delete account</p>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: '0 0 12px', lineHeight: 1.5 }}>This action is irreversible. All your data will be permanently deleted.</p>
              <div style={{ background: BG, borderRadius: 6, padding: '8px 11px', marginBottom: 14 }}>
                <p style={{ fontSize: 12.5, color: 'rgba(0,0,0,0.45)', margin: 0 }}>Account: <strong style={{ color: '#111' }}>{user?.email}</strong></p>
              </div>
              <button onClick={deleteAccount} style={{ width: '100%', padding: '9px 0', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}>
                Confirm deletion
              </button>
              <button onClick={() => setShowDeleteModal(false)} style={{ width: '100%', padding: '9px 0', background: 'transparent', color: 'rgba(0,0,0,0.45)', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}