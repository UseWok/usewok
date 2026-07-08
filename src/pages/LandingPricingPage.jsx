import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig } from '@/lib/plans-config';
import PlanCard from '@/components/pricing/PlanCard';
import BrandLogos from '@/components/pricing/BrandLogos';
import SecurityBadges from '@/components/pricing/SecurityBadges';

const WIX = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function LandingPricingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState('monthly');

  useEffect(() => {
    document.body.style.backgroundColor = '#FAF9F6';
    document.body.style.fontFamily = WIX;
    loadPlansFromDB()
      .then(db => { setPlans((db || getPlansConfig()).filter(p => p.visible !== false)); setLoading(false); })
      .catch(() => { setPlans(getPlansConfig().filter(p => p.visible !== false)); setLoading(false); });
    return () => { document.body.style.backgroundColor = ''; document.body.style.fontFamily = ''; };
  }, []);

  const goRegister = () => navigate('/register');
  const goLogin = () => navigate('/login');
  const goHome = () => navigate('/');
  const goBlog = () => navigate('/blog');

  const sortedPlans = [...plans].sort((a, b) => (a.price_monthly || 0) - (b.price_monthly || 0));

  const samplePaid = sortedPlans.find(p => p.price_monthly && p.price_yearly);
  const discount = samplePaid ? Math.round((1 - (samplePaid.price_yearly / (samplePaid.price_monthly * 12))) * 100) : 0;

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6', fontFamily: WIX }}>
      <div style={{ width: 20, height: 20, border: '2px solid rgba(21,19,15,0.08)', borderTopColor: '#FF5A1F', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: WIX, background: '#FAF9F6', color: '#15130F', minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        .uw-pricing * { box-sizing: border-box; }
        .uw-pricing .wrap { max-width: 1160px; margin: 0 auto; padding: 0 40px; }
        .uw-pricing section { padding: 80px 0; }
        .uw-pricing h1, .uw-pricing h2, .uw-pricing h3 { font-weight: 800; letter-spacing: -0.03em; }
        .uw-pricing .serif { font-family: 'Fraunces', serif; font-weight: 500; }
        .uw-pricing .eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #C43E14; }
        .uw-pricing .eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: #FF5A1F; }
        .uw-pricing .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 22px; border-radius: 100px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: transform .15s ease, background .15s ease; }
        .uw-pricing .btn:active { transform: scale(0.97); }
        .uw-pricing .btn-dark { background: #15130F; color: #FAF9F6; }
        .uw-pricing .btn-dark:hover { background: #C43E14; }
        .uw-pricing .btn-outline { background: transparent; color: #15130F; border: 1px solid rgba(21,19,15,0.14); }
        .uw-pricing .btn-outline:hover { border-color: #15130F; }
        .uw-pricing nav { position: sticky; top: 0; z-index: 20; background: rgba(250,249,246,0.82); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(21,19,15,0.10); }
        .uw-pricing nav .wrap { display: flex; align-items: center; justify-content: space-between; height: 74px; }
        .uw-pricing .brand { display: flex; align-items: center; gap: 9px; cursor: pointer; }
        .uw-pricing .brand .mark { width: 26px; height: 26px; border-radius: 7px; background: #FF5A1F; display: flex; align-items: center; justify-content: center; }
        .uw-pricing .brand .mark svg { width: 13px; height: 13px; }
        .uw-pricing .brand span { font-weight: 700; font-size: 15.5px; }
        .uw-pricing .navlinks { display: flex; align-items: center; gap: 34px; font-size: 14px; font-weight: 500; color: #4A453B; }
        .uw-pricing .navlinks button { background: none; border: none; cursor: pointer; font-family: inherit; font-size: inherit; font-weight: inherit; color: inherit; padding: 0; }
        .uw-pricing .navlinks button:hover { color: #15130F; }
        .uw-pricing .navlinks button.active { color: #15130F; }
        .uw-pricing .navright { display: flex; align-items: center; gap: 12px; }
        .uw-pricing .p-hero { text-align: center; padding: 72px 0 8px; }
        .uw-pricing .p-hero h1 { font-size: 48px; margin-bottom: 14px; }
        .uw-pricing .p-hero p { font-size: 15.5px; color: rgba(21,19,15,0.55); }
        .uw-pricing .toggle { display: inline-flex; margin: 34px auto 0; padding: 4px; background: #F0EFEB; border-radius: 100px; }
        .uw-pricing .toggle span { padding: 9px 20px; font-size: 13.5px; font-weight: 600; border-radius: 100px; cursor: pointer; color: rgba(21,19,15,0.55); display: flex; align-items: center; gap: 7px; border: none; background: none; font-family: inherit; }
        .uw-pricing .toggle span.on { background: #15130F; color: #FAF9F6; }
        .uw-pricing .toggle .save { font-size: 10.5px; font-weight: 700; color: #C43E14; background: #FFE7D6; padding: 2px 7px; border-radius: 100px; }
        .uw-pricing .toggle-wrap { text-align: center; }
        .uw-pricing .pricing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 82px auto 0; max-width: 960px; align-items: stretch; }
        @media (max-width: 1100px) and (min-width: 901px) { .uw-pricing .pricing-grid { grid-template-columns: repeat(2, 1fr); max-width: 640px; } }
        .uw-pricing .trustbar { padding: 70px 0; text-align: center; }
        .uw-pricing .trustlogos { display: flex; justify-content: center; align-items: center; gap: 40px; flex-wrap: wrap; margin-top: 28px; }
        .uw-pricing .tlogo { display: flex; align-items: center; gap: 8px; opacity: 0.75; }
        .uw-pricing .tlogo .ic { width: 26px; height: 26px; border-radius: 7px; background: #15130F; color: #FAF9F6; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .uw-pricing .tlogo span { font-weight: 700; font-size: 14.5px; }
        .uw-pricing .testi { display: flex; align-items: center; gap: 40px; }
        .uw-pricing .testi .av { width: 88px; height: 88px; border-radius: 18px; background: #E8E7E2; flex-shrink: 0; }
        .uw-pricing .testi blockquote { font-family: 'Fraunces', serif; font-weight: 500; font-size: 24px; line-height: 1.35; margin-bottom: 16px; max-width: 620px; }
        .uw-pricing .testi cite { font-style: normal; font-size: 13.5px; color: rgba(21,19,15,0.55); }
        .uw-pricing .cta-band { position: relative; border-radius: 20px; padding: 60px 40px; text-align: center; background: #15130F; }
        .uw-pricing .cta-band h2 { font-size: 30px; max-width: 560px; margin: 0 auto 26px; line-height: 1.2; color: #FAF9F6; }
        .uw-pricing .cta-btns { display: flex; gap: 12px; justify-content: center; margin-bottom: 18px; }
        .uw-pricing .cta-band .noc { font-size: 12.5px; color: rgba(250,249,246,0.5); }
        .uw-pricing .faq-wrap { max-width: 680px; margin: 0 auto; }
        .uw-pricing .faq-wrap h2 { text-align: center; font-size: 28px; margin-bottom: 36px; }
        .uw-pricing details { border-bottom: 1px solid rgba(21,19,15,0.10); padding: 20px 4px; }
        .uw-pricing details summary { cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; font-size: 14.5px; font-weight: 600; }
        .uw-pricing details summary::-webkit-details-marker { display: none; }
        .uw-pricing details summary::after { content: '+'; font-size: 20px; font-weight: 400; color: rgba(21,19,15,0.55); }
        .uw-pricing details[open] summary::after { content: '–'; }
        .uw-pricing details p { font-size: 13.5px; color: rgba(21,19,15,0.55); line-height: 1.6; margin-top: 14px; }
        .uw-pricing footer { padding: 80px 0 40px; }
        .uw-pricing .foot-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 60px; }
        .uw-pricing .foot-brand p { font-size: 13.5px; color: rgba(21,19,15,0.55); line-height: 1.6; margin: 16px 0 20px; max-width: 280px; }
        .uw-pricing .foot-social { display: flex; gap: 10px; }
        .uw-pricing .foot-social a { width: 32px; height: 32px; border-radius: 9px; background: #F0EFEB; display: flex; align-items: center; justify-content: center; text-decoration: none; color: #4A453B; font-size: 13px; }
        .uw-pricing .foot-col h5 { font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(21,19,15,0.55); margin-bottom: 16px; }
        .uw-pricing .foot-col button { display: block; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 13.5px; color: #4A453B; text-align: left; margin-bottom: 11px; padding: 0; }
        .uw-pricing .foot-col button:hover { color: #15130F; }
        .uw-pricing .foot-bottom { display: flex; justify-content: space-between; padding-top: 26px; border-top: 1px solid rgba(21,19,15,0.10); font-size: 12.5px; color: rgba(21,19,15,0.55); }
        .uw-pricing .foot-bottom .fr { display: flex; align-items: center; gap: 6px; }
        .uw-pricing .foot-bottom .fr .flag { width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(90deg,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%); }
        @media (max-width: 900px) {
          .uw-pricing .wrap { padding: 0 20px; }
          .uw-pricing .navlinks { display: none; }
          .uw-pricing .pricing-grid { grid-template-columns: 1fr; }
          .uw-pricing .testi { flex-direction: column; text-align: center; }
          .uw-pricing .foot-top { grid-template-columns: 1fr; }
          .uw-pricing .p-hero h1 { font-size: 36px; }
        }
      `}</style>

      <div className="uw-pricing">
        {/* NAV */}
        <nav>
          <div className="wrap">
            <div className="brand" onClick={goHome}>
              <div className="mark"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3L21 20H3L12 3Z" fill="#FAF9F6"/></svg></div>
              <span>UseWok</span>
            </div>
            <div className="navlinks">
              <button onClick={goHome}>Product</button>
              <button onClick={goHome}>Use cases</button>
              <button className="active">Pricing</button>
              <button onClick={goBlog}>Resources</button>
            </div>
            <div className="navright">
              <button className="btn btn-outline" onClick={goLogin}>Log in</button>
              <button className="btn btn-dark" onClick={goRegister}>Get started</button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="p-hero">
          <div className="wrap">
            <span className="eyebrow" style={{ justifyContent: 'center', display: 'flex', marginBottom: 16 }}><span className="dot"></span>Simple pricing</span>
            <h1>Choose the plan that fits you</h1>
            <p>Start for free. Change your plan or cancel anytime.</p>
            <div className="toggle-wrap">
              <div className="toggle">
                <button className={billing === 'monthly' ? 'on' : ''} onClick={() => setBilling('monthly')}>Monthly</button>
                <button className={billing === 'yearly' ? 'on' : ''} onClick={() => setBilling('yearly')}>Yearly {discount > 0 && <span className="save">-{discount}%</span>}</button>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING CARDS */}
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="pricing-grid">
              {sortedPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  billing={billing}
                  isCurrent={false}
                  onCta={goRegister}
                  ctaLabel={!plan.price_monthly || plan.price_monthly === 0 ? 'Start for free' : `Choose ${plan.name}`}
                />
              ))}
            </div>
            <div style={{ marginTop: 40 }}>
              <SecurityBadges />
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <div className="trustbar">
          <div className="wrap">
            <span className="eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>They track their AI visibility</span>
            <div style={{ marginTop: 32 }}>
              <BrandLogos />
            </div>
          </div>
        </div>

        {/* TESTIMONIAL */}
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="testi">
              <div className="av"></div>
              <div>
                <blockquote>"UseWok didn't just give us data — it gave us direction. We know exactly where we can win and what to prioritize."</blockquote>
                <cite>Marketing Lead, Digital SMB</cite>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section>
          <div className="wrap">
            <div className="cta-band">
              <h2>10x your AI visibility without becoming a GEO expert</h2>
              <div className="cta-btns">
                <button className="btn" style={{ background: '#FF5A1F', color: '#fff' }} onClick={goRegister}>14-day free trial</button>
                <button className="btn btn-outline" style={{ background: 'transparent', color: '#FAF9F6', borderColor: 'rgba(250,249,246,0.3)' }} onClick={goHome}>See a demo</button>
              </div>
              <p className="noc">No credit card · 14 days free · Your score in under 3 minutes</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="wrap">
            <div className="faq-wrap">
              <h2>Frequently asked questions</h2>
              <details open>
                <summary>Can I cancel anytime?</summary>
                <p>Yes. Cancel in one click from your dashboard — no fees, no questions, no commitment. You keep access until the end of the period you already paid for.</p>
              </details>
              <details>
                <summary>Is cancellation fast?</summary>
                <p>Immediate. One click and your subscription is cancelled. No calls, no forms, no waiting. You get an email confirmation within a minute.</p>
              </details>
              <details>
                <summary>Do I need a credit card to start?</summary>
                <p>No. The Free plan is free forever, no card required. Paid plans start with a 14-day trial — you only pay if you decide to continue.</p>
              </details>
              <details>
                <summary>Can I get a refund?</summary>
                <p>Absolutely. If you're not satisfied within 14 days of your first payment, contact us for a full refund — no questions asked.</p>
              </details>
              <details>
                <summary>Is my payment secure?</summary>
                <p>Yes. All payments are processed by Stripe, the leader in payment security. We never see or store your banking information.</p>
              </details>
              <details>
                <summary>What happens to my data if I cancel?</summary>
                <p>Your data is kept for 30 days after cancellation in case you change your mind, then permanently deleted. You can also delete everything manually at any time from your settings.</p>
              </details>
              <details>
                <summary>What is UseWok?</summary>
                <p>UseWok is an AI visibility platform that shows where and how your brand appears in AI engines like ChatGPT, Perplexity, Google AI Overviews, Claude and Gemini — and tells you exactly what to do to improve your presence.</p>
              </details>
              <details>
                <summary>Is my data hosted in France?</summary>
                <p>Yes — UseWok is designed and hosted in France, in compliance with GDPR.</p>
              </details>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="wrap">
            <div className="foot-top">
              <div className="foot-brand">
                <div className="brand" onClick={goHome}><div className="mark"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3L21 20H3L12 3Z" fill="#FAF9F6"/></svg></div><span>UseWok</span></div>
                <p>UseWok is the platform that measures and improves your visibility on AI engines.</p>
                <div className="foot-social">
                  <a href="https://x.com/usewok" target="_blank" rel="noopener noreferrer">𝕏</a>
                  <a href="https://linkedin.com/company/usewok" target="_blank" rel="noopener noreferrer">in</a>
                  <a href="https://instagram.com/usewok" target="_blank" rel="noopener noreferrer">◎</a>
                </div>
              </div>
              <div className="foot-col">
                <h5>Product</h5>
                <button onClick={goHome}>Features</button>
                <button onClick={() => {}}>Pricing</button>
                <button onClick={goHome}>Integrations</button>
              </div>
              <div className="foot-col">
                <h5>Resources</h5>
                <button onClick={goBlog}>Documentation</button>
                <button onClick={goBlog}>Blog</button>
                <button onClick={goBlog}>Community</button>
              </div>
              <div className="foot-col">
                <h5>Legal</h5>
                <button onClick={() => navigate('/privacy')}>Privacy</button>
                <button onClick={() => navigate('/terms')}>Terms</button>
                <button onClick={() => navigate('/legal')}>Legal</button>
              </div>
            </div>
            <div className="foot-bottom">
              <span>© 2026 UseWok. All rights reserved.</span>
              <span className="fr"><span className="flag"></span>Made in France</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}