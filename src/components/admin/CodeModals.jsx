import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { X, Check, RefreshCw, AlertCircle, FileText, Upload } from 'lucide-react';

const generateCode = (prefix = '') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? prefix.toUpperCase() + '-' + code : code;
};

export function GenerateCodeModal({ onClose, onCodeGenerated, plans }) {
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
        billing: 'monthly',
        visible: true
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
              <Check className="w-4 h-4" />
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

          <div>
            <label className="block text-[12px] font-medium text-[#888888] mb-2">Date d'expiration (optionnel)</label>
            <input
              type="date"
              value={formData.expiration_date}
              onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
              className="w-full px-4 py-2.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
            />
          </div>

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

export function BulkPasteModal({ onClose, onPasteComplete, plans }) {
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