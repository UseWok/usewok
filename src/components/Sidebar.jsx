import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Bell, Globe, Bot, GraduationCap, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import LanguagePopover from './sidebar/LanguagePopover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatePresence } from 'framer-motion';

const COLLAPSED_W = 56;
const EXPANDED_W = 208;

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  const [activeTab, setActiveTab] = useState('agents');
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const langRef = useRef(null);

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
    const content = (
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
            {to ? <Link to={to}>{content}</Link> : content}
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
        <div className="flex items-center justify-center py-3 px-2 border-b border-border">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 group">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 transition-transform group-hover:scale-105">
                    R
                  </div>
                </TooltipTrigger>
                {!expanded && <TooltipContent side="right" className="text-xs">Ouvrir le panneau</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
            {expanded && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-foreground text-sm whitespace-nowrap">
                Mon App
              </motion.span>
            )}
          </button>
        </div>

        {/* Nav items */}
        <div className="py-2 px-1.5 space-y-0.5">
          <NavItem icon={Home} label="Accueil" to="/" active={location.pathname === '/'} onClick={() => {}} />
        </div>

        {/* Agents / Parcours toggle */}
        <div className="px-2 py-2">
          <div className="bg-muted rounded-lg p-0.5 flex flex-col gap-0.5">
            {[{ key: 'agents', icon: Bot, label: 'Agents' }, { key: 'parcours', icon: GraduationCap, label: 'Parcours' }].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {expanded && <span>{label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Credits */}
        <div className="px-2 py-1">
          <button
            onClick={() => setCreditsOpen(!creditsOpen)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            {expanded && (
              <>
                <span className="flex-1 text-left">Crédits</span>
                {creditsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </>
            )}
          </button>
          <AnimatePresence>
            {creditsOpen && expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                <div className="px-2 py-2 mt-1 rounded-lg bg-muted text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Utilisés</span>
                    <span className="font-medium text-foreground">1 250</span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '42%' }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Restants</span>
                    <span className="font-medium text-foreground">1 750</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom bar: Profile | Lang | Notifs */}
        <div className="border-t border-border px-2 py-2 flex items-center justify-around gap-1">
          {/* Profile */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  ref={profileRef}
                  onClick={() => togglePopover('profile')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                    activePopover === 'profile' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {userInitial}
                </button>
              </TooltipTrigger>
              {!expanded && <TooltipContent side="right" className="text-xs">Profil</TooltipContent>}
            </Tooltip>
          </TooltipProvider>

          {/* Language */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  ref={langRef}
                  onClick={() => togglePopover('lang')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    activePopover === 'lang' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              {!expanded && <TooltipContent side="right" className="text-xs">Langue</TooltipContent>}
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  ref={notiRef}
                  onClick={() => togglePopover('noti')}
                  className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    activePopover === 'noti' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                </button>
              </TooltipTrigger>
              {!expanded && <TooltipContent side="right" className="text-xs">Notifications</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.aside>

      {/* Popovers */}
      <ProfilePopover open={activePopover === 'profile'} onClose={() => setActivePopover(null)} anchorRef={profileRef} user={user} userInitial={userInitial} />
      <NotificationsPopover open={activePopover === 'noti'} onClose={() => setActivePopover(null)} anchorRef={notiRef} />
      <LanguagePopover open={activePopover === 'lang'} onClose={() => setActivePopover(null)} anchorRef={langRef} />
    </>
  );
}