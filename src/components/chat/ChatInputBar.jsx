import React, { useState, useRef, useEffect } from 'react';
import { Settings, Sparkles, FileUp, Zap, Image as ImageIcon, X, Mic, Check } from 'lucide-react';

export default function ChatInputBar({ input, setInput, onSend, onStop, isLoading, files = [], setFiles, aiThemePromptActive, setAiThemePromptActive }) {
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [masterMode, setMasterMode] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const configRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const charLimit = 300;

  useEffect(() => {
    const h = (e) => { if(configRef.current && !configRef.current.contains(e.target)) setShowAIConfig(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Flawless Textarea Auto-Resize Engine
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit'; // Reset height to recalculate
      const scrollHeight = textareaRef.current.scrollHeight;
      // Limits height between approx 1 line (24px + padding) and 7 lines (168px)
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 56), 168)}px`;
    }
  }, [input]);

  const handleSend = () => { if (!isLoading && (input.trim() || (files?.length || 0) > 0)) onSend(input); };
  
  const handleKeyDown = (e) => { 
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      handleSend(); 
    } 
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

  const modes = [
    { id: 'creative', name: 'Creative' },
    { id: 'balanced', name: 'Balanced' },
    { id: 'precise', name: 'Precise' },
  ];

  return (
    <div className="flex flex-col w-full relative overflow-visible" ref={configRef}>
      
      {aiThemePromptActive && (
        <div className="absolute -top-10 left-2 z-[999]">
          <div className="bg-[#0055FF]/10 border border-[#0055FF]/30 text-[#0055FF] text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Customizing AI Appearance...
            <button onClick={() => setAiThemePromptActive(false)} className="hover:bg-[#0055FF]/20 text-white rounded-full p-0.5 ml-1 transition-none"><X className="w-3 h-3"/></button>
          </div>
        </div>
      )}

      {showAIConfig && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 w-[260px] bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg shadow-2xl z-[999] p-2 font-sans transition-none">
          <button onClick={() => { setMasterMode(false); setShowAIConfig(false); }} className="w-full text-left p-2.5 rounded-md flex items-center justify-between hover:bg-[#1A1A1A] transition-none">
             <span className="text-[13px] font-bold text-white">Default Engine</span>
             {!masterMode && <Check className="w-4 h-4 text-[#0055FF]" />}
          </button>
          <button onClick={() => { setMasterMode(true); setShowAIConfig(false); }} className="w-full text-left p-2.5 rounded-md flex items-center justify-between hover:bg-[#1A1A1A] transition-none mt-1">
             <div className="flex items-center gap-2">
               <Zap className="w-4 h-4 text-[#0055FF]" />
               <span className="text-[13px] font-bold text-white">Expert Finance Agent</span>
             </div>
             {masterMode && <Check className="w-4 h-4 text-[#0055FF]" />}
          </button>

          <div className="mx-4 my-2 border-b border-[#2A2A2A]"></div>

          <div className="space-y-1">
            {modes.map((m) => (
              <button key={m.id} onClick={() => { setSelectedStrategy(m.id); setShowAIConfig(false); }} className={`w-full text-left p-2 rounded-md flex items-center gap-3 transition-none ${selectedStrategy === m.id ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#1A1A1A] text-gray-400'}`}>
                <span className="text-[12px] font-semibold">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MATCHED CORNERS AND DARK THEME */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl flex flex-col shadow-sm focus-within:border-[#0055FF]/50 transition-none z-10 w-full overflow-hidden">
        
        <textarea 
          ref={textareaRef}
          value={input} 
          onChange={(e) => setInput(e.target.value.substring(0, charLimit))} 
          onKeyDown={handleKeyDown}
          placeholder={aiThemePromptActive ? "Describe appearance change..." : "Message Wok..."}
          className="w-full bg-transparent text-[15px] text-white placeholder:text-gray-500 focus:outline-none resize-none leading-relaxed px-4 pt-4 pb-2"
          style={{ fontFamily: '"Open Sans", sans-serif' }}
        />

        {(files?.length || 0) > 0 && (
          <div className="flex gap-2 px-4 pt-1 pb-2 overflow-x-auto">
            {files.map((file, i) => (
              <div key={i} className="relative w-12 h-12 rounded-md border border-[#2A2A2A] flex items-center justify-center bg-[#0F0F0F] overflow-hidden flex-shrink-0">
                {file.type?.startsWith('image/') ? <img src={file.url} className="object-cover w-full h-full" alt="preview" /> : <FileUp className="w-5 h-5 text-gray-500" />}
                <button onClick={() => removeFile(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><X className="w-3 h-3"/></button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-1">
            <button onClick={() => setShowAIConfig(!showAIConfig)} className={`p-2 rounded-md transition-none active:scale-95 ${showAIConfig ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}>
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-md transition-none active:scale-95">
              <ImageIcon className="w-4 h-4" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
          </div>

          <div className="flex items-center gap-3 pr-1">
            <span className={`text-[11px] font-bold ${input.length >= charLimit ? 'text-red-500' : 'text-gray-500'}`}>
              {input.length}/{charLimit}
            </span>
            
            {isLoading ? (
              <button onClick={onStop} className="w-9 h-9 bg-[#0055FF] text-white rounded-[10px] flex items-center justify-center shadow-sm hover:bg-[#0044CC] active:scale-95 transition-none">
                <div className="w-3 h-3 bg-white rounded-[2px]"></div>
              </button>
            ) : (
              <button onClick={handleSend} disabled={!input.trim() && (files?.length || 0) === 0} className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-none active:scale-95 shadow-sm ${(input.trim() || (files?.length || 0) > 0) ? 'bg-[#0055FF] text-white hover:bg-[#0044CC]' : 'bg-[#2A2A2A] text-gray-500 cursor-not-allowed'}`}>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}