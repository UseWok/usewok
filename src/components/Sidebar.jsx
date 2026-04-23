import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Bell, MessageSquare, ShoppingBag, TrendingUp, Zap, ChevronRight, X, Cpu } from 'lucide-react';

import { base44 } from '@/api/base44Client';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import TensorsPopover from './sidebar/TensorsPopover';
import { useLanguage } from '@/lib/i18n';
import { getUserColor } from '@/lib/user-color';
import { getUserPlan } from '@/lib/plans-config';
import { useIsMobile } from '@/hooks/use-mobile';

import { onCreditsUpdate } from '@/lib/credits-events';

export const COLLAPSED_W = 64;
export const EXPANDED_W = 250;

export const AGENTS = [
  { id: 'global', labelKey: 'global_agent', label: "Knowing exactly where I'm going" },
  { id: 'emotions-depenses', labelKey: 'emotions_agent', label: 'Spend without guilt' },
  { id: 'wealth-strategy', labelKey: 'wealth_agent', label: 'Becoming financially free' },
];

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const fmtN = (n) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? r.toString() : r.toFixed(1);
};

const UNLOCKABLE_FEATURES = [
  { labelKey: 'mode_ultimate', plan: 'Expert', planId: 'expert', icon: '👑' },
  { label: 'Internet Search', plan: 'Advanced', planId: 'advanced', icon: '🌐' },
  { label: 'File Uploads', plan: 'Essential', planId: 'essential', icon: '📎' },
  { label: 'Unlimited Discussions', plan: 'Advanced', planId: 'advanced', icon: '💬' },
];

export default function Sidebar({ expanded, setExpanded, onNavClick, isMobileDrawer = false }) {
  const [activePopover, setActivePopover] = useState(null);

  const [logoHovered, setLogoHovered] = useState(false);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  useEffect(() => { if (!expanded) setShowFeatures(false); }, [expanded]);
  const isMobile = useIsMobile();
  const qc = useQueryClient();
  const { t } = useLanguage();

  const { data: notifsList = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 10),
    refetchInterval: 15000,
  });

  const lastSeen = parseInt(localStorage.getItem('stensor_notifs_last_seen') || '0');
  const hasUnreadNotifs = notifsList.some(n => new Date(n.created_date).getTime() > lastSeen);
  const dnaSections = ['ai_vision', 'ai_personality', 'ai_golden_rule', 'ai_tone', 'ai_depth', 'ai_context'];
  const dnaComplete = user ? dnaSections.every(f => user[f] && String(user[f]).trim().length > 0) : true;
  const hasUnread = hasUnreadNotifs || !dnaComplete;

  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const tensorsRef = useRef(null);

  const loadUser = () => {
    base44.auth.me().then(u => { setUser(u); setUserPlan(getUserPlan(u)); }).catch(() => {});
  };

  useEffect(() => { loadUser(); }, []);
  useEffect(() => {
    const handler = () => loadUser();
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, []);
  useEffect(() => {
    return onCreditsUpdate(({ credits_used }) => {
      setUser(prev => prev ? { ...prev, credits_used } : prev);
    });
  }, []);

  const isAdmin = user?.role === 'admin';
  const used = user?.credits_used || 0;
  const limit = userPlan?.credits_limit || user?.credits_limit || 10;
  const bonus = user?.credits_bonus || 0;
  const total = limit + bonus;
  const pct = Math.min((used / total) * 100, 100);

  const togglePopover = (name) => {
    if (name === 'noti') {
      localStorage.setItem('stensor_notifs_last_seen', String(Date.now()));
      qc.invalidateQueries(['notifications']);
    }
    setActivePopover(p => p === name ? null : name);
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const [pageSettings, setPageSettings] = useState({ show_parcours: true, show_community: true });
  useEffect(() => {
    base44.entities.AppSettings.filter({ key: 'page_modes' }).then(results => {
      if (results.length > 0) { try { const m = JSON.parse(results[0].value); setPageSettings({ show_parcours: m.show_parcours !== false, show_community: m.show_community !== false }); } catch {} }
    }).catch(() => {});
  }, []);

  const navItems = [
    { icon: Home, labelKey: 'home', path: '/app', active: location.pathname === '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions', active: location.pathname === '/discussions' },
    { icon: Cpu, label: 'ADN Stensor', path: '/ai-dna', active: location.pathname === '/ai-dna', highlight: true },
    ...(isAdmin ? [{ icon: ShoppingBag, labelKey: 'administration', path: '/admin/products', active: location.pathname.startsWith('/admin') }] : []),
  ];

  return (
    <>
      <motion.aside
        initial={isMobileDrawer ? { x: -EXPANDED_W } : false}
        animate={isMobileDrawer ? { x: 0 } : { width: expanded ? EXPANDED_W : COLLAPSED_W }}
        exit={isMobileDrawer ? { x: -EXPANDED_W } : undefined}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: isMobileDrawer ? EXPANDED_W : undefined, borderRight: '1px solid rgba(0,0,0,0.97)' }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden bg-white border-r"
      >
        {/* Logo */}
        <div className="flex items-center gap-1 px-4 py-5 flex-shrink-0 select-none">
          <div
            className="relative w-9 h-9 flex-shrink-0 cursor-pointer"
            onMouseEnter={() => { if (expanded) setLogoHovered(true); }}
            onMouseLeave={() => setLogoHovered(false)}
            onClick={() => { if (expanded) { setLogoHovered(false); setExpanded(false); } else { setExpanded(true); } }}
          >
            <img src={LOGO_URL} alt="Stensor"
              className={`w-9 h-9 object-contain transition-all ${logoHovered ? 'opacity-50 blur-sm' : ''}`} />
            {logoHovered && (
              <div className="absolute inset-0 flex items-center justify-center">
                <X className="w-5 h-5 text-fg" />
              </div>
            )}
          </div>
          {expanded && (
            <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}
              className="font-black text-base tracking-tight whitespace-nowrap text-fg">
              Stensor
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavItem
              key={item.labelKey || item.label}
              icon={item.icon}
              label={item.label || t(item.labelKey)}
              active={item.active}
              expanded={expanded}
              highlight={item.highlight}
              onClick={() => { if (item.path) { navigate(item.path); if (onNavClick) setTimeout(onNavClick, 200); } }}
            />
          ))}

          {/* Unlockable features */}
          {expanded && (
            <div className="mt-3">
              <button
                onClick={() => setShowFeatures(s => !s)}
                className="w-full flex items-center justify-between px-3 py-2 text-left rounded-sm hover:bg-black/5 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{t('feature_preview')}</span>
                <ChevronRight className={`w-3 h-3 text-zinc-400 transition-transform ${showFeatures ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {showFeatures && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="space-y-1 px-2 py-1">
                      {UNLOCKABLE_FEATURES.map(f => {
                        let unlocked = false;
                        if (userPlan) {
                          if (f.planId === 'expert') unlocked = userPlan.ultimate_access;
                          else if (f.planId === 'advanced') unlocked = userPlan.internet_access || (f.label === 'Unlimited Discussions' && userPlan.max_discussions === 0);
                          else if (f.planId === 'essential') unlocked = userPlan.file_upload;
                        }
                        return (
                          <button key={f.label || f.labelKey}
                            onClick={() => !unlocked && navigate('/pricing')}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-sm transition-colors ${!unlocked ? 'hover:bg-black/5 cursor-pointer' : 'cursor-default'}`}>
                            <span className="text-xs">{f.icon}</span>
                            <span className={`text-[11px] flex-1 ${unlocked ? 'text-zinc-600' : 'text-zinc-400'}`}>{f.label || t(f.labelKey)}</span>
                            {unlocked
                              ? <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-sm">✓ Active</span>
                              : <span className="text-[9px] font-bold px-1.5 py-0.5 bg-black/8 text-zinc-600 rounded-sm">Upgrade {f.plan}+</span>
                            }
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* Bottom section */}
        <div className="flex-shrink-0 px-2 pb-4 flex flex-col items-center gap-1">
          {/* Upgrade — free plan only */}
          {userPlan && userPlan.price_monthly === 0 && (
            expanded ? (
              <button onClick={() => navigate('/pricing')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yuzu rounded-sm hover:opacity-80 transition-opacity mb-1">
                <TrendingUp className="w-[14px] h-[14px] text-fg flex-shrink-0" />
                <p className="text-[11px] font-bold text-fg whitespace-nowrap">Upgrade your plan</p>
              </button>
            ) : (
              <button onClick={() => navigate('/pricing')}
                className="w-full flex items-center gap-3 px-3 py-2 hover:opacity-80 transition-opacity mb-1">
                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-yuzu rounded-sm">
                  <TrendingUp className="w-[17px] h-[17px] text-fg" />
                </div>
              </button>
            )
          )}

          {/* Tensors */}
          <button ref={tensorsRef} onClick={() => togglePopover('tensors')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-black/5 transition-colors">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-white border border-black/10 rounded-sm">
              <span className="text-[11px] font-black text-fg">T</span>
            </div>
            {expanded && (
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-fg">{fmtN(used)}/{fmtN(total)}</span>
                  <span className="text-[9px] text-zinc-400">{t('tensors')}</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden bg-black/10">
                  <div className="h-full rounded-full bg-fg transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
          </button>

          {/* Profile + Bell */}
          <div className="w-full flex items-center gap-3 px-3 py-2">
            <button ref={profileRef} onClick={() => togglePopover('profile')}
              className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-md hover:opacity-80 transition-opacity"
              style={{ background: getUserColor(user) }}>
              <span className="text-xs font-bold text-white">{userInitial}</span>
            </button>
            <button ref={notiRef} onClick={() => togglePopover('noti')}
              className="relative w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-md hover:bg-black/5 transition-colors">
              <Bell className="w-[17px] h-[17px] text-zinc-400" />
              {hasUnread && (
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute top-0.5 right-0.5 w-2 h-2 bg-coral rounded-full border-[1.5px] border-white" />
              )}
            </button>
          </div>
        </div>
      </motion.aside>


      <ProfilePopover open={activePopover === 'profile'} onClose={() => setActivePopover(null)} anchorRef={profileRef} user={user} userInitial={userInitial} />
      <NotificationsPopover open={activePopover === 'noti'} onClose={() => setActivePopover(null)} anchorRef={notiRef} isAdmin={isAdmin} user={user} />
      <TensorsPopover open={activePopover === 'tensors'} onClose={() => setActivePopover(null)} anchorRef={tensorsRef} user={user} />
    </>
  );
}

function NavItem({ icon: Icon, label, onClick, active, expanded, highlight }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-sm transition-all duration-150 ${active && expanded ? 'bg-yuzu text-fg' : active ? 'text-fg' : 'text-zinc-500 hover:bg-black/5'}`}
      style={highlight && !active ? { borderLeft: '2px solid #DDFF00' } : {}}>
      <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-sm ${active && !expanded ? 'bg-yuzu' : ''}`}>
        <Icon className={`w-[17px] h-[17px] ${active ? 'text-fg' : highlight ? '#0A0A0A' : 'text-zinc-400'}`} />
      </div>
      {expanded && (
        <span className="flex-1 text-left whitespace-nowrap truncate text-sm flex items-center gap-1.5">
          {label}
          {highlight && !active && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: '#DDFF00', color: '#0A0A0A' }}>NEW</span>}
        </span>
      )}
    </button>
  );
}