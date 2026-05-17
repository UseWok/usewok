import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, LayoutTemplate } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Rapid-Fire micro-statuses to kill wait fatigue
const LOADING_STATUSES = [
  "Initializing psychological models...",
  "Structuring Bento Grid layout...",
  "Injecting Framer animations...",
  "Mapping Recharts visualizers...",
  "Refining ultra-modern typography...",
  "Compiling glassmorphism CSS...",
  "Finalizing UI component tree..."
];

export default function AssistantMessage({ content, isGenerating, query }) {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [localGenerating, setLocalGenerating] = useState(isGenerating);

  // High-Speed Status Cycler
  useEffect(() => {
    let interval;
    if (isGenerating) {
      setLocalGenerating(true);
      setCurrentStatusIndex(0);
      
      // Cycle to a new technical status every 1.8 seconds
      interval = setInterval(() => {
        setCurrentStatusIndex((prev) => {
          if (prev < LOADING_STATUSES.length - 1) return prev + 1;
          return prev; // Hold on the last status if generation takes very long
        });
      }, 1800);
    } else if (!isGenerating && localGenerating) {
      // API finished. Wait a tiny bit then clear loading state.
      setTimeout(() => setLocalGenerating(false), 600);
    }

    return () => clearInterval(interval);
  }, [isGenerating, localGenerating]);

  if (localGenerating) {
    return (
      <div className="flex justify-start w-full mb-6 font-sans px-4 md:px-0">
        <div className="flex flex-col relative w-full max-w-[85%]">
          <div className="absolute -inset-4 bg-white/60 blur-xl rounded-full z-0 pointer-events-none"></div>
          <div className="relative z-10 border-l-[3px] border-gray-200 pl-4 py-1 space-y-3">
            <span className="text-[12px] font-bold text-[#0080ff] mb-2 block tracking-widest uppercase flex items-center gap-2">
              <div className="w-[14px] h-[14px] rounded-full border-2 border-t-[#0080ff] border-gray-200 animate-spin"></div>
              Compiling Ecosystem
            </span>
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentStatusIndex} 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5, transition: { duration: 0.1 } }}
                className="flex items-center gap-2.5"
              >
                <span className="text-[13px] text-gray-900 font-medium" style={{ fontFamily: '"Open Sans", sans-serif' }}>
                  {LOADING_STATUSES[currentStatusIndex]}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // --- SILENT CHAT LOGIC ---
  const renderContent = (text) => {
    if (!text) return null;
    let safeText = typeof text === 'string' ? text : JSON.stringify(text);

    // If the text is exactly the success string we set in ChatPage.jsx, render the sleek UI badge.
    if (safeText.includes("✨ Architecture generated successfully") || safeText.includes("✨ Architecture successfully recompiled")) {
      return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] max-w-fit">
          <div className="p-2 bg-[#F4F8FE] rounded-lg">
            <LayoutTemplate className="w-5 h-5 text-[#0080ff]" />
          </div>
          <div className="flex flex-col">
             <span className="text-[13px] font-bold text-[#0d0d0d] tracking-tight leading-none mb-1">Architecture Compiled</span>
             <span className="text-[11.5px] font-medium text-gray-500 leading-none">View result in the preview panel</span>
          </div>
        </div>
      );
    }

    // Otherwise, render text normally
    return (
      <div className="prose prose-sm max-w-none text-gray-700" style={{ fontSize: '14.5px', fontWeight: 300, lineHeight: 1.8, fontFamily: '"Open Sans", sans-serif' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {safeText}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="flex justify-start w-full mb-6 px-4 md:px-0"
    >
      <div className="w-full max-w-[95%]">
        {renderContent(content)}
      </div>
    </motion.div>
  );
}