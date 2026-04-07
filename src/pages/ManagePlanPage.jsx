import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, TrendingUp, X, AlertCircle, ChevronRight, Zap, Wifi, Crown, Star, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPlan, getPlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const GREEN = '#16a34a';

const CANCEL_REASONS = [
  'Trop cher', 'Je n\'utilise pas assez', 'Je passe à un autre outil',
  'Pas assez de fonctionnalités', 'Autre'
];

const PLAN_ICONS = { free: Zap, essential: Shield, advanced: TrendingUp, expert: Star, supreme: Crown };

export default function ManagePlanPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNote, setCancelNote] = useState('');
  const [cancelSent, setCancelSent] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const plans = getPlansConfig().filter(p => p.id !== 'free');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setUserPlan(getUserPlan(u));
    }).catch(() => {});
  }, []);

  const Icon = PLAN_ICONS[userPlan?.id] || Zap;
  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan?.credits_limit || 10;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);

  const submitCancel = async () => {
    if (!user) return;
    setCancelLoading(true);
    // Create a notification for admin
    await base44.entities.Notification.create({
      title: `Demande d'annulation — ${user.full_name || user.email}`,
      message: `L'utilisateur ${user.email} souhaite annuler son plan ${userPlan?.name || ''}. Raison: ${cancelReason || 'Non précisée'}. Note: ${cancelNote || '-'}`,
    });
    setCancelLoading(false);
    setCancelSent(true);
    toast.success('Demande envoyée');
  };

  const features = [
    userPlan?.credits_limit && `${userPlan.credits_limit} Tensors/mois`,
    userPlan?.internet_access && 'Recherche Internet',
    userPlan?.ultimate_access && 'Mode Expert',
    userPlan?.file_upload && 'Envoi de fichiers',
    userPlan?.max_discussions === 0 && 'Discussions illimitées',
    userPlan?.premium_support && 'Support Premium',
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/settings?section=plan')} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '4px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#888' }} />
          </button>
          <h1 className="text-xl font-black" style={{ color: FG }}>Gérer mon plan</h1>
        </div>

        {/* Current plan card */}
        <div className="p-5 mb-5" style={{ background: FG, borderRadius: '6px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: YUZU, borderRadius: '4px' }}>
              <Icon className="w-5 h-5" style={{ color: FG }} />
            </div>
            <div>
              <p className="font-black text-white text-lg">{userPlan?.name || 'Free'}</p>
              <p className="text-xs text-white/50">Plan actuel</p>
            </div>
          </div>
          {/* Usage bar */}
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-white/60">Tensors ce mois</span>
              <span className="text-xs font-bold text-white">{creditsUsed}/{creditsLimit}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: YUZU }} />
            </div>
          </div>
          {/* Features */}
          <div className="grid grid-cols-2 gap-1.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 flex-shrink-0" style={{ color: YUZU }} />
                <span className="text-xs text-white/70">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade */}
        <button onClick={() => navigate('/pricing')}
          className="w-full flex items-center justify-between px-4 py-3 mb-3 transition-all hover:opacity-90"
          style={{ background: YUZU, borderRadius: '5px' }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: FG }} />
            <span className="text-sm font-black" style={{ color: FG }}>Mettre a niveau</span>
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
                <p className="text-xs" style={{ color: '#999' }}>{userPlan.price_monthly}$/mois</p>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5" style={{ background: 'rgba(22,163,74,0.1)', color: GREEN, borderRadius: '2px' }}>ACTIF</span>
            </div>
          </div>
        )}

        {/* Cancel */}
        {userPlan?.price_monthly > 0 && !cancelSent && (
          <button onClick={() => setShowCancel(true)}
            className="text-xs font-medium transition-colors hover:text-black"
            style={{ color: '#bbb' }}>
            Annuler mon abonnement
          </button>
        )}

        {cancelSent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mt-3" style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.07)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: FG }}>Demande en attente</p>
            <p className="text-xs" style={{ color: '#888' }}>Votre demande a ete envoyee. L'equipe Stensor fera de son possible pour traiter votre demande dans les plus brefs delais.</p>
          </motion.div>
        )}
      </div>

      {/* Cancel modal */}
      <AnimatePresence>
        {showCancel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowCancel(false); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white overflow-hidden"
              style={{ borderRadius: '6px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />
                  <p className="font-black text-sm" style={{ color: FG }}>Annuler l'abonnement</p>
                </div>
                <button onClick={() => setShowCancel(false)} className="w-6 h-6 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '3px' }}>
                  <X className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm" style={{ color: '#555' }}>Pourquoi souhaitez-vous annuler ? (facultatif)</p>
                <div className="space-y-2">
                  {CANCEL_REASONS.map(r => (
                    <button key={r} onClick={() => setCancelReason(r)}
                      className="w-full text-left px-3 py-2.5 text-sm transition-all"
                      style={{ border: `1px solid ${cancelReason === r ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '4px', background: cancelReason === r ? FG : 'white', color: cancelReason === r ? 'white' : '#444' }}>
                      {r}
                    </button>
                  ))}
                </div>
                <textarea value={cancelNote} onChange={e => setCancelNote(e.target.value)}
                  placeholder="Commentaire optionnel..."
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                <div className="flex gap-2">
                  <button onClick={submitCancel} disabled={cancelLoading}
                    className="flex-1 py-2.5 text-sm font-bold disabled:opacity-50"
                    style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                    {cancelLoading ? 'Envoi...' : 'Envoyer la demande'}
                  </button>
                  <button onClick={() => setShowCancel(false)}
                    className="px-4 py-2.5 text-sm font-medium"
                    style={{ background: 'rgba(0,0,0,0.05)', color: '#555', borderRadius: '4px' }}>
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