import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ExternalLink, Link as LinkIcon, PenLine, Globe, Star, Megaphone, FileText, Sparkles } from 'lucide-react';

const GREEN = '#10B981';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';

const ICONS = { link: LinkIcon, write: PenLine, web: Globe, star: Star, promote: Megaphone, doc: FileText, sparkle: Sparkles };

export default function FixStepItem({ step, index, done, onToggle }) {
  const [copied, setCopied] = useState(false);
  const [burst, setBurst] = useState(false);
  const Icon = ICONS[step.icon] || Sparkles;

  const copy = async () => {
    try { await navigator.clipboard.writeText(step.copy_text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };

  const toggle = () => {
    if (!done) { setBurst(true); setTimeout(() => setBurst(false), 500); }
    onToggle();
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      style={{ display: 'flex', gap: 12, padding: '14px 16px', background: done ? 'rgba(16,185,129,0.06)' : '#fff', border: `1px solid ${done ? 'rgba(16,185,129,0.35)' : BORDER}`, borderRadius: 14, transition: 'background 0.3s, border-color 0.3s' }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: done ? 'rgba(16,185,129,0.14)' : 'rgba(124,58,237,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color={done ? GREEN : '#7C3AED'} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: done ? '#0B815A' : INK, margin: '0 0 3px', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.75 : 1 }}>
          {index + 1}. {step.title}
        </p>
        {step.detail && <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.5 }}>{step.detail}</p>}
        {step.copy_text && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 9, background: '#F7F5F0', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '9px 12px' }}>
            <span style={{ flex: 1, fontSize: 12, color: INK, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{step.copy_text}</span>
            <button onClick={copy} title="Copy"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: 'none', borderRadius: 7, background: copied ? GREEN : INK, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>
              {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
        {step.link && (
          <a href={step.link} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, fontWeight: 700, color: '#7C3AED', textDecoration: 'none' }}>
            <ExternalLink size={12} /> Open the page
          </a>
        )}
      </div>

      {/* Satisfying check button — Spotify-like pop */}
      <div style={{ position: 'relative', flexShrink: 0, alignSelf: 'center' }}>
        <AnimatePresence>
          {burst && (
            <motion.span initial={{ scale: 0.4, opacity: 0.8 }} animate={{ scale: 2.4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2.5px solid ${GREEN}`, pointerEvents: 'none' }} />
          )}
        </AnimatePresence>
        <motion.button onClick={toggle} whileTap={{ scale: 0.8 }}
          animate={done ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          aria-label={done ? 'Mark as not done' : 'Mark as done'}
          style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${done ? GREEN : 'rgba(21,19,15,0.2)'}`, background: done ? GREEN : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          {done && <Check size={16} color="#fff" strokeWidth={3} />}
        </motion.button>
      </div>
    </motion.div>
  );
}