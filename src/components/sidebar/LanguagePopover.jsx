import { useRef, useEffect, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'fr', native: 'Français' },
  { code: 'en', native: 'English' },
  { code: 'de', native: 'Deutsch' },
  { code: 'es', native: 'Español' },
];

export default function LanguagePopover({ open, onClose, anchorRef }) {
  const popoverRef = useRef(null);
  const [selected, setSelected] = useState('fr');

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

  const getPosition = () => {
    if (!anchorRef?.current) return { left: 60, bottom: 16 };
    const rect = anchorRef.current.getBoundingClientRect();
    return { left: rect.right + 8, bottom: window.innerHeight - rect.bottom };
  };

  const pos = open ? getPosition() : {};

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] w-48 bg-card rounded-lg shadow-xl border border-border overflow-hidden"
          style={{ left: pos.left, bottom: pos.bottom }}
        >
          <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Langue</span>
          </div>
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setSelected(lang.code); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <span className={selected === lang.code ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                  {lang.native}
                </span>
                {selected === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}