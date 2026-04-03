import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  User,
  Bell,
  Globe,
  ShoppingBag,
  Bot,
  GraduationCap,
  Flame,
} from 'lucide-react';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import LanguagePopover from './sidebar/LanguagePopover';
import CreditsDropdown from './sidebar/CreditsDropdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const COLLAPSED_W = 56;
const EXPANDED_W = 208;

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  const [activeTab, setActiveTab] = useState('agents');
  const location = useLocation();

  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const langRef = useRef(null);

  const togglePopover = (name) => {
    setActivePopover((prev) => (prev === name ? null : name));
  };

  const SidebarIcon = ({ icon: Icon, label, onClick, isRef, active, badge }) => {
    const ref = isRef || null;
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={ref}
              onClick={onClick}
              className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {expanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className="whitespace-nowrap text-[13px]"
                >
                  {label}
                </motion.span>
              )}
              {badge && !expanded && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          </TooltipTrigger>
          {!expanded && (
            <TooltipContent side="right" className="text-xs">
              {label}
            </TooltipContent>
          )}
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
        {/* Logo + Toggle */}
        <div className="flex items-center justify-center py-3 px-2 border-b border-border">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 group"
          >
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 transition-transform group-hover:scale-105">
                    R
                  </div>
                </TooltipTrigger>
                {!expanded && (
                  <TooltipContent side="right" className="text-xs">
                    Ouvrir le panneau
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-foreground text-sm whitespace-nowrap"
              >
                Mon App
              </motion.span>
            )}
          </button>
        </div>

        {/* Top section: Shop, Language, Notifications */}
        <div className="py-2 space-y-0.5 px-1.5">
          <SidebarIcon icon={ShoppingBag} label="Boutique" onClick={() => {}} />
          <SidebarIcon
            icon={Globe}
            label="Langue"
            onClick={() => togglePopover('lang')}
            isRef={langRef}
            active={activePopover === 'lang'}
          />
          <SidebarIcon
            icon={Bell}
            label="Notifications"
            onClick={() => togglePopover('noti')}
            isRef={notiRef}
            active={activePopover === 'noti'}
            badge
          />
        </div>

        {/* Credits */}
        <div className="py-1">
          <CreditsDropdown expanded={expanded} />
        </div>

        {/* Agents / Parcours toggle */}
        <div className="px-2 py-2">
          <div className="bg-muted rounded-lg p-0.5 flex flex-col gap-0.5">
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'agents'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bot className="w-3.5 h-3.5 flex-shrink-0" />
              {expanded && <span>Agents</span>}
            </button>
            <button
              onClick={() => setActiveTab('parcours')}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'parcours'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
              {expanded && <span>Parcours</span>}
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: Home */}
        <div className="px-1.5 py-1">
          <Link to="/">
            <SidebarIcon
              icon={Home}
              label="Accueil"
              onClick={() => {}}
              active={location.pathname === '/'}
            />
          </Link>
        </div>

        {/* Profile */}
        <div className="px-1.5 py-1.5 border-t border-border">
          <SidebarIcon
            icon={User}
            label="Profil"
            onClick={() => togglePopover('profile')}
            isRef={profileRef}
            active={activePopover === 'profile'}
          />
        </div>
      </motion.aside>

      {/* Popovers */}
      <ProfilePopover
        open={activePopover === 'profile'}
        onClose={() => setActivePopover(null)}
        anchorRef={profileRef}
        expanded={expanded}
      />
      <NotificationsPopover
        open={activePopover === 'noti'}
        onClose={() => setActivePopover(null)}
        anchorRef={notiRef}
        expanded={expanded}
      />
      <LanguagePopover
        open={activePopover === 'lang'}
        onClose={() => setActivePopover(null)}
        anchorRef={langRef}
        expanded={expanded}
      />
    </>
  );
}