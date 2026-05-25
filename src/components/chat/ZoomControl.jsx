import { motion } from 'framer-motion';

const LEVELS = [
  { label: 'S', title: 'Compact',  w: '72vw',  maxW: 860,   h: '80vh',  maxH: 620 },
  { label: 'M', title: 'Medium',   w: '88vw',  maxW: 1100,  h: '88vh',  maxH: 720 },
  { label: 'L', title: 'Full',     w: '100vw', maxW: 99999, h: '100vh', maxH: 99999 },
];

export { LEVELS };

export default function ZoomControl({ level, setLevel }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        background: 'rgba(245,245,245,0.95)',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: 999,
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        padding: '3px 4px',
      }}
    >
      {LEVELS.map((lv, i) => (
        <motion.button
          key={lv.label}
          onClick={() => setLevel(i)}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.1 }}
          title={lv.title}
          style={{
            width: 30,
            height: 26,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: 0.2,
            transition: 'background 180ms, color 180ms',
            background: level === i ? '#111111' : 'transparent',
            color: level === i ? '#FFFFFF' : '#AAAAAA',
          }}
        >
          {lv.label}
        </motion.button>
      ))}
    </div>
  );
}