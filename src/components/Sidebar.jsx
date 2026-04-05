import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bell, Globe, GraduationCap, TrendingUp, Users, Globe2, ChevronDown, X, Bot, ShoppingBag, Zap, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import LanguagePopover from './sidebar/LanguagePopover';
import { getCreditsUsed, getCreditsLimit } from '@/lib/credits';

export const COLLAPSED_W = 68;
export const EXPANDED_W = 280;

export const AGENTS = [
  { id: 'global', label: 'Agent Global' },
  { id: 'emotions-depenses', label: 'Émotions & Dépenses' },
  { id: 'wealth-strategy', label: 'Wealth Strategy' },
];

const BG = '#1E0050';
const BORDER_COLOR = 'rgba(255,255,255,0.1)';
const TEXT_ACTIVE = '#FFFFFF';
const TEXT_INACTIVE = 'rgba(255,255,255,0.55)';
const ICON_ACTIVE = '#FFFFFF';
const ICON_INACTIVE = 'rgba(255,255,255,0.5)';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export default function Sidebar({ expanded, setExpanded }) {
  const [activePopover, setActivePopover] = useState(null);
  const [user, setUser] = useState(null);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(getCreditsUsed());
  const [creditsLimit, setCreditsLimit] = useState(getCreditsLimit());

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

  const isParcours = location.pathname === '/parcours';
  const isHome = location.pathname === '/';
  const isAdmin = user?.role === 'admin';
  const agentParam = new URLSearchParams(window.location.search).get('agent');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Refresh credits when expanded
  useEffect(() => {
    if (expanded) {
      setCreditsUsed(getCreditsUsed());
      setCreditsLimit(getCreditsLimit());
    }
  }, [expanded]);

  const handleAgentSelect = (agentId) => {
    navigate(`/?agent=${agentId}`);
    setAgentsOpen(false);
    setExpanded(false);
  };

  const handleHomeClick = () => {
    setAgentsOpen(false);
    navigate('/');
    setExpanded(false);
  };

  const togglePopover = (name) => {
    if (name === 'noti') localStorage.setItem('stensor_notifs_last_seen', String(Date.now()));
    setActivePopover(p => p === name ? null : name);
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const remaining = Math.max(creditsLimit - creditsUsed, 0);
  const isOut = !isAdmin && creditsUsed >= creditsLimit;

  return (
    <>
      <motion.aside
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{ background: BG, borderRight: `1px solid ${BORDER_COLOR}` }}
      >
        {/* Header */}
        <div className="flex items-center px-3 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src={LOGO_URL} alt="Stensor" className="w-7 h-7 object-contain" />
            </div>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-base tracking-tight whitespace-nowrap text-white"
              >
                Stensor
              </motion.span>
            )}
          </button>
          {expanded && (
            <button onClick={() => setExpanded(false)} className="ml-auto" style={{ color: TEXT_INACTIVE }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-3 pb-2 flex flex-col gap-0.5">
          <NavItem icon={Home} label="Accueil" onClick={handleHomeClick} active={isHome && !agentParam} expanded={expanded} />

          {/* Agents */}
          <div>
            <NavItem
              icon={Bot}
              label="Agents IA"
              onClick={() => { if (expanded) setAgentsOpen(v => !v); else { setExpanded(true); setTimeout(() => setAgentsOpen(true), 200); } }}
              active={false}
              expanded={expanded}
              hasChildren
              open={agentsOpen}
            />
            <AnimatePresence>
              {agentsOpen && expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 ml-4 pl-3 pb-1 flex flex-col gap-0.5" style={{ borderLeft: `1px solid ${BORDER_COLOR}` }}>
                    {AGENTS.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => handleAgentSelect(agent.id)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left"
                        style={{ color: TEXT_INACTIVE }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Bot className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ICON_INACTIVE }} />
                        <span className="whitespace-nowrap">{agent.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavItem icon={GraduationCap} label="Parcours" onClick={() => { navigate('/parcours'); setExpanded(false); }} active={isParcours} expanded={expanded} />
          <NavItem icon={Users} label="Communauté" onClick={() => {}} active={false} expanded={expanded} />

          {isAdmin && (
            <NavItem
              icon={ShoppingBag}
              label="Produits & Abonnements"
              onClick={() => { navigate('/admin/products'); setExpanded(false); }}
              active={location.pathname === '/admin/products'}
              expanded={expanded}
            />
          )}

          <div className="flex-1" />
        </div>

        {/* Credits bar */}
        {expanded && (
          <div className="px-3 py-3 mx-2 mb-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER_COLOR}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" style={{ color: isOut ? '#ef4444' : '#a78bfa' }} />
                <span className="text-xs font-semibold text-white">Crédits</span>
              </div>
              <span className="text-xs font-bold" style={{ color: isOut ? '#ef4444' : 'rgba(255,255,255,0.7)' }}>
                {creditsUsed} / {isAdmin ? '∞' : creditsLimit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: isOut ? '#ef4444' : 'linear-gradient(90deg, #a78bfa, #818cf8)' }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {isOut ? 'Limite atteinte' : `${remaining} restants`}
              </span>
              {isOut && (
                <button onClick={() => navigate('/pricing')} className="text-[10px] font-semibold" style={{ color: '#a78bfa' }}>
                  Mettre à niveau →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom */}
        <div className="px-2 pt-2 pb-3 flex-shrink-0" style={{ borderTop: `1px solid ${BORDER_COLOR}` }}>
          <button
            onClick={() => { navigate('/pricing'); setExpanded(false); }}
            className="w-full mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
            style={{ color: TEXT_INACTIVE }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <TrendingUp className="w-[18px] h-[18px] flex-shrink-0" style={{ color: ICON_INACTIVE }} />
            {expanded && <span className="whitespace-nowrap">Mettre à niveau</span>}
          </button>

          <div className={`flex items-center gap-1.5 ${expanded ? 'flex-row justify-between' : 'flex-col'}`}>
            <button
              ref={profileRef}
              onClick={() => togglePopover('profile')}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/10"
            >
              <span className="text-xs font-bold text-white">{userInitial}</span>
            </button>
            <button
              ref={langRef}
              onClick={() => togglePopover('lang')}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/10"
            >
              <Globe2 className="w-4 h-4" style={{ color: ICON_INACTIVE }} />
            </button>
            <button
              ref={notiRef}
              onClick={() => togglePopover('noti')}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/10"
            >
              <Bell className="w-4 h-4" style={{ color: ICON_INACTIVE }} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" style={{ border: '1.5px solid #1E0050' }} />
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      <ProfilePopover open={activePopover === 'profile'} onClose={() => setActivePopover(null)} anchorRef={profileRef} user={user} userInitial={userInitial} />
      <NotificationsPopover open={activePopover === 'noti'} onClose={() => setActivePopover(null)} anchorRef={notiRef} />
      <LanguagePopover open={activePopover === 'lang'} onClose={() => setActivePopover(null)} anchorRef={langRef} />
    </>
  );
}

function NavItem({ icon: Icon, label, onClick, active, expanded, hasChildren, open }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
      style={{
        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
        color: active ? TEXT_ACTIVE : TEXT_INACTIVE,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: active ? ICON_ACTIVE : ICON_INACTIVE }} />
      {expanded && <span className="flex-1 text-left whitespace-nowrap">{label}</span>}
      {expanded && hasChildren && (
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
        </motion.div>
      )}
    </button>
  );
}