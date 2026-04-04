import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar, { COLLAPSED_W, EXPANDED_W } from './Sidebar';
import { Menu } from 'lucide-react';

export { COLLAPSED_W, EXPANDED_W };

export default function Layout() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-background flex font-be">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      
      {/* Mobile overlay */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <motion.main
        animate={{ marginLeft: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="flex-1 min-h-screen overflow-x-hidden relative"
      >
        {/* Mobile hamburger - always visible on mobile when collapsed */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="fixed top-3 left-3 z-30 md:hidden w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#3A0088', color: '#DDFF00' }}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Outlet />
      </motion.main>
    </div>
  );
}