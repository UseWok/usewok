import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MessageSquare, CreditCard, Zap, ArrowLeft, Save, Check, Download, ChevronRight, Trash2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPlan, getPlansConfig } from '@/lib/plans-config';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';

const SHORTCUTS = [
  { id: 'enter', label: 'Enter' },
  { id: 'shift_enter', label: 'Shift + Enter' },
  { id: 'ctrl_enter', label: 'Ctrl + Enter' },
];

function SectionTitle({ children }) {
  return <h2 className="text-xs font-black uppercase tracking-wider mb-4 text-muted-foreground">{children}</h2>;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('profile');
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [shortcut, setShortcut] = useState(() => localStorage.getItem('stensor_send_shortcut') || 'enter');
  const [activationCode, setActivationCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [invoiceRequested, setInvoiceRequested] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFullName(u?.full_name || '');
      setUserPlan(getUserPlan(u));
    }).catch(() => {});
  }, []);

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

  const saveShortcut = (s) => {
    setShortcut(s);
    localStorage.setItem('stensor_send_shortcut', s);
    toast.success('Shortcut saved');
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
    const plan = plans.find(p => p.id === codeRecord.plan_id);
    if (!plan) { setCodeError('Plan associated with this code no longer exists.'); setCodeLoading(false); return; }
    await base44.auth.updateMe({
      subscription_plan: plan.id, credits_limit: plan.credits_limit, credits_used: 0,
      credits_bonus: 0, billing_cycle: codeRecord.billing || 'monthly', subscription_date: new Date().toISOString(),
    });
    await base44.entities.ActivationCode.update(codeRecord.id, { used: true, used_by: user.email });
    setActivationCode('');
    toast.success(`Plan ${plan.name} activated!`);
    const updated = await base44.auth.me();
    setUser(updated); setUserPlan(getUserPlan(updated));
    setCodeLoading(false);
  };

  const requestInvoice = async (planName) => {
    if (!user) return;
    await base44.integrations.Core.SendEmail({
      to: user.email, subject: `Invoice request — ${planName}`,
      body: `User ${user.full_name || user.email} (${user.email}) requests an invoice for plan ${planName}.`,
    });
    setInvoiceRequested(p => ({ ...p, [planName]: true }));
    toast.success('Request sent');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await base44.entities.User.delete(user.id);
    base44.auth.logout();
  };

  const navItems = [
    { id: 'profile', label: t('settings_profile'), icon: User },
    { id: 'chat', label: t('settings_chat'), icon: MessageSquare },
    { id: 'plan', label: t('settings_plan'), icon: CreditCard },
    { id: 'usage', label: t('settings_usage'), icon: Zap },
  ];

  const sharedProps = { user, userPlan, fullName, setFullName, saveProfile, savingProfile, profileError, shortcut, saveShortcut, navigate, pct, creditsUsed, creditsLimit, getDailyUsage, activationCode, setActivationCode, activateCode, codeLoading, codeError, invoiceRequested, requestInvoice, setShowDeleteModal, isHigh, isMid, fmtN, t };

  return (
    <div className="min-h-screen font-be" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)' }}>
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
              <SectionTitle>{navItems.find(n => n.id === activeSection)?.label}</SectionTitle>
              <SectionContent section={activeSection} {...sharedProps} desktop />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 pt-5 pb-4 bg-red-500 flex items-center justify-between">
                <p className="text-base font-bold text-white">{t('settings_delete_account')}</p>
                <button onClick={() => setShowDeleteModal(false)} className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground">{t('settings_delete_irreversible')}</p>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Email: <strong className="text-fg">{user?.email}</strong></p>
                </div>
                <button onClick={deleteAccount} className="w-full py-2.5 font-bold text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  {t('settings_confirm_delete')}
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="w-full py-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted transition-colors">
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionContent({ section, desktop, user, userPlan, fullName, setFullName, saveProfile, savingProfile, profileError, shortcut, saveShortcut, navigate, pct, creditsUsed, creditsLimit, getDailyUsage, activationCode, setActivationCode, activateCode, codeLoading, codeError, invoiceRequested, requestInvoice, setShowDeleteModal, isHigh, isMid, fmtN, t }) {
  if (section === 'profile') return (
    <div className={`space-y-4 ${desktop ? 'max-w-md' : 'pt-2'}`}>
      <div>
        <label className="text-xs font-semibold block mb-1 text-muted-foreground">Email (read-only)</label>
        <input value={user?.email || ''} disabled className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed" />
      </div>
      <div>
        <label className="text-xs font-semibold block mb-1 text-muted-foreground">{t('settings_fullname')}</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${profileError ? 'border-red-400 focus:ring-red-300' : 'border-border focus:ring-fg/30'}`} />
        {profileError && <p className="text-xs text-red-500 mt-1">⚠ {profileError}</p>}
      </div>
      <button onClick={saveProfile} disabled={savingProfile} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold bg-fg text-white rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity">
        <Save className="w-4 h-4" /> {savingProfile ? t('settings_saving') : t('settings_save')}
      </button>

      <div className="p-4 border border-red-200 bg-red-50 rounded-xl mt-4">
        <p className="text-sm font-semibold mb-1 text-fg">{t('settings_delete_account')}</p>
        <p className="text-xs mb-3 text-muted-foreground">{t('settings_delete_irreversible')}</p>
        <button onClick={() => setShowDeleteModal(true)} className="w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors">
          <Trash2 className="w-4 h-4" /> {t('settings_delete_account')}
        </button>
      </div>
    </div>
  );

  if (section === 'chat') return (
    <div className={`${desktop ? 'max-w-md' : 'pt-2'} space-y-2`}>
      <p className="text-xs font-semibold mb-3 text-muted-foreground">{t('settings_shortcut_label')}</p>
      {SHORTCUTS.map(s => (
        <button key={s.id} onClick={() => saveShortcut(s.id)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${shortcut === s.id ? 'bg-fg border-fg' : 'bg-white border-border hover:border-fg/30'}`}>
          <span className={`text-sm font-medium ${shortcut === s.id ? 'text-white' : 'text-fg'}`}>{s.label}</span>
          {shortcut === s.id && <Check className="w-4 h-4 text-white" />}
        </button>
      ))}
    </div>
  );

  if (section === 'plan') return (
    <div className={`space-y-4 ${desktop ? 'max-w-lg' : 'pt-2'}`}>
      <div className="p-4 border border-border rounded-xl bg-white">
        <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Current plan</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-black text-fg">{userPlan?.name || 'Free'}</p>
            <p className="text-xs mt-0.5 text-muted-foreground">
              {userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/mo` : 'Free plan'}
            </p>
          </div>
          <span className="px-3 py-1.5 text-xs font-bold bg-yuzu text-fg rounded-lg">
            {userPlan?.credits_limit} Tensors/mo
          </span>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => navigate('/manage-plan')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-fg text-white rounded-lg hover:opacity-90">
            {t('settings_manage_plan')} <ChevronRight className="w-3 h-3" />
          </button>
          <button onClick={() => navigate('/pricing')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-muted text-fg rounded-lg hover:bg-muted/80">
            {t('settings_upgrade')}
          </button>
        </div>
      </div>

      {userPlan?.price_monthly > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">{t('settings_billing_history')}</p>
          <div className="border border-border rounded-xl overflow-hidden bg-white">
            <div className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-fg">Plan {userPlan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(user?.subscription_date || user?.created_date || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className="text-sm font-bold text-fg">${userPlan.price_monthly}/mo</span>
              <span className="text-[10px] font-black px-2 py-0.5 bg-green-100 text-green-700 rounded-lg">PAID</span>
              <button onClick={() => requestInvoice(userPlan.name)}
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
          <p className="text-xs font-semibold text-muted-foreground">{t('settings_tensors_month')}</p>
          <p className={`text-xs font-black ${isHigh ? 'text-coral' : 'text-fg'}`}>{fmtN(creditsUsed)} / {fmtN(creditsLimit)}</p>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isHigh ? 'bg-coral' : isMid ? 'bg-amber-500' : 'bg-fg'}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] mt-1.5 text-muted-foreground">{Math.round(pct)}% used</p>
      </div>

      <div className="p-4 border border-border rounded-xl bg-white">
        <p className="text-xs font-semibold mb-4 text-muted-foreground">{t('settings_7days')}</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={getDailyUsage()} barSize={14}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#aaa' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, border: '1px solid rgba(0,0,0,0.09)', borderRadius: '8px' }} />
            <Bar dataKey="tensors" fill="#0A0A0A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-4 border border-border rounded-xl bg-white">
        <p className="text-xs font-black uppercase tracking-wider mb-1 text-muted-foreground">{t('settings_activation_code')}</p>
        <p className="text-xs mb-3 text-muted-foreground">Enter a code received by email to activate a subscription.</p>
        <div className="flex gap-2">
          <input value={activationCode} onChange={e => setActivationCode(e.target.value.toUpperCase())}
            placeholder="Ex: 4F7K9M2X1R8P" maxLength={16}
            className={`flex-1 px-3 py-2.5 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 transition-all ${codeError ? 'border-red-400 focus:ring-red-300' : 'border-border focus:ring-fg/30'}`}
            onKeyDown={e => { if (e.key === 'Enter') activateCode(); }} />
          <button onClick={activateCode} disabled={codeLoading || !activationCode.trim()}
            className="px-4 py-2.5 text-sm font-bold bg-fg text-white rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity">
            {codeLoading ? '...' : t('settings_activate')}
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

  return null;
}