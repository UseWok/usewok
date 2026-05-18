import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, ExternalLink, ArrowLeft, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WorkspaceHeader({ onReload, convId, viewMode, setViewMode, customSlug, setCustomSlug, appSettings }) {
  const [showPublish, setShowPublish] = useState(false);
  const [publishView, setPublishView] = useState('main'); 
  const [isPublished, setIsPublished] = useState(appSettings?.isPublic || false);
  const [tempSlug, setTempSlug] = useState(customSlug);
  const [indexGoogle, setIndexGoogle] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  
  const publishRef = useRef(null);

  useEffect(() => {
    setTempSlug(customSlug);
  }, [customSlug]);

  useEffect(() => {
    setIsPublished(appSettings?.isPublic || false);
  }, [appSettings?.isPublic]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (publishRef.current && !publishRef.current.contains(e.target)) {
        setShowPublish(false);
        setTimeout(() => setPublishView('main'), 200);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePublish = async () => {
    try {
      if (convId) {
        await base44.entities.Conversation.update(convId, {
          is_public: true,
          slug: customSlug
        });
      }
      setIsPublished(true);
      toast.success("Intelligence deployed successfully to the Cloud.");
      setShowPublish(false);
    } catch (error) {
      toast.error("Waiting for backend configuration. Local display updated.");
      setIsPublished(true);
      setShowPublish(false);
    }
  };

  const shareUrl = `https://wok.base44.app/p/${customSlug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <>
      {showDomainModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-[#0A0A0A]/60 p-4">
          <div className="relative w-full max-w-[520px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-[#E5E5E5]">
            <div className="p-5 border-b border-[#E5E5E5] bg-[#F9F9F9]">
              <h2 className="text-[16px] font-bold text-[#333333]">Custom Domain Configuration</h2>
              <p className="text-[12px] text-[#707070] mt-1">Manage the public access link for your workspace project.</p>
            </div>
            
            <div className="p-6">
              <label className="text-[12px] font-bold text-[#333333] mb-2 block">Public Link (Max 30 chars)</label>
              <div className="flex items-center w-full border border-[#E5E5E5] rounded-md overflow-hidden focus-within:border-[#0080ff] transition-colors">
                <div className="bg-[#F9F9F9] px-3 py-2 border-r border-[#E5E5E5] text-[13px] text-[#707070] font-mono select-none hidden md:block">
                  https://wok.base44.app/p/
                </div>
                <input 
                  type="text" 
                  maxLength={30}
                  value={tempSlug} 
                  onChange={(e) => setTempSlug(e.target.value)} 
                  className="flex-1 px-3 py-2 text-[13px] font-mono focus:outline-none text-[#333333]" 
                  autoFocus
                />
              </div>

              {/* INTELLECTUAL PROPERTY CLAUSE */}
              <div className="mt-6 bg-[#F4F8FE] p-4 rounded-md border border-[#0080ff]/20">
                <p className="text-[12px] font-semibold text-[#0080ff] mb-1">Workspace Ownership</p>
                <p className="text-[11px] text-[#555555] leading-snug">
                  We claim no ownership rights over what you create with Base44. Your intellectual property belongs to you, and you are free to use, modify, distribute, or sell the generated applications within the limits permitted by law.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5E5] bg-[#F9F9F9] flex justify-end gap-3">
              <button onClick={() => setShowDomainModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#707070] hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
              <button onClick={() => { setCustomSlug(tempSlug); setShowDomainModal(false); }} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0080ff] hover:bg-[#0066cc] rounded-md transition-colors">Save Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* PERSISTENT GLOBAL HEADER */}
      <header className="flex items-center px-4 h-[56px] flex-shrink-0 z-30 font-sans w-full bg-transparent absolute top-0 left-0 right-0 pointer-events-none">
        
        {/* LEFT: Mac Dots */}
        <div className="flex-1 flex items-center justify-start pointer-events-auto">
           <div className="flex gap-1.5 items-center">
             <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
             <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
             <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
           </div>
        </div>

        {/* CENTER: True Centered Navigation Toggles */}
        <div className="flex-1 flex items-center justify-center pointer-events-auto">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/60 backdrop-blur-md border border-slate-200 shadow-sm">
            <button 
              onClick={() => setViewMode && setViewMode('preview')} 
              className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-colors ${viewMode === 'preview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Preview
            </button>
            <button 
              onClick={() => setViewMode && setViewMode('dashboard')} 
              className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-colors ${viewMode === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex-1 flex justify-end items-center gap-2 relative pointer-events-auto" ref={publishRef}>
          <button onClick={onReload} className="p-1.5 rounded-md transition-none text-slate-500 hover:text-slate-900 hover:bg-white/80 backdrop-blur-sm shadow-sm border border-transparent hover:border-slate-200" title="Regenerate">
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button onClick={() => setShowPublish(!showPublish)} className="px-4 py-1.5 bg-blue-600 text-white text-[12px] font-bold rounded-lg hover:bg-blue-700 shadow-sm">
            Publish
          </button>

          {showPublish && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-[300px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[999] text-left font-sans p-1 text-slate-900">
              {publishView === 'main' ? (
                <>
                  <div className="p-3 border-b border-slate-100">
                    <h3 className="text-[14px] font-bold">Publish App</h3>
                  </div>
                  
                  {/* Public Link is visible but disabled if not published */}
                  <div className="px-3 pt-3 pb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Live URL</p>
                    {isPublished ? (
                      <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-600 hover:underline font-mono truncate flex items-center gap-1.5 p-2 bg-blue-50 rounded-md border border-blue-200">
                        wok.base44.app/p/{customSlug} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <div className="text-[12px] text-slate-400 font-mono truncate flex items-center gap-1.5 p-2 bg-slate-50 rounded-md border border-slate-200 cursor-not-allowed">
                        wok.base44.app/p/{customSlug}
                      </div>
                    )}
                  </div>

                  <div className="p-2 space-y-1 mt-1">
                    <button onClick={() => { setShowPublish(false); setViewMode('dashboard'); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md transition-colors group">
                      <h4 className="text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Manage Domains</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Configure your public routing.</p>
                    </button>
                    <button onClick={() => setPublishView('share')} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md transition-colors group">
                      <h4 className="text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Share your app</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Share via email or social networks.</p>
                    </button>
                  </div>
                  
                  <div className="px-3 pb-2 pt-1 mt-2">
                    <button onClick={handlePublish} className="w-full py-2 bg-blue-600 text-white text-[13px] font-bold rounded-md hover:bg-blue-700 shadow-sm">
                      {isPublished ? 'Update Live Build' : 'Deploy Intelligence'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                    <button onClick={() => setPublishView('main')} className="p-1 hover:bg-slate-100 rounded-md text-slate-500"><ArrowLeft className="w-4 h-4" /></button>
                    <h3 className="text-[14px] font-bold">Share App</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-md p-1.5 bg-slate-50">
                      <div className="px-2 flex-1 text-[12px] font-mono text-slate-600 truncate bg-transparent outline-none select-all">
                        {shareUrl}
                      </div>
                      <button onClick={copyToClipboard} className="px-3 py-1.5 bg-white border border-slate-200 text-[12px] font-bold rounded hover:bg-slate-50 shadow-sm">Copy</button>
                    </div>

                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Share via</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}