import { motion } from 'framer-motion';

const MODE_CONFIG = {
  thinking: { color: '#0A0A0A', accent: 'rgba(0,0,0,0.15)' },
  pro:      { color: '#3A0088', accent: 'rgba(58,0,136,0.3)' },
  ultimate: { color: '#FF4F00', accent: 'rgba(255,79,0,0.3)' },
  fast:     { color: '#0A0A0A', accent: 'rgba(0,0,0,0.15)' },
};

export default function ChatLoadingAnimation({ mode = 'thinking' }) {
  const { color, accent } = MODE_CONFIG[mode] || MODE_CONFIG.thinking;

  return (
    <div className="flex items-center gap-2 px-5 py-4">
      {/* Morphing bar */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          style={{ background: color, width: 3, borderRadius: 2 }}
          animate={{
            height: [6, 20, 6],
            opacity: [0.2, 1, 0.2],
            scaleX: [1, 1.5, 1],
          }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: [0.4, 0, 0.6, 1],
          }}
        />
      ))}
      <motion.div
        style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 12px ${accent}`,
        }}
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.4, 1, 0.4],
          boxShadow: [`0 0 4px ${accent}`, `0 0 18px ${accent}`, `0 0 4px ${accent}`],
        }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />
    </div>
  );
}