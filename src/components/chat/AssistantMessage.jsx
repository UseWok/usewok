import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SkeletonBlock = ({ width, delay, height = 13, opacity = 1 }) => (
  <div
    style={{
      width,
      height,
      opacity,
      borderRadius: 6,
      background: 'linear-gradient(90deg, #E4E4E7 25%, #F1F1F3 50%, #E4E4E7 75%)',
      backgroundSize: '600px 100%',
      animation: `shimmer 1.4s ease-out infinite, slide-in 150ms ease-out ${delay}ms both`,
    }}
  />
);

const SKELETON_ROWS = [
  { width: '88%', delay: 0 },
  { width: '72%', delay: 60 },
  { width: '52%', delay: 120, height: 10, opacity: 0.5 },
  { width: '80%', delay: 180 },
  { width: '44%', delay: 240 },
];

// Inject keyframes once
let injected = false;
function injectStyles() {
  if (injected || document.getElementById('wok-anim-styles')) { injected = true; return; }
  injected = true;
  const style = document.createElement('style');
  style.id = 'wok-anim-styles';
  style.textContent = `
    @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
    @keyframes slide-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse-cursor { 0%, 100% { opacity: 1; } 50% { opacity: 0.12; } }
  `;
  document.head.appendChild(style);
}

export default function AssistantMessage({ content, isGenerating, query }) {
  const [localGenerating, setLocalGenerating] = useState(isGenerating);
  const [elapsedSecs, setElapsedSecs] = useState(0);

  useEffect(() => { injectStyles(); }, []);

  // Track elapsed seconds while generating
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
      const t = setTimeout(() => setLocalGenerating(false), 300);
      return () => clearTimeout(t);
    }
  }, [isGenerating, localGenerating]);

  if (localGenerating) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Thinking indicator */}
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <span>Thought for {elapsedSecs}s</span>
          <ChevronRight className="w-3 h-3" />
        </div>
        <div className="flex flex-col gap-2">
          {SKELETON_ROWS.map((row, i) => (
            <SkeletonBlock key={i} {...row} />
          ))}
        </div>
      </div>
    );
  }

  const renderContent = (text) => {
    if (!text) return null;
    const safeText = typeof text === 'string' ? text : JSON.stringify(text);

    if (
      safeText.includes('✨ Architecture') ||
      safeText.includes('Architecture generated') ||
      safeText.includes('Architecture successfully') ||
      safeText.includes('successfully recompiled')
    ) {
      return (
        <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-800 leading-none mb-0.5">Interface ready</span>
            <span className="text-xs text-zinc-400 leading-none">Preview updated →</span>
          </div>
        </div>
      );
    }

    return (
      <div className="text-sm text-zinc-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{safeText}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="w-full" style={{ animation: 'slide-in 150ms ease-out both' }}>
      {renderContent(content)}
    </div>
  );
}