import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, ChevronDown } from 'lucide-react';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { useNavigate } from 'react-router-dom';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function UpgradePlanModal({ open, onClose, currentPlanId }) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(() => getPlansConfig().filter(p => p.id !== 'free'));
  const [billing, setBilling] = useState('monthly');
  const [stripeUrl, setStripeUrl] = useState(null);
  const [openTierPlan, setOpenTierPlan] = useState(null);
  const [selectedTiers, setSelectedTiers] = useState({});

  useEffect(() => {
    if (!open) return;
    loadPlansFromDB().then(p => { if (p) setPlans(p.filter(pl => pl.id !== 'free')); }).catch(() => {});
  }, [open]);

  const handleChoose = (plan, tierOpt) => {
    if (plan.id === currentPlanId) { onClose(); navigate('/manage-plan'); return; }
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

              {/* Header */}
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
                        {b === 'monthly' ? 'Monthly' : 'Annual'}
                      </button>
                    ))}
                  </div>
                  <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/5">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Plans grid */}
              <div className="overflow-y-auto flex-1 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plans.map((plan) => {
                    const isCurrent = plan.id === currentPlanId;
                    const tiers = (plan.tier_options || []).filter(o => {
                      const opt = typeof o === 'string' ? { label: o } : o;
                      return opt?.label?.trim();
                    });
                    const hasTiers = tiers.length > 0;
                    const selTierIdx = selectedTiers[plan.id];
                    const selTier = selTierIdx !== undefined ? (plan.tier_options || [])[selTierIdx] : null;
                    const selTierObj = typeof selTier === 'object' ? selTier : null;
                    const isOpen = openTierPlan === plan.id;
                    const features = [
                      plan.internet_access && 'Web Search',
                      plan.file_upload && 'File Upload',
                      plan.ultimate_access && 'Ultimate Mode',
                      plan.premium_support && 'Priority Support',
                    ].filter(Boolean);

                    return (
                      <div key={plan.id} className="flex flex-col p-4 rounded-xl border-2 transition-all relative"
                        style={{ borderColor: isCurrent ? YUZU : 'rgba(0,0,0,0.08)', background: isCurrent ? 'rgba(221,255,0,0.06)' : 'white' }}>

                        <p className="text-base font-black mb-0.5" style={{ color: FG }}>{plan.name}</p>

                        {/* Base monthly price */}
                        <div className="flex items-end gap-1 mb-3">
                          <span className="text-3xl font-black" style={{ color: FG }}>${plan.price_monthly}</span>
                          <span className="text-xs text-zinc-400 mb-1">/mo</span>
                        </div>

                        {/* Flash/Deep bar */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-3" style={{ background: 'rgba(0,0,0,0.04)' }}>
                          <Zap className="w-3 h-3 text-zinc-400" />
                          <span className="text-[11px] font-semibold text-zinc-500">
                            {plan.credits_limit} Flash{plan.deep_credits_limit ? ' · ' + plan.deep_credits_limit + ' Deep' : ''}/mo
                          </span>
                        </div>

                        {/* Tier dropdown */}
                        {hasTiers && (
                          <div className="relative mb-3" style={{ zIndex: isOpen ? 20 : 1 }}>
                            <button
                              onClick={() => setOpenTierPlan(isOpen ? null : plan.id)}
                              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all rounded-lg border"
                              style={{ background: 'rgba(0,0,0,0.03)', borderColor: 'rgba(0,0,0,0.1)', color: FG }}>
                              <span>{selTierObj?.label || 'Base plan'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#888' }} />
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute top-full mt-1 left-0 right-0 bg-white border rounded-lg overflow-hidden shadow-lg"
                                  style={{ borderColor: 'rgba(0,0,0,0.1)', zIndex: 30 }}>
                                  {/* Base option */}
                                  <button
                                    onClick={() => { setSelectedTiers(s => { const n = { ...s }; delete n[plan.id]; return n; }); setOpenTierPlan(null); }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold hover:bg-black/4 transition-colors text-left"
                                    style={{ color: selTierIdx === undefined ? FG : '#888', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <span>Base plan</span>
                                    <span className="font-black" style={{ color: '#666' }}>${plan.price_monthly}/mo</span>
                                  </button>
                                  {(plan.tier_options || []).map((opt, i) => {
                                    const o = typeof opt === 'string' ? { label: opt } : (opt || {});
                                    if (!o.label?.trim()) return null;
                                    const isSelected = selTierIdx === i;
                                    return (
                                      <button key={i}
                                        onClick={() => { setSelectedTiers(s => ({ ...s, [plan.id]: i })); setOpenTierPlan(null); }}
                                        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold hover:bg-black/4 transition-colors text-left"
                                        style={{ color: isSelected ? FG : '#555', background: isSelected ? 'rgba(0,0,0,0.04)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                        <div className="flex items-center gap-2">
                                          <span>{o.label}</span>
                                          {o.discount_badge && (
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(34,197,94,0.15)', color: '#16a34a' }}>
                                              {o.discount_badge}
                                            </span>
                                          )}
                                        </div>
                                        {o.price_monthly && <span className="font-black" style={{ color: '#888' }}>${o.price_monthly}/mo</span>}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Features */}
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

                        <button onClick={() => handleChoose(plan, selTierObj)}
                          className="w-full py-2.5 text-xs font-black rounded-lg transition-all hover:opacity-90 mt-auto"
                          style={{ background: isCurrent ? 'transparent' : FG, color: isCurrent ? FG : 'white', border: isCurrent ? '2px solid ' + FG : 'none' }}>
                          {isCurrent ? 'Current plan' : `Choose ${plan.name}`}
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
              <iframe src={stripeUrl} className="w-full" style={{ height: '100%', paddingTop: '48px', border: 'none' }} title="Secure checkout" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}