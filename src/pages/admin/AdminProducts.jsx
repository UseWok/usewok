import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, Star, Crown, Zap, X, Check, Bell, Users, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PRODUCTS_KEY = 'stensor_products';
const INITIAL_PRODUCTS = [
  { id: '1', name: 'Gratuit', price: 0, credits: 25, icon: 'Zap', popular: false, features: ['25 crédits / mois', 'Mode Fast uniquement', 'Agents de base'] },
  { id: '2', name: 'Pro', price: 9, credits: 500, icon: 'Star', popular: true, features: ['500 crédits / mois', 'Modes Fast & Pro', 'Tous les agents', 'Support prioritaire'] },
  { id: '3', name: 'Business', price: 29, credits: 2000, icon: 'Crown', popular: false, features: ['2 000 crédits / mois', 'Mode Ultimate inclus', 'Agents personnalisés', 'Support dédié'] },
];

const ICONS = { Zap, Star, Crown, Package };

function getProducts() {
  try { return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || INITIAL_PRODUCTS; }
  catch { return INITIAL_PRODUCTS; }
}
function saveProducts(products) { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }

export default function AdminProducts() {
  const [tab, setTab] = useState('products'); // products | notifications | users
  const [products, setProducts] = useState(getProducts);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [newFeature, setNewFeature] = useState('');
  const [notifForm, setNotifForm] = useState({ title: '', message: '', link: '', link_label: '' });
  const [notifSent, setNotifSent] = useState(false);
  const [users, setUsers] = useState([]);
  const [userCredits, setUserCredits] = useState({});
  const [savedMsg, setSavedMsg] = useState(false);

  const qc = useQueryClient();

  useEffect(() => { base44.entities.User.list().then(setUsers).catch(() => {}); }, []);

  // Auto-save products whenever they change
  useEffect(() => { saveProducts(products); }, [products]);

  const openEdit = (product) => { setEditing(product.id); setForm({ ...product, features: [...product.features] }); };
  const openCreate = () => { setEditing('new'); setForm({ id: `p_${Date.now()}`, name: '', price: 0, credits: 100, icon: 'Package', popular: false, features: [] }); };

  const saveForm = () => {
    if (editing === 'new') setProducts(p => [...p, form]);
    else setProducts(p => p.map(x => x.id === editing ? form : x));
    setEditing(null); setForm(null);
    setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2000);
  };

  const deleteProduct = (id) => setProducts(p => p.filter(x => x.id !== id));
  const addFeature = () => { if (!newFeature.trim()) return; setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] })); setNewFeature(''); };

  const sendNotif = async () => {
    if (!notifForm.title || !notifForm.message) return;
    await base44.entities.Notification.create(notifForm);
    setNotifForm({ title: '', message: '', link: '', link_label: '' });
    setNotifSent(true); setTimeout(() => setNotifSent(false), 3000);
    qc.invalidateQueries(['notifications']);
  };

  const applyCredits = (userId, credits) => {
    // In a real system this would update the user record; here we store in localStorage keyed by userId
    const key = `stensor_user_credits_${userId}`;
    localStorage.setItem(key, String(credits));
    setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2000);
  };

  const tabs = [
    { id: 'products', label: 'Plans & Abonnements', icon: Package },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Utilisateurs', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background font-be py-10 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
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

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 w-fit">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md">
                <Plus className="w-4 h-4" /> Nouveau plan
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const Icon = ICONS[product.icon] || Package;
                return (
                  <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className={`bg-card border rounded-2xl p-5 flex flex-col relative ${product.popular ? 'border-primary' : 'border-border'}`}>
                    {product.popular && <span className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">POPULAIRE</span>}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.credits} crédits/mois</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-foreground">{product.price}€</p>
                    </div>
                    <ul className="space-y-1.5 flex-1 mb-4">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-foreground/70">
                          <Check className="w-3 h-3 text-primary flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(product)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Modifier
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {tab === 'notifications' && (
          <div className="max-w-lg">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Envoyer une notification</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/60 mb-1 block">Titre *</label>
                  <input value={notifForm.title} onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" placeholder="Nouvelle mise à jour" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 mb-1 block">Message *</label>
                  <textarea value={notifForm.message} onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none" rows={3} placeholder="Détaillez votre message..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 mb-1 block">Lien (optionnel)</label>
                  <input value={notifForm.link} onChange={e => setNotifForm(f => ({ ...f, link: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" placeholder="https://... ou /pricing" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 mb-1 block">Libellé du lien</label>
                  <input value={notifForm.link_label} onChange={e => setNotifForm(f => ({ ...f, link_label: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" placeholder="Voir plus" />
                </div>
                <button onClick={sendNotif} disabled={!notifForm.title || !notifForm.message}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Bell className="w-4 h-4" />
                  {notifSent ? '✓ Notification envoyée !' : 'Envoyer à tous les utilisateurs'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">{users.length} utilisateur{users.length !== 1 ? 's' : ''}</p>
            <div className="space-y-3">
              {users.map(u => {
                const storedLimit = parseInt(localStorage.getItem(`stensor_user_credits_limit_${u.id}`) || '25', 10);
                const storedUsed = parseInt(localStorage.getItem(`stensor_user_credits_used_${u.id}`) || '0', 10);
                const localVal = userCredits[u.id] !== undefined ? userCredits[u.id] : storedLimit;
                return (
                  <div key={u.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                      {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{u.full_name || u.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Utilisés: {storedUsed} / {storedLimit} crédits</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5">Limite crédits</label>
                        <input
                          type="number"
                          value={localVal}
                          onChange={e => setUserCredits(prev => ({ ...prev, [u.id]: parseInt(e.target.value) || 0 }))}
                          className="w-24 px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:border-primary"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const val = userCredits[u.id] !== undefined ? userCredits[u.id] : storedLimit;
                          localStorage.setItem(`stensor_user_credits_limit_${u.id}`, String(val));
                          setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2000);
                        }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors mt-4"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {users.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">Aucun utilisateur trouvé</p>}
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-bold text-foreground">{editing === 'new' ? 'Nouveau plan' : 'Modifier le plan'}</h2>
                <button onClick={() => setEditing(null)} className="w-7 h-7 rounded-lg hover:bg-foreground/8 flex items-center justify-center">
                  <X className="w-4 h-4 text-foreground/60" />
                </button>
              </div>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground/60 mb-1 block">Nom</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" placeholder="Pro" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground/60 mb-1 block">Prix (€/mois)</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/60 mb-1 block">Crédits / mois</label>
                  <input type="number" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: +e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
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
                        <button onClick={() => setForm(fo => ({ ...fo, features: fo.features.filter((_, idx) => idx !== i) }))} className="text-destructive hover:opacity-70">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addFeature(); }} placeholder="Ajouter..." className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-primary" />
                    <button onClick={addFeature} className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 px-5 pb-5">
                <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors">Annuler</button>
                <button onClick={saveForm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all">Enregistrer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}