// ChatPage.jsx — lean orchestrator, ~350 lines
// All sub-components are in components/chat/ — all prompts in lib/chat-prompts.js
// All storage helpers in lib/chat-storage.js

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44, cachedAIRequest } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
// motion already imported above

// ── Components ──
import AssistantMessage from '@/components/chat/AssistantMessage';
import ErrorNotification from '@/components/chat/ErrorNotification';
import ChatInputBar from '@/components/chat/ChatInputBar';
import EditModeOverlay from '@/components/chat/EditModeOverlay';
import FichePanel from '@/components/chat/FichePanel';
import ChatWorkspaceSidebar from '@/components/chat/ChatWorkspaceSidebar';
import PreviewLoadingFeature from '@/components/chat/PreviewLoadingFeature';
// ZoomToggle removed
import MessageList from '@/components/chat/MessageList';
// SuggestionsBar removed
import UserMessageBubble from '@/components/chat/UserMessageBubble';
import PublishAppModal from '@/components/chat/PublishAppModal';
import WokHeaderMenu from '@/components/chat/WokHeaderMenu';
import ChatHeader from '@/components/chat/ChatHeader';
import IframeModal from '@/components/chat/IframeModal';
import ProModal from '@/components/chat/ProModal';
import FullscreenIframeModal from '@/components/chat/FullscreenIframeModal';
import PreviewSkeleton from '@/components/chat/PreviewSkeleton';
import HistoryPanel from '@/components/chat/HistoryPanel';
import AnalyticsPanel from '@/components/chat/AnalyticsPanel';
import LogsPanel from '@/components/chat/LogsPanel';
import { appendLog } from '@/components/chat/LogsPanel';


// ── Lib ──
import { safeAsync, checkRateLimit, sanitizeInput } from '@/lib/code-quality';
import { classifyError } from '@/lib/error-handler';
import { initAgentsFromDB } from '@/lib/agents-config';
import { setCurrentUser, loadConversationFromCloud } from '@/lib/discussions';
import { getUserPlan } from '@/lib/plans-config';
import {
  getLocalDiscussions, saveLocalDiscussions,
  getConversationMessages, saveConversationMessages,
  syncToCloud, loadFromCloud, loadDiscussionsFromCloud,
  createConversationInCloud,
} from '@/lib/chat-storage';
import {
  PROMPT_ARCHITECT, PROMPT_DATA_INSIGHT, PROMPT_AUTO_FIX, PROMPT_THINKING,
  CHOCOLATINE_CODE, MODIFY_KEYWORDS, DATA_QUERY_KEYWORDS
} from '@/lib/chat-prompts';
import {
  orchestrateGeneration, patchCode, runSafetyFilter, runAutofixPipeline, MODELS as ORCH_MODELS,
} from '@/lib/ai-orchestrator';
import { formatCode, splitThinkingFromCode } from '@/lib/code-formatter';

// Placeholder stubs (replace with real implementations when available)
const COMPONENT_PACKET = {};
const PROACTIVE_INTELLIGENCE_LAYER = {};
const buildPreferenceHints = () => "";

// ── Center gutter: 2px separator that glows + shows resize handle on hover ──
function ChatGutter() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: hovered ? 8 : 6, flexShrink: 0, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'col-resize', transition: 'width 150ms',
        zIndex: 20,
      }}
    >
      {/* The 2px line */}
      <div style={{
        width: 2, height: '100%', borderRadius: 1,
        background: hovered
          ? 'linear-gradient(180deg, transparent 0%, #F95738 40%, #F95738 60%, transparent 100%)'
          : 'linear-gradient(180deg, transparent 0%, #2A2A2A 30%, #2A2A2A 70%, transparent 100%)',
        boxShadow: hovered ? '0 0 8px rgba(249,87,56,0.5)' : 'none',
        transition: 'background 200ms, box-shadow 200ms',
        pointerEvents: 'none',
      }} />
      {/* Drag handle pill */}
      {hovered && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 16, height: 40, borderRadius: 8,
          background: '#2A2A2A', border: '1px solid #3A3A3A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 2, flexDirection: 'column',
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 2, height: 2, borderRadius: '50%', background: '#555' }} />
          ))}
        </div>
      )}
    </div>
  );
}

const CARD_RADIUS = 16;

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialQ = urlParams.get('q') || '';
  const conversationId = urlParams.get('conversationId') || null;
  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  // ── Auth & user ──
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);

  // ── Workspace ──
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('wok_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'My Workspace', current: true }];
  });
  const currentWorkspace = workspaces.find((w) => w.current) || workspaces[0];
  const [discussions, setDiscussions] = useState(() => getLocalDiscussions(currentWorkspace.id) || []);

  // ── UI state ──
  const [viewMode, setViewMode] = useState('preview');
  const containerRef = useRef(null);
  const [customSlug] = useState(convId || `conv_${Date.now().toString().slice(-6)}`);
  const [appSettings, setAppSettings] = useState({
    title: 'AI-Powered Interface',
    description: 'A highly optimized interactive experience built with Wok.',
    isPublic: true,
    showBadge: true
  });

  // ── Modal state ──
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState('chat');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isAppPublished, setIsAppPublished] = useState(true);
  const [chatVisible, setChatVisible] = useState(true);
  const [iframeRefreshKey, setIframeRefreshKey] = useState(0);
  const [iframeModal, setIframeModal] = useState({ open: false, url: '' });
  const [showHistory, setShowHistory] = useState(false);

  // ── Chat state ──
  const [messages, setMessages] = useState(() => {
    const initial = conversationId ? getConversationMessages(conversationId) : [];
    return Array.isArray(initial) ? initial : [];
  });
  const [isLoadingConversation, setIsLoadingConversation] = useState(
    () => !!conversationId && (getConversationMessages(conversationId)?.length || 0) === 0
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Chat bar background
  const CHAT_BG = '#FAF9F5';
  const [currentQuery, setCurrentQuery] = useState('');
  const [files, setFiles] = useState([]);
  // Restore last generated content on mount (F5 persistence)
  const [ficheContent, setFicheContent] = useState(() => {
    try {
      const key = `fiche_${conversationId || convIdRef.current}`;
      return localStorage.getItem(key) || null;
    } catch { return null; }
  });
  const [discussMode, setDiscussMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [runtimeError, setRuntimeError] = useState(null);
  const [pendingError, setPendingError] = useState(null);
  const [streamingThinking, setStreamingThinking] = useState('');

  const profileMenuRef = useRef(null);
  const abortedRef = useRef(false);

  // ── Credits helper ──
  const handleUpdateCredits = async (cost) => {
    if (!user) return;
    const newUsed = (user.credits_used || 0) + cost;
    await base44.entities.User.update(user.id, { credits_used: newUsed });
    setUser((prev) => ({ ...prev, credits_used: newUsed }));
  };

  // ── Persist discussion to local cache + cloud ──
  const saveToDiscussionsLogic = (convTitle, text, rawContent = null) => {
    try {
      const stored = getLocalDiscussions(currentWorkspace.id);
      const disc = { id: convId, title: convTitle, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), emoji: '💬' };
      const idx = stored.findIndex((d) => d.id === convId);
      if (idx >= 0) stored.splice(idx, 1);
      stored.unshift(disc);
      saveLocalDiscussions(currentWorkspace.id, stored);
      setDiscussions(stored);
    } catch {}
  };

  // ── Workspace handlers ──
  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim().length < 3) { toast.error("Workspace name must be at least 3 characters."); return; }
    if (workspaces.length >= 4) { toast.error("Maximum limit of 4 workspaces reached."); return; }
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

  const deleteDiscussion = (e, id) => {
    e?.stopPropagation?.();
    const updated = discussions.filter((d) => d.id !== id);
    setDiscussions(updated);
    saveLocalDiscussions(currentWorkspace.id, updated);
    if (conversationId === id) navigate('/');
  };

  // ── App meta handlers ──
  const handleUpdateAppMeta = async (newSettings) => {
    setAppSettings(newSettings);
    if (convId) {
      await safeAsync(async () => {
        await base44.entities.Conversation.update(convId, { title: newSettings.title, is_public: newSettings.isPublic });
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
      await syncConversationToCloud(newConvId, messages || [], { title: appSettings.title + ' (Copy)', preview: appSettings.description, is_public: true });
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
    deleteDiscussion(null, convId);
    if (convId) {
      await safeAsync(async () => {
        const results = await base44.entities.Conversation.filter({ conv_id: convId });
        if (results.length > 0) await base44.entities.Conversation.delete(results[0].id);
      }, null, 'Delete conversation');
    }
    toast.success("Application deleted permanently.");
  };

  // ── Error fix handler ──
  const handleFixError = () => {
    if (!pendingError) return;
    const savedError = pendingError;
    setPendingError(null);
    const bt = String.fromCharCode(96);
    sendMessage(`The following errors happened in the app:\n\n${bt}${bt}${bt}\n${savedError}\n${bt}${bt}${bt}\n\nPlease help me fix these errors.`, { isCorrection: true, rawError: savedError });
  };

  // ── Core send logic ──
  const sendMessage = useCallback(async (text, options = {}) => {
    if ((!text?.trim() && !options.files?.length) || isLoading) return;

    // ── Security: sanitize & rate-limit ──
    const safeText = sanitizeInput(text, 4000);
    if (!safeText && !options.files?.length) return;

    if (!checkRateLimit('sendMessage', 8, 15000)) {
      toast.error("Slow down — too many requests. Wait a moment before sending.");
      return;
    }

    // Re-assign text to sanitized version
    text = safeText;

    // ── Heuristic pre-filter (zero API cost) ──
    const trimmed = text.trim();
    const isTooShort = trimmed.length < 8;
    const isRepetitive = /(.)\1{5,}/.test(trimmed); // "aaaaaaa", "1111111"
    const isGibberish = /^[^aeiou\s]{8,}$/i.test(trimmed.replace(/\s/g, '').slice(0, 20)); // no vowels
    const isAllSameWord = /^(\w+)\s+\1+$/i.test(trimmed);
    const isSpam = /^[^a-zA-Z0-9\u00C0-\u017E\s.,!?]+$/.test(trimmed) && trimmed.length > 3;

    if (isTooShort || isRepetitive || isGibberish || isAllSameWord || isSpam) {
      const userMsg = { role: 'user', content: text };
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '__INSUFFICIENT__' }]);
      setInput('');
      setFiles([]);
      return;
    }

    // Easter egg
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
        const check = setInterval(() => { if (abortedRef.current) { clearTimeout(timer); clearInterval(check); resolve(); } }, 200);
      });
      if (abortedRef.current) return;
      await handleUpdateCredits(1);
      const finalMsgs = [...newMessages, { role: 'assistant', content: "Analyse complete. Debat resolu.", rawContent: CHOCOLATINE_CODE }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);
      setFicheContent(CHOCOLATINE_CODE);
      if (convId) {
        await syncToCloud(convId, finalMsgs, { title: 'Chocolatine', preview: 'Le debat ultime', is_public: true, rawContent: CHOCOLATINE_CODE });
        if (!conversationId) window.history.replaceState(null, '', `/chat?conversationId=${convId}`);
      }
      setIsLoading(false);
      return;
    }

    const imageUrls = (options.files || files || []).filter((f) => f.type?.startsWith('image/')).map((f) => f.url);
    const userMsg = { role: 'user', content: text, images: imageUrls.length > 0 ? imageUrls : undefined };
    const newMessages = [...(messages || []), userMsg];
    setMessages(newMessages);
    setCurrentQuery(text);
    setInput('');
    setFiles([]);
    setIsLoading(true);
    abortedRef.current = false;

    // ── Immediate cloud registration on first message of a new conversation ──
    if (!conversationId && (messages || []).length === 0) {
      window.history.replaceState(null, '', `/chat?conversationId=${convId}`);
      createConversationInCloud(convId, text.slice(0, 80)).catch(() => {});
    }

    try {
      // ── Auto-fix path — surgical gpt-4o-mini correction ──
      if (options.isCorrection) {
        const rawCode = ficheContent || '';
        // Extract raw code without fences for the pipeline
        const bt = String.fromCharCode(96);
        const fenceRegex = new RegExp(`${bt}{3}(?:jsx?)?\\n([\\s\\S]*?)${bt}{3}`, 'i');
        const fenceMatch = rawCode.match(fenceRegex);
        const codeForFix = fenceMatch ? fenceMatch[1] : rawCode;

        // Surgical: extract broken section → fix only that → patch back
        const { patched } = await runAutofixPipeline(options.rawError || '', codeForFix);
        if (abortedRef.current) return;

        // Re-wrap in fence if original had one
        const newContent = fenceMatch
          ? rawCode.replace(fenceMatch[0], `${bt}${bt}${bt}jsx\n${patched}\n${bt}${bt}${bt}`)
          : patched;

        setIsLoading(false);
        setFicheContent(newContent);
        const finalMsgs = [...newMessages, { role: 'assistant', content: "Error patched — only the broken section was rewritten.", rawContent: newContent }];
        setMessages(finalMsgs);
        saveConversationMessages(convId, finalMsgs);
        if (!conversationId) window.history.replaceState(null, '', `/chat?conversationId=${convId}`);
        await syncToCloud(convId, finalMsgs, { title: 'Error fix', preview: 'Surgical patch applied', rawContent: newContent });
        return;
      }

      // ── Safety filter (disabled after 4th user message) ──
      const userMessageIndex = (messages || []).filter(m => m.role === 'user').length;
      if (userMessageIndex < 4) {
        const safety = await runSafetyFilter(text, userMessageIndex);
        if (!safety.safe) {
          setMessages([...newMessages, { role: 'assistant', content: '__INSUFFICIENT__' }]);
          setIsLoading(false);
          return;
        }
      }

      // ── Build / modify path ──
      const isModification = !!(editMode && ficheContent) || !!(ficheContent && MODIFY_KEYWORDS.test(text));
      const imageUrls2 = (options.files || files || []).filter(f => f.type?.startsWith('image/')).map(f => f.url);

      // ── Thinking layer: call first, stream result char-by-char ──
      setStreamingThinking('');
      const thinkingPayload = { prompt: PROMPT_THINKING + '\n\nUser request: ' + text, model: ORCH_MODELS.DEFAULT };
      const thinkingResult = await cachedAIRequest(thinkingPayload, () => base44.integrations.Core.InvokeLLM({ ...thinkingPayload }));
      const thinkingBlock = typeof thinkingResult === 'string' ? thinkingResult : '';

      // Stream the thinking text character by character
      if (thinkingBlock) {
        // Extract content inside <thinking> tags for streaming
        const thinkMatch = thinkingBlock.match(/<thinking>([\s\S]*?)<\/thinking>/i);
        const thinkContent = thinkMatch ? thinkMatch[1].trim() : thinkingBlock;
        let streamed = '';
        for (let i = 0; i < thinkContent.length; i++) {
          if (abortedRef.current) break;
          streamed += thinkContent[i];
          setStreamingThinking(streamed);
          // Vary speed: faster for spaces, slower for punctuation
          const ch = thinkContent[i];
          const delay = ch === ' ' ? 8 : (ch === '\n' ? 40 : (/[.!?]/.test(ch) ? 60 : 18));
          await new Promise(r => setTimeout(r, delay));
        }
      }

      // ── Orchestrated generation ──
      const orchResult = await orchestrateGeneration(text, {
        existingCode: isModification ? ficheContent : null,
        userMessageIndex,
        fileUrls: imageUrls2,
        needsWebSearch: false,
        systemPrompt: PROMPT_ARCHITECT,
      });

      if (abortedRef.current) return;

      const bt = String.fromCharCode(96);
      let rawCodeResult = typeof orchResult.code === 'string' ? orchResult.code : JSON.stringify(orchResult.code || '');

      // For modifications: patch only the changed section back into the full code
      let finalRawCode = rawCodeResult;
      if (isModification && orchResult.codeSection && ficheContent) {
        finalRawCode = patchCode(ficheContent, orchResult.codeSection, rawCodeResult);
      }

      // Apply client-side code formatter
      const { thinking: llmThinking, code: cleanCode } = splitThinkingFromCode(finalRawCode);
      const formattedCode = formatCode(cleanCode || finalRawCode);

      // Wrap in code fence if not already
      let codeOnly = formattedCode;
      if (!codeOnly.includes(bt + bt + bt)) {
        codeOnly = `${bt}${bt}${bt}jsx\n${codeOnly}\n${bt}${bt}${bt}`;
      }

      // rawContent = code for the preview iframe (without fences)
      const rawContent = codeOnly;

      // chatDisplayContent — readable summary only
      const codeBlockRegex = new RegExp(`${bt}{3}(?:jsx?|javascript|react)?\\n([\\s\\S]*?)${bt}{3}`, 'gi');
      let chatDisplayContent = codeOnly.replace(codeBlockRegex, '').trim() || 'Architecture generated successfully.';

      // Optional data insight (gpt_5_mini)
      let formattedInsight = null;
      if (DATA_QUERY_KEYWORDS.test(text) && !isModification) {
        const insightPrompt = PROMPT_DATA_INSIGHT + '\n\nUser query: ' + text;
        const insightPayload = { prompt: insightPrompt, model: ORCH_MODELS.DEFAULT };
        const insightResult = await cachedAIRequest(insightPayload, () => base44.integrations.Core.InvokeLLM({ ...insightPayload }));
        formattedInsight = typeof insightResult === 'string' ? insightResult : null;
      }

      const finalContent = thinkingBlock
        ? thinkingBlock + '\n\n' + (formattedInsight ? chatDisplayContent + '\n\n' + formattedInsight : chatDisplayContent)
        : (formattedInsight ? chatDisplayContent + '\n\n' + formattedInsight : chatDisplayContent);

      const creditsLimit = userPlan?.credits_limit || user?.credits_limit || 10;
      const creditsUsed = user?.credits_used || 0;
      const cost = creditsUsed >= creditsLimit * 2 ? 2 : 1;
      await handleUpdateCredits(cost);

      if (!isModification && !discussMode && user) {
        const newCount = (user.project_count || 0) + 1;
        base44.entities.User.update(user.id, { project_count: newCount }).catch(() => {});
        setUser((prev) => ({ ...prev, project_count: newCount }));
      }

      // Always persist URL first so the build is reachable even if user leaves immediately
      if (!conversationId) window.history.replaceState(null, '', `/chat?conversationId=${convId}`);

      setIsLoading(false);
      setStreamingThinking('');
      if (!discussMode) setFicheContent(rawContent);

      const finalMsgs = [...newMessages, { role: 'assistant', content: finalContent, rawContent }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);

      // ── Hard save to cloud immediately (no fire-and-forget — await to guarantee persistence) ──
      await syncToCloud(convId, finalMsgs, {
        title: text.slice(0, 80),
        preview: text.slice(0, 120),
        is_public: true,
        rawContent: rawContent || null,
      });
      saveToDiscussionsLogic(text.slice(0, 60) || 'New Chat', text);
      if (window.innerWidth < 768 && !discussMode) setMobileView('preview');

    } catch (err) {
      if (err.name === 'AbortError') return;
      setIsLoading(false);
      const classified = classifyError(err, 'Code generation');
      // Surface contextual error in the notification banner (not chat)
      setRuntimeError(classified.raw || classified.title);
      // Add a concise chat message — no raw stack traces exposed to users
      setMessages([...newMessages, { role: 'assistant', content: classified.hint || classified.title }]);
    }
  }, [messages, isLoading, discussMode, currentWorkspace, user, ficheContent, editMode]);

  const handleStop = useCallback(() => {
    abortedRef.current = true;
    setIsLoading(false);
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), { role: 'assistant', content: 'Generation stopped.' }]);
  }, []);

  // ── Effects ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Telemetry logging ──
  useEffect(() => {
    appendLog('INFO', `APP_START path=${window.location.pathname}`);
    const handleUnload = () => appendLog('INFO', 'APP_CLOSE');
    const handleVisibility = () => appendLog('INFO', `VISIBILITY_CHANGE state=${document.visibilityState}`);
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await safeAsync(() => initAgentsFromDB(), null, 'Init agents');
      const u = await safeAsync(() => base44.auth.me(), null, 'Fetch user');
      if (u) { setUser(u); if (u.id) setCurrentUser(u.id); setUserPlan(getUserPlan(u)); }
    };
    initAuth();
  }, [conversationId]);

  useEffect(() => {
    if (initialQ && (messages?.length || 0) === 0 && !conversationId) sendMessage(initialQ);
  }, []);

  // Load conversation from cloud on mount (cross-device)
  useEffect(() => {
    if (!conversationId) { setMessages([]); setFicheContent(null); return; }
    const loadConv = async () => {
      const cloud = await safeAsync(() => loadFromCloud(conversationId), null, 'Load conversation');
      if (cloud) {
        const safe = Array.isArray(cloud.messages) ? cloud.messages : [];
        if (safe.length > 0) {
          setMessages(safe);
          saveConversationMessages(conversationId, safe);
        }
        if (cloud.rawContent) {
          setFicheContent(cloud.rawContent);
          localStorage.setItem(`fiche_${conversationId}`, cloud.rawContent);
        } else {
          // Fallback: try to restore from last assistant message rawContent
          const last = safe.filter((m) => m.role === 'assistant' && m.rawContent).pop();
          if (last?.rawContent) {
            setFicheContent(last.rawContent);
            localStorage.setItem(`fiche_${conversationId}`, last.rawContent);
          } else {
            const stored = localStorage.getItem(`fiche_${conversationId}`);
            if (stored) setFicheContent(stored);
          }
        }
      }
      setIsLoadingConversation(false);
    };
    loadConv();
  }, [conversationId]);

  // Load discussions list from cloud for sidebar (cross-device)
  useEffect(() => {
    loadDiscussionsFromCloud().then(cloudDiscs => {
      if (cloudDiscs.length > 0) {
        setDiscussions(cloudDiscs);
        saveLocalDiscussions(currentWorkspace.id, cloudDiscs);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (runtimeError && !isLoading) { setPendingError(runtimeError); setRuntimeError(null); }
  }, [runtimeError, isLoading]);

  // Persist ficheContent to localStorage for F5 reload
  useEffect(() => {
    const key = `fiche_${conversationId || convId}`;
    if (ficheContent) localStorage.setItem(key, ficheContent);
  }, [ficheContent, conversationId, convId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); toast.info('Auto-save active'); }
      if (e.key === 'Escape') { setFullscreenModal(null); setShowPublishModal(false); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Render ──
  return (
    <div
      className="flex w-screen h-screen font-sans antialiased overflow-hidden"
      style={{ backgroundColor: '#181818' }}>

      <style>{`html,body{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}`}</style>

      {/* (WokHeaderMenu removed — replaced by ChatHeader inside preview panel) */}

      {/* Workspace modal */}
      <ProModal open={showWorkspaceModal} onClose={() => setShowWorkspaceModal(false)} title="Create a workspace"
        subtitle="Start collaborating with your workspace members" actionText="Create workspace" onAction={handleCreateWorkspace}>
        <label className="text-[12px] font-semibold mb-1.5 block">Workspace name *</label>
        <input type="text" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)}
          placeholder="Choose a name..." className="w-full border rounded-md px-3 py-2 text-[13px] focus:outline-none mb-4" autoFocus />
      </ProModal>

      {/* Iframe & fullscreen modals */}
      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />
      <FullscreenIframeModal modal={fullscreenModal} onClose={() => setFullscreenModal(null)} />
      <PublishAppModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        appUrl={`https://wok.base44.app/tools/${customSlug || convId}`}
        isPublished={isAppPublished}
        setIsPublished={setIsAppPublished}
        customSlug={customSlug || convId}
        appSettings={appSettings}
        onUpdateSettings={handleUpdateAppMeta}
        isPublic={false}
      />
      
      {/* Sidebar */}
      <ChatWorkspaceSidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} user={user} convId={conversationId || convId} hidden={!!fullscreenModal} />

      {/* ── Main layout: fills entire screen ── */}
      <div
        ref={containerRef}
        className="flex w-full h-full overflow-hidden"
        style={{ background: '#181818' }}>

        <div className="flex w-full h-full" style={{ gap: 0, padding: '6px 6px 6px 6px' }}>
          {/* ── Left: Chat panel ── */}
          {chatVisible && (
            <div style={{ width: 420, minWidth: 420, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#181818', position: 'relative' }}>

              {/* ── Chat top bar: sidebar toggle (left) + history clock (right) ── */}
              <div style={{
                height: 38, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 8px',
                position: 'relative', zIndex: 10,
                background: 'transparent',
              }}>
                {/* Sidebar toggle — top left of chat */}
                <button
                  title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                  onClick={() => setIsSidebarOpen(v => !v)}
                  style={{
                    width: 28, height: 28, borderRadius: 7, border: 'none',
                    background: isSidebarOpen ? '#2A2A2A' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#666', transition: 'background 120ms, color 120ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#2A2A2A'; e.currentTarget.style.color = '#aaa'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSidebarOpen ? '#2A2A2A' : 'transparent'; e.currentTarget.style.color = '#666'; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
                  </svg>
                </button>

                {/* History (clock) — top right of chat */}
                <button
                  title={showHistory ? 'Hide versions' : 'Version history'}
                  onClick={() => setShowHistory(v => !v)}
                  style={{
                    width: 28, height: 28, borderRadius: 7, border: 'none',
                    background: showHistory ? '#2A2A2A' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: showHistory ? '#ccc' : '#555', transition: 'background 120ms, color 120ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#2A2A2A'; e.currentTarget.style.color = '#aaa'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = showHistory ? '#2A2A2A' : 'transparent'; e.currentTarget.style.color = showHistory ? '#ccc' : '#555'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
                  </svg>
                </button>
              </div>

              {/* ── Blur banner separator ── */}
              <div style={{
                height: 1, flexShrink: 0,
                background: 'linear-gradient(90deg, transparent 0%, #2A2A2A 20%, #2A2A2A 80%, transparent 100%)',
                opacity: 0.6,
              }} />

              {/* History panel replaces chat when open — stays in chat column, never over preview */}
              {showHistory ? (
                <div style={{ flex: 1, overflow: 'hidden', borderRadius: 10, border: '1px solid #2A2A2A', background: '#1E1E1E', margin: '6px 0 0 0' }}>
                  <HistoryPanel messages={messages} ficheContent={ficheContent} convId={conversationId || convId} setFicheContent={(c) => { setFicheContent(c); setShowHistory(false); }} />
                </div>
              ) : (
                <>
                  <MessageList
                    messages={messages}
                    isLoading={isLoading}
                    currentQuery={currentQuery}
                    setFicheContent={setFicheContent}
                    setViewMode={setViewMode}
                    streamingThinking={streamingThinking}
                  />
                  <div className="flex-shrink-0">
                    <ErrorNotification error={pendingError} onFix={handleFixError} onDismiss={() => setPendingError(null)} />
                    <ChatInputBar
                      input={input} setInput={setInput}
                      onSend={(text, opts) => sendMessage(text, { ...opts })}
                      onStop={handleStop}
                      isLoading={isLoading}
                      files={files} setFiles={setFiles}
                      discussMode={discussMode} setDiscussMode={setDiscussMode}
                      editMode={editMode} setEditMode={setEditMode}
                      onUpgrade={() => {}}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Center gutter: 2px glowing separator with resize handle on hover ── */}
          {chatVisible && <ChatGutter />}

          {/* ── Right: Preview panel ── */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#181818' }}>
            {/* Header bar */}
            <ChatHeader
              user={user}
              chatVisible={chatVisible}
              setChatVisible={setChatVisible}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onPublish={() => setShowPublishModal(true)}
              onRefresh={() => setIframeRefreshKey(k => k + 1)}
              appTitle={appSettings?.title || 'My App'}
              onTitleChange={(t) => handleUpdateAppMeta({ ...appSettings, title: t })}
              mobilePreview={mobilePreview}
              setMobilePreview={setMobilePreview}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
            />

            {/* Preview area */}
            <div style={{
              position: 'absolute', top: 44, left: 4, right: 0, bottom: 0,
              display: 'flex', alignItems: 'stretch', justifyContent: 'center',
            }}>

            {/* Analytics panel */}
            {viewMode === 'analytics' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 99, background: '#FAF9F5', borderRadius: 8, overflow: 'hidden', border: '1px solid #D9D5CC' }}>
                <AnalyticsPanel />
              </div>
            )}

            {/* Logs panel */}
            {viewMode === 'logs' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 99, background: '#FAF9F5', borderRadius: 8, overflow: 'hidden', border: '1px solid #D9D5CC' }}>
                <LogsPanel />
              </div>
            )}

            {/* Preview container — mobile mode centers the phone, desktop fills full width */}
            <motion.div
              animate={mobilePreview
                ? { width: 390, borderRadius: 20 }
                : { width: '100%', borderRadius: 10 }
              }
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              style={{
                overflow: 'hidden', background: '#FFFFFF', flexShrink: 0,
                alignSelf: mobilePreview ? 'center' : 'stretch',
                boxShadow: 'none',
                border: '1px solid #2A2A2A',
                height: mobilePreview ? 'calc(100% - 0px)' : '100%',
              }}
            >

              

              {ficheContent ? (
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
              ) : isLoading && messages.length === 0 ? (
                <PreviewLoadingFeature />
              ) : isLoading ? (
                <PreviewSkeleton />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 13, color: '#CCCCCC', fontFamily: 'Inter, sans-serif' }}>Preview</p>
                </div>
              )}
            </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="fixed inset-0 flex md:hidden flex-col bg-white">
        <div className="flex px-3 py-2 border-b border-zinc-200 bg-white flex-shrink-0">
          <div className="flex bg-zinc-100 p-1 rounded-lg gap-0.5 w-full">
            <button onClick={() => setMobileView('chat')}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${mobileView === 'chat' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>Chat</button>
            <button onClick={() => setMobileView('preview')} disabled={!ficheContent && !isLoading}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${mobileView === 'preview' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'} ${!ficheContent && !isLoading ? 'opacity-30' : ''}`}>
              Preview {isLoading && mobileView !== 'preview' && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full ml-1 animate-pulse align-middle" />}
            </button>
          </div>
        </div>

        {mobileView === 'chat' && (
          <div className="flex flex-col flex-1 overflow-hidden bg-white">
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-3">
              {messages?.map((msg, idx) => (
                <div key={idx}>
                  {msg.role === 'assistant'
                    ? <AssistantMessage content={msg.content} isGenerating={false} query={msg.content} rawContent={msg.rawContent} onPreviewClick={() => { if (msg.rawContent) { setFicheContent(msg.rawContent); setMobileView('preview'); } }} />
                    : <UserMessageBubble msg={msg} />}
                </div>
              ))}
              {isLoading && <AssistantMessage content={null} isGenerating={true} query={currentQuery} />}
            </div>
            <div className="flex-shrink-0">
              <ErrorNotification error={pendingError} onFix={handleFixError} onDismiss={() => setPendingError(null)} />
              <ChatInputBar input={input} setInput={setInput} onSend={(text, opts) => sendMessage(text, { ...opts })} onStop={handleStop} isLoading={isLoading} files={files} setFiles={setFiles} discussMode={discussMode} setDiscussMode={setDiscussMode} editMode={editMode} setEditMode={setEditMode} />
            </div>
          </div>
        )}

        {mobileView === 'preview' && (
          <div className="flex-1 overflow-hidden relative bg-black">
            <EditModeOverlay active={editMode} onDisable={() => setEditMode(false)} />
            {ficheContent && <FichePanel content={ficheContent} onError={setRuntimeError} onSuccess={() => setRuntimeError(null)} isPublic={false} viewMode={viewMode} setViewMode={setViewMode} appSettings={appSettings} onUpdateSettings={handleUpdateAppMeta} onClone={handleCloneApp} onDelete={handleDeleteApp} onUnpublish={handleUnpublishApp} customSlug={customSlug} onUpdateContent={setFicheContent} />}
          </div>
        )}
      </div>
    </div>
  );
}