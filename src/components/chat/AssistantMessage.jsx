import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ── Inject keyframes once ──
let _injected = false;
function injectStyles() {
  if (_injected) return; _injected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes ai-slide { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer-text {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }
    @keyframes progress-bar {
      from { width: 0%; }
      to   { width: 100%; }
    }
  `;
  document.head.appendChild(s);
}

// ── Task 1: "Thinking..." with typewriter + Brain icon + shimmer light ──
function ThinkingIndicator() {
  const FULL_TEXT = 'Thinking...';
  const [displayed, setDisplayed] = useState('');
  const idxRef = useRef(0);

  useEffect(() => {
    injectStyles();
    idxRef.current = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      idxRef.current += 1;
      setDisplayed(FULL_TEXT.slice(0, idxRef.current));
      if (idxRef.current >= FULL_TEXT.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, animation: 'ai-slide 200ms ease-out both' }}>
      {/* Brain icon — same color as text, no effects */}
      <Brain style={{ width: 15, height: 15, flexShrink: 0, color: '#9CA3AF' }} />

      {/* Shimmer typewriter text */}
      <span style={{
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.01em',
        background: 'linear-gradient(90deg, #9CA3AF 0%, #6B7280 30%, #C4B5FD 50%, #9CA3AF 70%, #6B7280 100%)',
        backgroundSize: '400px 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shimmer-text 2s linear infinite',
        minWidth: 80,
      }}>
        {displayed}
      </span>
    </div>
  );
}

// ── Task 3: Code preview box — real rawContent, simulated scroll ──
function CodePreviewBox({ code }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const preRef = useRef(null);
  const idxRef = useRef(0);
  const SPEED = 4; // chars per tick (fast scroll feel)

  useEffect(() => {
    if (!code) return;
    idxRef.current = 0;
    setDisplayed('');
    setDone(false);
    const interval = setInterval(() => {
      idxRef.current = Math.min(idxRef.current + SPEED, code.length);
      setDisplayed(code.slice(0, idxRef.current));
      if (preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
      if (idxRef.current >= code.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [code]);

  const progress = code ? Math.round((displayed.length / code.length) * 100) : 0;

  return (
    <div style={{ marginTop: 10, marginBottom: 4 }}>
      {/* Code box — 6 lines tall */}
      <div style={{
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        background: '#FFFFFF',
        overflow: 'hidden',
      }}>
        <pre ref={preRef} style={{
          margin: 0,
          padding: '10px 14px',
          height: 126, // ~6 lines at 21px each
          overflowY: 'hidden',
          fontSize: 11,
          lineHeight: '21px',
          color: '#374151',
          fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
          whiteSpace: 'pre',
          wordBreak: 'normal',
          background: 'transparent',
        }}>
          {displayed}
        </pre>

        {/* Progress bar — single grey line */}
        <div style={{ height: 1, background: '#F3F4F6', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            background: '#9CA3AF',
            width: `${progress}%`,
            transition: 'width 0.1s linear',
            borderRadius: 1,
          }} />
        </div>

        {/* Footer */}
        <div style={{
          padding: '5px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'ui-monospace, monospace' }}>
            {done ? `${code.length.toLocaleString()} chars` : `${displayed.length.toLocaleString()} / ${code.length.toLocaleString()}`}
          </span>
          {done && (
            <motion.span
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 500 }}
            >
              Done
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Thinking accordion — clean, integrated, smooth ──
function ThinkingAccordion({ thinkingText, autoOpen = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (autoOpen && !hasAutoOpened.current && thinkingText) {
      hasAutoOpened.current = true;
      setIsOpen(true);
      const t = setTimeout(() => setIsOpen(false), 4000);
      return () => clearTimeout(t);
    }
  }, [autoOpen, thinkingText]);

  if (!thinkingText) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Trigger row */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '3px 0', outline: 'none',
          userSelect: 'none',
        }}
      >
        <Brain style={{ width: 13, height: 13, color: '#C4B5FD', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', letterSpacing: '0.01em', fontFamily: 'Inter, sans-serif' }}>
          Thinking
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          style={{ display: 'inline-flex', color: '#C4B5FD' }}
        >
          <ChevronDown style={{ width: 12, height: 12 }} />
        </motion.span>
      </button>

      {/* Accordion body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 6,
              padding: '14px 16px',
              background: '#FAFAF9',
              border: '1px solid #EBEBEA',
              borderLeft: '2px solid #C4B5FD',
              borderRadius: 8,
              fontSize: 12.5,
              color: '#4B5563',
              lineHeight: 1.85,
              maxHeight: 360,
              overflowY: 'auto',
              fontFamily: 'Inter, sans-serif',
            }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p style={{ margin: '0 0 10px 0', color: '#4B5563', lineHeight: 1.85 }}>{children}</p>,
                  li: ({ children }) => <li style={{ marginBottom: 6, color: '#4B5563', lineHeight: 1.8 }}>{children}</li>,
                  ul: ({ children }) => <ul style={{ paddingLeft: 18, marginBottom: 10 }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ paddingLeft: 18, marginBottom: 10 }}>{children}</ol>,
                  strong: ({ children }) => <strong style={{ color: '#111827', fontWeight: 600 }}>{children}</strong>,
                  h1: ({ children }) => <h1 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '14px 0 6px' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', margin: '12px 0 5px' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '10px 0 4px' }}>{children}</h3>,
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

// ── Package approval card ──
const PackageApprovalCard = ({ packages = [], onApprove, onReject }) => (
  <div style={{
    background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: 10,
    padding: '14px 16px', maxWidth: '92%', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginTop: 2,
  }}>
    <p style={{ fontSize: 14, fontWeight: 700, color: '#111111', margin: 0, lineHeight: 1.3 }}>Approval Required</p>
    <p style={{ fontSize: 12, color: '#777777', margin: '4px 0 0 0', lineHeight: 1.4 }}>Other tools will run after approval!</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
      {packages.map((pkg, i) => (
        <span key={i} style={{
          display: 'inline-block', alignSelf: 'flex-start', background: '#E85425', color: '#FFFFFF',
          borderRadius: 999, padding: '4px 10px', fontSize: 12, fontFamily: 'ui-monospace, monospace',
          lineHeight: 1.4, whiteSpace: 'nowrap',
        }}>{pkg}</span>
      ))}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
      <button onClick={onApprove}
        style={{ background: '#000000', color: '#FFFFFF', fontSize: 14, fontWeight: 600, borderRadius: 8, padding: '9px 0', border: 'none', cursor: 'pointer', width: '55%', transition: 'opacity 150ms' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Approve</button>
      <button onClick={onReject}
        style={{ background: '#FFFFFF', color: '#333333', fontSize: 14, fontWeight: 400, borderRadius: 8, padding: '9px 0', border: '1px solid #CCCCCC', cursor: 'pointer', width: '35%', transition: 'background 150ms' }}
        onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
        onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>Reject</button>
    </div>
  </div>
);

function parseThinking(rawText) {
  if (!rawText || typeof rawText !== 'string') return { thinkingText: null, finalText: rawText || '' };
  const thinkMatch = rawText.match(/<thinking>([\s\S]*?)<\/thinking>/i);
  const thinkingText = thinkMatch ? thinkMatch[1].trim() : null;
  const finalText = rawText.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
  return { thinkingText, finalText };
}

export default function AssistantMessage({ content, isGenerating, query, rawContent }) {
  const [localGenerating, setLocalGenerating] = useState(isGenerating);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const isNewMessage = useRef(true);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (isGenerating) {
      setLocalGenerating(true);
      isNewMessage.current = true;
    } else if (!isGenerating && localGenerating) {
      const t = setTimeout(() => setLocalGenerating(false), 200);
      return () => clearTimeout(t);
    }
  }, [isGenerating, localGenerating]);

  // Task 1: While generating → Brain + shimmer typewriter "Thinking..."
  if (localGenerating) {
    return <ThinkingIndicator />;
  }

  if (!content) return null;
  const safeText = typeof content === 'string' ? content : JSON.stringify(content);
  const { thinkingText, finalText } = parseThinking(safeText);

  const shouldAutoOpen = isNewMessage.current;
  if (shouldAutoOpen) isNewMessage.current = false;

  // ── "Interface ready" — show thinking accordion + real code preview ──
  if (
    finalText.includes('Architecture generated') ||
    finalText.includes('Architecture successfully') ||
    finalText.includes('successfully recompiled') ||
    finalText.includes('✨ Architecture')
  ) {
    // Extract raw code from rawContent (strip fences if present)
    let codeForPreview = rawContent || '';
    const fenceMatch = codeForPreview.match(/```(?:jsx|javascript|react)?\n?([\s\S]*?)```/);
    if (fenceMatch) codeForPreview = fenceMatch[1];

    return (
      <div style={{ animation: 'ai-slide 150ms ease-out both' }}>
        {thinkingText && <ThinkingAccordion thinkingText={thinkingText} autoOpen={shouldAutoOpen} />}
        {/* Task 3: real code scrolling box */}
        {codeForPreview && <CodePreviewBox code={codeForPreview} />}
      </div>
    );
  }

  // ── Package install detection ──
  const packageLines = finalText.match(/@[\w\-/.]+@[\^~\d.]+/g);
  if (packageLines && packageLines.length > 0 && !approved && !rejected) {
    const installIdx = finalText.search(/install\s+\d*\s*packages?:/i);
    const beforeInstall = installIdx > 0 ? finalText.substring(0, installIdx).trim() : null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'ai-slide 150ms ease-out both' }}>
        {thinkingText && <ThinkingAccordion thinkingText={thinkingText} autoOpen={shouldAutoOpen} />}
        {beforeInstall && <p style={{ fontSize: 13, color: '#333333', lineHeight: 1.65, margin: 0 }}>{beforeInstall}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4A90D9', flexShrink: 0, display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: '#333333' }}>Install {packageLines.length} package{packageLines.length > 1 ? 's' : ''}:</span>
        </div>
        <PackageApprovalCard packages={packageLines} onApprove={() => setApproved(true)} onReject={() => setRejected(true)} />
      </div>
    );
  }

  if (approved) return <p style={{ fontSize: 13, color: '#22C55E', margin: 0 }}>✓ Packages approved — installing…</p>;
  if (rejected) return <p style={{ fontSize: 13, color: '#EF4444', margin: 0 }}>✗ Installation cancelled.</p>;

  const stripEmojis = (str) => str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E0}-\u{1F1FF}✨✓✗]/gu, '').trim();
  const cleanText = stripEmojis(finalText);

  return (
    <div style={{ animation: 'ai-slide 150ms ease-out both' }}>
      {thinkingText && <ThinkingAccordion thinkingText={thinkingText} autoOpen={shouldAutoOpen} />}
      <div style={{ fontSize: 13, color: '#333333', lineHeight: 1.65, fontFamily: 'Inter, sans-serif' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanText}</ReactMarkdown>
      </div>
    </div>
  );
}