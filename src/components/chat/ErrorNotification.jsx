import { X, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ErrorNotification({ error, onFix, onDismiss }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="mx-3 mb-2 rounded-xl border border-red-500/20 bg-red-500/10 overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400 font-medium truncate">{error}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
              <button
                onClick={onFix}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Wrench className="w-3 h-3" />
                Auto-fix
              </button>
              <button onClick={onDismiss} className="p-1 rounded-md text-red-400/60 hover:text-red-300 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}