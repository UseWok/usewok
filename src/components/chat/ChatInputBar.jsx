import React, { useState, useRef, useEffect } from 'react';
import { Settings, Sparkles, Binary, FileUp, Target, LineChart, Image as ImageIcon } from 'lucide-react';

const Toggle = ({ enabled, onChange }) => (
  <button onClick={onChange} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out ${enabled ? 'bg-[#0080ff]' : 'bg-[#E5E5E5]'}`}>
    <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out" style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
  </button>
);

export default function ChatInputBar({ input, setInput, onSend, isLoading }) {
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [apexEquityMode, setApexEquityMode] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('architect');
  const configRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if(configRef.current && !configRef.current.contains(e.target)) setShowAIConfig(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSend = () => { if (!isLoading && input.trim()) onSend(input); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const learningStrategies = [
    { id: 'architect', icon: Target, name: 'Strategic Architect', desc: 'Constructs robust, long-term systematic frameworks focused on sustainable growth and strict risk mitigation.' },
    { id: 'contrarian', icon: Binary, name: 'Alpha Contrarian', desc: 'Identifies asymmetric opportunities by aggressively analyzing market inefficiencies and reversing standard consensus.' },
    { id: 'quant', icon: LineChart, name: 'Quantitative Analyst', desc: 'Purely data-driven approach focusing on statistical arbitrage, heavy metrics, and raw predictive variance.' },
  ];

  return (
    <div className="flex flex-col gap-2 font-sans relative" ref={configRef}>
      
      {/* AI LEARNING STRATEGIES POPOVER - Soft Borders */}
      {showAIConfig && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 w-[340px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 p-2 font-sans">
          
          <div className="p-3">
            <h3 className="text-[13px] font-bold text-[#333333]">Core Intelligence</h3>
            <p className="text-[11.5px] text-[#707070] mt-1 leading-snug">By default, Stensor utilizes a balanced core power for fast and reliable queries.</p>
          </div>

          <div className="h-px bg-[#E5E5E5] my-1 mx-3"></div>

          {/* APEX MODE */}
          <div className="p-3 bg-white rounded-lg mt-2 mx-1 flex items-center justify-between gap-3">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-[#333333]">Deep Work Finance</h3>
              </div>
              <p className="text-[11px] text-[#707070] mt-1 leading-snug">
                Compute-heavy reasoning for highly complex market strategies.
              </p>
            </div>
            <Toggle enabled={apexEquityMode} onChange={() => setApexEquityMode(!apexEquityMode)} />
          </div>

          {/* LEARNING STRATEGIES */}
          <div className="pt-4 pb-1 space-y-1">
            <h4 className="text-[11px] font-bold text-[#999999] tracking-wider mb-2 px-3 uppercase">AI Behavioral Profile</h4>
            {learningStrategies.map((strategy, idx) => (
              <div key={strategy.id} className="relative">
                <button 
                  onClick={() => { setSelectedStrategy(strategy.id); setShowAIConfig(false); }}
                  className="w-full text-left p-3 rounded-lg flex items-start gap-3 hover:bg-[#F9F8F6] transition-colors group"
                >
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
                {idx < learningStrategies.length - 1 && (
                  <div className="mx-4 my-1 h-px bg-[#F0F0F0]"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INPUT BAR - Same rounded-xl format as FichePanel */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] p-2 flex items-center gap-2 shadow-sm relative z-10 transition-shadow hover:shadow-md focus-within:shadow-md">
        
        <button 
          onClick={() => setShowAIConfig(!showAIConfig)}
          className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${showAIConfig ? 'bg-[#F4F4F4] text-[#333333]' : 'text-gray-400 hover:text-[#333333] hover:bg-[#F4F4F4]'}`}
        >
          <Settings className="w-5 h-5" />
        </button>

        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Stensor elite AI to synthesize..." 
          className="flex-1 bg-transparent text-[15px] text-[#0d0d0d] placeholder:text-gray-400 focus:outline-none resize-none h-[22px] overflow-hidden leading-relaxed font-sans"
          rows={1}
          style={{ height: '22px' }}
        />

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button className="p-2 text-gray-400 hover:text-[#333333] hover:bg-[#F4F4F4] rounded-xl transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-[#333333] hover:bg-[#F4F4F4] rounded-xl transition-colors">
            <FileUp className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-[#0080ff] text-white rounded-xl hover:bg-[#0066cc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ml-1"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}