import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MessageSquare, FileText, Globe, X, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_KEY = 'stensor_tensors_onboarding_seen';

const STEPS = [
  {
    icon: Zap,
    title: 'What is a Tensor?',
    body: 'A Tensor is your AI credit — each time you send a message, Stensor uses 1 to 8 Tensors depending on the complexity of your question and the AI mode you choose.',
    visual: (
      <div className="flex items-center gap-3 mt-4 justify-center">
        {[1, 2, 3].map(n => (
          <div key={n} className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded flex items-center justify-center font-black text-sm"
              style={{ background: n === 1 ? '#DDFF00' : n === 2 ? '#0A0A0A' : '#f5f5f5', color: n === 2 ? 'white' : '#0A0A0A' }}>
              {n === 1 ? '1T' : n === 2 ? '4T' : '8T'}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: '#888' }}>
              {n === 1 ? 'Standard' : n === 2 ? 'Advanced' : 'Expert'}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: MessageSquare,
    title: 'Your Tensors Reset Monthly',
    body: 'Every month, your Tensor balance is refreshed automatically. Free plan includes 10 Tensors — enough to explore. Paid plans start at 100T/month.',
    visual: (
      <div className="mt-4 p-3 rounded" style={{ background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: '#0A0A0A' }}>
          <span>Monthly Tensors</span><span>8 / 10 used</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: '80%', background: '#0A0A0A' }} />
        </div>
        <p className="text-[10px] mt-1.5" style={{ color: '#aaa' }}>Resets in 12 days</p>
      </div>
    ),
  },
  {
    icon: Globe,
    title: 'More Tensors = More Power',
    body: 'Unlock Advanced AI models, internet search, and file uploads by upgrading. Every plan multiplies your financial coaching capacity.',
    visual: (
      <div className="mt-4 space-y-2">
        {[
          { plan: 'Free', tensors: '10T', color: '#f5f5f5', textColor: '#555' },
          { plan: 'Essential', tensors: '100T', color: '#DDFF00', textColor: '#0A0A0A' },
          { plan: 'Advanced', tensors: '300T', color: '#0A0A0A', textColor: 'white' },
        ].map(p => (
          <div key={p.plan} className="flex items-center justify-between px-3 py-2 rounded text-xs font-semibold"
            style={{ background: p.color, color: p.textColor }}>
            <span>{p.plan}</span><span>{p.tensors}/month</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function shouldShowTensorsOnboarding() {
  try { return !localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
}

export function markTensorsOnboardingSeen() {
  try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
}

export default function TensorsOnboarding({ onClose }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const handleClose = () => {
    markTensorsOnboardingSeen();
    onClose();
  };

  const handleNext = () => {
    if (isLast) { handleClose(); }
    else setStep(s => s + 1);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[600] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <motion.div
          initial={{ scale: 0.94, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 20 }}
          className="w-full max-w-sm bg-white overflow-hidden"
          style={{ borderRadius: '8px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#DDFF00', borderRadius: '4px' }}>
                <Icon className="w-4 h-4" style={{ color: '#0A0A0A' }} />
              </div>
              <p className="text-sm font-black" style={{ color: '#0A0A0A' }}>{current.title}</p>
            </div>
            <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '4px' }}>
              <X className="w-4 h-4" style={{ color: '#aaa' }} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed" style={{ color: '#444' }}>{current.body}</p>
            {current.visual}
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-between px-5 pb-5 pt-2">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div key={i} className="transition-all"
                  style={{ width: i === step ? '16px' : '6px', height: '6px', background: i === step ? '#0A0A0A' : 'rgba(0,0,0,0.15)', borderRadius: '3px' }} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {isLast && (
                <button onClick={() => { handleClose(); navigate('/pricing'); }}
                  className="text-xs font-semibold px-3 py-1.5 transition-colors"
                  style={{ color: '#888', borderRadius: '4px' }}>
                  See plans
                </button>
              )}
              <button onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-black transition-all"
                style={{ background: '#0A0A0A', color: 'white', borderRadius: '4px' }}>
                {isLast ? "Let's go" : 'Next'}
                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}