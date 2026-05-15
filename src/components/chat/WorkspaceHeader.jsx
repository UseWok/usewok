import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Palette } from 'lucide-react';

const FONTS = ['Inter', 'Helvetica', 'SF Pro Display', 'Roboto', 'Open Sans', 'Lora', 'Georgia', 'Fira Code', 'System UI'];
const THEMES = [
  { id: 'classic', color: '#FFFFFF', name: 'Classic' },
  { id: 'aurora', color: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', name: 'Aurora' },
  { id: 'sand', color: '#FDFBF7', name: 'Sand' },
  { id: 'rose', color: 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)', name: 'Rose' },
  { id: 'midnight', color: '#0B0F19', name: 'Midnight' },
  { id: 'grid', color: '#FAFAFA', name: 'Grid' }
];

export default function WorkspaceHeader({ onReload, appearance, setAppearance, onAskAI }) {
  const [showPublish, setShowPublish] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showMode, setShowMode] = useState(false);
  const [isDeepWork, setIsDeepWork] = useState(false);

  const publishRef = useRef(null);
  const appRef = useRef(null);
  const modeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (publishRef.current && !publishRef.current.contains(e.target)) setShowPublish(false);
      if (appRef.current && !appRef.current.contains(e.target)) setShowAppearance(false);
      if (modeRef.current && !modeRef.current.contains(e.target)) setShowMode(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 h-[48px] flex-shrink-0 bg-[#F4F4F4] border-b border-[#E5E5E5] z-30 font-sans w-full">
      <div className="flex gap-2 items-center w-1/4 pl-1">
         <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
         <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
         <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
      </div>

      <div className="flex justify-center w-1/2 relative gap-2">
        <div ref={appRef} className="relative">
          <button onClick={() => setShowAppearance(!showAppearance)} className="px-3.5 py-1.5 bg-white border border-[#E5E5E5] rounded-md text-[12px] font-semibold text-[#333333] hover:bg-gray-50 flex items-center gap-1.5 shadow-sm">
            <Palette className="w-3.5 h-3.5" /> Appearance
          </button>
          {showAppearance && (
            <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-[340px] bg-white border border-[#E5E5E5] rounded-lg shadow-2xl z-50 p-3 text-left">
              <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Themes</p>
              <div className="flex gap-2 mb-4">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setAppearance({...appearance, theme: t.id})} className={`w-7 h-7 rounded-full border-2 transition-all ${appearance.theme === t.id ? 'border-[#0080ff] scale-110' : 'border-gray-200'}`} style={{ background: t.color }} title={t.name} />
                ))}
              </div>
              <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Typography</p>
              <div className="grid grid-cols-4 gap-1.5 mb-4 max-h-[120px] overflow-y-auto pr-1">
                {FONTS.map(f => (
                  <button key={f} onClick={() => setAppearance({...appearance, font: f})} className={`flex flex-col items-center p-2 rounded-md border transition-colors ${appearance.font === f ? 'border-[#0080ff] bg-[#F4F8FE]' : 'border-[#E5E5E5] hover:border-gray-300 bg-white'}`}>
                    <span style={{fontFamily: f}} className="text-[16px] text-gray-800 mb-1">Aa</span>
                    <span className="text-[8px] text-gray-400 truncate w-full text-center">{f}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Edge Style</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button onClick={() => setAppearance({...appearance, edges: 'square'})} className={`h-8 border-2 rounded-none ${appearance.edges === 'square' ? 'border-[#0080ff]' : 'border-[#E5E5E5]'}`} title="Square"></button>
                <button onClick={() => setAppearance({...appearance, edges: 'soft'})} className={`h-8 border-2 rounded-md ${appearance.edges === 'soft' ? 'border-[#0080ff]' : 'border-[#E5E5E5]'}`} title="Soft"></button>
                <button onClick={() => setAppearance({...appearance, edges: 'round'})} className={`h-8 border-2 rounded-xl ${appearance.edges === 'round' ? 'border-[#0080ff]' : 'border-[#E5E5E5]'}`} title="Round"></button>
                <button onClick={() => setAppearance({...appearance, edges: 'glass'})} className={`h-8 border-2 rounded-full bg-gradient-to-tr from-white/40 to-gray-100/40 backdrop-blur-md ${appearance.edges === 'glass' ? 'border-[#0080ff]' : 'border-[#E5E5E5]'}`} title="Glass"></button>
              </div>
              <button onClick={() => { onAskAI(); setShowAppearance(false); }} className="w-full py-2 bg-[#0080ff] text-white text-[12px] font-bold rounded-md shadow-sm">Ask AI to customize</button>
            </div>
          )}
        </div>

        <div ref={modeRef} className="relative">
          <button onClick={() => setShowMode(!showMode)} className="px-3.5 py-1.5 bg-white border border-[#E5E5E5] rounded-md text-[12px] font-semibold text-[#333333] hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transition-none">
            {isDeepWork ? 'Deep Work' : 'Automatic'} <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showMode && (
            <div className="absolute top-[calc(100%+6px)] w-[280px] bg-white border border-[#E5E5E5] rounded-lg shadow-2xl z-50 p-3 text-left">
              <div className="p-2 hover:bg-gray-50 cursor-pointer rounded-md" onClick={() => { setIsDeepWork(false); setShowMode(false); }}>
                <p className="text-[13px] font-bold text-[#333333]">Automatic</p>
                <p className="text-[11px] text-[#707070] leading-snug">Wok intelligently selects the best logic engine.</p>
              </div>
              <div className="h-px bg-[#E5E5E5] my-1"></div>
              <div className="p-2 hover:bg-gray-50 cursor-pointer rounded-md" onClick={() => { setIsDeepWork(true); setShowMode(false); }}>
                <p className="text-[13px] font-bold text-[#333333]">Deep Work</p>
                <p className="text-[11px] text-[#707070] leading-snug">Advanced reasoning for highly complex scenarios.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-2 w-1/4 relative" ref={publishRef}>
        <button onClick={onReload} className="p-1.5 text-[#707070] hover:text-[#333333] hover:bg-[#E5E5E5] rounded-md transition-none"><RefreshCw className="w-4 h-4" /></button>
        <button onClick={() => setShowPublish(!showPublish)} className="px-3.5 py-1.5 bg-[#0080ff] text-white text-[12px] font-bold rounded-[6px] hover:bg-[#0066cc] shadow-sm">Publish</button>
        {showPublish && (
          <div className="absolute top-[calc(100%+6px)] right-0 w-[240px] bg-white border border-[#E5E5E5] rounded-lg shadow-2xl z-50 p-3 text-left">
            <h3 className="text-[13px] font-bold mb-2">Publish App</h3>
            <p className="text-[11px] text-gray-500 mb-4">Deploy current state to external context.</p>
            <button className="w-full py-2 bg-[#0080ff] text-white text-[12px] font-bold rounded-md">Deploy</button>
          </div>
        )}
      </div>
    </header>
  );
}