import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomTabs from './BottomTabs';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
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
  const BORDER_BOTTOM = 36;
  const CORNER_R = 14;

  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  useEffect(() => {
    const unsub = onActiveDomainChange(d => setActiveDomainState(d));
    return unsub;
  }, []);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);

  const RATINGS = [
    { key: 'mauvais',  emoji: '👎', label: 'Mauvais' },
    { key: 'mediocre', emoji: '😞', label: 'Médiocre' },
    { key: 'correct',  emoji: '😐', label: 'Correct' },
    { key: 'bien',     emoji: '😊', label: 'Bien' },
    { key: 'jadore',   emoji: '🤩', label: "J'adore" },
  ];

  const isGood = (r) => r === 'bien' || r === 'jadore';

  const handleRatingClick = (key) => {
    if (feedbackSending) return;
    setFeedbackRating(key);
    setFeedbackText('');
    // Bad ratings → send immediately as ticket
    if (!isGood(key)) handleFeedbackSend(key, '');
  };

  const handleFeedbackSend = async (rating, text) => {
    setFeedbackSending(true);
    try {
      if (!isGood(rating)) {
        await base44.entities.SupportTicket.create({
          description: `Feedback automatique — Note : ${rating}${text ? '\n\n' + text : ''}`,
          category: 'other',
          status: 'open',
          user_email: user?.email || '',
          user_name: user?.full_name || '',
        });
      } else {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: 'support@wok.so',
          subject: `Feedback utilisateur — ${rating}`,
          body: `Note: ${rating}\nUtilisateur: ${user?.email || 'inconnu'}\n\nMessage: ${text || '(aucun)'}`,
        });
      }
    } catch {}
    setFeedbackSending(false);
    setFeedbackSent(true);
    setTimeout(() => { setShowFeedback(false); setFeedbackSent(false); setFeedbackRating(null); setFeedbackText(''); }, 2200);
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

      {/* Bottom bar: heart + active domain */}
      {!isMobile && (
        <div style={{ position: 'fixed', bottom: 10, right: 16, zIndex: 60, display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeDomain && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: 'rgba(0,0,0,0.06)', maxWidth: 180 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeDomain.url.replace(/https?:\/\//, '').split('/')[0]}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowFeedback(true)}
            title="Feedback"
            style={{
              width: 26, height: 26,
              background: 'transparent', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.55, transition: 'opacity 120ms',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.55'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(10,10,11,0.55)', backdropFilter: 'blur(8px)' }}
              onClick={() => { setShowFeedback(false); setFeedbackRating(null); setFeedbackText(''); }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '0 20px 70px', pointerEvents: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.96 }} transition={{ duration: 0.22, ease: [0.22,1,0.36,1] }}
                onClick={e => e.stopPropagation()}
                style={{ background: '#fff', border: '1px solid #E8E8E6', borderRadius: 18, padding: '22px 20px 20px', width: 320, boxShadow: '0 20px 60px rgba(0,0,0,0.16)', position: 'relative', pointerEvents: 'auto' }}
              >
                <button onClick={() => { setShowFeedback(false); setFeedbackRating(null); setFeedbackText(''); }}
                  style={{ position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: 7, border: '1px solid #EBEBEB', background: '#F7F7F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="#999" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>

                {feedbackSent ? (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <p style={{ fontSize: 28, margin: '0 0 8px' }}>🎉</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>Merci pour votre retour !</p>
                    <p style={{ fontSize: 12, color: '#888', margin: 0, lineHeight: 1.6 }}>Vos retours façonnent ce que nous construisons.</p>
                  </div>
                ) : !feedbackRating || !isGood(feedbackRating) ? (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 3px' }}>Comment est votre expérience ?</p>
                    <p style={{ fontSize: 11.5, color: '#888', margin: '0 0 16px', lineHeight: 1.5 }}>Un clic suffit pour les notes basses. Un message pour les bonnes !</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                      {RATINGS.map(r => (
                        <button key={r.key} onClick={() => handleRatingClick(r.key)}
                          disabled={feedbackSending}
                          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '9px 2px', borderRadius: 10, border: feedbackRating === r.key ? '2px solid #F95738' : '1px solid #EBEBEB', background: feedbackRating === r.key ? 'rgba(249,87,56,0.05)' : '#FAFAFA', cursor: 'pointer', transition: 'all 130ms', opacity: feedbackSending ? 0.5 : 1 }}>
                          <span style={{ fontSize: 18 }}>{r.emoji}</span>
                          <span style={{ fontSize: 9, fontWeight: 600, color: feedbackRating === r.key ? '#F95738' : '#999', whiteSpace: 'nowrap' }}>{r.label}</span>
                        </button>
                      ))}
                    </div>
                    {feedbackSending && (
                      <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', margin: '12px 0 0' }}>Envoi en cours…</p>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 22 }}>{RATINGS.find(r => r.key === feedbackRating)?.emoji}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>Super, merci ! 🙏</p>
                        <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Vous pouvez laisser un message (optionnel)</p>
                      </div>
                    </div>
                    <textarea
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      placeholder="Ce que vous aimez, ce que vous changeriez…"
                      rows={3}
                      autoFocus
                      style={{ width: '100%', padding: '9px 11px', fontSize: 12, border: '1px solid #E0E0E0', borderRadius: 9, outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif', color: '#111', background: '#FAFAFA', boxSizing: 'border-box', marginBottom: 10 }}
                    />
                    <button onClick={() => handleFeedbackSend(feedbackRating, feedbackText)}
                      disabled={feedbackSending}
                      style={{ width: '100%', padding: '9px 0', background: '#111', color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: feedbackSending ? 0.5 : 1 }}>
                      {feedbackSending ? 'Envoi…' : 'Envoyer'}
                    </button>
                    <button onClick={() => handleFeedbackSend(feedbackRating, '')}
                      style={{ width: '100%', marginTop: 6, padding: '6px 0', background: 'transparent', border: 'none', fontSize: 11, color: '#aaa', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      Passer sans message
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
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
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
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Mobile bottom tabs */}
        {isMobile && <BottomTabs />}
      </motion.main>
    </div>
  );
}