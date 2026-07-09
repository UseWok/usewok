import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig } from '@/lib/plans-config';
import { formatPrice } from '@/lib/promo';
import { ArrowLeft, ShieldCheck, Lock, CreditCard, Wallet } from 'lucide-react';

export function saveCart(data) { localStorage.setItem('wok_cart', JSON.stringify(data)); }
export function clearCart() { localStorage.removeItem('wok_cart'); }
export function getCart() { try { return JSON.parse(localStorage.getItem('wok_cart')); } catch { return null; } }

const F = "'Inter', system-ui, sans-serif";
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E2E2DF';
const SURFACE = '#F7F6F4';
const WHITE = '#FFFFFF';
const CORAL = '#F95738';
const BLUE_BG = '#3C4B6B';

// Payment method icons as SVG
const VisaIcon = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
    <rect width="32" height="20" rx="3" fill="#1A1F71"/>
    <text x="4" y="14" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">VISA</text>
  </svg>
);
const McIcon = () => (
  <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
    <rect width="28" height="20" rx="3" fill="#252525"/>
    <circle cx="10" cy="10" r="7" fill="#EB001B"/>
    <circle cx="18" cy="10" r="7" fill="#F79E1B"/>
    <path d="M14 4.8a7 7 0 010 10.4A7 7 0 0114 4.8z" fill="#FF5F00"/>
  </svg>
);
const AmexIcon = () => (
  <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
    <rect width="28" height="20" rx="3" fill="#2E77BC"/>
    <text x="3" y="14" fill="white" fontSize="7.5" fontWeight="bold" fontFamily="Arial">AMEX</text>
  </svg>
);
const PaypalIcon = () => (
  <svg width="64" height="18" viewBox="0 0 64 18" fill="none">
    <text x="0" y="13" fill="#003087" fontSize="13" fontWeight="bold" fontFamily="Arial">Pay</text>
    <text x="22" y="13" fill="#009CDE" fontSize="13" fontWeight="bold" fontFamily="Arial">Pal</text>
  </svg>
);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const planIdParam = urlParams.get('plan') || 'starter';
  const billingParam = urlParams.get('billing') || 'monthly';

  const [billing, setBilling] = useState(billingParam);
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState(null);
  const [email, setEmail] = useState('');
  const [payMethod, setPayMethod] = useState('card'); // 'card' | 'paypal'
  const [loading, setLoading] = useState(false);
  const [inIframe, setInIframe] = useState(false);

  // Detect iframe
  useEffect(() => {
    try { setInIframe(window.self !== window.top); } catch { setInIframe(true); }
  }, []);

  // Load plans
  useEffect(() => {
    loadPlansFromDB()
      .then(db => setPlans(db || getPlansConfig()))
      .catch(() => setPlans(getPlansConfig()));
  }, []);

  // Set current plan from plans
  useEffect(() => {
    if (plans.length > 0) {
      const found = plans.find(p => p.id === planIdParam);
      setPlan(found || plans[1]);
    }
  }, [plans, planIdParam]);

  // Pre-fill email from current user
  useEffect(() => {
    base44.auth.me().then(u => { if (u?.email) setEmail(u.email); }).catch(() => {});
  }, []);

  const monthlyPrice = plan?.price_monthly || 0;
  const yearlyPrice = plan?.price_yearly || 0;
  const displayPrice = billing === 'yearly' ? Math.round(yearlyPrice / 12) : monthlyPrice;
  const yearlyTotal = billing === 'yearly' ? yearlyPrice : null;
  const discount = plan?.price_monthly && plan?.price_yearly
    ? Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)
    : 0;

  const handleCheckout = async () => {
    if (inIframe) {
      alert('Checkout is only available from the published app.');
      return;
    }
    const url = billing === 'yearly' ? plan?.checkout_url_yearly : plan?.checkout_url_monthly;
    if (url?.startsWith('http')) {
      setLoading(true);
      window.location.href = url;
      return;
    }
    const priceId = billing === 'yearly' ? plan?.stripe_price_id_yearly : plan?.stripe_price_id_monthly;
    if (priceId) {
      setLoading(true);
      try {
        const res = await base44.functions.invoke('createCheckoutSession', { price_id: priceId, email });
        if (res.data?.url) { window.location.href = res.data.url; }
        else { alert('Error while creating the payment session.'); }
      } catch (e) {
        alert('Error: ' + (e?.message || e));
      } finally { setLoading(false); }
    }
  };

  const handlePaypal = () => {
    if (inIframe) { alert('Checkout is only available from the published app.'); return; }
    alert('PayPal — redirecting to PayPal.');
  };

  if (!plan) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: SURFACE }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${BORDER}`, borderTopColor: INK, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 900, display: 'flex', minHeight: '100vh', flexWrap: 'wrap' }}>

        {/* ── LEFT PANEL (bleu grisé, comme Stripe) ── */}
        <div style={{ flex: '0 0 340px', background: BLUE_BG, color: WHITE, padding: '40px 36px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Back */}
          <button onClick={() => navigate('/pricing')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 32, fontFamily: F }}>
            <ArrowLeft size={14} />
            Back
          </button>

          {/* Logo */}
          <div style={{ fontSize: 16, fontWeight: 800, color: WHITE, marginBottom: 28, letterSpacing: '-0.02em' }}>UseWok</div>

          {/* Plan title */}
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
            Subscribe to UseWok {plan.name}
          </div>

          {/* Price big */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: WHITE, letterSpacing: '-0.03em' }}>
              {formatPrice(billing === 'yearly' ? yearlyPrice : monthlyPrice)}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              {billing === 'yearly' ? '/year' : '/month'}
            </span>
          </div>

          {billing === 'yearly' && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
              that's ${displayPrice}/month
            </div>
          )}

          {/* Billing toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 3, gap: 2, marginTop: 20, marginBottom: 28 }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                style={{
                  flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: F,
                  background: billing === b ? WHITE : 'transparent',
                  color: billing === b ? INK : 'rgba(255,255,255,0.55)',
                  transition: 'all 150ms',
                  position: 'relative',
                }}>
                {b === 'monthly' ? 'Monthly' : 'Yearly'}
                {b === 'yearly' && discount > 0 && (
                  <span style={{
                    position: 'absolute', top: -8, right: -2,
                    background: '#10B981', color: WHITE, fontSize: 9, fontWeight: 700,
                    borderRadius: 20, padding: '2px 5px',
                  }}>-{discount}%</span>
                )}
              </button>
            ))}
          </div>

          {/* Line item */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 13, color: WHITE, fontWeight: 500 }}>UseWok {plan.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                  {billing === 'yearly' ? 'Annual' : 'Monthly'} billing
                </div>
              </div>
              <span style={{ fontSize: 13, color: WHITE }}>
                {billing === 'yearly' ? formatPrice(yearlyPrice) : formatPrice(monthlyPrice)}
              </span>
            </div>
          </div>

          {/* Subtotal & Total */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Subtotal</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                {formatPrice(billing === 'yearly' ? yearlyPrice : monthlyPrice)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: WHITE }}>Total due today</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>
              {formatPrice(billing === 'yearly' ? yearlyPrice : monthlyPrice)}
            </span>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Security badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 32 }}>
            <Lock size={12} color="rgba(255,255,255,0.35)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              Secure payment via Stripe
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, padding: '40px 40px 60px', background: WHITE, minWidth: 0 }}>

          {/* Coordonnées */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 14px', letterSpacing: '-0.01em' }}>Contact details</h2>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden', background: SURFACE }}>
              <span style={{ padding: '11px 14px', fontSize: 13, color: INK3, borderRight: `1px solid ${BORDER}`, background: SURFACE, flexShrink: 0 }}>Email</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, padding: '11px 14px', border: 'none', background: 'transparent', fontSize: 13, color: INK, outline: 'none', fontFamily: F }}
              />
            </div>
          </div>

          {/* Moyen de paiement */}
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 14px', letterSpacing: '-0.01em' }}>Payment method</h2>

            {/* ── Carte + PayPal ── */}
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>

              {/* Carte */}
              <div
                onClick={() => setPayMethod('card')}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: payMethod === 'card' ? WHITE : SURFACE,
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', border: `2px solid ${payMethod === 'card' ? INK : BORDER}`,
                  background: payMethod === 'card' ? INK : WHITE,
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {payMethod === 'card' && <div style={{ width: 7, height: 7, borderRadius: '50%', background: WHITE }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <CreditCard size={15} color={INK2} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>Credit card</span>
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <VisaIcon /><McIcon /><AmexIcon />
                </div>
              </div>

              {/* Card fields */}
              {payMethod === 'card' && (
                <div style={{ padding: '16px 16px 20px', background: WHITE, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: INK3, marginBottom: 5 }}>Card information</label>
                    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 7, overflow: 'hidden' }}>
                      <input placeholder="1234 1234 1234 1234" style={{ width: '100%', padding: '10px 12px', border: 'none', fontSize: 13, color: INK, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
                      <div style={{ borderTop: `1px solid ${BORDER}`, display: 'flex' }}>
                        <input placeholder="MM / AA" style={{ flex: 1, padding: '10px 12px', border: 'none', fontSize: 13, color: INK, outline: 'none', fontFamily: F }} />
                        <div style={{ width: 1, background: BORDER }} />
                        <input placeholder="CVC" style={{ flex: 1, padding: '10px 12px', border: 'none', fontSize: 13, color: INK, outline: 'none', fontFamily: F }} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: INK3, marginBottom: 5 }}>Cardholder name</label>
                    <input placeholder="Full name" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 13, color: INK, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: INK3, marginBottom: 5 }}>Country or region</label>
                    <select style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 13, color: INK, outline: 'none', fontFamily: F, background: WHITE, boxSizing: 'border-box' }}>
                      <option>United States</option>
                      <option>France</option>
                      <option>Belgium</option>
                      <option>Switzerland</option>
                      <option>Canada</option>
                    </select>
                  </div>
                </div>
              )}

              {/* PayPal */}
              <div
                onClick={() => setPayMethod('paypal')}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: payMethod === 'paypal' ? WHITE : SURFACE,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', border: `2px solid ${payMethod === 'paypal' ? INK : BORDER}`,
                  background: payMethod === 'paypal' ? INK : WHITE,
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {payMethod === 'paypal' && <div style={{ width: 7, height: 7, borderRadius: '50%', background: WHITE }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Wallet size={15} color={INK2} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>PayPal</span>
                </div>
                <PaypalIcon />
              </div>
            </div>
          </div>

          {/* PayPal details */}
          {payMethod === 'paypal' && (
            <div style={{ marginTop: 16, padding: '14px 16px', background: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#7B6200', margin: 0, lineHeight: 1.6 }}>
                You'll be redirected to PayPal to securely complete your payment.
              </p>
            </div>
          )}

          {/* Save info checkbox */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <input type="checkbox" id="save-info" style={{ marginTop: 2, cursor: 'pointer' }} />
            <label htmlFor="save-info" style={{ fontSize: 12, color: INK2, lineHeight: 1.6, cursor: 'pointer' }}>
              Save my info for faster checkout next time
            </label>
          </div>

          {/* CTA */}
          <button
            onClick={payMethod === 'paypal' ? handlePaypal : handleCheckout}
            disabled={loading}
            style={{
              width: '100%', marginTop: 20, padding: '13px 0',
              background: '#4F8EF7', color: WHITE, border: 'none',
              borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              fontFamily: F, opacity: loading ? 0.7 : 1, transition: 'opacity 150ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {loading ? (
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: WHITE, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <>
                <ShieldCheck size={15} />
                {payMethod === 'paypal' ? 'Continue with PayPal' : 'Pay and subscribe'}
              </>
            )}
          </button>

          <p style={{ fontSize: 11, color: INK3, textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
            By subscribing, you authorize UseWok to charge your payment method in accordance with the terms until cancellation.
          </p>

          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </div>
  );
}