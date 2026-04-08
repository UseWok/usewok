import { motion } from 'framer-motion';

const MODE_CONFIG = {
  thinking: {
    color: '#0A0A0A',
    glow: 'rgba(0,0,0,0.15)',
  },
  pro: {
    color: '#3A0088',
    glow: 'rgba(58,0,136,0.25)',
  },
  ultimate: {
    color: '#FF4F00',
    glow: 'rgba(255,79,0,0.25)',
  },
  fast: {
    color: '#0A0A0A',
    glow: 'rgba(0,0,0,0.15)',
  },
};

export default function ChatLoadingAnimation({ mode = 'thinking' }) {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.thinking;

  return (
    <div className="flex items-center gap-1.5 px-4 py-3.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 2,
            background: config.color,
            boxShadow: `0 0 8px ${config.glow}`,
          }}
          animate={{
            opacity: [0.15, 1, 0.15],
            scale: [0.8, 1.15, 0.8],
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}