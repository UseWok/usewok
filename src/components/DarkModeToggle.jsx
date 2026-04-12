import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DarkModeToggle({ collapsed = false }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5`}
    >
      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-black/6 dark:bg-white/8 rounded-sm">
        <motion.div
          key={isDark ? 'moon' : 'sun'}
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