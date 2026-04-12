import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTheme, toggleTheme } from '@/lib/theme';

export default function DarkModeToggle({ collapsed = false }) {
  const [isDark, setIsDark] = useState(() => getTheme() === 'dark');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setIsDark(next === 'dark');
  };

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle dark mode"
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5"
    >
      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-black/6 dark:bg-white/8 rounded-sm">
        <motion.div
          key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isDark
            ? <Sun className="w-3.5 h-3.5 text-yuzu" />
            : <Moon className="w-3.5 h-3.5 text-zinc-500" />
          }
        </motion.div>
      </div>
      {!collapsed && (
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  );
}