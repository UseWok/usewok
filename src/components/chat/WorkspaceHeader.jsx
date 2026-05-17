import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Palette, ExternalLink, ArrowLeft, Mail, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);
const XIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>);
const LinkedInIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>);
const FacebookIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>);
const WhatsAppIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>);

const Toggle = ({ enabled, onChange }) => (
  <button onClick={onChange} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out ${enabled ? 'bg-[#0080ff]' : 'bg-[#E5E5E5]'}`}>
    <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out" style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
  </button>
);

const AMBIANCES = [
  { id: 'wok_clean', name: 'Wok Clean', theme: 'wok_clean', previewGradient: 'linear-gradient(180deg, #FFFFFF 0%, #F0F2F5 100%)' },
  { id: 'deep_void', name: 'Deep Void', theme: 'deep_void', previewGradient: 'linear-gradient(180deg, #050505 0%, #121212 100%)' },
  { id: 'yuzu_accent', name: 'Yuzu Accent', theme: 'yuzu_accent', previewGradient: 'linear-gradient(180deg, #0A0A0A 0%, #1A1C00 100%)' },
  { id: 'corporate_sand', name: 'Corporate Sand', theme: 'corporate_sand', previewGradient: 'linear-gradient(180deg, #FDFBF7 0%, #EFEBE0 100%)' },
  { id: 'brutalism', name: 'Brutalism Light', theme: 'brutalism', previewGradient: 'linear-gradient(180deg, #E5E5E5 0%, #C0C0C0 100%)' }
];

export default function WorkspaceHeader({ onReload, appearance, setAppearance, onAskAI, convId, viewMode }) {
  const [showPublish, setShowPublish] = useState(false);
  const [publishView, setPublishView] = useState('main'); 
  const [isPublished, setIsPublished] = useState(false);
  const [customSlug, setCustomSlug] = useState(convId || `conv_${Date.now().toString().slice(-6)}`);
  const [tempSlug, setTempSlug] = useState(customSlug);
  const [indexGoogle, setIndexGoogle] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  
  const publishRef = useRef(null);
  const appRef = useRef(null);
  
  const isDark = appearance?.theme === 'deep_void' || appearance?.theme === 'yuzu_accent';

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

  const handlePublish = async () => {
    try {
      if (convId) {
        await base44.entities.Conversation.update(convId, {
          is_public: true,
          slug: customSlug,
          appearance: JSON.stringify(appearance)
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

  const handleSaveDomain = async () => {
    const slug = tempSlug.trim();
    if(!slug) { 
      toast.error("The path cannot be empty."); 
      return; 
    }
    
    const isValid = /^[a-z0-9-]{1,30}$/.test(slug);
    if (!isValid) {
      toast.error("Invalid URL. Use only lowercase letters, numbers, and hyphens. (Max 30 chars)");
      return;
    }

    try {
      if (convId) {
        await base44.entities.Conversation.update(convId, { slug: slug });
      }
      setCustomSlug(slug);
      setShowDomainModal(false);
      toast.success("Domain configuration saved to the Cloud.");
    } catch (error) {
      toast.error("Waiting for backend configuration. Local URL updated.");
      setCustomSlug(slug);
      setShowDomainModal(false);
    }
  };

  const shareUrl = `https://wok.base44.app/p/${customSlug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  // IF THE DASHBOARD IS OPEN, HIDE THE HEADER TOOLS ENTIRELY
  if (viewMode === 'dashboard') {
    return <header className="h-[56px] flex-shrink-0 z-30 w-full bg-transparent absolute top-0 left-0 right-0 pointer-events-none" />;
  }

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

      <header className="flex items-center justify-between px-4 h-[56px] flex-shrink-0 z-30 font-sans w-full bg-transparent absolute top-0 left-0 right-0">
        
        {/* LEFT: Mac Dots + Configurator */}
        <div className="flex gap-4 items-center pl-1">
           <div className="flex gap-1.5 items-center">
             <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
             <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
             <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
           </div>
           
           <div className="relative" ref={appRef}>
            <button 
              onClick={() => setShowAppearance(!showAppearance)} 
              className={`px-3.5 py-1.5 rounded-md text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors border ${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-[#E5E5E5] text-[#333333] hover:bg-gray-50'}`}
            >
              <Palette className="w-3.5 h-3.5" /> Appearance
            </button>
            
            {showAppearance && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-[340px] bg-white border border-[#E5E5E5] rounded-xl shadow-2xl z-[9999] p-3 text-left font-sans text-[#333333]">
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1"><Palette className="w-3 h-3" /> Design Modes</p>
                  <div className="grid grid-cols-2 gap-2">
                    {AMBIANCES.map(a => (
                      <button 
                        key={a.id} 
                        onClick={() => { setAppearance({...appearance, theme: a.theme}) }} 
                        className={`flex flex-col items-start p-2 rounded-lg border transition-all ${appearance.theme === a.theme ? 'border-[#0080ff] bg-[#F4F8FE] ring-1 ring-[#0080ff]/20' : 'border-[#E5E5E5] hover:border-gray-300 bg-white'}`}
                      >
                        <div className="w-full h-10 rounded-md mb-2 border border-black/5 shadow-inner" style={{ background: a.previewGradient }}></div>
                        <span className="text-[12px] font-bold text-gray-800 leading-tight">{a.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[#E5E5E5] mt-3 pt-3">
                  <button onClick={() => { onAskAI(); setShowAppearance(false); }} className="w-full py-2 bg-[#0080ff] text-white text-[12px] font-bold rounded-lg hover:bg-[#0066cc] flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Ask AI to Map Architecture
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Reload Tool */}
        <div className="flex justify-end items-center gap-2 relative">
          <button onClick={onReload} className={`p-1.5 rounded-md transition-none ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-[#707070] hover:text-[#333333] hover:bg-white/50 backdrop-blur-sm'}`} title="Regenerate">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>
    </>
  );
}