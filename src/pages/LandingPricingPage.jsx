import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Check, ArrowRight } from 'lucide-react';
import GuestQuiz from '@/components/landing/GuestQuiz';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { getLandingContent, LANDING_QUERY_KEY } from '@/lib/landing-content';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const LOGO = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const PLAN_FEATURES = {
  free:      ['10 Flash searches/mo', '3 discussions max', 'All knowledge bases'],
  essential: ['50 Flash searches/mo', '10 Deep syntheses/mo', 'File upload'],
  advanced:  ['100 Flash searches/mo', '30 Deep syntheses/mo', 'Web search', 'File upload', 'Advanced AI mode'],
  expert:    ['200 Flash searches/mo', '60 Deep syntheses/mo', 'Web search', 'File upload', 'Expert AI mode', 'Priority support'],
  supreme:   ['500 Flash searches/mo', '100 Deep syntheses/mo', 'Web search', 'File upload', 'Expert AI mode', 'Priority support'],
};

function Scene({ children, bg = 'white', minH = '100vh' }) {
  return (
    <section className="relative w-full flex flex-col items-center justify-center px-6 md:px-8"
      style={{ minHeight: minH, background: bg }}>
      {children}
    </section>
  );
}

function Navbar({ scrolled, onCta }) {
  const navigate = useNavigate();
  return (
    <>
      {/* Desktop top pill navbar */}
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ paddingTop: 24 }}>
        <div className="flex items-center justify-between w-full px-6 py-3"
          style={{ maxWidth: 850, background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'all 0.4s ease', borderRadius: 999, border: '1px solid rgba(0,0,0,0.06)', boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)' }}>
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <img src={LOGO} alt="Stensor" className="w-8 h-8 object-contain" />
            <span className="text-sm font-black tracking-tight" style={{ color: FG }}>Stensor</span>
          </button>
          <div className="hidden md:flex items-center gap-8">
            <a href="/fonctionnalites" className="text-xs text-gray-400 hover:text-black transition-colors">Features</a>
            <span className="text-xs font-black text-black border-b border-black pb-0.5">Pricing</span>
            <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs text-gray-400 hover:text-black transition-colors">Sign in</button>
          </div>
          <motion.button onClick={onCta} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="text-xs font-black px-5 py-2.5" style={{ background: FG, color: 'white', borderRadius: '6px' }}>
            Start free →
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile floating bottom bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="fixed bottom-4 left-4 right-4 z-50 flex md:hidden items-center justify-between px-5 py-3.5 rounded-full"
        style={{ background: 'rgba(10,10,10,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <a href="/fonctionnalites" className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>Features</a>
        <span className="text-xs font-black text-white border-b border-white pb-0.5">Pricing</span>
        <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>Sign in</button>
        <button onClick={onCta} className="text-xs font-black px-4 py-2 rounded-full" style={{ background: YELLOW, color: FG }}>Start →</button>
      </motion.div>
    </>
  );
}

export default function LandingPricingPage() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [plansConfig, setPlansConfig] = useState(() => getPlansConfig());
  const [highlightedPlanId, setHighlightedPlanId] = useState('advanced');

  const { data: landingData } = useQuery({ queryKey: LANDING_QUERY_KEY, queryFn: getLandingContent, staleTime: 0 });

  useEffect(() => {
    loadPlansFromDB().then(p => { if (p) setPlansConfig(p); });
    base44.entities.AppSettings.filter({ key: 'highlighted_plan' }).then(r => { if (r.length > 0) setHighlightedPlanId(r[0].value); }).catch(() => {});
  }, []);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const visibleIds = ['free', 'essential', 'advanced', 'expert', 'supreme'];
  const planOverrides = landingData?.pricing?.plan_overrides || {};
  const plans = plansConfig
    .filter(p => visibleIds.includes(p.id))
    .sort((a, b) => visibleIds.indexOf(a.id) - visibleIds.indexOf(b.id))
    .map(p => ({ ...p, ...planOverrides[p.id] }));

  const handleCta = () => setShowQuiz(true);

  return (
    <div className="font-inter overflow-x-hidden bg-white pb-20 md:pb-0">
      <AnimatePresence>{showQuiz && <GuestQuiz onClose={() => setShowQuiz(false)} />}</AnimatePresence>
      <Navbar scrolled={scrolled} onCta={handleCta} />

      {/* HERO */}
      <Scene minH="100vh">
        <div className="text-center max-w-3xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
            style={{ color: 'rgba(0,0,0,0.2)' }}>
            Pricing
          </motion.p>

          <div className="overflow-hidden mb-2">
            <motion.h1 initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: FG }}>
              Simple.
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-2">
            <motion.h1 initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.37, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: YELLOW }}>
              Transparent.
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-16">
            <motion.h1 initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.49, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: 'rgba(0,0,0,0.15)' }}>
              No surprises.
            </motion.h1>
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            className="text-base max-w-md mx-auto mb-12"
            style={{ color: 'rgba(0,0,0,0.35)', fontFamily: 'var(--font-open)' }}>
            Pick the plan that keeps your pleasures and builds your wealth. Start free — no credit card needed.
          </motion.p>


        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))' }} />
          <p className="text-[9px] tracking-[0.3em] uppercase text-gray-300">Plans</p>
        </motion.div>
      </Scene>

      {/* PLANS */}
      <Scene bg="#fafaf8" minH="100vh">
        <div className="w-full max-w-6xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-20 text-center"
            style={{ color: 'rgba(0,0,0,0.2)' }}>
            Choose your tier
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {plans.filter(p => p.id !== 'free').map((plan, i) => {
              const features = (plan.features?.length > 0) ? plan.features : (PLAN_FEATURES[plan.id] || []);
              const isHighlighted = plan.id === highlightedPlanId;
              const price = plan.price_monthly || 0;


              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col p-6"
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    border: isHighlighted ? `2px solid ${FG}` : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: isHighlighted ? '0 8px 32px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                  }}>

                  <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(0,0,0,0.35)' }}>
                    {plan.name}
                  </p>

                  <div className="mb-2">
                    <span className="font-black" style={{ fontSize: '2.2rem', lineHeight: 1, color: FG }}>
                      {price === 0 ? 'Free' : `$${price}`}
                    </span>
                    {price > 0 && <span className="text-xs ml-1" style={{ color: 'rgba(0,0,0,0.3)' }}>/mo</span>}
                  </div>



                  <div className="mb-5" style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

                  <ul className="space-y-2.5 flex-1 mb-7">
                    {features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-xs">
                        <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: FG }} />
                        <span style={{ color: 'rgba(0,0,0,0.6)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button onClick={handleCta}
                    className="w-full py-3 font-black text-xs transition-all hover:opacity-85"
                    style={{
                      background: isHighlighted ? FG : 'rgba(0,0,0,0.06)',
                      color: isHighlighted ? 'white' : FG,
                      borderRadius: '6px',
                    }}>
                    {isHighlighted ? 'Start your engine →' : 'Get started'}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Enterprise */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 text-center" style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="font-black text-base mb-2" style={{ color: FG }}>Enterprise Plan</p>
            <p className="text-xs mb-5" style={{ color: 'rgba(0,0,0,0.4)', fontFamily: 'var(--font-open)' }}>
              Custom pricing for organizations with unlimited needs.
            </p>
            <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
              {['Unlimited Flash & Deep', 'Dedicated support', 'Custom integrations', 'Premium SLA'].map(f => (
                <span key={f} className="text-xs text-gray-400">· {f}</span>
              ))}
            </div>
            <a href="mailto:contact.stensor@proton.me"
              className="inline-flex items-center gap-2 px-8 py-3 font-black text-xs rounded-lg transition-opacity hover:opacity-80"
              style={{ background: FG, color: 'white' }}>
              Contact us <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          <p className="text-center text-[11px] mt-6 text-gray-300">
            Cancel anytime · No hidden fees · Secure payment
          </p>
        </div>
      </Scene>

      {/* WHY INVEST */}
      <Scene bg={FG} minH="80vh">
        <div className="w-full max-w-4xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-20 text-center"
            style={{ color: 'rgba(255,255,255,0.2)' }}>
            Why invest
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-center mb-16">
            <h2 className="font-black tracking-tighter text-white"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.0 }}>
              $15/mo invested here<br />
              <span style={{ color: YELLOW }}>returns an average $640/mo.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: '42×', label: 'Average ROI', desc: 'For every dollar spent on Stensor, our users recover an average 42× through discovered optimizations.' },
              { n: '3 wks', label: 'To see first results', desc: 'Most users identify their first savings within the first 3 weeks of use.' },
              { n: '0 sacrifice', label: 'On your pleasures', desc: "Our method never touches what makes you happy. That's our absolute promise." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-7 flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="font-black" style={{ fontSize: '2.5rem', color: YELLOW, lineHeight: 1 }}>{s.n}</p>
                <p className="text-base font-black text-white">{s.label}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-open)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Scene>

      {/* FINAL CTA */}
      <Scene bg={YELLOW} minH="80vh">
        <div className="text-center max-w-2xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
            style={{ color: 'rgba(0,0,0,0.3)' }}>
            Start now
          </motion.p>
          <div className="overflow-hidden mb-4">
            <motion.h2 initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', color: FG }}>
              Your pleasure intact.
            </motion.h2>
          </div>
          <div className="overflow-hidden mb-16">
            <motion.h2 initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', color: 'rgba(0,0,0,0.22)' }}>
              Your future built.
            </motion.h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }} className="flex flex-col items-center gap-4">
            <motion.button onClick={() => setShowQuiz(true)}
              whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-12 py-5 font-black text-base"
              style={{ background: FG, color: 'white', borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
              Start your engine <ArrowRight className="w-4 h-4" />
            </motion.button>
            <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>No card. Cancel anytime.</p>
          </motion.div>
        </div>
      </Scene>

      {/* Footer */}
      <footer className="px-8 md:px-10 py-10 flex items-center justify-between flex-wrap gap-4"
        style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <button onClick={() => window.location.href = '/'} className="flex items-center gap-2">
          <img src={LOGO} alt="Stensor" className="w-7 h-7 object-contain" />
          <span className="text-xs font-black" style={{ color: FG }}>Stensor</span>
        </button>
        <div className="flex items-center gap-6">
          {[['Features', '/fonctionnalites'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
            <a key={l} href={h} className="text-[11px] text-gray-300 hover:text-black transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-[10px] text-gray-200">2026 Stensor Inc.</p>
      </footer>
    </div>
  );
}