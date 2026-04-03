import { useRef, useEffect } from 'react';
import { Bell, Megaphone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const newsItems = [
  {
    icon: Sparkles,
    title: 'Nouvelle fonctionnalité',
    desc: 'Découvrez les agents IA améliorés',
    time: 'Il y a 2h',
  },
  {
    icon: Megaphone,
    title: 'Mise à jour v2.5',
    desc: 'Performance et stabilité améliorées',
    time: 'Il y a 1j',
  },
  {
    icon: Sparkles,
    title: 'Parcours disponibles',
    desc: 'Apprenez à créer vos premiers projets',
    time: 'Il y a 3j',
  },
];

export default function NotificationsPopover({ open, onClose, anchorRef, expanded }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] w-72 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
          style={{
            left: expanded ? '220px' : '60px',
            bottom: '60px',
          }}
        >
          <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Notifications</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {newsItems.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-0"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}