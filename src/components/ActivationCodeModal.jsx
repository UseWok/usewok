import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, KeyRound } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getPlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function ActivationCodeModal({ open, onClose }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const activate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const user = await base44.auth.me().catch(() => null);
    if (!user) { toast.error('Connectez-vous d\'abord'); setLoading(false); return; }
    const results = await base44.entities.ActivationCode.filter({ code: code.trim().toUpperCase(), used: false });
    if (results.length === 0) {
      toast.error('Code invalide ou déjà utilisé');
      setLoading(false);
      return;
    }
    const codeRecord = results[0];
    const plans = getPlansConfig();
    const plan = plans.find(p => p.id === codeRecord.plan_id);
    if (!plan) { toast.error('Plan introuvable'); setLoading(false); return; }
    await base44.auth.updateMe({ subscription_plan: plan.id, credits_limit: plan.credits_limit, credits_used: 0, credits_bonus: 0 });
    await base44.entities.ActivationCode.update(codeRecord.id, { used: true, used_by: user.email });
    setSuccess(plan.name);
    setLoading(false);
  };

  const handleClose = () => {
    setCode('');
    setSuccess(null);
    onClose();
    if (success) navigate('/');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400]" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={handleClose} />

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[401] font-be"
            style={{
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 'min(420px, calc(100vw - 24px))',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}>

            {/* Top hero */}
            <div className="px-6 pt-8 pb-6 text-center" style={{ background: FG }}>
              <button onClick={handleClose}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                style={{ background: YUZU, borderRadius: '14px' }}>
                <KeyRound className="w-7 h-7" style={{ color: FG }} />
              </div>
              {success ? (
                <>
                  <p className="text-xl font-black text-white mb-1">Félicitations !</p>
                  <p className="text-sm text-white/60">Plan <span style={{ color: YUZU }}>{success}</span> activé avec succès</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-black text-white mb-1">Code d'activation</p>
                  <p className="text-sm text-white/50">Entrez votre code pour débloquer votre abonnement</p>
                </>
              )}
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {success ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.1)', borderRadius: '50%' }}>
                    <Check className="w-6 h-6" style={{ color: '#16a34a' }} />
                  </div>
                  <p className="text-sm text-center" style={{ color: '#666' }}>
                    Votre abonnement est actif. Profitez de toutes les fonctionnalités de votre plan.
                  </p>
                  <button onClick={handleClose}
                    className="w-full py-3.5 text-sm font-black transition-all"
                    style={{ background: FG, color: 'white', borderRadius: '10px' }}>
                    Accéder à Stensor →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider block mb-2" style={{ color: '#aaa' }}>Votre code</label>
                    <input
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="4F7K9M2X1R8P"
                      maxLength={12}
                      autoFocus
                      className="w-full px-4 py-3.5 text-lg font-black font-mono text-center tracking-widest focus:outline-none transition-all"
                      style={{
                        border: `2px solid ${code.length === 12 ? FG : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: '10px',
                        background: code.length > 0 ? 'rgba(0,0,0,0.02)' : 'white',
                        letterSpacing: '0.15em',
                      }}
                      onKeyDown={e => { if (e.key === 'Enter') activate(); }}
                    />
                    <p className="text-[10px] mt-1.5 text-center" style={{ color: '#bbb' }}>{code.length}/12 caractères</p>
                  </div>

                  <button onClick={activate} disabled={loading || code.length < 4}
                    className="w-full py-3.5 text-sm font-black transition-all disabled:opacity-30"
                    style={{ background: code.length >= 4 ? FG : 'rgba(0,0,0,0.06)', color: code.length >= 4 ? 'white' : '#bbb', borderRadius: '10px' }}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" />
                        Vérification...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" /> Activer le plan
                      </span>
                    )}
                  </button>

                  <p className="text-[10px] text-center" style={{ color: '#ccc' }}>
                    Code reçu par e-mail après votre achat · 12 caractères
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}