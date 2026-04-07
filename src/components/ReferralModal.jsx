import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Gift, Zap, Users, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function ReferralModal({ open, onClose, user }) {
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);

  const referralLink = user ? `${window.location.origin}?ref=${user.id}` : '';
  const completed = referrals.filter(r => r.status === 'completed').length;
  const earned = completed * 10;

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex flex-col font-be"
          style={{ background: FG }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center" style={{ background: YUZU, borderRadius: '10px' }}>
                <Gift className="w-4 h-4" style={{ color: FG }} />
              </div>
              <p className="font-black text-white text-base">Invite & Earn</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}>
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">

            {/* Big icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-24 h-24 flex items-center justify-center mb-8"
              style={{ background: YUZU, borderRadius: '28px' }}>
              <Gift className="w-12 h-12" style={{ color: FG }} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl font-black text-white mb-3">
              Invitez vos amis
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm mb-10 max-w-xs leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              Chaque ami qui s'inscrit et envoie son premier message vous rapporte <strong style={{ color: YUZU }}>+10 Tensors</strong> à vous deux.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex gap-4 mb-10 w-full max-w-xs">
              <div className="flex-1 py-4 text-center" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px' }}>
                <p className="text-2xl font-black text-white">{referrals.length}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>invités</p>
              </div>
              <div className="flex-1 py-4 text-center" style={{ background: YUZU, borderRadius: '14px' }}>
                <p className="text-2xl font-black" style={{ color: FG }}>{earned}T</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: 'rgba(0,0,0,0.4)' }}>gagnés</p>
              </div>
            </motion.div>

            {/* Link copy */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-xs space-y-3">
              <div className="flex items-center gap-2 px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xs flex-1 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{referralLink || '...'}</span>
                <button onClick={copyLink}
                  className="w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: copied ? '#16a34a' : YUZU, borderRadius: '8px' }}>
                  {copied
                    ? <Check className="w-3.5 h-3.5 text-white" />
                    : <Copy className="w-3.5 h-3.5" style={{ color: FG }} />}
                </button>
              </div>

              <button onClick={copyLink}
                className="w-full py-4 font-black text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: YUZU, color: FG, borderRadius: '12px' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                {copied ? <><Check className="w-4 h-4" /> Lien copié !</> : <><Copy className="w-4 h-4" /> Copier mon lien de parrainage</>}
              </button>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-8 flex-shrink-0 text-center">
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Crédits attribués après la première conversation de votre filleul
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}