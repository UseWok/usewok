import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Brain, Globe, Paperclip, MessageSquare, Zap, Crown, BarChart2, Shield, Clock } from 'lucide-react';
import FinalCta from '../components/landing/FinalCta';
import LandingFooter from '../components/landing/LandingFooter';
import { useLanguage } from '@/lib/i18n';
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
  const { t } = useLanguage();

  useEffect(() => {
    getLandingContent().then(d => setNavData(d?.nav));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCta = () => base44.auth.redirectToLogin('/app');
  const logoUrl = navData?.logo_url || LOGO_URL;

  return (
    <div className="min-h-screen font-be overflow-x-hidden" style={{ background: 'white' }}>

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
              {t('landing_sign_in')}
            </button>
            <button onClick={handleCta}
              className="text-xs font-black px-4 py-2.5 bg-black text-white hover:bg-gray-900 transition-colors">
              {t('landing_get_started')}
            </button>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <section className="relative pt-44 pb-24 px-6 text-center overflow-hidden" style={{ background: 'white' }}>
        {/* Joyful light orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ x: [0,40,-10,0], y: [0,-30,20,0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position:'absolute', width:700, height:700, top:'-200px', left:'-150px', background:'radial-gradient(circle, rgba(221,255,0,0.30) 0%, rgba(221,255,0,0.06) 45%, transparent 70%)', filter:'blur(55px)' }} />
          <motion.div animate={{ x: [0,-50,20,0], y: [0,30,-40,0] }} transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            style={{ position:'absolute', width:600, height:600, top:'-100px', right:'-150px', background:'radial-gradient(circle, rgba(255,200,80,0.24) 0%, rgba(255,160,50,0.07) 45%, transparent 70%)', filter:'blur(50px)' }} />
          <motion.div animate={{ x: [0,30,-25,0], y: [0,-20,35,0] }} transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
            style={{ position:'absolute', width:500, height:500, bottom:'-80px', left:'30%', background:'radial-gradient(circle, rgba(255,150,200,0.15) 0%, transparent 65%)', filter:'blur(45px)' }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-[10px] font-black tracking-[0.2em] uppercase"
            style={{ background: YUZU, color: FG }}>
            {t('landing_features_badge')}
          </div>
          <h1 className="font-black tracking-tight leading-[1.02] mb-6"
            style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: FG }}>
            {t('landing_features_title')}
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(10,10,10,0.4)' }}>
            {t('landing_features_sub')}
          </p>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-6 pb-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            // Alternate vivid card styles
            const styles = [
              { bg: 'linear-gradient(145deg,#fafaf5 0%,#f0f5e0 100%)', border: 'rgba(180,220,0,0.18)', iconBg: 'rgba(221,255,0,0.18)', iconColor: FG, tagBg: 'rgba(10,10,10,0.07)', tagColor: FG, titleColor: FG, descColor: 'rgba(10,10,10,0.55)', shimmer: 'rgba(221,255,0,0.5)' },
              { bg: 'linear-gradient(145deg,#0a0a0a 0%,#141400 100%)', border: 'rgba(221,255,0,0.20)', iconBg: 'rgba(221,255,0,0.12)', iconColor: YUZU, tagBg: 'rgba(255,255,255,0.08)', tagColor: 'rgba(255,255,255,0.6)', titleColor: 'white', descColor: 'rgba(255,255,255,0.48)', shimmer: 'rgba(221,255,0,0.6)' },
              { bg: 'linear-gradient(145deg,#fff9e6 0%,#fff3c0 100%)', border: 'rgba(255,184,0,0.22)', iconBg: 'rgba(255,184,0,0.18)', iconColor: FG, tagBg: 'rgba(10,10,10,0.07)', tagColor: FG, titleColor: FG, descColor: 'rgba(10,10,10,0.55)', shimmer: 'rgba(255,184,0,0.7)' },
            ];
            const s = styles[i % 3];
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
                className="relative overflow-hidden p-8 flex flex-col gap-5"
                style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                {/* Top reflex shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent 0%, ${s.shimmer} 50%, transparent 100%)` }} />
                <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${s.iconBg} 0%, transparent 70%)`, filter: 'blur(16px)' }} />
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-11 h-11 flex items-center justify-center flex-shrink-0 rounded-xl"
                    style={{ background: s.iconBg }}>
                    <Icon className="w-5 h-5" style={{ color: s.iconColor }} />
                  </div>
                  <span className="text-[9px] font-black px-2.5 py-1 uppercase tracking-wider rounded-full"
                    style={{ background: s.tagBg, color: s.tagColor }}>
                    {f.tag}
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-base font-black mb-2" style={{ color: s.titleColor }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: s.descColor }}>{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <FinalCta onCta={handleCta} />

      <LandingFooter logoUrl={logoUrl} />
    </div>
  );
}