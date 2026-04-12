import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeEventBanner from '../components/home/HomeEventBanner';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import HeroSection from '../components/home/HeroSection';
import RecentApps from '../components/home/RecentApps';
import { AGENTS } from '../components/Sidebar';
import { useLanguage } from '@/lib/i18n';

const PENDING_KEY = 'stensor_pending_query';

export default function Home() {
  const urlParams = new URLSearchParams(window.location.search);
  const agentFromUrl = urlParams.get('agent');
  const [selectedAgent, setSelectedAgent] = useState(agentFromUrl || null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      localStorage.removeItem(PENDING_KEY);
      const params = new URLSearchParams({ q: pending });
      navigate(`/chat?${params.toString()}`);
    }
    // Show onboarding for new users
    if (shouldShowTensorsOnboarding()) {
      setTimeout(() => setShowOnboarding(true), 1200);
    }
  }, []);

  return (
    <div className="min-h-screen pt-4 pb-12 md:pt-6 md:pb-20">
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}
      <HomeEventBanner />
      <HeroSection agentId={selectedAgent} onAgentChange={setSelectedAgent} />
      <RecentApps agentId={selectedAgent} />
    </div>
  );
}