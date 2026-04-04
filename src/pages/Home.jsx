import { useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import RecentApps from '../components/home/RecentApps';
import DuolingoPath from '../components/home/DuolingoPath';

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState(null);

  return (
    <div className="min-h-screen py-12 md:py-20">
      <HeroSection agentId={selectedAgent} onAgentChange={setSelectedAgent} />
      <RecentApps agentId={selectedAgent} />
      <DuolingoPath />
    </div>
  );
}