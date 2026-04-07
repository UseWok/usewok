import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Save, Search, ChevronDown, ChevronUp, Check, X, User, Calendar, Copy, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getPlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const PLAN_LABELS = {
  essential: 'Essential',
  advanced: 'Advanced',
  expert: 'Expert',
  supreme: 'Supreme',
};

function PlanCodeSection({ planId, billing, planName }) {
  const [codes, setCodes] = useState([]);
  const [newCodesText, setNewCodesText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ActivationCode.filter({ plan_id: planId, billing });
    setCodes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [planId, billing]);

  const addCodes = async () => {
    if (!newCodesText.trim()) return;
    setSaving(true);
    const parsed = newCodesText
      .split(/[\n,;\s]+/)
      .map(c => c.trim().toUpperCase())
      .filter(c => c.length > 3);

    const existingCodes = new Set(codes.map(c => c.code));
    const toCreate = parsed.filter(c => !existingCodes.has(c));

    if (toCreate.length === 0) {
      toast.error('Tous ces codes existent déjà');
      setSaving(false);
      return;
    }

    // Create in batches of 50
    for (let i = 0; i < toCreate.length; i += 50) {
      const batch = toCreate.slice(i, i + 50).map(code => ({ code, plan_id: planId, billing, used: false }));
      await base44.entities.ActivationCode.bulkCreate(batch);
    }

    toast.success(`${toCreate.length} code(s) ajouté(s)`);
    setNewCodesText('');
    await load();
    setSaving(false);
  };

  const deleteCode = async (id) => {
    await base44.entities.ActivationCode.delete(id);
    setCodes(prev => prev.filter(c => c.id !== id));
    toast.success('Code supprimé');
  };

  const usedCodes = codes.filter(c => c.used);
  const availCodes = codes.filter(c => !c.used);
  const filteredCodes = codes.filter(c => {
    if (!search) return true;
    return c.code.includes(search.toUpperCase()) || c.used_by?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="border rounded-sm overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-black/2 transition-colors bg-white"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: FG }}>{planName}</span>
            <span className="text-[10px] font-black px-2 py-0.5"
              style={{ background: billing === 'yearly' ? FG : YUZU, color: billing === 'yearly' ? 'white' : FG, borderRadius: '2px' }}>
              {billing === 'monthly' ? 'Mensuel' : 'Annuel'}
            </span>
          </div>
          {!loading && (
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px]" style={{ color: '#16a34a' }}>✓ {availCodes.length} disponibles</span>
              <span className="text-[11px]" style={{ color: usedCodes.length > 0 ? '#f59e0b' : '#bbb' }}>
                {usedCodes.length} utilisés
              </span>
              <span className="text-[11px]" style={{ color: '#999' }}>{codes.length} total</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mini bar */}
          {!loading && codes.length > 0 && (
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
              <div className="h-full rounded-full" style={{ width: `${(usedCodes.length / codes.length) * 100}%`, background: '#f59e0b' }} />
            </div>
          )}
          {expanded ? <ChevronUp className="w-4 h-4" style={{ color: '#bbb' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#bbb' }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-3 space-y-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>

              {/* Add new codes */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Ajouter des codes</p>
                <textarea
                  value={newCodesText}
                  onChange={e => setNewCodesText(e.target.value)}
                  rows={4}
                  placeholder="Collez vos codes ici (1 par ligne ou séparés par virgule)&#10;Ex: ABC123DEF456"
                  className="w-full px-3 py-2.5 text-xs font-mono focus:outline-none resize-none"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px', background: 'white' }}
                />
                <button onClick={addCodes} disabled={saving || !newCodesText.trim()}
                  className="mt-2 flex items-center gap-1.5 px-4 py-2 text-xs font-bold disabled:opacity-40 transition-all"
                  style={{ background: FG, color: 'white', borderRadius: '3px' }}>
                  <Plus className="w-3.5 h-3.5" />
                  {saving ? 'Ajout...' : 'Ajouter les codes'}
                </button>
              </div>

              {/* Code list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#aaa' }}>
                    Codes ({filteredCodes.length})
                  </p>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '3px' }}>
                    <Search className="w-3 h-3" style={{ color: '#bbb' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Rechercher..." className="text-xs focus:outline-none bg-transparent w-28" style={{ color: FG }} />
                  </div>
                </div>

                {loading ? (
                  <p className="text-xs text-center py-4" style={{ color: '#bbb' }}>Chargement...</p>
                ) : filteredCodes.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: '#bbb' }}>Aucun code</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {filteredCodes.map(code => (
                      <div key={code.id} className="flex items-center gap-2 px-3 py-2 rounded-sm"
                        style={{ background: code.used ? 'rgba(245,158,11,0.06)' : 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <span className={`text-xs font-mono font-bold flex-1 ${code.used ? 'line-through' : ''}`}
                          style={{ color: code.used ? '#999' : FG }}>
                          {code.code}
                        </span>
                        {code.used ? (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {code.used_by && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" style={{ color: '#999' }} />
                                <span className="text-[10px]" style={{ color: '#888' }}>{code.used_by}</span>
                              </div>
                            )}
                            {code.updated_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" style={{ color: '#bbb' }} />
                                <span className="text-[10px]" style={{ color: '#bbb' }}>
                                  {new Date(code.updated_date).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            )}
                            <span className="text-[9px] font-bold px-1.5 py-0.5"
                              style={{ background: 'rgba(245,158,11,0.15)', color: '#d97706', borderRadius: '2px' }}>
                              UTILISÉ
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 flex-shrink-0"
                            style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', borderRadius: '2px' }}>
                            DISPO
                          </span>
                        )}
                        <button onClick={() => deleteCode(code.id)}
                          className="w-6 h-6 flex items-center justify-center flex-shrink-0 hover:bg-red-50 transition-colors"
                          style={{ borderRadius: '3px' }}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
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

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateCodesForPlan(planId, billing, count = 1000) {
  const codes = new Set();
  while (codes.size < count) {
    codes.add(generateCode());
  }
  return Array.from(codes);
}

export default function CodesTab() {
  const plans = getPlansConfig().filter(p => p.id !== 'free');
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState(null);
  const [importingCount, setImportingCount] = useState(0);

  const generateAndImportAllCodes = async () => {
    try {
      setImportingCount(0);
      const allCodesObj = {};

      // Générer 8000 codes
      for (const plan of plans) {
        for (const billing of ['monthly', 'yearly']) {
          const key = `${plan.id}__${billing}`;
          const codes = generateCodesForPlan(plan.id, billing, 1000);
          allCodesObj[key] = codes;
        }
      }
      setGeneratedCodes(allCodesObj);
    } catch (err) {
      toast.error('Erreur lors de la génération');
    }
  };

  const importAllGeneratedCodes = async () => {
    if (!generatedCodes) return;
    try {
      let total = 0;
      for (const [key, codes] of Object.entries(generatedCodes)) {
        const [planId, billing] = key.split('__');
        // Importer par batch de 100
        for (let i = 0; i < codes.length; i += 100) {
          const batch = codes.slice(i, i + 100).map(code => ({
            code,
            plan_id: planId,
            billing,
            used: false
          }));
          await base44.entities.ActivationCode.bulkCreate(batch);
          total += batch.length;
          setImportingCount(total);
        }
      }
      toast.success(`✓ ${total} codes importés !`);
      setGeneratedCodes(null);
      setShowGenerator(false);
    } catch (err) {
      toast.error('Erreur lors de l\'import');
    }
  };

  const copyCodesList = (planId, billing) => {
    if (!generatedCodes) return;
    const key = `${planId}__${billing}`;
    const text = generatedCodes[key]?.join('\n') || '';
    navigator.clipboard.writeText(text);
    toast.success('Codes copiés !');
  };

  if (showGenerator && generatedCodes) {
    return (
      <div className="max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold" style={{ color: FG }}>8000 Codes Générés</h3>
            <p className="text-xs mt-1" style={{ color: '#999' }}>1000 par plan × cycle</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setGeneratedCodes(null); setShowGenerator(false); }}
              className="px-4 py-2 text-xs font-bold" style={{ background: '#f5f5f5', color: FG, borderRadius: '3px' }}>
              Annuler
            </button>
            <button onClick={importAllGeneratedCodes} disabled={importingCount > 0 && importingCount < 8000}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold disabled:opacity-40"
              style={{ background: FG, color: 'white', borderRadius: '3px' }}>
              <Zap className="w-3.5 h-3.5" />
              {importingCount > 0 ? `Import... (${importingCount}/8000)` : 'Importer tout'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {plans.flatMap(plan =>
            ['monthly', 'yearly'].map(billing => {
              const key = `${plan.id}__${billing}`;
              const codes = generatedCodes[key] || [];
              return (
                <div key={key} className="border p-4 rounded-sm" style={{ border: '1px solid rgba(0,0,0,0.08)', background: '#fafafa' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold" style={{ color: FG }}>{plan.name}</p>
                      <p className="text-[10px]" style={{ color: '#999' }}>
                        {billing === 'monthly' ? 'Mensuel' : 'Annuel'} • {codes.length} codes
                      </p>
                    </div>
                    <button onClick={() => copyCodesList(plan.id, billing)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold"
                      style={{ background: YUZU, color: FG, borderRadius: '3px' }}>
                      <Copy className="w-3 h-3" /> Copier
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto bg-white px-2 py-2 rounded-sm text-[10px] font-mono leading-relaxed" style={{ border: '1px solid rgba(0,0,0,0.05)', color: '#555' }}>
                    {codes.slice(0, 20).join('\n')}
                    {codes.length > 20 && <div className="mt-1 italic" style={{ color: '#bbb' }}>... +{codes.length - 20} autres</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <motion.button onClick={generateAndImportAllCodes}
        className="w-full flex items-center justify-center gap-3 py-4 text-sm font-bold rounded-sm transition-all hover:opacity-90"
        style={{ background: YUZU, color: FG }}
        whileHover={{ scale: 1.02 }}>
        <Zap className="w-5 h-5" />
        Générer & Importer 8000 Codes (1000/plan)
      </motion.button>

      <div className="mb-4">
        <p className="text-sm" style={{ color: '#666' }}>
          Ajoutez des codes pour chaque plan/cycle. Suivez leur consommation (qui l\'a utilisé, quand). Supprimez individuellement.
        </p>
      </div>
      {plans.flatMap(plan =>
        ['monthly', 'yearly'].map(billing => (
          <PlanCodeSection
            key={`${plan.id}__${billing}`}
            planId={plan.id}
            billing={billing}
            planName={plan.name}
          />
        ))
      )}
    </div>
  );
}