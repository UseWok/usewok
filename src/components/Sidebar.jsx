import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bell, Globe, GraduationCap, TrendingUp, Users, Sparkles, DollarSign, Brain, ChevronDown, X, Bot, ShoppingBag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import LanguagePopover from './sidebar/LanguagePopover';
import CreditsSection from './sidebar/CreditsSection';

export const COLLAPSED_W = 68;
export const EXPANDED_W = 288;

const AGENTS = [
  { id: 'universelle', label: 'Universelle', icon: Sparkles },
  { id: 'coach-finance', label: 'Coach Finance Perso', icon: DollarSign },
  { id: 'gestion-achat', label: 'Gestion Achats Compulsifs', icon: Brain },
];

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const ACCENT = '#DDFF00';
const BG = '#3A0088';

export default function Sidebar({ expanded, setExpanded }) {
  const [activePopover, setActivePopover] = useState(null);
  const [user, setUser] = useState(null);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [parcoursOpen, setParcoursOpen] = useState(false);
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

  const handleAgentSelect = (agentId) => {
    navigate(`/chat?agent=${agentId}`);
    setAgentsOpen(false);
  };

  const handleHomeClick = () => {
    setParcoursOpen(false);
    setAgentsOpen(false);
    navigate('/');
  };

  const togglePopover = (name) => setActivePopover(p => p === name ? null : name);

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const iconStyle = { color: ACCENT };

  return (
    <>
      <motion.aside
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{ background: BG, borderRight: '1px solid rgba(221,255,0,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center px-3 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(221,255,0,0.12)' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white/10">
              <img src={LOGO_URL} alt="Stensor" className="w-8 h-8 object-contain" />
            </div>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-base tracking-tight whitespace-nowrap"
                style={{ color: ACCENT }}
              >
                Stensor
              </motion.span>
            )}
          </button>
          {expanded && (
            <button onClick={() => setExpanded(false)} className="ml-auto opacity-50 hover:opacity-80 transition-opacity">
              <X className="w-4 h-4" style={{ color: ACCENT }} />
            </button>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-3 pb-2 flex flex-col gap-0.5">

          {/* Home */}
          <NavItem icon={Home} label="Accueil" onClick={handleHomeClick} active={isHome && !agentParam} expanded={expanded} iconStyle={iconStyle} />

          {/* Agents dropdown */}
          <div>
            <NavItem
              icon={Bot}
              label="Agents IA"
              onClick={() => setAgentsOpen(v => !v)}
              active={false}
              expanded={expanded}
              iconStyle={iconStyle}
              open={agentsOpen}
              hasChildren
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
                  <div className="mt-1 ml-4 pl-3 pb-1 flex flex-col gap-0.5" style={{ borderLeft: '1px solid rgba(221,255,0,0.2)' }}>
                    {AGENTS.map((agent) => {
                      const Icon = agent.icon;
                      return (
                        <button
                          key={agent.id}
                          onClick={() => handleAgentSelect(agent.id)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left"
                          style={{ color: ACCENT, opacity: 0.8 }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                          <span className="whitespace-nowrap">{agent.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Parcours */}
          <NavItem
            icon={GraduationCap}
            label="Parcours"
            onClick={() => { navigate('/parcours'); setParcoursOpen(true); }}
            active={isParcours}
            expanded={expanded}
            iconStyle={iconStyle}
          />

          {/* Communauté */}
          <NavItem icon={Users} label="Communauté" onClick={() => {}} active={false} expanded={expanded} iconStyle={iconStyle} />

          {/* Admin: Produits */}
          {isAdmin && (
            <NavItem
              icon={ShoppingBag}
              label="Produits & Abonnements"
              onClick={() => navigate('/admin/products')}
              active={location.pathname === '/admin/products'}
              expanded={expanded}
              iconStyle={iconStyle}
            />
          )}

          {/* Credits */}
          <div className="mt-1">
            <CreditsSection expanded={expanded} />
          </div>

          <div className="flex-1" />
        </div>

        {/* Bottom actions */}
        <div className="px-2 pt-2 pb-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(221,255,0,0.12)' }}>
          {/* Upgrade */}
          <button
            onClick={() => navigate('/pricing')}
            className="w-full mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
            style={{ color: ACCENT }}
          >
            <TrendingUp className="w-[18px] h-[18px] flex-shrink-0" style={{ color: ACCENT }} />
            {expanded && <span className="whitespace-nowrap">Mettre à niveau</span>}
          </button>

          {/* Icons */}
          <div className={`flex items-center justify-center gap-1.5 ${expanded ? 'flex-row' : 'flex-col'}`}>
            <button
              ref={profileRef}
              onClick={() => togglePopover('profile')}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: activePopover === 'profile' ? 'rgba(221,255,0,0.2)' : 'rgba(255,255,255,0.08)' }}
            >
              <span className="text-xs font-bold" style={{ color: ACCENT }}>{userInitial}</span>
            </button>
            <button
              ref={langRef}
              onClick={() => togglePopover('lang')}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: activePopover === 'lang' ? 'rgba(221,255,0,0.15)' : 'rgba(255,255,255,0.05)' }}
            >
              <Globe className="w-4 h-4" style={{ color: ACCENT, opacity: 0.7 }} />
            </button>
            <button
              ref={notiRef}
              onClick={() => togglePopover('noti')}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: activePopover === 'noti' ? 'rgba(221,255,0,0.15)' : 'rgba(255,255,255,0.05)' }}
            >
              <Bell className="w-4 h-4" style={{ color: ACCENT, opacity: 0.7 }} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
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

function NavItem({ icon: Icon, label, onClick, active, expanded, iconStyle, hasChildren, open }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
      style={{
        background: active ? 'rgba(221,255,0,0.15)' : 'transparent',
        color: active ? '#DDFF00' : 'rgba(221,255,0,0.6)',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(221,255,0,0.08)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" style={iconStyle} />
      {expanded && <span className="flex-1 text-left whitespace-nowrap">{label}</span>}
      {expanded && hasChildren && (
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: '#DDFF00', opacity: 0.5 }} />
        </motion.div>
      )}
    </button>
  );
}