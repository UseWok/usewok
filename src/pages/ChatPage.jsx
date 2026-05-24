// ─────────────────────────────────────────────────────────────────────────────
// ChatPage.jsx  ── Layout updated for floating preview panel with 200ms Ease-Out
// ─────────────────────────────────────────────────────────────────────────────

// ============================================================================
// ► 1. IMPORTS & DEPENDENCIES
// ============================================================================
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
import { getTheme } from '@/lib/theme';

import WorkspaceHeader from '@/components/chat/WorkspaceHeader';
import FichePanel from '@/components/chat/FichePanel';
import ChatInputBar from '@/components/chat/ChatInputBar';
import AssistantMessage from '@/components/chat/AssistantMessage';
import ChatProfileMenu from '@/components/chat/ChatProfileMenu';
import ChatWorkspaceSidebar from '@/components/chat/ChatWorkspaceSidebar';

import { 
  X, ChevronDown, Check, MoreHorizontal, Edit2, Trash2, ChevronsLeft, PanelLeft, PanelLeftClose, Plus, ArrowUpCircle, Key, Settings, LifeBuoy, Home, MessageSquare, Cpu, Menu
} from 'lucide-react';


// ============================================================================
// ► 2. SUB-COMPONENTS (BUBBLES & MODALS)
// ============================================================================
const CustomUserMessageBubble = ({ msg }) => (
  <div className="flex flex-col items-end w-full mb-6 font-sans px-1 md:px-0 gap-2">
    {/* Images above the text bubble */}
    {(msg.images?.length || 0) > 0 && (
      <div className="flex flex-wrap gap-2 justify-end max-w-[90%] md:max-w-[85%]">
        {msg.images.map((imgUrl, i) => (
          <img
            key={i}
            src={imgUrl}
            alt="attachment"
            className="max-w-[240px] max-h-[200px] rounded-2xl object-cover shadow-md border border-border"
          />
        ))}
      </div>
    )}
    {msg.content && (
      <div 
        className="bg-[#1A1A1A] dark:bg-[#1A1A1A] text-white border border-[#2A2A2A] text-[15px] leading-relaxed px-5 py-3 rounded-[20px] max-w-[90%] md:max-w-[85%] whitespace-pre-wrap shadow-sm"
        style={{ fontFamily: '"Open Sans", sans-serif' }}
      >
        {msg.content}
      </div>
    )}
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
        {actionText && (
          <div className="p-4 border-t border-border flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
            <button onClick={onAction} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0055FF] hover:bg-[#0044CC] rounded-md transition-colors shadow-sm">{actionText}</button>
          </div>
        )}
      </div>
    </div>
  );
};


// ============================================================================
// ► 3. UTILITIES, CONSTANTS & PROMPTS
// ============================================================================
const getLocalDiscussions = (workspaceId) => {
  try { return JSON.parse(localStorage.getItem(`wok_discussions_${workspaceId}`)) || []; } catch { return []; }
};
const saveLocalDiscussions = (workspaceId, data) => {
  localStorage.setItem(`wok_discussions_${workspaceId}`, JSON.stringify(data));
};

// ── Analysis agent: fast binary decision — 1=modify existing, 2=create new ──
const PROMPT_ANALYST = `You are a routing agent. Analyze the user prompt.
Reply with ONLY a single digit:
1 = The user wants to MODIFY or improve an existing interface (words like "change", "fix", "update", "add to", "improve", "make it", "can you", etc.)
2 = The user wants to CREATE a completely NEW interface from scratch (new topic, different subject).
Reply with 1 or 2 only. No explanation.`;

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


// ============================================================================
// ► 4. SKELETON LOADERS (UI STATES)
// ============================================================================

// ── Ghost skeleton drawn top-to-bottom while AI is generating the preview ──
const SkeletonRow = ({ width, height = 14, delay = 0, opacity = 1 }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const base = isDark ? '#1a1a1a' : '#EAECF0';
  const highlight = isDark ? '#242424' : '#F3F4F6';
  return (
    <div
      style={{
        width,
        height,
        opacity,
        borderRadius: 8,
        flexShrink: 0,
        background: `linear-gradient(90deg, ${base} 25%, ${highlight} 50%, ${base} 75%)`,
        backgroundSize: '600px 100%',
        animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${delay}ms both`,
      }}
    />
  );
};

const PreviewSkeleton = () => {
  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#0F0F0F' : '#F3F4F6';
  const card1 = isDark ? '#161616' : '#E5E7EB';
  const card2 = isDark ? '#1f1f1f' : '#EAECF0';
  const shimmerA = isDark ? '#141414' : '#E5E7EB';
  const shimmerB = isDark ? '#1d1d1d' : '#EAECF0';
  return (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: bg,
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
            background: `linear-gradient(90deg, ${card1} 25%, ${card2} 50%, ${card1} 75%)`,
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
        background: `linear-gradient(90deg, ${shimmerA} 25%, ${shimmerB} 50%, ${shimmerA} 75%)`,
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
            background: `linear-gradient(90deg, ${shimmerA} 25%, ${shimmerB} 50%, ${shimmerA} 75%)`,
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
};

// Add skeleton component for chat loading
const ChatLoadingSkeleton = () => (
  <div className="flex-1 flex flex-col justify-end p-6 space-y-6">
    <div className="space-y-4 max-w-2xl mx-auto w-full">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex justify-start">
          <div
            style={{
              width: `${70 + (i * 10)}%`,
              height: 60,
              borderRadius: 20,
              background: 'linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)',
              backgroundSize: '600px 100%',
              animation: `wok-shimmer 1.4s ease-out infinite, wok-slide-in 200ms ease-out ${i * 100}ms both`,
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

const SidebarLoadingSkeleton = () => (
  <div className="px-4 space-y-2 mt-6">
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        style={{
          width: '100%',
          height: 40,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)',
          backgroundSize: '600px 100%',
          animation: `wok-shimmer 1.4s ease-out infinite, wok-slide-in 200ms ease-out ${i * 80}ms both`,
        }}
      />
    ))}
  </div>
);


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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState('chat');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  
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
    if (newWorkspaceName.trim().length < 3) { toast.error("Workspace name must be at least 3 characters."); return; }
    if (workspaces.length >= 4) { toast.error("Maximum limit of 4 workspaces reached."); return; }
    const newWs = { id: `ws_${Date.now()}`, name: newWorkspaceName.trim(), current: true };
    const updated = workspaces.map(w => ({ ...w, current: false })).concat(newWs);
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    setDiscussions([]); 
    setShowWorkspaceModal(false);
    setNewWorkspaceName('');
    navigate('/app'); 
    toast.success("Workspace created.");
  };

  const handleSwitchWorkspace = (id) => {
    const updated = workspaces.map(w => ({ ...w, current: w.id === id }));
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    setDiscussions(getLocalDiscussions(id) || []);
    setShowWorkspaceSwitcher(false);
    navigate('/app'); 
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

  const handleDrop = (idx) => {
    if (draggedItemIdx === null || draggedItemIdx === idx) return;
    const newDiscussions = [...discussions];
    const [draggedItem] = newDiscussions.splice(draggedItemIdx, 1);
    newDiscussions.splice(idx, 0, draggedItem);
    setDiscussions(newDiscussions);
    saveLocalDiscussions(currentWorkspace.id, newDiscussions);
    setDraggedItemIdx(null); setDragOverIdx(null);
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
    } catch {}
  };

  const handleUpdateCredits = async (cost) => {
      if(!user) return;
      const newUsed = (user.credits_used || 0) + cost;
      await base44.entities.User.update(user.id, { credits_used: newUsed });
      setUser(prev => ({...prev, credits_used: newUsed}));
  };


  // ────────────────────────────────────────────────────────────────────────
  //   5.5 CORE CHAT LOGIC
  // ────────────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text, options = {}) => {
    if ((!text?.trim() && !(options.files?.length)) || isLoading) return;
    
    // Capture image previews from attached files
    const imageUrls = (options.files || files || [])
      .filter(f => f.type?.startsWith('image/'))
      .map(f => f.url);

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

      // ── Step 1: Analysis agent — binary decision (modify=1 vs new=2) ──
      const analystResult = await base44.integrations.Core.InvokeLLM({
        prompt: PROMPT_ANALYST + "\n\nUser prompt: " + text + (ficheContent ? "\n\n[Existing interface: YES]" : "\n\n[Existing interface: NO]"),
        model: 'gemini_3_flash'
      });
      if (abortedRef.current) return;
      const decision = String(typeof analystResult === 'string' ? analystResult : JSON.stringify(analystResult)).trim();
      const isModification = decision === '1' && !!ficheContent;

      // ── Step 2: Data/theme analysis ──
      const textResult = await base44.integrations.Core.InvokeLLM({ 
        prompt: PROMPT_PSYCHOLOGIST + "\n\nUser Query:\n" + text, 
        model: 'gemini_3_flash' 
      });

      if (abortedRef.current) return;
      const psychologicalText = typeof textResult === 'string' ? textResult : JSON.stringify(textResult);

      // ── Step 3: Code generation — include existing code if modifying ──
      const architectPrompt = isModification
        ? PROMPT_ARCHITECT + "\n\n[MODIFICATION REQUEST — update the existing code, return the full updated component]\n\nExisting code:\n" + ficheContent + "\n\n[DATA UPDATE]:\n" + psychologicalText
        : PROMPT_ARCHITECT + "\n\n[EXPAND THIS DATA INTO A $10K UI]:\n" + psychologicalText;

      const codeResult = await base44.integrations.Core.InvokeLLM({ 
        prompt: architectPrompt, 
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

      // Credit logic: base = 1 credit. If usage already exceeds 2× the average monthly allowance → 2 credits.
      const creditsLimit = userPlan?.credits_limit || user?.credits_limit || 10;
      const creditsUsed = user?.credits_used || 0;
      const avgMonthly = creditsLimit; // average = the plan limit itself
      const multiplier = creditsUsed >= avgMonthly * 2 ? 2 : 1;
      const cost = multiplier;
      await handleUpdateCredits(cost);

      // Increment project counter for new interfaces
      if (!isModification && !discussMode && user) {
        const newCount = (user.project_count || 0) + 1;
        setProjectNumber(newCount);
        base44.entities.User.update(user.id, { project_count: newCount }).catch(() => {});
        setUser(prev => ({ ...prev, project_count: newCount }));
      }

      setIsLoading(false);
      if (!discussMode) setFicheContent(rawContent);
      
      const finalMsgs = [...newMessages, { role: 'assistant', content: chatDisplayContent, rawContent: rawContent }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);
      // Sync to cloud so refresh always restores the conversation
      const { syncConversationToCloud } = await import('@/lib/discussions');
      syncConversationToCloud(convId, finalMsgs, { title: text.slice(0, 80), preview: text.slice(0, 120) });
      saveToDiscussionsLogic("New Chat", text);
      // Update URL to include conversationId without triggering re-render
      if (!conversationId) {
        window.history.replaceState(null, '', `/chat?conversationId=${convId}`);
      }
      
      if (window.innerWidth < 768 && !discussMode) {
        setMobileView('preview');
      }

    } catch (err) {
      setIsLoading(false); 
      setMessages([...newMessages, { role: 'assistant', content: "System architecture failed." }]);
      return;
    }
  }, [messages, isLoading, discussMode, currentWorkspace, user, ficheContent]);

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


  // ────────────────────────────────────────────────────────────────────────
  //   5.6 APP SETTINGS & META LOGIC
  // ────────────────────────────────────────────────────────────────────────
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
    initAgentsFromDB().catch(() => {});
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.id) setCurrentUser(u.id);
      setUserPlan(getUserPlan(u));
      setProjectNumber(u?.project_count || 0);
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

  useEffect(() => {
    if (runtimeError && !isLoading) {
      const bt = String.fromCharCode(96);
      const promptMsg = `The following errors happened in the app:\n\n${bt}${bt}${bt}\n${runtimeError}\n${bt}${bt}${bt}\n\nPlease help me fix these errors.`;
      const savedError = runtimeError;
      setRuntimeError(null);
      sendMessage(promptMsg, { isCorrection: true, rawError: savedError });
    }
  }, [runtimeError, isLoading, sendMessage]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/app', active: location.pathname === '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions', active: location.pathname === '/discussions' },
    { icon: Cpu, label: 'DNA Wok', path: '/ai-dna', active: location.pathname === '/ai-dna' },
  ];


  // ────────────────────────────────────────────────────────────────────────
  //   5.8 RENDER (JSX)
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex font-sans h-screen w-full bg-background overflow-hidden antialiased relative">

      {/* Workspace Sidebar */}
      <ChatWorkspaceSidebar
        open={isSidebarOpen}
        setOpen={setIsSidebarOpen}
        user={user}
        convId={conversationId || convId}
      />

      {/* "Wok" brand trigger (top left) — opens profile/credits menu */}
      <div className="absolute top-3 left-3 z-[999] flex items-center gap-2">
        <ChatProfileMenu user={user} userPlan={userPlan} />
      </div>

      {/* Sidebar toggle (hidden from main UI, opened via sidebar button inside ChatProfileMenu) */}
      {/* Publish button — top right */}
      <div className="absolute top-3 right-3 z-[999]">
        <button
          onClick={() => {/* handled inside WorkspaceHeader */}}
          className="px-4 py-1.5 bg-[#0055FF] text-white text-[12px] font-bold rounded-lg hover:bg-[#0044CC] shadow-sm transition-colors hidden"
        />
      </div>

      {/* ── MODALS & OVERLAYS ── */}
      <ProModal open={showWorkspaceModal} onClose={() => setShowWorkspaceModal(false)} title="Create a workspace" subtitle="Start collaborating with your workspace members" actionText="Create workspace" onAction={handleCreateWorkspace}>
        <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Workspace name *</label>
        <input type="text" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)} placeholder="Choose a name..." className="w-full border border-border bg-background text-foreground rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[#0055FF] mb-4" autoFocus />
        <div className="bg-muted p-4 rounded-lg border border-border">
          <h4 className="text-[12px] font-bold text-foreground mb-2.5">What happens next?</h4>
          <ul className="text-[11.5px] text-muted-foreground space-y-2">
            <li>• You will be the owner with full management permissions</li>
            <li>• You can invite members and manage licenses</li>
            <li>• Access your workspace dashboard to get started</li>
          </ul>
        </div>
      </ProModal>

      <ProModal open={showCodeModal} onClose={() => setShowCodeModal(false)} title="Redeem Code" actionText="Apply" onAction={() => setShowCodeModal(false)}>
        <input type="text" placeholder="XXXX-XXXX-XXXX" className="w-full border border-border bg-background text-foreground rounded-md px-3 py-2 text-[13px] focus:outline-none" />
      </ProModal>

      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />



      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full bg-background">

        {/* ══ DESKTOP LAYOUT (md+) ══ */}
        <div className="hidden md:flex flex-1 overflow-hidden w-full h-full">

          {/* Chat panel — desktop */}
          <div className={`flex flex-col bg-background overflow-hidden transition-all duration-200 ease-out ${isPreviewCollapsed ? 'flex-1' : 'w-[34%] flex-shrink-0'}`}>
            {isPreviewCollapsed && hasStarted && (
              <div className="absolute top-4 right-4 z-[999]">
                <button onClick={() => setIsPreviewCollapsed(false)} className="p-2.5 text-muted-foreground hover:text-foreground rounded-md bg-card border border-border shadow-sm flex items-center justify-center">
                  <ChevronsLeft className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className={`flex flex-col w-full h-full ${isPreviewCollapsed ? 'max-w-3xl mx-auto' : ''}`}>
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 py-6 mt-14 [&::-webkit-scrollbar]:hidden">
                {!hasStarted && (
                  <div className="flex flex-col items-center justify-center text-center opacity-40 w-full mt-20">
                    <img src={LOGO_URL} alt="Wok" className="w-12 h-12 object-contain mb-4 grayscale dark:invert opacity-60" />
                    <h2 className="text-[24px] font-bold text-foreground">How can I help you today?</h2>
                  </div>
                )}
                {messages?.map((msg, idx) => (
                  <div key={idx}>
                    {msg.role === 'assistant'
                      ? <AssistantMessage content={msg.content} isGenerating={false} query={msg.content} />
                      : <CustomUserMessageBubble msg={msg} />}
                  </div>
                ))}
                <AssistantMessage content={ficheContent} isGenerating={isLoading} query={currentQuery} />
                <div ref={messagesEndRef} className="h-4" />
              </div>
              <div className="flex-shrink-0 p-4 overflow-visible">
                <ChatInputBar input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop} isLoading={isLoading} files={files} setFiles={setFiles} discussMode={discussMode} setDiscussMode={setDiscussMode} />
              </div>
            </div>
          </div>

          {/* Preview panel — desktop: floats as a rounded card with padding */}
          <div className={`flex flex-col overflow-hidden transition-all duration-200 ease-out relative ${isPreviewCollapsed ? 'w-0 opacity-0 flex-none pointer-events-none' : 'flex-1 opacity-100'}`}>
            {!ficheContent && !isLoading && <div className="absolute inset-0 z-20 cursor-not-allowed" />}
            {/* Toolbar sits directly on background, no border/bg */}
            <WorkspaceHeader
              onReload={handleReload}
              onReloadIframe={() => setIframeRefreshKey(k => k + 1)}
              convId={conversationId || convId}
              projectNumber={projectNumber}
              discussions={discussions}
              onSelectDiscussion={(id) => navigate(`/chat?conversationId=${id}`)}
              onTogglePreview={() => setIsPreviewCollapsed(true)}
            />
            {/* Floating preview card — padded, rounded, no edge touch */}
            <div className="flex-1 overflow-hidden relative px-4 pb-4">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-md bg-card">
                {isLoading && !ficheContent ? (
                  <PreviewSkeleton />
                ) : (
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
                    onUpdateContent={setFicheContent}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══ MOBILE LAYOUT (< md) ══ */}
        <div className="flex md:hidden flex-col flex-1 overflow-hidden">

          {/* Mobile tab bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background flex-shrink-0 mt-12">
            <div className="flex bg-muted border border-border p-1 rounded-lg gap-0.5 w-full">
              <button
                onClick={() => setMobileView('chat')}
                className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${mobileView === 'chat' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
              >
                Chat
              </button>
              <button
                onClick={() => setMobileView('preview')}
                disabled={!ficheContent && !isLoading}
                className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${mobileView === 'preview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'} ${!ficheContent && !isLoading ? 'opacity-30' : ''}`}
              >
                Preview {isLoading && mobileView !== 'preview' && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full ml-1 animate-pulse align-middle" />}
              </button>
            </div>
          </div>

          {/* Mobile: Chat view */}
          {mobileView === 'chat' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden">
                {!hasStarted && (
                  <div className="flex flex-col items-center justify-center text-center opacity-40 w-full mt-16">
                    <img src={LOGO_URL} alt="Wok" className="w-10 h-10 object-contain mb-3 grayscale dark:invert opacity-60" />
                    <h2 className="text-[20px] font-bold text-foreground">How can I help you?</h2>
                  </div>
                )}
                {messages?.map((msg, idx) => (
                  <div key={idx}>
                    {msg.role === 'assistant'
                      ? <AssistantMessage content={msg.content} isGenerating={false} query={msg.content} />
                      : <CustomUserMessageBubble msg={msg} />}
                  </div>
                ))}
                <AssistantMessage content={ficheContent} isGenerating={isLoading} query={currentQuery} />
                <div ref={messagesEndRef} className="h-4" />
              </div>
              <div className="flex-shrink-0 p-3">
                <ChatInputBar input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop} isLoading={isLoading} files={files} setFiles={setFiles} discussMode={discussMode} setDiscussMode={setDiscussMode} />
              </div>
            </div>
          )}

          {/* Mobile: Preview view */}
          {mobileView === 'preview' && (
            <div className="flex flex-col flex-1 overflow-hidden bg-background relative">
              {!ficheContent && !isLoading && <div className="absolute inset-0 z-20" />}
              <WorkspaceHeader
                onReload={handleReload}
                onReloadIframe={() => setIframeRefreshKey(k => k + 1)}
                convId={conversationId || convId}
                projectNumber={projectNumber}
                discussions={discussions}
                onSelectDiscussion={(id) => { navigate(`/chat?conversationId=${id}`); setMobileView('chat'); }}
                onTogglePreview={() => setMobileView('chat')}
              />
              <div className="flex-1 overflow-hidden relative">
                {isLoading && !ficheContent ? (
                  <PreviewSkeleton />
                ) : (
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
                    onUpdateContent={setFicheContent}
                  />
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}