/**
 * ChatOverlay — wraps the Chat page in an immersive 95% window
 * with a dark semi-transparent blurred backdrop.
 * The backdrop is purely visual; the chat itself handles routing.
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ChatOverlay({ children }) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
    >
      {/* Click outside backdrop to go back */}
      <div className="absolute inset-0" onClick={() => navigate(-1)} />

      {/* 95% immersive window */}
      <motion.div
        className="relative z-10 bg-background overflow-hidden"
        initial={{ scale: 0.97, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 12 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '95vw',
          height: '95vh',
          borderRadius: 18,
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          border: '1px solid hsl(var(--border))',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}