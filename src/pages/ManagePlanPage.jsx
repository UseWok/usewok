import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, TrendingUp, X, ChevronRight, Zap, Crown, Clock, Star, AlertTriangle, MessageSquare, BarChart2, Scan, ExternalLink, Globe, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { getWokFeatures, PLAN_PRICES } from '@/lib/wok-plans';
import { toast } from 'sonner';

const F = 'Inter, system-ui, sans-serif';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getRenewalDate(user) {
  const base = user?.subscription_date || user?.created_date;
  if (!base) return null;
  const d = new Date(base);
  const now = new Date();
  if (user?.billing_cycle === 'yearly') { while (d <= now) d.setFullYear(d.getFullYear() + 1); }
  else { while (d <= now) d.setMonth(d.getMonth() + 1); }
  return d;
}

// Count scans used this month from the profile
function getScansUsedThisMonth(user) {
  try {
    const scanHistory = JSON.parse(localStorage.getItem(`wok_scan_history_${user?.id}`) || '[]');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return scanHistory.filter(s => s.ts >= monthStart).length;
  } catch { return 0; }
}

function getChatsUsedThisMonth() {
  try {
    const convs = JSON.parse(localStorage.getItem('wok_ai_v3') || '[]');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return convs.reduce((acc, conv) => {
      return acc + (conv.messages || []).filter(m => m.role === 'user' && m.ts >= monthStart).length;
    }, 0);
  } catch { return 0; }
}

function UsageBar({ label, used, limit, icon: Icon, color = '#111' }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f97316' : color;
  const remaining = Math.max(0, limit - used);

  return (
    <div style={{ background: '#F9F9F8', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon style={{ width: 14, height: 14, color: '#555' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>{label}</p>
          <p style={{ fontSize: 12, color: remaining === 0 ? '#ef4444' : '#888', margin: '1px 0 0' }}>
            {remaining === 0 ? 'Quota reached' : `${remaining} remaining this month`}
          </p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{used}<span style={{ fontWeight: 400, color: '#999', fontSize: 12 }}>/{limit}</span></span>
      </div>
      <div style={{ height: 6, background: '#EBEBEA', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

// Step 1: Rating before leaving
const RATING_ITEMS = [
  { key: 'quality', label: 'Analysis quality' },
  { key: 'value', label: 'Value for money' },
  { key: 'ux', label: 'Ease of use' },
];

function RatingStep({ ratings, setRatings, onNext, onClose }) {
  const allRated = RATING_ITEMS.every(i => ratings[i.key] > 0);
  return (
    <div style={{ padding: '28px 24px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>Before you go…</p>
        <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.5 }}>Your feedback helps us improve.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {RATING_ITEMS.map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#444' }}>{item.label}</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRatings(r => ({ ...r, [item.key]: star }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <Star style={{ width: 20, height: 20, color: ratings[item.key] >= star ? '#F95738' : '#DDD', fill: ratings[item.key] >= star ? '#F95738' : 'none' }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onNext} disabled={!allRated}
        style={{ width: '100%', marginTop: 22, padding: '12px 0', background: allRated ? '#111' : '#F0F0EE', color: allRated ? '#fff' : '#aaa', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: allRated ? 'pointer' : 'not-allowed', fontFamily: F }}>
        Continue →
        </button>
        <button onClick={onClose} style={{ width: '100%', marginTop: 8, padding: '10px 0', background: 'transparent', color: '#aaa', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: F }}>
        Cancel
        </button>
    </div>
  );
}

// Step 2: Confirmation + Stripe redirect
function ConfirmCancelStep({ user, userPlan, ratings, onBack, onClose }) {
  const [loading, setLoading] = useState(false);
  const renewal = user ? getRenewalDate(user) : null;

  const goToStripePortal = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createStripePortal', { email: user?.email });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(res?.data?.error || 'Unable to access the management portal.');
        setLoading(false);
        }
        } catch (e) {
        toast.error('Connection error. Please try again or contact support.');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px 24px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <AlertTriangle style={{ width: 20, height: 20, color: '#ef4444' }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>Cancel your subscription</p>
        {renewal && (
          <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.6 }}>
            You'll keep access to <strong>{userPlan?.name}</strong> until <strong>{formatDate(renewal)}</strong>.<br />
            No refund will be issued.
          </p>
        )}
      </div>

      <div style={{ background: '#FEF3EC', border: '1px solid #FDD8BF', borderRadius: 9, padding: '12px 14px', marginBottom: 18 }}>
        <p style={{ fontSize: 12, color: '#C45000', margin: 0, lineHeight: 1.6 }}>
          ℹ️ You'll be redirected to Stripe's secure page to cancel. Access remains active until the end of your paid period.
        </p>
      </div>

      <button onClick={goToStripePortal} disabled={loading}
        style={{ width: '100%', padding: '12px 0', background: loading ? '#F0F0EE' : '#ef4444', color: loading ? '#aaa' : '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
        {loading ? (
          <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#aaa', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Redirection…</>
        ) : (
          <><ExternalLink style={{ width: 14, height: 14 }} />Cancel on Stripe</>
        )}
        </button>
        <button onClick={onBack}
        style={{ width: '100%', padding: '10px 0', background: 'transparent', color: '#888', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 9, fontSize: 13, cursor: 'pointer', fontFamily: F }}>
        Back
        </button>
    </div>
  );
}

export default function ManagePlanPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [planFeatures, setPlanFeatures] = useState(null);
  const [showCancelFlow, setShowCancelFlow] = useState(false);
  const [cancelStep, setCancelStep] = useState(1);
  const [ratings, setRatings] = useState({});
  const [portalLoading, setPortalLoading] = useState(false);
  const [scansUsed, setScansUsed] = useState(0);
  const [chatsUsed, setChatsUsed] = useState(0);
  const [sitesUsed, setSitesUsed] = useState(0);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      setUserPlan(getUserPlan(u));
      setPlanFeatures(getWokFeatures(u));
      setScansUsed(getScansUsedThisMonth(u));
      setChatsUsed(getChatsUsedThisMonth());
      // Count sites from cloud
      try {
        const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id });
        setSitesUsed((profiles || []).length);
      } catch { setSitesUsed(0); }
    }).catch(() => {});
  }, []);

  const renewalDate = user ? getRenewalDate(user) : null;
  const isYearly = user?.billing_cycle === 'yearly';
  const isPaid = userPlan?.price_monthly > 0;
  const scanLimit = planFeatures?.scans_per_period || 1;
  const chatLimit = planFeatures?.chatbot_messages || 5;
  const siteLimit = planFeatures?.max_sites || 1;

  const openStripePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await base44.functions.invoke('createStripePortal', { email: user?.email });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(res?.data?.error || 'Unable to access subscription management.');
      }
    } catch {
      toast.error('Connection error. Please try again or contact support.');
    }
    setPortalLoading(false);
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, border: '2px solid #E5E5E0', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', fontFamily: F }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <button onClick={() => navigate('/settings?section=plan')}
            style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid rgba(0,0,0,0.09)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0 }}>My subscription</h1>
        </div>

        {/* Plan actuel */}
        <div style={{ background: '#111', borderRadius: 14, padding: '20px 20px', marginBottom: 14, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Current plan</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{userPlan?.name || 'Free'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {isPaid ? (
                <>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>
                    {isYearly ? `${PLAN_PRICES[userPlan?.id]?.yearly || '—'}€` : `${userPlan?.price_monthly || '—'}€`}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>/{isYearly ? 'year' : 'month'}</p>
                </>
              ) : (
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Free</span>
              )}
            </div>
          </div>
          {renewalDate && isPaid && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.07)' }}>
              <Clock style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {isPaid ? 'Next renewal' : 'Active since'} : <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{formatDate(renewalDate)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Utilisation ce mois */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>Usage this month</p>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#999' }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
            <p style={{ fontSize: 12, color: '#999', margin: '0 0 16px', lineHeight: 1.5 }}>Your consumption relative to your plan limits.</p>

            <UsageBar label="Site analyses" used={scansUsed} limit={scanLimit} icon={Scan} color="#111" />
            <UsageBar label="WOK AI messages" used={chatsUsed} limit={chatLimit} icon={MessageSquare} color="#111" />
            <UsageBar label="Monitored sites" used={sitesUsed} limit={siteLimit} icon={Globe} color="#111" />
        </div>

        {/* Actions */}
        <p style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 10px' }}>Actions</p>

        {/* Upgrade */}
        <button onClick={() => navigate('/pricing')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', marginBottom: 10, background: '#F95738', border: 'none', borderRadius: 11, cursor: 'pointer', fontFamily: F }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <TrendingUp style={{ width: 15, height: 15, color: '#fff' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Change plan</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>See all available plans</p>
            </div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }} />
        </button>

        {/* Gérer la facturation via Stripe (si payant) */}
        {isPaid && (
          <button onClick={openStripePortal} disabled={portalLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', marginBottom: 10, background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 11, cursor: portalLoading ? 'not-allowed' : 'pointer', fontFamily: F, opacity: portalLoading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!portalLoading) e.currentTarget.style.background = '#F9F9F8'; }}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              {portalLoading
                ? <div style={{ width: 15, height: 15, border: '2px solid #DDD', borderTopColor: '#999', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : <BarChart2 style={{ width: 15, height: 15, color: '#555' }} />
              }
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>Manage billing</p>
                <p style={{ fontSize: 11, color: '#999', margin: 0 }}>Invoices, payment method, receipts</p>
              </div>
            </div>
            <ExternalLink style={{ width: 13, height: 13, color: '#bbb' }} />
          </button>
        )}

        {/* Annuler l'abonnement */}
        {isPaid && (
          <button onClick={() => { setCancelStep(1); setRatings({}); setShowCancelFlow(true); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', background: 'transparent', color: '#bbb', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: F }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#bbb'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'; }}>
            <X style={{ width: 13, height: 13 }} />
            Cancel subscription
          </button>
        )}

        {!isPaid && (
          <div style={{ padding: '14px 16px', background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 11, marginBottom: 10 }}>
            <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
              You're on the <strong style={{ color: '#111' }}>Free</strong> plan.<br />
              Upgrade to Starter or Pro to unlock more features.
            </p>
          </div>
        )}

      </div>

      {/* Modal annulation */}
      {showCancelFlow && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowCancelFlow(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}>
            {/* Barre de progression */}
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ width: 28, height: 4, borderRadius: 2, background: s <= cancelStep ? '#111' : '#E5E5E0', transition: 'background 200ms' }} />
                ))}
              </div>
              <button onClick={() => setShowCancelFlow(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 4 }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
            {cancelStep === 1 && (
              <RatingStep ratings={ratings} setRatings={setRatings}
                onNext={() => setCancelStep(2)}
                onClose={() => setShowCancelFlow(false)} />
            )}
            {cancelStep === 2 && (
              <ConfirmCancelStep user={user} userPlan={userPlan} ratings={ratings}
                onBack={() => setCancelStep(1)}
                onClose={() => setShowCancelFlow(false)} />
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}