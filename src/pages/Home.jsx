import { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { getStoredQuiz, clearStoredQuiz } from '@/components/landing/GuestQuiz';
import { useNavigate } from 'react-router-dom';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { motion } from 'framer-motion';

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
    // Always create a fresh conversation from Home
    navigate(`/chat?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const quizResults = getStoredQuiz();
    if (quizResults) {
      base44.auth.me().then((u) => {
        if (u && !u.quiz_answers) base44.auth.updateMe({ quiz_answers: quizResults });
        clearStoredQuiz();
      }).catch(() => clearStoredQuiz());
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
    <div className="min-h-screen bg-[#08090c] flex flex-col overflow-x-hidden">
      {showUserOnboarding && <UserOnboarding onClose={() => setShowUserOnboarding(false)} />}
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}

      {/* Free Banner */}
      {showFreeBanner && isFreeUser && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 sm:mx-6 mt-4 px-4 py-3 rounded-2xl flex items-center justify-between gap-3"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <p className="text-xs font-semibold text-amber-300/80 flex-1 min-w-0 truncate">Free plan — discussions deleted after 14 days</p>
          <button onClick={() => navigate('/pricing')}
            className="flex-shrink-0 px-3 py-1 text-[11px] font-black rounded-lg bg-amber-400 text-black hover:bg-amber-300 transition-colors">
            Upgrade
          </button>
          <button onClick={() => { setShowFreeBanner(false); sessionStorage.setItem('free_banner_dismissed', '1'); }}
            className="w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-3.5 h-3.5 text-amber-400/60" />
          </button>
        </motion.div>
      )}

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-violet-600/6 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto">

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/4 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="text-[11px] font-semibold text-white/50 tracking-wide uppercase">AI Finance Coach</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-[28px] sm:text-[38px] lg:text-[44px] font-black tracking-tight text-center leading-[1.12] mb-3"
          >
            <span className="text-white">
              {firstName ? `Good to see you,` : 'Your money,'}
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-300 bg-clip-text text-transparent">
              {firstName ? `${firstName}.` : 'under control.'}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-center text-[14px] sm:text-[15px] text-white/40 mb-8 max-w-md mx-auto leading-relaxed"
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
              className="relative rounded-2xl transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: focused ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: focused ? '0 0 0 4px rgba(59,130,246,0.08), 0 8px 40px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.2)',
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
                className="w-full bg-transparent text-white text-[15px] px-5 py-4 pr-[56px] focus:outline-none placeholder:text-white/25 rounded-2xl"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{
                  background: input.trim() ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'rgba(255,255,255,0.06)',
                  boxShadow: input.trim() ? '0 4px 16px rgba(59,130,246,0.4)' : 'none',
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
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                <span className="text-lg flex-shrink-0">{s.icon}</span>
                <span className="text-[13px] font-medium text-white/60 group-hover:text-white/80 transition-colors line-clamp-1">{s.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Footer hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mt-8 text-white/20 text-[12px]"
          >
            <span>Powered by AI</span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Secure & Private</span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Instant results</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}