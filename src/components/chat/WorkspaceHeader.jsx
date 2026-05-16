import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Palette, ExternalLink, ArrowLeft, Mail, Sparkles } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);
const XIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>);
const LinkedInIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>);
const FacebookIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>);

const Toggle = ({ enabled, onChange }) => (
  <button onClick={onChange} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out ${enabled ? 'bg-[#0080ff]' : 'bg-[#E5E5E5]'}`}>
    <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out" style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
  </button>
);

// High-End Preset Ambiances
const AMBIANCES = [
  { id: 'wok_sand', name: 'Wok Sand', theme: 'sand', font: 'Inter', edges: 'soft', previewColor: '#FDFBF7' },
  { id: 'wix_clean', name: 'Wix Clean', theme: 'classic', font: 'System UI', edges: 'square', previewColor: '#FFFFFF' },
  { id: 'stripe_modern', name: 'Stripe', theme: 'grid', font: 'Inter', edges: 'round', previewColor: '#FAFAFA' },
  { id: 'deep_void', name: 'Deep Void', theme: 'midnight', font: 'Roboto', edges: 'glass', previewColor: '#0B0F19' }
];

export default function WorkspaceHeader({ onReload, appearance, setAppearance, onAskAI, convId }) {
  const [showPublish, setShowPublish] = useState(false);
  const [publishView, setPublishView] = useState('main'); 
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [customSlug, setCustomSlug] = useState(convId || `conv_${Date.now().toString().slice(-6)}`);
  const [tempSlug, setTempSlug] = useState(customSlug);
  const [indexGoogle, setIndexGoogle] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);

  const publishRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    const slug = convId || `conv_${Date.now().toString().slice(-6)}`;
    setCustomSlug(slug);
    setTempSlug(slug);
  }, [convId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (publishRef.current && !publishRef.current.contains(e.target)) {
        setShowPublish(false);
        setTimeout(() => setPublishView('main'), 200);
      }
      if (appRef.current && !appRef.current.contains(e.target)) setShowAppearance(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePublish = () => {
    setIsPublished(true);
    toast.success("Intelligence deployed successfully.");
    setShowPublish(false);
  };

  const handleSaveDomain = () => {
    if(!tempSlug.trim()) { toast.error("Path cannot be empty."); return; }
    setCustomSlug(tempSlug.trim());
    setShowDomainModal(false);
    toast.success("Custom domain configuration saved.");
  };

  const shareUrl = `https://wok.base44.app/p/${customSlug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const isDark = appearance?.theme === 'midnight';

  return (
    <>
      {showDomainModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-[#0A0A0A]/60">
          <div className="relative w-[95%] md:w-[520px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-[#E5E5E5]">
            <div className="p-5 border-b border-[#E5E5E5] bg-[#F9F9F9]">
              <h2 className="text-[16px] font-bold text-[#333333]">Custom Domain Configuration</h2>
              <p className="text-[12px] text-[#707070] mt-1">Manage the public access link for your workspace project.</p>
            </div>
            
            <div className="p-6">
              <label className="text-[12px] font-bold text-[#333333] mb-2 block">Public Link</label>
              <div className="flex items-center w-full border border-[#E5E5E5] rounded-md overflow-hidden focus-within:border-[#0080ff] transition-colors">
                <div className="bg-[#F9F9F9] px-3 py-2 border-r border-[#E5E5E5] text-[13px] text-[#707070] font-mono select-none hidden md:block">
                  https://wok.base44.app/p/
                </div>
                <input 
                  type="text" value={tempSlug} onChange={(e) => setTempSlug(e.target.value)} 
                  className="flex-1 px-3 py-2 text-[13px] font-mono focus:outline-none text-[#333333]" autoFocus
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

      {/* HEADER */}
      <header className={`flex items-center justify-between px-4 h-[48px] flex-shrink-0 z-30 font-sans w-full rounded-t-md ${appearance?.theme !== 'classic' ? 'bg-transparent border-b border-black/5' : 'bg-[#F4F4F4] border-b border-[#E5E5E5]'}`}>
        
        {/* 1. LEFT: Mac Dots + Ambiances Button */}
        <div className="flex gap-4 items-center w-1/3 pl-1">
           <div className="flex gap-1.5 items-center">
             <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
             <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
             <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
           </div>
           
           <div className="relative" ref={appRef}>
            <button onClick={() => setShowAppearance(!showAppearance)} className={`px-3.5 py-1.5 rounded-md text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors border ${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-[#E5E5E5] text-[#333333] hover:bg-gray-50'}`}>
              <Palette className="w-3.5 h-3.5" /> Ambiances
            </button>
            
            {showAppearance && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-[300px] bg-white border border-[#E5E5E5] rounded-xl shadow-2xl z-[9999] p-2 text-left font-sans text-[#333333]">
                <p className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">Premium Ecosystems</p>
                <div className="grid grid-cols-2 gap-2 mt-2 mb-3 px-1">
                  {AMBIANCES.map(a => (
                    <button 
                      key={a.id} 
                      onClick={() => { setAppearance({ theme: a.theme, font: a.font, edges: a.edges }); setShowAppearance(false); }} 
                      className={`flex flex-col items-start p-2 rounded-lg border transition-all ${appearance.theme === a.theme ? 'border-[#0080ff] bg-[#F4F8FE]' : 'border-[#E5E5E5] hover:border-gray-300 bg-white'}`}
                    >
                      <div className="w-full h-12 rounded-md mb-2 border border-black/5 shadow-inner" style={{ backgroundColor: a.previewColor }}></div>
                      <span className="text-[12px] font-bold text-gray-800 leading-tight">{a.name}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#E5E5E5] pt-2 mt-1">
                  <button onClick={() => { onAskAI(); setShowAppearance(false); }} className="w-full py-2 bg-[#0080ff] text-white text-[12px] font-bold rounded-lg hover:bg-[#0066cc] flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Ask AI to Custom Build
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. CENTER: Live Link Sync */}
        <div className="flex justify-center w-1/3 relative hidden md:flex">
          <div className={`px-4 py-1.5 rounded-full text-[11px] font-mono flex items-center gap-2 border ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-[#E5E5E5] text-gray-500'}`}>
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px] select-all">{shareUrl}</span>
          </div>
        </div>

        {/* 3. RIGHT: Reload + Publish */}
        <div className="flex justify-end items-center gap-2 w-1/3 relative" ref={publishRef}>
          
          <button onClick={onReload} className={`p-1.5 rounded-md transition-none ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-[#707070] hover:text-[#333333] hover:bg-[#E5E5E5]'}`} title="Regenerate">
            <RefreshCw className="w-4 h-4" />
          </button>

          <button onClick={() => setShowPublish(!showPublish)} className="px-3.5 py-1.5 bg-[#0080ff] text-white text-[12px] font-bold rounded-[6px] hover:bg-[#0066cc] shadow-sm">
            Publish
          </button>

          {showPublish && (
            <div className="absolute top-[calc(100%+6px)] right-0 w-[300px] bg-white border border-[#E5E5E5] rounded-lg shadow-2xl z-[999] text-left font-sans p-1 text-[#333333]">
              
              {publishView === 'main' ? (
                <>
                  <div className="p-3 border-b border-[#E5E5E5]">
                    <h3 className="text-[14px] font-bold">Publish App</h3>
                  </div>
                  
                  {isPublished && (
                    <div className="px-3 pt-3 pb-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Live URL</p>
                      <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#0080ff] hover:underline font-mono truncate block flex items-center gap-1.5 p-2 bg-[#F4F8FE] rounded-md border border-[#0080ff]/20">
                        wok.base44.app/p/{customSlug} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}

                  <div className="p-2 space-y-1 mt-1">
                    <button onClick={() => { setShowPublish(false); setShowDomainModal(true); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors group">
                      <h4 className="text-[13px] font-bold text-[#333333] group-hover:text-[#0080ff] transition-colors">Custom domain</h4>
                      <p className="text-[11px] text-[#707070] mt-0.5">Configure your public routing.</p>
                    </button>
                    <button onClick={() => setPublishView('share')} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors group">
                      <h4 className="text-[13px] font-bold text-[#333333] group-hover:text-[#0080ff] transition-colors">Share your app</h4>
                      <p className="text-[11px] text-[#707070] mt-0.5">Share via email or social networks.</p>
                    </button>
                  </div>
                  
                  <div className="border-t border-[#E5E5E5] pt-3 px-3">
                    <h4 className="text-[12px] font-bold text-[#333333] mb-2">App Visibility</h4>
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-md border border-[#E5E5E5] shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <GoogleIcon />
                        <span className="text-[12px] font-bold">Index on Google</span>
                      </div>
                      <Toggle enabled={indexGoogle} onChange={() => setIndexGoogle(!indexGoogle)} />
                    </div>
                  </div>

                  <div className="px-3 pb-2 pt-1">
                    {indexGoogle && (
                      <div className="bg-[#F9F8F6] border border-[#E5E5E5] p-2.5 rounded-md flex items-start gap-2 mb-3 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#DDFF00] mt-[3.5px] flex-shrink-0"></div>
                        <p className="text-[10px] text-[#707070] font-medium leading-snug">
                          Indexing execution takes 24-48h. Maximize your visibility globally.
                        </p>
                      </div>
                    )}
                    <button onClick={handlePublish} className="w-full py-2 bg-[#0080ff] text-white text-[13px] font-bold rounded-md hover:bg-[#0066cc] shadow-sm mt-3">
                      {isPublished ? 'Update Live Build' : 'Deploy Intelligence'}
                    </button>
                  </div>
                </>
              ) : (
                /* SHARE VIEW */
                <>
                  <div className="p-3 border-b border-[#E5E5E5] flex items-center gap-2">
                    <button onClick={() => setPublishView('main')} className="p-1 hover:bg-gray-100 rounded-md text-gray-500"><ArrowLeft className="w-4 h-4" /></button>
                    <h3 className="text-[14px] font-bold">Share App</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 border border-[#E5E5E5] rounded-md p-1.5 bg-[#F9F9F9]">
                      <div className="px-2 flex-1 text-[12px] font-mono text-gray-600 truncate bg-transparent outline-none select-all">
                        {shareUrl}
                      </div>
                      <button onClick={copyToClipboard} className="px-3 py-1.5 bg-white border border-[#E5E5E5] text-[12px] font-bold rounded hover:bg-gray-50 shadow-sm">Copy</button>
                    </div>

                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Share via</p>
                    
                    <div className="grid grid-cols-5 gap-2">
                      <a href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="aspect-square flex items-center justify-center rounded-md border border-[#E5E5E5] hover:bg-gray-50 text-gray-700 hover:text-black transition-colors" title="X (Twitter)"><XIcon /></a>
                      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="aspect-square flex items-center justify-center rounded-md border border-[#E5E5E5] hover:bg-gray-50 text-gray-700 hover:text-[#0a66c2] transition-colors" title="LinkedIn"><LinkedInIcon /></a>
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="aspect-square flex items-center justify-center rounded-md border border-[#E5E5E5] hover:bg-gray-50 text-gray-700 hover:text-[#1877F2] transition-colors" title="Facebook"><FacebookIcon /></a>
                      <a href={`https://api.whatsapp.com/send?text=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="aspect-square flex items-center justify-center rounded-md border border-[#E5E5E5] hover:bg-gray-50 text-gray-700 hover:text-[#25D366] transition-colors" title="WhatsApp"><WhatsAppIcon /></a>
                      <a href={`mailto:?body=${shareUrl}`} className="aspect-square flex items-center justify-center rounded-md border border-[#E5E5E5] hover:bg-gray-50 text-gray-700 hover:text-black transition-colors" title="Email"><Mail className="w-4 h-4" /></a>
                    </div>
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