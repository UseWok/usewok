import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { COLLAPSED_W, EXPANDED_W } from './Sidebar';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export { COLLAPSED_W, EXPANDED_W };

export default function Layout() {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background flex font-be">
      {/* Desktop sidebar — hidden on mobile */}
      {!isMobile && <Sidebar expanded={expanded} setExpanded={setExpanded} />}

      {/* Mobile: sidebar drawer */}
      {isMobile && (
        <AnimatePresence>
          {expanded && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setExpanded(false)}
              />
              <Sidebar expanded={true} setExpanded={setExpanded} />
            </>
          )}
        </AnimatePresence>
      )}

      <motion.main
        animate={{ marginLeft: isMobile ? 0 : (expanded ? EXPANDED_W : COLLAPSED_W) }}
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        className="flex-1 min-h-screen overflow-x-hidden relative"
      >
        {/* Mobile hamburger */}
        {isMobile && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="fixed top-3 left-3 z-30 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: '#1E0050', color: 'white' }}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Outlet />
      </motion.main>
    </div>
  );
}