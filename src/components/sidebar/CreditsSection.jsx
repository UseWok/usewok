import { useState } from 'react';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CREDIT_LIMIT = 25;
const STORAGE_KEY = 'credits_first_use_date';

function getResetDate() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const first = new Date(stored);
  const reset = new Date(first);
  reset.setDate(reset.getDate() + 30);
  return reset;
}

function formatDate(date) {
  if (!date) return null;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function CreditsSection({ expanded }) {
  const [open, setOpen] = useState(false);
  const used = 0; // TODO: fetch real usage
  const remaining = CREDIT_LIMIT - used;
  const resetDate = getResetDate();
  const pct = Math.min((used / CREDIT_LIMIT) * 100, 100);

  return (
    <div className="px-2 py-1">
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
                <span className="font-medium text-foreground">{used} / {CREDIT_LIMIT}</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restants</span>
                <span className="font-medium text-foreground">{remaining}</span>
              </div>
              {resetDate ? (
                <p className="text-[10px] text-muted-foreground/70 text-center">
                  Réinitialisation le {formatDate(resetDate)}
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground/70 text-center">
                  Utilisez un crédit pour démarrer le cycle
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}