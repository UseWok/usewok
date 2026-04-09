import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowUp, ChevronDown, MoreHorizontal, X, Globe, Tag } from 'lucide-react';
import { getLandingContent, LANDING_QUERY_KEY } from '@/lib/landing-content';
import { useLanguage } from '@/lib/i18n';

const PENDING_KEY = 'stensor_pending_query';
const YUZU = '#DDFF00';
const FG = '#0A0A0A';

function useAuthState() {
  const [isAuth, setIsAuth] = useState(null);
  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => setIsAuth(false));
  }, []);
  return isAuth;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuth = useAuthState();
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
      if (auth) navigate(`/chat?q=${encodeURIComponent(query)}`);
      else {
        localStorage.setItem(PENDING_KEY, query);
        base44.auth.redirectToLogin('/app');
      }
    } catch {
      localStorage.setItem(PENDING_KEY, query);
      base44.auth.redirectToLogin('/app');
    }
  };

  // Topics: just set query text, do NOT redirect
  const handleTopicClick = (topic) => {
    const prompt = typeof topic === 'object' ? topic.prompt : topic;
    setQuery(prompt);
    inputRef.current?.focus();
  };

  if (isAuth === null || !data) return null;

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
            background: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px',
            boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : '0 2px 12px rgba(0,0,0,0.04)',
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
            {/* Mobile menu dot */}
            <button onClick={() => setShowMobileMenu(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center transition-colors"
              style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '6px' }}>
              <MoreHorizontal className="w-4 h-4" style={{ color: FG }} />
            </button>
            <button onClick={handleCta}
              className="text-xs font-black px-4 py-2.5 transition-colors"
              style={{ background: YUZU, color: FG, borderRadius: '8px' }}>
              {nav.cta_label}
            </button>
          </div>
        </motion.nav>
      </div>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-6 pt-36 pb-20 bg-white">
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
          className="text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed"
          style={{ color: 'rgba(10,10,10,0.45)' }}>
          {hero.subtitle}
        </motion.p>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full max-w-2xl mb-8">
          <div className="relative flex items-end gap-3 p-5 bg-white border border-black/10"
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08)', borderRadius: '8px' }}>
            <textarea ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={hero.placeholder} rows={3}
              className="flex-1 resize-none bg-transparent text-sm focus:outline-none leading-relaxed"
              style={{ color: FG, minHeight: '72px' }} />
            <button onClick={handleSend} disabled={!query.trim()}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center transition-all"
              style={{ background: query.trim() ? FG : 'rgba(0,0,0,0.08)', borderRadius: '4px' }}>
              <ArrowUp className="w-4 h-4" style={{ color: query.trim() ? 'white' : '#bbb' }} />
            </button>
          </div>
        </motion.div>

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
                {/* Handle */}
                <div className="flex justify-center mb-5">
                  <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.12)' }} />
                </div>
                {/* Language */}
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
                {/* Links */}
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
                  style={{ color: 'rgba(10,10,10,0.6)', borderRadius: '6px', background: 'white' }}
                  onMouseEnter={e => { e.currentTarget.style.background = FG; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = FG; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'rgba(10,10,10,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}>
                  {label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* YOUTUBE VIDEO inline */}
        {youtube_url && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="w-full max-w-2xl mt-10">
            <div className="overflow-hidden w-full"
              style={{ borderRadius: '4px', border: '1px solid rgba(0,0,0,0.10)', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', aspectRatio: '16/9' }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtube_url.includes('watch?v=') ? youtube_url.split('watch?v=')[1].split('&')[0] : youtube_url.includes('youtu.be/') ? youtube_url.split('youtu.be/')[1].split('?')[0] : youtube_url}`}
                title="Stensor demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
          </motion.div>
        )}
      </section>

      {/* SECTION TITLE */}
      <section className="px-6 py-16 text-center bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-black text-4xl md:text-5xl" style={{ color: FG }}>
          {section_title}
        </motion.h2>
      </section>

      {/* MODERN CARDS */}
      <section className="px-6 md:px-10 pb-32 bg-white">
        <div className="max-w-5xl mx-auto space-y-5">
          {cards.map((card, i) => (
            <motion.div key={card.num}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="sticky overflow-hidden"
              style={{ top: `${80 + i * 16}px`, background: FG, borderRadius: '8px' }}>
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-80 h-56 md:h-auto overflow-hidden relative flex-shrink-0">
                  <img 
  src={card.image} 
  alt={card.title} 
  className="w-full h-full object-cover" 
  style={{ opacity: 1.00 }} // Suppression du filtre ici
/>
                  {/* Card number overlay */}
                  <div className="absolute bottom-4 left-6">
                    <span className="text-6xl font-black" style={{ color: 'rgba(255,255,255,0.08)', lineHeight: 1 }}>
                      {card.num}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 p-10 md:p-14 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[10px] font-black tracking-[0.2em] uppercase px-2.5 py-1"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', borderRadius: '4px' }}>
                        {card.num} / {card.total}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black leading-tight mb-5 text-white">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>
                      {card.desc}
                    </p>
                  </div>
                  {/* N'affiche le bouton QUE si c'est la dernière carte (index 3) */}
{i === cards.length - 1 && (
  <div className="mt-8">
    <button onClick={handleCta}
      className="text-sm font-black px-6 py-3 transition-all hover:scale-[1.02]"
      style={{ background: YUZU, color: FG, borderRadius: '6px' }}>
      Get my strategy →
    </button>
  </div>
)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-24 bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="font-black text-4xl md:text-5xl mb-4" style={{ color: FG }}>{pricing.title}</h2>
            <p className="text-sm" style={{ color: 'rgba(10,10,10,0.4)' }}>{pricing.subtitle}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Free */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="p-10 border border-black/08" style={{ borderRadius: '4px' }}>
              <h3 className="text-xl font-black mb-2" style={{ color: FG }}>{pricing.free_title}</h3>
              <p className="text-3xl font-black mb-6" style={{ color: FG }}>{pricing.free_price}</p>
              <div className="space-y-3 mb-8">
                {pricing.free_features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 bg-black" style={{ borderRadius: '4px' }}>
                      <span className="text-[10px] font-black text-white">✓</span>
                    </div>
                    <span className="text-sm" style={{ color: 'rgba(10,10,10,0.6)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleCta}
                className="w-full py-3.5 font-black text-sm transition-colors"
                style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                {pricing.free_cta}
              </button>
            </motion.div>
            {/* Paid */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="p-10 bg-black" style={{ borderRadius: '4px' }}>
              <h3 className="text-xl font-black mb-2 text-white">{pricing.paid_title}</h3>
              <p className="font-black mb-1 text-white" style={{ fontSize: '2.5rem' }}>
                {pricing.paid_price} <span className="text-lg font-semibold opacity-40">{pricing.paid_currency}</span>
              </p>
              <div className="space-y-3 mb-8 mt-4">
                {pricing.paid_features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '4px' }}>
                      <span className="text-[10px] font-black text-black">✓</span>
                    </div>
                    <span className="text-sm text-white/60">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(pricing.paid_url)}
                className="w-full py-3.5 font-black text-sm transition-all hover:opacity-90"
                style={{ background: YUZU, color: FG, borderRadius: '4px' }}>
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
                      <p className="pb-5 text-sm leading-relaxed" style={{ color: 'rgba(10,10,10,0.5)' }}>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-32 text-center bg-black">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-black tracking-tight mb-10 text-white whitespace-pre-line"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
          {cta.title}
        </motion.h2>
        <motion.button initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }} onClick={handleCta}
          className="font-black text-base px-10 py-5 transition-all hover:opacity-85"
          style={{ background: YUZU, color: FG, borderRadius: '8px' }}>
          {cta.button}
        </motion.button>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-10 py-8 bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={nav.logo_url} alt="" className="w-5 h-5 object-contain opacity-30" />
            <span className="text-xs font-semibold" style={{ color: 'rgba(10,10,10,0.3)' }}>Stensor 2026</span>
          </div>
          <div className="flex gap-6 flex-wrap justify-center">
            {footer.links.map(l => (
              <a key={l.label} href={l.url} className="text-xs hover:text-black transition-colors" style={{ color: 'rgba(10,10,10,0.35)' }}>{l.label}</a>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'rgba(10,10,10,0.2)' }}>{footer.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}