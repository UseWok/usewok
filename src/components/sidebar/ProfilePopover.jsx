import { useEffect, useRef, useState } from 'react';
import { Settings, HelpCircle, LogOut, Gift, Ticket, Plus, Globe, ChevronRight } from 'lucide-react';
import ReferralModal from '@/components/ReferralModal';
import ActivationCodeModal from '@/components/ActivationCodeModal';
import DomainManagerModal from '@/components/home/DomainManagerModal';
import { getWokFeatures } from '@/lib/wok-plans';
import { useNavigate } from 'react-router-dom';
import { getUserColor } from '@/lib/user-color';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteAccountModal from './DeleteAccountModal';

const CORAL = '#FF5A1F';

export default function ProfilePopover({ open, onClose, anchorRef, user, userInitial }) {
  const popoverRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [domainModal, setDomainModal] = useState(null); // 'add' | 'manage' | null
  const maxDomains = getWokFeatures(user)?.max_sites || 1;

  useEffect(() => {
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  const navigate = useNavigate();
  const [deleteHoldTime, setDeleteHoldTime] = useState(0);
  const deleteHoldRef = useRef(null);

  const handleDeleteMouseDown = () => {
    deleteHoldRef.current = setInterval(() => {
      setDeleteHoldTime(prev => {
        if (prev >= 3) {
          clearInterval(deleteHoldRef.current);
          base44.auth.updateMe({}).catch(() => {}); // Dummy call
          base44.entities.User.delete(user.id).then(() => {
            base44.auth.logout();
          }).catch(() => {});
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);
  };

  const handleDeleteMouseUp = () => {
    if (deleteHoldRef.current) clearInterval(deleteHoldRef.current);
    setDeleteHoldTime(0);
  };

  const getPosition = () => {
    if (!anchorRef?.current) return { left: 60, bottom: 16 };
    const rect = anchorRef.current.getBoundingClientRect();
    return { left: rect.right + 8, bottom: window.innerHeight - rect.bottom };
  };

  const pos = open ? getPosition() : {};

  const items = [
    { icon: Settings, label: 'Account settings', action: () => navigate('/settings') },
    { icon: HelpCircle, label: 'Help & support', action: () => navigate('/support') },
    { icon: Gift, label: 'Earn Tensors', action: () => setShowReferral(true) },
    { icon: Ticket, label: 'I have a code', action: () => setShowCodeModal(true) },
    { divider: true },
    { icon: LogOut, label: 'Sign out', action: () => base44.auth.logout('/') },
  ];

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] w-64 bg-card rounded-lg shadow-xl border border-border overflow-hidden"
          style={{ left: pos.left, bottom: pos.bottom }}
        >
          <div className="p-3 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: getUserColor(user) }}>
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.full_name || 'Utilisateur'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </div>

          {/* ── Playful domain actions ── */}
          <div className="p-2 border-b border-border flex flex-col gap-1.5">
            <button
              onClick={() => { setDomainModal('add'); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-white transition-transform active:scale-[0.98]"
              style={{ background: CORAL }}
            >
              <Plus className="w-4 h-4 flex-shrink-0" strokeWidth={2.4} />
              Add a website
            </button>
            <button
              onClick={() => { setDomainModal('manage'); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground bg-muted transition-colors hover:bg-accent"
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              My websites
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </button>
          </div>

          <div className="py-1">
            {items.map((item, i) =>
              item.divider ? (
                <div key={i} className="my-1 border-t border-border" />
              ) : item.isDelete ? (
                <button
                  key={i}
                  onMouseDown={handleDeleteMouseDown}
                  onMouseUp={handleDeleteMouseUp}
                  onMouseLeave={handleDeleteMouseUp}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive transition-colors hover:bg-muted relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 transition-all" style={{
                    width: `${(deleteHoldTime / 3) * 100}%`,
                    background: 'rgba(239, 68, 68, 0.1)',
                  }} />
                  <item.icon className="w-4 h-4 flex-shrink-0 relative z-10" />
                  <span className="relative z-10">Supprimer le compte {deleteHoldTime > 0 ? `(${(deleteHoldTime).toFixed(1)}s)` : ''}</span>
                </button>
                ) : (
                <button
                key={i}
                onClick={() => { item.action(); onClose(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted ${item.destructive ? 'text-destructive' : item.accent ? 'text-green-600 font-semibold' : 'text-foreground'}`}
                >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                </button>
                )
            )}
          </div>
        </motion.div>
      )}
      <DeleteAccountModal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} user={user} />
      <ReferralModal open={showReferral} onClose={() => setShowReferral(false)} user={user} />
      <ActivationCodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} />
      <DomainManagerModal open={!!domainModal} tab={domainModal || 'add'} onClose={() => setDomainModal(null)} user={user} maxDomains={maxDomains} />
    </AnimatePresence>
  );
}