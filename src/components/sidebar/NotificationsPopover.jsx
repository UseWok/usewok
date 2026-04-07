import { useRef, useEffect } from 'react';
import { Bell, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';

const PURPLE = '#3A0088';

export default function NotificationsPopover({ open, onClose, anchorRef, isAdmin }) {
  const popoverRef = useRef(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useLanguage();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 30),
    enabled: open,
    refetchOnWindowFocus: false,
    refetchInterval: open ? 10000 : false,
  });

  useEffect(() => {
    if (open) {
      localStorage.setItem('stensor_notifs_last_seen', String(Date.now()));
      qc.invalidateQueries(['notifications']);
    }
  }, [open]);

  useEffect(() => {
    const h = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose, anchorRef]);

  const getPosition = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const w = Math.min(340, window.innerWidth - 24);
      const maxH = Math.min(460, window.innerHeight - 80);
      return { left: (window.innerWidth - w) / 2, top: Math.max(60, (window.innerHeight - maxH) / 2), width: w, maxH };
    }
    if (!anchorRef?.current) return { left: 76, top: 200 };
    const rect = anchorRef.current.getBoundingClientRect();
    const popW = 300;
    let left = rect.right + 12;
    if (left + popW > window.innerWidth - 8) left = Math.max(8, window.innerWidth - popW - 8);
    const maxH = Math.min(460, window.innerHeight - 32);
    let top = rect.top;
    if (top + maxH > window.innerHeight - 8) top = window.innerHeight - maxH - 8;
    if (top < 8) top = 8;
    return { left, top, maxH };
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
          transition={{ duration: 0.15 }}
          className="fixed z-[200] flex flex-col"
          style={{
            left: pos.left, top: pos.top,
            width: pos.width ? `${pos.width}px` : '300px',
            maxHeight: `${pos.maxH || 460}px`,
            background: 'white',
            border: '1px solid rgba(0,0,0,0.09)',
            borderRadius: '6px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
          }}>
          <div className="px-4 py-3.5 flex items-center gap-2.5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="w-7 h-7 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '3px' }}>
              <Bell className="w-3.5 h-3.5" style={{ color: '#333' }} />
            </div>
            <span className="text-sm font-bold flex-1" style={{ color: '#0A0A0A' }}>{t('notifications')}</span>
            <span className="text-[10px] font-bold px-2 py-0.5"
              style={{ background: 'rgba(0,0,0,0.06)', color: '#555', borderRadius: '2px' }}>
              {notifications.length}
            </span>
            <button onClick={onClose}
              className="w-6 h-6 flex items-center justify-center hover:bg-black/5 transition-colors"
              style={{ borderRadius: '3px' }}>
              <X className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 && (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-10" style={{ color: '#333' }} />
                <p className="text-sm" style={{ color: '#bbb' }}>{t('no_notifications')}</p>
              </div>
            )}
            {notifications.map((notif, i) => (
              <motion.div key={notif.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="group relative"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <button
                  onClick={() => handleNotifClick(notif)}
                  className="w-full text-left flex items-start gap-3 px-4 py-3 transition-all"
                  style={{ paddingRight: isAdmin ? '2.5rem' : '1rem' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '3px' }}>
                    <Bell className="w-3 h-3" style={{ color: '#555' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight" style={{ color: '#0A0A0A' }}>{notif.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#777' }}>{notif.message}</p>
                    {notif.link && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <ExternalLink className="w-2.5 h-2.5" style={{ color: '#0A0A0A' }} />
                        <span className="text-[10px] font-semibold" style={{ color: '#0A0A0A' }}>{notif.link_label || 'See more'}</span>
                      </div>
                    )}
                    <p className="text-[10px] mt-1" style={{ color: '#ccc' }}>
                      {new Date(notif.created_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
                {isAdmin && (
                  <button
                    onClick={(e) => deleteNotif(e, notif.id)}
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: 'rgba(239,68,68,0.08)', borderRadius: '3px' }}>
                    <X className="w-3 h-3 text-red-400" />
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