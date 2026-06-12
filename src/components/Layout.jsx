import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const SIDEBAR_EXPANDED_PATHS = ['/app', '/cockpit', '/discussions', '/ai-dna'];

export default function Layout() {
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem('wok_sidebar_expanded') === 'true'; } catch { return false; }
  });
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const isMobile = useIsMobile();
  const location = useLocation();

  const showSidebar = !isMobile;

  const handleSetExpanded = (val) => {
    setExpanded(val);
    try { localStorage.setItem('wok_sidebar_expanded', String(val)); } catch {}
  };

  useEffect(() => {
    const saved = localStorage.getItem('wok_sidebar_expanded');
    if (saved === null) {
      // First visit: expand on certain paths
      const shouldExpand = SIDEBAR_EXPANDED_PATHS.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
      handleSetExpanded(shouldExpand);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const sidebarOffset = isMobile ? 0 : (expanded ? EXPANDED_W : COLLAPSED_W);
  const BORDER_COLOR = '#0E0E0E';
  const BORDER_W = 13;
  const CORNER_R = 20;

  return (
    <div style={{ minHeight: '100vh', background: '#0E0E0E', display: 'flex' }}>
      {showSidebar && <Sidebar expanded={expanded} setExpanded={handleSetExpanded} user={user} userPlan={userPlan} />}

      {/* Rounded device-frame corners — four absolute corner pieces */}
      {!isMobile && (
        <>
          {/* Top-right corner */}
          <div style={{ position: 'fixed', top: 0, right: 0, width: CORNER_R, height: CORNER_R, background: BORDER_COLOR, zIndex: 51, pointerEvents: 'none',
            borderBottomLeftRadius: CORNER_R }} />
          {/* Bottom-right corner */}
          <div style={{ position: 'fixed', bottom: 0, right: 0, width: CORNER_R, height: CORNER_R, background: BORDER_COLOR, zIndex: 51, pointerEvents: 'none',
            borderTopLeftRadius: CORNER_R }} />
          {/* Top border strip */}
          <motion.div animate={{ left: sidebarOffset }} transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'fixed', top: 0, right: CORNER_R, height: BORDER_W, background: BORDER_COLOR, zIndex: 50, pointerEvents: 'none' }} />
          {/* Right border strip */}
          <div style={{ position: 'fixed', top: CORNER_R, right: 0, width: BORDER_W, bottom: CORNER_R, background: BORDER_COLOR, zIndex: 50, pointerEvents: 'none' }} />
          {/* Bottom border strip */}
          <motion.div animate={{ left: sidebarOffset }} transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'fixed', bottom: 0, right: CORNER_R, height: BORDER_W, background: BORDER_COLOR, zIndex: 50, pointerEvents: 'none' }} />
        </>
      )}

      <motion.main
        style={{ flex: 1, minHeight: '100vh', overflow: 'hidden', position: 'relative', borderRadius: isMobile ? 0 : 18 }}
        animate={{ marginLeft: sidebarOffset }}
        transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}