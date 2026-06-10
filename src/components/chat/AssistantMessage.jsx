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
    @keyframes ai-slide { from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer-text {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }
    @keyframes streaming-cursor {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `;
  document.head.appendChild(s);
}

// ── Irregular delays per phrase index (ms) ──
const PHRASE_DELAYS = [0, 1600, 2800, 4400, 5800];

// ── Thinking streaming display (while generating) ──
function ThinkingStream({ text, rawCode }) {
  const [visiblePhrases, setVisiblePhrases] = useState([]);
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [typedCode, setTypedCode] = useState('');
  const prevTextRef = useRef('');
  const timersRef = useRef([]);

  // Parse phrases from the streamed text
  const phrases = (text || '').split('\n').map(l => l.trim()).filter(Boolean);

  // When a new phrase appears, schedule its display
  useEffect(() => {
    if (phrases.length === 0) { setVisiblePhrases([]); return; }
    // Clear old timers only when phrase count increases
    if (phrases.length > prevTextRef.current) {
      prevTextRef.current = phrases.length;
      // Show each phrase at an irregular staggered delay
      phrases.forEach((p, i) => {
        if (visiblePhrases.includes(p)) return;
        const t = setTimeout(() => {
          setVisiblePhrases(prev => prev.includes(p) ? prev : [...prev, p]);
        }, PHRASE_DELAYS[i] || i * 1400);
        timersRef.current.push(t);
      });
    }
    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  }, [phrases.length]);

  // Typewriter effect for code
  useEffect(() => {
    if (!buildingOpen || !rawCode) return;
    setTypedCode('');
    const clean = rawCode.replace(/^```(?:jsx|javascript|react)?\n?/, '').replace(/\n?```$/, '');
    let i = 0;
    const interval = setInterval(() => {
      i += 6; // 6 chars per tick — very fast
      setTypedCode(clean.slice(0, i));
      if (i >= clean.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [buildingOpen, rawCode]);

  const showBuilding = visiblePhrases.length >= 3;

  if (visiblePhrases.length === 0 && !text) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, animation: 'ai-slide 200ms ease-out both' }}>
        <Brain style={{ width: 13, height: 13, flexShrink: 0, color: '#6B7280', opacity: 0.7 }} />
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          background: 'linear-gradient(90deg, #9CA3AF 0%, #6B7280 30%, #A8B5C8 50%, #9CA3AF 70%, #6B7280 100%)',
          backgroundSize: '400px 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', animation: 'shimmer-text 2s linear infinite',
        }}>
          Initialising...
        </span>
        <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#555', display: 'inline-block', animation: `shimmer-text 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
          ))}
        </span>
      </div>
    );
  }

  return (
    <div style={{ animation: 'ai-slide 200ms ease-out both' }}>
      {/* Phrases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: showBuilding ? 12 : 0 }}>
        <AnimatePresence>
          {visiblePhrases.map((phrase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#333', flexShrink: 0, marginTop: 6 }} />
              <span style={{ fontSize: 12.5, color: '#777', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>{phrase}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor on last phrase while more are pending */}
        {visiblePhrases.length > 0 && visiblePhrases.length < phrases.length && (
          <span style={{ display: 'inline-block', width: 7, height: 13, background: '#444', borderRadius: 1, marginLeft: 13, verticalAlign: 'middle', animation: 'streaming-cursor 1s ease-in-out infinite' }} />
        )}
      </div>

      {/* Building button — appears at phrase 3+ */}
      <AnimatePresence>
        {showBuilding && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setBuildingOpen(o => !o)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', border: '1px solid #2A2A2A', borderRadius: 7,
                background: buildingOpen ? '#1E1E1E' : 'transparent',
                cursor: 'pointer', fontSize: 11, fontWeight: 600, color: buildingOpen ? '#ccc' : '#555',
                fontFamily: 'Inter, sans-serif', transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1E1E1E'; e.currentTarget.style.color = '#aaa'; }}
              onMouseLeave={e => { if (!buildingOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555'; } }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F95738', animation: buildingOpen ? 'none' : 'streaming-cursor 1.5s ease-in-out infinite' }} />
              Building
              <motion.span animate={{ rotate: buildingOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'inline-flex', color: '#555' }}>
                <ChevronDown style={{ width: 11, height: 11 }} />
              </motion.span>
            </button>

            <AnimatePresence>
              {buildingOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden', marginTop: 8 }}
                >
                  <div style={{ border: '1px solid #2A2A2A', borderRadius: 10, background: '#141414', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderBottom: '1px solid #2A2A2A', background: '#1A1A1A' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#333' }} />
                      <span style={{ fontSize: 11, color: '#444', fontFamily: 'ui-monospace, monospace' }}>component.jsx</span>
                    </div>
                    <pre style={{
                      margin: 0, padding: '12px 14px', height: 130, overflowY: 'auto',
                      fontSize: 11, lineHeight: '19px', color: '#FFFFFF',
                      fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
                      whiteSpace: 'pre', wordBreak: 'normal', background: 'transparent',
                    }}>
                      {typedCode || 'En construction...'}
                      {typedCode && typedCode.length < (rawCode || '').length && (
                        <span style={{ display: 'inline-block', width: 7, height: 13, background: '#F95738', borderRadius: 1, marginLeft: 1, verticalAlign: 'middle', animation: 'streaming-cursor 0.6s ease-in-out infinite' }} />
                      )}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Thinking accordion — open by default, collapsible ──
function ThinkingAccordion({ thinkingText }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!thinkingText) return null;

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '3px 0', outline: 'none', userSelect: 'none',
        }}
      >
        <Brain style={{ width: 13, height: 13, color: '#6B7280', flexShrink: 0, opacity: 0.7 }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', letterSpacing: '0.01em', fontFamily: 'Inter, sans-serif', opacity: 0.7 }}>
          Thinking
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ display: 'inline-flex', color: '#9CA3AF', opacity: 0.7 }}
        >
          <ChevronDown style={{ width: 12, height: 12 }} />
        </motion.span>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="thinking-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 6,
              paddingTop: 10,
              borderTop: '1px solid #E5E7EB',
              fontSize: 12.5,
              color: '#6B7280',
              lineHeight: 1.8,
              fontFamily: 'Inter, sans-serif',
            }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p style={{ margin: '0 0 8px 0', color: '#6B7280', lineHeight: 1.8 }}>{children}</p>,
                  li: ({ children }) => <li style={{ marginBottom: 4, color: '#6B7280' }}>{children}</li>,
                  ul: ({ children }) => <ul style={{ paddingLeft: 16, marginBottom: 8 }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ paddingLeft: 16, marginBottom: 8 }}>{children}</ol>,
                  strong: ({ children }) => <strong style={{ color: '#374151', fontWeight: 600 }}>{children}</strong>,
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

// ── Code preview box — appears after generation, dark transparent bg, white text ──
function CodePreviewBox({ code }) {
  const preRef = useRef(null);

  // Trim fences if present
  const cleanCode = code?.replace(/^```(?:jsx|javascript|react)?\n?/, '').replace(/\n?```$/, '') || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ marginTop: 8 }}
    >
      <div style={{
        border: '1px solid #2A2A2A',
        borderRadius: 10,
        background: '#181818', // matches app background
        overflow: 'hidden',
      }}>
        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderBottom: '1px solid #2A2A2A',
          background: '#1E1E1E',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#333' }} />
          <span style={{ fontSize: 11, color: '#444', fontFamily: 'ui-monospace, monospace' }}>component.jsx</span>
        </div>
        <pre ref={preRef} style={{
          margin: 0, padding: '12px 14px',
          height: 140,
          overflowY: 'auto',
          fontSize: 11, lineHeight: '20px',
          color: '#FFFFFF',
          fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
          whiteSpace: 'pre', wordBreak: 'normal',
          background: 'transparent',
        }}>
          {cleanCode}
        </pre>
      </div>
    </motion.div>
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

export default function AssistantMessage({ content, isGenerating, query, rawContent, streamingThinking, streamingRawCode }) {
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

  // While generating → show thinking stream in real time
  if (localGenerating) return <ThinkingStream text={streamingThinking || ''} rawCode={streamingRawCode} />;
  if (!content) return null;

  const safeText = typeof content === 'string' ? content : JSON.stringify(content);
  const { thinkingText, finalText } = parseThinking(safeText);
  const shouldAutoOpen = isNewMessage.current;
  if (shouldAutoOpen) isNewMessage.current = false;

  // ── Code generation result — rawContent present means code was generated ──
  const isCodeResult = !!rawContent || finalText.includes('Architecture generated') || finalText.includes('Architecture successfully') || finalText.includes('successfully recompiled');

  if (isCodeResult) {
    // Strip any raw code blocks from the display text — code shows only in the box
    const codeBlockRegex = /```(?:jsx|javascript|react)?\n?[\s\S]*?```/g;
    const textOnly = finalText.replace(codeBlockRegex, '').trim();

    return (
      <div style={{ animation: 'ai-slide 150ms ease-out both' }}>
        {thinkingText && <ThinkingAccordion thinkingText={thinkingText} />}
        {textOnly && !textOnly.includes('Architecture generated') && !textOnly.includes('Architecture successfully') && (
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{textOnly}</ReactMarkdown>
          </div>
        )}
        {rawContent && <CodePreviewBox code={rawContent} />}
      </div>
    );
  }

  // ── Package install ──
  const packageLines = finalText.match(/@[\w\-/.]+@[\^~\d.]+/g);
  if (packageLines && packageLines.length > 0 && !approved && !rejected) {
    const installIdx = finalText.search(/install\s+\d*\s*packages?:/i);
    const beforeInstall = installIdx > 0 ? finalText.substring(0, installIdx).trim() : null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'ai-slide 150ms ease-out both' }}>
        {thinkingText && <ThinkingAccordion thinkingText={thinkingText} />}
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
      {thinkingText && <ThinkingAccordion thinkingText={thinkingText} />}
      <div style={{ fontSize: 13, color: '#333333', lineHeight: 1.65, fontFamily: 'Inter, sans-serif' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanText}</ReactMarkdown>
      </div>
    </div>
  );
}