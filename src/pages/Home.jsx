import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getStoredQuiz, clearStoredQuiz } from '@/components/landing/GuestQuiz';
import { useNavigate } from 'react-router-dom';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { useIsMobile } from '@/hooks/use-mobile';

const PENDING_KEY = 'stensor_pending_query';

export default function Home() {
  const urlParams = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserOnboarding, setShowUserOnboarding] = useState(false);
  const [showFreeBanner, setShowFreeBanner] = useState(false);
  const [isFreeUser, setIsFreeUser] = useState(false);
  const [user, setUser] = useState(null);

  const isMobile = useIsMobile();

  const handleSendMessage = () => {
    if (!input.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(input)}`);
  };

  useEffect(() => {
    const quizResults = getStoredQuiz();
    if (quizResults) {
      base44.auth.me().then(u => {
        if (u && !u.quiz_answers) {
          base44.auth.updateMe({ quiz_answers: quizResults });
        }
        clearStoredQuiz();
      }).catch(() => clearStoredQuiz());
    }

    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      localStorage.removeItem(PENDING_KEY);
      navigate(`/chat?q=${encodeURIComponent(pending)}`);
    }

    base44.auth.me().then(u => {
      setUser(u);
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
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {showUserOnboarding && <UserOnboarding onClose={() => setShowUserOnboarding(false)} />}
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}

      {showFreeBanner && isFreeUser && (
        <div className="mx-4 md:mx-8 mt-4 px-4 py-3 rounded-xl flex items-center justify-between gap-3"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold" style={{ color: '#92400e' }}>Plan gratuit — tes discussions sont supprimées après 14 jours.</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Passe à un plan payant pour les conserver indéfiniment.</p>
          </div>
          <button onClick={() => navigate('/pricing')}
            className="flex-shrink-0 px-3 py-1.5 text-[11px] font-black rounded-lg transition-all hover:opacity-90"
            style={{ background: '#f0f0f0', color: '#111' }}>Upgrade →</button>
          <button onClick={() => { setShowFreeBanner(false); sessionStorage.setItem('free_banner_dismissed', '1'); }}
            className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 hover:bg-white/10 transition-colors">
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
  <div className="flex-1 min-w-0 overflow-y-auto">
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A] to-[#1A1A2E] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px]" />
      
      <div className="relative z-10 w-full max-w-2xl px-6">
        <h1 className="text-[#e3e3e3] text-[32px] font-light tracking-wide text-center mb-8 antialiased">
          Bonjour Antoine, sur quoi pouvons-nous travailler ?
        </h1>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Demander à Gestia"
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-full px-6 py-4 text-[15px] focus:outline-none focus:border-[#0055FF] placeholder:text-gray-500"
                />
                <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0055FF] rounded-full flex items-center justify-center hover:bg-[#0044CC]">
                  <span className="text-white text-lg">→</span>
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/chat?q=Analyze my spending')}
                  className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-xl px-5 py-3 text-[14px] font-medium hover:bg-[#2A2A2A] transition-colors text-left"
                >
                  💰 Analyze my spending
                </button>
                <button
                  onClick={() => navigate('/chat?q=Financial coaching')}
                  className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-xl px-5 py-3 text-[14px] font-medium hover:bg-[#2A2A2A] transition-colors text-left"
                >
                  🎯 Start financial coaching
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-[13px]">
                <span>Pro</span>
                <div className="w-1 h-1 bg-gray-600 rounded-full" />
                <span>Tap to explore</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}