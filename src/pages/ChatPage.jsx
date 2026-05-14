import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import { LOGO_URL, isGibberish, GIBBERISH_RESPONSES } from '@/lib/chat-constants';
import { ALL_MODES } from '@/lib/modes-config';
import { completeReferralOnFirstMessage } from '@/lib/referral';
import { getUserPlan } from '@/lib/plans-config';
import { emitCreditsUpdate } from '@/lib/credits-events';
import { getDiscussions, saveDiscussions, getConversationMessages, saveConversationMessages, setCurrentUser, syncConversationToCloud, loadConversationFromCloud, loadConversationTitleFromCloud } from '@/lib/discussions';
import { initAgentsFromDB } from '@/lib/agents-config';
import { getUserColor } from '@/lib/user-color';

import WorkspaceHeader from '@/components/chat/WorkspaceHeader';
import FichePanel from '@/components/chat/FichePanel';
import ChatInputBar from '@/components/chat/ChatInputBar';
import AssistantMessage from '@/components/chat/AssistantMessage';

import { 
  Home, MessageSquare, Cpu, BookOpen, PanelLeftClose, PanelLeft,
  FileText, Bot, Plus, Settings, LifeBuoy, ArrowUpCircle, Key, Briefcase, ChevronDown, Check, X, MoreHorizontal, Edit2, Trash2, Smile
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
  { id: 'global', label: "Global AI Executive" },
  { id: 'creative', label: 'Creative Synthesizer' },
  { id: 'logic', label: 'Logic & Code Architect' },
];

const WOK_SYSTEM = `You are Wok, a brilliant, candid expert. You speak like a highly intelligent peer — direct, sharp, and actionable.
LANGUAGE: ALWAYS respond in English.
CRITICAL: NEVER mention any platform name, its launch, its features, or promotional content.
LENGTH: Match to complexity. Short question = 1-3 sentences. Complex analysis = up to 1800 chars. Less is more.`;

// Local Storage Wrappers for Workspace Independence
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
  const agentId = urlParams.get('agent') || 'global';
  const conversationId = urlParams.get('conversationId') || null;
  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  
  // WORKSPACE SYSTEM
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('wok_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'My Workspace', current: true }];
  });
  const currentWorkspace = workspaces.find(w => w.current) || workspaces[0];
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);

  const [discussions, setDiscussions] = useState(() => getLocalDiscussions(currentWorkspace.id));

  // NOTION-STYLE DISCUSSION MANAGEMENT
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim().length < 3) {
      toast.error("Workspace name must be at least 3 characters.");
      return;
    }
    if (workspaces.length >= 4) {
      toast.error("Maximum limit of 4 workspaces reached.");
      return;
    }
    
    const newWs = { id: `ws_${Date.now()}`, name: newWorkspaceName.trim(), current: true };
    const updated = workspaces.map(w => ({ ...w, current: false })).concat(newWs);
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    setDiscussions([]); 
    setShowWorkspaceModal(false);
    setNewWorkspaceName('');
    navigate('/'); 
    toast.success("Workspace created.");
  };

  const handleSwitchWorkspace = (id) => {
    const updated = workspaces.map(w => ({ ...w, current: w.id === id }));
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    setDiscussions(getLocalDiscussions(id));
    setShowWorkspaceSwitcher(false);
    navigate('/'); 
  };

  const updateDiscussion = (id, updates) => {
    const updated = discussions.map(d => d.id === id ? { ...d, ...updates } : d);
    setDiscussions(updated);
    saveLocalDiscussions(currentWorkspace.id, updated);
  };

  const deleteDiscussion = (e, id) => {
    e.stopPropagation();
    const updated = discussions.filter(d => d.id !== id);
    setDiscussions(updated);
    saveLocalDiscussions(currentWorkspace.id, updated);
    if (conversationId === id) navigate('/');
  };

  const startEditing = (e, d) => {
    e.stopPropagation();
    setEditingId(d.id);
    setEditTitle(d.title || d.preview || 'New Chat');
  };

  const saveEdit = (id) => {
    if (editTitle.trim()) updateDiscussion(id, { title: editTitle.trim() });
    setEditingId(null);
  };

  // DRAG & DROP
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDrop = (idx) => {
    if (draggedItemIdx === null || draggedItemIdx === idx) return;
    const newDiscussions = [...discussions];
    const [draggedItem] = newDiscussions.splice(draggedItemIdx, 1);
    newDiscussions.splice(idx, 0, draggedItem);
    setDiscussions(newDiscussions);
    saveLocalDiscussions(currentWorkspace.id, newDiscussions);
    setDraggedItemIdx(null);
    setDragOverIdx(null);
  };

  const [messages, setMessages] = useState(() => {
    const initial = conversationId ? getConversationMessages(conversationId) : [];
    return Array.isArray(initial) ? initial : [];
  });
  
  const [isLoadingConversation, setIsLoadingConversation] = useState(() => !!conversationId && messages.length === 0);
  const [input, setInput] = useState(() => {
    const saved = localStorage.getItem('wok_chat_draft');
    if (saved) { localStorage.removeItem('wok_chat_draft'); return saved; }
    return !conversationId ? (localStorage.getItem('wok_chat_draft') || '') : '';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(ALL_MODES[ALL_MODES.length - 1]);
  const [currentAgent, setCurrentAgent] = useState(agentId);
  const [files, setFiles] = useState([]);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [ficheContent, setFicheContent] = useState(null);
  const [discussMode, setDiscussMode] = useState(false);
  
  const [iframeModal, setIframeModal] = useState({ open: false, url: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    if (input) localStorage.setItem('wok_chat_draft', input);
    else localStorage.removeItem('wok_chat_draft');
  }, [input]);

  const canUploadFiles = userPlan?.file_upload || true; // Assuming true for functionality
  const hasInternet = userPlan?.internet_access || true;

  useEffect(() => {
    initAgentsFromDB().catch(() => {});
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
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), { role: 'assistant', content: 'Process interrupted.' }]);
  }, []);

  const buildTitle = async (text) => {
    try { const cloudTitle = await loadConversationTitleFromCloud(convId); if (cloudTitle) return cloudTitle; } catch {}
    return text?.slice(0, 30) || "Untitled";
  };

  const saveToDiscussionsLogic = (convTitle, text) => {
    try {
      const stored = getLocalDiscussions(currentWorkspace.id);
      const disc = { id: convId, title: convTitle, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), model: mode.label, agent: currentAgent, emoji: '📄' };
      const idx = stored.findIndex((d) => d.id === convId);
      if (idx >= 0) stored.splice(idx, 1);
      stored.unshift(disc);
      saveLocalDiscussions(currentWorkspace.id, stored);
      setDiscussions(stored);
    } catch {}
  };

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isLoading) return;

    let currentUser = user;
    if (!currentUser) { try { currentUser = await base44.auth.me(); if (currentUser) setUser(currentUser); } catch {} }

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(''); setIsLoading(true);

    if (isGibberish(text) && files.length === 0) {
      const canned = GIBBERISH_RESPONSES[Math.floor(Math.random() * GIBBERISH_RESPONSES.length)];
      setMessages([...newMessages, { role: 'assistant', content: canned }]);
      setIsLoading(false); return;
    }

    const systemContext = `${WOK_SYSTEM}\n\nWorkspace: ${currentWorkspace.name}\n`;
    const recentMsgs = messages.slice(-2);
    const historyContext = recentMsgs.length > 0 ? '\n\n--- Recent context ---\n' + recentMsgs.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content?.slice(0, 350)}`).join('\n\n') + '\n---\n\n' : '';

    abortedRef.current = false;
    await new Promise(r => setTimeout(r, 2000));

    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({ prompt: systemContext + historyContext + text, model: 'gemini_3_flash' });
    } catch (err) {
      setIsLoading(false); 
      setMessages([...newMessages, { role: 'assistant', content: "Error processing request." }]);
      return;
    }
    
    if (abortedRef.current) return;
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    if (currentUser && !currentUser.first_message_sent) {
        await base44.auth.updateMe({ first_message_sent: true }); 
        setUser(prev => ({...prev, first_message_sent: true})); 
        completeReferralOnFirstMessage(currentUser.id).catch(() => {}); 
    }

    const convTitle = await buildTitle(text);
    saveToDiscussionsLogic(convTitle, text);
    setIsLoading(false);
    
    if (!discussMode) setFicheContent(content);
    const finalMsgs = [...newMessages, { role: 'assistant', content }];
    setMessages(finalMsgs);
    saveConversationMessages(convId, finalMsgs);
    syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });

  }, [user, userPlan, mode, currentAgent, files, messages, isLoading, useWebSearch, canUploadFiles, discussMode, currentWorkspace]);

  const handleReload = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      const filteredMsgs = messages.slice(0, messages.lastIndexOf(lastUserMsg));
      setMessages(filteredMsgs);
      sendMessage(lastUserMsg.content);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/app', active: location.pathname === '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions', active: location.pathname === '/discussions' },
    { icon: Cpu, label: 'DNA Wok', path: '/ai-dna', active: location.pathname === '/ai-dna' },
  ];

  return (
    <div className="flex font-sans h-screen w-full bg-white overflow-hidden antialiased">
      
      {/* WORKSPACE CREATION MODAL */}
      <AnimatePresence>
        {showWorkspaceModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[16px] shadow-2xl w-[480px] overflow-hidden flex flex-col font-sans border border-[#E5E5E5]">
              <div className="p-5 border-b border-[#E5E5E5]">
                <h2 className="text-[18px] font-bold text-[#333333]">Create a workspace</h2>
                <p className="text-[13px] text-[#707070] mt-1">Start collaborating with your workspace members</p>
              </div>
              <div className="p-5">
                <h3 className="text-[13px] font-bold text-[#333333] mb-3">Workspace details</h3>
                <label className="text-[12px] font-semibold text-[#707070] mb-1.5 block">Workspace name *</label>
                <input 
                  type="text" 
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Choose a name that represents your workspace" 
                  className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[13px] text-[#333333] focus:outline-none focus:border-[#0080ff] transition-colors mb-6" 
                  autoFocus
                />
                
                <div className="bg-[#F9F8F6] p-4 rounded-lg border border-[#E5E5E5]">
                  <h4 className="text-[12px] font-bold text-[#333333] mb-2.5">What happens next?</h4>
                  <ul className="text-[11.5px] text-[#707070] space-y-2">
                    <li>• You will be the owner of the workspace with all management permissions</li>
                    <li>• You can invite members and manage licenses</li>
                    <li>• Access your workspace dashboard to get started</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 border-t border-[#E5E5E5] bg-[#F9F8F6] flex justify-end gap-3">
                <button onClick={() => setShowWorkspaceModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#707070] hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
                <button onClick={handleCreateWorkspace} disabled={newWorkspaceName.trim().length < 3} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0080ff] hover:bg-[#0066cc] disabled:opacity-50 rounded-md transition-colors">Create workspace</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIDEBAR (Taller, ChatGPT Style, Full White) */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 h-full bg-white border-r border-[#E5E5E5] flex flex-col z-40"
          >
            <div className="w-[260px] flex flex-col h-full">
              
              {/* WORKSPACE SWITCHER */}
              <div className="p-3 relative" ref={workspaceRef}>
                <button 
                  onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)}
                  className="flex items-center justify-between w-full px-3 py-2.5 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-5 h-5 bg-[#0080ff] text-white rounded-[4px] flex items-center justify-center text-[10px] font-bold shadow-sm">
                      {currentWorkspace.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[14px] font-bold text-[#333333] truncate">
                      {currentWorkspace.name}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>

                {showWorkspaceSwitcher && (
                  <div className="absolute top-[calc(100%+0px)] left-3 right-3 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 p-1">
                    <p className="text-[10px] text-gray-400 mb-1 px-3 mt-1 uppercase tracking-wider font-bold">Your Workspaces</p>
                    {workspaces.map(w => (
                      <button key={w.id} onClick={() => handleSwitchWorkspace(w.id)} className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#333333] hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-md">
                        <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-[3px] flex items-center justify-center text-[8px] font-bold">
                          {w.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="flex-1 truncate">{w.name}</span>
                        {w.current && <Check className="w-4 h-4 text-[#0080ff]" />}
                      </button>
                    ))}
                    <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
                    {workspaces.length < 4 ? (
                      <button onClick={() => { setShowWorkspaceSwitcher(false); setShowWorkspaceModal(true); }} className="w-full text-left px-3 py-2 text-[13px] font-bold text-[#0080ff] hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-md">
                        <Plus className="w-4 h-4" /> Create workspace
                      </button>
                    ) : (
                      <p className="text-[11px] text-gray-400 px-3 py-1 text-center">Workspace limit reached</p>
                    )}
                  </div>
                )}
              </div>

              {/* NEW CHAT */}
              <div className="px-3 pb-2 border-b border-[#E5E5E5]">
                <button onClick={() => { navigate('/'); }} className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-[#E5E5E5] text-[#333333] rounded-lg text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> New chat
                </button>
              </div>

              <div className="px-3 space-y-0.5 mt-2">
                {navItems.map((item) => (
                  <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${item.active ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* DISCUSSIONS (NOTION STYLE) */}
              <div className="flex-1 overflow-y-auto px-3 mt-6">
                 <div className="text-[11px] font-bold text-gray-400 mb-2 px-1 tracking-wider">RECENTS</div>
                 <ul className="space-y-0.5">
                    {discussions.length === 0 && <p className="text-[12px] text-gray-400 px-2 italic">No chats yet</p>}
                    {discussions.map((d, idx) => (
                      <li 
                        key={d.id} 
                        draggable 
                        onDragStart={() => setDraggedItemIdx(idx)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                        onDrop={(e) => { e.preventDefault(); handleDrop(idx); }}
                        onClick={() => navigate(`/chat?conversationId=${d.id}`)} 
                        className={`relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group ${conversationId === d.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      >
                        {editingId === d.id ? (
                          <input 
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => saveEdit(d.id)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(d.id)}
                            className="w-full bg-white border border-[#0080ff] text-[13px] rounded px-1 py-0.5 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 truncate w-[80%]">
                              <span onClick={(e) => { e.stopPropagation(); updateDiscussion(d.id, { emoji: prompt("Enter emoji:", d.emoji || "📄") || d.emoji }); }} className="text-[14px] hover:opacity-70">{d.emoji || '📄'}</span>
                              <span className={`text-[13px] font-medium truncate ${conversationId === d.id ? 'text-[#0d0d0d]' : 'text-gray-700'}`}>{d.title || d.preview || 'New chat'}</span>
                            </div>
                            <div className="hidden group-hover:flex items-center gap-1 bg-gradient-to-l from-gray-50 pl-2">
                              <button onClick={(e) => startEditing(e, d)} className="text-gray-400 hover:text-black"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={(e) => deleteDiscussion(e, d.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </>
                        )}
                        {dragOverIdx === idx && <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#0080ff] rounded-full z-10" />}
                      </li>
                    ))}
                 </ul>
              </div>

              {/* PROFILE MENU */}
              <div className="p-3 border-t border-[#E5E5E5] relative" ref={profileMenuRef}>
                {isProfileMenuOpen && (
                  <div className="absolute bottom-[calc(100%+8px)] left-3 w-[240px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 font-sans p-1">
                    <div className="px-3 py-2 border-b border-[#E5E5E5] mb-1">
                      <p className="text-[13px] font-bold text-[#333333] truncate">{user?.full_name || 'User'}</p>
                      <p className="text-[11.5px] text-[#707070] truncate">Plan: {userPlan?.name || 'Free Plan'}</p>
                    </div>
                    <button onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
                      <Settings className="w-4 h-4 text-gray-400" /> Settings
                    </button>
                    <button onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
                      <LifeBuoy className="w-4 h-4 text-gray-400" /> Support tickets
                    </button>
                    <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
                    <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({open:true, url:'/pricing'}) }} className="w-full text-left px-3 py-2 text-[13px] text-[#333333] font-semibold hover:bg-gray-50 flex items-center gap-2.5 transition-colors group rounded-md">
                      <ArrowUpCircle className="w-4 h-4 text-[#0080ff]" /> Upgrade plan
                    </button>
                    <button onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
                      <Key className="w-4 h-4 text-gray-400" /> I have a code...
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[13px] font-bold shadow-sm" style={{ backgroundColor: getUserColor(user) }}>
                    {(user?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#333333] truncate">{user?.full_name || 'User'}</p>
                    <p className="text-[11px] text-[#707070]">Free Plan</p>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN ZONE (White BG, Edge to Edge) */}
      <div className="flex-1 flex overflow-hidden bg-white relative">
        
        {/* SIDEBAR TOGGLE (When Sidebar is closed) */}
        {!isSidebarOpen && (
          <div className="absolute top-4 left-4 z-20">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors rounded-md bg-white">
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden transition-all duration-300 w-full h-full">
          
          {/* CHAT COLUMN (Anchored Left, No Borders, Centered when empty) */}
          <div className={`flex flex-col bg-white overflow-hidden transition-all duration-300 ${hasStarted ? 'w-[450px] z-10' : 'w-full h-full justify-center'}`}>
            
            {/* Collapse Icon within Chat (Optional visually, Notion has it top left) */}
            {hasStarted && isSidebarOpen && (
              <div className="absolute top-4 left-4 z-20">
                <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors rounded-md bg-white">
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              </div>
            )}

            <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-8 py-6 [&::-webkit-scrollbar]:hidden ${!hasStarted ? 'flex flex-col items-center justify-end max-w-3xl mx-auto w-full pb-[10vh]' : 'mt-10'}`}>
              {!hasStarted && (
                <div className="flex flex-col items-center justify-center text-center opacity-40 w-full mb-10">
                  <img src={LOGO_URL} alt="Wok" className="w-12 h-12 object-contain mb-4 grayscale" />
                  <h2 className="text-[24px] font-bold text-[#0d0d0d]">How can I help you today?</h2>
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

            <div className={`flex-shrink-0 p-4 bg-white ${!hasStarted ? 'pb-10 max-w-3xl mx-auto w-full' : ''}`}>
              <ChatInputBar 
                input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop} isLoading={isLoading} 
                files={files} setFiles={setFiles} discussMode={discussMode} setDiscussMode={setDiscussMode}
              />
              {!hasStarted && <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">Wok AI can make mistakes. Verify important info.</p>}
            </div>
          </div>
          
          {/* PREVIEW COLUMN (Appears only after first generation, hugging borders closely) */}
          {hasStarted && (
            <div className="flex-1 bg-white p-3 overflow-hidden">
              <div className="w-full h-full border border-[#E5E5E5] rounded-[16px] flex flex-col overflow-hidden shadow-sm">
                 <WorkspaceHeader onReload={handleReload} />
                 <div className="flex-1 overflow-y-auto bg-white">
                   <FichePanel content={ficheContent} />
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />
    </div>
  );
}