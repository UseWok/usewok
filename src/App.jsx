import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/i18n';
import Layout from './components/Layout';
import Home from './pages/Home.jsx';
import AllProjects from './pages/AllProjects';
import ChatPage from './pages/ChatPage';
import PricingPage from './pages/PricingPage';
import AdminProducts from './pages/admin/AdminProducts';
import CheckoutPage from './pages/CheckoutPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import ManagePlanPage from './pages/ManagePlanPage';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPricingPage from './pages/LandingPricingPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LegalNoticePage from './pages/LegalNoticePage';
import PublicFiche from './pages/PublicFiche';
import BlogPage from './pages/BlogPage.jsx';
import BlogPostPage from './pages/BlogPostPage';
import AdminBlog from './pages/admin/AdminBlog.jsx';
import AIVisibilityReport from './pages/AIVisibilityReport.jsx';
import WokAIPage from './pages/WokAIPage.jsx';
import PerformancePage from './pages/PerformancePage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import ConnectionsPage from './pages/ConnectionsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPanel from './pages/admin/AdminPanel';
import UIShowcase from './pages/UIShowcase';
import SEOHead from './components/SEOHead';
import GlobalNotifications from './components/GlobalNotifications';
import BuildToast from './components/chat/BuildToast';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated → show public landing routes + auth pages
  if (!isAuthenticated && (!authError || authError.type === 'auth_required')) {
    return (
      <>
        <ScrollToTop />
        <SEOHead />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/tarifs" element={<LandingPricingPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/legal" element={<LegalNoticePage />} />
          <Route path="/p/:id" element={<PublicFiche />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <>
      <ScrollToTop />
      <BuildToast />
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/p/:id" element={<PublicFiche />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/admin/*" element={<AdminPanel />} />

        <Route element={<Layout />}>
          <Route path="/app" element={<Home />} />
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/manage-plan" element={<ManagePlanPage />} />
          <Route path="/ai-report" element={<AIVisibilityReport />} />
          <Route path="/wok-ai" element={<WokAIPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <GlobalNotifications user={null} />
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App