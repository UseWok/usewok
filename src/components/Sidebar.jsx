import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bell, Globe, Bot, GraduationCap, ArrowUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import LanguagePopover from './sidebar/LanguagePopover';
import CreditsSection from './sidebar/CreditsSection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const COLLAPSED_W = 56;
const EXPANDED_W = 220;

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const langRef = useRef(null);

  const isAgents = location.pathname === '/';
  const isParcours = location.pathname === '/parcours';

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const togglePopover = (name) => {
    setActivePopover((prev) => (prev === name ? null : name));
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : '?';

  const NavItem = ({ icon: Icon, label, onClick, active, to }) => {
    const inner = (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
          active
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
        {expanded && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="whitespace-nowrap text-[13px]">
            {label}
          </motion.span>
        )}
      </button>
    );

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {to ? <Link to={to}>{inner}</Link> : inner}
          </TooltipTrigger>
          {!expanded && <TooltipContent side="right" className="text-xs">{label}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <motion.aside
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 z-50 bg-card border-r border-border flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center justify-center py-3 px-2 border-b border-border flex-shrink-0">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 group">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 transition-transform group-hover:scale-105">
                    R
                  </div>
                </TooltipTrigger>
                {!expanded && <TooltipContent side="right" className="text-xs">Ouvrir</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
            {expanded && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-foreground text-sm whitespace-nowrap">
                Mon App
              </motion.span>
            )}
          </button>
        </div>

        {/* Agents / Parcours toggle */}
        <div className="px-2 pt-3 pb-1 flex-shrink-0">
          <div className="bg-muted rounded-lg p-0.5 flex flex-col gap-0.5">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                isAgents ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bot className="w-3.5 h-3.5 flex-shrink-0" />
              {expanded && <span>Agents</span>}
            </button>
            <button
              onClick={() => navigate('/parcours')}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                isParcours ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
              {expanded && <span>Parcours</span>}
            </button>
          </div>
        </div>

        {/* Home nav */}
        <div className="px-1.5 py-1 flex-shrink-0">
          <NavItem icon={Home} label="Accueil" to="/" active={isAgents} onClick={() => {}} />
        </div>

        {/* Credits */}
        <CreditsSection expanded={expanded} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Upgrade button */}
        <div className="px-2 pb-2 flex-shrink-0">
          <button className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-xs text-primary font-medium`}>
            <ArrowUp className="w-3.5 h-3.5 flex-shrink-0" />
            {expanded && <span className="text-left leading-tight">Mettre à niveau<br /><span className="font-normal text-muted-foreground text-[10px]">Tirez le meilleur de vos apps</span></span>}
          </button>
        </div>

        {/* Bottom bar: Profile | Lang | Notifs — always horizontal */}
        <div className="border-t border-border px-2 py-2 flex-shrink-0">
          <div className="flex flex-row items-center justify-around gap-1">
            {/* Profile */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    ref={profileRef}
                    onClick={() => togglePopover('profile')}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors flex-shrink-0 ${
                      activePopover === 'profile' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {userInitial}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Profil</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Language */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    ref={langRef}
                    onClick={() => togglePopover('lang')}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                      activePopover === 'lang' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Langue</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notifications */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    ref={notiRef}
                    onClick={() => togglePopover('noti')}
                    className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                      activePopover === 'noti' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.aside>

      {/* Popovers */}
      <ProfilePopover open={activePopover === 'profile'} onClose={() => setActivePopover(null)} anchorRef={profileRef} user={user} userInitial={userInitial} />
      <NotificationsPopover open={activePopover === 'noti'} onClose={() => setActivePopover(null)} anchorRef={notiRef} />
      <LanguagePopover open={activePopover === 'lang'} onClose={() => setActivePopover(null)} anchorRef={langRef} />
    </>
  );
}