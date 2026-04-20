import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
  const { t } = useLanguage();

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
      {!isMobile && <Sidebar expanded={expanded} setExpanded={setExpanded} />}

      {/* Mobile: sidebar drawer */}
      {isMobile && (
        <AnimatePresence>
          {expanded && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setExpanded(false)}
              />
              <Sidebar expanded={true} setExpanded={setExpanded} onNavClick={() => setExpanded(false)} />
            </>
          )}
        </AnimatePresence>
      )}

      <motion.main
        animate={{ marginLeft: isMobile ? 0 : (expanded ? EXPANDED_W : COLLAPSED_W) }}
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        className="flex-1 min-h-screen overflow-x-hidden relative"
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

      </motion.main>
    </div>
  );
}