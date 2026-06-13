/**
 * BuildToast — pill persistant, suit l'utilisateur sur TOUTES les pages.
 * - Mode "working": spinner + lien cliquable vers le build en cours
 * - Mode "saved": point vert + auto-dismiss 7s
 * - Mode "error": point rouge + bouton Fix
 * - Drag horizontal pour dismiss
 * - Persiste en localStorage: si l'IA bosse et l'user quitte, le toast réapparaît
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'wok_build_in_progress';

// ── Global event bus ──────────────────────────────────────────────
const listeners = new Set();

export function showBuildToast(mode, opts = {}) {
  // Persiste en localStorage si mode 'working' (build en cours)
  if (mode === 'working' && opts.convUrl) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, ...opts, ts: Date.now() })); } catch {}
  } else if (mode !== 'working') {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
  listeners.forEach(fn => fn({ mode, ...opts }));
}

export function hideBuildToast() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  listeners.forEach(fn => fn(null));
}

const SpinnerRing = () => (
  <div style={{
    width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
    border: '1.5px solid #E0E0E0', borderTopColor: '#111',
    animation: 'bt-spin 0.7s linear infinite',
  }} />
);

export default function BuildToast() {
  const [toast, setToast] = useState(null);
  const [hovered, setHovered] = useState(false);
  const dismissTimer = useRef(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-60, 0, 80], [0.7, 1, 0]);
  const navigate = useNavigate();

  const dismiss = useCallback(() => {
    clearTimeout(dismissTimer.current);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setToast(null);
    animate(x, 0, { duration: 0 });
  }, [x]);

  // Restaurer un build en cours depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // Si le build date de moins de 30 minutes, restaurer le toast
        if (data && data.ts && Date.now() - data.ts < 30 * 60_000) {
          setToast(data);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (data) => {
      clearTimeout(dismissTimer.current);
      if (!data) { setToast(null); return; }
      animate(x, 0, { duration: 0 });
      setToast(data);
      if (data.mode === 'saved') {
        dismissTimer.current = setTimeout(() => {
          setToast(null);
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
        }, 7000);
      }
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); clearTimeout(dismissTimer.current); };
  }, [x]);

  if (!toast) {
    return <style>{`@keyframes bt-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>;
  }

  const { mode, title, body, onFix, convUrl } = toast;
  const label = title || (mode === 'working' ? 'Build en cours…' : mode === 'saved' ? 'Sauvegardé' : 'Erreur');
  const dot = mode === 'error' ? '#EF4444' : mode === 'saved' ? '#22C55E' : null;

  const handleClick = () => {
    if (convUrl && mode === 'working') {
      navigate(convUrl);
    }
  };

  return (
    <>
      <style>{`@keyframes bt-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <AnimatePresence>
        <motion.div
          key="build-toast"
          style={{
            position: 'fixed', bottom: 24, right: 20, zIndex: 99999,
            x, opacity, cursor: mode === 'working' && convUrl ? 'pointer' : 'grab',
            touchAction: 'none', userSelect: 'none',
          }}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 440, damping: 36 }}
          drag="x"
          dragConstraints={{ left: -300, right: 300 }}
          dragElastic={{ left: 0.15, right: 0.08 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > 80) { dismiss(); }
            else { animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 }); }
          }}
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E4E4E4',
            borderRadius: 8,
            padding: '12px 16px',
            minWidth: 240, maxWidth: 300,
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
          }}>
            {/* Close X — hover only */}
            <AnimatePresence>
              {hovered && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  onClick={(e) => { e.stopPropagation(); dismiss(); }}
                  style={{
                    position: 'absolute', top: 7, right: 7,
                    width: 18, height: 18, borderRadius: 4,
                    background: '#F0F0F0', border: 'none',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#999',
                  }}
                >
                  <X style={{ width: 9, height: 9 }} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Label row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 20 }}>
              {mode === 'working'
                ? <SpinnerRing />
                : <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
              }
              <span style={{ fontSize: 13, fontWeight: 500, color: '#111', lineHeight: 1.3, flex: 1 }}>
                {label}
              </span>
              {/* Lien vers le build si mode working */}
              {mode === 'working' && convUrl && (
                <ExternalLink style={{ width: 11, height: 11, color: '#aaa', flexShrink: 0 }} />
              )}
            </div>

            {body && (
              <p style={{
                fontSize: 11.5, color: '#888', margin: '4px 0 0',
                lineHeight: 1.5, paddingLeft: 14,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {body}
              </p>
            )}

            {/* Working: sous-texte lien cliquable */}
            {mode === 'working' && convUrl && (
              <p style={{ fontSize: 11, color: '#3B8BEB', margin: '4px 0 0', paddingLeft: 14, lineHeight: 1.4 }}>
                Cliquer pour voir le build →
              </p>
            )}

            {/* Error Fix button */}
            {mode === 'error' && onFix && (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onFix(); dismiss(); }}
                  style={{
                    width: '100%', padding: '7px 0',
                    background: '#111', border: 'none',
                    borderRadius: 7, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#222'}
                  onMouseLeave={e => e.currentTarget.style.background = '#111'}
                >
                  Fix with AI
                </button>
                <p style={{ fontSize: 10.5, color: '#C0C0C0', margin: '5px 0 0', textAlign: 'center' }}>
                  Uses credits
                </p>
              </div>
            )}

            {mode === 'saved' && (
              <p style={{ fontSize: 11, color: '#AAA', margin: '4px 0 0', paddingLeft: 14, lineHeight: 1.4 }}>
                Sauvegardé dans l'historique
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}