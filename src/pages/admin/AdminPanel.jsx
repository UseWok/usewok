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
import DashboardHome from '@/pages/admin/DashboardHome';

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (!currentUser || currentUser.role !== 'admin') {
          navigate('/chat', { replace: true });
          return;
        }
        
        setIsAuthorized(true);
      } catch (error) {
        navigate('/chat', { replace: true });
      }
    };

    checkAccess();
  }, [navigate]);

  // Show nothing while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  // Should not render if not authorized (redirect happens in useEffect)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex w-screen h-screen bg-white font-sans">
      <AdminSidebar user={user} />
      
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/users" replace />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/roles" element={<UserRolesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/subscriptions/plans" element={<PlansPage />} />
          <Route path="/codes" element={<CodesPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}