import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, TrendingUp, X, ChevronRight, Zap, Crown, Shield, Clock, Star, AlertTriangle, Lock, Wifi, MessageSquare, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import HomeEventBanner from '@/components/home/HomeEventBanner';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const GREEN = '#16a34a';
const PLAN_ICONS = { free: Zap, essential: Shield, advanced: TrendingUp, expert: TrendingUp, supreme: Crown };

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getRenewalDate(user) {
  const base = user?.subscription_date || user?.created_date;
  if (!base) return null;
  const d = new Date(base);
  const billing = user?.billing_cycle || 'monthly';
  const now = new Date();
  if (billing === 'yearly') {
    // Advance by years until in the future
    while (d <= now) d.setFullYear(d.getFullYear() + 1);
  } else {
    // Advance by months until in the future
    while (d <= now) d.setMonth(d.getMonth() + 1);
  }
  return d;
}

// ─── Rating Step ──────────────────────────────────────────────────────────────
const RATING_ITEMS = [
  { key: 'quality', label: 'Answer quality' },
  { key: 'speed', label: 'Response speed' },
  { key: 'value', label: 'Value for money' },
  { key: 'ux', label: 'Ease of use' },
];

function RatingStep({ ratings, setRatings, onNext }) {
  const allRated = RATING_ITEMS.every(i => ratings[i.key] > 0);
  return (
    <div className="p-5 space-y-5">
      <div className="text-center">
        <p className="text-base font-black mb-1" style={{ color: FG }}>Before you go…</p>
        <p className="text-xs" style={{ color: '#888' }}>Your feedback helps us improve Stensor for everyone.</p>
      </div>
      <div className="space-y-3">
        {RATING_ITEMS.map(item => (
          <div key={item.key} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#444' }}>{item.label}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRatings(r => ({ ...r, [item.key]: star }))}>
                  <Star
                    className="w-5 h-5 transition-all"
                    fill={ratings[item.key] >= star ? YUZU : 'transparent'}
                    style={{ color: ratings[item.key] >= star ? '#bba800' : '#ddd' }}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onNext} disabled={!allRated}
        className="w-full py-3 text-sm font-black transition-all disabled:opacity-30"
        style={{ background: FG, color: 'white', borderRadius: '8px' }}>
        Continue →
      </button>
    </div>
  );
}

// ─── What You'll Lose Step ────────────────────────────────────────────────────
function LossStep({ userPlan, onNext, onBack }) {
  const losses = [
    userPlan?.credits_limit && { icon: Zap, label: `${userPlan.credits_limit} Tensors/month`, desc: 'Your full AI query budget, gone.' },
    userPlan?.internet_access && { icon: Wifi, label: 'Real-time Web Search', desc: 'Live market data & news in answers.' },
    userPlan?.file_upload && { icon: FileText, label: 'File & Document Analysis', desc: 'Upload bank statements, reports, etc.' },
    userPlan?.max_discussions === 0 && { icon: MessageSquare, label: 'Unlimited Discussions', desc: 'You\'ll be capped at 3 conversations.' },
    userPlan?.ultimate_access && { icon: Crown, label: 'Expert Mode (Claude Opus)', desc: 'The most powerful AI model access.' },
    { icon: Lock, label: 'All conversation history', desc: 'Access to past chats may be limited.' },
  ].filter(Boolean);

  return (
    <div className="p-5 space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full" style={{ background: 'rgba(239,68,68,0.08)' }}>
          <AlertTriangle className="w-6 h-6" style={{ color: '#ef4444' }} />
        </div>
        <p className="text-base font-black mb-1" style={{ color: FG }}>You'll immediately lose access to:</p>
      </div>
      <div className="space-y-2">
        {losses.map((loss, i) => {
          const Icon = loss.icon;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} />
              <div>
                <p className="text-xs font-bold" style={{ color: FG }}>{loss.label}</p>
                <p className="text-[10px]" style={{ color: '#aaa' }}>{loss.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onBack} className="px-4 py-3 text-sm font-medium" style={{ background: 'rgba(0,0,0,0.05)', color: '#666', borderRadius: '8px' }}>
          Back
        </button>
        <button onClick={onNext}
          className="flex-1 py-3 text-sm font-bold transition-all"
          style={{ background: '#ef4444', color: 'white', borderRadius: '8px' }}>
          I understand, continue →
        </button>
      </div>
    </div>
  );
}

// ─── Reason Step ─────────────────────────────────────────────────────────────
function ReasonStep({ cancelNote, setCancelNote, cancelEmail, setCancelEmail, cancelLoading, onSubmit, onBack }) {
  return (
    <div className="p-5 space-y-4">
      <div className="text-center">
        <p className="text-base font-black mb-1" style={{ color: FG }}>One last thing</p>
        <p className="text-xs" style={{ color: '#888' }}>Why are you cancelling? This helps us a lot.</p>
      </div>
      <div className="p-3 rounded-md text-xs" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
        <p style={{ color: '#555' }}>
          Your request will be processed within <strong>24 hours</strong>. You'll be notified of the exact cancellation date once approved.
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold" style={{ color: FG }}>Reason *</label>
          <span className="text-[10px] font-bold" style={{ color: cancelNote.length >= 450 ? '#ef4444' : '#aaa' }}>{cancelNote.length}/500</span>
        </div>
        <textarea value={cancelNote} onChange={e => setCancelNote(e.target.value.slice(0, 500))}
          placeholder="Tell us why you're cancelling..."
          rows={3} className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
          style={{ border: `1.5px solid ${cancelNote ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '6px' }} />
      </div>
      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: '#555' }}>Payment email *</label>
        <input value={cancelEmail} onChange={e => setCancelEmail(e.target.value)}
          placeholder="email@example.com"
          className="w-full px-3 py-2.5 text-sm focus:outline-none"
          style={{ border: `1.5px solid ${cancelEmail ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '6px' }} />
      </div>
      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-3 text-sm font-medium" style={{ background: 'rgba(0,0,0,0.05)', color: '#666', borderRadius: '6px' }}>
          Back
        </button>
        <button onClick={onSubmit} disabled={cancelLoading || !cancelNote.trim() || !cancelEmail.trim()}
          className="flex-1 py-3 text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: FG, color: 'white', borderRadius: '6px' }}>
          {cancelLoading ? 'Sending...' : 'Send cancellation request'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManagePlanPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [showCancelFlow, setShowCancelFlow] = useState(false);
  const [cancelStep, setCancelStep] = useState(1); // 1=rating, 2=losses, 3=reason
  const [ratings, setRatings] = useState({});
  const [cancelNote, setCancelNote] = useState('');
  const [cancelEmail, setCancelEmail] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSent, setCancelSent] = useState(false);
  const [existingCancel, setExistingCancel] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setUserPlan(getUserPlan(u));
      setCancelEmail(u?.email || '');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: user.email })
      .then(res => {
        if (res.length > 0) {
          // Prefer approved, then pending
          const sorted = res.sort((a, b) => {
            const rank = { approved: 0, pending: 1, rejected: 2 };
            return (rank[a.cancel_status] ?? 1) - (rank[b.cancel_status] ?? 1);
          });
          setExistingCancel(sorted[0]);
        }
      })
      .catch(() => {});
  }, [user?.email]);

  const fmtN = (n) => { const r = Math.round(n * 10) / 10; return Number.isInteger(r) ? r.toString() : r.toFixed(1); };
  const Icon = PLAN_ICONS[userPlan?.id] || Zap;
  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan?.credits_limit || 10;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const renewalDate = user ? getRenewalDate(user) : null;
  const billing = user?.billing_cycle || 'monthly';
  const isYearly = billing === 'yearly';

  const features = [
    userPlan?.credits_limit && `${userPlan.credits_limit} Tensors/month`,
    userPlan?.internet_access && 'Web Search',
    userPlan?.ultimate_access && 'Expert Mode',
    userPlan?.file_upload && 'File Uploads',
    userPlan?.max_discussions === 0 && 'Unlimited Discussions',
    userPlan?.premium_support && 'Premium Support',
  ].filter(Boolean);

  const openCancelFlow = () => { setCancelStep(1); setRatings({}); setShowCancelFlow(true); };
  const closeCancelFlow = () => setShowCancelFlow(false);

  const submitCancel = async () => {
    if (!cancelNote.trim() || !cancelEmail.trim()) return;
    setCancelLoading(true);
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Unknown';
    const planPrice = isYearly
      ? `$${userPlan?.price_yearly || userPlan?.price_monthly * 12}/yr`
      : `$${userPlan?.price_monthly}/mo`;

    const ratingsText = Object.entries(ratings).map(([k, v]) => `${k}: ${v}/5`).join(', ');

    await base44.entities.SupportTicket.create({
      title: `Cancellation — ${userName}`,
      description: cancelNote,
      category: 'cancellation',
      status: 'open',
      cancel_status: 'pending',
      user_email: user?.email || cancelEmail,
      user_name: userName,
      user_plan: userPlan?.name || 'Free',
      user_plan_price: planPrice,
      invoice_email: cancelEmail,
      ratings_json: JSON.stringify(ratings),
      messages_json: JSON.stringify([{
        author: 'user',
        text: `Reason: ${cancelNote}\nPayment email: ${cancelEmail}\nRatings: ${ratingsText}`,
        file_urls: [],
        created_at: new Date().toISOString(),
      }]),
    });

    setCancelLoading(false);
    setCancelSent(true);
    setShowCancelFlow(false);
    toast.success('Request sent — processed within 24 hours');
  };

  const STEP_TITLES = { 1: 'Rate Stensor', 2: "What you'll lose", 3: 'Cancel subscription' };

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/settings')} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '4px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#888' }} />
          </button>
          <h1 className="text-xl font-black" style={{ color: FG }}>Manage subscription</h1>
        </div>

        {/* Current plan card */}
        <div className="p-5 mb-5" style={{ background: FG, borderRadius: '6px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: YUZU, borderRadius: '4px' }}>
              <Icon className="w-5 h-5" style={{ color: FG }} />
            </div>
            <div>
              <p className="font-black text-white text-lg">{userPlan?.name || 'Free'}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-white/50">
                  {isYearly
                    ? `$${userPlan?.price_yearly || (userPlan?.price_monthly * 12)}/year`
                    : userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/month` : 'Free'}
                </p>
                {isYearly && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm" style={{ background: YUZU, color: FG }}>YEARLY</span>
                )}
              </div>
            </div>
          </div>

          {/* Renewal date */}
          {renewalDate && userPlan?.price_monthly > 0 && (
            <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {isYearly ? 'Annual renewal on ' : 'Monthly renewal on '}
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{formatDate(renewalDate)}</span>
              </p>
            </div>
          )}

          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-white/60">Tensors this month</span>
              <span className="text-xs font-bold text-white">{fmtN(creditsUsed)}/{fmtN(creditsLimit)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: YUZU }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 flex-shrink-0" style={{ color: YUZU }} />
                <span className="text-xs text-white/70">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <HomeEventBanner large />

        <button onClick={() => navigate('/pricing')}
          className="w-full flex items-center justify-between px-4 py-3 mb-3 transition-all hover:opacity-90"
          style={{ background: YUZU, borderRadius: '5px' }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: FG }} />
            <span className="text-sm font-black" style={{ color: FG }}>Upgrade my subscription</span>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: FG }} />
        </button>

        {/* Billing history */}
        {userPlan?.price_monthly > 0 && (
          <div className="mb-4 border overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '5px' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#aaa' }}>Billing history</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: FG }}>{userPlan.name} plan</p>
                <p className="text-xs" style={{ color: '#999' }}>
                  Since {formatDate(user?.subscription_date || user?.created_date)}
                  {isYearly && <span className="ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: 'rgba(221,255,0,0.3)', color: '#555' }}>Annual</span>}
                </p>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5" style={{ background: 'rgba(22,163,74,0.1)', color: GREEN, borderRadius: '2px' }}>ACTIVE</span>
            </div>
          </div>
        )}

        {/* Cancel section */}
        {userPlan?.price_monthly > 0 && (
          <>
            {cancelSent || existingCancel ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mt-2" style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.07)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5" style={{ color: existingCancel?.cancel_status === 'approved' ? '#16a34a' : '#888' }} />
                  <p className="text-sm font-semibold" style={{ color: FG }}>
                    {existingCancel?.cancel_status === 'approved' ? 'Subscription cancelled' : 'Cancellation request pending'}
                  </p>
                </div>
                <p className="text-xs" style={{ color: '#888' }}>
                  {existingCancel?.cancel_status === 'approved' && existingCancel?.cancel_ends_at
                    ? `Your subscription will remain active until ${new Date(existingCancel.cancel_ends_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}, then automatically downgrade to the free plan.`
                    : "Your request has been received and will be processed within 24 hours. You'll be notified of the exact end date once approved."
                  }
                </p>
              </motion.div>
            ) : (
              <button onClick={openCancelFlow}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-all mt-2"
                style={{ background: 'white', color: '#999', border: '1px solid #e5e5e5', borderRadius: '4px' }}>
                <X className="w-3 h-3" />
                Cancel my subscription
              </button>
            )}
          </>
        )}
      </div>

      {/* ─── Cancel Flow Modal (multi-step) ─────────────────────── */}
      <AnimatePresence>
        {showCancelFlow && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) closeCancelFlow(); }}>
            <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }}
              className="w-full max-w-sm bg-white overflow-hidden"
              style={{ borderRadius: '14px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>

              {/* Header */}
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2">
                  {/* Step indicators */}
                  {[1, 2, 3].map(s => (
                    <div key={s} className="w-2 h-2 rounded-full transition-all"
                      style={{ background: s <= cancelStep ? FG : 'rgba(0,0,0,0.15)' }} />
                  ))}
                  <span className="text-xs font-semibold ml-1" style={{ color: '#999' }}>{STEP_TITLES[cancelStep]}</span>
                </div>
                <button onClick={closeCancelFlow} className="w-6 h-6 flex items-center justify-center hover:bg-black/5" style={{ borderRadius: '3px' }}>
                  <X className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
                </button>
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div key={cancelStep}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}>
                  {cancelStep === 1 && (
                    <RatingStep ratings={ratings} setRatings={setRatings} onNext={() => setCancelStep(2)} />
                  )}
                  {cancelStep === 2 && (
                    <LossStep userPlan={userPlan} onNext={() => setCancelStep(3)} onBack={() => setCancelStep(1)} />
                  )}
                  {cancelStep === 3 && (
                    <ReasonStep
                      cancelNote={cancelNote} setCancelNote={setCancelNote}
                      cancelEmail={cancelEmail} setCancelEmail={setCancelEmail}
                      cancelLoading={cancelLoading}
                      onSubmit={submitCancel}
                      onBack={() => setCancelStep(2)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}