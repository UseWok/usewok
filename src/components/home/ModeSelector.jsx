import React, { useRef, useEffect } from 'react';
import { ChevronDown, Check, Zap, MessageSquare } from 'lucide-react';

const MODES = [
  { id: 'scan', label: 'Scan', icon: Zap },
  { id: 'chat', label: 'Chat', icon: MessageSquare }
];

export function ModeSelector({ mode, onToggle }) {
  const activeMode = MODES.find(m => m.id === mode) || MODES[0];
  return (
    <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', cursor: 'pointer', flexShrink: 0, userSelect: 'none', borderRadius: 6, transition: 'background 120ms' }}
      onMouseEnter={e => e.currentTarget.style.background = '#EEE5D2'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <span style={{ fontSize: 13, color: '#111110', fontWeight: 600 }}>{activeMode.label}</span>
      <ChevronDown size={12} color="#111110" strokeWidth={2} />
    </div>
  );
}

export function ModeDropdown({ mode, onSelect, onClose, anchor = 'bottom' }) {
  const ref = useRef(null);
  
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const pos = anchor === 'top' ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' };

  return (
    <div ref={ref} style={{
      position: 'absolute', ...pos, right: 0, zIndex: 9000,
      background: '#FFFFFF', border: '1px solid rgba(21,19,15,0.09)', borderRadius: 12,
      padding: '6px', minWidth: 160,
      boxShadow: '0 4px 24px rgba(21,19,15,0.08)'
    }}>
      {MODES.map(m => {
        const isSelected = m.id === mode;
        return (
          <div key={m.id} onClick={() => { onSelect(m.id); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', margin: '2px 0', cursor: 'pointer',
              borderRadius: 8,
              background: isSelected ? '#F3F4F6' : 'transparent',
              transition: 'background 100ms'
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F9FAFB'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
            <m.icon size={15} color="#111110" strokeWidth={isSelected ? 2.5 : 2} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111110', flex: 1 }}>{m.label}</span>
            {isSelected && <Check size={15} color="#111110" strokeWidth={2.5} />}
          </div>
        );
      })}
    </div>
  );
}