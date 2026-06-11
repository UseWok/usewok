import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { FREE_PLAN_CREDITS, formatResetDate, formatBalance } from '@/lib/credits';

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

  // New credit engine: balance-based (starts at 150k, counts down)
  const balance = typeof user?.credits_balance === 'number' ? user.credits_balance : FREE_PLAN_CREDITS;
  const total = FREE_PLAN_CREDITS;
  const used = Math.max(0, total - balance);
  const pct = Math.min((used / total) * 100, 100);
  const resetDateStr = formatResetDate(user);
  const isNegative = balance < 0;

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
                <span className="text-2xl font-black" style={{ color: isNegative ? '#EF4444' : FG }}>
                  {isNegative ? '-' : ''}{formatBalance(Math.abs(balance))}
                </span>
                <span className="text-xs ml-1" style={{ color: '#bbb' }}>/ {formatBalance(total)}</span>
              </div>
              {isNegative && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                  Dette
                </span>
              )}
            </div>

            {/* Progress bar — blue for free plan */}
            <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(0,0,0,0.07)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: isNegative ? '#EF4444' : '#2563EB' }} />
            </div>

            <p className="text-[10px]" style={{ color: '#aaa' }}>
              {formatBalance(used)} crédits utilisés sur {formatBalance(total)}
            </p>

            {/* Renewal date */}
            {resetDateStr && (
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold" style={{ color: '#888' }}>Renouvellement</span>
                  <span className="text-[10px] font-bold" style={{ color: '#555' }}>{resetDateStr}</span>
                </div>
              </div>
            )}
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