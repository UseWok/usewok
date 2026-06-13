import { Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, CreditCard, Tag, FileText, Settings, MessageSquare, BarChart2, Flag, Inbox } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';

const navItems = [
  { label: 'Overview',     path: '/admin/overview',       icon: LayoutDashboard },
  { label: 'Inbox',        path: '/admin/inbox',          icon: Inbox,         badge: true },
  { label: 'Users',        path: '/admin/users',          icon: Users },
  { label: 'Subscriptions',path: '/admin/subscriptions',  icon: CreditCard },
  { label: 'Plans',        path: '/admin/subscriptions/plans', icon: Tag },
  { label: 'Access Codes', path: '/admin/codes',          icon: Tag },
  { label: 'Messaging',    path: '/admin/messaging',      icon: MessageSquare, badge: true },
  { label: 'Analytics',    path: '/admin/analytics',      icon: BarChart2 },
  { label: 'Feature Flags',path: '/admin/flags',          icon: Flag },
  { label: 'Logs',         path: '/admin/logs',           icon: FileText },
  { label: 'Settings',     path: '/admin/settings',       icon: Settings },
];

export default function AdminSidebar({ user, unreadCount = 0 }) {
  const location = useLocation();

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#111', borderRight: '1px solid #1E1E1E', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1E1E1E' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>W</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>WOK Admin</span>
        </div>
        <span style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Super Dashboard</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== '/admin/overview' && location.pathname.startsWith(path));
          return (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8, marginBottom: 2,
                background: isActive ? '#F95738' : 'transparent',
                color: isActive ? '#fff' : '#888',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', transition: 'background 120ms',
                position: 'relative',
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#1A1A1A'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={15} />
                {label}
                {label === 'Messaging' && unreadCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#E8184A', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                    {unreadCount}
                  </span>
                )}
                {label === 'Inbox' && unreadCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#E8184A', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #1E1E1E' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: getUserColor(user), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {userInitial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'Admin'}</p>
            <p style={{ fontSize: 11, color: '#555', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
          </div>
        </div>
        <button onClick={() => base44.auth.logout('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', width: '100%' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#888'}>
          <LogOut size={14} /> Log out
        </button>
      </div>
    </aside>
  );
}