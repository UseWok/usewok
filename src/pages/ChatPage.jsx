import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import { LOGO_URL, isGibberish, GIBBERISH_RESPONSES } from '@/lib/chat-constants';
import { ALL_MODES } from '@/lib/modes-config';
import { completeReferralOnFirstMessage } from '@/lib/referral';
import { getUserPlan } from '@/lib/plans-config';
import { getConversationMessages, saveConversationMessages, setCurrentUser, loadConversationFromCloud, loadConversationTitleFromCloud } from '@/lib/discussions';
import { initAgentsFromDB } from '@/lib/agents-config';
import { getUserColor } from '@/lib/user-color';

import WorkspaceHeader from '@/components/chat/WorkspaceHeader';
import FichePanel from '@/components/chat/FichePanel';
import ChatInputBar from '@/components/chat/ChatInputBar';
import AssistantMessage from '@/components/chat/AssistantMessage';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';

import { 
  Home, MessageSquare, Cpu, BookOpen, PanelLeftClose, PanelLeft,
  FileText, Bot, Plus, Settings, LifeBuoy, ArrowUpCircle, Key, Briefcase, ChevronDown, Check, X, MoreHorizontal, Edit2, Trash2
} from 'lucide-react';

const CustomUserMessageBubble = ({ msg }) => (
  <div className="flex justify-end w-full mb-6 font-sans">
    <div className="bg-[#F4F4F4] text-[#0d0d0d] text-[15px] leading-relaxed px-4 py-3 rounded-md max-w-[85%] whitespace-pre-wrap border border-[#E5E5E5]">
      {msg.content}
    </div>
  </div>
);

// PRO MODAL (ZERO ANIMATION)
const ProModal = ({ open, title, subtitle, children, onClose, onAction, actionText }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans bg-[#0A0A0A]/60">
      <div className="relative w-[480px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-[#E5E5E5]">
        <div className="p-5 border-b border-[#E5E5E5] flex justify-between items-center bg-[#F9F9F9]">
          <div>
            <h2 className="text-[16px] font-bold text-[#333333]">{title}</h2>
            {subtitle && <p className="text-[12px] text-[#707070] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-md transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
        {actionText && (
          <div className="p-4 border-t border-[#E5E5E5] bg-[#F9F9F9] flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-[#707070] hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
            <button onClick={onAction} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0080ff] hover:bg-[#0066cc] rounded-md transition-colors">{actionText}</button>
          </div>
        )}
      </div>
    </div>
  );
};

const getLocalDiscussions = (workspaceId) => {
  try { return JSON.parse(localStorage.getItem(`wok_discussions_${workspaceId}`)) || []; } catch { return []; }
};
const saveLocalDiscussions = (workspaceId, data) => {
  localStorage.setItem(`wok_discussions_${workspaceId}`, JSON.stringify(data));
};

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialQ = urlParams.get('q') || '';
  const conversationId = urlParams.get('conversationId') || null;
  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('wok_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'My Workspace', current: true }];
  });
  const currentWorkspace = workspaces.find(w => w.current) || workspaces[0];
  
  const [discussions, setDiscussions] = useState(() => getLocalDiscussions(currentWorkspace.id) || []);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const [appearance, setAppearance] = useState({ theme: 'classic', font: 'Inter', edges: 'square' });
  const [aiThemePromptActive, setAiThemePromptActive] = useState(false);

  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [messages, setMessages] = useState(() => {
    const initial = conversationId ? getConversationMessages(conversationId) : [];
    return Array.isArray(initial) ? initial : [];
  });
  
  const [isLoadingConversation, setIsLoadingConversation] = useState(() => !!conversationId && (getConversationMessages(conversationId)?.length || 0) === 0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [ficheContent, setFicheContent] = useState(null);
  const [discussMode, setDiscussMode] = useState(false);
  const [iframeModal, setIframeModal] = useState({ open: false, url: '' });

  const profileMenuRef = useRef(null);
  const workspaceRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const abortedRef = useRef(false);

  const hasStarted = (messages?.length || 0) > 0 || isLoading;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileMenuOpen(false);
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) setShowWorkspaceSwitcher(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    initAgentsFromDB().catch(() => {});
    base44.auth.me().then((u) => {
      setUser(u);
      setUserPlan(getUserPlan(u));
    }).catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    loadConversationFromCloud(conversationId).then((cloudMsgs) => {
      const safeCloudMsgs = Array.isArray(cloudMsgs) ? cloudMsgs : [];
      if (safeCloudMsgs.length > 0) { setMessages(safeCloudMsgs); saveConversationMessages(conversationId, safeCloudMsgs); }
      setIsLoadingConversation(false);
    }).catch(() => setIsLoadingConversation(false));
  }, [conversationId]);

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim().length < 3) { toast.error("Name too short."); return; }
    const newWs = { id: `ws_${Date.now()}`, name: newWorkspaceName.trim(), current: true };
    const updated = workspaces.map(w => ({ ...w, current: false })).concat(newWs);
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    setDiscussions([]); 
    setShowWorkspaceModal(false);
    navigate('/'); 
  };

  const handleSwitchWorkspace = (id) => {
    const updated = workspaces.map(w => ({ ...w, current: w.id === id }));
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    setDiscussions(getLocalDiscussions(id) || []);
    setShowWorkspaceSwitcher(false);
    navigate('/'); 
  };

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isLoading) return;
    const userMsg = { role: 'user', content: text };
    const newMessages = [...(messages || []), userMsg];
    setMessages(newMessages); setInput(''); setIsLoading(true); setAiThemePromptActive(false);

    abortedRef.current = false;
    await new Promise(r => setTimeout(r, 2000));

    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({ prompt: text, model: 'gemini_3_flash' });
    } catch (err) {
      setIsLoading(false); 
      setMessages([...newMessages, { role: 'assistant', content: "Request failed." }]);
      return;
    }
    
    if (abortedRef.current) return;
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    setIsLoading(false);
    if (!discussMode) setFicheContent(content);
    const finalMsgs = [...newMessages, { role: 'assistant', content }];
    setMessages(finalMsgs);
    saveConversationMessages(convId, finalMsgs);
  }, [user, messages, isLoading, discussMode, currentWorkspace]);

  const handleStop = useCallback(() => {
    abortedRef.current = true; setIsLoading(false);
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), { role: 'assistant', content: 'Stopped.' }]);
  }, []);

  const handleReload = () => {
    const lastUserMsg = [...(messages || [])].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      const filteredMsgs = messages.slice(0, messages.lastIndexOf(lastUserMsg));
      setMessages(filteredMsgs);
      sendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="flex font-sans h-screen w-full bg-white overflow-hidden antialiased">
      
      {/* MODALS */}
      <ProModal open={showWorkspaceModal} onClose={() => setShowWorkspaceModal(false)} title="Create a workspace" subtitle="Start collaborating immediately" actionText="Create workspace" onAction={handleCreateWorkspace}>
        <input type="text" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)} placeholder="Workspace name..." className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[13px] focus:outline-none" autoFocus />
      </ProModal>

      <ProModal open={showCodeModal} onClose={() => setShowCodeModal(false)} title="Redeem Code" actionText="Apply" onAction={() => setShowCodeModal(false)}>
        <input type="text" placeholder="XXXX-XXXX" className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[13px] focus:outline-none" />
      </ProModal>

      <ProModal open={showSupportModal} onClose={() => setShowSupportModal(false)} title="Support" subtitle="Engineering usually responds within 1 hour." actionText="Submit" onAction={() => setShowSupportModal(false)}>
         <textarea rows={4} className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[13px] focus:outline-none resize-none" placeholder="Describe your issue..." />
      </ProModal>

      <aside className={`flex-shrink-0 h-full border-r border-[#E5E5E5] flex flex-col z-40 transition-none ${isSidebarOpen ? 'w-[260px]' : 'w-0 overflow-hidden'}`} style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #EAEFF8 100%)' }}>
        <div className="w-[260px] flex flex-col h-full">
          <div className="p-4 border-b border-black/5 relative" ref={workspaceRef}>
            <button onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)} className="flex items-center justify-between w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-md hover:bg-gray-50 shadow-sm transition-colors">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 bg-[#0080ff] text-white rounded-[4px] flex items-center justify-center text-[10px] font-bold">{currentWorkspace?.name?.charAt(0).toUpperCase()}</div>
                <span className="text-[13px] font-bold text-[#333333] truncate">{currentWorkspace?.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showWorkspaceSwitcher && (
              <div className="absolute top-[calc(100%+0px)] left-4 right-4 bg-white border border-[#E5E5E5] rounded-md shadow-xl py-2 z-50 p-1.5">
                {workspaces.map(w => (
                  <button key={w.id} onClick={() => handleSwitchWorkspace(w.id)} className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#333333] hover:bg-gray-50 flex items-center gap-2 rounded-md">
                    <div className="w-5 h-5 bg-gray-200 text-gray-600 rounded-[4px] flex items-center justify-center text-[9px] font-bold">{w.name.charAt(0).toUpperCase()}</div>
                    <span className="flex-1 truncate">{w.name}</span>
                    {w.current && <Check className="w-4 h-4 text-[#0080ff]" />}
                  </button>
                ))}
                <div className="h-px bg-[#E5E5E5] my-2 mx-2"></div>
                {workspaces.length < 4 && <button onClick={() => { setShowWorkspaceSwitcher(false); setShowWorkspaceModal(true); }} className="w-full text-left px-3 py-2 text-[13px] font-bold text-[#0080ff] hover:bg-gray-50 flex items-center gap-2 rounded-md"><Plus className="w-4 h-4" /> Create workspace</button>}
              </div>
            )}
          </div>

          <div className="px-4 py-3"><button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0080ff] text-white rounded-md text-[13px] font-bold hover:bg-[#0066cc] shadow-sm"><Plus className="w-4 h-4" /> New chat</button></div>

          <div className="flex-1 overflow-y-auto px-4 mt-6">
             <div className="text-[11px] font-bold text-gray-400 mb-3 px-1 tracking-wider uppercase font-sans">Recents</div>
             <ul className="space-y-0.5">
                {discussions?.map((d) => (
                  <li key={d.id} onClick={() => navigate(`/chat?conversationId=${d.id}`)} className={`relative flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer group ${conversationId === d.id ? 'bg-white shadow-sm border border-[#E5E5E5]' : 'border border-transparent hover:bg-white/50'}`}>
                    <span className="text-[13px] font-medium truncate text-gray-700">{d.title || d.preview || 'New chat'}</span>
                  </li>
                ))}
             </ul>
          </div>

          <div className="p-4 border-t border-black/5 relative" ref={profileMenuRef}>
            {isProfileMenuOpen && (
              <div className="absolute bottom-[calc(100%+12px)] left-4 w-[240px] bg-white border border-[#E5E5E5] rounded-xl shadow-2xl py-1.5 z-50 font-sans p-1.5">
                <button onClick={() => { setIsProfileMenuOpen(false); setShowSettingsModal(true); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 rounded-lg transition-colors"><Settings className="w-4 h-4" /> Settings</button>
                <button onClick={() => { setIsProfileMenuOpen(false); setShowSupportModal(true); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 rounded-lg transition-colors"><LifeBuoy className="w-4 h-4" /> Support</button>
                <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
                <button onClick={() => { setIsProfileMenuOpen(false); navigate('/pricing'); }} className="w-full text-left px-3 py-2 text-[13px] text-[#333333] font-semibold hover:bg-gray-50 flex items-center gap-2.5 group rounded-lg"><ArrowUpCircle className="w-4 h-4 text-[#0080ff]" /> Upgrade</button>
                <button onClick={() => { setIsProfileMenuOpen(false); setShowCodeModal(true); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 rounded-lg"><Key className="w-4 h-4" /> I have a code...</button>
              </div>
            )}
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 border border-transparent hover:border-[#E5E5E5] transition-colors w-full text-left">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[13px] font-bold shadow-sm" style={{ backgroundColor: '#8B5CF6' }}>{(user?.full_name || 'U').charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0"><p className="text-[13px] font-bold text-[#333333] truncate">{user?.full_name || 'User'}</p></div>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex overflow-hidden bg-white relative">
        <div className="absolute top-4 left-4 z-20"><button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-none rounded-md bg-white border border-[#E5E5E5] shadow-sm">{isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}</button></div>
        <div className="flex flex-1 overflow-hidden w-full h-full">
          <div className={`flex flex-col bg-white overflow-hidden transition-none ${hasStarted ? 'w-1/4 min-w-[320px] max-w-[400px] border-r border-[#E5E5E5] z-10' : 'w-full h-full justify-center max-w-3xl mx-auto'}`}>
            <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:hidden ${!hasStarted ? 'flex flex-col items-center justify-end w-full pb-[10vh]' : 'mt-16'}`}>
              {isLoadingConversation && <div className="flex justify-center pt-10"><ChatLoadingAnimation /></div>}
              {!isLoadingConversation && !hasStarted && <div className="flex flex-col items-center justify-center text-center opacity-30 w-full mb-10"><img src={LOGO_URL} alt="Wok" className="w-12 h-12 object-contain mb-4 grayscale" /><h2 className="text-[24px] font-bold text-[#0d0d0d]">How can I help you today?</h2></div>}
              {messages?.map((msg, idx) => (<div key={idx}>{msg.role === 'assistant' ? <AssistantMessage content={msg.content} /> : <CustomUserMessageBubble msg={msg} />}</div>))}
              {isLoading && <AssistantMessage content="" isGenerating={true} />}
              <div ref={messagesEndRef} className="h-4" />
            </div>
            <div className={`flex-shrink-0 p-4 bg-white ${!hasStarted ? 'pb-10 w-full' : ''}`}><ChatInputBar input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop} isLoading={isLoading} files={files} setFiles={setFiles} discussMode={discussMode} setDiscussMode={setDiscussMode} aiThemePromptActive={aiThemePromptActive} setAiThemePromptActive={setAiThemePromptActive} /></div>
          </div>
          {hasStarted && (
            <div className="flex-1 bg-white p-3 overflow-hidden flex flex-col">
              <div className={`w-full h-full flex flex-col overflow-hidden transition-none border rounded-md border-[#E5E5E5] bg-white shadow-sm`}>
                 <WorkspaceHeader onReload={handleReload} appearance={appearance} setAppearance={setAppearance} onAskAI={() => setAiThemePromptActive(true)} />
                 <div className="flex-1 overflow-y-auto bg-white"><FichePanel content={ficheContent} appearance={appearance} /></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}