import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import { LOGO_URL, isGibberish, GIBBERISH_RESPONSES } from '@/lib/chat-constants';
import { ALL_MODES } from '@/lib/modes-config';
import { getUserPlan, getPlansConfig } from '@/lib/plans-config';
import { getConversationMessages, saveConversationMessages, setCurrentUser, loadConversationFromCloud, loadConversationTitleFromCloud } from '@/lib/discussions';
import { initAgentsFromDB } from '@/lib/agents-config';
import { getUserColor } from '@/lib/user-color';

import WorkspaceHeader from '@/components/chat/WorkspaceHeader';
import FichePanel from '@/components/chat/FichePanel';
import ChatInputBar from '@/components/chat/ChatInputBar';
import AssistantMessage from '@/components/chat/AssistantMessage';

// IMPORT OVERLAY PAGES
import SupportPage from '@/pages/SupportPage';
import SettingsPage from '@/pages/SettingsPage';
import PricingPage from '@/pages/PricingPage';

import { 
  Home, MessageSquare, Cpu, PanelLeftClose, PanelLeft, Plus, Settings, LifeBuoy, ArrowUpCircle, Key, ChevronDown, Check, X, MoreHorizontal, Edit2, Trash2, Sparkles, AlertTriangle
} from 'lucide-react';

const CustomUserMessageBubble = ({ msg }) => (
  <div className="flex justify-end w-full mb-6 font-sans px-4 md:px-0 transition-none">
    <div 
      className="bg-[#E8E8E8] text-[#0d0d0d] text-[15px] leading-relaxed px-5 py-3 rounded-[20px] max-w-[90%] md:max-w-[85%] whitespace-pre-wrap shadow-none border-none transition-none"
      style={{ fontFamily: '"Open Sans", sans-serif' }}
    >
      {msg.content}
    </div>
  </div>
);

// --- ENTERPRISE REDEEM CODE MODAL ---
const RedeemCodeModal = ({ open, onClose, user, setUser, setUserPlan }) => {
  const [activationCode, setActivationCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');

  if (!open) return null;

  const activateCode = async () => {
    setCodeError('');
    if (!activationCode.trim()) { setCodeError('Please enter a valid activation code.'); return; }
    if (activationCode.trim().length < 8) { setCodeError('The code is too short. Please verify your input.'); return; }
    if (!user) return;
    setCodeLoading(true);
    const results = await base44.entities.ActivationCode.filter({ code: activationCode.trim(), used: false });
    if (results.length === 0) {
      const anyMatch = await base44.entities.ActivationCode.filter({ code: activationCode.trim() });
      setCodeError(anyMatch.length > 0 ? 'This code has already been redeemed.' : 'Code not found. Please double-check your spelling.');
      setCodeLoading(false); return;
    }
    const codeRecord = results[0];
    const plans = getPlansConfig();
    const newPlan = plans.find(p => p.id === codeRecord.plan_id);
    if (!newPlan) { setCodeError('The plan associated with this code is no longer valid.'); setCodeLoading(false); return; }

    const currentPlan = getUserPlan(user);
    const currentRank = plans.findIndex(p => p.id === currentPlan.id);
    const newRank = plans.findIndex(p => p.id === newPlan.id);
    const keepCurrent = currentRank > newRank && currentPlan.price_monthly > 0;

    if (keepCurrent) {
      const bonusCredits = newPlan.credits_limit;
      await base44.auth.updateMe({ credits_bonus: (user.credits_bonus || 0) + bonusCredits });
      toast.success(`Code applied! +${bonusCredits} bonus credits added to your ${currentPlan.name} plan.`);
    } else {
      await base44.auth.updateMe({
        subscription_plan: newPlan.id, credits_limit: newPlan.credits_limit, credits_used: 0,
        credits_bonus: 0, billing_cycle: codeRecord.billing || 'monthly', subscription_date: new Date().toISOString(),
      });
      toast.success(`${newPlan.name} plan successfully activated!`);
    }
    await base44.entities.ActivationCode.update(codeRecord.id, { used: true, used_by: user.email });
    setActivationCode('');
    const updated = await base44.auth.me();
    setUser(updated); setUserPlan(getUserPlan(updated));
    setCodeLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-black/80 p-4 transition-none antialiased">
      <div className="relative w-full max-w-[500px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 transition-none">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-slate-100 rounded-full transition-none">
          <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
        </button>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-8 sm:p-10 relative overflow-hidden transition-none">
          <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none">
            <Key className="w-48 h-48 text-blue-900" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#0062FF] rounded-2xl flex items-center justify-center shadow-lg mb-6 transition-none">
               <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Redeem Activation Code</h3>
            <p className="text-[14px] text-slate-600 mb-8 max-w-sm leading-relaxed">
              Unlock enterprise features or add bulk computing resources to your workspace by entering your secure activation key below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                value={activationCode} 
                onChange={e => setActivationCode(e.target.value.toUpperCase())}
                placeholder="Ex: WOK-9A7X-M2P4" 
                maxLength={20}
                className={`flex-1 px-4 py-3.5 text-[14px] font-mono font-bold tracking-widest bg-white border rounded-xl focus:outline-none focus:ring-4 transition-none shadow-sm ${codeError ? 'border-red-300 focus:ring-red-500/20 text-red-900' : 'border-slate-200 focus:ring-[#0062FF]/20 focus:border-[#0062FF] text-slate-900'}`}
                onKeyDown={e => { if (e.key === 'Enter') activateCode(); }} 
              />
              <button 
                onClick={activateCode} 
                disabled={codeLoading || !activationCode.trim()}
                className="px-8 py-3.5 text-[14px] font-bold bg-[#0062FF] text-white rounded-xl disabled:opacity-40 hover:bg-[#0052CC] transition-none shadow-md whitespace-nowrap"
              >
                {codeLoading ? 'Authenticating...' : 'Unlock Features'}
              </button>
            </div>
            <AnimatePresence>
              {codeError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2.5 px-4 py-3 bg-white border border-red-200 rounded-xl shadow-sm transition-none">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-[13px] font-semibold text-red-600">{codeError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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

  const [customSlug, setCustomSlug] = useState(convId || `conv_${Date.now().toString().slice(-6)}`);
  
  // ALGORITHM: Calculate sequential Project ID based on discussion count starting from 103
  const projectSequenceNumber = discussions.length > 0 ? 103 + discussions.length : 103;
  
  const [appSettings, setAppSettings] = useState({
    title: `Project #${projectSequenceNumber}`,
    description: 'A highly optimized interactive experience built with Wok.',
    isPublic: false,
    showBadge: true,
    appIcon: null
  });

  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [mobileView, setMobileView] = useState('chat');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // GLOBAL MODAL STATES
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  const [runtimeError, setRuntimeError] = useState(null);

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
      saveToDiscussionsLogic(`Project #${projectSequenceNumber}`, text);
      
      if (window.innerWidth < 768 && !discussMode) {
        setMobileView('preview');
      }

    } catch (err) {
      setIsLoading(false); 
      setMessages([...newMessages, { role: 'assistant', content: "System architecture failed." }]);
      return;
    }
  }, [messages, isLoading, discussMode, currentWorkspace, user, ficheContent, projectSequenceNumber]);

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

  const handleUpdateSlug = async (newSlug) => {
    const slug = newSlug.trim();
    if(!slug) { toast.error("The path cannot be empty."); return; }
    if (!/^[a-z0-9-]{1,30}$/.test(slug)) { toast.error("Invalid URL. Use only lowercase letters, numbers, and hyphens. (Max 30 chars)"); return; }
    try {
      if (convId) await base44.entities.Conversation.update(convId, { slug: slug });
      setCustomSlug(slug);
      toast.success("Domain configuration saved to the Cloud.");
    } catch (error) {
      setCustomSlug(slug);
      toast.error("Waiting for backend configuration. Local URL updated.");
    }
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

  return (
    <div className="flex font-sans h-screen w-full bg-[#FAFAFA] overflow-hidden antialiased relative transition-none">
      
      {!isSidebarOpen && (
        <div className="absolute top-4 left-4 z-[999] transition-none">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-none rounded-md bg-white border border-[#E5E5E5] shadow-sm">
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* RENDER THE 95% OVERLAYS WITHOUT ROUTING */}
      <RedeemCodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} user={user} setUser={setUser} setUserPlan={setUserPlan} />
      <SupportPage open={showSupportPage} onClose={() => setShowSupportPage(false)} />
      <SettingsPage open={showSettingsPage} onClose={() => setShowSettingsPage(false)} />
      <PricingPage open={showPricingPage} onClose={() => setShowPricingPage(false)} />

      <aside className={`flex-shrink-0 h-full border-r border-slate-200 flex flex-col z-[50] transition-none absolute md:relative bg-white ${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full md:w-0 md:translate-x-0 overflow-hidden'}`}>
        <div className="w-[260px] flex flex-col h-full bg-white transition-none">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between transition-none">
             <h1 className="text-2xl font-[800] italic tracking-tighter text-slate-900">WOK</h1>
             <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-none border border-slate-200 bg-white shadow-none">
               <PanelLeftClose className="w-4 h-4" />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 mt-6 transition-none">
             <div className="text-[11px] font-bold text-slate-400 mb-3 px-1 tracking-wider uppercase">Recents</div>
             <ul className="space-y-0.5 transition-none">
                {discussions?.map((d, idx) => (
                  <li key={d.id} draggable onDragStart={() => setDraggedItemIdx(idx)} onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }} onDrop={() => handleDrop(idx)} onClick={() => { navigate(`/chat?conversationId=${d.id}`); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className={`relative flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer group transition-none ${conversationId === d.id ? 'bg-slate-100' : 'border border-transparent hover:bg-slate-50'}`}>
                    {editingId === d.id ? (
                      <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={() => saveEdit(d.id)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(d.id)} className="w-full bg-white border border-[#0062FF] text-[13px] rounded px-2 py-0.5 focus:outline-none transition-none" onClick={(e) => e.stopPropagation()} />
                    ) : (
                      <>
                        <div className="flex items-center gap-3 truncate w-[80%] transition-none">
                          <span onClick={(e) => { e.stopPropagation(); updateDiscussion(d.id, { emoji: prompt("Enter emoji:", d.emoji || "📄") || d.emoji }); }} className="text-[14px] hover:opacity-70 transition-none">{d.emoji || '📄'}</span>
                          <span className={`text-[13px] font-medium truncate transition-none ${conversationId === d.id ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{d.title || `Project #${103 + idx}`}</span>
                        </div>
                        <div className="hidden group-hover:flex items-center gap-1.5 pl-2 transition-none">
                          <button onClick={(e) => startEditing(e, d)} className="text-slate-400 hover:text-slate-900 transition-none"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => deleteDiscussion(e, d.id)} className="text-slate-400 hover:text-red-500 transition-none"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </>
                    )}
                    {dragOverIdx === idx && <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#0062FF] rounded-full z-10 transition-none" />}
                  </li>
                ))}
             </ul>
          </div>

          <div className="px-4 py-3 border-t border-slate-100 mt-auto transition-none">
            <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 w-full py-2 bg-[#0062FF] text-white rounded-md text-[13px] font-bold hover:bg-[#0052CC] shadow-sm transition-none">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>

          <div className="p-4 border-t border-slate-100 relative transition-none" ref={profileMenuRef}>
            {isProfileMenuOpen && (
              <div className="absolute bottom-[calc(100%+12px)] left-4 w-[240px] bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 font-sans p-1.5 transition-none">
                <div className="px-3 py-2.5 border-b border-slate-100 mb-1 transition-none">
                  <p className="text-[13px] font-bold text-slate-900 truncate">{user?.full_name || 'User'}</p>
                  <p className="text-[11.5px] text-slate-500 truncate">Plan: {userPlan?.name || 'Free'}</p>
                </div>
                <button onClick={() => { setIsProfileMenuOpen(false); setShowSettingsPage(true); }} className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-md transition-none"><Settings className="w-4 h-4 text-slate-400" /> Settings</button>
                <button onClick={() => { setIsProfileMenuOpen(false); setShowSupportPage(true); }} className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-md transition-none"><LifeBuoy className="w-4 h-4 text-slate-400" /> Support Center</button>
                <div className="h-px bg-slate-100 my-1 mx-2 transition-none"></div>
                <button onClick={() => { setIsProfileMenuOpen(false); setShowPricingPage(true); }} className="w-full text-left px-3 py-2 text-[13px] text-slate-900 font-bold hover:bg-slate-50 flex items-center gap-2.5 group rounded-md transition-none"><ArrowUpCircle className="w-4 h-4 text-[#0062FF]" /> Upgrade Plan</button>
                <button onClick={() => { setIsProfileMenuOpen(false); setShowCodeModal(true); }} className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-md transition-none"><Key className="w-4 h-4 text-slate-400" /> Redeem Code</button>
              </div>
            )}
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-none w-full text-left">
              <div className="w-9 h-9 rounded-md flex items-center justify-center text-white text-[13px] font-bold shadow-sm transition-none" style={{ backgroundColor: '#0062FF' }}>{(user?.full_name || 'U').charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0 transition-none"><p className="text-[13px] font-bold text-slate-900 truncate">{user?.full_name || 'User'}</p></div>
              <MoreHorizontal className="w-4 h-4 text-slate-400 transition-none" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full transition-none">
        <div className="flex items-center justify-end p-3 md:hidden transition-none">
          {hasStarted && (
            <div className="flex bg-slate-100 p-1 rounded-md ml-auto z-50 transition-none">
              <button onClick={() => setMobileView('chat')} className={`px-4 py-1 text-[12px] font-bold rounded transition-none ${mobileView === 'chat' ? 'bg-white shadow-sm text-black' : 'text-slate-500'}`}>Chat</button>
              <button onClick={() => setMobileView('preview')} className={`px-4 py-1 text-[12px] font-bold rounded transition-none ${mobileView === 'preview' ? 'bg-white shadow-sm text-black' : 'text-slate-500'}`}>Preview</button>
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden w-full h-full transition-none">
          <div className={`flex flex-col bg-white overflow-visible transition-none ${mobileView === 'chat' || window.innerWidth >= 768 ? 'flex' : 'hidden'} ${hasStarted ? 'w-full md:w-[23%] md:min-w-[300px] md:max-w-[340px] border-r border-[#E5E5E5] z-[100]' : 'w-full h-full justify-center max-w-3xl mx-auto z-10'}`}>
            <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-4 md:px-6 py-6 [&::-webkit-scrollbar]:hidden transition-none ${!hasStarted ? 'flex flex-col items-center justify-end w-full pb-[10vh]' : 'md:mt-16'}`}>
              {!hasStarted && <div className="flex flex-col items-center justify-center text-center opacity-30 w-full mb-10 transition-none"><img src={LOGO_URL} alt="Wok" className="w-12 h-12 object-contain mb-4 grayscale" /><h2 className="text-[24px] font-bold text-[#0d0d0d]">How can I help you today?</h2></div>}
              {messages?.map((msg, idx) => (<div key={idx} className="transition-none">{msg.role === 'assistant' ? <AssistantMessage content={msg.content} isGenerating={false} query={msg.content} /> : <CustomUserMessageBubble msg={msg} />}</div>))}
              <AssistantMessage content={ficheContent} isGenerating={isLoading} />
              <div ref={messagesEndRef} className="h-4 transition-none" />
            </div>
            <div className={`flex-shrink-0 p-3 md:p-4 bg-white overflow-visible transition-none ${!hasStarted ? 'pb-10 w-full' : ''}`}>
              <ChatInputBar input={input} setInput={setInput} onSend={sendMessage} onStop={() => {}} isLoading={isLoading} />
            </div>
          </div>
          
          {hasStarted && (
            <div className={`flex-1 bg-[#FAFAFA] p-0 md:p-0 overflow-hidden flex flex-col relative transition-none ${mobileView === 'preview' || window.innerWidth >= 768 ? 'flex' : 'hidden'} md:w-[77%] z-0`}>
              <div className={`w-full h-full flex flex-col overflow-hidden transition-none bg-[#FAFAFA]`}>
                 <WorkspaceHeader 
                   onReload={handleReload} 
                   convId={conversationId || convId} 
                   viewMode={viewMode}
                   setViewMode={setViewMode}
                   customSlug={customSlug}
                   setCustomSlug={setCustomSlug}
                   appSettings={appSettings}
                 />
                 <div className="flex-1 overflow-hidden relative bg-transparent transition-none">
                   <FichePanel 
                     content={ficheContent} 
                     onError={setRuntimeError} 
                     onSuccess={() => setRuntimeError(null)} 
                     viewMode={viewMode} 
                     setViewMode={setViewMode}
                     appSettings={appSettings}
                     onUpdateSettings={setAppSettings}
                     onClone={handleCloneApp}
                     onDelete={handleDeleteApp}
                     onUnpublish={handleUnpublishApp}
                     customSlug={customSlug}
                     onUpdateSlug={handleUpdateSlug}
                   />
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}