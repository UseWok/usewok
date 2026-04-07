import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Bell, Globe2, GraduationCap, Users, Bot, ShoppingBag, TrendingUp, Zap, ChevronRight, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import LanguagePopover from './sidebar/LanguagePopover';
import TensorsPopover from './sidebar/TensorsPopover';
import { useLanguage } from '@/lib/i18n';
import { getUserPlan } from '@/lib/plans-config';

export const COLLAPSED_W = 64;
export const EXPANDED_W = 272;

export const AGENTS = [
  { id: 'global', labelKey: 'global_agent' },
  { id: 'emotions-depenses', labelKey: 'emotions_agent' },
  { id: 'wealth-strategy', labelKey: 'wealth_agent' },
];

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const PURPLE = '#3A0088';
const YUZU = '#DDFF00';
const CORAL = '#FF4F00';

const UNLOCKABLE_FEATURES = [
  { labelKey: 'mode_ultimate', plan: 'Expert', planId: 'expert', icon: '👑' },
  { label: 'Internet Search', plan: 'Advanced', planId: 'advanced', icon: '🌐' },
  { label: 'File Uploads', plan: 'Essential', planId: 'essential', icon: '📎' },
  { label: 'Unlimited Discussions', plan: 'Advanced', planId: 'advanced', icon: '💬' },
];

export default function Sidebar({ expanded, setExpanded }) {
  const [activePopover, setActivePopover] = useState(null);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const qc = useQueryClient();

  const { t } = useLanguage();

  const { data: notifsList = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 10),
    refetchInterval: 15000,
  });

  const lastSeen = parseInt(localStorage.getItem('stensor_notifs_last_seen') || '0');
  const hasUnread = notifsList.some(n => new Date(n.created_date).getTime() > lastSeen);

  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const langRef = useRef(null);
  const tensorsRef = useRef(null);

  const loadUser = () => {
    base44.auth.me().then(u => {
      setUser(u);
      setUserPlan(getUserPlan(u));
    }).catch(() => {});
  };

  useEffect(() => { loadUser(); }, []);

  // Reload user when returning to page (plan changes)
  useEffect(() => {
    const handler = () => loadUser();
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, []);

  const isAdmin = user?.role === 'admin';
  const used = user?.credits_used || 0;
  const limit = userPlan?.credits_limit || user?.credits_limit || 10;
  const bonus = user?.credits_bonus || 0;
  const total = limit + bonus;
  const pct = Math.min((used / total) * 100, 100);
  const remaining = total - used;
  const isLow = remaining <= 5;

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

  const navItems = [
    { icon: Home, labelKey: 'home', path: '/', active: location.pathname === '/' },
    { icon: GraduationCap, labelKey: 'parcours', path: '/parcours', active: location.pathname === '/parcours' },
    { icon: Bot, labelKey: 'global_agent', path: null, active: false },
    { icon: Users, labelKey: 'community', path: null, active: false },
    ...(isAdmin ? [{ icon: ShoppingBag, labelKey: 'administration', path: '/admin/products', active: location.pathname.startsWith('/admin') }] : []),
  ];

  const lockedFeatures = UNLOCKABLE_FEATURES.filter(f => {
    if (!userPlan) return true;
    if (f.planId === 'expert') return !userPlan.ultimate_access;
    if (f.planId === 'advanced') return !userPlan.internet_access;
    if (f.planId === 'essential') return !userPlan.file_upload;
    return false;
  });

  return (
    <>
      <motion.aside
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden bg-white"
        style={{ borderRight: '1px solid rgba(0,0,0,0.07)' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-5 flex-shrink-0 cursor-pointer select-none"
          onClick={() => setExpanded(!expanded)}
        >
          <img src={LOGO_URL} alt="Stensor" className="w-9 h-9 object-contain flex-shrink-0" />
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="font-black text-base tracking-tight whitespace-nowrap"
              style={{ color: PURPLE }}
            >
              Stensor
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavItem
              key={item.labelKey}
              icon={item.icon}
              label={t(item.labelKey)}
              active={item.active}
              expanded={expanded}
              onClick={() => { if (item.path) navigate(item.path); }}
            />
          ))}

          {/* Unlockable features section */}
          {expanded && lockedFeatures.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowFeatures(s => !s)}
                className="w-full flex items-center justify-between px-3 py-2 text-left"
                style={{ borderRadius: '4px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#bbb' }}>{t('feature_preview')}</span>
                <ChevronRight className="w-3 h-3 transition-transform" style={{ color: '#bbb', transform: showFeatures ? 'rotate(90deg)' : 'none' }} />
              </button>
              <AnimatePresence>
                {showFeatures && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="space-y-1 px-2 py-1">
                      {lockedFeatures.map(f => (
                        <button key={f.label || f.labelKey}
                          onClick={() => navigate('/pricing')}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors"
                          style={{ borderRadius: '3px' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(58,0,136,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span className="text-xs">{f.icon}</span>
                          <span className="text-[11px] flex-1" style={{ color: '#888' }}>{f.label || t(f.labelKey)}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5" style={{ background: 'rgba(58,0,136,0.08)', color: PURPLE, borderRadius: '2px' }}>🔒 {f.plan}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* Bottom section */}
        <div className="flex-shrink-0 px-2 pb-4 space-y-1">
          {/* Upgrade card — always visible */}
          <button
            onClick={() => navigate('/pricing')}
            className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 transition-all"
            style={{ background: PURPLE, borderRadius: '4px' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '3px' }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: PURPLE }} />
            </div>
            {expanded && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-white">{t('upgrade')}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('more_tensors')}</p>
              </div>
            )}
          </button>

          {/* Tensors bar — always visible */}
          <button
            ref={tensorsRef}
            onClick={() => togglePopover('tensors')}
            className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors mb-1"
            style={{ borderRadius: '4px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{ background: isLow ? CORAL : YUZU, borderRadius: '3px', position: 'relative' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: isLow ? 'white' : PURPLE }} />
              {isLow && (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute -top-1 -right-1 w-2.5 h-2.5"
                  style={{ background: CORAL, borderRadius: '50%', border: '1.5px solid white' }} />
              )}
            </div>
            {expanded && (
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold" style={{ color: isLow ? CORAL : PURPLE }}>
                    {isLow ? '⚠ ' : ''}{used}/{total}
                  </span>
                  <span className="text-[9px]" style={{ color: '#bbb' }}>{t('tensors')}</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: pct >= 90 ? CORAL : pct >= 70 ? '#f59e0b' : PURPLE }} />
                </div>
              </div>
            )}
          </button>

          {/* Profile / Lang / Bell row — always aligned */}
          <div className="flex items-center justify-center gap-1.5 px-1">
            <button
              ref={profileRef}
              onClick={() => togglePopover('profile')}
              className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80"
              style={{ background: PURPLE, borderRadius: '4px' }}
            >
              <span className="text-xs font-bold text-white">{userInitial}</span>
            </button>
            <button
              ref={langRef}
              onClick={() => togglePopover('lang')}
              className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-all hover:bg-black/5"
              style={{ borderRadius: '4px' }}
            >
              <Globe2 className="w-4 h-4" style={{ color: '#aaa' }} />
            </button>
            <button
              ref={notiRef}
              onClick={() => togglePopover('noti')}
              className="relative w-9 h-9 flex items-center justify-center flex-shrink-0 transition-all hover:bg-black/5"
              style={{ borderRadius: '4px' }}
            >
              <Bell className="w-4 h-4" style={{ color: '#aaa' }} />
              {hasUnread && (
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute top-1.5 right-1.5 w-2 h-2"
                  style={{ background: CORAL, borderRadius: '50%', border: '1.5px solid white' }} />
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Popovers */}
      <ProfilePopover open={activePopover === 'profile'} onClose={() => setActivePopover(null)} anchorRef={profileRef} user={user} userInitial={userInitial} />
      <NotificationsPopover open={activePopover === 'noti'} onClose={() => setActivePopover(null)} anchorRef={notiRef} isAdmin={isAdmin} />
      <LanguagePopover open={activePopover === 'lang'} onClose={() => setActivePopover(null)} anchorRef={langRef} />
      <TensorsPopover open={activePopover === 'tensors'} onClose={() => setActivePopover(null)} anchorRef={tensorsRef} user={user} />
    </>
  );
}

function NavItem({ icon: Icon, label, onClick, active, expanded }) {
  const PURPLE = '#3A0088';
  const YUZU = '#DDFF00';
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150"
      style={{
        background: active ? YUZU : 'transparent',
        color: active ? PURPLE : '#666',
        borderRadius: '4px',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(58,0,136,0.05)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: active ? PURPLE : '#aaa' }} />
      {expanded && <span className="flex-1 text-left whitespace-nowrap truncate">{label}</span>}
      {expanded && active && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: PURPLE, borderRadius: '1px' }} />}
    </button>
  );
}