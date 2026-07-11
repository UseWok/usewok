import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Clock, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DeleteAccountModal({ open, onClose, user }) {
  const [step, setStep] = useState(1); // 1: confirm, 2: email verification
  const [emailInput, setEmailInput] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const emailMatches = emailInput.trim() === (user?.email || '');

  const handleScheduleDeletion = async () => {
    if (!emailMatches) {
      toast.error('Email incorrect');
      return;
    }
    setScheduling(true);
    try {
      const deletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await base44.auth.updateMe({ deletion_scheduled_at: deletionDate });
      toast.success('Suppression programmée dans 7 jours');
      base44.auth.logout('/');
    } catch (err) {
      toast.error('Erreur lors de la programmation');
      setScheduling(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white overflow-hidden"
            style={{ borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-black" style={{ color: '#0A0A0A' }}>Supprimer le compte</h2>
                  <p className="text-[10px] mt-0.5" style={{ color: '#aaa' }}>
                    {step === 1 ? '7 jours de réflexion' : 'Confirmez votre identité'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-6 h-6 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '4px' }}>
                <X className="w-4 h-4" style={{ color: '#999' }} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              {step === 1 ? (
                <>
                  {/* 7-day grace period info */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-900">Suppression dans 7 jours</p>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                          Votre compte reste accessible pendant 7 jours. Vous pouvez annuler à tout moment depuis votre profil.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <Shield className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-900">Suppression automatique</p>
                        <p className="text-xs text-red-700 mt-1 leading-relaxed">
                          Sans action de votre part, votre compte et toutes ses données seront définitivement supprimés. Votre abonnement payant sera automatiquement résilié.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={onClose}
                      className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                      style={{ background: 'rgba(0,0,0,0.06)', color: '#0A0A0A', borderRadius: '8px' }}>
                      Annuler
                    </button>
                    <button onClick={() => { setStep(2); setEmailInput(''); }}
                      className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                      style={{ background: '#ef4444', color: 'white', borderRadius: '8px' }}>
                      Continuer
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm mb-4" style={{ color: '#555' }}>
                    Tapez votre adresse email pour confirmer la suppression programmée :
                  </p>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={user?.email || 'email@example.com'}
                    className="w-full px-3 py-2.5 text-sm focus:outline-none mb-4"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: '#fafafa' }}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)}
                      className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                      style={{ background: 'rgba(0,0,0,0.06)', color: '#0A0A0A', borderRadius: '8px' }}>
                      Retour
                    </button>
                    <button onClick={handleScheduleDeletion}
                      disabled={!emailMatches || scheduling}
                      className="flex-1 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40"
                      style={{ background: emailMatches ? '#ef4444' : '#ccc', color: 'white', borderRadius: '8px' }}>
                      {scheduling ? '⏳ Programmation…' : 'Programmer la suppression'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}