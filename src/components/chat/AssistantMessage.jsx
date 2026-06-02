import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ── Inject keyframes once ──
let _injected = false;
function injectStyles() {
  if (_injected) return; _injected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes ai-slide { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
    @keyframes thinking-dot {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
    @keyframes thinking-pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes scan-line {
      0% { transform: translateY(-100%); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(500%); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
}

// ── Animated "Thinking..." indicator shown while isGenerating ──
function ThinkingIndicator() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'ai-slide 200ms ease-out both' }}>
      {/* Thinking label with animated dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #F0EAFF 0%, #E8F0FF 100%)',
          border: '1px solid rgba(139,92,246,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles style={{ width: 13, height: 13, color: '#8B5CF6' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500, letterSpacing: '0.01em' }}>Thinking</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 4, height: 4, borderRadius: '50%', background: '#8B5CF6',
                display: 'inline-block',
                animation: `thinking-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 2 }}>
        {[
          { width: '82%', opacity: 0.9, delay: 0 },
          { width: '67%', opacity: 0.7, delay: 80 },
          { width: '45%', opacity: 0.4, delay: 160 },
        ].map((row, i) => (
          <div key={i} style={{
            width: row.width, height: 10, borderRadius: 6, opacity: row.opacity,
            background: 'linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 40%, #F9FAFB 60%, #E5E7EB 100%)',
            backgroundSize: '400px 100%',
            animation: `thinking-pulse 1.8s ease-in-out ${row.delay}ms infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Ultra-modern Thinking Accordion ──
function ThinkingAccordion({ thinkingText, autoOpen = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasAutoOpened = useRef(false);

  // Auto-open once when the component mounts with autoOpen=true
  useEffect(() => {
    if (autoOpen && !hasAutoOpened.current && thinkingText) {
      hasAutoOpened.current = true;
      setIsOpen(true);
      // Auto-close after 3.5s
      const t = setTimeout(() => setIsOpen(false), 3500);
      return () => clearTimeout(t);
    }
  }, [autoOpen, thinkingText]);

  if (!thinkingText) return null;

  const lineCount = thinkingText.split('\n').filter(l => l.trim()).length;

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Header button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7, width: '100%',
          background: isOpen
            ? 'linear-gradient(135deg, #FAF5FF 0%, #F0F4FF 100%)'
            : 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
          border: isOpen ? '1px solid rgba(139,92,246,0.2)' : '1px solid #EBEBEB',
          borderRadius: isOpen ? '10px 10px 0 0' : 10,
          padding: '8px 12px',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          outline: 'none',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          background: isOpen
            ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
            : 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.18s ease',
          boxShadow: isOpen ? '0 2px 8px rgba(139,92,246,0.3)' : 'none',
        }}>
          <Sparkles style={{ width: 11, height: 11, color: '#FFFFFF' }} />
        </div>

        {/* Label */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left' }}>
          <span style={{
            fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
            color: isOpen ? '#7C3AED' : '#6B7280',
            transition: 'color 0.18s',
          }}>
            Thinking process
          </span>
          <span style={{
            fontSize: 10.5, color: isOpen ? '#A78BFA' : '#9CA3AF',
            fontWeight: 400, letterSpacing: '0.01em',
          }}>
            · {lineCount} step{lineCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown style={{ width: 14, height: 14, color: isOpen ? '#8B5CF6' : '#9CA3AF' }} />
        </motion.div>
      </button>

      {/* Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #FAF5FF 0%, #F0F4FF 100%)',
              border: '1px solid rgba(139,92,246,0.15)',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              padding: '12px 14px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle scan line animation */}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
                animation: 'scan-line 3s ease-in-out infinite',
                pointerEvents: 'none',
              }} />

              {/* Left accent bar */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                background: 'linear-gradient(180deg, #8B5CF6 0%, #6366F1 50%, transparent 100%)',
                borderRadius: '0 0 0 10px',
              }} />

              {/* Content */}
              <div style={{
                paddingLeft: 10,
                fontSize: 11.5,
                color: '#6B7280',
                lineHeight: 1.75,
                fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 280,
                overflowY: 'auto',
              }}>
                {thinkingText.split('\n').map((line, i) => (
                  <div key={i} style={{
                    padding: '1px 0',
                    color: line.match(/^\d+\./) ? '#7C3AED' : '#6B7280',
                    fontWeight: line.match(/^\d+\./) ? 600 : 400,
                  }}>
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
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

/**
 * Parse <thinking>...</thinking> from text.
 */
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
  // Track if this is a freshly-received message (for auto-open)
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

  // While generating → show animated thinking indicator
  if (localGenerating) {
    return <ThinkingIndicator />;
  }

  if (!content) return null;
  const safeText = typeof content === 'string' ? content : JSON.stringify(content);

  // Parse <thinking> block from content
  const { thinkingText, finalText } = parseThinking(safeText);

  // Determine if this render is the first time content appears (for auto-open)
  const shouldAutoOpen = isNewMessage.current;
  if (shouldAutoOpen) isNewMessage.current = false;

  // ── "Interface ready" success indicator ──
  if (
    finalText.includes('Architecture generated') ||
    finalText.includes('Architecture successfully') ||
    finalText.includes('successfully recompiled') ||
    finalText.includes('✨ Architecture')
  ) {
    return (
      <div style={{ animation: 'ai-slide 150ms ease-out both' }}>
        {thinkingText && <ThinkingAccordion thinkingText={thinkingText} autoOpen={shouldAutoOpen} />}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111111', lineHeight: 1.2 }}>Interface ready</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#888888', lineHeight: 1.2 }}>Preview updated →</p>
          </div>
        </div>
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

  // Strip emojis
  const stripEmojis = (str) => str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E0}-\u{1F1FF}✨✓✗]/gu, '').trim();
  const cleanText = stripEmojis(finalText);

  // ── Normal message ──
  return (
    <div style={{ animation: 'ai-slide 150ms ease-out both' }}>
      {thinkingText && <ThinkingAccordion thinkingText={thinkingText} autoOpen={shouldAutoOpen} />}
      <div style={{ fontSize: 13, color: '#333333', lineHeight: 1.65, fontFamily: 'Inter, sans-serif' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanText}</ReactMarkdown>
      </div>
    </div>
  );
}