import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ── Global event bus ──────────────────────────────────────────────
const listeners = new Set();
export function showBuildToast(mode, opts = {}) {
  listeners.forEach(fn => fn({ mode, ...opts }));
}
export function hideBuildToast() {
  listeners.forEach(fn => fn(null));
}

const SpinnerRing = () => (
  <div style={{
    width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
    border: '1.5px solid #E0E0E0',
    borderTopColor: '#111',
    animation: 'bt-spin 0.75s linear infinite',
  }} />
);

export default function BuildToast() {
  const [toast, setToast] = useState(null);
  const [offsetX, setOffsetX] = useState(0);
  const [hovered, setHovered] = useState(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffsetX = useRef(0);
  const dismissTimer = useRef(null);
  const ref = useRef(null);

  // ── RIGHT edge of screen: toast sits at `right: 20`, so its left edge is at window.innerWidth - 20 - toastWidth
  // We allow dragging left (negative offsetX) down to a min, and dismiss when dragged right past threshold.
  const MIN_OFFSET = -340; // how far left (px) user can drag

  useEffect(() => {
    const handler = (data) => {
      clearTimeout(dismissTimer.current);
      if (!data) { setToast(null); return; }
      setToast(data);
      setOffsetX(0);
      if (data.mode === 'saved') {
        dismissTimer.current = setTimeout(() => setToast(null), 8000);
      }
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); clearTimeout(dismissTimer.current); };
  }, []);

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartOffsetX.current = offsetX;

    const onMove = (ev) => {
      if (!dragging.current) return;
      const dx = ev.clientX - dragStartX.current;
      let nx = dragStartOffsetX.current + dx;
      // Clamp left
      if (nx < MIN_OFFSET) nx = MIN_OFFSET;
      setOffsetX(nx);
      // Dismiss if dragged right past toast's original position by 60px
      if (nx > 60) { setToast(null); dragging.current = false; }
    };
    const onUp = () => {
      dragging.current = false;
      // Snap back to 0 if not dismissed and not dragged left
      setOffsetX(prev => prev < 0 ? prev : 0);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [offsetX]);

  if (!toast) return (
    <style>{`@keyframes bt-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  );

  const { mode, title, body, onFix } = toast;

  const label = title || (
    mode === 'working' ? 'Building…' :
    mode === 'saved'   ? 'Saved' :
    'Something went wrong'
  );

  const dot = mode === 'error'   ? '#EF4444' :
              mode === 'saved'   ? '#22C55E' :
                                   '#888';

  return (
    <>
      <style>{`@keyframes bt-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <AnimatePresence>
        <motion.div
          ref={ref}
          key="build-toast"
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: offsetX }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          onMouseDown={onMouseDown}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 20,
            zIndex: 99999,
            cursor: dragging.current ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #EBEBEB',
            borderRadius: 12,
            padding: '11px 14px',
            minWidth: 230, maxWidth: 300,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
          }}>

            {/* Close — visible only on hover */}
            <AnimatePresence>
              {hovered && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => setToast(null)}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 20, height: 20, borderRadius: 6,
                    background: '#F5F5F5', border: 'none',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#999',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EBEBEB'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F5F5F5'}
                >
                  <X style={{ width: 10, height: 10 }} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Main row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingRight: hovered ? 20 : 0, transition: 'padding-right 120ms' }}>
              {mode === 'working'
                ? <SpinnerRing />
                : <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
              }
              <span style={{ fontSize: 13, fontWeight: 500, color: '#111', lineHeight: 1.3 }}>
                {label}
              </span>
            </div>

            {/* Body text */}
            {body && (
              <p style={{
                fontSize: 11.5, color: '#888', margin: '5px 0 0',
                lineHeight: 1.5, paddingLeft: 16,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {body}
              </p>
            )}

            {/* Fix button */}
            {mode === 'error' && onFix && (
              <button
                onClick={() => { onFix(); setToast(null); }}
                style={{
                  marginTop: 9, width: '100%', padding: '6px 0',
                  background: '#F9F9F9', border: '1px solid #EBEBEB',
                  borderRadius: 7, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: '#111',
                  fontFamily: 'Inter, sans-serif', transition: 'background 100ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
                onMouseLeave={e => e.currentTarget.style.background = '#F9F9F9'}
              >
                Fix with AI
              </button>
            )}

            {/* Progress bar for saved */}
            {mode === 'saved' && (
              <motion.div
                initial={{ scaleX: 1, originX: 0 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 8, ease: 'linear' }}
                style={{ height: 2, background: '#22C55E', borderRadius: 999, marginTop: 9, opacity: 0.5 }}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}