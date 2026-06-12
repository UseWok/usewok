/**
 * BuildToast — draggable bottom-right notification widget
 *
 * Modes:
 *  - "working"  : "Agents are working…" shown while user is away
 *  - "saved"    : "Build saved" auto-dismiss after 10s
 *  - "error"    : Error with a Fix button
 *
 * Drag: move freely; if dragged past 80% screen-right → dismiss.
 * Exported helpers: showBuildToast(mode, opts) / hideBuildToast()
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Wrench, Loader } from 'lucide-react';

// ── Global event bus ──────────────────────────────────────────────
const listeners = new Set();
export function showBuildToast(mode, opts = {}) {
  listeners.forEach(fn => fn({ mode, ...opts }));
}
export function hideBuildToast() {
  listeners.forEach(fn => fn(null));
}

// ── Icons ─────────────────────────────────────────────────────────
const SpinnerIcon = () => (
  <div style={{
    width: 16, height: 16, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.15)',
    borderTopColor: '#fff',
    animation: 'bt-spin 0.8s linear infinite', flexShrink: 0,
  }} />
);

// ── Main component ────────────────────────────────────────────────
export default function BuildToast() {
  const [toast, setToast] = useState(null); // null | { mode, title, body, onFix }
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const dismissTimer = useRef(null);
  const ref = useRef(null);

  // Subscribe to global events
  useEffect(() => {
    const handler = (data) => {
      clearTimeout(dismissTimer.current);
      if (!data) { setToast(null); return; }
      setToast(data);
      setPos({ x: 0, y: 0 }); // reset position on new toast
      if (data.mode === 'saved') {
        dismissTimer.current = setTimeout(() => setToast(null), 10000);
      }
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); clearTimeout(dismissTimer.current); };
  }, []);

  // ── Drag — mouse ──
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    const onMove = (ev) => {
      if (!dragging.current) return;
      const dx = ev.clientX - dragStart.current.mx;
      const dy = ev.clientY - dragStart.current.my;
      const nx = dragStart.current.px + dx;
      const ny = dragStart.current.py + dy;
      setPos({ x: nx, y: ny });
      // dismiss if dragged far right (> 80vw from right edge)
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.left > window.innerWidth * 0.82) { setToast(null); dragging.current = false; }
      }
    };
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos]);

  // ── Drag — touch ──
  const onTouchStart = useCallback((e) => {
    if (e.target.closest('button')) return;
    const t = e.touches[0];
    dragStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y };
    const onMove = (ev) => {
      const tc = ev.touches[0];
      const dx = tc.clientX - dragStart.current.mx;
      const dy = tc.clientY - dragStart.current.my;
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.left > window.innerWidth * 0.82) setToast(null);
      }
    };
    const onEnd = () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }, [pos]);

  if (!toast) return (
    <style>{`@keyframes bt-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  );

  const { mode, title, body, onFix } = toast;

  const icon = mode === 'working' ? <SpinnerIcon /> :
               mode === 'saved'   ? <CheckCircle style={{ width: 16, height: 16, color: '#4ade80', flexShrink: 0 }} /> :
                                    <Wrench style={{ width: 16, height: 16, color: '#F95738', flexShrink: 0 }} />;

  const accentColor = mode === 'error' ? '#F95738' : mode === 'saved' ? '#4ade80' : '#888';

  return (
    <>
      <style>{`@keyframes bt-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <AnimatePresence>
        <motion.div
          ref={ref}
          key="build-toast"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: pos.x, translateY: pos.y }}
          exit={{ opacity: 0, y: 16, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{
            position: 'fixed',
            bottom: 24 - pos.y,
            right: 20 - pos.x,
            zIndex: 99999,
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          <div style={{
            background: '#141414',
            border: `1px solid ${mode === 'error' ? 'rgba(249,87,56,0.3)' : '#242424'}`,
            borderRadius: 14,
            padding: '12px 14px',
            minWidth: 260, maxWidth: 320,
            boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
            fontFamily: 'Inter, sans-serif',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ marginTop: 1 }}>{icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                  {title || (mode === 'working' ? 'Agents are working…' : mode === 'saved' ? 'Build saved' : 'Runtime error')}
                </p>
                {body && (
                  <p style={{ fontSize: 11, color: '#666', margin: '3px 0 0', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {body}
                  </p>
                )}
              </div>
              <button
                onClick={() => setToast(null)}
                style={{ width: 22, height: 22, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', flexShrink: 0, marginTop: -1 }}
                onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
                onMouseLeave={e => e.currentTarget.style.color = '#444'}
              >
                <X style={{ width: 12, height: 12 }} />
              </button>
            </div>

            {/* Fix button for errors */}
            {mode === 'error' && onFix && (
              <button
                onClick={() => { onFix(); setToast(null); }}
                style={{
                  marginTop: 10, width: '100%', padding: '7px 0',
                  background: 'rgba(249,87,56,0.12)', border: '1px solid rgba(249,87,56,0.25)',
                  borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#F95738',
                  fontFamily: 'Inter, sans-serif', transition: 'background 120ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,87,56,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(249,87,56,0.12)'}
              >
                Fix with AI
              </button>
            )}

            {/* Progress bar for "saved" auto-dismiss */}
            {mode === 'saved' && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 10, ease: 'linear' }}
                style={{ height: 2, background: '#4ade80', borderRadius: 999, marginTop: 10, opacity: 0.5 }}
              />
            )}

            {/* Drag hint */}
            <p style={{ fontSize: 10, color: '#2A2A2A', margin: '8px 0 0', textAlign: 'center', letterSpacing: '0.03em' }}>
              drag to dismiss →
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}