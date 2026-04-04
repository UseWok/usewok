import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

export const COLLAPSED_W = 68;
export const EXPANDED_W = 288;

export default function Layout() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-background flex font-be">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      {/* Overlay for mobile */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setExpanded(false)}
        />
      )}
      <motion.main
        animate={{ marginLeft: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="flex-1 min-h-screen overflow-x-hidden"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}