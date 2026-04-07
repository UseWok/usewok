import { useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import RecentApps from '../components/home/RecentApps';
import DuolingoPath from '../components/home/DuolingoPath';
import { AGENTS } from '../components/Sidebar';
import { useLanguage } from '@/lib/i18n';

export default function Home() {
  const urlParams = new URLSearchParams(window.location.search);
  const agentFromUrl = urlParams.get('agent');
  const [selectedAgent, setSelectedAgent] = useState(agentFromUrl || null);
  const { t } = useLanguage();
  const agentInfo = AGENTS.find(a => a.id === selectedAgent);

  return (
    <div className="min-h-screen py-12 md:py-20">
      {agentInfo && (
        <div className="max-w-2xl mx-auto px-4 pt-16 pb-0 text-center">
          <p className="text-2xl font-black" style={{ color: '#0A0A0A' }}>{t(agentInfo.labelKey)}</p>
        </div>
      )}
      <HeroSection agentId={selectedAgent} onAgentChange={setSelectedAgent} />
      <RecentApps agentId={selectedAgent} />
      <DuolingoPath />
    </div>
  );
}