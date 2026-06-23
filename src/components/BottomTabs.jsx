import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, BarChart2, Settings, TrendingUp } from 'lucide-react';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';

const TABS = [
  { label: 'Home',        icon: Home,       path: '/app' },
  { label: 'Tableau',     icon: BarChart2,   path: '/ai-report' },
  { label: 'Performance', icon: TrendingUp,  path: '/performance' },
  { label: 'Settings',    icon: Settings,    path: '/settings' },
];

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());

  useEffect(() => {
    const unsub = onActiveDomainChange(d => setActiveDomainState(d));
    return unsub;
  }, []);

  const domainLabel = activeDomain?.url?.replace(/https?:\/\//, '').split('/')[0];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(248,247,244,0.96)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(0,0,0,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {/* Active domain pill */}
      {activeDomain && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 6, paddingBottom: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: 'rgba(0,0,0,0.06)' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#555', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {domainLabel}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'stretch', height: activeDomain ? 52 : 60 }}>
        {TABS.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path || (path !== '/app' && location.pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => navigate(path, { replace: false })}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3,
                border: 'none', background: 'transparent', cursor: 'pointer',
                minHeight: 44, padding: '4px 4px 0', fontFamily: 'Inter, sans-serif',
                userSelect: 'none', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.7}
                color={active ? '#7C3AED' : '#9CA3AF'}
              />
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 400,
                color: active ? '#7C3AED' : '#9CA3AF',
                letterSpacing: '-0.01em',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}