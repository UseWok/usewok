import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeEventBanner from '../components/home/HomeEventBanner';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';
import HeroSection from '../components/home/HeroSection';
import RecentApps from '../components/home/RecentApps';
import { AGENTS } from '../components/Sidebar';
import { useLanguage } from '@/lib/i18n';

const PENDING_KEY = 'stensor_pending_query';

export default function Home() {
  const urlParams = new URLSearchParams(window.location.search);
  const agentFromUrl = urlParams.get('agent');
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState(agentFromUrl || null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserOnboarding, setShowUserOnboarding] = useState(false);

  useEffect(() => {
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      localStorage.removeItem(PENDING_KEY);
      const params = new URLSearchParams({ q: pending });
      navigate(`/chat?${params.toString()}`);
    }
    if (shouldShowUserOnboarding()) {
      setTimeout(() => setShowUserOnboarding(true), 800);
    } else if (shouldShowTensorsOnboarding()) {
      setTimeout(() => setShowOnboarding(true), 1200);
    }
  }, []);

  return (
    <div className="min-h-screen pt-4 pb-12 md:pt-6 md:pb-20 relative overflow-hidden" style={{
      background: 'linear-gradient(to top, rgba(221,255,0,0.55) 0%, rgba(221,255,0,0.28) 25%, rgba(221,255,0,0.09) 55%, rgba(221,255,0,0.02) 75%, white 100%)'
    }}>
      {/* Subtle gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(221,255,0,0.07), transparent)' }} />
      {showUserOnboarding && <UserOnboarding onClose={() => setShowUserOnboarding(false)} />}
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}
      <HomeEventBanner />
      <HeroSection agentId={selectedAgent} onAgentChange={setSelectedAgent} />
      <RecentApps agentId={selectedAgent} />
    </div>
  );
}