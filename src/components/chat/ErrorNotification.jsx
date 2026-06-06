/**
 * ErrorNotification — premium dark, minimal error banner.
 */
import { X, Wrench, Wifi, Clock, ShieldAlert, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { classifyError, ERROR_CATEGORIES } from '@/lib/error-handler';

const CATEGORY_CONFIG = {
  [ERROR_CATEGORIES.NETWORK]:  { accent: '#F59E0B', Icon: Wifi },
  [ERROR_CATEGORIES.QUOTA]:    { accent: '#F59E0B', Icon: AlertTriangle },
  [ERROR_CATEGORIES.AUTH]:     { accent: '#EF4444', Icon: ShieldAlert },
  [ERROR_CATEGORIES.TIMEOUT]:  { accent: '#F59E0B', Icon: Clock },
  [ERROR_CATEGORIES.ABORT]:    { accent: '#6B7280', Icon: X },
  [ERROR_CATEGORIES.RUNTIME]:  { accent: '#EF4444', Icon: Zap },
  [ERROR_CATEGORIES.UNKNOWN]:  { accent: '#EF4444', Icon: AlertTriangle },
};

export default function ErrorNotification({ error, onFix, onDismiss, context = 'Operation' }) {
  if (!error) return null;

  const classified = typeof error === 'object' && error.category
    ? error
    : classifyError(error, context);

  if (classified.category === ERROR_CATEGORIES.ABORT) return null;

  const { accent, Icon } = CATEGORY_CONFIG[classified.category] || CATEGORY_CONFIG[ERROR_CATEGORIES.UNKNOWN];
  const showAutoFix = !!onFix && classified.category === ERROR_CATEGORIES.RUNTIME;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
        style={{
          margin: '0 8px 8px',
          background: '#161616',
          border: `1px solid #2A2A2A`,
          borderLeft: `3px solid ${accent}`,
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Icon */}
        <Icon style={{ width: 13, height: 13, color: accent, flexShrink: 0 }} />

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#E5E5E5', display: 'block', lineHeight: 1.3 }}>
            {classified.title}
          </span>
          {classified.hint && (
            <span style={{ fontSize: 11, color: '#555', display: 'block', marginTop: 2, lineHeight: 1.3 }}>
              {classified.hint}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {showAutoFix && (
            <button
              onClick={onFix}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px',
                background: '#1E1E1E',
                border: '1px solid #333',
                borderRadius: 6,
                fontSize: 11, fontWeight: 600, color: '#E5E5E5',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'border-color 120ms, color 120ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#E5E5E5'; }}
            >
              <Wrench style={{ width: 10, height: 10 }} />
              Auto-fix
            </button>
          )}
          <button
            onClick={onDismiss}
            style={{
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#444', borderRadius: 5, transition: 'color 120ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#888'}
            onMouseLeave={e => e.currentTarget.style.color = '#444'}
          >
            <X style={{ width: 12, height: 12 }} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}