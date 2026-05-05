import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
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
  const [expandedTier, setExpandedTier] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setPurchased(u?.subscription_plan || 'free'); }).catch(() => {});
    loadPlansFromDB().then(p => { if (p) setPlans(p.filter(pl => pl.id !== 'free').reverse()); }).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'highlighted_plan' }).then(r => { if (r.length > 0) setHighlightedPlanId(r[0].value); }).catch(() => {});
  }, []);

  const handleChoose = (plan) => {
    if (purchased === plan.id) { navigate('/manage-plan'); return; }
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

        {/* Plans — horizontal scroll if needed */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-5" style={{ minWidth: 'max-content' }}>
            {plans.map((plan, idx) => {
              const price = billing === 'yearly' ? plan.price_yearly : plan.price_monthly;
              const isCurrentPlan = purchased === plan.id;
              const isHighlighted = plan.id === highlightedPlanId;
              const tierExpanded = expandedTier === plan.id;

              // Build features list
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
                  className="flex flex-col"
                  style={{
                    width: 240,
                    flexShrink: 0,
                    background: 'white',
                    border: isHighlighted ? `2px solid ${FG}` : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 16,
                    padding: '28px 24px',
                    position: 'relative',
                    boxShadow: isHighlighted ? '0 8px 32px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                  }}>

                  {/* Popular badge */}
                  {isHighlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-full whitespace-nowrap"
                      style={{ background: FG, color: YUZU }}>
                      Le plus populaire
                    </div>
                  )}

                  {/* Plan name */}
                  <p className="text-xl font-black mb-3" style={{ color: FG }}>{plan.name}</p>

                  {/* Price */}
                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-4xl font-black leading-none" style={{ color: FG }}>${price}</span>
                    <span className="text-sm mb-1 text-muted-foreground">/mois</span>
                  </div>

                  {/* Tier options dropdown */}
                  {plan.tier_options?.length > 0 && (
                    <div className="mb-5 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.12)' }}>
                      <button onClick={() => setExpandedTier(tierExpanded ? null : plan.id)}
                        className="w-full px-3.5 py-3 flex items-start justify-between hover:bg-black/[0.02] transition-colors">
                        <div className="grid grid-cols-1 gap-y-1.5 text-left flex-1">
                          {(tierExpanded ? plan.tier_options : plan.tier_options.slice(0, 2)).map((opt, i) => (
                            <p key={i} className="text-sm leading-tight">
                              <span className="font-semibold" style={{ color: FG }}>{opt.label}</span>
                              <span className="ml-1 text-xs" style={{ color: '#bbb' }}>{opt.sublabel}</span>
                            </p>
                          ))}
                        </div>
                        <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2 mt-0.5"
                          style={{ color: '#aaa', transform: tierExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>
                  )}

                  {/* Credits */}
                  <p className="text-sm font-semibold mb-5" style={{ color: '#888' }}>
                    {plan.credits_limit} {t('tensors')}/mois
                  </p>

                  {/* CTA */}
                  <button onClick={() => handleChoose(plan)}
                    className="w-full py-3 text-sm font-black transition-all mb-7"
                    style={{
                      borderRadius: 10,
                      border: isCurrentPlan ? `2px solid ${FG}` : 'none',
                      background: isCurrentPlan ? 'transparent' : isHighlighted ? FG : FG,
                      color: isCurrentPlan ? FG : 'white',
                    }}>
                    {isCurrentPlan ? 'Gérer' : `Obtenir ${plan.name}`}
                  </button>

                  {/* Features */}
                  {features.length > 0 && (
                    <div>
                      <p className="text-xs font-bold mb-3" style={{ color: '#aaa' }}>Points forts du plan :</p>
                      <ul className="space-y-2.5">
                        {features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#444' }}>
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