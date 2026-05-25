import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function InlineModal({ onClose, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95vw',
          height: '95vh',
          background: '#FFFFFF',
          borderRadius: 18,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 24px 80px rgba(0,0,0,0.24)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#F5F5F5',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E8E8E8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#F5F5F5')}
        >
          <X size={20} strokeWidth={2.5} className="text-zinc-600" />
        </button>

        {/* Content */}
        <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>{children}</div>
      </motion.div>
    </motion.div>
  );
}