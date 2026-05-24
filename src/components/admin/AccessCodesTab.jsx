import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Trash2, Copy, RefreshCw, Gift, Upload, X, AlertTriangle } from 'lucide-react';
import { getPlansConfig } from '@/lib/plans-config';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment()}-${segment()}-${segment()}`;
}

export default function AccessCodesTab() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCredits, setNewCredits] = useState(10);
  const [newDesc, setNewDesc] = useState('');
  const [newPlanId, setNewPlanId] = useState('');
  const [newBilling, setNewBilling] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [tab, setTab] = useState('list'); // 'list' | 'create' | 'bulk'
  const [bulkText, setBulkText] = useState('');
  const [bulkCredits, setBulkCredits] = useState(10);
  const [bulkPlanId, setBulkPlanId] = useState('');
  const [bulkBilling, setBulkBilling] = useState('monthly');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'used'

  useEffect(() => {
    setPlans(getPlansConfig());
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    const data = await base44.entities.AccessCode.list('-created_date', 500);
    setCodes(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (newCredits < 1 && !newPlanId) { toast.error('Spécifiez au moins des crédits ou un plan'); return; }
    setCreating(true);
    const code = generateCode();
    await base44.entities.AccessCode.create({
      code,
      credits: newCredits,
      used: false,
      description: newDesc,
      plan_id: newPlanId || null,
      billing: newPlanId ? newBilling : null,
    });
    toast.success(`Code créé : ${code}`);
    setNewDesc('');
    setNewCredits(10);
    setNewPlanId('');
    setNewBilling('monthly');
    setCreating(false);
    fetchCodes();
    setTab('list');
  };

  const handleBulkImport = async () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) { toast.error('Aucun code à importer'); return; }
    if (lines.length > 1000) { toast.error('Maximum 1000 codes par import'); return; }
    setBulkImporting(true);
    let success = 0;
    let errors = 0;
    // Batch in groups of 50
    const batchSize = 50;
    for (let i = 0; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize);
      await Promise.all(batch.map(async (rawCode) => {
        try {
          await base44.entities.AccessCode.create({
            code: rawCode.toUpperCase(),
            credits: bulkCredits,
            used: false,
            plan_id: bulkPlanId || null,
            billing: bulkPlanId ? bulkBilling : null,
          });
          success++;
        } catch {
          errors++;
        }
      }));
    }
    toast.success(`${success} codes importés${errors > 0 ? ` (${errors} erreurs)` : ''}`);
    setBulkText('');
    setBulkCredits(10);
    setBulkPlanId('');
    setBulkImporting(false);
    fetchCodes();
    setTab('list');
  };

  const handleDelete = async (id) => {
    await base44.entities.AccessCode.delete(id);
    toast.success('Code supprimé');
    setCodes(prev => prev.filter(c => c.id !== id));
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Supprimer ${codes.length} codes ? Cette action est irréversible.`)) return;
    setDeletingAll(true);
    await Promise.all(codes.map(c => base44.entities.AccessCode.delete(c.id).catch(() => {})));
    setCodes([]);
    setDeletingAll(false);
    toast.success('Tous les codes supprimés');
  };

  const handleDeleteUsed = async () => {
    const usedCodes = codes.filter(c => c.used);
    if (usedCodes.length === 0) { toast.info('Aucun code utilisé'); return; }
    if (!window.confirm(`Supprimer ${usedCodes.length} codes utilisés ?`)) return;
    await Promise.all(usedCodes.map(c => base44.entities.AccessCode.delete(c.id).catch(() => {})));
    setCodes(prev => prev.filter(c => !c.used));
    toast.success(`${usedCodes.length} codes supprimés`);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié !');
  };

  const filteredCodes = codes.filter(c => {
    if (filter === 'active') return !c.used;
    if (filter === 'used') return c.used;
    return true;
  });

  const planName = (planId) => {
    if (!planId) return null;
    const p = plans.find(pl => pl.id === planId);
    return p ? p.name : planId;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Gift className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Codes d'accès</h2>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <button onClick={handleDeleteUsed} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Supprimer utilisés
          </button>
          <button onClick={handleDeleteAll} disabled={deletingAll || codes.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors disabled:opacity-40">
            <AlertTriangle className="w-3.5 h-3.5" /> {deletingAll ? 'Suppression...' : 'Tout supprimer'}
          </button>
          <button onClick={fetchCodes} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-muted rounded-xl w-fit">
        {[
          { id: 'list', label: `Liste (${codes.length})` },
          { id: 'create', label: '+ Créer' },
          { id: 'bulk', label: '⬆ Import massif' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CREATE */}
      {tab === 'create' && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Créer un nouveau code</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Abonnement associé (optionnel)</label>
              <select value={newPlanId} onChange={e => setNewPlanId(e.target.value)}
                className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="">— Crédits uniquement —</option>
                {plans.filter(p => p.id !== 'free').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {newPlanId && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Facturation</label>
                <div className="flex gap-2">
                  {['monthly', 'yearly'].map(b => (
                    <button key={b} onClick={() => setNewBilling(b)}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-colors ${newBilling === b ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
                      {b === 'monthly' ? '📅 Mensuel' : '🗓️ Annuel'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Crédits bonus</label>
              <input type="number" min={0} value={newCredits} onChange={e => setNewCredits(Number(e.target.value))}
                className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description (optionnel)</label>
              <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)}
                placeholder="Ex: Code beta testeur"
                className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <button onClick={handleCreate} disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            <Plus className="w-4 h-4" />
            {creating ? 'Génération...' : 'Générer un code'}
          </button>
        </div>
      )}

      {/* BULK IMPORT */}
      {tab === 'bulk' && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Import massif (1 code par ligne, max 1000)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Abonnement associé</label>
              <select value={bulkPlanId} onChange={e => setBulkPlanId(e.target.value)}
                className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="">— Crédits uniquement —</option>
                {plans.filter(p => p.id !== 'free').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {bulkPlanId && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Facturation</label>
                <div className="flex gap-2">
                  {['monthly', 'yearly'].map(b => (
                    <button key={b} onClick={() => setBulkBilling(b)}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-colors ${bulkBilling === b ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
                      {b === 'monthly' ? '📅 Mensuel' : '🗓️ Annuel'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Crédits par code</label>
              <input type="number" min={0} value={bulkCredits} onChange={e => setBulkCredits(Number(e.target.value))}
                className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Codes (1 par ligne) — {bulkText.split('\n').filter(l => l.trim()).length} codes détectés
            </label>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={"ABCD-EFGH-IJKL\nMNOP-QRST-UVWX\n..."}
              rows={10}
              className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary resize-y"
            />
          </div>
          <button onClick={handleBulkImport} disabled={bulkImporting || !bulkText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            <Upload className="w-4 h-4" />
            {bulkImporting ? 'Import en cours...' : `Importer ${bulkText.split('\n').filter(l => l.trim()).length} code(s)`}
          </button>
        </div>
      )}

      {/* LIST */}
      {tab === 'list' && (
        <>
          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {[{ id: 'all', label: 'Tous' }, { id: 'active', label: 'Actifs' }, { id: 'used', label: 'Utilisés' }].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {f.label} {f.id === 'all' ? `(${codes.length})` : f.id === 'active' ? `(${codes.filter(c => !c.used).length})` : `(${codes.filter(c => c.used).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">Chargement...</div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">Aucun code.</div>
          ) : (
            <div className="space-y-2">
              {filteredCodes.map(c => (
                <div key={c.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${c.used ? 'border-border bg-muted/40 opacity-60' : 'border-border bg-card'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-[15px] font-bold text-foreground tracking-widest">{c.code}</span>
                      {c.used
                        ? <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">UTILISÉ</span>
                        : <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">ACTIF</span>}
                      {c.plan_id && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">
                          📦 {planName(c.plan_id)}
                        </span>
                      )}
                      {c.plan_id && c.billing && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c.billing === 'yearly' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
                          {c.billing === 'yearly' ? '🗓️ Annuel' : '📅 Mensuel'}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-muted-foreground flex flex-wrap gap-2">
                      {c.credits > 0 && <span className="font-semibold text-foreground">{c.credits} crédits</span>}
                      {c.description && <span>· {c.description}</span>}
                      {c.used_by && <span>· utilisé par {c.used_by}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!c.used && (
                      <button onClick={() => handleCopy(c.code)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Copier">
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(c.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}