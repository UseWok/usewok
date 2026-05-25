import { useState, useEffect } from 'react';
import { Minus, Square, Maximize2 } from 'lucide-react';

export default function ResizeWidget({ containerRef, containerSize, setContainerSize }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prevSize, setPrevSize] = useState(null);

  const PRESETS = {
    small: { width: 60, height: 70 },
    medium: { width: 80, height: 85 },
    large: { width: 96, height: 94 },
    fullscreen: { width: 100, height: 100 }
  };

  const handleShrink = () => {
    if (containerSize.width > 70) {
      setContainerSize(PRESETS.small);
    }
  };

  const handleExpand = () => {
    if (containerSize.width < 96) {
      setContainerSize(PRESETS.large);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef?.current;
    
    if (!isFullscreen) {
      // Enter fullscreen
      setPrevSize({ width: containerSize.width, height: containerSize.height });
      setContainerSize(PRESETS.fullscreen);
      setIsFullscreen(true);

      // Try Fullscreen API
      if (container) {
        try {
          if (container.requestFullscreen) {
            await container.requestFullscreen();
          } else if (container.webkitRequestFullscreen) {
            await container.webkitRequestFullscreen();
          } else if (container.msRequestFullscreen) {
            await container.msRequestFullscreen();
          }
        } catch (err) {
          console.log('Fullscreen API not supported');
        }
      }
    } else {
      // Exit fullscreen
      setContainerSize(prevSize || PRESETS.large);
      setIsFullscreen(false);
      setPrevSize(null);

      // Exit Fullscreen API
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      } catch (err) {
        console.log('Exit fullscreen failed');
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && 
          !document.webkitFullscreenElement && 
          !document.msFullscreenElement) {
        if (isFullscreen) {
          setIsFullscreen(false);
          setContainerSize(prevSize || PRESETS.large);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, prevSize, setContainerSize]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9999,
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 8px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(8px)',
        borderRadius: '9999px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        opacity: 0.55,
        transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.55';
      }}
    >
      <button
        onClick={handleShrink}
        disabled={containerSize.width <= 60}
        style={{
          width: '28px',
          height: '28px',
          border: 'none',
          background: 'transparent',
          borderRadius: '6px',
          cursor: containerSize.width <= 60 ? 'not-allowed' : 'pointer',
          opacity: containerSize.width <= 60 ? '0.4' : '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          if (containerSize.width > 60) {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Minus className="w-4 h-4 text-zinc-700" strokeWidth={2} />
      </button>

      <button
        onClick={toggleFullscreen}
        style={{
          width: '28px',
          height: '28px',
          border: 'none',
          background: 'transparent',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {isFullscreen ? (
          <Square className="w-4 h-4 text-zinc-700" strokeWidth={2} />
        ) : (
          <Maximize2 className="w-4 h-4 text-zinc-700" strokeWidth={2} />
        )}
      </button>

      <button
        onClick={handleExpand}
        disabled={containerSize.width >= 96}
        style={{
          width: '28px',
          height: '28px',
          border: 'none',
          background: 'transparent',
          borderRadius: '6px',
          cursor: containerSize.width >= 96 ? 'not-allowed' : 'pointer',
          opacity: containerSize.width >= 96 ? '0.4' : '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          if (containerSize.width < 96) {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Maximize2 className="w-4 h-4 text-zinc-700" strokeWidth={2} />
      </button>
    </div>
  );
}