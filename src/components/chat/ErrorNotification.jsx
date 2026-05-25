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
          className="mx-3 mb-3 rounded-xl border border-border bg-card overflow-hidden shadow-md"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-[12px] font-semibold text-foreground tracking-wide">Interface exception</span>
            </div>
            <button onClick={onDismiss} className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-4 py-3">
            <div className="bg-muted border border-border rounded-lg px-3 py-2.5 font-mono text-[11px] text-muted-foreground leading-relaxed max-h-16 overflow-y-auto mb-3 select-all">
              {error}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] text-muted-foreground">
                A runtime error was caught. Let the AI repair it?
              </p>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={onFix}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-[11.5px] font-semibold rounded-lg hover:opacity-80 transition-opacity"
                >
                  <Wrench className="w-3 h-3" />
                  Auto-fix
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}