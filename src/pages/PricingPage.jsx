import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig, getUserPlan, COMPARISON_FEATURES, DEFAULT_PLANS } from '@/lib/plans-config';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const F = 'Inter, -apple-system, system-ui, sans-serif';
const BG = '#F9F9F8';
const CARD = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.08)';
const T1 = '#111111';
const T2 = 'rgba(0,0,0,0.55)';
const T3 = 'rgba(0,0,0,0.28)';

// ─── Contact modal ─────────────────────────────────────────────────────────────
const ContactModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', website: '', role: '', message: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await base44.entities.ContactLead.create({ ...form, status: 'new' }); } catch {}
    setSubmitted(true);
  };
  const inp = { width: '100%', background: '#F5F5F3', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#111', outline: 'none', boxSizing: 'border-box', fontFamily: F };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460, position: 'relative', fontFamily: F }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}><X size={15} /></button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: T1, marginBottom: 12 }}>Message sent!</h3>
            <p style={{ fontSize: 14, color: T2, lineHeight: 1.7 }}>Our team will reply within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '11px 32px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Got it</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: T1, margin: '0 0 6px' }}>Contact us</h2>
            <p style={{ fontSize: 13, color: T2, margin: '0 0 20px' }}>Our team will reply within 24h.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['first_name','First name'],['last_name','Last name']].map(([k,l]) => (
                  <div key={k}><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 5 }}>{l}</label><input required value={form[k]} onChange={set(k)} placeholder={l} style={inp} /></div>
                ))}
              </div>
              {[['email','Professional email','email'],['website','Website','text'],['role','Your role','text']].map(([k,l,t]) => (
                <div key={k}><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 5 }}>{l}</label><input required type={t} value={form[k]} onChange={set(k)} placeholder={l} style={inp} /></div>
              ))}
              <div><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 5 }}>Message</label><textarea required value={form.message} onChange={set('message')} rows={3} style={{ ...inp, resize: 'none' }} /></div>
              <button type="submit" style={{ padding: '11px 0', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 40, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
      background: on ? '#5B5FEF' : 'rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'background 200ms',
    }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'all 200ms' }} />
    </button>
  );
}

// ─── Checkmark cell ────────────────────────────────────────────────────────────
function Cell({ value }) {
  if (value === undefined || value === null || value === '-' || value === '') return <span style={{ color: T3, fontSize: 13 }}>—</span>;
  if (value === true || value === 'Yes') return <Check style={{ width: 14, height: 14, color: 'rgba(0,0,0,0.55)' }} />;
  if (value === false) return <span style={{ color: T3, fontSize: 13 }}>—</span>;
  return <span style={{ fontSize: 13, color: T2 }}>{value}</span>;
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [userPlanId, setUserPlanId] = useState('free');
  // Default all paid plans to yearly
  const [billingYearly, setBillingYearly] = useState(() => {
    const init = {};
    const plans = getPlansConfig();
    plans.forEach(p => { if (p.price_monthly > 0) init[p.id] = true; });
    return init;
  });

  useEffect(() => {
    loadPlansFromDB()
      .then(dbPlans => { setPlans(dbPlans || getPlansConfig()); setPlansLoading(false); })
      .catch(() => { setPlans(getPlansConfig()); setPlansLoading(false); });
  }, []);

  useEffect(() => {
    const u = authUser;
    if (u) { setUserPlanId(getUserPlan(u)?.id || 'free'); }
    else { base44.auth.me().then(u => setUserPlanId(getUserPlan(u)?.id || 'free')).catch(() => {}); }
  }, [authUser]);

  // All plans including free for the comparison table
  const allPlans = plans.length > 0 ? plans : DEFAULT_PLANS;

  const handleUpgrade = (plan) => {
    const yearly = billingYearly[plan.id];
    const url = yearly ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (url?.startsWith('http')) { window.location.href = url; return; }
    navigate(`/checkout?plan=${plan.id}&billing=${yearly ? 'yearly' : 'monthly'}`);
  };

  const isCurrentPlan = (plan) => plan.id === userPlanId;

  const PlanBtn = ({ plan }) => {
    const current = isCurrentPlan(plan);
    const isFree = plan.price_monthly === 0 || !plan.checkout_url_monthly;
    if (current) return (
      <button style={{ width: '100%', padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: F, background: 'rgba(0,0,0,0.06)', color: T2, border: '1px solid rgba(0,0,0,0.10)', cursor: 'default' }}>
        Current plan
      </button>
    );
    if (isFree) return (
      <button onClick={() => navigate('/app')} style={{ width: '100%', padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: F, background: '#111', color: '#fff', border: '1px solid rgba(0,0,0,0.12)', cursor: 'pointer', transition: 'background 150ms' }}
        onMouseEnter={e => e.currentTarget.style.background = '#333'}
        onMouseLeave={e => e.currentTarget.style.background = '#111'}>
        Get started
      </button>
    );
    return (
      <button onClick={() => handleUpgrade(plan)} style={{ width: '100%', padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: F, background: '#111', color: '#fff', border: '1px solid rgba(0,0,0,0.12)', cursor: 'pointer', transition: 'background 150ms' }}
        onMouseEnter={e => e.currentTarget.style.background = '#333'}
        onMouseLeave={e => e.currentTarget.style.background = '#111'}>
        Get started
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, color: T1, overflowX: 'hidden', colorScheme: 'light' }}>
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 32px 120px' }}>

        {/* ── Title ── */}
        <h1 style={{ fontSize: 42, fontWeight: 700, color: T1, margin: '0 0 80px', letterSpacing: '-0.03em' }}>Pricing</h1>

        {/* ── Plan cards grid — horizontal scroll on small screens ── */}
        <div style={{ overflowX: 'auto', marginBottom: 0, WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${allPlans.length}, minmax(200px, 1fr))`, gap: 0, minWidth: allPlans.length * 200 }}>
            {allPlans.map((plan, idx) => {
              const price = plan.price_monthly ?? plan.price ?? 0;
              const yearly = billingYearly[plan.id];
              // When yearly: show price_yearly as full yearly price
              const yearlyTotal = plan.price_yearly ?? (price * 12);
              const priceDisplay = yearly ? yearlyTotal : price;
              const isFree = price === 0;
              const current = isCurrentPlan(plan);
              const features = (plan.features || []).map(f => f.text || f);

              return (
                <div key={plan.id} style={{
                  padding: '0 24px 36px',
                  borderRight: idx < allPlans.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}>
                  {/* Name */}
                  <div style={{ paddingTop: 0, marginBottom: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: T1, letterSpacing: '-0.02em' }}>{plan.name}</span>
                  </div>

                  {/* Price */}
                  {isFree ? (
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: 30, fontWeight: 700, color: T1 }}>$0</span>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 28, fontWeight: 700, color: T1 }}>${priceDisplay}</span>
                      <span style={{ fontSize: 13, color: T3, marginLeft: 4 }}>{yearly ? '/yr' : '/mo'}</span>
                    </div>
                  )}

                  {/* Billing note */}
                  <div style={{ fontSize: 12, color: T3, marginBottom: 16, minHeight: 18 }}>
                    {isFree ? 'Free for everyone' : yearly ? `$${Math.round(yearlyTotal / 12)}/mo billed annually` : 'Billed monthly'}
                  </div>

                  {/* Yearly toggle */}
                  {!isFree && plan.checkout_url_yearly && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                      <Toggle on={!!yearly} onToggle={() => setBillingYearly(b => ({ ...b, [plan.id]: !b[plan.id] }))} />
                      <span style={{ fontSize: 13, color: T2 }}>Billed yearly</span>
                    </div>
                  )}
                  {isFree && <div style={{ height: 44, marginBottom: 20 }} />}

                  {/* CTA */}
                  <div style={{ marginBottom: 28 }}>
                    <PlanBtn plan={plan} />
                  </div>

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Check style={{ width: 14, height: 14, color: T2, flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 13, color: T2, lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: BORDER, margin: '60px 0' }} />

        {/* ── Feature comparison table — like image 3 ── */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: allPlans.length * 160 + 220, borderCollapse: 'collapse', fontFamily: F }}>
            <thead>
              <tr>
                {/* Empty left column */}
                <th style={{ width: 220, padding: '0 0 32px', textAlign: 'left', verticalAlign: 'bottom' }} />
                {allPlans.map(plan => (
                  <th key={plan.id} style={{ padding: '0 24px 32px', textAlign: 'left', verticalAlign: 'bottom', fontWeight: 600, fontSize: 15, color: T1, whiteSpace: 'nowrap' }}>
                    {plan.name}
                    <div style={{ fontSize: 13, fontWeight: 400, color: T3, marginTop: 2 }}>
                      ${plan.price_monthly ?? 0} per user/month
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((group) => (
                <React.Fragment key={group.category}>
                  {/* Category header */}
                  <tr>
                    <td colSpan={allPlans.length + 1} style={{ padding: '24px 0 10px', fontSize: 13, fontWeight: 600, color: T1, borderTop: `1px solid ${BORDER}` }}>
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map(item => (
                    <tr key={item.name} style={{ borderTop: `1px solid rgba(255,255,255,0.04)` }}>
                      <td style={{ padding: '11px 0', fontSize: 13, color: T2 }}>{item.name}</td>
                      {allPlans.map(plan => (
                        <td key={plan.id} style={{ padding: '11px 24px', fontSize: 13 }}>
                          <Cell value={item[plan.id]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* CTA row at bottom */}
              <tr style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: '32px 0 0' }} />
                {allPlans.map(plan => (
                  <td key={plan.id} style={{ padding: '32px 24px 0', verticalAlign: 'top' }}>
                    <PlanBtn plan={plan} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Contact sales footer ── */}
        <div style={{ marginTop: 80, padding: '36px 40px', border: `1px solid ${BORDER}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, background: '#fff' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T1, marginBottom: 6 }}>Need a custom plan?</div>
            <div style={{ fontSize: 14, color: T2 }}>For large teams, custom contracts or invoicing — contact us.</div>
          </div>
          <button onClick={() => setShowContact(true)} style={{ padding: '10px 24px', borderRadius: 8, border: `1px solid rgba(0,0,0,0.14)`, background: 'transparent', color: T1, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F, transition: 'background 150ms' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Contact sales
          </button>
        </div>

      </div>
    </div>
  );
}