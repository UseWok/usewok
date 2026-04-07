import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Crown, Shield, Globe, Wifi, WifiOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getPlansConfig, getUserPlan } from '@/lib/plans-config';
import { useLanguage } from '@/lib/i18n';
import { saveCart, clearCart } from './CheckoutPage';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const GREEN = '#16a34a';

const PLAN_ICONS = { free: Zap, essential: Shield, advanced: Globe, expert: Star, supreme: Crown };

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [savedCart, setSavedCart] = useState(() => { try { return JSON.parse(localStorage.getItem('stensor_cart_v1')); } catch { return null; } });
  const hasValidCart = savedCart && Date.now() - (savedCart.ts || 0) < 24 * 60 * 60 * 1000;
  const cartPlan = hasValidCart ? (() => { const all = getPlansConfig(); return all.find(p => p.id === savedCart.planId); })() : null;
  const dismissCart = () => { clearCart(); setSavedCart(null); }; // eslint-disable-line
  const [plans] = useState(() => {
    const all = getPlansConfig();
    // Reverse order (supreme first), remove free
    return [...all].filter(p => p.id !== 'free').reverse();
  });
  const [billing, setBilling] = useState('monthly');
  const [purchased, setPurchased] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setPurchased(u?.subscription_plan || 'free');
    }).catch(() => {});
  }, []);

  const handleChoose = (plan) => {
    if (purchased === plan.id) return;
    saveCart(plan.id, billing);
    navigate(`/checkout?plan=${plan.id}&billing=${billing}`);
  };

  return (
    <div className="min-h-screen font-be bg-white py-14 px-4">
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
                className="px-5 py-2 text-xs font-bold transition-all"
                style={{
                  background: billing === b ? FG : 'transparent',
                  color: billing === b ? 'white' : '#666',
                  borderRadius: '3px',
                }}>
                {b === 'monthly' ? t('monthly') : t('yearly')}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Cart resume */}
        {cartPlan && (
          <div className="flex items-center justify-between mb-6 px-4 py-3" style={{ background: FG, borderRadius: '5px' }}>
            <p className="text-sm font-semibold text-white">🛒 Resume — {cartPlan.name}</p>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/checkout?plan=${cartPlan.id}&billing=${savedCart.billing}`)} className="px-3 py-1.5 text-xs font-bold" style={{ background: YUZU, color: FG, borderRadius: '3px' }}>Resume →</button>
              <button onClick={dismissCart} className="px-3 py-1.5 text-xs font-medium" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: '3px' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Plans grid */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible" style={{ scrollSnapType: 'x mandatory' }}>
          {plans.map((plan, idx) => {
            const Icon = PLAN_ICONS[plan.id] || Star;
            const price = billing === 'yearly' ? plan.price_yearly : plan.price_monthly;
            const annualTotal = plan.price_yearly * 12;
            const isCurrentPlan = purchased === plan.id;
            const isRecommended = plan.id === 'expert';

            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                className="flex flex-col relative flex-shrink-0 w-72 md:w-auto"
                style={{ scrollSnapAlign: 'start',
                  background: isRecommended ? FG : 'white',
                  border: isRecommended ? 'none' : '1px solid rgba(0,0,0,0.09)',
                  borderRadius: '5px',
                  boxShadow: isRecommended ? '0 20px 60px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
                }}>

                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[9px] font-black px-3 py-1 tracking-widest"
                      style={{ background: YUZU, color: FG, borderRadius: '2px' }}>
                      {t('recommended')}
                    </span>
                  </div>
                )}


                <div className="p-5 flex flex-col flex-1">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 flex items-center justify-center"
                      style={{ background: isRecommended ? 'rgba(221,255,0,0.15)' : 'rgba(0,0,0,0.05)', borderRadius: '3px' }}>
                      <Icon className="w-4 h-4" style={{ color: isRecommended ? YUZU : FG }} />
                    </div>
                    <div>
                      <p className="font-black text-sm" style={{ color: isRecommended ? 'white' : FG }}>{plan.name}</p>
                      <p className="text-[10px]" style={{ color: isRecommended ? 'rgba(255,255,255,0.4)' : '#aaa' }}>
                        {plan.credits_limit} {t('tensors')}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-end gap-2 flex-wrap">
                      <span className="text-3xl font-black" style={{ color: isRecommended ? 'white' : FG }}>
                        {price}$
                      </span>
                      <span className="text-xs mb-1" style={{ color: isRecommended ? 'rgba(255,255,255,0.4)' : '#bbb' }}>
                        /mois
                      </span>
                      {billing === 'yearly' && plan.price_monthly > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 mb-1" style={{ background: GREEN, color: 'white', borderRadius: '3px' }}>
                          Save {(plan.price_monthly - plan.price_yearly) * 12}$/an
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Internet badge — always shown */}
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
                      plan.ultimate_access && t('mode_ultimate'),
                      plan.file_upload && t('file_upload_feature'),
                      plan.max_discussions === 0 ? t('unlimited_discussions') : null,
                      billing === 'yearly' && plan.shareable_credits > 0 && t('shareable_credits_feature', { n: plan.shareable_credits }),
                      plan.premium_support && t('premium_support_feature'),
                    ].filter(Boolean).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <Check className="w-3 h-3 flex-shrink-0" style={{ color: isRecommended ? YUZU : FG }} />
                        <span style={{ color: isRecommended ? 'rgba(255,255,255,0.7)' : '#555' }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleChoose(plan)}
                    disabled={isCurrentPlan}
                    className="w-full py-3 text-xs font-black tracking-wide transition-all"
                    style={{
                      borderRadius: '3px',
                      background: isCurrentPlan ? 'rgba(0,0,0,0.06)' : isRecommended ? YUZU : FG,
                      color: isCurrentPlan ? '#aaa' : isRecommended ? FG : 'white',
                      cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                    }}>
                    {isCurrentPlan ? t('current_plan') : t('choose_plan', { name: plan.name })}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <p className="text-xs" style={{ color: '#aaa' }}>{t('secure_payment')}</p>
        </div>
      </div>
    </div>
  );
}