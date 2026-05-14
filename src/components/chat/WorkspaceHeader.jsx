import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

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

export default function WorkspaceHeader({ onReload }) {
  const [showPublish, setShowPublish] = useState(false);
  const [showMode, setShowMode] = useState(false);
  const [isDeepWork, setIsDeepWork] = useState(false);
  const [indexGoogle, setIndexGoogle] = useState(false);

  const publishRef = useRef(null);
  const modeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (publishRef.current && !publishRef.current.contains(e.target)) setShowPublish(false);
      if (modeRef.current && !modeRef.current.contains(e.target)) setShowMode(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePublish = () => {
    toast.success("App published successfully.");
    setShowPublish(false);
  };

  return (
    <header className="flex items-center justify-between px-4 h-[48px] flex-shrink-0 bg-[#F4F4F4] border-b border-[#E5E5E5] z-30 font-sans w-full">
      
      {/* 1. LEFT: Mac Dots & Preview Label */}
      <div className="flex items-center gap-4 w-1/4 pl-1">
        <div className="flex gap-2 items-center">
           <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
           <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
           <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
        </div>
        <span className="text-[12px] font-semibold text-[#999999] select-none">Preview</span>
      </div>

      {/* 2. CENTER: Automatic Mode Selector */}
      <div className="flex justify-center w-1/2 relative" ref={modeRef}>
        <button 
          onClick={() => setShowMode(!showMode)} 
          className="px-3.5 py-1.5 bg-white border border-[#D1D1D1] rounded-[6px] text-[12px] font-semibold text-[#333333] hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transition-colors"
        >
          {isDeepWork ? 'Deep Work' : 'Automatic'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {showMode && (
          <div className="absolute top-[calc(100%+6px)] w-[300px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_12px_36px_-4px_rgba(0,0,0,0.12)] z-50 p-1 text-left">
            <div 
              className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors" 
              onClick={() => { setIsDeepWork(false); setShowMode(false); }}
            >
              <div className="text-[13px] font-bold text-[#333333] flex items-center gap-2">
                Automatic {(!isDeepWork) && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0080ff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div className="text-[11.5px] text-[#707070] mt-1.5 leading-snug">
                We seamlessly select the absolute best AI model tailored to your specific context, balancing execution speed and analytical depth.
              </div>
            </div>
            
            <div className="h-px bg-[#E5E5E5] my-1 mx-3"></div>
            
            <div className="p-3 flex items-center justify-between rounded-lg">
              <div className="flex-1 pr-3">
                <div className="text-[13px] font-bold text-[#333333]">Deep Work</div>
                <div className="text-[11.5px] text-[#707070] mt-1.5 leading-snug">Advanced reasoning mode for highly complex and volatile strategy generation.</div>
              </div>
              <Toggle enabled={isDeepWork} onChange={() => { setIsDeepWork(!isDeepWork); setShowMode(false); }} />
            </div>
          </div>
        )}
      </div>

      {/* 3. RIGHT: Reload + Publish */}
      <div className="flex justify-end items-center gap-2 w-1/4 relative" ref={publishRef}>
        
        {/* Clean visual reload button */}
        <button 
          onClick={onReload}
          className="p-1.5 text-[#999999] hover:text-[#333333] hover:bg-gray-200/50 rounded-md transition-all"
          title="Regenerate"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        </button>

        <button 
          onClick={() => setShowPublish(!showPublish)}
          className="px-3.5 py-1.5 bg-[#0080ff] text-white text-[12px] font-bold rounded-[6px] hover:bg-[#0066cc] transition-colors shadow-sm"
        >
          Publish
        </button>

        {showPublish && (
          <div className="absolute top-[calc(100%+6px)] right-0 w-[300px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_12px_36px_-4px_rgba(0,0,0,0.12)] z-50 text-left font-sans p-1">
            <div className="p-3 border-b border-[#E5E5E5]">
              <h3 className="text-[14px] font-bold text-[#333333]">Publish Your App</h3>
            </div>
            
            <div className="p-3 space-y-4">
              <div className="cursor-pointer group">
                <h4 className="text-[13px] font-bold text-[#333333] mb-0.5 group-hover:text-[#0080ff] transition-colors">Connect a custom domain</h4>
              </div>
              
              <div className="cursor-pointer group">
                <h4 className="text-[13px] font-bold text-[#333333] mb-0.5 group-hover:text-[#0080ff] transition-colors">Share your app</h4>
                <p className="text-[11.5px] text-[#707070]">Share a link via email or social networks.</p>
              </div>
              
              <div className="border-t border-[#E5E5E5] pt-3">
                <h4 className="text-[13px] font-bold text-[#333333] mb-2">App Visibility</h4>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-md border border-[#E5E5E5] shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <GoogleIcon />
                    <span className="text-[13px] font-bold text-[#333333]">Index on Google</span>
                  </div>
                  <Toggle enabled={indexGoogle} onChange={() => setIndexGoogle(!indexGoogle)} />
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {indexGoogle && (
                  <div className="bg-[#F9F8F6] border border-[#E5E5E5] p-2.5 rounded-md flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DDFF00] mt-1.5 flex-shrink-0"></div>
                    <p className="text-[11px] text-[#707070] font-medium leading-snug">
                      Indexing your app on Google takes between 24-48h. Maximize your visibility globally.
                    </p>
                  </div>
                )}
                
                <button onClick={handlePublish} className="w-full py-2 bg-[#0080ff] text-white text-[13px] font-bold rounded-[6px] hover:bg-[#0066cc] transition-colors shadow-sm">
                  Publish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}