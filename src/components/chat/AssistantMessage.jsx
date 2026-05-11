import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_URL } from '@/lib/chat-constants'; 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function AssistantMessage({ content, isGenerating, isDeepSynthesis = false, discussMode = true }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isGenerating);
  const [phase, setPhase] = useState(0);
  const [hexData, setHexData] = useState("0x000000");

  // --- ORCHESTRATE THE AUTHENTIC TIMELINE ---
  useEffect(() => {
    let isActive = true;

    const runPhases = async () => {
      if (!isGenerating) {
        setPhase(8); // Jump to end
        return;
      }

      setPhase(1); // Parsing
      await sleep(1500);
      if (!isActive) return;

      setPhase(2); // Progress bar phase
      await sleep(1200);
      if (!isActive) return;

      setPhase(3); // Validation Nodes
      await sleep(1400);
      if (!isActive) return;

      setPhase(4); // DNA
      await sleep(1500);
      if (!isActive) return;

      if (isDeepSynthesis) {
        setPhase(5); // Intensive Quant Engine
        await sleep(2800);
        if (!isActive) return;
      }

      setPhase(6); // Optimization
      await sleep(1200);
      if (!isActive) return;

      setPhase(7); // Finalization
      await sleep(1000);
      if (!isActive) return;

      setPhase(8); // Done
    };

    runPhases();
    return () => { isActive = false; };
  }, [isGenerating, isDeepSynthesis]);

  // Hex Animation for Intensive Job
  useEffect(() => {
    if (phase === 5 && isGenerating) {
      const interval = setInterval(() => {
        setHexData("0x" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0'));
      }, 40);
      return () => clearInterval(interval);
    }
  }, [phase, isGenerating]);

  // Auto-expand/collapse based on generation state
  useEffect(() => {
    if (isGenerating) setIsExpanded(true);
  }, [isGenerating]);

  // --- REUSABLE ORGANIGRAM CONNECTING ARM ---
  const FlowArm = ({ delay = 0 }) => (
    <div className="absolute left-[-22px] top-[-26px] w-[22px] h-[42px]">
      <motion.div 
        initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className="absolute left-0 top-0 w-[1.5px] bg-gradient-to-b from-[#1A3626] via-gray-300 to-gray-200" 
      />
      <motion.div 
        initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.3, delay: delay + 0.3, ease: "easeOut" }}
        className="absolute left-0 bottom-0 h-[1.5px] bg-gray-200" 
      />
    </div>
  );

  return (
    <div className="flex justify-start items-start gap-4 group w-full mb-10 relative z-20 font-open">
      
      {/* Ghost Avatar */}
      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5 opacity-40 mix-blend-multiply grayscale">
        <img src={LOGO_URL} alt="Stensor" className="w-full h-full object-contain" />
      </div>

      <div className="relative flex flex-col w-full max-w-[85%] mt-1">
        
        {/* HEADER: Stensor Title & 3 Dots */}
        <div className="flex items-center justify-between pl-1 mb-3 relative">
          <span className="text-[12px] font-black uppercase tracking-[0.15em] text-slate-800">Stensor</span>
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

        {/* --- LABOR ILLUSION: THE WHITE & GRAY HALO --- */}
        <motion.div layout className="mb-2">
          <AnimatePresence mode="wait">
            {isGenerating && (
              <motion.div 
                layout
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                className="relative inline-flex items-center gap-3 px-3 py-1.5 cursor-pointer z-10"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {/* Fluid Background Halo (No Borders) */}
                <motion.div 
                  className="absolute inset-0 rounded-full z-0"
                  animate={{
                    boxShadow: [
                      "0 0 15px 4px rgba(220, 230, 240, 0.4), inset 0 0 10px rgba(255,255,255,1)",
                      "0 0 30px 8px rgba(255, 255, 255, 0.9), inset 0 0 20px rgba(255,255,255,1)",
                      "0 0 15px 4px rgba(220, 230, 240, 0.4), inset 0 0 10px rgba(255,255,255,1)",
                    ],
                    backgroundColor: ["rgba(250, 252, 255, 0.6)", "rgba(255, 255, 255, 1)", "rgba(250, 252, 255, 0.6)"]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                  <span className="text-[12px] font-mono tracking-tight text-blue-600/90 font-medium">
                    Thinking...
                  </span>
                  <motion.svg animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.4 }} className="w-3.5 h-3.5 text-blue-400/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></motion.svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* --- THE EXPANDED ORGANIGRAM FLOWCHART --- */}
          <AnimatePresence>
            {isExpanded && isGenerating && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                {/* Vertical Trunk */}
                <div className="relative mt-4 ml-[34px] flex flex-col gap-6 pb-6">
                  
                  {/* Phase 1 & 2: Parsing & Thick Progress Bar */}
                  <AnimatePresence>
                    {phase >= 1 && (
                      <motion.div layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative flex flex-col gap-2">
                        <FlowArm delay={0} />
                        <span className={`text-[11px] font-mono ${phase > 2 ? 'text-gray-400' : 'text-gray-600'}`}>Parsing syntax & context</span>
                        {phase <= 2 && (
                          <div className="w-48 h-[6px] bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div className="h-full bg-slate-800 rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.2, ease: "easeInOut" }} />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Phase 3: Validation Nodes */}
                  <AnimatePresence>
                    {phase >= 3 && (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex flex-col gap-2 pt-1">
                        <FlowArm delay={0} />
                        <span className={`text-[11px] font-mono ${phase > 3 ? 'text-gray-400' : 'text-gray-600'}`}>Validating tensor matrices</span>
                        <div className="flex gap-2.5">
                          {[0, 1, 2, 3].map((i) => (
                            <motion.div 
                              key={i}
                              className="w-4 h-4 rounded-md flex items-center justify-center bg-[#1A3626] shadow-sm"
                              initial={{ scale: 0, opacity: 0 }} 
                              animate={{ scale: [0, 1.2, 1], opacity: 1 }} 
                              transition={{ duration: 0.4, delay: i * 0.2 }}
                            >
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Phase 4: Stensor DNA Integration */}
                  <AnimatePresence>
                    {phase >= 4 && (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex items-center gap-3 pt-1">
                        <FlowArm delay={0} />
                        <motion.div 
                          className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${phase > 4 ? 'bg-[#1A3626]' : 'bg-blue-500'}`}
                          animate={phase === 4 ? { boxShadow: ["0px 0px 0px rgba(59,130,246,0)", "0px 0px 15px rgba(59,130,246,0.7)", "0px 0px 0px rgba(59,130,246,0)"] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {phase > 4 && <svg className="w-full h-full p-[2px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </motion.div>
                        <span className={`text-[11px] font-mono ${phase === 4 ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                          Aligning with Stensor DNA Profile
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Phase 5: Intensive Quant Engine (Deep Synthesis Only) */}
                  <AnimatePresence>
                    {phase >= 5 && isDeepSynthesis && (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex flex-col gap-2 pt-1">
                        <FlowArm delay={0} />
                        <div className="flex items-center gap-3">
                           {phase === 5 ? (
                             <svg className="w-4 h-4 text-indigo-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                           ) : (
                             <div className="w-4 h-4 rounded-full bg-[#1A3626] flex items-center justify-center"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                           )}
                           <span className={`text-[11px] font-mono ${phase === 5 ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>Executing 10,000+ Monte Carlo Simulations</span>
                        </div>
                        {/* Rapid Hex Processor UI */}
                        {phase === 5 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#0A0A0A] rounded-md p-2.5 w-[220px] overflow-hidden shadow-inner border border-slate-800 ml-[28px]">
                            <span className="text-[10px] text-emerald-400 font-mono tracking-widest leading-relaxed break-all">
                              [SYS] {hexData} {hexData} {hexData}
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Phase 6: Tax Optimization */}
                  <AnimatePresence>
                    {phase >= 6 && (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex items-center gap-3 pt-1">
                        <FlowArm delay={0} />
                        <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${phase > 6 ? 'bg-[#1A3626]' : 'border-[2px] border-slate-300 border-t-slate-700 animate-spin bg-transparent'}`}>
                          {phase > 6 && <svg className="w-full h-full p-[2px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <span className={`text-[11px] font-mono ${phase === 6 ? 'text-gray-700 font-bold' : 'text-gray-400'}`}>Applying wealth heuristics</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Phase 7: Finalization */}
                  <AnimatePresence>
                    {phase >= 7 && (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex items-center gap-3 pt-1">
                        <FlowArm delay={0} />
                        <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${phase > 7 ? 'bg-[#1A3626]' : 'border-[2px] border-blue-200 border-t-blue-600 animate-spin bg-transparent'}`}>
                          {phase > 7 && <svg className="w-full h-full p-[2px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <span className={`text-[11px] font-mono ${phase === 7 ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>Formatting final output...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- FINAL GENERATED MESSAGE FADE IN --- */}
        <AnimatePresence>
          {!isGenerating && (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="bg-transparent px-1 text-[15px] leading-[1.65] text-slate-800 font-normal mt-1"
            >
              <div className="whitespace-pre-wrap break-words">
                {discussMode ? content : "Output finalized. View the actionable synthesis in the main preview pane."}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}