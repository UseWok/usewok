import { useState, useEffect, useRef, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import RouteSkeleton from '@/components/ui/RouteSkeleton';
import BottomTabs from './BottomTabs';
import { getActiveDomain, onActiveDomainChange, setActiveDomain } from '@/lib/active-domain';
import { motion, AnimatePresence } from 'framer-motion';

import { base44 } from '@/api/base44Client';
import Sidebar, { COLLAPSED_W, EXPANDED_W } from './Sidebar';
import { getUserPlan } from '@/lib/plans-config';
import { onCreditsUpdate } from '@/lib/credits-events';
import { captureReferralFromUrl } from '@/lib/referral';
import { useIsMobile } from '@/hooks/use-mobile';
import { initTheme } from '@/lib/theme';
import { useAuth } from '@/lib/AuthContext';
import { getCachedProfiles } from '@/lib/data-cache';

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
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const isMobile = useIsMobile();
  const location = useLocation();

  const showSidebar = true;

  const handleSetExpanded = (val) => {
    setExpanded(val);
    try { localStorage.setItem('wok_sidebar_expanded', String(val)); } catch {}
  };

  useEffect(() => {
    const saved = localStorage.getItem('wok_sidebar_expanded');
    if (saved === null) {
      const shouldExpand = SIDEBAR_EXPANDED_PATHS.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
      handleSetExpanded(shouldExpand);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ SUPPRIMÉ : noindex sur pages authentifiées — robots peuvent tout crawler
  // Les pages /app, /dashboard etc. sont maintenant entièrement accessibles aux bots

  useEffect(() => {
    initTheme();
    captureReferralFromUrl();
    if (authUser?.id) {
      setUser(authUser);
      setUserPlan(getUserPlan(authUser));
      const cleanup = trackSession(authUser.id);
      return cleanup;
    } else {
      base44.auth.me().then(u => {
        if (!u?.id) return;
        setUser(u);
        setUserPlan(getUserPlan(u));
        setAuthUser(u);
        const cleanup = trackSession(u.id);
        return cleanup;
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local user in sync with AuthContext (e.g. after plan upgrade)
  useEffect(() => {
    if (authUser?.id) {
      setUser(authUser);
      setUserPlan(getUserPlan(authUser));
    }
  }, [authUser]);

  useEffect(() => {
    return onCreditsUpdate(({ credits_used }) => {
      setUser(prev => prev ? { ...prev, credits_used } : prev);
      setAuthUser(prev => prev ? { ...prev, credits_used } : prev);
    });
  }, []);

  const sidebarOffset = isMobile ? 0 : (expanded ? EXPANDED_W : COLLAPSED_W);
  // Frame bg — EXACTLY matches index.css body background so there's no seam
  // #F8F7F4 = exact sidebar bg (--sidebar-background) — all borders same color
  const FRAME_BG = '#FFFFFF';
  const BORDER_TOP = 11;
  const BORDER_SIDE = 11;
  const BORDER_BOTTOM = 14;
  const CORNER_R = 14;

  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  useEffect(() => {
    const unsub = onActiveDomainChange(d => setActiveDomainState(d));
    return unsub;
  }, []);

  const navigate = useNavigate();

  // ── Playful, low-effort domain switcher ──
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);
  const [domainList, setDomainList] = useState([]);
  const domainMenuRef = useRef(null);

  useEffect(() => {
    if (domainMenuOpen && user?.id) {
      getCachedProfiles(user.id).then(setDomainList).catch(() => {});
    }
  }, [domainMenuOpen, user?.id]);

  useEffect(() => {
    if (!domainMenuOpen) return;
    const h = e => { if (domainMenuRef.current && !domainMenuRef.current.contains(e.target)) setDomainMenuOpen(false); };
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, [domainMenuOpen]);

  const switchDomain = (p) => {
    setActiveDomain({ url: p.site_url, name: p.identity_name || '' });
    setDomainMenuOpen(false);
  };

  return (
    <div style={{ height: '100vh', background: FRAME_BG, display: 'flex', overflow: 'hidden' }}>
      <Sidebar expanded={expanded} setExpanded={handleSetExpanded} user={user} userPlan={userPlan} />

      {/* Mobile hamburger toggle — only visible on mobile */}
      {isMobile && !expanded && (
        <button
          onClick={() => handleSetExpanded(true)}
          style={{
            position: 'fixed', top: 12, left: 12, zIndex: 50,
            width: 44, height: 44, borderRadius: 10, border: 'none',
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      {/* Bottom bar: playful domain switcher — only element shown */}
      {!isMobile && (
        <div ref={domainMenuRef} style={{ position: 'fixed', bottom: 12, right: 16, zIndex: 80 }}>
          {activeDomain && (
            <button
              onClick={() => setDomainMenuOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, height: 32, padding: '0 12px',
                borderRadius: 9, background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer', maxWidth: 200, fontFamily: 'inherit', transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#B8B5AC', flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeDomain.url.replace(/https?:\/\//, '').split('/')[0]}
              </span>
            </button>
          )}
          <AnimatePresence>
            {domainMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', minWidth: 200, overflow: 'hidden', padding: 4 }}
              >
                {domainList.length === 0 && <p style={{ fontSize: 12, color: '#999', padding: '10px 12px', margin: 0 }}>No sites yet</p>}
                {domainList.map(p => {
                  const isAct = p.site_url === activeDomain?.url;
                  return (
                    <button key={p.id} onClick={() => switchDomain(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', border: 'none', borderRadius: 7, background: isAct ? 'rgba(0,0,0,0.05)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                      onMouseEnter={e => { if (!isAct) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isAct ? 'rgba(0,0,0,0.05)' : 'transparent'; }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: isAct ? '#FF5A1F' : '#D9D6CE', flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, fontWeight: isAct ? 600 : 400, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.site_url.replace(/https?:\/\//, '').split('/')[0]}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <motion.main
        animate={{ marginLeft: sidebarOffset }}
        transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flex: 1,
          height: isMobile ? '100vh' : 'auto',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: isMobile ? 'env(safe-area-inset-top)' : 0,
          ...(isMobile ? {} : {
            marginTop: BORDER_TOP,
            marginRight: BORDER_SIDE,
            marginBottom: BORDER_BOTTOM,
            marginLeft: 0,
            borderRadius: CORNER_R,
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: '#FFFFFF',
            boxShadow: 'none',
          }),
        }}
      >
        {/* Inner scroll container with slide page transitions */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column',
          paddingBottom: isMobile ? 'calc(60px + env(safe-area-inset-bottom))' : 0,
        }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={isMobile ? { x: 30, opacity: 0 } : { opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={isMobile ? { x: -20, opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100%' }}
            >
              <Suspense fallback={<RouteSkeleton />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Mobile bottom tabs */}
        {isMobile && <BottomTabs />}
      </motion.main>
    </div>
  );
}