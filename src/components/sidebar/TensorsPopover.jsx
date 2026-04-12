import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const CORAL = '#FF4F00';

const fmtN = (n) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? r.toString() : r.toFixed(1);
};

export default function TensorsPopover({ open, onClose, anchorRef, user }) {
  const popRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const used = user?.credits_used || 0;
  const limit = user?.credits_limit || 10;
  const bonus = user?.credits_bonus || 0;
  const total = limit + bonus;
  const pct = Math.min((used / total) * 100, 100);

  // Daily usage
  const dailyLimit = user?.daily_credits_limit || 0; // 0 = unlimited
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyData = (() => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}'); } catch { return {}; } })();
  const dailyUsed = dailyData[todayKey] || 0;
  const hasDailyLimit = dailyLimit > 0;

  useEffect(() => {
    const h = (e) => {
      if (open && popRef.current && !popRef.current.contains(e.target) && anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose, anchorRef]);

  const getPos = () => {
    if (!anchorRef?.current) return { left: 72, top: 200 };
    const rect = anchorRef.current.getBoundingClientRect();
    const popW = 256;
    let left = rect.right + 12;
    if (left + popW > window.innerWidth - 8) left = Math.max(8, window.innerWidth - popW - 8);
    let top = rect.top;
    if (top + 220 > window.innerHeight - 8) top = window.innerHeight - 228;
    if (top < 8) top = 8;
    return { left, top };
  };

  const pos = open ? getPos() : {};

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={popRef}
          initial={{ opacity: 0, x: -8, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[200] w-64"
          style={{ left: pos.left, top: pos.top, background: 'white', border: '1px solid rgba(0,0,0,0.09)', borderRadius: '6px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center" style={{ background: YUZU, borderRadius: '2px' }}>
                <Zap className="w-3.5 h-3.5" style={{ color: FG }} />
              </div>
              <span className="text-sm font-bold" style={{ color: FG }}>{t('tensors')}</span>
            </div>
            <button onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '3px' }}>
              <X className="w-3 h-3" style={{ color: '#bbb' }} />
            </button>
          </div>

          {/* Stats */}
          <div className="px-4 py-3">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-2xl font-black" style={{ color: FG }}>{fmtN(used)}</span>
                <span className="text-sm ml-1" style={{ color: '#bbb' }}>/ {fmtN(total)}</span>
              </div>

            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(0,0,0,0.07)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: FG }} />
            </div>

            <p className="text-[10px]" style={{ color: '#aaa' }}>
              {t('tensors_used', { used, total })}
              {bonus > 0 && ` (+${bonus} bonus)`}
            </p>

            {/* Daily usage */}
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold" style={{ color: '#888' }}>Aujourd'hui</span>
                <span className="text-[10px] font-black" style={{ color: hasDailyLimit && dailyUsed >= dailyLimit ? '#ef4444' : '#555' }}>
                  {fmtN(dailyUsed)}{hasDailyLimit ? `/${fmtN(dailyLimit)}` : ' used'}
                </span>
              </div>
              {hasDailyLimit && (
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((dailyUsed/dailyLimit)*100,100)}%`, background: dailyUsed >= dailyLimit ? '#ef4444' : FG }} />
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 pb-4">
            <button
              onClick={() => { navigate('/pricing'); onClose(); }}
              className="w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
              style={{ background: FG, color: 'white', borderRadius: '2px' }}>
              <TrendingUp className="w-3 h-3" />
              {t('upgrade')} →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}