import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Bell, Users, Save, Bot, Search, Check, Pencil, Trash2, CreditCard, Globe, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAgentsConfig, saveAgentsConfig, initAgentsFromDB, AGENT_TONE_OPTIONS, AGENT_LENGTH_OPTIONS, AGENT_LANGUAGE_OPTIONS, AGENT_EMOJI_OPTIONS } from '@/lib/agents-config';
import { getPlansConfig, savePlansConfig, DEFAULT_PLANS } from '@/lib/plans-config';
import { getPageModes, savePageModes } from '@/lib/page-modes';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import TicketsTab from '@/components/admin/TicketsTab';
import CancellationsTab from '@/components/admin/CancellationsTab';
import InvoicesTab from '@/components/admin/InvoicesTab';
import LandingEditor from '@/components/admin/LandingEditor';
import PlanEditor from '@/components/admin/PlanEditor';
import UserRow from '@/components/admin/UserRow';

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-5 flex-shrink-0 rounded-full transition-colors ${value ? 'bg-fg' : 'bg-black/10'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white shadow rounded-full transition-transform ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function AdminProducts() {
  const [tab, setTab] = useState('plans');
  const [plansConfig, setPlansConfig] = useState(getPlansConfig);
  const [savedMsg, setSavedMsg] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', link: '', link_label: '' });
  const [notifSent, setNotifSent] = useState(false);
  const [editingNotif, setEditingNotif] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [agentsConfig, setAgentsConfig] = useState(getAgentsConfig);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkoutUrls, setCheckoutUrls] = useState({});
  const [eventCheckoutUrls, setEventCheckoutUrls] = useState({});
  const [communityUrls, setCommunityUrls] = useState({ discord: '', community: '' });
  const [pageModes, setPageModes] = useState({ parcours: 'live', community: 'live' });
  const [saveTimeouts, setSaveTimeouts] = useState({});
  const [codesInput, setCodesInput] = useState({});

  const qc = useQueryClient();

  useEffect(() => {
    return () => { Object.values(saveTimeouts).forEach(t => clearTimeout(t)); };
  }, [saveTimeouts]);

  useEffect(() => {
    initAgentsFromDB().then(configs => setAgentsConfig(configs)).catch(() => {});
    base44.entities.ActivationCode.list('-created_date', 8000).then(codes => {
      const grouped = {};
      codes.forEach(code => {
        const key = `${code.plan_id}__${code.billing}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(code.code);
      });
      const formatted = {};
      Object.entries(grouped).forEach(([key, codes]) => { formatted[key] = codes.join('\n'); });
      setCodesInput(formatted);
    }).catch(() => {});
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'checkout_urls' }).then(r => { if (r.length > 0) { try { setCheckoutUrls(JSON.parse(r[0].value)); } catch {} } }).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'checkout_urls_event' }).then(r => { if (r.length > 0) { try { setEventCheckoutUrls(JSON.parse(r[0].value)); } catch {} } }).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'community_urls' }).then(r => { if (r.length > 0) { try { setCommunityUrls(JSON.parse(r[0].value)); } catch {} } }).catch(() => {});
    getPageModes().then(m => setPageModes(m));
  }, []);

  const { data: notifications = [], refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 50),
    enabled: tab === 'notifications',
  });

  const loadUsers = () => {
    if (!usersLoaded) {
      base44.entities.User.list('-created_date', 200).then(u => { setUsers(u); setUsersLoaded(true); }).catch(() => {});
    }
  };

  const showSaved = () => { setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2000); };
  const savePlans = () => { savePlansConfig(plansConfig); showSaved(); };
  const saveAgents = () => { saveAgentsConfig(agentsConfig); showSaved(); };

  const saveAppSetting = async (key, value) => {
    const existing = await base44.entities.AppSettings.filter({ key });
    const val = JSON.stringify(value);
    if (existing.length > 0) await base44.entities.AppSettings.update(existing[0].id, { value: val });
    else await base44.entities.AppSettings.create({ key, value: val });
    showSaved();
  };

  const saveActivationCodes = async (inputData) => {
    const entries = Object.entries(inputData || codesInput);
    for (const [key, raw] of entries) {
      const [planId, billing] = key.split('__');
      if (!planId || !billing) continue;
      const newCodes = new Set((raw || '').split(/[\n,;\s]+/).map(c => c.trim().toUpperCase()).filter(c => c.length > 0));
      const existingRecords = await base44.entities.ActivationCode.filter({ plan_id: planId, billing });
      const existingCodes = new Set(existingRecords.map(r => r.code));
      for (const record of existingRecords) { if (!newCodes.has(record.code)) await base44.entities.ActivationCode.delete(record.id); }
      const codesToCreate = [];
      for (const code of newCodes) { if (!existingCodes.has(code)) codesToCreate.push({ code, plan_id: planId, billing, used: false }); }
      if (codesToCreate.length > 0) await base44.entities.ActivationCode.bulkCreate(codesToCreate);
    }
    showSaved();
  };

  const activatePlan = async (planId) => {
    if (!currentUser) return;
    const plan = plansConfig.find(p => p.id === planId);
    if (!plan) return;
    await base44.auth.updateMe({ subscription_plan: planId, credits_limit: plan.credits_limit, credits_used: 0, credits_bonus: 0 });
    const updated = await base44.auth.me();
    setCurrentUser(updated); showSaved();
  };

  const sendNotif = async () => {
    if (!notifForm.title || !notifForm.message) return;
    await base44.entities.Notification.create(notifForm);
    setNotifForm({ title: '', message: '', link: '', link_label: '' });
    setNotifSent(true); setTimeout(() => setNotifSent(false), 3000);
    qc.invalidateQueries(['notifications']); refetchNotifs();
  };

  const deleteNotif = async (id) => {
    try { await base44.entities.Notification.delete(id); } catch {}
    refetchNotifs();
  };
  const saveNotif = async () => {
    if (!editingNotif) return;
    try {
      await base44.entities.Notification.update(editingNotif.id, { title: editingNotif.title, message: editingNotif.message, link: editingNotif.link, link_label: editingNotif.link_label });
    } catch {}
    setEditingNotif(null); refetchNotifs();
  };

  const filteredUsers = users.filter(u => !userSearch || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()));

  const tabs = [
    { id: 'plans', label: 'Subscriptions', icon: CreditCard },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'pages', label: 'Pages', icon: Map },
    { id: 'landing', label: 'Landing Page', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare },
    { id: 'cancellations', label: 'Annulations', icon: X },
    { id: 'invoices', label: 'Factures', icon: CreditCard },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-white font-be py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-fg">Administration</h1>
            <p className="text-sm mt-0.5 text-muted-foreground">Manage your Stensor platform</p>
          </div>
          <AnimatePresence>
            {savedMsg && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-yuzu text-fg rounded-sm">
                <Check className="w-4 h-4" /> Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 mb-8 w-fit flex-wrap bg-muted rounded-sm">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'users') loadUsers(); }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-all ${tab === t.id ? 'bg-white text-fg shadow-sm' : 'text-muted-foreground hover:text-fg'}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* PLANS TAB */}
        {tab === 'plans' && (
          <div>
            {/* Checkout URLs */}
            <div className="mb-6 p-4 border border-border rounded-sm">
              <p className="text-xs font-black uppercase tracking-wider mb-3 text-muted-foreground">Stripe payment links</p>
              <div className="space-y-3">
                {plansConfig.filter(p => p.id !== 'free').flatMap(plan => [
                  <div key={`${plan.id}_monthly`} className="flex items-center gap-2">
                    <span className="text-xs font-bold w-28 flex-shrink-0 text-fg">{plan.name} <span className="font-normal text-muted-foreground">monthly</span></span>
                    <input value={checkoutUrls[`${plan.id}_monthly`] || ''} onChange={e => setCheckoutUrls(u => ({ ...u, [`${plan.id}_monthly`]: e.target.value }))}
                      placeholder="https://buy.stripe.com/..." className="flex-1 px-3 py-2 text-xs border border-border rounded-sm focus:outline-none" />
                  </div>,
                  <div key={`${plan.id}_yearly`} className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold w-28 flex-shrink-0 text-fg">{plan.name} <span className="font-normal text-muted-foreground">yearly</span></span>
                    <input value={checkoutUrls[`${plan.id}_yearly`] || ''} onChange={e => setCheckoutUrls(u => ({ ...u, [`${plan.id}_yearly`]: e.target.value }))}
                      placeholder="https://buy.stripe.com/..." className="flex-1 px-3 py-2 text-xs border border-border rounded-sm focus:outline-none" />
                  </div>
                ])}
              </div>
              <button onClick={() => saveAppSetting('checkout_urls', checkoutUrls)} className="mt-3 px-4 py-2 text-xs font-bold bg-fg text-white rounded-sm hover:opacity-90">Save links</button>
            </div>

            {/* Event checkout URLs */}
            <div className="mb-6 p-4 border border-yuzu/40 bg-yuzu/5 rounded-sm">
              <p className="text-xs font-black uppercase tracking-wider mb-1 text-muted-foreground">🎯 Event offer links — 30% off</p>
              <p className="text-[10px] mb-3 text-muted-foreground">Advanced, Expert & Supreme yearly only. Active during 48h welcome window.</p>
              <div className="space-y-3">
                {['advanced', 'expert', 'supreme'].map(pid => (
                  <div key={pid} className="flex items-center gap-2">
                    <span className="text-xs font-bold w-28 flex-shrink-0 capitalize text-fg">{pid} <span className="font-normal text-muted-foreground">yearly -30%</span></span>
                    <input value={eventCheckoutUrls[`${pid}_yearly_event`] || ''} onChange={e => setEventCheckoutUrls(u => ({ ...u, [`${pid}_yearly_event`]: e.target.value }))}
                      placeholder="https://buy.stripe.com/..." className="flex-1 px-3 py-2 text-xs border border-border rounded-sm focus:outline-none" />
                  </div>
                ))}
              </div>
              <button onClick={() => saveAppSetting('checkout_urls_event', eventCheckoutUrls)} className="mt-3 px-4 py-2 text-xs font-bold bg-fg text-yuzu rounded-sm hover:opacity-90">Save event links</button>
            </div>

            {/* Community URLs */}
            <div className="mb-6 p-4 border border-border rounded-sm">
              <p className="text-xs font-black uppercase tracking-wider mb-3 text-muted-foreground">Community links</p>
              <div className="space-y-2">
                {['discord', 'community'].map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs font-bold w-24 flex-shrink-0 capitalize text-fg">{key}</span>
                    <input value={communityUrls[key]} onChange={e => setCommunityUrls(u => ({ ...u, [key]: e.target.value }))}
                      placeholder="https://..." className="flex-1 px-3 py-2 text-xs border border-border rounded-sm focus:outline-none" />
                  </div>
                ))}
              </div>
              <button onClick={() => saveAppSetting('community_urls', communityUrls)} className="mt-3 px-4 py-2 text-xs font-bold bg-fg text-white rounded-sm hover:opacity-90">Save</button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Configure each plan. Changes save to all users instantly.</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newPlan = {
                      id: `plan_${Date.now()}`,
                      name: 'New Plan',
                      price_monthly: 0,
                      price_yearly: 0,
                      credits_limit: 50,
                      daily_credits_limit: 0,
                      can_choose_model: false,
                      default_model: 'gemini_3_flash',
                      allowed_modes: ['thinking'],
                      internet_access: false,
                      max_discussions: 10,
                      file_upload: false,
                      file_upload_extended: false,
                      ultimate_access: false,
                      lessons_per_month: 0,
                      shareable_credits: 0,
                      premium_support: false,
                    };
                    setPlansConfig(prev => [...prev, newPlan]);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-yuzu text-fg rounded-sm hover:opacity-90">
                  <Plus className="w-4 h-4" /> Add plan
                </button>
                <button onClick={savePlans} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-fg text-white rounded-sm hover:opacity-90">
                  <Save className="w-4 h-4" /> Save all
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {plansConfig.map((plan, idx) => (
                <div key={plan.id} className="relative group">
                  <PlanEditor plan={plan}
                    onChange={(updated) => { const u = [...plansConfig]; u[idx] = updated; setPlansConfig(u); }}
                    onActivate={() => activatePlan(plan.id)}
                    isCurrentPlan={currentUser?.subscription_plan === plan.id || (!currentUser?.subscription_plan && plan.id === 'free')}
                  />
                  {plan.id !== 'free' && (
                    <button
                      onClick={() => {
                        if (!confirm(`Delete plan "${plan.name}"?`)) return;
                        setPlansConfig(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-sm z-10">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => { savePlansConfig(DEFAULT_PLANS); setPlansConfig(DEFAULT_PLANS); showSaved(); }}
              className="mt-4 text-xs font-medium text-muted-foreground hover:text-fg transition-colors">
              Reset to default plans
            </button>
          </div>
        )}

        {/* AGENTS TAB */}
        {tab === 'agents' && (
          <div className="space-y-5">
            <div className="flex justify-end">
              <button onClick={saveAgents} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-fg text-white rounded-sm hover:opacity-90">
                <Save className="w-4 h-4" /> Save all
              </button>
            </div>
            {agentsConfig.map((agent, idx) => {
              const update = (field, val) => { const u = [...agentsConfig]; u[idx] = { ...u[idx], [field]: val }; setAgentsConfig(u); };
              return (
              <div key={agent.id} className="bg-white border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-yuzu rounded-xl">
                      <Bot className="w-4 h-4 text-fg" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-fg">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {agent.id}</p>
                    </div>
                  </div>
                  <Toggle value={agent.enabled} onChange={v => update('enabled', v)} />
                </div>

                {/* Behaviour options */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { field: 'tone', label: 'Tone', options: AGENT_TONE_OPTIONS },
                    { field: 'response_length', label: 'Response length', options: AGENT_LENGTH_OPTIONS },
                    { field: 'language', label: 'Language', options: AGENT_LANGUAGE_OPTIONS },
                    { field: 'emoji_usage', label: 'Emoji usage', options: AGENT_EMOJI_OPTIONS },
                  ].map(({ field, label, options }) => (
                    <div key={field}>
                      <label className="text-[10px] font-black uppercase tracking-wider mb-1.5 block text-muted-foreground">{label}</label>
                      <select value={agent[field] || 'auto'} onChange={e => update(field, e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-fg cursor-pointer">
                        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Focus areas */}
                <div className="mb-4">
                  <label className="text-[10px] font-black uppercase tracking-wider mb-1.5 block text-muted-foreground">Focus areas <span className="normal-case font-normal">(comma-separated, e.g. investing, budgeting)</span></label>
                  <input value={agent.focus_areas || ''} onChange={e => update('focus_areas', e.target.value)}
                    placeholder="e.g. real estate, crypto, savings, debt payoff"
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-fg" />
                </div>

                {/* System prompt + knowledge */}
                <div className="space-y-3">
                  {[{ field: 'instructions', label: 'System instructions', rows: 5 }, { field: 'knowledge', label: 'Knowledge base', rows: 3 }].map(({ field, label, rows }) => (
                    <div key={field}>
                      <label className="text-[10px] font-black uppercase tracking-wider mb-1.5 block text-muted-foreground">{label}</label>
                      <textarea value={agent[field]} onChange={e => update(field, e.target.value)}
                        rows={rows} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-1 focus:ring-fg resize-none" />
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {tab === 'notifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-border rounded-sm p-5">
              <h2 className="text-base font-bold mb-4 text-fg">Send notification</h2>
              <div className="space-y-3">
                {['title', 'message'].map(key => (
                  <div key={key}>
                    <label className="text-[10px] font-black uppercase tracking-wider mb-1 block text-muted-foreground">{key} *</label>
                    {key === 'message'
                      ? <textarea value={notifForm[key]} onChange={e => setNotifForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm border border-border rounded-sm focus:outline-none resize-none" rows={3} />
                      : <input value={notifForm[key]} onChange={e => setNotifForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm border border-border rounded-sm focus:outline-none" />}
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  {['link', 'link_label'].map(key => (
                    <div key={key}>
                      <label className="text-[10px] font-black uppercase tracking-wider mb-1 block text-muted-foreground">{key.replace('_', ' ')}</label>
                      <input value={notifForm[key]} onChange={e => setNotifForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-border rounded-sm focus:outline-none"
                        placeholder={key === 'link' ? '/pricing' : 'See more'} />
                    </div>
                  ))}
                </div>
                <button onClick={sendNotif} disabled={!notifForm.title || !notifForm.message}
                  className={`w-full py-2.5 font-bold text-sm rounded-sm transition-colors disabled:opacity-40 ${notifSent ? 'bg-green-600 text-white' : 'bg-fg text-white hover:opacity-90'}`}>
                  {notifSent ? '✓ Sent!' : 'Send to all'}
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold mb-4 text-fg">History ({notifications.length})</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {notifications.length === 0 && <p className="text-sm text-center py-8 text-muted-foreground">No notifications</p>}
                {notifications.map(notif => (
                  <div key={notif.id} className="bg-white border border-border rounded-sm p-3">
                    {editingNotif?.id === notif.id ? (
                      <div className="space-y-2">
                        <input value={editingNotif.title} onChange={e => setEditingNotif(n => ({ ...n, title: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-sm border border-border rounded-sm focus:outline-none" />
                        <textarea value={editingNotif.message} onChange={e => setEditingNotif(n => ({ ...n, message: e.target.value }))}
                          rows={2} className="w-full px-2.5 py-1.5 text-xs border border-border rounded-sm focus:outline-none resize-none" />
                        <div className="flex gap-2">
                          <button onClick={saveNotif} className="flex-1 py-1.5 text-xs font-semibold bg-fg text-white rounded-sm">Save</button>
                          <button onClick={() => setEditingNotif(null)} className="px-3 py-1.5 text-xs bg-muted rounded-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-fg">{notif.title}</p>
                          <p className="text-xs mt-0.5 line-clamp-2 text-muted-foreground">{notif.message}</p>
                          <p className="text-[10px] mt-1 text-muted-foreground/50">{new Date(notif.created_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setEditingNotif({ ...notif })} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-sm transition-colors">
                            <Pencil className="w-3 h-3 text-muted-foreground" />
                          </button>
                          <button onClick={() => deleteNotif(notif.id)} className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-sm transition-colors">
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAGES TAB */}
        {tab === 'pages' && (
          <div className="max-w-xl">
            <div className="bg-white p-5 border border-border rounded-sm mb-6">
              <p className="text-sm font-bold mb-2 text-fg">Hide from site globally</p>
              <p className="text-xs mb-4 text-muted-foreground">Removes these sections from the home and menus for all users.</p>
              <div className="flex gap-4 flex-wrap">
                {[{ key: 'show_parcours', label: 'Journey' }, { key: 'show_community', label: 'Community' }].map(opt => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <Toggle value={pageModes[opt.key] !== false} onChange={v => setPageModes(m => ({ ...m, [opt.key]: v }))} />
                    <span className="text-xs font-medium text-fg">{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 mb-5">
              {[{ key: 'parcours', label: 'Tensor Academy', desc: 'AI learning journey' }, { key: 'community', label: 'Community', desc: 'Community space' }].map(page => (
                <div key={page.key} className="bg-white p-5 border border-border rounded-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-fg">{page.label}</p>
                      <p className="text-xs mt-0.5 text-muted-foreground">{page.desc}</p>
                    </div>
                    <div className="flex gap-2">
                      {['live', 'construction'].map(opt => (
                        <button key={opt} onClick={() => setPageModes(m => ({ ...m, [page.key]: opt }))}
                          className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all ${pageModes[page.key] === opt ? 'bg-fg text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                          {opt === 'live' ? '✓ Live' : '🚧 Construction'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={async () => { await savePageModes(pageModes); showSaved(); }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-fg text-white rounded-sm hover:opacity-90">
              <Save className="w-4 h-4" /> Save page modes
            </button>
          </div>
        )}

        {tab === 'landing' && <LandingEditor />}
        {tab === 'tickets' && <TicketsTab />}
        {tab === 'cancellations' && <CancellationsTab />}
        {tab === 'invoices' && <InvoicesTab />}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</p>
              <div className="flex items-center gap-2 px-3 py-2 w-56 bg-muted rounded-sm">
                <Search className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search..." className="bg-transparent text-sm focus:outline-none flex-1 text-fg" />
              </div>
            </div>
            <div className="space-y-2">
              {filteredUsers.map(u => <UserRow key={u.id} u={u} onUpdate={loadUsers} />)}
              {filteredUsers.length === 0 && <p className="text-sm text-center py-12 text-muted-foreground">No users found</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}