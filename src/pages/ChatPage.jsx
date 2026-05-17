import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import { LOGO_URL, isGibberish, GIBBERISH_RESPONSES } from '@/lib/chat-constants';
import { ALL_MODES } from '@/lib/modes-config';
import { getUserPlan } from '@/lib/plans-config';
import { getConversationMessages, saveConversationMessages, setCurrentUser, loadConversationFromCloud, loadConversationTitleFromCloud } from '@/lib/discussions';
import { initAgentsFromDB } from '@/lib/agents-config';
import { getUserColor } from '@/lib/user-color';

import WorkspaceHeader from '@/components/chat/WorkspaceHeader';
import FichePanel from '@/components/chat/FichePanel';
import ChatInputBar from '@/components/chat/ChatInputBar';
import AssistantMessage from '@/components/chat/AssistantMessage';

import { 
  Home, MessageSquare, Cpu, PanelLeftClose, PanelLeft, AlertTriangle, Sparkles,
  FileText, Plus, Settings, LifeBuoy, ArrowUpCircle, Key, Briefcase, ChevronDown, Check, X, MoreHorizontal, Edit2, Trash2
} from 'lucide-react';

const CustomUserMessageBubble = ({ msg }) => (
  <div className="flex justify-end w-full mb-6 font-sans px-4 md:px-0">
    <div 
      className="bg-[#E8E8E8] text-[#0d0d0d] text-[15px] leading-relaxed px-5 py-3 rounded-[20px] max-w-[90%] md:max-w-[85%] whitespace-pre-wrap shadow-none border-none"
      style={{ fontFamily: '"Open Sans", sans-serif' }}
    >
      {msg.content}
    </div>
  </div>
);

const IframeModal = ({ open, url, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-[#0A0A0A]/60 backdrop-blur-sm">
      <div className="relative w-[95vw] h-[95vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-[#E5E5E5]">
        <button onClick={onClose} className="absolute top-4 right-4 z-[99999] p-2 bg-gray-100/80 hover:bg-gray-200 text-gray-800 rounded-md transition-none shadow-sm">
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <iframe src={url} className="w-full h-full border-none bg-white" />
      </div>
    </div>
  );
};

const ProModal = ({ open, title, subtitle, children, onClose, onAction, actionText }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-[#0A0A0A]/60 backdrop-blur-sm">
      <div className="relative w-[95%] md:w-[480px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-[#E5E5E5]">
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

// --- LOSSLESS TOKEN COMPRESSION PROMPTS ---

const PROMPT_PSYCHOLOGIST = `You are an elite backend data compiler.
TOKEN REDUCTION PROTOCOL:
1. Output ONLY ultra-dense telegraphic shorthand (e.g., P1:Action|Metric|PsychTrigger). ZERO fluff. ZERO full sentences.
2. Analyze the user query to build a strategic masterplan, then compress it into this shorthand data payload.
3. Designate 3 distinct datasets for UI charts (Area, Radar, Radial).
4. RAW TEXT ONLY. No markdown. Reply in the exact same language the user wrote in.`;

const PROMPT_ARCHITECT = `You are a Principal UI Developer building a $10,000 interactive dashboard.
CRITICAL RULES (FAILURE CRASHES SYSTEM):
1. AESTHETICS: Use Deep Void Black (bg-[#050505]) or ultra-clean light (bg-[#FAFAFA]). Massive whitespace (p-12 md:p-24, gap-12). Glowing accents (text-cyan-400, text-emerald-400). Append '+' to major headers.
2. ELOQUENT UX COPY: Unzip the provided shorthand data into beautiful, highly readable, ELI5 (Explain Like I'm 5) paragraphs. ALL <p> tags MUST use \`leading-[1.8]\` or \`leading-loose\` and \`text-white/90\` (if dark).
3. COMPLEX CHARTS: Render 3 DIFFERENT Recharts (Area, Radar, RadialBar) with comparative mock data, <XAxis>, <Tooltip>, and gradients. Wrap in <div className="w-full h-80">.
4. NO BOILERPLATE: Zero navbars, footers, or fake buttons. 
5. IMPORTS: Exactly this:
   import React, { useState, useEffect, useRef } from 'react';
   import { motion, AnimatePresence } from 'framer-motion';
   import { ArrowRight, CheckCircle2, Zap, Sparkles, Activity, Layers, Rocket, Brain, BarChart, Target, Globe, Plus } from 'lucide-react';
   import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
6. ANIMATION: <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, ease: "easeOut" }}>
7. Component MUST be named 'App'. Output ONLY the jsx code block.`;

const PROMPT_AUTO_FIX = `You are a React Debugger. Fix the runtime error.
RULES: Output ONLY the raw jsx block. Keep exact design, '+' symbols, 1.8 leading, and whitespace. Replace crashing lucide/recharts imports with 'Activity' or native Tailwind shapes. Component name: 'App'.`;

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

  const [appearance, setAppearance] = useState({ theme: 'sand', font: 'Inter', edges: 'soft' });
  const [aiThemePromptActive, setAiThemePromptActive] = useState(false);

  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [mobileView, setMobileView] = useState('chat');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const [showCodeModal, setShowCodeModal] = useState(false);

  const [runtimeError, setRuntimeError] = useState(null);

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim().length < 3) { toast.error("Workspace name must be at least 3 characters."); return; }
    if (workspaces.length >= 4) { toast.error("Maximum limit of 4 workspaces reached."); return; }
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
    setDiscussions(getLocalDiscussions(id) || []);
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

  const startEditing = (e, d) => { e.stopPropagation(); setEditingId(d.id); setEditTitle(d.title || d.preview || 'New Chat'); };
  const saveEdit = (id) => { if (editTitle.trim()) updateDiscussion(id, { title: editTitle.trim() }); setEditingId(null); };

  const [draggedItemIdx, setDraggedItemIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDrop = (idx) => {
    if (draggedItemIdx === null || draggedItemIdx === idx) return;
    const newDiscussions = [...discussions];
    const [draggedItem] = newDiscussions.splice(draggedItemIdx, 1);
    newDiscussions.splice(idx, 0, draggedItem);
    setDiscussions(newDiscussions);
    saveLocalDiscussions(currentWorkspace.id, newDiscussions);
    setDraggedItemIdx(null); setDragOverIdx(null);
  };

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
    if (!isLoadingConversation && (messages?.length || 0) === 0 && conversationId) navigate('/');
  }, [isLoadingConversation, messages?.length, conversationId, navigate]);

  useEffect(() => {
    initAgentsFromDB().catch(() => {});
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.id) setCurrentUser(u.id);
      setUserPlan(getUserPlan(u));
    }).catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    if (initialQ && (messages?.length || 0) === 0) sendMessage(initialQ);
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setFicheContent(null);
      return;
    }
    loadConversationFromCloud(conversationId).then((cloudMsgs) => {
      const safeCloudMsgs = Array.isArray(cloudMsgs) ? cloudMsgs : [];
      if (safeCloudMsgs.length > 0) { 
        setMessages(safeCloudMsgs); 
        saveConversationMessages(conversationId, safeCloudMsgs); 
        
        const lastAssistantMsg = safeCloudMsgs.filter(m => m.role === 'assistant').pop();
        if (lastAssistantMsg) {
            setFicheContent(lastAssistantMsg.rawContent || lastAssistantMsg.content);
        } else {
            setFicheContent(null);
        }
      }
      setIsLoadingConversation(false);
    }).catch(() => setIsLoadingConversation(false));
  }, [conversationId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const saveToDiscussionsLogic = (convTitle, text) => {
    try {
      const stored = getLocalDiscussions(currentWorkspace.id);
      const disc = { id: convId, title: convTitle, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), emoji: '📄' };
      const idx = stored.findIndex((d) => d.id === convId);
      if (idx >= 0) stored.splice(idx, 1);
      stored.unshift(disc);
      saveLocalDiscussions(currentWorkspace.id, stored);
      setDiscussions(stored);
    } catch {}
  };

  const handleUpdateCredits = async (cost) => {
      if(!user) return;
      const newUsed = (user.credits_used || 0) + cost;
      await base44.entities.User.update(user.id, { credits_used: newUsed });
      setUser(prev => ({...prev, credits_used: newUsed}));
  };

  const sendMessage = useCallback(async (text, options = {}) => {
    if (!text?.trim() || isLoading) return;
    
    const userMsg = { role: 'user', content: text };
    const newMessages = [...(messages || []), userMsg];
    setMessages(newMessages); 
    setCurrentQuery(text); 
    setInput(''); 
    setIsLoading(true); 
    setAiThemePromptActive(false);

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

        const fixResult = await base44.integrations.Core.InvokeLLM({ 
          prompt: PROMPT_AUTO_FIX + "\n\nError reported:\n" + options.rawError + "\n\nCode to fix:\n" + codeToFix, 
          model: 'gemini_3_flash' 
        });

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

        await handleUpdateCredits(0); // FREE
        setIsLoading(false);
        setFicheContent(newContent);
        
        const chatDisplayContent = "✨ Architecture successfully recompiled to fix runtime errors.";
        
        const finalMsgs = [...newMessages, { role: 'assistant', content: chatDisplayContent, rawContent: newContent }];
        setMessages(finalMsgs);
        saveConversationMessages(convId, finalMsgs);
        return; 
      }

      // LOSSLESS COMPRESSION PIPELINE 
      const textResult = await base44.integrations.Core.InvokeLLM({ 
        prompt: PROMPT_PSYCHOLOGIST + "\n\nUser Query:\n" + text, 
        model: 'gemini_3_flash' 
      });

      if (abortedRef.current) return;
      const psychologicalText = typeof textResult === 'string' ? textResult : JSON.stringify(textResult);

      const codeResult = await base44.integrations.Core.InvokeLLM({ 
        prompt: PROMPT_ARCHITECT + "\n\n[EXPAND THIS DATA INTO A $10K UI]:\n" + psychologicalText, 
        model: 'gemini_3_flash' 
      });

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
             chatDisplayContent = "✨ Architecture generated successfully. View your interactive experience in the preview panel.";
         }
      }

      const cost = discussMode ? 1 : 10;
      await handleUpdateCredits(cost);

      setIsLoading(false);
      if (!discussMode) setFicheContent(rawContent);
      
      const finalMsgs = [...newMessages, { role: 'assistant', content: chatDisplayContent, rawContent: rawContent }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);
      saveToDiscussionsLogic("New Chat", text);
      
      if (window.innerWidth < 768 && !discussMode) {
        setMobileView('preview');
      }

    } catch (err) {
      setIsLoading(false); 
      setMessages([...newMessages, { role: 'assistant', content: "System architecture failed." }]);
      return;
    }
  }, [messages, isLoading, discussMode, currentWorkspace, user, ficheContent]);

  const handleFixError = () => {
    if (!runtimeError) return;
    const bt = String.fromCharCode(96);
    const promptMsg = `The following errors happened in the app:\n\n${bt}${bt}${bt}\n${runtimeError}\n${bt}${bt}${bt}\n\nPlease help me fix these errors.`;
    const savedError = runtimeError;
    setRuntimeError(null);
    sendMessage(promptMsg, { isCorrection: true, rawError: savedError });
  };

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

  const navItems = [
    { icon: Home, label: 'Home', path: '/app', active: location.pathname === '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions', active: location.pathname === '/discussions' },
    { icon: Cpu, label: 'DNA Wok', path: '/ai-dna', active: location.pathname === '/ai-dna' },
  ];

  return (
    <div className="flex font-sans h-screen w-full bg-[#FAFAFA] overflow-hidden antialiased relative">
      
      {!isSidebarOpen && (
        <div className="absolute top-4 left-4 z-[999]">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-none rounded-md bg-white border border-[#E5E5E5] shadow-sm">
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      <ProModal open={showWorkspaceModal} onClose={() => setShowWorkspaceModal(false)} title="Create a workspace" subtitle="Start collaborating with your workspace members" actionText="Create workspace" onAction={handleCreateWorkspace}>
        <label className="text-[12px] font-semibold text-[#707070] mb-1.5 block">Workspace name *</label>
        <input type="text" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)} placeholder="Choose a name..." className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[#0080ff] mb-4" autoFocus />
        <div className="bg-[#F9F8F6] p-4 rounded-lg border border-[#E5E5E5]">
          <h4 className="text-[12px] font-bold text-[#333333] mb-2.5">What happens next?</h4>
          <ul className="text-[11.5px] text-[#707070] space-y-2">
            <li>• You will be the owner with full management permissions</li>
            <li>• You can invite members and manage licenses</li>
            <li>• Access your workspace dashboard to get started</li>
          </ul>
        </div>
      </ProModal>

      <ProModal open={showCodeModal} onClose={() => setShowCodeModal(false)} title="Redeem Code" actionText="Apply" onAction={() => setShowCodeModal(false)}>
        <input type="text" placeholder="XXXX-XXXX-XXXX" className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[13px] focus:outline-none" />
      </ProModal>

      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />

      <aside className={`flex-shrink-0 h-full border-r border-[#E5E5E5] flex flex-col z-[50] transition-none absolute md:relative bg-white ${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full md:w-0 md:translate-x-0 overflow-hidden'}`}>
        <div className="w-[260px] flex flex-col h-full bg-white">
          
          <div className="p-4 border-b border-black/5 flex items-center justify-between">
             <h1 className="text-2xl font-[800] italic tracking-tighter text-[#0d0d0d]">WOK</h1>
             <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-none border border-[#E5E5E5] bg-white shadow-none">
               <PanelLeftClose className="w-4 h-4" />
             </button>
          </div>
          
          <div className="p-4 border-b border-black/5 relative" ref={workspaceRef}>
            <button onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)} className="flex items-center justify-between w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-md hover:bg-gray-50 shadow-none transition-none">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-5 h-5 bg-[#0080ff] text-white rounded-[4px] flex items-center justify-center text-[10px] font-bold">{currentWorkspace?.name?.charAt(0).toUpperCase()}</div>
                <span className="text-[13px] font-bold text-[#333333] truncate">{currentWorkspace?.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showWorkspaceSwitcher && (
              <div className="absolute top-[calc(100%-8px)] left-4 right-4 bg-white border border-[#E5E5E5] rounded-md shadow-xl py-2 z-50 p-1.5 transition-none">
                {workspaces.map(w => (
                  <button key={w.id} onClick={() => handleSwitchWorkspace(w.id)} className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#333333] hover:bg-gray-50 flex items-center gap-2 rounded-md transition-none">
                    <div className="w-5 h-5 bg-gray-200 text-gray-600 rounded-[4px] flex items-center justify-center text-[9px] font-bold">{w.name.charAt(0).toUpperCase()}</div>
                    <span className="flex-1 truncate">{w.name}</span>
                    {w.current && <Check className="w-4 h-4 text-[#0080ff]" />}
                  </button>
                ))}
                <div className="h-px bg-[#E5E5E5] my-2 mx-2"></div>
                {workspaces.length < 4 && <button onClick={() => { setShowWorkspaceSwitcher(false); setShowWorkspaceModal(true); }} className="w-full text-left px-3 py-2 text-[13px] font-bold text-[#0080ff] hover:bg-gray-50 flex items-center gap-2 rounded-md transition-none"><Plus className="w-4 h-4" /> Create workspace</button>}
              </div>
            )}
          </div>

          <div className="px-4 space-y-0.5 mt-3">
            {navItems.map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-none ${item.active ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
                <item.icon className="w-4 h-4" /><span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 mt-6">
             <div className="text-[11px] font-bold text-gray-400 mb-3 px-1 tracking-wider uppercase font-sans">Recents</div>
             <ul className="space-y-0.5">
                {discussions?.map((d, idx) => (
                  <li key={d.id} draggable onDragStart={() => setDraggedItemIdx(idx)} onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }} onDrop={() => handleDrop(idx)} onClick={() => { navigate(`/chat?conversationId=${d.id}`); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className={`relative flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer group transition-none ${conversationId === d.id ? 'bg-gray-100' : 'border border-transparent hover:bg-gray-50'}`}>
                    {editingId === d.id ? (
                      <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={() => saveEdit(d.id)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(d.id)} className="w-full bg-white border border-[#0080ff] text-[13px] rounded px-2 py-0.5 focus:outline-none" onClick={(e) => e.stopPropagation()} />
                    ) : (
                      <>
                        <div className="flex items-center gap-3 truncate w-[80%]">
                          <span onClick={(e) => { e.stopPropagation(); updateDiscussion(d.id, { emoji: prompt("Enter emoji:", d.emoji || "📄") || d.emoji }); }} className="text-[14px] hover:opacity-70 transition-none">{d.emoji || '📄'}</span>
                          <span className={`text-[13px] font-medium truncate ${conversationId === d.id ? 'text-[#0d0d0d] font-semibold' : 'text-gray-700'}`}>{d.title || d.preview || 'New chat'}</span>
                        </div>
                        <div className="hidden group-hover:flex items-center gap-1.5 pl-2">
                          <button onClick={(e) => startEditing(e, d)} className="text-gray-400 hover:text-black transition-none"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => deleteDiscussion(e, d.id)} className="text-gray-400 hover:text-red-500 transition-none"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </>
                    )}
                    {dragOverIdx === idx && <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#0080ff] rounded-full z-10" />}
                  </li>
                ))}
             </ul>
          </div>

          <div className="px-4 py-3 border-t border-black/5 mt-auto">
            <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 w-full py-2 bg-[#0080ff] text-white rounded-md text-[13px] font-bold hover:bg-[#0066cc] shadow-none transition-none">
              <Plus className="w-4 h-4" /> New chat
            </button>
          </div>

          <div className="p-4 border-t border-black/5 relative" ref={profileMenuRef}>
            {isProfileMenuOpen && (
              <div className="absolute bottom-[calc(100%+12px)] left-4 w-[240px] bg-white border border-[#E5E5E5] rounded-md shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 font-sans p-1.5 transition-none">
                <div className="px-3 py-2.5 border-b border-[#E5E5E5] mb-1">
                  <p className="text-[13px] font-bold text-[#333333] truncate">{user?.full_name || 'User'}</p>
                  <p className="text-[11.5px] text-[#707070] truncate">Plan: {userPlan?.name || 'Free'}</p>
                </div>
                <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({open:true, url:'/settings'}); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 rounded-md transition-none"><Settings className="w-4 h-4 text-gray-400" /> Settings</button>
                <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({open:true, url:'/support'}); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 rounded-md transition-none"><LifeBuoy className="w-4 h-4 text-gray-400" /> Support</button>
                <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
                <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({open:true, url:'/pricing'}); }} className="w-full text-left px-3 py-2 text-[13px] text-[#333333] font-semibold hover:bg-gray-50 flex items-center gap-2.5 group rounded-md transition-none"><ArrowUpCircle className="w-4 h-4 text-[#0080ff]" /> Upgrade</button>
                <button onClick={() => { setIsProfileMenuOpen(false); setShowCodeModal(true); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 rounded-md transition-none"><Key className="w-4 h-4 text-gray-400" /> I have a code...</button>
              </div>
            )}
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-[#E5E5E5] transition-none w-full text-left">
              <div className="w-9 h-9 rounded-md flex items-center justify-center text-white text-[13px] font-bold shadow-sm" style={{ backgroundColor: '#8B5CF6' }}>{(user?.full_name || 'U').charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0"><p className="text-[13px] font-bold text-[#333333] truncate">{user?.full_name || 'User'}</p></div>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div className="fixed inset-0 bg-black/20 z-[45]" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
        
        <div className="flex items-center justify-end p-3 md:hidden">
          {hasStarted && (
            <div className="flex bg-gray-100 p-1 rounded-md ml-auto z-50">
              <button onClick={() => setMobileView('chat')} className={`px-4 py-1 text-[12px] font-bold rounded ${mobileView === 'chat' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Chat</button>
              <button onClick={() => setMobileView('preview')} className={`px-4 py-1 text-[12px] font-bold rounded ${mobileView === 'preview' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Preview</button>
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden w-full h-full">
          
          <div className={`flex flex-col bg-white overflow-visible transition-none ${mobileView === 'chat' || window.innerWidth >= 768 ? 'flex' : 'hidden'} ${hasStarted ? 'w-full md:w-[23%] md:min-w-[300px] md:max-w-[340px] border-r border-[#E5E5E5] z-[100]' : 'w-full h-full justify-center max-w-3xl mx-auto z-10'}`}>
            <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-4 md:px-6 py-6 [&::-webkit-scrollbar]:hidden ${!hasStarted ? 'flex flex-col items-center justify-end w-full pb-[10vh]' : 'md:mt-16'}`}>
              {!hasStarted && <div className="flex flex-col items-center justify-center text-center opacity-30 w-full mb-10"><img src={LOGO_URL} alt="Wok" className="w-12 h-12 object-contain mb-4 grayscale" /><h2 className="text-[24px] font-bold text-[#0d0d0d]">How can I help you today?</h2></div>}
              {messages?.map((msg, idx) => (<div key={idx}>{msg.role === 'assistant' ? <AssistantMessage content={msg.content} isGenerating={false} query={msg.content} /> : <CustomUserMessageBubble msg={msg} />}</div>))}
              <AssistantMessage content={ficheContent} isGenerating={isLoading} query={currentQuery} />
              <div ref={messagesEndRef} className="h-4" />
            </div>
            <div className={`flex-shrink-0 p-3 md:p-4 bg-white overflow-visible ${!hasStarted ? 'pb-10 w-full' : ''}`}>
              <ChatInputBar input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop} isLoading={isLoading} files={files} setFiles={setFiles} discussMode={discussMode} setDiscussMode={setDiscussMode} aiThemePromptActive={aiThemePromptActive} setAiThemePromptActive={setAiThemePromptActive} />
            </div>
          </div>
          
          {hasStarted && (
            <div className={`flex-1 bg-[#FAFAFA] p-0 md:p-0 overflow-hidden flex flex-col transition-none ${mobileView === 'preview' || window.innerWidth >= 768 ? 'flex' : 'hidden'} md:w-[77%] z-0 relative`}>
              <div className={`w-full h-full flex flex-col overflow-hidden transition-none bg-white shadow-sm`}>
                 <WorkspaceHeader onReload={handleReload} convId={conversationId || convId} content={ficheContent} appearance={appearance} setAppearance={setAppearance} onAskAI={() => { setAiThemePromptActive(true); setMobileView('chat'); }} />
                 <div className="flex-1 overflow-hidden relative bg-white" style={{ background: appearance.theme === 'aurora' ? 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)' : appearance.theme === 'sand' ? '#FDFBF7' : appearance.theme === 'midnight' ? '#0B0F19' : appearance.theme === 'rose' ? 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)' : appearance.theme === 'grid' ? '#FAFAFA' : '#FFFFFF' }}>
                   {/* Pass isPublic={false} inside the app to hide the watermark */}
                   <FichePanel content={ficheContent} appearance={appearance} onError={setRuntimeError} onSuccess={() => setRuntimeError(null)} isPublic={false} />
                 </div>
              </div>

              {/* FROSTED GLASS AUTO-HEALING BANNER */}
              {runtimeError && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] bg-white/90 backdrop-blur-xl border border-red-100/50 text-[#333333] p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-[9999] flex flex-col md:flex-row items-center gap-5">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                         <AlertTriangle className="w-5 h-5 text-red-500"/>
                      </div>
                      <div className="flex flex-col max-w-[300px]">
                        <span className="text-[#0d0d0d] font-bold text-[14px] leading-tight">Runtime Exception</span>
                        <p className="text-[12px] text-gray-500 font-mono mt-1 line-clamp-2 leading-relaxed">{runtimeError}</p>
                      </div>
                   </div>
                   <div className="hidden md:block w-px h-10 bg-gray-200/60 mx-2"></div>
                   <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <span className="text-[11px] text-gray-500 font-medium">This will not deduct any credits.</span>
                      <div className="flex items-center gap-2">
                        <button onClick={handleFixError} className="px-5 py-2 bg-[#0d0d0d] text-white text-[13px] font-bold rounded-xl hover:bg-[#333333] flex items-center gap-2 transition-all shadow-md"><Sparkles className="w-4 h-4"/> Auto-Fix with AI</button>
                        <button onClick={() => setRuntimeError(null)} className="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"><X className="w-4 h-4"/></button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}