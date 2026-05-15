import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, ExternalLink } from 'lucide-react';

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

export default function WorkspaceHeader({ onReload, convId }) {
  const [showPublish, setShowPublish] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  
  // Custom Link State
  const [customSlug, setCustomSlug] = useState(convId || `conv_${Date.now()}`);
  const [tempSlug, setTempSlug] = useState(customSlug);

  const publishRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (publishRef.current && !publishRef.current.contains(e.target)) setShowPublish(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePublish = () => {
    setIsPublished(true);
    toast.success("Project successfully published to the cloud.");
  };

  const handleSaveDomain = () => {
    if(!tempSlug.trim()) { toast.error("Path cannot be empty."); return; }
    setCustomSlug(tempSlug.trim());
    setShowDomainModal(false);
    toast.success("Custom domain path updated.");
  };

  return (
    <>
      {/* Custom Domain Modal (Zero Animation) */}
      {showDomainModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans bg-[#0A0A0A]/60">
          <div className="relative w-[520px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-[#E5E5E5]">
            <div className="p-5 border-b border-[#E5E5E5]">
              <h2 className="text-[16px] font-bold text-[#333333]">Custom Domain Configuration</h2>
              <p className="text-[12px] text-[#707070] mt-1">Manage the public access link for your workspace project.</p>
            </div>
            
            <div className="p-6">
              <label className="text-[12px] font-bold text-[#333333] mb-2 block">Public Link</label>
              <div className="flex items-center w-full border border-[#E5E5E5] rounded-md overflow-hidden focus-within:border-[#0080ff] transition-colors">
                <div className="bg-[#F9F9F9] px-3 py-2 border-r border-[#E5E5E5] text-[13px] text-[#707070] font-mono select-none">
                  https://wok.base44.app/p/
                </div>
                <input 
                  type="text" 
                  value={tempSlug} 
                  onChange={(e) => setTempSlug(e.target.value)} 
                  className="flex-1 px-3 py-2 text-[13px] font-mono focus:outline-none text-[#333333]" 
                  autoFocus
                />
              </div>

              <div className="mt-6 bg-[#F4F8FE] p-4 rounded-md border border-[#0080ff]/20">
                <p className="text-[12px] font-semibold text-[#0080ff] mb-1">Workspace Ownership</p>
                <p className="text-[11px] text-[#555555] leading-snug">
                  You retain absolute ownership of this project. Any modifications to this URL will immediately route external traffic to your latest published build.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5E5] bg-[#F9F9F9] flex justify-end gap-3">
              <button onClick={() => setShowDomainModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#707070] hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
              <button onClick={handleSaveDomain} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0080ff] hover:bg-[#0066cc] rounded-md transition-colors">Save Configuration</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-4 h-[48px] flex-shrink-0 bg-transparent border-b border-black/5 z-30 font-sans w-full">
        
        {/* 1. LEFT: Mac Dots */}
        <div className="flex gap-2 items-center w-1/3 pl-1">
           <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
           <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
           <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
        </div>

        {/* 2. CENTER: Empty (Appearance moved to FichePanel) */}
        <div className="flex justify-center w-1/3"></div>

        {/* 3. RIGHT: Reload + Publish */}
        <div className="flex justify-end items-center gap-2 w-1/3 relative" ref={publishRef}>
          
          <button onClick={onReload} className="p-1.5 text-gray-400 hover:text-[#333333] hover:bg-white/50 rounded-md transition-colors" title="Regenerate">
            <RefreshCw className="w-4 h-4" />
          </button>

          <button onClick={() => setShowPublish(!showPublish)} className="px-3.5 py-1.5 bg-[#0080ff] text-white text-[12px] font-bold rounded-md hover:bg-[#0066cc] transition-colors shadow-sm">
            Publish
          </button>

          {showPublish && (
            <div className="absolute top-[calc(100%+6px)] right-0 w-[300px] bg-white border border-[#E5E5E5] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 text-left font-sans p-1 text-[#333333]">
              
              {isPublished && (
                <div className="p-3 border-b border-[#E5E5E5] bg-[#F9F8F6] rounded-t-md mb-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Live URL</p>
                  <a href={`https://wok.base44.app/p/${customSlug}`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#0080ff] hover:underline font-mono truncate block flex items-center gap-1.5">
                    wok.base44.app/p/{customSlug} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}

              <div className="p-2 space-y-1">
                <button onClick={() => { setShowPublish(false); setShowDomainModal(true); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors group">
                  <h4 className="text-[13px] font-bold text-[#333333] group-hover:text-[#0080ff] transition-colors">Custom domain</h4>
                  <p className="text-[11px] text-[#707070] mt-0.5">Configure your public routing.</p>
                </button>
              </div>
              
              <div className="p-2 pt-0 mt-2">
                <button onClick={handlePublish} className="w-full py-2 bg-[#0080ff] text-white text-[13px] font-bold rounded-md hover:bg-[#0066cc] transition-colors shadow-sm">
                  {isPublished ? 'Update Live Build' : 'Publish Project'}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}