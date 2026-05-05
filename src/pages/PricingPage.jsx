import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// welcome-offer imports removed
import { Check, Zap, Wifi, WifiOff, ChevronDown } from 'lucide-react';
import ActivationCodeModal from '@/components/ActivationCodeModal';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getPlansConfig, getUserPlan, loadPlansFromDB } from '@/lib/plans-config';
import { useLanguage } from '@/lib/i18n';
import { saveCart, clearCart } from './CheckoutPage';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const GREEN = '#16a34a';

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [eventCheckoutUrls, setEventCheckoutUrls] = useState({});
  const [savedCart, setSavedCart] = useState(() => { try { return JSON.parse(localStorage.getItem('stensor_cart_v1')); } catch { return null; } });
  const hasValidCart = savedCart && Date.now() - (savedCart.ts || 0) < 24 * 60 * 60 * 1000;
  const cartPlan = hasValidCart ? (() => { const all = getPlansConfig(); return all.find(p => p.id === savedCart.planId); })() : null;
  const dismissCart = () => { clearCart(); setSavedCart(null); }; // eslint-disable-line
  const [plans, setPlans] = useState(() => {
    const all = getPlansConfig();
    return [...all].filter(p => p.id !== 'free').reverse();
  });
  const [billing, setBilling] = useState('yearly');
  const [purchased, setPurchased] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [highlightedPlanId, setHighlightedPlanId] = useState('advanced');
  const [expandedTier, setExpandedTier] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setPurchased(u?.subscription_plan || 'free');
    }).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'checkout_urls_event' }).then(results => {
      if (results.length > 0) { try { setEventCheckoutUrls(JSON.parse(results[0].value)); } catch {} }
    }).catch(() => {});
    loadPlansFromDB().then(p => { if (p) setPlans([...p].filter(pl => pl.id !== 'free').reverse()); }).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'highlighted_plan' }).then(r => { if (r.length > 0) setHighlightedPlanId(r[0].value); }).catch(() => {});
  }, []);

  const handleChoose = (plan) => {
    if (purchased === plan.id) {
      navigate('/manage-plan');
      return;
    }
    saveCart(plan.id, billing);
    navigate(`/checkout?plan=${plan.id}&billing=${billing}`);
  };

  const isPaidPlan = purchased && purchased !== 'free';

  return (
    <div className="min-h-screen font-open bg-white py-14 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-5"
            style={{ background: YUZU, borderRadius: '2px' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: FG }} />
            <span className="text-xs font-black tracking-widest" style={{ color: FG }}>{t('pricing_badge')}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-4xl font-black mb-3" style={{ color: FG }}>
            {t('pricing_title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-sm" style={{ color: '#666' }}>
            {t('pricing_sub')}
          </motion.p>

          {/* Billing toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1 mt-6 p-1"
            style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="px-5 py-2 text-xs font-bold transition-all flex items-center gap-1.5"
                style={{
                  background: billing === b ? FG : 'transparent',
                  color: billing === b ? 'white' : '#666',
                  borderRadius: '3px',
                }}>
                {b === 'monthly' ? t('monthly') : (
                  <>
                    {t('yearly')}
                    {!isPaidPlan && (
                      <span className="text-[9px] font-black px-1.5 py-0.5"
                        style={{ background: billing === 'yearly' ? '#DDFF00' : 'rgba(0,0,0,0.08)', color: billing === 'yearly' ? '#0A0A0A' : '#888', borderRadius: '2px' }}>
                        -20%
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </motion.div>
        </div>


        {/* Plans grid */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible" style={{ scrollSnapType: 'x mandatory' }}>
          {plans.map((plan, idx) => {
            const basePrice = billing === 'yearly' ? plan.price_yearly : plan.price_monthly;
            const price = basePrice;
            const isCurrentPlan = purchased === plan.id;
            const isHighlighted = plan.id === highlightedPlanId;

            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                className="flex flex-col relative flex-shrink-0 w-72 md:w-auto"
                style={{ scrollSnapAlign: 'start',
                  background: 'white',
                  border: isHighlighted ? '2px solid rgba(0,0,0,0.85)' : '1px solid rgba(0,0,0,0.09)',
                  borderRadius: '5px',
                  boxShadow: isHighlighted ? '0 4px 20px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
                }}>

                <div className="p-5 flex flex-col flex-1">
                  {/* Name */}
                  <div className="mb-4">
                    <p className="font-black text-sm" style={{ color: FG }}>{plan.name}</p>
                    {plan.description && (
                      <p className="text-[11px] mt-0.5" style={{ color: '#999' }}>{plan.description}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-end gap-2 flex-wrap">
                      <span className="text-3xl font-black" style={{ color: FG }}>
                        {price}$
                      </span>
                      <span className="text-xs mb-1" style={{ color: '#bbb' }}>
                        /mo
                      </span>
                      {billing === 'yearly' && plan.price_monthly > plan.price_yearly && (
                        <span className="text-[10px] font-black px-2 py-0.5 mb-1" style={{ background: 'rgba(22,163,74,0.15)', color: GREEN, borderRadius: '3px' }}>
                          Save {(plan.price_monthly - plan.price_yearly) * 12}$/yr
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Internet badge */}
                  <div className="flex items-center gap-2 mb-4 px-2.5 py-2"
                    style={{ background: plan.internet_access ? 'rgba(22,163,74,0.08)' : 'rgba(0,0,0,0.03)', borderRadius: '3px' }}>
                    {plan.internet_access
                      ? <Wifi className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GREEN }} />
                      : <WifiOff className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ccc' }} />}
                    <span className="text-[11px] font-semibold" style={{ color: plan.internet_access ? GREEN : '#ccc' }}>
                      {plan.internet_access ? t('internet_included') : t('internet_not_included')}
                    </span>
                  </div>

                  {/* Key features */}
                  <ul className="space-y-2 flex-1 mb-5">
                    {[
                      `${plan.credits_limit} ${t('tensors')}/mo`,
                      plan.ultimate_access && t('mode_ultimate'),
                      plan.file_upload && t('file_upload_feature'),
                      plan.max_discussions === 0 ? t('unlimited_discussions') : null,
                      billing === 'yearly' && plan.shareable_credits > 0 && t('shareable_credits_feature', { n: plan.shareable_credits }),
                      plan.premium_support && t('premium_support_feature'),
                    ].filter(Boolean).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <Check className="w-3 h-3 flex-shrink-0" style={{ color: FG }} />
                        <span style={{ color: '#555', fontWeight: i === 0 ? 700 : 400 }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tier options dropdown */}
                  {plan.tier_options?.length > 0 && (
                    <div className="mb-4 rounded-sm overflow-hidden" style={{ border: '1.5px solid rgba(0,0,0,0.85)' }}>
                      <button onClick={() => setExpandedTier(et => et === plan.id ? null : plan.id)}
                        className="w-full px-3 py-2.5 flex items-start gap-2 hover:bg-black/[0.02] transition-colors">
                        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1.5 text-left">
                          {(expandedTier === plan.id ? plan.tier_options : plan.tier_options.slice(0, 2)).map((opt, i) => (
                            <p key={i} className="text-xs">
                              <span className="font-semibold" style={{ color: FG }}>{opt.label}</span>
                              <span className="ml-1" style={{ color: '#bbb' }}>{opt.sublabel}</span>
                            </p>
                          ))}
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                          style={{ color: '#999', transform: expandedTier === plan.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => handleChoose(plan)}
                    className="w-full py-3 text-xs font-black tracking-wide transition-all"
                    style={{
                      borderRadius: '3px',
                      border: isCurrentPlan ? `2px solid ${FG}` : 'none',
                      background: isCurrentPlan ? 'transparent' : FG,
                      color: isCurrentPlan ? FG : 'white',
                      cursor: 'pointer',
                    }}>
                    {isCurrentPlan ? 'Manage' : t('choose_plan', { name: plan.name })}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Activation code section */}
        <div className="max-w-md mx-auto mt-12 mb-4">
          <div className="h-px mb-8" style={{ background: 'rgba(0,0,0,0.07)' }} />
          <p className="text-center text-sm font-semibold mb-3" style={{ color: '#555' }}>Vous avez un code d'activation ?</p>
          <button onClick={() => setShowCodeModal(true)}
            className="w-full py-3 text-sm font-bold transition-all hover:opacity-80"
            style={{ border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: FG }}>
            Entrer un code
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs" style={{ color: '#aaa' }}>{t('secure_payment')}</p>
        </div>
        <ActivationCodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} />
      </div>
    </div>
  );
}