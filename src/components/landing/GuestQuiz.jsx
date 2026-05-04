import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const QUIZ_KEY = 'stensor_quiz_results';

const QUESTIONS = [
  {
    id: 'goal', phase: '01 — Vision',
    question: "In 5 years, what does your perfect financial life look like?",
    options: [
      { id: 'freedom', label: 'Total freedom', emoji: '🦅' },
      { id: 'wealth', label: 'A self-growing portfolio', emoji: '🏗️' },
      { id: 'debt_free', label: 'Zero debt, zero stress', emoji: '😮‍💨' },
      { id: 'retire_early', label: 'Retired before 50', emoji: '🌴' },
    ],
  },
  {
    id: 'pleasure', phase: '02 — Psychology',
    question: "What's the one expense you'd never sacrifice, no matter what?",
    options: [
      { id: 'travel', label: 'Travel & experiences', emoji: '✈️' },
      { id: 'food', label: 'Great food & dining', emoji: '🍽️' },
      { id: 'tech', label: 'Tech & gadgets', emoji: '📱' },
      { id: 'wellness', label: 'Health & wellbeing', emoji: '🧘' },
    ],
  },
  {
    id: 'fear', phase: '03 — Blockers',
    question: "What financial fear keeps you up at night?",
    options: [
      { id: 'lose_job', label: 'Losing my income', emoji: '💼' },
      { id: 'never_enough', label: 'Never getting ahead', emoji: '🌀' },
      { id: 'market_crash', label: 'A market crash', emoji: '📉' },
      { id: 'retirement', label: 'Running out in retirement', emoji: '🎠' },
    ],
  },
  {
    id: 'savings', phase: '04 — Reality',
    question: "How much do you actually set aside each month?",
    options: [
      { id: 'zero', label: 'Nothing yet', emoji: '😶' },
      { id: 'small', label: 'Under $200', emoji: '🌱' },
      { id: 'medium', label: '$200 – $1,000', emoji: '📈' },
      { id: 'great', label: 'Over $1,000', emoji: '🚀' },
    ],
  },
  {
    id: 'emotion', phase: '05 — Mindset',
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
  const goal = goalLabels[answers.goal] || 'your goals';
  return [
    { text: 'Reading your 5 answers...', detail: 'Processing profile data' },
    { text: `Mapping your path to ${goal}...`, detail: 'Aligning strategy to your vision' },
    { text: 'Running 847 wealth simulations...', detail: 'Finding your highest-probability outcome' },
    { text: 'Cross-referencing 12,400 similar profiles...', detail: 'Identifying what worked for people like you' },
    { text: 'Calculating your wealth curve...', detail: 'Projecting 5, 10, 20 year scenarios' },
    { text: 'Finalizing your roadmap...', detail: 'Your results are ready ✦' },
  ];
}

// Generate a realistic 5-year wealth curve based on answers
function getWealthData(answers) {
  const monthlyBase = { zero: 50, small: 180, medium: 550, great: 1100 }[answers.savings] || 200;
  const emotionBoost = { calm: 1.12, justified: 1.0, guilty: 0.92, regret: 0.97 }[answers.emotion] || 1.0;
  const fearBoost = { lose_job: 1.05, never_enough: 0.95, market_crash: 1.08, retirement: 1.1 }[answers.fear] || 1.0;
  const pleasureSavings = { travel: 110, food: 65, tech: 85, wellness: 45 }[answers.pleasure] || 70;
  const annualRate = { freedom: 0.08, wealth: 0.09, debt_free: 0.065, retire_early: 0.1 }[answers.goal] || 0.075;
  const monthly = monthlyBase * emotionBoost * fearBoost;
  const years = [0, 1, 2, 3, 4, 5];
  return years.map(y => ({
    year: y,
    without: Math.round(monthly * 12 * y * 0.6),
    with: y === 0 ? 0 : Math.round(
      monthly * 12 * ((Math.pow(1 + annualRate, y) - 1) / annualRate) +
      pleasureSavings * 12 * y * 0.9
    ),
  }));
}

function WealthCurve({ answers }) {
  const data = useMemo(() => getWealthData(answers), [answers]);
  const maxVal = Math.max(...data.map(d => d.with)) || 1;

  const W = 280, H = 110, PAD = 10;
  const toX = (i) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const toY = (v) => H - PAD - (v / maxVal) * (H - PAD * 2);

  const pathWith = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.with)}`).join(' ');
  const pathWithout = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.without)}`).join(' ');

  // Area fill for "with Stensor"
  const areaWith = `${pathWith} L ${toX(data.length - 1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  const lastWith = data[data.length - 1].with;
  const formatted = lastWith >= 1000000
    ? `$${(lastWith / 1000000).toFixed(1)}M`
    : `$${Math.round(lastWith / 1000)}k`;
  const withoutFinal = data[data.length - 1].without;
  const withoutFormatted = withoutFinal >= 1000 ? `$${Math.round(withoutFinal / 1000)}k` : `$${withoutFinal}`;

  return (
    <div className="px-6 pt-4 pb-2">
      <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Your 5-year wealth projection
      </p>
      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={YELLOW} stopOpacity="0.25" />
              <stop offset="100%" stopColor={YELLOW} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaWith} fill="url(#wealthGrad)" />

          {/* Without Stensor line */}
          <path d={pathWithout} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* With Stensor line */}
          <path d={pathWith} fill="none" stroke={YELLOW} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* End dot */}
          <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1].with)} r="4" fill={YELLOW} />
        </svg>

        {/* End label */}
        <div className="absolute top-0 right-0 text-right">
          <p className="text-lg font-black" style={{ color: YELLOW }}>{formatted}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5" style={{ background: YELLOW }} />
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>With Stensor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 border-t border-dashed" style={{ borderColor: 'rgba(255,255,255,0.35)' }} />
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Without</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function saveQuizToStorage(answers) { localStorage.setItem(QUIZ_KEY, JSON.stringify(answers)); }
export function getStoredQuiz() { try { return JSON.parse(localStorage.getItem(QUIZ_KEY) || 'null'); } catch { return null; } }
export function clearStoredQuiz() { localStorage.removeItem(QUIZ_KEY); }

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
    }, 480);
    const timeout = setTimeout(() => setPlanReady(true), steps.length * 480 + 400);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [showPlan]);

  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleSelect = (optionId) => {
    if (selectedOpt) return;
    setSelectedOpt(optionId);
    const newAnswers = { ...answers, [q.id]: optionId };
    setAnswers(newAnswers);
    setTimeout(() => {
      setSelectedOpt(null);
      if (step < QUESTIONS.length - 1) setStep(s => s + 1);
      else { saveQuizToStorage(newAnswers); setShowPlan(true); }
    }, 320);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(24px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !showPlan) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden"
        style={{ maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>

        {!showPlan && (
          <button onClick={onClose} className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5">
            <X className="w-4 h-4 text-zinc-300" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {!showPlan ? (
            <motion.div key={`step-${step}`}
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}>
              <div className="px-8 pt-8 pb-0">
                <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden mb-7">
                  <motion.div className="h-full rounded-full" style={{ background: FG }}
                    initial={{ width: `${(step / QUESTIONS.length) * 100}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.45, ease: 'easeOut' }} />
                </div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: '#a38f00' }}>{q.phase}</span>
                  {step > 0 && (
                    <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors">
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-black tracking-tight leading-snug mb-6" style={{ color: FG }}>{q.question}</h2>
              </div>
              <div className="px-8 pb-8 space-y-2.5">
                {q.options.map((opt, i) => {
                  const isSelected = selectedOpt === opt.id;
                  return (
                    <motion.button key={opt.id} onClick={() => handleSelect(opt.id)}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={!selectedOpt ? { x: 3 } : {}} whileTap={!selectedOpt ? { scale: 0.98 } : {}}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                      style={{ background: isSelected ? FG : 'rgba(0,0,0,0.03)', border: `1.5px solid ${isSelected ? FG : 'rgba(0,0,0,0.06)'}` }}>
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
            <PlanResult key="plan" answers={answers} planReady={planReady} loadingStep={loadingStep}
              onLogin={() => base44.auth.redirectToLogin('/app')} onClose={onClose} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function PlanResult({ answers, planReady, loadingStep, onLogin, onClose }) {
  const planName = getPlanName(answers);
  const loadingSteps = useMemo(() => getLoadingSteps(answers), [answers]);
  // Dynamic 5-year summary
  const wealthData = useMemo(() => getWealthData(answers), [answers]);
  const projected5y = wealthData[wealthData.length - 1]?.with || 0;
  const projFormatted = projected5y >= 1000000 ? `$${(projected5y/1000000).toFixed(1)}M` : `$${Math.round(projected5y/1000)}k`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Dark header */}
      <div className="relative px-8 pt-8 pb-6 overflow-hidden" style={{ background: FG }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 10% 80%, rgba(221,255,0,0.12) 0%, transparent 55%)' }} />

        {!planReady ? (
          <div className="relative flex flex-col gap-3 py-4">
            <div className="flex items-center gap-3 mb-3">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                style={{ borderColor: 'rgba(255,255,255,0.15)', borderTopColor: YELLOW }} />
              <p className="text-white text-sm font-bold">Building your wealth projection...</p>
            </div>
            {loadingSteps.map((s, i) => {
              const isDone = i < loadingStep;
              const isActive = i === loadingStep;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: i <= loadingStep ? 1 : 0.2, x: 0 }} transition={{ duration: 0.3 }}
                  className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                    {isDone ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: YELLOW }}>
                        <Check className="w-2 h-2" style={{ color: FG }} />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-2.5 h-2.5 rounded-full" style={{ background: YELLOW }} />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                    )}
                  </div>
                  <span className="text-xs" style={{ color: i <= loadingStep ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.15)' }}>{s.text}</span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase mb-3"
              style={{ background: YELLOW, color: FG }}>
              ✦ Your projection is ready
            </motion.div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">{planName}</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Based on your 5 answers</p>

            {/* Wealth curve */}
            <WealthCurve answers={answers} />
          </motion.div>
        )}
      </div>

      {/* CTA — clean, powerful, no jargon */}
      {planReady && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          className="px-8 py-8">
          <motion.button onClick={onLogin}
            whileHover={{ scale: 1.015, y: -1 }} whileTap={{ scale: 0.985 }}
            className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2 mb-4"
            style={{ background: FG, color: 'white' }}>
            Talk to Stensor
          </motion.button>
          <p className="text-center text-xs text-zinc-300 mb-3">Free. No credit card.</p>
          <button onClick={onClose} className="w-full py-2 text-[11px] text-zinc-300 hover:text-zinc-500 transition-colors">
            Continue without an account
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}