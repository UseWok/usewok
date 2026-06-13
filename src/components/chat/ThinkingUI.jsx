/**
 * ThinkingUI — Claude "Extended Thinking" exact style
 * 
 * Mirrors Claude.ai:
 * - "Réflexion" collapsible section at top
 * - Grayed, italic internal monologue text (type: "thinking")
 * - Normal text response below (type: "text")
 * - Spinning indicator while active
 */

import { useState, useEffect, useRef } from 'react';
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

/**
 * ThinkingStream — shown WHILE generating.
 * Streams the internal monologue character by character, grayed italic.
 * Exactly like Claude's "Réflexion" block while thinking.
 */
export function ThinkingStream({ text }) {
  useEffect(() => { injectKF(); }, []);
  const [open, setOpen] = useState(true);

  return (
    <div style={{ fontFamily:'Inter, sans-serif', marginBottom:10 }}>
      {/* Header — "Réflexion" style toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:'inline-flex', alignItems:'center', gap:7,
          background:'none', border:'none', cursor:'pointer',
          padding:'2px 0', outline:'none', userSelect:'none',
        }}
      >
        <SpinnerIcon />
        <span style={{ fontSize:12, fontWeight:500, color:'#6B7280', letterSpacing:'-0.01em' }}>
          Réflexion{!text && <ThinkingDots />}
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
            key="th-stream"
            initial={{ height:0, opacity:0 }}
            animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.16, ease:[0.4,0,0.2,1] }}
            style={{ overflow:'hidden' }}
          >
            <div style={{
              marginTop:6, padding:'9px 12px',
              background:'rgba(255,255,255,0.025)',
              border:'1px solid rgba(255,255,255,0.05)',
              borderRadius:8,
              fontSize:12, color:'#6B7280', lineHeight:1.8,
              fontStyle:'italic', fontFamily:'Inter, sans-serif',
              maxHeight:200, overflowY:'auto',
            }}>
              {text ? (
                <>
                  {text}
                  <span style={{
                    display:'inline-block', width:1.5, height:11,
                    background:'#6B7280', borderRadius:1, marginLeft:2,
                    verticalAlign:'middle',
                    animation:'th-cursor 0.85s ease-in-out infinite',
                  }}/>
                </>
              ) : (
                <span style={{ color:'#4B5563' }}>
                  Analyse de votre requête<ThinkingDots />
                </span>
              )}
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