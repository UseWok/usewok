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
  free:      ['10 Tensors/month', '3 discussions max', 'Standard AI mode', 'All knowledge bases'],
  essential: ['50 Tensors/month', 'Unlimited discussions', 'Standard AI mode', 'File uploads'],
  advanced:  ['150 Tensors/month', 'Unlimited discussions', 'Internet search', 'File uploads', 'Advanced AI mode'],
  expert:    ['500 Tensors/month', 'Unlimited discussions', 'Internet search', 'File uploads', 'Expert AI mode', 'Priority support'],
  supreme:   ['2000 Tensors/month', 'Unlimited discussions', 'Internet search', 'File uploads', 'Expert AI mode', 'Priority support', 'Shareable credits'],
};

// Shared grid+blob background
function PageBg() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        zIndex: 0,
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position:'absolute', width:500, height:500, top:-100, left:-100, background:'radial-gradient(circle, rgba(221,255,0,0.20) 0%, transparent 70%)', filter:'blur(60px)' }} />
        <div style={{ position:'absolute', width:400, height:400, top:0, right:-80, background:'radial-gradient(circle, rgba(221,255,0,0.10) 0%, transparent 70%)', filter:'blur(55px)' }} />
      </div>
    </>
  );
}

export default function LandingPricingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [plansConfig, setPlansConfig] = useState(() => getPlansConfig());
  const { data: landingData } = useQuery({ queryKey: LANDING_QUERY_KEY, queryFn: getLandingContent, staleTime: 0, refetchOnMount: 'always' });
  const logoUrl = landingData?.nav?.logo_url || LOGO_URL;

  useEffect(() => { loadPlansFromDB().then(p => { if (p) setPlansConfig(p); }); }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCta = () => base44.auth.redirectToLogin('/app');

  const visibleIds = ['free', 'essential', 'advanced', 'expert', 'supreme'];
  const plans = plansConfig
    .filter(p => visibleIds.includes(p.id))
    .sort((a, b) => visibleIds.indexOf(a.id) - visibleIds.indexOf(b.id));

  return (
    <div className="min-h-screen font-be overflow-x-hidden" style={{ background: '#fafaf8' }}>
      <PageBg />

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
          <h1 className="font-black tracking-tight mb-4"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 4.5rem)', color: FG, letterSpacing: '-0.03em' }}>
            Simple, Transparent Pricing
          </h1>
          <p className="text-sm max-w-md mx-auto font-medium" style={{ color: 'rgba(10,10,10,0.45)' }}>
            Choose the plan that's right for you and start building amazing AI applications today.
          </p>
        </motion.div>
      </section>

      {/* PLANS GRID */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Horizontal scroll container */}
          <div className="overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex gap-0 rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(0,0,0,0.10)', background: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.06)', minWidth: 'max-content' }}>
              {plans.map((plan, i) => {
                const p = plan.price_monthly;
                const features = PLAN_FEATURES[plan.id] || [];
                const isLast = i === plans.length - 1;
                const isHighlighted = plan.id === 'advanced';

                return (
                  <motion.div key={plan.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="relative flex flex-col p-7"
                    style={{
                      width: 220,
                      borderRight: isLast ? 'none' : '1px solid rgba(0,0,0,0.08)',
                      outline: isHighlighted ? `2px solid ${FG}` : 'none',
                      outlineOffset: '-1px',
                      zIndex: isHighlighted ? 1 : 0,
                      background: 'white',
                    }}>

                    {/* Plan name */}
                    <p className="text-xs font-black uppercase tracking-widest mb-3 text-center"
                      style={{ color: FG }}>
                      {plan.name}
                    </p>

                    {/* Price */}
                    <div className="text-center mb-5">
                      <div className="flex items-end justify-center gap-1">
                        <span className="font-black" style={{ fontSize: '2.4rem', lineHeight: 1, color: FG }}>
                          {p === 0 ? '$0' : `$${p}`}
                        </span>
                        <span className="text-xs font-medium mb-1.5" style={{ color: 'rgba(10,10,10,0.4)' }}>
                          /mo
                        </span>
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(10,10,10,0.3)' }}>
                        billed monthly
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="mb-5" style={{ height: 1, background: 'rgba(0,0,0,0.07)' }} />

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-7">
                      {features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2.5 text-xs font-medium">
                          <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FG }} />
                          <span style={{ color: 'rgba(10,10,10,0.65)' }}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => plan.id === 'free' ? handleCta() : base44.auth.redirectToLogin('/manage-plan')}
                      className="w-full py-3 font-black text-xs transition-all hover:opacity-80 rounded-lg"
                      style={{
                        background: isHighlighted ? FG : 'transparent',
                        color: isHighlighted ? 'white' : FG,
                        border: isHighlighted ? 'none' : `1.5px solid ${FG}`,
                      }}>
                      {plan.id === 'free' ? 'Get Started Free' : 'Get Started'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Enterprise */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-4 rounded-2xl p-8 text-center"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <p className="font-black text-lg mb-1" style={{ color: FG }}>Enterprise Plan</p>
            <p className="text-sm mb-4 font-medium" style={{ color: 'rgba(10,10,10,0.45)' }}>
              Custom pricing for organizations needing unlimited capacity
            </p>
            <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
              {['Unlimited Tensors', 'Dedicated support', 'Custom integrations', 'Premium SLA'].map(f => (
                <span key={f} className="text-xs font-semibold" style={{ color: 'rgba(10,10,10,0.5)' }}>• {f}</span>
              ))}
            </div>
            <a href="mailto:contact.stensor@proton.me"
              className="inline-flex items-center gap-2 px-6 py-3 font-black text-xs transition-all hover:opacity-80 rounded-lg"
              style={{ background: FG, color: 'white' }}>
              Contact Sales
            </a>
          </motion.div>

          <p className="text-center text-xs mt-6 font-medium" style={{ color: 'rgba(10,10,10,0.3)' }}>
            Cancel anytime · No hidden fees · Secure payment
          </p>
        </div>
      </section>

      <FinalCta onCta={handleCta} />
      <LandingFooter logoUrl={logoUrl} />
    </div>
  );
}