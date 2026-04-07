import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Package, Star, Crown, Zap, X, Check, Bell,
  Users, Save, Bot, Gift, Ban, Minus, Search, ChevronDown, ChevronUp
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAgentsConfig, saveAgentsConfig } from '@/lib/agents-config';

const PRODUCTS_KEY = 'stensor_products';
const INITIAL_PRODUCTS = [
  { id: '1', name: 'Gratuit', price: 0, credits: 25, icon: 'Zap', popular: false, features: ['25 crédits / mois', 'Mode Fast uniquement', 'Agents de base'] },
  { id: '2', name: 'Pro', price: 9, credits: 500, icon: 'Star', popular: true, features: ['500 crédits / mois', 'Modes Fast & Pro', 'Tous les agents'] },
  { id: '3', name: 'Business', price: 29, credits: 2000, icon: 'Crown', popular: false, features: ['2 000 crédits / mois', 'Mode Ultimate inclus', 'Support dédié'] },
];
const ICONS = { Zap, Star, Crown, Package };

function getProducts() {
  try { return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || INITIAL_PRODUCTS; }
  catch { return INITIAL_PRODUCTS; }
}

function UserRow({ u }) {
  const [expanded, setExpanded] = useState(false);
  const [editCredits, setEditCredits] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const isBanned = u.is_banned && (!u.ban_until || u.ban_until === 'permanent' || new Date(u.ban_until) > new Date());

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const applyCreditsUpdate = async () => {
    const updates = {};
    if (editCredits !== '') updates.credits_used = parseInt(editCredits);
    if (editLimit !== '') updates.credits_limit = parseInt(editLimit);
    if (Object.keys(updates).length === 0) return;
    await base44.entities.User.update(u.id, updates);
    showSaved();
    setEditCredits(''); setEditLimit('');
  };

  const giftCredits = async (amount) => {
    const newBonus = (u.credits_bonus || 0) + amount;
    await base44.entities.User.update(u.id, { credits_bonus: newBonus });
    showSaved();
  };

  const removeBan = async () => {
    await base44.entities.User.update(u.id, { is_banned: false, ban_until: null });
    showSaved();
  };

  const pct = Math.min(((u.credits_used || 0) / (u.credits_limit || 25)) * 100, 100);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-foreground/2 transition-colors">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: 'rgba(255,79,0,0.08)', color: '#FF4F00' }}>
          {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{u.full_name || u.email}</p>
            {isBanned && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">BANNI</span>}
            {u.role === 'admin' && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">ADMIN</span>}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-16 h-1 rounded-full bg-foreground/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? '#ef4444' : '#FF4F00' }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{u.credits_used || 0}/{u.credits_limit || 25}</span>
            </div>
          </div>
        </div>
        {saved && <span className="text-[10px] font-bold text-green-600 flex-shrink-0">✓ Sauvé</span>}
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border">
              {/* Credits custom */}
              <div>
                <p className="text-xs font-semibold text-foreground/50 mb-2">Modifier les crédits</p>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-[10px] text-muted-foreground mb-1 block">Crédits utilisés</label>
                    <input type="number" value={editCredits} onChange={e => setEditCredits(e.target.value)}
                      placeholder={String(u.credits_used || 0)}
                      className="w-full px-2.5 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-[10px] text-muted-foreground mb-1 block">Limite totale</label>
                    <input type="number" value={editLimit} onChange={e => setEditLimit(e.target.value)}
                      placeholder={String(u.credits_limit || 25)}
                      className="w-full px-2.5 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={applyCreditsUpdate}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90">
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick gift */}
              <div>
                <p className="text-xs font-semibold text-foreground/50 mb-2">Offrir des crédits (limite)</p>
                <div className="flex gap-2 flex-wrap">
                  {[10, 25, 50, 100, 500].map(amt => (
                    <button key={amt} onClick={() => giftCredits(amt)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: 'rgba(255,79,0,0.07)', color: '#FF4F00', border: '1px solid rgba(255,79,0,0.2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,79,0,0.14)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,79,0,0.07)'}>
                      <Gift className="w-3 h-3" /> +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ban */}
              <div>
                <p className="text-xs font-semibold text-foreground/50 mb-2">Gestion de l'accès</p>
                {isBanned ? (
                  <button onClick={removeBan}
                    className="px-3 py-1.5 rounded-xl bg-foreground/5 text-foreground text-xs font-semibold hover:bg-foreground/10 transition-colors">
                    Débannir l'utilisateur
                  </button>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {[{ label: '1 jour', val: 1 }, { label: '7 jours', val: 7 }, { label: '30 jours', val: 30 }, { label: 'Permanent', val: 'permanent' }].map(opt => (
                      <button key={opt.label} onClick={() => setBan(opt.val)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${opt.val === 'permanent' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'} border ${opt.val === 'permanent' ? 'border-red-200' : 'border-orange-200'}`}>
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
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState(getProducts);
  const [productsDirty, setProductsDirty] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [newFeature, setNewFeature] = useState('');
  const [notifForm, setNotifForm] = useState({ title: '', message: '', link: '', link_label: '' });
  const [notifSent, setNotifSent] = useState(false);
  const [editingNotif, setEditingNotif] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);
  const [agentsConfig, setAgentsConfig] = useState(getAgentsConfig);

  const qc = useQueryClient();

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

  const saveProductsManual = () => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    setProductsDirty(false);
    showSaved();
  };

  const openEdit = (product) => { setEditing(product.id); setForm({ ...product, features: [...product.features] }); };
  const openCreate = () => { setEditing('new'); setForm({ id: `p_${Date.now()}`, name: '', price: 0, credits: 100, icon: 'Package', popular: false, features: [] }); };
  const saveForm = () => {
    if (editing === 'new') setProducts(p => [...p, form]);
    else setProducts(p => p.map(x => x.id === editing ? form : x));
    setEditing(null); setForm(null); setProductsDirty(true);
  };
  const deleteProduct = (id) => { setProducts(p => p.filter(x => x.id !== id)); setProductsDirty(true); };
  const addFeature = () => { if (!newFeature.trim()) return; setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] })); setNewFeature(''); };

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

  const saveAgentConfig = () => { saveAgentsConfig(agentsConfig); showSaved(); };

  const filteredUsers = users.filter(u =>
    !userSearch || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const tabs = [
    { id: 'products', label: 'Plans', icon: Package },
    { id: 'agents', label: 'Agents IA', icon: Bot },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Utilisateurs', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background font-be py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Administration</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gérez votre plateforme</p>
          </div>
          <AnimatePresence>
            {savedMsg && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-green-700 bg-green-50 border border-green-200">
                <Check className="w-4 h-4" /> Enregistré
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 w-fit flex-wrap">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'users') loadUsers(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 shadow-md">
                <Plus className="w-4 h-4" /> Nouveau plan
              </button>
              <button onClick={saveProductsManual} disabled={!productsDirty}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${productsDirty ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' : 'bg-foreground/5 text-foreground/30 cursor-not-allowed'}`}>
                <Save className="w-4 h-4" /> Sauvegarder
              </button>
            </div>
            {productsDirty && <p className="text-xs text-orange-600 mb-3">⚠ Modifications non sauvegardées</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const Icon = ICONS[product.icon] || Package;
                return (
                  <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className={`bg-card border rounded-2xl p-5 flex flex-col relative ${product.popular ? 'border-primary' : 'border-border'}`}>
                    {product.popular && <span className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">POPULAIRE</span>}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
                        <div>
                          <p className="font-bold text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.credits} crédits/mois</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-foreground">{product.price}€</p>
                    </div>
                    <ul className="space-y-1.5 flex-1 mb-4">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-foreground/70"><Check className="w-3 h-3 text-primary flex-shrink-0" /> {f}</li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Modifier
                      </button>
                      <button onClick={() => deleteProduct(product.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* AGENTS TAB */}
        {tab === 'agents' && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">Configurez les instructions et la base de connaissances de chaque agent IA.</p>
            <div className="flex justify-end">
              <button onClick={saveAgentConfig}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 shadow-md">
                <Save className="w-4 h-4" /> Sauvegarder tout
              </button>
            </div>
            {agentsConfig.map((agent, idx) => (
              <div key={agent.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Bot className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="font-bold text-foreground">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {agent.id}</p>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      const updated = [...agentsConfig];
                      updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                      setAgentsConfig(updated);
                    }}
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${agent.enabled ? 'bg-primary' : 'bg-foreground/15'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${agent.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground/50 mb-1.5 block">Instructions système</label>
                    <textarea value={agent.instructions}
                      onChange={(e) => { const u = [...agentsConfig]; u[idx] = { ...u[idx], instructions: e.target.value }; setAgentsConfig(u); }}
                      rows={4} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground/50 mb-1.5 block">Base de connaissances</label>
                    <textarea value={agent.knowledge}
                      onChange={(e) => { const u = [...agentsConfig]; u[idx] = { ...u[idx], knowledge: e.target.value }; setAgentsConfig(u); }}
                      rows={3} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {tab === 'notifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-base font-bold text-foreground mb-4">Envoyer une notification à tous</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/50 mb-1 block">Titre *</label>
                  <input value={notifForm.title} onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" placeholder="Titre de la notification" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/50 mb-1 block">Message *</label>
                  <textarea value={notifForm.message} onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none" rows={3} placeholder="Contenu du message..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground/50 mb-1 block">Lien (optionnel)</label>
                    <input value={notifForm.link} onChange={e => setNotifForm(f => ({ ...f, link: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" placeholder="/pricing" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground/50 mb-1 block">Libellé du lien</label>
                    <input value={notifForm.link_label} onChange={e => setNotifForm(f => ({ ...f, link_label: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" placeholder="Voir plus" />
                  </div>
                </div>
                <button onClick={sendNotif} disabled={!notifForm.title || !notifForm.message}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
                  <Bell className="w-4 h-4" />
                  {notifSent ? '✓ Envoyée à tous !' : 'Envoyer à tous les utilisateurs'}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-foreground mb-4">Historique ({notifications.length})</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucune notification envoyée</p>}
                {notifications.map(notif => (
                  <div key={notif.id} className="bg-card border border-border rounded-xl p-3">
                    {editingNotif?.id === notif.id ? (
                      <div className="space-y-2">
                        <input value={editingNotif.title} onChange={e => setEditingNotif(n => ({ ...n, title: e.target.value }))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                        <textarea value={editingNotif.message} onChange={e => setEditingNotif(n => ({ ...n, message: e.target.value }))}
                          rows={2} className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-primary resize-none" />
                        <div className="flex gap-2">
                          <button onClick={saveNotif} className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold">Sauvegarder</button>
                          <button onClick={() => setEditingNotif(null)} className="px-3 py-1.5 bg-foreground/5 rounded-lg text-xs">Annuler</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(notif.created_date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setEditingNotif({ ...notif })}
                            className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center">
                            <Pencil className="w-3 h-3 text-foreground/50" />
                          </button>
                          <button onClick={() => deleteNotif(notif.id)}
                            className="w-7 h-7 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center">
                            <Trash2 className="w-3 h-3 text-destructive" />
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

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}</p>
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2 w-56">
                <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Rechercher..." className="bg-transparent text-sm focus:outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              {filteredUsers.map(u => <UserRow key={u.id} u={u} />)}
              {filteredUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-12">Aucun utilisateur trouvé</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit product modal */}
      <AnimatePresence>
        {editing && form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-bold text-foreground">{editing === 'new' ? 'Nouveau plan' : 'Modifier le plan'}</h2>
                <button onClick={() => setEditing(null)} className="w-7 h-7 rounded-lg hover:bg-foreground/8 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground/60 mb-1 block">Nom</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground/60 mb-1 block">Prix (€/mois)</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/60 mb-1 block">Crédits / mois</label>
                  <input type="number" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: +e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="popular" checked={form.popular} onChange={e => setForm(f => ({ ...f, popular: e.target.checked }))} className="rounded" />
                  <label htmlFor="popular" className="text-sm text-foreground/70">Marquer comme populaire</label>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/60 mb-1 block">Fonctionnalités</label>
                  <div className="space-y-1.5 mb-2">
                    {form.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-lg text-xs">
                        <span className="flex-1">{f}</span>
                        <button onClick={() => setForm(fo => ({ ...fo, features: fo.features.filter((_, idx) => idx !== i) }))} className="text-destructive"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newFeature} onChange={e => setNewFeature(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addFeature(); }}
                      placeholder="Ajouter..." className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-primary" />
                    <button onClick={addFeature} className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs hover:bg-primary/20"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 px-5 pb-5">
                <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-foreground/5 hover:bg-foreground/10">Annuler</button>
                <button onClick={saveForm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90">Enregistrer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}