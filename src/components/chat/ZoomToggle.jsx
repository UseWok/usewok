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
        className="fixed bottom-6 right-6 z-[9999] p-2.5 rounded-full shadow-lg backdrop-blur-sm"
        style={{
          background: isFullscreen ? 'rgba(26, 26, 26, 0.9)' : 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          opacity: 0.5,
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.5';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
        
        {/* 4 bars in a square icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isFullscreen ? '#FFFFFF' : '#1A1A1A'} strokeWidth="2.5" strokeLinecap="square">
          <path d="M4 4h7v7H4z" />
          <path d="M13 4h7v7h-7z" />
          <path d="M4 13h7v7H4z" />
          <path d="M13 13h7v7h-7z" />
        </svg>
      </motion.button>
    </AnimatePresence>
  );
}