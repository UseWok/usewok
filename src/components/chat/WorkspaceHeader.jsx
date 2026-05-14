import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Palette } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Toggle = ({ enabled, onChange }) => (
  <button 
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out ${enabled ? 'bg-[#0080ff]' : 'bg-[#E5E5E5]'}`}
  >
    <span 
      className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out" 
      style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }} 
    />
  </button>
);

const FONTS = ['Inter', 'Helvetica', 'Arial', 'SF Pro Display', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Nunito', 'Playfair Display', 'Merriweather', 'Lora', 'Georgia', 'Garamond', 'Courier New', 'Fira Code', 'JetBrains Mono', 'System UI'];
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
  const [indexGoogle, setIndexGoogle] = useState(false);

  const publishRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (publishRef.current && !publishRef.current.contains(e.target)) setShowPublish(false);
      if (appRef.current && !appRef.current.contains(e.target)) setShowAppearance(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePublish = () => {
    toast.success("Interface published successfully.");
    setShowPublish(false);
  };

  return (
    <header className="flex items-center justify-between px-4 h-[48px] flex-shrink-0 bg-[#F4F4F4] border-b border-[#E5E5E5] z-30 font-sans w-full">
      
      {/* 1. LEFT: Mac Dots */}
      <div className="flex gap-2 items-center w-1/4 pl-1">
         <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
         <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
         <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
      </div>

      {/* 2. CENTER: Appearance (Ambiance) Engine */}
      <div className="flex justify-center w-1/2 relative" ref={appRef}>
        <button 
          onClick={() => setShowAppearance(!showAppearance)} 
          className="px-3.5 py-1.5 bg-white border border-[#E5E5E5] rounded-md text-[12px] font-semibold text-[#333333] hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Palette className="w-3.5 h-3.5 text-gray-500" /> Appearance
        </button>

        {showAppearance && (
          <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-[340px] bg-white border border-[#E5E5E5] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 p-3 text-left font-sans">
            
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Themes</p>
              <div className="flex gap-2">
                {THEMES.map(t => (
                  <button 
                    key={t.id} onClick={() => setAppearance({...appearance, theme: t.id})}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${appearance.theme === t.id ? 'border-[#0080ff] scale-110' : 'border-gray-200 hover:scale-105'}`}
                    style={{ background: t.color }} title={t.name}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Typography</p>
              <div className="grid grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {FONTS.map(f => (
                  <button 
                    key={f} onClick={() => setAppearance({...appearance, font: f})}
                    className={`flex flex-col items-center justify-center p-2 rounded-md border transition-colors ${appearance.font === f ? 'border-[#0080ff] bg-[#F4F8FE]' : 'border-[#E5E5E5] hover:border-gray-300 bg-white'}`}
                  >
                    <span style={{fontFamily: f}} className="text-[16px] text-gray-800 leading-none mb-1">Aa</span>
                    <span className="text-[9px] text-gray-500 truncate w-full text-center">{f}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Edge Style</p>
              <div className="grid grid-cols-4 gap-2">
                {/* CSS visual representations of borders */}
                <button onClick={() => setAppearance({...appearance, edges: 'square'})} className={`h-8 border-2 transition-all rounded-none ${appearance.edges === 'square' ? 'border-[#0080ff]' : 'border-[#E5E5E5] hover:border-gray-400'}`} title="Square"></button>
                <button onClick={() => setAppearance({...appearance, edges: 'soft'})} className={`h-8 border-2 transition-all rounded-md ${appearance.edges === 'soft' ? 'border-[#0080ff]' : 'border-[#E5E5E5] hover:border-gray-400'}`} title="Soft"></button>
                <button onClick={() => setAppearance({...appearance, edges: 'round'})} className={`h-8 border-2 transition-all rounded-2xl ${appearance.edges === 'round' ? 'border-[#0080ff]' : 'border-[#E5E5E5] hover:border-gray-400'}`} title="Round"></button>
                <button onClick={() => setAppearance({...appearance, edges: 'glass'})} className={`h-8 border-2 transition-all rounded-full bg-gradient-to-tr from-white/40 to-gray-100/40 backdrop-blur-md ${appearance.edges === 'glass' ? 'border-[#0080ff]' : 'border-gray-200 hover:border-gray-400'}`} title="Liquid Glass"></button>
              </div>
            </div>

            <button onClick={() => { onAskAI(); setShowAppearance(false); }} className="w-full py-2 bg-[#0080ff] text-white text-[12px] font-bold rounded-md hover:bg-[#0066cc] transition-colors shadow-sm">
              Ask AI to customize appearance
            </button>

          </div>
        )}
      </div>

      {/* 3. RIGHT: Reload + Publish */}
      <div className="flex justify-end items-center gap-2 w-1/4 relative" ref={publishRef}>
        
        <button 
          onClick={onReload}
          className="p-1.5 text-[#707070] hover:text-[#333333] hover:bg-[#E5E5E5] rounded-md transition-all"
          title="Regenerate"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setShowPublish(!showPublish)}
          className="px-3.5 py-1.5 bg-[#0080ff] text-white text-[12px] font-bold rounded-[6px] hover:bg-[#0066cc] transition-colors shadow-sm"
        >
          Publish
        </button>

        {showPublish && (
          <div className="absolute top-[calc(100%+6px)] right-0 w-[280px] bg-white border border-[#E5E5E5] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 text-left font-sans p-1">
            <div className="p-3 border-b border-[#E5E5E5]">
              <h3 className="text-[14px] font-bold text-[#333333]">Publish App</h3>
            </div>
            <div className="p-3 space-y-4">
              <div className="cursor-pointer group">
                <h4 className="text-[13px] font-bold text-[#333333] mb-0.5 group-hover:text-[#0080ff] transition-colors">Connect custom domain</h4>
              </div>
              <div className="cursor-pointer group">
                <h4 className="text-[13px] font-bold text-[#333333] mb-0.5 group-hover:text-[#0080ff] transition-colors">Share link</h4>
              </div>
              <div className="border-t border-[#E5E5E5] pt-3">
                <h4 className="text-[12px] font-bold text-[#333333] mb-2">Visibility</h4>
                <div className="flex items-center justify-between bg-white p-2 rounded-md border border-[#E5E5E5] shadow-sm">
                  <div className="flex items-center gap-2">
                    <GoogleIcon />
                    <span className="text-[12px] font-bold text-[#333333]">Index on Google</span>
                  </div>
                  <Toggle enabled={indexGoogle} onChange={() => setIndexGoogle(!indexGoogle)} />
                </div>
              </div>
              <div className="space-y-3 pt-1">
                {indexGoogle && (
                  <div className="bg-[#F9F8F6] border border-[#E5E5E5] p-2 rounded-md flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DDFF00] mt-1.5 flex-shrink-0"></div>
                    <p className="text-[10px] text-[#707070] font-medium leading-snug">
                      Takes 24-48h.
                    </p>
                  </div>
                )}
                <button onClick={handlePublish} className="w-full py-2 bg-[#0080ff] text-white text-[12px] font-bold rounded-md hover:bg-[#0066cc] transition-colors shadow-sm">
                  Deploy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}