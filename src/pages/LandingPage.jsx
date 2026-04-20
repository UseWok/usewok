import { useState, useEffect, useRef } from 'react';
import ScoreAddictionSection from '../components/landing/ScoreAddictionSection';
import StickyCardsSection from '../components/landing/StickyCardsSection';
import FinalCta from '../components/landing/FinalCta';
import LandingFooter from '../components/landing/LandingFooter';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowUp, ChevronDown, MoreHorizontal, X, Globe, Tag, Zap } from 'lucide-react';
import { getLandingContent, LANDING_QUERY_KEY } from '@/lib/landing-content';
import { useLanguage } from '@/lib/i18n';

const PENDING_KEY = 'stensor_pending_query';
const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const MODES = [
  { key: 'concise', label: 'Concise', emoji: '⚡', desc: 'Fast, direct answers' },
  { key: 'learning', label: 'Learning', emoji: '📚', desc: 'Explained step-by-step' },
  { key: 'mentor', label: 'Mentor', emoji: '🎯', desc: 'Deep personalized coaching' },
];

function useAuthState() {
  const [isAuth, setIsAuth] = useState(null);
  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => setIsAuth(false));
  }, []);
  return isAuth;
}

// Animated gradient orbs background (legallio-style)
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Left pink/rose orb */}
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -30, 15, 0], scale: [1, 1.05, 0.97, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full"
        style={{
          width: 700, height: 700,
          top: '-200px', left: '-200px',
          background: 'radial-gradient(circle, rgba(251,113,133,0.18) 0%, rgba(244,63,94,0.08) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Right blue orb */}
      <motion.div
        animate={{ x: [0, -25, 10, 0], y: [0, 20, -15, 0], scale: [1, 1.08, 0.95, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute rounded-full"
        style={{
          width: 800, height: 800,
          top: '-250px', right: '-250px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      {/* Bottom center green orb */}
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
        className="absolute rounded-full"
        style={{
          width: 600, height: 600,
          bottom: '-150px', left: '30%',
          background: 'radial-gradient(circle, rgba(221,255,0,0.10) 0%, rgba(34,197,94,0.06) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Small accent peach */}
      <motion.div
        animate={{ x: [0, -15, 25, 0], y: [0, 25, -10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          top: '40%', left: '15%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuth = useAuthState();
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeMode, setActiveMode] = useState('concise');
  const { data } = useQuery({ queryKey: LANDING_QUERY_KEY, queryFn: getLandingContent, staleTime: 0, refetchOnMount: 'always' });
  const { lang: mobileLang, setLang: setMobileLang, t } = useLanguage();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAuth === true) navigate('/app', { replace: true });
  }, [isAuth, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCta = async () => {
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) navigate('/app');
      else base44.auth.redirectToLogin('/app');
    } catch {
      base44.auth.redirectToLogin('/app');
    }
  };

  const handleSend = async () => {
    if (!query.trim()) return;
    try {
      const auth = await base44.auth.isAuthenticated();
      if (auth) navigate(`/chat?q=${encodeURIComponent(query)}&mode=${activeMode}`);
      else {
        localStorage.setItem(PENDING_KEY, query);
        base44.auth.redirectToLogin('/app');
      }
    } catch {
      localStorage.setItem(PENDING_KEY, query);
      base44.auth.redirectToLogin('/app');
    }
  };

  const handleTopicClick = (topic) => {
    const prompt = typeof topic === 'object' ? topic.prompt : topic;
    setQuery(prompt);
    inputRef.current?.focus();
  };

  if (isAuth === null || !data) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
    </div>
  );

  const { nav, hero, section_title, cards, pricing, faq, cta, footer, youtube_url } = data;

  return (
    <div className="min-h-screen font-be overflow-x-hidden bg-white">

      {/* NAV */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-5">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5"
          style={{
            background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px',
            boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : '0 2px 12px rgba(0,0,0,0.04)',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s ease',
          }}
        >
          <div className="flex items-center gap-2.5">
            <img src={nav.logo_url} alt="Stensor" className="w-6 h-6 object-contain" />
            <span className="font-black text-sm tracking-tight" style={{ color: FG }}>Stensor</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href={nav.features_url} className="text-xs font-medium text-gray-500 hover:text-black transition-colors">Features</a>
            <a href={nav.pricing_url} className="text-xs font-medium text-gray-500 hover:text-black transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => base44.auth.redirectToLogin('/app')}
              className="hidden md:block text-xs font-semibold text-gray-500 hover:text-black transition-colors px-3 py-2">
              {nav.login_label}
            </button>
            <button onClick={() => setShowMobileMenu(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center transition-colors"
              style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '6px' }}>
              <MoreHorizontal className="w-4 h-4" style={{ color: FG }} />
            </button>
            <button onClick={handleCta}
              className="text-xs font-black px-4 py-2.5 transition-all hover:scale-105"
              style={{ background: YUZU, color: FG, borderRadius: '8px' }}>
              {nav.cta_label}
            </button>
          </div>
        </motion.nav>
      </div>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-36 pb-20 overflow-hidden">
        {/* Colorful gradient orb background */}
        <HeroBackground />

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-[10px] font-black tracking-[0.2em] uppercase"
            style={{ background: YUZU, color: FG, borderRadius: '6px' }}>
            {hero.badge}
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
            className="font-black tracking-tight leading-[1.02] mb-6 whitespace-pre-line"
            style={{ fontSize: 'clamp(3rem, 9vw, 6.5rem)', color: FG, maxWidth: '800px' }}>
            {hero.title}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
            className="text-base md:text-lg max-w-xl mx-auto mb-4 leading-relaxed"
            style={{ color: 'rgba(10,10,10,0.45)' }}>
            {hero.subtitle}
          </motion.p>

          <div className="mb-10" />

          {/* Input + Mode selector */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full max-w-2xl mb-8">
            <div className="bg-white border border-black/10"
              style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.10)', borderRadius: '14px', overflow: 'hidden' }}>

              {/* Mode selector tabs */}
              <div className="flex items-center gap-1 px-4 pt-4 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider mr-2" style={{ color: 'rgba(10,10,10,0.3)' }}>Mode</span>
                {MODES.map(m => (
                  <button key={m.key} onClick={() => setActiveMode(m.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-all rounded-lg"
                    style={{
                      background: activeMode === m.key ? FG : 'rgba(0,0,0,0.04)',
                      color: activeMode === m.key ? 'white' : 'rgba(10,10,10,0.5)',
                      transform: activeMode === m.key ? 'scale(1.03)' : 'scale(1)',
                    }}>
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Active mode description */}
              <div className="px-4 pb-1">
                <AnimatePresence mode="wait">
                  <motion.p key={activeMode}
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="text-[10px]" style={{ color: 'rgba(10,10,10,0.3)' }}>
                    {MODES.find(m => m.key === activeMode)?.desc}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Textarea */}
              <div className="relative flex items-end gap-3 px-5 pb-5 pt-3">
                <textarea ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={hero.placeholder} rows={3}
                  className="flex-1 resize-none bg-transparent text-sm focus:outline-none leading-relaxed"
                  style={{ color: FG, minHeight: '72px' }} />
                <button onClick={handleSend} disabled={!query.trim()}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: query.trim() ? FG : 'rgba(0,0,0,0.08)', borderRadius: '8px' }}>
                  <ArrowUp className="w-4 h-4" style={{ color: query.trim() ? 'white' : '#bbb' }} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Topics */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(10,10,10,0.3)' }}>
              Not sure where to start?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {(hero.topics || []).map((topic, i) => {
                const label = typeof topic === 'object' ? topic.label : topic;
                return (
                  <button key={i} onClick={() => handleTopicClick(topic)}
                    className="px-4 py-2 text-xs font-medium border border-black/10 transition-all"
                    style={{ color: 'rgba(10,10,10,0.6)', borderRadius: '6px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = FG; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = FG; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = 'rgba(10,10,10,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}>
                    {label}
                  </button>
                );
              })}
              <button onClick={handleCta}
                className="px-4 py-2 text-xs font-black border transition-all hover:scale-105"
                style={{ color: FG, borderRadius: '6px', background: YUZU, borderColor: YUZU }}>
                🎯 Discover my Stensor Score
              </button>
            </div>
          </motion.div>

          {/* YOUTUBE VIDEO */}
          {youtube_url && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="w-full max-w-2xl mt-10">
              <div className="overflow-hidden w-full"
                style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.10)', boxShadow: '0 8px 60px rgba(0,0,0,0.12)', aspectRatio: '16/9' }}>
                <iframe
                  src={(() => {
                    try {
                      const url = new URL(youtube_url);
                      let videoId = '';
                      if (url.hostname.includes('youtu.be')) {
                        videoId = url.pathname.replace('/', '');
                      } else {
                        videoId = url.searchParams.get('v') || '';
                      }
                      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
                    } catch {
                      return `https://www.youtube.com/embed/${youtube_url}`;
                    }
                  })()}
                  title="Stensor demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowMobileMenu(false)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full bg-white p-6 pb-10"
              style={{ borderRadius: '20px 20px 0 0' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex justify-center mb-5">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.12)' }} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: '#aaa' }}>Language</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[{ code: 'en', label: '🇬🇧 English' }, { code: 'fr', label: '🇫🇷 Français' }].map(l => (
                  <button key={l.code} onClick={() => { setMobileLang(l.code); setShowMobileMenu(false); }}
                    className="py-3 text-sm font-bold transition-all"
                    style={{
                      borderRadius: '8px',
                      background: mobileLang === l.code ? FG : 'rgba(0,0,0,0.05)',
                      color: mobileLang === l.code ? 'white' : '#555',
                    }}>
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: '#aaa' }}>Navigate</p>
              <div className="space-y-2">
                <a href={nav.features_url}
                  className="flex items-center gap-3 px-4 py-3.5 w-full"
                  style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                  <Globe className="w-4 h-4" style={{ color: '#888' }} />
                  <span className="text-sm font-semibold" style={{ color: FG }}>Features</span>
                </a>
                <a href={nav.pricing_url}
                  className="flex items-center gap-3 px-4 py-3.5 w-full"
                  style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                  <Tag className="w-4 h-4" style={{ color: '#888' }} />
                  <span className="text-sm font-semibold" style={{ color: FG }}>Pricing</span>
                </a>
                <button onClick={() => { setShowMobileMenu(false); handleCta(); }}
                  className="flex items-center justify-center w-full py-3.5 text-sm font-black"
                  style={{ background: YUZU, color: FG, borderRadius: '10px' }}>
                  {nav.cta_label}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STENSOR SCORE ADDICTION SECTION */}
      <ScoreAddictionSection onCta={handleCta} />

      {/* STICKY SCROLL CARDS SECTION */}
      <StickyCardsSection cards={cards} section_title={section_title} onCta={handleCta} />



      {/* PRICING */}
      <section className="px-6 py-24 bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="font-black text-4xl md:text-5xl mb-4" style={{ color: FG }}>{pricing.title}</h2>
            <p className="text-sm font-medium" style={{ color: 'rgba(10,10,10,0.60)' }}>{pricing.subtitle}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free — glass reflex card */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative overflow-hidden p-10"
              style={{
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #fafaf5 0%, #f0f5e0 100%)',
                border: '1px solid rgba(180,220,0,0.18)',
                boxShadow: '0 4px 30px rgba(180,220,0,0.08)',
              }}>
              {/* Reflex shimmer top */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(221,255,0,0.6) 50%, transparent 100%)' }} />
              <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(221,255,0,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }} />
              <h3 className="text-xl font-black mb-2" style={{ color: FG }}>{pricing.free_title}</h3>
              <p className="text-3xl font-black mb-6" style={{ color: FG }}>{pricing.free_price}</p>
              <div className="space-y-3 mb-8">
                {pricing.free_features.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 rounded-full" style={{ background: 'rgba(10,10,10,0.08)' }}>
                      <span className="text-[10px] font-black" style={{ color: FG }}>✓</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: FG }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleCta}
                className="w-full py-3.5 font-black text-sm transition-all hover:scale-[1.02]"
                style={{ background: FG, color: 'white', borderRadius: '12px' }}>
                {pricing.free_cta}
              </button>
            </motion.div>
            {/* Paid — clean dark card */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="relative overflow-hidden p-10"
              style={{
                borderRadius: '12px',
                background: FG,
                border: '1px solid rgba(221,255,0,0.15)',
                boxShadow: '0 0 40px rgba(221,255,0,0.10), 0 8px 32px rgba(0,0,0,0.18)',
              }}>
              {/* Yuzu top glow line */}
              <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(221,255,0,0.7), transparent)' }} />
              <h3 className="text-xl font-black mb-2" style={{ color: 'white' }}>{pricing.paid_title}</h3>
              <p className="font-black mb-1" style={{ fontSize: '2.5rem', color: 'white' }}>
                {pricing.paid_price} <span className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{pricing.paid_currency}</span>
              </p>
              <div className="space-y-3 mb-8 mt-4">
                {pricing.paid_features.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(221,255,0,0.15)', borderRadius: '3px' }}>
                      <span className="text-[10px] font-black" style={{ color: YUZU }}>✓</span>
                    </div>
                    <span className="text-sm font-medium text-white">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(pricing.paid_url)}
                className="w-full py-3.5 font-black text-sm transition-all hover:opacity-85"
                style={{ background: YUZU, color: FG, borderRadius: '8px' }}>
                {pricing.paid_cta}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-2xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-black text-4xl md:text-5xl text-center mb-14" style={{ color: FG }}>
            FAQ
          </motion.h2>
          <div className="space-y-0">
            {faq.map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-0 py-5 text-left gap-4">
                  <span className="text-sm font-semibold" style={{ color: FG }}>{item.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(10,10,10,0.35)' }} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                      <p className="pb-5 text-sm leading-relaxed font-medium" style={{ color: 'rgba(10,10,10,0.65)' }}>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <FinalCta onCta={handleCta} />

      <LandingFooter logoUrl={nav.logo_url} footerLinks={footer.links} disclaimer={footer.disclaimer} />
    </div>
  );
}