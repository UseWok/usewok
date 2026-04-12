import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Gift, Zap, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const TENSORS_PER_REFERRAL = 5;

export default function ReferralModal({ open, onClose, user }) {
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);

  const referralLink = user ? `${window.location.origin}?ref=${user.id}` : '';
  const completed = referrals.filter(r => r.status === 'completed').length;
  const pending = referrals.filter(r => r.status === 'pending').length;
  const earned = completed * TENSORS_PER_REFERRAL;

  useEffect(() => {
    if (open && user) {
      base44.entities.Referral.filter({ referrer_id: user.id }).then(setReferrals).catch(() => {});
    }
  }, [open, user]);

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast.success('Lien copié !', { duration: 1500 });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300]"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-[301] inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-sm bg-white pointer-events-auto overflow-hidden font-be"
              style={{ borderRadius: '12px', boxShadow: '0 32px 80px rgba(0,0,0,0.18)', border: '1px solid rgba(0,0,0,0.07)' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '6px' }}>
                    <Gift className="w-4 h-4" style={{ color: FG }} />
                  </div>
                  <p className="font-black text-sm" style={{ color: FG }}>Invite & Earn</p>
                </div>
                <button onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center hover:bg-black/5 transition-colors"
                  style={{ borderRadius: '5px' }}>
                  <X className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
                </button>
              </div>

              {/* Hero area */}
              <div className="px-5 pt-5 pb-4 text-center" style={{ background: FG }}>
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 flex items-center justify-center mx-auto mb-3"
                  style={{ background: YUZU, borderRadius: '14px' }}>
                  <Zap className="w-8 h-8" style={{ color: FG }} />
                </motion.div>
                <h2 className="text-xl font-black text-white mb-1">+{TENSORS_PER_REFERRAL} Tensors par ami</h2>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Invitez un ami. Dès qu'il envoie son premier message, vous recevez automatiquement {TENSORS_PER_REFERRAL} Tensors.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-px" style={{ background: 'rgba(0,0,0,0.06)' }}>
                {[
                  { label: 'Invités', value: referrals.length, icon: Users },
                  { label: 'En attente', value: pending, icon: Gift },
                  { label: 'Gagnés', value: `${earned}T`, icon: Zap },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex flex-col items-center py-3 px-2" style={{ background: 'white' }}>
                      <p className="text-lg font-black" style={{ color: i === 2 ? '#3A0088' : FG }}>{stat.value}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: '#bbb' }}>{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Link copy */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 px-3 py-2.5"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '6px' }}>
                  <span className="text-xs flex-1 truncate font-mono" style={{ color: '#888' }}>
                    {referralLink || '...'}
                  </span>
                  <button onClick={copyLink}
                    className="w-7 h-7 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: copied ? '#16a34a' : FG, borderRadius: '4px' }}>
                    {copied
                      ? <Check className="w-3 h-3 text-white" />
                      : <Copy className="w-3 h-3 text-white" />}
                  </button>
                </div>

                <button onClick={copyLink}
                  className="w-full py-3 font-black text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ background: YUZU, color: FG, borderRadius: '6px' }}>
                  {copied
                    ? <><Check className="w-4 h-4" /> Lien copié !</>
                    : <><Copy className="w-4 h-4" /> Copier mon lien de parrainage</>}
                </button>

                <p className="text-center text-[10px]" style={{ color: '#ccc' }}>
                  Crédits attribués uniquement après le premier message de votre filleul
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}