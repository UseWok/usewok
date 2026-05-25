import { AlertTriangle, X, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ErrorNotification({ error, onFix, onDismiss }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mx-3 mb-3 rounded-xl border border-red-500/20 bg-[#1a0a0a] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-red-500/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-[13px] font-semibold text-red-300">Runtime error detected</span>
            </div>
            <button onClick={onDismiss} className="p-1 rounded-md text-red-400/50 hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Error body */}
          <div className="px-4 py-3">
            <div className="bg-[#0f0505] border border-red-900/40 rounded-lg px-3 py-2.5 font-mono text-[11px] text-red-300/80 leading-relaxed max-h-24 overflow-y-auto mb-3">
              {error}
            </div>
            <p className="text-[12px] text-white/40 mb-3 leading-relaxed">
              An exception occurred in the generated interface. Would you like the AI to attempt an automatic fix?
            </p>
            <div className="flex gap-2">
              <button
                onClick={onFix}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[12px] font-bold rounded-lg transition-colors"
              >
                <Wrench className="w-3.5 h-3.5" />
                Fix automatically
              </button>
              <button
                onClick={onDismiss}
                className="px-4 py-2 text-[12px] font-medium text-white/40 hover:text-white/70 rounded-lg transition-colors"
              >
                Ignore
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}