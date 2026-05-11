import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_URL } from '@/lib/chat-constants';

const THINKING_STEPS = [
  "Parsing input parameters...",
  "Structuring optimal response...",
  "Executing synthesis block..."
];

export default function AssistantMessage({ content, isGenerating }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [thinkingOpen, setThinkingOpen] = useState(isGenerating);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-progress steps while generating
  useEffect(() => {
    if (isGenerating) {
      setThinkingOpen(true);
      const interval = setInterval(() => {
        setCurrentStep(s => (s < THINKING_STEPS.length ? s + 1 : s));
      }, 1500); // Progress every 1.5s
      return () => clearInterval(interval);
    } else {
      setCurrentStep(THINKING_STEPS.length); // All done
    }
  }, [isGenerating]);

  return (
    <div className="flex justify-start items-start gap-3 group w-full mb-8 relative z-20">
      
      <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
        <img src={LOGO_URL} alt="Stensor" className="w-full h-full object-contain opacity-70" />
      </div>

      <div className="relative flex flex-col w-full max-w-[85%]">
        
        <div className="flex items-center justify-between pl-1 mb-1 relative">
          <span className="text-[12px] font-bold text-slate-800">Stensor</span>
          <div className="relative z-50">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-gray-400 hover:text-gray-800 rounded-md transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 font-open">
                    <button onClick={() => { navigator.clipboard.writeText(content); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">Copy message</button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FLUID HALO THINKING BUTTON */}
        <div className="mb-2">
          <button 
            onClick={() => setThinkingOpen(!thinkingOpen)} 
            className={`flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-full transition-all border border-gray-200/60
              ${isGenerating ? 'bg-gradient-to-r from-gray-50 via-white to-gray-50 text-gray-500 shadow-[0_0_15px_rgba(255,255,255,1)] animate-pulse' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${thinkingOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            {isGenerating ? 'Thinking...' : 'Thought for 5.0s'}
          </button>
          
          <AnimatePresence>
            {thinkingOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="text-[12px] text-gray-500 pl-2 ml-4 mt-3 font-mono leading-relaxed space-y-2 border-l border-gray-100">
                  {THINKING_STEPS.map((stepText, idx) => {
                    const isDone = currentStep > idx || !isGenerating;
                    const isActive = currentStep === idx && isGenerating;
                    return (
                      <div key={idx} className={`flex items-center gap-2 transition-opacity duration-300 ${isDone || isActive ? 'opacity-100' : 'opacity-30'}`}>
                        {/* THE DARK GREEN CHECKMARK CIRCLE */}
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300
                          ${isDone ? 'bg-[#1A3626] border-none' : 'border-[1.5px] border-[#2E4F3E]/40 bg-transparent'}`}>
                          {isDone && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <span className={isDone ? 'text-gray-600' : 'text-gray-400'}>{stepText}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTUAL MESSAGE (Hidden during generation) */}
        {!isGenerating && (
          <div className="bg-transparent px-1 py-0 text-[14px] leading-relaxed text-slate-800 font-normal mt-1">
            <p className="whitespace-pre-wrap break-words">{content}</p>
          </div>
        )}
      </div>
    </div>
  );
}