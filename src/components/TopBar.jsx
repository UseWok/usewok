import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';

const AV_COLORS = ['#7C3AED', '#F95738', '#3B8BEB', '#10B981', '#E8184A', '#D97706'];
function avatarBg(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}

function timeAgo(dateStr) {
  const d = new Date(dateStr).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const READ_KEY = 'wok_read_notif_ids';
function getReadIds() {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); } catch { return new Set(); }
}
function saveReadIds(set) {
  try { localStorage.setItem(READ_KEY, JSON.stringify([...set])); } catch {}
}

export default function TopBar({ user }) {
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [readIds, setReadIds] = useState(getReadIds);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const items = [];
    try {
      const platform = await base44.entities.Notification.list('-created_date', 15);
      platform.forEach(n => items.push({
        id: n.id, title: n.title, message: n.message || n.description || '',
        created: n.created_date, link: n.link, kind: 'system',
      }));
    } catch {}
    try {
      const msgs = await base44.entities.AdminMessage.filter({ to_user_id: user.id, is_from_admin: true }, '-created_date', 15);
      msgs.forEach(m => items.push({
        id: `admsg_${m.id}`, title: m.subject || 'Update from UseWok',
        message: m.body?.slice(0, 160) || '', created: m.created_date, link: '/support', kind: 'admin',
      }));
    } catch {}
    items.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    setNotifs(items);
  }, [user?.id]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const unreadCount = notifs.filter(n => !readIds.has(n.id)).length;

  const openNotifs = () => {
    setShowNotifs(v => {
      const next = !v;
      if (next) {
        // mark all as read when opening
        const all = new Set(readIds);
        notifs.forEach(n => all.add(n.id));
        setReadIds(all);
        saveReadIds(all);
      }
      return next;
    });
    setShowProfile(false);
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const initial = (user?.full_name || user?.email || 'U').trim().charAt(0).toUpperCase();
  const avBg = avatarBg(user?.email || user?.full_name || 'U');

  return (
    <div style={{ position: 'absolute', top: 14, right: 18, zIndex: 200, display: 'flex', alignItems: 'center', gap: 14, fontFamily: F }}>

      {/* Bell */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button onClick={openNotifs}
          style={{ width: 34, height: 34, borderRadius: 9, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Bell size={19} color={INK} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: 5, right: 5, minWidth: 15, height: 15, padding: '0 3px', borderRadius: 8, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #F7F5F0' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.14 }}
              style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 380, maxHeight: 460, background: '#fff', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.14)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>Notifications</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {notifs.length === 0 ? (
                  <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '40px 20px' }}>No notifications yet.</p>
                ) : notifs.map(n => (
                  <div key={n.id} onClick={() => { if (n.link) navigate(n.link); setShowNotifs(false); }}
                    style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, cursor: n.link ? 'pointer' : 'default', display: 'flex', gap: 10 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAF9F6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.kind === 'admin' ? '#E8184A' : '#3B8BEB', flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 3px', lineHeight: 1.3 }}>{n.title}</p>
                      {n.message && <p style={{ fontSize: 13, color: INK3, margin: '0 0 5px', lineHeight: 1.5 }}>{n.message}</p>}
                      <p style={{ fontSize: 11.5, color: '#C4C0BA', margin: 0 }}>{timeAgo(n.created)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile avatar */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <button onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
          style={{ width: 38, height: 38, borderRadius: '50%', background: avBg, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {initial}
        </button>

        <AnimatePresence>
          {showProfile && (
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.14 }}
              style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 220, background: '#fff', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.14)', overflow: 'hidden', padding: '8px' }}>
              <p style={{ fontSize: 13, color: INK3, margin: 0, padding: '10px 12px 12px' }}>{user?.email || ''}</p>
              <button onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: 'transparent', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: INK, fontFamily: F, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAF9F6'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <LogOut size={17} color={INK} strokeWidth={1.9} /> Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}