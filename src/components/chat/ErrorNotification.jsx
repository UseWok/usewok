/**
 * ErrorNotification — contextual, categorized error banner.
 * Accepts either a raw string (legacy) or a classified error object from lib/error-handler.js.
 */
import { X, Wrench, Wifi, Clock, ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { classifyError, ERROR_CATEGORIES } from '@/lib/error-handler';

const CATEGORY_STYLES = {
  [ERROR_CATEGORIES.NETWORK]:  { bg: 'bg-orange-500/10', border: 'border-orange-500/20', dot: 'bg-orange-400', text: 'text-orange-400', Icon: Wifi },
  [ERROR_CATEGORIES.QUOTA]:    { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  dot: 'bg-amber-400',  text: 'text-amber-400',  Icon: AlertTriangle },
  [ERROR_CATEGORIES.AUTH]:     { bg: 'bg-red-500/10',    border: 'border-red-500/20',    dot: 'bg-red-400',    text: 'text-red-400',    Icon: ShieldAlert },
  [ERROR_CATEGORIES.TIMEOUT]:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  dot: 'bg-amber-400',  text: 'text-amber-400',  Icon: Clock },
  [ERROR_CATEGORIES.ABORT]:    { bg: 'bg-zinc-500/10',   border: 'border-zinc-500/20',   dot: 'bg-zinc-400',   text: 'text-zinc-400',   Icon: Info },
  [ERROR_CATEGORIES.RUNTIME]:  { bg: 'bg-red-500/10',    border: 'border-red-500/20',    dot: 'bg-red-400',    text: 'text-red-400',    Icon: AlertTriangle },
  [ERROR_CATEGORIES.UNKNOWN]:  { bg: 'bg-red-500/10',    border: 'border-red-500/20',    dot: 'bg-red-400',    text: 'text-red-400',    Icon: AlertTriangle },
};

export default function ErrorNotification({ error, onFix, onDismiss, context = 'Operation' }) {
  if (!error) return null;

  // Support both raw strings and pre-classified objects
  const classified = typeof error === 'object' && error.category
    ? error
    : classifyError(error, context);

  // Silently swallow abort — no banner needed
  if (classified.category === ERROR_CATEGORIES.ABORT) return null;

  const style = CATEGORY_STYLES[classified.category] || CATEGORY_STYLES[ERROR_CATEGORIES.UNKNOWN];
  const { Icon } = style;
  const showAutoFix = !!onFix && classified.category === ERROR_CATEGORIES.RUNTIME;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`mx-3 mb-2 rounded-xl border ${style.border} ${style.bg} overflow-hidden`}
      >
        <div className="flex items-start justify-between px-3 py-2.5 gap-2">
          {/* Left: icon + message block */}
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${style.text}`} />
            <div className="min-w-0">
              <p className={`text-xs font-semibold ${style.text} leading-tight`}>{classified.title}</p>
              {classified.hint && (
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">{classified.hint}</p>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {showAutoFix && (
              <button
                onClick={onFix}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Wrench className="w-3 h-3" />
                Auto-fix
              </button>
            )}
            <button onClick={onDismiss} className={`p-1 rounded-md ${style.text} opacity-60 hover:opacity-100 transition-opacity`}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}