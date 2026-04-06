import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Crown, Package } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const PRODUCTS_KEY = 'stensor_products';
const ICON_MAP = { Zap, Star, Crown, Package };

const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    credits: 25,
    icon: 'Zap',
    popular: false,
    features: ['25 crédits / mois', 'Mode Fast uniquement', 'Agents de base', 'Support communauté'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    credits: 500,
    icon: 'Star',
    popular: true,
    features: ['500 crédits / mois', 'Modes Fast & Pro', 'Tous les agents', 'Support prioritaire', 'Historique illimité'],
  },
  {
    id: 'business',
    name: 'Business',
    price: 29,
    credits: 2000,
    icon: 'Crown',
    popular: false,
    features: ['2 000 crédits / mois', 'Mode Ultimate inclus', 'Agents personnalisés', 'Support dédié', 'Historique illimité', 'API access'],
  },
];

function getPlans() {
  try { return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || DEFAULT_PLANS; }
  catch { return DEFAULT_PLANS; }
}

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [plans] = useState(getPlans);
  const [purchased, setPurchased] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const handlePurchase = async (plan) => {
    if (!user) return;
    await base44.entities.User.update(user.id, { credits_limit: plan.credits, credits_used: 0 });
    setPurchased(plan.id);
    setTimeout(() => navigate('/'), 1500);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen font-be py-16 px-6" style={{ background: '#f8f7ff' }}>
      <div className="max-w-3xl mx-auto">
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl"
            style={{ background: 'rgba(30,0,80,0.05)', border: '1px solid rgba(30,0,80,0.1)' }}>
            <p className="text-sm font-bold" style={{ color: '#1E0050' }}>Compte administrateur</p>
            <p className="text-xs text-muted-foreground mt-0.5">Vous gérez les plans depuis l'espace admin.</p>
          </motion.div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold" style={{ color: '#1E0050' }}>Choisissez votre plan</h1>
          <p className="text-sm text-muted-foreground mt-2">1 crédit = 1 réponse IA · Crédits renouvelés chaque mois</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, idx) => {
            const Icon = ICON_MAP[plan.icon] || Package;
            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                className={`relative flex flex-col rounded-3xl overflow-hidden ${plan.popular ? 'shadow-2xl' : 'shadow-md'}`}
                style={{
                  background: plan.popular ? 'linear-gradient(135deg, #1E0050 0%, #4c1d95 100%)' : 'white',
                  border: plan.popular ? 'none' : '1px solid rgba(30,0,80,0.1)',
                }}>
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(221,255,0,0.2)', color: '#DDFF00', border: '1px solid rgba(221,255,0,0.3)' }}>
                      POPULAIRE
                    </span>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: plan.popular ? 'rgba(255,255,255,0.15)' : 'rgba(30,0,80,0.07)' }}>
                      <Icon className="w-5 h-5" style={{ color: plan.popular ? 'white' : '#7c3aed' }} />
                    </div>
                    <p className="font-bold text-base" style={{ color: plan.popular ? 'white' : '#1E0050' }}>{plan.name}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold" style={{ color: plan.popular ? 'white' : '#1E0050' }}>{plan.price}€</span>
                    <span className="text-sm ml-1" style={{ color: plan.popular ? 'rgba(255,255,255,0.6)' : 'rgba(30,0,80,0.4)' }}>/mois</span>
                  </div>
                  <ul className="space-y-3 flex-1 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: plan.popular ? 'rgba(221,255,0,0.2)' : 'rgba(124,58,237,0.1)' }}>
                          <Check className="w-2.5 h-2.5" style={{ color: plan.popular ? '#DDFF00' : '#7c3aed' }} />
                        </div>
                        <span style={{ color: plan.popular ? 'rgba(255,255,255,0.85)' : 'rgba(30,0,80,0.7)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled={plan.price === 0}
                    onClick={() => plan.price > 0 && handlePurchase(plan)}
                    className="w-full py-3 rounded-2xl text-sm font-bold transition-all"
                    style={{
                      background: plan.price === 0 ? 'rgba(30,0,80,0.05)' : plan.popular ? 'rgba(221,255,0,0.9)' : 'linear-gradient(135deg, #1E0050, #5b21b6)',
                      color: plan.price === 0 ? 'rgba(30,0,80,0.3)' : plan.popular ? '#1E0050' : 'white',
                      cursor: plan.price === 0 ? 'default' : 'pointer',
                    }}>
                    {purchased === plan.id ? '✓ Activé !' : plan.price === 0 ? 'Plan actuel' : 'Choisir ce plan'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-10">Paiement sécurisé · Annulation à tout moment</p>
      </div>
    </div>
  );
}