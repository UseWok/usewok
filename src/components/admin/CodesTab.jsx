import { useState, useEffect } from 'react';
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
  const [newCode, setNewCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ActivationCode.filter({ plan_id: planId });
      setCodes(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [planId]);

  const addCode = async () => {
    if (!newCode.trim()) return;
    setSaving(true);
    const code = newCode.trim().toUpperCase();
    
    try {
      await base44.entities.ActivationCode.create({
        code,
        plan_id: planId,
        billing: 'monthly',
        used: false
      });
      setCodes(prev => [{ code, plan_id: planId, billing: 'monthly', used: false, id: Date.now() }, ...prev]);
      setNewCode('');
      toast.success('Code ajouté');
    } catch {
      toast.error('Code invalide ou existe déjà');
    }
    setSaving(false);
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
              
              {/* Add code */}
              <div className="flex gap-2">
                <input
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addCode(); }}
                  placeholder="Nouveau code..."
                  className="flex-1 px-3 py-2 text-xs focus:outline-none"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }}
                />
                <button onClick={addCode} disabled={saving || !newCode.trim()}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold disabled:opacity-40"
                  style={{ background: FG, color: 'white', borderRadius: '3px' }}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Codes list */}
              <div className="max-h-72 overflow-y-auto space-y-1">
                {loading ? (
                  <p className="text-xs text-center py-2" style={{ color: '#bbb' }}>Chargement...</p>
                ) : codes.length === 0 ? (
                  <p className="text-xs text-center py-2" style={{ color: '#bbb' }}>Aucun code</p>
                ) : (
                  codes.map(code => (
                    <div key={code.id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm"
                      style={{ background: code.used ? 'rgba(245,158,11,0.06)' : 'white', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <span className={`text-[11px] font-mono font-bold flex-1 ${code.used ? 'line-through' : ''}`}
                        style={{ color: code.used ? '#999' : FG }}>
                        {code.code}
                      </span>
                      {code.used ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5"
                          style={{ background: 'rgba(245,158,11,0.15)', color: '#d97706', borderRadius: '2px' }}>
                          ✓
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5"
                          style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', borderRadius: '2px' }}>
                          DISPO
                        </span>
                      )}
                      <button onClick={() => deleteCode(code.id)}
                        className="w-5 h-5 flex items-center justify-center hover:bg-red-50 transition-colors"
                        style={{ borderRadius: '2px' }}>
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}