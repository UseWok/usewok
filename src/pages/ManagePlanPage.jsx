import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, TrendingUp, X, ChevronRight, Zap, Crown, Shield, Clock } from 'lucide-react';
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
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getRenewalDate(user) {
  const base = user?.subscription_date || user?.created_date;
  if (!base) return null;
  const d = new Date(base);
  const now = new Date();
  // advance by months until in the future
  while (d <= now) d.setMonth(d.getMonth() + 1);
  return d;
}

export default function ManagePlanPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [showCancelFlow, setShowCancelFlow] = useState(false);
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

  // Check if there's already a pending cancellation
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: user.email, cancel_status: 'pending' })
      .then(res => { if (res.length > 0) setExistingCancel(res[0]); })
      .catch(() => {});
  }, [user?.email]);

  const fmtN = (n) => { const r = Math.round(n * 10) / 10; return Number.isInteger(r) ? r.toString() : r.toFixed(1); };
  const Icon = PLAN_ICONS[userPlan?.id] || Zap;
  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan?.credits_limit || 10;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const renewalDate = user ? getRenewalDate(user) : null;

  const features = [
    userPlan?.credits_limit && `${userPlan.credits_limit} Tensors/mois`,
    userPlan?.internet_access && 'Recherche internet',
    userPlan?.ultimate_access && 'Mode Expert',
    userPlan?.file_upload && 'Upload de fichiers',
    userPlan?.max_discussions === 0 && 'Discussions illimitées',
    userPlan?.premium_support && 'Support premium',
  ].filter(Boolean);

  const submitCancel = async () => {
    if (!cancelNote.trim() || !cancelEmail.trim()) return;
    setCancelLoading(true);
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Inconnu';
    const planPrice = userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/mo` : 'Free';

    const initialMsg = {
      author: 'user',
      text: `Raison: ${cancelNote}\nEmail paiement: ${cancelEmail}`,
      file_urls: [],
      created_at: new Date().toISOString(),
    };

    await base44.entities.SupportTicket.create({
      title: `Annulation — ${userName}`,
      description: cancelNote,
      category: 'cancellation',
      status: 'open',
      cancel_status: 'pending',
      user_email: user?.email || cancelEmail,
      user_name: userName,
      user_plan: userPlan?.name || 'Free',
      user_plan_price: planPrice,
      invoice_email: cancelEmail,
      messages_json: JSON.stringify([initialMsg]),
    });

    setCancelLoading(false);
    setCancelSent(true);
    setShowCancelFlow(false);
    toast.success('Demande envoyée — traitement sous 24h');
  };

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/settings?section=plan')} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '4px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#888' }} />
          </button>
          <h1 className="text-xl font-black" style={{ color: FG }}>Gérer mon abonnement</h1>
        </div>

        {/* Current plan card */}
        <div className="p-5 mb-5" style={{ background: FG, borderRadius: '6px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: YUZU, borderRadius: '4px' }}>
              <Icon className="w-5 h-5" style={{ color: FG }} />
            </div>
            <div>
              <p className="font-black text-white text-lg">{userPlan?.name || 'Free'}</p>
              <p className="text-xs text-white/50">
                {userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/mois` : 'Gratuit'}
              </p>
            </div>
          </div>

          {/* Renewal date */}
          {renewalDate && userPlan?.price_monthly > 0 && (
            <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Renouvellement le <span style={{ color: 'rgba(255,255,255,0.85)' }}>{formatDate(renewalDate)}</span>
              </p>
            </div>
          )}

          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-white/60">Tensors ce mois</span>
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
            <span className="text-sm font-black" style={{ color: FG }}>Upgrader mon abonnement</span>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: FG }} />
        </button>

        {/* Billing history */}
        {userPlan?.price_monthly > 0 && (
          <div className="mb-4 border overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '5px' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#aaa' }}>Historique de facturation</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: FG }}>Plan {userPlan.name}</p>
                <p className="text-xs" style={{ color: '#999' }}>
                  Depuis le {formatDate(user?.subscription_date || user?.created_date)}
                </p>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5" style={{ background: 'rgba(22,163,74,0.1)', color: GREEN, borderRadius: '2px' }}>ACTIF</span>
            </div>
          </div>
        )}

        {/* Cancel section */}
        {userPlan?.price_monthly > 0 && (
          <>
            {cancelSent || existingCancel ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mt-2" style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.07)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5" style={{ color: '#888' }} />
                  <p className="text-sm font-semibold" style={{ color: FG }}>Demande d'annulation en attente</p>
                </div>
                <p className="text-xs" style={{ color: '#888' }}>
                  Votre demande a été reçue. Elle sera traitée dans les 24h. Une fois approuvée, la date de fin d'abonnement vous sera communiquée.
                </p>
              </motion.div>
            ) : (
              <button onClick={() => setShowCancelFlow(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-all mt-2"
                style={{ background: 'white', color: '#999', border: '1px solid #e5e5e5', borderRadius: '4px' }}>
                <X className="w-3 h-3" />
                Annuler mon abonnement
              </button>
            )}
          </>
        )}
      </div>

      {/* Cancel flow modal */}
      <AnimatePresence>
        {showCancelFlow && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowCancelFlow(false); }}>
            <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }}
              className="w-full max-w-sm bg-white overflow-hidden"
              style={{ borderRadius: '10px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="font-black text-sm" style={{ color: FG }}>Annuler mon abonnement</p>
                <button onClick={() => setShowCancelFlow(false)} className="w-6 h-6 flex items-center justify-center hover:bg-black/5" style={{ borderRadius: '3px' }}>
                  <X className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="p-3 rounded-md text-xs" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <p style={{ color: '#555' }}>
                    Votre demande sera mise <strong>en attente</strong> et traitée dans les 24h. Une fois validée, vous serez informé de la date exacte de fin d'abonnement.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: FG }}>Raison *</label>
                  <textarea value={cancelNote} onChange={e => setCancelNote(e.target.value)}
                    placeholder="Dites-nous pourquoi vous annulez..."
                    rows={3} className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                    style={{ border: `1.5px solid ${cancelNote ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '6px' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: '#555' }}>Email utilisé pour le paiement *</label>
                  <input value={cancelEmail} onChange={e => setCancelEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                    style={{ border: `1.5px solid ${cancelEmail ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '6px' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={submitCancel} disabled={cancelLoading || !cancelNote.trim() || !cancelEmail.trim()}
                    className="flex-1 py-3 text-sm font-bold transition-all disabled:opacity-40"
                    style={{ background: FG, color: 'white', borderRadius: '6px' }}>
                    {cancelLoading ? 'Envoi...' : 'Envoyer la demande'}
                  </button>
                  <button onClick={() => setShowCancelFlow(false)}
                    className="px-4 py-3 text-sm font-medium"
                    style={{ background: 'rgba(0,0,0,0.05)', color: '#666', borderRadius: '6px' }}>
                    Annuler
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