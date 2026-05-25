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
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-[95vw] h-[95vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
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

  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan?.credits_limit || user?.credits_limit || 10;
  const creditsPercent = Math.min(100, (creditsUsed / creditsLimit) * 100);

  return (
    <>
      {/* Wok trigger - notch + logo */}
      <div
        ref={menuRef}
        className="fixed top-4 right-4 z-50 flex items-center gap-2"
      >
        {/* Wok logo */}
        <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-md border border-zinc-200/50">
          {WOK_LOGO}
        </div>

        {/* Notch button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
        >
          <div className="w-0.5 h-6 bg-black rounded-full" />
        </button>

        {/* Animated menu panel */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
              className="absolute top-0 right-14 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
              style={{ minWidth: 320 }}
            >
              <div className="p-4">
                {/* Credits usage - compact */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-medium">Credits used</span>
                    <span className="font-semibold text-zinc-900">{creditsUsed} / {creditsLimit}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${creditsPercent}%` }}
                      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                      className="h-full bg-black rounded-full"
                    />
                  </div>
                </div>

                {/* Menu buttons - clean, no dividers */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setIsMenuOpen(false); onNavigate?.('/app'); }}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                  >
                    <Home className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-zinc-900">Home</span>
                  </button>
                  <button
                    onClick={() => { setIsMenuOpen(false); setActiveModal('credits'); }}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                  >
                    <CreditCard className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-zinc-900">Credits</span>
                  </button>
                  <button
                    onClick={() => { setIsMenuOpen(false); setActiveModal('settings'); }}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-zinc-900">Settings</span>
                  </button>
                  <button
                    onClick={() => { setIsMenuOpen(false); setActiveModal('upgrade'); }}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                  >
                    <Zap className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-zinc-900">Upgrade Plan</span>
                  </button>
                  <button
                    onClick={() => { setIsMenuOpen(false); setActiveModal('docs'); }}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                  >
                    <BookOpen className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-zinc-900">Documentation</span>
                  </button>
                  <button
                    onClick={() => { setIsMenuOpen(false); setActiveModal('support'); }}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                  >
                    <LifeBuoy className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-zinc-900">Support</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <InlineModal open={!!activeModal} onClose={() => setActiveModal(null)}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
              {activeModal === 'credits' && 'Credits'}
              {activeModal === 'settings' && 'Settings'}
              {activeModal === 'upgrade' && 'Upgrade Plan'}
              {activeModal === 'docs' && 'Documentation'}
              {activeModal === 'support' && 'Support'}
            </h2>
            <p className="text-zinc-500">Content coming soon</p>
          </div>
        </div>
      </InlineModal>
    </>
  );
}