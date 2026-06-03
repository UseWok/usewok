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

  // Sidebar slides in over content — no offset needed
  const sidebarOffset = expanded ? EXPANDED_W : 0;

  return (
    <div className="min-h-screen bg-background flex font-be">

      {/* Sidebar — always rendered, slides in/out */}
      <Sidebar expanded={expanded} setExpanded={setExpanded} user={user} userPlan={userPlan} />

      {/* Main content — shifts right when sidebar is open (desktop only) */}
      <motion.main
        className="flex-1 min-h-screen overflow-x-hidden relative"
        animate={{ marginLeft: isMobile ? 0 : sidebarOffset }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Hamburger toggle button — visible when sidebar is closed */}
        <AnimatePresence>
          {!expanded && (
            <motion.button
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              onClick={() => setExpanded(true)}
              style={{
                position: 'fixed', top: 14, left: 14, zIndex: 38,
                width: 32, height: 32, borderRadius: 8,
                background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
        <Outlet />
      </motion.main>
    </div>
  );
}