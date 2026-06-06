import { motion } from 'framer-motion';

/**
 * Elegant "empty state" bubble shown when the AI (or heuristic filter)
 * determines the prompt is insufficient to generate an interface.
 * Props:
 *   hint — optional short suggestion sentence from the AI
 */
export default function InsufficientPromptBubble({ hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: 'rgba(249,87,56,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F95738" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#ccc', margin: 0, lineHeight: 1.5 }}>
          {hint && !hint.startsWith('__') ? hint : 'Décris ce que tu veux construire — une page, un outil, un dashboard…'}
        </p>
        <p style={{ fontSize: 11, color: '#555', margin: '4px 0 0', lineHeight: 1.4 }}>
          Ex: <span style={{ color: '#888', fontStyle: 'italic' }}>"Une landing page pour une app fitness"</span>
        </p>
      </div>
    </motion.div>
  );
}