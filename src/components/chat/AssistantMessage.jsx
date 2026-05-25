import { useState, useEffect, useRef } from 'react';
import { LayoutTemplate } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Ghost skeleton blocks drawn top-to-bottom — psychologically satisfying
const SkeletonBlock = ({ width, delay, height = 14, opacity = 1 }) => (
  <div
    className="skeleton-block"
    style={{
      width,
      height,
      opacity,
      borderRadius: 6,
      animation: `wok-shimmer 1.4s ease-out infinite, wok-slide-in 200ms ease-out ${delay}ms both`,
    }}
  />
);

const SKELETON_ROWS = [
  { width: '92%', delay: 0 },
  { width: '78%', delay: 60 },
  { width: '55%', delay: 120, height: 10, opacity: 0.55 },
  { width: '85%', delay: 180 },
  { width: '48%', delay: 240 },
];

export default function AssistantMessage({ content, isGenerating, query }) {
  const [localGenerating, setLocalGenerating] = useState(isGenerating);

  useEffect(() => {
    if (isGenerating) {
      setLocalGenerating(true);
    } else if (!isGenerating && localGenerating) {
      const t = setTimeout(() => setLocalGenerating(false), 400);
      return () => clearTimeout(t);
    }
  }, [isGenerating, localGenerating]);

  // Inject keyframes once
  useEffect(() => {
    if (document.getElementById('wok-anim-styles')) return;
    const style = document.createElement('style');
    style.id = 'wok-anim-styles';
    style.textContent = `
      @keyframes wok-shimmer {
        0% { background-position: -600px 0; }
        100% { background-position: 600px 0; }
      }
      @keyframes wok-slide-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes wok-pulse-cursor {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.15; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  if (localGenerating) {
    return (
      <div className="flex justify-start w-full mb-5 font-sans">
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3">
            <div
              style={{
                width: 2,
                height: 11,
                borderRadius: 2,
                background: 'hsl(var(--primary))',
                animation: 'wok-pulse-cursor 900ms ease-out infinite',
                flexShrink: 0,
              }}
            />
            <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600">
              Building
            </span>
          </div>
          <div className="flex flex-col gap-[9px]">
            {SKELETON_ROWS.map((row, i) => (
              <SkeletonBlock key={i} {...row} />
            ))}
          </div>
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
        <div className="inline-flex items-center gap-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-zinc-200 leading-none mb-0.5">
              Interface ready
            </span>
            <span className="text-[11px] text-zinc-500 leading-none">
              Preview updated →
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        className="border-l-2 border-indigo-500 pl-3 text-zinc-300 text-sm leading-relaxed"
        style={{ fontFamily: '"Open Sans", sans-serif' }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{safeText}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div
      className="flex justify-start w-full mb-5"
      style={{ animation: 'wok-slide-in 200ms ease-out both' }}
    >
      <div className="w-full">{renderContent(content)}</div>
    </div>
  );
}