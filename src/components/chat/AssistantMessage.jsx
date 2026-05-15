import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function AssistantMessage({ content, isGenerating, query }) {
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [localGenerating, setLocalGenerating] = useState(isGenerating);

  // Dynamic Intelligence Rendering with guaranteed safe-handoff
  useEffect(() => {
    let timers = [];
    
    if (isGenerating) {
      setLocalGenerating(true);
      setThinkingSteps([{ text: 'Initializing core environment...', done: false }]);
      
      const q = query?.toLowerCase() || '';
      const hasCode = q.includes('code') || q.includes('build') || q.includes('script') || q.includes('component');
      const hasStyle = q.includes('css') || q.includes('style') || q.includes('color') || q.includes('red') || q.includes('blue');

      // Step 1: Parsing
      timers.push(setTimeout(() => {
        setThinkingSteps(s => {
          const newS = [...s];
          if(newS.length > 0) newS[0].done = true;
          return [...newS, { text: 'Parsing user query...', done: false }];
        });
      }, 800));

      // Step 2: Dynamic Execution based on prompt analysis
      timers.push(setTimeout(() => {
        setThinkingSteps(s => {
          const newS = [...s];
          if(newS.length > 0) newS[newS.length - 1].done = true;
          if (hasCode) return [...newS, { text: 'Generating logic (Line 14)...', done: false }];
          if (hasStyle) return [...newS, { text: 'Injecting stylesheets...', done: false }];
          return [...newS, { text: 'Synthesizing response...', done: false }];
        });
      }, 1900));

    } else if (!isGenerating && localGenerating) {
      // The API has finished. Force the checkmark and hold for 800ms to avoid abrupt cutoffs.
      setThinkingSteps(s => {
        const newS = [...s];
        if (newS.length > 0) newS[newS.length - 1].done = true;
        return [...newS, { text: 'Execution complete.', done: true }];
      });
      
      timers.push(setTimeout(() => {
        setLocalGenerating(false);
      }, 800));
    }

    return () => timers.forEach(clearTimeout);
  }, [isGenerating, query, localGenerating]);

  // RENDER THINKING VISUALIZER
  if (localGenerating) {
    return (
      <div className="flex justify-start w-full mb-6 font-sans px-4 md:px-0">
        <div className="flex flex-col relative w-full max-w-[85%]">
          
          {/* Subtle Halo Effect for 'Thinking' */}
          <div className="absolute -inset-4 bg-white/60 blur-xl rounded-full z-0 pointer-events-none"></div>

          <div className="relative z-10 border-l-[3px] border-gray-200 pl-4 py-1 space-y-3">
            <span className="text-[12px] font-bold text-gray-400 mb-2 block tracking-wider uppercase">Thinking...</span>
            <AnimatePresence>
              {thinkingSteps.map((step, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="flex items-center gap-2.5"
                >
                  {step.done ? (
                    <CheckCircle2 className="w-[18px] h-[18px] text-green-500" />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-t-[#0080ff] border-gray-200 animate-spin"></div>
                  )}
                  <span className={`text-[13px] ${step.done ? 'text-gray-500' : 'text-gray-900 font-medium'}`} style={{ fontFamily: '"Open Sans", sans-serif' }}>
                    {step.text}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // RENDER FINAL TEXT
  const renderFormattedContent = (text) => {
    if (!text) return null;
    let safeText = typeof text === 'string' ? text : JSON.stringify(text);
    return safeText.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-[#0d0d0d]">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4 }}
      className="flex justify-start w-full mb-6 px-4 md:px-0"
    >
      <div 
        className="text-gray-700 text-[14.5px] font-[300] leading-[1.8] tracking-wide w-full max-w-[95%] whitespace-pre-wrap"
        style={{ fontFamily: '"Open Sans", sans-serif' }}
      >
        {renderFormattedContent(content)}
      </div>
    </motion.div>
  );
}