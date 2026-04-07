import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Plus, Trash2, Pencil, Bell, Eye, Search } from 'lucide-react';
import TicketsTab from '@/components/admin/TicketsTab';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

function UserRow({ u, onUpdate }) {
  const [role, setRole] = useState(u.role || 'user');
  const [loading, setLoading] = useState(false);

  const updateRole = async (r) => {
    setRole(r);
    setLoading(true);
    try {
      await base44.entities.User.update(u.id, { role: r });
      onUpdate();
    } catch (e) {
      toast.error('Erreur lors de la mise à jour');
      setRole(u.role);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded-sm flex items-center justify-between" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: FG }}>{u.full_name || 'Utilisateur'}</p>
        <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>{u.email}</p>
        <p className="text-[9px] mt-1" style={{ color: '#ccc' }}>Créé le {new Date(u.created_date).toLocaleDateString('fr-FR')}</p>
      </div>
      <div className="flex gap-2">
        {['user', 'admin'].map(r => (
          <button key={r} onClick={() => updateRole(r)} disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold transition-all"
            style={{
              background: role === r ? FG : 'rgba(0,0,0,0.05)',
              color: role === r ? 'white' : '#666',
              borderRadius: '3px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}>
            {r === 'admin' ? '👑' : '👤'} {r}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [tab, setTab] = useState('products');
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({ name: '', price_monthly: 0, price_yearly: 0, credits_limit: 10 });
  const [agentsConfig, setAgentsConfig] = useState([]);
  const [editingSaved, setEditingSaved] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [notifForm, setNotifForm] = useState({ title: '', message: '', link: '', link_label: '' });
  const [notifSent, setNotifSent] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [editingNotif, setEditingNotif] = useState(null);
  const [pageSettings, setPageSettings] = useState({ show_parcours: true, show_community: true });
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const { data: plans = [], refetch: refetchPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list('-created_date', 100),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
  });

  useEffect(() => {
    loadAgents();
    loadNotifications();
    loadPageSettings();
  }, []);

  const loadAgents = async () => {
    const results = await base44.entities.AppSettings.filter({ key: 'agents_config' });
    if (results.length > 0) {
      try {
        setAgentsConfig(JSON.parse(results[0].value));
      } catch {}
    }
  };

  const loadNotifications = async () => {
    const data = await base44.entities.Notification.list('-created_date', 50);
    setNotifications(data);
  };

  const loadPageSettings = async () => {
    const results = await base44.entities.AppSettings.filter({ key: 'home_page_settings' });
    if (results.length > 0) {
      try {
        setPageSettings(JSON.parse(results[0].value));
      } catch {}
    }
  };

  const saveAgents = async () => {
    const val = JSON.stringify(agentsConfig);
    const results = await base44.entities.AppSettings.filter({ key: 'agents_config' });
    if (results.length > 0) {
      await base44.entities.AppSettings.update(results[0].id, { value: val });
    } else {
      await base44.entities.AppSettings.create({ key: 'agents_config', value: val });
    }
    setEditingSaved(true);
    setTimeout(() => setEditingSaved(false), 2000);
  };

  const sendNotif = async () => {
    if (!notifForm.title || !notifForm.message) return;
    await base44.entities.Notification.create(notifForm);
    setNotifForm({ title: '', message: '', link: '', link_label: '' });
    setNotifSent(true);
    setTimeout(() => setNotifSent(false), 3000);
    loadNotifications();
  };

  const saveNotif = async () => {
    await base44.entities.Notification.update(editingNotif.id, { title: editingNotif.title, message: editingNotif.message });
    setEditingNotif(null);
    loadNotifications();
  };

  const deleteNotif = async (id) => {
    await base44.entities.Notification.delete(id);
    loadNotifications();
  };

  const showSaved = () => {
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

  const handleAddPlan = async () => {
    if (editingPlan) {
      await base44.entities.Plan.update(editingPlan.id, formData);
      setEditingPlan(null);
    } else {
      await base44.entities.Plan.create(formData);
    }
    setFormData({ name: '', price_monthly: 0, price_yearly: 0, credits_limit: 10 });
    setShowPlanForm(false);
    refetchPlans();
  };

  const handleDeletePlan = async (id) => {
    await base44.entities.Plan.delete(id);
    refetchPlans();
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white font-be py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1" style={{ color: FG }}>Administration</h1>
          <p className="text-sm" style={{ color: '#aaa' }}>Gérez les produits, utilisateurs, paramètres et contenu</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="products">Plans</TabsTrigger>
            <TabsTrigger value="agents">Agents IA</TabsTrigger>
            <TabsTrigger value="notifications">Notifs</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="space-y-4">
            <button onClick={() => { setShowPlanForm(true); setEditingPlan(null); setFormData({ name: '', price_monthly: 0, price_yearly: 0, credits_limit: 10 }); }}
              className="px-4 py-2.5 font-bold text-sm flex items-center gap-2 mb-4"
              style={{ background: YUZU, color: FG, borderRadius: '4px' }}>
              <Plus className="w-4 h-4" /> Ajouter un plan
            </button>

            {showPlanForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-white p-5 mb-4 overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: FG }}>{editingPlan ? 'Éditer' : 'Créer'} plan</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nom du plan" className="px-3 py-2 text-sm focus:outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                  <input value={formData.price_monthly} onChange={e => setFormData(f => ({ ...f, price_monthly: parseFloat(e.target.value) || 0 }))}
                    type="number" placeholder="Prix mensuel" className="px-3 py-2 text-sm focus:outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                  <input value={formData.price_yearly} onChange={e => setFormData(f => ({ ...f, price_yearly: parseFloat(e.target.value) || 0 }))}
                    type="number" placeholder="Prix annuel" className="px-3 py-2 text-sm focus:outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                  <input value={formData.credits_limit} onChange={e => setFormData(f => ({ ...f, credits_limit: parseInt(e.target.value) || 0 }))}
                    type="number" placeholder="Limite de crédits" className="px-3 py-2 text-sm focus:outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddPlan} className="px-4 py-2 text-sm font-bold flex-1"
                    style={{ background: FG, color: 'white', borderRadius: '4px' }}>Enregistrer</button>
                  <button onClick={() => setShowPlanForm(false)} className="px-4 py-2 text-sm font-bold flex-1 bg-black/5"
                    style={{ borderRadius: '4px', color: FG }}>Annuler</button>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              {plans.map(plan => (
                <div key={plan.id} className="bg-white p-4 rounded-sm flex items-center justify-between" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: FG }}>{plan.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#999' }}>{plan.price_monthly}€/mois · {plan.credits_limit} crédits</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingPlan(plan); setFormData(plan); setShowPlanForm(true); }}
                      className="px-3 py-1.5 text-xs font-bold" style={{ background: FG, color: 'white', borderRadius: '3px' }}>
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDeletePlan(plan.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-red-50" style={{ color: '#ef4444', borderRadius: '3px' }}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* AGENTS TAB */}
          <TabsContent value="agents" className="space-y-4">
            <button onClick={saveAgents}
              className="px-4 py-2.5 font-bold text-sm transition-all"
              style={{
                background: editingSaved ? '#16a34a' : FG,
                color: 'white',
                borderRadius: '4px',
              }}>
              {editingSaved ? '✓ Sauvegardé' : 'Sauvegarder agents'}
            </button>

            <div className="space-y-4">
              {agentsConfig.map((agent, idx) => (
                <div key={idx} className="bg-white p-5 rounded-sm overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm font-bold" style={{ color: FG }}>{agent.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>ID: {agent.id}</p>
                    </div>
                    <button onClick={() => { const u = [...agentsConfig]; u[idx] = { ...u[idx], enabled: !u[idx].enabled }; setAgentsConfig(u); }}
                      className="px-3 py-1.5 text-xs font-bold transition-all"
                      style={{
                        background: agent.enabled ? FG : 'rgba(0,0,0,0.05)',
                        color: agent.enabled ? YUZU : '#888',
                        borderRadius: '4px',
                      }}>
                      {agent.enabled ? '✓ Actif' : '✕ Inactif'}
                    </button>
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
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications" className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </TabsContent>

          {/* PAGES TAB */}
          <TabsContent value="pages" className="max-w-xl space-y-6">
            {/* Landing Preview */}
            <div className="bg-white p-5 border" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold" style={{ color: FG }}>Prévisualiser Landing Page</p>
                  <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>Voir comment la page d'accueil apparaît</p>
                </div>
                <button onClick={() => window.open('/', '_blank')}
                  className="px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all"
                  style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                  <Eye className="w-3.5 h-3.5" /> Voir
                </button>
              </div>
            </div>

            {/* Home Page Visibility */}
            <div>
              <p className="text-sm mb-6" style={{ color: '#666' }}>Masquer sections de l'accueil pour tous les utilisateurs.</p>
              <div className="space-y-3">
                {[{ key: 'show_parcours', label: 'Tensor Academy (Parcours)', desc: 'Le parcours d\'apprentissage IA' }, { key: 'show_community', label: 'Communauté', desc: 'L\'espace communautaire' }].map(page => (
                  <div key={page.key} className="bg-white p-5 overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold" style={{ color: FG }}>{page.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>{page.desc}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const current = pageSettings[page.key];
                            const updated = { ...pageSettings, [page.key]: !current };
                            setPageSettings(updated);
                            base44.entities.AppSettings.filter({ key: 'home_page_settings' })
                              .then(results => {
                                const val = JSON.stringify(updated);
                                if (results.length > 0) {
                                  return base44.entities.AppSettings.update(results[0].id, { value: val });
                                } else {
                                  return base44.entities.AppSettings.create({ key: 'home_page_settings', value: val });
                                }
                              })
                              .then(() => showSaved())
                              .catch(() => {});
                          }}
                          className="px-3 py-1.5 text-xs font-bold transition-all"
                          style={{
                            borderRadius: '6px',
                            background: pageSettings[page.key] ? FG : 'rgba(0,0,0,0.05)',
                            color: pageSettings[page.key] ? YUZU : '#888',
                          }}>
                          {pageSettings[page.key] ? '✓ Visible' : '✕ Masqué'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {showSavedMsg && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs mt-4 text-center font-semibold"
                  style={{ color: '#16a34a' }}>✓ Paramètres sauvegardés</motion.p>
              )}
            </div>
          </TabsContent>

          {/* TICKETS TAB */}
          <TabsContent value="tickets">
            <TicketsTab />
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
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
                {filteredUsers.map(u => <UserRow key={u.id} u={u} onUpdate={() => {}} />)}
                {filteredUsers.length === 0 && <p className="text-sm text-center py-12" style={{ color: '#aaa' }}>Aucun utilisateur trouvé</p>}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}