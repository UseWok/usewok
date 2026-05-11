import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInputBar({ input, setInput, onSend, onStop, isLoading, discussMode, setDiscussMode, canUploadFiles, hasInternet, onOpenIframe }) {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pastedImages, setPastedImages] = useState([]);

  // SON DE DEBUT (Ascendant)
  const playMicStart = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  };

  // SON DE FIN (Descendant / Satisfaisant)
  const playMicStop = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } catch(e) {}
  };

  const handleMicClick = () => {
    if (isRecording) { playMicStop(); } else { playMicStart(); }
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
    <div className="flex flex-col w-full bg-white rounded-[24px] border border-gray-200/50 shadow-sm">
      
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

      <div className="px-4 pt-3 pb-2">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onPaste={handlePaste} placeholder="Message..." className="w-full bg-transparent text-[14px] text-gray-800 focus:outline-none resize-none leading-relaxed" rows={2} style={{ minHeight: '38px', maxHeight: '120px' }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
      </div>

      <div className="flex items-center justify-between px-3 pb-3 pt-1.5 relative">
        <div className="flex items-center gap-1.5">
          
          {/* ENGRENAGE -> 95% DNA MODAL */}
          <button onClick={() => onOpenIframe('/ai-dna')} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-[10px] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          
          <div className="relative">
            <button onClick={() => setShowPlusMenu(!showPlusMenu)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-[10px] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <AnimatePresence>
              {showPlusMenu && (
                <>
                  {/* VOILE QUI FERME LE MENU AU CLIC AILLEURS */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowPlusMenu(false)}></div>
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.1 }} className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 font-open">
                    <label className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors group">
                      <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>Upload file</div>
                      {!canUploadFiles && <span className="px-2 py-0.5 rounded-md text-[9px] font-black border border-[#DDFF00] text-black shadow-sm" style={{ background: 'linear-gradient(90deg, #DDFF00 0%, #FFFFFF 100%)' }}>Pro</span>}
                      <input type="file" className="hidden" multiple onChange={(e) => { if (!canUploadFiles) { onOpenIframe('/pricing'); return; } const dropped = Array.from(e.target.files || []); if (dropped.length > 0) setFiles(p => [...p, ...dropped]); setShowPlusMenu(false); }} />
                    </label>
                    <button onClick={() => { if (!hasInternet) { onOpenIframe('/pricing'); return; } setUseWebSearch(!useWebSearch); setShowPlusMenu(false); }} className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center justify-between gap-2 transition-colors">
                      <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>Web Search</div>
                      {!hasInternet ? <span className="px-2 py-0.5 rounded-md text-[9px] font-black border border-[#DDFF00] text-black shadow-sm" style={{ background: 'linear-gradient(90deg, #DDFF00 0%, #FFFFFF 100%)' }}>Pro</span> : <div className={`w-6 h-3.5 rounded-full relative transition-colors ${useWebSearch ? 'bg-black' : 'bg-gray-200'}`}><div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform ${useWebSearch ? 'translate-x-2.5' : ''}`}></div></div>}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-medium transition-colors text-gray-500 hover:bg-gray-100 ml-1">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
            Edit
          </button>
          
          {/* DISCUSS VIOLET LORSQU'IL EST ACTIF */}
          <button 
            onClick={() => setDiscussMode(!discussMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-medium transition-colors ${discussMode ? 'bg-[#F3E8FF] text-[#7E22CE]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Discuss
          </button>
        </div>

        {/* CONTAINER MICRO & ENVOYER RECOUVERTS */}
        <div className="relative flex items-center justify-end w-[84px] h-9">
          
          {/* Bouton Envoyer en dessous */}
          {isLoading ? (
            <button onClick={onStop} className="absolute right-0 w-9 h-9 bg-red-500 text-white rounded-[10px] flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </button>
          ) : (
            <button onClick={handleSendMessage} disabled={!input.trim() && pastedImages.length === 0} className={`absolute right-0 w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors ${input.trim() || pastedImages.length > 0 ? 'bg-[#0A0A0A] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          )}

          {/* Bouton Micro Carré qui s'allonge et recouvre Send */}
          <motion.button 
            onClick={handleMicClick} 
            animate={{ width: isRecording ? 84 : 36, backgroundColor: isRecording ? '#F3E8FF' : 'transparent', color: isRecording ? '#7E22CE' : '#4B5563' }} 
            className="absolute right-0 h-9 rounded-[10px] flex items-center justify-center z-10 transition-colors hover:bg-gray-100 overflow-hidden"
          >
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#7E22CE] animate-pulse"></div>
                <span className="text-[13px] font-bold tracking-wide">REC</span>
              </div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
            )}
          </motion.button>

        </div>
      </div>
    </div>
  );
}