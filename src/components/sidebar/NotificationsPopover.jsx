import { useRef, useEffect } from 'react';
import { Bell, ExternalLink, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPopover({ open, onClose, anchorRef }) {
  const popoverRef = useRef(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 20),
    enabled: open,
  });

  // Mark as seen when opened
  useEffect(() => {
    if (open) {
      localStorage.setItem('stensor_notifs_last_seen', String(Date.now()));
      qc.invalidateQueries(['notifications_unread']);
    }
  }, [open, qc]);

  useEffect(() => {
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  const getPosition = () => {
    if (!anchorRef?.current) return { left: 76, bottom: 16 };
    const rect = anchorRef.current.getBoundingClientRect();
    return { left: rect.right + 12, bottom: window.innerHeight - rect.bottom };
  };

  const handleNotifClick = (notif) => {
    onClose();
    if (notif.link) {
      if (notif.link.startsWith('http')) window.open(notif.link, '_blank');
      else navigate(notif.link);
    }
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    await base44.entities.Notification.delete(id);
    qc.invalidateQueries(['notifications']);
  };

  const pos = open ? getPosition() : {};

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, x: -10, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="fixed z-[200] w-80 rounded-2xl overflow-hidden shadow-2xl"
          style={{ left: pos.left, bottom: pos.bottom, background: '#1E0050', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.2)' }}>
              <Bell className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
            </div>
            <span className="text-sm font-bold text-white">Notifications</span>
            <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{notifications.length}</span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Aucune notification</p>
              </div>
            )}
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <button
                  onClick={() => handleNotifClick(notif)}
                  className="w-full text-left flex items-start gap-3 px-4 py-3 pr-10 transition-all"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(167,139,250,0.15)' }}>
                    <Bell className="w-4 h-4" style={{ color: '#a78bfa' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{notif.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{notif.message}</p>
                    {notif.link && (
                      <div className="flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3" style={{ color: '#a78bfa' }} />
                        <span className="text-[10px] font-medium" style={{ color: '#a78bfa' }}>{notif.link_label || 'Voir plus'}</span>
                      </div>
                    )}
                    <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {new Date(notif.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
                <button
                  onClick={(e) => deleteNotif(e, notif.id)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}