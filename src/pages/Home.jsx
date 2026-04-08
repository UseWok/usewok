import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import RecentApps from '../components/home/RecentApps';
import { AGENTS } from '../components/Sidebar';
import { useLanguage } from '@/lib/i18n';

const PENDING_KEY = 'stensor_pending_query';

export default function Home() {
  const urlParams = new URLSearchParams(window.location.search);
  const agentFromUrl = urlParams.get('agent');
  const [selectedAgent, setSelectedAgent] = useState(agentFromUrl || null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      localStorage.removeItem(PENDING_KEY);
      // Use best available mode for the user
      const params = new URLSearchParams({ q: pending });
      navigate(`/chat?${params.toString()}`);
    }
  }, []);

  return (
    <div className="min-h-screen py-12 md:py-20">
      <HeroSection agentId={selectedAgent} onAgentChange={setSelectedAgent} />
      <RecentApps agentId={selectedAgent} />
    </div>
  );
}