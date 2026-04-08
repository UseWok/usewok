import { useState, useEffect } from 'react';
import TicketsTab from '@/components/admin/TicketsTab';
import CodesTab from '@/components/admin/CodesTab';
import PlanCodesSection from '@/components/admin/CodesTab';
import { getPageModes, savePageModes } from '@/lib/page-modes';
import { Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Users, Save, Bot, Ban, Search, ChevronDown, ChevronUp,
  Gift, Check, X, Pencil, Trash2, CreditCard, Globe, Zap,
  Crown, Shield, Star, MessageSquare, Send
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAgentsConfig, saveAgentsConfig } from '@/lib/agents-config';
import { getPlansConfig, savePlansConfig, DEFAULT_PLANS } from '@/lib/plans-config';
import { toast } from 'sonner';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative w-10 h-5 transition-colors flex-shrink-0"
      style={{ background: value ? FG : 'rgba(0,0,0,0.12)', borderRadius: '10px' }}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white shadow transition-transform`}
        style={{ borderRadius: '8px', transform: value ? 'translateX(22px)' : 'translateX(2px)' }} />
    </button>
  );
}

function PlanEditor({ plan, onChange, onActivate, isCurrentPlan }) {
  const [expanded, setExpanded] = useState(false);

  const field = (key, label, type = 'toggle', min = 0) => {
    if (type === 'toggle') {
      return (
        <div key={key} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <span className="text-xs" style={{ color: '#555' }}>{label}</span>
          <Toggle value={!!plan[key]} onChange={v => onChange({ ...plan, [key]: v })} />
        </div>
      );
    }
    if (type === 'number') {
      return (
        <div key={key} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <span className="text-xs" style={{ color: '#555' }}>{label}</span>
          <input type="number" min={min} value={plan[key]}
            onChange={e => onChange({ ...plan, [key]: parseInt(e.target.value) || 0 })}
            className="w-20 text-right text-xs px-2 py-1 focus:outline-none"
            style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px', background: '#fafafa' }} />
        </div>
      );
    }
  };

  const PLAN_ICONS = { free: Zap, essential: Shield, advanced: Globe, expert: Star, supreme: Crown };
  const Icon = PLAN_ICONS[plan.id] || Zap;

  return (
    <div className="bg-white border rounded-sm overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-black/2">
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"
          style={{ background: isCurrentPlan ? YUZU : 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
          <Icon className="w-4 h-4" style={{ color: isCurrentPlan ? FG : '#666' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold" style={{ color: FG }}>{plan.name}</p>
            {isCurrentPlan && <span className="text-[9px] font-black px-2 py-0.5 tracking-wider" style={{ background: YUZU, color: FG, borderRadius: '2px' }}>VOTRE PLAN</span>}
          </div>
          <p className="text-xs" style={{ color: '#999' }}>{plan.price_monthly}$/mois · {plan.credits_limit} crédits</p>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentPlan && (
            <button onClick={(e) => { e.stopPropagation(); onActivate(); }}
              className="px-3 py-1.5 text-xs font-bold transition-all"
              style={{ background: FG, color: 'white', borderRadius: '3px' }}>
              Activer (test)
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4" style={{ color: '#bbb' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#bbb' }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {/* Codes d'accès pour ce plan */}
              <div className="mb-4 pb-4 space-y-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <PlanCodesSection planId={plan.id} planName={plan.name} billing="monthly" />
                <PlanCodesSection planId={plan.id} planName={plan.name} billing="yearly" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Tarification</p>
                  {field('price_monthly', 'Prix mensuel ($)', 'number', 0)}
                  {field('price_yearly', 'Prix annuel ($)', 'number', 0)}
                  {field('credits_limit', 'Crédits / mois', 'number', 1)}
                  {field('daily_credits_limit', 'Quota journalier (0=illimité)', 'number', 0)}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Fonctionnalités</p>
                  {field('can_choose_model', 'Choix du modèle IA')}
                  {field('internet_access', 'Recherche Internet')}
                  {field('ultimate_access', 'Mode Ultimate')}
                  {field('file_upload', 'Envoi de fichiers')}
                  <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span className="text-xs" style={{ color: '#555' }}>Type d'upload</span>
                    <div className="flex gap-1">
                      {['basique', 'complet'].map(opt => (
                        <button key={opt} onClick={() => onChange({ ...plan, file_upload_extended: opt === 'complet' })}
                          className="px-2.5 py-1 text-[10px] font-bold transition-all"
                          style={{
                            background: (opt === 'complet' ? plan.file_upload_extended : !plan.file_upload_extended) ? FG : 'rgba(0,0,0,0.05)',
                            color: (opt === 'complet' ? plan.file_upload_extended : !plan.file_upload_extended) ? 'white' : '#888',
                            borderRadius: '3px',
                          }}>
                          {opt === 'basique' ? 'Basique (img/txt)' : 'Complet (tous formats)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {field('premium_support', 'Support Premium')}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 mt-3" style={{ color: '#aaa' }}>Limites</p>
                  {field('max_discussions', 'Max discussions (0=illimite)', 'number', 0)}
                  {field('daily_credits_limit', 'Tensors/jour (0=illimite)', 'number', 0)}
                  {field('lessons_per_month', 'Leçons / mois', 'number', 0)}
                  <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div>
                      <span className="text-xs" style={{ color: '#555' }}>Crédits partageables</span>
                      <span className="text-[9px] ml-2 px-1.5 py-0.5 font-bold" style={{ background: 'rgba(58,0,136,0.08)', color: '#3A0088', borderRadius: '2px' }}>Annuel uniquement</span>
                    </div>
                    <input type="number" min={0} value={plan.shareable_credits}
                      onChange={e => onChange({ ...plan, shareable_credits: parseInt(e.target.value) || 0 })}
                      className="w-20 text-right text-xs px-2 py-1 focus:outline-none"
                      style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px', background: '#fafafa' }} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 mt-3" style={{ color: '#aaa' }}>Modes IA autorisés</p>
                  {[{id:'thinking',label:'Standard (1T)'},{id:'pro',label:'Avancé (2T)'},{id:'ultimate',label:'Expert (4T)'}].map(({id: modeId, label: modeLabel}) => (
                    <div key={modeId} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <span className="text-xs" style={{ color: '#555' }}>{modeLabel}</span>
                      <Toggle
                        value={plan.allowed_modes?.includes(modeId)}
                        onChange={v => {
                          const modes = plan.allowed_modes || [];
                          onChange({ ...plan, allowed_modes: v ? [...modes, modeId] : modes.filter(m => m !== modeId) });
                        }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserRow({ u, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [editCredits, setEditCredits] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [saved, setSaved] = useState(false);
  const plans = getPlansConfig();

  const isBanned = u.is_banned && (!u.ban_until || u.ban_until === 'permanent' || new Date(u.ban_until) > new Date());
  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const applyCreditsUpdate = async () => {
    const updates = {};
    if (editCredits !== '') updates.credits_used = parseInt(editCredits);
    if (editLimit !== '') updates.credits_limit = parseInt(editLimit);
    if (Object.keys(updates).length === 0) return;
    await base44.entities.User.update(u.id, updates);
    showSaved(); onUpdate();
    setEditCredits(''); setEditLimit('');
  };

  const giftCredits = async (amount) => {
    const newBonus = (u.credits_bonus || 0) + amount;
    await base44.entities.User.update(u.id, { credits_bonus: newBonus });
    showSaved(); onUpdate();
  };

  const changePlan = async (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    await base44.entities.User.update(u.id, {
      subscription_plan: planId,
      credits_limit: plan.credits_limit,
      credits_used: 0,
      credits_bonus: 0,
    });
    showSaved(); onUpdate();
  };

  const setBan = async (val) => {
    const ban_until = val === 'permanent' ? 'permanent' : new Date(Date.now() + val * 86400000).toISOString();
    await base44.entities.User.update(u.id, { is_banned: true, ban_until });
    showSaved(); onUpdate();
  };

  const removeBan = async () => {
    await base44.entities.User.update(u.id, { is_banned: false, ban_until: null });
    showSaved(); onUpdate();
  };

  const pct = Math.min(((u.credits_used || 0) / (u.credits_limit || 10)) * 100, 100);

  return (
    <div className="bg-white border rounded-sm overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-black/2 transition-colors">
        <div className="w-9 h-9 flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.06)', color: FG, borderRadius: '4px' }}>
          {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate" style={{ color: FG }}>{u.full_name || u.email}</p>
            {isBanned && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600" style={{ borderRadius: '2px' }}>BANNI</span>}
            {u.role === 'admin' && <span className="text-[9px] font-bold px-1.5 py-0.5" style={{ background: YUZU, color: FG, borderRadius: '2px' }}>ADMIN</span>}
            {u.subscription_plan && u.subscription_plan !== 'free' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-black/5" style={{ borderRadius: '2px', color: '#444' }}>
                {u.subscription_plan.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-xs truncate" style={{ color: '#999' }}>{u.email}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-16 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? '#ef4444' : FG }} />
              </div>
              <span className="text-[10px]" style={{ color: '#aaa' }}>{u.credits_used || 0}/{u.credits_limit || 10}</span>
            </div>
          </div>
        </div>
        {saved && <span className="text-[10px] font-bold text-green-600 flex-shrink-0">✓</span>}
        {expanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#bbb' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#bbb' }} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-2 space-y-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {/* Change plan */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Abonnement</p>
                <div className="flex gap-2 flex-wrap">
                  {getPlansConfig().map(plan => (
                    <button key={plan.id} onClick={() => changePlan(plan.id)}
                      className="px-3 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        borderRadius: '3px',
                        background: u.subscription_plan === plan.id ? FG : 'rgba(0,0,0,0.05)',
                        color: u.subscription_plan === plan.id ? 'white' : '#444',
                      }}>
                      {plan.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credits */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Crédits manuels</p>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1 min-w-[90px]">
                    <label className="text-[10px] mb-1 block" style={{ color: '#aaa' }}>Utilisés</label>
                    <input type="number" value={editCredits} onChange={e => setEditCredits(e.target.value)}
                      placeholder={String(u.credits_used || 0)}
                      className="w-full px-2.5 py-2 text-sm focus:outline-none"
                      style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} />
                  </div>
                  <div className="flex-1 min-w-[90px]">
                    <label className="text-[10px] mb-1 block" style={{ color: '#aaa' }}>Limite</label>
                    <input type="number" value={editLimit} onChange={e => setEditLimit(e.target.value)}
                      placeholder={String(u.credits_limit || 10)}
                      className="w-full px-2.5 py-2 text-sm focus:outline-none"
                      style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} />
                  </div>
                  <div className="flex items-end">
                    <button onClick={applyCreditsUpdate}
                      className="px-3 py-2 text-xs font-bold"
                      style={{ background: FG, color: 'white', borderRadius: '3px' }}>
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Gift credits */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Offrir des crédits bonus</p>
                <div className="flex gap-2 flex-wrap">
                  {[10, 25, 50, 100, 500].map(amt => (
                    <button key={amt} onClick={() => giftCredits(amt)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-colors"
                      style={{ background: YUZU, color: FG, borderRadius: '3px' }}>
                      <Gift className="w-3 h-3" /> +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ban */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Accès</p>
                {isBanned ? (
                  <button onClick={removeBan}
                    className="px-3 py-1.5 text-xs font-semibold bg-black/5 hover:bg-black/10 transition-colors"
                    style={{ borderRadius: '3px', color: FG }}>
                    Débannir
                  </button>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {[{ label: '1 jour', val: 1 }, { label: '7 jours', val: 7 }, { label: '30 jours', val: 30 }, { label: 'Permanent', val: 'permanent' }].map(opt => (
                      <button key={opt.label} onClick={() => setBan(opt.val)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-colors ${opt.val === 'permanent' ? 'bg-red-100 text-red-700' : 'bg-orange-50 text-orange-700'}`}
                        style={{ borderRadius: '3px' }}>
                        <Ban className="w-3 h-3" /> {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const [communityUrls, setCommunityUrls] = useState({ discord: '', community: '' });
  const [codesInput, setCodesInput] = useState({}); // planId_billing -> textarea
  const [codesSaved, setCodesSaved] = useState(false);
  const [showCodesTab, setShowCodesTab] = useState(false);
  const [pageModes, setPageModes] = useState({ parcours: 'live', community: 'live' });
  const [saveTimeouts, setSaveTimeouts] = useState({});

  const qc = useQueryClient();

  useEffect(() => {
    return () => {
      Object.values(saveTimeouts).forEach(t => clearTimeout(t));
    };
  }, [saveTimeouts]);

  useEffect(() => {
    // Load existing activation codes
    base44.entities.ActivationCode.list('-created_date', 8000).then(codes => {
      const grouped = {};
      codes.forEach(code => {
        const key = `${code.plan_id}__${code.billing}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(code.code);
      });
      const formatted = {};
      Object.entries(grouped).forEach(([key, codes]) => {
        formatted[key] = codes.join('\n');
      });
      setCodesInput(formatted);
    }).catch(() => {});
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'checkout_urls' }).then(results => {
      if (results.length > 0) { try { setCheckoutUrls(JSON.parse(results[0].value)); } catch {} }
    }).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'community_urls' }).then(results => {
      if (results.length > 0) { try { setCommunityUrls(JSON.parse(results[0].value)); } catch {} }
    }).catch(() => {});
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

  const saveCommunityUrls = async () => {
    const existing = await base44.entities.AppSettings.filter({ key: 'community_urls' });
    const val = JSON.stringify(communityUrls);
    if (existing.length > 0) await base44.entities.AppSettings.update(existing[0].id, { value: val });
    else await base44.entities.AppSettings.create({ key: 'community_urls', value: val });
    showSaved();
  };

  const saveCheckoutUrls = async () => {
    const existing = await base44.entities.AppSettings.filter({ key: 'checkout_urls' });
    const val = JSON.stringify(checkoutUrls);
    if (existing.length > 0) {
      await base44.entities.AppSettings.update(existing[0].id, { value: val });
    } else {
      await base44.entities.AppSettings.create({ key: 'checkout_urls', value: val });
    }
    // Also update plans config with urls
    const updated = getPlansConfig().map(p => checkoutUrls[p.id] ? { ...p, checkout_url: checkoutUrls[p.id] } : p);
    savePlansConfig(updated); setPlansConfig(updated);
    showSaved();
  };

  const saveActivationCodes = async (inputData) => {
    try {
      const entries = Object.entries(inputData || codesInput);

      for (const [key, raw] of entries) {
        const [planId, billing] = key.split('__');
        if (!planId || !billing) continue;

        // Parse codes from textarea
        const newCodes = new Set(
          (raw || '')
            .split(/[\n,;\s]+/)
            .map(c => c.trim().toUpperCase())
            .filter(c => c.length > 0)
        );

        // Fetch existing codes for this plan/billing
        const existingRecords = await base44.entities.ActivationCode.filter({
          plan_id: planId,
          billing: billing,
        });
        const existingCodes = new Set(existingRecords.map(r => r.code));

        // Delete codes that are no longer in the textarea
        for (const record of existingRecords) {
          if (!newCodes.has(record.code)) {
            await base44.entities.ActivationCode.delete(record.id);
          }
        }

        // Create codes that are new
        const codesToCreate = [];
        for (const code of newCodes) {
          if (!existingCodes.has(code)) {
            codesToCreate.push({ code, plan_id: planId, billing, used: false });
          }
        }

        if (codesToCreate.length > 0) {
          await base44.entities.ActivationCode.bulkCreate(codesToCreate);
        }
      }

      setCodesSaved(true);
      setTimeout(() => setCodesSaved(false), 1500);
    } catch (err) {
      toast.error('Erreur lors de la synchronisation');
    }
  };

  const handleCodesChange = (key, value) => {
    setCodesInput(c => ({ ...c, [key]: value }));
    
    // Auto-save avec debounce
    if (saveTimeouts[key]) clearTimeout(saveTimeouts[key]);
    const timeout = setTimeout(() => {
      const newData = { ...codesInput, [key]: value };
      saveActivationCodes(newData);
    }, 1000);
    setSaveTimeouts(t => ({ ...t, [key]: timeout }));
  };
  const saveAgents = () => { saveAgentsConfig(agentsConfig); showSaved(); };

  const activatePlan = async (planId) => {
    if (!currentUser) return;
    const plan = plansConfig.find(p => p.id === planId);
    if (!plan) return;
    await base44.auth.updateMe({ subscription_plan: planId, credits_limit: plan.credits_limit, credits_used: 0, credits_bonus: 0 });
    const updated = await base44.auth.me();
    setCurrentUser(updated);
    showSaved();
  };

  const sendNotif = async () => {
    if (!notifForm.title || !notifForm.message) return;
    await base44.entities.Notification.create(notifForm);
    setNotifForm({ title: '', message: '', link: '', link_label: '' });
    setNotifSent(true); setTimeout(() => setNotifSent(false), 3000);
    qc.invalidateQueries(['notifications']); refetchNotifs();
  };

  const deleteNotif = async (id) => { await base44.entities.Notification.delete(id); refetchNotifs(); };
  const saveNotif = async () => {
    if (!editingNotif) return;
    await base44.entities.Notification.update(editingNotif.id, { title: editingNotif.title, message: editingNotif.message, link: editingNotif.link, link_label: editingNotif.link_label });
    setEditingNotif(null); refetchNotifs();
  };

  const plans = getPlansConfig().filter(p => p.id !== 'free');
  const filteredUsers = users.filter(u => !userSearch || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()));

  const savePageModesHandler = async () => { await savePageModes(pageModes); showSaved(); };

  const tabs = [
    { id: 'plans', label: 'Abonnements', icon: CreditCard },
    { id: 'agents', label: 'Agents IA', icon: Bot },
    { id: 'pages', label: 'Pages', icon: Map },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare },
    { id: 'users', label: 'Utilisateurs', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-white font-be py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: FG }}>Administration</h1>
            <p className="text-sm mt-0.5" style={{ color: '#999' }}>Gérez votre plateforme Stensor</p>
          </div>
          <AnimatePresence>
            {savedMsg && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold"
                style={{ background: YUZU, color: FG, borderRadius: '3px' }}>
                <Check className="w-4 h-4" /> Enregistré
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-1 p-1 mb-8 w-fit flex-wrap" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '5px' }}>
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'users') loadUsers(); }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all`}
                style={{
                  background: tab === t.id ? 'white' : 'transparent',
                  color: tab === t.id ? FG : '#888',
                  borderRadius: '4px',
                  boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* PLANS TAB */}
        {tab === 'plans' && (
          <div>
            {/* Checkout URLs */}
            <div className="mb-6 p-4 border rounded-sm" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px' }}>
              <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: '#aaa' }}>Liens de paiement (redirection Stripe)</p>
              <div className="space-y-3">
                {plansConfig.filter(p => p.id !== 'free').flatMap(plan => [
                  <div key={`${plan.id}_monthly`} className="flex items-center gap-2">
                    <span className="text-xs font-bold w-28 flex-shrink-0" style={{ color: FG }}>{plan.name} <span className="font-normal" style={{ color: '#aaa' }}>mensuel</span></span>
                    <input
                      value={checkoutUrls[`${plan.id}_monthly`] || ''}
                      onChange={e => setCheckoutUrls(u => ({ ...u, [`${plan.id}_monthly`]: e.target.value }))}
                      placeholder="https://buy.stripe.com/..."
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                      style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} />
                  </div>,
                  <div key={`${plan.id}_yearly`} className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold w-28 flex-shrink-0" style={{ color: FG }}>{plan.name} <span className="font-normal" style={{ color: '#aaa' }}>annuel</span></span>
                    <input
                      value={checkoutUrls[`${plan.id}_yearly`] || ''}
                      onChange={e => setCheckoutUrls(u => ({ ...u, [`${plan.id}_yearly`]: e.target.value }))}
                      placeholder="https://buy.stripe.com/..."
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                      style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} />
                  </div>
                ])}
              </div>
              <button onClick={saveCheckoutUrls}
                className="mt-3 px-4 py-2 text-xs font-bold" style={{ background: FG, color: 'white', borderRadius: '3px' }}>
                Sauvegarder les liens (tous appareils)
              </button>
            </div>

            {/* Community URLs */}
            <div className="mb-6 p-4 border rounded-sm" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px' }}>
              <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: '#aaa' }}>Liens Communaute</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold w-24 flex-shrink-0" style={{ color: FG }}>Discord</span>
                  <input value={communityUrls.discord} onChange={e => setCommunityUrls(u => ({ ...u, discord: e.target.value }))}
                    placeholder="https://discord.gg/..."
                    className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold w-24 flex-shrink-0" style={{ color: FG }}>Communaute</span>
                  <input value={communityUrls.community} onChange={e => setCommunityUrls(u => ({ ...u, community: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} />
                </div>
              </div>
              <button onClick={saveCommunityUrls}
                className="mt-3 px-4 py-2 text-xs font-bold" style={{ background: FG, color: 'white', borderRadius: '3px' }}>
                Sauvegarder les liens communaute
              </button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: '#666' }}>
                Configurez les paramètres de chaque plan. En mode test, activez un plan pour le tester sur votre compte.
              </p>
              <button onClick={savePlans}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all"
                style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                <Save className="w-4 h-4" /> Sauvegarder
              </button>
            </div>
            <div className="space-y-3">
              {plansConfig.map((plan, idx) => (
                <PlanEditor key={plan.id} plan={plan}
                  onChange={(updated) => { const u = [...plansConfig]; u[idx] = updated; setPlansConfig(u); }}
                  onActivate={() => activatePlan(plan.id)}
                  isCurrentPlan={currentUser?.subscription_plan === plan.id || (!currentUser?.subscription_plan && plan.id === 'free')}
                />
              ))}
            </div>
            <button onClick={() => { savePlansConfig(DEFAULT_PLANS); setPlansConfig(DEFAULT_PLANS); showSaved(); }}
              className="mt-4 text-xs font-medium transition-colors hover:text-black"
              style={{ color: '#aaa' }}>
              Réinitialiser les plans par défaut
            </button>
          </div>
        )}

        {/* AGENTS TAB */}
        {tab === 'agents' && (
          <div className="space-y-5">
            <div className="flex justify-end">
              <button onClick={saveAgents}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold"
                style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                <Save className="w-4 h-4" /> Sauvegarder tout
              </button>
            </div>
            {agentsConfig.map((agent, idx) => (
              <div key={agent.id} className="bg-white border rounded-sm p-5" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                      <Bot className="w-4 h-4" style={{ color: FG }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: FG }}>{agent.name}</p>
                      <p className="text-xs" style={{ color: '#aaa' }}>ID: {agent.id}</p>
                    </div>
                  </div>
                  <Toggle value={agent.enabled} onChange={v => { const u = [...agentsConfig]; u[idx] = { ...u[idx], enabled: v }; setAgentsConfig(u); }} />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider mb-1.5 block" style={{ color: '#aaa' }}>Instructions système</label>
                    <textarea value={agent.instructions}
                      onChange={(e) => { const u = [...agentsConfig]; u[idx] = { ...u[idx], instructions: e.target.value }; setAgentsConfig(u); }}
                      rows={4} className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                      style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px', background: '#fafafa' }} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider mb-1.5 block" style={{ color: '#aaa' }}>Base de connaissances</label>
                    <textarea value={agent.knowledge}
                      onChange={(e) => { const u = [...agentsConfig]; u[idx] = { ...u[idx], knowledge: e.target.value }; setAgentsConfig(u); }}
                      rows={3} className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                      style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px', background: '#fafafa' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {tab === 'notifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-sm p-5" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
              <h2 className="text-base font-bold mb-4" style={{ color: FG }}>Envoyer une notification</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: '#aaa' }}>Titre *</label>
                  <input value={notifForm.title} onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} placeholder="Titre de la notification" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: '#aaa' }}>Message *</label>
                  <textarea value={notifForm.message} onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} rows={3} placeholder="Contenu..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: '#aaa' }}>Lien</label>
                    <input value={notifForm.link} onChange={e => setNotifForm(f => ({ ...f, link: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm focus:outline-none"
                      style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} placeholder="/pricing" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: '#aaa' }}>Libellé</label>
                    <input value={notifForm.link_label} onChange={e => setNotifForm(f => ({ ...f, link_label: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm focus:outline-none"
                      style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} placeholder="Voir plus" />
                  </div>
                </div>
                <button onClick={sendNotif} disabled={!notifForm.title || !notifForm.message}
                  className="w-full py-2.5 font-bold text-sm disabled:opacity-40"
                  style={{ background: notifSent ? '#16a34a' : FG, color: notifSent ? 'white' : 'white', borderRadius: '4px' }}>
                  {notifSent ? '✓ Envoyée !' : 'Envoyer à tous'}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold mb-4" style={{ color: FG }}>Historique ({notifications.length})</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {notifications.length === 0 && <p className="text-sm text-center py-8" style={{ color: '#aaa' }}>Aucune notification</p>}
                {notifications.map(notif => (
                  <div key={notif.id} className="bg-white border rounded-sm p-3" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                    {editingNotif?.id === notif.id ? (
                      <div className="space-y-2">
                        <input value={editingNotif.title} onChange={e => setEditingNotif(n => ({ ...n, title: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-sm focus:outline-none" style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} />
                        <textarea value={editingNotif.message} onChange={e => setEditingNotif(n => ({ ...n, message: e.target.value }))}
                          rows={2} className="w-full px-2.5 py-1.5 text-xs focus:outline-none resize-none" style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} />
                        <div className="flex gap-2">
                          <button onClick={saveNotif} className="flex-1 py-1.5 text-xs font-semibold" style={{ background: FG, color: 'white', borderRadius: '3px' }}>Sauvegarder</button>
                          <button onClick={() => setEditingNotif(null)} className="px-3 py-1.5 text-xs bg-black/5" style={{ borderRadius: '3px' }}>Annuler</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: FG }}>{notif.title}</p>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#888' }}>{notif.message}</p>
                          <p className="text-[10px] mt-1" style={{ color: '#ccc' }}>{new Date(notif.created_date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setEditingNotif({ ...notif })}
                            className="w-7 h-7 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '3px' }}>
                            <Pencil className="w-3 h-3" style={{ color: '#aaa' }} />
                          </button>
                          <button onClick={() => deleteNotif(notif.id)}
                            className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 transition-colors" style={{ borderRadius: '3px' }}>
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
            <div className="bg-white p-5 border mb-6" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}>
              <p className="text-sm font-bold mb-2" style={{ color: FG }}>Masquer globalement du site</p>
              <p className="text-xs mb-4" style={{ color: '#aaa' }}>Enlève ces sections de l'accueil et des menus pour tous les utilisateurs.</p>
              <div className="flex gap-3 flex-wrap">
                {[{ key: 'show_parcours', label: 'Parcours' }, { key: 'show_community', label: 'Communauté' }].map(opt => (
                  <Toggle key={opt.key} value={pageModes[opt.key] !== false} onChange={v => setPageModes(m => ({ ...m, [opt.key]: v }))} />
                ))}
              </div>
            </div>
            <p className="text-sm mb-6" style={{ color: '#666' }}>Choisissez si une page affiche son contenu réel ou une page "En Construction" vivante.</p>
            <div className="space-y-3">
              {[{ key: 'parcours', label: 'Tensor Academy (Parcours)', desc: 'Le parcours d\'apprentissage IA' }, { key: 'community', label: 'Communauté', desc: 'L\'espace communautaire' }].map(page => (
                <div key={page.key} className="bg-white p-5 overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold" style={{ color: FG }}>{page.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>{page.desc}</p>
                    </div>
                    <div className="flex gap-2">
                      {['live', 'construction'].map(opt => (
                        <button key={opt} onClick={() => setPageModes(m => ({ ...m, [page.key]: opt }))}
                          className="px-3 py-1.5 text-xs font-bold transition-all"
                          style={{
                            borderRadius: '6px',
                            background: pageModes[page.key] === opt ? FG : 'rgba(0,0,0,0.05)',
                            color: pageModes[page.key] === opt ? (opt === 'live' ? YUZU : '#FF6B6B') : '#888',
                          }}>
                          {opt === 'live' ? '✓ En ligne' : '🚧 Construction'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={savePageModesHandler}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
              style={{ background: FG, color: 'white', borderRadius: '6px' }}>
              <Save className="w-4 h-4" /> Sauvegarder les modes
            </button>
          </div>
        )}

        {/* TICKETS TAB */}
        {tab === 'tickets' && <TicketsTab />}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: '#999' }}>{filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}</p>
              <div className="flex items-center gap-2 px-3 py-2 w-56" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#aaa' }} />
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Rechercher..." className="bg-transparent text-sm focus:outline-none flex-1" style={{ color: FG }} />
              </div>
            </div>
            <div className="space-y-2">
              {filteredUsers.map(u => <UserRow key={u.id} u={u} onUpdate={loadUsers} />)}
              {filteredUsers.length === 0 && <p className="text-sm text-center py-12" style={{ color: '#aaa' }}>Aucun utilisateur trouvé</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}