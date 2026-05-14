import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import { CHAR_SPEED, LOGO_URL, FG, YUZU, isGibberish, GIBBERISH_RESPONSES } from '@/lib/chat-constants';
import { ALL_MODES } from '@/lib/modes-config';
import { completeReferralOnFirstMessage } from '@/lib/referral';
import { getUserPlan } from '@/lib/plans-config';
import { emitCreditsUpdate } from '@/lib/credits-events';
import { getDiscussions, saveDiscussions, getConversationMessages, saveConversationMessages, setCurrentUser, syncConversationToCloud, loadConversationFromCloud, loadConversationTitleFromCloud, getDiscussionDaysLeft } from '@/lib/discussions';
import { initAgentsFromDB, getAgentConfig } from '@/lib/agents-config';
import { useLanguage } from '@/lib/i18n';
import { getUserColor } from '@/lib/user-color';

import WorkspaceHeader from '@/components/chat/WorkspaceHeader';
import FichePanel from '@/components/chat/FichePanel';
import ChatInputBar from '@/components/chat/ChatInputBar';
import ChatUpgradeOverlay from '@/components/chat/ChatUpgradeOverlay';
import AssistantMessage from '@/components/chat/AssistantMessage';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';
import ThinkingSteps from '@/components/chat/ThinkingSteps';
import SynthesisProposal from '@/components/chat/SynthesisProposal';
import SynthesisProgress from '@/components/chat/SynthesisProgress';

import { 
  Home, Bell, MessageSquare, ShoppingBag, TrendingUp, Zap, 
  ChevronRight, X, Cpu, BookOpen, ChevronsLeft, Search, 
  FileText, Settings, Bot, Lock, Plus, Star, MoreHorizontal,
  LifeBuoy, ArrowUpCircle, Key, Briefcase, ChevronDown, Check
} from 'lucide-react';

// BUBBLE UTILISATEUR (#F4F4F4 pour matcher la barre de preview)
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
  { id: 'global', labelKey: 'global_agent', label: "Knowing exactly where I'm going" },
  { id: 'emotions-depenses', labelKey: 'emotions_agent', label: 'Spend without guilt' },
  { id: 'wealth-strategy', labelKey: 'wealth_agent', label: 'Becoming financially free' },
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

  const { t } = useLanguage();

  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  
  // WORKSPACE SYSTEM
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('stensor_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'My Workspace', current: true }];
  });
  const currentWorkspace = workspaces.find(w => w.current) || workspaces[0];
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const newWs = { id: `ws_${Date.now()}`, name: newWorkspaceName.trim(), current: true };
      const updated = workspaces.map(w => ({ ...w, current: false })).concat(newWs);
      setWorkspaces(updated);
      localStorage.setItem('stensor_workspaces', JSON.stringify(updated));
      setShowWorkspaceModal(false);
      setNewWorkspaceName('');
      toast.success("Workspace created successfully.");
    }
  };

  const handleSwitchWorkspace = (id) => {
    const updated = workspaces.map(w => ({ ...w, current: w.id === id }));
    setWorkspaces(updated);
    localStorage.setItem('stensor_workspaces', JSON.stringify(updated));
    setShowWorkspaceSwitcher(false);
  };

  // DRAG & DROP DISCUSSIONS
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDrop = (idx) => {
    if (draggedItemIdx === null || draggedItemIdx === idx) return;
    const newDiscussions = [...discussions];
    const [draggedItem] = newDiscussions.splice(draggedItemIdx, 1);
    newDiscussions.splice(idx, 0, draggedItem);
    setDiscussions(newDiscussions);
    saveDiscussions(newDiscussions);
    setDraggedItemIdx(null);
    setDragOverIdx(null);
  };

  const [messages, setMessages] = useState(() => {
    const initial = conversationId ? getConversationMessages(conversationId) : [];
    return Array.isArray(initial) ? initial : [];
  });
  
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
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [showFreeDiscussionLimit, setShowFreeDiscussionLimit] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [freeDaysLeft, setFreeDaysLeft] = useState(null);
  const [milestoneShown, setMilestoneShown] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [synthProgress, setSynthProgress] = useState({ active: false, steps: [], currentStep: 0, done: false });
  const [convTitleDisplay, setConvTitleDisplay] = useState('');
  const [ficheContent, setFicheContent] = useState(null);
  const [ficheMsgIdx, setFicheMsgIdx] = useState(null);
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
  const synthPendingRef = useRef(null);
  const abortedRef = useRef(false);

  // LOGIQUE UI CONDITIONNELLE (Gère l'affichage de la preview)
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
  const agentLabel = AGENTS.find((a) => a.id === currentAgent)?.label || 'Global Agent';

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
      setTimeout(() => setIsLoadingConversation(false), 300);
    }).catch(() => setIsLoadingConversation(false));
  }, [conversationId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handler = () => { userScrolledUpRef.current = container.scrollHeight - container.scrollTop - container.clientHeight > 80; };
    container.addEventListener('scroll', handler, { passive: true });
    return () => container.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { if (!userScrolledUpRef.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startProgress = () => {
    let prog = 0;
    loadingTimerRef.current = setInterval(() => {
      prog += Math.random() * 8 + 2;
      if (prog >= 90) { prog = 90; clearInterval(loadingTimerRef.current); }
      setLoadingProgress(Math.round(prog));
    }, 600);
  };

  const stopProgress = () => { clearInterval(loadingTimerRef.current); setLoadingProgress(0); };

  const handleStop = useCallback(() => {
    abortedRef.current = true; stopProgress(); setIsLoading(false);
    setSynthProgress({ active: false, steps: [], currentStep: 0, done: false });
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
    const actualText = discussMode ? 'Discuss: ' + text : text;

    let currentUser = user;
    if (!currentUser) { try { currentUser = await base44.auth.me(); if (currentUser) { setUser(currentUser); setCreditsUsed(currentUser.credits_used ?? 0); } } catch {} }

    const isFree = !userPlan || userPlan.price_monthly === 0;
    if (isFree) {
      try { const stored = getDiscussions(); if (!stored.find((d) => d.id === convId) && stored.length >= 3) { localStorage.setItem('stensor_saved_input', text); setShowFreeDiscussionLimit(true); return; } } catch {}
    }

    const userMsg = { role: 'user', content: actualText, files: files.length > 0 ? files.map((f) => f.name) : undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(''); setFiles([]); setIsLoading(true); startProgress();

    if (isGibberish(text) && files.length === 0) {
      const canned = GIBBERISH_RESPONSES[Math.floor(Math.random() * GIBBERISH_RESPONSES.length)];
      setMessages([...newMessages, { role: 'assistant', content: canned }]);
      if (currentUser) await updateCredits(currentUser, 1);
      stopProgress(); setIsLoading(false); return;
    }

    let file_urls = [];
    if (files.length > 0 && canUploadFiles) { for (const file of files) { try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); file_urls.push(file_url); } catch {} } }

    await initAgentsFromDB().catch(() => {});
    const agentConfig = currentAgent ? getAgentConfig(currentAgent) : null;
    const fileInstruction = file_urls.length > 0 ? '\n\nFiles: use as context.' : '';

    const systemContext = agentConfig?.instructions ? `${agentConfig.instructions}\n\n${STENSOR_SYSTEM}\n\n` : `${STENSOR_SYSTEM}\n\n`;
    const recentMsgs = messages.slice(-2);
    const historyContext = recentMsgs.length > 0 ? '\n\n--- Recent conversation ---\n' + recentMsgs.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content?.slice(0, 350)}`).join('\n\n') + '\n---\n\n' : '';
    const isFirstMessage = !currentUser?.first_message_sent;
    const useInternet = useWebSearch && hasInternet;

    abortedRef.current = false;
    await new Promise(r => setTimeout(r, 3000));

    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({ prompt: systemContext + historyContext + text + fileInstruction, model: 'gemini_3_flash', add_context_from_internet: useInternet, ...(file_urls.length > 0 ? { file_urls } : {}) });
    } catch (err) {
      setIsLoading(false); stopProgress();
      setMessages([...newMessages, { role: 'assistant', content: "I haven't been able to process your request. Please try again." }]);
      return;
    }
    
    if (abortedRef.current) return;
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    const costPerMsg = discussMode ? 1 : (isFirstMessage ? 1 : mode.credit_cost) + (useInternet ? 1 : 0);
    if (currentUser) {
      await updateCredits(currentUser, costPerMsg);
      if (isFirstMessage) { await base44.auth.updateMe({ first_message_sent: true }); setUser(prev => ({...prev, first_message_sent: true})); completeReferralOnFirstMessage(currentUser.id).catch(() => {}); }
    }

    const convTitle = await buildTitle(text);
    saveToDiscussionsLogic(convTitle, text);
    setConvTitleDisplay(convTitle);
    stopProgress(); setIsLoading(false);
    
    if (!discussMode) { setFicheContent(content); setFicheMsgIdx(newMessages.length); }
    const finalMsgs = [...newMessages, { role: 'assistant', content, _msgIdx: discussMode ? undefined : newMessages.length }];
    setMessages(finalMsgs);
    saveConversationMessages(convId, finalMsgs);
    syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });

  }, [user, userPlan, mode, currentAgent, files, messages, isLoading, blocked, useWebSearch, hasInternet, canUploadFiles, discussMode, currentWorkspace]);

  const handleMessageClick = useCallback((msg, idx) => {
    if (!msg?.content || msg.content.length < 20 || discussMode) return;
    setFicheContent(msg.content); setFicheMsgIdx(idx);
  }, [discussMode]);

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
    { icon: Home, labelKey: 'home', label: 'Home', path: '/app', active: location.pathname === '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions', active: location.pathname === '/discussions' },
    { icon: Cpu, label: 'DNA Stensor', path: '/ai-dna', active: location.pathname === '/ai-dna', highlight: true },
    ...(isAdmin ? [
      { icon: ShoppingBag, labelKey: 'administration', label: 'Admin', path: '/admin/products', active: location.pathname.startsWith('/admin') && !location.pathname.includes('blog') },
      { icon: BookOpen, label: 'Blog', path: '/admin/blog', active: location.pathname === '/admin/blog' },
    ] : []),
  ];

  return (
    <div className="flex font-sans h-screen w-full bg-white overflow-hidden antialiased">
      
      {/* CREATE WORKSPACE MODAL */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] w-[480px] overflow-hidden flex flex-col font-sans border border-[#E5E5E5]">
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
                  <li>• You will be the owner of the workspace with full management permissions</li>
                  <li>• You can invite members and manage licenses</li>
                  <li>• Access your workspace dashboard to get started</li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-[#E5E5E5] bg-white flex justify-end gap-3">
              <button onClick={() => setShowWorkspaceModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#707070] hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
              <button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0080ff] hover:bg-[#0066cc] disabled:opacity-50 rounded-md transition-colors">Create workspace</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR (Blanc Pur) */}
      {isSidebarOpen && (
        <aside className="w-[260px] flex-shrink-0 h-full bg-white border-r border-[#E5E5E5] flex flex-col z-40">
          
          {/* WORKSPACE SWITCHER */}
          <div className="p-3 border-b border-[#E5E5E5] relative" ref={workspaceRef}>
            <button 
              onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)}
              className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-[13px] font-bold text-[#333333] truncate">
                  {currentWorkspace?.name || 'My Workspace'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            {showWorkspaceSwitcher && (
              <div className="absolute top-[calc(100%+6px)] left-3 right-3 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 p-1">
                <p className="text-[10px] text-gray-400 mb-1 px-3 mt-1 uppercase tracking-wider font-bold">Your Workspaces</p>
                {workspaces.map(w => (
                  <button key={w.id} onClick={() => handleSwitchWorkspace(w.id)} className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#333333] hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-md">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 truncate">{w.name}</span>
                    {w.current && <Check className="w-4 h-4 text-[#0080ff]" />}
                  </button>
                ))}
                <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
                <button onClick={() => { setShowWorkspaceSwitcher(false); setShowWorkspaceModal(true); }} className="w-full text-left px-3 py-2 text-[13px] font-bold text-[#0080ff] hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-md">
                  <Plus className="w-4 h-4" /> Create workspace
                </button>
              </div>
            )}
          </div>

          <div className="px-3 pt-4 pb-2">
            <button onClick={() => { navigate('/'); }} className="flex items-center justify-center gap-2 w-full py-2 bg-[#0080ff] text-white rounded-lg text-[13px] font-bold hover:bg-[#0066cc] transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> New chat
            </button>
          </div>

          <div className="px-3 space-y-0.5 mt-2">
            {navItems.map((item) => (
              <button 
                key={item.labelKey || item.label} 
                onClick={() => navigate(item.path)} 
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${item.active ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label || t(item.labelKey)}</span>
                {item.highlight && <span className="ml-auto text-[9px] font-bold bg-[#DDFF00] text-black px-1.5 py-0.5 rounded-full">NEW</span>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-3 mt-6 space-y-6 [&::-webkit-scrollbar]:hidden">
            <div>
              <div onClick={() => toggleSection('recentes')} className="flex items-center gap-1 px-1 mb-1.5 cursor-pointer group text-gray-400 hover:text-gray-900 transition-colors">
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${sections.recentes ? 'rotate-90' : ''}`} />
                <span className="text-[11px] font-bold tracking-wider">RECENTS</span>
              </div>
              {sections.recentes && (
                <ul className="space-y-0.5">
                   {discussions.slice(0, 5).map((d, idx) => (
                     <li 
                       key={d.id} 
                       draggable 
                       onDragStart={() => setDraggedItemIdx(idx)}
                       onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                       onDrop={(e) => { e.preventDefault(); handleDrop(idx); }}
                       onClick={() => navigate(`/chat?conversationId=${d.id}`)} 
                       className="relative flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors truncate group"
                     >
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[13px] font-medium truncate">{d.title || d.preview || 'New chat'}</span>
                        {dragOverIdx === idx && <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#0080ff] rounded-full z-10" />}
                     </li>
                   ))}
                </ul>
              )}
            </div>
            <div>
              <div onClick={() => toggleSection('agents')} className="flex items-center gap-1 px-1 mb-1.5 cursor-pointer group text-gray-400 hover:text-gray-900 transition-colors">
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${sections.agents ? 'rotate-90' : ''}`} />
                <span className="text-[11px] font-bold tracking-wider">AGENTS</span>
              </div>
              {sections.agents && (
                <ul className="space-y-0.5">
                   {AGENTS.map((a) => (
                     <li key={a.id} onClick={() => navigate(`/chat?agent=${a.id}`)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors">
                        <Bot className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[13px] font-medium truncate">{a.label}</span>
                     </li>
                   ))}
                   <li onClick={() => navigate('/ai-dna')} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-500 transition-colors mt-1">
                      <Plus className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[13px] font-medium">New agent</span>
                   </li>
                </ul>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-[#E5E5E5] relative" ref={profileMenuRef}>
            {isProfileMenuOpen && (
              <div className="absolute bottom-[calc(100%+8px)] left-3 w-[240px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 font-sans p-1">
                <div className="px-3 py-2 border-b border-[#E5E5E5] mb-1">
                  <p className="text-[13px] font-bold text-[#333333] truncate">{user?.full_name || 'User'}</p>
                  <p className="text-[11.5px] text-[#707070] truncate">Plan: {userPlan?.name || 'Free Plan'}</p>
                </div>
                <button onClick={() => { setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button onClick={() => { setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
                  <LifeBuoy className="w-4 h-4" /> Support tickets
                </button>
                <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
                <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({open:true, url:'/pricing'}) }} className="w-full text-left px-3 py-2 text-[13px] text-[#333333] font-semibold hover:bg-gray-50 flex items-center gap-2.5 transition-colors group rounded-md">
                  <ArrowUpCircle className="w-4 h-4 text-[#0080ff]" /> Upgrade plan
                </button>
                <button onClick={() => { setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
                  <Key className="w-4 h-4" /> I have a code...
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
        </aside>
      )}

      {/* MAIN ZONE (White BG, Edge to Edge) */}
      <div className="flex-1 flex overflow-hidden bg-white">
          
        {/* COLONNE CHAT */}
        <div className={`flex flex-col bg-white overflow-hidden transition-all duration-300 ${hasStarted ? 'w-[450px]' : 'w-full max-w-3xl mx-auto'}`}>
          
          <div className="pt-3 bg-white flex-shrink-0">
            <div className="px-4 pb-2 flex items-center">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors rounded-md">
                  <ChevronsLeft className="w-5 h-5 rotate-180" />
                </button>
              )}
            </div>
          </div>

          <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:hidden ${!hasStarted ? 'flex flex-col justify-end' : ''}`}>
            {!hasStarted && (
               <div className="flex flex-col items-center justify-center text-center opacity-30 w-full mb-10">
                 <img src={LOGO_URL} alt="Stensor" className="w-12 h-12 object-contain mb-4" />
                 <h2 className="text-[22px] font-bold text-[#0d0d0d]">How can I help you today?</h2>
               </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'assistant' 
                  ? <AssistantMessage content={msg.content} isGenerating={false} />
                  : <CustomUserMessageBubble msg={msg} />
                }
              </div>
            ))}
            
            {isLoading && <AssistantMessage content="" isGenerating={true} />}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          <div className={`flex-shrink-0 p-4 bg-white ${!hasStarted ? 'pb-10' : ''}`}>
            <ChatInputBar
              input={input} setInput={setInput} onSend={sendMessage}
              isLoading={isLoading} 
            />
            {!hasStarted && <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">Stensor AI can make mistakes. Verify important info.</p>}
          </div>
        </div>
        
        {/* COLONNE PREVIEW (Seulement après 1er message) */}
        {hasStarted && (
          <div className="flex-1 p-2 overflow-hidden bg-white">
            <div className="w-full h-full flex flex-col border border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm">
               <WorkspaceHeader onReload={handleReload} />
               <div className="flex-1 overflow-y-auto bg-white">
                 <FichePanel content={ficheContent} />
               </div>
            </div>
          </div>
        )}
          
      </div>

      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />
      
      {showFreeDiscussionLimit && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowFreeDiscussionLimit(false)}>
          <div className="w-full max-w-sm bg-white rounded-[20px] p-6 text-center" onClick={e => e.stopPropagation()}>
            <p className="font-black text-xl mb-4">Free limit reached</p>
            <button onClick={() => { setShowFreeDiscussionLimit(false); navigate('/pricing'); }} className="w-full py-3 bg-black text-white rounded-xl font-bold">View plans →</button>
          </div>
        </div>
      )}
    </div>
  );
}