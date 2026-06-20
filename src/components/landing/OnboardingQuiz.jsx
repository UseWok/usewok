import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.22)';

// ── Real AI logos ──
const ChatGPTLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.897zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.681zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
);

const GeminiLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
  </svg>
);

const PerplexityLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Animated gradient border wrapper
function GlowBorder({ children, active = false, color = '#5A5AF0', style = {} }) {
  return (
    <div style={{ position: 'relative', borderRadius: 14, ...style }}>
      {active && (
        <div style={{
          position: 'absolute', inset: -1.5, borderRadius: 15, zIndex: 0,
          background: `linear-gradient(135deg, ${color}, #7C6AF4, ${color})`,
          backgroundSize: '200% 200%',
          animation: 'gradShift 2s linear infinite',
          opacity: 0.8,
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, borderRadius: 13 }}>
        {children}
      </div>
      <style>{`@keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
    </div>
  );
}

// ── Plans
const PLANS = [
  {
    id: 'starter', name: 'Starter', price: '49€', period: '/mo',
    color: '#5A5AF0', highlight: false,
    features: ['Monthly AI audit', '3 tracked keywords', 'PDF report', 'Email support'],
  },
  {
    id: 'pro', name: 'Pro', price: '99€', period: '/mo',
    color: '#22c55e', highlight: true, badge: 'Most popular',
    features: ['Weekly AI audit', '15 tracked keywords', 'Real-time dashboard', 'AI recommendations', 'Priority support'],
  },
  {
    id: 'elite', name: 'Elite', price: '249€', period: '/mo',
    color: '#f59e0b', highlight: false,
    features: ['Daily AI audit', 'Unlimited keywords', 'Reputation management', 'Dedicated AI agent', '1:1 onboarding'],
  },
];

// ── Confetti
function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 56 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.4 + Math.random() * 1.4,
      color: ['#5A5AF0','#22c55e','#f59e0b','#ef4444','#F0F0EE','#7C6AF4','#60a5fa'][Math.floor(Math.random() * 7)],
      size: 4 + Math.random() * 7,
      rotate: Math.random() * 360,
    }))
  );
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div key={p.id}
          initial={{ x: `${p.x}vw`, y: '-10px', opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: p.rotate + 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
          style={{
            position: 'absolute', top: 0,
            width: p.size, height: p.size, background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

// ── Result screen
function ResultScreen({ answers, onSignup }) {
  const [showPlans, setShowPlans] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setShowConfetti(false), 3500);
    const t2 = setTimeout(() => setShowPlans(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const aiSources = [
    { name: 'ChatGPT', logo: <ChatGPTLogo size={16} />, bg: '#10A37F' },
    { name: 'Perplexity', logo: <PerplexityLogo size={16} />, bg: '#20808D' },
    { name: 'Google AI', logo: <GeminiLogo size={16} />, bg: '#4285F4' },
  ];

  const docs = [
    { icon: '📊', label: 'AI Visibility Report', color: '#5A5AF0' },
    { icon: '🗺️', label: 'Optimisation Roadmap', color: '#22c55e' },
    { icon: '⚡', label: '12 Priority Actions', color: '#f59e0b' },
    { icon: '🎯', label: 'Content Strategy', color: '#ef4444' },
    { icon: '📍', label: 'Local SEO Blueprint', color: '#7C6AF4' },
    { icon: '📈', label: 'Competitive Analysis', color: '#E87C3E' },
  ];

  return (
    <div style={{ fontFamily: F, maxWidth: 600, margin: '0 auto', padding: '20px 24px 80px' }}>
      {showConfetti && <Confetti />}

      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: 36 }}>
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 12 }}
          style={{ fontSize: 72, lineHeight: 1, marginBottom: 20 }}>🚀</motion.div>
        <h2 style={{ fontSize: 34, fontWeight: 300, color: T1, margin: '0 0 10px', letterSpacing: '-0.04em' }}>
          Your plan is <strong style={{ fontWeight: 700 }}>ready.</strong>
        </h2>
        <p style={{ fontSize: 15, color: T2, margin: 0, lineHeight: 1.65 }}>
          {answers.business_name ? `${answers.business_name} —` : ''} Your personalized AI strategy has been generated.
        </p>
      </motion.div>

      {/* AI sources */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ display: 'flex', gap: 8, marginBottom: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
        {aiSources.map((s, i) => (
          <motion.div key={s.name}
            initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.09, type: 'spring' }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: s.bg + '1A', border: `1px solid ${s.bg}50`,
              borderRadius: 20, padding: '6px 14px',
            }}>
            {s.logo}
            <span style={{ fontSize: 12, fontWeight: 600, color: T1 }}>{s.name}</span>
            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>✓</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Documents */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 11, color: T3, textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600, marginBottom: 14 }}>
          Generated documents
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {docs.map((doc, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.5 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: doc.color + '0E', border: `1px solid ${doc.color}28`,
                borderRadius: 10, padding: '12px 14px',
              }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{doc.icon}</span>
              <span style={{ fontSize: 12, color: T1, fontWeight: 500, lineHeight: 1.4 }}>{doc.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Plans */}
      <AnimatePresence>
        {showPlans && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <p style={{ fontSize: 13, color: T2, textAlign: 'center', marginBottom: 18 }}>
              Choose your access to unlock all documents
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {PLANS.map((plan, i) => (
                <motion.div key={plan.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}>
                  <GlowBorder active={plan.highlight} color={plan.color}>
                    <button onClick={onSignup} style={{
                      width: '100%', textAlign: 'left',
                      background: plan.highlight ? `${plan.color}10` : '#111113',
                      border: plan.highlight ? 'none' : `1px solid rgba(255,255,255,0.09)`,
                      borderRadius: 13, padding: '16px 18px',
                      cursor: 'pointer', fontFamily: F, position: 'relative',
                    }}>
                      {plan.badge && (
                        <div style={{
                          position: 'absolute', top: -9, right: 14,
                          background: plan.color, borderRadius: 20, padding: '2px 10px',
                          fontSize: 10, fontWeight: 700, color: '#0A0A0B',
                        }}>{plan.badge}</div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 6 }}>{plan.name}</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {plan.features.map((f, fi) => (
                              <span key={fi} style={{ fontSize: 11, color: T2 }}>· {f}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                          <div style={{ fontSize: 22, fontWeight: 700, color: plan.color, letterSpacing: '-0.03em' }}>{plan.price}</div>
                          <div style={{ fontSize: 11, color: T3 }}>{plan.period}</div>
                        </div>
                      </div>
                    </button>
                  </GlowBorder>
                </motion.div>
              ))}
            </div>
            <button onClick={onSignup} style={{
              width: '100%', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '13px', cursor: 'pointer',
              fontFamily: F, fontSize: 14, fontWeight: 500, color: T2,
              transition: 'all 150ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = T2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              Start for free →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Trades
const TRADES = [
  { id: 'coiffeur', label: 'Hair / Beauty', icon: '✂️' },
  { id: 'restaurant', label: 'Restaurant / Café', icon: '🍽️' },
  { id: 'sport', label: 'Sport / Wellness', icon: '💪' },
  { id: 'coach', label: 'Coach / Trainer', icon: '🎯' },
  { id: 'artisan', label: 'Artisan / Tradesperson', icon: '🔧' },
  { id: 'autre', label: 'Other business', icon: '🏪' },
];

// ── Q2: Digital marketing experience
const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Just starting out', desc: 'I barely have a website', icon: '🌱' },
  { id: 'intermediate', label: 'Practitioner', desc: 'I run some ads / social', icon: '📈' },
  { id: 'expert', label: 'Advanced Marketer', desc: 'SEO, CRO, funnels — I know the game', icon: '🚀' },
];

// ── Q3: Marketing objectives
const OBJECTIVES = [
  { id: 'leads', label: 'Lead Generation', icon: '🎯' },
  { id: 'awareness', label: 'Brand Awareness', icon: '📣' },
  { id: 'conversion', label: 'Conversion Rate', icon: '💰' },
  { id: 'loyalty', label: 'Customer Loyalty', icon: '❤️' },
  { id: 'reviews', label: 'Online Reviews', icon: '⭐' },
  { id: 'local', label: 'Local Visibility', icon: '📍' },
];

// ── Staggered choice grid animation
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.35 } },
};

// ── MAIN QUIZ — 3 focused questions
export default function OnboardingQuiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ trade: '', experience: '', objectives: [], business_name: '' });

  const set = (key, val) => setAnswers(p => ({ ...p, [key]: val }));

  const handleTradeSelect = (id) => {
    set('trade', id);
    setTimeout(() => setStep(1), 320);
  };

  const handleExperience = (id) => {
    set('experience', id);
    setTimeout(() => setStep(2), 320);
  };

  const toggleObjective = (id) => {
    setAnswers(p => {
      const cur = p.objectives;
      return { ...p, objectives: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] };
    });
  };

  const handleFinish = async () => {
    base44.entities.ContactLead.create({
      first_name: answers.business_name,
      role: answers.trade,
      status: 'new',
      message: `exp:${answers.experience} obj:${answers.objectives.join(',')}`,
    }).catch(() => {});
    setStep(3);
  };

  const onSignup = () => base44.auth.redirectToLogin('/app');

  if (step === 3) return <ResultScreen answers={answers} onSignup={onSignup} />;

  const STEPS = ['Your business', 'Your experience', 'Your goals'];

  return (
    <div style={{ fontFamily: F, maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 52 }}>
        {STEPS.map((label, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: i === step ? 32 : 8, height: 8, borderRadius: 4,
              background: i < step ? '#22c55e' : i === step ? '#5A5AF0' : 'rgba(255,255,255,0.1)',
              transition: 'all 350ms cubic-bezier(0.22,1,0.36,1)',
            }} />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 0: Trade */}
        {step === 0 && (
          <motion.div key="trade"
            initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, color: T1, margin: '0 0 6px', letterSpacing: '-0.04em' }}>
              What is your <strong style={{ fontWeight: 700 }}>business?</strong>
            </h2>
            <p style={{ fontSize: 15, color: T2, margin: '0 0 28px' }}>We'll tailor your AI visibility plan.</p>
            <motion.div variants={containerVariants} initial="hidden" animate="show"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TRADES.map(t => (
                <motion.button key={t.id} variants={itemVariants}
                  onClick={() => handleTradeSelect(t.id)}
                  style={{
                    background: answers.trade === t.id ? 'rgba(90,90,240,0.14)' : '#111113',
                    border: `1.5px solid ${answers.trade === t.id ? 'rgba(90,90,240,0.6)' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: 12, padding: '18px 14px',
                    cursor: 'pointer', fontFamily: F, textAlign: 'left', transition: 'all 150ms',
                  }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(90,90,240,0.4)' }}
                  whileTap={{ scale: 0.97 }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{t.label}</div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── Step 1: Digital marketing experience */}
        {step === 1 && (
          <motion.div key="experience"
            initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, color: T1, margin: '0 0 6px', letterSpacing: '-0.04em' }}>
              Your <strong style={{ fontWeight: 700 }}>digital marketing</strong> level?
            </h2>
            <p style={{ fontSize: 15, color: T2, margin: '0 0 28px' }}>This shapes how we pitch your AI plan.</p>
            <motion.div variants={containerVariants} initial="hidden" animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {EXPERIENCE_LEVELS.map(lvl => (
                <motion.button key={lvl.id} variants={itemVariants}
                  onClick={() => handleExperience(lvl.id)}
                  style={{
                    background: answers.experience === lvl.id ? 'rgba(90,90,240,0.12)' : '#111113',
                    border: `1.5px solid ${answers.experience === lvl.id ? 'rgba(90,90,240,0.55)' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: 12, padding: '16px 18px',
                    cursor: 'pointer', fontFamily: F, textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 14, transition: 'all 150ms',
                  }}
                  whileHover={{ scale: 1.01, borderColor: 'rgba(90,90,240,0.35)' }}
                  whileTap={{ scale: 0.98 }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{lvl.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>{lvl.label}</div>
                    <div style={{ fontSize: 12, color: T2, marginTop: 3 }}>{lvl.desc}</div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── Step 2: Marketing objectives (multi-select) */}
        {step === 2 && (
          <motion.div key="objectives"
            initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, color: T1, margin: '0 0 6px', letterSpacing: '-0.04em' }}>
              Your main <strong style={{ fontWeight: 700 }}>objectives?</strong>
            </h2>
            <p style={{ fontSize: 15, color: T2, margin: '0 0 28px' }}>Select all that apply.</p>
            <motion.div variants={containerVariants} initial="hidden" animate="show"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {OBJECTIVES.map(obj => {
                const sel = answers.objectives.includes(obj.id);
                return (
                  <motion.button key={obj.id} variants={itemVariants}
                    onClick={() => toggleObjective(obj.id)}
                    style={{
                      background: sel ? 'rgba(90,90,240,0.13)' : '#111113',
                      border: `1.5px solid ${sel ? 'rgba(90,90,240,0.55)' : 'rgba(255,255,255,0.09)'}`,
                      borderRadius: 12, padding: '14px 14px',
                      cursor: 'pointer', fontFamily: F, textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 10, transition: 'all 150ms',
                    }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{obj.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{obj.label}</div>
                    </div>
                    {sel && (
                      <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: '#5A5AF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
            <motion.button
              onClick={handleFinish}
              disabled={answers.objectives.length === 0}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', padding: '15px',
                background: answers.objectives.length > 0 ? T1 : 'rgba(255,255,255,0.1)',
                border: 'none', borderRadius: 10, cursor: answers.objectives.length > 0 ? 'pointer' : 'default',
                fontFamily: F, fontSize: 15, fontWeight: 700, color: '#0A0A0B',
                transition: 'all 200ms',
              }}>
              Generate my plan →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}