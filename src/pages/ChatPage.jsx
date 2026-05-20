// ─────────────────────────────────────────────────────────────────────────────
// ChatPage.jsx  ── Layout updated for floating preview panel with 200ms Ease-Out
// ─────────────────────────────────────────────────────────────────────────────
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
  Home, MessageSquare, Cpu, PanelLeftClose, PanelLeft, Plus, Settings, LifeBuoy, ArrowUpCircle, Key, ChevronDown, Check, X, MoreHorizontal, Edit2, Trash2, ChevronsLeft
} from 'lucide-react';

const CustomUserMessageBubble = ({ msg }) => (
  <div className="flex justify-end w-full mb-6 font-sans px-1 md:px-0">
    <div 
      className="bg-[#1A1A1A] text-white border border-[#2A2A2A] text-[15px] leading-relaxed px-5 py-3 rounded-[20px] max-w-[90%] md:max-w-[85%] whitespace-pre-wrap shadow-sm"
      style={{ fontFamily: '"Open Sans", sans-serif' }}
    >
      {msg.content}
    </div>
  </div>
);

const IframeModal = ({ open, url, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-[#0A0A0A]/80 backdrop-blur-sm">
      <div className="relative w-[95vw] h-[95vh] bg-[#1A1A1A] rounded-lg shadow-2xl overflow-hidden flex flex-col border border-[#2A2A2A]">
        <button onClick={onClose} className="absolute top-4 right-4 z-[99999] p-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded-md transition-none shadow-sm">
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <iframe src={url} className="w-full h-full border-none bg-white rounded-b-lg" />
      </div>
    </div>
  );
};

const ProModal = ({ open, title, subtitle, children, onClose, onAction, actionText }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-[#0A0A0A]/80 backdrop-blur-sm">
      <div className="relative w-[95%] md:w-[480px] bg-[#1A1A1A] rounded-lg shadow-2xl overflow-hidden flex flex-col border border-[#2A2A2A]">
        <div className="p-5 border-b border-[#2A2A2A] flex justify-between items-center bg-[#1A1A1A]">
          <div>
            <h2 className="text-[16px] font-bold text-white">{title}</h2>
            {subtitle && <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#2A2A2A] text-white rounded-md transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
        {actionText && (
          <div className="p-4 border-t border-[#2A2A2A] bg-[#1A1A1A] flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-white hover:bg-[#2A2A2A] rounded-md transition-colors">Cancel</button>
            <button onClick={onAction} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0055FF] hover:bg-[#0044CC] rounded-md transition-colors shadow-sm">{actionText}</button>
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

const PROMPT_PSYCHOLOGIST = `You are an elite backend data compiler.
TOKEN REDUCTION & DATA PROTOCOL:
1. THEME SELECTION: Evaluate user intent. Output MUST start with T:X (X is 1 to 5).
   T:1=Wok Clean, T:2=Deep Void, T:3=Yuzu Accent, T:4=Corp Sand, T:5=Brutalism.
2. Output ONLY ultra-dense telegraphic shorthand. ZERO sentences.
3. Provide exact ELI5 copywriting points.
4. Generate realistic, comparative DATA ARRAYS for charts. Include explicit X and Y axis data points.
5. RAW TEXT ONLY.`;

const PROMPT_ARCHITECT = `You are a Principal UI Developer building a $10,000 interactive dashboard.
CRITICAL RULES:
1. READ THE THEME (T:X) AND APPLY EXACT STYLES:
   T:1 (Clean): min-h-screen bg-[#FAFAFA], text-zinc-900, rounded-[24px].
   T:2 (Deep Void): min-h-screen bg-[#050505], text-zinc-100, border-zinc-800.
   T:3 (Yuzu): min-h-screen bg-[#0A0A0A], text-white, neon accents (#E6FF00), rounded-[32px].
   T:4 (Sand): min-h-screen bg-[#FDFBF7], text-zinc-800, rounded-[32px].
   T:5 (Brutalism): min-h-screen bg-[#E5E5E5], text-black, sharp edges, solid shadows.
2. TYPOGRAPHY: ALL <p> tags MUST use \`leading-[1.8]\`. Append a '+' symbol to major section titles. Use massive whitespace (p-12 md:p-24, space-y-24).
3. COMPLEX CHARTS: Render 3 DIFFERENT Recharts. Must include <XAxis>, <YAxis>, <Tooltip>, <linearGradient>. Map to the data provided. Wrap in <div className="w-full h-80">.
4. NO BOILERPLATE: Zero navbars, footers. 
5. IMPORTS: Exactly this:
   import React, { useState, useEffect, useRef } from 'react';
   import { motion, AnimatePresence } from 'framer-motion';
   import { ArrowRight, CheckCircle2, Zap, Sparkles, Activity, Layers, Rocket, Brain, BarChart, Target, Globe, Plus } from 'lucide-react';
   import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
6. ANIMATION: Use exact Framer snippet: <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, ease: "easeOut" }}>
7. Component MUST be named 'App'. Output ONLY the jsx code block.`;

const PROMPT_AUTO_FIX = `You are a React Debugger. Fix the runtime error.
RULES: Output ONLY the raw jsx block. Keep exact design, '+' symbols, 1.8 leading, and whitespace. Replace crashing lucide/recharts imports with 'Activity' or native Tailwind shapes. Component name: 'App'.`;

const getBackgroundGradient = (theme) => {
  switch(theme) {
    case 'wok_clean': return 'linear-gradient(180deg, #FFFFFF 0%, #F0F2F5 100%)';
    case 'deep_void': return 'linear-gradient(180deg, #050505 0%, #121212 100%)';
    case 'yuzu_accent': return 'linear-gradient(180deg, #0A0A0A 0%, #1A1C00 100%)';
    case 'corporate_sand': return 'linear-gradient(180deg, #FDFBF7 0%, #EFEBE0 100%)';
    case 'brutalism': return 'linear-gradient(180deg, #E5E5E5 0%, #C0C0C0 100%)';
    default: return 'linear-gradient(180deg, #FFFFFF 0%, #F0F2F5 100%)';
  }
};
// ── Ghost skeleton drawn top-to-bottom while AI is generating the preview ──
const SkeletonRow = ({ width, height = 14, delay = 0, opacity = 1 }) => (
  <div
    style={{
      width,
      height,
      opacity,
      borderRadius: 8,
      flexShrink: 0,
      background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
      backgroundSize: '600px 100%',
      animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${delay}ms both`,
    }}
  />
);

const PreviewSkeleton = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#0F0F0F',
      borderRadius: 16,
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      overflowY: 'hidden',
    }}
  >
    {/* Header block */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
      <SkeletonRow width="38%" height={22} delay={0} />
      <SkeletonRow width="58%" height={13} delay={40} opacity={0.5} />
    </div>

    {/* Stat cards row */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            background: 'linear-gradient(90deg, #161616 25%, #1f1f1f 50%, #161616 75%)',
            backgroundSize: '600px 100%',
            animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${80 + i * 50}ms both`,
            borderRadius: 12,
            height: 80,
          }}
        />
      ))}
    </div>

    {/* Chart block */}
    <div
      style={{
        background: 'linear-gradient(90deg, #141414 25%, #1d1d1d 50%, #141414 75%)',
        backgroundSize: '600px 100%',
        animation: 'wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out 230ms both',
        borderRadius: 14,
        height: 180,
        marginBottom: 24,
      }}
    />

    {/* Text lines block */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
      {[
        { w: '91%', d: 310 },
        { w: '76%', d: 350 },
        { w: '83%', d: 390 },
        { w: '55%', d: 430, op: 0.5 },
      ].map((r, i) => (
        <SkeletonRow key={i} width={r.w} height={13} delay={r.d} opacity={r.op || 1} />
      ))}
    </div>

    {/* Second chart / grid block */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            background: 'linear-gradient(90deg, #141414 25%, #1d1d1d 50%, #141414 75%)',
            backgroundSize: '600px 100%',
            animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${470 + i * 60}ms both`,
            borderRadius: 14,
            height: 120,
          }}
        />
      ))}
    </div>
  </div>
);


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

  const [appearance, setAppearance] = useState({ theme: 'wok_clean', font: 'Inter', edges: 'soft' });
  const [viewMode, setViewMode] = useState('preview');
  
  // NEW STATE: Toggle the preview panel width
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

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
// ── Global keyboard shortcuts ──
useEffect(() => {
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + S: Save (trigger in code editor if available)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (viewMode === 'code') {
        // Code editor handles this internally
        return;
      }
      toast.info('Auto-save active — changes sync continuously');
    }
    
    // Ctrl/Cmd + K: Toggle preview collapse
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (hasStarted) setIsPreviewCollapsed(prev => !prev);
    }
    
    // Ctrl/Cmd + /: Focus input
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      document.querySelector('textarea')?.focus();
    }
    
    // Escape: Close preview collapse
    if (e.key === 'Escape' && isPreviewCollapsed && hasStarted) {
      setIsPreviewCollapsed(false);
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [viewMode, hasStarted, isPreviewCollapsed]);

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

        await handleUpdateCredits(0); 
        setIsLoading(false);
        setFicheContent(newContent);
        
        const chatDisplayContent = "✨ Architecture successfully recompiled to bypass silent runtime exceptions.";
        const finalMsgs = [...newMessages, { role: 'assistant', content: chatDisplayContent, rawContent: newContent }];
        setMessages(finalMsgs);
        saveConversationMessages(convId, finalMsgs);
        return; 
      }

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

  useEffect(() => {
    if (runtimeError && !isLoading) {
      const bt = String.fromCharCode(96);
      const promptMsg = `The following errors happened in the app:\n\n${bt}${bt}${bt}\n${runtimeError}\n${bt}${bt}${bt}\n\nPlease help me fix these errors.`;
      const savedError = runtimeError;
      setRuntimeError(null);
      sendMessage(promptMsg, { isCorrection: true, rawError: savedError });
    }
  }, [runtimeError, isLoading, sendMessage]);

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

  const handleUpdateAppMeta = async (newSettings) => {
    setAppSettings(newSettings);
    if(convId) {
      try { await base44.entities.Conversation.update(convId, { title: newSettings.title }); } 
      catch (e) {}
    }
    toast.success("Settings updated successfully.");
  };

  const handleCloneApp = () => {
    const newConvId = `conv_${Date.now()}`;
    saveConversationMessages(newConvId, messages);
    toast.success("Application cloned. New URL generated.");
    navigate(`/chat?conversationId=${newConvId}`);
  };

  const handleUnpublishApp = async () => {
    setAppSettings({...appSettings, isPublic: false});
    if (convId) {
      try { await base44.entities.Conversation.update(convId, { is_public: false }); } 
      catch(e){}
    }
    toast.success("Application unpublished.");
  };

  const handleDeleteApp = () => {
    deleteDiscussion({ stopPropagation: () => {} }, convId);
    toast.success("Application deleted permanently.");
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/app', active: location.pathname === '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions', active: location.pathname === '/discussions' },
    { icon: Cpu, label: 'DNA Wok', path: '/ai-dna', active: location.pathname === '/ai-dna' },
  ];

  return (
    <div className="flex font-sans h-screen w-full bg-[#0F0F0F] overflow-hidden antialiased relative">
      
      {!isSidebarOpen && (
        <div className="absolute top-4 left-4 z-[999]">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-none rounded-md bg-[#1A1A1A] border border-[#2A2A2A] shadow-sm">
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      <ProModal open={showWorkspaceModal} onClose={() => setShowWorkspaceModal(false)} title="Create a workspace" subtitle="Start collaborating with your workspace members" actionText="Create workspace" onAction={handleCreateWorkspace}>
        <label className="text-[12px] font-semibold text-white mb-1.5 block">Workspace name *</label>
        <input type="text" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)} placeholder="Choose a name..." className="w-full border border-[#2A2A2A] bg-[#0F0F0F] text-white rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[#0055FF] mb-4" autoFocus />
        <div className="bg-[#0F0F0F] p-4 rounded-lg border border-[#2A2A2A]">
          <h4 className="text-[12px] font-bold text-white mb-2.5">What happens next?</h4>
          <ul className="text-[11.5px] text-gray-400 space-y-2">
            <li>• You will be the owner with full management permissions</li>
            <li>• You can invite members and manage licenses</li>
            <li>• Access your workspace dashboard to get started</li>
          </ul>
        </div>
      </ProModal>

      <ProModal open={showCodeModal} onClose={() => setShowCodeModal(false)} title="Redeem Code" actionText="Apply" onAction={() => setShowCodeModal(false)}>
        <input type="text" placeholder="XXXX-XXXX-XXXX" className="w-full border border-[#2A2A2A] bg-[#0F0F0F] text-white rounded-md px-3 py-2 text-[13px] focus:outline-none" />
      </ProModal>

      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />

      <aside className={`flex-shrink-0 h-full border-r border-[#2A2A2A] flex flex-col z-[50] transition-none absolute md:relative bg-[#0F0F0F] ${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full md:w-0 md:translate-x-0 overflow-hidden'}`}>
        <div className="w-[260px] flex flex-col h-full bg-[#0F0F0F]">
          
          <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
             <h1 className="text-2xl font-[800] italic tracking-tighter text-white">WOK</h1>
             <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-gray-400 hover:bg-[#1A1A1A] rounded-md transition-none border border-[#2A2A2A] bg-[#0F0F0F] shadow-none">
               <PanelLeftClose className="w-4 h-4" />
             </button>
          </div>
          
          <div className="p-4 border-b border-[#2A2A2A] relative" ref={workspaceRef}>
            <button onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)} className="flex items-center justify-between w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md hover:bg-[#2A2A2A] shadow-none transition-none">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-5 h-5 bg-[#0055FF] text-white rounded-[4px] flex items-center justify-center text-[10px] font-bold">{currentWorkspace?.name?.charAt(0).toUpperCase()}</div>
                <span className="text-[13px] font-bold text-white truncate">{currentWorkspace?.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showWorkspaceSwitcher && (
              <div className="absolute top-[calc(100%-8px)] left-4 right-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-md shadow-xl py-2 z-50 p-1.5 transition-none">
                {workspaces.map(w => (
                  <button key={w.id} onClick={() => handleSwitchWorkspace(w.id)} className="w-full text-left px-3 py-2 text-[13px] font-medium text-white hover:bg-[#1A1A1A] flex items-center gap-2 rounded-md transition-none">
                    <div className="w-5 h-5 bg-[#2A2A2A] text-gray-300 rounded-[4px] flex items-center justify-center text-[9px] font-bold">{w.name.charAt(0).toUpperCase()}</div>
                    <span className="flex-1 truncate">{w.name}</span>
                    {w.current && <Check className="w-4 h-4 text-[#0055FF]" />}
                  </button>
                ))}
                <div className="h-px bg-[#2A2A2A] my-2 mx-2"></div>
                {workspaces.length < 4 && <button onClick={() => { setShowWorkspaceSwitcher(false); setShowWorkspaceModal(true); }} className="w-full text-left px-3 py-2 text-[13px] font-bold text-[#0055FF] hover:bg-[#1A1A1A] flex items-center gap-2 rounded-md transition-none"><Plus className="w-4 h-4" /> Create workspace</button>}
              </div>
            )}
          </div>

          <div className="px-4 space-y-0.5 mt-3">
            {navItems.map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-none ${item.active ? 'bg-[#1A1A1A] text-white font-bold border border-[#2A2A2A]' : 'text-gray-400 hover:bg-[#1A1A1A] border border-transparent hover:text-white'}`}>
                <item.icon className="w-4 h-4" /><span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 mt-6">
             <div className="text-[11px] font-bold text-gray-500 mb-3 px-1 tracking-wider uppercase font-sans">Recents</div>
             <ul className="space-y-0.5">
                {discussions?.map((d, idx) => (
                  <li key={d.id} draggable onDragStart={() => setDraggedItemIdx(idx)} onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }} onDrop={() => handleDrop(idx)} onClick={() => { navigate(`/chat?conversationId=${d.id}`); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className={`relative flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer group transition-none ${conversationId === d.id ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'border border-transparent hover:bg-[#1A1A1A]'}`}>
                    {editingId === d.id ? (
                      <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={() => saveEdit(d.id)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(d.id)} className="w-full bg-[#0F0F0F] border border-[#0055FF] text-white text-[13px] rounded px-2 py-0.5 focus:outline-none" onClick={(e) => e.stopPropagation()} />
                    ) : (
                      <>
                        <div className="flex items-center gap-3 truncate w-[80%]">
                          <span onClick={(e) => { e.stopPropagation(); updateDiscussion(d.id, { emoji: prompt("Enter emoji:", d.emoji || "📄") || d.emoji }); }} className="text-[14px] hover:opacity-70 transition-none">{d.emoji || '📄'}</span>
                          <span className={`text-[13px] font-medium truncate ${conversationId === d.id ? 'text-white font-semibold' : 'text-gray-400 group-hover:text-gray-300'}`}>{d.title || d.preview || 'New chat'}</span>
                        </div>
                        <div className="hidden group-hover:flex items-center gap-1.5 pl-2">
                          <button onClick={(e) => startEditing(e, d)} className="text-gray-500 hover:text-white transition-none"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => deleteDiscussion(e, d.id)} className="text-gray-500 hover:text-red-500 transition-none"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </>
                    )}
                    {dragOverIdx === idx && <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#0055FF] rounded-full z-10" />}
                  </li>
                ))}
             </ul>
          </div>

          <div className="px-4 py-3 border-t border-[#2A2A2A] mt-auto">
            <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 w-full py-2 bg-[#0055FF] text-white rounded-md text-[13px] font-bold hover:bg-[#0044CC] shadow-none transition-none">
              <Plus className="w-4 h-4" /> New chat
            </button>
          </div>

          <div className="p-4 border-t border-[#2A2A2A] relative" ref={profileMenuRef}>
            {isProfileMenuOpen && (
              <div className="absolute bottom-[calc(100%+12px)] left-4 w-[240px] bg-[#0F0F0F] border border-[#2A2A2A] rounded-md shadow-[0_8px_30px_rgba(0,0,0,0.4)] py-1.5 z-50 font-sans p-1.5 transition-none">
                <div className="px-3 py-2.5 border-b border-[#2A2A2A] mb-1">
                  <p className="text-[13px] font-bold text-white truncate">{user?.full_name || 'User'}</p>
                  <p className="text-[11.5px] text-gray-400 truncate">Plan: {userPlan?.name || 'Free'}</p>
                </div>
                <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({open:true, url:'/settings'}); }} className="w-full text-left px-3 py-2 text-[13px] text-gray-300 hover:text-white hover:bg-[#1A1A1A] flex items-center gap-2.5 rounded-md transition-none"><Settings className="w-4 h-4 text-gray-400" /> Settings</button>
                <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({open:true, url:'/support'}); }} className="w-full text-left px-3 py-2 text-[13px] text-gray-300 hover:text-white hover:bg-[#1A1A1A] flex items-center gap-2.5 rounded-md transition-none"><LifeBuoy className="w-4 h-4 text-gray-400" /> Support</button>
                <div className="h-px bg-[#2A2A2A] my-1 mx-2"></div>
                <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({open:true, url:'/pricing'}); }} className="w-full text-left px-3 py-2 text-[13px] text-white font-semibold hover:bg-[#1A1A1A] flex items-center gap-2.5 group rounded-md transition-none"><ArrowUpCircle className="w-4 h-4 text-[#0055FF]" /> Upgrade</button>
                <button onClick={() => { setIsProfileMenuOpen(false); setShowCodeModal(true); }} className="w-full text-left px-3 py-2 text-[13px] text-gray-300 hover:text-white hover:bg-[#1A1A1A] flex items-center gap-2.5 rounded-md transition-none"><Key className="w-4 h-4 text-gray-400" /> I have a code...</button>
              </div>
            )}
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1A1A1A] border border-transparent hover:border-[#2A2A2A] transition-none w-full text-left">
              <div className="w-9 h-9 rounded-md flex items-center justify-center text-white text-[13px] font-bold shadow-sm" style={{ backgroundColor: '#8B5CF6' }}>{(user?.full_name || 'U').charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0"><p className="text-[13px] font-bold text-white truncate">{user?.full_name || 'User'}</p></div>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && window.innerWidth < 768 && (
        <div className="fixed inset-0 bg-black/60 z-[45]" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
        
        <div className="flex items-center justify-end p-3 md:hidden">
          {hasStarted && (
            <div className="flex bg-[#1A1A1A] border border-[#2A2A2A] p-1 rounded-md ml-auto z-50">
              <button onClick={() => setMobileView('chat')} className={`px-4 py-1 text-[12px] font-bold rounded ${mobileView === 'chat' ? 'bg-[#2A2A2A] shadow-sm text-white' : 'text-gray-400'}`}>Chat</button>
              <button onClick={() => setMobileView('preview')} className={`px-4 py-1 text-[12px] font-bold rounded ${mobileView === 'preview' ? 'bg-[#2A2A2A] shadow-sm text-white' : 'text-gray-400'}`}>Preview</button>
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden w-full h-full">
          
          {/* ── CHAT PANEL ── */}
          {/* Applies 200ms cubic-bezier transition to slide/expand the chat layout when preview is toggled */}
          <div className={`flex flex-col bg-[#0F0F0F] overflow-visible transition-all duration-[200ms] ease-[cubic-bezier(0,0,0.2,1)] ${mobileView === 'chat' || window.innerWidth >= 768 ? 'flex' : 'hidden'} ${hasStarted ? (isPreviewCollapsed ? 'flex-1 w-full border-none z-[100]' : 'flex-shrink-0 w-full md:w-[340px] md:min-w-[340px] border-r border-[#2A2A2A] z-[100]') : 'w-full h-full justify-center max-w-3xl mx-auto z-10'}`}>
            
            {/* The Expand Button (ChevronsLeft) - only visible when the preview is collapsed */}
            {isPreviewCollapsed && hasStarted && (
              <div className="absolute top-4 right-4 z-[999] hidden md:block">
                <button onClick={() => setIsPreviewCollapsed(false)} className="p-2.5 text-gray-500 hover:text-white transition-all duration-[200ms] rounded-md bg-[#1A1A1A] border border-[#2A2A2A] shadow-sm flex items-center justify-center" title="Expand Preview">
                  <ChevronsLeft className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Inner Chat Container centers content beautifully when in full screen mode */}
            <div className={`flex flex-col w-full h-full transition-all duration-[200ms] ${hasStarted && isPreviewCollapsed ? 'max-w-3xl mx-auto' : ''}`}>
              <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-2 md:px-3 py-6 [&::-webkit-scrollbar]:hidden ${!hasStarted ? 'flex flex-col items-center justify-end w-full pb-[10vh]' : 'md:mt-16'}`}>
                {!hasStarted && <div className="flex flex-col items-center justify-center text-center opacity-40 w-full mb-10"><img src={LOGO_URL} alt="Wok" className="w-12 h-12 object-contain mb-4 grayscale brightness-0 invert opacity-60" /><h2 className="text-[24px] font-bold text-white">How can I help you today?</h2></div>}
                {messages?.map((msg, idx) => (<div key={idx}>{msg.role === 'assistant' ? <AssistantMessage content={msg.content} isGenerating={false} query={msg.content} /> : <CustomUserMessageBubble msg={msg} />}</div>))}
                <AssistantMessage content={ficheContent} isGenerating={isLoading} query={currentQuery} />
                <div ref={messagesEndRef} className="h-4" />
              </div>
              <div className={`flex-shrink-0 p-3 md:p-4 bg-[#0F0F0F] overflow-visible ${!hasStarted ? 'pb-10 w-full' : ''}`}>
                <ChatInputBar input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop} isLoading={isLoading} files={files} setFiles={setFiles} discussMode={discussMode} setDiscussMode={setDiscussMode} />
              </div>
            </div>
          </div>
          
          {/* ── PREVIEW PANEL ── */}
          {hasStarted && (
  <div className={`bg-[#0F0F0F] p-0 md:p-0 overflow-hidden flex flex-col transition-all duration-[200ms] ease-[cubic-bezier(0,0,0.2,1)] ${mobileView === 'preview' || window.innerWidth >= 768 ? 'flex' : 'hidden'} ${isPreviewCollapsed ? 'w-0 opacity-0 flex-none' : 'flex-1 opacity-100'} z-0 relative`}>
    <div className="w-full h-full flex flex-col overflow-hidden min-w-full md:min-w-[800px] transition-none bg-[#0F0F0F]">
      <WorkspaceHeader 
        onReload={handleReload} 
        convId={conversationId || convId} 
        viewMode={viewMode}
        setViewMode={setViewMode}
        customSlug={customSlug}
        setCustomSlug={setCustomSlug}
        onTogglePreview={() => setIsPreviewCollapsed(true)}
      />
      <div className="flex-1 overflow-hidden relative bg-[#0F0F0F] p-4 pt-0">
        {isLoading && !ficheContent ? (
          <PreviewSkeleton />
        ) : (
          <FichePanel 
            content={ficheContent} 
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
            onUpdateContent={setFicheContent}
          />
        )}
      </div>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
}