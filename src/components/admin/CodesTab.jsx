import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, X, Copy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function PlanCodesSection({ planId, planName }) {
  const [codes, setCodes] = useState([]);
  const [newCodes, setNewCodes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const debounceTimerRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ActivationCode.filter({ plan_id: planId });
      setCodes(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [planId]);

  const addCodes = async () => {
    if (!newCodes.trim()) return;
    const toAdd = newCodes.split(/[\n,;\s]+/).map(c => c.trim().toUpperCase()).filter(c => c.length > 0);
    if (availCodes.length + toAdd.length > 1000) { toast.error('Max 1000 codes par plan'); return; }
    setSaving(true);
    try {
      await base44.entities.ActivationCode.bulkCreate(
        toAdd.map(code => ({ code, plan_id: planId, billing: 'monthly', used: false }))
      );
      const data = await base44.entities.ActivationCode.filter({ plan_id: planId });
      setCodes(data);
      setNewCodes('');
      toast.success(`${toAdd.length} code(s) ajouté(s)`);
    } catch (err) {
      toast.error('Erreur lors de l\'ajout');
    }
    setSaving(false);
  };

  const deleteAllCodes = async () => {
    if (!window.confirm(`Supprimer tous les ${codes.length} codes de ${planName}?`)) return;
    setSaving(true);
    try {
      for (const code of codes) await base44.entities.ActivationCode.delete(code.id);
      setCodes([]);
      toast.success('Tous les codes supprimés');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
    setSaving(false);
  };

  const handleAvailCodesChange = (text) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(async () => {
      const newLines = text.split(/\n/).map(c => c.trim().toUpperCase()).filter(c => c.length > 0);
      const oldLines = availCodes.map(c => c.code);
      
      setSaving(true);
      try {
        // Mettre à jour ou créer/supprimer ligne par ligne
        for (let i = 0; i < Math.max(newLines.length, oldLines.length); i++) {
          const newCode = newLines[i];
          const oldCode = oldLines[i];
          
          if (newCode && oldCode && newCode !== oldCode) {
            // Modification : mettre à jour le code
            await base44.entities.ActivationCode.update(availCodes[i].id, { code: newCode });
          } else if (!newCode && oldCode) {
            // Suppression : supprimer le code
            await base44.entities.ActivationCode.delete(availCodes[i].id);
          } else if (newCode && !oldCode) {
            // Ajout : créer un nouveau code
            await base44.entities.ActivationCode.create({ code: newCode, plan_id: planId, billing: 'monthly', used: false });
          }
        }
        
        const data = await base44.entities.ActivationCode.filter({ plan_id: planId });
        setCodes(data);
        toast.success('Codes synchronisés');
      } catch (err) {
        toast.error('Erreur lors de la sync');
        load();
      }
      setSaving(false);
    }, 1500);
  };

  const deleteCode = async (id) => {
    await base44.entities.ActivationCode.delete(id);
    setCodes(prev => prev.filter(c => c.id !== id));
    toast.success('Code supprimé');
  };

  const usedCodes = codes.filter(c => c.used);
  const availCodes = codes.filter(c => !c.used);

  return (
    <div className="border rounded-sm overflow-hidden bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/2 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: FG }}>{planName} - Codes d'accès</p>
          {!loading && (
            <p className="text-[11px] mt-0.5" style={{ color: '#999' }}>
              {availCodes.length} dispo · {usedCodes.length} utilisés · {codes.length} total
            </p>
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
              
              {/* Codes disponibles - éditables */}
              <div>
                <p className="text-[10px] font-black mb-1" style={{ color: '#aaa' }}>CODES DISPO ({availCodes.length})</p>
                <textarea
                  value={availCodes.map(c => c.code).join('\n')}
                  onChange={e => handleAvailCodesChange(e.target.value)}
                  disabled={saving}
                  placeholder="Ajoute, modifie ou supprime les codes ici"
                  className="w-full px-3 py-2 text-xs font-mono focus:outline-none resize-none"
                  rows={6}
                  style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px', background: saving ? '#f0f0f0' : 'white', color: '#333' }}
                />
                <p className="text-[9px] mt-1" style={{ color: '#aaa' }}>Edite librement • Chaque ligne = 1 code</p>
              </div>

              {/* Ajouter codes (plusieurs à la fois) */}
              <div>
                <p className="text-[10px] font-black mb-1" style={{ color: '#aaa' }}>AJOUTER CODES (max {1000 - availCodes.length})</p>
                <textarea
                  value={newCodes}
                  onChange={e => setNewCodes(e.target.value)}
                  placeholder="Colle tes codes ici (un par ligne, séparés par virgule ou espace)"
                  className="w-full px-3 py-2 text-xs focus:outline-none resize-none"
                  rows={4}
                  style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }}
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={addCodes} disabled={saving || !newCodes.trim()}
                    className="flex-1 px-3 py-2 text-xs font-bold disabled:opacity-40"
                    style={{ background: FG, color: 'white', borderRadius: '3px' }}>
                    <Plus className="w-3.5 h-3.5" /> Ajouter
                  </button>
                  {codes.length > 0 && (
                    <button onClick={deleteAllCodes} disabled={saving}
                      className="px-3 py-2 text-xs font-bold disabled:opacity-40"
                      style={{ background: '#ef4444', color: 'white', borderRadius: '3px' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Utilisés */}
              {usedCodes.length > 0 && (
                <div>
                  <p className="text-[10px] font-black mb-1" style={{ color: '#aaa' }}>CODES UTILISÉS ({usedCodes.length})</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                {usedCodes.map(code => (
                  <div key={code.id} className="flex items-center gap-2 px-2 py-1 rounded-sm text-[10px] font-mono"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(0,0,0,0.05)', color: '#999' }}>
                    <span className="flex-1 line-through">{code.code}</span>
                    <button onClick={() => deleteCode(code.id)} className="hover:text-red-400" title="Supprimer">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                </div>
                </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}