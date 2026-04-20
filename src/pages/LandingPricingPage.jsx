import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Check } from 'lucide-react';
import FinalCta from '../components/landing/FinalCta';
import LandingFooter from '../components/landing/LandingFooter';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { getLandingContent, LANDING_QUERY_KEY } from '@/lib/landing-content';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const PLAN_FEATURES = {
  free:      ['10 credits/month', '3 discussions', 'Standard AI mode'],
  essential: ['50 credits/month', 'Unlimited discussions', 'Standard AI mode'],
  advanced:  ['150 credits/month', 'Unlimited discussions', 'Internet search', 'File uploads', 'Advanced AI mode'],
  expert:    ['500 credits/month', 'Unlimited discussions', 'Internet search', 'File uploads', 'Expert AI mode', 'Priority support'],
  supreme:   ['1000 credits/month', 'Unlimited discussions', 'Internet search', 'File uploads', 'Expert AI mode', 'Priority support', 'Shareable credits'],
};

export default function LandingPricingPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('yearly');
  const [scrolled, setScrolled] = useState(false);
  const [plansConfig, setPlansConfig] = useState(() => getPlansConfig());
  const { data: landingData } = useQuery({ queryKey: LANDING_QUERY_KEY, queryFn: getLandingContent, staleTime: 0, refetchOnMount: 'always' });
  const navData = landingData?.nav || null;
  const logoUrl = navData?.logo_url || LOGO_URL;

  useEffect(() => { loadPlansFromDB().then(p => { if (p) setPlansConfig(p); }); }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCta = () => base44.auth.redirectToLogin('/app');
  const price = (plan) => billing === 'yearly' ? plan.price_yearly : plan.price_monthly;

  // Show only: free, essential, advanced, expert (skip supreme for cleanliness)
  const visibleIds = ['free', 'essential', 'advanced', 'expert'];
  const plans = plansConfig.filter(p => visibleIds.includes(p.id));
  // Sort: free → essential → advanced → expert
  plans.sort((a, b) => visibleIds.indexOf(a.id) - visibleIds.indexOf(b.id));

  return (
    <div className="min-h-screen font-be overflow-x-hidden" style={{ background: '#fafaf8' }}>

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        zIndex: 0,
      }} />

      {/* Corner gradient blobs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 500, height: 500, top: -100, left: -100,
          background: 'radial-gradient(circle, rgba(221,255,0,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, top: 0, right: -80,
          background: 'radial-gradient(circle, rgba(34,197,94,0.10) 0%, transparent 70%)',
          filter: 'blur(55px)',
        }} />
      </div>

      {/* NAV */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-5">
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5 relative"
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
            <a href="/fonctionnalites" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">Features</a>
            <span className="text-xs font-black text-black border-b-2 border-black pb-0.5">Pricing</span>
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
      <section className="relative z-10 pt-48 pb-12 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-[10px] font-black tracking-[0.2em] uppercase rounded-md"
            style={{ background: YUZU, color: FG }}>
            Pricing
          </div>
          <h1 className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', color: FG, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Simple, Transparent<br />Pricing
          </h1>
          <p className="text-base max-w-md mx-auto mb-10 font-medium" style={{ color: 'rgba(10,10,10,0.45)' }}>
            Choose the plan that fits your ambition. No hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center p-1 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="px-5 py-2 text-xs font-black transition-all rounded-md flex items-center gap-2"
                style={{
                  background: billing === b ? FG : 'transparent',
                  color: billing === b ? 'white' : 'rgba(10,10,10,0.45)',
                }}>
                {b === 'monthly' ? 'Monthly' : (
                  <>Yearly <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                    style={{ background: billing === 'yearly' ? YUZU : 'rgba(0,0,0,0.1)', color: billing === 'yearly' ? FG : '#888' }}>
                    −20%
                  </span></>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* PLANS GRID */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan, i) => {
              const p = price(plan);
              const isAdvanced = plan.id === 'advanced';
              const features = PLAN_FEATURES[plan.id] || [];

              return (
                <motion.div key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex flex-col"
                  style={{
                    background: isAdvanced ? FG : 'white',
                    borderRadius: '16px',
                    border: isAdvanced ? '1.5px solid rgba(221,255,0,0.2)' : '1px solid rgba(0,0,0,0.09)',
                    boxShadow: isAdvanced
                      ? '0 0 0 4px rgba(221,255,0,0.08), 0 16px 48px rgba(0,0,0,0.14)'
                      : '0 4px 20px rgba(0,0,0,0.05)',
                    padding: '28px 24px',
                    // Advanced is slightly taller via padding
                    ...(isAdvanced ? { paddingTop: 36, paddingBottom: 36 } : {}),
                  }}>

                  {/* Recommended badge */}
                  {isAdvanced && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="text-[9px] font-black px-3 py-1.5 tracking-widest uppercase rounded-full"
                        style={{ background: YUZU, color: FG }}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Top glow for advanced */}
                  {isAdvanced && (
                    <div className="absolute top-0 left-0 right-0 h-px pointer-events-none rounded-t-2xl"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(221,255,0,0.5), transparent)' }} />
                  )}

                  {/* Plan name */}
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3"
                    style={{ color: isAdvanced ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,10,0.4)' }}>
                    {plan.name}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1.5">
                      <span className="font-black" style={{ fontSize: '2.4rem', lineHeight: 1, color: isAdvanced ? 'white' : FG }}>
                        {p === 0 ? 'Free' : `$${p}`}
                      </span>
                      {p > 0 && (
                        <span className="text-xs mb-1.5 font-medium" style={{ color: isAdvanced ? 'rgba(255,255,255,0.35)' : 'rgba(10,10,10,0.35)' }}>
                          /mo
                        </span>
                      )}
                    </div>
                    {billing === 'yearly' && p > 0 && (
                      <p className="text-[10px] mt-1" style={{ color: isAdvanced ? 'rgba(255,255,255,0.25)' : 'rgba(10,10,10,0.3)' }}>
                        billed yearly
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="mb-5" style={{ height: 1, background: isAdvanced ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }} />

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1 mb-7">
                    {features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2.5 text-xs font-medium">
                        <Check className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: isAdvanced ? YUZU : FG }} />
                        <span style={{ color: isAdvanced ? 'rgba(255,255,255,0.65)' : 'rgba(10,10,10,0.65)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => plan.id === 'free' ? handleCta() : base44.auth.redirectToLogin('/manage-plan')}
                    className="w-full py-3 font-black text-xs transition-all hover:opacity-85 rounded-lg"
                    style={{
                      background: isAdvanced ? YUZU : 'transparent',
                      color: isAdvanced ? FG : FG,
                      border: isAdvanced ? 'none' : '1.5px solid rgba(0,0,0,0.15)',
                    }}>
                    {plan.id === 'free' ? 'Start Free' : `Get ${plan.name}`}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Note */}
          <p className="text-center text-xs mt-8 font-medium" style={{ color: 'rgba(10,10,10,0.3)' }}>
            Cancel anytime · No hidden fees · Secure payment
          </p>
        </div>
      </section>

      <FinalCta onCta={handleCta} />
      <LandingFooter logoUrl={logoUrl} />
    </div>
  );
}