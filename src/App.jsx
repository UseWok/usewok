import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { appParams } from '@/lib/app-params';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/i18n';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SEOHead from './components/SEOHead';
import GlobalNotifications from './components/GlobalNotifications';
import BuildToast from './components/chat/BuildToast';
import AppSkeleton from './components/ui/AppSkeleton';
import { prefetchAllPages } from '@/lib/prefetch';

// ── Lazy-loaded pages (code-split for faster initial load) ──
const Home = lazy(() => import('./pages/Home.jsx'));
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'));
const AllProjects = lazy(() => import('./pages/AllProjects'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const ManagePlanPage = lazy(() => import('./pages/ManagePlanPage'));
const LandingPricingPage = lazy(() => import('./pages/LandingPricingPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const LegalNoticePage = lazy(() => import('./pages/LegalNoticePage'));
const PublicFiche = lazy(() => import('./pages/PublicFiche'));
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));
const UnsubscribePage = lazy(() => import('./pages/UnsubscribePage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog.jsx'));
const AIVisibilityReport = lazy(() => import('./pages/AIVisibilityReport.jsx'));
const WokAIPage = lazy(() => import('./pages/WokAIPage.jsx'));
const PerformancePage = lazy(() => import('./pages/PerformancePage.jsx'));
const BrandKnowledge = lazy(() => import('./pages/BrandKnowledge.jsx'));
const GeoStrategy = lazy(() => import('./pages/GeoStrategy.jsx'));
const AuditPage = lazy(() => import('./pages/AuditPage.jsx'));
const ConnectionsPage = lazy(() => import('./pages/ConnectionsPage'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const UIShowcase = lazy(() => import('./pages/UIShowcase'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SiteAuditPage = lazy(() => import('./pages/SiteAuditPage'));
const SiteAuditDetail = lazy(() => import('./pages/SiteAuditDetail'));
const CompetitorsPage = lazy(() => import('./pages/CompetitorsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const BrandPerceptionPage = lazy(() => import('./pages/BrandPerceptionPage'));
const ForAgenciesPage = lazy(() => import('./pages/ForAgenciesPage'));
const ForEcommercePage = lazy(() => import('./pages/ForEcommercePage'));

const PageLoader = () => <AppSkeleton />;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const PUBLIC_PATHS = ['/', '/welcome', '/start', '/login', '/register', '/forgot-password', '/reset-password', '/pricing', '/privacy', '/terms', '/legal', '/blog', '/about', '/contact', '/unsubscribe'];

const isPublicPath = (pathname) =>
  PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/blog/') || pathname.startsWith('/p/');

const AuthenticatedApp = () => {
  const { pathname } = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();

  // Speed system: preload all page chunks in the background after first paint
  useEffect(() => {
    if (!isLoadingAuth) prefetchAllPages(isAuthenticated);
  }, [isLoadingAuth, isAuthenticated]);

  // Performance: visitors without a token on public routes get instant rendering
  // — no need to wait for the auth/settings API call that 99% of visitors don't need.
  const hasToken = !!appParams.token;
  const isPublic = isPublicPath(pathname);

  if ((isLoadingPublicSettings || isLoadingAuth) && (hasToken || !isPublic)) {
    return <AppSkeleton />;
  }

  // Not authenticated → show public landing routes + auth pages
  if (!isAuthenticated && (!authError || authError.type === 'auth_required')) {
    return (
      <>
        <ScrollToTop />
        <SEOHead />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/welcome" element={<ForAgenciesPage />} />
            <Route path="/start" element={<ForEcommercePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<LandingPricingPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/legal" element={<LegalNoticePage />} />
            <Route path="/p/:id" element={<PublicFiche />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/unsubscribe" element={<UnsubscribePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Suspense>
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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/welcome" element={<ForAgenciesPage />} />
          <Route path="/start" element={<ForEcommercePage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/p/:id" element={<PublicFiche />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/*" element={<AdminPanel />} />

          <Route element={<Layout />}>
            <Route path="/app" element={<Home />} />
            <Route path="/dashboard" element={<Navigate to="/app" replace />} />
            <Route path="/brand-knowledge" element={<BrandKnowledge />} />
            <Route path="/geo-strategy" element={<GeoStrategy />} />
            <Route path="/projects" element={<AllProjects />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/manage-plan" element={<ManagePlanPage />} />
            <Route path="/ai-report" element={<AIVisibilityReport />} />
            <Route path="/wok-ai" element={<WokAIPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/site-audit" element={<SiteAuditPage />} />
            <Route path="/site-audit/:id" element={<SiteAuditDetail />} />
            <Route path="/competitors" element={<CompetitorsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/brand-image" element={<BrandPerceptionPage kind="brand" />} />
            <Route path="/recommendations" element={<BrandPerceptionPage kind="reco" />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </Suspense>
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