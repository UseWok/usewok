import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, Star, Crown, Zap, X, Check } from 'lucide-react';

const INITIAL_PRODUCTS = [
  { id: '1', name: 'Gratuit', price: 0, credits: 25, icon: 'Zap', popular: false, features: ['25 crédits / mois', 'Mode Fast uniquement', 'Agents de base'] },
  { id: '2', name: 'Pro', price: 9, credits: 500, icon: 'Star', popular: true, features: ['500 crédits / mois', 'Modes Fast, Thinking & Pro', 'Tous les agents', 'Support prioritaire'] },
  { id: '3', name: 'Business', price: 29, credits: 2000, icon: 'Crown', popular: false, features: ['2 000 crédits / mois', 'Mode Ultimate inclus', 'Agents personnalisés', 'Support dédié'] },
];

const ICONS = { Zap, Star, Crown, Package };

export default function AdminProducts() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [newFeature, setNewFeature] = useState('');

  const openEdit = (product) => {
    setEditing(product.id);
    setForm({ ...product, features: [...product.features] });
  };

  const openCreate = () => {
    setEditing('new');
    setForm({ id: `p_${Date.now()}`, name: '', price: 0, credits: 100, icon: 'Package', popular: false, features: [] });
  };

  const save = () => {
    if (editing === 'new') {
      setProducts(p => [...p, form]);
    } else {
      setProducts(p => p.map(x => x.id === editing ? form : x));
    }
    setEditing(null);
    setForm(null);
  };

  const deleteProduct = (id) => setProducts(p => p.filter(x => x.id !== id));

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] }));
    setNewFeature('');
  };

  return (
    <div className="min-h-screen bg-background font-be py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Produits & Abonnements</h1>
            <p className="text-sm text-muted-foreground mt-1">Gérez vos plans tarifaires et offres</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Nouveau plan
          </button>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const Icon = ICONS[product.icon] || Package;
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-card border rounded-2xl p-5 flex flex-col relative ${product.popular ? 'border-primary' : 'border-border'}`}
              >
                {product.popular && (
                  <span className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">POPULAIRE</span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.credits} crédits</p>
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
                  <button onClick={() => deleteProduct(product.id)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-destructive/8 hover:bg-destructive/15 text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && form && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-bold text-foreground">{editing === 'new' ? 'Nouveau plan' : 'Modifier le plan'}</h2>
                <button onClick={() => setEditing(null)} className="w-7 h-7 rounded-lg hover:bg-foreground/8 flex items-center justify-center">
                  <X className="w-4 h-4 text-foreground/60" />
                </button>
              </div>

              <div className="p-5 space-y-4">
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
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-foreground/4 rounded-lg text-xs">
                        <span className="flex-1">{f}</span>
                        <button onClick={() => setForm(fo => ({ ...fo, features: fo.features.filter((_, idx) => idx !== i) }))} className="text-destructive hover:opacity-70">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addFeature(); }} placeholder="Ajouter une fonctionnalité..." className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-primary" />
                    <button onClick={addFeature} className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-5 pb-5">
                <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors">Annuler</button>
                <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all">Enregistrer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}