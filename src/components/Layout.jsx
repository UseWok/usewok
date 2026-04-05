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
            className="fixed top-4 left-4 z-30 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(30,0,80,0.7)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <Outlet />
      </motion.main>
    </div>
  );
}