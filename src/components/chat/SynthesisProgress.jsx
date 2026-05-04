import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

// status: 'pending' | 'active' | 'done'
function StepRow({ step, status, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: status === 'pending' ? 0.3 : 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center gap-2.5 py-1"
    >
      {/* Status indicator */}
      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {status === 'done' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: YUZU }}
          >
            <Check className="w-2.5 h-2.5" style={{ color: FG }} />
          </motion.div>
        )}
        {status === 'active' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            className="w-3.5 h-3.5 rounded-full border-2"
            style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: FG }}
          />
        )}
        {status === 'pending' && (
          <div className="w-2 h-2 rounded-full bg-muted" />
        )}
      </div>

      {/* Step label */}
      <span className="text-xs font-medium" style={{ color: status === 'active' ? FG : status === 'done' ? FG : 'rgba(0,0,0,0.35)' }}>
        {step.label}
      </span>

      {/* Parameter badge if validated */}
      {status === 'done' && step.param && (
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-sm"
          style={{ background: 'rgba(221,255,0,0.15)', color: '#666' }}
        >
          {step.param}
        </motion.span>
      )}
    </motion.div>
  );
}

export default function SynthesisProgress({ steps, currentStep, done }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 justify-start"
    >
      <img
        src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png"
        alt="Stensor"
        className="w-6 h-6 object-contain opacity-60 flex-shrink-0 mt-1"
      />
      <div className="flex flex-col gap-1.5 max-w-[82%]">
        <p className="text-[10px] font-semibold px-1 text-muted-foreground">
          {done ? 'Stensor' : 'Stensor · Deep Synthesis'}
        </p>
        <div
          className="bg-white border border-border rounded-sm shadow-sm px-4 py-3.5"
          style={{ borderLeft: `3px solid ${FG}` }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            {!done ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
                  style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: FG }}
                />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.35)' }}>
                  Analysing
                </span>
              </>
            ) : (
              <>
                <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: YUZU }}>
                  <Check className="w-2 h-2" style={{ color: FG }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.35)' }}>
                  Synthesis complete
                </span>
              </>
            )}
          </div>

          {/* Steps */}
          <div className="space-y-0.5">
            {steps.map((step, i) => {
              let status = 'pending';
              if (i < currentStep) status = 'done';
              else if (i === currentStep) status = 'active';
              return <StepRow key={i} step={step} status={status} index={i} />;
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}