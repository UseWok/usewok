import React, { useState, useRef, useEffect } from 'react';
import { Settings, Sparkles, Mic, MessageCircle, Image as ImageIcon, FileUp, Zap, Search, Eye, PenTool } from 'lucide-react';

export default function ChatInputBar({ onSend, isLoading }) {
  const [input, setInput] = useState('');
  const [showConfig, setShowAIConfig] = useState(false);
  const [masterMode, setMasterMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState('search');
  const textareaRef = useRef(null);

  const charLimit = 300;

  // Auto-resize logic: 3 lines to 7 lines
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 72), 168); 
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!isLoading && input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const modes = [
    { id: 'search', icon: Search, name: 'Search' },
    { id: 'insight', icon: Eye, name: 'Insight' },
    { id: 'build', icon: PenTool, name: 'Build' },
  ];

  return (
    <div className="flex flex-col w-full relative">
      
      {/* IMPROVED SOBRE CONFIG POPOVER */}
      {showConfig && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 w-[280px] bg-white border border-[#E5E5E5] rounded-xl shadow-2xl z-[100] p-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="p-3 mb-1 flex items-center justify-between hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => setMasterMode(!masterMode)}>
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${masterMode ? 'text-blue-500' : 'text-gray-300'}`} />
              <span className="text-[13px] font-bold">Expert Finance Agent</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${masterMode ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${masterMode ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </div>
          <div className="h-px bg-gray-100 my-1 mx-2" />
          <button onClick={() => { setMasterMode(false); setShowAIConfig(false); }} className="w-full text-left p-2.5 text-[12px] font-medium text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg">Default Engine</button>
          <div className="mt-2 space-y-1">
            {modes.map(m => (
              <button key={m.id} onClick={() => { setSelectedMode(m.id); setShowAIConfig(false); }} className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-[12px] font-semibold transition-colors ${selectedMode === m.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}>
                <m.icon className="w-4 h-4" /> {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E5E5E5] rounded-2xl flex flex-col shadow-sm focus-within:shadow-md transition-all">
        
        {/* TEXT ON TOP */}
        <textarea 
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, charLimit))}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Ask Wok anything..."
          className="w-full p-4 bg-transparent text-[16px] focus:outline-none resize-none leading-relaxed min-h-[72px]"
          style={{ fontFamily: '"Open Sans", sans-serif' }}
        />

        {/* BUTTONS ON BOTTOM ROW */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <button onClick={() => setShowAIConfig(!showConfig)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"><Settings className="w-5 h-5" /></button>
            <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg"><ImageIcon className="w-5 h-5" /></button>
            <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg"><Mic className="w-5 h-5" /></button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold ${input.length >= charLimit ? 'text-red-500' : 'text-gray-300'}`}>
              {input.length}/{charLimit}
            </span>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-xl transition-all active:scale-90 ${input.trim() ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-300'}`}
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}