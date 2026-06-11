import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { Check, X, Shield, Zap, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 150ms',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460, position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 120ms' }}
          onMouseEnter={e => e.currentTarget.style.color = '#888'}
          onMouseLeave={e => e.currentTarget.style.color = '#444'}>
          <X size={15} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0F2A1E', border: '1px solid #1A4A32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={20} color="#22C55E" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Request received</h3>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>Our team will contact you within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '10px 28px', background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Book a demo</h2>
              <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>Connect with our team to see WOK in action.</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['first_name', 'First name'], ['last_name', 'Last name']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 5, fontWeight: 500 }}>{l}</label>
                    <input required value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                  </div>
                ))}
              </div>
              {[['email', 'Work email', 'email'], ['website', 'Company website', 'text'], ['role', 'Your role', 'text']].map(([k, l, t]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 5, fontWeight: 500 }}>{l}</label>
                  <input required type={t} value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 5, fontWeight: 500 }}>What would you like to discuss?</label>
                <textarea required value={form.message} onChange={set('message')} placeholder="Describe your use case..." rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '11px 0', background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4, transition: 'opacity 150ms' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
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

const PLAN_ICONS = { 0: Zap, 1: ArrowRight, 2: Building2, 3: Building2 };

export default function PricingPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [configPlans, setConfigPlans] = useState(getPlansConfig());
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadPlansFromDB().then(dbPlans => { if (dbPlans) setConfigPlans(dbPlans); }).catch(() => {});
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const plans = configPlans.map((p) => {
    const isEnterprise = !p.price_monthly || p.checkout_url_monthly?.startsWith('mailto');
    return {
      id: p.id,
      name: p.name,
      price: isEnterprise ? null : (p.price_monthly || 0),
      badge: p.badge || null,
      desc: p.features_header || '',
      isEnterprise,
      features: (p.features || []).map(f => f.text || f),
      checkout_url_monthly: p.checkout_url_monthly,
    };
  });

  const handleUpgrade = (plan) => {
    if (plan.isEnterprise || plan.checkout_url_monthly?.startsWith('mailto')) { setShowModal(true); return; }
    if (plan.checkout_url_monthly?.startsWith('http')) { window.location.href = plan.checkout_url_monthly; return; }
    navigate(`/checkout?plan=${plan.id}&billing=monthly`);
  };

  const cols = Math.min(plans.length, 4);

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 80% 50% at 50% 120%, rgba(255,140,0,0.55) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 140%, rgba(249,87,56,0.45) 0%, transparent 55%),
        radial-gradient(ellipse 40% 30% at 20% 130%, rgba(255,200,0,0.3) 0%, transparent 50%),
        #1F1F1F
      `,
      fontFamily: 'Inter, system-ui, sans-serif', color: '#fff',
    }}>
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px 100px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '80px 0 64px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 300, color: '#fff', margin: '0 0 20px',
            letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            Simple pricing.<br />No surprises.
          </h1>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#fff', margin: 0, lineHeight: 1.7, opacity: 0.6 }}>
            Start free. Scale when you're ready.
          </p>
        </div>

        {/* ── Plan cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 20,
          marginBottom: 48,
        }}>
          {plans.map((plan, i) => {
            const isPopular = !!plan.badge;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  background: isPopular
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.03)',
                  border: isPopular
                    ? '1px solid rgba(255,255,255,0.2)'
                    : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  padding: '36px 30px 32px',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative', overflow: 'hidden',
                  backdropFilter: 'blur(12px)',
                  boxShadow: isPopular ? '0 0 60px rgba(255,140,0,0.08)' : 'none',
                }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div style={{
                    position: 'absolute', top: 0, right: 22,
                    background: '#fff', color: '#000',
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '4px 12px', borderRadius: '0 0 10px 10px',
                  }}>
                    Popular
                  </div>
                )}

                {/* Plan name */}
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 28px', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.7 }}>{plan.name}</h3>

                {/* Price */}
                <div style={{ marginBottom: 32 }}>
                  {plan.price !== null ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 52, fontWeight: 300, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em' }}>€{plan.price}</span>
                      <span style={{ fontSize: 13, color: '#fff', opacity: 0.5, fontWeight: 400 }}>/month</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 38, fontWeight: 300, color: '#fff', letterSpacing: '-0.03em' }}>Custom</span>
                  )}
                  {plan.desc && <p style={{ fontSize: 13, color: '#fff', opacity: 0.5, margin: '10px 0 0', lineHeight: 1.5, fontWeight: 400 }}>{plan.desc}</p>}
                </div>

                {/* CTA */}
                {plan.isEnterprise ? (
                  <button
                    onClick={() => setShowModal(true)}
                    style={{
                      width: '100%', padding: '13px 0', borderRadius: 12,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: 'transparent', color: '#fff',
                      border: '1px solid rgba(255,255,255,0.25)',
                      fontFamily: 'Inter, sans-serif', transition: 'border-color 150ms, background 150ms',
                      marginBottom: 28,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    Contact sales
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    style={{
                      width: '100%', padding: '13px 0', borderRadius: 12,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: isPopular ? '#fff' : 'rgba(255,255,255,0.1)',
                      color: isPopular ? '#000' : '#fff',
                      border: 'none',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'opacity 150ms, background 150ms',
                      marginBottom: 28,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    {plan.price === 0 ? 'Get started free' : 'Get started'}
                  </button>
                )}

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 24 }} />

                {/* Features — compact, no visual clutter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <Check style={{ width: 13, height: 13, color: '#fff', opacity: 0.4, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: '#fff', opacity: 0.75, lineHeight: 1.5, fontWeight: 400 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Security strip ── */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield style={{ width: 16, height: 16, color: '#fff', opacity: 0.4, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', opacity: 0.75 }}>Enterprise-grade security</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['SOC 2', 'GDPR', 'ISO 27001'].map(badge => (
              <div key={badge} style={{
                padding: '5px 12px', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#fff', opacity: 0.5,
              }}>
                {badge}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}