import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Upload, Copy, Edit2, Trash2, Check, X, ChevronDown, ChevronUp,
  RefreshCw, Calendar, Users, Infinity as InfinityIcon, Home,
  AlertCircle, CheckCircle, XCircle, PauseCircle, PlayCircle, FileText
} from 'lucide-react';

const generateCode = (prefix = '') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? prefix.toUpperCase() + '-' + code : code;
};

const formatDuration = (code) => {
  if (code.duration_type === 'lifetime') return 'À vie';
  if (!code.duration_value) return 'N/A';
  const unit = code.duration_type === 'day' ? 'jour' : code.duration_type === 'month' ? 'mois' : 'an';
  const plural = code.duration_value > 1 ? (unit === 'jour' ? 's' : unit === 'mois' ? '' : 's') : '';
  return `${code.duration_value} ${unit}${plural}`;
};

const getStatusInfo = (code) => {
  const now = new Date();
  const expDate = code.expiration_date ? new Date(code.expiration_date) : null;
  const isExpired = expDate && expDate < now;
  const isExhausted = code.max_uses && code.use_count >= code.max_uses;
  const isDisabled = code.visible === false;

  if (isDisabled) return { label: 'Désactivé', color: 'bg-red-100 text-red-700', icon: XCircle };
  if (isExhausted) return { label: 'Épuisé', color: 'bg-amber-100 text-amber-700', icon: AlertCircle };
  if (isExpired) return { label: 'Expiré', color: 'bg-gray-100 text-gray-700', icon: PauseCircle };
  return { label: 'Actif', color: 'bg-green-100 text-green-700', icon: CheckCircle };
};

const getTypeLabel = (code) => {
  if (code.unlimited) return 'Illimité';
  if (code.max_uses && code.max_uses > 1) return 'Multi-usage';
  return 'Usage unique';
};

export default function CodesPage() {
  const navigate = useNavigate();
  const [codes, setCodes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(null);

  useEffect(() => {
    loadCodes();
    loadPlans();
  }, []);

  const loadCodes = async () => {
    try {
      const data = await base44.entities.AccessCode.list();
      setCodes(data || []);
    } catch (error) {
      console.error('Failed to load codes:', error);
      toast.error('Erreur lors du chargement des codes');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const data = await base44.entities.SubscriptionPlan.list();
      setPlans(data || []);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copié !');
    } catch {
      toast.error('Échec de la copie');
    }
  };

  const handleDeleteCode = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code ?')) return;
    try {
      await base44.entities.AccessCode.delete(id);
      toast.success('Code supprimé');
      loadCodes();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleCode = async (code) => {
    try {
      await base44.entities.AccessCode.update(code.id, { visible: !code.visible });
      toast.success(code.visible ? 'Code désactivé' : 'Code activé');
      loadCodes();
    } catch {
      toast.error('Erreur lors de la modification');
    }
  };

  const toggleDetailPanel = (codeId) => {
    setShowDetailPanel(showDetailPanel === codeId ? null : codeId);
  };

  return (
    <div className="flex-1 overflow-auto bg-[#FAFAFA]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E5E5] px-8 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#666666] hover:bg-[#F7F7F8] rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Retour</span>
            </button>
            <h1 className="text-[20px] font-semibold text-[#1A1A1A]">Codes promotionnels</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Générer un code
            </button>
            <button
              onClick={() => setShowBulkPasteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium border border-[#E5E5E5] bg-white text-[#1A1A1A] rounded-lg hover:bg-[#F7F7F8] transition-colors"
            >
              <FileText className="w-4 h-4" />
              Coller en masse
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium border border-[#E5E5E5] bg-white text-[#1A1A1A] rounded-lg hover:bg-[#F7F7F8] transition-colors"
            >
              <Upload className="w-4 h-4" />
              Importer des codes (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#F0F0F0] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#888888]" />
            </div>
            <p className="text-[15px] text-[#666666] font-medium">Aucun code promotionnel</p>
            <p className="text-[13px] text-[#888888] mt-1">Générez votre premier code pour commencer</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                  <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-6 py-3">Code</th>
                  <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-6 py-3">Plan accordé</th>
                  <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-6 py-3">Durée</th>
                  <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-6 py-3">Utilisations</th>
                  <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-6 py-3">Expiration</th>
                  <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-6 py-3">Statut</th>
                  <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => {
                  const statusInfo = getStatusInfo(code);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <motion.tr
                      key={code.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                      onClick={() => toggleDetailPanel(code.id)}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopyCode(code.code); }}
                          className="font-mono text-[13px] text-[#1A1A1A] hover:text-[#0066FF] transition-colors flex items-center gap-2"
                        >
                          {code.code}
                          <Copy className="w-3.5 h-3.5 text-[#888888]" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] text-[#444444]">{getTypeLabel(code)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] text-[#444444]">{code.plan_name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] text-[#444444]">{formatDuration(code)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-[#888888]" />
                          <span className="text-[12px] text-[#444444]">
                            {code.use_count || 0} / {code.unlimited ? '∞' : (code.max_uses || '∞')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                          <span className="text-[12px] text-[#444444]">
                            {code.expiration_date ? new Date(code.expiration_date).toLocaleDateString('fr-FR') : 'Jamais'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleCopyCode(code.code)}
                            className="p-1.5 text-[#666666] hover:bg-[#F0F0F0] rounded transition-colors"
                            title="Copier"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleCode(code)}
                            className="p-1.5 text-[#666666] hover:bg-[#F0F0F0] rounded transition-colors"
                            title={code.visible ? 'Désactiver' : 'Activer'}
                          >
                            {code.visible ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteCode(code.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Panel */}
        <AnimatePresence>
          {showDetailPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-white border border-[#E5E5E5] rounded-xl overflow-hidden"
            >
              <CodeDetailPanel codeId={showDetailPanel} onClose={() => setShowDetailPanel(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {showGenerateModal && (
        <GenerateCodeModal
          onClose={() => setShowGenerateModal(false)}
          onCodeGenerated={loadCodes}
          plans={plans}
        />
      )}
      {showBulkPasteModal && (
        <BulkPasteModal
          onClose={() => setShowBulkPasteModal(false)}
          onPasteComplete={loadCodes}
          plans={plans}
        />
      )}
      {showImportModal && (
        <ImportCodesModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={loadCodes}
        />
      )}
    </div>
  );
}

function CodeDetailPanel({ codeId, onClose }) {
  const [code, setCode] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [codeId]);

  const loadDetails = async () => {
    try {
      const [codeData] = await base44.entities.AccessCode.filter({ id: codeId });
      setCode(codeData);
      
      // Simuler les utilisateurs (à implémenter avec une vraie entité UsageLog si nécessaire)
      setUsers([]);
    } catch (error) {
      console.error('Failed to load code details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !code) {
    return (
      <div className="p-8 text-center">
        <div className="w-6 h-6 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FAFAFA]">
        <div className="flex items-center gap-3">
          <div className="font-mono text-[15px] font-semibold text-[#1A1A1A]">{code.code}</div>
          <span className="text-[12px] text-[#888888]">Détails et historique</span>
        </div>
        <button onClick={onClose} className="p-1.5 text-[#888888] hover:bg-[#E5E5E5] rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        {/* Usage Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-[#FAFAFA] rounded-lg">
            <div className="text-[11px] text-[#888888] uppercase tracking-wider mb-1">Utilisations</div>
            <div className="text-[24px] font-semibold text-[#1A1A1A]">{code.use_count || 0}</div>
            {code.max_uses && !code.unlimited && (
              <div className="text-[12px] text-[#666666] mt-1">sur {code.max_uses} maximum</div>
            )}
          </div>
          <div className="p-4 bg-[#FAFAFA] rounded-lg">
            <div className="text-[11px] text-[#888888] uppercase tracking-wider mb-1">Statut</div>
            <div className="text-[15px] font-medium text-[#1A1A1A]">{getStatusInfo(code).label}</div>
          </div>
          <div className="p-4 bg-[#FAFAFA] rounded-lg">
            <div className="text-[11px] text-[#888888] uppercase tracking-wider mb-1">Créé le</div>
            <div className="text-[15px] font-medium text-[#1A1A1A]">
              {new Date(code.created_date).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Usage Timeline Chart */}
        <div className="mb-6">
          <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Historique d'utilisation</h3>
          <div className="h-24 bg-[#FAFAFA] rounded-lg flex items-center justify-center border border-[#E5E5E5]">
            {code.use_count > 0 ? (
              <div className="flex items-end gap-1 h-16">
                {Array.from({ length: Math.min(code.use_count, 20) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-[#1A1A1A] rounded-t"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#888888]">Aucune utilisation enregistrée</p>
            )}
          </div>
        </div>

        {/* Users List */}
        <div>
          <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Utilisateurs ({code.use_count || 0})</h3>
          {users.length > 0 ? (
            <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                    <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-4 py-2">Nom</th>
                    <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-4 py-2">Email</th>
                    <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-4 py-2">Date d'utilisation</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={i} className="border-b border-[#F0F0F0]">
                      <td className="px-4 py-3 text-[13px] text-[#1A1A1A]">{user.name}</td>
                      <td className="px-4 py-3 text-[13px] text-[#444444]">{user.email}</td>
                      <td className="px-4 py-3 text-[13px] text-[#666666]">
                        {new Date(user.used_date).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[13px] text-[#888888] text-center py-8">Aucun utilisateur n'a encore utilisé ce code</p>
          )}
        </div>
      </div>
    </div>
  );
}

function GenerateCodeModal({ onClose, onCodeGenerated, plans }) {
  const [formData, setFormData] = useState({
    code: generateCode(),
    prefix: '',
    plan_id: plans && plans.length > 0 ? plans[0].id : '',
    plan_name: plans && plans.length > 0 ? plans[0].name : '',
    duration_value: 30,
    duration_type: 'day',
    type: 'single',
    max_uses: 1,
    unlimited: false,
    expiration_date: '',
    note: ''
  });
  const [generated, setGenerated] = useState(false);

  const handleRegenerate = () => {
    setFormData(prev => ({
      ...prev,
      code: generateCode(prev.prefix)
    }));
  };

  const handleSubmit = async () => {
    try {
      await base44.entities.AccessCode.create({
        code: formData.code,
        plan_id: formData.plan_id,
        plan_name: formData.plan_name,
        duration_value: formData.duration_type === 'lifetime' ? null : formData.duration_value,
        duration_type: formData.duration_type,
        max_uses: formData.type === 'unlimited' ? null : (formData.type === 'multi' ? formData.max_uses : 1),
        unlimited: formData.type === 'unlimited',
        expiration_date: formData.expiration_date || null,
        description: formData.note,
        used: false,
        used_by: null,
        billing: 'monthly'
      });
      
      toast.success('Code généré avec succès !');
      setGenerated(true);
      onCodeGenerated();
    } catch (error) {
      toast.error('Erreur lors de la génération du code');
      console.error(error);
    }
  };

  if (generated) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">Code généré !</h2>
          <p className="text-[13px] text-[#888888] mb-6">Voici votre code promotionnel</p>
          
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-6 mb-6">
            <div className="font-mono text-[28px] font-bold text-[#1A1A1A] tracking-wider mb-2">
              {formData.code}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(formData.code);
                toast.success('Code copié !');
              }}
              className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-[13px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Copy className="w-4 h-4" />
              Copier le code
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-[14px] font-medium bg-[#F0F0F0] text-[#1A1A1A] rounded-lg hover:bg-[#E5E5E5] transition-colors"
          >
            Fermer
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-semibold text-[#1A1A1A]">Générer un code promotionnel</h2>
          <button onClick={onClose} className="p-2 text-[#888888] hover:bg-[#F0F0F0] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Code */}
          <div>
            <label className="block text-[12px] font-medium text-[#888888] mb-2">Code</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="flex-1 px-4 py-2.5 font-mono text-[15px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                placeholder="CODE-XXXX-XXXX"
              />
              <button
                onClick={handleRegenerate}
                className="p-2.5 text-[#666666] hover:bg-[#F0F0F0] rounded-lg transition-colors"
                title="Régénérer"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Prefix */}
          <div>
            <label className="block text-[12px] font-medium text-[#888888] mb-2">Préfixe (optionnel)</label>
            <input
              type="text"
              value={formData.prefix}
              onChange={(e) => {
                const prefix = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                setFormData({ ...formData, prefix, code: generateCode(prefix) });
              }}
              className="w-full px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
              placeholder="Ex: LAUNCH"
            />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-[12px] font-medium text-[#888888] mb-2">Plan accordé *</label>
            <select
              value={formData.plan_id}
              onChange={(e) => {
                const plan = plans.find(p => p.id === e.target.value);
                setFormData({ ...formData, plan_id: e.target.value, plan_name: plan?.name || '' });
              }}
              className="w-full px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
            >
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#888888] mb-2">Durée d'accès</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.duration_value}
                  onChange={(e) => setFormData({ ...formData, duration_value: Number(e.target.value) })}
                  disabled={formData.duration_type === 'lifetime'}
                  className="flex-1 px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 disabled:bg-[#F0F0F0]"
                  min="1"
                />
                <select
                  value={formData.duration_type}
                  onChange={(e) => setFormData({ ...formData, duration_type: e.target.value })}
                  className="px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                >
                  <option value="day">jours</option>
                  <option value="month">mois</option>
                  <option value="year">ans</option>
                  <option value="lifetime">À vie</option>
                </select>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-[12px] font-medium text-[#888888] mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
              >
                <option value="single">Usage unique</option>
                <option value="multi">Multi-usage</option>
                <option value="unlimited">Illimité</option>
              </select>
            </div>
          </div>

          {/* Max uses */}
          {formData.type === 'multi' && (
            <div>
              <label className="block text-[12px] font-medium text-[#888888] mb-2">Nombre max d'utilisations</label>
              <input
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                min="2"
              />
            </div>
          )}

          {/* Expiration */}
          <div>
            <label className="block text-[12px] font-medium text-[#888888] mb-2">Date d'expiration (optionnel)</label>
            <input
              type="date"
              value={formData.expiration_date}
              onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
              className="w-full px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-[12px] font-medium text-[#888888] mb-2">Note interne</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 resize-none"
              rows="3"
              placeholder="Note visible uniquement par les admins..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#E5E5E5]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[14px] font-medium border border-[#E5E5E5] bg-white text-[#1A1A1A] rounded-lg hover:bg-[#F7F7F8] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 text-[14px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Générer le code
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function BulkPasteModal({ onClose, onPasteComplete, plans }) {
  const [pastedCodes, setPastedCodes] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(plans && plans.length > 0 ? plans[0].id : '');
  const [selectedPlanName, setSelectedPlanName] = useState(plans && plans.length > 0 ? plans[0].name : '');
  const [durationValue, setDurationValue] = useState(30);
  const [durationType, setDurationType] = useState('day');
  const [maxUses, setMaxUses] = useState(1);
  const [codeType, setCodeType] = useState('single');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handlePaste = async () => {
    if (!pastedCodes.trim()) {
      toast.error('Veuillez coller des codes');
      return;
    }

    setIsProcessing(true);
    
    // Parse les codes collés (un par ligne ou séparés par virgules)
    const codeList = pastedCodes
      .split(/[\n,;\t]+/)
      .map(c => c.trim().toUpperCase())
      .filter(c => c.length > 0);

    const successful = [];
    const failed = [];

    for (const code of codeList) {
      try {
        await base44.entities.AccessCode.create({
          code: code,
          plan_id: selectedPlanId,
          plan_name: selectedPlanName,
          duration_value: durationType === 'lifetime' ? null : durationValue,
          duration_type: durationType,
          max_uses: codeType === 'unlimited' ? null : (codeType === 'multi' ? maxUses : 1),
          unlimited: codeType === 'unlimited',
          expiration_date: null,
          description: 'Import en masse',
          used: false,
          used_by: null,
          billing: 'monthly',
          visible: true
        });
        successful.push(code);
      } catch (error) {
        failed.push(code);
      }
    }

    setResults({ successful, failed, total: codeList.length });
    setIsProcessing(false);
    onPasteComplete();
  };

  if (results) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">Import terminé !</h2>
          <p className="text-[13px] text-[#888888] mb-6">
            {results.successful.length} sur {results.total} codes ont été créés
          </p>
          
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-[#888888]">Succès</span>
              <span className="text-[14px] font-semibold text-green-600">{results.successful.length}</span>
            </div>
            {results.failed.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#888888]">Échecs</span>
                <span className="text-[14px] font-semibold text-red-600">{results.failed.length}</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-[14px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Fermer
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-semibold text-[#1A1A1A]">Coller des codes en masse</h2>
          <button onClick={onClose} className="p-2 text-[#888888] hover:bg-[#F0F0F0] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[12px] font-medium text-[#888888] mb-2">
              Codes (un par ligne ou séparés par des virgules)
            </label>
            <textarea
              value={pastedCodes}
              onChange={(e) => setPastedCodes(e.target.value)}
              className="w-full px-4 py-3 text-[14px] font-mono border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 resize-none"
              rows="8"
              placeholder="CODE-1234-5678&#10;CODE-ABCD-EFGH&#10;CODE-9999-0000"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#888888] mb-2">Plan à attribuer *</label>
            <select
              value={selectedPlanId}
              onChange={(e) => {
                const plan = plans.find(p => p.id === e.target.value);
                setSelectedPlanId(e.target.value);
                setSelectedPlanName(plan?.name || '');
              }}
              className="w-full px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
            >
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#888888] mb-2">Durée d'accès</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={durationValue}
                  onChange={(e) => setDurationValue(Number(e.target.value))}
                  disabled={durationType === 'lifetime'}
                  className="flex-1 px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 disabled:bg-[#F0F0F0]"
                  min="1"
                />
                <select
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value)}
                  className="px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                >
                  <option value="day">jours</option>
                  <option value="month">mois</option>
                  <option value="year">ans</option>
                  <option value="lifetime">À vie</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#888888] mb-2">Type</label>
              <select
                value={codeType}
                onChange={(e) => setCodeType(e.target.value)}
                className="w-full px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
              >
                <option value="single">Usage unique</option>
                <option value="multi">Multi-usage</option>
                <option value="unlimited">Illimité</option>
              </select>
            </div>
          </div>

          {codeType === 'multi' && (
            <div>
              <label className="block text-[12px] font-medium text-[#888888] mb-2">Nombre max d'utilisations</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                min="2"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#E5E5E5]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[14px] font-medium border border-[#E5E5E5] bg-white text-[#1A1A1A] rounded-lg hover:bg-[#F7F7F8] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handlePaste}
            disabled={isProcessing || !pastedCodes.trim()}
            className="px-6 py-2.5 text-[14px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isProcessing ? 'Traitement...' : 'Créer les codes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ImportCodesModal({ onClose, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [step, setStep] = useState('upload'); // upload, preview, complete

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    
    // Parse CSV
    const text = await uploadedFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const parsed = lines.slice(1).map((line, i) => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, j) => { row[h] = values[j]; });
      row.id = i;
      row.valid = row.code && (row.plan_id || row.plan_name);
      return row;
    });
    
    setPreview(parsed);
    setStep('preview');
  };

  const handleImport = async () => {
    const validCodes = preview.filter(c => c.valid);
    
    try {
      for (const codeData of validCodes) {
        await base44.entities.AccessCode.create({
          code: codeData.code.toUpperCase(),
          plan_id: codeData.plan_id,
          plan_name: codeData.plan_name,
          duration_value: codeData.duration_value ? Number(codeData.duration_value) : 30,
          duration_type: codeData.duration_type || 'day',
          max_uses: codeData.max_uses ? Number(codeData.max_uses) : 1,
          unlimited: codeData.unlimited === 'true',
          expiration_date: codeData.expiration_date || null,
          description: codeData.note || '',
          used: false,
          used_by: null,
          billing: 'monthly'
        });
      }
      
      toast.success(`${validCodes.length} code(s) importé(s) avec succès !`);
      setStep('complete');
      onImportComplete();
    } catch (error) {
      toast.error('Erreur lors de l\'import');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-semibold text-[#1A1A1A]">Importer des codes (CSV)</h2>
          <button onClick={onClose} className="p-2 text-[#888888] hover:bg-[#F0F0F0] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'upload' && (
          <div>
            <div className="border-2 border-dashed border-[#E5E5E5] rounded-xl p-12 text-center mb-6">
              <Upload className="w-12 h-12 text-[#888888] mx-auto mb-4" />
              <p className="text-[15px] font-medium text-[#1A1A1A] mb-2">Glissez-déposez votre fichier CSV</p>
              <p className="text-[13px] text-[#888888] mb-4">ou cliquez pour parcourir</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-block px-6 py-2.5 text-[14px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Choisir un fichier
              </label>
            </div>

            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-4">
              <p className="text-[12px] font-semibold text-[#888888] uppercase tracking-wider mb-3">Format attendu</p>
              <pre className="text-[11px] text-[#444444] font-mono bg-white p-3 rounded border border-[#E5E5E5] overflow-x-auto">
{`code,plan_id,plan_name,duration_value,duration_type,max_uses,unlimited,expiration_date,note
LAUNCH-ABC-123,plan_123,Pro,30,day,1,false,2025-12-31,Code de lancement
PROMO-XYZ-789,plan_456,Basic,,,true,,Offre spéciale`}
              </pre>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <p className="text-[13px] text-[#666666]">
                {preview.filter(c => c.valid).length} codes valides, {preview.filter(c => !c.valid).length} invalides
              </p>
            </div>

            <div className="border border-[#E5E5E5] rounded-lg overflow-hidden mb-6 max-h-80 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                    <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-4 py-2">Code</th>
                    <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-4 py-2">Plan</th>
                    <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-4 py-2">Durée</th>
                    <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-4 py-2">Max</th>
                    <th className="text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider px-4 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className={`border-b border-[#F0F0F0] ${!row.valid ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 font-mono text-[12px] text-[#1A1A1A]">{row.code || <span className="text-red-600">Manquant</span>}</td>
                      <td className="px-4 py-3 text-[12px] text-[#444444]">{row.plan_name || row.plan_id || <span className="text-red-600">Manquant</span>}</td>
                      <td className="px-4 py-3 text-[12px] text-[#444444]">{row.duration_value || '30'} {row.duration_type || 'day'}</td>
                      <td className="px-4 py-3 text-[12px] text-[#444444]">{row.unlimited === 'true' ? '∞' : (row.max_uses || '1')}</td>
                      <td className="px-4 py-3">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                            <Check className="w-3 h-3" /> Valide
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                            <X className="w-3 h-3" /> Invalide
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setStep('upload'); setFile(null); setPreview([]); }}
                className="px-6 py-2.5 text-[14px] font-medium border border-[#E5E5E5] bg-white text-[#1A1A1A] rounded-lg hover:bg-[#F7F7F8] transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handleImport}
                className="px-6 py-2.5 text-[14px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Confirmer l'import
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">Import terminé !</h2>
            <p className="text-[13px] text-[#888888] mb-6">Les codes ont été ajoutés avec succès</p>
            <button
              onClick={onClose}
              className="px-8 py-2.5 text-[14px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Fermer
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}