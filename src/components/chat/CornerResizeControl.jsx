// ─────────────────────────────────────────────────────────────────────────────
// CornerResizeControl.jsx — Modern corner handle for panel resizing
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Smartphone, Tablet } from 'lucide-react';

const FORMAT_PRESETS = [
  { label: 'Phone', icon: Smartphone, value: 'phone' },
  { label: 'Tablet', icon: Tablet, value: 'tablet' },
  { label: 'Desktop', icon: Maximize2, value: 'desktop' },
  { label: 'Fullscreen', icon: Maximize2, value: 'fullscreen' },
];

export default function CornerResizeControl({ onFormatChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(2); // Desktop default
  const controlRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (controlRef.current && !controlRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Edge collision detection with bounce
  useEffect(() => {
    if (!isDragging) {
      const margin = 24;
      const maxX = window.innerWidth - 58;
      const maxY = window.innerHeight - 58;
      
      let newX = position.x;
      let newY = position.y;
      
      // Bounce back if more than 95% hidden
      if (newX > maxX * 0.95) newX = maxX;
      if (newY > maxY * 0.95) newY = maxY;
      if (newX < -40 * 0.95) newX = -40;
      if (newY < -40 * 0.95) newY = -40;
      
      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
      }
    }
  }, [position, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({
      x: posStart.current.x + dx,
      y: posStart.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleSelect = (idx) => {
    setSelectedIdx(idx);
    onFormatChange(FORMAT_PRESETS[idx].value);
    setIsOpen(false);
  };

  return (
    <div
      ref={controlRef}
      style={{
        position: 'fixed',
        bottom: 16 + position.y,
        right: 16 + position.x,
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Popup menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 8 }}
          transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: 'absolute',
            bottom: 52,
            right: 0,
            background: '#0A0A0A',
            borderRadius: 14,
            padding: 6,
            boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
            border: '1px solid rgba(255,255,255,0.08)',
            minWidth: 150,
          }}
        >
          {FORMAT_PRESETS.map((preset, idx) => (
            <button
              key={preset.label}
              onClick={() => handleSelect(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: 'none',
                background: selectedIdx === idx ? 'rgba(255,255,255,0.12)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => {
                if (selectedIdx !== idx) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                if (selectedIdx !== idx) e.currentTarget.style.background = 'transparent';
              }}
            >
              <preset.icon
                className={selectedIdx === idx ? 'text-white' : 'text-zinc-400'}
                size={16}
                strokeWidth={2.5}
              />
              <span
                className={selectedIdx === idx ? 'text-white font-semibold' : 'text-zinc-400'}
                style={{ fontSize: 13 }}
              >
                {preset.label}
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Corner control button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.1 }}
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: '#0A0A0A',
          border: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated corner icon */}
        <div
          style={{
            width: 20,
            height: 20,
            borderRight: '2.5px solid white',
            borderBottom: '2.5px solid white',
            borderRadius: '0 0 4px 0',
            transform: isOpen ? 'rotate(-45deg) scale(0.9)' : 'rotate(0deg) scale(1)',
            transition: 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        />
        {/* Pulse ring when open */}
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          />
        )}
      </motion.button>
    </div>
  );
}