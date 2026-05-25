import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Activity, Settings, CreditCard, BookOpen, LifeBuoy, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InlineModal from './InlineModal';

const MENU_ITEMS = [
  { icon: Home, label: 'Accueil', path: '/app', modal: false },
  { icon: Activity, label: 'Utilisation', path: '/settings', modal: true },
  { icon: Settings, label: 'Paramètres', path: '/settings', modal: true },
  { icon: CreditCard, label: 'Mettre à niveau', path: '/pricing', modal: true },
  { icon: BookOpen, label: 'Documentation', path: '#', modal: true },
  { icon: LifeBuoy, label: 'Support', path: '/support', modal: true },
];

export default function WokTopBar({ onResizeStart }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (item) => {
    setIsMenuOpen(false);
    if (item.modal) {
      setActiveModal(item.path);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: '#FFFFFF',
          borderBottom: '0.5px solid rgba(229, 229, 229, 0.35)',
          borderRadius: '18px 18px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 50,
        }}
      >
        {/* Left: Wok logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              background: '#FFFFFF',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 800, color: '#0A0A0A' }}>W</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.5px' }}>Wok</span>
        </div>

        {/* Right: Menu toggle (notch) */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* Animated menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: 8,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '0.5px solid rgba(229, 229, 229, 0.35)',
                  minWidth: 280,
                  zIndex: 999,
                }}
              >
                {MENU_ITEMS.map((item, idx) => (
                  <button
                    key={item.label}
                    onClick={() => handleMenuClick(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: idx === 0 ? '10px 14px' : '8px 14px',
                      borderRadius: idx === 0 ? 10 : 8,
                      background: idx === 0 ? '#F5F5F5' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = idx === 0 ? '#E8E8E8' : '#F9F9F9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = idx === 0 ? '#F5F5F5' : 'transparent')}
                  >
                    <item.icon size={18} strokeWidth={2.5} className="text-zinc-600" />
                    <span
                      className={idx === 0 ? 'font-semibold' : ''}
                      style={{
                        fontSize: 14,
                        color: '#0A0A0A',
                        flex: idx === 0 ? 1 : 'auto',
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <InlineModal onClose={() => setActiveModal(null)}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 16, color: '#888888' }}>Page: {activeModal}</p>
          </div>
        </InlineModal>
      )}
    </>
  );
}