import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig, getUserPlan, COMPARISON_FEATURES } from '@/lib/plans-config';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#F9F9F8';
const T1 = '#111111';
const T2 = 'rgba(0,0,0,0.55)';
const T3 = 'rgba(0,0,0,0.25)';
const BORDER = 'rgba(0,0,0,0.07)';

// ── Scroll reveal
function Reveal({ children, delay = 0, y = 20, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}>
      {children}
    </motion.div>
  );
}

// ── Animated rotating gradient border for highlighted plan
function GlowCard({ children, active = false, style = {} }) {
  if (!active) {
    return (
      <div style={{
        background: '#fff', border: `1px solid ${BORDER}`,
        borderRadius: 20, position: 'relative', ...style,
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 250ms, transform 250ms',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
        {children}
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', borderRadius: 22, ...style }}>
      {/* Rotating gradient border */}
      <div style={{
        position: 'absolute', inset: -2, borderRadius: 22, zIndex: 0,
        background: 'conic-gradient(from 0deg, #5A5AF0, #7C6AF4, #22c55e, #60a5fa, #5A5AF0)',
        animation: 'spinGrad 4s linear infinite',
        opacity: 0.85,
      }} />
      {/* Soft outer glow */}
      <div style={{
        position: 'absolute', inset: -12, borderRadius: 30, zIndex: -1,
        background: 'radial-gradient(ellipse at center, rgba(90,90,240,0.12) 0%, transparent 70%)',
        filter: 'blur(16px)',
      }} />
      <div style={{ position: 'relative', zIndex: 1, borderRadius: 20, background: '#fff', overflow: 'hidden' }}>
        {children}
      </div>
      <style>{`@keyframes spinGrad { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Toggle
function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 40, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
      background: on ? '#5A5AF0' : 'rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'background 200ms',
    }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'all 200ms' }} />
    </button>
  );
}

// ── Cell for comparison table
function Cell({ value }) {
  if (value === undefined || value === null || value === '-' || value === '') return <span style={{ color: T3, fontSize: 13 }}>—</span>;
  if (value === true || value === 'Yes') return <Check style={{ width: 14, height: 14, color: '#5A5AF0' }} />;
  if (value === false) return <span style={{ color: T3, fontSize: 13 }}>—</span>;
  return <span style={{ fontSize: 13, color: T2 }}>{value}</span>;
}

// ── Contact Modal
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 460, position: 'relative', fontFamily: F, boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}>
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
            <h2 style={{ fontSize: 22, fontWeight: 700, color: T1, margin: '0 0 6px', letterSpacing: '-0.03em' }}>Contact us</h2>
            <p style={{ fontSize: 13, color: T2, margin: '0 0 24px' }}>Our team will reply within 24h.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['first_name','First name'],['last_name','Last name']].map(([k,l]) => (
                  <div key={k}><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 5 }}>{l}</label><input required value={form[k]} onChange={set(k)} placeholder={l} style={inp} /></div>
                ))}
              </div>
              {[['email','Email','email'],['website','Website','text'],['role','Your role','text']].map(([k,l,t]) => (
                <div key={k}><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 5 }}>{l}</label><input required type={t} value={form[k]} onChange={set(k)} placeholder={l} style={inp} /></div>
              ))}
              <div><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 5 }}>Message</label><textarea required value={form.message} onChange={set('message')} rows={3} style={{ ...inp, resize: 'none' }} /></div>
              <button type="submit" style={{ padding: '12px 0', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>Send</button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default function PricingPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [userPlanId, setUserPlanId] = useState('free');
  const [billingYearly, setBillingYearly] = useState({});

  useEffect(() => {
    loadPlansFromDB()
      .then(dbPlans => {
        const all = dbPlans || getPlansConfig();
        const visible = all.filter(p => p.visible !== false);
        setPlans(visible);
        const init = {};
        visible.forEach(p => { if (p.price_monthly > 0) init[p.id] = true; });
        setBillingYearly(init);
        setPlansLoading(false);
      })
      .catch(() => {
        const all = getPlansConfig();
        const visible = all.filter(p => p.visible !== false);
        setPlans(visible);
        const init = {};
        visible.forEach(p => { if (p.price_monthly > 0) init[p.id] = true; });
        setBillingYearly(init);
        setPlansLoading(false);
      });
  }, []);

  useEffect(() => {
    const u = authUser;
    if (u) setUserPlanId(getUserPlan(u)?.id || 'free');
    else base44.auth.me().then(u => setUserPlanId(getUserPlan(u)?.id || 'free')).catch(() => {});
  }, [authUser]);

  const handleUpgrade = (plan) => {
    const yearly = billingYearly[plan.id];
    const url = yearly ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (url?.startsWith('http')) { window.location.href = url; return; }
    navigate(`/checkout?plan=${plan.id}&billing=${yearly ? 'yearly' : 'monthly'}`);
  };

  const isCurrentPlan = (plan) => plan.id === userPlanId;

  // Identify the "highlighted" plan (2nd paid, or one with most features)
  const highlightIdx = Math.min(1, plans.length - 1);

  const PlanBtn = ({ plan, large = false }) => {
    const current = isCurrentPlan(plan);
    const isFree = plan.price_monthly === 0 || !plan.checkout_url_monthly;
    const base = {
      width: '100%', padding: large ? '13px 0' : '9px 0',
      borderRadius: 10, fontSize: 13, fontWeight: 600,
      fontFamily: F, cursor: 'pointer', border: 'none', transition: 'all 150ms',
    };
    if (current) return <button style={{ ...base, background: 'rgba(0,0,0,0.06)', color: T2, cursor: 'default', border: `1px solid ${BORDER}` }}>Current plan</button>;
    if (isFree) return (
      <button onClick={() => navigate('/app')} style={{ ...base, background: '#111', color: '#fff' }}
        onMouseEnter={e => e.currentTarget.style.background = '#333'}
        onMouseLeave={e => e.currentTarget.style.background = '#111'}>Get started</button>
    );
    return (
      <button onClick={() => handleUpgrade(plan)} style={{ ...base, background: '#111', color: '#fff' }}
        onMouseEnter={e => e.currentTarget.style.background = '#333'}
        onMouseLeave={e => e.currentTarget.style.background = '#111'}>Get started</button>
    );
  };

  if (plansLoading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #E0E0E0', borderTopColor: '#5A5AF0', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, color: T1, overflowX: 'hidden', colorScheme: 'light' }}>
      <AnimatePresence>{showContact && <ContactModal onClose={() => setShowContact(false)} />}</AnimatePresence>

      {/* ── Hero */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '80px 32px 0' }}>
        <Reveal>
          <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 64px)', fontWeight: 300, color: T1, margin: '0 0 14px', letterSpacing: '-0.05em', lineHeight: 1.05 }}>
            Simple, <strong style={{ fontWeight: 700 }}>transparent</strong> pricing.
          </h1>
          <p style={{ fontSize: 17, color: T2, margin: '0 0 60px', maxWidth: 520, lineHeight: 1.65 }}>
            Every plan includes real AI analysis — not simulated data. Upgrade or cancel anytime.
          </p>
        </Reveal>

        {/* ── Plan cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${plans.length}, 1fr)`,
          gap: 18,
          marginBottom: 80,
          alignItems: 'start',
        }}>
          {plans.map((plan, idx) => {
            const isHighlight = idx === highlightIdx;
            const price = plan.price_monthly ?? plan.price ?? 0;
            const yearly = billingYearly[plan.id];
            const priceDisplay = yearly && plan.price_yearly ? plan.price_yearly : price;
            const isFree = price === 0;
            const features = (plan.features || []).map(f => f.text || f);

            return (
              <Reveal key={plan.id} delay={idx * 0.08}>
                <GlowCard active={isHighlight} style={{ padding: '28px 24px 28px' }}>
                  {isHighlight && (
                    <div style={{
                      position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(90deg, #5A5AF0, #7C6AF4)',
                      borderRadius: '0 0 10px 10px',
                      padding: '4px 16px', fontSize: 11, fontWeight: 700,
                      color: '#fff', letterSpacing: '0.04em', zIndex: 10,
                    }}>MOST POPULAR</div>
                  )}
                  <div style={{ marginBottom: 6, marginTop: isHighlight ? 12 : 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: T2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{plan.name}</span>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 44, fontWeight: 700, color: T1, letterSpacing: '-0.04em' }}>
                      {isFree ? '$0' : `$${priceDisplay}`}
                    </span>
                    {!isFree && <span style={{ fontSize: 14, color: T3, marginLeft: 4 }}>/mo</span>}
                  </div>

                  {/* Yearly toggle */}
                  {!isFree && plan.checkout_url_yearly && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                      <Toggle on={!!yearly} onToggle={() => setBillingYearly(b => ({ ...b, [plan.id]: !b[plan.id] }))} />
                      <span style={{ fontSize: 12, color: T2 }}>Billed yearly</span>
                      {yearly && <span style={{ fontSize: 11, background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>Save 20%</span>}
                    </div>
                  )}
                  {isFree && <div style={{ height: 40, marginBottom: 20 }} />}

                  {/* CTA */}
                  <div style={{ marginBottom: 24 }}>
                    <PlanBtn plan={plan} large />
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: BORDER, marginBottom: 20 }} />

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: isHighlight ? 'rgba(90,90,240,0.1)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <Check style={{ width: 9, height: 9, color: isHighlight ? '#5A5AF0' : T2 }} />
                        </div>
                        <span style={{ fontSize: 13, color: T2, lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </GlowCard>
              </Reveal>
            );
          })}
        </div>

        {/* ── Comparison table */}
        {plans.length > 0 && (
          <Reveal>
            <div style={{ marginBottom: 80, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: F, minWidth: plans.length * 160 + 220 }}>
                <thead>
                  <tr>
                    <th style={{ width: 240, padding: '0 0 28px', textAlign: 'left', verticalAlign: 'bottom' }} />
                    {plans.map(plan => (
                      <th key={plan.id} style={{ padding: '0 20px 28px', textAlign: 'left', verticalAlign: 'bottom', fontWeight: 600, fontSize: 14, color: T1 }}>
                        {plan.name}
                        <div style={{ fontSize: 12, fontWeight: 400, color: T3, marginTop: 2 }}>${plan.price_monthly ?? 0}/mo</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((group) => (
                    <React.Fragment key={group.category}>
                      <tr>
                        <td colSpan={plans.length + 1} style={{ padding: '20px 0 8px', fontSize: 12, fontWeight: 700, color: T1, borderTop: `1px solid ${BORDER}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {group.category}
                        </td>
                      </tr>
                      {group.items.map(item => (
                        <tr key={item.name}>
                          <td style={{ padding: '10px 0', fontSize: 13, color: T2, borderTop: `1px solid rgba(0,0,0,0.04)` }}>{item.name}</td>
                          {plans.map(plan => (
                            <td key={plan.id} style={{ padding: '10px 20px', borderTop: `1px solid rgba(0,0,0,0.04)` }}>
                              <Cell value={item[plan.id]} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr style={{ borderTop: `1px solid ${BORDER}` }}>
                    <td style={{ padding: '28px 0 0' }} />
                    {plans.map(plan => (
                      <td key={plan.id} style={{ padding: '28px 20px 0', verticalAlign: 'top' }}>
                        <PlanBtn plan={plan} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        )}

        {/* ── Enterprise CTA */}
        <Reveal>
          <div style={{
            marginBottom: 100, padding: '44px 48px',
            background: 'linear-gradient(135deg, rgba(90,90,240,0.04), rgba(124,106,244,0.02))',
            border: `1px solid rgba(90,90,240,0.12)`,
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24,
          }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T1, marginBottom: 8, letterSpacing: '-0.03em' }}>Need a custom plan?</div>
              <div style={{ fontSize: 14, color: T2, lineHeight: 1.6 }}>For agencies, large teams, or custom contracts — let's talk.</div>
            </div>
            <button onClick={() => setShowContact(true)} style={{
              padding: '12px 28px', borderRadius: 10, border: `1px solid rgba(90,90,240,0.25)`,
              background: 'transparent', color: '#5A5AF0', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: F,
              transition: 'all 150ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(90,90,240,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              Contact sales →
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}