import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { FG, YUZU } from '@/lib/chat-constants';

export default function ChatUpgradeOverlay({ open, feature, onClose }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-sm bg-white overflow-hidden rounded-md shadow-xl border border-border"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-5" style={{ background: FG }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ background: YUZU }}>
                    <TrendingUp className="w-4 h-4" style={{ color: FG }} />
                  </div>
                  <p className="text-base font-bold text-white">{t('upgrade_overlay_title')}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-sm transition-colors"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              {feature && (
                <p className="text-xs text-white/60">{feature} {t('upgrade_not_available')}</p>
              )}
            </div>

            {/* Features list */}
            <div className="p-5 space-y-2">
              {[
                t('upgrade_feature_internet'),
                t('upgrade_feature_modes'),
                t('upgrade_feature_files'),
                t('upgrade_feature_discussions'),
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 rounded-sm" style={{ background: YUZU }}>
                    <Check className="w-2.5 h-2.5" style={{ color: FG }} />
                  </div>
                  <span className="text-xs font-medium text-foreground/70">{f}</span>
                </div>
              ))}

              <button
                onClick={() => window.open('/pricing', '_blank')}
                className="w-full mt-4 py-3 font-bold text-sm rounded-sm transition-opacity hover:opacity-90"
                style={{ background: YUZU, color: FG }}
              >
                {t('see_plans')}
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-sm font-medium text-muted-foreground rounded-sm hover:bg-muted transition-colors"
              >
                {t('continue_free')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}