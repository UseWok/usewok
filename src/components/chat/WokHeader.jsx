import { useState, useRef, useEffect } from 'react';
import { X, Home, CreditCard, Settings, Zap, BookOpen, LifeBuoy, ChevronRight } from 'lucide-react';

const WOK_LOGO = (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <rect width="40" height="40" rx="10" fill="#FFFFFF"/>
    <path d="M12 20L18 26L28 14" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function WokHeader({ user, userPlan, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div ref={menuRef} className="fixed top-4 left-4 z-50">
      {/* Wok logo + trigger button */}
      <div className="flex items-center gap-1.5">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-zinc-200/50">
          {WOK_LOGO}
        </div>

        {/* Trigger button - notch */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <div className="w-0.5 h-5 bg-black rounded-full" />
        </button>
      </div>

      {/* Menu dropdown */}
      {isMenuOpen && (
        <div className="absolute top-10 left-0 bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden w-64 mt-1">
          <div className="p-3 space-y-1">
            {/* Home */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onNavigate?.('/app');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                <span className="text-sm font-medium text-zinc-900">Home</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
            </button>

            {/* Credits Bar */}
            <div className="px-3 py-2.5 hover:bg-zinc-50 rounded-lg transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                  <span className="text-sm font-medium text-zinc-900">Credits</span>
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

            {/* Divider */}
            <div className="h-px bg-zinc-100 my-1" />

            {/* Settings */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onNavigate?.('/settings');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                <span className="text-sm font-medium text-zinc-900">Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
            </button>

            {/* Upgrade Plan */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onNavigate?.('/pricing');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                <span className="text-sm font-medium text-zinc-900">Upgrade Plan</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
            </button>

            {/* Documentation */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                <span className="text-sm font-medium text-zinc-900">Documentation</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
            </button>

            {/* Support */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onNavigate?.('/support');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                <span className="text-sm font-medium text-zinc-900">Support</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}