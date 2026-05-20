import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Sidebar, { COLLAPSED_W, EXPANDED_W } from './Sidebar';
import { getUserPlan } from '@/lib/plans-config';
import { onCreditsUpdate } from '@/lib/credits-events';
import { captureReferralFromUrl } from '@/lib/referral';
import { useIsMobile } from '@/hooks/use-mobile';

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

export default function Layout() {
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [activePopover, setActivePopover] = useState(null);
  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const tensorsRef = useRef(null);

  const isMobile = useIsMobile();
  const location = useLocation();
  const isChat = location.pathname === '/chat';

  useEffect(() => {
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

  const lastSeen = parseInt(localStorage.getItem('stensor_notifs_last_seen') || '0');
  const dnaComplete = user ? ['ai_vision', 'ai_personality', 'ai_golden_rule', 'ai_tone', 'ai_depth', 'ai_context'].every(f => user[f] && String(user[f]).trim().length > 0) : true;
  const hasUnread = !dnaComplete;

  const used = user?.credits_used || 0;
  const limit = userPlan?.credits_limit || user?.credits_limit || 10;
  const bonus = user?.credits_bonus || 0;
  const total = limit + bonus;
  const pct = Math.min((used / total) * 100, 100);

  const togglePopover = (name) => {
    if (name === 'noti') localStorage.setItem('stensor_notifs_last_seen', String(Date.now()));
    setActivePopover(p => p === name ? null : name);
  };

  const sidebarProps = {
    expanded, setExpanded,
    user, userPlan, hasUnread,
    togglePopover, activePopover,
    profileRef, notiRef, tensorsRef,
    pct,
  };

  return (
    <div className="min-h-screen bg-white flex font-be">
      {!isMobile && !isChat && <Sidebar {...sidebarProps} />}

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
              <Sidebar {...sidebarProps} expanded={true} />
            </>
          )}
        </AnimatePresence>
      )}

      <main
        className="flex-1 min-h-screen overflow-x-hidden relative"
        style={{ marginLeft: isMobile ? 0 : (expanded ? EXPANDED_W : COLLAPSED_W), transition: 'margin-left 0.2s ease' }}
      >
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