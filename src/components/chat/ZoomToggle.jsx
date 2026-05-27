/**
 * Minimal zoom toggle with 2 modes:
 * - Mode 1: Slightly larger, background still visible
 * - Mode 2: True fullscreen, no background, square corners
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ZoomToggle({ containerRef, containerSize, setContainerSize }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const PRESETS = {
    normal: { width: 96, height: 94 },
    expanded: { width: 98.5, height: 97 },
    fullscreen: { width: 100, height: 100 }
  };

  const toggleZoom = () => {
    if (!isFullscreen) {
      // Switch to fullscreen mode (no background, square corners)
      setContainerSize(PRESETS.fullscreen);
      setIsFullscreen(true);
    } else {
      // Return to normal mode
      setContainerSize(PRESETS.normal);
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcut: Z key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'z' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleZoom();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset border radius when fullscreen toggles
  useEffect(() => {
    if (containerRef?.current) {
      containerRef.current.style.borderRadius = isFullscreen ? '0px' : '16px';
    }
  }, [isFullscreen, containerRef]);

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        onClick={toggleZoom}
        className="fixed top-3 right-3 z-[9999] p-2"
        style={{
          background: 'transparent',
          border: 'none',
          opacity: 0.35,
          cursor: 'pointer',
          lineHeight: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.35'; }}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
        
        {isFullscreen ? (
          /* Compress icon — corners pointing inward */
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1A1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 1v4H1" />
            <path d="M15 5h-4V1" />
            <path d="M5 15v-4H1" />
            <path d="M11 15v-4h4" />
          </svg>
        ) : (
          /* Expand icon — corners pointing outward */
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1A1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 5V1h4" />
            <path d="M11 1h4v4" />
            <path d="M1 11v4h4" />
            <path d="M15 11v4h-4" />
          </svg>
        )}
      </motion.button>
    </AnimatePresence>
  );
}