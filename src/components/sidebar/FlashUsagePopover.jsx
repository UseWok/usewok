import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FREE_PLAN_CREDITS, formatBalance, formatResetDate } from '@/lib/credits';

export default function FlashUsagePopover({ open, onClose, anchorRef, user }) {
  const popRef = useRef(null);
  const navigate = useNavigate();

  const balance = typeof user?.credits_balance === 'number' ? user.credits_balance : FREE_PLAN_CREDITS;
  const maxCredits = FREE_PLAN_CREDITS;
  const used = Math.max(0, maxCredits - balance);
  const pct = Math.min((used / maxCredits) * 100, 100);
  const isNegative = balance < 0;

  const renewalStr = (() => {
    const resetDate = user?.credits_reset_date;
    if (resetDate) {
      const d = new Date(resetDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    }
    // fallback: 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  })();

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
    if (top + 240 > window.innerHeight - 8) top = window.innerHeight - 248;
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
          style={{ position: 'fixed', zIndex: 200, width: 272, left: pos.left, top: pos.top, background: 'white', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 10, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>Credits</span>
            <button onClick={onClose} style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: 14, height: 14, color: '#bbb' }} />
            </button>
          </div>

          <div style={{ padding: '16px' }}>
            {/* Current / Max */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: isNegative ? '#EF4444' : '#0A0A0A' }}>
                {isNegative ? '-' : ''}{formatBalance(Math.abs(balance))}
              </span>
              <span style={{ fontSize: 14, color: '#AAA' }}>/ {formatBalance(maxCredits)}</span>
              {isNegative && (
                <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderRadius: 4, padding: '2px 6px' }}>DEBT</span>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: 6, borderRadius: 9999, background: 'rgba(0,0,0,0.07)', overflow: 'hidden', marginBottom: 12 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 9999, background: isNegative ? '#EF4444' : '#2563EB' }}
              />
            </div>

            <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
              {formatBalance(used)} used of {formatBalance(maxCredits)} total
            </p>

            {/* Renewal */}
            <div style={{ padding: '10px 12px', background: '#F8F8F6', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#555', margin: 0 }}>
                Renews on <span style={{ fontWeight: 700, color: '#333' }}>{renewalStr}</span>
              </p>
            </div>
          </div>

          {/* Upgrade CTA */}
          <div style={{ padding: '0 16px 16px' }}>
            <button
              onClick={() => { navigate('/pricing'); onClose(); }}
              style={{ width: '100%', padding: '8px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#0A0A0A', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              <TrendingUp style={{ width: 12, height: 12 }} /> Upgrade →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}