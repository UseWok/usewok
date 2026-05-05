import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FG = '#0A0A0A';
const CORAL = '#FF4F00';
const BLUE = '#3B82F6';

function UsageBar({ used, total, color }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

export default function FlashUsagePopover({ open, onClose, anchorRef, user }) {
  const popRef = useRef(null);
  const navigate = useNavigate();

  const used = user?.credits_used || 0;
  const limit = user?.credits_limit || 10;
  const bonus = user?.credits_bonus || 0;
  const total = limit + bonus;

  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyLimit = user?.daily_credits_limit || 0;
  const dailyData = (() => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}'); } catch { return {}; } })();
  const dailyUsed = dailyData[todayKey] || 0;

  // Renewal: first day of next month
  const now = new Date();
  const renewal = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const renewalStr = renewal.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' | 00:00 UTC';

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
    if (!anchorRef?.current) return { left: 72, bottom: 80 };
    const rect = anchorRef.current.getBoundingClientRect();
    const popW = 272;
    let left = rect.right + 12;
    if (left + popW > window.innerWidth - 8) left = Math.max(8, window.innerWidth - popW - 8);
    let top = rect.top;
    if (top + 260 > window.innerHeight - 8) top = window.innerHeight - 268;
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
          className="fixed z-[200] w-68"
          style={{ width: 272, left: pos.left, top: pos.top, background: 'white', border: '1px solid rgba(0,0,0,0.09)', borderRadius: '10px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <span className="text-sm font-bold" style={{ color: FG }}>Usage</span>
            <button onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 rounded" >
              <X className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
            </button>
          </div>

          <div className="px-4 py-4 space-y-5">
            {/* Deep Syntheses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: FG }}>Deep Syntheses</span>
                <span className="text-sm font-bold" style={{ color: '#888' }}>{used}/{total}{bonus > 0 ? <span style={{ color: CORAL }}> +{bonus}</span> : null}</span>
              </div>
              <UsageBar used={used} total={total} color={CORAL} />
            </div>

            {/* Flash */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: FG }}>Flash</span>
                <span className="text-sm font-bold" style={{ color: '#888' }}>
                  {dailyUsed}{dailyLimit > 0 ? `/${dailyLimit}` : ''}
                </span>
              </div>
              <UsageBar used={dailyUsed} total={dailyLimit > 0 ? dailyLimit : Math.max(dailyUsed, 1)} color={BLUE} />
            </div>

            {/* Renewal */}
            <p className="text-xs font-medium" style={{ color: BLUE }}>
              Renewal on {renewalStr}
            </p>
          </div>

          {/* Upgrade CTA */}
          <div className="px-4 pb-4">
            <button
              onClick={() => { navigate('/pricing'); onClose(); }}
              className="w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 rounded-md"
              style={{ background: FG, color: 'white' }}>
              <TrendingUp className="w-3 h-3" /> Upgrade →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}