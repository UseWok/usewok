import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ChevronRight, ChevronDown, ChevronLeft, Zap, Globe, Download, Check, Send, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function PublishAppModal({ open, onClose, appUrl, isPublished, setIsPublished }) {
  const [activeTab, setActiveTab] = useState('web');
  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  const [visibilityChoice, setVisibilityChoice] = useState('Public (no login)');
  const [view, setView] = useState('main');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeout(() => { setView('main'); setActiveTab('web'); setIsVisibilityMenuOpen(false); }, 200);
    }
  }, [open]);

  const handleShareClick = () => {
    setIsTransitioning(true);
    setTimeout(() => { setView('share'); setIsTransitioning(false); }, 150);
  };

  const handleBackClick = () => {
    setIsTransitioning(true);
    setTimeout(() => { setView('main'); setIsTransitioning(false); }, 150);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[99998]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-[52px] right-4 w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-200 overflow-hidden flex flex-col z-[99999]"
            onClick={e => e.stopPropagation()}
          >
            <div className={`relative w-full transition-all duration-150 ease-in-out ${isTransitioning ? 'opacity-0 blur-sm' : 'opacity-100 blur-none'}`}>
              {view === 'main' ? (
                <div className="flex flex-col">
                  <div className="px-5 pt-5 pb-0 flex justify-between items-start">
                    <div className="w-full">
                      <h2 className="text-[18px] font-bold text-zinc-900 mb-4">Publish Your App</h2>
                      <div className="flex gap-4 border-b border-zinc-200 w-full">
                        {['web', 'mobile', 'pdf'].map(tab => (
                          <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`pb-2 text-[14px] font-medium transition-colors capitalize ${activeTab === tab ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                            {tab === 'pdf' ? 'PDF Export' : tab === 'mobile' ? 'Mobile app' : 'Web'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 text-zinc-500 rounded-md transition-colors ml-4"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="p-5 flex flex-col gap-4">
                    {activeTab === 'web' && (
                      <>
                        <div className={`flex items-center justify-between p-2 rounded-lg border ${isPublished ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-200 bg-zinc-100 opacity-60'}`}>
                          <span className="text-[13px] font-mono text-zinc-500 truncate select-none">
                            {isPublished ? appUrl : 'https://wok.base44.app/...?'}
                          </span>
                          <button disabled={!isPublished}
                            onClick={() => { navigator.clipboard.writeText(appUrl); toast.success("Link copied to clipboard!"); }}
                            className="p-1.5 hover:bg-white rounded border border-transparent hover:border-zinc-200 transition-all disabled:opacity-50">
                            <Copy className="w-4 h-4 text-zinc-600" />
                          </button>
                        </div>
                        {!isPublished && (
                          <div className="text-[12px] text-amber-600 bg-amber-50 p-2.5 rounded-md flex items-center gap-2 border border-amber-100">
                            <span className="font-medium">Not published yet.</span> Click below to generate your link.
                          </div>
                        )}
                        <div className="flex flex-col gap-3 mt-1 border border-zinc-200 border-dashed rounded-lg p-4">
                          <div className="flex items-center gap-2 text-[14px] font-semibold text-zinc-800">
                            <Zap className="w-4 h-4 text-orange-500" /> Connect a custom domain
                          </div>
                          <div className="flex gap-2 items-center">
                            <input type="text" disabled placeholder="https://wok.io" className="flex-1 min-w-0 border border-zinc-200 rounded-md px-3 py-1.5 text-[13px] bg-zinc-50 cursor-not-allowed" />
                            <button disabled className="shrink-0 px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-[13px] font-medium text-zinc-700 opacity-50">Get Domain</button>
                          </div>
                        </div>
                        <div onClick={handleShareClick} className="flex items-center justify-between mt-1 cursor-pointer hover:bg-zinc-50 p-2 -mx-2 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-[18px]">🎉</span>
                            <div className="flex flex-col">
                              <span className="text-[14px] font-medium text-zinc-900">Share your app</span>
                              <span className="text-[13px] text-zinc-500">Share a link by email or on social</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        </div>
                      </>
                    )}
                    {activeTab === 'mobile' && (
                      <div className="flex flex-col gap-3 py-4 text-center">
                        <p className="text-[13px] text-zinc-600">Mobile app generation is available on Pro plans.</p>
                      </div>
                    )}
                    {activeTab === 'pdf' && (
                      <div className="flex flex-col gap-3 py-2">
                        <p className="text-[13px] text-zinc-600">Export your interactive tool as a static PDF document (great for lead magnets).</p>
                        <button disabled={!isPublished} className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                          <Download className="w-4 h-4" /> Download PDF
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-medium text-zinc-700 flex items-center gap-2"><Globe className="w-4 h-4" /> App Visibility</span>
                      <div className="relative">
                        <button onClick={() => setIsVisibilityMenuOpen(!isVisibilityMenuOpen)}
                          className="flex items-center justify-between gap-6 text-[13px] border border-zinc-200 rounded-md px-3 py-1.5 bg-white hover:bg-zinc-50 transition-colors focus:outline-none">
                          {visibilityChoice}
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                        </button>
                        {isVisibilityMenuOpen && (
                          <div className="absolute top-full right-0 mt-1 w-[180px] bg-white border border-zinc-200 shadow-[0_4px_20px_rgb(0,0,0,0.1)] rounded-md overflow-hidden z-[100000]">
                            {['Public (no login)', 'Private (password)'].map(opt => (
                              <button key={opt} onClick={() => { setVisibilityChoice(opt); setIsVisibilityMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center justify-between">
                                {opt}
                                {visibilityChoice === opt && <Check className="w-3.5 h-3.5 text-zinc-900" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { setIsPublished(true); toast.success(isPublished ? "App settings updated!" : "App successfully published!"); }}
                      className="w-full py-2.5 rounded-lg text-[14px] font-bold transition-all bg-[#1A1A24] hover:bg-black text-white shadow-sm">
                      {isPublished ? 'Update App' : 'Publish App'}
                    </button>
                    {isPublished && <div className="text-center text-[11px] text-zinc-400">Last published just now</div>}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col w-full">
                  <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                    <button onClick={handleBackClick} className="p-1.5 hover:bg-zinc-100 border border-zinc-200 rounded-md transition-colors text-zinc-600"><ChevronLeft className="w-4 h-4" /></button>
                    <div>
                      <h2 className="text-[16px] font-bold text-zinc-900 leading-tight">Share your app</h2>
                      <p className="text-[13px] text-zinc-500 leading-tight mt-0.5">Share a link by email or on social</p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-2 flex flex-col gap-3">
                    <label className="text-[14px] font-semibold text-zinc-900">Send invite</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Enter emails, separated by commas" className="flex-1 w-full min-w-0 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-zinc-400" />
                      <button className="h-full flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] hover:bg-zinc-50 font-medium text-zinc-700">User <ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                    <button className="w-full py-2.5 bg-[#8C8C8C] hover:bg-[#7A7A7A] text-white rounded-lg text-[14px] font-medium flex justify-center items-center gap-2 transition-colors mt-1">
                      Send Invitation <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-5 py-4 border-t border-zinc-100 flex items-center gap-2.5">
                    <button className="flex items-center gap-2 px-3 py-2 border border-zinc-200 rounded-lg text-[13px] font-bold text-zinc-800 hover:bg-zinc-50 shadow-sm mr-auto transition-colors">
                      <LinkIcon className="w-4 h-4" /> Copy link
                    </button>
                    <button className="w-9 h-9 shrink-0 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 text-[#1877F2] transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></button>
                    <button className="w-9 h-9 shrink-0 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 text-[#0A66C2] transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></button>
                    <button className="w-9 h-9 shrink-0 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 text-[#000000] transition-colors"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></button>
                    <button className="w-9 h-9 shrink-0 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 text-[#25D366] transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.996 2.001A10 10 0 0 0 2.68 15.5l-1.32 4.81 4.92-1.29a9.99 9.99 0 0 0 5.716 1.78c5.52 0 10-4.48 10-10.01a10 10 0 0 0-10-9.99zm5.54 14.18c-.23.64-1.29 1.19-1.8 1.25-.43.06-1 .11-3.23-.81-2.69-1.12-4.43-3.92-4.57-4.1-.14-.18-1.09-1.45-1.09-2.76s.69-1.95.94-2.22c.24-.26.54-.33.72-.33s.36 0 .52.01c.17.02.4.04.59.45.2.43.51 1.25.56 1.36.05.11.08.23.01.37-.08.14-.11.23-.23.36-.11.13-.24.28-.34.39-.11.12-.22.25-.1.48.12.22.54.91 1.19 1.48.84.74 1.52.97 1.74 1.08.22.12.35.1.48-.04.14-.15.58-.68.74-.91.16-.24.32-.2.53-.12.21.08 1.34.63 1.57.75.23.11.38.17.44.27.06.1.06.56-.17 1.2z" /></svg></button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}