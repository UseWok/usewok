import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Zap, Star, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CREDITS_KEY = 'stensor_credits_used';

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    period: '/mois',
    credits: 25,
    icon: Zap,
    features: ['25 crédits / mois', 'Mode Fast uniquement', 'Agents de base', 'Support communauté'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '9€',
    period: '/mois',
    credits: 500,
    icon: Star,
    popular: true,
    features: ['500 crédits / mois', 'Modes Fast, Thinking & Pro', 'Tous les agents', 'Support prioritaire', 'Historique illimité'],
  },
  {
    id: 'business',
    name: 'Business',
    price: '29€',
    period: '/mois',
    credits: 2000,
    icon: Crown,
    features: ['2 000 crédits / mois', 'Mode Ultimate inclus', 'Agents personnalisés', 'Support dédié', 'Historique illimité', 'API access'],
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creditsUsed] = useState(() => parseInt(localStorage.getItem(CREDITS_KEY) || '0', 10));

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background font-be">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors">
          <ArrowLeft className="w-4 h-4 text-foreground/60" />
        </button>
        <p className="text-sm font-semibold text-foreground">Plans tarifaires</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Admin badge */}
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-sm font-semibold text-primary">Vous êtes administrateur</p>
            <p className="text-xs text-muted-foreground mt-0.5">Vous bénéficiez de <strong>1 000 000 crédits</strong> automatiquement. Aucune mise à niveau nécessaire.</p>
          </motion.div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground">Choisissez votre plan</h1>
          <p className="text-sm text-muted-foreground mt-2">1 crédit = 1 réponse IA · Crédits renouvelés chaque mois</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`relative bg-card border rounded-2xl p-5 flex flex-col ${
                  plan.popular ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">POPULAIRE</span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.popular ? 'bg-primary/10' : 'bg-foreground/5'}`}>
                    <Icon className={`w-4 h-4 ${plan.popular ? 'text-primary' : 'text-foreground/60'}`} />
                  </div>
                  <p className="font-bold text-foreground">{plan.name}</p>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 flex-1 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-foreground/70">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={plan.id === 'free'}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    plan.id === 'free'
                      ? 'bg-foreground/5 text-foreground/40 cursor-default'
                      : plan.popular
                      ? 'bg-primary text-primary-foreground hover:opacity-90 hover:-translate-y-0.5 shadow-md'
                      : 'bg-foreground/8 text-foreground hover:bg-foreground/12'
                  }`}
                >
                  {plan.id === 'free' ? 'Plan actuel' : 'Choisir ce plan'}
                </button>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">Paiement sécurisé · Annulation à tout moment</p>
      </div>
    </div>
  );
}