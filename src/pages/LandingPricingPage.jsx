import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const F = "'Inter', system-ui, sans-serif";
const BG = '#0A0A0A';
const BORDER = 'rgba(255,255,255,0.08)';
const ACCENT = '#5A5AF0';

function FontLoader() {
  useEffect(() => {
    if (document.getElementById('lp-font')) return;
    const l = document.createElement('link');
    l.id = 'lp-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }, []);
  return null;
}

function Navbar({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', fontFamily: F,
      background: scrolled ? 'rgba(10,10,10,0.94)' : 'rgba(10,10,10,0.7)',
      backdropFilter: 'blur(20px)',
      borderBottom: scrolled ? `1px solid ${BORDER}` : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M0.705 14.443L3.557 17.295C3.837 17.575 4.258 17.638 4.607 17.435L0.565 13.393C0.362 13.742 0.425 14.163 0.705 14.443Z" fill="white"/>
          <path d="M0 11.338V12.106L5.894 18H6.662L0 11.338Z" fill="white"/>
          <path d="M9 0C4.029 0 0 4.029 0 9V10.272L7.728 18H9C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="white"/>
        </svg>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>Linear</span>
      </a>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {[['Product', '/'], ['Resources', '#'], ['Customers', '#'], ['Pricing', '/pricing'], ['Now', '#'], ['Contact', '#']].map(([l, h]) => (
          <a key={l} href={h} style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
            {l}
          </a>
        ))}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />
        <button onClick={onLogin} style={{ fontFamily: F, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.55)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 150ms', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
          Log in
        </button>
        <button onClick={onSignup} style={{
          fontFamily: F, fontSize: 14, fontWeight: 500, color: '#000',
          background: '#fff', border: 'none', borderRadius: 20,
          padding: '7px 18px', cursor: 'pointer', transition: 'opacity 150ms',
        }}>Sign up</button>
      </nav>
    </header>
  );
}

const CHECK = ({ color = 'rgba(255,255,255,0.7)' } = {}) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7L5.5 10.5L12 3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const DASH = () => <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 14 }}>—</span>;

const PLANS = [
  {
    name: 'Free', monthlyPrice: 0, annualPrice: 0, unit: 'per member / month',
    desc: 'For individuals and small teams who want to try Linear.',
    cta: 'Start for free', ctaStyle: 'outline',
    features: { members: 'Up to 10 members', storage: '250 MB', history: '6 months', integrations: true, cycles: true, projects: true, roadmaps: false, analytics: false, sso: false, sla: false, support: 'Community', api: 'Basic' },
  },
  {
    name: 'Standard', monthlyPrice: 10, annualPrice: 8, unit: 'per member / month',
    desc: 'For growing teams that need more power and flexibility.',
    cta: 'Start Standard', ctaStyle: 'primary',
    badge: 'Most popular',
    features: { members: 'Unlimited', storage: '10 GB', history: 'Unlimited', integrations: true, cycles: true, projects: true, roadmaps: true, analytics: true, sso: false, sla: false, support: 'Email', api: 'Full' },
  },
  {
    name: 'Plus', monthlyPrice: 20, annualPrice: 16, unit: 'per member / month',
    desc: 'For scaling teams that need advanced controls and support.',
    cta: 'Start Plus', ctaStyle: 'outline',
    features: { members: 'Unlimited', storage: '250 GB', history: 'Unlimited', integrations: true, cycles: true, projects: true, roadmaps: true, analytics: true, sso: 'SAML', sla: false, support: 'Priority', api: 'Full + Webhooks' },
  },
  {
    name: 'Enterprise', monthlyPrice: null, annualPrice: null, unit: '',
    desc: 'For large organizations that need enterprise-grade security and support.',
    cta: 'Contact sales', ctaStyle: 'outline',
    features: { members: 'Unlimited', storage: 'Custom', history: 'Unlimited', integrations: true, cycles: true, projects: true, roadmaps: true, analytics: true, sso: 'SAML + SCIM', sla: '99.9% uptime', support: 'Dedicated CSM', api: 'Full + Webhooks + Priority' },
  },
];

const FEATURE_GROUPS = [
  {
    label: 'Workspace',
    rows: [
      { label: 'Members', key: 'members', type: 'text' },
      { label: 'File storage', key: 'storage', type: 'text' },
      { label: 'Issue history', key: 'history', type: 'text' },
    ],
  },
  {
    label: 'Core features',
    rows: [
      { label: 'Issues & sub-issues', key: 'issues', type: 'check_all' },
      { label: 'Cycles', key: 'cycles', type: 'bool' },
      { label: 'Projects', key: 'projects', type: 'bool' },
      { label: 'Roadmaps', key: 'roadmaps', type: 'bool' },
      { label: 'Analytics & insights', key: 'analytics', type: 'bool' },
    ],
  },
  {
    label: 'Security',
    rows: [
      { label: 'SSO / SAML', key: 'sso', type: 'text_or_bool' },
      { label: 'SLA', key: 'sla', type: 'text_or_bool' },
    ],
  },
  {
    label: 'Support',
    rows: [
      { label: 'Support level', key: 'support', type: 'text' },
      { label: 'API access', key: 'api', type: 'text' },
    ],
  },
];

function CellValue({ val, type }) {
  if (type === 'check_all') return <CHECK />;
  if (type === 'bool') {
    if (val === true) return <CHECK />;
    if (val === false) return <DASH />;
    return <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{val}</span>;
  }
  if (type === 'text_or_bool') {
    if (val === false) return <DASH />;
    if (val === true) return <CHECK />;
    return <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{val}</span>;
  }
  return <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{val}</span>;
}

const LOGOS = ['▲ Vercel', '⊕ CURSOR', 'OSCAR', 'OpenAI', 'coinbase', '$ Cash App', '⊗ BOOM', 'ramp ↗'];

export default function LandingPricingPage() {
  const [annual, setAnnual] = useState(true);
  const onSignup = () => base44.auth.redirectToLogin('/app');
  const onLogin = () => base44.auth.redirectToLogin('/app');

  return (
    <div style={{ background: BG, fontFamily: F, minHeight: '100vh' }}>
      <FontLoader />
      <Navbar onLogin={onLogin} onSignup={onSignup} />

      {/* Hero */}
      <section style={{ padding: '120px 80px 80px', fontFamily: F }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, margin: '0 0 64px' }}>
            Pricing
          </h1>

          {/* Billing toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 3 }}>
              {[['Monthly', false], ['Annually', true]].map(([label, val]) => (
                <button key={label} onClick={() => setAnnual(val)} style={{
                  fontFamily: F, fontSize: 13, fontWeight: 500,
                  padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: annual === val ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: annual === val ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'all 200ms',
                }}>
                  {label}
                </button>
              ))}
            </div>
            {annual && <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 500 }}>Save 20%</span>}
          </div>

          {/* Plan cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
            {PLANS.map((plan, i) => (
              <div key={i} style={{
                padding: '32px 28px',
                background: plan.name === 'Plus' ? 'rgba(90,90,240,0.06)' : 'rgba(255,255,255,0.02)',
                borderRight: i < PLANS.length - 1 ? `1px solid ${BORDER}` : 'none',
                position: 'relative',
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: ACCENT, borderRadius: '0 0 6px 6px', padding: '2px 12px', fontSize: 11, fontWeight: 600, color: '#fff' }}>
                    {plan.badge}
                  </div>
                )}
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{plan.name}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: '0 0 20px', minHeight: 48 }}>{plan.desc}</p>

                <div style={{ marginBottom: 20 }}>
                  {plan.monthlyPrice === null ? (
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>Custom</span>
                  ) : plan.monthlyPrice === 0 ? (
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>Free</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>
                        ${annual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 6 }}>{plan.unit}</span>
                    </>
                  )}
                </div>

                <button onClick={onSignup} style={{
                  fontFamily: F, fontSize: 13, fontWeight: 600, width: '100%',
                  padding: '10px 0', borderRadius: 7, border: `1px solid`,
                  borderColor: plan.ctaStyle === 'primary' ? 'transparent' : 'rgba(255,255,255,0.15)',
                  background: plan.ctaStyle === 'primary' ? '#fff' : 'transparent',
                  color: plan.ctaStyle === 'primary' ? '#000' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', transition: 'all 200ms', marginBottom: 8,
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo strip */}
      <section style={{ padding: '48px 80px', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          {LOGOS.map(l => (
            <span key={l} style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '-0.01em' }}>{l}</span>
          ))}
        </div>
      </section>

      {/* Full feature comparison table */}
      <section style={{ padding: '80px 80px', fontFamily: F }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 48px' }}>Compare plans</h2>

          {/* Sticky header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 160px)', gap: 0, borderBottom: `1px solid ${BORDER}`, paddingBottom: 16, marginBottom: 8 }}>
            <div />
            {PLANS.map((p, i) => (
              <div key={i} style={{ textAlign: 'center', paddingBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.name}</span>
              </div>
            ))}
          </div>

          {FEATURE_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 0 }}>
              {/* Group label */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 160px)', paddingTop: 28, paddingBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{group.label}</div>
              </div>

              {group.rows.map((row, ri) => (
                <div key={ri} style={{
                  display: 'grid', gridTemplateColumns: '1fr repeat(4, 160px)',
                  padding: '11px 0',
                  borderTop: `1px solid rgba(255,255,255,0.04)`,
                }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{row.label}</div>
                  {PLANS.map((plan, pi) => (
                    <div key={pi} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CellValue val={plan.features[row.key]} type={row.type} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* Bottom CTA row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 160px)', gap: 0, marginTop: 48, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
            <div />
            {PLANS.map((plan, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 8px' }}>
                <button onClick={onSignup} style={{
                  fontFamily: F, fontSize: 13, fontWeight: 600, width: '100%',
                  padding: '9px 0', borderRadius: 7, border: `1px solid`,
                  borderColor: plan.ctaStyle === 'primary' ? 'transparent' : 'rgba(255,255,255,0.15)',
                  background: plan.ctaStyle === 'primary' ? '#fff' : 'transparent',
                  color: plan.ctaStyle === 'primary' ? '#000' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', transition: 'opacity 200ms',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '160px 80px', textAlign: 'center', fontFamily: F }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, margin: '0 0 40px' }}>
            Built for the future.<br />Available today.
          </h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onSignup} style={{
              fontFamily: F, fontSize: 15, fontWeight: 500, color: '#000',
              background: '#fff', border: 'none', borderRadius: 8,
              padding: '12px 28px', cursor: 'pointer', transition: 'opacity 150ms',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Get started
            </button>
            <button style={{
              fontFamily: F, fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.6)',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
              padding: '12px 28px', cursor: 'pointer', transition: 'all 200ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
              Contact sales
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '60px 80px 40px', fontFamily: F }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(5, 1fr)', gap: 32, marginBottom: 48 }}>
            <div>
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path d="M0.705 14.443L3.557 17.295C3.837 17.575 4.258 17.638 4.607 17.435L0.565 13.393C0.362 13.742 0.425 14.163 0.705 14.443Z" fill="rgba(255,255,255,0.5)"/>
                <path d="M0 11.338V12.106L5.894 18H6.662L0 11.338Z" fill="rgba(255,255,255,0.5)"/>
                <path d="M9 0C4.029 0 0 4.029 0 9V10.272L7.728 18H9C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.5)"/>
              </svg>
            </div>
            {[
              { title: 'Product', links: ['Intake', 'Plan', 'Build', 'Diffs', 'Monitor', 'Pricing', 'Security'] },
              { title: 'Features', links: ['Asks', 'Agents', 'Coding Sessions', 'Customer Requests', 'Insights', 'Mobile', 'Integrations'] },
              { title: 'Company', links: ['About', 'Customers', 'Careers', 'Blog', 'Method', 'Quality', 'Brand'] },
              { title: 'Resources', links: ['Switch', 'Download', 'Documentation', 'Developers', 'Status', 'Enterprise'] },
              { title: 'Connect', links: ['Contact us', 'Community', 'X (Twitter)', 'GitHub', 'YouTube'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(link => (
                    <a key={link} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 150ms' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'DPA', 'AUP'].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}