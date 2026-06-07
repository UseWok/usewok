/**
 * ErrorNotification — premium, minimal error surface.
 * Harmonized with the app's cream / dark / coral design system.
 */
import { X, Wrench, Wifi, Clock, ShieldAlert, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { classifyError, ERROR_CATEGORIES } from '@/lib/error-handler';

const CATEGORY_CONFIG = {
  [ERROR_CATEGORIES.NETWORK]:  { accent: '#C8860A', label: 'Réseau',  Icon: Wifi },
  [ERROR_CATEGORIES.QUOTA]:    { accent: '#C8860A', label: 'Quota',   Icon: AlertTriangle },
  [ERROR_CATEGORIES.AUTH]:     { accent: '#E8184A', label: 'Auth',    Icon: ShieldAlert },
  [ERROR_CATEGORIES.TIMEOUT]:  { accent: '#C8860A', label: 'Timeout', Icon: Clock },
  [ERROR_CATEGORIES.ABORT]:    { accent: '#6B7280', label: '',        Icon: X },
  [ERROR_CATEGORIES.RUNTIME]:  { accent: '#F95738', label: 'Erreur',  Icon: Zap },
  [ERROR_CATEGORIES.UNKNOWN]:  { accent: '#F95738', label: 'Erreur',  Icon: AlertTriangle },
};

export default function ErrorNotification({ error, onFix, onDismiss, context = 'Operation' }) {
  if (!error) return null;

  const classified = typeof error === 'object' && error.category
    ? error
    : classifyError(error, context);

  if (classified.category === ERROR_CATEGORIES.ABORT) return null;

  const { accent, label, Icon } = CATEGORY_CONFIG[classified.category] || CATEGORY_CONFIG[ERROR_CATEGORIES.UNKNOWN];
  const showAutoFix = !!onFix && classified.category === ERROR_CATEGORIES.RUNTIME;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          margin: '0 10px 10px',
          background: '#111',
          border: '1px solid #222',
          borderRadius: 12,
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Accent bar top */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px 11px',
        }}>
          {/* Badge + icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: `${accent}18`,
              border: `1px solid ${accent}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon style={{ width: 12, height: 12, color: accent }} />
            </div>
            {label && (
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: accent,
                opacity: 0.85,
              }}>
                {label}
              </span>
            )}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 500,
              color: '#D4D4D4',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {classified.title}
            </p>
            {classified.hint && (
              <p style={{
                margin: '1px 0 0',
                fontSize: 11,
                color: '#4A4A4A',
                lineHeight: 1.35,
              }}>
                {classified.hint}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {showAutoFix && (
              <button
                onClick={onFix}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 11px',
                  background: 'transparent',
                  border: `1px solid ${accent}50`,
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 600,
                  color: accent,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 140ms, border-color 140ms',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${accent}18`;
                  e.currentTarget.style.borderColor = `${accent}90`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = `${accent}50`;
                }}
              >
                <Wrench style={{ width: 10, height: 10 }} />
                Corriger
              </button>
            )}

            <button
              onClick={onDismiss}
              style={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: '1px solid #2A2A2A',
                borderRadius: 6,
                cursor: 'pointer',
                color: '#3A3A3A',
                transition: 'border-color 120ms, color 120ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#444';
                e.currentTarget.style.color = '#888';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2A2A2A';
                e.currentTarget.style.color = '#3A3A3A';
              }}
            >
              <X style={{ width: 11, height: 11 }} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}