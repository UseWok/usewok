/**
 * ThinkingUI — Claude "Extended Thinking" exact style
 * 
 * Mirrors Claude.ai:
 * - "Réflexion" collapsible section at top
 * - Grayed, italic internal monologue text (type: "thinking")
 * - Normal text response below (type: "text")
 * - Spinning indicator while active
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

let _ki = false;
function injectKF() {
  if (_ki) return; _ki = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes th-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes th-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes th-dot { 0%,80%,100%{opacity:0.3;transform:scale(0.7)} 40%{opacity:1;transform:scale(1)} }
  `;
  document.head.appendChild(s);
}

function SpinnerIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" style={{ animation: 'th-spin 1.2s linear infinite', flexShrink: 0 }}>
      <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="rgba(156,163,175,0.2)" strokeWidth="1.5"/>
      <path d="M 6.5 1.5 A 5 5 0 0 1 11.5 6.5" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ThinkingDots() {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, marginLeft:5, verticalAlign:'middle' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:3, height:3, borderRadius:'50%', background:'#6B7280', display:'inline-block',
          animation:`th-dot 1.2s ease-in-out ${i*0.18}s infinite`,
        }}/>
      ))}
    </span>
  );
}

// Build steps — animated sequence shown during generation
const BUILD_STEPS = [
  { label: 'Analyse de la requête', duration: 1200 },
  { label: 'Construction de l\'architecture', duration: 2000 },
  { label: 'Génération du code', duration: 3500 },
  { label: 'Validation des imports', duration: 900 },
  { label: 'Compilation React', duration: 800 },
];

function BuildStepsIndicator({ text }) {
  const [stepIdx, setStepIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let idx = 0;
    const advance = () => {
      if (idx < BUILD_STEPS.length - 1) {
        idx++;
        setStepIdx(idx);
        timerRef.current = setTimeout(advance, BUILD_STEPS[idx].duration);
      }
    };
    timerRef.current = setTimeout(advance, BUILD_STEPS[0].duration);
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {BUILD_STEPS.map((step, i) => {
        const done = i < stepIdx;
        const active = i === stepIdx;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: i <= stepIdx ? 1 : 0.25, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {done ? (
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            ) : active ? (
              <SpinnerIcon />
            ) : (
              <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #2A2A2A', flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 12, color: done ? '#22C55E' : active ? '#ccc' : '#3A3A3A', fontWeight: active ? 500 : 400, fontFamily: 'Inter, sans-serif' }}>
              {step.label}
              {active && <ThinkingDots />}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * ThinkingStream — shown WHILE generating.
 * Affiche les steps de build animés + le texte de réflexion en streaming.
 */
export function ThinkingStream({ text }) {
  useEffect(() => { injectKF(); }, []);
  const [showThinking, setShowThinking] = useState(false);

  // Auto-show thinking section once text starts flowing
  useEffect(() => {
    if (text && text.length > 20) setShowThinking(true);
  }, [text]);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>
      {/* Build steps — always visible during generation */}
      <div style={{
        padding: '12px 14px',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        marginBottom: showThinking ? 8 : 0,
      }}>
        <BuildStepsIndicator text={text} />
      </div>

      {/* Thinking stream — collapsible once text flows */}
      <AnimatePresence>
        {showThinking && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <button
              onClick={() => setShowThinking(v => !v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0', marginBottom: 5 }}
            >
              <SpinnerIcon />
              <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280' }}>Réflexion en cours</span>
            </button>
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 8,
              fontSize: 12, color: '#4B5563', lineHeight: 1.75,
              fontStyle: 'italic', maxHeight: 160, overflowY: 'auto',
            }}>
              {text}
              <span style={{ display: 'inline-block', width: 1.5, height: 10, background: '#6B7280', borderRadius: 1, marginLeft: 2, verticalAlign: 'middle', animation: 'th-cursor 0.85s ease-in-out infinite' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ThinkingAccordion — shown AFTER generation.
 * Collapsible "Réflexion" block, grayed italic, exactly like Claude.ai.
 * Green dot = completed thinking block.
 */
export function ThinkingAccordion({ thinkingText }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { injectKF(); }, []);
  if (!thinkingText) return null;

  return (
    <div style={{ marginBottom:10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:'inline-flex', alignItems:'center', gap:6,
          background:'none', border:'none', cursor:'pointer',
          padding:'3px 0', outline:'none', userSelect:'none',
        }}
      >
        {/* Green dot — completed */}
        <span style={{
          width:7, height:7, borderRadius:'50%', background:'#22C55E',
          display:'inline-block', flexShrink:0,
          boxShadow:'0 0 0 2px rgba(34,197,94,0.15)',
        }}/>
        <span style={{ fontSize:12, fontWeight:500, color:'#6B7280', fontFamily:'Inter, sans-serif' }}>
          Réflexion
        </span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration:0.14 }}
          style={{ display:'inline-flex', color:'#4B5563' }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="th-body"
            initial={{ height:0, opacity:0 }}
            animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.18, ease:[0.4,0,0.2,1] }}
            style={{ overflow:'hidden' }}
          >
            <div style={{
              marginTop:6, padding:'10px 12px',
              background:'rgba(255,255,255,0.025)',
              border:'1px solid rgba(255,255,255,0.05)',
              borderRadius:8,
              fontSize:12, color:'#6B7280', lineHeight:1.8,
              fontStyle:'italic', fontFamily:'Inter, sans-serif',
            }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p style={{ margin:'0 0 6px', color:'#6B7280', lineHeight:1.8 }}>{children}</p>,
                  li: ({ children }) => <li style={{ marginBottom:3, color:'#6B7280' }}>{children}</li>,
                  ul: ({ children }) => <ul style={{ paddingLeft:14, marginBottom:6 }}>{children}</ul>,
                  strong: ({ children }) => <strong style={{ color:'#9CA3AF', fontWeight:600, fontStyle:'normal' }}>{children}</strong>,
                  code: ({ children }) => <code style={{ color:'#9CA3AF', fontStyle:'normal', fontSize:11 }}>{children}</code>,
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