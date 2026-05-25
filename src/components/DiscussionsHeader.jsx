import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Home, CreditCard, Settings, Zap, BookOpen, LifeBuoy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WOK_LOGO_TEXT = (
  <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6">
    <text x="0" y="32" fontSize="36" fontWeight="900" fontFamily="Arial, sans-serif" fill="#0A0A0A">WOK</text>
  </svg>
);

const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[999] flex items-center justify-center"
      onClick={onClose}
      style={{ background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-[95vw] h-[95vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors z-50"
        >
          <span className="text-2xl text-zinc-600">✕</span>
        </button>

        <div className="w-full h-full overflow-auto p-12">
          <h1 className="text-4xl font-black text-zinc-900 mb-6">Settings</h1>
          <p className="text-zinc-500">Settings panel content goes here</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function DiscussionsHeader({ user, userPlan, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: () => {
        setIsMenuOpen(false);
        onNavigate?.('/app');
      },
      isModal: false,
    },
    {
      id: 'credits',
      label: 'Credits',
      icon: CreditCard,
      custom: true,
      isModal: false,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => {
        setIsMenuOpen(false);
        setIsSettingsOpen(true);
      },
      isModal: true,
    },
    {
      id: 'upgrade',
      label: 'Upgrade Plan',
      icon: Zap,
      onClick: () => {
        setIsMenuOpen(false);
        onNavigate?.('/pricing');
      },
      isModal: true,
    },
    {
      id: 'docs',
      label: 'Documentation',
      icon: BookOpen,
      onClick: () => {
        setIsMenuOpen(false);
      },
      isModal: true,
    },
    {
      id: 'support',
      label: 'Support',
      icon: LifeBuoy,
      onClick: () => {
        setIsMenuOpen(false);
        onNavigate?.('/support');
      },
      isModal: true,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Wok Logo + Menu Trigger */}
          <div ref={menuRef} className="relative flex items-center gap-2.5">
            {/* Logo */}
            <div className="h-7">
              {WOK_LOGO_TEXT}
            </div>

            {/* Chevron Indicator */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 hover:bg-zinc-100 rounded-lg transition-colors group relative"
            >
              <ChevronDown
                className="w-5 h-5 text-zinc-600 group-hover:text-zinc-900 transition-all"
                style={{
                  transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transitionDuration: '200ms',
                }}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden w-56"
                >
                  <div className="p-2 space-y-0.5">
                    {menuItems.map((item) => {
                      const Icon = item.icon;

                      if (item.custom) {
                        return (
                          <div key={item.id} className="px-3 py-2.5 hover:bg-zinc-50 rounded-lg transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Icon className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                                <span className="text-sm font-medium text-zinc-900">{item.label}</span>
                              </div>
                              <span className="text-xs font-semibold text-zinc-600">{creditsUsed}/{creditsLimit}</span>
                            </div>
                            <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden ml-7">
                              <div
                                className="h-full bg-black rounded-full transition-all duration-300"
                                style={{ width: `${creditsPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={item.id}
                          onClick={item.onClick}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-lg transition-colors text-left"
                        >
                          <Icon className="w-4 h-4 text-zinc-600 flex-shrink-0" strokeWidth={2.5} />
                          <span className="text-sm font-medium text-zinc-900">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}