import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInputBar({ input, setInput, onSend, onStop, isLoading, discussMode, setDiscussMode, canUploadFiles, hasInternet, onOpenIframe }) {
  const [isRecording, setIsRecording] = useState(false);

  const playClickSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
  };

  const handleMicClick = () => {
    playClickSound();
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-[24px]">
      <div className="px-4 pt-3 pb-2 border-b border-gray-50">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message..." className="w-full bg-transparent text-[14px] text-gray-800 focus:outline-none resize-none leading-relaxed" rows={2} style={{ minHeight: '38px' }} />
      </div>

      <div className="flex items-center justify-between px-3 pb-3 pt-1.5 relative">
        <div className="flex items-center gap-1.5">
          <button onClick={() => onOpenIframe('/ai-dna')} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          
          <button 
            onClick={() => setDiscussMode(!discussMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all border border-[#DDFF00]"
            style={{ 
              background: discussMode ? 'linear-gradient(90deg, #DDFF00 0%, #FFFFFF 100%)' : '#F8F9FA',
              color: '#000'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Discuss
          </button>
        </div>

        <div className="flex items-center gap-2">
          <motion.button onClick={handleMicClick} animate={{ width: isRecording ? 100 : 36 }} className="flex items-center justify-center h-9 text-gray-700 bg-gray-50 rounded-full transition-colors overflow-hidden">
            {isRecording ? <span className="text-[12px] font-bold text-red-500 animate-pulse">Recording</span> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>}
          </motion.button>
          
          {isLoading ? (
            <button onClick={onStop} className="w-9 h-9 bg-red-500 text-white rounded-xl animate-pulse flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-sm"/></button>
          ) : (
            <button onClick={() => onSend(input)} disabled={!input.trim()} className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${input.trim() ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
          )}
        </div>
      </div>
    </div>
  );
}