import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Sparkles, Lock, TrendingUp, Shield, Zap, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const QUIZ_KEY = 'stensor_quiz_results';

const QUESTIONS = [
  {
    id: 'goal',
    phase: '01 — Vision',
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
    phase: '02 — Psychology',
    question: "What's the one expense you'd never sacrifice, no matter what?",
    options: [
      { id: 'travel', label: 'Travel & experiences', emoji: '✈️' },
      { id: 'food', label: 'Great food & dining', emoji: '🍽️' },
      { id: 'tech', label: 'Tech & gadgets', emoji: '📱' },
      { id: 'wellness', label: 'Health & wellbeing', emoji: '🧘' },
    ],
  },
  {
    id: 'fear',
    phase: '03 — Blockers',
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
    phase: '04 — Reality',
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
    phase: '05 — Mindset',
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

const LOADING_STEPS = [
  'Analyzing your financial profile...',
  'Mapping your risk tolerance...',
  'Calibrating wealth timeline...',
  'Identifying your key blockers...',
  'Building your custom roadmap...',
];

function getInsight(answers) {
  const map = {
    'pleasure_travel': "Your love for experiences is a strength — the right strategy funds adventures and builds wealth simultaneously.",
    'pleasure_tech': "Your tech instinct can become a financial edge — channeling it into smart ETF positioning changes everything.",
    'fear_lose_job': "A 6-month emergency fund is your highest-leverage first move — before any investment.",
    'fear_never_enough': "The 'never enough' cycle breaks with one rule: pay your future self first, automatically.",
    'emotion_guilty': "Guilt after spending signals a missing 'guilt-free' budget — a strategy that gives you permission to enjoy.",
    'emotion_calm': "Your emotional control around money is rare. You're ready for aggressive compounding most people can't handle.",
    'savings_zero': "Starting at $50/month rewires everything. Automation matters more than the amount.",
    'savings_great': "At $1,000+/month, tax optimization becomes your #1 leverage — most people miss this completely.",
    'fear_market_crash': "Volatility becomes your ally with the right allocation — the crash-proof strategy is simpler than you think.",
  };
  const keys = [
    `pleasure_${answers.pleasure}`,
    `fear_${answers.fear}`,
    `emotion_${answers.emotion}`,
    `savings_${answers.savings}`,
  ];
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

export default function GuestQuiz({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showPlan, setShowPlan] = useState(false);
  const [planReady, setPlanReady] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!showPlan) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < LOADING_STEPS.length) setLoadingStep(i);
      else clearInterval(interval);
    }, 350);
    const timeout = setTimeout(() => setPlanReady(true), LOADING_STEPS.length * 350 + 400);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [showPlan]);

  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleSelect = (optionId) => {
    const newAnswers = { ...answers, [q.id]: optionId };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (step < QUESTIONS.length - 1) {
        setStep(s => s + 1);
      } else {
        saveQuizToStorage(newAnswers);
        setShowPlan(true);
      }
    }, 160);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(24px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden"
        style={{ maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
      >
        {!showPlan && (
          <button onClick={onClose} className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5">
            <X className="w-4 h-4 text-zinc-300" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {!showPlan ? (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="px-8 pt-8 pb-0">
                <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden mb-7">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: FG }}
                    initial={{ width: `${((step) / QUESTIONS.length) * 100}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  />
                </div>

                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: '#a38f00' }}>
                    {q.phase}
                  </span>
                  {step > 0 && (
                    <button onClick={handleBack} className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors">
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                  )}
                </div>

                <h2 className="text-xl font-black tracking-tight leading-snug mb-6" style={{ color: FG }}>
                  {q.question}
                </h2>
              </div>

              <div className="px-8 pb-8 space-y-2.5">
                {q.options.map((opt, i) => (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                    style={{
                      background: 'rgba(0,0,0,0.03)',
                      border: '1.5px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                    <span className="text-sm font-bold" style={{ color: FG }}>{opt.label}</span>
                  </motion.button>
                ))}
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

  const features = [
    { icon: Target, text: 'Custom investment strategy for your exact profile' },
    { icon: TrendingUp, text: '10-year wealth simulation with your numbers' },
    { icon: Shield, text: 'Personalized emergency fund protocol' },
    { icon: Zap, text: 'Tax optimization moves most people miss' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Dark header */}
      <div className="relative px-8 pt-8 pb-7 overflow-hidden" style={{ background: FG }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 10% 80%, rgba(221,255,0,0.1) 0%, transparent 55%)'
        }} />

        {!planReady ? (
          <div className="relative flex flex-col gap-3 py-4">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                style={{ borderColor: 'rgba(255,255,255,0.15)', borderTopColor: YELLOW }}
              />
              <p className="text-white text-sm font-bold">Crafting your plan...</p>
            </div>
            {LOADING_STEPS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: i <= loadingStep ? 1 : 0.2, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2.5"
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  animate={{ background: i <= loadingStep ? YELLOW : 'rgba(255,255,255,0.15)' }}
                  transition={{ duration: 0.3 }}
                />
                <span className="text-xs" style={{ color: i <= loadingStep ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}>{s}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase mb-3"
              style={{ background: YELLOW, color: FG }}
            >
              ✦ Your plan is ready
            </motion.div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">{planName}</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Tailored to your 5 answers — no one else has this exact plan</p>
          </motion.div>
        )}
      </div>

      {planReady && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
          {/* Insight */}
          <div className="px-8 py-5 border-b border-zinc-100">
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">💡</span>
              <p className="text-sm leading-relaxed text-zinc-600">{insight}</p>
            </div>
          </div>

          {/* Locked features */}
          <div className="px-8 py-5">
            <p className="text-[9px] font-black tracking-[0.2em] uppercase text-zinc-300 mb-3">Included in your plan</p>
            <div className="space-y-2">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.025)' }}
                >
                  <f.icon className="w-3.5 h-3.5 flex-shrink-0 text-zinc-300" />
                  <span className="text-xs font-medium text-zinc-500 flex-1">{f.text}</span>
                  <Lock className="w-3 h-3 text-zinc-200" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="px-8 pb-8">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-black" style={{ color: FG }}>Save your plan — it's free</span>
                <span className="px-1.5 py-0.5 text-[8px] font-black rounded" style={{ background: YELLOW, color: FG }}>FREE</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Without an account, this plan disappears in <span className="font-bold text-red-500">24 hours</span>. Your results are 100% private and tied only to your account.
              </p>
              <motion.button
                onClick={onLogin}
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                style={{ background: FG, color: 'white' }}
              >
                <Sparkles className="w-4 h-4" style={{ color: YELLOW }} />
                Create my account and activate my plan
              </motion.button>
              <button onClick={onClose} className="w-full mt-3 py-1.5 text-[11px] text-zinc-300 hover:text-zinc-500 transition-colors">
                Continue without saving
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}