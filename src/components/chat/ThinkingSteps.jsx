import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const FG = '#0A0A0A';
const YUZU = '#DDFF00';

// Contextual step pools
const STEP_POOLS = {
  investment: [
    { label: 'Lecture de l\'intention d\'investissement', type: 'check' },
    { label: 'Analyse du profil de risque', type: 'check' },
    { label: 'Simulation des rendements sur 10 ans', type: 'check' },
    { label: 'Vérification des hypothèses fiscales', type: 'correct' },
    { label: 'Structuration des recommandations', type: 'check' },
  ],
  budget: [
    { label: 'Identification des flux financiers', type: 'check' },
    { label: 'Détection des dépenses compressibles', type: 'check' },
    { label: 'Recalibrage du budget de plaisir', type: 'correct' },
    { label: 'Optimisation du taux d\'épargne', type: 'check' },
    { label: 'Validation du plan mensuel', type: 'check' },
  ],
  debt: [
    { label: 'Cartographie des dettes actives', type: 'check' },
    { label: 'Calcul du coût total des intérêts', type: 'check' },
    { label: 'Stratégie avalanche vs boule de neige', type: 'correct' },
    { label: 'Estimation de la date de liberté', type: 'check' },
    { label: 'Plan d\'action priorisé', type: 'check' },
  ],
  realestate: [
    { label: 'Analyse de la capacité d\'emprunt', type: 'check' },
    { label: 'Simulation loyer vs achat', type: 'check' },
    { label: 'Calcul du rendement locatif brut/net', type: 'correct' },
    { label: 'Évaluation de l\'effet de levier', type: 'check' },
    { label: 'Recommandation personnalisée', type: 'check' },
  ],
  default: [
    { label: 'Lecture et analyse de ta question', type: 'check' },
    { label: 'Croisement avec ton profil financier', type: 'check' },
    { label: 'Vérification des calculs', type: 'correct' },
    { label: 'Construction de la réponse optimale', type: 'check' },
  ],
  greeting: [
    { label: 'Analyse du message', type: 'check' },
    { label: 'Formulation de la réponse', type: 'check' },
  ],
  document: [
    { label: 'Lecture du document joint', type: 'check' },
    { label: 'Lancement de 578 simulations', type: 'check' },
    { label: 'Détection des opportunités cachées', type: 'correct' },
    { label: 'Calcul du meilleur scénario (85% succès)', type: 'check' },
    { label: 'Synthèse et recommandations', type: 'check' },
  ],
};

function detectCategory(text = '', hasFiles = false) {
  if (hasFiles) return 'document';
  const t = text.toLowerCase();
  if (/investis|etf|bourse|action|crypto|portefeuille|dividende|rendement/.test(t)) return 'investment';
  if (/budget|dépense|charge|loyer|salaire|revenu|économis|épargn/.test(t)) return 'budget';
  if (/dette|crédit|remboursement|prêt|intérêt|endett/.test(t)) return 'debt';
  if (/immobilier|appartement|maison|achat|locatif|emprunt/.test(t)) return 'realestate';
  if (/bonjour|salut|merci|ok|ciao|hello|ça va|bonne/.test(t)) return 'greeting';
  return 'default';
}

// status: 'pending' | 'active' | 'correcting' | 'done'
function StepRow({ step, status, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: status === 'pending' ? 0.3 : 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      className="flex items-center gap-2.5 py-[3px]"
    >
      {/* Icon */}
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        {status === 'done' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 20 }}
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: YUZU }}
          >
            <Check className="w-2.5 h-2.5" style={{ color: FG }} strokeWidth={3} />
          </motion.div>
        )}
        {status === 'active' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
            className="w-3.5 h-3.5 rounded-full border-2"
            style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: FG }}
          />
        )}
        {status === 'correcting' && (
          <motion.div
            animate={{ rotate: [0, -20, 20, -20, 0] }}
            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
          >
            <RotateCcw className="w-3.5 h-3.5" style={{ color: '#FF4F00' }} strokeWidth={2.5} />
          </motion.div>
        )}
        {status === 'pending' && (
          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.15)' }} />
        )}
      </div>

      {/* Label */}
      <span
        className="text-[12px] font-medium leading-tight"
        style={{
          color: status === 'pending' ? 'rgba(0,0,0,0.3)' :
                 status === 'correcting' ? '#FF4F00' : FG
        }}
      >
        {step.label}
      </span>

      {/* Correction badge */}
      {status === 'correcting' && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-sm"
          style={{ background: 'rgba(255,79,0,0.1)', color: '#FF4F00' }}
        >
          Correction
        </motion.span>
      )}
    </motion.div>
  );
}

export default function ThinkingSteps({ isLoading, text = '', hasFiles = false }) {
  const category = detectCategory(text, hasFiles);
  const steps = STEP_POOLS[category];

  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState('active'); // 'active' | 'correcting'
  const timerRef = useRef(null);
  const correctionDoneRef = useRef(false);

  useEffect(() => {
    if (!isLoading) return;
    setCurrentStep(0);
    setPhase('active');
    correctionDoneRef.current = false;

    // Spread steps across time — advance every ~1.4s
    const interval = 1400;
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(timerRef.current);
          return prev; // stay at last active step
        }
        // If this step is a 'correct' type, show correcting phase briefly
        if (steps[prev]?.type === 'correct' && !correctionDoneRef.current) {
          correctionDoneRef.current = true;
          setPhase('correcting');
          setTimeout(() => {
            setPhase('active');
            setCurrentStep(next);
          }, 900);
          return prev; // don't advance yet
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [isLoading, text]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 justify-start"
    >
      {/* Logo */}
      <img
        src={LOGO_URL}
        alt="Stensor"
        className="w-6 h-6 object-contain flex-shrink-0 mt-1"
        style={{ opacity: 0.7 }}
      />

      <div className="flex flex-col gap-1.5 max-w-[82%]">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-black" style={{ color: FG }}>Stensor</p>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="text-[10px] font-medium"
            style={{ color: 'rgba(0,0,0,0.35)' }}
          >
            réfléchit…
          </motion.span>
        </div>

        {/* Card */}
        <div
          className="bg-white border border-border rounded-sm shadow-sm px-4 py-3"
          style={{ borderLeft: `3px solid ${FG}`, minWidth: '240px' }}
        >
          <div className="space-y-0.5">
            {steps.map((step, i) => {
              let status = 'pending';
              if (i < currentStep) status = 'done';
              else if (i === currentStep) status = phase === 'correcting' && step.type === 'correct' ? 'correcting' : 'active';
              return <StepRow key={i} step={step} status={status} index={i} />;
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}