import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const BORDER = 'rgba(255,255,255,0.09)';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.25)';
const CORAL = '#F95738';

// ── Questions du quiz ──────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'tech_level',
    emoji: '🛠️',
    question: 'Comment vous décririez-vous ?',
    subtitle: 'On adapte les corrections à votre niveau — zéro jargon si besoin.',
    options: [
      { value: 'no_code', label: 'Je gère seul(e)', sub: 'Wix, Squarespace, Wordpress sans code', icon: '🙋' },
      { value: 'ai_nocode', label: 'J\'utilise des IA', sub: 'ChatGPT, Claude, Cursor pour m\'aider', icon: '🤖' },
      { value: 'claude_code', label: 'Je code avec l\'IA', sub: 'Claude Code, Cursor, Copilot en autonomie', icon: '⚡' },
      { value: 'developer', label: 'Développeur', sub: 'Je code moi-même ou j\'ai une équipe tech', icon: '👨‍💻' },
    ],
  },
  {
    id: 'business_size',
    emoji: '📊',
    question: 'Votre situation actuelle ?',
    subtitle: 'Pour calibrer les priorités selon votre contexte.',
    options: [
      { value: 'solo', label: 'Solo / Freelance', sub: 'Je suis seul(e) à décider', icon: '🧑' },
      { value: 'small', label: 'Petite équipe', sub: '2 à 10 personnes', icon: '👥' },
      { value: 'medium', label: 'PME / Scale-up', sub: '10 à 100 personnes', icon: '🏢' },
      { value: 'enterprise', label: 'Grande structure', sub: '+100 personnes', icon: '🏛️' },
    ],
  },
  {
    id: 'main_goal',
    emoji: '🎯',
    question: 'Votre objectif numéro 1 ?',
    subtitle: 'On priorise les corrections qui ont le plus d\'impact sur votre but.',
    options: [
      { value: 'more_clients', label: 'Plus de clients', sub: 'Être recommandé par ChatGPT, Gemini…', icon: '💰' },
      { value: 'local_visibility', label: 'Visibilité locale', sub: 'Apparaître pour ma ville / zone', icon: '📍' },
      { value: 'brand_authority', label: 'Crédibilité / marque', sub: 'Être perçu comme expert du secteur', icon: '⭐' },
      { value: 'competitor_beat', label: 'Dépasser mes concurrents', sub: 'Les surpasser sur les IA', icon: '🏆' },
    ],
  },
];

export default function OnboardingQuizModal({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step) / QUESTIONS.length) * 100;

  const handleSelect = (value) => {
    setSelected(value);
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (isLast) {
        // Save to localStorage for fix generation (immediate use)
        localStorage.setItem('wok_user_profile', JSON.stringify(newAnswers));
        // Save to cloud if user already logged in
        import('@/api/base44Client').then(({ base44 }) => {
          base44.auth.me().then(u => {
            if (u) base44.auth.updateMe({ quiz_profile: JSON.stringify(newAnswers) }).catch(() => {});
          }).catch(() => {});
        });
        onComplete(newAnswers);
      } else {
        setStep(s => s + 1);
        setSelected(null);
      }
    }, 220);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
      fontFamily: F, padding: 16,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: '#111113', border: `1px solid ${BORDER}`,
          borderRadius: 20, width: '100%', maxWidth: 460,
          overflow: 'hidden',
        }}>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            animate={{ width: `${progress + (100 / QUESTIONS.length)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', background: CORAL, borderRadius: 2 }} />
        </div>

        <div style={{ padding: '28px 28px 24px' }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{q.emoji}</span>
                <span style={{ fontSize: 11, color: T3, fontWeight: 600 }}>
                  {step + 1} / {QUESTIONS.length}
                </span>
              </div>
              <button onClick={onSkip}
                style={{ fontSize: 11, color: T3, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, padding: '4px 8px' }}>
                Passer →
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: T1, margin: '0 0 6px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                  {q.question}
                </h2>
                <p style={{ fontSize: 13, color: T2, margin: 0, lineHeight: 1.5 }}>{q.subtitle}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Options */}
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, i) => {
                const isActive = selected === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 16px', textAlign: 'left',
                      background: isActive ? `${CORAL}18` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isActive ? `${CORAL}60` : BORDER}`,
                      borderRadius: 12, cursor: 'pointer', fontFamily: F,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? CORAL : T1, marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 11.5, color: T2 }}>{opt.sub}</div>
                    </div>
                    {isActive && (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}