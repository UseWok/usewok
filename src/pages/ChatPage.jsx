// ─────────────────────────────────────────────────────────────────────────────
// ChatPage.jsx  ── Layout updated for floating preview panel with 200ms Ease-Out
// ─────────────────────────────────────────────────────────────────────────────

// ============================================================================
// ► 1. IMPORTS & DEPENDENCIES
// ============================================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44, cachedAIRequest } from '@/api/base44Client';
import { toast } from 'sonner';


import { motion, AnimatePresence } from 'framer-motion';
import { Home, MessageSquare, Cpu, X, Copy, ChevronRight, ChevronDown, ChevronLeft, Zap, Globe, Download, Check, Send, CreditCard, Settings, BookOpen, LifeBuoy, Link as LinkIcon } from 'lucide-react';
import AssistantMessage from '@/components/chat/AssistantMessage';
import ErrorNotification from '@/components/chat/ErrorNotification';
import ChatInputBar from '@/components/chat/ChatInputBar';
import EditModeOverlay from '@/components/chat/EditModeOverlay';
import FichePanel from '@/components/chat/FichePanel';
import ChatWorkspaceSidebar from '@/components/chat/ChatWorkspaceSidebar';
import PreviewLoadingFeature from '@/components/chat/PreviewLoadingFeature';
import ZoomToggle from '@/components/chat/ZoomToggle';
import { ResizablePanelGroup as PanelGroup, ResizablePanel as Panel } from '@/components/ui/resizable';
import { safeAsync } from '@/lib/code-quality';
import { initAgentsFromDB } from '@/lib/agents-config';
import { setCurrentUser, loadConversationFromCloud } from '@/lib/discussions';
import { getUserPlan } from '@/lib/plans-config';

// ============================================================================
// ► 2. SUB-COMPONENTS (BUBBLES & MODALS)
// ============================================================================
// Highlight "hovering" with underline as seen in image
const renderUserText = (text) => {
  if (!text) return null;
  return text.split(/(hovering)/g).map((part, i) =>
  part === 'hovering' ?
  <span key={i} style={{ textDecoration: 'underline' }}>hovering</span> :
  part
  );
};

const CustomUserMessageBubble = ({ msg }) =>
<div className="flex flex-col items-end w-full gap-1">
    {(msg.images?.length || 0) > 0 &&
  <div className="flex flex-wrap gap-2 max-w-[75%] justify-end">
        {msg.images.map((imgUrl, i) =>
    <img key={i} src={imgUrl} alt="attachment"
    className="max-w-[160px] max-h-[120px] rounded-2xl object-cover" />
    )}
      </div>
  }
    {msg.content &&
  <div
    className="inline-block max-w-[75%] text-left whitespace-pre-wrap"
    style={{ background: '#F0F0F0', borderRadius: 14, padding: '10px 13px', fontSize: 13, color: '#222222', lineHeight: 1.5 }}>
    
        {renderUserText(msg.content)}
      </div>
  }
    <span style={{ fontSize: 11, color: '#AAAAAA', marginRight: 2 }}>
      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  </div>;

const IframeModal = ({ open, url, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans" style={{ background: 'rgba(0, 0, 0, 0.45)' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.1, ease: 'ease-out' }}
        className="relative w-[95vw] max-w-[1100px] h-[95vh] bg-white rounded-lg overflow-hidden flex flex-col"
        style={{ borderRadius: '12px' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-[99999] p-2 hover:bg-[#F7F7F8] rounded transition-colors" style={{ width: 20, height: 20 }}>
          <X className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2} />
        </button>
        <iframe src={url} className="w-full h-full border-none bg-white" />
      </motion.div>
    </div>);
};

const ProModal = ({ open, title, subtitle, children, onClose, onAction, actionText }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-black/60 backdrop-blur-sm">
      <div className="relative w-[95%] md:w-[480px] bg-card rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-[16px] font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted text-muted-foreground rounded-md transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
        {actionText &&
        <div className="p-4 border-t border-border flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
            <button onClick={onAction} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0055FF] hover:bg-[#0044CC] rounded-md transition-colors shadow-sm">{actionText}</button>
          </div>
        }
      </div>
    </div>);
};

const PublishAppModal = ({ open, onClose, appUrl, isPublished, setIsPublished }) => {
  const [activeTab, setActiveTab] = useState('web');
  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  const [visibilityChoice, setVisibilityChoice] = useState('Public (no login)');

  // Engine for the blur transition and view swapping
  const [view, setView] = useState('main'); // 'main' | 'share'
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset to main view if closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => { setView('main'); setActiveTab('web'); setIsVisibilityMenuOpen(false); }, 200);
    }
  }, [open]);

  const handleShareClick = () => {
     setIsTransitioning(true);
     setTimeout(() => {
        setView('share');
        setIsTransitioning(false);
     }, 150); // Fluid fast transition
  };

  const handleBackClick = () => {
     setIsTransitioning(true);
     setTimeout(() => {
        setView('main');
        setIsTransitioning(false);
     }, 150);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Invisible backdrop strictly to catch outside clicks. No dark veil. */}
          <div className="fixed inset-0 z-[99998]" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-[calc(100%+12px)] right-0 w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-200 overflow-hidden flex flex-col z-[99999]"
            onClick={e => e.stopPropagation()}
          >
            <div 
              className={`relative w-full transition-all duration-150 ease-in-out ${isTransitioning ? 'opacity-0 blur-sm' : 'opacity-100 blur-none'}`}
            >
              {view === 'main' ? (
                /* ── MAIN PUBLISH VIEW ── */
                <div className="flex flex-col">
                  <div className="px-5 pt-5 pb-0 flex justify-between items-start">
                    <div className="w-full">
                      <h2 className="text-[18px] font-bold text-zinc-900 mb-4">Publish Your App</h2>
                      <div className="flex gap-4 border-b border-zinc-200 w-full">
                        <button onClick={() => setActiveTab('web')} className={`pb-2 text-[14px] font-medium transition-colors ${activeTab === 'web' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Web</button>
                        <button onClick={() => setActiveTab('mobile')} className={`pb-2 text-[14px] font-medium transition-colors ${activeTab === 'mobile' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Mobile app</button>
                        <button onClick={() => setActiveTab('pdf')} className={`pb-2 text-[14px] font-medium transition-colors ${activeTab === 'pdf' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>PDF Export</button>
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
                          <div className="flex gap-2">
                            <button
                              disabled={!isPublished}
                              onClick={() => {
                                  navigator.clipboard.writeText(appUrl);
                                  toast.success("Link copied to clipboard!");
                              }}
                              className="p-1.5 hover:bg-white rounded border border-transparent hover:border-zinc-200 transition-all disabled:opacity-50"
                            >
                              <Copy className="w-4 h-4 text-zinc-600"/>
                            </button>
                          </div>
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
                      
                      {/* --- DOWNWARD CUSTOM SELECT --- */}
                      <div className="relative">
                        <button 
                          onClick={() => setIsVisibilityMenuOpen(!isVisibilityMenuOpen)}
                          className="flex items-center justify-between gap-6 text-[13px] border border-zinc-200 rounded-md px-3 py-1.5 bg-white hover:bg-zinc-50 transition-colors focus:outline-none"
                        >
                          {visibilityChoice}
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                        </button>

                        {isVisibilityMenuOpen && (
                          <div className="absolute top-full right-0 mt-1 w-[180px] bg-white border border-zinc-200 shadow-[0_4px_20px_rgb(0,0,0,0.1)] rounded-md overflow-hidden z-[100000]">
                            <button 
                              onClick={() => { setVisibilityChoice('Public (no login)'); setIsVisibilityMenuOpen(false); }}
                              className="w-full text-left px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center justify-between"
                            >
                              Public (no login)
                              {visibilityChoice === 'Public (no login)' && <Check className="w-3.5 h-3.5 text-zinc-900" />}
                            </button>
                            
                            <button 
                              onClick={() => { setVisibilityChoice('Private (password)'); setIsVisibilityMenuOpen(false); }}
                              className="w-full text-left px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center justify-between"
                            >
                              Private (password)
                              {visibilityChoice === 'Private (password)' && <Check className="w-3.5 h-3.5 text-zinc-900" />}
                            </button>
                          </div>
                        )}
                      </div>
                      {/* --- END DOWNWARD SELECT --- */}

                    </div>
                    <button
                      onClick={() => {
                          setIsPublished(true);
                          toast.success(isPublished ? "App settings updated!" : "App successfully published!");
                      }}
                      className={`w-full py-2.5 rounded-lg text-[14px] font-bold transition-all ${isPublished ? 'bg-zinc-900 hover:bg-black text-white shadow-sm' : 'bg-[#1A1A24] hover:bg-black text-white shadow-sm'}`}
                    >
                      {isPublished ? 'Update App' : 'Publish App'}
                    </button>
                    {isPublished && <div className="text-center text-[11px] text-zinc-400">Last published just now</div>}
                  </div>
                </div>
              ) : (
                /* ── SHARE APP VIEW ── */
                <div className="flex flex-col w-full">
                   <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                      <button onClick={handleBackClick} className="p-1.5 hover:bg-zinc-100 border border-zinc-200 rounded-md transition-colors text-zinc-600"><ChevronLeft className="w-4 h-4" /></button>
                      <div className="flex flex-col">
                         <h2 className="text-[16px] font-bold text-zinc-900 leading-tight">Share your app</h2>
                         <p className="text-[13px] text-zinc-500 leading-tight mt-0.5">Share a link by email or on social</p>
                      </div>
                   </div>
                   
                   <div className="px-5 pb-5 pt-2 flex flex-col gap-3">
                      <label className="text-[14px] font-semibold text-zinc-900">Send invite</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Enter emails, separated by commas" className="flex-1 w-full min-w-0 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-zinc-400" />
                        <div className="relative shrink-0">
                           <button className="h-full flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] hover:bg-zinc-50 font-medium text-zinc-700">User <ChevronDown className="w-3.5 h-3.5"/></button>
                        </div>
                      </div>
                      <button className="w-full py-2.5 bg-[#8C8C8C] hover:bg-[#7A7A7A] text-white rounded-lg text-[14px] font-medium flex justify-center items-center gap-2 transition-colors mt-1">
                        Send Invitation <Send className="w-4 h-4" />
                      </button>
                   </div>

                   <div className="px-5 py-4 border-t border-zinc-100 flex items-center gap-2.5">
                      <button className="flex items-center gap-2 px-3 py-2 border border-zinc-200 rounded-lg text-[13px] font-bold text-zinc-800 hover:bg-zinc-50 shadow-sm mr-auto transition-colors">
                        <LinkIcon className="w-4 h-4" /> Copy link
                      </button>

                      {/* Precise Social SVG Implementation */}
                      <button className="w-9 h-9 shrink-0 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 text-[#1877F2] transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></button>
                      <button className="w-9 h-9 shrink-0 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 text-[#0A66C2] transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></button>
                      <button className="w-9 h-9 shrink-0 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 text-[#000000] transition-colors"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
                      <button className="w-9 h-9 shrink-0 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 text-[#25D366] transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.996 2.001A10 10 0 0 0 2.68 15.5l-1.32 4.81 4.92-1.29a9.99 9.99 0 0 0 5.716 1.78c5.52 0 10-4.48 10-10.01a10 10 0 0 0-10-9.99zm5.54 14.18c-.23.64-1.29 1.19-1.8 1.25-.43.06-1 .11-3.23-.81-2.69-1.12-4.43-3.92-4.57-4.1-.14-.18-1.09-1.45-1.09-2.76s.69-1.95.94-2.22c.24-.26.54-.33.72-.33s.36 0 .52.01c.17.02.4.04.59.45.2.43.51 1.25.56 1.36.05.11.08.23.01.37-.08.14-.11.23-.23.36-.11.13-.24.28-.34.39-.11.12-.22.25-.1.48.12.22.54.91 1.19 1.48.84.74 1.52.97 1.74 1.08.22.12.35.1.48-.04.14-.15.58-.68.74-.91.16-.24.32-.2.53-.12.21.08 1.34.63 1.57.75.23.11.38.17.44.27.06.1.06.56-.17 1.2z"/></svg></button>
                      <button className="w-9 h-9 shrink-0 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 text-[#FF4500] transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249c0-.688-.561-1.249-1.248-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249c0-.688-.561-1.25-1.25-1.25zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg></button>
                   </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


// ============================================================================
// ► 3. UTILITIES, CONSTANTS & PROMPTS
// ============================================================================
const getLocalDiscussions = (workspaceId) => {
  try {
    const raw = localStorage.getItem(`wok_discussions_${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveLocalDiscussions = (workspaceId, data) => {
  try {
    localStorage.setItem(`wok_discussions_${workspaceId}`, JSON.stringify(data));
  } catch (err) {
    console.error('saveLocalDiscussions failed:', err);
  }
};

const getConversationMessages = (conversationId) => {
  try {
    const raw = localStorage.getItem(`wok_messages_${conversationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveConversationMessages = (conversationId, messages) => {
  try {
    localStorage.setItem(`wok_messages_${conversationId}`, JSON.stringify(messages));
  } catch (err) {
    console.error('saveConversationMessages failed:', err);
  }
};

const PROMPT_PSYCHOLOGIST = `Elite UI data compiler. THEME T:X (1=Clean/white, 2=Slate/minimal, 3=Bold/graphic, 4=Warm/editorial, 5=Structured/dense). Output: dense telegraphic data, copywriting points, chart arrays with XY axes. RAW TEXT ONLY. Never use generic placeholder content — every word must serve a purpose.`;

const PROMPT_ARCHITECT = `You are a world-class Senior UI Engineer and Product Designer. Build a stunning, complete, production-ready interactive React interface.

CORE IDENTITY
Every interface you create is unique. Never repeat a layout pattern, color palette, or structural approach from previous responses. Approach each brief as a fresh creative problem. Ask: what is the ONE action this interface must trigger? Build from that answer.

DESIGN PRINCIPLES
- Default to LIGHT MODE: clean whites, soft grays, precise typography. bg-white or bg-[#FAFAFA] or bg-[#F5F5F4] as base.
- Each build must have a distinct visual identity: choose a unique layout archetype (dashboard, editorial, product showcase, data story, command center, portfolio, etc.) that best fits the content.
- Typography as design: vary scale, weight, and spacing to create rhythm. Titles are large and confident. Body text is readable at 15-16px with leading-[1.7].
- Micro-interactions on every interactive element: hover states, transitions, subtle transforms.
- Generous whitespace. Content breathes. No cramped layouts.
- 3 distinct data visualizations using Recharts (AreaChart, BarChart, PieChart, RadarChart, etc.) with real-looking data, linearGradient fills, h-64 or h-80.
- At least one interactive state: tabs, toggles, expandable sections, or a stepper.

INTELLIGENCE LAYER — enforced on every output:

[9] BUILT-IN CONTRARIANISM
For every major design decision, silently ask: where could this fail? Encode the answer into the UI as a collapsed one-line note: e.g. 'Why not a single scroll? — tabs reduce discoverability for first-time users.' Never present one solution as the only solution.

[10] HIERARCHICAL SOURCING
In a subtle Design Notes section or inline tags, distinguish three tiers: [User req] what was explicitly asked / [Best practice] established UX convention / [AI interpretation] your inference or creative extension. The user must know what is required vs what is inferred.

[13] MULTI-SCALE TEMPORAL THINKING
Every layout decision must serve three horizons simultaneously: Immediate — primary CTA, key data above the fold (next 60s) / Medium-term — navigation clarity, return-visit structure (2 weeks) / Long-term — component modularity, scalable layout (12 months). Reflect these priorities in the UI hierarchy. Never flatten all decisions onto one time horizon.

[14] CROSS-ELEMENT CORRELATION
Automatically surface cascading impacts: adding a sidebar compresses main content / heavy hero increases load cost / tabs reduce content discoverability. Weave these as micro-labels or a collapsible 'Design Impact' panel. The user should see what each decision costs elsewhere.

[15] PROBABILISTIC DESIGN SCENARIOS
Never lock in a single layout as final. At the bottom of the interface, include a collapsed 'Alternative Scenarios' panel with weighted options: Scenario A (primary, ~60%) your main proposal / Scenario B (~30%) a structurally different approach for a different user priority / Scenario C (~10%) a radical alternative worth considering. Train the user to think in options, not absolutes.

[20] END WITH A DECISION PROMPT
Every interface must close with an active, clearly visible user prompt — not decorative. A question, a selector, or an input that puts the next move in the user's hands: 'What should this section prioritize?' / 'Choose your layout density:' / 'Which scenario fits your users best?' The interface does not end. It continues the conversation.

IMPORTS (always include all of these):
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, Activity, Layers, Rocket, Brain, Target, Globe, Plus, TrendingUp, BarChart2, Users, Star, ChevronRight, Settings } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

ANIMATIONS:
initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:false, margin:"-8%" }} transition={{ duration:0.6, ease:"easeOut" }}

QUALITY RULES
- Component name: 'App'. Output ONLY the raw jsx block, no markdown fences.
- Every section must have real, purposeful content — no lorem ipsum, no placeholder text.
- Color palette: pick ONE accent color per build (e.g. indigo, emerald, rose, amber, sky, violet) and apply it consistently.
- The result must look like a $20k design agency delivered it.
- NEVER repeat the same layout or structure as a previous response in this session.`;

const PROMPT_DATA_INSIGHT = `You are a sharp product analyst. When given context, extract what matters.

STRUCTURE:
1. **One-line headline** — the single most important thing to know
2. **Key insight** — 2-3 sentences, active voice, concrete numbers when possible
3. **What to do** — max 3 ranked recommendations: **✓ Action** + one supporting reason
4. **Open question** — one question that reframes the problem

RULES:
- Max 20 words per sentence. Vary rhythm: short. Then a longer one. Then short again.
- Never use: leverage, utilize, synergy, robust, comprehensive, streamline, holistic.
- Use: “So,” “Here’s the thing:” “What this means:” “The real question is:”
- End with a specific, answerable question that helps the user decide their next move.`;

// ── Easter egg: chocolatine — triggered by "16/06/2010" ──
const CHOCOLATINE_CODE = `\`\`\`jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const chocolatines = [
  { id: 1, name: 'Chocolatine Classique', region: 'Toulouse', desc: 'La vraie ! Feuilletée, dorée, avec deux barres de chocolat noir fondant.', emoji: '🥐', color: '#C8860A', votes: 4821 },
  { id: 2, name: 'Pain au Chocolat', region: 'Paris', desc: 'Même chose mais appelée autrement par ceux qui ont tort.', emoji: '🍫', color: '#6B3F1E', votes: 1204 },
  { id: 3, name: 'Chocolatine Amandes', region: 'Bordeaux', desc: 'Variante premium avec amandes effilées et sirop doré.', emoji: '✨', color: '#D4A843', votes: 892 },
  { id: 4, name: 'Mini Chocolatine', region: 'Lyon', desc: 'Format bouchée, parfaite pour le café du matin.', emoji: '🤏', color: '#B8770F', votes: 567 },
];

const data = [
  { name: 'Jan', chocolatine: 4200, painAuChocolat: 1100 },
  { name: 'Fév', chocolatine: 4600, painAuChocolat: 1050 },
  { name: 'Mar', chocolatine: 5100, painAuChocolat: 980 },
  { name: 'Avr', chocolatine: 4900, painAuChocolat: 1200 },
  { name: 'Mai', chocolatine: 5400, painAuChocolat: 1150 },
  { name: 'Jun', chocolatine: 5800, painAuChocolat: 1300 },
];

export default function App() {
  const [voted, setVoted] = useState(null);
  const [verdict, setVerdict] = useState('');

  const total = chocolatines.reduce((a, c) => a + c.votes, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8E7 0%, #FEF3C7 50%, #FDE68A 100%)', fontFamily: 'system-ui, sans-serif', padding: '0' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(90deg, #92400E, #B45309)', padding: '48px 24px', textAlign: 'center', color: 'white' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>🥐</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>La Vérité sur la Chocolatine</h1>
          <p style={{ fontSize: 18, opacity: 0.85, marginTop: 12, fontWeight: 400 }}>Le débat le plus important de France depuis 1789</p>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '6px 20px', marginTop: 16, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
            🗺️ SUD-OUEST = CHOCOLATINE · PARIS = TORT
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        {/* Vote cards */}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#92400E', marginBottom: 24 }}>🏆 Les candidates</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 48 }}>
          {chocolatines.map((c) => {
            const pct = Math.round((c.votes / total) * 100);
            const isVoted = voted === c.id;
            return (
              <motion.div
                key={c.id}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                whileTap={{ scale: 0.97 }}
                style={{ background: 'white', borderRadius: 20, padding: 24, cursor: 'pointer', border: isVoted ? '2px solid ' + c.color : '2px solid transparent', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', position: 'relative', overflow: 'hidden' }}
                onClick={() => { setVoted(c.id); setVerdict(c.id === 1 ? '✅ Excellent choix. La vérité vous appartient.' : '❌ Erreur détectée. Redirection vers Toulouse...'); }}
              >
                {isVoted && <div style={{ position: 'absolute', top: 12, right: 12, background: c.color, color: 'white', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 800 }}>MON VOTE</div>}
                <div style={{ fontSize: 40, marginBottom: 12 }}>{c.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1C1C1C', marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>📍 {c.region}</div>
                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, marginBottom: 16 }}>{c.desc}</div>
                <div style={{ background: '#F3F4F6', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }} style={{ height: '100%', background: c.color, borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6, fontWeight: 700 }}>{pct}% · {c.votes.toLocaleString()} votes</div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {verdict && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: voted === 1 ? '#ECFDF5' : '#FEF2F2', border: '1px solid ' + (voted === 1 ? '#6EE7B7' : '#FCA5A5'), borderRadius: 16, padding: '16px 24px', marginBottom: 40, fontSize: 15, fontWeight: 700, color: voted === 1 ? '#065F46' : '#991B1B', textAlign: 'center' }}>
              {verdict}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart manuel */}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#92400E', marginBottom: 20 }}>📊 Consommation mensuelle (milliers)</h2>
        <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', marginBottom: 48 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ width: 32, fontSize: 12, fontWeight: 700, color: '#6B7280' }}>{d.name}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: (d.chocolatine / 6000 * 100) + '%' }} transition={{ duration: 0.8, delay: i * 0.1 }} style={{ height: 14, background: '#B45309', borderRadius: 999 }} />
                  <span style={{ fontSize: 11, color: '#B45309', fontWeight: 700, whiteSpace: 'nowrap' }}>{(d.chocolatine/1000).toFixed(1)}k 🥐</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: (d.painAuChocolat / 6000 * 100) + '%' }} transition={{ duration: 0.8, delay: i * 0.1 + 0.05 }} style={{ height: 14, background: '#6B3F1E', borderRadius: 999, opacity: 0.5 }} />
                  <span style={{ fontSize: 11, color: '#6B3F1E', fontWeight: 700, opacity: 0.6, whiteSpace: 'nowrap' }}>{(d.painAuChocolat/1000).toFixed(1)}k 😔</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#B45309' }}><div style={{ width: 16, height: 16, background: '#B45309', borderRadius: 4 }} /> Chocolatine (correct)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#6B7280' }}><div style={{ width: 16, height: 16, background: '#6B3F1E', borderRadius: 4, opacity: 0.5 }} /> Pain au chocolat (parisien)</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '32px 0', color: '#92400E', fontWeight: 800, fontSize: 18 }}>
          🥐 Il n'y a pas de débat. C'est une <span style={{ color: '#B45309', textDecoration: 'underline' }}>Chocolatine</span>. Fin. 🥐
        </div>
      </div>
    </div>
  );
}
\`\`\``;

const PROMPT_AUTO_FIX = `You are an expert React debugger. Fix the runtime error precisely.
RULES:
- Output ONLY the raw jsx block. No markdown fences. No explanation.
- Preserve the exact visual design, layout, typography, and spacing of the original.
- Replace any crashing lucide-react or recharts imports with safe alternatives (use Activity, TrendingUp, or native Tailwind SVG shapes).
- Do not refactor, rename, or restructure anything that was working.
- Component name: 'App'. Light mode. Production quality.`;

const getBackgroundGradient = (theme) => {
  switch (theme) {
    case 'wok_clean':return 'linear-gradient(180deg, #FFFFFF 0%, #F0F2F5 100%)';
    case 'deep_void':return 'linear-gradient(180deg, #050505 0%, #121212 100%)';
    case 'yuzu_accent':return 'linear-gradient(180deg, #0A0A0A 0%, #1A1C00 100%)';
    case 'corporate_sand':return 'linear-gradient(180deg, #FDFBF7 0%, #EFEBE0 100%)';
    case 'brutalism':return 'linear-gradient(180deg, #E5E5E5 0%, #C0C0C0 100%)';
    default:return 'linear-gradient(180deg, #FFFFFF 0%, #F0F2F5 100%)';
  }
};


// ============================================================================
// ► 4. SKELETON LOADERS (UI STATES)
// ============================================================================

// ── Ghost skeleton drawn top-to-bottom while AI is generating the preview ──
const SkeletonRow = ({ width, height = 14, delay = 0, opacity = 1 }) => {
  return (
    <div
      className="skeleton-block"
      style={{
        width,
        height,
        opacity,
        borderRadius: 8,
        flexShrink: 0,
        animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${delay}ms both`
      }} />);
};

const PreviewSkeleton = () =>
<div className="w-full h-full bg-zinc-50 rounded-2xl p-6 flex flex-col gap-0 overflow-hidden">
    {/* Header block */}
    <div className="flex flex-col gap-2.5 mb-8">
      <SkeletonRow width="38%" height={22} delay={0} />
      <SkeletonRow width="58%" height={13} delay={40} opacity={0.5} />
    </div>

    {/* Stat cards row */}
    <div className="grid grid-cols-3 gap-3 mb-7">
      {[0, 1, 2].map((i) =>
    <div key={i} className="skeleton-block rounded-xl h-20" style={{ animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${80 + i * 50}ms both` }} />
    )}
    </div>

    {/* Chart block */}
    <div className="skeleton-block rounded-2xl mb-6" style={{ height: 180, animation: 'wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out 230ms both' }} />

    {/* Text lines */}
    <div className="flex flex-col gap-2.5 mb-6">
      {[{ w: '91%', d: 310 }, { w: '76%', d: 350 }, { w: '83%', d: 390 }, { w: '55%', d: 430, op: 0.5 }].map((r, i) =>
    <SkeletonRow key={i} width={r.w} height={13} delay={r.d} opacity={r.op || 1} />
    )}
    </div>

    {/* Bottom grid */}
    <div className="grid grid-cols-2 gap-3">
      {[0, 1].map((i) =>
    <div key={i} className="skeleton-block rounded-2xl h-28" style={{ animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${470 + i * 60}ms both` }} />
    )}
    </div>
  </div>;


// Add skeleton component for chat loading
const ChatLoadingSkeleton = () =>
<div className="flex-1 flex flex-col justify-end p-6 space-y-6">
    <div className="space-y-4 max-w-2xl mx-auto w-full">
      {[0, 1, 2].map((i) =>
    <div key={i} className="flex justify-start">
          <div
        style={{
          width: `${70 + i * 10}%`,
          height: 60,
          borderRadius: 20,
          background: 'linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)',
          backgroundSize: '600px 100%',
          animation: `wok-shimmer 1.4s ease-out infinite, wok-slide-in 200ms ease-out ${i * 100}ms both`
        }} />
      
        </div>
    )}
    </div>
  </div>;


const SidebarLoadingSkeleton = () =>
<div className="px-4 space-y-2 mt-6">
    {[0, 1, 2, 3, 4].map((i) =>
  <div
    key={i}
    style={{
      width: '100%',
      height: 40,
      borderRadius: 8,
      background: 'linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)',
      backgroundSize: '600px 100%',
      animation: `wok-shimmer 1.4s ease-out infinite, wok-slide-in 200ms ease-out ${i * 80}ms both`
    }} />

  )}
  </div>;



// ============================================================================
// ► 5. MAIN COMPONENT: ChatPage
// ============================================================================
export default function ChatPage() {

  // ────────────────────────────────────────────────────────────────────────
  //   5.1 ROUTING & URL PARAMS
  // ────────────────────────────────────────────────────────────────────────
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialQ = urlParams.get('q') || '';
  const conversationId = urlParams.get('conversationId') || null;
  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  // ────────────────────────────────────────────────────────────────────────
  //   5.2 STATE INITIALIZATION
  // ────────────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [projectNumber, setProjectNumber] = useState(null);
  const [iframeRefreshKey, setIframeRefreshKey] = useState(0);

  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('wok_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'My Workspace', current: true }];
  });
  const currentWorkspace = workspaces.find((w) => w.current) || workspaces[0];

  const [discussions, setDiscussions] = useState(() => getLocalDiscussions(currentWorkspace.id) || []);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const [appearance, setAppearance] = useState({ theme: 'wok_clean', font: 'Inter', edges: 'soft' });
  const [viewMode, setViewMode] = useState('preview');
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

  // Main container size (fixed, no resizing)
  const [containerSize, setContainerSize] = useState({ width: 96, height: 94 });
  const containerRef = useRef(null);

  const [customSlug, setCustomSlug] = useState(convId || `conv_${Date.now().toString().slice(-6)}`);

  const [appSettings, setAppSettings] = useState({
    title: 'AI-Powered Interface',
    description: 'A highly optimized interactive experience built with Wok.',
    isPublic: true,
    showBadge: true
  });

  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState('chat');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(null); // 'settings' | 'pricing' | 'docs' | 'support'
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isAppPublished, setIsAppPublished] = useState(false);

  const [runtimeError, setRuntimeError] = useState(null);
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const [messages, setMessages] = useState(() => {
    const initial = conversationId ? getConversationMessages(conversationId) : [];
    return Array.isArray(initial) ? initial : [];
  });

  const [isLoadingConversation, setIsLoadingConversation] = useState(() => !!conversationId && (getConversationMessages(conversationId)?.length || 0) === 0);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [ficheContent, setFicheContent] = useState(null);
  const [discussMode, setDiscussMode] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [iframeModal, setIframeModal] = useState({ open: false, url: '' });

  // ────────────────────────────────────────────────────────────────────────
  //   5.3 REFS & HELPERS
  // ────────────────────────────────────────────────────────────────────────
  const profileMenuRef = useRef(null);
  const workspaceRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const abortedRef = useRef(false);

  const hasStarted = (messages?.length || 0) > 0 || isLoading;


  // ────────────────────────────────────────────────────────────────────────
  //   5.4 WORKSPACE & DISCUSSION HANDLERS
  // ────────────────────────────────────────────────────────────────────────
  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim().length < 3) {toast.error("Workspace name must be at least 3 characters.");return;}
    if (workspaces.length >= 4) {toast.error("Maximum limit of 4 workspaces reached.");return;}
    const newWs = { id: `ws_${Date.now()}`, name: newWorkspaceName.trim(), current: true };
    const updated = workspaces.map((w) => ({ ...w, current: false })).concat(newWs);
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    setDiscussions([]);
    setShowWorkspaceModal(false);
    setNewWorkspaceName('');
    navigate('/app');
    toast.success("Workspace created.");
  };

  const handleSwitchWorkspace = (id) => {
    const updated = workspaces.map((w) => ({ ...w, current: w.id === id }));
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    setDiscussions(getLocalDiscussions(id) || []);
    setShowWorkspaceSwitcher(false);
    navigate('/app');
  };

  const updateDiscussion = (id, updates) => {
    const updated = discussions.map((d) => d.id === id ? { ...d, ...updates } : d);
    setDiscussions(updated);
    saveLocalDiscussions(currentWorkspace.id, updated);
  };

  const deleteDiscussion = (e, id) => {
    e.stopPropagation();
    const updated = discussions.filter((d) => d.id !== id);
    setDiscussions(updated);
    saveLocalDiscussions(currentWorkspace.id, updated);
    if (conversationId === id) navigate('/');
  };

  const startEditing = (e, d) => {e.stopPropagation();setEditingId(d.id);setEditTitle(d.title || d.preview || 'New Chat');};
  const saveEdit = (id) => {if (editTitle.trim()) updateDiscussion(id, { title: editTitle.trim() });setEditingId(null);};

  const handleDrop = (idx) => {
    if (draggedItemIdx === null || draggedItemIdx === idx) return;
    const newDiscussions = [...discussions];
    const [draggedItem] = newDiscussions.splice(draggedItemIdx, 1);
    newDiscussions.splice(idx, 0, draggedItem);
    setDiscussions(newDiscussions);
    saveLocalDiscussions(currentWorkspace.id, newDiscussions);
    setDraggedItemIdx(null);setDragOverIdx(null);
  };

  const saveToDiscussionsLogic = (convTitle, text) => {
    try {
      const stored = getLocalDiscussions(currentWorkspace.id);
      const disc = { id: convId, title: convTitle, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), emoji: '📄' };
      const idx = stored.findIndex((d) => d.id === convId);
      if (idx >= 0) stored.splice(idx, 1);
      stored.unshift(disc);
      saveLocalDiscussions(currentWorkspace.id, stored);
      setDiscussions(stored);
      
      // ALWAYS sync to cloud immediately
      import('@/lib/discussions').then(({ syncConversationToCloud }) => {
        syncConversationToCloud(convId, messages || [], { title: convTitle, preview: text });
      });
    } catch (err) {
      console.error('Save to cloud failed:', err);
    }
  };

  const handleUpdateCredits = async (cost) => {
    if (!user) return;
    const newUsed = (user.credits_used || 0) + cost;
    await base44.entities.User.update(user.id, { credits_used: newUsed });
    setUser((prev) => ({ ...prev, credits_used: newUsed }));
  };


  // ────────────────────────────────────────────────────────────────────────
  //   5.5 CORE CHAT LOGIC
  // ────────────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text, options = {}) => {
    if (!text?.trim() && !options.files?.length || isLoading) return;

    // ── Easter egg: date 16/06/2010 triggers chocolatine ──
    if (text.trim() === '16/06/2010') {
      const userMsg = { role: 'user', content: text };
      const newMessages = [...(messages || []), userMsg];
      setMessages(newMessages);
      setCurrentQuery(text);
      setInput('');
      setFiles([]);
      setIsLoading(true);
      abortedRef.current = false;
      
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 20000);
        const check = setInterval(() => {if (abortedRef.current) {clearTimeout(timer);clearInterval(check);resolve();}}, 200);
      });
      
      if (abortedRef.current) return;
      await handleUpdateCredits(1);
      const chatMsg = "🥐 Analyse complète générée. Débat résolu définitivement.";
      const finalMsgs = [...newMessages, { role: 'assistant', content: chatMsg, rawContent: CHOCOLATINE_CODE }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);
      setFicheContent(CHOCOLATINE_CODE);
      
      if (convId) {
        const { syncConversationToCloud } = await import('@/lib/discussions');
        await syncConversationToCloud(convId, finalMsgs, {
          title: 'Chocolatine vs Pain au Chocolat',
          preview: 'Le débat ultime',
          is_public: true
        });
        if (!conversationId) window.history.replaceState(null, '', `/chat?conversationId=${convId}`);
      }
      setIsLoading(false);
      return;
    }

    const imageUrls = (options.files || files || []).
    filter((f) => f.type?.startsWith('image/')).
    map((f) => f.url);

    const userMsg = { role: 'user', content: text, images: imageUrls.length > 0 ? imageUrls : undefined };
    const newMessages = [...(messages || []), userMsg];
    setMessages(newMessages);
    setCurrentQuery(text);
    setInput('');
    setFiles([]);
    setIsLoading(true);
    abortedRef.current = false;

    try {
      if (options.isCorrection) {
        const bt = String.fromCharCode(96);
        let codeToFix = ficheContent || "";
        let codeMatch = null;
        const startIdx = codeToFix.indexOf(`${bt}${bt}${bt}`);
        const endIdx = codeToFix.lastIndexOf(`${bt}${bt}${bt}`);

        if (startIdx !== -1 && endIdx !== -1 && startIdx !== endIdx) {
          codeMatch = codeToFix.substring(startIdx, endIdx + 3);
          codeToFix = codeMatch;
        }

        const fixPayload = {
          prompt: PROMPT_AUTO_FIX + "\n\nError reported:\n" + options.rawError + "\n\nCode to fix:\n" + codeToFix,
          model: 'gemini_3_flash'
        };

        const fixResult = await cachedAIRequest(fixPayload, () =>
          base44.integrations.Core.InvokeLLM({ ...fixPayload, signal: options.signal })
        );

        if (abortedRef.current) return;
        const fixedCodeBlock = typeof fixResult === 'string' ? fixResult : JSON.stringify(fixResult);

        let newContent = ficheContent;
        if (codeMatch) {
          let finalFixedCode = fixedCodeBlock;
          if (!finalFixedCode.includes(bt)) finalFixedCode = `${bt}${bt}${bt}jsx\n${finalFixedCode}\n${bt}${bt}${bt}`;
          newContent = ficheContent.replace(codeMatch, finalFixedCode);
        } else {
          newContent = fixedCodeBlock;
        }

        await handleUpdateCredits(0);
        setIsLoading(false);
        setFicheContent(newContent);

        const chatDisplayContent = "✨ Architecture successfully recompiled.";
        const finalMsgs = [...newMessages, { role: 'assistant', content: chatDisplayContent, rawContent: newContent }];
        setMessages(finalMsgs);
        saveConversationMessages(convId, finalMsgs);
        
        const { syncConversationToCloud } = await import('@/lib/discussions');
        await syncConversationToCloud(convId, finalMsgs, { title: 'Error fix', preview: 'Code fixed' });
        
        return;
      }

      const MODIFY_KEYWORDS = /\b(change|fix|update|add|remove|improve|make|adjust|edit|modify|replace|rename|move|resize|color|style|font|align|center|delete|show|hide|increase|decrease|bigger|smaller|darker|lighter)\b/i;
      let isModification = editMode && ficheContent ?
      true :
      ficheContent ?
      MODIFY_KEYWORDS.test(text) :
      false;

      const architectPrompt = isModification ?
      PROMPT_ARCHITECT + "\n\n[MODIFICATION REQUEST — update the existing code, return the full updated component]\n\nExisting code:\n" + ficheContent + "\n\nUser request: " + text :
      PROMPT_ARCHITECT + "\n\n[BUILD THIS INTO A $10K UI]: " + text;

      const codePayload = {
        prompt: architectPrompt,
        model: 'gemini_3_flash'
      };
      
      const codeResult = await cachedAIRequest(codePayload, () =>
        base44.integrations.Core.InvokeLLM({ ...codePayload, signal: options.signal })
      );

      const isDataQuery = /\b(data|insight|analytics|metric|kpi|performance|trend|growth|revenue|user|conversion)\b/i.test(text);
      let formattedInsight = null;
      
      if (isDataQuery && !isModification) {
        // Safe mapping to prevent slice on undefined
        const insightPrompt = PROMPT_DATA_INSIGHT + "\n\nUser query: " + text + "\n\nContext: " + ((messages || []).slice(-3).map(m => m.content).join(' '));
        const insightPayload = {
          prompt: insightPrompt,
          model: 'gemini_3_flash'
        };
        const insightResult = await cachedAIRequest(insightPayload, () =>
          base44.integrations.Core.InvokeLLM({ ...insightPayload, signal: options.signal })
        );
        formattedInsight = typeof insightResult === 'string' ? insightResult : JSON.stringify(insightResult);
      }

      if (abortedRef.current) return;
      let finalCode = typeof codeResult === 'string' ? codeResult : JSON.stringify(codeResult);

      const bt = String.fromCharCode(96);
      if (!finalCode.includes(bt)) {
        finalCode = `${bt}${bt}${bt}jsx\n${finalCode}\n${bt}${bt}${bt}`;
      }

      const rawContent = finalCode;
      let chatDisplayContent = finalCode;

      const codeBlockRegex = new RegExp(`${bt}{3}(?:jsx|javascript|react)?\\n([\\s\\S]*?)${bt}{3}`, 'gi');
      if (chatDisplayContent.match(codeBlockRegex)) {
        chatDisplayContent = chatDisplayContent.replace(codeBlockRegex, '');
        if (chatDisplayContent.trim() === '') {
          chatDisplayContent = "✨ Architecture generated successfully.";
        }
      }

      const creditsLimit = userPlan?.credits_limit || user?.credits_limit || 10;
      const creditsUsed = user?.credits_used || 0;
      const avgMonthly = creditsLimit; 
      const multiplier = creditsUsed >= avgMonthly * 2 ? 2 : 1;
      const cost = multiplier;
      await handleUpdateCredits(cost);

      if (!isModification && !discussMode && user) {
        const newCount = (user.project_count || 0) + 1;
        setProjectNumber(newCount);
        base44.entities.User.update(user.id, { project_count: newCount }).catch(() => {});
        setUser((prev) => ({ ...prev, project_count: newCount }));
      }

      setIsLoading(false);
      if (!discussMode) setFicheContent(rawContent);

      const finalContent = formattedInsight ? chatDisplayContent + '\n\n' + formattedInsight : chatDisplayContent;
      const finalMsgs = [...newMessages, { role: 'assistant', content: finalContent, rawContent: rawContent }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);
      
      const { syncConversationToCloud } = await import('@/lib/discussions');
      syncConversationToCloud(convId, finalMsgs, {
        title: text.slice(0, 80),
        preview: text.slice(0, 120),
        is_public: appSettings.isPublic
      });
      
      saveToDiscussionsLogic("New Chat", text);
      
      if (!conversationId) {
        window.history.replaceState(null, '', `/chat?conversationId=${convId}`);
      }

      if (window.innerWidth < 768 && !discussMode) {
        setMobileView('preview');
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted by user');
        return;
      }
      setIsLoading(false);
      setMessages([...newMessages, { role: 'assistant', content: "System architecture failed." }]);
      return;
    }
  }, [messages, isLoading, discussMode, currentWorkspace, user, ficheContent]);

  const handleStop = useCallback(() => {
    abortedRef.current = true;setIsLoading(false);
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), { role: 'assistant', content: 'Stopped.' }]);
  }, []);

  const handleReload = () => {
    const lastUserMsg = [...(messages || [])].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      const filteredMsgs = messages.slice(0, messages.lastIndexOf(lastUserMsg));
      setMessages(filteredMsgs);
      sendMessage(lastUserMsg.content);
    }
  };


  // ────────────────────────────────────────────────────────────────────────
  //   5.6 APP SETTINGS & META LOGIC
  // ────────────────────────────────────────────────────────────────────────
  const handleUpdateAppMeta = async (newSettings) => {
    setAppSettings(newSettings);
    if (convId) {
      await safeAsync(async () => {
        await base44.entities.Conversation.update(convId, {
          title: newSettings.title,
          is_public: newSettings.isPublic
        });
        const { syncConversationToCloud } = await import('@/lib/discussions');
        await syncConversationToCloud(convId, messages || [], newSettings);
      }, null, 'Update app meta');
    }
    toast.success("Settings updated successfully.");
  };

  const handleCloneApp = async () => {
    const newConvId = `conv_${Date.now()}`;
    saveConversationMessages(newConvId, messages);
    
    await safeAsync(async () => {
      const { syncConversationToCloud } = await import('@/lib/discussions');
      await syncConversationToCloud(newConvId, messages || [], {
        title: appSettings.title + ' (Copy)',
        preview: appSettings.description,
        is_public: false
      });
    }, null, 'Clone conversation');
    
    toast.success("Application cloned. New URL generated.");
    navigate(`/chat?conversationId=${newConvId}`);
  };

  const handleUnpublishApp = async () => {
    const newSettings = { ...appSettings, isPublic: false };
    setAppSettings(newSettings);
    if (convId) {
      await safeAsync(async () => {
        await base44.entities.Conversation.update(convId, { is_public: false });
        const { syncConversationToCloud } = await import('@/lib/discussions');
        await syncConversationToCloud(convId, messages || [], newSettings);
      }, null, 'Unpublish app');
    }
    toast.success("Application unpublished.");
  };

  const handleDeleteApp = async () => {
    deleteDiscussion({ stopPropagation: () => {} }, convId);
    
    if (convId) {
      await safeAsync(async () => {
        const results = await base44.entities.Conversation.filter({ conv_id: convId });
        if (results.length > 0) {
          await base44.entities.Conversation.delete(results[0].id);
        }
      }, null, 'Delete conversation');
    }
    
    toast.success("Application deleted permanently.");
  };


  // ────────────────────────────────────────────────────────────────────────
  //   5.7 LIFECYCLES (USE_EFFECTS)
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileMenuOpen(false);
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) setShowWorkspaceSwitcher(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Never auto-redirect on F5 refresh — only navigate away if user explicitly deletes
  // (removed the effect that was causing unwanted redirects)

  useEffect(() => {
    const initAuth = async () => {
      await safeAsync(() => initAgentsFromDB(), null, 'Init agents');
      const user = await safeAsync(() => base44.auth.me(), null, 'Fetch user');
      
      if (user) {
        setUser(user);
        if (user.id) setCurrentUser(user.id);
        setUserPlan(getUserPlan(user));
        setProjectNumber(user.project_count || 0);
      }
    };
    
    initAuth();
  }, [conversationId]);

  useEffect(() => {
    if (initialQ && (messages?.length || 0) === 0 && !conversationId) sendMessage(initialQ);
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setFicheContent(null);
      return;
    }
    
    const loadConv = async () => {
      const cloudMsgs = await safeAsync(
        () => loadConversationFromCloud(conversationId),
        [],
        'Load conversation'
      );
      
      const safeCloudMsgs = Array.isArray(cloudMsgs) ? cloudMsgs : [];
      if (safeCloudMsgs.length > 0) {
        setMessages(safeCloudMsgs);
        saveConversationMessages(conversationId, safeCloudMsgs);
        const lastAssistantMsg = safeCloudMsgs.filter((m) => m.role === 'assistant').pop();
        setFicheContent(lastAssistantMsg?.rawContent || lastAssistantMsg?.content || null);
      }
      setIsLoadingConversation(false);
    };
    
    loadConv();
  }, [conversationId]);

  useEffect(() => {messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });}, [messages]);

  {/* Removed complex resize system */}

  // ── Global keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (viewMode !== 'code') {
          toast.info('Auto-save active — changes sync continuously');
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (hasStarted) setIsPreviewCollapsed((prev) => !prev);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.focus();
      }

      if (e.key === 'Escape') {
        if (isPreviewCollapsed && hasStarted) {
          setIsPreviewCollapsed(false);
        }
        if (fullscreenModal) {
          setFullscreenModal(null);
        }
        if (showPublishModal) {
          setShowPublishModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, hasStarted, isPreviewCollapsed, fullscreenModal, showPublishModal]);

  const [pendingError, setPendingError] = useState(null);

  useEffect(() => {
    if (runtimeError && !isLoading) {
      setPendingError(runtimeError);
      setRuntimeError(null);
    }
  }, [runtimeError, isLoading]);

  const handleFixError = () => {
    if (!pendingError) return;
    const savedError = pendingError;
    setPendingError(null);
    const bt = String.fromCharCode(96);
    const promptMsg = `The following errors happened in the app:\n\n${bt}${bt}${bt}\n${savedError}\n${bt}${bt}${bt}\n\nPlease help me fix these errors.`;
    sendMessage(promptMsg, { isCorrection: true, rawError: savedError });
  };

  const navItems = [
  { icon: Home, label: 'Home', path: '/app', active: location.pathname === '/app' },
  { icon: MessageSquare, label: 'Discussions', path: '/discussions', active: location.pathname === '/discussions' },
  { icon: Cpu, label: 'DNA Wok', path: '/ai-dna', active: location.pathname === '/ai-dna' }];


  {/* Removed resize handlers - simplified interface */}


  // ────────────────────────────────────────────────────────────────────────
  //   5.8 RENDER (JSX)
  // ────────────────────────────────────────────────────────────────────────

  const SUGGESTIONS = ['Add 3D Model Viewer', 'Interactive Part Highlighting', 'Build Customizable Options'];
  const CARD_RADIUS = 16;

  return (
    /* ═══════════════════════════════════════════════════════════════
       OUTER CANVAS — dot-grid white background, full viewport
    ═══════════════════════════════════════════════════════════════ */
    <div
      className="flex items-center justify-center w-screen h-screen font-sans antialiased overflow-hidden"
      style={{
        backgroundColor: '#FAFAFA',
        backgroundImage: 'radial-gradient(circle, #E8D5E8 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        scrollbarWidth: 'none'
      }}>
      
      <style>{`html, body { scrollbar-width: none; -ms-overflow-style: none; } html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }`}</style>
      {/* Wok header - fixed to viewport, not canvas */}
      <div style={{ position: 'fixed', top: '4px', left: '4px', zIndex: 99999 }}>
        {/* Merged clickable area: Wok text + chevron as single button */}
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-1 hover:bg-zinc-100 rounded-lg transition-colors p-1.5"
          style={{ pointerEvents: 'auto' }}>
          
          {/* Wok text */}
          <span className="text-sm font-bold text-zinc-900">Wok</span>

          {/* Chevron icon - smaller and closer */}
          <svg
            className="w-3.5 h-3.5 text-zinc-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}>
            
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Small dropdown menu */}
        {isProfileMenuOpen &&
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-zinc-200 overflow-hidden w-56 z-[100000]">
            <div className="p-2.5 space-y-1">
              {/* Home */}
              <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                navigate('/app');
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#F7F7F8] rounded transition-colors text-left group">
              
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
                  <span className="text-[13px] font-normal text-[#1A1A1A]">Home</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#666666] transition-colors" />
              </button>

              {/* Credits Bar */}
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
                    <span className="text-[13px] font-normal text-[#1A1A1A]">Credits</span>
                  </div>
                  <span className="text-[11px] font-normal text-[#666666]">{user?.credits_used || 0}/{userPlan?.credits_limit || user?.credits_limit || 10}</span>
                </div>
                <div className="h-1 bg-[#F0F0F0] rounded-full overflow-hidden ml-6">
                  <div
                  className="h-full bg-[#1A1A1A] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (user?.credits_used || 0) / (userPlan?.credits_limit || user?.credits_limit || 10) * 100)}%` }} />
                
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#E5E5E5] my-1" />

              {/* Settings - opens modal */}
              <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                setFullscreenModal('settings');
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#F7F7F8] rounded transition-colors text-left group">
              
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
                  <span className="text-[13px] font-normal text-[#1A1A1A]">Settings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#666666] transition-colors" />
              </button>

              {/* Upgrade Plan - opens modal */}
              <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                setFullscreenModal('pricing');
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#F7F7F8] rounded transition-colors text-left group">
              
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
                  <span className="text-[13px] font-normal text-[#1A1A1A]">Upgrade your plan</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#666666] transition-colors" />
              </button>

              {/* Documentation - opens modal */}
              <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                setFullscreenModal('docs');
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#F7F7F8] rounded transition-colors text-left group">
              
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
                  <span className="text-[13px] font-normal text-[#1A1A1A]">Documentation</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#666666] transition-colors" />
              </button>

              {/* Support - opens modal */}
              <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                setFullscreenModal('support');
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#F7F7F8] rounded transition-colors text-left group">
              
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
                  <span className="text-[13px] font-normal text-[#1A1A1A]">Support</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#666666] transition-colors" />
              </button>
            </div>
          </div>
        }
      </div>

      {/* Modals */}
      <ProModal open={showWorkspaceModal} onClose={() => setShowWorkspaceModal(false)} title="Create a workspace" subtitle="Start collaborating with your workspace members" actionText="Create workspace" onAction={handleCreateWorkspace}>
        <label className="text-[12px] font-semibold mb-1.5 block">Workspace name *</label>
        <input type="text" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)} placeholder="Choose a name..." className="w-full border rounded-md px-3 py-2 text-[13px] focus:outline-none mb-4" autoFocus />
      </ProModal>
      <ProModal open={showCodeModal} onClose={() => setShowCodeModal(false)} title="Redeem Code" actionText="Apply" onAction={() => setShowCodeModal(false)}>
        <input type="text" placeholder="XXXX-XXXX-XXXX" className="w-full border rounded-md px-3 py-2 text-[13px] focus:outline-none" />
      </ProModal>
      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />
      <ChatWorkspaceSidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} user={user} convId={conversationId || convId} hidden={!!fullscreenModal} />
      
      {/* Fullscreen modal for Settings/Pricing/Docs/Support - hides sidebar */}
      <AnimatePresence>
      {fullscreenModal &&
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[99998]"
          style={{ background: 'rgba(0, 0, 0, 0.45)' }}
          onClick={() => setFullscreenModal(null)}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
          <div
            className="relative w-[95vw] max-w-[1100px] h-[95vh] bg-white rounded-lg overflow-hidden flex flex-col pointer-events-auto"
            style={{ borderRadius: '12px' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setFullscreenModal(null)} className="absolute top-4 right-4 z-[100001] p-0 hover:bg-[#F7F7F8] rounded transition-colors" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2} style={{ pointerEvents: 'none' }} />
            </button>
            <iframe
            src={
            fullscreenModal === 'settings' ? '/settings' :
            fullscreenModal === 'pricing' ? '/pricing' :
            fullscreenModal === 'docs' ? '/about:blank' :
            fullscreenModal === 'support' ? '/support' : '#'
            }
            className="flex-1 w-full h-full border-none bg-white"
            title={fullscreenModal}
            style={{ colorScheme: 'light' }} />
          </div>
        </motion.div>
      </>
      }
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
             MAIN CARD — dynamic resizable container (iOS 26 style)
           ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        ref={containerRef}
        className="flex overflow-hidden relative"
        animate={{
          width: `${containerSize.width}vw`,
          height: `${containerSize.height}vh`,
          borderRadius: CARD_RADIUS
        }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          background: 'transparent',
          border: '0.5px solid rgba(255, 255, 255, 0.6)',
          maxWidth: '100vw',
          maxHeight: '100vh',
        }}>
        
        <PanelGroup direction="horizontal" className="flex w-full h-full">
          {/* ═══════════════════════════
                  LEFT PANEL — chat
               ═══════════════════════════ */}
          <Panel
            defaultSize={32}
            className="flex flex-col overflow-hidden bg-white">
            


          {/* MESSAGES SCROLL AREA */}
          <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto flex flex-col"
              style={{ padding: '4px 0 0 0' }}>
              
            <div className="flex flex-col gap-3 px-4 pb-2">
              {messages?.map((msg, idx) =>
                <div key={idx}>
                  {msg.role === 'assistant' ?
                  <AssistantMessage
                    content={msg.content}
                    isGenerating={false}
                    query={msg.content}
                    rawContent={msg.rawContent}
                    onPreviewClick={() => {if (msg.rawContent) {setFicheContent(msg.rawContent);setViewMode('preview');}}} /> :

                  <CustomUserMessageBubble msg={msg} />}
                </div>
                )}
              {isLoading && <AssistantMessage content={null} isGenerating={true} query={currentQuery} />}
            </div>

            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* SUGGESTIONS — permanently fixed at bottom, above input */}
          <div className="flex-shrink-0 px-4 py-3 bg-white">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <svg width="13" height="14" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: 12, color: '#999999', fontWeight: 500 }}>Suggestions</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map((s) =>
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  style={{
                    fontSize: 12, color: '#555555', background: '#F8F8F8',
                    border: '1px solid #E8E8E8', borderRadius: 999,
                    padding: '6px 12px', cursor: 'pointer', lineHeight: 1.4,
                    transition: 'all 150ms'
                  }}
                  onMouseEnter={(e) => {e.currentTarget.style.background = '#F0F0F0';e.currentTarget.style.borderColor = '#D0D0D0';}}
                  onMouseLeave={(e) => {e.currentTarget.style.background = '#F8F8F8';e.currentTarget.style.borderColor = '#E8E8E8';}}>
                  
                  {s}
                </button>
                )}
            </div>
          </div>



          {/* INPUT ZONE */}
          <div className="flex-shrink-0">
            <ErrorNotification error={pendingError} onFix={handleFixError} onDismiss={() => setPendingError(null)} />
            <ChatInputBar
                input={input} setInput={setInput}
                onSend={sendMessage} onStop={handleStop}
                isLoading={isLoading}
                files={files} setFiles={setFiles}
                discussMode={discussMode} setDiscussMode={setDiscussMode}
                editMode={editMode} setEditMode={setEditMode} />
              
          </div>
          </Panel>



          {/* ═══════════════════════════════════════════════════════════
                  RIGHT PANEL — preview
               ═══════════════════════════════════════════════════════════ */}
          <Panel
            defaultSize={68}
            className="relative overflow-hidden bg-white">
            
          {/* Inset preview rect — ultra-thin border */}
          <div
              style={{
                position: 'absolute',
                inset: 16, /* <--- Retient sa taille maximale d'origine (16px partout) */
                borderRadius: Math.max(0, CARD_RADIUS - 4),
                overflow: 'hidden',
                background: '#FFFFFF',
                border: '0.25px solid rgba(229, 229, 229, 0.5)'
              }}>
              
            <EditModeOverlay active={editMode} onDisable={() => setEditMode(false)} />

            {/* 🔥 PUBLISH BUTTON & MODAL LOGIC 🔥 */}
            {ficheContent && (
              <div className="absolute top-3 right-3 z-[99999] pointer-events-auto flex flex-col items-end">
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="px-[18px] py-[6px] bg-white border-[2.5px] border-zinc-900 text-zinc-900 font-bold rounded-[12px] hover:bg-zinc-50 shadow-sm transition-colors text-[14px]"
                >
                  Publish
                </button>
                
                {/* Dynamically attached modal - No backdrop veiled, opens right below */}
                <PublishAppModal
                  open={showPublishModal}
                  onClose={() => setShowPublishModal(false)}
                  appUrl={`https://wok.base44.app/tools/${customSlug || convId}`}
                  isPublished={isAppPublished}
                  setIsPublished={setIsAppPublished}
                />
              </div>
            )}

            {/* (Le reste du code FichePanel, PreviewSkeleton, etc. reste identique ici) */}
            {ficheContent ?
              <FichePanel
                content={ficheContent}
              
                iframeRefreshKey={iframeRefreshKey}
                onError={setRuntimeError}
                onSuccess={() => setRuntimeError(null)}
                isPublic={false}
                viewMode={viewMode}
                setViewMode={setViewMode}
                appSettings={appSettings}
                onUpdateSettings={handleUpdateAppMeta}
                onClone={handleCloneApp}
                onDelete={handleDeleteApp}
                onUnpublish={handleUnpublishApp}
                customSlug={customSlug}
                onUpdateContent={setFicheContent} /> :

              isLoading && messages.length === 0 ?
              <PreviewLoadingFeature /> :
              isLoading ?
              <PreviewSkeleton /> :

              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 13, color: '#CCCCCC', fontFamily: 'Inter, sans-serif' }}>Preview</p>
              </div>
              }
          </div>
          </Panel>
        </PanelGroup>
        
        {/* Removed resize handle - simplified interface */}
      </motion.div>

      {/* Zoom Toggle - single button with 2 modes */}
      <ZoomToggle
        containerRef={containerRef}
        containerSize={containerSize}
        setContainerSize={setContainerSize}
      />

      {/* ══ MOBILE LAYOUT ══ */}
      <div className="fixed inset-0 flex md:hidden flex-col bg-white">
        <div className="flex px-3 py-2 border-b border-zinc-200 bg-white flex-shrink-0">
          <div className="flex bg-zinc-100 p-1 rounded-lg gap-0.5 w-full">
            <button onClick={() => setMobileView('chat')} className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${mobileView === 'chat' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>Chat</button>
            <button onClick={() => setMobileView('preview')} disabled={!ficheContent && !isLoading} className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${mobileView === 'preview' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'} ${!ficheContent && !isLoading ? 'opacity-30' : ''}`}>
              Preview {isLoading && mobileView !== 'preview' && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full ml-1 animate-pulse align-middle" />}
            </button>
          </div>
        </div>
        {mobileView === 'chat' &&
        <div className="flex flex-col flex-1 overflow-hidden bg-white">
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-3">
              {messages?.map((msg, idx) =>
            <div key={idx}>
                  {msg.role === 'assistant' ?
              <AssistantMessage content={msg.content} isGenerating={false} query={msg.content} rawContent={msg.rawContent} onPreviewClick={() => {if (msg.rawContent) {setFicheContent(msg.rawContent);setMobileView('preview');}}} /> :
              <CustomUserMessageBubble msg={msg} />}
                </div>
            )}
              {isLoading && <AssistantMessage content={null} isGenerating={true} query={currentQuery} />}
              <div ref={messagesEndRef} className="h-1" />
            </div>
            <div className="flex-shrink-0">
              <ErrorNotification error={pendingError} onFix={handleFixError} onDismiss={() => setPendingError(null)} />
              <ChatInputBar input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop} isLoading={isLoading} files={files} setFiles={setFiles} discussMode={discussMode} setDiscussMode={setDiscussMode} editMode={editMode} setEditMode={setEditMode} />
            </div>
          </div>
        }
        {mobileView === 'preview' &&
        <div className="flex-1 overflow-hidden relative bg-black">
            <EditModeOverlay active={editMode} onDisable={() => setEditMode(false)} />
            {ficheContent ? <FichePanel content={ficheContent} iframeRefreshKey={iframeRefreshKey} onError={setRuntimeError} onSuccess={() => setRuntimeError(null)} isPublic={false} viewMode={viewMode} setViewMode={setViewMode} appSettings={appSettings} onUpdateSettings={handleUpdateAppMeta} onClone={handleCloneApp} onDelete={handleDeleteApp} onUnpublish={handleUnpublishApp} customSlug={customSlug} onUpdateContent={setFicheContent} /> : null}
          </div>
        }
      </div>
    </div>);
}