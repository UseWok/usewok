/**
 * ThinkingUI — Premium startup-grade thinking state
 * Halo → contextual action phrases → clean minimal design
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Contextual action phrases — short, real, dynamic
const THINKING_PHASES = [
  { label: 'Reading your request', accent: '#9CA3AF' },
  { label: 'Choosing layout', accent: '#A78BFA' },
  { label: 'Structuring components', accent: '#60A5FA' },
  { label: 'Crafting interactions', accent: '#34D399' },
  { label: 'Refining visuals', accent: '#F59E0B' },
  { label: 'Finalising output', accent: '#F97316' },
];

// Inject keyframes once
let _ki = false;
function injectKF() {
  if (_ki) return; _ki = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes th-halo-pulse {
      0%,100% { opacity: 0.4; transform: scale(1); }
      50%      { opacity: 0.12; transform: scale(1.35); }
    }
    @keyframes th-halo-inner {
      0%,100% { opacity: 0.7; transform: scale(1); }
      50%      { opacity: 0.3; transform: scale(1.12); }
    }
    @keyframes th-spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes th-spin-rev  { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
    @keyframes th-cursor    { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes th-slide-up  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    @keyframes th-fade-in   { from{opacity:0} to{opacity:1} }
  `;
  document.head.appendChild(s);
}

// ── Animated halo orb ──
function HaloOrb({ accent }) {
  return (
    <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
      {/* Outer ring pulse */}
      <div style={{
        position: 'absolute', inset: -6, borderRadius: '50%',
        border: `1.5px solid ${accent}`,
        animation: 'th-halo-pulse 2s ease-in-out infinite',
        opacity: 0.3,
      }} />
      {/* Inner ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: `1.5px solid rgba(255,255,255,0.2)`,
        animation: 'th-halo-inner 2s ease-in-out infinite',
      }} />
      {/* Core dot */}
      <div style={{
        position: 'absolute', inset: '30%',
        borderRadius: '50%',
        background: accent,
        boxShadow: `0 0 8px ${accent}80`,
      }} />
    </div>
  );
}

// ── Live thinking stream ──
export function ThinkingStream({ text }) {
  useEffect(() => { injectKF(); }, []);

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPhaseIdx(prev => {
        if (prev < THINKING_PHASES.length - 1) {
          setPrevIdx(prev);
          return prev + 1;
        }
        return prev;
      });
    }, 1400);
    return () => clearInterval(intervalRef.current);
  }, []);

  const phase = THINKING_PHASES[phaseIdx];

  return (
    <div style={{ animation: 'th-slide-up 200ms ease-out both', fontFamily: 'Inter, sans-serif' }}>
      {/* Halo + current phrase */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <HaloOrb accent={phase.accent} />
        <div style={{ overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={phaseIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: '#ffffff',
                letterSpacing: '-0.01em',
              }}
            >
              {phase.label}
              <span style={{
                display: 'inline-block', width: 2, height: 13, background: phase.accent,
                borderRadius: 1, marginLeft: 3, verticalAlign: 'middle',
                animation: 'th-cursor 1s ease-in-out infinite',
              }} />
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Phase dots — minimal progress */}
      <div style={{ display: 'flex', gap: 5, paddingLeft: 44 }}>
        {THINKING_PHASES.map((p, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === phaseIdx ? 16 : 4,
              background: i < phaseIdx ? '#374151' : i === phaseIdx ? p.accent : '#1F2937',
              opacity: i > phaseIdx ? 0.35 : 1,
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ height: 4, borderRadius: 99 }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Collapsible accordion after generation ──
export function ThinkingAccordion({ thinkingText }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => { injectKF(); }, []);
  if (!thinkingText) return null;

  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '3px 0', outline: 'none', userSelect: 'none',
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: '#22C55E',
          display: 'inline-block', flexShrink: 0,
          boxShadow: '0 0 0 2px rgba(34,197,94,0.15)',
        }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
          Thought process
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'inline-flex', color: '#555' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="thinking-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 6, paddingTop: 10, borderTop: '1px solid #2A2A2A',
              fontSize: 12, color: '#6B7280', lineHeight: 1.8, fontFamily: 'Inter, sans-serif',
            }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p style={{ margin: '0 0 8px', color: '#6B7280', lineHeight: 1.8 }}>{children}</p>,
                  li: ({ children }) => <li style={{ marginBottom: 4, color: '#6B7280' }}>{children}</li>,
                  ul: ({ children }) => <ul style={{ paddingLeft: 16, marginBottom: 8 }}>{children}</ul>,
                  strong: ({ children }) => <strong style={{ color: '#999', fontWeight: 600 }}>{children}</strong>,
                }}
              >
                {thinkingText}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}