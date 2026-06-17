import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const CORAL = '#FF4F00';

// ── 10 variants per step — random pick at runtime ────────────────────────────
const STEP_VARIANTS = {
  parsing: [
    'Parsing your request',
    'Reading your message',
    'Understanding your intent',
    'Analysing the request',
    'Decoding your query',
    'Processing your input',
    'Interpreting the prompt',
    'Scanning your message',
    'Breaking down the request',
    'Extracting key intent',
  ],
  loading_kb: [
    'Loading knowledge base',
    'Fetching relevant context',
    'Loading domain knowledge',
    'Pulling up related data',
    'Accessing knowledge store',
    'Retrieving context layers',
    'Hydrating context window',
    'Loading reference data',
    'Activating knowledge graph',
    'Connecting to knowledge base',
  ],
  mapping: [
    'Mapping relevant concepts',
    'Connecting the dots',
    'Building concept graph',
    'Linking key ideas',
    'Structuring the context',
    'Organizing key concepts',
    'Tracing concept paths',
    'Anchoring core ideas',
    'Building mental model',
    'Aligning concepts to query',
  ],
  checking: [
    'Checking data accuracy',
    'Verifying assumptions',
    'Running consistency check',
    'Cross-checking references',
    'Validating data points',
    'Auditing key facts',
    'Confirming data integrity',
    'Double-checking sources',
    'Applying accuracy filter',
    'Running fact-check pass',
  ],
  cross_validating: [
    'Running cross-validation pass',
    'Cross-referencing outputs',
    'Comparing approaches',
    'Stress-testing assumptions',
    'Validating via second pass',
    'Triangulating the answer',
    'Checking for blind spots',
    'Running sanity check',
    'Applying validation layer',
    'Re-checking edge cases',
  ],
  insights: [
    'Identifying key insights',
    'Extracting top signals',
    'Surfacing key patterns',
    'Finding critical points',
    'Distilling key findings',
    'Isolating high-value info',
    'Picking top 3 insights',
    'Highlighting what matters',
    'Extracting action signals',
    'Ranking key takeaways',
  ],
  filtering: [
    'Filtering noise from signal',
    'Removing irrelevant data',
    'Pruning low-quality paths',
    'Discarding weak signals',
    'Focusing on what matters',
    'Cutting through the noise',
    'Keeping only the essential',
    'Distilling signal vs noise',
    'Applying relevance filter',
    'Stripping filler content',
  ],
  structuring: [
    'Structuring optimal response',
    'Drafting response layout',
    'Organizing the answer',
    'Building response outline',
    'Designing response flow',
    'Arranging key sections',
    'Formatting the answer',
    'Composing response structure',
    'Setting up answer layers',
    'Creating response scaffold',
  ],
  personalizing: [
    'Applying personalization layer',
    'Tailoring to your context',
    'Adapting tone and depth',
    'Tuning for your profile',
    'Adding personal touches',
    'Calibrating to your needs',
    'Aligning with your goals',
    'Customizing the response',
    'Matching your context',
    'Adjusting for your case',
  ],
  finalizing: [
    'Formatting final answer',
    'Polishing the response',
    'Finalizing the output',
    'Preparing the answer',
    'Wrapping up the response',
    'Packaging the insights',
    'Delivering the final result',
    'Completing the response',
    'Assembling final output',
    'Sending your answer',
  ],
  // Correction-type steps (shown with RotateCcw icon)
  correcting: [
    'Re-checking assumptions',
    'Re-validating key steps',
    'Adjusting for edge cases',
    'Revisiting approach',
    'Correcting inconsistencies',
    'Patching the logic path',
    'Refining the model',
    'Applying correction pass',
    'Fixing detected issues',
    'Re-running validation',
  ],
};

// Pick a random variant from a pool
function pick(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Step definition: { type: keyof STEP_VARIANTS, isCorrection?: true } ──────
const STEP_SEQUENCE = [
  { key: 'parsing' },
  { key: 'loading_kb' },
  { key: 'mapping' },
  { key: 'checking', isCorrection: true },
  { key: 'cross_validating' },
  { key: 'insights' },
  { key: 'filtering' },
  { key: 'structuring', isCorrection: true },
  { key: 'personalizing' },
  { key: 'finalizing' },
];

// Build a randomized step list once per session
function buildSteps() {
  return STEP_SEQUENCE.map(s => ({
    label: pick(STEP_VARIANTS[s.isCorrection ? 'correcting' : s.key]),
    type: s.isCorrection ? 'correct' : 'check',
  }));
}

// ── StepRow ───────────────────────────────────────────────────────────────────
function StepRow({ step, status, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: status === 'pending' ? 0.25 : 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      className="flex items-center gap-2.5 py-[3px]"
    >
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

// ── Main component ────────────────────────────────────────────────────────────
export default function ThinkingSteps({ isLoading, text = '', hasFiles = false, useWebSearch = false }) {
  // Build randomized steps once per load — stable ref
  const stepsRef = useRef(null);
  if (!stepsRef.current) stepsRef.current = buildSteps();
  const steps = stepsRef.current;

  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState('active');
  const timerRef = useRef(null);
  const correctionLockRef = useRef(false);

  useEffect(() => {
    if (!isLoading) return;
    // Rebuild steps on each new load
    stepsRef.current = buildSteps();
    setCurrentStep(0);
    setPhase('active');
    correctionLockRef.current = false;

    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(timerRef.current);
          return prev;
        }
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
      <img
        src={LOGO_URL}
        alt="WOK"
        className="w-6 h-6 object-contain flex-shrink-0 mt-1"
        style={{ opacity: 0.7 }}
      />

      <div className="flex flex-col gap-1.5 max-w-[82%]">
        <div className="flex items-center gap-1.5 px-1">
          <p className="text-[11px] font-black" style={{ color: FG }}>WOK</p>
          <motion.span
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="text-[10px] font-medium"
            style={{ color: 'rgba(0,0,0,0.35)' }}
          >
            is thinking…
          </motion.span>
        </div>

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

        <div
          className="bg-white border border-border rounded-sm shadow-sm px-4 py-3"
          style={{ minWidth: '260px' }}
        >
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
        </div>
      </div>
    </motion.div>
  );
}