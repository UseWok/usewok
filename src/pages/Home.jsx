import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import HeroSection from '../components/home/HeroSection';
import RecentApps from '../components/home/RecentApps';
import DuolingoPath from '../components/home/DuolingoPath';
import { AGENTS } from '../components/Sidebar';
import { useLanguage } from '@/lib/i18n';

const PENDING_KEY = 'stensor_pending_query';

export default function Home() {
  const urlParams = new URLSearchParams(window.location.search);
  const agentFromUrl = urlParams.get('agent');
  const [selectedAgent, setSelectedAgent] = useState(agentFromUrl || null);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [pageSettings, setPageSettings] = useState({ show_parcours: true, show_community: true });

  useEffect(() => {
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      localStorage.removeItem(PENDING_KEY);
      const params = new URLSearchParams({ q: pending, mode: 'thinking', model: 'gemini_3_1_pro', webSearch: '0' });
      navigate(`/chat?${params.toString()}`);
    }
  }, []);

  useEffect(() => {
    base44.entities.AppSettings.filter({ key: 'home_page_settings' })
      .then(results => {
        if (results.length > 0) {
          try { setPageSettings(JSON.parse(results[0].value)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen py-12 md:py-20">
      <HeroSection agentId={selectedAgent} onAgentChange={setSelectedAgent} />
      <RecentApps agentId={selectedAgent} />
      {pageSettings.show_parcours && <DuolingoPath />}
    </div>
  );
}