import { motion } from 'framer-motion';
import { X, Zap, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLAN_PRICES, PLAN_LABELS } from '@/lib/wok-plans';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const WHITE = '#FFFFFF';
const SURFACE = '#F7F7F5';

const PLAN_PERKS = {
  starter: [
    '5 moteurs IA (ChatGPT, Claude, Mistral…)',
    'Scan complet 3×/semaine',
    'Instructions de correction incluses',
    '5 sites surveillés',
    'Historique 180 jours',
    'Rapport PDF export',
    'Intégrations GSC + Analytics',
    '50 messages chatbot',
  ],
  pro: [
    '8 moteurs IA (+ Perplexity, Grok, Copilot)',
    'Scan complet 1×/jour',
    'Instructions de correction incluses',
    '10 sites surveillés',
    'Historique 365 jours',
    'Rapport PDF export',
    'Intégrations GSC + Analytics',
    '200 messages chatbot',
  ],
};

/**
 * UpgradeModal — modale upsell générique.
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   feature: string — nom de la feature bloquée (ex: "l'audit technique")
 *   requiredPlan: 'starter' | 'pro'
 *   description: string — phrase custom (optionnel)
 */
export default function UpgradeModal({ open, onClose, feature = 'cette fonctionnalité', requiredPlan = 'starter', description }) {
  const navigate = useNavigate();
  if (!open) return null;

  const perks = PLAN_PERKS[requiredPlan] || PLAN_PERKS.starter;
  const price = PLAN_PRICES[requiredPlan]?.monthly || 49;
  const label = PLAN_LABELS[requiredPlan] || 'Starter';
  const isStarter = requiredPlan === 'starter';

  const defaultDesc = `${feature} est disponible à partir du plan ${label}. Débloquez une analyse complète de votre visibilité IA.`;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', fontFamily: F, padding: 16 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: WHITE, borderRadius: 24, width: '100%', maxWidth: 420, position: 'relative', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}
      >
        {/* Gradient top bar */}
        <div style={{ height: 4, background: isStarter ? 'linear-gradient(90deg, #7C6AF4, #10B981)' : 'linear-gradient(90deg, #F59E0B, #EF4444)' }} />

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={12} color={INK3} />
        </button>

        <div style={{ padding: '24px 24px 0' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: isStarter ? '#EEF0FF' : '#FEF3C7', borderRadius: 20, marginBottom: 14 }}>
            <Zap size={11} color={isStarter ? '#7C6AF4' : '#F59E0B'} />
            <span style={{ fontSize: 11, fontWeight: 700, color: isStarter ? '#7C6AF4' : '#D97706', letterSpacing: '0.06em' }}>PLAN {label.toUpperCase()}</span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 900, color: INK, margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Débloquez {feature}
          </h2>
          <p style={{ fontSize: 13, color: INK3, margin: '0 0 20px', lineHeight: 1.6 }}>
            {description || defaultDesc}
          </p>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: INK, letterSpacing: '-0.04em' }}>{price}$</span>
            <span style={{ fontSize: 13, color: INK3 }}>/mois</span>
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginLeft: 6 }}>· Annuel -20%</span>
          </div>

          {/* Perks list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {perks.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: isStarter ? '#EEF0FF' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={10} color={isStarter ? '#7C6AF4' : '#D97706'} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 13, color: INK2 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => { navigate('/pricing'); onClose(); }}
            style={{ width: '100%', padding: '14px', background: INK, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            Passer au plan {label} <ArrowRight size={14} />
          </button>
          <button onClick={onClose} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', borderRadius: 10, fontSize: 12, color: INK3, cursor: 'pointer', fontFamily: F }}>
            Continuer avec le plan Gratuit
          </button>
        </div>
      </motion.div>
    </div>
  );
}