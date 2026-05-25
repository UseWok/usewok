import { useState, useEffect } from 'react';
import { ChevronRight, Package } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ── Inject shimmer/slide keyframes once ──
let _injected = false;
function injectStyles() {
  if (_injected || document.getElementById('ai-msg-styles')) { _injected = true; return; }
  _injected = true;
  const s = document.createElement('style');
  s.id = 'ai-msg-styles';
  s.textContent = `
    @keyframes shimmer { 0%{background-position:-600px 0}100%{background-position:600px 0} }
    @keyframes slide-in { from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)} }
  `;
  document.head.appendChild(s);
}

const SkeletonLine = ({ width, delay, height = 12, opacity = 1 }) => (
  <div style={{
    width, height, opacity, borderRadius: 6, flexShrink: 0,
    background: 'linear-gradient(90deg,#E4E4E7 25%,#F1F1F3 50%,#E4E4E7 75%)',
    backgroundSize: '600px 100%',
    animation: `shimmer 1.4s ease-out infinite, slide-in 150ms ease-out ${delay}ms both`,
  }} />
);

const SKELETON_ROWS = [
  { width: '86%', delay: 0 },
  { width: '70%', delay: 60 },
  { width: '50%', delay: 120, height: 9, opacity: 0.45 },
  { width: '78%', delay: 180 },
  { width: '42%', delay: 240 },
];

// ── Package approval card — exact match to image ──
const PackageApprovalCard = ({ packages = [], onApprove, onReject }) => (
  <div style={{
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: 12,
    padding: '14px 16px',
    maxWidth: '92%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    alignSelf: 'flex-start',
    marginTop: 4,
  }}>
    <p style={{ fontSize: 13, fontWeight: 600, color: '#18181B', margin: 0, lineHeight: 1.3 }}>Approval Required</p>
    <p style={{ fontSize: 11, color: '#A1A1AA', margin: '3px 0 0 0', lineHeight: 1.4 }}>Other tools will run after approval</p>
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {packages.map((pkg, i) => (
        <span key={i} style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13, color: '#F97316' }}>{pkg}</span>
      ))}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
      <button
        onClick={onApprove}
        style={{
          background: '#18181B', color: '#FFFFFF', fontSize: 12, fontWeight: 600,
          borderRadius: 8, padding: '7px 16px', border: 'none', cursor: 'pointer',
          transition: 'background 150ms',
        }}
        onMouseEnter={e => e.target.style.background = '#3F3F46'}
        onMouseLeave={e => e.target.style.background = '#18181B'}
      >
        Approve
      </button>
      <button
        onClick={onReject}
        style={{
          background: '#FFFFFF', color: '#3F3F46', fontSize: 12, fontWeight: 500,
          borderRadius: 8, padding: '7px 16px',
          border: '1px solid #D4D4D4', cursor: 'pointer',
          transition: 'background 150ms',
        }}
        onMouseEnter={e => e.target.style.background = '#F4F4F5'}
        onMouseLeave={e => e.target.style.background = '#FFFFFF'}
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

  // ── Generating skeleton ──
  if (localGenerating) {
    return (
      <div className="flex flex-col gap-2.5 w-full" style={{ animation: 'slide-in 150ms ease-out both' }}>
        {/* Thinking indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#A1A1AA', fontSize: 12, marginBottom: 2 }}>
          <span>Thought for {elapsedSecs}s</span>
          <ChevronRight style={{ width: 12, height: 12 }} />
        </div>
        <div className="flex flex-col gap-2">
          {SKELETON_ROWS.map((row, i) => <SkeletonLine key={i} {...row} />)}
        </div>
      </div>
    );
  }

  if (!content) return null;
  const safeText = typeof content === 'string' ? content : JSON.stringify(content);

  // ── "Interface ready" success card ──
  if (
    safeText.includes('✨ Architecture') ||
    safeText.includes('Architecture generated') ||
    safeText.includes('Architecture successfully') ||
    safeText.includes('successfully recompiled')
  ) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, padding: '10px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', animation: 'slide-in 150ms ease-out both' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0, animation: 'pulse 2s infinite' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#18181B', lineHeight: 1.2 }}>Interface ready</span>
          <span style={{ fontSize: 11, color: '#A1A1AA', lineHeight: 1.2 }}>Preview updated →</span>
        </div>
      </div>
    );
  }

  // ── Package install detection ──
  const packageMatch = safeText.match(/install\s+(\d+)?\s*packages?[:\s]*([\s\S]*)/i);
  const packageLines = safeText.match(/@[\w/-]+@[\d.]+/g);

  if (packageLines && packageLines.length > 0 && !approved && !rejected) {
    const beforeCard = safeText.replace(/\n?.*install\s+\d*\s*packages?[:\s]*/i, '').replace(/@[\w/-]+@[\d.]+\n?/g, '').trim();
    const installCount = packageLines.length;
    return (
      <div className="flex flex-col gap-2 w-full" style={{ animation: 'slide-in 150ms ease-out both' }}>
        {/* Pre-text if any */}
        {beforeCard && (
          <p style={{ fontSize: 13, color: '#3F3F46', lineHeight: 1.6, margin: 0 }}>{beforeCard}</p>
        )}
        {/* Action row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, display: 'inline-block' }} />
          <Package style={{ width: 14, height: 14, color: '#71717A' }} />
          <span style={{ fontSize: 13, color: '#52525B' }}>Install {installCount} package{installCount > 1 ? 's' : ''}:</span>
        </div>
        {/* Approval card */}
        <PackageApprovalCard
          packages={packageLines}
          onApprove={() => setApproved(true)}
          onReject={() => setRejected(true)}
        />
        <span style={{ fontSize: 11, color: '#A1A1AA', marginLeft: 2, marginTop: 2 }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    );
  }

  // Approved / Rejected state
  if (approved) {
    return <p style={{ fontSize: 13, color: '#22C55E', margin: 0, animation: 'slide-in 150ms ease-out both' }}>✓ Packages approved — installing…</p>;
  }
  if (rejected) {
    return <p style={{ fontSize: 13, color: '#EF4444', margin: 0, animation: 'slide-in 150ms ease-out both' }}>✗ Installation cancelled.</p>;
  }

  // ── Normal text response — no bubble, plain text ──
  return (
    <div style={{ animation: 'slide-in 150ms ease-out both' }} className="w-full">
      <div style={{ fontSize: 13, color: '#3F3F46', lineHeight: 1.65, fontFamily: 'Inter,sans-serif' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{safeText}</ReactMarkdown>
      </div>
    </div>
  );
}