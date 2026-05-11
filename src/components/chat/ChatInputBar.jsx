import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInputBar({ input, setInput, onSend, onStop, isLoading, discussMode, setDiscussMode, onOpenIframe }) {
  const [isRecording, setIsRecording] = useState(false);

  const playMicSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(isRecording ? 300 : 500, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
  };

  const handleMicClick = () => {
    playMicSound();
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden">
      
      <div className="px-4 pt-3 pb-2 border-b border-gray-50">
        <textarea 
          value={input} onChange={(e) => setInput(e.target.value)} 
          placeholder="Message..." 
          className="w-full bg-transparent text-[14px] text-gray-800 focus:outline-none resize-none leading-relaxed" 
          rows={1} style={{ minHeight: '38px', maxHeight: '120px' }} 
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(input); } }} 
        />
      </div>

      <div className="flex items-center justify-between px-3 pb-3 pt-2">
        <div className="flex items-center gap-2">
          
          {/* Settings */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onOpenIframe('/ai-dna')} className="p-1.5 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </motion.button>
          
          <div className="w-[1px] h-4 bg-gray-200/80 mx-0.5"></div>
          
          {/* Plus */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-1.5 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </motion.button>
          
          {/* Modifier */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F9FA] hover:bg-gray-100 transition-colors text-[#2B547E]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
            <span className="text-[13px] font-medium">Modifier</span>
          </motion.button>

          {/* Discuter */}
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setDiscussMode(!discussMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors ${discussMode ? 'bg-[#F3E8FF] text-[#7E22CE]' : 'bg-[#F8F9FA] hover:bg-gray-100 text-[#2B547E]'}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span className="text-[13px] font-medium">Discuter</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mic */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleMicClick} animate={{ width: isRecording ? 100 : 36, backgroundColor: isRecording ? '#FEE2E2' : 'transparent' }} className="flex items-center justify-center h-9 text-gray-800 hover:bg-gray-100 rounded-full transition-colors overflow-hidden">
            {isRecording ? (
              <div className="flex items-center gap-2 px-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[12px] font-bold text-red-500 whitespace-nowrap">Rec</span>
              </div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            )}
          </motion.button>
          
          {/* Send / Stop */}
          {isLoading ? (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onStop} className="w-9 h-9 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-md">
              <div className="w-3 h-3 bg-white rounded-[2px]"/>
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onSend(input)} disabled={!input.trim()} className={`w-9 h-9 rounded-[14px] flex items-center justify-center transition-all ${input.trim() ? 'bg-[#9BA3AF] text-white shadow-sm hover:bg-gray-600' : 'bg-[#E5E7EB] text-white'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}