import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const THINKING_MSGS = [
  'Analyse du contexte...', 'Traitement approfondi...', 'Réflexion en cours...',
  'Recherche dans la mémoire...', 'Formulation de la réponse...', 'Vérification...',
];

const PRO_MSGS = [
  'Analyse sémantique...', 'Recherche contextuelle...', 'Cross-référencement...',
  'Synthèse des données...', 'Optimisation contextuelle...', 'Vérification de cohérence...',
  'Raffinement de la réponse...', 'Qualité maximale en cours...',
];

export default function ChatLoadingAnimation({ mode }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const isThinking = mode === 'thinking';
  const isPro = mode === 'pro';
  const messages = isThinking ? THINKING_MSGS : isPro ? PRO_MSGS : null;
  const spinDuration = mode === 'fast' ? 0.65 : 1.1;
  const ringColor = isThinking ? '#60a5fa' : isPro ? '#34d399' : '#a78bfa';

  useEffect(() => {
    if (!messages) return;
    const interval = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 1800);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="relative w-14 h-14 flex-shrink-0">
        <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full">
          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="2" />
        </svg>
        <motion.svg
          viewBox="0 0 56 56"
          className="absolute inset-0 w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: spinDuration, ease: 'linear' }}
        >
          <circle
            cx="28" cy="28" r="24" fill="none"
            stroke={ringColor} strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={isThinking ? '28 124' : '42 110'}
          />
        </motion.svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={LOGO_URL} alt="Stensor" className="w-8 h-8 object-contain" />
        </div>
      </div>

      <div className="min-w-0">
        {mode === 'fast' && (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground/60">Stensor</p>
            <div className="flex items-end gap-0.5 h-3">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1 h-1 bg-muted-foreground/40 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.22 }} />
              ))}
            </div>
          </div>
        )}
        {(isThinking || isPro) && (
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: ringColor }}>
              {isThinking ? '✦ Réflexion...' : '◈ Analyse en cours...'}
            </p>
            <AnimatePresence mode="wait">
              <motion.p key={msgIdx}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="text-xs text-muted-foreground"
              >
                {messages[msgIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}