import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatInputBar({ input, setInput, onSend, isLoading, blocked, mode, setMode, currentAgent, setCurrentAgent, userPlan, useWebSearch, setUseWebSearch, files, setFiles, onUpgradeRequest, discussMode, setDiscussMode, canUploadFiles, hasInternet }) {
  
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const navigate = useNavigate();

  const handleSendMessage = () => {
    if (!input.trim() || isLoading || blocked) return;
    onSend(input);
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-[24px]">
      
      <div className="px-4 pt-3 pb-2 border-b border-gray-50">
        <textarea
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          placeholder="Message..."
          className="w-full bg-transparent text-sm text-gray-700 focus:outline-none resize-none leading-relaxed"
          rows={2} style={{ minHeight: '38px', maxHeight: '120px' }}
        />
      </div>

      <div className="flex items-center justify-between px-3 pb-3 pt-1.5 relative">
        <div className="flex items-center gap-1.5">
          
          {/* ENGRENAGE -> REDIRECTION DIRECTE /ai-dna */}
          <button onClick={() => navigate('/ai-dna')} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          
          <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
          
          <div className="relative">
            <button onClick={() => setShowPlusMenu(!showPlusMenu)} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>

            {showPlusMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPlusMenu(false)}></div>
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 font-open overflow-hidden">
                  
                  {/* UPLOAD FILE */}
                  <label className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors group">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      Upload files
                    </div>
                    {!canUploadFiles && (
                      // LA PILULE YUZU POUR L'UPGRADE DIRECT
                      <span onClick={(e) => { e.preventDefault(); onUpgradeRequest(); setShowPlusMenu(false); }} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide" style={{ background: '#DDFF00', color: '#0A0A0A' }}>
                        ♦ Builder+
                      </span>
                    )}
                    <input type="file" className="hidden" multiple onChange={(e) => {
                      if (!canUploadFiles) return;
                      const dropped = Array.from(e.target.files || []);
                      if (dropped.length > 0) setFiles(p => [...p, ...dropped]);
                      setShowPlusMenu(false);
                    }} />
                  </label>

                  {/* WEB SEARCH */}
                  <button onClick={() => {
                      if (!hasInternet) { onUpgradeRequest(); setShowPlusMenu(false); return; }
                      setUseWebSearch(!useWebSearch);
                      setShowPlusMenu(false);
                    }} 
                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                      Web Search
                    </div>
                    {!hasInternet ? (
                      // LA PILULE YUZU POUR L'UPGRADE DIRECT
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide" style={{ background: '#DDFF00', color: '#0A0A0A' }}>
                        Essential+
                      </span>
                    ) : (
                      <div className={`w-6 h-3.5 rounded-full relative transition-colors ${useWebSearch ? 'bg-black' : 'bg-gray-200'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform ${useWebSearch ? 'translate-x-2.5' : ''}`}></div>
                      </div>
                    )}
                  </button>

                </div>
              </>
            )}
          </div>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-100 text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
            Edit
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleSendMessage} disabled={!input.trim()} className="flex items-center justify-center w-8 h-8 bg-[#8C98A4] hover:bg-[#7A8590] disabled:opacity-50 text-white rounded-[10px] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  );
}