import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Palette } from 'lucide-react';

const GoogleIcon = () =>
<svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>;


const Toggle = ({ enabled, onChange }) =>
<button
  onClick={onChange}
  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out ${enabled ? 'bg-[#0080ff]' : 'bg-[#E5E5E5]'}`}>
  
    <span
    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out"
    style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
  
  </button>;


const FONTS = ['Inter', 'Helvetica', 'Arial', 'SF Pro Display', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Nunito', 'Playfair Display', 'Merriweather', 'Lora', 'Georgia', 'Garamond', 'Courier New', 'Fira Code', 'JetBrains Mono', 'System UI'];

const THEMES = [
{ id: 'classic', color: '#FFFFFF', name: 'Classic White' },
{ id: 'aurora', color: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', name: 'Soft Aurora' },
{ id: 'sand', color: '#FDFBF7', name: 'Warm Sand' },
{ id: 'rose', color: 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)', name: 'Subtle Rose' },
{ id: 'midnight', color: '#0B0F19', name: 'Midnight Slate' },
{ id: 'grid', color: '#E5E5E5', name: 'Cyber Grid' } // Fallback display color
];

const EDGES = [
{ id: 'square', name: 'Square' },
{ id: 'soft', name: 'Slightly Rounded' },
{ id: 'round', name: 'Rounded' },
{ id: 'glass', name: 'Liquid Glass' }];


export default function WorkspaceHeader({ onReload, appearance, setAppearance }) {
  const [showPublish, setShowPublish] = useState(false);
  const [showMode, setShowMode] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);

  const [isDeepWork, setIsDeepWork] = useState(false);
  const [indexGoogle, setIndexGoogle] = useState(false);

  const publishRef = useRef(null);
  const modeRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (publishRef.current && !publishRef.current.contains(e.target)) setShowPublish(false);
      if (modeRef.current && !modeRef.current.contains(e.target)) setShowMode(false);
      if (appRef.current && !appRef.current.contains(e.target)) setShowAppearance(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePublish = () => {
    toast.success("Interface published successfully.");
    setShowPublish(false);
  };

  const isDark = appearance?.theme === 'midnight';

  return (
    <header className={`flex items-center justify-between px-4 h-[48px] flex-shrink-0 z-30 font-sans w-full rounded-sm ${appearance?.theme !== 'classic' ? 'bg-transparent border-b border-black/5' : 'bg-[#F4F4F4] border-b border-[#E5E5E5]'}`}>
      
      {/* 1. LEFT: Mac Dots */}
      <div className="flex gap-2 items-center w-1/4 pl-1">
         <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
         <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
         <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
      </div>

      {/* 2. CENTER: Canvas & AI Mode */}
      <div className="flex justify-center w-1/2 gap-2 relative">
        
        {/* APPEARANCE BUTTON */}
        <div className="relative" ref={appRef}>
          <button
            onClick={() => setShowAppearance(!showAppearance)}
            className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors border ${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-[#E5E5E5] text-[#333333] hover:bg-gray-50'}`}>
            
            <Palette className="w-3.5 h-3.5" /> Canvas
          </button>
          
          {showAppearance &&
          <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-[320px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 p-3 text-left font-sans text-[#333333]">
              
              <div className="mb-4">
                <p className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Themes</p>
                <div className="flex gap-2">
                  {THEMES.map((t) =>
                <button
                  key={t.id}
                  onClick={() => setAppearance({ ...appearance, theme: t.id })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${appearance.theme === t.id ? 'border-[#0080ff] scale-110' : 'border-transparent hover:scale-105 shadow-sm'}`}
                  style={{ background: t.color }}
                  title={t.name} />

                )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Typography</p>
                <select
                value={appearance.font}
                onChange={(e) => setAppearance({ ...appearance, font: e.target.value })}
                className="w-full border border-[#E5E5E5] rounded-md px-3 py-1.5 text-[13px] bg-white focus:outline-none focus:border-[#0080ff]">
                
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Edge Style</p>
                <div className="grid grid-cols-2 gap-2">
                  {EDGES.map((e) =>
                <button
                  key={e.id}
                  onClick={() => setAppearance({ ...appearance, edges: e.id })}
                  className={`px-2 py-1.5 text-[12px] font-medium rounded-md border transition-colors ${appearance.edges === e.id ? 'bg-[#F4F4F4] border-[#D1D1D1] text-[#0080ff]' : 'bg-white border-[#E5E5E5] text-gray-600 hover:bg-gray-50'}`}>
                  
                      {e.name}
                    </button>
                )}
                </div>
              </div>

            </div>
          }
        </div>

        {/* AI MODE BUTTON */}
        <div className="relative" ref={modeRef}>
          <button
            onClick={() => setShowMode(!showMode)}
            className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors border ${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-[#E5E5E5] text-[#333333] hover:bg-gray-50'}`}>
            
            {isDeepWork ? 'Deep Work' : 'Automatic'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
          </button>

          {showMode &&
          <div className="absolute top-[calc(100%+6px)] w-[300px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 p-1 text-left">
              <div
              className="p-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
              onClick={() => {setIsDeepWork(false);setShowMode(false);}}>
              
                <div className="text-[13px] font-bold text-[#333333] flex items-center gap-2">
                  Automatic {!isDeepWork && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0080ff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div className="text-[11.5px] text-[#707070] mt-1 leading-snug">
                  Wok seamlessly routes tasks to the optimal reasoning models based on context, balancing execution speed and analytical depth gracefully.
                </div>
              </div>
              
              <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
              
              <div className="p-3 flex items-center justify-between rounded-md">
                <div className="flex-1 pr-3">
                  <div className="text-[13px] font-bold text-[#333333]">Deep Work</div>
                  <div className="text-[11.5px] text-[#707070] mt-1 leading-snug">Advanced reasoning mode for highly complex logic resolution and structuring.</div>
                </div>
                <Toggle enabled={isDeepWork} onChange={() => {setIsDeepWork(!isDeepWork);setShowMode(false);}} />
              </div>
            </div>
          }
        </div>
      </div>

      {/* 3. RIGHT: Reload + Publish */}
      <div className="flex justify-end items-center gap-2 w-1/4 relative" ref={publishRef}>
        
        <button
          onClick={onReload}
          className={`p-1.5 rounded-md transition-all ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-[#707070] hover:text-[#333333] hover:bg-[#E5E5E5]'}`}
          title="Regenerate">
          
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowPublish(!showPublish)}
          className="px-3.5 py-1.5 bg-[#0080ff] text-white text-[12px] font-bold rounded-[6px] hover:bg-[#0066cc] transition-colors shadow-sm">
          
          Publish
        </button>

        {showPublish &&
        <div className="absolute top-[calc(100%+6px)] right-0 w-[300px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 text-left font-sans p-1 text-[#333333]">
            <div className="p-3 border-b border-[#E5E5E5]">
              <h3 className="text-[14px] font-bold">Publish Your App</h3>
              <p className="text-[11.5px] text-[#707070]">Deploy intelligence context externally.</p>
            </div>
            
            <div className="p-3 space-y-4">
              <div className="cursor-pointer group">
                <h4 className="text-[13px] font-bold mb-0.5 group-hover:text-[#0080ff] transition-colors">Connect custom domain</h4>
              </div>
              
              <div className="cursor-pointer group">
                <h4 className="text-[13px] font-bold mb-0.5 group-hover:text-[#0080ff] transition-colors">Share your app</h4>
                <p className="text-[11.5px] text-[#707070]">Share a link via email or social networks.</p>
              </div>
              
              <div className="border-t border-[#E5E5E5] pt-3">
                <h4 className="text-[13px] font-bold mb-2">App Visibility</h4>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-md border border-[#E5E5E5] shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <GoogleIcon />
                    <span className="text-[13px] font-bold">Index on Google</span>
                  </div>
                  <Toggle enabled={indexGoogle} onChange={() => setIndexGoogle(!indexGoogle)} />
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {indexGoogle &&
              <div className="bg-[#F9F8F6] border border-[#E5E5E5] p-2.5 rounded-md flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DDFF00] mt-[3.5px] flex-shrink-0"></div>
                    <p className="text-[11px] text-[#707070] font-medium leading-snug">
                      Maximize global visibility. Indexing execution takes 24-48h.
                    </p>
                  </div>
              }
                
                <button onClick={handlePublish} className="w-full py-2 bg-[#0080ff] text-white text-[13px] font-bold rounded-[6px] hover:bg-[#0066cc] transition-colors shadow-sm">
                  Deploy Intelligence
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </header>);

}