import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar.jsx';
import UsersPage from '@/pages/admin/UsersPage.jsx';
import UserRolesPage from '@/pages/admin/UserRolesPage';
import SubscriptionsPage from '@/pages/admin/SubscriptionsPage';
import PlansPage from '@/pages/admin/PlansPage';
import CodesPage from '@/pages/admin/CodesPage';
import LogsPage from '@/pages/admin/LogsPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage.jsx';
import AdminMessagingPage from '@/pages/admin/AdminMessagingPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminFeatureFlagsPage from '@/pages/admin/AdminFeatureFlagsPage';
import AdminInboxPage from '@/pages/admin/AdminInboxPage';
import AdminBlog from '@/pages/admin/AdminBlog.jsx';
import AdminPlanSettingsPage from '@/pages/admin/AdminPlanSettingsPage.jsx';
import AdminEmailTestPage from '@/pages/admin/AdminEmailTestPage.jsx';
import AdminFeedbackPage from '@/pages/admin/AdminFeedbackPage.jsx';
import AdminTestimonialsPage from '@/pages/admin/AdminTestimonialsPage.jsx';

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
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7F4' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(21,19,15,0.12)', borderTopColor: '#FF5A1F', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!isAuthorized) return null;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#F8F7F4', fontFamily: '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif' }}>
      <AdminSidebar user={user} unreadCount={unreadCount} />
      <main style={{ flex: 1, overflowY: 'auto', background: '#F8F7F4', position: 'relative', display: 'flex', flexDirection: 'column' }}>
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
          <Route path="/blog" element={<AdminBlog />} />
          <Route path="/plan-settings" element={<AdminPlanSettingsPage />} />
          <Route path="/email-test" element={<AdminEmailTestPage />} />
          <Route path="/feedback" element={<AdminFeedbackPage />} />
          <Route path="/testimonials" element={<AdminTestimonialsPage />} />
        </Routes>
      </main>
    </div>
  );
}