import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ── Inject keyframes once ──
let _injected = false;
function injectStyles() {
  if (_injected) return; _injected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes ai-slide { from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)} }
    @keyframes streaming-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes pulse-dot { 0%,100%{opacity:0.3;transform:scale(0.85)} 50%{opacity:1;transform:scale(1)} }
  `;
  document.head.appendChild(s);
}

// ── AccordionBlock: shared design for "Initialising" and "Building" ──
function AccordionBlock({ label, isOpen, onToggle, children, defaultOpen = false }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '2px 0', outline: 'none', userSelect: 'none', width: '100%',
        }}
      >
        {/* Notch/chevron */}
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          style={{ display: 'inline-flex', color: '#3A3A3A', flexShrink: 0 }}
        >
          <ChevronDown style={{ width: 11, height: 11 }} />
        </motion.span>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#4A4A4A', fontFamily: 'Inter, sans-serif',
        }}>
          {label}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 8, paddingLeft: 18 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Phase A+B+C: Streaming generation state ──
function ThinkingStream({ text, rawCode }) {
  const [initialisingOpen, setInitialisingOpen] = useState(true);
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [showBuilding, setShowBuilding] = useState(false);
  const [delayDone, setDelayDone] = useState(false);
  const prevLenRef = useRef(0);
  const delayTimerRef = useRef(null);
  const streamingRef = useRef(false);

  // Stream text char-by-char as it arrives
  useEffect(() => {
    if (!text) { setStreamedText(''); return; }
    if (text.length <= prevLenRef.current) return;

    const newChars = text.slice(prevLenRef.current);
    prevLenRef.current = text.length;

    let i = 0;
    streamingRef.current = true;
    const tick = () => {
      if (i >= newChars.length) { streamingRef.current = false; return; }
      const ch = newChars[i];
      setStreamedText(prev => prev + ch);
      i++;
      const delay = ch === ' ' ? 12 : (/[.!?]/.test(ch) ? 55 : 22);
      setTimeout(tick, delay);
    };
    tick();
  }, [text]);

  // Phase B: 2500ms delay after text is fully received, then show Building
  useEffect(() => {
    if (!text || streamedText.length < text.length) return;
    if (delayTimerRef.current) return; // already scheduled
    delayTimerRef.current = setTimeout(() => {
      setDelayDone(true);
      setShowBuilding(true);
    }, 2700);
    return () => {};
  }, [text, streamedText]);

  // Typewriter for code in Building panel
  const [typedCode, setTypedCode] = useState('');
  useEffect(() => {
    if (!buildingOpen || !rawCode) return;
    setTypedCode('');
    const clean = rawCode.replace(/^```(?:jsx|javascript|react)?\n?/, '').replace(/\n?```$/, '');
    let i = 0;
    const iv = setInterval(() => {
      i += 8;
      setTypedCode(clean.slice(0, i));
      if (i >= clean.length) clearInterval(iv);
    }, 8);
    return () => clearInterval(iv);
  }, [buildingOpen, rawCode]);

  // Initial shimmer state before any text
  if (!streamedText && !text) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, animation: 'ai-slide 200ms ease-out both' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width: 4, height: 4, borderRadius: '50%', background: '#444', display: 'inline-block',
              animation: `pulse-dot 1.2s ease-in-out infinite`, animationDelay: `${i * 0.18}s`,
            }} />
          ))}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3A3A3A', fontFamily: 'Inter, sans-serif' }}>
          Initialising
        </span>
      </div>
    );
  }

  return (
    <div style={{ animation: 'ai-slide 200ms ease-out both' }}>

      {/* Phase A: Initialising accordion */}
      <AccordionBlock label="Initialising" isOpen={initialisingOpen} onToggle={() => setInitialisingOpen(o => !o)}>
        <p style={{
          margin: 0, fontSize: 12, lineHeight: 1.75,
          color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 400,
        }}>
          {streamedText}
          {/* Blinking cursor while still streaming */}
          {streamedText.length < (text || '').length && (
            <span style={{
              display: 'inline-block', width: 6, height: 12, background: '#555',
              borderRadius: 1, marginLeft: 2, verticalAlign: 'middle',
              animation: 'streaming-cursor 0.8s ease-in-out infinite',
            }} />
          )}
        </p>
      </AccordionBlock>

      {/* Phase C: Building accordion — appears after 2700ms delay */}
      <AnimatePresence>
        {showBuilding && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <AccordionBlock label="Building" isOpen={buildingOpen} onToggle={() => setBuildingOpen(o => !o)}>
              {/* Raw canvas: unstyled, minimal, raw code only */}
              <div style={{
                background: 'transparent',
                border: '1px solid #2A2A2A',
                borderRadius: 6,
                overflow: 'hidden',
              }}>
                <pre style={{
                  margin: 0, padding: '10px 12px',
                  maxHeight: 160, overflowY: 'auto',
                  fontSize: 10.5, lineHeight: '18px',
                  color: '#E0E0E0',
                  fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
                  whiteSpace: 'pre', wordBreak: 'normal',
                  background: 'transparent',
                }}>
                  {typedCode || (rawCode ? '' : '...')}
                  {rawCode && typedCode.length < rawCode.replace(/^```(?:jsx|javascript|react)?\n?/, '').replace(/\n?```$/, '').length && (
                    <span style={{
                      display: 'inline-block', width: 6, height: 11, background: '#F95738',
                      borderRadius: 1, marginLeft: 1, verticalAlign: 'middle',
                      animation: 'streaming-cursor 0.5s ease-in-out infinite',
                    }} />
                  )}
                </pre>
              </div>
            </AccordionBlock>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Post-generation: Initialising (collapsed) + Building (collapsed) + finale sentence ──
function CompletedGenerationView({ thinkingText, rawContent }) {
  const [initialisingOpen, setInitialisingOpen] = useState(false);
  const [buildingOpen, setBuildingOpen] = useState(false);

  const cleanCode = (rawContent || '').replace(/^```(?:jsx|javascript|react)?\n?/, '').replace(/\n?```$/, '');

  return (
    <div style={{ animation: 'ai-slide 150ms ease-out both' }}>
      {/* Initialising — collapsed, shows the thinking text */}
      {thinkingText && (
        <AccordionBlock label="Initialising" isOpen={initialisingOpen} onToggle={() => setInitialisingOpen(o => !o)}>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.75, color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
            {thinkingText}
          </p>
        </AccordionBlock>
      )}

      {/* Building — collapsed, shows raw source */}
      {rawContent && (
        <AccordionBlock label="Building" isOpen={buildingOpen} onToggle={() => setBuildingOpen(o => !o)}>
          <div style={{ background: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, overflow: 'hidden' }}>
            <pre style={{
              margin: 0, padding: '10px 12px',
              maxHeight: 160, overflowY: 'auto',
              fontSize: 10.5, lineHeight: '18px',
              color: '#E0E0E0',
              fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
              whiteSpace: 'pre', wordBreak: 'normal', background: 'transparent',
            }}>
              {cleanCode}
            </pre>
          </div>
        </AccordionBlock>
      )}

      {/* Phase D: Finale sentence */}
      <p style={{
        margin: '10px 0 0 0', fontSize: 12.5, fontWeight: 500,
        color: '#5A5A5A', fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
      }}>
        Interface successfully architected and deployed.
      </p>
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

  // While generating → Phase A/B/C
  if (localGenerating) return <ThinkingStream text={streamingThinking || ''} rawCode={streamingRawCode} />;
  if (!content) return null;

  const safeText = typeof content === 'string' ? content : JSON.stringify(content);
  const { thinkingText, finalText } = parseThinking(safeText);
  if (isNewMessage.current) isNewMessage.current = false;

  // ── Code generation result → Phase D view ──
  const isCodeResult = !!rawContent;
  if (isCodeResult) {
    return <CompletedGenerationView thinkingText={thinkingText} rawContent={rawContent} />;
  }

  // ── Package install ──
  const packageLines = finalText.match(/@[\w\-/.]+@[\^~\d.]+/g);
  if (packageLines && packageLines.length > 0 && !approved && !rejected) {
    const installIdx = finalText.search(/install\s+\d*\s*packages?:/i);
    const beforeInstall = installIdx > 0 ? finalText.substring(0, installIdx).trim() : null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'ai-slide 150ms ease-out both' }}>
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

  return (
    <div style={{ animation: 'ai-slide 150ms ease-out both' }}>
      <div style={{ fontSize: 13, color: '#333333', lineHeight: 1.65, fontFamily: 'Inter, sans-serif' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{stripEmojis(finalText)}</ReactMarkdown>
      </div>
    </div>
  );
}