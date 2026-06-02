import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function IframeModal({ open, url, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center font-sans"
      style={{ background: 'rgba(0, 0, 0, 0.45)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.1, ease: 'ease-out' }}
        className="relative w-[95vw] max-w-[1100px] h-[95vh] bg-white rounded-lg overflow-hidden flex flex-col"
        style={{ borderRadius: '12px' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 z-[99999] p-2 hover:bg-[#F7F7F8] rounded transition-colors"
          style={{ width: 20, height: 20 }}>
          <X className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2} />
        </button>
        <iframe src={url} className="w-full h-full border-none bg-white" />
      </motion.div>
    </div>
  );
}