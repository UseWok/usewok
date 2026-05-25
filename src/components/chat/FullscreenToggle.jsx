/**
 * Minimal fullscreen toggle with zero cognitive load
 * Uses native Fullscreen API - true fullscreen, no background visible
 */
import { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FullscreenToggle({ containerRef }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen({
          navigationUI: 'hide'
        });
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  // Keyboard shortcut: F key (when not typing)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        onClick={toggleFullscreen}
        className="fixed bottom-6 right-6 z-[9999] p-2.5 rounded-full shadow-lg backdrop-blur-sm"
        style={{
          background: isFullscreen ? 'rgba(26, 26, 26, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          opacity: 0.6,
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
        
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4" strokeWidth={2} style={{ color: '#FFFFFF' }} />
        ) : (
          <Maximize2 className="w-4 h-4" strokeWidth={2} style={{ color: '#1A1A1A' }} />
        )}
      </motion.button>
    </AnimatePresence>
  );
}