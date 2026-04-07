import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { COLLAPSED_W, EXPANDED_W } from './Sidebar';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/lib/i18n';

export { COLLAPSED_W, EXPANDED_W };

export default function Layout() {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const cart = (() => { try { return JSON.parse(localStorage.getItem('stensor_cart_v1')); } catch { return null; } })();
  const hasCart = cart && Date.now() - (cart.ts || 0) < 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-white flex font-be">
      {/* Desktop sidebar */}
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
                className="fixed inset-0 bg-black/40 z-40"
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
            className="fixed top-4 left-4 z-30 w-8 h-8 flex items-center justify-center"
            style={{ background: '#0A0A0A', color: 'white', borderRadius: '4px' }}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        {hasCart && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(`/checkout?plan=${cart.planId}&billing=${cart.billing}`)}
            className="fixed top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 text-xs font-black"
            style={{ background: '#0A0A0A', color: '#DDFF00', borderRadius: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            🛒 {t('resume_cart')}
          </motion.button>
        )}
        <Outlet />
      </motion.main>
    </div>
  );
}