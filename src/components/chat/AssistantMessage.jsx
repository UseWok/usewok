import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Inject keyframes once
let _injected = false;
function injectStyles() {
  if (_injected) return; _injected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes ai-shimmer { 0%{background-position:-600px 0}50%{background-position:600px 0}100%{background-position:-600px 0} }
    @keyframes ai-slide { from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)} }
    @keyframes ai-halo { 0%,100%{box-shadow:0 0 0 0 rgba(200,200,200,0)}50%{box-shadow:0 0 20px 8px rgba(220,220,220,0.15)} }
  `;
  document.head.appendChild(s);
}

const SkeletonLine = ({ width, delay, height = 12, opacity = 1 }) => (
  <div style={{
    width, height, opacity, borderRadius: 8, flexShrink: 0,
    background: 'linear-gradient(90deg, #E8E8E8 0%, #F8F8F8 25%, #FFFFFF 50%, #F8F8F8 75%, #E8E8E8 100%)',
    backgroundSize: '600px 100%',
    animation: `ai-shimmer 2s ease-in-out infinite, ai-slide 200ms ease-out ${delay}ms both, ai-halo 2s ease-in-out infinite`,
    filter: 'blur(0.3px)',
  }} />
);

const SKELETON_ROWS = [
  { width: '86%', delay: 0 },
  { width: '70%', delay: 60 },
  { width: '50%', delay: 120, height: 9, opacity: 0.45 },
  { width: '78%', delay: 180 },
  { width: '42%', delay: 240 },
];

// ── Package approval card — exact pixel spec from image ──
const PackageApprovalCard = ({ packages = [], onApprove, onReject }) => (
  <div style={{
    background: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: 10,
    padding: '14px 16px',
    maxWidth: '92%',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    marginTop: 2,
  }}>
    {/* Title */}
    <p style={{ fontSize: 14, fontWeight: 700, color: '#111111', margin: 0, lineHeight: 1.3 }}>
      Approval Required
    </p>
    {/* Subtitle */}
    <p style={{ fontSize: 12, color: '#777777', margin: '4px 0 0 0', lineHeight: 1.4 }}>
      Other tools will run after approval!
    </p>
    {/* Pills — solid coral-orange, full pill, white text */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
      {packages.map((pkg, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            alignSelf: 'flex-start',
            background: '#E85425',
            color: '#FFFFFF',
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: 12,
            fontFamily: 'ui-monospace, monospace',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
          }}
        >
          {pkg}
        </span>
      ))}
    </div>
    {/* Buttons */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
      <button
        onClick={onApprove}
        style={{
          background: '#000000', color: '#FFFFFF',
          fontSize: 14, fontWeight: 600,
          borderRadius: 8, padding: '9px 0',
          border: 'none', cursor: 'pointer',
          width: '55%', transition: 'opacity 150ms',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Approve
      </button>
      <button
        onClick={onReject}
        style={{
          background: '#FFFFFF', color: '#333333',
          fontSize: 14, fontWeight: 400,
          borderRadius: 8, padding: '9px 0',
          border: '1px solid #CCCCCC', cursor: 'pointer',
          width: '35%', transition: 'background 150ms',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
        onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
      >
        Reject
      </button>
    </div>
  </div>
);

export default function AssistantMessage({ content, isGenerating, query }) {
  const [localGenerating, setLocalGenerating] = useState(isGenerating);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (isGenerating) {
      setElapsedSecs(0);
      const interval = setInterval(() => setElapsedSecs(s => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (isGenerating) {
      setLocalGenerating(true);
    } else if (!isGenerating && localGenerating) {
      const t = setTimeout(() => setLocalGenerating(false), 200);
      return () => clearTimeout(t);
    }
  }, [isGenerating, localGenerating]);

  // ── Generating: thinking row + skeleton with halo ──
  if (localGenerating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'ai-slide 200ms ease-out both' }}>
        {/* Thinking row — subtle gray with animated dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.span
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #E0E0E0, #F5F5F5)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, color: '#888888', fontStyle: 'italic', fontWeight: 400 }}>
            Thinking for {elapsedSecs}s...
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SKELETON_ROWS.map((row, i) => <SkeletonLine key={i} {...row} />)}
        </div>
      </div>
    );
  }

  if (!content) return null;
  const safeText = typeof content === 'string' ? content : JSON.stringify(content);

  // ── "Interface ready" success indicator ──
  if (
    safeText.includes('✨ Architecture') ||
    safeText.includes('Architecture generated') ||
    safeText.includes('Architecture successfully') ||
    safeText.includes('successfully recompiled')
  ) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', animation: 'ai-slide 150ms ease-out both' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111111', lineHeight: 1.2 }}>Interface ready</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#888888', lineHeight: 1.2 }}>Preview updated →</p>
        </div>
      </div>
    );
  }

  // ── Package install detection ──
  const packageLines = safeText.match(/@[\w\-/.]+@[\^~\d.]+/g);

  if (packageLines && packageLines.length > 0 && !approved && !rejected) {
    // Extract text before "Install N packages:" line
    const installIdx = safeText.search(/install\s+\d*\s*packages?:/i);
    const beforeInstall = installIdx > 0 ? safeText.substring(0, installIdx).trim() : null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'ai-slide 150ms ease-out both' }}>
        {/* Prior text (e.g. "I'll install React Three Fiber...") */}
        {beforeInstall && (
          <p style={{ fontSize: 13, color: '#333333', lineHeight: 1.65, margin: 0 }}>{beforeInstall}</p>
        )}
        {/* Action row: blue dot + package icon + bold text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4A90D9', flexShrink: 0, display: 'inline-block' }} />
          {/* Package icon (circle with dot) */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <span style={{ fontSize: 13, color: '#333333' }}>
            Install {packageLines.length} package{packageLines.length > 1 ? 's' : ''}:
            <span style={{ fontWeight: 700 }}> {/* bold "Install 2 packages:" */}</span>
          </span>
        </div>
        {/* Approval card */}
        <PackageApprovalCard
          packages={packageLines}
          onApprove={() => setApproved(true)}
          onReject={() => setRejected(true)}
        />
        {/* Timestamp below card */}
        <span style={{ fontSize: 11, color: '#AAAAAA', marginLeft: 2 }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    );
  }

  if (approved) return <p style={{ fontSize: 13, color: '#22C55E', margin: 0 }}>✓ Packages approved — installing…</p>;
  if (rejected) return <p style={{ fontSize: 13, color: '#EF4444', margin: 0 }}>✗ Installation cancelled.</p>;

  // Strip emojis from all AI text output
  const stripEmojis = (str) => str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E0}-\u{1F1FF}✨✓✗]/gu, '').trim();
  const cleanText = stripEmojis(safeText);

  // ── Normal plain text — no bubble, no background ──
  return (
    <div style={{ animation: 'ai-slide 150ms ease-out both', fontSize: 13, color: '#333333', lineHeight: 1.65, fontFamily: 'Inter, sans-serif' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanText}</ReactMarkdown>
    </div>
  );
}