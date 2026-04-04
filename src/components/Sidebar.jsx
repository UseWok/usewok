import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bell, Globe, Bot, GraduationCap, TrendingUp, Users, Sparkles, DollarSign, Brain, ChevronDown, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import LanguagePopover from './sidebar/LanguagePopover';
import CreditsSection from './sidebar/CreditsSection';
import { COLLAPSED_W, EXPANDED_W } from './Layout';

const AGENTS = [
  { id: 'universelle', label: 'Universelle', icon: Sparkles },
  { id: 'coach-finance', label: 'Coach Finance Perso', icon: DollarSign },
  { id: 'gestion-achat', label: 'Gestion Achats Compulsifs', icon: Brain },
];

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/df69e6539_image.png';

export default function Sidebar({ expanded, setExpanded }) {
  const [activePopover, setActivePopover] = useState(null);
  const [user, setUser] = useState(null);
  const [parcoursOpen, setParcoursOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const langRef = useRef(null);

  const isParcours = location.pathname === '/parcours';
  const isHome = location.pathname === '/' ;
  const agentParam = new URLSearchParams(window.location.search).get('agent');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleParcoursClick = () => {
    if (isParcours) {
      setParcoursOpen(v => !v);
    } else {
      navigate('/parcours');
      setParcoursOpen(true);
    }
  };

  const handleAgentSelect = (agentId) => {
    // Navigate to home with agent param (not parcours - avoids heavy re-render)
    navigate(`/?agent=${agentId}`);
  };

  const handleHomeClick = () => {
    setParcoursOpen(false);
    navigate('/');
  };

  const togglePopover = (name) => setActivePopover(p => p === name ? null : name);

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const NavItem = ({ icon: Icon, label, onClick, active, children }) => (
    <div>
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
          active
            ? 'bg-primary/10 text-primary'
            : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
        }`}
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
        {expanded && <span className="flex-1 text-left whitespace-nowrap">{label}</span>}
        {expanded && children && (
          <motion.div animate={{ rotate: parcoursOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </motion.div>
        )}
      </button>
      {children}
    </div>
  );

  return (
    <>
      <motion.aside
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="fixed left-0 top-0 bottom-0 z-50 bg-[#0A0A0F] border-r border-white/[0.06] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center px-3 py-4 border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-3 group min-w-0"
          >
            <img
              src={LOGO_URL}
              alt="Stensor"
              className="w-8 h-8 flex-shrink-0 object-contain"
            />
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-white text-base tracking-tight whitespace-nowrap"
              >
                Stensor
              </motion.span>
            )}
          </button>
          {expanded && (
            <button onClick={() => setExpanded(false)} className="ml-auto text-white/30 hover:text-white/60 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-3 pb-2 flex flex-col gap-0.5">

          {/* Home */}
          <NavItem icon={Home} label="Accueil" onClick={handleHomeClick} active={isHome && !agentParam} />

          {/* Parcours with agents dropdown */}
          <NavItem
            icon={GraduationCap}
            label="Parcours"
            onClick={handleParcoursClick}
            active={isParcours}
            children={
              <AnimatePresence>
                {parcoursOpen && expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 ml-4 border-l border-white/10 pl-3 pb-1 flex flex-col gap-0.5">
                      {AGENTS.map((agent) => {
                        const Icon = agent.icon;
                        return (
                          <button
                            key={agent.id}
                            onClick={() => handleAgentSelect(agent.id)}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                              agentParam === agent.id && isHome
                                ? 'bg-primary/15 text-primary'
                                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">{agent.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            }
          />

          {/* Communauté */}
          <NavItem icon={Users} label="Communauté" onClick={() => {}} active={false} />

          {/* Credits */}
          <div className="mt-1">
            <CreditsSection expanded={expanded} />
          </div>

          <div className="flex-1" />
        </div>

        {/* Bottom actions */}
        <div className="border-t border-white/[0.06] px-2 pt-2 pb-3 flex-shrink-0">
          {/* Upgrade button */}
          <button
            onClick={() => navigate('/pricing')}
            className={`w-full mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-primary hover:bg-primary/10`}
          >
            <TrendingUp className="w-[18px] h-[18px] flex-shrink-0" />
            {expanded && <span className="whitespace-nowrap">Mettre à niveau</span>}
          </button>

          {/* Icon actions */}
          <motion.div
            animate={{ flexDirection: expanded ? 'row' : 'column' }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-1.5 flex-wrap"
          >
            {/* Profile */}
            <button
              ref={profileRef}
              onClick={() => togglePopover('profile')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                activePopover === 'profile' ? 'bg-primary/20' : 'hover:bg-white/5'
              }`}
            >
              <span className="text-xs font-bold text-white/70">{userInitial}</span>
            </button>
            {/* Globe */}
            <button
              ref={langRef}
              onClick={() => togglePopover('lang')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                activePopover === 'lang' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <Globe className="w-4 h-4 text-white/40" />
            </button>
            {/* Bell */}
            <button
              ref={notiRef}
              onClick={() => togglePopover('noti')}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                activePopover === 'noti' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <Bell className="w-4 h-4 text-white/40" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
          </motion.div>
        </div>
      </motion.aside>

      <ProfilePopover open={activePopover === 'profile'} onClose={() => setActivePopover(null)} anchorRef={profileRef} user={user} userInitial={userInitial} />
      <NotificationsPopover open={activePopover === 'noti'} onClose={() => setActivePopover(null)} anchorRef={notiRef} />
      <LanguagePopover open={activePopover === 'lang'} onClose={() => setActivePopover(null)} anchorRef={langRef} />
    </>
  );
}