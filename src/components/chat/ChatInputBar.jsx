import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sparkles, Binary, FileUp, Zap, Target, LineChart, Image as ImageIcon, X, Mic, MessageCircle } from 'lucide-react';

export default function ChatInputBar({ input, setInput, onSend, onStop, isLoading, files = [], setFiles, discussMode, setDiscussMode, aiThemePromptActive, setAiThemePromptActive }) {
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('architect');
  const configRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if(configRef.current && !configRef.current.contains(e.target)) setShowAIConfig(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSend = () => { if (!isLoading && (input.trim() || (files?.length || 0) > 0)) onSend(input); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  // REPLACED `handleStop` with `onStop` prop correctly
  const handleMicClick = () => { setIsRecording(!isRecording); };

  return (
    <div className="flex flex-col gap-2 font-sans relative" ref={configRef}>
      
      <AnimatePresence initial={false}>
        {aiThemePromptActive && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute -top-10 left-2 z-20">
            <div className="bg-[#EBF5FF] border border-[#0080ff]/30 text-[#0080ff] text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> AI Customization: Preference Active
              <button onClick={() => setAiThemePromptActive(false)} className="hover:bg-blue-100 rounded-full p-0.5 transition-none"><X className="w-3 h-3"/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAIConfig && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 w-[300px] bg-white border border-[#E5E5E5] rounded-lg shadow-2xl z-50 p-2 text-left transition-none">
          <p className="text-[10px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">AI Behavior Directive</p>
          {['architect', 'auditor', 'quant'].map((id) => (
            <button key={id} onClick={() => { setSelectedStrategy(id); setShowAIConfig(false); }} className={`w-full text-left p-2.5 rounded-md flex items-center gap-3 hover:bg-[#F9F8F6] ${selectedStrategy === id ? 'bg-[#F9F8F6]' : ''}`}>
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedStrategy === id ? 'border-[#0080ff]' : 'border-gray-300'}`}>{selectedStrategy === id && <div className="w-1.5 h-1.5 bg-[#0080ff] rounded-full" />}</div>
              <span className="text-[12px] font-bold capitalize text-[#333333]">{id} Profile</span>
            </button>
          ))}
        </div>
      )}

      {/* RECTANGULAR, TALLER INPUT BAR */}
      <div className="bg-white border border-[#E5E5E5] rounded-md p-2 flex flex-col shadow-sm relative overflow-visible min-h-[72px]">
        {(files?.length || 0) > 0 && (
          <div className="flex gap-2 px-2 pt-1 pb-2 overflow-x-auto">
            {files.map((file, i) => (
              <div key={i} className="relative w-12 h-12 rounded-md border border-[#E5E5E5] bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {file.type?.startsWith('image/') ? <img src={file.url} className="object-cover w-full h-full" /> : <FileUp className="w-5 h-5 text-gray-400" />}
                <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3"/></button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 p-1 flex-1">
          <button onClick={() => setShowAIConfig(!showAIConfig)} className="p-2.5 rounded-md text-gray-400 hover:bg-[#F4F4F4] transition-none"><Settings className="w-5 h-5" /></button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={aiThemePromptActive ? "Describe appearance change..." : "Message Wok..."} className="flex-1 bg-transparent text-[15px] text-[#0d0d0d] focus:outline-none resize-none leading-relaxed font-sans mb-1" rows={1} style={{ minHeight: '32px', maxHeight: '200px' }} />
          <div className="flex items-center gap-1.5 relative mb-0.5">
            <button onClick={() => setDiscussMode(!discussMode)} className={`p-2 rounded-md ${discussMode ? 'bg-[#F3E8FF] text-[#7E22CE]' : 'text-[#707070] hover:bg-[#F4F4F4]'}`}><MessageCircle className="w-5 h-5" /></button>
            <button onClick={() => fileInputRef.current.click()} className="p-2 text-[#707070] hover:bg-[#F4F4F4] rounded-md"><ImageIcon className="w-5 h-5" /></button>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => { const dropped = Array.from(e.target.files || []); if (dropped.length > 0) { setFiles(p => [...(p || []), ...dropped.map(f => ({ file: f, name: f.name, url: URL.createObjectURL(f), type: f.type }))]); } }} />
            
            <div className="relative w-9 h-9 flex items-center justify-end">
              {isLoading ? (
                <button onClick={onStop} className="absolute right-0 w-9 h-9 bg-[#0080ff] text-white rounded-md flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-[2px]"></div></button>
              ) : (
                <button onClick={handleSend} disabled={!input.trim() && (files?.length || 0) === 0} className={`absolute right-0 w-9 h-9 rounded-md flex items-center justify-center ${(input.trim() || (files?.length || 0) > 0) ? 'bg-[#0A0A0A] text-white' : 'bg-[#E5E5E5] text-white'}`}><Sparkles className="w-[16px] h-[16px]" /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}