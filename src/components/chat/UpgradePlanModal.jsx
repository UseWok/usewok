import { motion } from 'framer-motion';

export default function UpgradePlanModal({ open, onClose, currentPlanId }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-open">
      {/* FOND GRISÉ PRESQUE NOIR CLAIR */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* LA FENÊTRE (85% de l'écran) AVEC ANIMATION DOUCE */}
      <motion.div 
        initial={{ y: 30, opacity: 0, scale: 0.98 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        exit={{ y: 20, opacity: 0, scale: 0.98 }} 
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-[85vw] h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* CROIX DE FERMETURE */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-50 p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* INTÉGRATION DE LA PAGE PRICING (BOUTIQUE) */}
        <iframe 
          src="/pricing" 
          title="Boutique"
          className="w-full h-full border-none"
        />
      </motion.div>
    </div>
  );
}