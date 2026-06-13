/**
 * ThinkingUI — Premium "Thinking" component (Claude/Lovable style)
 * Shows a vertical animated task list while the AI works,
 * then collapses into the specific French final summary.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ── Keyframes injected once ──
let _injected = false;
function injectStyles() {
  if (_injected) return; _injected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes th-slide { from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)} }
    @keyframes th-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.85)} }
    @keyframes th-spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
    @keyframes th-glow  { 0%,100%{box-shadow:0 0 0 0 rgba(249,87,56,0)} 50%{box-shadow:0 0 0 4px rgba(249,87,56,0.18)} }
    @keyframes th-shimmer { 0%{background-position:-300px 0} 100%{background-position:300px 0} }
    @keyframes th-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
  `;
  document.head.appendChild(s);
}

// ── Task steps shown during thinking ──
const TASK_STEPS = [
  'Analysing the request structure…',
  'Mapping component architecture…',
  'Resolving layout dependencies…',
  'Generating UI logic…',
  'Optimising styles and tokens…',
  'Finalising component tree…',
];

// ── Active dot: glowing orange spinner ──
function ActiveDot() {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      border: '2px solid rgba(249,87,56,0.5)',
      borderTopColor: '#F95738',
      animation: 'th-spin 0.7s linear infinite, th-glow 1.4s ease-in-out infinite',
      display: 'inline-block',
    }} />
  );
}

// ── Done dot: solid green ──
function DoneDot() {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      background: '#22C55E', display: 'inline-block',
      boxShadow: '0 0 0 2px rgba(34,197,94,0.15)',
    }} />
  );
}

// ── Pending dot: dim grey ──
function PendingDot() {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      background: '#2A2A2A', border: '1px solid #333',
      display: 'inline-block',
    }} />
  );
}

// ── Live stream of thinking text ──
export function ThinkingStream({ text }) {
  useEffect(() => { injectStyles(); }, []);

  const [activeStep, setActiveStep] = useState(0);
  const stepTimerRef = useRef(null);

  // Advance task step every ~1.1s while streaming
  useEffect(() => {
    stepTimerRef.current = setInterval(() => {
      setActiveStep(prev => (prev < TASK_STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(stepTimerRef.current);
  }, []);

  return (
    <div style={{ animation: 'th-slide 180ms ease-out both', fontFamily: 'Inter, sans-serif' }}>
      {/* Header label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: '#F95738',
          animation: 'th-pulse 1.2s ease-in-out infinite', display: 'inline-block', flexShrink: 0,
        }} />
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'linear-gradient(90deg, #9CA3AF 0%, #6B7280 30%, #B0BEC5 50%, #9CA3AF 70%, #6B7280 100%)',
          backgroundSize: '300px 100%',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'th-shimmer 2s linear infinite',
        }}>
          Thinking
        </span>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TASK_STEPS.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          const isPending = i > activeStep;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: isPending ? 0.28 : 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.06 }}
              style={{ display: 'flex', alignItems: 'center', gap: 9 }}
            >
              {isDone && <DoneDot />}
              {isActive && <ActiveDot />}
              {isPending && <PendingDot />}
              <span style={{
                fontSize: 12,
                fontWeight: isActive ? 500 : 400,
                color: isDone ? '#555' : isActive ? '#E0E0E0' : '#333',
                lineHeight: 1.4,
                fontFamily: 'Inter, sans-serif',
                transition: 'color 200ms',
              }}>
                {step}
              </span>
              {/* 1-sentence live thought for active step */}
              {isActive && text?.trim() && (
                <span style={{
                  fontSize: 11, color: '#555', fontStyle: 'italic', marginLeft: 4,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180,
                }}>
                  — {text.trim().split('\n')[0].slice(0, 60)}
                  <span style={{ display: 'inline-block', width: 5, height: 10, background: '#444', borderRadius: 1, marginLeft: 2, verticalAlign: 'middle', animation: 'th-cursor 1s ease-in-out infinite' }} />
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Collapsible accordion shown after generation ──
export function ThinkingAccordion({ thinkingText }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => { injectStyles(); }, []);

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