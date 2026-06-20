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

import Home from './pages/Home';

import AllProjects from './pages/AllProjects';

import ChatPage from './pages/ChatPage';

import PricingPage from './pages/PricingPage';

import AdminProducts from './pages/admin/AdminProducts';

import CheckoutPage from './pages/CheckoutPage';

import SettingsPage from './pages/SettingsPage';

import SupportPage from './pages/SupportPage';

import ManagePlanPage from './pages/ManagePlanPage';

import LandingPage from './pages/LandingPage';

import LandingPricingPage from './pages/LandingPricingPage';

import LandingFeaturesPage from './pages/LandingFeaturesPage';

import DiscussionsPage from './pages/DiscussionsPage';

import AIControlTower from './pages/AIControlTower';

import TermsOfServicePage from './pages/TermsOfServicePage';

import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

import PublicFiche from './pages/PublicFiche';

import BlogPage from './pages/BlogPage';

import BlogPostPage from './pages/BlogPostPage';

import AdminBlog from './pages/admin/AdminBlog';
import CockpitPage from './pages/CockpitPage';
import AIVisibilityReport from './pages/AIVisibilityReport';

import AdminDashboard from './pages/admin/AdminDashboard';
import WorkspaceSettings from './pages/WorkspaceSettings';
import AdminPanel from './pages/admin/AdminPanel';
import UIShowcase from './pages/UIShowcase';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import SEOHead from './components/SEOHead';
import GlobalNotifications from './components/GlobalNotifications';
import BuildToast from './components/chat/BuildToast';



function ScrollToTop() {

  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return null;

}


const AuthenticatedApp = () => {

  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();


  if (isLoadingPublicSettings || isLoadingAuth) {

    return (

      <div className="fixed inset-0 flex items-center justify-center">

        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>

      </div>

    );

  }


  // Not authenticated (no token or auth error) → show public landing routes

  if (!isAuthenticated && (!authError || authError.type === 'auth_required')) {

    return (

      <>

        <ScrollToTop />

        <SEOHead />

        <Routes>

          <Route path="/" element={<LandingPage />} />

          <Route path="/tarifs" element={<LandingPricingPage />} />

          <Route path="/fonctionnalites" element={<LandingFeaturesPage />} />

          <Route path="/privacy" element={<PrivacyPolicyPage />} />

          <Route path="/terms" element={<TermsOfServicePage />} />

          <Route path="/p/:id" element={<PublicFiche />} />

          <Route path="/blog" element={<BlogPage />} />

          <Route path="/blog/:slug" element={<BlogPostPage />} />

          <Route path="/ui-showcase" element={<UIShowcase />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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
      {/* BuildToast global — suit l'utilisateur sur toutes les pages */}
      <BuildToast />

      <Routes>

        <Route path="/" element={<Navigate to="/app" replace />} />

        <Route path="/chat" element={<ChatPage />} />
        <Route path="/ui-showcase" element={<UIShowcase />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        <Route path="/p/:id" element={<PublicFiche />} />

        <Route path="/blog" element={<BlogPage />} />

        <Route path="/blog/:slug" element={<BlogPostPage />} />

        <Route path="/admin/*" element={<AdminPanel />} />
        {/* GlobalNotifications needs user — rendered at root level */}

        <Route element={<Layout />}>

          <Route path="/app" element={<Home />} />

          <Route path="/projects" element={<AllProjects />} />

          <Route path="/pricing" element={<PricingPage />} />

          <Route path="/admin/products" element={<AdminProducts />} />

          <Route path="/checkout" element={<CheckoutPage />} />

          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/support" element={<SupportPage />} />

          <Route path="/manage-plan" element={<ManagePlanPage />} />

          <Route path="/discussions" element={<DiscussionsPage />} />
          <Route path="/cockpit" element={<CockpitPage />} />
          <Route path="/ai-report" element={<AIVisibilityReport />} />
          <Route path="/workspace-settings" element={<WorkspaceSettings />} />


          <Route path="/ai-dna" element={<AIControlTower />} />

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