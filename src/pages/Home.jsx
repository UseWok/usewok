import { useState, useEffect, useRef } from 'react';
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

  if (loadingProfile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '3px solid #E5E7EB', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#FFFFFF',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif', overflowY: 'auto',
    }}>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px 60px', minHeight: '60vh', position: 'relative', zIndex: 1, width: '100%', maxWidth: 900, margin: '0 auto' }}>
        <WebsiteScanner firstName={firstName} autoUrl={effectiveAutoUrl} cachedData={cachedData} />
      </div>
    </div>
  );
}