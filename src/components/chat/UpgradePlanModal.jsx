import { motion, AnimatePresence } from 'framer-motion';

// Use this file for BOTH Pricing and DNA modales.
export default function UpgradePlanModal({ open, url, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center font-open">
        
        {/* DARK BLUR BACKGROUND */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-md" 
          onClick={onClose} 
        />
        
        {/* 85% MODAL WITH IFRAME CROPPING */}
        <motion.div 
          initial={{ y: 40, opacity: 0, scale: 0.96 }} 
          animate={{ y: 0, opacity: 1, scale: 1 }} 
          exit={{ y: 20, opacity: 0, scale: 0.96 }} 
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          // overflow-hidden is crucial to hide the shifted sidebar
          className="relative w-[85vw] h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* CLOSE BUTTON */}
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 z-50 p-2.5 bg-gray-100/80 backdrop-blur-md hover:bg-gray-200 text-gray-700 rounded-full transition-colors shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          {/* THE IFRAME HACK: We make it wider and shift it left by ~260px (sidebar width) to crop it out */}
          <div className="w-full h-full relative bg-gray-50">
            <iframe 
              src={url} 
              title="Stensor View"
              className="absolute top-0 left-[-260px] h-full border-none"
              style={{ width: 'calc(100% + 260px)' }}
            />
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}