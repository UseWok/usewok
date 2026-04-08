import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/i18n';
import Layout from './components/Layout';
import { Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AllProjects from './pages/AllProjects';
import ChatPage from './pages/ChatPage';
import PricingPage from './pages/PricingPage';
import AdminProducts from './pages/admin/AdminProducts';
import CheckoutPage from './pages/CheckoutPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import ManagePlanPage from './pages/ManagePlanPage';
import Community from './pages/Community';
import LandingPage from './pages/LandingPage';
import LandingPricingPage from './pages/LandingPricingPage';
import LandingFeaturesPage from './pages/LandingFeaturesPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Show landing page for unauthenticated users
      return (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tarifs" element={<LandingPricingPage />} />
          <Route path="/fonctionnalites" element={<LandingFeaturesPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      );
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route element={<Layout />}>
        <Route path="/app" element={<Home />} />
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/manage-plan" element={<ManagePlanPage />} />
        <Route path="/community" element={<Community />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
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
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App