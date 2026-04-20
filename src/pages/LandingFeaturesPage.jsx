import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Brain, Globe, Paperclip, MessageSquare, Zap, Crown, BarChart2, Shield, Clock } from 'lucide-react';
import FinalCta from '../components/landing/FinalCta';
import LandingFooter from '../components/landing/LandingFooter';
import { getLandingContent } from '@/lib/landing-content';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const FEATURES = [
  { icon: Brain,        title: 'Contextual Financial Intelligence', desc: 'Every answer calibrated for your unique income, goals and risk tolerance — not a generic profile.', tag: 'All plans' },
  { icon: Globe,        title: 'Real-Time Internet Search',         desc: 'Access live market data, interest rates, ETF performance and financial news integrated into your analysis.', tag: 'Advanced+' },
  { icon: Paperclip,    title: 'Document Analysis',                 desc: 'Upload bank statements, pay stubs, insurance contracts. Stensor extracts your real numbers automatically.', tag: 'Essential+' },
  { icon: Zap,          title: 'Cutting-Edge AI Models',            desc: 'Access GPT-4o, Claude Opus, Gemini. Stensor picks the best model automatically for each question.', tag: 'Expert+' },
  { icon: MessageSquare,title: 'Unlimited Discussions',             desc: 'Build a continuous relationship with your AI coach over months, with contextual memory of your goals.', tag: 'Advanced+' },
  { icon: Crown,        title: 'Expert Mode — Deep Reasoning',      desc: 'Monte Carlo simulation, portfolio optimization, detailed tax analysis. Professional-grade results.', tag: 'Expert+' },
  { icon: BarChart2,    title: 'Retirement Planner',                desc: 'Calculate your retirement age, capital needed and monthly savings starting from your current situation.', tag: 'All plans' },
  { icon: Shield,       title: 'Complete Privacy',                  desc: 'Your financial data is never resold. End-to-end encryption on all your conversations.', tag: 'All plans' },
  { icon: Clock,        title: 'Actionable Plans',                  desc: 'No vague theory. Every answer includes exact steps, accounts to open, amounts to invest — starting today.', tag: 'All plans' },
];

export default function LandingFeaturesPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState(LOGO_URL);

  useEffect(() => {
    getLandingContent().then(d => { if (d?.nav?.logo_url) setLogoUrl(d.nav.logo_url); });
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCta = () => base44.auth.redirectToLogin('/app');

  return (
    <div className="min-h-screen font-be overflow-x-hidden" style={{ background: '#fafaf8' }}>

      {/* Grid + blob bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)`,
        backgroundSize: '48px 48px', zIndex: 0,
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position:'absolute', width:500, height:500, top:-100, left:-100, background:'radial-gradient(circle, rgba(221,255,0,0.20) 0%, transparent 70%)', filter:'blur(60px)' }} />
        <div style={{ position:'absolute', width:400, height:400, top:0, right:-80, background:'radial-gradient(circle, rgba(221,255,0,0.10) 0%, transparent 70%)', filter:'blur(55px)' }} />
      </div>

      {/* NAV */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-5">
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5"
          style={{
            background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.90)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px',
            boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : '0 2px 12px rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
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
              className="text-xs font-black px-4 py-2.5 transition-all hover:scale-105"
              style={{ background: YUZU, color: FG, borderRadius: '8px' }}>
              Get Started
            </button>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <section className="relative z-10 pt-48 pb-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-[10px] font-black tracking-[0.2em] uppercase rounded-md"
            style={{ background: YUZU, color: FG }}>
            Features
          </div>
          <h1 className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', color: FG, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Everything you need to<br />build real wealth.
          </h1>
          <p className="text-sm max-w-md mx-auto font-medium" style={{ color: 'rgba(10,10,10,0.45)' }}>
            From AI-powered strategy to live market data — all the tools in one place.
          </p>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
                className="relative p-7 flex flex-col gap-4 rounded-2xl"
                style={{
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                }}>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ background: 'rgba(221,255,0,0.15)' }}>
                    <Icon className="w-5 h-5" style={{ color: FG }} />
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(10,10,10,0.5)' }}>
                    {f.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black mb-1.5" style={{ color: FG }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed font-medium" style={{ color: 'rgba(10,10,10,0.5)' }}>{f.desc}</p>
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