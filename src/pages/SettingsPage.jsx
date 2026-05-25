import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User, CreditCard, Zap, ArrowLeft, Save, Gift, Clock, Brain, Cpu, Trash2, X, Download, ChevronRight } from 'lucide-react';
import AISettingsModal from '@/components/settings/AISettingsModal';
import { getUserPlan, getPlansConfig } from '@/lib/plans-config';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

function AccessCodeRedeemer({ user, setUser }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRedeem = async () => {
    setError('');
    if (!code.trim()) { setError('Please enter a code.'); return; }
    setLoading(true);
    const results = await base44.entities.AccessCode.filter({ code: code.trim().toUpperCase(), used: false });
    if (results.length === 0) {
      const any = await base44.entities.AccessCode.filter({ code: code.trim().toUpperCase() });
      setError(any.length > 0 ? 'This code has already been used.' : 'Invalid code.');
      setLoading(false); return;
    }
    const rec = results[0];

    if (rec.plan_id) {
      const plans = getPlansConfig();
      const newPlan = plans.find(p => p.id === rec.plan_id);
      if (newPlan) {
        await base44.auth.updateMe({
          subscription_plan: newPlan.id,
          credits_limit: newPlan.credits_limit || rec.credits || 10,
          credits_used: 0,
          credits_bonus: rec.credits > 0 ? (user?.credits_bonus || 0) + rec.credits : (user?.credits_bonus || 0),
          billing_cycle: 'monthly',
          subscription_date: new Date().toISOString(),
        });
        toast.success(`${newPlan.name} subscription activated${rec.credits > 0 ? ` +${rec.credits} bonus credits` : ''}`);
      }
    } else {
      await base44.auth.updateMe({ credits_bonus: (user?.credits_bonus || 0) + rec.credits });
      toast.success(`+${rec.credits} credits added to your account`);
    }

    await base44.entities.AccessCode.update(rec.id, { used: true, used_by: user?.email });
    const updated = await base44.auth.me();
    if (setUser) setUser(updated);
    setCode('');
    setLoading(false);
  };

  return (
    <div className="p-4 border border-[#E5E5E5] rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-4 h-4 text-[#1A1A1A]" />
        <p className="text-xs font-medium text-[#666666]">Credits code</p>
      </div>
      <p className="text-xs mb-3 text-[#666666]">Enter a code to receive bonus credits on your account.</p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
          placeholder="Ex: ABCD-EFGH-IJKL"
          maxLength={20}
          onKeyDown={e => { if (e.key === 'Enter') handleRedeem(); }}
          className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-400 focus:ring-red-200' : 'border-[#E5E5E5] focus:ring-[#1A1A1A]/20'}`}
        />
        <button onClick={handleRedeem} disabled={loading || !code.trim()}
          className="px-4 py-2 text-sm font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] transition-colors disabled:opacity-50">
          {loading ? '...' : 'Redeem'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
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

      if (u && plan.price_monthly > 0) {
        try {
          const tickets = await base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: u.email, cancel_status: 'approved' });
          const expiredTicket = tickets.find(t => t.cancel_ends_at && new Date(t.cancel_ends_at) <= new Date());
          if (expiredTicket) {
            const freePlans = getPlansConfig();
            const freePlan = freePlans.find(p => p.id === 'free') || freePlans[0];
            await base44.auth.updateMe({ subscription_plan: 'free', credits_limit: freePlan.credits_limit, credits_used: 0 });
            const updated = await base44.auth.me();
            setUser(updated);
            setUserPlan(getUserPlan(updated));
          }
        } catch {}
      }

      if (u?.email) {
        base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: u.email }).then(ts => {
          if (ts.length > 0) setCancelTicket(ts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0]);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const fmtN = (n) => { const r = Math.round(n * 10) / 10; return Number.isInteger(r) ? r.toString() : r.toFixed(1); };
  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan ? userPlan.credits_limit + (user?.credits_bonus || 0) : 10;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);

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
    if (!fullName.trim()) { setProfileError('Full name cannot be empty.'); return; }
    if (fullName.trim().length < 2) { setProfileError('Full name must be at least 2 characters.'); return; }
    if (!user) return;
    setSavingProfile(true);
    await base44.auth.updateMe({ full_name: fullName.trim() });
    setSavingProfile(false);
    toast.success('Profile updated');
  };

  const activateCode = async () => {
    setCodeError('');
    if (!activationCode.trim()) { setCodeError('Please enter an activation code.'); return; }
    if (activationCode.trim().length < 8) { setCodeError('Code too short.'); return; }
    if (!user) return;
    setCodeLoading(true);
    const results = await base44.entities.ActivationCode.filter({ code: activationCode.trim(), used: false });
    if (results.length === 0) {
      const anyMatch = await base44.entities.ActivationCode.filter({ code: activationCode.trim() });
      setCodeError(anyMatch.length > 0 ? 'This code has already been used.' : 'Code not found.');
      setCodeLoading(false); return;
    }
    const codeRecord = results[0];
    const plans = getPlansConfig();
    const newPlan = plans.find(p => p.id === codeRecord.plan_id);
    if (!newPlan) { setCodeError('Plan associated with this code no longer exists.'); setCodeLoading(false); return; }

    const currentPlan = getUserPlan(user);
    const currentRank = plans.findIndex(p => p.id === currentPlan.id);
    const newRank = plans.findIndex(p => p.id === newPlan.id);
    const keepCurrent = currentRank > newRank && currentPlan.price_monthly > 0;

    if (keepCurrent) {
      const bonusCredits = newPlan.credits_limit;
      await base44.auth.updateMe({ credits_bonus: (user.credits_bonus || 0) + bonusCredits });
      toast.success(`Code applied! +${bonusCredits} bonus credits added`);
    } else {
      await base44.auth.updateMe({
        subscription_plan: newPlan.id, credits_limit: newPlan.credits_limit, credits_used: 0,
        credits_bonus: 0, billing_cycle: codeRecord.billing || 'monthly', subscription_date: new Date().toISOString(),
      });
      toast.success(`${newPlan.name} plan activated`);
    }
    await base44.entities.ActivationCode.update(codeRecord.id, { used: true, used_by: user.email });
    setActivationCode('');
    const updated = await base44.auth.me();
    setUser(updated); setUserPlan(getUserPlan(updated));
    setCodeLoading(false);
  };

  const requestInvoice = async () => {
    if (!user || !invoiceEmail.trim()) return;
    setInvoiceLoading(true);
    await base44.entities.SupportTicket.create({
      title: `Invoice request — ${user.full_name || user.email}`,
      description: `Invoice request for the ${userPlan?.name} plan. Payment email: ${invoiceEmail.trim()}`,
      category: 'invoice',
      status: 'open',
      user_email: user.email,
      user_name: user.full_name || user.email,
      user_plan: userPlan?.name,
      user_plan_price: userPlan?.price_monthly ? `$${userPlan.price_monthly}/mo` : 'Free',
      invoice_email: invoiceEmail.trim(),
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

  const sharedProps = { user, setUser, userPlan, fullName, setFullName, saveProfile, savingProfile, profileError, navigate, pct, creditsUsed, creditsLimit, getDailyUsage, activationCode, setActivationCode, activateCode, codeLoading, codeError, invoiceRequested, requestInvoice, setShowDeleteModal, fmtN, setShowInvoiceModal, cancelTicket };

  return (
    <div className="min-h-screen font-sans" style={{ background: '#FFFFFF' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F7F7F8] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[#666666]" />
          </button>
          <h1 className="text-xl font-medium text-[#1A1A1A]">Settings</h1>
        </div>

        {/* Desktop: sidebar + panel */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="hidden md:flex flex-col gap-1 w-56 flex-shrink-0">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => item.modal ? setShowAIDNAModal(true) : setActiveSection(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-lg transition-all ${active ? 'text-[#1A1A1A] font-medium' : 'text-[#666666] hover:text-[#1A1A1A]'}`}>
                  <div className={`w-px h-4 ${active ? 'bg-[#1A1A1A]' : 'bg-transparent'}`} />
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <SectionContent section={activeSection} {...sharedProps} desktop />
          </div>
        </div>

        {/* Modern Code Redemption Section - Full Width */}
        <div className="mt-8 pt-8 border-t border-[#E5E5E5]">
          <div className="max-w-2xl">
            <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4">Redeem Code</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <AccessCodeRedeemer user={user} setUser={setUser} />
              <div className="p-4 border border-[#E5E5E5] rounded-lg bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-[#1A1A1A]" />
                  <p className="text-xs font-medium text-[#666666]">Activation Code</p>
                </div>
                <p className="text-xs mb-3 text-[#666666]">Activate a subscription plan with a code.</p>
                <div className="flex gap-2">
                  <input
                    value={activationCode}
                    onChange={e => { setActivationCode(e.target.value.toUpperCase()); setCodeError(''); }}
                    placeholder="Ex: 4F7K-9M2X-1R8P"
                    maxLength={20}
                    onKeyDown={e => { if (e.key === 'Enter') activateCode(); }}
                    className={`flex-1 px-3 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 transition-all ${codeError ? 'border-red-400 focus:ring-red-200' : 'border-[#E5E5E5] focus:ring-[#1A1A1A]/20'}`}
                  />
                  <button onClick={activateCode} disabled={codeLoading || !activationCode.trim()}
                    className="px-4 py-2 text-sm font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                    {codeLoading ? '...' : 'Activate'}
                  </button>
                </div>
                {codeError && <p className="text-xs text-red-500 mt-2">{codeError}</p>}
              </div>
            </div>
        </div>
        </div>
      </div>

      <AISettingsModal open={showAIDNAModal} onClose={() => setShowAIDNAModal(false)} />

      {/* Invoice modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={e => { if (e.target === e.currentTarget) setShowInvoiceModal(false); }}>
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-[#E5E5E5]">
              <p className="text-sm font-medium text-[#1A1A1A]">Request an invoice</p>
              <button onClick={() => setShowInvoiceModal(false)} className="w-6 h-6 flex items-center justify-center hover:bg-[#F7F7F8] rounded">
                <X className="w-4 h-4 text-[#666666]" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-[#666666]">Enter the email used for your payment. We'll forward your request to our team.</p>
              <div>
                <label className="text-xs font-medium block mb-1 text-[#666666]">Payment email</label>
                <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20" />
              </div>
              <button onClick={requestInvoice} disabled={invoiceLoading || !invoiceEmail.trim()}
                className="w-full py-2 text-sm font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {invoiceLoading ? 'Sending...' : 'Submit request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 pt-5 pb-4 bg-red-500 flex items-center justify-between">
              <p className="text-base font-medium text-white">Delete account</p>
              <button onClick={() => setShowDeleteModal(false)} className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs font-medium text-[#666666]">This action is irreversible. All your data will be permanently deleted.</p>
              <div className="p-3 bg-[#F7F7F8] rounded-lg">
                <p className="text-xs text-[#666666]">Email: <strong className="text-[#1A1A1A]">{user?.email}</strong></p>
              </div>
              <button onClick={deleteAccount} className="w-full py-2.5 font-medium text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Confirm deletion
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-2 text-sm font-medium text-[#666666] rounded-lg hover:bg-[#F7F7F8] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionContent({ section, desktop, user, setUser, userPlan, fullName, setFullName, saveProfile, savingProfile, profileError, navigate, pct, creditsUsed, creditsLimit, getDailyUsage, activationCode, setActivationCode, activateCode, codeLoading, codeError, invoiceRequested, requestInvoice, setShowDeleteModal, fmtN, setShowInvoiceModal, cancelTicket }) {
  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const isYearly = user?.billing_cycle === 'yearly';

  function getRenewalDate(u) {
    const base = u?.subscription_date || u?.created_date;
    if (!base) return null;
    const d = new Date(base);
    const now = new Date();
    const yearly = u?.billing_cycle === 'yearly';
    if (yearly) { while (d <= now) d.setFullYear(d.getFullYear() + 1); }
    else { while (d <= now) d.setMonth(d.getMonth() + 1); }
    return d;
  }

  if (section === 'profile') return (
    <div className={`space-y-4 ${desktop ? 'max-w-lg' : 'pt-2'}`}>
      <div>
        <label className="text-xs font-medium block mb-1.5 text-[#666666]">Email (read-only)</label>
        <input value={user?.email || ''} disabled className="w-full px-3 py-2.5 text-sm bg-[#F7F7F8] border border-[#E5E5E5] rounded-lg text-[#666666] cursor-not-allowed" />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1.5 text-[#666666]">Full name</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${profileError ? 'border-red-400 focus:ring-red-200' : 'border-[#E5E5E5] focus:ring-[#1A1A1A]/20'}`} />
        {profileError && <p className="text-xs text-red-500 mt-1">{profileError}</p>}
      </div>
      <button onClick={saveProfile} disabled={savingProfile} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] transition-colors disabled:opacity-50">
        <Save className="w-4 h-4" /> {savingProfile ? 'Saving...' : 'Save changes'}
      </button>

      <div className="pt-6 mt-6 border-t border-[#E5E5E5]">
        <p className="text-sm font-medium mb-2 text-[#1A1A1A]">Delete account</p>
        <p className="text-xs mb-3 text-[#666666]">This action is irreversible. All your data will be permanently deleted.</p>
        <button onClick={() => setShowDeleteModal(true)} className="w-full py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
          Delete account
        </button>
      </div>
    </div>
  );

  if (section === 'plan') {
    const renewalDate = getRenewalDate(user);
    const isCancelPending = cancelTicket?.cancel_status === 'pending';
    const isCancelApproved = cancelTicket?.cancel_status === 'approved';
    const displayPrice = isYearly
      ? `$${userPlan?.price_yearly || (userPlan?.price_monthly * 12)}/year`
      : userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/month` : 'Free';
    return (
      <div className={`space-y-4 ${desktop ? 'max-w-lg' : 'pt-2'}`}>
        <div className="p-4 border border-[#E5E5E5] rounded-lg bg-white">
          <p className="text-xs font-medium mb-2 text-[#666666]">Current subscription</p>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium text-[#1A1A1A]">{userPlan?.name || 'Free'}</p>
                {isYearly && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#F7F7F8] text-[#666666]">YEARLY</span>}
              </div>
              <p className="text-xs mt-0.5 text-[#666666]">{displayPrice}</p>
              {renewalDate && userPlan?.price_monthly > 0 && (
                <p className="text-xs mt-1 text-[#666666] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isYearly ? 'Annual renewal on' : 'Monthly renewal on'} {formatDate(renewalDate)}
                </p>
              )}
            </div>
            <span className="px-3 py-1.5 text-xs font-medium bg-[#F7F7F8] text-[#1A1A1A] rounded-lg">
              {userPlan?.credits_limit} credits/mo
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => navigate('/manage-plan')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] transition-colors">
              Manage <ChevronRight className="w-3 h-3" />
            </button>
            <button onClick={() => navigate('/pricing')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] transition-colors">
              Upgrade
            </button>
          </div>
        </div>

        {userPlan?.price_monthly > 0 && (
          <div>
            <p className="text-xs font-medium mb-2 text-[#666666]">Billing history</p>
            <div className="border border-[#E5E5E5] rounded-lg overflow-hidden bg-white">
              <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A]">{userPlan.name} plan</p>
                  <p className="text-xs text-[#666666]">
                    Since {formatDate(user?.subscription_date || user?.created_date)}
                    {isYearly && <span className="ml-1.5 text-[9px] font-medium px-1 py-0.5 rounded bg-[#F7F7F8] text-[#666666]">Annual</span>}
                  </p>
                </div>
                <span className="text-sm font-medium text-[#1A1A1A]">{displayPrice}</span>
                {isCancelPending && <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700">CANCELLATION PENDING</span>}
                {isCancelApproved && cancelTicket?.cancel_ends_at && <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-red-50 text-red-700">CANCELLED · ENDS {new Date(cancelTicket.cancel_ends_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>}
                {!cancelTicket && <span className="text-[10px] font-medium px-2 py-0.5 bg-green-50 text-green-700 rounded">ACTIVE</span>}
                <button onClick={() => setShowInvoiceModal(true)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${invoiceRequested[userPlan.name] ? 'bg-green-50 text-green-700' : 'bg-[#F7F7F8] text-[#666666] hover:bg-[#F0F0F0]'}`}>
                  <Download className="w-3 h-3" />
                  {invoiceRequested[userPlan.name] ? 'Sent' : 'Invoice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (section === 'usage') {
    const deepUsed = user?.deep_credits_used || 0;
    const deepLimit = userPlan?.deep_credits_limit || 0;
    const deepPct = deepLimit > 0 ? Math.min((deepUsed / deepLimit) * 100, 100) : 0;
    return (
      <div className={`space-y-4 ${desktop ? 'max-w-lg' : 'pt-2'}`}>
        <div className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A] rounded-lg">
          <div>
            <p className="text-xs text-white/60">Current plan</p>
            <p className="text-sm font-medium text-white">{userPlan?.name || 'Free'}</p>
          </div>
          <button onClick={() => navigate('/pricing')} className="px-3 py-1.5 text-xs font-medium bg-white text-[#1A1A1A] rounded-lg hover:opacity-90 transition-opacity">Upgrade</button>
        </div>

        <div className="p-4 border border-[#E5E5E5] rounded-lg bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-[#666666]">Flash Credits</p>
            <p className="text-xs font-medium text-[#1A1A1A]">{fmtN(creditsUsed)} / {fmtN(creditsLimit)}</p>
          </div>
          <div className="w-full h-2 bg-[#F7F7F8] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all bg-[#1A1A1A]" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] mt-1.5 text-[#666666]">{Math.round(pct)}% used</p>
        </div>

        {deepLimit > 0 && (
          <div className="p-4 border border-[#E5E5E5] rounded-lg bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[#666666]">Deep Credits</p>
              <p className="text-xs font-medium text-[#1A1A1A]">{deepUsed} / {deepLimit}</p>
            </div>
            <div className="w-full h-2 bg-[#F7F7F8] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all bg-[#1A1A1A]" style={{ width: `${deepPct}%` }} />
            </div>
            <p className="text-[10px] mt-1.5 text-[#666666]">{Math.round(deepPct)}% used</p>
          </div>
        )}

        <div className="p-4 border border-[#E5E5E5] rounded-lg bg-white">
          <p className="text-xs font-medium mb-4 text-[#666666]">Activity — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={getDailyUsage()} barSize={14}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#999' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E5E5E5', borderRadius: '8px' }} />
              <Bar dataKey="tensors" fill="#1A1A1A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
}