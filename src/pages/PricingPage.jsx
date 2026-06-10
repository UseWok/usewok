import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { Check, X, Shield, Zap, Building2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

if (typeof document !== 'undefined' && !document.getElementById('sg-font')) {
  const link = document.createElement('link');
  link.id = 'sg-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
}

const FONT = "'Space Grotesk', system-ui, sans-serif";

/* ─── Contact modal ─── */
const ContactModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', website: '', role: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await base44.entities.ContactLead.create({ ...form, status: 'new' }); } catch {}
    setSubmitted(true);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const inputStyle = {
    width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A',
    borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#E5E5E5',
    outline: 'none', boxSizing: 'border-box', fontFamily: FONT, transition: 'border-color 150ms',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460, position: 'relative', fontFamily: FONT }}
      >
        <button onClick={onClose}
          style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.color = '#888'}
          onMouseLeave={e => e.currentTarget.style.color = '#444'}>
          <X size={15} />
        </button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0F2A1E', border: '1px solid #1A4A32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={20} color="#22C55E" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: FONT }}>Request received</h3>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>Our team will contact you within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '10px 28px', background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px', fontFamily: FONT }}>Book a demo</h2>
              <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>Connect with our team to see WOK in action.</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['first_name', 'First name'], ['last_name', 'Last name']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 5, fontWeight: 600 }}>{l}</label>
                    <input required value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                  </div>
                ))}
              </div>
              {[['email', 'Work email', 'email'], ['website', 'Company website', 'text'], ['role', 'Your role', 'text']].map(([k, l, t]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 5, fontWeight: 600 }}>{l}</label>
                  <input required type={t} value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 5, fontWeight: 600 }}>What would you like to discuss?</label>
                <textarea required value={form.message} onChange={set('message')} placeholder="Describe your use case..." rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
              </div>
              <button type="submit"
                style={{ width: '100%', padding: '11px 0', background: 'linear-gradient(135deg, #F95738, #FF8C42)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4, fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Send message
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

/* ─── FAQ — exclusive accordion ─── */
const FAQ_ITEMS = [
  { q: "What is WOK and how does it work?", a: "WOK is an AI-powered platform that lets you create custom software applications without any coding. It uses natural language processing to understand your needs and generate functional software based on your descriptions — accessible to non-technical users through simple conversations with our AI." },
  { q: "What's included in the free Starter plan?", a: "The free plan gives you 5 messages per day and a monthly cap of 25 messages. You also get 100 integration credits and access to all core integration types — authentication, database, analytics — letting you build fully functional apps at no cost." },
  { q: "What are integration credits and how are they used?", a: "Integration credits power the various integrations inside your app: LLMs, file uploads, image understanding, image generation, email, SMS, database queries, and more. The number of credits in your plan determines how many of these requests you can make per month." },
  { q: "What kind of applications can I build?", a: "WOK is versatile: fully functional SaaS products, back-office tools, personal productivity apps, client portals, business process automation tools, and rapid prototypes or MVPs. Validate your ideas fast without expensive dev resources." },
  { q: "Who owns the applications I create?", a: "You do. All apps and content generated through our platform are your property. We claim no ownership over what you create. You're free to use, modify, distribute, or sell your generated applications within the limits of applicable law." },
  { q: "How does deployment work?", a: "Deployment is instant. Your applications are usable and shareable the moment you create them — just share the URL. No separate hosting or deployment steps required." },
  { q: "What happens when I reach my message limit?", a: "When you hit your daily limit, you wait until the next day. When you hit your monthly limit, no more messages or integration requests until your next billing cycle begins. Upgrade anytime from your billing dashboard to avoid interruptions." },
];

function FaqItem({ item, isOpen, onToggle, isFirst }) {
  return (
    <div style={{ borderTop: isFirst ? '1px solid #1E1E1E' : 'none', borderBottom: '1px solid #1E1E1E' }}>
      <button onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: FONT }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#E5E5E5', lineHeight: 1.55 }}>{item.q}</span>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          border: `1px solid ${isOpen ? '#F95738' : '#2A2A2A'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: isOpen ? 'rgba(249,87,56,0.1)' : 'transparent', transition: 'all 150ms',
        }}>
          <Plus size={13} color={isOpen ? '#F95738' : '#555'} style={{ transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 200ms' }} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 13.5, color: '#888', lineHeight: 1.8, paddingBottom: 20, margin: 0 }}>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Compliance badges ─── */
const COMPLIANCE_LOGOS = [
  { label: 'SOC 2 Type II', src: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/AICPA_SOC_2_Type_II.svg' },
  { label: 'GDPR', src: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/GDPR_Logo.svg' },
  { label: 'ISO/IEC 27001', src: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/ISO_IEC_27001_logo.svg' },
];

const ENT_FEATURES = [
  "Unlimited seats & messages",
  "Dedicated cloud infrastructure",
  "SSO & advanced permissions",
  "Custom integrations & API access",
  "SOC 2 · GDPR · ISO 27001",
  "99.9% uptime SLA",
  "Onboarding & team training",
  "Dedicated customer success manager",
];

/* ─── Main ─── */
export default function PricingPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [configPlans, setConfigPlans] = useState(getPlansConfig());
  const [user, setUser] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    loadPlansFromDB().then(dbPlans => { if (dbPlans) setConfigPlans(dbPlans); }).catch(() => {});
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const plans = configPlans
    .map((p) => {
      const isEnterprise = !p.price_monthly || p.checkout_url_monthly?.startsWith('mailto');
      return {
        id: p.id, name: p.name,
        price: isEnterprise ? null : (p.price_monthly || 0),
        badge: p.badge || null, desc: p.features_header || '',
        isEnterprise,
        features: (p.features || []).map(f => f.text || f),
        checkout_url_monthly: p.checkout_url_monthly,
      };
    })
    .filter(p => !p.isEnterprise);

  const handleUpgrade = (plan) => {
    if (plan.checkout_url_monthly?.startsWith('mailto')) { setShowModal(true); return; }
    if (plan.checkout_url_monthly?.startsWith('http')) { window.location.href = plan.checkout_url_monthly; return; }
    navigate(`/checkout?plan=${plan.id}&billing=monthly`);
  };

  const handleFaqToggle = (i) => setOpenFaq(prev => prev === i ? null : i);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: FONT, color: '#fff' }}>
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px 100px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '72px 0 56px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px',
            borderRadius: 999, border: '1px solid #2A2A2A', background: '#111',
            fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 24,
          }}>Pricing</div>

          <h1 style={{ fontSize: 48, fontWeight: 700, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontSize: 16, color: '#555', margin: 0, lineHeight: 1.6 }}>
            Start free. Scale when you're ready. No hidden fees.
          </p>
        </div>

        {/* ── Plan cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24, alignItems: 'start' }}>
          {plans.map((plan, i) => {
            const isPopular = !!plan.badge;

            const cardStyle = isPopular
              ? {
                  background: '#0F0F0F',
                  border: '1px solid rgba(249,140,66,0.6)',
                  borderRadius: 20, padding: '36px 28px',
                  marginTop: -14, marginBottom: -14,
                  boxShadow: '0 0 0 1px rgba(249,87,56,0.25), 0 32px 80px rgba(249,87,56,0.1)',
                  zIndex: 1, position: 'relative', display: 'flex', flexDirection: 'column',
                }
              : {
                  background: '#0D0D0D', border: '1px solid #1E1E1E',
                  borderRadius: 16, padding: '28px 24px',
                  position: 'relative', display: 'flex', flexDirection: 'column',
                };

            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
                style={cardStyle}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'linear-gradient(135deg, #F95738, #FF8C42)',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}>Most popular</div>
                )}

                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#161616',
                  border: `1px solid ${isPopular ? 'rgba(249,87,56,0.4)' : '#2A2A2A'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                }}>
                  <Zap size={16} color={isPopular ? '#F95738' : '#555'} />
                </div>

                {/* Name */}
                <p style={{ fontSize: 11, fontWeight: 700, color: isPopular ? '#F95738' : '#555', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>
                  {plan.name}
                </p>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 20 }}>
                  <span style={{ fontSize: 44, fontWeight: 300, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em' }}>
                    ${plan.price}
                  </span>
                  <span style={{ fontSize: 13, color: '#444', fontWeight: 400 }}>/month</span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleUpgrade(plan)}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 9,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
                    transition: 'all 150ms', marginBottom: 22,
                    ...(isPopular
                      ? {
                          background: 'linear-gradient(135deg, #F95738, #FF8C42)',
                          color: '#fff', border: '1px solid rgba(255,255,255,0.18)',
                          boxShadow: '0 4px 24px rgba(249,87,56,0.3)',
                        }
                      : { background: 'transparent', color: '#ccc', border: '1px solid #2A2A2A' }
                    ),
                  }}
                  onMouseEnter={e => {
                    if (isPopular) e.currentTarget.style.opacity = '0.9';
                    else { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#fff'; }
                  }}
                  onMouseLeave={e => {
                    if (isPopular) e.currentTarget.style.opacity = '1';
                    else { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#ccc'; }
                  }}
                >
                  {plan.price === 0 ? 'Get started free' : 'Get started'}
                </button>

                {/* Divider */}
                <div style={{ height: 1, background: '#1A1A1A', marginBottom: 20 }} />

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <Check size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: '#fff', lineHeight: 1.55, fontWeight: 400 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Enterprise block ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28, ease: [0.4, 0, 0.2, 1] }}
          style={{
            background: '#0D0D0D', border: '1px solid #222',
            borderRadius: 16, padding: '32px 32px 28px', marginBottom: 20,
          }}
        >
          {/* Compliance logos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {COMPLIANCE_LOGOS.map(logo => (
              <img
                key={logo.label}
                src={logo.src}
                alt={logo.label}
                title={logo.label}
                style={{
                  height: 22, width: 'auto', opacity: 0.55,
                  filter: 'brightness(0) invert(1)',
                  transition: 'opacity 200ms',
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.55'}
                onError={e => {
                  // fallback text badge
                  const parent = e.currentTarget.parentNode;
                  const badge = document.createElement('div');
                  badge.textContent = logo.label;
                  badge.style.cssText = 'padding:4px 10px;border:1px solid #333;border-radius:6px;font-size:10px;font-weight:600;color:#555;letter-spacing:0.04em;font-family:Inter,sans-serif';
                  parent.replaceChild(badge, e.currentTarget);
                }}
              />
            ))}
            <div style={{ height: 14, width: 1, background: '#2A2A2A' }} />
            <span style={{ fontSize: 11, color: '#444', fontWeight: 500, letterSpacing: '0.03em' }}>Enterprise-grade compliance</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#161616', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={16} color="#888" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Enterprise
                </span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                Built for organizations
              </h3>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65, margin: 0, maxWidth: 380 }}>
                Custom contracts, dedicated infrastructure, and enterprise-grade security for organizations that need full control.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '12px 24px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: 'linear-gradient(135deg, #F95738, #FF8C42)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.18)',
                fontFamily: FONT, transition: 'opacity 150ms', whiteSpace: 'nowrap', flexShrink: 0,
                boxShadow: '0 4px 20px rgba(249,87,56,0.25)',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Book a demo →
            </button>
          </div>

          <div style={{ height: 1, background: '#1A1A1A', marginBottom: 24 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 40px' }}>
            {ENT_FEATURES.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <Check size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: '#ccc', lineHeight: 1.55, fontWeight: 400 }}>{feat}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <div style={{ marginTop: 88 }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              Frequently asked questions
            </h2>
            <p style={{ fontSize: 14, color: '#555', margin: 0, lineHeight: 1.6 }}>Everything you need to know about WOK.</p>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={i}
                item={item}
                isFirst={i === 0}
                isOpen={openFaq === i}
                onToggle={() => handleFaqToggle(i)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}