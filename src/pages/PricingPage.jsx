import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';

const ContactModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', website: '', role: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.ContactLead.create({ ...form, status: 'new' });
    } catch {}
    setSubmitted(true);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{background:'#FFFFFF',border:'0.5px solid #E5E5E5',borderRadius:'16px',padding:'2rem',width:'100%',maxWidth:'480px',position:'relative'}}>
        <button
          onClick={onClose}
          style={{position:'absolute',top:'1rem',right:'1rem',background:'none',border:'none',cursor:'pointer',color:'#666',fontSize:'20px',lineHeight:1,padding:'4px'}}
        >×</button>

        {submitted ? (
          <div style={{textAlign:'center',padding:'2rem 0'}}>
            <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'#1e3a2e',border:'0.5px solid #2a5a40',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style={{fontSize:'18px',fontWeight:500,color:'#111111',marginBottom:'.5rem'}}>Thank you for reaching out!</h3>
            <p style={{fontSize:'14px',color:'#666666',lineHeight:1.6}}>We've received your message and our team will get back to you within 24 hours. We're excited to help you with your Wok journey!</p>
            <button onClick={onClose} style={{marginTop:'1.5rem',padding:'10px 28px',background:'#111111',color:'#FFFFFF',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:500,cursor:'pointer'}}>Close</button>
          </div>
        ) : (
          <>
            <h2 style={{fontSize:'22px',fontWeight:500,color:'#111111',marginBottom:'.4rem'}}>Let's talk</h2>
            <p style={{fontSize:'14px',color:'#666666',marginBottom:'1.5rem',lineHeight:1.6,borderBottom:'0.5px solid #E5E5E5',paddingBottom:'1.25rem'}}>
              Connect with our team to see how Base44 can help your organization.
            </p>

            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={{display:'block',fontSize:'13px',color:'#666666',marginBottom:'6px'}}>First Name *</label>
                  <input required value={form.first_name} onChange={set('first_name')} placeholder="First Name" style={{width:'100%',background:'#FAFAFA',border:'0.5px solid #E5E5E5',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#111111',outline:'none'}} onFocus={e=>e.target.style.borderColor='#999'} onBlur={e=>e.target.style.borderColor='#E5E5E5'}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'13px',color:'#666666',marginBottom:'6px'}}>Last Name *</label>
                  <input required value={form.last_name} onChange={set('last_name')} placeholder="Last Name" style={{width:'100%',background:'#FAFAFA',border:'0.5px solid #E5E5E5',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#111111',outline:'none'}} onFocus={e=>e.target.style.borderColor='#999'} onBlur={e=>e.target.style.borderColor='#E5E5E5'}/>
                </div>
              </div>

              <div>
                <label style={{display:'block',fontSize:'13px',color:'#666666',marginBottom:'6px'}}>Work Email *</label>
                <input required type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" style={{width:'100%',background:'#FAFAFA',border:'0.5px solid #E5E5E5',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#111111',outline:'none'}} onFocus={e=>e.target.style.borderColor='#999'} onBlur={e=>e.target.style.borderColor='#E5E5E5'}/>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={{display:'block',fontSize:'13px',color:'#666666',marginBottom:'6px'}}>Website *</label>
                  <input required value={form.website} onChange={set('website')} placeholder="company.com" style={{width:'100%',background:'#FAFAFA',border:'0.5px solid #E5E5E5',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#111111',outline:'none'}} onFocus={e=>e.target.style.borderColor='#999'} onBlur={e=>e.target.style.borderColor='#E5E5E5'}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'13px',color:'#666666',marginBottom:'6px'}}>Role *</label>
                  <input required value={form.role} onChange={set('role')} placeholder="e.g., CFO, Director" style={{width:'100%',background:'#FAFAFA',border:'0.5px solid #E5E5E5',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#111111',outline:'none'}} onFocus={e=>e.target.style.borderColor='#999'} onBlur={e=>e.target.style.borderColor='#E5E5E5'}/>
                </div>
              </div>

              <div>
                <label style={{display:'block',fontSize:'13px',color:'#666666',marginBottom:'6px'}}>What would you like to discuss? *</label>
                <textarea required value={form.message} onChange={set('message')} placeholder="Describe your needs..." rows={4} style={{width:'100%',background:'#FAFAFA',border:'0.5px solid #E5E5E5',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#111111',outline:'none',resize:'vertical',fontFamily:'inherit'}} onFocus={e=>e.target.style.borderColor='#999'} onBlur={e=>e.target.style.borderColor='#E5E5E5'}/>
              </div>

              <button type="submit" style={{width:'100%',padding:'12px',background:'#111111',color:'#FFFFFF',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:500,cursor:'pointer',marginTop:'4px'}}>
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default function PricingPage() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USD');
  const [showModal, setShowModal] = useState(false);
  const [configPlans, setConfigPlans] = useState(getPlansConfig());

  useEffect(() => {
    loadPlansFromDB().then(dbPlans => { if (dbPlans) setConfigPlans(dbPlans); }).catch(() => {});
  }, []);

  const getPrice = (base) => {
    if (base === 0) return '0';
    if (currency === 'EUR') return parseFloat((base * 0.92).toFixed(2));
    if (currency === 'GBP') return parseFloat((base * 0.79).toFixed(2));
    return base;
  };

  const sym = { USD: '$', EUR: '€', GBP: '£' }[currency];

  const BG = '#FFFFFF';
  const CARD = '#FAFAFA';
  const BORDER = '#E5E5E5';
  const TEXT = '#111111';
  const MUTED = '#666666';
  const SUBTLE = '#A1A1AA';

  // Map admin plans-config to display format
  const plans = configPlans.map((p, idx) => {
    const isEnterprise = !p.price_monthly || p.checkout_url_monthly?.startsWith('mailto');
    const isHighlighted = !!p.badge;
    return {
    id: p.id,
    name: p.name,
    price: isEnterprise ? null : p.price_monthly,
    badge: p.badge || null,
    desc: p.features_header || '',
    btnLabel: isEnterprise ? 'Contact Us' : (isHighlighted ? `Choose ${p.name}` : 'Get Started'),
    btnStyle: isHighlighted
      ? { background: '#111111', color: '#FFFFFF', border: 'none' }
      : { background: 'transparent', color: '#111111', border: `0.5px solid ${BORDER}` },
      features: (p.features || []).map(f => f.text || f),
      notIncluded: [],
      checkout_url_monthly: p.checkout_url_monthly,
    };
  });

  // Build dynamic table from plan features
  const tableFeatures = plans.map(p => ({ label: p.name, vals: p.features }));

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'system-ui, -apple-system, sans-serif', color: TEXT, paddingBottom: '6rem' }}>
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <div style={{ paddingTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ fontSize: '12px', letterSpacing: '.08em', color: '#666666', textTransform: 'uppercase', marginBottom: '.4rem' }}>Pricing</p>
            <h1 style={{ fontSize: '30px', fontWeight: 500, color: '#111111', lineHeight: 1.1 }}>Choose your plan</h1>
            <p style={{ fontSize: '15px', color: '#666666', marginTop: '.4rem' }}>Finance AI · Interface Generation</p>
          </div>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            style={{ background: '#FFFFFF', border: '0.5px solid #E5E5E5', borderRadius: '999px', padding: '6px 14px', fontSize: '12px', color: '#666666', cursor: 'pointer', outline: 'none' }}
          >
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '3rem' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: CARD,
                border: plan.badge ? `1.5px solid #3a3a3a` : `0.5px solid ${BORDER}`,
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
              }}
            >
              {plan.badge && (
                <span style={{ 
                  position: 'absolute', 
                  top: '1.5rem', 
                  right: '1.5rem', 
                  background: '#ffffff', 
                  color: '#000000', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  padding: '4px 10px', 
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.2px'
                }}>
                  Popular
                </span>
              )}

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#111111', marginBottom: '.3rem' }}>{plan.name}</h3>
                <p style={{ fontSize: '13px', color: '#666666', lineHeight: 1.5 }}>{plan.desc}</p>
              </div>

              <div>
                {plan.price !== null ? (
                  <>
                    <span style={{ fontSize: '32px', fontWeight: 500, color: '#111111' }}>{sym}{getPrice(plan.price)}</span>
                    <span style={{ fontSize: '13px', color: '#666666' }}> / month</span>
                  </>
                ) : (
                  <span style={{ fontSize: '22px', fontWeight: 500, color: '#111111' }}>Custom pricing</span>
                )}
              </div>

              <button
                onClick={() => {
                  if (!plan.price || plan.checkout_url_monthly?.startsWith('mailto')) { setShowModal(true); return; }
                  if (plan.checkout_url_monthly && plan.checkout_url_monthly.startsWith('http')) {
                    window.location.href = plan.checkout_url_monthly;
                  } else {
                    navigate(`/checkout?plan=${plan.id}&billing=monthly`);
                  }
                }}
                style={{ width: '100%', padding: '11px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'opacity .15s', ...plan.btnStyle }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {plan.btnLabel}
              </button>

              <div style={{ borderTop: `0.5px solid ${BORDER}`, paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#111111' }}>
                    <svg style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px', color: '#16a34a' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
                {plan.notIncluded.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: SUBTLE }}>
                    <svg style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Compliance & Security Badges Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '3rem', userSelect: 'none' }}>
          <div style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px', maxWidth: '300px', cursor: 'default' }}>
            <div style={{ width: '42px', height: '42px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', border: `0.5px solid ${BORDER}`, borderRadius: '8px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 22h20L12 2z"/><circle cx="12" cy="14" r="3"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: TEXT, marginBottom: '2px' }}>ISO 27001</div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.3 }}>ISO Security Management</div>
            </div>
          </div>
          
          <div style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px', maxWidth: '300px', cursor: 'default' }}>
            <div style={{ width: '42px', height: '42px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', border: `0.5px solid ${BORDER}`, borderRadius: '8px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <rect x="10" y="10" width="4" height="5" rx="1"/><path d="M10 10V9a2 2 0 0 1 4 0v1"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: TEXT, marginBottom: '2px' }}>SOC 2 Type II</div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.3 }}>SOC for Service Organizations</div>
            </div>
          </div>

          <div style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px', maxWidth: '300px', cursor: 'default' }}>
            <div style={{ width: '42px', height: '42px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', border: `0.5px solid ${BORDER}`, borderRadius: '8px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <rect x="9" y="11" width="6" height="5" rx="1"/><path d="M9 11V9a3 3 0 0 1 6 0v2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: TEXT, marginBottom: '2px' }}>GDPR</div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.3 }}>Data Protection & Privacy Regulation</div>
            </div>
          </div>
        </div>

        {/* Comparison table — vertical (feature rows × plan columns) */}
        <h2 style={{ fontSize: '16px', fontWeight: 500, color: TEXT, marginBottom: '1rem' }}>Compare all plans</h2>
        {(() => {
          // Collect all unique feature strings across all plans
          const allFeatures = Array.from(new Set(plans.flatMap(p => p.features)));
          return (
            <div style={{ background: '#111', border: `0.5px solid ${BORDER}`, borderRadius: '14px', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: `0.5px solid ${BORDER}` }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', color: MUTED, fontWeight: 400, width: '34%' }}>Feature</th>
                    {plans.map(p => (
                      <th key={p.id} style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 500, color: p.badge ? TEXT : MUTED }}>
                        {p.name}
                        <div style={{ fontSize: '11px', color: '#555', fontWeight: 400, marginTop: '2px' }}>
                          {p.price !== null ? `${sym}${getPrice(p.price)}/mo` : 'Custom'}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, i) => (
                    <tr key={i} style={{ borderBottom: `0.5px solid #1e1e1e` }}>
                      <td style={{ padding: '12px 20px', color: MUTED }}>{feature}</td>
                      {plans.map(p => {
                        const has = p.features.includes(feature);
                        return (
                          <td key={p.id} style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {has
                              ? <svg style={{ width: '15px', height: '15px', display: 'inline-block', color: '#4ade80' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              : <span style={{ color: '#333', fontSize: '16px' }}>—</span>
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* Enterprise CTA banner */}
        <div style={{ marginTop: '2rem', background: '#FAFAFA', border: '0.5px solid #E5E5E5', borderRadius: '14px', padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#111111', marginBottom: '.3rem' }}>Have specific requirements?</h3>
            <p style={{ fontSize: '13px', color: '#666666', lineHeight: 1.5 }}>Our team can create a custom plan tailored to your organization.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Contact Us
          </button>
        </div>

      </div>
    </div>
  );
}