import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.22)';

// ── AI logos réels
const ChatGPTLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.897zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.681zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
);

const GeminiLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
  </svg>
);

const PerplexityLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
    <path d="M8 9h8M8 12h8M8 15h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ── Métiers (6 max, simple, visuels)
const TRADES = [
  { id: 'coiffeur', label: 'Coiffeur / Institut', icon: '✂️' },
  { id: 'restaurant', label: 'Restaurant / Café', icon: '🍽️' },
  { id: 'sport', label: 'Sport / Bien-être', icon: '💪' },
  { id: 'coach', label: 'Coach / Formateur', icon: '🎯' },
  { id: 'artisan', label: 'Artisan / Technicien', icon: '🔧' },
  { id: 'autre', label: 'Autre commerce', icon: '🏪' },
];

// ── Plans
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '49€',
    period: '/mois',
    color: '#5A5AF0',
    features: ['Audit AI mensuel', '3 mots-clés suivis', 'Rapport PDF', 'Support email'],
    cta: 'Commencer',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '99€',
    period: '/mois',
    color: '#22c55e',
    badge: 'Populaire',
    features: ['Audit AI hebdomadaire', '15 mots-clés suivis', 'Dashboard temps réel', 'Recommandations IA', 'Support prioritaire'],
    cta: 'Choisir Pro',
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '249€',
    period: '/mois',
    color: '#f59e0b',
    features: ['Audit AI quotidien', 'Mots-clés illimités', 'Gestion de réputation', 'Agent IA dédié', 'Onboarding 1:1'],
    cta: 'Choisir Elite',
  },
];

// ── Confetti dopaminergique
function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.2 + Math.random() * 1.2,
      color: ['#5A5AF0','#22c55e','#f59e0b','#ef4444','#F0F0EE','#7C6AF4'][Math.floor(Math.random() * 6)],
      size: 4 + Math.random() * 6,
      rotate: Math.random() * 360,
    }))
  );
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: '-10px', opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: p.rotate + 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
          style={{
            position: 'absolute', top: 0,
            width: p.size, height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

// ── Écran de résultat avec dopamine + plans
function ResultScreen({ answers, onSignup }) {
  const [showPlans, setShowPlans] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    const t2 = setTimeout(() => setShowPlans(true), 1200);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const aiSources = [
    { name: 'ChatGPT', logo: <ChatGPTLogo />, bg: '#10A37F' },
    { name: 'Perplexity', logo: <PerplexityLogo />, bg: '#20808D' },
    { name: 'Google AI', logo: <GeminiLogo />, bg: '#4285F4' },
  ];

  const docs = [
    { icon: '📊', label: 'Rapport de visibilité AI', color: '#5A5AF0' },
    { icon: '🗺️', label: 'Roadmap d\'optimisation', color: '#22c55e' },
    { icon: '⚡', label: '12 actions prioritaires', color: '#f59e0b' },
    { icon: '🎯', label: 'Stratégie de contenu', color: '#ef4444' },
    { icon: '📍', label: 'Plan référencement local', color: '#7C6AF4' },
    { icon: '📈', label: 'Benchmark concurrentiel', color: '#E87C3E' },
  ];

  return (
    <div style={{ fontFamily: F, maxWidth: 560, margin: '0 auto', padding: '20px 24px 60px' }}>
      {showConfetti && <Confetti />}

      {/* Hero success */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ fontSize: 72, marginBottom: 20, lineHeight: 1 }}
        >
          🚀
        </motion.div>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: T1, margin: '0 0 10px', letterSpacing: '-0.04em' }}>
          Votre plan est prêt.
        </h2>
        <p style={{ fontSize: 16, color: T2, margin: 0, lineHeight: 1.6 }}>
          {answers.business_name ? `${answers.business_name}, votre` : 'Votre'} stratégie AI personnalisée est générée.
        </p>
      </motion.div>

      {/* AI sources validées */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ display: 'flex', gap: 10, marginBottom: 28, justifyContent: 'center' }}
      >
        {aiSources.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: s.bg + '18', border: `1px solid ${s.bg}40`,
              borderRadius: 20, padding: '7px 14px',
            }}
          >
            {s.logo}
            <span style={{ fontSize: 12, fontWeight: 600, color: T1 }}>{s.name}</span>
            <span style={{ fontSize: 11, color: '#22c55e' }}>✓</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Documents générés */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ marginBottom: 36 }}
      >
        <p style={{ fontSize: 12, color: T3, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 14 }}>
          Documents générés pour vous
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {docs.map((doc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.07 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: doc.color + '10', border: `1px solid ${doc.color}25`,
                borderRadius: 10, padding: '12px 14px',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{doc.icon}</span>
              <span style={{ fontSize: 12, color: T1, fontWeight: 500, lineHeight: 1.4 }}>{doc.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Plans */}
      <AnimatePresence>
        {showPlans && (
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p style={{ fontSize: 13, color: T2, textAlign: 'center', marginBottom: 20 }}>
              Choisissez votre accès pour débloquer tous vos documents
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {PLANS.map((plan, i) => (
                <motion.button
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={onSignup}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: plan.id === 'pro' ? `${plan.color}12` : '#111113',
                    border: `1.5px solid ${plan.id === 'pro' ? plan.color + '50' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: 12, padding: '16px 18px',
                    cursor: 'pointer', fontFamily: F,
                    position: 'relative',
                    transition: 'all 150ms',
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  {plan.badge && (
                    <div style={{
                      position: 'absolute', top: -9, right: 16,
                      background: plan.color, borderRadius: 20, padding: '2px 10px',
                      fontSize: 10, fontWeight: 700, color: '#0A0A0B',
                    }}>{plan.badge}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 6 }}>{plan.name}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {plan.features.map((f, fi) => (
                          <span key={fi} style={{ fontSize: 11, color: T2 }}>· {f}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: plan.color }}>{plan.price}</div>
                      <div style={{ fontSize: 11, color: T3 }}>{plan.period}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Free CTA */}
            <button
              onClick={onSignup}
              style={{
                width: '100%', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '14px', cursor: 'pointer',
                fontFamily: F, fontSize: 14, fontWeight: 500, color: T2,
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = T2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              Commencer gratuitement →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MAIN QUIZ — seulement 3 questions essentielles
export default function OnboardingQuiz({ onComplete }) {
  const [step, setStep] = useState(0); // 0=trade, 1=name, 2=result
  const [answers, setAnswers] = useState({ trade: '', business_name: '' });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setAnswers(p => ({ ...p, [key]: val }));

  const handleTradeSelect = (tradeId) => {
    set('trade', tradeId);
    setTimeout(() => setStep(1), 350);
  };

  const handleFinish = async () => {
    setLoading(true);
    // Save in background — non-blocking
    base44.entities.ContactLead.create({
      first_name: answers.business_name,
      role: answers.trade,
      status: 'new',
      message: 'Quiz onboarding',
    }).catch(() => {});
    await new Promise(r => setTimeout(r, 600));
    setStep(2);
    setLoading(false);
  };

  const onSignup = () => base44.auth.redirectToLogin('/app');

  if (step === 2) {
    return <ResultScreen answers={answers} onSignup={onSignup} />;
  }

  return (
    <div style={{ fontFamily: F, maxWidth: 520, margin: '0 auto', padding: '40px 24px' }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 48 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            width: i === step ? 24 : 6, height: 6, borderRadius: 3,
            background: i <= step ? '#5A5AF0' : 'rgba(255,255,255,0.1)',
            transition: 'all 300ms',
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="trade"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
          >
            <h2 style={{ fontSize: 26, fontWeight: 700, color: T1, margin: '0 0 8px', letterSpacing: '-0.03em' }}>
              Quel est votre métier ?
            </h2>
            <p style={{ fontSize: 15, color: T2, margin: '0 0 28px' }}>
              Pour personnaliser votre plan AI.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TRADES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTradeSelect(t.id)}
                  style={{
                    background: answers.trade === t.id ? 'rgba(90,90,240,0.14)' : '#111113',
                    border: `1.5px solid ${answers.trade === t.id ? 'rgba(90,90,240,0.6)' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: 12, padding: '18px 14px',
                    cursor: 'pointer', fontFamily: F, textAlign: 'left',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(90,90,240,0.4)'; }}
                  onMouseLeave={e => { if (answers.trade !== t.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{t.label}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
          >
            <h2 style={{ fontSize: 26, fontWeight: 700, color: T1, margin: '0 0 8px', letterSpacing: '-0.03em' }}>
              Quel est le nom de votre établissement ?
            </h2>
            <p style={{ fontSize: 15, color: T2, margin: '0 0 28px' }}>
              Pour personnaliser vos documents.
            </p>
            <input
              autoFocus
              value={answers.business_name}
              onChange={e => set('business_name', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && answers.business_name.trim() && handleFinish()}
              placeholder="ex: Salon Élise, Studio Forma..."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#111113', border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '16px 18px',
                fontSize: 16, color: T1, fontFamily: F, outline: 'none', caretColor: '#5A5AF0',
                marginBottom: 14,
              }}
            />
            <button
              onClick={handleFinish}
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: answers.business_name.trim() || loading ? T1 : 'rgba(255,255,255,0.1)',
                border: 'none', borderRadius: 10, cursor: answers.business_name.trim() ? 'pointer' : 'default',
                fontFamily: F, fontSize: 15, fontWeight: 700, color: '#0A0A0B',
                transition: 'all 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0A0A0B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Génération en cours...
                </>
              ) : 'Générer mon plan →'}
            </button>
            {/* Skip name */}
            <button onClick={handleFinish} style={{
              width: '100%', marginTop: 10, padding: '10px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: F, fontSize: 13, color: T3,
            }}>
              Passer cette étape
            </button>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}