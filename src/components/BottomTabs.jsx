import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, Settings, TrendingUp } from 'lucide-react';

const TABS = [
  { label: 'Home',        icon: Home,       path: '/app' },
  { label: 'Report',      icon: BarChart2,   path: '/ai-report' },
  { label: 'Performance', icon: TrendingUp,  path: '/performance' },
  { label: 'Settings',    icon: Settings,    path: '/settings' },
];

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(248,247,244,0.96)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom)',
      height: 'calc(60px + env(safe-area-inset-bottom))',
    }}>
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
              minHeight: 44, padding: '6px 4px 0', fontFamily: 'Inter, sans-serif',
              userSelect: 'none', WebkitTapHighlightColor: 'transparent',
              transition: 'opacity 120ms',
            }}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.2 : 1.7}
              color={active ? '#7C3AED' : '#9CA3AF'}
            />
            <span style={{
              fontSize: 12, fontWeight: active ? 700 : 400,
              color: active ? '#7C3AED' : '#9CA3AF',
              letterSpacing: '-0.01em',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}