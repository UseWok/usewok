import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig, getUserPlan } from '@/lib/plans-config';
import { Check, X, Zap, Shield, Users, Headphones, Settings } from 'lucide-react';
import { PlanCardSkeleton } from '@/components/ui/Skeleton.jsx';
import { useAuth } from '@/lib/AuthContext';

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
    width: '100%', background: '#1A1A1A', border: '1px solid #2A2A2A',
    borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={15} />
        </button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: 48, margin: '0 auto 16px', lineHeight: 1 }}>🎉</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Message sent!</h3>
            <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7 }}>Our team will reply within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '11px 32px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Got it, thanks!</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Contact us</h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.6 }}>Our team will reply within 24h.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['first_name', 'First name'], ['last_name', 'Last name']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5, fontWeight: 500 }}>{l}</label>
                    <input required value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle} />
                  </div>
                ))}
              </div>
              {[['email', 'Professional email', 'email'], ['website', 'Website', 'text'], ['role', 'Your role', 'text']].map(([k, l, t]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5, fontWeight: 500 }}>{l}</label>
                  <input required type={t} value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5, fontWeight: 500 }}>Message</label>
                <textarea required value={form.message} onChange={set('message')} placeholder="Describe your use case..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '11px 0', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const SECURITY_BADGES = [
  { id: 'iso', label: 'ISO 27001', sub: 'Security management ISO', icon: '🔒' },
  { id: 'soc2', label: 'SOC 2 Type II', sub: 'SOC for service organizations', icon: '🛡️' },
  { id: 'rgpd', label: 'GDPR', sub: 'Data protection & privacy regulation', icon: '🇪🇺' },
];

const ENTERPRISE_FEATURES = [
  { icon: Zap, title: 'Onboarding & Training', desc: 'Custom onboarding plans with live training sessions.' },
  { icon: Users, title: 'Dedicated Account Team', desc: 'Assigned account manager and solutions engineer.' },
  { icon: Headphones, title: 'Priority Support', desc: 'Guaranteed priority assistance via a dedicated channel.' },
  { icon: Shield, title: 'Enterprise Grade', desc: 'Security, compliance, and monitoring at scale.' },
];

// Always format cleanly: never "1000K", always "1M"
function formatCredits(n) {
  if (!n && n !== 0) return null;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function PostPurchaseModal({ onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#111', border: '1px solid #2A2A2A', borderRadius: 12,
        padding: '32px 28px', width: '100%', maxWidth: 420, position: 'relative',
        fontFamily: 'Inter, sans-serif',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, display: 'flex' }}>
          <X size={15} />
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', width: 72, height: 72 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(249,87,56,0.3)', animation: 'pp-ring 2s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'rgba(249,87,56,0.12)', border: '1px solid rgba(249,87,56,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pp-pulse 2s ease-in-out infinite' }}>
              <span style={{ fontSize: 24 }}>🎉</span>
            </div>
            <style>{`@keyframes pp-ring{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.18);opacity:0.15}}@keyframes pp-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}`}</style>
          </div>
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.02em' }}>Purchase complete?</h2>
        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 1.6, margin: '0 0 24px' }}>
          To activate your plan, go to your settings and enter the code you received by email.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {[
            { n: '1', label: 'Go to', path: 'Settings → Plan & Billing' },
            { n: '2', label: 'Enter your', path: 'activation code' },
            { n: '3', label: 'Your plan is', path: 'activated instantly ✓' },
          ].map(step => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#1A1A1A', borderRadius: 8, border: '1px solid #2A2A2A' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{step.n}</span>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#666' }}>{step.label} </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{step.path}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { onClose(); window.location.href = '/settings'; }}
          style={{ width: '100%', padding: '11px 0', background: '#F95738', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          Go to settings
        </button>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showPostPurchase, setShowPostPurchase] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [userPlanId, setUserPlanId] = useState(null);

  useEffect(() => {
    loadPlansFromDB()
      .then(dbPlans => { setPlans(dbPlans || getPlansConfig()); setPlansLoading(false); })
      .catch(() => { setPlans(getPlansConfig()); setPlansLoading(false); });
  }, []);

  // Derive plan from AuthContext user (always up-to-date)
  useEffect(() => {
    const u = authUser;
    if (u) {
      const plan = getUserPlan(u);
      setUserPlanId(plan?.id || 'free');
    } else {
      // Fallback: fetch directly if AuthContext hasn't loaded yet
      base44.auth.me().then(u => {
        const plan = getUserPlan(u);
        setUserPlanId(plan?.id || 'free');
      }).catch(() => {});
    }
  }, [authUser]);

  const cardPlans = plans.filter(p => {
    const url = p.checkout_url_monthly || '';
    return !url.startsWith('mailto') && p.id !== 'free';
  });

  // Dynamic badge logic based on user's current plan
  const getBadge = (plan, index) => {
    const topPlanIdx = cardPlans.length - 1;
    const midPlanIdx = Math.floor((cardPlans.length - 1) / 2);
    const isTopPlan = index === topPlanIdx;
    const isMidPlan = index === midPlanIdx;
    const isCreatorPlan = plan.id === 'creator' || (index === topPlanIdx - 1 && cardPlans.length > 2);

    // If user is on top plan: no badges
    if (userPlanId === cardPlans[topPlanIdx]?.id) return null;

    // If user is on creator plan: mid gets "Recommended" on top plan
    if (userPlanId === 'creator' || userPlanId === cardPlans[topPlanIdx - 1]?.id) {
      if (isTopPlan) return 'Recommended';
      return null;
    }

    // Default: "Popular" on mid-tier
    if (isMidPlan) return plan.badge || 'Popular';
    return plan.badge || null;
  };

  const handleUpgrade = (plan) => {
    if (plan.checkout_url_monthly?.startsWith('http')) {
      window.location.href = plan.checkout_url_monthly;
      setTimeout(() => setShowPostPurchase(true), 5000);
      return;
    }
    navigate(`/checkout?plan=${plan.id}&billing=monthly`);
    setTimeout(() => setShowPostPurchase(true), 5000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1F1F1F', fontFamily: 'Inter, system-ui, sans-serif', color: '#fff', overflowX: 'hidden' }}>
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}
      {showPostPurchase && <PostPurchaseModal onClose={() => setShowPostPurchase(false)} />}

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Header */}
        <div style={{ padding: '64px 0 56px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Choose the plan that's right for you
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0, lineHeight: 1.6 }}>
            Start for free. Upgrade when you're ready.
          </p>
        </div>

        {/* Plan Cards */}
        {plansLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
            {[0, 1, 2].map(i => <PlanCardSkeleton key={i} />)}
          </div>
        ) : (cardPlans.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(cardPlans.length, 4)}, 1fr)`,
            gap: 16,
            marginBottom: 40,
          }}>
            {cardPlans.map((plan, index) => {
              const badge = getBadge(plan, index);
              const isPopular = !!badge;
              const price = plan.price_monthly ?? plan.price ?? 0;
              const creditsLabel = plan.credits_limit ? `${formatCredits(plan.credits_limit)} credits/mo` : null;
              const integLabel = plan.integration_credits ? `${formatCredits(plan.integration_credits)} integration credits` : null;
              const features = (plan.features || []).map(f => f.text || f);
              const isCurrentPlan = userPlanId && (plan.id === userPlanId);

              return (
                <div
                  key={plan.id}
                  style={{
                    background: isPopular ? '#232323' : '#1A1A1A',
                    border: isPopular ? '1px solid rgba(249,87,56,0.4)' : (isCurrentPlan ? '1px solid rgba(34,197,94,0.4)' : '1px solid #2A2A2A'),
                    borderRadius: 12,
                    padding: '22px 18px',
                    display: 'flex', flexDirection: 'column',
                    position: 'relative',
                    transition: 'border-color 150ms',
                  }}
                >
                  {isCurrentPlan && (
                    <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 999, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      Current plan
                    </div>
                  )}
                  {!isCurrentPlan && isPopular && (
                    <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: badge === 'Recommended' ? '#7B4FE0' : '#F95738', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 999, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {badge}
                    </div>
                  )}

                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>{plan.name}</h3>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 14 }}>
                    <span style={{ fontSize: 34, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>${price}</span>
                    <span style={{ fontSize: 12, color: '#555' }}>/mo</span>
                  </div>

                  {(creditsLabel || integLabel) && (
                    <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 7, marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                      {creditsLabel && <div style={{ fontSize: 11, color: '#aaa', marginBottom: integLabel ? 3 : 0 }}>{creditsLabel}</div>}
                      {integLabel && <div style={{ fontSize: 11, color: '#aaa' }}>{integLabel}</div>}
                    </div>
                  )}

                  {isCurrentPlan ? (
                    <button
                      onClick={() => navigate('/settings?tab=plan')}
                      style={{
                        width: '100%', padding: '9px 0', borderRadius: 7,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif', marginBottom: 16,
                        background: 'rgba(34,197,94,0.12)',
                        color: '#22c55e',
                        border: '1px solid rgba(34,197,94,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'opacity 150ms',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <Settings size={12} />
                      Manage
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      style={{
                        width: '100%', padding: '9px 0', borderRadius: 7,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif', marginBottom: 16,
                        background: isPopular ? '#F95738' : 'transparent',
                        color: '#fff',
                        border: isPopular ? 'none' : '1px solid #333',
                        transition: 'opacity 150ms',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {plan.badge_cta || (price === 0 ? 'Start for free' : `Upgrade to ${plan.name}`)}
                    </button>
                  )}

                  <div style={{ height: 1, background: '#2A2A2A', marginBottom: 14 }} />

                  {features.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                      {features.map((f, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                          <Check style={{ width: 11, height: 11, color: '#22c55e', flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Security Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 40 }}>
          {SECURITY_BADGES.map((badge) => (
            <div key={badge.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 10 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{badge.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{badge.label}</div>
                <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Block */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 14, padding: '36px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>WOK for Enterprise</h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px', lineHeight: 1.7 }}>
              Allow large organizations to build perfectly tailored solutions for their teams, securely and at scale.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{ padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#fff', border: '1px solid #333', fontFamily: 'Inter, sans-serif', transition: 'border-color 150ms, background 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.background = 'transparent'; }}
            >
              Contact us
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            {ENTERPRISE_FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                    <Icon style={{ width: 13, height: 13, color: '#F95738', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{feat.title}</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#666', margin: 0, lineHeight: 1.6 }}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}