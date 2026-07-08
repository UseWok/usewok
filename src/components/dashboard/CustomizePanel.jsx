import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const ORANGE = '#FF5A1F';
const BORDER = 'rgba(21,19,15,0.10)';
const F = 'Inter, system-ui, sans-serif';

export const DASHBOARD_WIDGETS = [
  { id: 'evolution',   label: 'Your overall score',     sub: 'Score out of 100 + progress' },
  { id: 'tasks',       label: 'What you need to do',    sub: 'Your current actions' },
  { id: 'competitors', label: 'Your competitors',       sub: 'Your ranking vs them' },
  { id: 'llms',        label: 'Who mentions you',        sub: 'AI engines that cite you' },
  { id: 'pages',       label: 'Your popular pages',     sub: 'Pages AI engines prefer' },
];

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick}
      style={{ width: 44, height: 26, borderRadius: 100, border: 'none', cursor: 'pointer', padding: 3,
        background: on ? ORANGE : '#D8D3C7', display: 'flex', alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background 160ms', flexShrink: 0 }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', display: 'block' }} />
    </button>
  );
}

export default function CustomizePanel({ open, onClose, visibility, onToggle }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(21,19,15,0.35)', backdropFilter: 'blur(3px)' }} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999, width: 400, maxWidth: '90vw',
              background: '#fff', fontFamily: F, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 26px 18px', borderBottom: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Customize your dashboard</h2>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#F3EEE3', cursor: 'pointer', display: 'grid', placeItems: 'center', color: INK3 }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 26px' }}>
              {DASHBOARD_WIDGETS.map(w => {
                const on = visibility[w.id] !== false;
                return (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 3 }}>{w.label}</div>
                      <div style={{ fontSize: 12.5, color: INK3 }}>{w.sub}</div>
                    </div>
                    <Toggle on={on} onClick={() => onToggle(w.id)} />
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '16px 26px', borderTop: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>
                Show or hide cards. Your choice is saved for future visits.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}