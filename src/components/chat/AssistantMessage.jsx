import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_CHAIN_OF_THOUGHT = [
  "The user wants me to:",
  "1. Analyze the financial constraints provided.",
  "2. Structure a concrete step-by-step synthesis.",
  "",
  "Let me check the parameters...",
  "Running projections for optimal scenarios...",
  "Applying white-label and CRM configurations...",
  "",
  "Drafting the final response.",
  "Asking user to confirm before execution."
];

export default function AssistantMessage({ content, isGenerating, discussMode }) {
  const [thinkingOpen, setThinkingOpen] = useState(isGenerating);
  const [revealedThoughts, setRevealedThoughts] = useState([]);
  const thoughtsEndRef = useRef(null);

  useEffect(() => {
    if (isGenerating) setThinkingOpen(true);
  }, [isGenerating]);

  useEffect(() => {
    if (isGenerating) {
      let currentIndex = 0;
      setRevealedThoughts([]);
      const interval = setInterval(() => {
        if (currentIndex < MOCK_CHAIN_OF_THOUGHT.length) {
          setRevealedThoughts(prev => [...prev, MOCK_CHAIN_OF_THOUGHT[currentIndex]]);
          currentIndex++;
          thoughtsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }, 600);
      return () => clearInterval(interval);
    } else {
      setRevealedThoughts(MOCK_CHAIN_OF_THOUGHT);
    }
  }, [isGenerating]);

  // SECURITE ANTI-CRASH POUR LE SPLIT
  const renderFormattedContent = (text) => {
    if (!text) return null;
    let safeText = typeof text === 'string' ? text : JSON.stringify(text);
    const parts = safeText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={index} className="font-semibold text-[#0d0d0d]" style={{ boxShadow: 'inset 0 -8px 0 rgba(221, 255, 0, 0.5)' }}>
            {part.slice(2, -2)}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex justify-start items-start gap-4 w-full mb-8 font-sans group">
      
      <div className="flex flex-col w-full max-w-[90%] mt-1">
        
        {/* OPENAI o1 THINKING COMPONENT (WOW EFFECT) */}
        {(isGenerating || thinkingOpen) && (
          <div className="mb-4">
            <motion.div 
              layout 
              onClick={() => setThinkingOpen(!thinkingOpen)}
              className="relative inline-flex items-center gap-2.5 px-3 py-1.5 cursor-pointer rounded-xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] z-10"
            >
              {isGenerating && (
                <motion.div 
                  className="absolute inset-0 rounded-xl z-0" 
                  animate={{ boxShadow: ["0 0 0px rgba(255,255,255,1), 0 0 10px rgba(200,200,200,0.1)", "0 0 15px rgba(255,255,255,1), 0 0 25px rgba(200,200,200,0.3)", "0 0 0px rgba(255,255,255,1), 0 0 10px rgba(200,200,200,0.1)"] }} 
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} 
                />
              )}
              
              <div className="relative z-10 flex items-center gap-2 text-gray-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
                <span className="text-[12px] font-mono tracking-tight text-gray-700">{isGenerating ? 'Thinking' : 'Thought process'}</span>
                <motion.svg animate={{ rotate: thinkingOpen ? 180 : 0 }} className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></motion.svg>
              </div>
            </motion.div>

            <AnimatePresence>
              {thinkingOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-100 flex flex-col gap-1 py-1 max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {isGenerating && (
                      <div className="w-32 h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
                         <motion.div className="h-full bg-gray-300 rounded-full" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                      </div>
                    )}
                    
                    {revealedThoughts.map((thought, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-[12.5px] font-mono text-gray-400 leading-relaxed break-words">
                        {thought === "" ? <br/> : thought}
                      </motion.div>
                    ))}
                    <div ref={thoughtsEndRef} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* CONTENT */}
        {!isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[15px] leading-[1.7] text-[#0d0d0d]">
            {discussMode ? (
               <div className="whitespace-pre-wrap break-words">{renderFormattedContent(content)}</div>
            ) : (
               <p className="italic text-gray-500 text-[13px]">Task complete. Output visualized in the right pane.</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}