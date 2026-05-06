import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const SESSION_KEY = 'stensor_total_minutes';

function trackSession(userId) {
  const key = `${SESSION_KEY}_${userId}`;
  const start = Date.now();
  return () => {
    const elapsed = (Date.now() - start) / 60000; // minutes
    const prev = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, String(prev + elapsed));
  };
}

export function getTotalMinutes(userId) {
  return parseFloat(localStorage.getItem(`${SESSION_KEY}_${userId}`) || '0');
}
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { COLLAPSED_W, EXPANDED_W } from './Sidebar';
import { Menu } from 'lucide-react';
import { captureReferralFromUrl } from '@/lib/referral';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/lib/i18n';

export { COLLAPSED_W, EXPANDED_W };

export default function Layout() {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const isChat = location.pathname === '/chat';

  useEffect(() => {
    captureReferralFromUrl();
    base44.auth.me().then(u => {
      if (!u?.id) return;
      const cleanup = trackSession(u.id);
      return cleanup;
    }).catch(() => {});
  }, []);


  return (
    <div className="min-h-screen bg-white flex font-be">
      {/* Desktop sidebar */}
      {!isMobile && !isChat && <Sidebar expanded={expanded} setExpanded={setExpanded} />}

      {/* Mobile: sidebar drawer */}
      {isMobile && !isChat && (
        <AnimatePresence>
          {expanded && (
            <>
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 z-40 bg-black/40"
                onClick={() => setExpanded(false)}
              />
              <Sidebar expanded={true} setExpanded={setExpanded} onNavClick={() => setExpanded(false)} isMobileDrawer={true} />
            </>
          )}
        </AnimatePresence>
      )}

      <main
        className="flex-1 min-h-screen overflow-x-hidden relative"
        style={{ marginLeft: isMobile || isChat ? 0 : (expanded ? EXPANDED_W : COLLAPSED_W), transition: 'margin-left 0.2s ease' }}
      >
        {/* Mobile hamburger */}
        {isMobile && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="fixed top-4 left-4 z-30 w-8 h-8 flex items-center justify-center bg-fg text-white rounded-sm"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <Outlet />

      </main>
    </div>
  );
}