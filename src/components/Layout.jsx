import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Sidebar, { COLLAPSED_W, EXPANDED_W } from './Sidebar';
import { getUserPlan } from '@/lib/plans-config';
import { onCreditsUpdate } from '@/lib/credits-events';
import { captureReferralFromUrl } from '@/lib/referral';
import { useIsMobile } from '@/hooks/use-mobile';
import { initTheme } from '@/lib/theme';

const SESSION_KEY = 'stensor_total_minutes';

function trackSession(userId) {
  const key = `${SESSION_KEY}_${userId}`;
  const start = Date.now();
  return () => {
    const elapsed = (Date.now() - start) / 60000;
    const prev = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, String(prev + elapsed));
  };
}

export function getTotalMinutes(userId) {
  return parseFloat(localStorage.getItem(`${SESSION_KEY}_${userId}`) || '0');
}

// Pages that should NOT show the sidebar
const NO_SIDEBAR_PATHS = ['/pricing', '/support', '/settings'];

export default function Layout() {
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);

  const isMobile = useIsMobile();
  const location = useLocation();

  const hideSidebar = NO_SIDEBAR_PATHS.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    initTheme();
    captureReferralFromUrl();
    base44.auth.me().then(u => {
      if (!u?.id) return;
      setUser(u);
      setUserPlan(getUserPlan(u));
      const cleanup = trackSession(u.id);
      return cleanup;
    }).catch(() => {});
  }, []);

  useEffect(() => {
    return onCreditsUpdate(({ credits_used }) => {
      setUser(prev => prev ? { ...prev, credits_used } : prev);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex font-be">
      {/* Sidebar — hidden on excluded pages */}
      {!hideSidebar && !isMobile && (
        <Sidebar expanded={expanded} setExpanded={setExpanded} user={user} userPlan={userPlan} />
      )}

      {/* Mobile sidebar with backdrop */}
      {!hideSidebar && isMobile && (
        <AnimatePresence>
          {expanded && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-30 bg-black/50"
                onClick={() => setExpanded(false)}
              />
              <Sidebar expanded={true} setExpanded={setExpanded} user={user} userPlan={userPlan} />
            </>
          )}
        </AnimatePresence>
      )}

      <main
        className="flex-1 min-h-screen overflow-x-hidden relative transition-all duration-200"
        style={{ marginLeft: (!hideSidebar && !isMobile) ? (expanded ? EXPANDED_W : COLLAPSED_W) : 0 }}
      >
        {/* Hamburger toggle — only when sidebar is allowed and collapsed */}
        {!hideSidebar && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="fixed top-4 left-4 z-30 p-2 bg-[#1C1C1C] border border-[#2A2A2A] text-gray-400 hover:text-white rounded-md transition-colors shadow-sm"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
}