import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function SynthesisProposal({ content, onLaunch, onSkip, disabled }) {
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
      <div className="flex flex-col gap-2.5 max-w-[82%]">
        <p className="text-[10px] font-semibold px-1 text-muted-foreground">Stensor</p>

        {/* Message + action inline */}
        <div
          className="px-4 py-3.5 rounded-sm border border-border shadow-sm bg-white"
          style={{ borderLeft: `3px solid ${YUZU}` }}
        >
          <p className="text-sm leading-relaxed text-fg mb-3">{content}</p>

          {/* Buttons row */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onSkip}
              disabled={disabled}
              className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-fg hover:bg-muted rounded-md transition-all disabled:opacity-40"
            >
              Quick answer
            </button>
            <button
              onClick={onLaunch}
              disabled={disabled}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-md transition-all disabled:opacity-40 hover:opacity-90"
              style={{ background: FG, color: YUZU }}
            >
              <Sparkles className="w-3 h-3" />
              Launch Synthesis
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}