import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Tag, FileText, MessageSquare, BarChart2, Inbox, BookOpen, LogOut, Package, Settings2, Mail, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';

const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';
const BG = '#F8F7F4';
const BORDER = 'rgba(21,19,15,0.09)';
const INK = '#1A1A1A';
const INK2 = '#6B6660';
const CORAL = '#FF5A1F';

const navItems = [
  { label: 'Vue d\'ensemble', path: '/admin/overview',      icon: LayoutDashboard },
  { label: 'Inbox',           path: '/admin/inbox',         icon: Inbox,   badge: true },
  { label: 'Utilisateurs',    path: '/admin/users',         icon: Users },
  { label: 'Abonnements',     path: '/admin/subscriptions', icon: CreditCard },
  { label: 'Forfaits',        path: '/admin/subscriptions/plans', icon: Package },
  { label: 'Codes d\'accès',  path: '/admin/codes',         icon: Tag },
  { label: 'Messagerie',      path: '/admin/messaging',     icon: MessageSquare, badge: true },
  { label: 'Feedback',        path: '/admin/feedback',      icon: Star },
  { label: 'Avis clients',    path: '/admin/testimonials',  icon: Star },
  { label: 'Blog',            path: '/admin/blog',          icon: BookOpen },
  { label: 'Analytics',       path: '/admin/analytics',     icon: BarChart2 },
  { label: 'Logs',            path: '/admin/logs',          icon: FileText },
  { label: 'Paramètres plans', path: '/admin/plan-settings', icon: Settings2 },
  { label: 'Test emails',      path: '/admin/email-test',    icon: Mail },
];

export default function AdminSidebar({ user, unreadCount = 0 }) {
  const location = useLocation();
  const initials = (user?.full_name || user?.email || '?').slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: BG,
      borderRight: `1px solid ${BORDER}`, height: '100vh',
      display: 'flex', flexDirection: 'column', fontFamily: F,
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="UseWok" style={{ width: 26, height: 'auto' }} />
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>UseWok</p>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: CORAL, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {navItems.map(({ label, path, icon: Icon, badge }) => {
          const isActive = location.pathname === path || (path !== '/admin/overview' && location.pathname.startsWith(path));
          const showBadge = badge && unreadCount > 0;
          return (
            <Link key={path} to={path} style={{ textDecoration: 'none', display: 'block', marginBottom: 1 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 11px', borderRadius: 8,
                background: isActive ? INK : 'transparent',
                color: isActive ? '#fff' : INK2,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                transition: 'all 120ms', position: 'relative',
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(21,19,15,0.06)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={14} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {showBadge && (
                  <span style={{ background: CORAL, color: '#fff', borderRadius: 999, fontSize: 9.5, fontWeight: 700, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer user */}
      <div style={{ padding: '12px 14px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: getUserColor(user), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: INK, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'Admin'}</p>
            <p style={{ fontSize: 10.5, color: INK2, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
          </div>
        </div>
        <button onClick={() => base44.auth.logout('/')} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: INK2, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', width: '100%', fontFamily: F }}
          onMouseEnter={e => e.currentTarget.style.color = INK}
          onMouseLeave={e => e.currentTarget.style.color = INK2}>
          <LogOut size={13} /> Se déconnecter
        </button>
      </div>
    </aside>
  );
}