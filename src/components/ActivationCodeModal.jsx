import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, KeyRound, ArrowRight } from 'lucide-react';
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400]"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={handleClose}
          />

          {/* Modal - centered, scrollable on small screens */}
          <div className="fixed inset-0 z-[401] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full font-be my-auto"
              style={{ maxWidth: 400 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Card */}
              <div className="overflow-hidden" style={{ borderRadius: 20, boxShadow: '0 40px 100px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>

                {/* Header */}
                <div className="relative px-7 pt-8 pb-7 text-center" style={{ background: FG }}>
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                    <X className="w-4 h-4 text-white" />
                  </button>

                  <motion.div
                    animate={success ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className="w-16 h-16 mx-auto mb-5 flex items-center justify-center"
                    style={{ background: YUZU, borderRadius: 16 }}>
                    {success
                      ? <Check className="w-8 h-8" style={{ color: FG }} />
                      : <KeyRound className="w-8 h-8" style={{ color: FG }} />}
                  </motion.div>

                  {success ? (
                    <>
                      <h2 className="text-xl font-black text-white mb-1">Félicitations !</h2>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Plan <span style={{ color: YUZU, fontWeight: 800 }}>{success}</span> activé avec succès
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-black text-white mb-1">Code d'activation</h2>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Entrez votre code pour débloquer votre abonnement
                      </p>
                    </>
                  )}
                </div>

                {/* Body */}
                <div className="px-7 py-6 bg-white">
                  {success ? (
                    <div className="space-y-4 text-center">
                      <p className="text-sm" style={{ color: '#666' }}>
                        Votre abonnement est actif. Profitez de toutes les fonctionnalités incluses dans votre plan.
                      </p>
                      <button
                        onClick={handleClose}
                        className="w-full py-4 font-black text-sm flex items-center justify-center gap-2 transition-all"
                        style={{ background: FG, color: 'white', borderRadius: 12 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        Accéder à Stensor <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Code input */}
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest block mb-2" style={{ color: '#aaa' }}>
                          Votre code
                        </label>
                        <input
                          value={code}
                          onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          placeholder="4F7K9M2X1R8P"
                          maxLength={12}
                          autoFocus
                          className="w-full px-4 py-4 text-xl font-black font-mono text-center tracking-[0.2em] focus:outline-none transition-all"
                          style={{
                            border: `2px solid ${code.length === 12 ? FG : code.length > 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}`,
                            borderRadius: 12,
                            background: code.length > 0 ? 'rgba(0,0,0,0.02)' : 'white',
                            letterSpacing: '0.2em',
                          }}
                          onKeyDown={e => { if (e.key === 'Enter') activate(); }}
                        />
                        {/* Progress dots */}
                        <div className="flex justify-center gap-1 mt-2.5">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                              style={{ background: i < code.length ? FG : 'rgba(0,0,0,0.1)' }} />
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={activate}
                        disabled={loading || code.length < 4}
                        className="w-full py-4 font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                        style={{
                          background: code.length >= 4 ? FG : 'rgba(0,0,0,0.06)',
                          color: code.length >= 4 ? 'white' : '#bbb',
                          borderRadius: 12,
                        }}
                        onMouseEnter={e => { if (code.length >= 4 && !loading) e.currentTarget.style.opacity = '0.88'; }}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            className="w-4 h-4 rounded-full border-2"
                            style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                        ) : (
                          <><Zap className="w-4 h-4" /> Activer le plan</>
                        )}
                      </button>

                      <p className="text-[10px] text-center" style={{ color: '#ccc' }}>
                        Code reçu par e-mail après achat · 12 caractères alphanumériques
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}