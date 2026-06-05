import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Bell, AlertTriangle } from 'lucide-react';

// Poll interval in ms
const POLL_INTERVAL = 15000;

function NotifToast({ notif, onClose }) {
  const icons = { message: MessageSquare, system: Bell, alert: AlertTriangle };
  const colors = { message: '#3B8BEB', system: '#7B4FE0', alert: '#E8184A' };
  const type = notif.type || 'system';
  const Icon = icons[type] || Bell;
  const color = colors[type] || '#7B4FE0';

  return (
    <motion.div
      initial={{ opacity: 0, x: 48, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.9 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      style={{
        width: 320, background: '#1A1A1A', border: `1px solid ${color}44`,
        borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12,
        fontFamily: 'Inter, sans-serif', cursor: 'default',
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${color}22`,
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>{notif.title}</p>
        <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0', lineHeight: 1.4 }}>{notif.message}</p>
        {notif.link && (
          <a href={notif.link} style={{ fontSize: 12, color: color, textDecoration: 'none', display: 'inline-block', marginTop: 6, fontWeight: 600 }}>
            {notif.link_label || 'View →'}
          </a>
        )}
      </div>
      <button onClick={onClose} style={{ width: 22, height: 22, borderRadius: 6, background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <X size={11} color="#555" />
      </button>
    </motion.div>
  );
}

export default function GlobalNotifications({ user }) {
  const [queue, setQueue] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('wok_dismissed_notifs') || '[]')); } catch { return new Set(); }
  });

  const dismiss = useCallback((id) => {
    setQueue(prev => prev.filter(n => n._queueId !== id));
    const d = new Set(dismissed);
    d.add(id);
    setDismissed(d);
    localStorage.setItem('wok_dismissed_notifs', JSON.stringify([...d]));
  }, [dismissed]);

  // Poll platform Notifications entity
  const poll = useCallback(async () => {
    if (!user) return;
    try {
      const notifs = await base44.entities.Notification.list('-created_date', 10);
      const fresh = notifs.filter(n => !dismissed.has(n.id));
      if (fresh.length > 0) {
        setQueue(prev => {
          const existingIds = new Set(prev.map(p => p._queueId));
          const newOnes = fresh.filter(n => !existingIds.has(n.id)).map(n => ({ ...n, _queueId: n.id }));
          return [...prev, ...newOnes];
        });
      }
    } catch {}

    // Also poll for unread admin messages for this user
    if (user) {
      try {
        const msgs = await base44.entities.AdminMessage.filter({ to_user_id: user.id, read: false, is_from_admin: true });
        const unreadKey = `admsg_${user.id}_unread`;
        const lastCount = parseInt(localStorage.getItem(unreadKey) || '0', 10);
        if (msgs.length > lastCount) {
          const newMsgs = msgs.slice(0, msgs.length - lastCount);
          for (const m of newMsgs) {
            const queueId = `admsg_${m.id}`;
            if (!dismissed.has(queueId)) {
              setQueue(prev => [...prev, {
                _queueId: queueId, id: queueId,
                title: 'New message from WOK team',
                message: m.body?.slice(0, 100) || '',
                type: 'message',
                link: '/support',
                link_label: 'Read message →',
              }]);
            }
          }
          localStorage.setItem(unreadKey, String(msgs.length));
          // Mark as read
          msgs.forEach(m => base44.entities.AdminMessage.update(m.id, { read: true }).catch(() => {}));
        } else {
          localStorage.setItem(unreadKey, String(msgs.length));
        }
      } catch {}
    }
  }, [user, dismissed]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [poll]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (queue.length === 0) return;
    const timer = setTimeout(() => {
      setQueue(prev => {
        if (prev.length === 0) return prev;
        const [first, ...rest] = prev;
        dismiss(first._queueId);
        return rest;
      });
    }, 8000);
    return () => clearTimeout(timer);
  }, [queue.length]);

  if (queue.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      <AnimatePresence>
        {queue.slice(0, 3).map((notif) => (
          <div key={notif._queueId} style={{ pointerEvents: 'auto' }}>
            <NotifToast notif={notif} onClose={() => dismiss(notif._queueId)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}