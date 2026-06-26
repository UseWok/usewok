import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import UsersPage from '@/pages/admin/UsersPage';
import UserRolesPage from '@/pages/admin/UserRolesPage';
import SubscriptionsPage from '@/pages/admin/SubscriptionsPage';
import PlansPage from '@/pages/admin/PlansPage';
import CodesPage from '@/pages/admin/CodesPage';
import LogsPage from '@/pages/admin/LogsPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage';
import AdminMessagingPage from '@/pages/admin/AdminMessagingPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminFeatureFlagsPage from '@/pages/admin/AdminFeatureFlagsPage';
import AdminInboxPage from '@/pages/admin/AdminInboxPage';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null);

  // Block all admin pages from search engine indexing
  useEffect(() => {
    let tag = document.querySelector('meta[name="robots"][data-internal]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'robots');
      tag.setAttribute('data-internal', 'true');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', 'noindex, nofollow');
    return () => { if (tag) tag.setAttribute('content', 'index, follow'); };
  }, []);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (!currentUser || currentUser.role !== 'admin') { navigate('/app', { replace: true }); return; }
        setIsAuthorized(true);
        // Count unread messages from users
        const msgs = await base44.entities.AdminMessage.filter({ is_from_admin: false, read: false });
        setUnreadCount(msgs.length);
      } catch { navigate('/app', { replace: true }); }
    };
    checkAccess();
  }, [navigate]);

  if (isAuthorized === null) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #333', borderTopColor: '#F95738', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!isAuthorized) return null;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#0D0D0D', fontFamily: 'Inter, sans-serif' }}>
      <AdminSidebar user={user} unreadCount={unreadCount} />
      <main style={{ flex: 1, overflowY: 'auto', background: '#0D0D0D', position: 'relative' }}>
        {/* Back to app button */}
        <div style={{ position: 'absolute', top: 14, right: 16, zIndex: 50 }}>
          <button
            onClick={() => navigate('/app')}
            style={{
              padding: '6px 14px', borderRadius: 7, border: '1px solid #2A2A2A',
              background: '#1A1A1A', color: '#888', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              transition: 'border-color 120ms, color 120ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#ccc'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#888'; }}
          >
            ← App
          </button>
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/overview" element={<AdminOverviewPage />} />
          <Route path="/inbox" element={<AdminInboxPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/roles" element={<UserRolesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/subscriptions/plans" element={<PlansPage />} />
          <Route path="/codes" element={<CodesPage />} />
          <Route path="/messaging" element={<AdminMessagingPage />} />
          <Route path="/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/flags" element={<AdminFeatureFlagsPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}