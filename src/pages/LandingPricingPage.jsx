import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check } from 'lucide-react';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';

const CORAL = '#F95738';
const BG = '#111111';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', padding: '14px 20px' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 980, padding: '10px 20px',
        background: scrolled ? 'rgba(17,17,17,0.97)' : 'rgba(17,17,17,0.75)',
        backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 999, transition: 'background 0.3s',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 30, height: 'auto', mixBlendMode: 'screen' }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>WOK</span>
        </a>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }} className="hidden md:block">Home</a>
          <a href="/blog" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }} className="hidden md:block">Blog</a>
          <button onClick={() => base44.auth.redirectToLogin('/app')}
            style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Sign in
          </button>
          <motion.button onClick={() => base44.auth.redirectToLogin('/app')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: CORAL, border: 'none', borderRadius: 999, padding: '9px 20px', cursor: 'pointer' }}>
            Start free →
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

function formatCredits(n) {
  if (!n && n !== 0) return null;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

const PLAN_META = {
  free:    { highlight: false, cta: 'Get started' },
  starter: { highlight: false, cta: 'Start building' },
  creator: { highlight: true,  cta: 'Most popular →' },
  pro:     { highlight: false, cta: 'Go Pro' },
};

export default function LandingPricingPage() {
  const [plansConfig, setPlansConfig] = useState(() => getPlansConfig());
  const [billing, setBilling] = useState('monthly');

  useEffect(() => {
    loadPlansFromDB().then(p => { if (p) setPlansConfig(p); });
  }, []);

  const visibleIds = ['free', 'starter', 'creator', 'pro'];
  const plans = plansConfig
    .filter(p => visibleIds.includes(p.id))
    .sort((a, b) => visibleIds.indexOf(a.id) - visibleIds.indexOf(b.id));

  const getPrice = (plan) => {
    const base = plan.price_monthly ?? plan.price ?? 0;
    if (base === 0) return 0;
    return billing === 'yearly' ? Math.round(base * 0.8) : base;
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: BG, minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 600,
          background: `radial-gradient(ellipse, rgba(249,87,56,0.1) 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '160px 24px 80px' }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 24 }}>
            Pricing
          </motion.p>
          <div style={{ overflow: 'hidden', marginBottom: 8 }}>
            <motion.h1 initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', color: '#fff', margin: 0 }}>
              Simple.
            </motion.h1>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: 8 }}>
            <motion.h1 initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.37, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', color: CORAL, margin: 0 }}>
              Honest.
            </motion.h1>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: 52 }}>
            <motion.h1 initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.49, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.12)', margin: 0 }}>
              No tricks.
            </motion.h1>
          </div>

          {/* Billing toggle */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: 4 }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                style={{
                  padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: billing === b ? '#fff' : 'transparent',
                  color: billing === b ? '#111' : 'rgba(255,255,255,0.45)',
                  fontSize: 13, fontWeight: 700, transition: 'all 150ms',
                }}>
                {b === 'monthly' ? 'Monthly' : 'Yearly'}
                {b === 'yearly' && <span style={{ marginLeft: 6, fontSize: 10, color: billing === 'yearly' ? CORAL : 'rgba(255,255,255,0.3)', fontWeight: 800 }}>-20%</span>}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Plans grid */}
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
          {plans.map((plan, i) => {
            const meta = PLAN_META[plan.id] || {};
            const price = getPrice(plan);
            const isHighlight = meta.highlight;
            const features = (plan.features || []).map(f => f.text || f);
            const creditsLabel = plan.credits_limit ? `${formatCredits(plan.credits_limit)} credits/mo` : null;

            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: '32px 28px',
                  background: isHighlight ? 'rgba(249,87,56,0.08)' : 'rgba(255,255,255,0.03)',
                  border: isHighlight ? `1px solid rgba(249,87,56,0.4)` : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20, position: 'relative',
                }}
              >
                {isHighlight && (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    background: CORAL, color: '#fff', fontSize: 10, fontWeight: 800,
                    padding: '4px 14px', borderRadius: 999, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    Most popular
                  </div>
                )}

                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: isHighlight ? CORAL : 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
                  {plan.name}
                </p>

                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 'clamp(2.5rem, 5vw, 3.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {price === 0 ? 'Free' : `$${price}`}
                  </span>
                  {price > 0 && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', marginLeft: 4 }}>/mo</span>}
                </div>

                {billing === 'yearly' && price > 0 && (
                  <p style={{ fontSize: 11, color: 'rgba(249,87,56,0.7)', marginBottom: 4, fontWeight: 600 }}>
                    Billed ${price * 12}/year
                  </p>
                )}

                {creditsLabel && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{creditsLabel}</p>
                )}

                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {features.map((f, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <Check style={{ width: 13, height: 13, color: isHighlight ? CORAL : 'rgba(255,255,255,0.4)', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={() => base44.auth.redirectToLogin('/app')}
                  style={{
                    width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: isHighlight ? CORAL : 'rgba(255,255,255,0.08)',
                    color: isHighlight ? '#fff' : 'rgba(255,255,255,0.7)',
                    fontSize: 13, fontWeight: 700, transition: 'opacity 150ms', letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {meta.cta || 'Get started'}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{
            marginTop: 20, padding: '32px 40px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
          }}
        >
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Enterprise</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Custom volume, dedicated infra, SSO, SLA — let's talk.</p>
          </div>
          <a href="mailto:hello@wok.so"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'border-color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          >
            Contact us <ArrowRight style={{ width: 14, height: 14 }} />
          </a>
        </motion.div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.18)', marginTop: 28 }}>
          Cancel anytime · No hidden fees · Secure payment
        </p>
      </div>

      {/* CTA footer */}
      <section style={{ background: '#0D0D0D', padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 32px' }}>
            Your idea.<br /><span style={{ color: CORAL }}>Live today.</span>
          </motion.h2>
          <motion.button onClick={() => base44.auth.redirectToLogin('/app')}
            whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '18px 48px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: CORAL, color: '#fff', fontSize: 15, fontWeight: 800,
              boxShadow: '0 16px 48px rgba(249,87,56,0.38)',
            }}>
            Start free <ArrowRight style={{ width: 16, height: 16 }} />
          </motion.button>
        </div>
      </section>

      <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 26, height: 'auto', mixBlendMode: 'screen' }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>WOK</span>
        </a>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Home', '/'], ['Blog', '/blog'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.22)'}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.12)', margin: 0 }}>© 2026 WOK</p>
      </footer>
    </div>
  );
}