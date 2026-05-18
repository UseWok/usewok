import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, Zap, Save, Download, ChevronRight, Trash2, X, Clock, Brain, Cpu, Shield, CheckCircle2 } from 'lucide-react';
import AISettingsModal from '@/components/settings/AISettingsModal';
import { base44 } from '@/api/base44Client';
import { getUserPlan, getPlansConfig } from '@/lib/plans-config';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

function SectionTitle({ children, description }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{children}</h2>
      {description && <p className="text-[14px] text-slate-500 mt-1">{description}</p>}
    </div>
  );
}

export default function SettingsModal({ open, onClose }) {
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
    if (open) {
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
    }
  }, [open]);

  if (!open) return null;

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
    toast.success('Profile updated successfully.');
  };

  const requestInvoice = async () => {
    if (!user || !invoiceEmail.trim()) return;
    setInvoiceLoading(true);
    await base44.entities.SupportTicket.create({
      title: `Invoice Request — ${user.full_name || user.email}`,
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
    toast.success('Invoice request submitted successfully.');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await base44.entities.User.delete(user.id);
    base44.auth.logout();
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User, desc: 'Manage your personal identity.' },
    { id: 'plan', label: 'Plan & Billing', icon: CreditCard, desc: 'Manage your subscription.' },
    { id: 'usage', label: 'Usage Metrics', icon: Zap, desc: 'Monitor your API consumption.' },
    { id: 'ai_skills', label: 'AI Skills', icon: Brain, modal: true },
    { id: 'ai_control', label: 'AI Control', icon: Cpu, modal: true },
  ];

  const sharedProps = { user, userPlan, fullName, setFullName, saveProfile, savingProfile, profileError, pct, creditsUsed, creditsLimit, getDailyUsage, invoiceRequested, requestInvoice, setShowDeleteModal, isHigh, isMid, fmtN, setShowInvoiceModal, cancelTicket };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-[1000px] h-[90vh] bg-[#FAFAFA] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        
        <div className="absolute top-6 right-6 z-50">
          <button onClick={onClose} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-full transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Workspace Settings</h1>
          </div>

          <div className="md:hidden space-y-3 mb-4">
            {navItems.map(item => {
              const Icon = item.icon;
              const isOpen = activeSection === item.id;
              return (
                <div key={item.id} className="bg-white overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
                  <button onClick={() => item.modal ? setShowAIDNAModal(true) : setActiveSection(isOpen ? null : item.id)} className="w-full flex items-center gap-4 px-5 py-4">
                    <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-xl transition-colors ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block text-[14px] font-bold text-slate-900">{item.label}</span>
                      {item.desc && <span className="block text-[12px] text-slate-500 mt-0.5">{item.desc}</span>}
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && !item.modal && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-5 pb-6 pt-2 border-t border-slate-100">
                          <SectionContent section={item.id} {...sharedProps} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="hidden md:flex gap-10">
            <nav className="flex flex-col gap-2 w-64 flex-shrink-0">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => item.modal ? setShowAIDNAModal(true) : setActiveSection(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-left rounded-xl transition-all duration-200 ${active ? 'bg-white border border-slate-200 shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-100/50 border border-transparent'}`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex-1 min-w-0 max-w-3xl pb-12">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}>
                
                <SectionTitle description={navItems.find(n => n.id === activeSection)?.desc}>
                  {navItems.find(n => n.id === activeSection)?.label}
                </SectionTitle>
                
                <SectionContent section={activeSection} {...sharedProps} desktop />
              </motion.div>
            </div>
          </div>
        </div>

        <AISettingsModal open={showAIDNAModal} onClose={() => setShowAIDNAModal(false)} />

        <AnimatePresence>
          {showInvoiceModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) setShowInvoiceModal(false); }}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                  <p className="text-[15px] font-bold text-slate-900">Request Invoice</p>
                  <button onClick={() => setShowInvoiceModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <p className="text-[13px] text-slate-600 leading-relaxed">Please confirm the email address associated with your payment. Our billing team will forward the document shortly.</p>
                  <div>
                    <label className="text-[12px] font-bold block mb-1.5 text-slate-700">Billing Email</label>
                    <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)}
                      placeholder="finance@company.com"
                      className="w-full px-4 py-3 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  <button onClick={requestInvoice} disabled={invoiceLoading || !invoiceEmail.trim()}
                    className="w-full py-3 text-[13px] font-bold bg-slate-900 text-white rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-colors shadow-sm">
                    {invoiceLoading ? 'Processing Request...' : 'Submit Request'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="px-6 py-5 bg-red-600 flex items-center justify-between">
                  <p className="text-[15px] font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Terminate Account
                  </p>
                  <button onClick={() => setShowDeleteModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <p className="text-[13px] font-medium text-slate-600 leading-relaxed">This action is absolute and irreversible. All associated projects, deployed applications, and personal data will be permanently purged from our servers.</p>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[12px] text-slate-500">Target Account:</p>
                    <p className="text-[13px] font-bold text-slate-900 mt-0.5">{user?.email}</p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <button onClick={deleteAccount} className="w-full py-3 font-bold text-[13px] bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm">
                      I understand, delete my account
                    </button>
                    <button onClick={() => setShowDeleteModal(false)} className="w-full py-3 text-[13px] font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                      Cancel Process
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function SectionContent({ section, desktop, user, userPlan, fullName, setFullName, saveProfile, savingProfile, profileError, pct, creditsUsed, creditsLimit, getDailyUsage, invoiceRequested, requestInvoice, setShowDeleteModal, isHigh, isMid, fmtN, setShowInvoiceModal, cancelTicket }) {
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
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="space-y-5 max-w-md">
          <div>
            <label className="text-[12px] font-bold block mb-1.5 text-slate-700">Account Email (Immutable)</label>
            <input value={user?.email || ''} disabled className="w-full px-4 py-3 text-[13px] bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-[12px] font-bold block mb-1.5 text-slate-700">Full Legal Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              className={`w-full px-4 py-3 text-[13px] border rounded-xl focus:outline-none focus:ring-2 transition-all ${profileError ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'}`} />
            {profileError && <p className="text-[12px] text-red-500 mt-2 font-medium">⚠ {profileError}</p>}
          </div>
          <button onClick={saveProfile} disabled={savingProfile} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 text-[13px] font-bold bg-slate-900 text-white rounded-xl disabled:opacity-50 hover:bg-slate-800 transition-colors shadow-sm">
            <Save className="w-4 h-4" /> {savingProfile ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="border border-red-200 bg-red-50/50 p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-red-600" />
          <p className="text-[15px] font-bold text-red-700">Danger Zone</p>
        </div>
        <p className="text-[13px] text-red-600/80 mb-5 leading-relaxed max-w-xl">
          Permanently remove your account, active applications, and billing history from the Wok servers. This action cannot be reversed.
        </p>
        <button onClick={() => setShowDeleteModal(true)} className="py-2.5 px-5 text-[13px] font-bold flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm">
          <Trash2 className="w-4 h-4" /> Delete Account
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
      <div className="space-y-6">
        <div className="p-6 sm:p-8 border border-slate-200 rounded-3xl bg-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <CreditCard className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-slate-400">Active Architecture</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-slate-900">{userPlan?.name || 'Free'}</p>
                  {isYearly && <span className="text-[10px] font-black px-2 py-1 rounded-md bg-blue-100 text-blue-700">ANNUAL</span>}
                </div>
                <p className="text-[14px] mt-1 font-medium text-slate-500">{displayPrice} <span className="text-slate-300 mx-1">•</span> {userPlan?.credits_limit} Tensors included</p>
              </div>
            </div>

            {renewalDate && userPlan?.price_monthly > 0 && !isCancelApproved && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg mb-6">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-[12px] font-medium text-slate-600">
                  {isYearly ? 'Renews automatically on' : 'Next cycle begins on'} <strong className="text-slate-900">{formatDate(renewalDate)}</strong>
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button onClick={() => window.location.href = '/manage-plan'} className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-sm transition-colors">
                Manage Plan <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => window.location.href = '/pricing'} className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">
                View Upgrades
              </button>
            </div>
          </div>
        </div>

        {userPlan?.price_monthly > 0 && (
          <div className="p-6 sm:p-8 border border-slate-200 rounded-3xl bg-white shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4 text-slate-400">Financial Ledger</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
              <div className="flex-1">
                <p className="text-[14px] font-bold text-slate-900">{userPlan.name} Subscription</p>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Active since {formatDate(user?.subscription_date || user?.created_date)}
                </p>
                
                <div className="mt-3 flex items-center gap-2">
                  {isCancelPending && <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-700">CANCELLATION PENDING</span>}
                  {isCancelApproved && cancelTicket?.cancel_ends_at && <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-red-100 text-red-700">TERMINATES {new Date(cancelTicket.cancel_ends_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>}
                  {isCancelRejected && <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700">ACTIVE</span>}
                  {!cancelTicket && <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> IN GOOD STANDING</span>}
                </div>
              </div>
              
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-200 pt-4 sm:pt-0">
                <span className="text-[16px] font-black text-slate-900">{displayPrice}</span>
                <button onClick={() => setShowInvoiceModal(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-xl transition-colors border shadow-sm ${invoiceRequested[userPlan.name] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <Download className="w-3.5 h-3.5" />
                  {invoiceRequested[userPlan.name] ? 'Dispatched' : 'Request Invoice'}
                </button>
              </div>
            </div>

            {!isCancelApproved && !isCancelPending && (
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                <button onClick={() => window.location.href = '/manage-plan'} className="text-[12px] font-semibold text-slate-400 hover:text-red-500 transition-colors">
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (section === 'usage') {
    const deepUsed = user?.deep_credits_used || 0;
    const deepLimit = userPlan?.deep_credits_limit || 0;
    const deepPct = deepLimit > 0 ? Math.min((deepUsed / deepLimit) * 100, 100) : 0;
    const isDeepHigh = deepLimit > 0 && deepPct >= 90;
    
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="p-6 sm:p-8 border border-slate-200 rounded-3xl bg-white shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-6 text-slate-400">Resource Allocation</p>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-bold text-slate-900 flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500"/> Core Tensors</p>
              <p className={`text-[14px] font-black ${isHigh ? 'text-red-500' : 'text-slate-900'}`}>{fmtN(creditsUsed)} <span className="text-slate-400 font-medium">/ {fmtN(creditsLimit)}</span></p>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-red-500' : isMid ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[12px] mt-2 text-slate-500 font-medium">{Math.round(pct)}% of monthly capacity utilized</p>
          </div>

          {deepLimit > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[14px] font-bold text-slate-900 flex items-center gap-2"><Brain className="w-4 h-4 text-purple-500"/> Deep Synthesis</p>
                <p className={`text-[14px] font-black ${isDeepHigh ? 'text-red-500' : 'text-slate-900'}`}>{deepUsed} <span className="text-slate-400 font-medium">/ {deepLimit}</span></p>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div className={`h-full rounded-full transition-all duration-500 ${isDeepHigh ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${deepPct}%` }} />
              </div>
              <p className="text-[12px] mt-2 text-slate-500 font-medium">{Math.round(deepPct)}% of advanced processing utilized</p>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 border border-slate-200 rounded-3xl bg-white shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-6 text-slate-400">7-Day Trajectory</p>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDailyUsage()} barSize={24}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ fontSize: 12, fontWeight: 'bold', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} 
                />
                <Bar dataKey="tensors" fill="#0f172a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return null;
}