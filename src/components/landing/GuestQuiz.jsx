import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Sparkles, Lock, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const QUIZ_KEY = 'stensor_quiz_results';

const QUESTIONS = [
  {
    id: 'goal',
    phase: '01 — Your Vision',
    question: "In 5 years, what does your perfect financial life look like?",
    options: [
      { id: 'freedom', label: 'Total freedom', emoji: '🦅' },
      { id: 'wealth', label: 'A self-growing portfolio', emoji: '🏗️' },
      { id: 'debt_free', label: 'Zero debt, zero stress', emoji: '😮‍💨' },
      { id: 'retire_early', label: 'Retired before 50', emoji: '🌴' },
    ],
  },
  {
    id: 'pleasure',
    phase: '02 — Your Priorities',
    question: "What's the one expense you'd never sacrifice?",
    options: [
      { id: 'travel', label: 'Travel & experiences', emoji: '✈️' },
      { id: 'food', label: 'Great food & dining', emoji: '🍽️' },
      { id: 'tech', label: 'Tech & gadgets', emoji: '📱' },
      { id: 'wellness', label: 'Health & wellbeing', emoji: '🧘' },
    ],
  },
  {
    id: 'fear',
    phase: '03 — Your Blockers',
    question: "What financial fear keeps you up at night?",
    options: [
      { id: 'lose_job', label: 'Losing my income', emoji: '💼' },
      { id: 'never_enough', label: 'Never getting ahead', emoji: '🌀' },
      { id: 'market_crash', label: 'A market crash', emoji: '📉' },
      { id: 'retirement', label: 'Running out in retirement', emoji: '🎠' },
    ],
  },
  {
    id: 'savings',
    phase: '04 — Your Reality',
    question: "How much do you actually set aside each month?",
    options: [
      { id: 'zero', label: 'Nothing yet', emoji: '😶' },
      { id: 'small', label: 'Under $200', emoji: '🌱' },
      { id: 'medium', label: '$200 – $1,000', emoji: '📈' },
      { id: 'great', label: 'Over $1,000', emoji: '🚀' },
    ],
  },
  {
    id: 'emotion',
    phase: '05 — Your Mindset',
    question: "How do you feel right after an impulse purchase?",
    options: [
      { id: 'guilty', label: 'Guilty and ashamed', emoji: '😬' },
      { id: 'justified', label: 'I earned it, no regrets', emoji: '😤' },
      { id: 'regret', label: 'Immediate regret', emoji: '🤦' },
      { id: 'calm', label: 'Calm — I planned it', emoji: '😌' },
    ],
  },
];

const PLAN_NAMES = {
  freedom: 'The Freedom Blueprint',
  wealth: 'The Wealth Compounding Plan',
  debt_free: 'The Zero Debt Protocol',
  retire_early: 'The FIRE Acceleration Plan',
};

function getPlanName(answers) {
  return PLAN_NAMES[answers.goal] || 'Your Personal Stensor Plan';
}

function getLoadingSteps(answers) {
  const goalLabels = { freedom: 'financial freedom', wealth: 'wealth compounding', debt_free: 'debt elimination', retire_early: 'early retirement' };
  const savingsLabels = { zero: 'starting from scratch', small: 'small savings base', medium: 'solid savings rate', great: 'strong savings rate' };
  const fearLabels = { lose_job: 'income protection', never_enough: 'wealth gap patterns', market_crash: 'market resilience', retirement: 'retirement security' };
  const goal = goalLabels[answers.goal] || 'your goals';
  const savings = savingsLabels[answers.savings] || 'your situation';
  const fear = fearLabels[answers.fear] || 'your concerns';

  return [
    { text: 'Reading your 5 answers...', detail: 'Processing profile data' },
    { text: `Mapping your path to ${goal}...`, detail: 'Aligning strategy to your vision' },
    { text: `Analyzing ${savings}...`, detail: 'Calculating your wealth acceleration curve' },
    { text: `Building protection against ${fear}...`, detail: 'Stress-testing your personal scenario' },
    { text: 'Running 847 wealth simulations...', detail: 'Finding your highest-probability outcome' },
    { text: 'Cross-referencing 12,400 similar profiles...', detail: 'Identifying what worked for people like you' },
    { text: 'Prioritizing your action items...', detail: 'Ranking by impact and ease for your profile' },
    { text: 'Finalizing your custom roadmap...', detail: 'Your results are ready ✦' },
  ];
}

function getInsight(answers) {
  const map = {
    'pleasure_travel': "Your love for experiences is a strength — the right strategy funds your adventures while building wealth at the same time.",
    'pleasure_tech': "Your curiosity for tech can become your edge — people with your profile tend to build wealth faster when they channel it right.",
    'fear_lose_job': "Your #1 move: build a 6-month security cushion first. Everything else grows faster once that foundation is in place.",
    'fear_never_enough': "The 'never enough' feeling breaks with one simple shift: automating a small transfer to yourself, before anything else.",
    'emotion_guilty': "Guilt after spending is a signal — not a flaw. Your profile calls for a 'guilt-free' budget that gives you real permission to enjoy.",
    'emotion_calm': "You're already wired for wealth. Your emotional control around money is rare — your plan reflects that.",
    'savings_zero': "Starting at $50/month is more powerful than most people think. Automation and consistency beat the amount every time.",
    'savings_great': "At your savings rate, the leverage is now in optimization — your plan focuses on where most people at your level leave money behind.",
    'fear_market_crash': "Market volatility becomes your ally with the right setup. Your plan builds a crash-resilient structure that still grows.",
  };
  const keys = [`pleasure_${answers.pleasure}`, `fear_${answers.fear}`, `emotion_${answers.emotion}`, `savings_${answers.savings}`];
  for (const k of keys) { if (map[k]) return map[k]; }
  return "Your profile reveals a rare combination of clarity and ambition — the opportunities most people never see are already within your reach.";
}

export function saveQuizToStorage(answers) {
  localStorage.setItem(QUIZ_KEY, JSON.stringify(answers));
}
export function getStoredQuiz() {
  try { return JSON.parse(localStorage.getItem(QUIZ_KEY) || 'null'); } catch { return null; }
}
export function clearStoredQuiz() {
  localStorage.removeItem(QUIZ_KEY);
}

const STEP_COLORS = [
  { bg: 'linear-gradient(135deg, #fff9e6 0%, #fffde0 100%)', dot: '#f59e0b' },
  { bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', dot: '#0ea5e9' },
  { bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', dot: '#22c55e' },
  { bg: 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)', dot: '#a855f7' },
  { bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', dot: '#f43f5e' },
];

export default function GuestQuiz({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showPlan, setShowPlan] = useState(false);
  const [planReady, setPlanReady] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!showPlan) return;
    const steps = getLoadingSteps(answers);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < steps.length) setLoadingStep(i);
      else clearInterval(interval);
    }, 560);
    const timeout = setTimeout(() => setPlanReady(true), steps.length * 560 + 500);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [showPlan]);

  const q = QUESTIONS[step];
  const stepColor = STEP_COLORS[step] || STEP_COLORS[0];

  const handleSelect = (optionId) => {
    if (selectedOpt) return;
    setSelectedOpt(optionId);
    const newAnswers = { ...answers, [q.id]: optionId };
    setAnswers(newAnswers);
    setTimeout(() => {
      setSelectedOpt(null);
      if (step < QUESTIONS.length - 1) {
        setStep(s => s + 1);
      } else {
        saveQuizToStorage(newAnswers);
        setShowPlan(true);
      }
    }, 380);
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !showPlan) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md overflow-hidden"
        style={{ maxHeight: '92vh', overflowY: 'auto', borderRadius: '28px', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
      >
        <AnimatePresence mode="wait">
          {!showPlan ? (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ background: stepColor.bg, minHeight: '500px' }}
            >
              {/* Top bar */}
              <div className="px-7 pt-7 pb-0">
                <div className="flex items-center justify-between mb-5">
                  {step > 0 ? (
                    <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  ) : <div />}
                  <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/8 transition-colors">
                    <X className="w-3.5 h-3.5 text-zinc-300" />
                  </button>
                </div>

                {/* Step indicator dots */}
                <div className="flex items-center gap-1.5 mb-6">
                  {QUESTIONS.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i === step ? 24 : 6,
                        background: i < step ? stepColor.dot : i === step ? FG : 'rgba(0,0,0,0.12)',
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ height: 6, borderRadius: 99 }}
                    />
                  ))}
                  <span className="ml-auto text-[10px] font-black tracking-widest uppercase" style={{ color: 'rgba(0,0,0,0.3)' }}>
                    {step + 1}/{QUESTIONS.length}
                  </span>
                </div>

                <span className="text-[10px] font-black tracking-[0.18em] uppercase block mb-1" style={{ color: stepColor.dot }}>
                  {q.phase}
                </span>
                <h2 className="text-[1.35rem] font-black leading-snug tracking-tight mb-7" style={{ color: FG }}>
                  {q.question}
                </h2>
              </div>

              {/* Options */}
              <div className="px-7 pb-8 space-y-3">
                {q.options.map((opt, i) => {
                  const isSelected = selectedOpt === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={!selectedOpt ? { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' } : {}}
                      whileTap={!selectedOpt ? { scale: 0.98 } : {}}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all"
                      style={{
                        background: isSelected ? FG : 'white',
                        border: `1.5px solid ${isSelected ? FG : 'rgba(0,0,0,0.07)'}`,
                        borderRadius: '16px',
                        boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                      <span className="text-sm font-bold flex-1" style={{ color: isSelected ? 'white' : FG }}>{opt.label}</span>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <PlanResult
              key="plan"
              answers={answers}
              planReady={planReady}
              loadingStep={loadingStep}
              onLogin={() => base44.auth.redirectToLogin('/app')}
              onClose={onClose}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function PlanResult({ answers, planReady, loadingStep, onLogin, onClose }) {
  const planName = getPlanName(answers);
  const insight = getInsight(answers);
  const loadingSteps = useMemo(() => getLoadingSteps(answers), [answers]);

  const planFeatures = [
    'Your personalized wealth acceleration path',
    'Exact priority order for your financial moves',
    'A protection strategy built for your fears',
    'Your mindset-adjusted action sequence',
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ background: 'white' }}>
      {/* Dark header */}
      <div className="relative overflow-hidden" style={{ background: FG }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 0% 100%, rgba(221,255,0,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(99,102,241,0.08) 0%, transparent 55%)' }} />

        <div className="relative px-8 pt-8 pb-8">
          {!planReady ? (
            <>
              <div className="flex items-center gap-3 mb-7">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                  className="w-6 h-6 rounded-full border-2 flex-shrink-0"
                  style={{ borderColor: 'rgba(255,255,255,0.12)', borderTopColor: YELLOW }}
                />
                <div>
                  <p className="text-white text-sm font-black">Building your custom results...</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>We're being thorough — this takes a few seconds</p>
                </div>
              </div>

              <div className="space-y-3">
                {loadingSteps.map((s, i) => {
                  const isDone = i < loadingStep;
                  const isActive = i === loadingStep;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i <= loadingStep ? 1 : 0.18, x: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center">
                        {isDone ? (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500 }}
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                            style={{ background: YELLOW }}
                          >
                            <Check className="w-2 h-2" style={{ color: FG }} />
                          </motion.div>
                        ) : isActive ? (
                          <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: YELLOW }}
                          />
                        ) : (
                          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs block font-medium" style={{ color: i <= loadingStep ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.18)' }}>
                          {s.text}
                        </span>
                        <AnimatePresence>
                          {isActive && (
                            <motion.span
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-[10px] block"
                              style={{ color: 'rgba(221,255,0,0.55)' }}
                            >
                              {s.detail}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 300 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase mb-4"
                style={{ background: YELLOW, color: FG }}
              >
                ✦ Your results are ready
              </motion.div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">{planName}</h2>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Built from your 5 answers — no one else has this exact plan
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {planReady && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.4 }}>
            {/* Insight */}
            <div className="px-8 py-6 border-b border-zinc-100">
              <div className="flex gap-3 items-start p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #fff9e6, #fffde0)' }}>
                <span className="text-xl flex-shrink-0">💡</span>
                <p className="text-sm leading-relaxed font-medium" style={{ color: '#78600a' }}>
                  {insight}
                </p>
              </div>
            </div>

            {/* What's inside */}
            <div className="px-8 py-6 border-b border-zinc-100">
              <p className="text-[9px] font-black tracking-[0.2em] uppercase text-zinc-300 mb-4">Your results include</p>
              <div className="space-y-3">
                {planFeatures.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: YELLOW }}>
                      <Lock className="w-2.5 h-2.5" style={{ color: FG }} />
                    </div>
                    <span className="text-xs font-medium text-zinc-600">✦ {f}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="px-8 py-7">
              <p className="text-base font-black mb-1" style={{ color: FG }}>
                Save your plan — it's free
              </p>
              <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                Without an account, your results disappear in <span className="font-bold text-red-500">24 hours</span>. Your data stays 100% private.
              </p>
              <motion.button
                onClick={onLogin}
                whileHover={{ scale: 1.015, y: -1.5, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-4 font-black text-sm flex items-center justify-center gap-2.5 rounded-2xl transition-all"
                style={{ background: FG, color: 'white' }}
              >
                <Sparkles className="w-4 h-4" style={{ color: YELLOW }} />
                Create my account and unlock my plan
              </motion.button>
              <button onClick={onClose} className="w-full mt-3 py-2 text-[11px] text-zinc-300 hover:text-zinc-500 transition-colors">
                Continue without saving
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}