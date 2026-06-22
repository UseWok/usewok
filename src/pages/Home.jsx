import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import WebsiteScanner from '../components/home/WebsiteScanner';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';
import { initUserCredits, checkAndRenewCredits } from '@/lib/credits';

const PENDING_KEY = 'stensor_pending_query';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserOnboarding, setShowUserOnboarding] = useState(false);
  // Cloud-only: savedUrl + cachedData from BusinessProfile
  const [savedUrl, setSavedUrl] = useState(null);
  const [cachedData, setCachedData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartY = useRef(null);
  const pullDelta = useRef(0);
  const [pullIndicator, setPullIndicator] = useState(0); // 0–1 progress

  useEffect(() => {
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) { localStorage.removeItem(PENDING_KEY); navigate(`/chat?q=${encodeURIComponent(pending)}`); return; }

    base44.auth.me().then(async u => {
      if (!u) { setLoadingProfile(false); return; }
      await initUserCredits(u).catch(() => {});
      const updated = await checkAndRenewCredits(u).catch(() => u);
      setUser(updated);

      // Cloud-only: load from BusinessProfile
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      if (profiles.length > 0 && profiles[0].site_url) {
        const p = profiles[0];
        let extra = {};
        try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
        const fullData = {
          business_name: p.identity_name,
          business_type: p.identity_industry,
          city: p.identity_city,
          ai_visibility_score: p.score_ai_visibility,
          message_clarity_score: p.score_message_clarity,
          commercial_presence_score: p.score_commercial_signal,
          overall_score: p.score_overall,
          ...extra,
        };
        setSavedUrl(p.site_url);
        setCachedData(fullData);
      }
      setLoadingProfile(false);
    }).catch(() => setLoadingProfile(false));

    if (shouldShowUserOnboarding()) setTimeout(() => setShowUserOnboarding(true), 800);
    else if (shouldShowTensorsOnboarding()) setTimeout(() => setShowOnboarding(true), 1200);
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const effectiveAutoUrl = savedUrl || null;

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e) => {
    const el = e.currentTarget;
    if (el.scrollTop === 0) pullStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (pullStartY.current == null) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0) {
      pullDelta.current = delta;
      setPullIndicator(Math.min(delta / 80, 1));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDelta.current > 80 && !refreshing) {
      setRefreshing(true);
      setPullIndicator(0);
      pullStartY.current = null;
      pullDelta.current = 0;
      // Re-fetch profile
      try {
        const u = await base44.auth.me();
        if (u) {
          const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
          if (profiles.length > 0 && profiles[0].site_url) {
            const p = profiles[0];
            let extra = {};
            try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
            const fullData = { business_name: p.identity_name, business_type: p.identity_industry, city: p.identity_city, ai_visibility_score: p.score_ai_visibility, message_clarity_score: p.score_message_clarity, commercial_presence_score: p.score_commercial_signal, overall_score: p.score_overall, ...extra };
            setSavedUrl(p.site_url);
            setCachedData(fullData);
          }
        }
      } catch {}
      setTimeout(() => setRefreshing(false), 600);
    } else {
      setPullIndicator(0);
      pullStartY.current = null;
      pullDelta.current = 0;
    }
  }, [refreshing]);

  if (loadingProfile) {
    return (
      <div style={{
        minHeight: '100vh', background: '#FFFFFF', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '48px 24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {/* AI engine pills skeleton */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[80, 70, 75, 90].map((w, i) => (
            <div key={i} style={{ width: w, height: 28, borderRadius: 20, background: 'linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)', backgroundSize: '400% 100%', animation: 'skshimmer 1.4s ease-in-out infinite' }} />
          ))}
        </div>
        {/* Title skeleton */}
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 340, height: 36, borderRadius: 8, background: 'linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)', backgroundSize: '400% 100%', animation: 'skshimmer 1.4s ease-in-out infinite' }} />
          <div style={{ width: 220, height: 36, borderRadius: 8, background: 'linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)', backgroundSize: '400% 100%', animation: 'skshimmer 1.4s ease-in-out infinite' }} />
          <div style={{ width: 260, height: 16, borderRadius: 6, marginTop: 4, background: 'linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)', backgroundSize: '400% 100%', animation: 'skshimmer 1.4s ease-in-out infinite' }} />
        </div>
        {/* Input skeleton */}
        <div style={{ width: '100%', maxWidth: 620, height: 54, borderRadius: 14, background: 'linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)', backgroundSize: '400% 100%', animation: 'skshimmer 1.4s ease-in-out infinite' }} />
        <style>{`@keyframes skshimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
      </div>
    );
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: '100vh', width: '100%',
        background: '#FFFFFF',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflowX: 'hidden', overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Pull-to-refresh indicator */}
      {(pullIndicator > 0 || refreshing) && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 48, pointerEvents: 'none',
          opacity: refreshing ? 1 : pullIndicator,
          transition: refreshing ? 'none' : 'opacity 0.1s',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '3px solid #F1F0EE', borderTopColor: '#7C3AED',
            animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
            transform: refreshing ? 'none' : `rotate(${pullIndicator * 270}deg)`,
          }} />
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {showUserOnboarding && <UserOnboarding onClose={() => setShowUserOnboarding(false)} />}
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}

      {user?.role === 'admin' && (
        <div style={{ position: 'fixed', top: 14, right: 16, zIndex: 100 }}>
          <button onClick={() => navigate('/admin')}
            style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #D1D1D1', background: '#fff', color: '#444', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Admin →
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px 60px', minHeight: '60vh', position: 'relative', zIndex: 1, width: '100%', maxWidth: 660, margin: '0 auto', boxSizing: 'border-box' }}>
        <WebsiteScanner firstName={firstName} autoUrl={effectiveAutoUrl} cachedData={cachedData} />
      </div>
    </div>
  );

}