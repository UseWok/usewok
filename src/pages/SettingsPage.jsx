import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, Zap, ArrowLeft, Save, Download, ChevronRight, Trash2, X, Brain, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPlan, getPlansConfig } from '@/lib/plans-config';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const AI_MODES = [
  { id: 'thinking', label: 'Standard', desc: 'Balanced and fast' },
  { id: 'pro',      label: 'Advanced', desc: 'Deeper analysis' },
  { id: 'ultimate', label: 'Expert',   desc: 'Maximum intelligence' },
];

const DEFAULT_MODE_KEY = 'stensor_default_mode';

function SectionTitle({ children }) {
  return <h2 className="text-xs font-black uppercase tracking-wider mb-4 text-muted-foreground">{children}</h2>;
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
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [cancelTicket, setCancelTicket] = useState(null);
  const [defaultMode, setDefaultMode] = useState(() => localStorage.getItem(DEFAULT_MODE_KEY) || 'ultimate');

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      setFullName(u?.full_name || '');
      setInvoiceEmail(u?.email || '');
      const plan = getUserPlan(u);
      setUserPlan(plan);

      // Auto-downgrade to free if subscription expired (cancel approved + ends_at passed)
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

      // Load cancel ticket if any
      if (u?.email) {
        base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: u.email }).then(ts => {
          if (ts.length > 0) setCancelTicket(ts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0]);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const saveDefaultMode = (modeId) => {
    setDefaultMode(modeId);
    localStorage.setItem(DEFAULT_MODE_KEY, modeId);
    toast.success('Default AI mode saved');
  };

  const fmtN = (n) => { const r = Math.round(n * 10) / 10; return Number.isInteger(r) ? r.toString() : r.toFixed(1); };
  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan ? userPlan.credits_limit + (user?.credits_bonus || 0) : 10;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const isHigh = pct >= 90;
  const isMid = pct >= 70;

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
    if (activationCode.trim().length < 8) { setCodeError('Code too short — check you copied it correctly.'); return; }
    if (!user) return;
    setCodeLoading(true);
    const results = await base44.entities.ActivationCode.filter({ code: activationCode.trim(), used: false });
    if (results.length === 0) {
      const anyMatch = await base44.entities.ActivationCode.filter({ code: activationCode.trim() });
      setCodeError(anyMatch.length > 0 ? 'This code has already been used.' : 'Code not found. Double-check spelling or contact support.');
      setCodeLoading(false); return;
    }
    const codeRecord = results[0];
    const plans = getPlansConfig();
    const newPlan = plans.find(p => p.id === codeRecord.plan_id);
    if (!newPlan) { setCodeError('Plan associated with this code no longer exists.'); setCodeLoading(false); return; }

    // Keep the best plan: if user already has a higher plan, only add bonus credits
    const currentPlan = getUserPlan(user);
    const currentRank = plans.findIndex(p => p.id === currentPlan.id);
    const newRank = plans.findIndex(p => p.id === newPlan.id);
    const keepCurrent = currentRank > newRank && currentPlan.price_monthly > 0;

    if (keepCurrent) {
      // Add credits as bonus instead of downgrading
      const bonusCredits = newPlan.credits_limit;
      await base44.auth.updateMe({ credits_bonus: (user.credits_bonus || 0) + bonusCredits });
      toast.success(`Code applied! +${bonusCredits} bonus Tensors added (your ${currentPlan.name} plan is kept)`);
    } else {
      await base44.auth.updateMe({
        subscription_plan: newPlan.id, credits_limit: newPlan.credits_limit, credits_used: 0,
        credits_bonus: 0, billing_cycle: codeRecord.billing || 'monthly', subscription_date: new Date().toISOString(),
      });
      toast.success(`${newPlan.name} plan activated!`);
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
    // Notify admin via support ticket
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
    { id: 'usage', label: 'Tensor Usage', icon: Zap },
    { id: 'aimode', label: 'AI Mode', icon: Brain },
  ];

  const sharedProps = { user, userPlan, fullName, setFullName, saveProfile, savingProfile, profileError, navigate, pct, creditsUsed, creditsLimit, getDailyUsage, activationCode, setActivationCode, activateCode, codeLoading, codeError, invoiceRequested, requestInvoice, setShowDeleteModal, isHigh, isMid, fmtN, defaultMode, saveDefaultMode, setShowInvoiceModal, cancelTicket };

  return (
    <div className="min-h-screen font-open" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="w-9 h-9 flex items-center justify-center bg-white border border-black/8 rounded-xl hover:shadow-md transition-all">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-2xl font-black text-fg">Settings</h1>
        </div>

        {/* Mobile: stacked accordion */}
        <div className="md:hidden space-y-2 mb-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isOpen = activeSection === item.id;
            return (
              <div key={item.id} className="bg-white overflow-hidden border border-border rounded-xl">
                <button onClick={() => setActiveSection(isOpen ? null : item.id)} className="w-full flex items-center gap-3 px-4 py-4">
                  <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg ${isOpen ? 'bg-fg' : 'bg-muted'}`}>
                    <Icon className={`w-4 h-4 ${isOpen ? 'text-yuzu' : 'text-muted-foreground'}`} />
                  </div>
                  <span className="flex-1 text-left text-sm font-semibold text-fg">{item.label}</span>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-4 pb-5 pt-1 border-t border-border">
                        <SectionContent section={item.id} {...sharedProps} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Desktop: sidebar + panel */}
        <div className="hidden md:flex gap-8">
          <nav className="flex flex-col gap-1 w-48 flex-shrink-0">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-left rounded-xl transition-all duration-200 ${active ? 'bg-yuzu text-fg shadow-sm' : 'text-muted-foreground hover:bg-black/5'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
              );
            })}
          </nav>

          <div className="flex-1 min-w-0">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <SectionTitle>{navItems.find(n => n.id === activeSection)?.label || ''}</SectionTitle>
              <SectionContent section={activeSection} {...sharedProps} desktop />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Invoice modal */}
      <AnimatePresence>
        {showInvoiceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            onClick={e => { if (e.target === e.currentTarget) setShowInvoiceModal(false); }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                <p className="text-sm font-black text-fg">Request an invoice</p>
                <button onClick={() => setShowInvoiceModal(false)} className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-muted-foreground">Enter the email used for your payment. We'll forward your request to our team.</p>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-muted-foreground">Payment email *</label>
                  <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none" />
                </div>
                <button onClick={requestInvoice} disabled={invoiceLoading || !invoiceEmail.trim()}
                  className="w-full py-2.5 text-sm font-bold bg-fg text-white rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity">
                  {invoiceLoading ? 'Sending...' : 'Submit request'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 pt-5 pb-4 bg-red-500 flex items-center justify-between">
                <p className="text-base font-bold text-white">Delete account</p>
                <button onClick={() => setShowDeleteModal(false)} className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground">This action is irreversible. All your data will be permanently deleted.</p>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Email: <strong className="text-fg">{user?.email}</strong></p>
                </div>
                <button onClick={deleteAccount} className="w-full py-2.5 font-bold text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Confirm deletion
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="w-full py-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionContent({ section, desktop, user, userPlan, fullName, setFullName, saveProfile, savingProfile, profileError, navigate, pct, creditsUsed, creditsLimit, getDailyUsage, activationCode, setActivationCode, activateCode, codeLoading, codeError, invoiceRequested, requestInvoice, setShowDeleteModal, isHigh, isMid, fmtN, defaultMode, saveDefaultMode, setShowInvoiceModal, cancelTicket }) {
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
    <div className={`space-y-4 ${desktop ? 'max-w-md' : 'pt-2'}`}>
      <div>
        <label className="text-xs font-semibold block mb-1 text-muted-foreground">Email (read-only)</label>
        <input value={user?.email || ''} disabled className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed" />
      </div>
      <div>
        <label className="text-xs font-semibold block mb-1 text-muted-foreground">Full name</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${profileError ? 'border-red-400 focus:ring-red-300' : 'border-border focus:ring-fg/30'}`} />
        {profileError && <p className="text-xs text-red-500 mt-1">⚠ {profileError}</p>}
      </div>
      <button onClick={saveProfile} disabled={savingProfile} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold bg-fg text-white rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity">
        <Save className="w-4 h-4" /> {savingProfile ? 'Saving...' : 'Save'}
      </button>

      <div className="p-4 border border-red-200 bg-red-50 rounded-xl mt-4">
        <p className="text-sm font-semibold mb-1 text-fg">Delete account</p>
        <p className="text-xs mb-3 text-muted-foreground">This action is irreversible. All your data will be permanently deleted.</p>
        <button onClick={() => setShowDeleteModal(true)} className="w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors">
          <Trash2 className="w-4 h-4" /> Delete account
        </button>
      </div>
    </div>
  );

  if (section === 'plan') {
    const renewalDate = getRenewalDate(user);
    const isCancelPending = cancelTicket?.cancel_status === 'pending';
    const isCancelApproved = cancelTicket?.cancel_status === 'approved';
    const isCancelRejected = cancelTicket?.cancel_status === 'rejected';
    const displayPrice = isYearly
      ? `$${userPlan?.price_yearly || (userPlan?.price_monthly * 12)}/year`
      : userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/month` : 'Free';
    return (
      <div className={`space-y-4 ${desktop ? 'max-w-lg' : 'pt-2'}`}>
        <div className="p-4 border border-border rounded-xl bg-white">
          <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Current subscription</p>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-black text-fg">{userPlan?.name || 'Free'}</p>
                {isYearly && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-yuzu text-fg">YEARLY</span>}
              </div>
              <p className="text-xs mt-0.5 text-muted-foreground">{displayPrice}</p>
              {renewalDate && userPlan?.price_monthly > 0 && (
                <p className="text-xs mt-1 text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isYearly ? 'Annual renewal on' : 'Monthly renewal on'} {formatDate(renewalDate)}
                </p>
              )}
            </div>
            <span className="px-3 py-1.5 text-xs font-bold bg-yuzu text-fg rounded-lg">
              {userPlan?.credits_limit} Tensors/mo
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => navigate('/manage-plan')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-fg text-white rounded-lg hover:opacity-90">
              Manage <ChevronRight className="w-3 h-3" />
            </button>
            <button onClick={() => navigate('/pricing')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-muted text-fg rounded-lg hover:bg-muted/80">
              Upgrade
            </button>
          </div>
        </div>

        {userPlan?.price_monthly > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Billing history</p>
            <div className="border border-border rounded-xl overflow-hidden bg-white">
              <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-fg">{userPlan.name} plan</p>
                  <p className="text-xs text-muted-foreground">
                    Since {formatDate(user?.subscription_date || user?.created_date)}
                    {isYearly && <span className="ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: 'rgba(221,255,0,0.3)', color: '#555' }}>Annual</span>}
                  </p>
                </div>
                <span className="text-sm font-bold text-fg">{displayPrice}</span>
                {isCancelPending && <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }}>CANCELLATION PENDING</span>}
                {isCancelApproved && cancelTicket?.cancel_ends_at && <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>CANCELLED · ENDS {new Date(cancelTicket.cancel_ends_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>}
                {isCancelRejected && <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>ACTIVE</span>}
                {!cancelTicket && <span className="text-[10px] font-black px-2 py-0.5 bg-green-100 text-green-700 rounded">ACTIVE</span>}
                <button onClick={() => setShowInvoiceModal(true)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-colors ${invoiceRequested[userPlan.name] ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  <Download className="w-3 h-3" />
                  {invoiceRequested[userPlan.name] ? 'Sent!' : 'Invoice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (section === 'usage') return (
    <div className={`space-y-4 ${desktop ? 'max-w-lg' : 'pt-2'}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-fg rounded-xl">
        <div>
          <p className="text-xs text-white/60">Current plan</p>
          <p className="text-sm font-black text-white">{userPlan?.name || 'Free'}</p>
        </div>
        <button onClick={() => navigate('/pricing')} className="px-3 py-1.5 text-xs font-bold bg-yuzu text-fg rounded-lg hover:opacity-90">
          Upgrade
        </button>
      </div>

      <div className="p-4 border border-border rounded-xl bg-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground">Tensors this month</p>
          <p className={`text-xs font-black ${isHigh ? 'text-coral' : 'text-fg'}`}>{fmtN(creditsUsed)} / {fmtN(creditsLimit)}</p>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isHigh ? 'bg-coral' : isMid ? 'bg-amber-500' : 'bg-fg'}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] mt-1.5 text-muted-foreground">{Math.round(pct)}% used</p>
      </div>

      <div className="p-4 border border-border rounded-xl bg-white">
        <p className="text-xs font-semibold mb-4 text-muted-foreground">Last 7 days</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={getDailyUsage()} barSize={14}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#aaa' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, border: '1px solid rgba(0,0,0,0.09)', borderRadius: '8px' }} />
            <Bar dataKey="tensors" fill="#0A0A0A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-4 border border-border rounded-xl bg-white">
        <p className="text-xs font-black uppercase tracking-wider mb-1 text-muted-foreground">Activation Code</p>
        <p className="text-xs mb-3 text-muted-foreground">Enter a code received by email to activate a subscription.</p>
        <div className="flex gap-2">
          <input value={activationCode} onChange={e => setActivationCode(e.target.value.toUpperCase())}
            placeholder="Ex: 4F7K9M2X1R8P" maxLength={16}
            className={`flex-1 px-3 py-2.5 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 transition-all ${codeError ? 'border-red-400 focus:ring-red-300' : 'border-border focus:ring-fg/30'}`}
            onKeyDown={e => { if (e.key === 'Enter') activateCode(); }} />
          <button onClick={activateCode} disabled={codeLoading || !activationCode.trim()}
            className="px-4 py-2.5 text-sm font-bold bg-fg text-white rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity">
            {codeLoading ? '...' : 'Activate'}
          </button>
        </div>
        {codeError && (
          <div className="mt-2 flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-500 text-sm">✗</span>
            <p className="text-xs text-red-600 leading-snug">{codeError}</p>
          </div>
        )}
      </div>
    </div>
  );

  if (section === 'aimode') return (
    <div className={`space-y-4 ${desktop ? 'max-w-md' : 'pt-2'}`}>
      <p className="text-xs text-muted-foreground">Choose the AI mode automatically applied to every new conversation.</p>
      <div className="space-y-2">
        {AI_MODES.map(mode => {
          const allowed = userPlan?.allowed_modes?.includes(mode.id) ?? false;
          const active = defaultMode === mode.id;
          return (
            <button key={mode.id}
              onClick={() => { if (allowed) saveDefaultMode(mode.id); else navigate('/pricing'); }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all text-left"
              style={{
                background: active ? '#0A0A0A' : allowed ? 'white' : 'rgba(0,0,0,0.02)',
                borderColor: active ? '#0A0A0A' : allowed ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.06)',
                opacity: allowed ? 1 : 0.6,
              }}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold" style={{ color: active ? '#DDFF00' : '#0A0A0A' }}>{mode.label}</p>
                  {!allowed && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">Upgrade required</span>}
                </div>
                <p className="text-xs mt-0.5" style={{ color: active ? 'rgba(221,255,0,0.6)' : 'rgba(0,0,0,0.4)' }}>{mode.desc}</p>
              </div>
              {active && allowed && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#DDFF00' }}>
                  <span className="text-[10px] font-black text-black">✓</span>
                </span>
              )}
              {!allowed && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      {!userPlan?.allowed_modes?.includes('ultimate') && (
        <p className="text-[10px] text-muted-foreground">
          Expert mode requires an Expert+ plan. <button onClick={() => navigate('/pricing')} className="underline font-semibold">Upgrade →</button>
        </p>
      )}
    </div>
  );

  return null;
}