import { useState } from 'react';
import { Trash2, Plus, Upload, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function CodesTableEditor({ planId, billing = 'monthly', codes, onCodesUpdate, saving }) {
  const [bulkInput, setBulkInput] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);
  const [localCodes, setLocalCodes] = useState(codes);

  const codeMap = new Map(codes.map(c => [c.code, c.id]));

  const addEmptyRow = () => {
    setLocalCodes(p => [...p, { id: `temp_${Date.now()}`, code: '', used: false }]);
  };

  const deleteCode = async (idx) => {
    const code = localCodes[idx];
    if (code.id.startsWith('temp_')) {
      setLocalCodes(p => p.filter((_, i) => i !== idx));
      return;
    }
    try {
      await base44.entities.ActivationCode.delete(code.id);
      const updated = localCodes.filter((_, i) => i !== idx);
      setLocalCodes(updated);
      onCodesUpdate(updated);
      toast.success('Code supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const updateCodeValue = (idx, newValue) => {
    setLocalCodes(p => {
      const updated = [...p];
      updated[idx] = { ...updated[idx], code: newValue.toUpperCase() };
      return updated;
    });
  };

  const saveCodeRow = async (idx) => {
    const code = localCodes[idx];
    if (!code.code.trim()) {
      toast.error('Code vide');
      return;
    }
    if (code.id.startsWith('temp_')) {
      try {
        const created = await base44.entities.ActivationCode.create({
          code: code.code,
          plan_id: planId,
          billing: billing,
          used: false
        });
        const updated = [...localCodes];
        updated[idx] = created;
        setLocalCodes(updated);
        onCodesUpdate(updated);
        toast.success('Code créé');
      } catch {
        toast.error('Erreur lors de la création');
      }
    } else {
      try {
        await base44.entities.ActivationCode.update(code.id, { code: code.code });
        toast.success('Code mis à jour');
      } catch {
        toast.error('Erreur lors de la mise à jour');
      }
    }
  };

  const importBulkCodes = async () => {
    const lines = bulkInput.split('\n').map(l => l.trim().toUpperCase()).filter(l => l.length > 0);
    if (lines.length === 0) {
      toast.error('Aucun code à importer');
      return;
    }
    setBulkSaving(true);
    try {
      const existingCodes = new Set(codeMap.keys());
      const toCreate = lines.filter(code => !existingCodes.has(code));

      if (toCreate.length > 0) {
        await base44.entities.ActivationCode.bulkCreate(
          toCreate.map(code => ({ code, plan_id: planId, billing: billing, used: false }))
        );
      }

      const updated = await base44.entities.ActivationCode.filter({ plan_id: planId, billing: billing });
      setLocalCodes(updated);
      setBulkInput('');
      toast.success(`${toCreate.length} code(s) importé(s)`);
      onCodesUpdate(updated);
    } catch {
      toast.error('Erreur lors de l\'import');
    }
    setBulkSaving(false);
  };

  const usedCodes = localCodes.filter(c => c.used);
  const availCodes = localCodes.filter(c => !c.used);

  return (
    <div className="space-y-4">
      {/* Bulk import */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Importer des codes (coller ici)</p>
        <textarea
          value={bulkInput}
          onChange={e => setBulkInput(e.target.value)}
          placeholder={"CODE1\nCODE2\nCODE3\n... (jusqu'à 1000)"}
          className="w-full px-3 py-2 text-xs font-mono focus:outline-none resize-none"
          rows={4}
          style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }}
        />
        <button
          onClick={importBulkCodes}
          disabled={bulkSaving || !bulkInput.trim()}
          className="mt-2 flex items-center gap-2 px-4 py-2 text-xs font-bold disabled:opacity-40"
          style={{ background: FG, color: 'white', borderRadius: '3px' }}>
          <Upload className="w-3.5 h-3.5" /> Importer
        </button>
      </div>

      {/* Codes dispo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#aaa' }}>Codes Disponibles ({availCodes.length})</p>
          {availCodes.length > 0 && (
            <button
              onClick={async () => {
                if (!confirm(`Supprimer les ${availCodes.length} codes disponibles ?`)) return;
                for (const code of availCodes) {
                  if (!code.id.startsWith('temp_')) {
                    await base44.entities.ActivationCode.delete(code.id);
                  }
                }
                const remaining = localCodes.filter(c => c.used);
                setLocalCodes(remaining);
                onCodesUpdate(remaining);
                toast.success(`${availCodes.length} codes supprimés`);
              }}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold transition-colors hover:bg-red-100"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderRadius: '3px' }}>
              <Trash2 className="w-3 h-3" /> Tout supprimer
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
          {availCodes.length === 0 && (
            <p className="text-[10px] text-center py-4" style={{ color: '#bbb' }}>Aucun code</p>
          )}
          {availCodes.map((code) => {
            const realIdx = localCodes.findIndex(c => c.id === code.id);
            return (
              <div key={code.id} className="flex items-center gap-2 p-2 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '3px' }}>
                <input
                  type="text"
                  value={code.code}
                  onChange={e => updateCodeValue(realIdx, e.target.value)}
                  className="flex-1 px-2 py-1 text-xs font-mono focus:outline-none"
                  style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px' }}
                />
                <button
                  onClick={() => saveCodeRow(realIdx)}
                  className="px-2 py-1 text-[9px] font-bold"
                  style={{ background: YUZU, color: FG, borderRadius: '2px' }}>
                  OK
                </button>
                <button
                  onClick={() => deleteCode(realIdx)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-red-50 transition-colors"
                  style={{ borderRadius: '2px' }}>
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={addEmptyRow}
          className="mt-2 flex items-center gap-2 px-3 py-1.5 text-xs font-bold"
          style={{ background: FG, color: 'white', borderRadius: '3px' }}>
          <Plus className="w-3 h-3" /> Ajouter une ligne
        </button>
      </div>

      {/* Codes utilisés */}
      {usedCodes.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Codes Utilisés ({usedCodes.length})</p>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {usedCodes.map((code) => {
              const realIdx = localCodes.findIndex(c => c.id === code.id);
              return (
                <div key={code.id} className="flex items-center gap-2 p-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '3px' }}>
                  <span className="flex-1 text-xs font-mono line-through" style={{ color: '#999' }}>{code.code}</span>
                  <button
                    onClick={() => deleteCode(realIdx)}
                    className="w-6 h-6 flex items-center justify-center hover:text-red-500"
                    style={{ borderRadius: '2px' }}>
                    <Trash2 className="w-3 h-3" style={{ color: '#bbb' }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}