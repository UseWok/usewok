// Full-screen modal used for Settings, Pricing, Docs, Support pages
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const MODAL_ROUTES = {
  settings: '/settings',
  pricing: '/pricing',
  docs: '/about:blank',
  support: '/support',
};

export default function FullscreenIframeModal({ modal, onClose }) {
  return (
    <AnimatePresence>
      {modal && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[99998]"
            style={{ background: 'rgba(0, 0, 0, 0.45)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
            <div
              className="relative w-[95vw] max-w-[1100px] h-[95vh] bg-white rounded-lg overflow-hidden flex flex-col pointer-events-auto"
              style={{ borderRadius: '12px' }}
              onClick={e => e.stopPropagation()}>
              <button onClick={onClose}
                className="absolute top-4 right-4 z-[100001] hover:bg-[#F7F7F8] rounded transition-colors"
                style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2} style={{ pointerEvents: 'none' }} />
              </button>
              <iframe
                src={MODAL_ROUTES[modal] || '#'}
                className="flex-1 w-full h-full border-none bg-white"
                title={modal}
                style={{ colorScheme: 'light' }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}