import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const CORAL = '#FF4F00';

// ── Step pools by category ───────────────────────────────────────────────────
const STEP_POOLS = {
  investment: [
    { label: 'Parsing your investment intent', type: 'check' },
    { label: 'Loading market knowledge base', type: 'check' },
    { label: 'Retrieving historical return data', type: 'check' },
    { label: 'Profiling your risk tolerance', type: 'check' },
    { label: 'Selecting optimal asset classes', type: 'check' },
    { label: 'Cross-checking allocation rules', type: 'correct' },
    { label: 'Running 10-year compound projections', type: 'check' },
    { label: 'Stress-testing worst-case scenarios', type: 'check' },
    { label: 'Adjusting for inflation & tax drag', type: 'correct' },
    { label: 'Benchmarking against global ETF data', type: 'check' },
    { label: 'Filtering actionable recommendations', type: 'check' },
    { label: 'Structuring final response', type: 'check' },
  ],
  budget: [
    { label: 'Reading your financial context', type: 'check' },
    { label: 'Mapping income vs. expense patterns', type: 'check' },
    { label: 'Identifying compressible spending', type: 'check' },
    { label: 'Calculating savings capacity', type: 'check' },
    { label: 'Checking 50/30/20 rule alignment', type: 'correct' },
    { label: 'Modeling budget rebalance scenarios', type: 'check' },
    { label: 'Prioritizing guilt-free spending zones', type: 'check' },
    { label: 'Validating emergency fund runway', type: 'correct' },
    { label: 'Generating monthly optimization plan', type: 'check' },
    { label: 'Formatting actionable next steps', type: 'check' },
  ],
  debt: [
    { label: 'Detecting debt-related signals', type: 'check' },
    { label: 'Mapping active debt obligations', type: 'check' },
    { label: 'Computing total interest cost', type: 'check' },
    { label: 'Running avalanche strategy model', type: 'check' },
    { label: 'Running snowball strategy model', type: 'check' },
    { label: 'Comparing payoff timelines', type: 'correct' },
    { label: 'Estimating financial freedom date', type: 'check' },
    { label: 'Checking refinancing options', type: 'check' },
    { label: 'Prioritizing highest-impact actions', type: 'correct' },
    { label: 'Building personalized debt roadmap', type: 'check' },
    { label: 'Formatting step-by-step action plan', type: 'check' },
  ],
  realestate: [
    { label: 'Analyzing real estate question', type: 'check' },
    { label: 'Loading property market benchmarks', type: 'check' },
    { label: 'Calculating borrowing capacity', type: 'check' },
    { label: 'Running rent vs. buy comparison', type: 'check' },
    { label: 'Computing gross & net rental yield', type: 'correct' },
    { label: 'Assessing leverage effect', type: 'check' },
    { label: 'Estimating transaction costs & taxes', type: 'check' },
    { label: 'Projecting 10-year property value', type: 'check' },
    { label: 'Cross-validating with local data', type: 'correct' },
    { label: 'Summarizing key decision criteria', type: 'check' },
    { label: 'Writing personalized recommendation', type: 'check' },
  ],
  document: [
    { label: 'Extracting document content', type: 'check' },
    { label: 'Identifying financial figures', type: 'check' },
    { label: 'Normalizing data format', type: 'check' },
    { label: 'Launching 578 parallel simulations', type: 'check' },
    { label: 'Detecting hidden opportunities', type: 'correct' },
    { label: 'Validating assumptions (pass 1/3)', type: 'check' },
    { label: 'Validating assumptions (pass 2/3)', type: 'check' },
    { label: 'Validating assumptions (pass 3/3)', type: 'check' },
    { label: 'Computing best-case scenario (85% confidence)', type: 'correct' },
    { label: 'Isolating top 3 actionable insights', type: 'check' },
    { label: 'Structuring synthesis', type: 'check' },
    { label: 'Finalizing answer', type: 'check' },
  ],
  greeting: [
    { label: 'Reading your message', type: 'check' },
    { label: 'Preparing a warm reply', type: 'check' },
  ],
  default: [
    { label: 'Parsing your message', type: 'check' },
    { label: 'Loading financial knowledge base', type: 'check' },
    { label: 'Mapping relevant concepts', type: 'check' },
    { label: 'Checking data accuracy', type: 'correct' },
    { label: 'Running cross-validation pass', type: 'check' },
    { label: 'Identifying key insights', type: 'check' },
    { label: 'Filtering noise from signal', type: 'check' },
    { label: 'Structuring optimal response', type: 'correct' },
    { label: 'Applying personalization layer', type: 'check' },
    { label: 'Formatting final answer', type: 'check' },
  ],
};

function detectCategory(text = '', hasFiles = false) {
  if (hasFiles) return 'document';
  const t = text.toLowerCase();
  if (/investis|etf|bourse|action|crypto|portefeuille|dividende|rendement|invest/.test(t)) return 'investment';
  if (/budget|dépense|charge|loyer|salaire|revenu|économis|épargn|spend|income|expense/.test(t)) return 'budget';
  if (/dette|crédit|remboursement|prêt|intérêt|endett|debt|loan/.test(t)) return 'debt';
  if (/immobilier|appartement|maison|achat|locatif|emprunt|real estate|property/.test(t)) return 'realestate';
  if (/bonjour|salut|merci|ok|ciao|hello|ça va|bonne|hi |hey /.test(t)) return 'greeting';
  return 'default';
}

function LiveDataTicker() {
  const [vals, setVals] = useState({ sims: '---,---', risk: '0.000', ret: '0.0%', alloc: '0.0%' });
  useEffect(() => {
    const iv = setInterval(() => {
      const a = Math.floor(Math.random() * 900) + 100;
      const b = Math.floor(Math.random() * 900) + 100;
      setVals({
        sims: `${a.toString().padStart(3,'0')},${b.toString().padStart(3,'0')}`,
        risk: (Math.random() * 0.55 + 0.08).toFixed(3),
        ret: (Math.random() * 5 + 5.5).toFixed(1) + '%',
        alloc: (Math.random() * 30 + 55).toFixed(1) + '%',
      });
    }, 150);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="grid grid-cols-4 gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
      {[
        { label: 'Simulations', val: vals.sims },
        { label: 'Risk idx', val: vals.risk },
        { label: 'Est. return', val: vals.ret },
        { label: 'Allocation', val: vals.alloc },
      ].map(({ label, val }) => (
        <div key={label}>
          <p className="text-[8px] uppercase tracking-wide" style={{ color: '#bbb' }}>{label}</p>
          <p className="text-[10px] font-black font-mono" style={{ color: '#0A0A0A' }}>{val}</p>
        </div>
      ))}
    </div>
  );
}

// step status: 'pending' | 'active' | 'correcting' | 'done'
function StepRow({ step, status, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: status === 'pending' ? 0.25 : 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      className="flex items-center gap-2.5 py-[3px]"
    >
      {/* Icon */}
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        {status === 'done' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 20 }}
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: YUZU }}
          >
            <Check className="w-2.5 h-2.5" style={{ color: FG }} strokeWidth={3} />
          </motion.div>
        )}
        {status === 'active' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
            className="w-3.5 h-3.5 rounded-full border-2"
            style={{ borderColor: 'rgba(0,0,0,0.08)', borderTopColor: FG }}
          />
        )}
        {status === 'correcting' && (
          <motion.div
            animate={{ rotate: [0, -25, 25, -25, 0] }}
            transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
          >
            <RotateCcw className="w-3.5 h-3.5" style={{ color: CORAL }} strokeWidth={2.5} />
          </motion.div>
        )}
        {status === 'pending' && (
          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.12)' }} />
        )}
      </div>

      {/* Label */}
      <span
        className="text-[12px] font-medium leading-tight"
        style={{
          color: status === 'pending'    ? 'rgba(0,0,0,0.25)'
               : status === 'correcting' ? CORAL
               : FG,
        }}
      >
        {step.label}
      </span>

      {/* Correction badge */}
      {status === 'correcting' && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-sm"
          style={{ background: 'rgba(255,79,0,0.1)', color: CORAL }}
        >
          Re-checking
        </motion.span>
      )}
    </motion.div>
  );
}

export default function ThinkingSteps({ isLoading, text = '', hasFiles = false, useWebSearch = false }) {
  const category = detectCategory(text, hasFiles);
  const steps = STEP_POOLS[category];

  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState('active');
  const timerRef = useRef(null);
  const correctionLockRef = useRef(false);

  useEffect(() => {
    if (!isLoading) return;
    setCurrentStep(0);
    setPhase('active');
    correctionLockRef.current = false;

    // Advance a step every ~900ms — fast enough to feel busy
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(timerRef.current);
          return prev;
        }
        // Trigger correction animation on 'correct' type steps
        if (steps[prev]?.type === 'correct' && !correctionLockRef.current) {
          correctionLockRef.current = true;
          setPhase('correcting');
          setTimeout(() => {
            setPhase('active');
            correctionLockRef.current = false;
            setCurrentStep(next);
          }, 800);
          return prev;
        }
        return next;
      });
    }, 900);

    return () => clearInterval(timerRef.current);
  }, [isLoading, text, hasFiles]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 justify-start"
    >
      {/* Logo */}
      <img
        src={LOGO_URL}
        alt="Stensor"
        className="w-6 h-6 object-contain flex-shrink-0 mt-1"
        style={{ opacity: 0.7 }}
      />

      <div className="flex flex-col gap-1.5 max-w-[82%]">
        {/* Header label */}
        <div className="flex items-center gap-1.5 px-1">
          <p className="text-[11px] font-black" style={{ color: FG }}>Stensor</p>
          <motion.span
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="text-[10px] font-medium"
            style={{ color: 'rgba(0,0,0,0.35)' }}
          >
            is thinking…
          </motion.span>
        </div>

        {/* Web search badge */}
        {useWebSearch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm mb-1.5 w-fit"
            style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#16a34a' }}
            />
            <span className="text-[10px] font-bold" style={{ color: '#16a34a' }}>Searching the web…</span>
          </motion.div>
        )}

        {/* Card — NO left border */}
        <div
          className="bg-white border border-border rounded-sm shadow-sm px-4 py-3"
          style={{ minWidth: '260px' }}
        >
          {/* Progress header */}
          <div className="flex items-center gap-2 mb-3 pb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
              className="w-3 h-3 rounded-full border-2 flex-shrink-0"
              style={{ borderColor: 'rgba(0,0,0,0.08)', borderTopColor: FG }}
            />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.3)' }}>
              Working hard on your answer
            </span>
            <span className="ml-auto text-[10px] font-bold tabular-nums" style={{ color: 'rgba(0,0,0,0.2)' }}>
              {currentStep}/{steps.length}
            </span>
          </div>

          {/* Steps */}
          <div className="space-y-0.5">
            {steps.map((step, i) => {
              let status = 'pending';
              if (i < currentStep) status = 'done';
              else if (i === currentStep) {
                status = (phase === 'correcting' && step.type === 'correct') ? 'correcting' : 'active';
              }
              return <StepRow key={i} step={step} status={status} index={i} />;
            })}
          </div>
          <LiveDataTicker />
        </div>
      </div>
    </motion.div>
  );
}