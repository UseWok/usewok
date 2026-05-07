import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import ActivationCodeModal from '@/components/ActivationCodeModal';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getPlansConfig, getUserPlan, loadPlansFromDB } from '@/lib/plans-config';
import { useLanguage } from '@/lib/i18n';
import { saveCart, clearCart } from './CheckoutPage';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState(() => getPlansConfig().filter(p => p.id !== 'free').reverse());
  const [billing, setBilling] = useState('yearly');
  const [purchased, setPurchased] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [highlightedPlanId, setHighlightedPlanId] = useState('advanced');
  const [selectedTiers, setSelectedTiers] = useState({});
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setPurchased(u?.subscription_plan || 'free'); }).catch(() => {});
    loadPlansFromDB().then(p => { if (p) setPlans(p.filter(pl => pl.id !== 'free').reverse()); }).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'highlighted_plan' }).then(r => { if (r.length > 0) setHighlightedPlanId(r[0].value); }).catch(() => {});
  }, []);

  const handleChoose = (plan) => {
    if (purchased === plan.id) { navigate('/manage-plan'); return; }
    const selIdx = selectedTiers[plan.id];
    const rawOpt = selIdx !== undefined ? plan.tier_options?.[selIdx] : null;
    const tierOpt = rawOpt && typeof rawOpt === 'object' ? rawOpt : null;
    const checkoutUrl = tierOpt ? (billing === 'monthly' ? tierOpt.checkout_url_monthly : tierOpt.checkout_url_yearly) : null;
    if (checkoutUrl) { window.location.href = checkoutUrl; return; }
    saveCart(plan.id, billing);
    navigate(`/checkout?plan=${plan.id}&billing=${billing}`);
  };

  return (
    <div className="min-h-screen font-open bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-2" style={{ color: FG }}>{t('pricing_title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pricing_sub')}</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-6 p-1 bg-muted rounded-sm">
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="px-5 py-2 text-xs font-bold transition-all rounded-sm flex items-center gap-1.5"
                style={{ background: billing === b ? FG : 'transparent', color: billing === b ? 'white' : '#666' }}>
                {b === 'monthly' ? t('monthly') : (
                  <>{t('yearly')} <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: billing === 'yearly' ? YUZU : 'rgba(0,0,0,0.08)', color: billing === 'yearly' ? FG : '#888' }}>-20%</span></>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid — 2x2 desktop, 1col mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {plans.map((plan, idx) => {
            const selIdx = selectedTiers[plan.id];
            const rawOpt = selIdx !== undefined ? plan.tier_options?.[selIdx] : null;
            const tierOpt = rawOpt && typeof rawOpt === 'object' ? rawOpt : null;
            const price = tierOpt
              ? (billing === 'yearly' && tierOpt.price_yearly ? tierOpt.price_yearly : tierOpt.price_monthly || (billing === 'yearly' ? plan.price_yearly : plan.price_monthly))
              : (billing === 'yearly' ? plan.price_yearly : plan.price_monthly);
            const isCurrentPlan = purchased === plan.id;
            const isHighlighted = plan.id === highlightedPlanId;
            const hasTiers = plan.tier_options?.filter(o => (typeof o === 'string' ? o : o?.label)?.trim()).length > 0;
            const features = [
              plan.internet_access && 'Recherche Internet',
              plan.ultimate_access && t('mode_ultimate'),
              plan.file_upload && t('file_upload_feature'),
              plan.max_discussions === 0 ? t('unlimited_discussions') : null,
              billing === 'yearly' && plan.shareable_credits > 0 && t('shareable_credits_feature', { n: plan.shareable_credits }),
              plan.premium_support && t('premium_support_feature'),
            ].filter(Boolean);
            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="flex flex-col bg-white relative"
                style={{
                  border: isHighlighted ? `2px solid ${FG}` : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 16,
                  padding: '28px 22px',
                  boxShadow: isHighlighted ? '0 8px 32px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                {isHighlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-[10px] font-black rounded-full whitespace-nowrap" style={{ background: FG, color: YUZU }}>RECOMMANDÉ</span>
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-4">
                  <p className="text-xl font-black mb-0.5" style={{ color: FG }}>{plan.name}</p>
                  {plan.description && <p className="text-xs text-muted-foreground">{plan.description}</p>}
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black leading-none" style={{ color: FG }}>${price}</span>
                    <span className="text-sm mb-1 text-muted-foreground">/mois</span>
                  </div>
                  {billing === 'yearly' && <p className="text-[10px] text-green-600 font-semibold mt-1">-20% — facturé annuellement</p>}
                </div>

                {/* Tier options — clickable rows */}
                {hasTiers && (
                  <div className="mb-5">
                    <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Choisir un niveau</p>
                    <div className="space-y-1.5">
                      {plan.tier_options.map((opt, i) => {
                        const label = typeof opt === 'string' ? opt : opt?.label;
                        if (!label?.trim()) return null;
                        const isSelected = selectedTiers[plan.id] === i;
                        const optObj = typeof opt === 'object' ? opt : null;
                        const tierPrice = optObj ? (billing === 'yearly' && optObj.price_yearly ? optObj.price_yearly : optObj.price_monthly) : null;
                        return (
                          <button key={i} onClick={() => setSelectedTiers(s => ({ ...s, [plan.id]: isSelected ? undefined : i }))}
                            className="w-full text-left px-3 py-2.5 text-xs font-semibold transition-all flex items-center justify-between"
                            style={{
                              background: isSelected ? FG : 'rgba(0,0,0,0.03)',
                              border: `1px solid ${isSelected ? FG : 'rgba(0,0,0,0.08)'}`,
                              borderRadius: 10,
                              color: isSelected ? 'white' : '#555',
                            }}>
                            <span>{label}</span>
                            {tierPrice && <span className="font-black" style={{ color: isSelected ? YUZU : FG }}>${tierPrice}/mo</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button onClick={() => handleChoose(plan)}
                  className="w-full py-3.5 text-sm font-black transition-all mb-5"
                  style={{
                    borderRadius: 10,
                    border: isCurrentPlan ? `2px solid ${FG}` : 'none',
                    background: isCurrentPlan ? 'transparent' : FG,
                    color: isCurrentPlan ? FG : 'white',
                  }}>
                  {isCurrentPlan ? 'Gérer mon plan' : `Choisir ${plan.name}`}
                </button>

                {/* Credits pill */}
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg mb-5" style={{ background: 'rgba(0,0,0,0.04)' }}>
                  <Zap className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {plan.credits_limit} Flash{plan.deep_credits_limit ? ` · ${plan.deep_credits_limit} Deep` : ''}/mois
                  </span>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-3 text-muted-foreground">Inclus</p>
                    <ul className="space-y-2">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#444' }}>
                          <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Activation code */}
        <div className="max-w-md mx-auto mt-12">
          <div className="h-px mb-8" style={{ background: 'rgba(0,0,0,0.07)' }} />
          <p className="text-center text-sm font-semibold mb-3" style={{ color: '#555' }}>Vous avez un code d'activation ?</p>
          <button onClick={() => setShowCodeModal(true)}
            className="w-full py-3 text-sm font-bold transition-all hover:opacity-80"
            style={{ border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, color: FG }}>
            Entrer un code
          </button>
        </div>

        <p className="text-center mt-6 text-xs text-muted-foreground">{t('secure_payment')}</p>
        <ActivationCodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} />
      </div>
    </div>
  );
}