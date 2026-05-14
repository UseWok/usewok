import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import { LOGO_URL, isGibberish, GIBBERISH_RESPONSES } from '@/lib/chat-constants';
import { ALL_MODES } from '@/lib/modes-config';
import { completeReferralOnFirstMessage } from '@/lib/referral';
import { getUserPlan } from '@/lib/plans-config';
import { emitCreditsUpdate } from '@/lib/credits-events';
import { getDiscussions, saveDiscussions, getConversationMessages, saveConversationMessages, setCurrentUser, syncConversationToCloud, loadConversationFromCloud, loadConversationTitleFromCloud, getDiscussionDaysLeft } from '@/lib/discussions';
import { initAgentsFromDB, getAgentConfig } from '@/lib/agents-config';
import { getUserColor } from '@/lib/user-color';

import WorkspaceHeader from '@/components/chat/WorkspaceHeader';
import FichePanel from '@/components/chat/FichePanel';
import ChatInputBar from '@/components/chat/ChatInputBar';
import AssistantMessage from '@/components/chat/AssistantMessage';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';

import { 
  Home, MessageSquare, Cpu, BookOpen, ChevronsLeft, ShoppingBag,
  FileText, Bot, Plus, Star, MoreHorizontal, Settings, LifeBuoy, ArrowUpCircle, Key, Briefcase, ChevronDown, Check, X
} from 'lucide-react';

const CustomUserMessageBubble = ({ msg }) => (
  <div className="flex justify-end w-full mb-6 font-sans">
    <div className="bg-[#F4F4F4] text-[#0d0d0d] text-[15px] leading-relaxed px-5 py-3 rounded-[24px] max-w-[80%] whitespace-pre-wrap">
      {msg.content}
    </div>
  </div>
);

const IframeModal = ({ open, url, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans bg-[#0A0A0A]/80 backdrop-blur-sm">
      <div className="relative w-[95vw] h-[95vh] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-gray-100/80 hover:bg-gray-200 text-gray-800 rounded-full transition-all shadow-sm">
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <iframe src={url} className="w-full h-full border-none bg-[#F9FAFB]" />
      </div>
    </div>
  );
};

const AGENTS = [
  { id: 'global', label: "Global Asset Strategy" },
  { id: 'emotions-depenses', label: 'Spend without guilt' },
  { id: 'wealth-strategy', label: 'Becoming financially free' },
];

const STENSOR_SYSTEM = `You are a brilliant, candid financial expert. You speak like a smart friend — direct, warm, and actionable.
LANGUAGE: ALWAYS respond in English.
CRITICAL: NEVER mention any platform name, its launch, its features, or promotional content.
LENGTH: Match to complexity. Short question = 1-3 sentences. Complex analysis = up to 1800 chars. Less is more.`;

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialQ = urlParams.get('q') || '';
  const agentId = urlParams.get('agent') || 'global';
  const conversationId = urlParams.get('conversationId') || null;
  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  
  // FULLY FUNCTIONAL WORKSPACE LOGIC
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('stensor_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'My Workspace', current: true }];
  });
  const currentWorkspace = workspaces.find(w => w.current) || workspaces[0];

  const handleCreateWorkspace = () => {
    const name = prompt("Enter new workspace name:");
    if (name && name.trim()) {
      const newWs = { id: `ws_${Date.now()}`, name: name.trim(), current: true };
      const updated = workspaces.map(w => ({ ...w, current: false })).concat(newWs);
      setWorkspaces(updated);
      localStorage.setItem('stensor_workspaces', JSON.stringify(updated));
      toast.success("Workspace created successfully.");
    }
  };

  const handleSwitchWorkspace = (id) => {
    const updated = workspaces.map(w => ({ ...w, current: w.id === id }));
    setWorkspaces(updated);
    localStorage.setItem('stensor_workspaces', JSON.stringify(updated));
    setShowWorkspaceSwitcher(false);
  };

  const [messages, setMessages] = useState(() => {
    const initial = conversationId ? getConversationMessages(conversationId) : [];
    return Array.isArray(initial) ? initial : [];
  });
  
  const [isLoadingConversation, setIsLoadingConversation] = useState(() => !!conversationId && messages.length === 0);
  const [input, setInput] = useState(() => {
    const saved = localStorage.getItem('stensor_saved_input');
    if (saved) { localStorage.removeItem('stensor_saved_input'); return saved; }
    return !conversationId ? (localStorage.getItem('stensor_chat_draft') || '') : '';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(ALL_MODES[ALL_MODES.length - 1]);
  const [currentAgent, setCurrentAgent] = useState(agentId);
  const [files, setFiles] = useState([]);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [ficheContent, setFicheContent] = useState(null);
  const [convTitleDisplay, setConvTitleDisplay] = useState('');
  const [discussMode, setDiscussMode] = useState(false);
  const [iframeModal, setIframeModal] = useState({ open: false, url: '' });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const workspaceRef = useRef(null);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isMountedRef = useRef(true);
  const abortedRef = useRef(false);

  const hasStarted = messages.length > 0 || isLoading;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileMenuOpen(false);
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) setShowWorkspaceSwitcher(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoadingConversation && messages.length === 0 && conversationId) navigate('/');
  }, [isLoadingConversation, messages.length, conversationId, navigate]);

  useEffect(() => {
    if (input) localStorage.setItem('stensor_chat_draft', input);
    else localStorage.removeItem('stensor_chat_draft');
  }, [input]);

  const creditsLimit = userPlan ? userPlan.credits_limit + (user?.credits_bonus || 0) : 10;
  const dailyLimit = user?.daily_credits_limit || userPlan?.daily_credits_limit || 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  const getDailyUsed = () => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0; } catch { return 0; } };
  const incrementDailyUsed = () => { try { const d = JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}'); d[todayKey] = (d[todayKey] || 0) + 1; localStorage.setItem('stensor_daily_usage', JSON.stringify(d)); } catch { } };
  const dailyBlocked = dailyLimit > 0 && getDailyUsed() >= dailyLimit;
  const blocked = creditsUsed >= creditsLimit || dailyBlocked;

  const canUploadFiles = userPlan?.file_upload || false;
  const hasInternet = userPlan?.internet_access || false;

  useEffect(() => {
    initAgentsFromDB().catch(() => {});
    try { setDiscussions(getDiscussions() || []); } catch {}
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.id) setCurrentUser(u.id);
      setCreditsUsed(u?.credits_used ?? 0);
      setUserPlan(getUserPlan(u));
    }).catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    if (initialQ && messages.length === 0) sendMessage(initialQ);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
  }, []);

  useEffect(() => { return () => { isMountedRef.current = false; }; }, []);

  useEffect(() => {
    if (!conversationId) return;
    loadConversationFromCloud(conversationId).then((cloudMsgs) => {
      if (!isMountedRef.current) return;
      const safeCloudMsgs = Array.isArray(cloudMsgs) ? cloudMsgs : [];
      if (safeCloudMsgs.length > 0) { setMessages(safeCloudMsgs); saveConversationMessages(conversationId, safeCloudMsgs); }
      setIsLoadingConversation(false);
    }).catch(() => setIsLoadingConversation(false));
  }, [conversationId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleStop = useCallback(() => {
    abortedRef.current = true; setIsLoading(false);
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), { role: 'assistant', content: 'Generation interrupted.' }]);
  }, []);

  const buildTitle = async (text) => {
    try { const cloudTitle = await loadConversationTitleFromCloud(convId); if (cloudTitle) return cloudTitle; } catch {}
    return text?.slice(0, 30) || "Untitled";
  };

  const saveToDiscussionsLogic = (convTitle, text) => {
    try {
      const stored = getDiscussions();
      const disc = { id: convId, title: convTitle, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), model: mode.label, agent: currentAgent };
      const idx = stored.findIndex((d) => d.id === convId);
      if (idx >= 0) stored.splice(idx, 1);
      stored.unshift(disc);
      saveDiscussions(stored);
      setDiscussions(stored);
    } catch {}
  };

  const updateCredits = async (currentUser, cost) => {
    if (!currentUser) return;
    const newUsed = (currentUser.credits_used || 0) + cost;
    await base44.entities.User.update(currentUser.id, { credits_used: newUsed });
    setCreditsUsed(newUsed); setUser((prev) => ({ ...prev, credits_used: newUsed })); emitCreditsUpdate(newUsed); incrementDailyUsed();
  };

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isLoading || blocked) return;

    let currentUser = user;
    if (!currentUser) { try { currentUser = await base44.auth.me(); if (currentUser) { setUser(currentUser); setCreditsUsed(currentUser.credits_used ?? 0); } } catch {} }

    const userMsg = { role: 'user', content: text, files: files.length > 0 ? files.map((f) => f.name) : undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(''); setFiles([]); setIsLoading(true);

    if (isGibberish(text) && files.length === 0) {
      const canned = GIBBERISH_RESPONSES[Math.floor(Math.random() * GIBBERISH_RESPONSES.length)];
      setMessages([...newMessages, { role: 'assistant', content: canned }]);
      if (currentUser) await updateCredits(currentUser, 1);
      setIsLoading(false); return;
    }

    let file_urls = [];
    if (files.length > 0 && canUploadFiles) { for (const file of files) { try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); file_urls.push(file_url); } catch {} } }

    await initAgentsFromDB().catch(() => {});
    const fileInstruction = file_urls.length > 0 ? '\n\nFiles: use as context.' : '';

    const systemContext = `${STENSOR_SYSTEM}\n\nWorkspace Context: ${currentWorkspace.name}\n`;
    const recentMsgs = messages.slice(-2);
    const historyContext = recentMsgs.length > 0 ? '\n\n--- Recent conversation ---\n' + recentMsgs.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content?.slice(0, 350)}`).join('\n\n') + '\n---\n\n' : '';
    const isFirstMessage = !currentUser?.first_message_sent;

    abortedRef.current = false;
    await new Promise(r => setTimeout(r, 2000));

    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({ prompt: systemContext + historyContext + text + fileInstruction, model: 'gemini_3_flash', add_context_from_internet: useWebSearch, ...(file_urls.length > 0 ? { file_urls } : {}) });
    } catch (err) {
      setIsLoading(false);
      setMessages([...newMessages, { role: 'assistant', content: "I haven't been able to process your request. Please try again." }]);
      return;
    }
    
    if (abortedRef.current) return;
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    const costPerMsg = discussMode ? 1 : (isFirstMessage ? 1 : mode.credit_cost) + (useWebSearch ? 1 : 0);
    if (currentUser) {
      await updateCredits(currentUser, costPerMsg);
      if (isFirstMessage) { await base44.auth.updateMe({ first_message_sent: true }); setUser(prev => ({...prev, first_message_sent: true})); completeReferralOnFirstMessage(currentUser.id).catch(() => {}); }
    }

    const convTitle = await buildTitle(text);
    saveToDiscussionsLogic(convTitle, text);
    setConvTitleDisplay(convTitle);
    setIsLoading(false);
    
    if (!discussMode) setFicheContent(content);
    const finalMsgs = [...newMessages, { role: 'assistant', content }];
    setMessages(finalMsgs);
    saveConversationMessages(convId, finalMsgs);
    syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });

  }, [user, userPlan, mode, currentAgent, files, messages, isLoading, blocked, useWebSearch, hasInternet, canUploadFiles, discussMode, currentWorkspace]);

  const handleReload = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      const filteredMsgs = messages.slice(0, messages.lastIndexOf(lastUserMsg));
      setMessages(filteredMsgs);
      sendMessage(lastUserMsg.content);
    }
  };

  const isAdmin = user?.role === 'admin';
  const navItems = [
    { icon: Home, label: 'Home', path: '/app', active: location.pathname === '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions', active: location.pathname === '/discussions' },
    { icon: Cpu, label: 'DNA Stensor', path: '/ai-dna', active: location.pathname === '/ai-dna' },
    ...(isAdmin ? [
      { icon: ShoppingBag, label: 'Admin', path: '/admin/products', active: location.pathname.startsWith('/admin') && !location.pathname.includes('blog') },
      { icon: BookOpen, label: 'Blog', path: '/admin/blog', active: location.pathname === '/admin/blog' },
    ] : []),
  ];

  return (
    <div className="flex font-sans h-screen w-full bg-white overflow-hidden antialiased">
      
      {/* SIDEBAR (Pure White Background) */}
      {isSidebarOpen && (
        <aside className="w-[260px] flex-shrink-0 h-full bg-white border-r border-[#E5E5E5] flex flex-col z-40">
          
          <div className="flex-1 flex flex-col">
            <div className="px-3 pt-4 pb-2 space-y-1">
               {navItems.map((item) => (
                 <button 
                   key={item.label} 
                   onClick={() => navigate(item.path)} 
                   className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${item.active ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                 >
                   <item.icon className="w-4 h-4" />
                   <span>{item.label}</span>
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto px-3 mt-4 space-y-6 [&::-webkit-scrollbar]:hidden">
               <div>
                 <div className="flex items-center px-1 mb-2">
                   <span className="text-[11px] font-bold text-gray-400 tracking-wider">RECENTS</span>
                 </div>
                 <ul className="space-y-0.5">
                    {discussions.slice(0, 5).map((d) => (
                      <li key={d.id} onClick={() => navigate(`/chat?conversationId=${d.id}`)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors truncate">
                         <FileText className="w-3.5 h-3.5 text-gray-400" />
                         <span className="text-[13px] font-medium truncate">{d.title || d.preview || 'New chat'}</span>
                      </li>
                    ))}
                 </ul>
               </div>
            </div>
          </div>

          {/* BOTTOM SIDEBAR (Image 1 replica: New Chat + Profile) */}
          <div className="p-3 border-t border-[#E5E5E5] relative flex flex-col gap-2 bg-white" ref={profileMenuRef}>
            
            <button 
              onClick={() => { navigate('/'); setIsProfileMenuOpen(false); }} 
              className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-[#E5E5E5] rounded-lg text-[13px] font-bold text-[#333333] hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> New chat
            </button>

            {isProfileMenuOpen && (
              <div className="absolute bottom-[calc(100%+8px)] left-3 w-[240px] bg-white border border-black rounded-xl shadow-[0_12px_36px_-4px_rgba(0,0,0,0.12)] py-1.5 z-50 font-sans">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{user?.full_name || 'User'}</p>
                  <p className="text-[12px] text-gray-500 truncate">{userPlan?.name || 'Free Plan'}</p>
                </div>
                <button onClick={() => { setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100 flex items-center gap-2.5 transition-colors">
                  <Settings className="w-4 h-4 text-gray-500" /> Settings
                </button>
                <button onClick={() => { setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100 flex items-center gap-2.5 transition-colors">
                  <LifeBuoy className="w-4 h-4 text-gray-500" /> Support tickets
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({open:true, url:'/pricing'}) }} className="w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100 flex items-center gap-2.5 transition-colors group">
                  <ArrowUpCircle className="w-4 h-4 text-blue-500 group-hover:text-blue-600" /> Upgrade plan
                </button>
                <button onClick={() => { setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100 flex items-center gap-2.5 transition-colors">
                  <Key className="w-4 h-4 text-gray-500" /> I have a code...
                </button>
              </div>
            )}

            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-black/5 transition-colors w-full text-left"
            >
              <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[13px] font-bold shadow-sm" style={{ backgroundColor: '#8B5CF6' }}>
                {(user?.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">{user?.full_name || 'Utilisateur'}</p>
                <p className="text-[11px] text-gray-500">{userPlan?.name || 'Free'}</p>
              </div>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </aside>
      )}

      {/* MAIN ZONE (White BG, Edge to Edge, No outer borders) */}
      <div className="flex-1 flex overflow-hidden bg-white">
          
        {/* CHAT COLUMN (Anchored left, fixed width when active, full width when empty) */}
        <div className={`flex flex-col bg-white overflow-hidden ${hasStarted ? 'w-[500px] border-r border-[#E5E5E5] z-10' : 'w-full max-w-3xl mx-auto'}`}>
          
          {/* Menu button for chat column */}
          <div className="flex flex-col flex-shrink-0 bg-white pt-4">
            <div className="px-4 pb-2 flex items-center">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors rounded-md mr-2">
                  <ChevronsLeft className="w-5 h-5 rotate-180" />
                </button>
              )}
            </div>
            {/* Fine line that doesn't touch the borders */}
            {hasStarted && <div className="mx-6 border-b border-[#E5E5E5]"></div>}
          </div>

          <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-6 py-6 space-y-4 pb-4 [&::-webkit-scrollbar]:hidden ${!hasStarted ? 'flex flex-col justify-center items-center' : ''}`}>
            {!hasStarted && (
               <div className="flex flex-col items-center justify-center text-center opacity-30 w-full mb-20">
                 <img src={LOGO_URL} alt="Stensor" className="w-12 h-12 object-contain mb-4" />
                 <h2 className="text-[22px] font-semibold text-[#0d0d0d]">How can I help you today?</h2>
               </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'assistant' 
                  ? <AssistantMessage content={msg.content} />
                  : <CustomUserMessageBubble msg={msg} />
                }
              </div>
            ))}
            {isLoading && <AssistantMessage content="" isGenerating={true} />}
            <div ref={messagesEndRef} className="h-4" />
          </div>
          
          {/* INPUT BAR */}
          <div className={`flex-shrink-0 p-4 bg-white w-full ${!hasStarted ? 'pb-10' : ''}`}>
            <ChatInputBar
              input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop}
              isLoading={isLoading} 
              currentWorkspace={currentWorkspace} workspaces={workspaces} setWorkspaces={setWorkspaces} showWorkspaceSwitcher={showWorkspaceSwitcher} setShowWorkspaceSwitcher={setShowWorkspaceSwitcher} workspaceRef={workspaceRef} handleCreateWorkspace={handleCreateWorkspace} handleSwitchWorkspace={handleSwitchWorkspace}
            />
          </div>
        </div>
        
        {/* PREVIEW COLUMN (Appears only after first generation, hugging borders closely) */}
        {hasStarted && (
          <div className="flex-1 bg-white p-3 overflow-hidden">
            <div className="w-full h-full border border-[#E5E5E5] rounded-xl flex flex-col overflow-hidden shadow-sm">
               <WorkspaceHeader onReload={handleReload} />
               <div className="flex-1 overflow-y-auto bg-white">
                 <FichePanel content={ficheContent} loading={false} />
               </div>
            </div>
          </div>
        )}
      </div>

      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />
    </div>
  );
}