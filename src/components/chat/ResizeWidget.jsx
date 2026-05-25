import { useState } from 'react';
import { Minimize, Maximize } from 'lucide-react';

export default function ResizeWidget({ containerSize, setContainerSize }) {
  const [isMaximized, setIsMaximized] = useState(false);

  const PRESETS = {
    default: { width: 97, height: 97 },
    maximized: { width: 100, height: 100 }
  };

  const toggleSize = () => {
    if (isMaximized) {
      setContainerSize(PRESETS.default);
      setIsMaximized(false);
    } else {
      setContainerSize(PRESETS.maximized);
      setIsMaximized(true);
    }
  };

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
        gap: '6px',
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderRadius: '9999px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        opacity: 0.6,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.6';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#71717a',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginRight: '4px',
        }}
      >
        Zoom
      </span>

      <button
        onClick={toggleSize}
        style={{
          width: '32px',
          height: '32px',
          border: 'none',
          background: isMaximized ? '#18181b' : '#f4f4f5',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isMaximized ? '#27272a' : '#e4e4e7';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isMaximized ? '#18181b' : '#f4f4f5';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isMaximized ? (
          <Minimize className="w-4 h-4 text-white" strokeWidth={2} />
        ) : (
          <Maximize className="w-4 h-4 text-zinc-700" strokeWidth={2} />
        )}
      </button>
    </div>
  );
}