import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Brain, Globe, Paperclip, MessageSquare, Zap, Crown, BarChart2, Shield, Clock } from 'lucide-react';
import { getLandingContent } from '@/lib/landing-content';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const FEATURES = [
  {
    icon: Brain,
    title: 'Contextual Financial Intelligence',
    desc: 'Stensor understands your unique situation: income, expenses, goals, risk tolerance. Every answer is calibrated for you, not a generic profile.',
    tag: 'All plans',
    dark: false,
  },
  {
    icon: Globe,
    title: 'Real-Time Internet Search',
    desc: 'Access the latest market data, interest rates, ETF performance and financial news — integrated directly into your analysis.',
    tag: 'Advanced+',
    dark: true,
  },
  {
    icon: Paperclip,
    title: 'Financial Document Analysis',
    desc: 'Upload bank statements, pay stubs, insurance contracts. Stensor automatically analyzes them and integrates your real numbers into the strategy.',
    tag: 'Essential+',
    dark: false,
  },
  {
    icon: Zap,
    title: 'Cutting-Edge AI Models',
    desc: 'Access GPT-4o, Claude Opus, Gemini Ultra. Stensor automatically selects the best model for each financial question.',
    tag: 'Expert+',
    dark: true,
  },
  {
    icon: MessageSquare,
    title: 'Unlimited Discussions',
    desc: 'Ask as many questions as you want. Build a continuous relationship with your AI coach over months, with contextual memory of your goals.',
    tag: 'Advanced+',
    dark: false,
  },
  {
    icon: Crown,
    title: 'Expert Mode — Deep Reasoning',
    desc: 'For complex questions: Monte Carlo simulation, multi-asset portfolio optimization, detailed tax analysis. Professional-grade results.',
    tag: 'Expert+',
    dark: true,
  },
  {
    icon: BarChart2,
    title: 'Retirement Planner',
    desc: 'Precisely calculate your possible retirement age, the capital needed and the monthly amount to save starting from your current situation.',
    tag: 'All plans',
    dark: false,
  },
  {
    icon: Shield,
    title: 'Complete Privacy',
    desc: 'Your financial data is never resold, never shared. End-to-end encryption on all your conversations.',
    tag: 'All plans',
    dark: false,
  },
  {
    icon: Clock,
    title: 'Actionable Plans',
    desc: 'No vague theory. Every answer includes exact steps, accounts to open, precise amounts to invest — starting today.',
    tag: 'All plans',
    dark: false,
  },
];

export default function LandingFeaturesPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [navData, setNavData] = useState(null);

  useEffect(() => {
    getLandingContent().then(d => setNavData(d?.nav));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCta = () => base44.auth.redirectToLogin('/app');
  const logoUrl = navData?.logo_url || LOGO_URL;

  return (
    <div className="min-h-screen font-be bg-white overflow-x-hidden">

      {/* NAV */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-5">
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5"
          style={{
            background: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : '0 2px 12px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
          }}>
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <img src={logoUrl} alt="Stensor" className="w-6 h-6 object-contain" />
            <span className="font-black text-sm tracking-tight" style={{ color: FG }}>Stensor</span>
          </button>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-xs font-black text-black border-b-2 border-black pb-0.5">Features</span>
            <a href="/tarifs" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => base44.auth.redirectToLogin('/app')}
              className="hidden md:block text-xs font-semibold text-gray-500 hover:text-black transition-colors px-3 py-2">
              Sign In
            </button>
            <button onClick={handleCta}
              className="text-xs font-black px-4 py-2.5 bg-black text-white hover:bg-gray-900 transition-colors">
              Get Started
            </button>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <section className="pt-44 pb-24 px-6 text-center bg-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-[10px] font-black tracking-[0.2em] uppercase"
            style={{ background: YUZU, color: FG }}>
            All Features
          </div>
          <h1 className="font-black tracking-tight leading-[1.02] mb-6"
            style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: FG }}>
            Everything a financial<br />AI coach can do.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(10,10,10,0.4)' }}>
            Designed to give you a real edge on your finances — not just generic answers.
          </p>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-6 pb-28" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.08)' }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}
                className="p-8 flex flex-col gap-5"
                style={{ background: f.dark ? FG : 'white' }}>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    style={{ background: f.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
                    <Icon className="w-5 h-5" style={{ color: f.dark ? YUZU : FG }} />
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 uppercase tracking-wider"
                    style={{
                      background: f.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      color: f.dark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,10,0.35)',
                    }}>
                    {f.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black mb-2" style={{ color: f.dark ? 'white' : FG }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: f.dark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,10,0.5)' }}>{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="px-6 py-28 bg-black text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-black tracking-tight text-white mb-8"
          style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
          Ready to take control<br />of your finances?
        </motion.h2>
        <motion.button initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }} onClick={handleCta}
          className="inline-flex items-center gap-3 font-black text-sm px-10 py-5 hover:opacity-85 transition-opacity"
          style={{ background: YUZU, color: FG }}>
          Start building <ArrowRight className="w-4 h-4" />
        </motion.button>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-10 py-8 bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="" className="w-5 h-5 object-contain opacity-30" />
            <span className="text-xs font-semibold" style={{ color: 'rgba(10,10,10,0.3)' }}>Stensor 2026</span>
          </div>
          <button onClick={() => navigate('/')} className="text-xs hover:text-black transition-colors" style={{ color: 'rgba(10,10,10,0.35)' }}>← Back to home</button>
        </div>
      </footer>
    </div>
  );
}