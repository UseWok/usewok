import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getStoredQuiz, clearStoredQuiz } from '@/components/landing/GuestQuiz';
import { useNavigate } from 'react-router-dom';
import HomeEventBanner from '../components/home/HomeEventBanner';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';
import HeroSection from '../components/home/HeroSection';
import RecentApps from '../components/home/RecentApps';
import { AGENTS } from '../components/Sidebar';
import { useLanguage } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { useIsMobile } from '@/hooks/use-mobile';

const PENDING_KEY = 'stensor_pending_query';

export default function Home() {
  const urlParams = new URLSearchParams(window.location.search);
  const agentFromUrl = urlParams.get('agent');
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState(agentFromUrl || null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserOnboarding, setShowUserOnboarding] = useState(false);
  const [showFreeBanner, setShowFreeBanner] = useState(false);
  const [isFreeUser, setIsFreeUser] = useState(false);

  const isMobile = useIsMobile(); // kept for responsive guards if needed

  useEffect(() => {
    // Save quiz results to user profile if coming from guest quiz
    const quizResults = getStoredQuiz();
    if (quizResults) {
      base44.auth.me().then(user => {
        if (user && !user.quiz_answers) {
          base44.auth.updateMe({ quiz_answers: quizResults });
        }
        clearStoredQuiz();
      }).catch(() => clearStoredQuiz());
    }

    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      localStorage.removeItem(PENDING_KEY);
      const params = new URLSearchParams({ q: pending });
      navigate(`/chat?${params.toString()}`);
    }
    base44.auth.me().then(u => {
      const plan = getUserPlan(u);
      if (!plan || plan.price_monthly === 0) {
        const dismissed = sessionStorage.getItem('free_banner_dismissed');
        if (!dismissed) { setIsFreeUser(true); setShowFreeBanner(true); }
      }
    }).catch(() => {});
    if (shouldShowUserOnboarding()) {
      setTimeout(() => setShowUserOnboarding(true), 800);
    } else if (shouldShowTensorsOnboarding()) {
      setTimeout(() => setShowOnboarding(true), 1200);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {showUserOnboarding && <UserOnboarding onClose={() => setShowUserOnboarding(false)} />}
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}

      {showFreeBanner && isFreeUser && (
        <div className="mx-4 md:mx-8 mt-4 px-4 py-3 rounded-xl flex items-center justify-between gap-3"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold" style={{ color: '#92400e' }}>Plan gratuit — tes discussions sont supprimées après 14 jours.</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(0,0,0,0.4)' }}>Passe à un plan payant pour les conserver indéfiniment.</p>
          </div>
          <button onClick={() => navigate('/pricing')}
            className="flex-shrink-0 px-3 py-1.5 text-[11px] font-black rounded-lg transition-all hover:opacity-90"
            style={{ background: '#0A0A0A', color: 'white' }}>Upgrade →</button>
          <button onClick={() => { setShowFreeBanner(false); sessionStorage.setItem('free_banner_dismissed', '1'); }}
            className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 hover:bg-black/10 transition-colors">
            <X className="w-3.5 h-3.5" style={{ color: 'rgba(0,0,0,0.4)' }} />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 min-w-0 overflow-y-auto">
          <HeroSection agentId={selectedAgent} onAgentChange={setSelectedAgent} />
          <RecentApps
            agentId={selectedAgent}
          />
        </div>
      </div>
    </div>
  );
}