import React, { useState, useRef, useEffect } from 'react';
import Toggle from '@/components/ui/Toggle'; 
import { Settings, Sparkles, Binary, FileUp, Zap, Target, LineChart, Image as ImageIcon, X, Mic, MessageCircle } from 'lucide-react';

export default function ChatInputBar({ input, setInput, onSend, onStop, isLoading, files = [], setFiles, discussMode, setDiscussMode, aiThemePromptActive, setAiThemePromptActive }) {
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

  const handleSend = () => { if (!isLoading && (input.trim() || (files?.length || 0) > 0)) onSend(input); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleMicClick = () => { setIsRecording(!isRecording); };

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
    <div className="flex flex-col w-full relative overflow-visible" ref={configRef}>
      
      {aiThemePromptActive && (
        <div className="absolute -top-10 left-2 z-[999]">
          <div className="bg-[#EBF5FF] border border-[#0080ff]/30 text-[#0080ff] text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Customizing AI Appearance...
            <button onClick={() => setAiThemePromptActive(false)} className="hover:bg-blue-100 rounded-full p-0.5 ml-1 transition-none"><X className="w-3 h-3"/></button>
          </div>
        </div>
      )}

      {/* POPOVER: Absolute positioned, floating ABOVE everything (z-[999]), with dynamic bounding to avoid clipping */}
      {showAIConfig && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 w-[300px] bg-white border border-[#E5E5E5] rounded-lg shadow-2xl z-[999] p-1.5 font-sans transition-none">
          <div className="pt-2 pb-1 space-y-1">
            <h4 className="text-[10px] font-bold text-[#999999] tracking-wider mb-2 px-3 uppercase">AI Behavior Directive</h4>
            {learningStrategies.map((strategy) => (
              <button 
                key={strategy.id} onClick={() => { setSelectedStrategy(strategy.id); setShowAIConfig(false); }} 
                className="w-full text-left p-2.5 rounded-md flex items-start gap-3 hover:bg-[#F9F8F6] transition-none"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedStrategy === strategy.id ? 'border-[#0080ff]' : 'border-gray-300'}`}>
                    {selectedStrategy === strategy.id && <div className="w-1.5 h-1.5 bg-[#0080ff] rounded-full" />}
                  </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                       <strategy.icon className={`w-3.5 h-3.5 ${selectedStrategy === strategy.id ? 'text-[#0080ff]' : 'text-gray-500'}`} />
                       <span className="text-[12px] font-bold text-[#333333]">{strategy.name}</span>
                    </div>
                    <p className="text-[11px] text-[#707070] mt-1 leading-snug">{strategy.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="bg-white border border-[#E5E5E5] rounded-md p-2 flex flex-col shadow-sm focus-within:shadow-md relative overflow-visible min-h-[64px] transition-none z-10">
        
        {(files?.length || 0) > 0 && (
          <div className="flex gap-2 px-2 pt-2 pb-1 overflow-x-auto">
            {files.map((file, i) => (
              <div key={i} className="relative w-12 h-12 rounded-md border border-[#E5E5E5] flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                {file.type?.startsWith('image/') ? <img src={file.url} className="object-cover w-full h-full" alt="preview" /> : <FileUp className="w-5 h-5 text-gray-400" />}
                <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><X className="w-3 h-3"/></button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 p-1.5 flex-1">
          <button onClick={() => setShowAIConfig(!showAIConfig)} className={`p-2 rounded-md flex-shrink-0 transition-none active:scale-95 ${showAIConfig ? 'bg-[#F4F4F4] text-[#333333]' : 'text-[#707070] hover:text-[#333333] hover:bg-[#F4F4F4]'}`}>
            <Settings className="w-5 h-5" />
          </button>

          {/* ENFORCED OPEN SANS FOR INPUT */}
          <textarea 
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={aiThemePromptActive ? "Describe appearance change..." : "Message Wok..."}
            className="flex-1 bg-transparent text-[15px] text-[#0d0d0d] focus:outline-none resize-none overflow-y-auto leading-relaxed mb-1.5"
            rows={1}
            style={{ minHeight: '26px', maxHeight: '150px', fontFamily: '"Open Sans", sans-serif' }}
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
                <button onClick={onStop} className="absolute right-0 w-9 h-9 bg-[#0080ff] text-white rounded-md flex items-center justify-center shadow-sm hover:bg-[#0066cc] active:scale-95 transition-none">
                  <div className="w-3.5 h-3.5 bg-white rounded-[3px]"></div>
                </button>
              ) : (
                <button onClick={handleSend} disabled={!input.trim() && (files?.length || 0) === 0} className={`absolute right-0 w-9 h-9 rounded-md flex items-center justify-center transition-none active:scale-95 shadow-sm ${(input.trim() || (files?.length || 0) > 0) ? 'bg-[#0A0A0A] text-white hover:bg-black/80' : 'bg-[#E5E5E5] text-white cursor-not-allowed'}`}>
                  <Sparkles className="w-[16px] h-[16px]" />
                </button>
              )}

              {/* Static Mic Icon (Visual only, no animation logic for absolute zero-latency) */}
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