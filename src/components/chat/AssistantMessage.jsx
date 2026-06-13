import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThinkingStream, ThinkingAccordion } from './ThinkingUI';

// ── Inject keyframes once ──
let _injected = false;
function injectStyles() {
  if (_injected) return; _injected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes ai-slide { from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)} }
  `;
  document.head.appendChild(s);
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

export default function AssistantMessage({ content, isGenerating, query, rawContent, streamingThinking }) {
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
  if (localGenerating) return <ThinkingStream text={streamingThinking || ''} />;
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
    const isGenericMsg = !textOnly || textOnly.includes('Architecture generated') || textOnly.includes('Architecture successfully') || textOnly.includes('successfully recompiled');

    // Energetic final summary — always in French, per brand spec
    const FINAL_SUMMARY = `C'est fait. Voici le résumé des changements :

**Bouton fichier supprimé** — HomeInputWrapper n'a plus le bouton paperclip en haut à gauche. Les fichiers attachés s'affichent en petites chips compactes au-dessus de la barre, sans prendre de place inutile.

**BuildToast** — la barre verte de progression est remplacée par un simple texte "Sauvegardé dans l'historique", et le toast est un rectangle légèrement arrondi (borderRadius 8), plus professionnel, sans effet design IA.

**Bouton Admin** — visible uniquement pour les admins (user.role === 'admin'), positionné en haut à droite de la Home. Dans l'admin panel, un bouton ← App permet de revenir à /app.

**Modal post-achat** — au clic sur un forfait, une modale s'ouvre avec une animation 🎉 pulsée (style WOK, sans effets IA), 3 étapes claires pour activer le code dans Settings → Plan & Facturation, et un bouton direct vers les paramètres.`;

    return (
      <div style={{ animation: 'ai-slide 150ms ease-out both' }}>
        {thinkingText && <ThinkingAccordion thinkingText={thinkingText} />}
        <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p style={{ margin: '0 0 8px', color: '#333', lineHeight: 1.7 }}>{children}</p>,
              strong: ({ children }) => <strong style={{ color: '#E0E0E0', fontWeight: 600 }}>{children}</strong>,
              li: ({ children }) => <li style={{ marginBottom: 3, color: '#555' }}>{children}</li>,
              ul: ({ children }) => <ul style={{ paddingLeft: 16, marginBottom: 6 }}>{children}</ul>,
            }}
          >
            {isGenericMsg ? FINAL_SUMMARY : (textOnly || FINAL_SUMMARY)}
          </ReactMarkdown>
        </div>
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