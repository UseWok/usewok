import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

export const COLLAPSED_W = 56;
export const EXPANDED_W = 240;

export default function Layout() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <motion.main
        animate={{ marginLeft: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="flex-1 min-h-screen overflow-x-hidden"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}