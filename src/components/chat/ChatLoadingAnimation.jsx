import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const THINKING_MSGS = [
  'Analyse profonde...', 'Traitement neuronal...', 'Réflexion en cours...',
  'Consolidation des données...', 'Formulation...', 'Vérification...',
];

const PRO_MSGS = [
  'Analyse sémantique...', 'Cross-référencement...', 'Synthèse multi-couches...',
  'Optimisation contextuelle...', 'Cohérence vérifiée...', 'Raffinement...', 'Qualité maximale...',
];

const COLORS = {
  fast: { primary: '#a78bfa', secondary: '#7c3aed', glow: 'rgba(167,139,250,0.35)' },
  thinking: { primary: '#60a5fa', secondary: '#3b82f6', glow: 'rgba(96,165,250,0.35)' },
  pro: { primary: '#34d399', secondary: '#10b981', glow: 'rgba(52,211,153,0.35)' },
  ultimate: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245,158,11,0.35)' },
};

export default function ChatLoadingAnimation({ mode }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [tick, setTick] = useState(0);

  const isThinking = mode === 'thinking';
  const isPro = mode === 'pro';
  const messages = isThinking ? THINKING_MSGS : isPro ? PRO_MSGS : null;
  const colors = COLORS[mode] || COLORS.fast;
  const spinSpeed = mode === 'fast' ? 0.5 : 0.9;

  useEffect(() => {
    if (!messages) return;
    const interval = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 1900);
    return () => clearInterval(interval);
  }, [messages]);

  useEffect(() => {
    const t = setInterval(() => setTick(i => i + 1), 80);
    return () => clearInterval(t);
  }, []);

  const dots = 3;

  return (
    <div className="px-4 py-3.5 flex items-center gap-3 min-w-[180px]">
      {/* Logo with orbiting ring */}
      <div className="relative w-10 h-10 flex-shrink-0">
        {/* Glow */}
        <div className="absolute inset-0 rounded-full blur-md opacity-60" style={{ background: colors.glow }} />

        {/* Outer orbit ring */}
        <motion.svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: spinSpeed, ease: 'linear' }}>
          <circle cx="20" cy="20" r="17" fill="none" stroke={colors.primary} strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={isThinking ? '14 93' : isPro ? '22 85' : '8 99'} opacity="0.9" />
        </motion.svg>

        {/* Inner counter-orbit */}
        <motion.svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: spinSpeed * 1.7, ease: 'linear' }}>
          <circle cx="20" cy="20" r="13" fill="none" stroke={colors.secondary} strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="6 76" opacity="0.5" />
        </motion.svg>

        {/* Logo center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.img src={LOGO_URL} alt="" className="w-5 h-5 object-contain"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} />
        </div>
      </div>

      {/* Text */}
      <div className="min-w-0">
        {mode === 'fast' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: colors.primary }}>Stensor</span>
            <div className="flex items-end gap-0.5 h-3">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1 rounded-full"
                  animate={{ height: ['3px', '10px', '3px'], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.18, ease: 'easeInOut' }}
                  style={{ background: colors.primary }} />
              ))}
            </div>
          </div>
        )}
        {(isThinking || isPro) && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <motion.div className="w-1.5 h-1.5 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ background: colors.primary }} />
              <span className="text-[11px] font-bold tracking-wide" style={{ color: colors.primary }}>
                {isThinking ? 'RÉFLEXION' : 'ANALYSE PRO'}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={msgIdx}
                initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-muted-foreground">
                {messages[msgIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
        {mode === 'ultimate' && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <motion.div className="w-1.5 h-1.5 rounded-full"
                animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                style={{ background: colors.primary }} />
              <span className="text-[11px] font-bold tracking-widest" style={{ color: colors.primary }}>ULTIMATE</span>
            </div>
            <p className="text-xs text-muted-foreground">Traitement maximal...</p>
          </div>
        )}
      </div>
    </div>
  );
}