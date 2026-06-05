import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { Check, ExternalLink, Shield, Zap, Gift } from 'lucide-react';

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e3a2e', border: '1px solid #2a5a40', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Check size={22} color="#4ade80" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Message received!</h3>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>Our team will get back to you within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '10px 28px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Book a demo</h2>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.6, borderBottom: '1px solid #2A2A2A', paddingBottom: 20 }}>Connect with our team to see how WOK can help your organization.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['first_name','First Name'],['last_name','Last Name']].map(([k,l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>{l} *</label>
                    <input required value={form[k]} onChange={set(k)} placeholder={l}
                      style={{ width: '100%', background: '#111', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#F95738'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                  </div>
                ))}
              </div>
              {[['email','Work Email','email'],['website','Website','text'],['role','Your Role','text']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>{l} *</label>
                  <input required type={t} value={form[k]} onChange={set(k)} placeholder={l}
                    style={{ width: '100%', background: '#111', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#F95738'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>What would you like to discuss? *</label>
                <textarea required value={form.message} onChange={set('message')} placeholder="Describe your needs..." rows={3}
                  style={{ width: '100%', background: '#111', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#F95738'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
              </div>
              <button type="submit" style={{ width: '100%', padding: 12, background: '#F95738', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Send message</button>
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
  const [billingAnnual, setBillingAnnual] = useState(false);

  useEffect(() => {
    loadPlansFromDB().then(dbPlans => { if (dbPlans) setConfigPlans(dbPlans); }).catch(() => {});
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const plans = configPlans.map((p) => {
    const isEnterprise = !p.price_monthly || p.checkout_url_monthly?.startsWith('mailto');
    const price = billingAnnual ? Math.round((p.price_monthly || 0) * 0.8) : (p.price_monthly || 0);
    return {
      id: p.id,
      name: p.name,
      price: isEnterprise ? null : price,
      originalPrice: billingAnnual ? p.price_monthly : null,
      badge: p.badge || null,
      desc: p.features_header || '',
      isEnterprise,
      features: (p.features || []).map(f => f.text || f),
      checkout_url_monthly: p.checkout_url_monthly,
    };
  });

  const freeCredits = user?.credits_limit || 5;
  const usedCredits = user?.credits_used || 0;
  const remainingCredits = Math.max(0, freeCredits - usedCredits);
  const pct = freeCredits > 0 ? Math.min(100, Math.round((usedCredits / freeCredits) * 100)) : 0;

  const handleUpgrade = (plan) => {
    if (plan.isEnterprise || plan.checkout_url_monthly?.startsWith('mailto')) { setShowModal(true); return; }
    if (plan.checkout_url_monthly?.startsWith('http')) { window.location.href = plan.checkout_url_monthly; return; }
    navigate(`/checkout?plan=${plan.id}&billing=${billingAnnual ? 'yearly' : 'monthly'}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111111', fontFamily: 'Inter, system-ui, sans-serif', color: '#fff', paddingBottom: 80 }}>
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '32px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>Plans &amp; credits</h1>
            <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Manage your subscription plan and credit balance.</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = '#1A1A1A'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            Open docs <ExternalLink size={13} />
          </button>
        </div>

        {/* ── Current plan card ── */}
        {user && (
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: '20px 24px', marginBottom: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Left */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff' }}>
                  {user.full_name?.charAt(0)?.toUpperCase() || 'W'}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>You're on Free plan</p>
                  <p style={{ fontSize: 12, color: '#F95738', margin: 0, cursor: 'pointer' }}>Upgrade anytime</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4ade80' }}>
                <Check size={14} /> <span style={{ color: '#ccc' }}>{freeCredits} daily credits (up to 30/month)</span>
              </div>
              <button onClick={() => {}} style={{ marginTop: 12, fontSize: 13, color: '#888', background: 'none', border: '1px solid #2A2A2A', borderRadius: 7, padding: '6px 14px', cursor: 'pointer' }}>Manage</button>
            </div>
            {/* Right — Credits bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>Credits remaining</p>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{remainingCredits}</span>
              </div>
              <div style={{ height: 8, background: '#2A2A2A', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${100 - pct}%`, background: '#F95738', borderRadius: 999, transition: 'width 0.4s ease' }} />
              </div>
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Daily credits</p>
              <p style={{ fontSize: 12, color: '#666', margin: '2px 0 0' }}>Resets to {freeCredits} credits in 4 hours</p>
              <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>{remainingCredits}</p>
            </div>
          </div>
        )}

        {/* ── Billing toggle ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: billingAnnual ? '#888' : '#fff', fontWeight: billingAnnual ? 400 : 600 }}>Monthly</span>
          <button onClick={() => setBillingAnnual(v => !v)} style={{
            width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: billingAnnual ? '#F95738' : '#2A2A2A',
            position: 'relative', transition: 'background 200ms',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: billingAnnual ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              transition: 'left 200ms',
            }} />
          </button>
          <span style={{ fontSize: 13, color: billingAnnual ? '#fff' : '#888', fontWeight: billingAnnual ? 600 : 400 }}>
            Annual <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, marginLeft: 4 }}>–20%</span>
          </span>
        </div>

        {/* ── Plan cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{
              background: '#1A1A1A',
              border: plan.badge ? '1px solid #F95738' : '1px solid #2A2A2A',
              borderRadius: 14, padding: '24px 20px',
              display: 'flex', flexDirection: 'column', gap: 16, position: 'relative',
            }}>
              {plan.badge && (
                <span style={{ position: 'absolute', top: 16, right: 16, background: '#7B4FE0', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 700, padding: '3px 8px', letterSpacing: '0.02em' }}>
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5, margin: 0 }}>{plan.desc}</p>
              </div>

              <div>
                {plan.price !== null ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 34, fontWeight: 700, color: '#fff', lineHeight: 1 }}>€{plan.price}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>per month</span>
                    {plan.originalPrice && <span style={{ fontSize: 12, color: '#555', textDecoration: 'line-through', marginLeft: 4 }}>€{plan.originalPrice}</span>}
                  </div>
                ) : (
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Platform fee</span>
                )}
                {plan.price !== null && <p style={{ fontSize: 12, color: '#555', margin: '4px 0 0' }}>shared across unlimited users</p>}
                {plan.price !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                    <div style={{ width: 20, height: 10, borderRadius: 999, background: billingAnnual ? '#F95738' : '#2A2A2A', border: '1px solid #333', position: 'relative', cursor: 'pointer' }}
                      onClick={() => setBillingAnnual(v => !v)}>
                      <div style={{ position: 'absolute', top: 1, left: billingAnnual ? 11 : 1, width: 8, height: 8, borderRadius: '50%', background: '#fff', transition: 'left 200ms' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#888' }}>Annual</span>
                  </div>
                )}
              </div>

              {plan.isEnterprise ? (
                <button onClick={() => setShowModal(true)} style={{ width: '100%', padding: '11px 0', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#fff', border: '1px solid #2A2A2A', transition: 'border-color 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#F95738'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A2A'}>
                  Book a demo
                </button>
              ) : (
                <button onClick={() => handleUpgrade(plan)} style={{ width: '100%', padding: '11px 0', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', background: plan.badge ? '#7B4FE0' : '#F95738', color: '#fff', border: 'none', transition: 'opacity 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Upgrade
                </button>
              )}

              {/* Credits selector */}
              {!plan.isEnterprise && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', border: '1px solid #2A2A2A', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#ccc' }}>
                  100 credits / month
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              )}

              {/* Features */}
              <div style={{ borderTop: '1px solid #222', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 12, color: '#888', margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  All features in {plan.id === 'free' ? 'Free' : plan.id === 'pro' ? 'Free' : 'Pro'}, plus:
                </p>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#ccc' }}>
                    <Check size={14} color="#4ade80" style={{ marginTop: 2, flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Gift Cards section ── */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 14, padding: '24px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Gift size={18} color="#F95738" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Gift cards</h3>
            </div>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>Send a gift card to your friends.</p>
            <button style={{ fontSize: 13, color: '#fff', background: 'none', border: '1px solid #2A2A2A', borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#F95738'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A2A'}>
              See all gift cards
            </button>
          </div>
          <div style={{ fontSize: 48 }}>🎁</div>
        </div>

        {/* ── Special Programs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { title: 'WOK for students', desc: 'Verify student status and get access to up to 50% off WOK Pro.', cta: 'Get started' },
            { title: 'WOK for campus', desc: 'Billing and administrative controls for universities and colleges.', cta: 'Contact sales' },
            { title: 'WOK for kids', desc: 'Compliant access & curriculum for schools in partnership with omep.', cta: 'Learn more' },
          ].map(p => (
            <div key={p.title} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 14, padding: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{p.title}</h4>
              <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px', lineHeight: 1.5 }}>{p.desc}</p>
              <button style={{ fontSize: 13, color: '#fff', background: 'none', border: '1px solid #2A2A2A', borderRadius: 7, padding: '7px 14px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#F95738'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A2A'}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        {/* ── Security & Compliance ── */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 14, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Shield size={20} color="#888" />
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Security and compliance</h4>
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Enterprise-grade security and compliance certifications</p>
            </div>
            <div style={{ display: 'flex', gap: 16, marginLeft: 16 }}>
              {['SOC 2\nType', 'GDPR', 'ISO\n27001'].map(badge => (
                <div key={badge} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#888', textAlign: 'center', whiteSpace: 'pre-line' }}>
                  {badge}
                </div>
              ))}
            </div>
          </div>
          <button style={{ fontSize: 13, color: '#fff', background: 'none', border: '1px solid #2A2A2A', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>Learn more</button>
        </div>

      </div>
    </div>
  );
}