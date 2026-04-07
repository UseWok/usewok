import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreditsModal({ open, onClose, user }) {
  const navigate = useNavigate();
  if (!user) return null;

  const used = user.credits_used || 0;
  const limit = user.credits_limit || 25;
  const bonus = user.credits_bonus || 0;
  const total = limit + bonus;
  const pct = Math.min((used / total) * 100, 100);
  const isHigh = pct >= 70;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.25)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-base font-bold" style={{ color: '#111' }}>Crédits de messages</p>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5">
                <X className="w-4 h-4" style={{ color: '#999' }} />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-5">
              {/* Main credits */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: '#FF4F00' }}
                    />
                  </div>
                </div>
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-2xl font-bold" style={{ color: '#111' }}>{used} / {total}</span>
                  {bonus > 0 && (
                    <span className="text-sm font-bold" style={{ color: '#FF4F00' }}>+{bonus}</span>
                  )}
                </div>
                <p className="text-xs text-right mt-0.5" style={{ color: '#999' }}>
                  {limit} crédits plan{bonus > 0 ? ` + ${bonus} bonus` : ''}
                </p>
              </div>

              {/* Info */}
              <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.03)' }}>
                <p className="text-xs" style={{ color: '#666' }}>
                  Les crédits bonus proviennent de cadeaux admin ou de parrainages. Ils sont effacés lors de la prochaine réinitialisation mensuelle.
                </p>
              </div>

              {/* Upgrade */}
              {pct >= 70 && (
                <button
                  onClick={() => { navigate('/pricing'); onClose(); }}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: '#FF4F00', color: '#ffffff' }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Mettre à niveau →
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}