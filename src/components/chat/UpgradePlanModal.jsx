import { motion, AnimatePresence } from 'framer-motion';

export default function UpgradePlanModal({ open, url, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center font-open">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-md" onClick={onClose} />
        
        <motion.div initial={{ y: 50, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.98 }} transition={{ type: "spring", damping: 25 }}
          className="relative w-[95vw] h-[95vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2.5 bg-gray-100/80 backdrop-blur-md hover:bg-gray-200 text-gray-800 rounded-full transition-all shadow-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div className="w-full h-full relative bg-[#F9FAFB] overflow-hidden">
            <iframe 
              src={url} 
              className="absolute top-0 h-full border-none"
              // Le -260px cache la sidebar, le calc ajuste la largeur pour que le centre soit parfait
              style={{ width: 'calc(100% + 260px)', left: '-260px' }} 
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}