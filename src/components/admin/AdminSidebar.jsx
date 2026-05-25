import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const navSections = [
  {
    label: 'Utilisateurs',
    items: [
      { label: 'Utilisateurs', path: '/admin/users' },
      { label: 'Rôles', path: '/admin/users/roles' },
    ]
  },
  {
    label: 'Abonnements',
    items: [
      { label: 'Abonnements', path: '/admin/subscriptions' },
      { label: 'Plans', path: '/admin/subscriptions/plans' },
    ]
  },
  {
    label: 'Codes',
    items: [
      { label: 'Codes d\'accès', path: '/admin/codes' },
    ]
  },
  {
    label: 'Système',
    items: [
      { label: 'Logs', path: '/admin/logs' },
      { label: 'Paramètres', path: '/admin/settings' },
    ]
  },
];

export default function AdminSidebar({ user }) {
  const location = useLocation();

  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <aside className="w-[240px] flex flex-col flex-shrink-0 bg-white border-r border-[#E5E5E5] h-screen">
      {/* Logo & Header */}
      <div className="px-5 py-5 border-b border-[#E5E5E5]">
        <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain mb-3" />
        <p className="text-[11px] uppercase tracking-widest text-[#888888] font-medium">
          Administration
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="text-[11px] uppercase tracking-widest text-[#888888] font-medium px-5 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <div
                      className={`px-5 py-2 text-[13px] cursor-pointer transition-all border-l-2 ${
                        isActive
                          ? 'border-[#1A1A1A] text-[#1A1A1A] font-medium'
                          : 'border-transparent text-[#444444] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-5 py-4 border-t border-[#E5E5E5]">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
            style={{ backgroundColor: getUserColor(user) }}
          >
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-[#1A1A1A] truncate">
              {user?.full_name || 'Admin'}
            </p>
            <p className="text-[11px] text-[#888888] truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#444444] hover:text-[#1A1A1A] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}