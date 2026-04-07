import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const PURPLE = '#3A0088';
const YUZU = '#DDFF00';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', native: 'English (US)' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'es', label: 'Español', flag: '🇪🇸', native: 'Español' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', native: 'Português (BR)' },
];

export default function LanguagePopover({ open, onClose, anchorRef }) {
  const popRef = useRef(null);
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    const h = (e) => {
      if (popRef.current && !popRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose, anchorRef]);

  const getPos = () => {
    if (!anchorRef?.current) return { left: 72, top: 200 };
    const rect = anchorRef.current.getBoundingClientRect();
    const popW = 220;
    let left = rect.right + 12;
    if (left + popW > window.innerWidth - 16) left = rect.left - popW - 12;
    let top = rect.top - 20;
    if (top + 240 > window.innerHeight - 16) top = window.innerHeight - 256;
    return { left, top };
  };

  const pos = open ? getPos() : {};

  const handleSelect = (code) => {
    setLang(code);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={popRef}
          initial={{ opacity: 0, x: -8, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[200] w-52"
          style={{ left: pos.left, top: pos.top, background: 'white', border: '1px solid rgba(0,0,0,0.09)', borderRadius: '6px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>

          <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#aaa' }}>Language</span>
            <button onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '3px' }}>
              <X className="w-3 h-3" style={{ color: '#bbb' }} />
            </button>
          </div>

          <div className="p-1.5">
            {LANGUAGES.map(lng => (
              <button key={lng.code} onClick={() => handleSelect(lng.code)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all"
                style={{
                  background: lang === lng.code ? YUZU : 'transparent',
                  color: lang === lng.code ? PURPLE : '#444',
                  borderRadius: '4px',
                }}
                onMouseEnter={e => { if (lang !== lng.code) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { if (lang !== lng.code) e.currentTarget.style.background = 'transparent'; }}>
                <span className="text-lg leading-none">{lng.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{lng.native}</p>
                </div>
                {lang === lng.code && <Check className="w-3 h-3 flex-shrink-0" style={{ color: PURPLE }} />}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}