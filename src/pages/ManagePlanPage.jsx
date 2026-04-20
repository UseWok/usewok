import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, TrendingUp, X, AlertCircle, ChevronRight, Zap, Crown, Star, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import HomeEventBanner from '@/components/home/HomeEventBanner';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const GREEN = '#16a34a';
const PLAN_ICONS = { free: Zap, essential: Shield, advanced: TrendingUp, expert: Star, supreme: Crown };

const SURVEY_CRITERIA = [
  { id: 'satisfaction', label: 'Overall satisfaction' },
  { id: 'value', label: 'Value for money' },
  { id: 'ease', label: 'Ease of use' },
  { id: 'features', label: 'Features offered' },
  { id: 'support', label: 'Support & assistance' },
];

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110">
          <Star className="w-6 h-6"
            fill={(hover || value) >= star ? '#f59e0b' : 'none'}
            style={{ color: (hover || value) >= star ? '#f59e0b' : '#ddd' }} />
        </button>
      ))}
    </div>
  );
}

export default function ManagePlanPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);

  const [showSurvey, setShowSurvey] = useState(false);
  const [showLossAversion, setShowLossAversion] = useState(false);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);

  const [ratings, setRatings] = useState({ satisfaction: 0, value: 0, ease: 0, features: 0, support: 0 });
  const [cancelNote, setCancelNote] = useState('');
  const [cancelEmail, setCancelEmail] = useState('');
  const [cancelSent, setCancelSent] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setUserPlan(getUserPlan(u));
      setCancelEmail(u?.email || '');
    }).catch(() => {});
  }, []);

  const fmtN = (n) => { const r = Math.round(n * 10) / 10; return Number.isInteger(r) ? r.toString() : r.toFixed(1); };
  const Icon = PLAN_ICONS[userPlan?.id] || Zap;
  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan?.credits_limit || 10;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);

  const features = [
    userPlan?.credits_limit && `${userPlan.credits_limit} Tensors/mo`,
    userPlan?.internet_access && 'Internet search',
    userPlan?.ultimate_access && 'Expert mode',
    userPlan?.file_upload && 'File uploads',
    userPlan?.max_discussions === 0 && 'Unlimited discussions',
    userPlan?.premium_support && 'Premium support',
  ].filter(Boolean);

  const closeAll = () => {
    setShowSurvey(false);
    setShowLossAversion(false);
    setShowDowngradeWarning(false);
    setShowCancelForm(false);
  };

  const handleCancelClick = () => setShowSurvey(true);

  const handleSurveyContinue = () => {
    setShowSurvey(false);
    setShowLossAversion(true);
  };

  const proceedToCancel = () => {
    setShowLossAversion(false);
    const STORAGE_KEY = 'discussions_v1';
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (stored.length > 10) { setShowDowngradeWarning(true); return; }
    } catch {}
    setShowCancelForm(true);
  };

  const confirmDowngrade = () => {
    const STORAGE_KEY = 'discussions_v1';
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const trimmed = stored.slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      const keptIds = new Set(trimmed.map(d => d.id));
      const msgs = JSON.parse(localStorage.getItem('discussion_messages_v1') || '{}');
      Object.keys(msgs).forEach(id => { if (!keptIds.has(id)) delete msgs[id]; });
      localStorage.setItem('discussion_messages_v1', JSON.stringify(msgs));
    } catch {}
    setShowDowngradeWarning(false);
    setShowCancelForm(true);
  };

  const submitCancel = async () => {
    if (!cancelNote.trim() || !cancelEmail.trim()) return;
    setCancelLoading(true);

    const ratingsText = SURVEY_CRITERIA.map(c => `${c.label}: ${ratings[c.id] || 0}/5`).join(' | ');
    const planPrice = userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/mo` : 'Free';
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Unknown';

    // Build a clear message for admin
    const msgText = `Name: ${userName}\nEmail: ${cancelEmail}\nPlan: ${userPlan?.name || 'Free'} (${planPrice})\nReason: ${cancelNote}\n\nRatings: ${ratingsText}`;

    const initialMsg = {
      author: 'user',
      text: msgText,
      file_urls: [],
      created_at: new Date().toISOString(),
    };

    // Save as a SupportTicket with category 'cancellation'
    await base44.entities.SupportTicket.create({
      title: `Cancellation — ${userName}`,
      description: cancelNote,
      category: 'cancellation',
      status: 'open',
      cancel_status: 'pending',
      user_email: cancelEmail,
      user_name: userName,
      user_plan: userPlan?.name || 'Free',
      user_plan_price: planPrice,
      ratings_json: JSON.stringify(ratings),
      messages_json: JSON.stringify([initialMsg]),
    });

    setCancelLoading(false);
    setCancelSent(true);
    closeAll();
    toast.success('Request sent');
  };

  const setRating = (id, val) => setRatings(prev => ({ ...prev, [id]: val }));
  const surveyComplete = SURVEY_CRITERIA.every(c => ratings[c.id] > 0);

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/settings?section=plan')} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '4px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#888' }} />
          </button>
          <h1 className="text-xl font-black" style={{ color: FG }}>Manage my plan</h1>
        </div>

        {/* Current plan card */}
        <div className="p-5 mb-5" style={{ background: FG, borderRadius: '6px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: YUZU, borderRadius: '4px' }}>
              <Icon className="w-5 h-5" style={{ color: FG }} />
            </div>
            <div>
              <p className="font-black text-white text-lg">{userPlan?.name || 'Free'}</p>
              <p className="text-xs text-white/50">Current plan</p>
            </div>
          </div>
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
            <span className="text-sm font-black" style={{ color: FG }}>Upgrade plan</span>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: FG }} />
        </button>

        {userPlan?.price_monthly > 0 && (
          <div className="mb-4 border overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '5px' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#aaa' }}>Billing history</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: FG }}>Plan {userPlan.name}</p>
                <p className="text-xs" style={{ color: '#999' }}>${userPlan.price_monthly}/mo</p>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5" style={{ background: 'rgba(22,163,74,0.1)', color: GREEN, borderRadius: '2px' }}>ACTIVE</span>
            </div>
          </div>
        )}

        {userPlan?.price_monthly > 0 && !cancelSent && (
          <button onClick={handleCancelClick}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all"
            style={{ background: 'white', color: '#999', border: '1px solid #ddd', borderRadius: '4px' }}>
            <X className="w-3 h-3" />
            Cancel subscription
          </button>
        )}

        {cancelSent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mt-3" style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.07)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: FG }}>Request pending</p>
            <p className="text-xs" style={{ color: '#888' }}>Your request has been sent. The Stensor team will process it as soon as possible.</p>
          </motion.div>
        )}
      </div>

      {/* STEP 1 — Survey */}
      <AnimatePresence>
        {showSurvey && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowSurvey(false); }}>
            <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }}
              className="w-full max-w-md bg-white overflow-hidden"
              style={{ borderRadius: '8px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="font-black text-sm" style={{ color: FG }}>Help us improve by rating your experience</p>
                <button onClick={() => setShowSurvey(false)} className="w-7 h-7 flex items-center justify-center hover:bg-black/5" style={{ borderRadius: '4px' }}>
                  <X className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {SURVEY_CRITERIA.map(c => (
                  <div key={c.id} className="flex items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: '#444' }}>{c.label}</p>
                    <StarRating value={ratings[c.id]} onChange={val => setRating(c.id, val)} />
                  </div>
                ))}
                <button onClick={handleSurveyContinue} disabled={!surveyComplete}
                  className="w-full mt-2 py-3 text-sm font-black transition-all disabled:opacity-40"
                  style={{ background: FG, color: 'white', borderRadius: '5px' }}>
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 2 — Loss aversion */}
      <AnimatePresence>
        {showLossAversion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowLossAversion(false); }}>
            <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }}
              className="w-full max-w-md bg-white overflow-hidden"
              style={{ borderRadius: '8px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="font-black text-base" style={{ color: FG }}>By cancelling, you immediately lose</p>
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>These benefits disappear at the end of your current period.</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="space-y-2">
                  {[
                    { icon: '⚡', text: `${userPlan?.credits_limit || 0} Tensors per month` },
                    userPlan?.internet_access && { icon: '🌐', text: 'Real-time web search' },
                    userPlan?.ultimate_access && { icon: '👑', text: 'Expert mode (Claude Opus)' },
                    userPlan?.file_upload && { icon: '📎', text: 'File & image uploads' },
                    userPlan?.max_discussions === 0 && { icon: '💬', text: 'Unlimited discussions' },
                    { icon: '📊', text: 'Your full conversation history' },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5" style={{ background: 'rgba(239,68,68,0.05)', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.12)' }}>
                      <span className="text-lg">{item.icon}</span>
                      <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{item.text}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowLossAversion(false)}
                  className="w-full py-3 text-sm font-black transition-all hover:opacity-90"
                  style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                  Keep my subscription
                </button>
                <button onClick={proceedToCancel}
                  className="w-full py-2 text-xs font-medium transition-all hover:opacity-70"
                  style={{ color: '#999' }}>
                  No thanks, cancel my subscription
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Downgrade warning */}
      <AnimatePresence>
        {showDowngradeWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowDowngradeWarning(false); }}>
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
              className="w-full max-w-sm bg-white overflow-hidden"
              style={{ borderRadius: '8px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />
                <p className="font-black text-sm" style={{ color: FG }}>Automatic deletion</p>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-sm" style={{ color: '#555' }}>Switching to the Free plan limits you to <strong>10 discussions</strong>. Extra discussions will be permanently deleted.</p>
                <div className="flex gap-2 pt-1">
                  <button onClick={confirmDowngrade} className="flex-1 py-2.5 text-sm font-bold" style={{ background: '#ef4444', color: 'white', borderRadius: '4px' }}>Confirm & delete</button>
                  <button onClick={() => setShowDowngradeWarning(false)} className="px-4 py-2.5 text-sm font-medium" style={{ background: 'rgba(0,0,0,0.05)', color: '#555', borderRadius: '4px' }}>Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final cancel form */}
      <AnimatePresence>
        {showCancelForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowCancelForm(false); }}>
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
              className="w-full max-w-sm bg-white overflow-hidden"
              style={{ borderRadius: '8px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="font-black text-sm" style={{ color: FG }}>Confirm cancellation</p>
                <button onClick={() => setShowCancelForm(false)} className="w-6 h-6 flex items-center justify-center hover:bg-black/5" style={{ borderRadius: '3px' }}>
                  <X className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Plan summary */}
                <div className="px-3 py-2.5 rounded-md" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <p className="text-xs font-black" style={{ color: FG }}>{userPlan?.name || 'Free'} plan · ${userPlan?.price_monthly || 0}/mo</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#888' }}>{user?.full_name || user?.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: FG }}>Why are you cancelling? *</label>
                  <textarea value={cancelNote} onChange={e => setCancelNote(e.target.value)}
                    placeholder="Tell us why you're cancelling..."
                    rows={3} className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                    style={{ border: `1.5px solid ${cancelNote ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '6px', transition: 'border-color 0.2s' }} />
                  <p className="text-[10px] mt-1" style={{ color: '#aaa' }}>Required</p>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: '#555' }}>Email used for payment *</label>
                  <input value={cancelEmail} onChange={e => setCancelEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                    style={{ border: `1.5px solid ${cancelEmail ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '6px', transition: 'border-color 0.2s' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={submitCancel} disabled={cancelLoading || !cancelNote.trim() || !cancelEmail.trim()}
                    className="flex-1 py-3 text-sm font-bold transition-all disabled:opacity-40"
                    style={{ background: '#DC2626', color: 'white', borderRadius: '6px' }}>
                    {cancelLoading ? 'Sending...' : 'Send request'}
                  </button>
                  <button onClick={() => setShowCancelForm(false)}
                    className="px-4 py-3 text-sm font-medium"
                    style={{ background: 'rgba(0,0,0,0.05)', color: '#666', borderRadius: '6px' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}