import { useState, useEffect } from 'react';
import { X, Sparkles, PieChart, TrendingUp } from 'lucide-react';
import { getStoredQuiz, clearStoredQuiz } from '@/components/landing/GuestQuiz';
import { useNavigate } from 'react-router-dom';
import HomeEventBanner from '../components/home/HomeEventBanner';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';
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
  const [userName, setUserName] = useState('Antoine'); // Fallback name

  const isMobile = useIsMobile(); 

  useEffect(() => {
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
      if(u?.full_name) setUserName(u.full_name.split(' ')[0]); // Extract first name
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
    <div className="flex h-screen w-full bg-[#0A0A0A] overflow-hidden text-white font-sans relative">
      {/* Kept existing modals & banners */}
      {showUserOnboarding && <UserOnboarding onClose={() => setShowUserOnboarding(false)} />}
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}

      {showFreeBanner && isFreeUser && (
        <div className="absolute top-4 left-4 right-4 z-50 md:left-8 md:right-auto md:w-96 px-4 py-3 rounded-xl flex items-center justify-between gap-3 backdrop-blur-md"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-yellow-500">Free plan — chats deleted after 14 days.</p>
            <p className="text-[11px] mt-0.5 text-yellow-500/70">Upgrade to keep them forever.</p>
          </div>
          <button onClick={() => navigate('/pricing')}
            className="flex-shrink-0 px-3 py-1.5 text-[11px] font-black rounded-lg transition-all hover:bg-white/20 bg-white/10 text-white">
            Upgrade →
          </button>
          <button onClick={() => { setShowFreeBanner(false); sessionStorage.setItem('free_banner_dismissed', '1'); }}
            className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 hover:bg-white/10 transition-colors">
            <X className="w-3.5 h-3.5 text-yellow-500/70" />
          </button>
        </div>
      )}

      {/* LEFT SIDE: 50% Dashboard & Choices */}
      <div className="w-full md:w-1/2 flex flex-col pt-24 px-12 z-10 border-r border-white/5 overflow-y-auto">
        <div className="max-w-xl mx-auto w-full">
          <h1 className="text-4xl font-medium tracking-tight mb-2">
            Welcome Back, <span className="text-blue-400 font-bold">{userName}</span>!
          </h1>
          <p className="text-gray-400 text-lg mb-10">Ready to Optimize your Financial Health?</p>

          <button 
            onClick={() => navigate('/chat')}
            className="w-full bg-[#0a2357] border border-blue-900/50 hover:bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all mb-12 shadow-[0_0_30px_rgba(37,99,235,0.15)]"
          >
            Start a New Financial Coaching Session
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </button>

          {/* TWO MODERN CHOICES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Choice 1 */}
            <div className="group bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full pointer-events-none" />
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400">
                <PieChart className="w-6 h-6" />
              </div>
              <p className="text-xs text-gray-500 font-bold mb-1">CHOICE 1</p>
              <h3 className="font-bold text-lg leading-tight mb-2">Analyze My Spending Patterns</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Deep dive into your monthly cash flow with predictive analysis.</p>
            </div>

            {/* Choice 2 */}
            <div className="group bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[50px] rounded-full pointer-events-none" />
              <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mb-6 text-pink-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-xs text-gray-500 font-bold mb-1">CHOICE 2</p>
              <h3 className="font-bold text-lg leading-tight mb-2">Optimize My Savings Plan</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Personalized advice to achieve your financial goals, including asset allocation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: 50% Visual Preview Area */}
      <div className="hidden md:flex w-1/2 bg-[#0F0F0F] items-center justify-center p-12 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        
        {/* Empty Abstract Preview State (No specific results) */}
        <div className="w-full max-w-lg bg-[#181818] rounded-3xl border border-white/5 aspect-[4/3] shadow-2xl relative overflow-hidden group flex items-center justify-center">
            
            {/* Fake browser top bar */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 flex items-center px-4 gap-2 border-b border-white/5">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
            </div>

            {/* Placeholder Content */}
            <div className="text-center opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <p className="text-sm font-medium text-white tracking-widest uppercase">Waiting for AI Generation</p>
            </div>

            {/* Live Indicator */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <span className="text-xs font-bold text-gray-400 tracking-wider">PREVIEW MODE</span>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span className="text-[10px] text-white font-black uppercase">System Ready</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}