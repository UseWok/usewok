import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check, X } from 'lucide-react';
import { getPlansConfig } from '@/lib/plans-config';
import { getLandingContent } from '@/lib/landing-content';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const FEATURE_ROWS = [
  { label: 'Monthly credits', key: 'credits_limit', format: v => `${v}` },
  { label: 'Daily quota', key: 'daily_credits_limit', format: v => v === 0 ? 'Unlimited' : `${v}/day` },
  { label: 'Discussions', key: 'max_discussions', format: v => v === 0 ? 'Unlimited' : `${v} max` },
  { label: 'Internet Search', key: 'internet_access', format: v => v },
  { label: 'File Uploads', key: 'file_upload', format: v => v },
  { label: 'Expert AI Mode', key: 'ultimate_access', format: v => v },
  { label: 'Premium Support', key: 'premium_support', format: v => v },
];

// Essential plan upsell points
const ESSENTIAL_PITCH = [
  '100 credits/month — 10× more than free',
  'Advanced & Pro AI modes unlocked',
  'Attach PDFs, images, bank statements',
  'Access to all specialized financial agents',
  'Priority support — real humans answer',
];

export default function LandingPricingPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('yearly');
  const [scrolled, setScrolled] = useState(false);
  const [navData, setNavData] = useState(null);
  const plans = getPlansConfig(); // cheap → expensive left to right

  useEffect(() => {
    getLandingContent().then(d => setNavData(d?.nav));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCta = () => base44.auth.redirectToLogin('/app');
  const logoUrl = navData?.logo_url || LOGO_URL;
  const price = (plan) => billing === 'yearly' ? plan.price_yearly : plan.price_monthly;

  const essentialPlan = plans.find(p => p.id === 'essential');
  const otherPlans = plans.filter(p => p.id !== 'essential').reverse();

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
            <a href="/fonctionnalites" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">Features</a>
            <span className="text-xs font-black text-black border-b-2 border-black pb-0.5">Pricing</span>
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
      <section className="pt-44 pb-16 px-6 text-center bg-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-[10px] font-black tracking-[0.2em] uppercase"
            style={{ background: YUZU, color: FG }}>
            Pricing
          </div>
          <h1 className="font-black tracking-tight leading-[1.02] mb-6"
            style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: FG }}>
            Plans for every ambition.
          </h1>
          <p className="text-base max-w-xl mx-auto mb-10" style={{ color: 'rgba(10,10,10,0.4)' }}>
            A financial coach costs $200+/hr. Stensor starts free and scales with you.
          </p>
          {/* Billing toggle */}
          <div className="inline-flex items-center p-1 border border-black/08">
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="px-6 py-2.5 text-xs font-black transition-all"
                style={{ background: billing === b ? FG : 'transparent', color: billing === b ? 'white' : 'rgba(10,10,10,0.4)' }}>
                {b === 'monthly' ? 'Monthly' : 'Yearly −20%'}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ESSENTIAL SPOTLIGHT */}
      {essentialPlan && (
        <section className="px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-black overflow-hidden"
              style={{ border: '2px solid #0A0A0A' }}>
              <div className="flex flex-col lg:flex-row">
                {/* Left: pitch */}
                <div className="flex-1 p-10 lg:p-14">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] uppercase"
                    style={{ background: YUZU, color: FG }}>
                    Most Popular · Essential
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                    Your first real<br />financial upgrade.
                  </h2>
                  <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    A human coach charges $200+/hr and gives you 1h/month. Stensor Essential gives you unlimited access, 24/7, for a fraction of the price — and no judgment.
                  </p>
                  <div className="space-y-3 mb-10">
                    {ESSENTIAL_PITCH.map((point, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ background: YUZU }}>
                          <span className="text-[10px] font-black" style={{ color: FG }}>✓</span>
                        </div>
                        <span className="text-sm font-medium text-white">{point}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                    localStorage.setItem('stensor_cart_v1', JSON.stringify({ planId: 'essential', billing, ts: Date.now() }));
                    base44.auth.redirectToLogin(`/checkout?plan=essential&billing=${billing}`);
                  }}
                    className="inline-flex items-center gap-3 font-black text-sm px-8 py-4 hover:opacity-85 transition-opacity"
                    style={{ background: YUZU, color: FG }}>
                    Start Essential <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {/* Right: price */}
                <div className="lg:w-64 p-10 lg:p-14 flex flex-col justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {billing === 'yearly' ? 'Per month, billed yearly' : 'Per month'}
                  </p>
                  <p className="font-black text-white mb-1" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                    {price(essentialPlan) === 0 ? 'Free' : `$${price(essentialPlan)}`}
                  </p>
                  {billing === 'yearly' && (
                    <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      vs. ${essentialPlan.price_monthly}/mo billed monthly
                    </p>
                  )}
                  <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    10× cheaper than 1 hour with a traditional financial advisor.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ALL PLANS */}
      <section className="px-6 pb-28" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center font-black text-2xl mb-10 mt-16" style={{ color: FG }}>
            Compare all plans
          </motion.h2>
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="flex gap-4 md:grid min-w-max md:min-w-0"
              style={{ gridTemplateColumns: `repeat(${plans.length}, 1fr)` }}>
              {plans.map((plan, i) => {
                const p = price(plan);
                const isEssential = plan.id === 'essential';
                return (
                  <motion.div key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex flex-col p-6 flex-shrink-0 md:flex-shrink"
                    style={{
                      width: '200px',
                      background: isEssential ? FG : 'white',
                      border: isEssential ? 'none' : '1px solid rgba(0,0,0,0.08)',
                    }}>
                    {isEssential && (
                      <div className="inline-block mb-3 px-2 py-1 text-[9px] font-black uppercase tracking-wider self-start"
                        style={{ background: YUZU, color: FG }}>Best Value</div>
                    )}
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2"
                      style={{ color: isEssential ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,10,0.4)' }}>
                      {plan.name}
                    </p>
                    <p className="font-black mb-1" style={{ fontSize: '2rem', color: isEssential ? 'white' : FG }}>
                      {p === 0 ? 'Free' : `$${p}`}
                    </p>
                    {p > 0 && (
                      <p className="text-xs mb-5" style={{ color: isEssential ? 'rgba(255,255,255,0.3)' : 'rgba(10,10,10,0.35)' }}>
                        /mo{billing === 'yearly' ? ' yearly' : ''}
                      </p>
                    )}
                    {p === 0 && <p className="text-xs mb-5" style={{ color: 'rgba(10,10,10,0.35)' }}>To get started</p>}
                    <div className="space-y-2.5 mb-6 flex-1">
                      {FEATURE_ROWS.map(row => {
                        const val = row.format(plan[row.key]);
                        const isBool = typeof plan[row.key] === 'boolean';
                        return (
                          <div key={row.label} className="flex items-center justify-between gap-2">
                            <span className="text-xs" style={{ color: isEssential ? 'rgba(255,255,255,0.35)' : 'rgba(10,10,10,0.45)' }}>
                              {row.label}
                            </span>
                            {isBool ? (
                              plan[row.key]
                                ? <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isEssential ? YUZU : FG }} />
                                : <X className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(10,10,10,0.15)' }} />
                            ) : (
                              <span className="text-xs font-bold flex-shrink-0" style={{ color: isEssential ? 'white' : FG }}>{val}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => {
                        if (plan.id === 'free') { handleCta(); return; }
                        localStorage.setItem('stensor_cart_v1', JSON.stringify({ planId: plan.id, billing, ts: Date.now() }));
                        base44.auth.redirectToLogin(`/checkout?plan=${plan.id}&billing=${billing}`);
                      }}
                      className="w-full py-3 font-black text-xs transition-all hover:opacity-80"
                      style={{
                        background: isEssential ? YUZU : 'transparent',
                        color: isEssential ? FG : FG,
                        border: isEssential ? 'none' : '1px solid rgba(0,0,0,0.12)',
                      }}>
                        {plan.id === 'free' ? 'Start free' : 'Choose plan'}
                      </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="px-6 py-28 bg-black text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-black tracking-tight text-white mb-8"
          style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
          Stop paying $200/hr<br />for 1h of advice.
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-sm mb-10 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Get unlimited, personalized financial guidance — starting free.
        </motion.p>
        <motion.button initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }} onClick={handleCta}
          className="inline-flex items-center gap-3 font-black text-sm px-10 py-5 hover:opacity-85 transition-opacity"
          style={{ background: YUZU, color: FG }}>
          Start building for free <ArrowRight className="w-4 h-4" />
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