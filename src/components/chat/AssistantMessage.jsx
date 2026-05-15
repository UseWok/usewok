import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function AssistantMessage({ content, isGenerating }) {
  const [thinkingSteps, setThinkingSteps] = useState([]);

  // Simulate a highly fluid, professional "thinking" process
  useEffect(() => {
    if (!isGenerating) return;
    setThinkingSteps([{ text: 'Analyzing context parameters...', done: false }]);
    
    const timers = [
      setTimeout(() => setThinkingSteps(s => [{...s[0], done: true}, { text: 'Applying structural reasoning...', done: false }]), 1200),
      setTimeout(() => setThinkingSteps(s => [s[0], {...s[1], done: true}, { text: 'Synthesizing final output...', done: false }]), 3500)
    ];

    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  if (isGenerating) {
    return (
      <div className="flex justify-start w-full mb-6 font-sans">
        <div className="flex flex-col relative w-full max-w-[85%]">
          
          {/* Subtle Halo Effect for 'Thinking' */}
          <div className="absolute -inset-4 bg-white/40 blur-xl rounded-full z-0 pointer-events-none"></div>

          <div className="relative z-10 border-l-2 border-gray-200 pl-4 py-1 space-y-3">
            {thinkingSteps.map((step, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="flex items-center gap-2"
              >
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-t-[#0080ff] border-gray-200 animate-spin"></div>
                )}
                <span className={`text-[13px] ${step.done ? 'text-gray-500' : 'text-gray-800 font-medium'}`} style={{ fontFamily: '"Open Sans", sans-serif' }}>
                  {step.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
    <div className="flex justify-start w-full mb-6">
      <div 
        className="text-gray-700 text-[14.5px] font-[300] leading-[1.8] tracking-wide w-full max-w-[95%] whitespace-pre-wrap"
        style={{ fontFamily: '"Open Sans", sans-serif' }}
      >
        {renderFormattedContent(content)}
      </div>
    </div>
  );
}