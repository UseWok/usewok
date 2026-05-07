import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap } from 'lucide-react';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { useNavigate } from 'react-router-dom';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function UpgradePlanModal({ open, onClose, currentPlanId }) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(() => getPlansConfig().filter(p => p.id !== 'free'));
  const [billing, setBilling] = useState('monthly');
  const [stripeUrl, setStripeUrl] = useState(null);

  useEffect(() => {
    if (!open) return;
    loadPlansFromDB().then(p => { if (p) setPlans(p.filter(pl => pl.id !== 'free')); }).catch(() => {});
  }, [open]);

  const handleChoose = (plan) => {
    if (plan.id === currentPlanId) { onClose(); navigate('/manage-plan'); return; }
    const tierOpt = plan.tier_options?.find(o => typeof o === 'object' && (o.checkout_url_monthly || o.checkout_url_yearly));
    const url = tierOpt
      ? (billing === 'yearly' ? tierOpt.checkout_url_yearly : tierOpt.checkout_url_monthly)
      : (billing === 'yearly' ? plan.checkout_url_yearly : plan.checkout_url_monthly);
    if (url) {
      setStripeUrl(url);
    } else {
      onClose();
      navigate(`/checkout?plan=${plan.id}&billing=${billing}`);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && !stripeUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white w-full overflow-hidden flex flex-col"
              style={{ maxWidth: '640px', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <div>
                  <p className="text-sm font-black" style={{ color: FG }}>Upgrade your plan</p>
                  <p className="text-[10px] text-zinc-400">Unlock more Flash, Deep Synthesis and features</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.05)' }}>
                    {['monthly', 'yearly'].map(b => (
                      <button key={b} onClick={() => setBilling(b)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-md transition-all"
                        style={{ background: billing === b ? FG : 'transparent', color: billing === b ? 'white' : '#888' }}>
                        {b === 'monthly' ? 'Monthly' : 'Annual -20%'}
                      </button>
                    ))}
                  </div>
                  <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/5">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plans.map((plan) => {
                    const price = billing === 'yearly' ? plan.price_yearly : plan.price_monthly;
                    const isCurrent = plan.id === currentPlanId;
                    const features = [
                      plan.internet_access && 'Web Search',
                      plan.file_upload && 'File Upload',
                      plan.ultimate_access && 'Ultimate Mode',
                      plan.premium_support && 'Priority Support',
                    ].filter(Boolean);
                    return (
                      <div key={plan.id} className="flex flex-col p-4 rounded-xl border-2 transition-all"
                        style={{ borderColor: isCurrent ? YUZU : 'rgba(0,0,0,0.08)', background: isCurrent ? 'rgba(221,255,0,0.06)' : 'white' }}>
                        <p className="text-base font-black mb-0.5" style={{ color: FG }}>{plan.name}</p>
                        <div className="flex items-end gap-1 mb-3">
                          <span className="text-3xl font-black" style={{ color: FG }}>${price}</span>
                          <span className="text-xs text-zinc-400 mb-1">/mo</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-3" style={{ background: 'rgba(0,0,0,0.04)' }}>
                          <Zap className="w-3 h-3 text-zinc-400" />
                          <span className="text-[11px] font-semibold text-zinc-500">
                            {plan.credits_limit} Flash{plan.deep_credits_limit ? ' · ' + plan.deep_credits_limit + ' Deep' : ''}/mo
                          </span>
                        </div>
                        {features.length > 0 && (
                          <ul className="space-y-1 mb-4 flex-1">
                            {features.map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: '#555' }}>
                                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}
                        <button onClick={() => handleChoose(plan)}
                          className="w-full py-2.5 text-xs font-black rounded-lg transition-all hover:opacity-90 mt-auto"
                          style={{ background: isCurrent ? 'transparent' : FG, color: isCurrent ? FG : 'white', border: isCurrent ? '2px solid ' + FG : 'none' }}>
                          {isCurrent ? 'Current plan' : 'Choose ' + plan.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stripeUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full overflow-hidden relative"
              style={{ maxWidth: '520px', height: '80vh', borderRadius: '12px', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
              <div className="flex items-center justify-between px-4 py-3 absolute top-0 left-0 right-0 z-10 bg-white" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <p className="text-xs font-black" style={{ color: FG }}>Secure payment</p>
                <button onClick={() => setStripeUrl(null)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/5">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <iframe
                src={stripeUrl}
                className="w-full"
                style={{ height: '100%', paddingTop: '48px', border: 'none' }}
                title="Secure checkout"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}