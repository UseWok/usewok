import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getPlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export default function ActivationCodeModal({ open, onClose }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const activate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const user = await base44.auth.me().catch(() => null);
    if (!user) { toast.error('Please sign in first'); setLoading(false); return; }
    const results = await base44.entities.ActivationCode.filter({ code: code.trim().toUpperCase(), used: false });
    if (results.length === 0) { toast.error('Invalid or already used code'); setLoading(false); return; }
    const codeRecord = results[0];
    const plans = getPlansConfig();
    const newPlan = plans.find(p => p.id === codeRecord.plan_id);
    if (!newPlan) { toast.error('Plan not found'); setLoading(false); return; }
    const billingCycle = codeRecord.billing || 'monthly';

    // Keep the best plan: if user already has a higher-tier plan, add as bonus credits
    const { getUserPlan } = await import('@/lib/plans-config');
    const currentPlan = getUserPlan(user);
    const currentRank = plans.findIndex(p => p.id === currentPlan.id);
    const newRank = plans.findIndex(p => p.id === newPlan.id);
    const keepCurrent = currentRank > newRank && currentPlan.price_monthly > 0;

    if (keepCurrent) {
      await base44.auth.updateMe({ credits_bonus: (user.credits_bonus || 0) + newPlan.credits_limit });
      setSuccess(`${currentPlan.name} + ${newPlan.credits_limit} bonus`);
    } else {
      await base44.auth.updateMe({
        subscription_plan: newPlan.id,
        credits_limit: newPlan.credits_limit,
        credits_used: 0,
        credits_bonus: 0,
        billing_cycle: billingCycle,
        subscription_date: new Date().toISOString(),
      });
      setSuccess(newPlan.name);
    }
    await base44.entities.ActivationCode.update(codeRecord.id, { used: true, used_by: user.email });
    setLoading(false);
  };

  const handleClose = () => {
    setCode(''); setSuccess(null); onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400]"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={handleClose} />
          <div className="fixed inset-0 z-[401] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full font-be"
              style={{ maxWidth: 360 }}
              onClick={e => e.stopPropagation()}>

              {/* Gift card */}
              <div className="overflow-hidden" style={{ borderRadius: 24, boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}>

                {/* Card front */}
                <div className="relative px-8 pt-10 pb-8"
                  style={{ background: `linear-gradient(135deg, ${FG} 0%, #1a0040 100%)` }}>

                  {/* Close */}
                  <button onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8 }}>
                    <X className="w-4 h-4 text-white" />
                  </button>

                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                    style={{ background: 'rgba(221,255,0,0.06)', transform: 'translate(30%, -30%)' }} />
                  <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: 'rgba(58,0,136,0.3)', transform: 'translate(-30%, 30%)' }} />

                  {/* Logo */}
                  <div className="relative flex justify-between items-start mb-10">
                    <img src={LOGO_URL} alt="Stensor" className="w-10 h-10 object-contain" />
                    <div className="text-right">
                      <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">Value</p>
                      <p className="text-2xl font-black" style={{ color: YUZU }}>• • •</p>
                    </div>
                  </div>

                  {/* Card chip + number */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-8 rounded-md" style={{ background: 'rgba(221,255,0,0.15)', border: '1px solid rgba(221,255,0,0.2)' }} />
                    <p className="text-white/20 font-mono text-sm tracking-widest">**** **** ****</p>
                  </div>

                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Stensor Gift Card
                  </p>
                </div>

                {/* Input section */}
                <div className="px-8 py-7 bg-white">
                  {success ? (
                    <div className="text-center space-y-4">
                      <div className="w-14 h-14 mx-auto flex items-center justify-center"
                        style={{ background: YUZU, borderRadius: 14 }}>
                        <Check className="w-7 h-7" style={{ color: FG }} />
                      </div>
                      <div>
                        <p className="font-black text-base" style={{ color: FG }}>Plan {success} activated!</p>
                        <p className="text-sm mt-1" style={{ color: '#aaa' }}>Enjoy all your features</p>
                      </div>
                      <button onClick={handleClose}
                        className="w-full py-3.5 font-black text-sm transition-all"
                        style={{ background: FG, color: 'white', borderRadius: 12 }}>
                        Go to Stensor →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: '#aaa' }}>
                          Enter your code
                        </p>
                        <input
                          value={code}
                          onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          placeholder="XXXX-XXXX-XXXX"
                          maxLength={16}
                          autoFocus
                          className="w-full px-4 py-4 text-lg font-black font-mono text-center tracking-[0.15em] focus:outline-none transition-all"
                          style={{
                            border: `2px solid ${code.length > 0 ? FG : 'rgba(0,0,0,0.1)'}`,
                            borderRadius: 12,
                            background: code.length > 0 ? 'rgba(0,0,0,0.02)' : 'white',
                          }}
                          onKeyDown={e => { if (e.key === 'Enter') activate(); }}
                        />
                      </div>
                      <button onClick={activate} disabled={loading || code.length < 4}
                        className="w-full py-3.5 font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                        style={{ background: code.length >= 4 ? FG : 'rgba(0,0,0,0.06)', color: code.length >= 4 ? 'white' : '#bbb', borderRadius: 12 }}>
                        {loading
                          ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                          : <><Zap className="w-4 h-4" style={{ color: code.length >= 4 ? YUZU : '#bbb' }} /> Activate</>
                          }
                      </button>
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