import { useRef, useEffect } from 'react';
import { Bell, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPopover({ open, onClose, anchorRef, isAdmin }) {
  const popoverRef = useRef(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 30),
    enabled: open,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (open) localStorage.setItem('stensor_notifs_last_seen', String(Date.now()));
  }, [open]);

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
    return { left: rect.right + 12, top: Math.max(rect.top - 20, 8) };
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
          className="fixed z-[200] w-80 rounded-2xl overflow-hidden flex flex-col"
          style={{
            left: pos.left,
            top: pos.top,
            maxHeight: 'calc(100vh - 32px)',
            background: '#0F0030',
            border: '1px solid rgba(167,139,250,0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}>
          <div className="px-4 py-3.5 flex items-center gap-2.5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(167,139,250,0.2))' }}>
              <Bell className="w-3.5 h-3.5" style={{ color: '#c4b5fd' }} />
            </div>
            <span className="text-sm font-bold text-white">Notifications</span>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(167,139,250,0.15)', color: '#c4b5fd' }}>
              {notifications.length}
            </span>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 && (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: '#c4b5fd' }} />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucune notification</p>
              </div>
            )}
            {notifications.map((notif, i) => (
              <motion.div key={notif.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="group relative"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => handleNotifClick(notif)}
                  className="w-full text-left flex items-start gap-3 px-4 py-3.5 transition-all"
                  style={{ paddingRight: isAdmin ? '2.5rem' : '1rem' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(167,139,250,0.15))' }}>
                    <Bell className="w-3.5 h-3.5" style={{ color: '#c4b5fd' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white leading-tight">{notif.title}</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{notif.message}</p>
                    {notif.link && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <ExternalLink className="w-2.5 h-2.5" style={{ color: '#a78bfa' }} />
                        <span className="text-[10px] font-medium" style={{ color: '#a78bfa' }}>{notif.link_label || 'Voir plus'}</span>
                      </div>
                    )}
                    <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {new Date(notif.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
                {isAdmin && (
                  <button
                    onClick={(e) => deleteNotif(e, notif.id)}
                    className="absolute top-3.5 right-3 w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                    style={{ background: 'rgba(239,68,68,0.2)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}>
                    <X className="w-3 h-3 text-red-300" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}