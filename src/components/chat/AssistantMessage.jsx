import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_URL } from '@/lib/chat-constants'; // Ensure this path is correct for your project

// Utility for async timeouts
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function AssistantMessage({ content, isGenerating, isDeepSynthesis = false, discussMode = true }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isGenerating);
  const [phase, setPhase] = useState(0);
  
  // Phase 4 visual state (Hex processing)
  const [hexData, setHexData] = useState("0x00000000");

  // Orchestrate the Labor Illusion timeline
  useEffect(() => {
    let isActive = true;

    const runPhases = async () => {
      if (!isGenerating) {
        setPhase(6); // Jump to end if not generating
        return;
      }

      setPhase(1); // Phase 1: Parsing
      await sleep(1800);
      if (!isActive) return;

      setPhase(2); // Phase 2: Validation Nodes
      await sleep(1800);
      if (!isActive) return;

      setPhase(3); // Phase 3: DNA Integration
      await sleep(1800);
      if (!isActive) return;

      if (isDeepSynthesis) {
        setPhase(4); // Phase 4: Quant Engine (Conditional)
        await sleep(2500);
        if (!isActive) return;
      }

      setPhase(5); // Phase 5: Finalization
      await sleep(1500);
      if (!isActive) return;

      setPhase(6); // Done
    };

    runPhases();

    return () => { isActive = false; };
  }, [isGenerating, isDeepSynthesis]);

  // Phase 4 rapid hex animation effect
  useEffect(() => {
    if (phase === 4 && isGenerating) {
      const interval = setInterval(() => {
        setHexData("0x" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0') + Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0'));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase, isGenerating]);

  // Auto-expand when generating starts
  useEffect(() => {
    if (isGenerating) setIsExpanded(true);
  }, [isGenerating]);

  return (
    <div className="flex justify-start items-start gap-4 group w-full mb-10 relative z-20 font-open">
      
      {/* Ghost Avatar */}
      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5 opacity-40 mix-blend-multiply grayscale">
        <img src={LOGO_URL} alt="Stensor" className="w-full h-full object-contain" />
      </div>

      <div className="relative flex flex-col w-full max-w-[85%] mt-1">
        
        {/* Header & 3-Dot Menu */}
        <div className="flex items-center justify-between pl-1 mb-2 relative">
          <span className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">System Intelligence</span>
          <div className="relative z-50">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-gray-300 hover:text-gray-800 transition-colors rounded-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                    <button onClick={() => { navigator.clipboard.writeText(content); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">Copy message</button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- LABOR ILLUSION CONTAINER --- */}
        <motion.div layout className="mb-2">
          
          {/* 1. The Pill (Minimized State) */}
          <motion.button 
            layout
            onClick={() => setIsExpanded(!isExpanded)} 
            className={`relative flex items-center gap-3 px-4 py-2 rounded-full border border-gray-100 transition-all duration-500 overflow-hidden
              ${isGenerating ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.6)]' : 'bg-gray-50/50 hover:bg-gray-100'}`}
          >
            {/* Fluid Halo Gradient Background */}
            {isGenerating && (
              <motion.div 
                className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.8),transparent)] bg-[length:200%_100%] z-0"
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
            )}
            
            <div className="relative z-10 flex items-center gap-2">
              {/* Checkmark placeholder / Active dot */}
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors duration-500 ${isGenerating ? 'bg-blue-500 animate-pulse' : 'bg-[#1A3626]'}`}>
                 {!isGenerating && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
              <span className={`text-[12px] font-mono tracking-tight ${isGenerating ? 'text-blue-600' : 'text-gray-500'}`}>
                {isGenerating ? 'System Active...' : 'Synthesis Complete'}
              </span>
              <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </motion.button>
          
          {/* 2. The Expanded State (Organigram Flowchart) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ 
                  height: 'auto', 
                  opacity: isGenerating ? 1 : 0.6, 
                  filter: isGenerating ? 'blur(0px)' : 'blur(3px)' 
                }} 
                exit={{ height: 0, opacity: 0 }} 
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 ml-5 pl-5 border-l-[1.5px] border-gray-100 flex flex-col gap-4 pb-2">
                  
                  {/* PHASE 1: Cognitive Reflection (Collapses when done) */}
                  <AnimatePresence>
                    {phase === 1 && (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-2 overflow-hidden"
                      >
                        <span className="text-[11px] font-mono text-gray-500">Parsing syntax & intent...</span>
                        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-slate-800 rounded-full"
                            initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PHASE 2: Validation Nodes */}
                  <AnimatePresence>
                    {phase >= 2 && (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-gray-400">Validating tensors</span>
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => {
                            const isNodeDone = phase > 2 || (phase === 2 && currentStep >= i); // Simplified stagger simulation
                            return (
                              <motion.div 
                                key={i}
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${isNodeDone ? 'bg-[#1A3626]' : 'bg-gray-100 border border-gray-200'}`}
                                initial={{ scale: 0 }} animate={{ scale: isNodeDone ? [0, 1.2, 1] : 1 }} transition={{ duration: 0.3, delay: isNodeDone && phase === 2 ? i * 0.4 : 0 }}
                              >
                                {isNodeDone && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PHASE 3: Stensor DNA Integration */}
                  <AnimatePresence>
                    {phase >= 3 && (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                        <motion.div 
                          className="w-2.5 h-2.5 rounded-full bg-blue-500"
                          animate={phase === 3 ? { boxShadow: ["0px 0px 0px rgba(59,130,246,0)", "0px 0px 12px rgba(59,130,246,0.6)", "0px 0px 0px rgba(59,130,246,0)"] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className={`text-[11px] font-mono ${phase === 3 ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                          Aligning with User Financial DNA...
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PHASE 4: Quantitative Engine (CONDITIONAL) */}
                  <AnimatePresence>
                    {phase >= 4 && isDeepSynthesis && (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                           <svg className={`w-3.5 h-3.5 ${phase === 4 ? 'text-indigo-500 animate-spin' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                           <span className={`text-[11px] font-mono ${phase === 4 ? 'text-indigo-600' : 'text-gray-500'}`}>Running 10,000+ Monte Carlo Projections...</span>
                        </div>
                        {/* Data processing grid visual */}
                        {phase === 4 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-slate-900 rounded-lg p-2 ml-6 w-48 overflow-hidden shadow-inner">
                            <span className="text-[10px] text-green-400 font-mono tracking-widest leading-none break-all">{hexData} {hexData} {hexData}</span>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PHASE 5: Finalization */}
                  <AnimatePresence>
                    {phase >= 5 && (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                        <div className="relative w-4 h-4 flex items-center justify-center">
                          {phase === 5 && isGenerating ? (
                             <motion.div className="w-full h-full rounded-full border-2 border-gray-200 border-t-gray-800" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                          ) : (
                             <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} className="w-full h-full rounded-full bg-[#1A3626] flex items-center justify-center">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                             </motion.div>
                          )}
                        </div>
                        <span className={`text-[11px] font-mono ${phase === 5 && isGenerating ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>
                          Formatting strategic output...
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- ACTUAL MESSAGE FADE IN --- */}
        <AnimatePresence>
          {!isGenerating && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }} // Wait for blur to start before sliding in
              className="bg-transparent px-1 text-[15px] leading-[1.6] text-slate-800 font-normal"
            >
              <p className="whitespace-pre-wrap break-words">
                {discussMode ? content : "Output finalized. View the actionable synthesis in the main preview pane."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}