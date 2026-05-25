import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Activity, Settings, ChevronRight,
  TrendingUp, Shield, Zap, CreditCard, Inbox, Ticket
} from 'lucide-react';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminActivity from '@/components/admin/AdminActivity';
import AdminPlans from '@/components/admin/AdminPlans';
import AdminLeads from '@/components/admin/AdminLeads';
import AccessCodesTab from '@/components/admin/AccessCodesTab';
import SupportPage from '@/pages/SupportPage';

const NAV = [
  { label: 'Overview',     path: '/admin',           icon: LayoutDashboard },
  { label: 'Users',        path: '/admin/users',      icon: Users           },
  { label: 'Activity',     path: '/admin/activity',   icon: Activity        },
  { label: 'Plans',        path: '/admin/plans',      icon: CreditCard      },
  { label: 'Codes',        path: '/admin/codes',      icon: Ticket          },
  { label: 'Leads',        path: '/admin/leads',      icon: Inbox           },
  { label: 'Support',      path: '/admin/support',    icon: Shield          },
];

export default function AdminDashboard() {
  const location = useLocation();
  const [sideOpen, setSideOpen] = useState(true);

  const active = NAV.find(n =>
    n.path === '/admin'
      ? location.pathname === '/admin' || location.pathname === '/admin/'
      : location.pathname.startsWith(n.path)
  ) || NAV[0];

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex font-be overflow-hidden">
      {/* ── Admin Sidebar ── */}
      <motion.aside
        animate={{ width: sideOpen ? 220 : 64 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0d0e14] overflow-hidden"
        style={{ minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/[0.06] gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-black" />
          </div>
          {sideOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-sm text-white tracking-wide whitespace-nowrap"
            >
              God Mode
            </motion.span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV.map(item => {
            const isActive = item === active;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {sideOpen && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                  )}
                  {sideOpen && isActive && (
                    <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Back to App */}
        <div className="p-3 border-t border-white/[0.06]">
          <Link to="/app">
            <motion.div
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-all duration-150"
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              {sideOpen && <span className="text-sm whitespace-nowrap">Back to App</span>}
            </motion.div>
          </Link>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSideOpen(v => !v)}
          className="absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-[#1a1b24] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ position: 'fixed', bottom: 80, left: sideOpen ? 207 : 51 }}
        >
          <ChevronRight className={`w-3 h-3 text-white/60 transition-transform ${sideOpen ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/[0.06] bg-[#0a0b0f] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-sm font-semibold text-white">{active.label}</h1>
              <p className="text-xs text-white/30 mt-0.5">Professional Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">System Online</span>
            </div>
            <Link to="/app" className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-xs text-white/60 hover:text-white transition-all font-medium">
              ← Back to App
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/"         element={<AdminOverview />} />
            <Route path="/users"    element={<AdminUsers />} />
            <Route path="/activity" element={<AdminActivity />} />
            <Route path="/plans"    element={<AdminPlans />} />
            <Route path="/leads"    element={<AdminLeads />} />
            <Route path="/codes"    element={<AccessCodesTab />} />
            <Route path="/support"  element={<SupportPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}