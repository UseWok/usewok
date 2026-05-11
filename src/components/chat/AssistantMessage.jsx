import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_URL } from '@/lib/chat-constants';

export default function AssistantMessage({ content, agent, meta, discussMode, isGenerating }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [thinkingOpen, setThinkingOpen] = useState(false);

  return (
    <div className="flex justify-start items-start gap-3 group w-full mb-8 relative z-20">
      
      <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
        <img src={LOGO_URL} alt="Stensor" className="w-full h-full object-contain opacity-70" />
      </div>

      <div className="relative flex flex-col w-full max-w-[85%]">
        
        {/* HEADER & 3-DOTS MENU */}
        <div className="flex items-center justify-between pl-1 mb-1 relative">
          <span className="text-[12px] font-bold text-slate-800">Stensor</span>

          <div className="relative z-50">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-gray-400 hover:text-gray-800 rounded-md transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 font-open">
                    <button onClick={() => { navigator.clipboard.writeText(content); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      Copy message
                    </button>
                    <button className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      Copy link
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* AI THINKING DROPDOWN */}
        <div className="mb-2">
          <button onClick={() => setThinkingOpen(!thinkingOpen)} className="flex items-center gap-2 text-[11px] font-medium text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg transition-colors bg-gray-50/50 border border-gray-100">
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${thinkingOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            {isGenerating ? 'Thinking...' : 'Thought for 5.2 seconds'}
          </button>
          
          <AnimatePresence>
            {thinkingOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="text-[12px] text-gray-500 pl-4 border-l-2 border-gray-200 ml-2 mt-2 py-1 font-mono leading-relaxed">
                  <p>Let me analyze what needs to be done:</p>
                  <ul className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Parsing user input parameters...</li>
                    <li>Structuring optimal response layout...</li>
                    <li>Executing final synthesis block.</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTUAL MESSAGE (Directly displayed, no typing effect) */}
        {!isGenerating && (
          <div className="bg-transparent px-1 py-0 text-[14px] leading-relaxed text-slate-800 font-normal">
            <p className="whitespace-pre-wrap break-words">{discussMode ? content : "Done. Check the preview window to see the result."}</p>
          </div>
        )}
      </div>
    </div>
  );
}