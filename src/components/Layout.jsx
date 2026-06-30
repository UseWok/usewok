import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
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
  const FRAME_BG = '#FFFFFF';
  const BORDER_TOP = 11;
  const BORDER_SIDE = 11;
  const BORDER_BOTTOM = 36;
  const CORNER_R = 14;

  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  useEffect(() => {
    const unsub = onActiveDomainChange(d => setActiveDomainState(d));
    return unsub;
  }, []);

  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);

  const RATINGS = [
    { key: 'mauvais',  emoji: '👎', label: 'Mauvais',  color: '#EF4444' },
    { key: 'mediocre', emoji: '😞', label: 'Médiocre', color: '#EF4444' },
    { key: 'correct',  emoji: '😐', label: 'Correct',  color: '#F59E0B' },
    { key: 'bien',     emoji: '😊', label: 'Bien',     color: '#10B981' },
    { key: 'jadore',   emoji: '🤩', label: "J'adore", color: '#10B981' },
  ];

  const isGood = (r) => r === 'bien' || r === 'jadore' || r === 'correct';

  const handleRatingClick = (key) => {
    if (feedbackSending) return;
    setFeedbackRating(key);
    setFeedbackText('');
  };

  const handleFeedbackSend = async () => {
    if (!feedbackRating) return;
    setFeedbackSending(true);
    try {
      if (!isGood(feedbackRating)) {
        await base44.entities.SupportTicket.create({
          description: `Feedback automatique — Note : ${feedbackRating}${feedbackText ? `\n\nMessage: ${feedbackText}` : ''}`,
          category: 'other',
          status: 'open',
          user_email: user?.email || '',
          user_name: user?.full_name || '',
        });
        setFeedbackSending(false);
        setShowFeedback(false);
        setFeedbackRating(null);
        setFeedbackText('');
        navigate('/support');
        return;
      } else {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: 'support@wok.so',
          subject: `Feedback utilisateur — ${feedbackRating}`,
          body: `Note: ${feedbackRating}\nUtilisateur: ${user?.email || 'inconnu'}\n\nMessage: ${feedbackText || '(aucun)'}`,
        });
      }
    } catch {}
    setFeedbackSending(false);
    setFeedbackSent(true);
    setTimeout(() => { setShowFeedback(false); setFeedbackSent(false); setFeedbackRating(null); setFeedbackText(''); }, 2000);
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

      {/* Bottom bar: fire + active domain */}
      {!isMobile && (
        <div style={{ position: 'fixed', bottom: 10, right: 16, zIndex: 60, display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeDomain && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px', borderRadius: 8, background: 'rgba(0,0,0,0.05)', maxWidth: 180 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeDomain.url.replace(/https?:\/\//, '').split('/')[0]}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowFeedback(true)}
            title="Donner un feedback"
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(0,0,0,0.05)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 120ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.10)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
          >
            <Flame size={14} color="#F95738" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Feedback Modal — centered */}
      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(10,10,11,0.45)', backdropFilter: 'blur(6px)' }}
              onClick={() => { setShowFeedback(false); setFeedbackRating(null); setFeedbackText(''); }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }} transition={{ duration: 0.22, ease: [0.22,1,0.36,1] }}
                onClick={e => e.stopPropagation()}
                style={{ background: '#fff', border: '1px solid #E8E8E6', borderRadius: 20, padding: '28px 24px 24px', width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', position: 'relative' }}
              >
                <button onClick={() => { setShowFeedback(false); setFeedbackRating(null); setFeedbackText(''); }}
                  style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: 8, border: '1px solid #E8E8E6', background: '#F8F7F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="#999" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>

                {feedbackSent ? (
                  <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>Merci pour votre retour !</p>
                    <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.6 }}>Vos retours nous aident à nous améliorer.</p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#111', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Comment est votre expérience ?</p>
                    <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.5 }}>Vos retours façonnent ce que nous construisons ensuite.</p>

                    {/* 5 rating squares — color coded */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                      {RATINGS.map(r => {
                        const selected = feedbackRating === r.key;
                        return (
                          <button key={r.key} onClick={() => handleRatingClick(r.key)}
                            disabled={feedbackSending}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 4px 12px', borderRadius: 14, border: selected ? `2px solid ${r.color}` : '1.5px solid #E8E8E6', background: selected ? `${r.color}12` : '#FAFAF9', cursor: 'pointer', transition: 'all 130ms' }}>
                            <span style={{ fontSize: 24, lineHeight: 1 }}>{r.emoji}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: selected ? r.color : '#999', whiteSpace: 'nowrap' }}>{r.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Textarea always visible */}
                    {(!feedbackRating || isGood(feedbackRating)) && (
                      <textarea
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        placeholder="Dites-nous ce que vous en pensez..."
                        rows={3}
                        style={{ width: '100%', padding: '11px 13px', fontSize: 13, border: '1.5px solid #E8E8E6', borderRadius: 12, outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif', color: '#111', background: '#fff', boxSizing: 'border-box', marginBottom: 12, transition: 'border-color 150ms' }}
                        onFocus={e => e.target.style.borderColor = '#F95738'}
                        onBlur={e => e.target.style.borderColor = '#E8E8E6'}
                      />
                    )}

                    {/* Send / Support button */}
                    {feedbackRating && !isGood(feedbackRating) ? (
                      <button onClick={handleFeedbackSend} disabled={feedbackSending}
                        style={{ width: '100%', padding: '13px 0', background: '#EF4444', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: feedbackSending ? 0.6 : 1 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        {feedbackSending ? 'Envoi…' : 'Aller au support'}
                      </button>
                    ) : (
                      <button onClick={handleFeedbackSend} disabled={feedbackSending || !feedbackRating}
                        style={{ width: '100%', padding: '13px 0', background: feedbackRating ? '#0A0A0B' : '#F0EFED', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, color: feedbackRating ? '#fff' : '#aaa', cursor: feedbackRating ? 'pointer' : 'default', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: feedbackSending ? 0.6 : 1, transition: 'all 180ms' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        {feedbackSending ? 'Envoi…' : 'Envoyer'}
                      </button>
                    )}
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