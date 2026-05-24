import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Trash2, Copy, RefreshCw, Gift } from 'lucide-react';

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

  const fetchCodes = async () => {
    setLoading(true);
    const data = await base44.entities.AccessCode.list('-created_date', 100);
    setCodes(data);
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleCreate = async () => {
    if (newCredits < 1) { toast.error('Au moins 1 crédit'); return; }
    setCreating(true);
    const code = generateCode();
    await base44.entities.AccessCode.create({ code, credits: newCredits, used: false, description: newDesc });
    toast.success(`Code créé : ${code}`);
    setNewDesc('');
    setNewCredits(10);
    setCreating(false);
    fetchCodes();
  };

  const handleDelete = async (id) => {
    await base44.entities.AccessCode.delete(id);
    toast.success('Code supprimé');
    fetchCodes();
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié !');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Codes d'accès / Crédits</h2>
        <button onClick={fetchCodes} className="ml-auto p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Create form */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Créer un nouveau code</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Crédits</label>
            <input
              type="number"
              min={1}
              value={newCredits}
              onChange={e => setNewCredits(Number(e.target.value))}
              className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description (optionnel)</label>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Ex: Code beta testeur"
              className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Génération...' : 'Générer un code'}
        </button>
      </div>

      {/* Codes list */}
      {loading ? (
        <div className="text-center text-muted-foreground py-12">Chargement...</div>
      ) : codes.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">Aucun code créé.</div>
      ) : (
        <div className="space-y-3">
          {codes.map(c => (
            <div
              key={c.id}
              className={`flex items-center gap-4 p-4 rounded-xl border ${c.used ? 'border-border bg-muted/40 opacity-60' : 'border-border bg-card'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[15px] font-bold text-foreground tracking-widest">{c.code}</span>
                  {c.used && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">UTILISÉ</span>}
                  {!c.used && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">ACTIF</span>}
                </div>
                <div className="text-[12px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{c.credits} crédits</span>
                  {c.description && <span className="ml-2">· {c.description}</span>}
                  {c.used_by && <span className="ml-2">· utilisé par {c.used_by}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!c.used && (
                  <button
                    onClick={() => handleCopy(c.code)}
                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    title="Copier"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}