import { useState, useEffect, useRef } from 'react';
import { User, Settings, HelpCircle, Users, Gift, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePopover({ open, onClose, anchorRef, expanded }) {
  const popoverRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

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

  const items = [
    { icon: User, label: 'Voir le profil', action: () => {} },
    { icon: Settings, label: 'Paramètres du compte', action: () => {} },
    { icon: HelpCircle, label: 'Aide et support', action: () => {} },
    { divider: true },
    { icon: Users, label: 'Parrainer un ami', action: () => {} },
    { icon: Gift, label: 'Envoyer un cadeau', action: () => {} },
    { divider: true },
    { icon: LogOut, label: 'Se déconnecter', action: () => base44.auth.logout(), destructive: true },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] w-64 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
          style={{
            left: expanded ? '220px' : '60px',
            bottom: '16px',
          }}
        >
          {/* User header */}
          <div className="p-3 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.full_name || 'Utilisateur'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {items.map((item, i) =>
              item.divider ? (
                <div key={i} className="my-1 border-t border-border" />
              ) : (
                <button
                  key={i}
                  onClick={() => { item.action(); onClose(); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted ${
                    item.destructive ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}