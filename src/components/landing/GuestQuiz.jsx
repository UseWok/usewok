import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Sparkles, Lock, TrendingUp, Shield, Zap, Target, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const QUIZ_KEY = 'stensor_quiz_results';

const QUESTIONS = [
  {
    id: 'goal',
    phase: '01',
    question: "In 5 years, what does your ideal financial life look like?",
    options: [
      { id: 'freedom', label: 'Complete freedom — work only when I choose' },
      { id: 'wealth', label: 'A self-growing portfolio that outlives me' },
      { id: 'debt_free', label: 'Zero obligations — owning everything I have' },
      { id: 'retire_early', label: 'Retired before 50, doing what I love' },
      { id: 'income', label: 'Multiple income streams running while I sleep' },
    ],
  },
  {
    id: 'pleasure',
    phase: '02',
    question: "What's the one expense you'd never cut, no matter what?",
    options: [
      { id: 'travel', label: 'Travel — the world is too big to stay home' },
      { id: 'food', label: 'Great food and dining experiences' },
      { id: 'tech', label: 'The latest tech and tools' },
      { id: 'fashion', label: 'Style and personal expression' },
      { id: 'wellness', label: 'Health, fitness, and wellbeing' },
      { id: 'entertainment', label: 'Culture, shows, and live experiences' },
    ],
  },
  {
    id: 'fear',
    phase: '03',
    question: "What financial scenario keeps you up at night?",
    options: [
      { id: 'lose_job', label: 'Losing my income with no safety net' },
      { id: 'never_enough', label: 'Working forever and never getting ahead' },
      { id: 'market_crash', label: 'A market crash erasing my savings' },
      { id: 'retirement', label: 'Running out of money in retirement' },
      { id: 'inflation', label: 'Inflation quietly destroying my purchasing power' },
    ],
  },
  {
    id: 'savings',
    phase: '04',
    question: "How much do you actually set aside each month, right now?",
    options: [
      { id: 'zero', label: 'Nothing yet — I\'m starting from scratch' },
      { id: 'small', label: 'Under $200 when I can' },
      { id: 'medium', label: '$200 to $800 consistently' },
      { id: 'good', label: '$800 to $2,000 with discipline' },
      { id: 'great', label: 'Over $2,000 — ready to accelerate' },
    ],
  },
  {
    id: 'emotion',
    phase: '05',
    question: "Honestly — how do you feel right after an impulse purchase?",
    options: [
      { id: 'guilty', label: 'Guilty and a bit ashamed' },
      { id: 'justified', label: 'I earned it — no regrets' },
      { id: 'excited', label: 'Excited, but it fades fast' },
      { id: 'regret', label: 'Immediate regret, every time' },
      { id: 'calm', label: 'Completely calm — I planned for it' },
    ],
  },
];

const PLAN_NAMES = {
  freedom: 'The Freedom Blueprint',
  wealth: 'The Wealth Compounding Plan',
  debt_free: 'The Zero Debt Protocol',
  retire_early: 'The FIRE Acceleration Plan',
  income: 'The Passive Income Engine',
};

function getPlanName(answers) {
  return PLAN_NAMES[answers.goal] || 'Your Personal Stensor Plan';
}

function getInsight(answers) {
  const map = {
    'pleasure_travel': "Your appetite for experiences is actually a strength — the right strategy funds both your adventures and your future.",
    'pleasure_tech': "Your tech instinct can become a financial edge — channeling it into smart ETF positioning changes everything.",
    'fear_lose_job': "A 6-month emergency fund is your highest-leverage first move — before any investment.",
    'fear_never_enough': "The 'never enough' cycle breaks with one rule: pay your future self first, automatically, before anything else.",
    'emotion_guilty': "Guilt after spending signals a missing 'guilt-free' budget envelope — a strategy that gives you permission.",
    'emotion_calm': "Your emotional control around money is rare. You're ready for aggressive compounding strategies most people can't handle.",
    'savings_zero': "Starting at $50/month rewires everything. Automation matters more than the amount.",
    'savings_great': "At $2,000+/month, tax optimization becomes your #1 leverage point — most people miss this completely.",
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const q = QUESTIONS[step];
  const progress = (step / QUESTIONS.length) * 100;
  const filledProgress = ((step + 1) / QUESTIONS.length) * 100;

  const handleSelect = (optionId) => {
    const newAnswers = { ...answers, [q.id]: optionId };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (step < QUESTIONS.length - 1) {
        setStep(s => s + 1);
      } else {
        saveQuizToStorage(newAnswers);
        setShowPlan(true);
        setTimeout(() => setPlanReady(true), 1600);
      }
    }, 180);
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
        <button onClick={onClose} className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5">
          <X className="w-4 h-4 text-zinc-300" />
        </button>

        <AnimatePresence mode="wait">
          {!showPlan ? (
            <QuizStep
              key={`step-${step}`}
              q={q}
              step={step}
              total={QUESTIONS.length}
              progress={filledProgress}
              prevProgress={progress}
              selected={answers[q.id]}
              onSelect={handleSelect}
              onBack={handleBack}
            />
          ) : (
            <PlanResult
              key="plan"
              answers={answers}
              planReady={planReady}
              onLogin={() => base44.auth.redirectToLogin('/app')}
              onClose={onClose}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function QuizStep({ q, step, total, progress, prevProgress, selected, onSelect, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-0">
        {/* Progress bar */}
        <div className="w-full h-0.5 bg-zinc-100 rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full rounded-full"
            style={{ background: FG }}
            initial={{ width: `${prevProgress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-black tracking-[0.25em] text-zinc-300">{q.phase} / 0{total}</span>
          {step > 0 && (
            <button onClick={onBack} className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          )}
        </div>

        <h2 className="text-xl font-black tracking-tight leading-snug mb-7" style={{ color: FG }}>
          {q.question}
        </h2>
      </div>

      {/* Options */}
      <div className="px-8 pb-8 space-y-2">
        {q.options.map((opt, i) => {
          const isActive = selected === opt.id;
          return (
            <motion.button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-left transition-all"
              style={{
                background: isActive ? FG : 'rgba(0,0,0,0.03)',
                border: `1.5px solid ${isActive ? FG : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              <span className="text-sm font-semibold" style={{ color: isActive ? 'white' : FG }}>
                {opt.label}
              </span>
              <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: isActive ? YELLOW : 'rgba(0,0,0,0.2)' }} />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function PlanResult({ answers, planReady, onLogin, onClose }) {
  const planName = getPlanName(answers);
  const insight = getInsight(answers);

  const features = [
    { icon: Target, text: 'Custom investment strategy for your profile' },
    { icon: TrendingUp, text: '10-year wealth simulation with real numbers' },
    { icon: Shield, text: 'Personalized emergency fund protocol' },
    { icon: Zap, text: 'Tax optimization moves most people miss' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Dark header */}
      <div className="relative px-8 pt-8 pb-7 overflow-hidden" style={{ background: FG }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 10% 80%, rgba(221,255,0,0.08) 0%, transparent 55%)'
        }} />

        {!planReady ? (
          <div className="relative flex flex-col items-center py-6 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2"
              style={{ borderColor: 'rgba(255,255,255,0.15)', borderTopColor: 'white' }}
            />
            <p className="text-white text-sm font-semibold">Building your plan...</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase mb-3"
              style={{ background: YELLOW, color: FG }}
            >
              Your Plan
            </motion.div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">{planName}</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Based on your 5 answers</p>
          </motion.div>
        )}
      </div>

      {planReady && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}>
          {/* Insight */}
          <div className="px-8 py-6 border-b border-zinc-100">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: YELLOW === '#DDFF00' ? '#a38f00' : '#a38f00' }} />
              <p className="text-sm leading-relaxed text-zinc-600">{insight}</p>
            </div>
          </div>

          {/* Locked features */}
          <div className="px-8 py-5">
            <p className="text-[9px] font-black tracking-[0.2em] uppercase text-zinc-300 mb-3">Unlocked with your account</p>
            <div className="space-y-2">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
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
                Without an account, this plan disappears in <span className="font-bold text-red-500">24 hours</span>. Your results are stored privately on your account.
              </p>
              <motion.button
                onClick={onLogin}
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                style={{ background: FG, color: 'white' }}
              >
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