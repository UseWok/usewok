// Speed system: preload every lazy page chunk during browser idle time.
// After the first page paints, all other pages download in the background,
// so every navigation afterwards is instant (no more chunk fetch on click).

let started = false;

const PAGE_LOADERS = [
  () => import('@/pages/Home.jsx'),
  () => import('@/pages/WokAIPage.jsx'),
  () => import('@/pages/BrandKnowledge.jsx'),
  () => import('@/pages/GeoStrategy.jsx'),
  () => import('@/pages/SiteAuditPage'),
  () => import('@/pages/CompetitorsPage'),
  () => import('@/pages/TasksPage'),
  () => import('@/pages/AIVisibilityReport.jsx'),
  () => import('@/pages/BrandPerceptionPage'),
  () => import('@/pages/SettingsPage'),
  () => import('@/pages/PricingPage'),
  () => import('@/pages/HistoryPage'),
  () => import('@/pages/SupportPage'),
  () => import('@/pages/ManagePlanPage'),
  () => import('@/pages/SiteAuditDetail'),
  () => import('@/pages/PerformancePage.jsx'),
  () => import('@/pages/AuditPage.jsx'),
];

const PUBLIC_LOADERS = [
  () => import('@/pages/LandingPricingPage'),
  () => import('@/pages/BlogPage.jsx'),
  () => import('@/pages/BlogPostPage'),
];

export function prefetchAllPages(isAuthenticated) {
  if (started) return;
  started = true;
  const loaders = isAuthenticated ? [...PAGE_LOADERS, ...PUBLIC_LOADERS] : [...PUBLIC_LOADERS, ...PAGE_LOADERS];
  const run = () => {
    // Stagger imports so we never block the main thread or saturate the network
    loaders.forEach((load, i) => setTimeout(() => { load().catch(() => {}); }, i * 120));
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2500 });
  else setTimeout(run, 1200);
}