import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, children }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed inset-0 z-[1000] flex items-center justify-center"
        style={{ background: 'rgba(0, 0, 0, 0.45)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative bg-white rounded-lg overflow-hidden flex flex-col"
          style={{
            width: '95vw',
            maxWidth: '1100px',
            height: '95vh',
            borderRadius: '12px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[1001] p-0 hover:bg-[#F7F7F8] rounded transition-colors"
            style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2} />
          </button>

          {/* Inner content area */}
          <div
            className="w-full h-full overflow-y-auto"
            style={{ padding: '24px' }}
          >
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}