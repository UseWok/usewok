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
      <div className="flex justify-start w-full mb-6 font-sans px-1 md:px-0">
        <div className="w-full max-w-[85%]">
          <div className="flex items-center gap-2 mb-4">
            <div
              style={{
                width: 2,
                height: 12,
                borderRadius: 2,
                background: 'hsl(var(--foreground))',
                animation: 'wok-pulse-cursor 900ms ease-out infinite',
                flexShrink: 0,
                opacity: 0.7,
              }}
            />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
              Building
            </span>
          </div>
          <div className="flex flex-col gap-[10px]">
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
        <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-sm max-w-fit">
          <div className="p-1.5 bg-muted rounded-lg">
            <LayoutTemplate className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-foreground leading-none mb-1">
              Interface ready
            </span>
            <span className="text-[11.5px] text-muted-foreground leading-none">
              Preview updated in the right panel
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        className="prose prose-sm max-w-none text-white prose-invert"
        style={{
          fontSize: '14.5px',
          fontWeight: 300,
          lineHeight: 1.8,
          fontFamily: '"Open Sans", sans-serif',
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{safeText}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div
      className="flex justify-start w-full mb-6 px-4 md:px-0"
      style={{ animation: 'wok-slide-in 200ms ease-out both' }}
    >
      <div className="w-full max-w-[95%]">{renderContent(content)}</div>
    </div>
  );
}