import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, CreditCard, Settings, Zap, BookOpen, LifeBuoy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WOK_LOGO = (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
    <rect width="40" height="40" rx="10" fill="#FFFFFF"/>
    <path d="M12 20L18 26L28 14" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InlineModal = ({ open, onClose, children }) => {
  if (!open) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-[95vw] h-[95vh] bg-white rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors z-50"
        >
          <X className="w-5 h-5 text-zinc-600" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default function WokHeader({ user, userPlan, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: Home, label: 'Home', action: () => { setIsMenuOpen(false); onNavigate?.('/app'); } },
    { icon: CreditCard, label: 'Crédits', action: () => { setIsMenuOpen(false); setActiveModal('credits'); } },
    { icon: Settings, label: 'Paramètres', action: () => { setIsMenuOpen(false); setActiveModal('settings'); } },
    { icon: Zap, label: 'Mettre à niveau', action: () => { setIsMenuOpen(false); setActiveModal('upgrade'); } },
    { icon: BookOpen, label: 'Documentation', action: () => { setIsMenuOpen(false); setActiveModal('docs'); } },
    { icon: LifeBuoy, label: 'Support', action: () => { setIsMenuOpen(false); setActiveModal('support'); } },
  ];

  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan?.credits_limit || user?.credits_limit || 10;
  const creditsPercent = Math.min(100, (creditsUsed / creditsLimit) * 100);

  return (
    <>
      {/* Header */}
      <div
        ref={menuRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-zinc-200/50 h-14 flex items-center justify-center"
        style={{ borderBottomWidth: '0.5px' }}
      >
        <div className="flex items-center gap-3 relative">
          {/* Wok logo + text */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              {WOK_LOGO}
            </div>
            <span className="text-lg font-semibold text-black tracking-tight">Wok</span>
          </div>

          {/* Notch button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <div className="w-0.5 h-5 bg-black rounded-full" />
          </button>

          {/* Animated menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
              >
                <div className="p-3 min-w-[280px]">
                  {/* Credits usage */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                      <span>Crédits utilisés</span>
                      <span className="font-medium text-zinc-900">{creditsUsed} / {creditsLimit}</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${creditsPercent}%` }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                        className="h-full bg-black rounded-full"
                      />
                    </div>
                  </div>

                  {/* Menu buttons */}
                  <div className="space-y-1">
                    {menuItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                      >
                        <item.icon className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                        <span className="text-sm font-medium text-zinc-900">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <InlineModal open={!!activeModal} onClose={() => setActiveModal(null)}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
              {activeModal === 'credits' && 'Crédits'}
              {activeModal === 'settings' && 'Paramètres'}
              {activeModal === 'upgrade' && 'Mettre à niveau'}
              {activeModal === 'docs' && 'Documentation'}
              {activeModal === 'support' && 'Support'}
            </h2>
            <p className="text-zinc-500">Contenu en développement</p>
          </div>
        </div>
      </InlineModal>
    </>
  );
}