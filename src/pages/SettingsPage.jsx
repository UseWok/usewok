import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Save, Gift, Clock, X, Download, ChevronRight, Check, ChevronLeft, Search, User, CreditCard, Zap, ArrowLeft } from 'lucide-react';
import { writeAuditLog } from '@/lib/serverGuard';
import AISettingsModal from '@/components/settings/AISettingsModal';
import { getUserPlan, getPlansConfig, COMPARISON_FEATURES } from '@/lib/plans-config';
import CreditsBar from '@/components/CreditsBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { motion, AnimatePresence } from 'framer-motion';

// ── Shared styles ──
const BG = '#F9F9F8';
const BORDER = 'rgba(0,0,0,0.08)';

const inputStyle = {
  width: '100%', background: '#fff', border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 6, padding: '8px 11px', fontSize: 13, color: '#111',
  outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
};

// ── Row: label + description on left, control on right ──
function SettingRow({ label, description, children, noBorder = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', gap: 24, borderBottom: noBorder ? 'none' : `1px solid ${BORDER}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 400, color: '#111', margin: 0, lineHeight: 1.4 }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '2px 0 0', lineHeight: 1.4 }}>{description}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function SectionTitle({ children, mb = 4 }) {
  return <h2 style={{ fontSize: 17, fontWeight: 600, color: '#111', margin: `0 0 ${mb}px`, letterSpacing: '-0.01em' }}>{children}</h2>;
}

function Badge({ color = 'green', children }) {
  const colors = {
    green: { bg: 'rgba(34,197,94,0.1)', text: '#16a34a' },
    yellow: { bg: 'rgba(245,158,11,0.1)', text: '#d97706' },
    red: { bg: 'rgba(239,68,68,0.1)', text: '#dc2626' },
    blue: { bg: 'rgba(59,130,246,0.1)', text: '#2563eb' },
    coral: { bg: 'rgba(249,87,56,0.1)', text: '#F95738' },
    gray: { bg: 'rgba(0,0,0,0.06)', text: '#666' },
  };
  const c = colors[color] || colors.green;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: c.bg, color: c.text, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

// ── Code Redeemer ──
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
      const historyEntry = { email: user?.email, userId: user?.id, at: new Date().toISOString() };
      const existingHistory = (() => { try { return JSON.parse(rec.used_by_history || '[]'); } catch { return []; } })();
      existingHistory.push(historyEntry);
      if (rec.unlimited) {
        await base44.entities.AccessCode.update(rec.id, { use_count: (rec.use_count || 0) + 1, used_by: user?.email, used_by_history: JSON.stringify(existingHistory) });
      } else {
        await base44.entities.AccessCode.update(rec.id, { used: true, used_by: user?.email, use_count: (rec.use_count || 0) + 1, used_by_history: JSON.stringify(existingHistory) });
      }
      writeAuditLog(user?.id, { action: 'save', resource_type: 'AccessCode', resource_id: rec.id, status: 'success', metadata: { code: rec.code, plan_id: rec.plan_id, credits: rec.credits, email: user?.email } }).catch(() => {});
      if (!rec.unlimited && (!rec.max_uses || (rec.use_count || 0) + 1 >= rec.max_uses)) base44.entities.AccessCode.delete(rec.id).catch(() => {});
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); setSuccess(''); }}
          placeholder="XXXX-XXXX-XXXX" maxLength={24} onKeyDown={e => { if (e.key === 'Enter') handleRedeem(); }}
          style={{ ...inputStyle, flex: 1, border: `1px solid ${error ? '#ef4444' : 'rgba(0,0,0,0.12)'}` }} />
        <button onClick={handleRedeem} disabled={loading || !code.trim()}
          style={{ padding: '8px 16px', background: code.trim() ? '#111' : '#F0F0EE', color: code.trim() ? '#fff' : '#aaa', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: code.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
          {loading ? '...' : 'Activate'}
        </button>
      </div>
      {error && <p style={{ fontSize: 11, color: '#ef4444', margin: 0 }}>{error}</p>}
      {success && <p style={{ fontSize: 11, color: '#16a34a', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Check style={{ width: 10, height: 10 }} />{success}</p>}
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

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

// ── Sidebar nav item ──
function NavItem({ label, icon: Icon, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px', borderRadius: 5, border: 'none', background: active ? 'rgba(0,0,0,0.07)' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: active ? 500 : 400, color: active ? '#111' : 'rgba(0,0,0,0.55)', fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'background 100ms' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(0,0,0,0.07)' : 'transparent'; }}>
      {Icon && <Icon style={{ width: 13, height: 13, flexShrink: 0, opacity: 0.65 }} />}
      {label}
    </button>
  );
}

function NavGroup({ label }) {
  return <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(0,0,0,0.35)', margin: '14px 0 3px 10px' }}>{label}</p>;
}

// ── Pricing section (embedded in settings) ──
function PricingSection({ user, userPlan, onBack }) {
  const [billing, setBilling] = useState('yearly');
  const plans = getPlansConfig();

  const planOrder = ['free', 'starter', 'creator', 'pro'];
  const userPlanIdx = planOrder.indexOf(user?.subscription_plan || 'free');
  // Highlighted plan = one above current
  const highlightedIdx = Math.min(userPlanIdx + 1, planOrder.length - 1);
  const highlightedPlan = planOrder[highlightedIdx];

  const handleUpgrade = (plan) => {
    const url = billing === 'yearly' ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (url) window.open(url, '_blank');
    else toast.info('Contact support to upgrade.');
  };

  const FeatureVal = ({ val }) => {
    if (!val || val === '-') return <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.25)' }}>—</span>;
    if (val === 'Yes') return <Check style={{ width: 14, height: 14, color: '#16a34a' }} />;
    return <span style={{ fontSize: 13, color: '#444' }}>{val}</span>;
  };

  return (
    <div>
      {/* Back breadcrumb */}
      <button onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(0,0,0,0.45)', fontFamily: 'Inter, sans-serif', padding: '0 0 20px', marginBottom: 4 }}
        onMouseEnter={e => e.currentTarget.style.color = '#111'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.45)'}>
        <ChevronLeft style={{ width: 14, height: 14 }} /> Billing
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Plans</h1>
      <p style={{ fontSize: 13.5, color: 'rgba(0,0,0,0.5)', margin: '0 0 24px', lineHeight: 1.5 }}>
        You are on the <strong style={{ color: '#111' }}>{userPlan?.name || 'Free'} plan</strong>.{' '}
        If you have any questions or would like further support with your plan,{' '}
        <a href="mailto:support@wok.ai" style={{ color: '#111', textDecoration: 'underline', textDecorationColor: 'rgba(0,0,0,0.3)' }}>contact us ↗</a>
      </p>

      {/* Plan grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', marginBottom: 32 }}>
        {plans.map((plan, idx) => {
          const isHighlighted = plan.id === highlightedPlan;
          const isCurrent = plan.id === (user?.subscription_plan || 'free');
          const price = billing === 'yearly' ? plan.price_yearly : plan.price_monthly;
          return (
            <div key={plan.id}
              style={{ background: isHighlighted ? '#fff' : BG, padding: '20px 18px', borderRight: idx < plans.length - 1 ? `1px solid ${BORDER}` : 'none', position: 'relative', boxShadow: isHighlighted ? 'inset 0 0 0 2px rgba(0,0,0,0.12)' : 'none' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>{plan.name}</p>
              <div style={{ marginBottom: 14 }}>
                {price === 0 ? (
                  <p style={{ fontSize: 13, color: '#555', margin: 0 }}>$0 per user/month</p>
                ) : (
                  <p style={{ fontSize: 13, color: '#555', margin: 0 }}><strong style={{ fontSize: 18, color: '#111' }}>${price}</strong> per user/month</p>
                )}
              </div>
              {/* Billing toggle for paid plans */}
              {plan.price_monthly > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <div onClick={() => setBilling(b => b === 'yearly' ? 'monthly' : 'yearly')}
                    style={{ width: 32, height: 18, borderRadius: 99, background: billing === 'yearly' ? '#5E5CE6' : '#E0E0E0', cursor: 'pointer', position: 'relative', transition: 'background 200ms', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2, left: billing === 'yearly' ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: 12, color: billing === 'yearly' ? '#111' : '#999' }}>Billed yearly</span>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>Free for everyone</p>
              )}

              {isCurrent ? (
                <button disabled style={{ width: '100%', padding: '8px 0', background: 'transparent', color: '#888', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'default' }}>
                  Current plan
                </button>
              ) : (
                <button onClick={() => handleUpgrade(plan)}
                  style={{ width: '100%', padding: '8px 0', background: isHighlighted ? '#5E5CE6' : 'transparent', color: isHighlighted ? '#fff' : '#111', border: isHighlighted ? 'none' : `1px solid ${BORDER}`, borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Upgrade now
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      {COMPARISON_FEATURES.map(group => (
        <div key={group.category} style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 8px' }}>{group.category}</p>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
            {group.items.map((item, i) => (
              <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 1fr)', borderBottom: i < group.items.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ padding: '11px 14px', background: BG, borderRight: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: 13, color: '#444' }}>{item.name}</span>
                </div>
                {['free', 'starter', 'creator', 'pro'].map(planId => (
                  <div key={planId} style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 6, borderRight: planId !== 'pro' ? `1px solid ${BORDER}` : 'none', background: planId === highlightedPlan ? 'rgba(94,92,230,0.03)' : '#fff' }}>
                    <FeatureVal val={item[planId]} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Profile section ──
function ProfileSection({ user, setUser, handleSetUser }) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const saveProfile = async () => {
    setError('');
    if (!fullName.trim() || fullName.trim().length < 2) { setError('Name must be at least 2 characters.'); return; }
    setSaving(true);
    await base44.auth.updateMe({ full_name: fullName.trim() });
    setSaving(false);
    toast.success('Profile updated');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await base44.entities.User.delete(user.id);
    base44.auth.logout();
  };

  return (
    <div>
      <SectionTitle>General</SectionTitle>
      <div style={{ marginTop: 8 }}>
        <SettingRow label="Email" description="Your login email — cannot be changed.">
          <input value={user?.email || ''} disabled style={{ ...inputStyle, width: 220, opacity: 0.45, cursor: 'not-allowed', background: '#F5F5F3' }} />
        </SettingRow>
        <SettingRow label="Full name" description="Your display name across the app.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input value={fullName} onChange={e => setFullName(e.target.value)} style={{ ...inputStyle, width: 200 }} />
            <button onClick={saveProfile} disabled={saving}
              style={{ padding: '8px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1, whiteSpace: 'nowrap' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
          {error && <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{error}</p>}
        </SettingRow>
      </div>

      <div style={{ height: 32 }} />
      <SectionTitle>Danger zone</SectionTitle>
      <div style={{ marginTop: 8 }}>
        <SettingRow label="Delete account" description="Permanently delete your account and all data. This cannot be undone." noBorder>
          <button onClick={() => setShowDeleteModal(true)}
            style={{ padding: '7px 14px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Delete account
          </button>
        </SettingRow>
      </div>

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#fff', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.12)' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', margin: 0 }}>Delete account</p>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: '0 0 12px', lineHeight: 1.5 }}>This action is irreversible. All your data will be permanently deleted.</p>
              <div style={{ background: '#F9F9F8', borderRadius: 6, padding: '8px 11px', marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Account: <strong style={{ color: '#111' }}>{user?.email}</strong></p>
              </div>
              <button onClick={deleteAccount} style={{ width: '100%', padding: '9px 0', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}>
                Confirm deletion
              </button>
              <button onClick={() => setShowDeleteModal(false)} style={{ width: '100%', padding: '9px 0', background: 'transparent', color: '#666', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Usage section ──
function UsageSection({ user, userPlan, navigate }) {
  const { used, limit, pct, barColor, isLow } = useCredits(user);
  const formatN = n => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return String(n);
  };

  const getDailyUsage = () => {
    try {
      const data = JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}');
      return Array.from({ length: 14 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (13 - i));
        const key = d.toISOString().slice(0, 10);
        return { date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), credits: data[key] || 0 };
      });
    } catch { return []; }
  };

  const totalUsed = used;
  const remaining = Math.max(0, limit - totalUsed);
  const cycleDays = user?.billing_cycle === 'yearly' ? 365 : 30;
  const renewDate = getRenewalDate(user);

  return (
    <div>
      <SectionTitle>Credits overview</SectionTitle>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Used this cycle', value: formatN(totalUsed), sub: `of ${formatN(limit)} total` },
          { label: 'Remaining', value: formatN(remaining), sub: isLow ? '⚠ Running low' : 'Available now' },
          { label: 'Renews', value: renewDate ? new Date(renewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A', sub: user?.billing_cycle === 'yearly' ? 'Yearly cycle' : 'Monthly cycle' },
        ].map(card => (
          <div key={card.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', margin: '0 0 4px', fontWeight: 500 }}>{card.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{card.value}</p>
            <p style={{ fontSize: 11, color: isLow && card.label === 'Remaining' ? '#d97706' : 'rgba(0,0,0,0.35)', margin: 0 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, padding: '16px 18px', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>Credit consumption</span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{Math.round(pct)}% used</span>
        </div>
        <div style={{ height: 7, background: '#F0F0EE', borderRadius: 999 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>0</span>
          <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>{formatN(limit)}</span>
        </div>
      </div>

      <SectionTitle mb={12}>Daily activity</SectionTitle>
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, padding: '16px 18px 10px', marginBottom: 28 }}>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={getDailyUsage()} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ fontSize: 11, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 6, color: '#111' }} formatter={v => [formatN(v), 'Credits']} />
            <Bar dataKey="credits" fill="#F95738" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionTitle mb={12}>Plan</SectionTitle>
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>{userPlan?.name || 'Free'}</p>
          <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: 0 }}>{formatN(limit)} credits / month</p>
        </div>
        <button onClick={() => navigate('/pricing')}
          style={{ padding: '7px 14px', background: '#F95738', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          Upgrade plan
        </button>
      </div>
    </div>
  );
}

// ── Billing section ──
function BillingSection({ user, userPlan, setUser, handleSetUser, onAllPlans }) {
  const [invoiceRequested, setInvoiceRequested] = useState({});
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceEmail, setInvoiceEmail] = useState(user?.email || '');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [cancelTicket, setCancelTicket] = useState(null);
  const navigate = useNavigate();
  const isYearly = user?.billing_cycle === 'yearly';

  useEffect(() => {
    if (user?.email) {
      base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: user.email }).then(ts => {
        if (ts.length > 0) setCancelTicket(ts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0]);
      }).catch(() => {});
    }
  }, [user?.email]);

  const requestInvoice = async () => {
    if (!user || !invoiceEmail.trim()) return;
    setInvoiceLoading(true);
    await base44.entities.SupportTicket.create({
      title: `Invoice request — ${user.full_name || user.email}`,
      description: `Invoice request for plan ${userPlan?.name}. Email: ${invoiceEmail.trim()}`,
      category: 'invoice', status: 'open', user_email: user.email,
      user_name: user.full_name || user.email, user_plan: userPlan?.name,
      invoice_email: invoiceEmail.trim(), messages_json: JSON.stringify([]),
    });
    setInvoiceLoading(false); setShowInvoiceModal(false);
    setInvoiceRequested(p => ({ ...p, [userPlan?.name]: true }));
    toast.success('Invoice request sent');
  };

  return (
    <div>
      <SectionTitle>Current subscription</SectionTitle>
      <div style={{ marginTop: 10, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, overflow: 'hidden', marginBottom: 24 }}>
        <SettingRow label="Plan" description={isYearly ? 'Billed annually' : userPlan?.price_monthly > 0 ? 'Billed monthly' : 'Free forever'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{userPlan?.name || 'Free'}</span>
            {isYearly && <Badge color="coral">Yearly</Badge>}
            {!isYearly && userPlan?.price_monthly > 0 && <Badge color="blue">Monthly</Badge>}
          </div>
        </SettingRow>
        <SettingRow label="Pricing" description="Your current billing amount.">
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>
            {isYearly
              ? `$${userPlan?.price_yearly || 0}/mo`
              : userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/mo` : 'Free'}
          </span>
        </SettingRow>
        <SettingRow label="Credits" description="Included per billing cycle.">
          <span style={{ fontSize: 13, color: '#444' }}>
            {userPlan?.credits_limit ? `${(userPlan.credits_limit / 1000).toFixed(0)}K / mo` : 'Free tier'}
          </span>
        </SettingRow>
        {getRenewalDate(user) && userPlan?.price_monthly > 0 && (
          <SettingRow label="Next renewal" description="Auto-renews on this date.">
            <span style={{ fontSize: 13, color: '#444', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock style={{ width: 12, height: 12, color: '#999' }} />
              {formatDate(getRenewalDate(user))}
            </span>
          </SettingRow>
        )}
        <SettingRow label="Status" description="Your subscription status." noBorder>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {cancelTicket?.cancel_status === 'pending' && <Badge color="yellow">Cancellation pending</Badge>}
            {cancelTicket?.cancel_status === 'approved' && <Badge color="red">Cancelled</Badge>}
            {!cancelTicket && <Badge color="green">Active</Badge>}
          </div>
        </SettingRow>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        <button onClick={onAllPlans}
          style={{ padding: '8px 16px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 13, fontWeight: 500, color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
          onMouseEnter={e => e.currentTarget.style.background = '#F9F9F8'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          All plans <ChevronRight style={{ width: 13, height: 13 }} />
        </button>
        <button onClick={() => navigate('/manage-plan')}
          style={{ padding: '8px 16px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 13, fontWeight: 500, color: '#555', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F9F9F8'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          Manage plan
        </button>
        {userPlan?.price_monthly > 0 && (
          <button onClick={() => setShowInvoiceModal(true)}
            style={{ padding: '8px 16px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 13, fontWeight: 500, color: invoiceRequested[userPlan.name] ? '#16a34a' : '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Download style={{ width: 13, height: 13 }} />
            {invoiceRequested[userPlan.name] ? 'Invoice sent' : 'Request invoice'}
          </button>
        )}
      </div>

      {/* Code redeemer */}
      <SectionTitle mb={8}>Access code</SectionTitle>
      <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', margin: '0 0 14px', lineHeight: 1.5 }}>Redeem a code to activate a plan or add credits.</p>
      <CodeRedeemer user={user} setUser={handleSetUser} />

      {/* Invoice modal */}
      {showInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowInvoiceModal(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>Request an invoice</p>
              <button onClick={() => setShowInvoiceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X style={{ width: 14, height: 14 }} /></button>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: '0 0 12px', lineHeight: 1.5 }}>Enter the email used for your payment.</p>
              <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)} placeholder="email@example.com" style={{ ...inputStyle, marginBottom: 12 }} />
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

// ── Main component ──
export default function SettingsPage() {
  const navigate = useNavigate();
  const { user: authUser, refreshUser: refreshAuthUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [showPricing, setShowPricing] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [showAIDNAModal, setShowAIDNAModal] = useState(false);

  const loadUser = (u) => {
    if (!u) return;
    setUser(u);
    setUserPlan(getUserPlan(u));
  };

  const handleSetUser = async (u) => {
    if (u) loadUser(u);
    if (refreshAuthUser) { const freshUser = await refreshAuthUser(); if (freshUser) loadUser(freshUser); }
  };

  useEffect(() => {
    if (authUser?.id) loadUser(authUser);
    else base44.auth.me().then(loadUser).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return (
    <div style={{ display: 'flex', height: '100vh', background: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, border: '2px solid #E5E5E0', borderTopColor: '#999', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const navSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'usage', label: 'Usage', icon: Zap },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const titles = { profile: 'Profile', usage: 'Usage', billing: 'Billing' };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F9F9F8', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>

      {/* ── LEFT SIDEBAR (replaces app sidebar visually) ── */}
      <div style={{ width: 200, flexShrink: 0, background: '#F9F9F8', borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        <div style={{ padding: '14px 10px 10px' }}>
          <button onClick={() => navigate('/app')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: 'rgba(0,0,0,0.45)', fontFamily: 'Inter, sans-serif', padding: '4px 2px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#111'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.45)'}>
            <ChevronLeft style={{ width: 13, height: 13 }} /> Back to app
          </button>
        </div>

        <div style={{ padding: '0 10px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px 10px' }}>
            <Search style={{ width: 12, height: 12, color: 'rgba(0,0,0,0.35)', flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12.5, color: '#111', fontFamily: 'Inter, sans-serif' }} />
          </div>
        </div>

        <div style={{ padding: '0 6px', flex: 1 }}>
          <NavGroup label="Account" />
          {navSections.map(s => (
            <NavItem key={s.id} label={s.label} icon={s.icon}
              active={activeSection === s.id && !showPricing}
              onClick={() => { setActiveSection(s.id); setShowPricing(false); }} />
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#FAFAF9', padding: '40px 52px 80px' }}>
        <div style={{ maxWidth: 680 }}>
          {!showPricing && (
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 28px', letterSpacing: '-0.02em' }}>
              {titles[activeSection]}
            </h1>
          )}

          {activeSection === 'profile' && !showPricing && (
            <ProfileSection user={user} setUser={setUser} handleSetUser={handleSetUser} />
          )}
          {activeSection === 'usage' && !showPricing && (
            <UsageSection user={user} userPlan={userPlan} navigate={navigate} />
          )}
          {activeSection === 'billing' && !showPricing && (
            <BillingSection user={user} userPlan={userPlan} setUser={setUser} handleSetUser={handleSetUser} onAllPlans={() => setShowPricing(true)} />
          )}
          {showPricing && (
            <PricingSection user={user} userPlan={userPlan} onBack={() => setShowPricing(false)} />
          )}
        </div>
      </div>

      <AISettingsModal open={showAIDNAModal} onClose={() => setShowAIDNAModal(false)} />
    </div>
  );
}