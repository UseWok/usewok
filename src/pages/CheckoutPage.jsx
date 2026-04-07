import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Wifi, WifiOff, ExternalLink, ChevronLeft, Zap, Shield, Globe, Star, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getPlansConfig, getUserPlan } from '@/lib/plans-config';
import { useLanguage } from '@/lib/i18n';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';
const GREEN = '#16a34a';
const PLAN_ICONS = { free: Zap, essential: Shield, advanced: Globe, expert: Star, supreme: Crown };

const CART_KEY = 'stensor_cart_v1';

export function saveCart(planId, billing) {
  localStorage.setItem(CART_KEY, JSON.stringify({ planId, billing, ts: Date.now() }));
}
export function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)); } catch { return null; }
}
export function clearCart() { localStorage.removeItem(CART_KEY); }

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan') || 'expert';
  const [billing, setBilling] = useState(urlParams.get('billing') || 'monthly');
  const [user, setUser] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const plans = getPlansConfig();
  const plan = plans.find(p => p.id === planId) || plans[1];
  const Icon = PLAN_ICONS[plan?.id] || Star;
  const price = billing === 'yearly' ? plan?.price_yearly : plan?.price_monthly;
  const annualTotal = plan?.price_yearly ? plan.price_yearly * 12 : 0;

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    saveCart(planId, billing);
  }, [planId, billing]);

  const isYearly = billing === 'yearly';

  // Monthly-only perks (crossed out for monthly)
  const monthlyMissing = [
    ...(plan?.shareable_credits > 0 ? [t('shareable_credits_feature', { n: plan.shareable_credits })] : []),
    t('annual_discount_feature'),
    t('exclusive_promo_feature'),
  ];

  // All plan features
  const features = [
    `${plan?.credits_limit} ${t('tensors')}/mois`,
    plan?.internet_access ? t('internet_included') : null,
    plan?.ultimate_access ? t('mode_ultimate') : null,
    plan?.file_upload ? t('file_upload_feature') : null,
    plan?.can_choose_model ? t('model_choice_feature') : null,
    plan?.max_discussions === 0 ? t('unlimited_discussions') : null,
    plan?.premium_support ? t('premium_support_feature') : null,
    ...(isYearly ? (plan?.shareable_credits > 0 ? [t('shareable_credits_feature', { n: plan.shareable_credits })] : []) : []),
  ].filter(Boolean);

  const handleContinue = () => {
    const redirectUrl = plan?.checkout_url;
    if (redirectUrl) {
      clearCart();
      window.location.href = redirectUrl;
    } else {
      setConfirming(true);
    }
  };

  const handleDemoSubscribe = async () => {
    if (!user) return;
    await base44.auth.updateMe({
      subscription_plan: plan.id,
      credits_limit: plan.credits_limit,
      credits_used: 0,
      credits_bonus: 0,
    });
    clearCart();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white font-be flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/6">
        <button onClick={() => navigate('/pricing')}
          className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-60"
          style={{ color: FG }}>
          <ChevronLeft className="w-4 h-4" />
          {t('back_to_plans')}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center" style={{ background: YUZU, borderRadius: '2px' }}>
            <Zap className="w-3 h-3" style={{ color: FG }} />
          </div>
          <span className="font-black text-sm" style={{ color: FG }}>Stensor</span>
        </div>
        <button onClick={() => { clearCart(); navigate('/pricing'); }}
          className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"
          style={{ borderRadius: '4px' }}>
          <X className="w-4 h-4" style={{ color: '#999' }} />
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Plan header */}
            <div className="p-6 mb-4" style={{ background: FG, borderRadius: '6px' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: YUZU, borderRadius: '4px' }}>
                  <Icon className="w-5 h-5" style={{ color: FG }} />
                </div>
                <div>
                  <p className="font-black text-lg text-white">{plan?.name}</p>
                  <p className="text-xs text-white/50">{t('subscription')}</p>
                </div>
              </div>

              {/* Billing toggle */}
              <div className="flex items-center gap-1 p-1 mb-4" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', width: 'fit-content' }}>
                {['monthly', 'yearly'].map(b => (
                  <button key={b} onClick={() => setBilling(b)}
                    className="px-4 py-1.5 text-xs font-bold transition-all"
                    style={{ background: billing === b ? YUZU : 'transparent', color: billing === b ? FG : 'rgba(255,255,255,0.5)', borderRadius: '3px' }}>
                    {b === 'monthly' ? t('monthly') : t('yearly')}
                  </button>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-end gap-3">
                <div>
                  <span className="text-4xl font-black text-white">{price}$</span>
                  <span className="text-sm text-white/40 ml-1">/mois</span>
                </div>
                {isYearly && plan?.price_monthly && (
                  <div className="mb-1 px-2.5 py-1" style={{ background: GREEN, borderRadius: '3px' }}>
                    <p className="text-[10px] font-black text-white">Save {(plan.price_monthly - plan.price_yearly) * 12}$/year</p>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="border border-black/8 mb-4" style={{ borderRadius: '6px' }}>
              <div className="px-4 py-3 border-b border-black/6">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#aaa' }}>{t('included_features')}</p>
              </div>
              <div className="divide-y divide-black/4">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '2px' }}>
                      <Check className="w-3 h-3" style={{ color: FG }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: FG }}>{f}</span>
                  </div>
                ))}

                {/* Monthly-only missing features (crossed) */}
                {!isYearly && monthlyMissing.map((f, i) => (
                  <div key={`miss-${i}`} className="flex items-center gap-3 px-4 py-3 opacity-40">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '2px' }}>
                      <X className="w-3 h-3" style={{ color: '#999' }} />
                    </div>
                    <span className="text-sm line-through" style={{ color: '#999' }}>{f}</span>
                    <span className="text-[9px] font-bold ml-auto px-1.5 py-0.5" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '2px', color: '#bbb' }}>
                      {t('annual_only')}
                    </span>
                  </div>
                ))}

                {/* Annual extras */}
                {isYearly && (
                  <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'rgba(22,163,74,0.05)' }}>
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ background: GREEN, borderRadius: '2px' }}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: GREEN }}>{t('annual_savings_feature', { saved: (plan.price_monthly - plan.price_yearly) * 12 })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <button onClick={handleContinue}
              className="w-full py-4 font-black text-sm tracking-wide transition-all hover:opacity-90"
              style={{ background: FG, color: 'white', borderRadius: '5px' }}>
              {t('continue_checkout')} →
            </button>
            <button onClick={() => { clearCart(); navigate('/pricing'); }}
              className="w-full py-2.5 text-sm transition-colors hover:opacity-60 mt-2"
              style={{ color: '#999' }}>
              {t('cancel_cart')}
            </button>
          </motion.div>
        </div>
      </div>

      {/* No redirect URL modal */}
      <AnimatePresence>
        {confirming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={e => { if (e.target === e.currentTarget) setConfirming(false); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white p-6"
              style={{ borderRadius: '6px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <p className="font-black text-base mb-2" style={{ color: FG }}>{t('payment_not_configured')}</p>
              <p className="text-sm mb-4" style={{ color: '#666' }}>{t('payment_not_configured_sub')}</p>
              <div className="flex gap-2">
                <button onClick={handleDemoSubscribe}
                  className="flex-1 py-2.5 font-bold text-sm"
                  style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                  {t('demo_activate')}
                </button>
                <button onClick={() => setConfirming(false)}
                  className="px-4 py-2.5 text-sm font-medium"
                  style={{ background: 'rgba(0,0,0,0.05)', color: FG, borderRadius: '4px' }}>
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}