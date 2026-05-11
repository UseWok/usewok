import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_URL } from '@/lib/chat-constants';

const WORKFLOW = [
  "Analyzing financial parameters...",
  "Validating alignment with User DNA...",
  "Running Monte Carlo projections...",
  "Structuring strategic synthesis."
];

export default function AssistantMessage({ content, isGenerating, discussMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [thinkingOpen, setThinkingOpen] = useState(false); // Closed by default
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isGenerating) {
      const timer = setInterval(() => {
        setCurrentStep(s => (s < WORKFLOW.length ? s + 1 : s));
      }, 800);
      return () => clearInterval(timer);
    } else {
      setCurrentStep(WORKFLOW.length);
    }
  }, [isGenerating]);

  const FlowArm = ({ delay = 0 }) => (
    <div className="absolute left-[-20px] top-[-24px] w-[20px] h-[38px]">
      <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 0.3, delay }} className="absolute left-0 top-0 w-[1.5px] bg-gradient-to-b from-[#1A3626] to-gray-200" />
      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.2, delay: delay + 0.3 }} className="absolute left-0 bottom-0 h-[1.5px] bg-gray-200" />
    </div>
  );

  return (
    <div className="flex justify-start items-start gap-4 group w-full mb-8 relative z-20 font-open">
      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5 opacity-40 grayscale mix-blend-multiply">
        <img src={LOGO_URL} alt="Stensor" className="w-full h-full object-contain" />
      </div>

      <div className="relative flex flex-col w-full max-w-[85%] mt-1">
        <div className="flex items-center justify-between pl-1 mb-2 relative">
          <span className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">Stensor</span>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-gray-300 hover:text-gray-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.1 }} className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                    <button onClick={() => { navigator.clipboard.writeText(content); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">Copy message</button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* HALO THINKING (WHITE & GRAY) */}
        <div className="mb-3">
          <motion.div layout className="relative inline-flex items-center gap-3 px-3 py-1.5 cursor-pointer rounded-full overflow-hidden" onClick={() => setThinkingOpen(!thinkingOpen)}>
            {isGenerating && (
              <motion.div className="absolute inset-0 z-0" animate={{ boxShadow: ["0 0 10px rgba(255,255,255,1), 0 0 15px rgba(200,200,200,0.3)", "0 0 25px rgba(255,255,255,0.8), 0 0 35px rgba(200,200,200,0.1)", "0 0 10px rgba(255,255,255,1), 0 0 15px rgba(200,200,200,0.3)"] }} transition={{ duration: 2, repeat: Infinity }} />
            )}
            <div className="relative z-10 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${isGenerating ? 'bg-gray-300' : 'bg-[#1A3626]'}`}>
                {!isGenerating && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span className="text-[12px] font-mono text-gray-500">{isGenerating ? 'Thinking...' : 'Thought'}</span>
              <svg className={`w-3 h-3 text-gray-400 transition-transform ${thinkingOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </motion.div>

          <AnimatePresence>
            {thinkingOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-4 ml-6 pl-5 border-l border-gray-100 flex flex-col gap-5 pb-2">
                  {WORKFLOW.map((step, idx) => (
                    <div key={idx} className={`relative flex items-center gap-3 transition-opacity ${currentStep > idx ? 'opacity-100' : 'opacity-20'}`}>
                      <FlowArm delay={0.1} />
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${currentStep > idx ? 'bg-[#1A3626]' : 'border border-gray-200'}`}>
                        {currentStep > idx && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className="text-[11px] font-mono text-gray-500">{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CONTENT - FIXED LOGIC */}
        {!isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-transparent px-1 text-[15px] leading-relaxed text-slate-800">
            {discussMode ? content : "Task complete. View the output in the preview panel."}
          </motion.div>
        )}
      </div>
    </div>
  );
}