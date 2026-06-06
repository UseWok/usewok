import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { Check, ExternalLink, Shield } from 'lucide-react';

const ContactModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', website: '', role: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await base44.entities.ContactLead.create({ ...form, status: 'new' }); } catch {}
    setSubmitted(true);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e3a2e', border: '1px solid #2a5a40', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Check size={22} color="#4ade80" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Message received!</h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>Our team will get back to you within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '10px 28px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Book a demo</h2>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 1.6, borderBottom: '1px solid #2A2A2A', paddingBottom: 20 }}>Connect with our team to see how WOK can help your organization.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['first_name','First Name'],['last_name','Last Name']].map(([k,l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>{l} *</label>
                    <input required value={form[k]} onChange={set(k)} placeholder={l}
                      style={{ width: '100%', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                  </div>
                ))}
              </div>
              {[['email','Work Email','email'],['website','Website','text'],['role','Your Role','text']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>{l} *</label>
                  <input required type={t} value={form[k]} onChange={set(k)} placeholder={l}
                    style={{ width: '100%', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>What would you like to discuss? *</label>
                <textarea required value={form.message} onChange={set('message')} placeholder="Describe your needs..." rows={3}
                  style={{ width: '100%', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
              </div>
              <button type="submit" style={{ width: '100%', padding: 12, background: '#fff', color: '#000', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Send message</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

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

  return (
    <div style={{ minHeight: '100vh', background: '#111111', fontFamily: 'Inter, system-ui, sans-serif', color: '#fff', paddingBottom: 80 }}>
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '48px 0 36px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>Choose your plan</h1>
          <p style={{ fontSize: 14, color: '#555', margin: 0 }}>Simple, transparent pricing. No hidden fees.</p>
        </div>

        {/* ── Plan cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 4)}, 1fr)`, gap: 12, marginBottom: 40 }}>
          {plans.map((plan) => {
            const isPopular = !!plan.badge;
            return (
              <div key={plan.id} style={{
                background: isPopular ? '#1C1C1C' : '#111',
                border: '1px solid #2A2A2A',
                borderRadius: 14,
                padding: '0 0 24px',
                display: 'flex', flexDirection: 'column',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Popular badge — top bar */}
                {isPopular && (
                  <div style={{
                    background: '#222', borderBottom: '1px solid #2A2A2A',
                    padding: '8px 20px', textAlign: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    Recommended
                  </div>
                )}

                <div style={{ padding: '20px 20px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Plan name */}
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>{plan.name}</h3>
                    {plan.desc && <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.5 }}>{plan.desc}</p>}
                  </div>

                  {/* Price */}
                  <div>
                    {plan.price !== null ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1 }}>€{plan.price}</span>
                        <span style={{ fontSize: 12, color: '#555' }}>/month</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Custom</span>
                    )}
                  </div>

                  {/* CTA */}
                  {plan.isEnterprise ? (
                    <button onClick={() => setShowModal(true)} style={{
                      width: '100%', padding: '10px 0', borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: 'transparent', color: '#fff', border: '1px solid #2A2A2A',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#555'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A2A'}
                    >Book a demo</button>
                  ) : (
                    <button onClick={() => handleUpgrade(plan)} style={{
                      width: '100%', padding: '10px 0', borderRadius: 8,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      background: isPopular ? '#fff' : 'transparent',
                      color: isPopular ? '#000' : '#fff',
                      border: isPopular ? 'none' : '1px solid #2A2A2A',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      {plan.price === 0 ? 'Get started' : 'Upgrade'}
                    </button>
                  )}

                  {/* Features */}
                  <div style={{ borderTop: '1px solid #222', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#999' }}>
                        <Check size={12} color="#555" style={{ marginTop: 2, flexShrink: 0 }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Security ── */}
        <div style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Shield size={18} color="#555" />
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 3px' }}>Security and compliance</h4>
              <p style={{ fontSize: 12, color: '#555', margin: 0 }}>Enterprise-grade security certifications</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginLeft: 12 }}>
              {['SOC 2', 'GDPR', 'ISO 27001'].map(badge => (
                <div key={badge} style={{ padding: '4px 10px', border: '1px solid #2A2A2A', borderRadius: 6, fontSize: 10, fontWeight: 600, color: '#555' }}>
                  {badge}
                </div>
              ))}
            </div>
          </div>
          <button style={{ fontSize: 12, color: '#555', background: 'none', border: '1px solid #2A2A2A', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}>
            Learn more
          </button>
        </div>

      </div>
    </div>
  );
}