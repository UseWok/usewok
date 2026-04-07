import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Gift, Users, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const MAX_REFERRALS = 5;

export default function ReferralModal({ open, onClose, user }) {
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);

  const referralLink = user ? `${window.location.origin}?ref=${user.id}` : '';

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
    toast.success('Link copied!', { duration: 1500 });
  };

  const completed = referrals.filter(r => r.status === 'completed').length;
  const canReferMore = referrals.length < MAX_REFERRALS;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300]" style={{ background: 'rgba(0,0,0,0.25)' }}
            onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[301] bg-white font-be"
            style={{
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 'min(380px, calc(100vw - 24px))',
              maxHeight: 'calc(100vh - 48px)',
              overflowY: 'auto',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.09)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            }}>

            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex items-center justify-center" style={{ background: YUZU, borderRadius: '4px' }}>
                  <Gift className="w-4 h-4" style={{ color: FG }} />
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: FG }}>Invite Friends, Earn Tensors</p>
                  <p className="text-[10px]" style={{ color: '#999' }}>+10 tensors per completed referral · max {MAX_REFERRALS}</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center hover:bg-black/5 transition-colors"
                style={{ borderRadius: '4px' }}>
                <X className="w-4 h-4" style={{ color: '#bbb' }} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Steps */}
              <div className="space-y-2">
                {[
                  'Share your unique link with a friend',
                  'They sign up and send their first message',
                  'You both receive +10 tensors instantly',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ background: FG, color: YUZU, borderRadius: '50%' }}>
                      {i + 1}
                    </div>
                    <span className="text-xs" style={{ color: '#555' }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Link */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#aaa' }}>Your referral link</p>
                <div className="flex items-center gap-2 px-3 py-2.5"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px' }}>
                  <span className="text-xs flex-1 truncate" style={{ color: '#666' }}>{referralLink || 'Loading...'}</span>
                  <button onClick={copyLink}
                    className="w-7 h-7 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: copied ? '#16a34a' : FG, borderRadius: '3px' }}>
                    {copied
                      ? <Check className="w-3.5 h-3.5 text-white" />
                      : <Copy className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 p-3"
                style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" style={{ color: '#aaa' }} />
                  <span className="text-xs font-bold" style={{ color: FG }}>{referrals.length}/{MAX_REFERRALS}</span>
                  <span className="text-xs" style={{ color: '#aaa' }}>referrals</span>
                </div>
                <div className="w-px h-4" style={{ background: 'rgba(0,0,0,0.1)' }} />
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" style={{ color: '#aaa' }} />
                  <span className="text-xs font-bold" style={{ color: FG }}>{completed * 10}</span>
                  <span className="text-xs" style={{ color: '#aaa' }}>tensors earned</span>
                </div>
              </div>

              {!canReferMore && (
                <p className="text-xs text-center" style={{ color: '#bbb' }}>
                  You've reached the maximum of {MAX_REFERRALS} referrals.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}