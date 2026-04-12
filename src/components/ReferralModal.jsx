import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Gift, Zap, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

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
    toast.success('Link copied!', { duration: 1500 });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-[301] inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-sm bg-white pointer-events-auto overflow-hidden font-be rounded-xl shadow-2xl border border-border">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-yuzu rounded-sm">
                    <Gift className="w-4 h-4 text-fg" />
                  </div>
                  <p className="font-black text-sm text-fg">Invite & Earn</p>
                </div>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-sm transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Hero */}
              <div className="px-5 pt-5 pb-4 text-center bg-yuzu">
                <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 flex items-center justify-center mx-auto mb-3 bg-fg rounded-xl">
                  <Zap className="w-8 h-8 text-yuzu" />
                </motion.div>
                <h2 className="text-xl font-black mb-1 text-fg">+{TENSORS_PER_REFERRAL} Tensors per friend</h2>
                <p className="text-xs leading-relaxed text-fg/50">
                  Invite a friend. As soon as they send their first message, you automatically receive {TENSORS_PER_REFERRAL} Tensors.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-px bg-border">
                {[{ label: 'Invited', value: referrals.length, icon: Users }, { label: 'Pending', value: pending, icon: Gift }, { label: 'Earned', value: `${earned}T`, icon: Zap }].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex flex-col items-center py-3 px-2 bg-white">
                      <p className="text-lg font-black text-fg">{stat.value}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5 text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Link copy */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-muted border border-border rounded-sm">
                  <span className="text-xs flex-1 truncate font-mono text-muted-foreground">{referralLink || '...'}</span>
                  <button onClick={copyLink} className={`w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-sm transition-colors ${copied ? 'bg-green-600' : 'bg-fg'}`}>
                    {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-white" />}
                  </button>
                </div>
                <button onClick={copyLink}
                  className="w-full py-3 font-black text-sm flex items-center justify-center gap-2 bg-yuzu text-fg rounded-sm hover:opacity-90 transition-opacity">
                  {copied ? <><Check className="w-4 h-4" /> Link copied!</> : <><Copy className="w-4 h-4" /> Copy my referral link</>}
                </button>
                <p className="text-center text-[10px] text-muted-foreground">
                  Credits are granted only after your referral sends their first message.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}