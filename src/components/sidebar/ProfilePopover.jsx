import { useEffect, useRef, useState } from 'react';
import { Settings, HelpCircle, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getUserColor } from '@/lib/user-color';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePopover({ open, onClose, anchorRef, user, userInitial }) {
  const popoverRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'supprimer') return;
    try {
      await base44.entities.User.delete(user.id);
      base44.auth.logout();
    } catch {}
  };

  const items = [
    { icon: Settings, label: 'Parametres du compte', action: () => navigate('/settings') },
    { icon: HelpCircle, label: 'Aide et support', action: () => navigate('/support') },
    { divider: true },
    { icon: LogOut, label: 'Se deconnecter', action: () => base44.auth.logout(), destructive: true },
    { icon: Trash2, label: 'Supprimer le compte', isDelete: true, destructive: true, action: () => setShowDeleteModal(true) },
  ];

  return (
    <>
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] w-56 bg-card rounded-lg shadow-xl border border-border overflow-hidden"
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
          <div className="py-1">
            {items.map((item, i) =>
              item.divider ? (
                <div key={i} className="my-1 border-t border-border" />
              ) : item.isDelete ? (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive transition-colors hover:bg-muted"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              ) : (
                <button
                  key={i}
                  onClick={() => { item.action(); onClose(); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted ${item.destructive ? 'text-destructive' : 'text-foreground'}`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              )
            )}
          </div>
          </motion.div>
          )}
          </AnimatePresence>

          {/* Delete Modal */}
          <AnimatePresence>
          {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
            className="bg-card rounded-lg shadow-xl border border-border p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2 text-foreground">Supprimer votre compte ?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Cette action est irréversible. Toutes vos données seront supprimées.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='Tapez "supprimer" pour confirmer'
              className="w-full px-3 py-2 text-sm border border-border rounded mb-4 focus:outline-none"
              style={{ background: 'var(--background)' }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted rounded"
                style={{ color: 'var(--foreground)' }}>
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.toLowerCase() !== 'supprimer'}
                className="flex-1 px-4 py-2 text-sm font-bold rounded text-white disabled:opacity-40"
                style={{ background: 'hsl(var(--destructive))' }}>
                Supprimer définitivement
              </button>
            </div>
          </motion.div>
          </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}