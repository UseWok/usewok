import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Crown, Shield, Globe, BookOpen, Users, Wifi, WifiOff, Upload, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getPlansConfig, getUserPlan } from '@/lib/plans-config';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';
const CORAL = '#FF4F00';

const PLAN_ICONS = { free: Zap, essential: Shield, advanced: Globe, expert: Star, supreme: Crown };

const FEATURE_LABELS = {
  credits_limit: (v) => `${v} crédits / mois`,
  daily_credits_limit: (v) => v > 0 ? `Max ${v} crédits / jour` : null,
  internet_access: (v) => v ? 'Recherche Internet incluse' : null,
  file_upload: (v) => v ? 'Envoi de fichiers' : null,
  file_upload_extended: (v) => v ? 'Envoi fichiers étendu' : null,
  ultimate_access: (v) => v ? 'Mode Ultimate inclus' : null,
  max_discussions: (v) => v === 0 ? 'Discussions illimitées' : `${v} discussions max`,
  lessons_per_month: (v) => v > 0 ? `${v} leçons / mois incluses` : null,
  shareable_credits: (v) => v > 0 ? `${v} crédits partageables / an` : null,
  premium_support: (v) => v ? 'Support Premium dédié' : null,
  can_choose_model: (v) => v ? 'Choix du modèle IA' : 'Modèle IA imposé',
};

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [plans] = useState(getPlansConfig);
  const [purchased, setPurchased] = useState(null);
  const [billing, setBilling] = useState('monthly');
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setPurchased(u?.subscription_plan || 'free'); }).catch(() => {});
  }, []);

  const handleSubscribe = async (plan) => {
    if (!user) return;
    await base44.auth.updateMe({
      subscription_plan: plan.id,
      credits_limit: plan.credits_limit,
      credits_used: 0,
      credits_bonus: 0,
    });
    // Reload user to confirm
    const updated = await base44.auth.me();
    setUser(updated);
    setPurchased(plan.id);
    setTimeout(() => navigate('/'), 1200);
  };

  const getPlanFeatures = (plan) => {
    const features = [];
    const order = ['credits_limit', 'daily_credits_limit', 'can_choose_model', 'internet_access', 'ultimate_access', 'max_discussions', 'file_upload', 'file_upload_extended', 'lessons_per_month', 'shareable_credits', 'premium_support'];
    for (const key of order) {
      const label = FEATURE_LABELS[key]?.(plan[key]);
      if (label) features.push({ label, included: !!plan[key] || (key === 'can_choose_model') });
    }
    return features;
  };

  return (
    <div className="min-h-screen font-be bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm mb-4"
            style={{ background: YUZU, color: FG }}>
            <Zap className="w-3.5 h-3.5" />
            <span className="text-xs font-bold tracking-wide">ABONNEMENTS STENSOR</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-4xl font-bold mb-3" style={{ color: FG }}>
            Votre coach financier IA, 24h/24
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-sm" style={{ color: '#666' }}>
            1 crédit = 1 réponse · Crédits renouvelés chaque mois · Annulation à tout moment
          </motion.p>

          {/* Billing toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1 mt-6 p-1 rounded-sm border border-black/8"
            style={{ background: '#f5f5f5' }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="px-4 py-2 rounded-sm text-xs font-semibold transition-all"
                style={{
                  background: billing === b ? FG : 'transparent',
                  color: billing === b ? 'white' : '#666',
                }}>
                {b === 'monthly' ? 'Mensuel' : 'Annuel -20%'}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map((plan, idx) => {
            const Icon = PLAN_ICONS[plan.id] || Zap;
            const price = billing === 'yearly' ? plan.price_yearly : plan.price_monthly;
            const isCurrentPlan = purchased === plan.id;
            const isRecommended = plan.id === 'expert';
            const features = getPlanFeatures(plan);

            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                className="flex flex-col relative"
                style={{
                  background: isRecommended ? FG : 'white',
                  border: isRecommended ? 'none' : '1px solid rgba(0,0,0,0.09)',
                  borderRadius: '4px',
                  boxShadow: isRecommended ? '0 20px 60px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}>

                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[9px] font-black px-3 py-1 tracking-widest"
                      style={{ background: YUZU, color: FG, borderRadius: '2px' }}>
                      RECOMMANDÉ
                    </span>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 flex items-center justify-center rounded-sm"
                      style={{ background: isRecommended ? 'rgba(221,255,0,0.15)' : 'rgba(0,0,0,0.05)' }}>
                      <Icon className="w-4 h-4" style={{ color: isRecommended ? YUZU : FG }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: isRecommended ? 'white' : FG }}>{plan.name}</p>
                      <p className="text-[10px]" style={{ color: isRecommended ? 'rgba(255,255,255,0.5)' : '#999' }}>
                        {plan.credits_limit} crédits
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black" style={{ color: isRecommended ? 'white' : FG }}>
                        {price === 0 ? 'Gratuit' : `${price}$`}
                      </span>
                      {price > 0 && <span className="text-xs mb-1" style={{ color: isRecommended ? 'rgba(255,255,255,0.4)' : '#bbb' }}>/mois</span>}
                    </div>
                    {billing === 'yearly' && price > 0 && (
                      <p className="text-[10px] mt-0.5" style={{ color: isRecommended ? 'rgba(221,255,0,0.7)' : CORAL }}>
                        {plan.price_monthly - plan.price_yearly}$/mois économisé
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 flex-1 mb-5">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Check className="w-3 h-3 flex-shrink-0 mt-0.5"
                          style={{ color: isRecommended ? YUZU : FG }} />
                        <span style={{ color: isRecommended ? 'rgba(255,255,255,0.75)' : '#444' }}>{f.label}</span>
                      </li>
                    ))}
                    {!plan.internet_access && (
                      <li className="flex items-start gap-2 text-xs opacity-40">
                        <WifiOff className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: isRecommended ? 'white' : FG }} />
                        <span style={{ color: isRecommended ? 'white' : '#444' }}>Pas d'Internet</span>
                      </li>
                    )}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrentPlan}
                    className="w-full py-2.5 text-xs font-bold tracking-wide transition-all"
                    style={{
                      borderRadius: '3px',
                      background: isCurrentPlan ? 'rgba(0,0,0,0.08)' : isRecommended ? YUZU : FG,
                      color: isCurrentPlan ? '#aaa' : isRecommended ? FG : 'white',
                      cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                      boxShadow: !isCurrentPlan && isRecommended ? `0 4px 20px rgba(221,255,0,0.35)` : 'none',
                    }}>
                    {isCurrentPlan ? '✓ Plan actuel' : plan.id === 'free' ? 'Continuer gratuitement' : `Choisir ${plan.name}`}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-xs" style={{ color: '#999' }}>
            Paiement sécurisé · Annulation à tout moment · Accès immédiat
          </p>
          <p className="text-xs font-medium" style={{ color: '#666' }}>
            💬 Disponible 24h/24 — Votre coach financier ne dort jamais
          </p>
        </div>
      </div>
    </div>
  );
}