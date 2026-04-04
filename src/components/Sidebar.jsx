import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bell, Globe, Bot, GraduationCap, ArrowUp, ChevronDown, Users, Sparkles, Brain, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import LanguagePopover from './sidebar/LanguagePopover';
import CreditsSection from './sidebar/CreditsSection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { COLLAPSED_W, EXPANDED_W } from './Layout';

const AGENTS = [
  { id: 'universelle', label: 'Universelle', icon: Sparkles },
  { id: 'coach-finance', label: 'Coach Finance Perso', icon: DollarSign },
  { id: 'gestion-achat', label: 'Gestion Achats Compulsifs', icon: Brain },
];

export default function Sidebar({ expanded, setExpanded }) {
  const [activePopover, setActivePopover] = useState(null);
  const [user, setUser] = useState(null);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const langRef = useRef(null);

  const isHome = location.pathname === '/';
  const isParcours = location.pathname === '/parcours';
  const agentParam = new URLSearchParams(location.search).get('agent');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleParcoursClick = () => {
    if (isParcours) {
      setAgentDropdownOpen(false);
      navigate('/');
    } else {
      navigate('/parcours');
      setAgentDropdownOpen(true);
    }
  };

  const handleAgentClick = () => {
    setAgentDropdownOpen((v) => !v);
  };

  const handleHomeClick = () => {
    setAgentDropdownOpen(false);
    navigate('/');
  };

  const handleAgentSelect = (agentId) => {
    navigate(`/?agent=${agentId}`);
  };

  const togglePopover = (name) => setActivePopover((p) => (p === name ? null : name));

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : '?';

  const NavBtn = ({ icon: Icon, label, onClick, active }) => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all ${
              active ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            {expanded && <span className="whitespace-nowrap">{label}</span>}
          </button>
        </TooltipTrigger>
        {!expanded && <TooltipContent side="right" className="text-xs">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );

  // Bottom actions
  const bottomActions = [
    {
      id: 'upgrade',
      icon: ArrowUp,
      label: 'Mettre à niveau',
      ref: null,
      onClick: () => {},
      className: 'text-primary',
    },
    {
      id: 'profile',
      icon: null,
      label: 'Profil',
      ref: profileRef,
      onClick: () => togglePopover('profile'),
      isAvatar: true,
    },
    {
      id: 'lang',
      icon: Globe,
      label: 'Langue',
      ref: langRef,
      onClick: () => togglePopover('lang'),
      className: 'text-muted-foreground',
    },
    {
      id: 'noti',
      icon: Bell,
      label: 'Notifications',
      ref: notiRef,
      onClick: () => togglePopover('noti'),
      className: 'text-muted-foreground',
      badge: true,
    },
  ];

  return (
    <>
      <motion.aside
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 z-50 bg-card border-r border-border flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center justify-center py-3 px-2 border-b border-border flex-shrink-0">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 transition-transform group-hover:scale-105">
              R
            </div>
            {expanded && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-foreground text-sm whitespace-nowrap">
                Mon App
              </motion.span>
            )}
          </button>
        </div>

        {/* Nav */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden px-1.5 pt-2 gap-0.5">

          {/* Agents section with dropdown */}
          <div>
            <NavBtn icon={Bot} label="Agents" onClick={handleAgentClick} active={!isParcours && !agentDropdownOpen ? false : agentDropdownOpen} />
            <AnimatePresence>
              {agentDropdownOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-2 mt-0.5 border-l-2 border-border pl-2 flex flex-col gap-0.5 pb-1">
                    {AGENTS.map((agent) => {
                      const Icon = agent.icon;
                      const isLocked = agentParam === agent.id;
                      return (
                        <button
                          key={agent.id}
                          onClick={() => handleAgentSelect(agent.id)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all text-left ${
                            isLocked ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          {expanded && <span className="whitespace-nowrap">{agent.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Parcours */}
          <NavBtn icon={GraduationCap} label="Parcours" onClick={handleParcoursClick} active={isParcours} />

          {/* Home */}
          <NavBtn icon={Home} label="Accueil" onClick={handleHomeClick} active={isHome && !agentParam} />

          {/* Credits */}
          <div className="my-1">
            <CreditsSection expanded={expanded} />
          </div>

          {/* Communauté */}
          <NavBtn icon={Users} label="Communauté" onClick={() => {}} active={false} />

          <div className="flex-1" />
        </div>

        {/* Bottom section */}
        <div className="border-t border-border px-1.5 pt-2 pb-2 flex-shrink-0">
          <motion.div
            animate={{ flexDirection: expanded ? 'row' : 'column' }}
            transition={{ duration: 0.25 }}
            className="flex gap-1 items-center justify-center flex-wrap"
          >
            {bottomActions.map((action) => (
              <TooltipProvider key={action.id} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      ref={action.ref}
                      onClick={action.onClick}
                      className={`relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        action.id === 'upgrade'
                          ? 'bg-primary/10 hover:bg-primary/20'
                          : action.isAvatar
                          ? activePopover === 'profile' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 hover:bg-primary/20'
                          : activePopover === action.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {action.isAvatar ? (
                        <span className={`text-xs font-bold ${activePopover === 'profile' ? 'text-primary-foreground' : 'text-primary'}`}>
                          {userInitial}
                        </span>
                      ) : (
                        <action.icon className={`w-4 h-4 ${action.className || ''}`} />
                      )}
                      {action.badge && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">{action.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </motion.div>
          {expanded && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-center text-primary font-medium mt-1.5 cursor-pointer hover:underline"
              onClick={() => {}}
            >
              Mettre à niveau votre plan
            </motion.p>
          )}
        </div>
      </motion.aside>

      <ProfilePopover open={activePopover === 'profile'} onClose={() => setActivePopover(null)} anchorRef={profileRef} user={user} userInitial={userInitial} />
      <NotificationsPopover open={activePopover === 'noti'} onClose={() => setActivePopover(null)} anchorRef={notiRef} />
      <LanguagePopover open={activePopover === 'lang'} onClose={() => setActivePopover(null)} anchorRef={langRef} />
    </>
  );
}