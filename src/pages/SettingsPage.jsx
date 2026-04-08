import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MessageSquare, CreditCard, Zap, ArrowLeft, Save, Check, Download, ChevronRight, Trash2, LogOut, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPlan, getPlansConfig } from '@/lib/plans-config';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const CORAL = '#FF4F00';

const SHORTCUTS = [
  { id: 'enter', label: 'Enter' },
  { id: 'shift_enter', label: 'Shift + Enter' },
  { id: 'ctrl_enter', label: 'Ctrl + Enter' },
];

function SectionTitle({ children }) {
  return <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: '#aaa' }}>{children}</h2>;
}

// Shared content renderer for mobile accordion + desktop panels
function MobileSectionContent({ section, user, userPlan, fullName, setFullName, saveProfile, savingProfile, shortcut, saveShortcut, navigate, pct, creditsUsed, creditsLimit, getDailyUsage, activationCode, setActivationCode, activateCode, codeLoading, invoiceRequested, requestInvoice, setShowDeleteModal, CORAL }) {
  const FG = '#0A0A0A';
  const YUZU = '#DDFF00';
  const { t } = useLanguage();
  if (section === 'profile') return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: '#999' }}>Email (non modifiable)</label>
        <input value={user?.email || ''} disabled className="w-full px-3 py-2.5 text-sm" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', color: '#aaa', background: 'rgba(0,0,0,0.03)' }} />
      </div>
      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: '#555' }}>Nom complet</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2.5 text-sm focus:outline-none" style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
      </div>
      <button onClick={saveProfile} disabled={savingProfile} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold" style={{ background: FG, color: 'white', borderRadius: '8px' }}>
        <Save className="w-4 h-4" /> {savingProfile ? 'Enregistrement...' : 'Sauvegarder'}
      </button>
      <div className="p-4" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)', borderRadius: '10px' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: FG }}>Supprimer le compte</p>
        <p className="text-xs mb-3" style={{ color: '#888' }}>Action irréversible. Toutes vos données seront supprimées.</p>
        <button onClick={() => setShowDeleteModal(true)} className="w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', borderRadius: '8px' }}>
          <Trash2 className="w-4 h-4" /> Supprimer le compte
        </button>
      </div>
    </div>
  );
  if (section === 'chat') return (
    <div className="space-y-2 pt-2">
      <p className="text-xs font-semibold mb-3" style={{ color: '#555' }}>Raccourci pour envoyer un message</p>
      {SHORTCUTS.map(s => (
        <button key={s.id} onClick={() => saveShortcut(s.id)} className="w-full flex items-center justify-between px-4 py-3 transition-all"
          style={{ border: `1px solid ${shortcut === s.id ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '8px', background: shortcut === s.id ? FG : 'white' }}>
          <span className="text-sm font-medium" style={{ color: shortcut === s.id ? 'white' : '#444' }}>{s.label}</span>
          {shortcut === s.id && <Check className="w-4 h-4 text-white" />}
        </button>
      ))}
    </div>
  );
  if (section === 'plan') return (
    <div className="space-y-4 pt-2">
      <div className="p-4" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '10px', background: 'white' }}>
        <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Plan actuel</p>
        <p className="text-lg font-black mb-0.5" style={{ color: FG }}>{userPlan?.name || 'Free'}</p>
        <span className="inline-block px-2.5 py-1 text-xs font-bold mb-3" style={{ background: YUZU, color: FG, borderRadius: '4px' }}>{userPlan?.credits_limit} Tensors/mois</span>
        <div className="flex gap-2">
          <button onClick={() => navigate('/manage-plan')} className="flex-1 py-2.5 text-xs font-bold" style={{ background: FG, color: 'white', borderRadius: '6px' }}>Gérer le plan</button>
          <button onClick={() => navigate('/pricing')} className="flex-1 py-2.5 text-xs font-bold" style={{ background: 'rgba(0,0,0,0.06)', color: '#555', borderRadius: '6px' }}>Mettre à niveau</button>
        </div>
      </div>
    </div>
  );
  if (section === 'usage') return (
    <div className="space-y-4 pt-2">
      <div className="p-4" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '10px' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold" style={{ color: '#555' }}>Tensors ce mois</p>
          <p className="text-xs font-black" style={{ color: pct >= 90 ? CORAL : FG }}>{creditsUsed} / {creditsLimit}</p>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? CORAL : pct >= 70 ? '#f59e0b' : FG }} />
        </div>
      </div>
      <div className="p-4" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '10px' }}>
        <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>Code d'activation</p>
        <div className="flex gap-2 mt-3">
          <input value={activationCode} onChange={e => setActivationCode(e.target.value.toUpperCase())} placeholder="Ex: 4F7K9M2X1R8P" maxLength={12}
            className="flex-1 px-3 py-2.5 text-sm font-mono focus:outline-none" style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}
            onKeyDown={e => { if (e.key === 'Enter') activateCode(); }} />
          <button onClick={activateCode} disabled={codeLoading || !activationCode.trim()} className="px-4 py-2.5 text-sm font-bold disabled:opacity-40" style={{ background: FG, color: 'white', borderRadius: '8px' }}>
            {codeLoading ? '...' : 'Activer'}
          </button>
        </div>
      </div>
    </div>
  );
  return null;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('profile');
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [shortcut, setShortcut] = useState(() => localStorage.getItem('stensor_send_shortcut') || 'enter');
  const [activationCode, setActivationCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [invoiceRequested, setInvoiceRequested] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFullName(u?.full_name || '');
      setUserPlan(getUserPlan(u));
    }).catch(() => {});
  }, []);

  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan ? userPlan.credits_limit + (user?.credits_bonus || 0) : 10;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);

  // 7-day usage chart
  const getDailyUsage = () => {
    try {
      const data = JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}');
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days.push({ date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), tensors: data[key] || 0 });
      }
      return days;
    } catch { return []; }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    await base44.auth.updateMe({ full_name: fullName });
    setSavingProfile(false);
    toast.success('Profil mis à jour');
  };

  const saveShortcut = (s) => {
    setShortcut(s);
    localStorage.setItem('stensor_send_shortcut', s);
    toast.success('Raccourci enregistré');
  };

  const activateCode = async () => {
    if (!activationCode.trim() || !user) return;
    setCodeLoading(true);
    const results = await base44.entities.ActivationCode.filter({ code: activationCode.trim(), used: false });
    if (results.length === 0) {
      toast.error('Code invalide ou déjà utilisé');
      setCodeLoading(false);
      return;
    }
    const codeRecord = results[0];
    const plans = getPlansConfig();
    const plan = plans.find(p => p.id === codeRecord.plan_id);
    if (!plan) { toast.error('Plan introuvable'); setCodeLoading(false); return; }
    const billingCycle = codeRecord.billing || 'monthly';
    // Activate plan with billing info
    await base44.auth.updateMe({
      subscription_plan: plan.id,
      credits_limit: plan.credits_limit,
      credits_used: 0,
      credits_bonus: 0,
      billing_cycle: billingCycle,
      subscription_date: new Date().toISOString(),
    });
    // Mark code as used
    await base44.entities.ActivationCode.update(codeRecord.id, { used: true, used_by: user.email });
    setActivationCode('');
    toast.success(`Plan ${plan.name} activé !`);
    const updated = await base44.auth.me();
    setUser(updated);
    setUserPlan(getUserPlan(updated));
    setCodeLoading(false);
  };

  const requestInvoice = async (planName) => {
    if (!user) return;
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Demande de facture — ${planName}`,
      body: `L'utilisateur ${user.full_name || user.email} (${user.email}) demande une facture pour le plan ${planName}.`,
    });
    setInvoiceRequested(p => ({ ...p, [planName]: true }));
    toast.success('Demande envoyée');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await base44.auth.updateMe({});
    await base44.entities.User.delete(user.id);
    base44.auth.logout();
  };

  const navItems = [
    { id: 'profile', label: t('settings_profile'), icon: User },
    { id: 'chat', label: t('settings_chat'), icon: MessageSquare },
    { id: 'plan', label: t('settings_plan'), icon: CreditCard },
    { id: 'usage', label: t('settings_usage'), icon: Zap },
  ];

  return (
    <div className="min-h-screen font-be" style={{ background: '#f7f7f7' }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="w-9 h-9 flex items-center justify-center transition-colors" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#888' }} />
          </button>
          <h1 className="text-xl font-black" style={{ color: FG }}>Settings</h1>
        </div>

        {/* Mobile: stacked cards layout */}
        <div className="md:hidden space-y-2 mb-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isOpen = activeSection === item.id;
            return (
              <div key={item.id} className="bg-white overflow-hidden" style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)' }}>
                <button onClick={() => setActiveSection(isOpen ? null : item.id)}
                  className="w-full flex items-center gap-3 px-4 py-4">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                    style={{ background: isOpen ? FG : 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                    <Icon className="w-4 h-4" style={{ color: isOpen ? YUZU : '#888' }} />
                  </div>
                  <span className="flex-1 text-left text-sm font-semibold" style={{ color: FG }}>{item.label}</span>
                  <ChevronRight className="w-4 h-4 transition-transform" style={{ color: '#ccc', transform: isOpen ? 'rotate(90deg)' : 'none' }} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-4 pb-5 pt-1" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <MobileSectionContent section={item.id} {...{ user, userPlan, fullName, setFullName, saveProfile, savingProfile, shortcut, saveShortcut, navigate, pct, creditsUsed, creditsLimit, getDailyUsage, activationCode, setActivationCode, activateCode, codeLoading, invoiceRequested, requestInvoice, setShowDeleteModal, CORAL }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="hidden md:flex gap-8">
          {/* Left nav — desktop */}
          <nav className="flex flex-col gap-1 w-48 flex-shrink-0">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-left transition-all"
                  style={{ background: activeSection === item.id ? YUZU : 'transparent', color: activeSection === item.id ? FG : '#666', borderRadius: '4px' }}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* PROFILE */}
            {activeSection === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <SectionTitle>{t('settings_profile')}</SectionTitle>
                <div className="space-y-6 max-w-md">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#999' }}>{t('settings_email_label')}</label>
                      <input value={user?.email || ''} disabled
                        className="w-full px-3 py-2.5 text-sm bg-black/3 cursor-not-allowed"
                        style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', color: '#aaa' }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#555' }}>{t('settings_fullname')}</label>
                      <input value={fullName} onChange={e => setFullName(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm focus:outline-none"
                        style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                    </div>
                    <button onClick={saveProfile} disabled={savingProfile}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all"
                      style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                      <Save className="w-4 h-4" /> {savingProfile ? t('settings_saving') : t('settings_save')}
                    </button>
                  </div>
                  
                  {/* Delete account */}
                  <div className="p-4" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', borderRadius: '5px' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: FG }}>{t('settings_delete_account')}</p>
                    <p className="text-xs mb-4" style={{ color: '#888' }}>{t('settings_delete_irreversible')}</p>
                    <button onClick={() => setShowDeleteModal(true)}
                      className="w-full px-4 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                      style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '4px' }}>
                      <Trash2 className="w-4 h-4" /> {t('settings_delete_account')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CHAT SETTINGS */}
            {activeSection === 'chat' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <SectionTitle>{t('settings_chat')}</SectionTitle>
                <div className="max-w-md">
                  <p className="text-xs font-semibold mb-3" style={{ color: '#555' }}>{t('settings_shortcut_label')}</p>
                  <div className="space-y-2">
                    {SHORTCUTS.map(s => (
                      <button key={s.id} onClick={() => saveShortcut(s.id)}
                        className="w-full flex items-center justify-between px-4 py-3 transition-all"
                        style={{ border: `1px solid ${shortcut === s.id ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '4px', background: shortcut === s.id ? FG : 'white' }}>
                        <span className="text-sm font-medium" style={{ color: shortcut === s.id ? 'white' : '#444' }}>{s.label}</span>
                        {shortcut === s.id && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PLAN & BILLING */}
            {activeSection === 'plan' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <SectionTitle>{t('settings_plan')}</SectionTitle>
                <div className="space-y-4 max-w-lg">
                  {/* Current plan */}
                  <div className="p-4" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '6px' }}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>{t('settings_current_plan')}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-black" style={{ color: FG }}>{userPlan?.name || 'Free'}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#999' }}>
                          {userPlan?.price_monthly > 0
                            ? (() => {
                                const isYearly = user?.billing_cycle === 'yearly';
                                const price = isYearly ? (userPlan.price_yearly || userPlan.price_monthly) : userPlan.price_monthly;
                                const renewalLabel = isYearly ? 'Se renouvelle dans 1 an' : 'Se renouvelle dans 1 mois';
                                const subDate = user?.subscription_date ? new Date(user.subscription_date) : null;
                                let renewalDate = '';
                                if (subDate) {
                                  const next = new Date(subDate);
                                  if (isYearly) next.setFullYear(next.getFullYear() + 1);
                                  else next.setMonth(next.getMonth() + 1);
                                  renewalDate = ` · le ${next.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
                                }
                                return `${price}$/mois · ${renewalLabel}${renewalDate}`;
                              })()
                            : 'Plan gratuit'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {user?.billing_cycle && userPlan?.price_monthly > 0 && (
                          <span className="text-[9px] font-bold px-2 py-0.5 mb-1 inline-block" style={{ background: user.billing_cycle === 'yearly' ? 'rgba(22,163,74,0.1)' : 'rgba(0,0,0,0.05)', color: user.billing_cycle === 'yearly' ? '#16a34a' : '#666', borderRadius: '3px' }}>
                            {user.billing_cycle === 'yearly' ? 'ANNUEL' : 'MENSUEL'}
                          </span>
                        )}
                        <span className="px-3 py-1.5 text-xs font-bold block" style={{ background: YUZU, color: FG, borderRadius: '3px' }}>
                          {userPlan?.credits_limit} Tensors/mois
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => navigate('/manage-plan')}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
                        style={{ background: FG, color: 'white', borderRadius: '3px' }}>
                        {t('settings_manage_plan')} <ChevronRight className="w-3 h-3" />
                      </button>
                      <button onClick={() => navigate('/pricing')}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
                        style={{ background: 'rgba(0,0,0,0.05)', color: '#555', borderRadius: '3px' }}>
                        {t('settings_upgrade')}
                      </button>
                    </div>
                  </div>

                  {/* Billing history */}
                  {userPlan?.price_monthly > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>{t('settings_billing_history')}</p>
                      <div className="border overflow-hidden" style={{ borderRadius: '4px', border: '1px solid rgba(0,0,0,0.09)' }}>
                        <div className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <div className="flex-1">
                            <p className="text-sm font-semibold" style={{ color: FG }}>Plan {userPlan.name} ({user?.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'})</p>
                            <p className="text-xs" style={{ color: '#999' }}>
                              {new Date(user?.subscription_date || user?.created_date || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <span className="text-sm font-bold" style={{ color: FG }}>
                            {user?.billing_cycle === 'yearly' ? (userPlan.price_yearly || userPlan.price_monthly) : userPlan.price_monthly}$/mois
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', borderRadius: '2px' }}>PAID</span>
                          <button onClick={() => requestInvoice(userPlan.name)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold transition-all"
                            style={{ background: invoiceRequested[userPlan.name] ? 'rgba(22,163,74,0.1)' : 'rgba(0,0,0,0.05)', color: invoiceRequested[userPlan.name] ? '#16a34a' : '#666', borderRadius: '3px' }}>
                            <Download className="w-3 h-3" />
                            {invoiceRequested[userPlan.name] ? 'Envoyé !' : 'Facture'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* USAGE */}
            {activeSection === 'usage' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <SectionTitle>{t('settings_usage')}</SectionTitle>
                <div className="space-y-5 max-w-lg">
                  {/* Plan info */}
                  <div className="flex items-center justify-between px-4 py-3" style={{ background: FG, borderRadius: '5px' }}>
                    <div>
                      <p className="text-xs text-white/60">Plan actuel</p>
                      <p className="text-sm font-black text-white">{userPlan?.name || 'Free'}</p>
                    </div>
                    <button onClick={() => navigate('/pricing')} className="px-3 py-1.5 text-xs font-bold" style={{ background: YUZU, color: FG, borderRadius: '3px' }}>
                      Mettre à niveau
                    </button>
                  </div>

                  {/* Usage bar */}
                  <div className="p-4" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '5px' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold" style={{ color: '#555' }}>{t('settings_tensors_month')}</p>
                      <p className="text-xs font-black" style={{ color: pct >= 90 ? CORAL : FG }}>{creditsUsed} / {creditsLimit}</p>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 90 ? CORAL : pct >= 70 ? '#f59e0b' : FG }} />
                    </div>
                    <p className="text-[10px] mt-1.5" style={{ color: '#bbb' }}>{Math.round(pct)}% utilisés</p>
                  </div>

                  {/* 7-day chart */}
                  <div className="p-4" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '5px' }}>
                    <p className="text-xs font-semibold mb-4" style={{ color: '#555' }}>{t('settings_7days')}</p>
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart data={getDailyUsage()} barSize={14}>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#bbb' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: 11, border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px' }} />
                        <Bar dataKey="tensors" fill={FG} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Activation code */}
                  <div className="p-4" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '5px' }}>
                    <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>{t('settings_activation_code')}</p>
                    <p className="text-xs mb-3" style={{ color: '#888' }}>{t('settings_activation_desc')}</p>
                    <div className="flex gap-2">
                      <input value={activationCode} onChange={e => setActivationCode(e.target.value.toUpperCase())}
                        placeholder="Ex: 4F7K9M2X1R8P"
                        maxLength={12}
                        className="flex-1 px-3 py-2.5 text-sm font-mono focus:outline-none"
                        style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }}
                        onKeyDown={e => { if (e.key === 'Enter') activateCode(); }} />
                      <button onClick={activateCode} disabled={codeLoading || !activationCode.trim()}
                        className="px-4 py-2.5 text-sm font-bold disabled:opacity-40"
                        style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                        {codeLoading ? '...' : t('settings_activate')}
                      </button>
                    </div>
                  </div>


                </div>
              </motion.div>
            )}
          </div>
        </div>{/* end md:flex */}
      </div>

      {/* Delete account modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white overflow-hidden"
              style={{ borderRadius: '6px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
              <div className="px-6 pt-6 pb-4" style={{ background: '#ef4444' }}>
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-white">{t('settings_delete_account')}</p>
                  <button onClick={() => setShowDeleteModal(false)} className="w-6 h-6 flex items-center justify-center hover:bg-white/10 transition-colors" style={{ borderRadius: '3px' }}>
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs font-semibold" style={{ color: '#555' }}>{t('settings_delete_irreversible')}</p>
                <div className="p-3 bg-black/3" style={{ borderRadius: '4px' }}>
                  <p className="text-xs" style={{ color: '#999' }}>Email: <strong>{user?.email}</strong></p>
                </div>
                <button onClick={deleteAccount} className="w-full py-2.5 font-bold text-sm transition-all" style={{ background: '#ef4444', color: 'white', borderRadius: '4px' }}>
                  {t('settings_confirm_delete')}
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="w-full py-2 text-sm font-medium transition-colors hover:bg-black/5" style={{ borderRadius: '4px', color: '#999' }}>
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