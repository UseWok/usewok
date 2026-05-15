import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toggle from '@/components/ui/Toggle'; 
import { Settings, Sparkles, Binary, FileUp, Zap, Target, LineChart, Image as ImageIcon, X, Mic, MessageCircle } from 'lucide-react';

export default function ChatInputBar({ input, setInput, onSend, onStop, isLoading, files, setFiles, discussMode, setDiscussMode, aiThemePromptActive, setAiThemePromptActive }) {
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [masterMode, setMasterMode] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('architect');
  const [isRecording, setIsRecording] = useState(false);
  const configRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if(configRef.current && !configRef.current.contains(e.target)) setShowAIConfig(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSend = () => { if (!isLoading && (input.trim() || files?.length > 0)) onSend(input); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

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
    if (isRecording) playMicStop(); else playMicStart();
    setIsRecording(!isRecording);
  };

  const handleFileChange = (e) => {
    const dropped = Array.from(e.target.files || []);
    if (dropped.length > 0) {
      const parsedFiles = dropped.map(file => ({
        file, name: file.name, url: URL.createObjectURL(file), type: file.type
      }));
      setFiles(p => [...(p || []), ...parsedFiles]);
    }
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const learningStrategies = [
    { id: 'architect', icon: Target, name: 'Strategic Architect', desc: 'Constructs robust, logic-driven frameworks.' },
    { id: 'auditor', icon: Binary, name: 'Forensic Auditor', desc: 'Meticulously dissects data to find anomalies and absolute truths.' },
    { id: 'quant', icon: LineChart, name: 'Quantitative Engine', desc: 'Executes pure mathematical logic based on statistics.' },
  ];

  return (
    <div className="flex flex-col w-full relative" ref={configRef}>
      
      {aiThemePromptActive && (
        <div className="absolute -top-10 left-2 z-20">
          <div className="bg-[#EBF5FF] border border-[#0080ff]/30 text-[#0080ff] text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Customizing AI Appearance...
            <button onClick={() => setAiThemePromptActive(false)} className="hover:bg-blue-100 rounded-full p-0.5 ml-1 transition-none"><X className="w-3 h-3"/></button>
          </div>
        </div>
      )}

      {showAIConfig && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 w-[340px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 p-2 font-sans">
          <div className="p-3">
            <h3 className="text-[13px] font-bold text-[#333333]">Base Power</h3>
            <p className="text-[11.5px] text-[#707070] mt-1 leading-snug">Default behavior. Fast, incredibly reliable query resolution.</p>
          </div>
          <div className="h-px bg-[#E5E5E5] my-1 mx-3"></div>
          <div className="p-3 bg-white rounded-lg mt-2 mx-1 flex items-center justify-between gap-3">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#0080ff]" />
                  <h3 className="text-[13px] font-bold text-[#333333]">Master AI Protocol</h3>
              </div>
              <p className="text-[11px] text-[#707070] mt-1 leading-snug">
                Deep logic analysis executed with relentless precision.
              </p>
            </div>
            <Toggle enabled={masterMode} onChange={() => setMasterMode(!masterMode)} />
          </div>

          <div className="pt-4 pb-1 space-y-1">
            <h4 className="text-[11px] font-bold text-[#999999] tracking-wider mb-2 px-3 uppercase">Behavioral Directives</h4>
            {learningStrategies.map((strategy, idx) => (
              <div key={strategy.id} className="relative">
                <button onClick={() => { setSelectedStrategy(strategy.id); setShowAIConfig(false); }} className="w-full text-left p-3 rounded-lg flex items-start gap-3 hover:bg-[#F9F8F6] transition-none group">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedStrategy === strategy.id ? 'border-[#0080ff]' : 'border-gray-300'}`}>
                      {selectedStrategy === strategy.id && <div className="w-2 h-2 bg-[#0080ff] rounded-full" />}
                    </div>
                  </div>
                  <div className="flex-1">
                      <div className="flex items-center gap-2">
                         <strategy.icon className={`w-4 h-4 ${selectedStrategy === strategy.id ? 'text-[#0080ff]' : 'text-gray-500'}`} />
                         <span className="text-[13px] font-bold text-[#333333]">{strategy.name}</span>
                      </div>
                      <p className="text-[11px] text-[#707070] mt-1 leading-snug">{strategy.desc}</p>
                  </div>
                </button>
                {idx < learningStrategies.length - 1 && <div className="mx-4 my-1 h-px bg-[#F0F0F0]"></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INPUT BAR (Zero-latency Active States) */}
      <div className="bg-white border border-[#E5E5E5] rounded-md flex flex-col shadow-sm focus-within:shadow-md relative overflow-visible min-h-[64px] transition-all">
        
        {files?.length > 0 && (
          <div className="flex gap-2 px-3 pt-3 pb-1 overflow-x-auto">
            {files.map((file, i) => (
              <div key={i} className="relative w-12 h-12 rounded-md border border-[#E5E5E5] flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                {file.type?.startsWith('image/') ? <img src={file.url} className="object-cover w-full h-full" alt="preview" /> : <FileUp className="w-5 h-5 text-gray-400" />}
                <button onClick={() => removeFile(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"><X className="w-3 h-3"/></button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 p-1.5 flex-1">
          
          <button onClick={() => setShowAIConfig(!showAIConfig)} className={`p-2 rounded-md flex-shrink-0 transition-none active:scale-95 ${showAIConfig ? 'bg-[#F4F4F4] text-[#333333]' : 'text-[#707070] hover:text-[#333333] hover:bg-[#F4F4F4]'}`}>
            <Settings className="w-5 h-5" />
          </button>

          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Wok..." 
            className="flex-1 bg-transparent text-[15px] text-[#0d0d0d] placeholder:text-gray-400 focus:outline-none resize-none overflow-y-auto leading-relaxed font-sans mb-1.5"
            rows={1}
            style={{ minHeight: '26px', maxHeight: '150px' }}
          />

          <div className="flex items-center gap-1 flex-shrink-0 relative mb-1">
            <button onClick={() => setDiscussMode(!discussMode)} className={`p-2 rounded-md transition-none active:scale-95 flex items-center justify-center ${discussMode ? 'bg-[#F3E8FF] text-[#7E22CE]' : 'text-[#707070] hover:bg-[#F4F4F4] hover:text-[#333333]'}`} title="Discuss Mode">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button onClick={() => fileInputRef.current.click()} className="p-2 text-[#707070] hover:text-[#333333] hover:bg-[#F4F4F4] rounded-md transition-none active:scale-95">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
            
            <div className="relative w-9 h-9 flex items-center justify-end ml-1">
              
              {isLoading ? (
                <button onClick={onStop} className="absolute right-0 w-9 h-9 bg-[#0080ff] text-white rounded-md flex items-center justify-center shadow-sm hover:bg-[#0066cc] active:scale-95 transition-all">
                  <div className="w-3.5 h-3.5 bg-white rounded-[3px]"></div>
                </button>
              ) : (
                <button onClick={handleSend} disabled={!input.trim() && files?.length === 0} className={`absolute right-0 w-9 h-9 rounded-md flex items-center justify-center transition-all active:scale-95 shadow-sm ${input.trim() || files?.length > 0 ? 'bg-[#0A0A0A] text-white hover:bg-black/80' : 'bg-[#E5E5E5] text-white cursor-not-allowed'}`}>
                  <Sparkles className="w-[18px] h-[18px]" />
                </button>
              )}

              <motion.button 
                onClick={handleMicClick} 
                animate={{ width: isRecording ? 100 : 36, backgroundColor: isRecording ? '#F3E8FF' : 'transparent', color: isRecording ? '#7E22CE' : 'transparent' }} 
                className={`absolute right-0 h-9 rounded-md flex items-center justify-center z-10 transition-colors overflow-hidden ${isRecording ? 'shadow-md' : 'pointer-events-none'}`}
              >
                {isRecording ? (
                  <div className="flex items-center gap-2 px-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#7E22CE] animate-pulse"></div>
                    <span className="text-[13px] font-bold tracking-wide">REC</span>
                  </div>
                ) : null}
              </motion.button>
              
              {!isRecording && (
                 <button onClick={handleMicClick} className="absolute right-[44px] p-2 text-[#707070] hover:text-[#333333] hover:bg-[#F4F4F4] rounded-md transition-none active:scale-95">
                    <Mic className="w-5 h-5" />
                 </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}