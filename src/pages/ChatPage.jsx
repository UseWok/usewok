import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInputBar({ input, setInput, onSend, onStop, isLoading, discussMode, setDiscussMode, canUploadFiles, hasInternet, onOpenIframe }) {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pastedImages, setPastedImages] = useState([]);

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(isRecording ? 400 : 600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
  };

  const handleMicClick = () => {
    playClickSound();
    setIsRecording(!isRecording);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const url = URL.createObjectURL(file);
        setPastedImages(prev => [...prev, { file, url }]);
      }
    }
  };

  const handleSendMessage = () => {
    if ((!input.trim() && pastedImages.length === 0) || isLoading) return;
    onSend(input, pastedImages);
    setPastedImages([]);
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-[24px]">
      
      {pastedImages.length > 0 && (
        <div className="flex gap-2 px-4 pt-3">
          {pastedImages.map((img, i) => (
            <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img src={img.url} className="w-full h-full object-cover" alt="pasted" />
              <button onClick={() => setPastedImages(p => p.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">×</button>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 pt-3 pb-2 border-b border-gray-50">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onPaste={handlePaste} placeholder="Message..." className="w-full bg-transparent text-[14px] text-gray-800 focus:outline-none resize-none leading-relaxed" rows={2} style={{ minHeight: '38px', maxHeight: '120px' }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
      </div>

      <div className="flex items-center justify-between px-3 pb-3 pt-1.5 relative">
        <div className="flex items-center gap-1.5">
          <button onClick={() => onOpenIframe('/ai-dna')} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          
          <div className="relative">
            <button onClick={() => setShowPlusMenu(!showPlusMenu)} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <AnimatePresence>
              {showPlusMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPlusMenu(false)}></div>
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.1 }} className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                    <button onClick={() => { if(!canUploadFiles) { onOpenIframe('/pricing'); setShowPlusMenu(false); } }} className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center justify-between group">
                      <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>Upload files</div>
                      {!canUploadFiles && <span className="px-2 py-0.5 rounded-md text-[10px] font-black border border-[#DDFF00] text-black shadow-sm" style={{ background: 'linear-gradient(90deg, #DDFF00 0%, #FFFFFF 100%)' }}>Pro</span>}
                    </button>
                    <button onClick={() => { if(!hasInternet) { onOpenIframe('/pricing'); setShowPlusMenu(false); } }} className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center justify-between group">
                      <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>Web Search</div>
                      {!hasInternet && <span className="px-2 py-0.5 rounded-md text-[10px] font-black border border-[#DDFF00] text-black shadow-sm" style={{ background: 'linear-gradient(90deg, #DDFF00 0%, #FFFFFF 100%)' }}>Pro</span>}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* BOUTON DISCUSS NORMAL (Violet/Gris) */}
          <button 
            onClick={() => setDiscussMode(!discussMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all border ${discussMode ? 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]' : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Discuss
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* MICRO ANIMATION FLUIDE */}
          <motion.button onClick={handleMicClick} animate={{ width: isRecording ? 100 : 36, backgroundColor: isRecording ? '#FEE2E2' : '#F9FAFB' }} className="flex items-center justify-center h-9 text-gray-700 rounded-full transition-colors overflow-hidden">
            {isRecording ? (
              <div className="flex items-center gap-2 px-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[12px] font-bold text-red-500 whitespace-nowrap">Recording</span>
              </div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            )}
          </motion.button>
          
          {isLoading ? (
            <button onClick={onStop} className="w-9 h-9 bg-red-500 text-white rounded-xl animate-pulse flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-sm"/></button>
          ) : (
            <button onClick={handleSendMessage} disabled={!input.trim() && pastedImages.length === 0} className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${input.trim() || pastedImages.length > 0 ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
          )}
        </div>
      </div>
    </div>
  );
}