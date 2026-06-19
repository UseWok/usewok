import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { base44 } from '@/api/base44Client';
import Sidebar, { COLLAPSED_W, EXPANDED_W } from './Sidebar';
import { getUserPlan } from '@/lib/plans-config';
import { onCreditsUpdate } from '@/lib/credits-events';
import { captureReferralFromUrl } from '@/lib/referral';
import { useIsMobile } from '@/hooks/use-mobile';
import { initTheme } from '@/lib/theme';
import { useAuth } from '@/lib/AuthContext';

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
  const FRAME_BG = '#F8F7F4';
  const BORDER_TOP = 8;
  const BORDER_SIDE = 8;
  const BORDER_BOTTOM = 24;
  const CORNER_R = 14;

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackEmoji, setFeedbackEmoji] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const EMOJIS = [
    { icon: '😡', label: 'Terrible' },
    { icon: '😕', label: 'Poor' },
    { icon: '😐', label: 'Okay' },
    { icon: '😊', label: 'Good' },
    { icon: '🤩', label: 'Amazing' },
  ];

  const handleFeedbackSend = () => {
    if (!feedbackEmoji) return;
    setFeedbackSent(true);
    setTimeout(() => { setShowFeedback(false); setFeedbackSent(false); setFeedbackEmoji(null); setFeedbackNote(''); }, 1800);
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
            width: 36, height: 36, borderRadius: 9, border: 'none',
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

      {/* Feedback button — bottom-right of thick bottom border */}
      {!isMobile && (
        <button
          onClick={() => setShowFeedback(true)}
          style={{
            position: 'fixed', bottom: 9, right: 14, zIndex: 60,
            height: 22, padding: '0 10px',
            background: '#111', border: 'none', borderRadius: 6,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em',
            opacity: 0.75, transition: 'opacity 120ms',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.75'}
        >
          <span style={{ fontSize: 12 }}>💬</span> Feedback
        </button>
      )}

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowFeedback(false)} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }} transition={{ duration: 0.17 }}
                onClick={e => e.stopPropagation()}
                style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, padding: '24px', width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.14)' }}
              >
                {feedbackSent ? (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <p style={{ fontSize: 28, margin: '0 0 8px' }}>🎉</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>Thank you!</p>
                    <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Your feedback helps us improve.</p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>How's your experience?</p>
                    <p style={{ fontSize: 12.5, color: '#888', margin: '0 0 18px' }}>Tap an emoji to rate, then add a note.</p>
                    {/* Emoji row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      {EMOJIS.map(e => (
                        <button key={e.label} onClick={() => setFeedbackEmoji(e.label)}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 10px', borderRadius: 10, border: feedbackEmoji === e.label ? '1.5px solid #111' : '1.5px solid transparent', background: feedbackEmoji === e.label ? 'rgba(0,0,0,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 120ms' }}>
                          <span style={{ fontSize: 24 }}>{e.icon}</span>
                          <span style={{ fontSize: 10, color: '#888', fontWeight: feedbackEmoji === e.label ? 600 : 400 }}>{e.label}</span>
                        </button>
                      ))}
                    </div>
                    {/* Note */}
                    <textarea
                      value={feedbackNote} onChange={e => setFeedbackNote(e.target.value)}
                      placeholder="Anything else you'd like to share? (optional)"
                      style={{ width: '100%', height: 72, padding: '9px 11px', fontSize: 12.5, border: '1px solid #E0E0E0', borderRadius: 8, outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif', color: '#333', background: '#FAFAFA', boxSizing: 'border-box', marginBottom: 12 }}
                    />
                    <button onClick={handleFeedbackSend} disabled={!feedbackEmoji}
                      style={{ width: '100%', padding: '10px 0', background: feedbackEmoji ? '#111' : '#F0F0EE', border: 'none', borderRadius: 9, cursor: feedbackEmoji ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, color: feedbackEmoji ? '#fff' : '#aaa', transition: 'all 120ms' }}>
                      Send Feedback
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

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
          ...(isMobile ? {} : {
            marginTop: BORDER_TOP,
            marginRight: BORDER_SIDE,
            marginBottom: BORDER_BOTTOM,
            marginLeft: 0,
            borderRadius: CORNER_R,
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: '#FFFFFF',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }),
        }}
      >
        {/* Inner scroll container so bottom border is always visible */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}