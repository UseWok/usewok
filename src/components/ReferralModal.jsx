import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Gift, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const MAX_REFERRALS = 5;

export default function ReferralModal({ open, onClose, user }) {
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);

  const referralLink = user ? `${window.location.origin}?ref=${user.id}` : '';
  const completed = referrals.filter(r => r.status === 'completed').length;

  useEffect(() => {
    if (open && user) {
      base44.entities.Referral.filter({ referrer_id: user.id }).then(setReferrals).catch(() => {});
    }
  }, [open, user]);

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Lien copié !', { duration: 1500 });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300]" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed z-[301] font-be"
            style={{
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: '90%', maxWidth: 360,
              background: 'white', borderRadius: 20,
              boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}>

            {/* Header */}
            <div className="px-6 pt-7 pb-6 text-center" style={{ background: FG }}>
              <button onClick={onClose}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center"
                style={{ position: 'absolute', background: 'rgba(255,255,255,0.08)', borderRadius: 7 }}>
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center"
                style={{ background: YUZU, borderRadius: 12 }}>
                <Gift className="w-6 h-6" style={{ color: FG }} />
              </div>
              <p className="font-black text-white text-base">Invitez vos amis</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Zap className="w-3 h-3" style={{ color: YUZU }} />
                <p className="text-sm font-bold" style={{ color: YUZU }}>+10 T par parrainage</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Stats */}
              <div className="flex gap-3">
                <div className="flex-1 text-center py-3" style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}>
                  <p className="text-xl font-black" style={{ color: FG }}>{referrals.length}<span className="text-sm font-normal text-gray-400">/{MAX_REFERRALS}</span></p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: '#bbb' }}>invités</p>
                </div>
                <div className="flex-1 text-center py-3" style={{ background: YUZU, borderRadius: 10 }}>
                  <p className="text-xl font-black" style={{ color: FG }}>{completed * 10} T</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: 'rgba(0,0,0,0.4)' }}>gagnés</p>
                </div>
              </div>

              {/* Link */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Votre lien</p>
                <div className="flex items-center gap-2 px-3 py-2.5"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10 }}>
                  <span className="text-xs flex-1 truncate" style={{ color: '#666' }}>{referralLink || '...'}</span>
                  <button onClick={copyLink}
                    className="w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: copied ? '#16a34a' : FG, borderRadius: 7 }}>
                    {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-center" style={{ color: '#ccc' }}>
                Votre ami s'inscrit · envoie son 1er message · vous recevez +10 T chacun
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}