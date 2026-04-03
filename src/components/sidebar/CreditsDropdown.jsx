import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreditsDropdown({ expanded }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors"
      >
        <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        {expanded && (
          <>
            <span className="flex-1 text-left">Crédits</span>
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </>
        )}
      </button>
      <AnimatePresence>
        {open && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-2 py-2 mt-1 rounded-lg bg-muted text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Utilisés</span>
                <span className="font-medium text-foreground">1 250</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '42%' }} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restants</span>
                <span className="font-medium text-foreground">1 750</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}