import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Bell, Globe2, GraduationCap, Users, Bot, ShoppingBag, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import LanguagePopover from './sidebar/LanguagePopover';
import CreditsModal from './sidebar/CreditsModal';

export const COLLAPSED_W = 64;
export const EXPANDED_W = 272;

export const AGENTS = [
  { id: 'global', label: 'Agent Global' },
  { id: 'emotions-depenses', label: 'Émotions & Dépenses' },
  { id: 'wealth-strategy', label: 'Wealth Strategy' },
];

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export default function Sidebar({ expanded, setExpanded }) {
  const [activePopover, setActivePopover] = useState(null);
  const [user, setUser] = useState(null);
  const [showCredits, setShowCredits] = useState(false);

  const { data: notifsList = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 10),
    refetchInterval: 30000,
  });

  const lastSeen = parseInt(localStorage.getItem('stensor_notifs_last_seen') || '0');
  const hasUnread = notifsList.some(n => new Date(n.created_date).getTime() > lastSeen);

  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin';
  const used = user?.credits_used || 0;
  const limit = user?.credits_limit || 25;
  const bonus = user?.credits_bonus || 0;
  const total = limit + bonus;

  const togglePopover = (name) => {
    if (name === 'noti') localStorage.setItem('stensor_notifs_last_seen', String(Date.now()));
    setActivePopover(p => p === name ? null : name);
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const navItems = [
    { icon: Home, label: 'Accueil', path: '/', active: location.pathname === '/' },
    { icon: GraduationCap, label: 'Parcours', path: '/parcours', active: location.pathname === '/parcours' },
    { icon: Bot, label: 'Agent IA', path: null, active: false },
    { icon: Users, label: 'Communauté', path: null, active: false },
    ...(isAdmin ? [{ icon: ShoppingBag, label: 'Administration', path: '/admin/products', active: location.pathname === '/admin/products' }] : []),
  ];

  return (
    <>
      <motion.aside
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{ background: '#ffffff', borderRight: '1px solid rgba(0,0,0,0.07)' }}
      >
        {/* Logo — click to toggle */}
        <div
          className="flex items-center gap-3 px-4 py-5 flex-shrink-0 cursor-pointer select-none"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Réduire' : 'Agrandir'}
        >
          <img src={LOGO_URL} alt="Stensor" className="w-9 h-9 object-contain flex-shrink-0" />
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="font-bold text-base tracking-tight whitespace-nowrap"
              style={{ color: '#111' }}
            >
              Stensor
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={item.active}
              expanded={expanded}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                  setExpanded(false);
                }
              }}
            />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="flex-shrink-0 px-2 pb-4 space-y-1">
          {/* Upgrade card */}
          {expanded && (
            <button
              onClick={() => { navigate('/pricing'); setExpanded(false); }}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl mb-2 transition-colors text-left"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,79,0,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
            >
              <div>
                <p className="text-xs font-bold" style={{ color: '#111' }}>Mettre à niveau</p>
                <p className="text-[10px]" style={{ color: '#999' }}>Accédez à plus de crédits</p>
              </div>
              <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#FF4F00' }} />
            </button>
          )}

          {/* Credits clickable */}
          <button
            onClick={() => setShowCredits(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mb-1"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,79,0,0.08)' }}>
              <Zap className="w-4 h-4" style={{ color: '#FF4F00' }} />
            </div>
            {expanded && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold" style={{ color: '#111' }}>Crédits</p>
                <p className="text-[10px]" style={{ color: '#999' }}>{used} / {total}{bonus > 0 ? ` +${bonus}` : ''}</p>
              </div>
            )}
          </button>

          {/* Profile / Lang / Bell */}
          <div className={`flex items-center ${expanded ? 'gap-1 px-1' : 'flex-col gap-1.5 items-center'}`}>
            <button
              ref={profileRef}
              onClick={() => togglePopover('profile')}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-black/5"
              style={{ background: 'rgba(255,79,0,0.1)' }}
            >
              <span className="text-xs font-bold" style={{ color: '#FF4F00' }}>{userInitial}</span>
            </button>
            <button
              ref={langRef}
              onClick={() => togglePopover('lang')}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-black/5"
            >
              <Globe2 className="w-4 h-4" style={{ color: '#999' }} />
            </button>
            <button
              ref={notiRef}
              onClick={() => togglePopover('noti')}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-black/5"
            >
              <Bell className="w-4 h-4" style={{ color: '#999' }} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" style={{ border: '1.5px solid white' }} />
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Popovers */}
      <ProfilePopover open={activePopover === 'profile'} onClose={() => setActivePopover(null)} anchorRef={profileRef} user={user} userInitial={userInitial} />
      <NotificationsPopover open={activePopover === 'noti'} onClose={() => setActivePopover(null)} anchorRef={notiRef} isAdmin={isAdmin} />
      <LanguagePopover open={activePopover === 'lang'} onClose={() => setActivePopover(null)} anchorRef={langRef} />
      <CreditsModal open={showCredits} onClose={() => setShowCredits(false)} user={user} />
    </>
  );
}

function NavItem({ icon: Icon, label, onClick, active, expanded }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
      style={{
        background: active ? 'rgba(255,79,0,0.08)' : 'transparent',
        color: active ? '#FF4F00' : '#444',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: active ? '#FF4F00' : '#888' }} />
      {expanded && <span className="flex-1 text-left whitespace-nowrap">{label}</span>}
      {expanded && active && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FF4F00' }} />}
    </button>
  );
}