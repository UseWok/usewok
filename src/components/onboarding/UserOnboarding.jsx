import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Zap, Bot, BarChart2, Award, MessageSquare, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_KEY = 'stensor_user_onboarding_v2';

export function shouldShowUserOnboarding() {
  try { return !localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
}
export function markUserOnboardingSeen() {
  try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
}

const SLIDE = {
  initial: { opacity: 0, x: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -24, filter: 'blur(6px)' },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

const STEPS = [
  {
    id: 'welcome',
    label: 'Welcome',
    visual: (
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 rounded-3xl bg-[#0A0A0A] flex items-center justify-center mb-5 shadow-lg">
          <span className="text-4xl">🧠</span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Investing', 'Budgeting', 'Debt', 'Side Income', 'FIRE'].map(tag => (
            <span key={tag} className="px-3 py-1 text-xs font-semibold bg-black/5 rounded-full text-zinc-600">{tag}</span>
          ))}
        </div>
      </div>
    ),
    title: 'Welcome to Stensor',
    body: 'Your AI financial coach built for real results. Ask anything, get personalized strategies — no fluff, no generic advice.',
  },
  {
    id: 'agents',
    label: 'Agents',
    visual: (
      <div className="space-y-2 mt-4">
        {[
          { emoji: '🧭', name: 'Big Picture', desc: 'Direction & financial clarity' },
          { emoji: '💚', name: 'Mindful Spending', desc: 'Spend without guilt' },
          { emoji: '🚀', name: 'Wealth Strategy', desc: 'Long-term freedom' },
        ].map((a, i) => (
          <motion.div key={a.name}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 px-4 py-3 bg-black/4 rounded-xl border border-black/6">
            <span className="text-xl">{a.emoji}</span>
            <div>
              <p className="text-sm font-bold text-[#0A0A0A]">{a.name}</p>
              <p className="text-xs text-zinc-400">{a.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    ),
    title: '3 Specialized AI Agents',
    body: 'Each agent is trained for a specific financial goal. Select the one that matches your current priority.',
  },
  {
    id: 'tensors',
    label: 'Tensors',
    visual: (
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Standard', cost: '1T', bg: '#f5f5f5', text: '#555' },
            { label: 'Avancé', cost: '2T', bg: '#DDFF00', text: '#0A0A0A' },
            { label: 'Expert', cost: '4T', bg: '#0A0A0A', text: 'white' },
          ].map((m, i) => (
            <motion.div key={m.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
              style={{ background: m.bg }}>
              <span className="text-base font-black" style={{ color: m.text }}>{m.cost}</span>
              <span className="text-[10px] font-semibold" style={{ color: m.text === 'white' ? 'rgba(255,255,255,0.6)' : '#888' }}>{m.label}</span>
            </motion.div>
          ))}
        </div>
        <div className="p-3 rounded-xl bg-black/4">
          <div className="flex justify-between text-xs font-semibold mb-2 text-[#0A0A0A]">
            <span>Monthly balance</span><span>8 / 10T</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-black/10">
            <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full rounded-full bg-[#0A0A0A]" />
          </div>
          <p className="text-[10px] mt-1.5 text-zinc-400">Resets monthly automatically</p>
        </div>
      </div>
    ),
    title: 'Tensors = Your AI Credits',
    body: 'Each message uses 1 to 8 Tensors depending on complexity. Your balance resets every month automatically.',
  },
  {
    id: 'features',
    label: 'Features',
    visual: (
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { icon: MessageSquare, label: 'Discussions', desc: 'All your saved chats', color: 'bg-blue-50', iconColor: 'text-blue-600' },
          { icon: BarChart2, label: 'Analytics', desc: 'Track your progress', color: 'bg-green-50', iconColor: 'text-green-600' },
          { icon: Award, label: 'Score', desc: 'Financial health', color: 'bg-purple-50', iconColor: 'text-purple-600' },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div key={f.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}
              className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-black/3 border border-black/6">
              <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${f.color}`}>
                <Icon className={`w-4 h-4 ${f.iconColor}`} />
              </div>
              <p className="text-xs font-bold text-[#0A0A0A]">{f.label}</p>
              <p className="text-[10px] text-zinc-400 leading-tight">{f.desc}</p>
            </motion.div>
          );
        })}
      </div>
    ),
    title: 'Built-in Insights',
    body: 'Your discussions are saved automatically. Access your Analytics and Stensor Score to track your financial health over time.',
  },
  {
    id: 'go',
    label: 'Start',
    visual: (
      <div className="flex flex-col items-center py-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-20 h-20 rounded-3xl bg-[#DDFF00] flex items-center justify-center mb-5 shadow-md">
          <Check className="w-10 h-10 text-[#0A0A0A]" strokeWidth={3} />
        </motion.div>
        <div className="space-y-2 w-full">
          {['How can I save $1000 faster?', 'Best ETF strategy for beginners?', 'How to get out of debt in 12 months?'].map((q, i) => (
            <motion.div key={q}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
              className="px-4 py-2.5 bg-black/4 rounded-xl border border-black/6 text-left">
              <p className="text-xs text-zinc-600">"{q}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    title: "You're all set!",
    body: 'Start your first conversation. Ask about investing, saving, debt — your AI coach is ready.',
  },
];

export default function UserOnboarding({ onClose }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const navigate = useNavigate();
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleClose = () => { markUserOnboardingSeen(); onClose(); };

  const next = () => { if (isLast) { handleClose(); } else { setDir(1); setStep(s => s + 1); } };
  const prev = () => { if (step > 0) { setDir(-1); setStep(s => s - 1); } };

  const slideVariants = {
    initial: (d) => ({ opacity: 0, x: d * 20, filter: 'blur(4px)' }),
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: (d) => ({ opacity: 0, x: d * -20, filter: 'blur(4px)' }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>

      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <motion.div key={s.id}
                animate={{ width: i === step ? 24 : 6, background: i === step ? '#0A0A0A' : i < step ? '#DDFF00' : 'rgba(0,0,0,0.12)' }}
                transition={{ duration: 0.3 }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/6 transition-colors">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={slideVariants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>

              {current.visual}

              <div className="mt-5">
                <h2 className="text-xl font-black text-[#0A0A0A] leading-tight">{current.title}</h2>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{current.body}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <button onClick={prev}
              className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-zinc-400 hover:text-fg hover:bg-black/5'}`}>
              Back
            </button>
            <div className="flex items-center gap-2">
              {isLast && (
                <button onClick={() => { handleClose(); navigate('/chat'); }}
                  className="px-4 py-2.5 text-sm font-bold text-zinc-500 rounded-xl hover:bg-black/5 transition-colors">
                  Start chatting
                </button>
              )}
              <motion.button onClick={next}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-black text-white rounded-xl transition-all duration-200 hover:opacity-90"
                style={{ background: '#0A0A0A' }}>
                {isLast ? "Let's go!" : 'Next'}
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}