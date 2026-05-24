import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import Sidebar, { COLLAPSED_W, EXPANDED_W, SIDEBAR_MARGIN } from './Sidebar';
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

// Pages that show sidebar but expanded by default
const SIDEBAR_EXPANDED_PATHS = ['/app', '/cockpit', '/discussions', '/ai-dna'];

export default function Layout() {
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Sidebar always shown in Layout routes (excluded pages use different routes)
  const showSidebar = !isMobile;

  // Auto-expand sidebar on "standard" pages, collapse on chat-like pages
  useEffect(() => {
    const shouldExpand = SIDEBAR_EXPANDED_PATHS.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
    setExpanded(shouldExpand);
  }, [location.pathname]);

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

  // Width the main content area should shift by
  const sidebarOffset = showSidebar ? (expanded ? EXPANDED_W : COLLAPSED_W) + SIDEBAR_MARGIN * 2 : 0;

  return (
    <div className="min-h-screen bg-background flex font-be">

      {/* Floating Sidebar — desktop */}
      {showSidebar && (
        <Sidebar expanded={expanded} setExpanded={setExpanded} user={user} userPlan={userPlan} />
      )}

      {/* Mobile sidebar with backdrop */}
      {isMobile && (
        <AnimatePresence>
          {expanded && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                onClick={() => setExpanded(false)}
              />
              <Sidebar expanded={true} setExpanded={setExpanded} user={user} userPlan={userPlan} />
            </>
          )}
        </AnimatePresence>
      )}

      {/* Main content — shifts right to make room for floating sidebar */}
      <motion.main
        className="flex-1 min-h-screen overflow-x-hidden relative"
        animate={{ marginLeft: sidebarOffset }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}