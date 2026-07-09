import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig, getNormalizedPlanId, getRecommendedPlanId } from '@/lib/plans-config';
import { useAuth } from '@/lib/AuthContext';
import { isPromoActive, PROMO } from '@/lib/promo';
import { Check, ArrowRight, X } from 'lucide-react';
import PlanCard from '@/components/pricing/PlanCard';
import BrandLogos from '@/components/pricing/BrandLogos';
import SecurityBadges from '@/components/pricing/SecurityBadges';
import PricingSkeleton from '@/components/skeletons/PricingSkeleton';

const WIX = "'Inter', 'Madefor Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "'Fraunces', 'Helvetica Neue', serif";

// ── Contact Modal ──
const ContactModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', website: '', role: '', message: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await base44.entities.ContactLead.create({ ...form, status: 'new' }); } catch {}
    setSubmitted(true);
  };
  const inp = { width: '100%', background: '#fff', border: '1px solid rgba(21,19,15,0.14)', borderRadius: 10, padding: '10px 13px', fontSize: 13, color: '#15130F', outline: 'none', boxSizing: 'border-box', fontFamily: WIX };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(21,19,15,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#FAF9F6', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 20, padding: 30, width: '100%', maxWidth: 400, position: 'relative', fontFamily: WIX, boxShadow: '0 24px 60px rgba(21,19,15,0.18)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, border: '1px solid rgba(21,19,15,0.12)', background: '#fff', cursor: 'pointer' }}><X size={12} color="#4A453B" /></button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EBF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Check size={22} color="#1E7A4C" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#15130F', marginBottom: 8 }}>Message received</h3>
            <p style={{ fontSize: 13, color: '#4A453B', lineHeight: 1.6 }}>Our team will get back to you within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 18, padding: '10px 24px', background: '#15130F', color: '#FAF9F6', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: WIX }}>Close</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 20, color: '#15130F', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Contact us</h2>
            <p style={{ fontSize: 13, color: '#4A453B', margin: '0 0 18px' }}>Guaranteed response within 24 hours.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {[['first_name', 'First name'], ['last_name', 'Last name']].map(([k, l]) => (
                  <div key={k}><label style={{ display: 'block', fontSize: 11, color: '#4A453B', marginBottom: 3, fontWeight: 600 }}>{l}</label><input required value={form[k]} onChange={set(k)} style={inp} /></div>
                ))}
              </div>
              {[['email', 'Email', 'email'], ['website', 'Website', 'text'], ['role', 'Your role', 'text']].map(([k, l, t]) => (
                <div key={k}><label style={{ display: 'block', fontSize: 11, color: '#4A453B', marginBottom: 3, fontWeight: 600 }}>{l}</label><input required type={t} value={form[k]} onChange={set(k)} style={inp} /></div>
              ))}
              <div><label style={{ display: 'block', fontSize: 11, color: '#4A453B', marginBottom: 3, fontWeight: 600 }}>Message</label><textarea required value={form.message} onChange={set('message')} rows={3} style={{ ...inp, resize: 'none' }} /></div>
              <button type="submit" style={{ padding: '11px 0', background: '#15130F', color: '#FAF9F6', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4, fontFamily: WIX }}
                onMouseEnter={e => e.currentTarget.style.background = '#C43E14'}
                onMouseLeave={e => e.currentTarget.style.background = '#15130F'}>
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
  const { user: authUser } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPlanId, setUserPlanId] = useState('free');
  const [userEmail, setUserEmail] = useState('');
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const billing = 'monthly';

  useEffect(() => {
    // Instant render from local cache — no cloud wait
    const cached = getPlansConfig().filter(p => p.visible !== false);
    if (cached.length > 0) { setPlans(cached); setLoading(false); }
    // Sync from cloud in background
    loadPlansFromDB()
      .then(db => { if (db) setPlans(db.filter(p => p.visible !== false)); setLoading(false); })
      .catch(() => { setPlans(getPlansConfig().filter(p => p.visible !== false)); setLoading(false); });
    base44.auth.me().then(u => {
      if (!u) return;
      setUserEmail(u.email || '');
      setUserPlanId(getNormalizedPlanId(u));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (authUser) { setUserPlanId(getNormalizedPlanId(authUser)); setUserEmail(authUser.email || ''); }
  }, [authUser]);

  const handleUpgrade = async (plan) => {
    try { if (window.self !== window.top) { alert('Checkout is only available from the published app.'); return; } } catch {}
    // During promo: use the dedicated promo price IDs ($42/$85/$255) directly
    const promoOn = isPromoActive();
    const priceId = promoOn
      ? (billing === 'yearly' ? plan.stripe_promo_price_id_yearly : plan.stripe_promo_price_id_monthly)
      : (billing === 'yearly' ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly);
    if (!priceId) { navigate(`/checkout?plan=${plan.id}&billing=${billing}`); return; }
    setLoadingPlanId(plan.id);
    try {
      const res = await base44.functions.invoke('createCheckoutSession', { price_id: priceId, email: userEmail });
      if (res.data?.url) { window.location.href = res.data.url; }
      else { navigate(`/checkout?plan=${plan.id}&billing=${billing}`); }
    } catch {
      navigate(`/checkout?plan=${plan.id}&billing=${billing}`);
    }
    setLoadingPlanId(null);
  };

  const isCurrent = (plan) => plan.id === userPlanId;
  const isFree = (plan) => !plan.price_monthly || plan.price_monthly === 0;

  const sortedPlans = [...plans].sort((a, b) => (a.price_monthly || 0) - (b.price_monthly || 0));
  // Derive recommendation from userPlanId (same source as isCurrent) to avoid auth context mismatch
  const recommendedPlanId = getRecommendedPlanId({ subscription_plan: userPlanId });

  if (loading) return <PricingSkeleton />;

  return (
    <div style={{ minHeight: '100vh', flex: 1, background: '#FAF9F6', fontFamily: WIX, color: '#15130F' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');

        .uw-app-pricing * { box-sizing: border-box; }
        .uw-app-pricing .wrap { max-width: 1160px; margin: 0 auto; padding: 0 40px; }
        .uw-app-pricing section { padding: 56px 0; }
        .uw-app-pricing h1, .uw-app-pricing h2 { font-weight: 800; letter-spacing: -0.03em; }
        .uw-app-pricing .serif { font-family: ${SERIF}; font-weight: 500; letter-spacing: -0.01em; }
        .uw-app-pricing .eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #C43E14; }
        .uw-app-pricing .eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: #FF5A1F; }

        /* HERO */
        .uw-app-pricing .p-hero { position: relative; text-align: center; padding: 56px 0 8px; }
        .uw-app-pricing .p-hero h1 { font-size: 38px; margin-bottom: 12px; }
        .uw-app-pricing .p-hero p { font-size: 14.5px; color: rgba(21,19,15,0.55); }

        /* TOGGLE */
        .uw-app-pricing .toggle { display: inline-flex; margin: 28px auto 0; padding: 4px; background: #F0EFEB; border-radius: 100px; border: 1px solid rgba(21,19,15,0.08); }
        .uw-app-pricing .toggle button { padding: 9px 20px; font-size: 13px; font-weight: 600; border-radius: 100px; cursor: pointer; color: rgba(21,19,15,0.55); display: flex; align-items: center; gap: 7px; border: none; background: none; font-family: inherit; transition: background .15s ease, color .15s ease; }
        .uw-app-pricing .toggle button.on { background: #15130F; color: #FAF9F6; }
        .uw-app-pricing .toggle .save { font-size: 10.5px; font-weight: 700; color: #C43E14; background: #FFE7D6; padding: 2px 7px; border-radius: 100px; }
        .uw-app-pricing .toggle-wrap { text-align: center; }

        /* PRICING GRID */
        .uw-app-pricing .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin: 67px auto 0; max-width: 960px; align-items: stretch; }
        @media (max-width: 1100px) and (min-width: 901px) { .uw-app-pricing .pricing-grid { grid-template-columns: repeat(2, 1fr); max-width: 640px; } }

        /* ENTERPRISE STRIP */
        .uw-app-pricing .ent-strip {
          padding: 26px 30px; background: #fff; border: 1px solid rgba(21,19,15,0.10);
          border-radius: 18px; display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .uw-app-pricing .ent-btn {
          padding: 10px 22px; border: 1px solid rgba(21,19,15,0.14); border-radius: 100px;
          background: #fff; color: #15130F; font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: inherit; display: flex; align-items: center; gap: 7px;
          transition: border-color .15s ease, background .15s ease;
        }
        .uw-app-pricing .ent-btn:hover { border-color: #15130F; background: #F0EFEB; }

        /* FAQ */
        .uw-app-pricing .faq-wrap { max-width: 680px; margin: 0 auto; }
        .uw-app-pricing .faq-wrap h2 { text-align: center; font-size: 27px; margin-bottom: 34px; }
        .uw-app-pricing details { border-bottom: 1px solid rgba(21,19,15,0.10); padding: 19px 4px; }
        .uw-app-pricing details summary { cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; font-size: 14.5px; font-weight: 600; }
        .uw-app-pricing details summary::-webkit-details-marker { display: none; }
        .uw-app-pricing details summary::after { content: '+'; font-size: 20px; font-weight: 400; color: rgba(21,19,15,0.5); }
        .uw-app-pricing details[open] summary::after { content: '–'; }
        .uw-app-pricing details p { font-size: 13.5px; color: rgba(21,19,15,0.55); line-height: 1.6; margin-top: 12px; }

        @media (max-width: 900px) {
          .uw-app-pricing .wrap { padding: 0 20px; }
          .uw-app-pricing .pricing-grid { grid-template-columns: 1fr; }
          .uw-app-pricing .p-hero h1 { font-size: 30px; }
          .uw-app-pricing .ent-strip { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="uw-app-pricing">
        {showContact && <ContactModal onClose={() => setShowContact(false)} />}

        {/* PROMO BANNER */}
        {isPromoActive() && (
          <div style={{ background: '#15130F', color: '#FAF9F6', textAlign: 'center', padding: '10px 20px', fontSize: 13, fontWeight: 500, fontFamily: WIX, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ background: '#FF5A1F', color: '#fff', fontWeight: 800, fontSize: 11, padding: '2px 7px', borderRadius: 5, lineHeight: 1, flexShrink: 0 }}>{PROMO.badgeText}</span>
            <span>{PROMO.bannerText}</span>
          </div>
        )}

        {/* HERO */}
        <section className="p-hero">
          <div className="wrap">
            <span className="eyebrow" style={{ justifyContent: 'center', display: 'flex', marginBottom: 14 }}><span className="dot"></span>Simple pricing</span>
            <h1>Choose the plan that fits you</h1>
            <p>You're on the <strong style={{ color: '#15130F', fontWeight: 600 }}>{userPlanId}</strong> plan. Change or cancel anytime.</p>
          </div>
        </section>

        {/* PRICING CARDS */}
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="pricing-grid">
              {sortedPlans.map(plan => {
                const curr = isCurrent(plan);
                const free = isFree(plan);
                const isReco = plan.id === recommendedPlanId && !curr;
                const planWithBadge = { ...plan, badge: isReco ? 'Recommended' : undefined };
                return (
                  <PlanCard
                    key={plan.id}
                    plan={planWithBadge}
                    billing={billing}
                    isCurrent={curr}
                    loading={loadingPlanId === plan.id}
                    onCta={() => free ? navigate('/app') : handleUpgrade(plan)}
                    ctaLabel={free ? 'Start for free' : `Choose ${plan.name}`}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* SECURITY BADGES */}
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <SecurityBadges />
          </div>
        </section>

        {/* ENTERPRISE STRIP */}
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="ent-strip">
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#15130F', marginBottom: 4 }}>Need a custom plan?</div>
                <div style={{ fontSize: 13, color: 'rgba(21,19,15,0.55)' }}>For agencies, large teams or custom contracts.</div>
              </div>
              <button onClick={() => setShowContact(true)} className="ent-btn">
                Contact the team <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* BRAND LOGOS */}
        <section style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="wrap">
            <BrandLogos />
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="wrap">
            <div className="faq-wrap">
              <h2>Frequently asked questions</h2>
              <details open>
                <summary>What is UseWok?</summary>
                <p>UseWok is an AI visibility platform that shows where and how your brand appears across AI engines like ChatGPT, Perplexity, Google AI Overviews, Claude and Gemini — and tells you exactly what to do to improve your presence.</p>
              </details>
              <details>
                <summary>What's included in the free plan?</summary>
                <p>The free plan lets you run a limited number of scans, track your AI visibility score across major engines, and see your top priority actions — no credit card required.</p>
              </details>
              <details>
                <summary>Which AI engines can I track?</summary>
                <p>UseWok tracks the major AI engines: ChatGPT, Perplexity, Google AI Overviews, Claude, Microsoft Copilot, Gemini and more, depending on your plan.</p>
              </details>
              <details>
                <summary>How often are my scans refreshed?</summary>
                <p>Scan frequency depends on your plan — from occasional manual scans on Free to automated recurring scans on paid tiers, so your visibility data stays up to date.</p>
              </details>
              <details>
                <summary>Can I change or cancel my plan anytime?</summary>
                <p>Yes. You can upgrade, downgrade or cancel at any time in one click from your dashboard — no fees and no commitment. You keep access until the end of the period you already paid for.</p>
              </details>
              <details>
                <summary>Is my payment secure?</summary>
                <p>Yes. All payments are processed by Stripe, a leader in payment security. We never see or store your card details.</p>
              </details>
              <details>
                <summary>What happens when I reach my plan limits?</summary>
                <p>You'll be notified when you approach your plan's limits. You can upgrade anytime to unlock more scans, engines and features — your existing data is always preserved.</p>
              </details>
              <details>
                <summary>Is my data secure and compliant?</summary>
                <p>Yes — UseWok is designed and hosted in France, ISO 27001 aligned and fully GDPR compliant.</p>
              </details>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}