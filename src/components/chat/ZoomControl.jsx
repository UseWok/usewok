import { motion } from 'framer-motion';

const LEVELS = [
  { label: 'L',  title: 'Large',      w: '88vw',  maxW: 1200,  h: '90vh',  maxH: 800 },
  { label: 'XL', title: 'X-Large',    w: '96vw',  maxW: 1600,  h: '96vh',  maxH: 1080 },
  { label: '↗',  title: 'Fullscreen', w: '100vw', maxW: 99999, h: '100vh', maxH: 99999 },
];

export { LEVELS };

export default function ZoomControl({ level, setLevel }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        background: 'rgba(245,245,245,0.9)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 999,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        padding: '2px 3px',
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
            width: 22,
            height: 18,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            fontSize: 9,
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