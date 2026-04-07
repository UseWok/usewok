import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getPlansConfig, savePlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function ActivationCodeModal({ open, onClose }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const activate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const user = await base44.auth.me().catch(() => null);
    if (!user) { toast.error('Connectez-vous d\'abord'); setLoading(false); return; }
    const results = await base44.entities.ActivationCode.filter({ code: code.trim().toUpperCase(), used: false });
    if (results.length === 0) {
      toast.error('Code invalide ou deja utilise');
      setLoading(false);
      return;
    }
    const codeRecord = results[0];
    const plans = getPlansConfig();
    const plan = plans.find(p => p.id === codeRecord.plan_id);
    if (!plan) { toast.error('Plan introuvable'); setLoading(false); return; }
    await base44.auth.updateMe({ subscription_plan: plan.id, credits_limit: plan.credits_limit, credits_used: 0, credits_bonus: 0 });
    await base44.entities.ActivationCode.update(codeRecord.id, { used: true, used_by: user.email });
    toast.success(`Plan ${plan.name} active !`);
    setLoading(false);
    setCode('');
    onClose();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[401] bg-white font-be"
            style={{
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 'min(380px, calc(100vw - 24px))',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.09)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="font-black text-sm" style={{ color: FG }}>Entrer un code d'activation</p>
              <button onClick={onClose} className="w-6 h-6 flex items-center justify-center hover:bg-black/5" style={{ borderRadius: '3px' }}>
                <X className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs mb-3" style={{ color: '#888' }}>Verifiez vos mails et entrez votre code a 12 caracteres.</p>
              <div className="flex gap-2">
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: 4F7K9M2X1R8P" maxLength={12}
                  className="flex-1 px-3 py-2.5 text-sm font-mono focus:outline-none"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }}
                  onKeyDown={e => { if (e.key === 'Enter') activate(); }} />
                <button onClick={activate} disabled={loading || !code.trim()}
                  className="px-4 py-2.5 text-sm font-bold disabled:opacity-40"
                  style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                  {loading ? '...' : 'Activer'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}