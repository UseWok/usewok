/**
 * TooltipCoach — contextual coach marks system
 * Usage: <TooltipCoach id="hero_input" text="Type any financial question here" position="bottom" />
 * Each tooltip shows once per user session (localStorage key).
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SEEN_KEY = 'stensor_coach_seen';

function getSeen() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); } catch { return []; }
}
function markSeen(id) {
  const s = getSeen();
  if (!s.includes(id)) { s.push(id); localStorage.setItem(SEEN_KEY, JSON.stringify(s)); }
}

export function resetCoachMarks() {
  localStorage.removeItem(SEEN_KEY);
}

export default function TooltipCoach({ id, text, position = 'bottom', delay = 1500, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getSeen().includes(id)) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [id, delay]);

  const dismiss = () => { setVisible(false); markSeen(id); };

  const posClasses = {
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-fg border-x-transparent border-t-transparent border-4',
    top: 'top-full left-1/2 -translate-x-1/2 border-t-fg border-x-transparent border-b-transparent border-4',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-fg border-y-transparent border-r-transparent border-4',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-fg border-y-transparent border-l-transparent border-4',
  };

  return (
    <div className="relative inline-block">
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
            className={`absolute z-[300] w-max max-w-[220px] px-3 py-2 bg-fg text-white rounded-md shadow-lg ${posClasses[position]}`}
          >
            <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
            <p className="text-xs leading-relaxed pr-4">{text}</p>
            <button onClick={dismiss} className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center opacity-60 hover:opacity-100" aria-label="Dismiss tip">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}