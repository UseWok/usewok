import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DeleteAccountModal({ open, onClose, user }) {
  const [step, setStep] = useState(1); // 1: confirm, 2: email verification
  const [emailInput, setEmailInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const emailMatches = emailInput.trim() === (user?.email || '');

  const handleDelete = async () => {
    if (!emailMatches) {
      toast.error('Email incorrect');
      return;
    }
    setDeleting(true);
    try {
      // Supprimer le compte en supprimant l'utilisateur
      await base44.entities.User.delete(user.id);
      toast.success('Compte supprimé définitivement');
      base44.auth.logout();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
      setDeleting(false);
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
            className="w-full max-w-sm bg-white overflow-hidden"
            style={{ borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.08)' }}>

            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '6px' }}>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-black" style={{ color: '#0A0A0A' }}>Supprimer le compte</h2>
                  <p className="text-[10px] mt-0.5" style={{ color: '#aaa' }}>
                    {step === 1 ? 'Cette action est irréversible' : 'Confirmez votre identité'}
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
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
                    <p className="text-sm" style={{ color: '#7f1d1d' }}>
                      ⚠️ Tous vos messages, paramètres et données seront supprimés définitivement et ne pourront pas être récupérés.
                    </p>
                  </div>
                  <p className="text-sm mb-5" style={{ color: '#555' }}>
                    Êtes-vous sûr de vouloir supprimer votre compte {user?.full_name || user?.email} ?
                  </p>
                  <div className="flex gap-3">
                    <button onClick={onClose}
                      className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                      style={{ background: 'rgba(0,0,0,0.06)', color: '#0A0A0A', borderRadius: '4px' }}>
                      Annuler
                    </button>
                    <button onClick={() => { setStep(2); setEmailInput(''); }}
                      className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                      style={{ background: '#ef4444', color: 'white', borderRadius: '4px' }}>
                      Continuer
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm mb-4" style={{ color: '#555' }}>
                    Tapez votre adresse email pour confirmer :
                  </p>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={user?.email || 'email@example.com'}
                    className="w-full px-3 py-2.5 text-sm focus:outline-none mb-4"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', background: '#fafafa' }}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)}
                      className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                      style={{ background: 'rgba(0,0,0,0.06)', color: '#0A0A0A', borderRadius: '4px' }}>
                      Retour
                    </button>
                    <button onClick={handleDelete}
                      disabled={!emailMatches || deleting}
                      className="flex-1 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40"
                      style={{ background: emailMatches ? '#ef4444' : '#ccc', color: 'white', borderRadius: '4px' }}>
                      {deleting ? '⏳ Suppression...' : 'Supprimer définitivement'}
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