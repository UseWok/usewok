import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getUserPlan } from '@/lib/plans-config';
import { motion } from 'framer-motion';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';
import { X } from 'lucide-react';
import BuildsGallery from '../components/home/BuildsGallery';

const PENDING_KEY = 'stensor_pending_query';

const SUGGESTIONS = [
  { icon: '💰', label: 'Analyze my spending', query: 'Analyze my spending and show me a breakdown' },
  { icon: '🎯', label: 'Set a savings goal', query: 'Help me set and track a savings goal' },
  { icon: '📈', label: 'Investment strategy', query: 'Build me a personalized investment strategy dashboard' },
  { icon: '🧾', label: 'Budget planner', query: 'Create an interactive monthly budget planner' },
];

export default function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserOnboarding, setShowUserOnboarding] = useState(false);
  const [showFreeBanner, setShowFreeBanner] = useState(false);
  const [isFreeUser, setIsFreeUser] = useState(false);
  const [user, setUser] = useState(null);
  const [focused, setFocused] = useState(false);

  const handleSend = (q) => {
    const query = q || input;
    if (!query.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const quizResults = JSON.parse(localStorage.getItem('stensor_quiz_results') || 'null');
    if (quizResults) {
      base44.auth.me().then((u) => {
        if (u && !u.quiz_answers) base44.auth.updateMe({ quiz_answers: quizResults });
        localStorage.removeItem('stensor_quiz_results');
      }).catch(() => localStorage.removeItem('stensor_quiz_results'));
    }

    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      localStorage.removeItem(PENDING_KEY);
      navigate(`/chat?q=${encodeURIComponent(pending)}`);
      return;
    }

    base44.auth.me().then((u) => {
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

  const firstName = user?.full_name?.split(' ')[0] || null;

  return (
    <div className="min-h-screen font-sans bg-white flex flex-col overflow-x-hidden">
      {showUserOnboarding && <UserOnboarding onClose={() => setShowUserOnboarding(false)} />}
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}

      {/* Free Banner */}
      {showFreeBanner && isFreeUser && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 sm:mx-6 mt-4 px-4 py-3 rounded-lg flex items-center justify-between gap-3 border border-amber-200 bg-amber-50"
        >
          <p className="text-xs font-medium text-amber-800 flex-1 min-w-0 truncate">Free plan — discussions deleted after 14 days</p>
          <button onClick={() => navigate('/pricing')}
            className="flex-shrink-0 px-3 py-1 text-[11px] font-medium rounded bg-amber-400 text-amber-900 hover:bg-amber-300 transition-colors">
            Upgrade
          </button>
          <button onClick={() => { setShowFreeBanner(false); sessionStorage.setItem('free_banner_dismissed', '1'); }}
            className="w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-full hover:bg-amber-100 transition-colors">
            <X className="w-3.5 h-3.5 text-amber-600" />
          </button>
        </motion.div>
      )}

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative">
        <div className="relative z-10 w-full max-w-2xl mx-auto">

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E5E5E5] bg-[#F7F7F8]">
              <Sparkles className="w-3 h-3 text-[#1A1A1A]" />
              <span className="text-[11px] font-medium text-[#666666] tracking-wide uppercase">AI Finance Coach</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-[28px] sm:text-[38px] lg:text-[44px] font-medium tracking-tight text-center leading-[1.12] mb-3 text-[#1A1A1A]"
          >
            <span>
              {firstName ? `Good to see you,` : 'Your money,'}
            </span>
            <br />
            <span className="text-[#1A1A1A]">
              {firstName ? `${firstName}.` : 'under control.'}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-center text-[15px] text-[#666666] mb-8 max-w-md mx-auto leading-relaxed"
          >
            Ask anything about your finances. Get a beautiful interactive dashboard, instantly.
          </motion.p>

          {/* Input Bar */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-5"
          >
            <div
              className="relative rounded-lg transition-all duration-300 border"
              style={{
                background: 'white',
                borderColor: focused ? '#1A1A1A' : '#E5E5E5',
                boxShadow: focused ? '0 0 0 4px rgba(26,26,26,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Ask about your finances…"
                className="w-full bg-transparent text-[#1A1A1A] text-[15px] px-5 py-4 pr-[56px] focus:outline-none placeholder:text-[#999999] rounded-lg"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{
                  background: input.trim() ? '#1A1A1A' : '#F7F7F8',
                }}
              >
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>

          {/* Quick-action chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="grid grid-cols-2 gap-2.5"
          >
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s.query}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSend(s.query)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-left transition-all duration-200 group border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] hover:border-[#D0D0D0]"
              >
                <span className="text-lg flex-shrink-0">{s.icon}</span>
                <span className="text-[13px] font-medium text-[#666666] group-hover:text-[#1A1A1A] transition-colors line-clamp-1">{s.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Footer hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mt-8 text-[#999999] text-[12px]"
          >
            <span>Powered by AI</span>
            <div className="w-1 h-1 bg-[#E5E5E5] rounded-full" />
            <span>Secure & Private</span>
            <div className="w-1 h-1 bg-[#E5E5E5] rounded-full" />
            <span>Instant results</span>
          </motion.div>
        </div>
      </div>

      {/* Builds gallery */}
      <BuildsGallery />
    </div>
  );
}