import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowUp, ChevronDown } from 'lucide-react';
import { getLandingContent } from '@/lib/landing-content';

const PENDING_KEY = 'stensor_pending_query';

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
  const [data, setData] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    getLandingContent().then(setData);
  }, []);

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

  const handleTopicClick = (topic) => {
    setQuery(topic);
    inputRef.current?.focus();
  };

  if (isAuth === null || !data) return null;

  const { nav, hero, section_title, cards, pricing, faq, cta, footer } = data;

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
            boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : '0 2px 12px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
          }}
        >
          <div className="flex items-center gap-2.5">
            <img src={nav.logo_url} alt="Stensor" className="w-6 h-6 object-contain" />
            <span className="font-black text-sm tracking-tight" style={{ color: '#0A0A0A' }}>Stensor</span>
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
            <button onClick={handleCta}
              className="text-xs font-black px-4 py-2.5 bg-black text-white hover:bg-gray-900 transition-colors">
              {nav.cta_label}
            </button>
          </div>
        </motion.nav>
      </div>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-6 pt-36 pb-20 bg-white">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 border border-black/10 text-[10px] font-black tracking-[0.2em] uppercase"
          style={{ color: '#0A0A0A', background: '#DDFF00' }}>
          {hero.badge}
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
          className="font-black tracking-tight leading-[1.02] mb-6 whitespace-pre-line"
          style={{ fontSize: 'clamp(3rem, 9vw, 6.5rem)', color: '#0A0A0A', maxWidth: '800px' }}>
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
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
            <textarea ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={hero.placeholder} rows={3}
              className="flex-1 resize-none bg-transparent text-sm focus:outline-none leading-relaxed"
              style={{ color: '#0A0A0A', minHeight: '72px' }} />
            <button onClick={handleSend} disabled={!query.trim()}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center transition-all"
              style={{ background: query.trim() ? '#0A0A0A' : 'rgba(0,0,0,0.08)' }}>
              <ArrowUp className="w-4 h-4" style={{ color: query.trim() ? 'white' : '#bbb' }} />
            </button>
          </div>
        </motion.div>

        {/* Topics */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(10,10,10,0.3)' }}>
            Not sure where to start?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {hero.topics.map(topic => (
              <button key={topic} onClick={() => handleTopicClick(topic)}
                className="px-4 py-2 text-xs font-medium border border-black/10 hover:bg-black hover:text-white hover:border-black transition-all"
                style={{ color: 'rgba(10,10,10,0.6)' }}>
                {topic}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION TITLE */}
      <section className="px-6 py-12 text-center bg-white" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-black text-4xl md:text-5xl" style={{ color: '#0A0A0A' }}>
          {section_title}
        </motion.h2>
      </section>

      {/* STACKING CARDS — black */}
      <section className="px-6 md:px-10 pb-32 bg-white">
        <div className="max-w-5xl mx-auto space-y-4">
          {cards.map((card, i) => (
            <motion.div key={card.num}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              className="sticky overflow-hidden"
              style={{ top: `${80 + i * 14}px`, background: '#0A0A0A' }}>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-72 md:flex-shrink-0 h-52 md:h-auto overflow-hidden">
                  <img src={card.image} alt={card.title}
                    className="w-full h-full object-cover opacity-70" />
                </div>
                <div className="flex-1 p-10 md:p-14">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {card.num} / {card.total}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black leading-tight mb-5 text-white">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {card.desc}
                  </p>
                  <button onClick={handleCta}
                    className="text-sm font-black px-6 py-3 transition-all hover:opacity-80"
                    style={{ background: '#DDFF00', color: '#0A0A0A' }}>
                    Get my strategy →
                  </button>
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
            <h2 className="font-black text-4xl md:text-5xl mb-4" style={{ color: '#0A0A0A' }}>{pricing.title}</h2>
            <p className="text-sm" style={{ color: 'rgba(10,10,10,0.4)' }}>{pricing.subtitle}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Free */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="p-10 border border-black/08">
              <h3 className="text-xl font-black mb-2" style={{ color: '#0A0A0A' }}>{pricing.free_title}</h3>
              <p className="text-3xl font-black mb-6" style={{ color: '#0A0A0A' }}>{pricing.free_price}</p>
              <div className="space-y-3 mb-8">
                {pricing.free_features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 bg-black">
                      <span className="text-[10px] font-black text-white">✓</span>
                    </div>
                    <span className="text-sm" style={{ color: 'rgba(10,10,10,0.6)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleCta}
                className="w-full py-3.5 font-black text-sm bg-black text-white hover:bg-gray-900 transition-colors">
                {pricing.free_cta}
              </button>
            </motion.div>
            {/* Paid */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="p-10 bg-black">
              <h3 className="text-xl font-black mb-2 text-white">{pricing.paid_title}</h3>
              <p className="font-black mb-1 text-white" style={{ fontSize: '2.5rem' }}>{pricing.paid_price} <span className="text-lg font-semibold opacity-40">{pricing.paid_currency}</span></p>
              <div className="space-y-3 mb-8 mt-4">
                {pricing.paid_features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ background: '#DDFF00' }}>
                      <span className="text-[10px] font-black text-black">✓</span>
                    </div>
                    <span className="text-sm text-white/60">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(pricing.paid_url)}
                className="w-full py-3.5 font-black text-sm transition-all hover:opacity-90"
                style={{ background: '#DDFF00', color: '#0A0A0A' }}>
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
            className="font-black text-4xl md:text-5xl text-center mb-14" style={{ color: '#0A0A0A' }}>
            FAQ
          </motion.h2>
          <div className="space-y-0">
            {faq.map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-0 py-5 text-left gap-4">
                  <span className="text-sm font-semibold" style={{ color: '#0A0A0A' }}>{item.q}</span>
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
          transition={{ delay: 0.1 }}
          onClick={handleCta}
          className="font-black text-base px-10 py-5 transition-all hover:opacity-85"
          style={{ background: '#DDFF00', color: '#0A0A0A' }}>
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