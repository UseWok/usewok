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
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const isMobile = useIsMobile();
  const location = useLocation();

  const showSidebar = !isMobile;

  useEffect(() => {
    const shouldExpand = SIDEBAR_EXPANDED_PATHS.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
    setExpanded(shouldExpand);
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

  return (
    <div style={{ height: '100vh', background: '#0B0B0E', display: 'flex', overflow: 'hidden' }}>
      {showSidebar && <Sidebar expanded={expanded} setExpanded={setExpanded} user={user} userPlan={userPlan} />}

      <motion.div
        style={{
          flex: 1, height: '100vh', overflow: 'hidden', position: 'relative',
          padding: isMobile ? 0 : '10px 10px 10px 0',
          display: 'flex',
        }}
        animate={{ marginLeft: sidebarOffset }}
        transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Inner content window — rounded on desktop only */}
        <div style={{
          flex: 1,
          borderRadius: isMobile ? 0 : 16,
          overflow: 'auto',
          position: 'relative',
          background: '#0F0F12',
        }}>
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}